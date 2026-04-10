from pydantic import BaseModel


class OffloadRequest(BaseModel):
    connection_id: int
    source_schema: str
    source_table: str
    date_column: str
    from_date: str
    to_date: str
    submitted_by: str | None = None