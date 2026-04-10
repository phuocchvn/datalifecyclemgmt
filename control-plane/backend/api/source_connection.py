from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import oracledb

from db.session import get_db
from schemas.source_connection import SourceConnectionCreate, SourceConnectionOut
from services.source_connection_service import (
    list_source_connections,
    create_source_connection,
    get_source_connection,
    delete_source_connection,
)

router = APIRouter(prefix="/connections", tags=["connections"])


@router.get("", response_model=list[SourceConnectionOut])
def get_connections(db: Session = Depends(get_db)):
    return list_source_connections(db)


@router.post("", response_model=SourceConnectionOut)
def add_connection(payload: SourceConnectionCreate, db: Session = Depends(get_db)):
    try:
        return create_source_connection(db, payload)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Connection name already exists")


@router.delete("/{connection_id}")
def remove_connection(connection_id: int, db: Session = Depends(get_db)):
    obj = delete_source_connection(db, connection_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Connection not found")

    return {"status": "deleted", "connection_id": connection_id}


@router.post("/{connection_id}/test")
def test_connection(connection_id: int, db: Session = Depends(get_db)):
    obj = get_source_connection(db, connection_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Connection not found")

    if obj.db_type != "Oracle":
        return {
            "ok": False,
            "message": f"{obj.db_type} chưa được hỗ trợ test connection ở version hiện tại."
        }

    if not obj.service_name:
        return {
            "ok": False,
            "message": "Oracle service_name is required."
        }

    dsn = f"{obj.host}:{obj.port}/{obj.service_name}"

    try:
        conn = oracledb.connect(
            user=obj.username,
            password=obj.password_plain,
            dsn=dsn,
        )
        cur = conn.cursor()
        cur.execute("select 'OK' from dual")
        value = cur.fetchone()[0]
        cur.close()
        conn.close()

        return {
            "ok": True,
            "message": f"Connection successful: {value}"
        }
    except Exception as e:
        return {
            "ok": False,
            "message": str(e)
        }