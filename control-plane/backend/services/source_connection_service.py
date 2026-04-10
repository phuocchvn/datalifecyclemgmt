from sqlalchemy import select
from sqlalchemy.orm import Session

from models.source_connection import SourceConnection
from schemas.source_connection import SourceConnectionCreate


def list_source_connections(db: Session):
    stmt = select(SourceConnection).order_by(SourceConnection.id.asc())
    return db.execute(stmt).scalars().all()


def get_source_connection(db: Session, connection_id: int):
    stmt = select(SourceConnection).where(SourceConnection.id == connection_id)
    return db.execute(stmt).scalar_one_or_none()


def create_source_connection(db: Session, payload: SourceConnectionCreate):
    obj = SourceConnection(
        connection_name=payload.connection_name,
        db_type=payload.db_type,
        host=payload.host,
        port=payload.port,
        database_name=payload.database_name,
        service_name=payload.service_name,
        username=payload.username,
        password_plain=payload.password_plain,
        is_active=payload.is_active,
        is_enabled=payload.is_enabled,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def delete_source_connection(db: Session, connection_id: int):
    obj = get_source_connection(db, connection_id)
    if obj is None:
        return None

    db.delete(obj)
    db.commit()
    return obj