from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from db.session import get_db
from services.source_connection_service import get_source_connection
from services.coverage_service import get_coverage

router = APIRouter(tags=["coverage"])


@router.get("/coverage")
def coverage(
    connection_id: int = Query(...),
    schema: str = Query(...),
    table: str = Query(...),
    date_column: str = Query(...),
    db: Session = Depends(get_db),
):
    source_connection = get_source_connection(db, connection_id)
    if source_connection is None:
        raise HTTPException(status_code=404, detail="Connection not found")
    if source_connection.db_type != "Oracle":
        raise HTTPException(status_code=400, detail="Only Oracle is supported for coverage now")
    if not source_connection.is_enabled:
        raise HTTPException(status_code=400, detail="Connection is disabled")

    return get_coverage(source_connection, schema, table, date_column)