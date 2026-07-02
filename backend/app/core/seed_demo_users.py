from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.users.models import User
from app.citizens.models import Citizen
from app.volunteers.models import Volunteer
from app.auth.schemas import Role, VolunteerSkill, AvailabilityStatus

DEMO_PASSWORD = "Demo@1234"

DEMO_USERS = [
    {
        "email": "admin@demo.com",
        "full_name": "Demo Admin",
        "phone_number": "9000000001",
        "city": "Hyderabad",
        "role": Role.ADMIN,
    },
    {
        "email": "citizen@demo.com",
        "full_name": "Demo Citizen",
        "phone_number": "9000000002",
        "city": "Hyderabad",
        "role": Role.CITIZEN,
        "citizen": {
            "address": "123 Demo Street, Hyderabad",
            "age": 28,
            "emergency_contact_name": "Emergency Contact",
            "emergency_contact_phone": "9000000099",
            "preferred_language": "English",
        },
    },
    {
        "email": "volunteer@demo.com",
        "full_name": "Demo Volunteer",
        "phone_number": "9000000003",
        "city": "Hyderabad",
        "role": Role.VOLUNTEER,
        "volunteer": {
            "skill": VolunteerSkill.FIRST_AID,
            "experience_years": 3,
            "availability": AvailabilityStatus.AVAILABLE_ANYTIME,
            "vehicle_availability": True,
            "organization": "Demo Rescue Team",
        },
    },
]


def seed_demo_users(db: Session) -> None:
    hashed_password = hash_password(DEMO_PASSWORD)

    for demo in DEMO_USERS:
        if db.query(User).filter(User.email == demo["email"]).first():
            continue

        user = User(
            full_name=demo["full_name"],
            email=demo["email"],
            phone_number=demo["phone_number"],
            hashed_password=hashed_password,
            city=demo["city"],
            role=demo["role"],
        )
        db.add(user)
        db.flush()

        if demo["role"] == Role.CITIZEN:
            db.add(Citizen(user_id=user.id, **demo["citizen"]))
        elif demo["role"] == Role.VOLUNTEER:
            db.add(Volunteer(user_id=user.id, **demo["volunteer"]))

    db.commit()
