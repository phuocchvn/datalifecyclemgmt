from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from db.session import get_db
from services.source_connection_service import get_source_connection
from services.oracle_service import list_schemas, list_tables, list_columns

router = APIRouter(prefix="/oracle", tags=["oracle"])


def get_oracle_connection_or_404(db: Session, connection_id: int):
    conn = get_source_connection(db, connection_id)
    if conn is None:
        raise HTTPException(status_code=404, detail="Connection not found")
    if conn.db_type != "Oracle":
        raise HTTPException(status_code=400, detail="Only Oracle is supported for inventory now")
    if not conn.is_enabled:
        raise HTTPException(status_code=400, detail="Connection is disabled")
    return conn


@router.get("/schemas")
def get_schemas(
    connection_id: int = Query(...),
    db: Session = Depends(get_db),
):
    source_connection = get_oracle_connection_or_404(db, connection_id)
    return list_schemas(source_connection)


@router.get("/schemas/{schema}/tables")
def get_tables(
    schema: str,
    connection_id: int = Query(...),
    db: Session = Depends(get_db),
):
    source_connection = get_oracle_connection_or_404(db, connection_id)
    return list_tables(source_connection, schema)


@router.get("/schemas/{schema}/tables/{table}/columns")
def get_columns(
    schema: str,
    table: str,
    connection_id: int = Query(...),
    db: Session = Depends(get_db),
):
    source_connection = get_oracle_connection_or_404(db, connection_id)
    return list_columns(source_connection, schema, table)