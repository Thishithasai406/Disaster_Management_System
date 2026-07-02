from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AlertCreate(BaseModel):
    title: str
    message: str
    incident_id: Optional[int] = None
    type: Optional[str] = "info"        # info | warning | critical | evacuation
    target: Optional[str] = "all"      # all | citizen | volunteer
    sent_by: Optional[str] = None

class AlertResponse(BaseModel):
    id: int
    title: str
    message: str
    incident_id: Optional[int] = None
    type: str
    target: str
    active: bool
    sent_by: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True
