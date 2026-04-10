from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.session import get_db
from schemas.offload import OffloadRequest
from services.offload_service import submit_offload

router = APIRouter(prefix="/offload", tags=["offload"])


@router.post("")
def offload(payload: OffloadRequest, db: Session = Depends(get_db)):
    job = submit_offload(db, payload)
    return {"job_id": job.job_id, "status": job.status}