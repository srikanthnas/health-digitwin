# database.py — Sets up the SQLite database connection and session management

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database file will be created in the backend folder
DATABASE_URL = "sqlite:///./digital_twin.db"

# Create the database engine (connect_args needed for SQLite + FastAPI threading)
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Each request gets its own database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all our database models (tables)
Base = declarative_base()

# Dependency: used in FastAPI routes to get a DB session, then close it after
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
