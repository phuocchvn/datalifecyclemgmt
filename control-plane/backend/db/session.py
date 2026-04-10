from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from config import APP_DB_URL

engine = create_engine(APP_DB_URL, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()