from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.auth.roles import require_role
from app.users.models import User
from app.alerts.models import Alert
from app.alerts.schemas import AlertCreate, AlertResponse
from app.notifications.engine import notify
from app.notifications.severity import Severity

router = APIRouter(prefix="/alerts", tags=["Alerts"])


# Admin sends alert
@router.post("/", response_model=AlertResponse)
async def create_alert(
    data: AlertCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN"))
):
    alert = Alert(
        title=data.title,
        message=data.message,
        incident_id=data.incident_id,
        type=data.type or "info",
        target=data.target or "all",
        active=True,
        sent_by=admin.email if admin else data.sent_by,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Send WebSocket notification
    await notify(
        event_key=f"alert_{alert.id}",
        title=alert.title,
        message=alert.message,
        severity=Severity.CRITICAL
    )

    return alert


# View all alerts
@router.get("/", response_model=list[AlertResponse])
def list_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).order_by(Alert.created_at.desc()).all()


# Deactivate an alert (admin only)
@router.patch("/{alert_id}/deactivate", response_model=AlertResponse)
def deactivate_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN"))
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.active = False
    db.commit()
    db.refresh(alert)
    return alert


# Delete an alert (admin only)
@router.delete("/{alert_id}")
def delete_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN"))
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(alert)
    db.commit()
    return {"message": "Alert deleted successfully"}
