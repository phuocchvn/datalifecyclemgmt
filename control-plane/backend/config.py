import os

APP_DB_URL = os.getenv(
    "APP_DB_URL",
    "postgresql+psycopg2://app:apppassword@control-plane-db:5432/control_plane",
)

TRINO_HOST = os.getenv("TRINO_HOST", "trino")
TRINO_PORT = int(os.getenv("TRINO_PORT", 8080))
TRINO_USER = os.getenv("TRINO_USER", "admin")
TRINO_CATALOG = os.getenv("TRINO_CATALOG", "iceberg")