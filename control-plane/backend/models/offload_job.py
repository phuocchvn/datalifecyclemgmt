from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, BigInteger, String, Integer, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

Base = declarative_base()


class OffloadJob(Base):
    __tablename__ = "offload_jobs"

    job_id = Column(UUID(as_uuid=False), primary_key=True)
    connection_id = Column(BigInteger, nullable=False)

    source_schema = Column(String(255), nullable=False)
    source_table = Column(String(255), nullable=False)

    target_catalog = Column(String(255), nullable=False)
    target_schema = Column(String(255), nullable=False)
    target_table = Column(String(255), nullable=False)

    date_column = Column(String(255), nullable=False)

    from_datadate = Column(Integer, nullable=True)
    to_datadate = Column(Integer, nullable=True)

    status = Column(String(50), nullable=False)

    submitted_by = Column(String(255), nullable=True)
    submitted_at = Column(DateTime, nullable=False, server_default=func.now())

    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)

    source_row_count = Column(BigInteger, nullable=True)
    target_row_count = Column(BigInteger, nullable=True)

    error_message = Column(Text, nullable=True)