import subprocess
import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from models.offload_job import OffloadJob
from models.offload_job_log import OffloadJobLog
from services.source_connection_service import get_source_connection


def to_int_date(date_str: str) -> int:
    return int(date_str.replace("-", ""))


# ================================
# LOG LEVEL DETECTION
# ================================
def detect_log_level(line: str, fallback: str = "INFO") -> str:
    upper = line.upper()

    if " ERROR " in upper or upper.startswith("ERROR"):
        return "ERROR"

    if " WARN " in upper or upper.startswith("WARN"):
        return "WARN"

    if " INFO " in upper or upper.startswith("INFO"):
        return "INFO"

    return fallback


def write_log(db: Session, job_id: str, level: str, message: str):
    log = OffloadJobLog(
        job_id=job_id,
        log_level=level,
        message=message,
    )
    db.add(log)
    db.commit()


# ================================
# MAIN ENTRY
# ================================
def submit_offload(db: Session, payload):
    conn = get_source_connection(db, payload.connection_id)
    if conn is None:
        raise Exception("Connection not found")

    job_id = str(uuid.uuid4())

    from_dt = to_int_date(payload.from_date)
    to_dt = to_int_date(payload.to_date)

    job = OffloadJob(
        job_id=job_id,
        connection_id=payload.connection_id,
        source_schema=payload.source_schema,
        source_table=payload.source_table,
        target_catalog="lakehouse",
        target_schema=payload.source_schema.lower(),
        target_table=payload.source_table.lower(),
        date_column=payload.date_column,
        from_datadate=from_dt,
        to_datadate=to_dt,
        status="PENDING",
        submitted_by=payload.submitted_by,
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    write_log(db, job.job_id, "INFO", "Job created")
    write_log(
        db,
        job.job_id,
        "INFO",
        f"Requested range: {job.from_datadate} -> {job.to_datadate}",
    )

    run_spark_job(db, job, conn, payload)

    return job


# ================================
# SPARK EXECUTION
# ================================
def run_spark_job(db: Session, job, conn, payload):
    job.status = "RUNNING"
    job.started_at = datetime.utcnow()
    db.commit()

    write_log(db, job.job_id, "INFO", "Spark submit started")

    cmd = [
        "docker", "exec", "spark",
        "spark-submit", "/opt/jobs/oracle_to_iceberg.py",
        "--source-schema", payload.source_schema,
        "--source-table", payload.source_table,
        "--target-catalog", "lakehouse",
        "--target-schema", payload.source_schema.lower(),
        "--target-table", payload.source_table.lower(),
        "--date-column", payload.date_column,
        "--from-datadate", str(job.from_datadate),
        "--to-datadate", str(job.to_datadate),
        "--oracle-host", conn.host,
        "--oracle-port", str(conn.port),
        "--oracle-service", conn.service_name,
        "--oracle-user", conn.username,
        "--oracle-password", conn.password_plain,
    ]

    try:
        result = subprocess.run(
            cmd,
            check=True,
            capture_output=True,
            text=True,
        )

        # STDOUT
        if result.stdout:
            for line in result.stdout.splitlines():
                line = line.strip()
                if line:
                    write_log(
                        db,
                        job.job_id,
                        detect_log_level(line, "INFO"),
                        line,
                    )

        # STDERR
        if result.stderr:
            for line in result.stderr.splitlines():
                line = line.strip()
                if line:
                    write_log(
                        db,
                        job.job_id,
                        detect_log_level(line, "INFO"),
                        line,
                    )

        job.status = "SUCCESS"
        write_log(db, job.job_id, "INFO", "Spark submit finished successfully")

    except subprocess.CalledProcessError as e:
        job.status = "FAILED"
        job.error_message = str(e)

        # STDOUT
        if e.stdout:
            for line in e.stdout.splitlines():
                line = line.strip()
                if line:
                    write_log(
                        db,
                        job.job_id,
                        detect_log_level(line, "INFO"),
                        line,
                    )

        # STDERR
        if e.stderr:
            for line in e.stderr.splitlines():
                line = line.strip()
                if line:
                    write_log(
                        db,
                        job.job_id,
                        detect_log_level(line, "ERROR"),
                        line,
                    )

        write_log(db, job.job_id, "ERROR", f"Job failed: {str(e)}")

    job.finished_at = datetime.utcnow()
    db.commit()