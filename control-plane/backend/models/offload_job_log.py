from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, BigInteger, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

Base = declarative_base()


class OffloadJobLog(Base):
    __tablename__ = "offload_job_logs"

    id = Column(BigInteger, primary_key=True, index=True)
    job_id = Column(UUID(as_uuid=False), nullable=False)
    log_time = Column(DateTime, nullable=False, server_default=func.now())
    log_level = Column(String(20), nullable=True)
    message = Column(Text, nullable=True)