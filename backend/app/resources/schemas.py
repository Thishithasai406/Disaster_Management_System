from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ResourceCreate(BaseModel):
    name:     str
    type:     str
    quantity: int
    unit:     Optional[str] = "units"
    location: Optional[str] = ""

class ResourceUpdate(BaseModel):
    name:     Optional[str] = None
    type:     Optional[str] = None
    quantity: Optional[int] = None
    unit:     Optional[str] = None
    location: Optional[str] = None

class ResourceResponse(BaseModel):
    id:                   int
    name:                 str
    type:                 str
    quantity:             int
    available:            int
    unit:                 Optional[str] = "units"
    location:             Optional[str] = ""
    status:               str
    is_available:         bool
    assigned_incident_id: Optional[int] = None
    last_updated:         Optional[datetime] = None

    class Config:
        from_attributes = True
