from pydantic import BaseModel
from typing import Optional


class SourceConnectionCreate(BaseModel):
    connection_name: str
    db_type: str
    host: str
    port: int
    database_name: Optional[str] = None
    service_name: Optional[str] = None
    username: str
    password_plain: str
    is_active: bool = True
    is_enabled: bool = True


class SourceConnectionOut(BaseModel):
    id: int
    connection_name: str
    db_type: str
    host: str
    port: int
    database_name: Optional[str] = None
    service_name: Optional[str] = None
    username: str
    is_active: bool
    is_enabled: bool

    class Config:
        from_attributes = True