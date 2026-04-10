from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from db.session import get_db
from models.offload_job import OffloadJob
from models.offload_job_log import OffloadJobLog

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("")
def list_jobs(db: Session = Depends(get_db)):
    stmt = select(OffloadJob).order_by(OffloadJob.submitted_at.desc())
    rows = db.execute(stmt).scalars().all()

    return [
        {
            "job_id": str(r.job_id),
            "connection_id": r.connection_id,
            "source_schema": r.source_schema,
            "source_table": r.source_table,
            "target_catalog": r.target_catalog,
            "target_schema": r.target_schema,
            "target_table": r.target_table,
            "date_column": r.date_column,
            "from_datadate": r.from_datadate,
            "to_datadate": r.to_datadate,
            "status": r.status,
            "submitted_by": r.submitted_by,
            "submitted_at": r.submitted_at.isoformat() if r.submitted_at else None,
            "started_at": r.started_at.isoformat() if r.started_at else None,
            "finished_at": r.finished_at.isoformat() if r.finished_at else None,
            "source_row_count": r.source_row_count,
            "target_row_count": r.target_row_count,
            "error_message": r.error_message,
        }
        for r in rows
    ]


@router.get("/{job_id}")
def get_job(job_id: str, db: Session = Depends(get_db)):
    stmt = select(OffloadJob).where(OffloadJob.job_id == job_id)
    row = db.execute(stmt).scalar_one_or_none()

    if row is None:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "job_id": str(row.job_id),
        "connection_id": row.connection_id,
        "source_schema": row.source_schema,
        "source_table": row.source_table,
        "target_catalog": row.target_catalog,
        "target_schema": row.target_schema,
        "target_table": row.target_table,
        "date_column": row.date_column,
        "from_datadate": row.from_datadate,
        "to_datadate": row.to_datadate,
        "status": row.status,
        "submitted_by": row.submitted_by,
        "submitted_at": row.submitted_at.isoformat() if row.submitted_at else None,
        "started_at": row.started_at.isoformat() if row.started_at else None,
        "finished_at": row.finished_at.isoformat() if row.finished_at else None,
        "source_row_count": row.source_row_count,
        "target_row_count": row.target_row_count,
        "error_message": row.error_message,
    }


@router.get("/{job_id}/logs")
def get_job_logs(job_id: str, db: Session = Depends(get_db)):
    stmt = (
        select(OffloadJobLog)
        .where(OffloadJobLog.job_id == job_id)
        .order_by(OffloadJobLog.log_time.asc(), OffloadJobLog.id.asc())
    )
    rows = db.execute(stmt).scalars().all()

    return [
        {
            "id": r.id,
            "job_id": str(r.job_id),
            "log_time": r.log_time.isoformat() if r.log_time else None,
            "log_level": r.log_level,
            "message": r.message,
        }
        for r in rows
    ]