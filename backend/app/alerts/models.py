from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime
from app.core.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    incident_id = Column(Integer, nullable=True)
    type = Column(String, default="info")        # info | warning | critical | evacuation
    target = Column(String, default="all")       # all | citizen | volunteer
    active = Column(Boolean, default=True)
    sent_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
