from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from app.core.database import Base

class Resource(Base):
    __tablename__ = "resources"

    id                   = Column(Integer, primary_key=True, index=True)
    name                 = Column(String, nullable=False)
    type                 = Column(String, nullable=False)
    quantity             = Column(Integer, nullable=False)
    available            = Column(Integer, nullable=False, default=0)   # count available
    unit                 = Column(String, nullable=True, default="units")
    location             = Column(String, nullable=True, default="")
    status               = Column(String, nullable=False, default="available")  # available | in_use | partially_used
    is_available         = Column(Boolean, default=True)                # legacy compat
    assigned_incident_id = Column(Integer, nullable=True)
    last_updated         = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
