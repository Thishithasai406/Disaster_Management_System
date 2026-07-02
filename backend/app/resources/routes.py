from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from app.core.database import get_db
from app.auth.roles import require_role
from app.users.models import User
from app.resources.models import Resource
from app.resources.schemas import ResourceCreate, ResourceUpdate, ResourceResponse
from app.common.pagination import paginate

router = APIRouter(prefix="/resources", tags=["Resources"])


def _compute_status(r: Resource) -> str:
    """Derive status from available count vs total quantity."""
    if r.available == 0:
        return "in_use"
    if r.available >= r.quantity:
        return "available"
    return "partially_used"


# ── Add resource ────────────────────────────────────────────────────────────
@router.post("/", response_model=ResourceResponse)
def add_resource(
    data: ResourceCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN"))
):
    resource = Resource(
        name=data.name,
        type=data.type,
        quantity=data.quantity,
        available=data.quantity,          # starts fully available
        unit=data.unit or "units",
        location=data.location or "",
        status="available",
        is_available=True,
        last_updated=datetime.utcnow(),
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    resource.status = _compute_status(resource)
    return resource


# ── List resources ──────────────────────────────────────────────────────────
@router.get("/")
def list_resources(
    type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(Resource)
    if type:
        query = query.filter(Resource.type == type)
    if status:
        query = query.filter(Resource.status == status)

    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()

    # Recompute status on the fly so it's always accurate
    for r in items:
        r.status = _compute_status(r)

    return {"data": items, "total": total, "page": page, "limit": limit}


# ── Get single resource ─────────────────────────────────────────────────────
@router.get("/{resource_id}", response_model=ResourceResponse)
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    r.status = _compute_status(r)
    return r


# ── Update resource ─────────────────────────────────────────────────────────
@router.put("/{resource_id}", response_model=ResourceResponse)
def update_resource(
    resource_id: int,
    data: ResourceUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN"))
):
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")

    if data.name is not None:     r.name = data.name
    if data.type is not None:     r.type = data.type
    if data.unit is not None:     r.unit = data.unit
    if data.location is not None: r.location = data.location
    if data.quantity is not None:
        # Adjust available proportionally
        diff = data.quantity - r.quantity
        r.quantity = data.quantity
        r.available = max(0, r.available + diff)

    r.last_updated = datetime.utcnow()
    r.status = _compute_status(r)
    r.is_available = r.available > 0
    db.commit()
    db.refresh(r)
    r.status = _compute_status(r)
    return r


# ── Delete resource ─────────────────────────────────────────────────────────
@router.delete("/{resource_id}")
def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN"))
):
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    db.delete(r)
    db.commit()
    return {"message": "Resource deleted"}


# ── Assign resource to incident ─────────────────────────────────────────────
@router.put("/{resource_id}/assign/{incident_id}")
def assign_resource(
    resource_id: int,
    incident_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN"))
):
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r or r.available == 0:
        raise HTTPException(status_code=404, detail="Resource not available")

    r.available = max(0, r.available - 1)
    r.assigned_incident_id = incident_id
    r.status = _compute_status(r)
    r.is_available = r.available > 0
    r.last_updated = datetime.utcnow()
    db.commit()
    return {"message": "Resource assigned successfully"}


# ── Release resource ────────────────────────────────────────────────────────
@router.put("/{resource_id}/release")
def release_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN"))
):
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")

    r.available = min(r.quantity, r.available + 1)
    r.assigned_incident_id = None
    r.status = _compute_status(r)
    r.is_available = r.available > 0
    r.last_updated = datetime.utcnow()
    db.commit()
    return {"message": "Resource released"}
