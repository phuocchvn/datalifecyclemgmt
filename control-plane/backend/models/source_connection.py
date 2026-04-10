from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, BigInteger, String, Integer, Boolean, DateTime, func

Base = declarative_base()


class SourceConnection(Base):
    __tablename__ = "source_connections"

    id = Column(BigInteger, primary_key=True, index=True)
    connection_name = Column(String(255), nullable=False, unique=True)
    db_type = Column(String(50), nullable=False)
    host = Column(String(255), nullable=False)
    port = Column(Integer, nullable=False)
    database_name = Column(String(255), nullable=True)
    service_name = Column(String(255), nullable=True)
    username = Column(String(255), nullable=False)
    password_plain = Column(String(255), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    is_enabled = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())