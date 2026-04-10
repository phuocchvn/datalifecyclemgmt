from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.source_connection import router as source_connections_router
from api.oracle import router as oracle_router
from api.coverage import router as coverage_router
from api.jobs import router as jobs_router
from api.offload import router as offload_router

app = FastAPI(title="Offload Control Plane")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(source_connections_router)
app.include_router(oracle_router)
app.include_router(coverage_router)
app.include_router(jobs_router)
app.include_router(offload_router)


@app.get("/health")
def health():
    return {"status": "ok"}