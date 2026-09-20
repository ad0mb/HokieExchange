"""Google identities asserted by our Auth.js server, never by browser-supplied IDs."""
import os
from typing import Annotated

import jwt
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import get_db
from identity.repository import IdentityRepository
from identity.schemas import Account
from students.models import Student
from vendors.models import Vendor


def verify_token(token: str) -> dict:
    secret = os.getenv("CHAT_AUTH_SECRET", "")
    if len(secret) < 32:
        raise HTTPException(503, "CHAT_AUTH_SECRET must contain at least 32 characters.")
    try:
        claims = jwt.decode(token, secret, algorithms=["HS256"], audience="hokie-backend", issuer="hokie-frontend", options={"require": ["exp", "iat", "sub", "email"]})
        if claims.get("email_verified") is not True or not isinstance(claims["sub"], str) or not claims["sub"]:
            raise ValueError("Unverified identity")
        return claims
    except (jwt.InvalidTokenError, ValueError, TypeError) as exc:
        raise HTTPException(401, "Sign in again to continue.") from exc


def claims_dependency(credentials: Annotated[HTTPAuthorizationCredentials, Depends(HTTPBearer())]):
    return verify_token(credentials.credentials)


def resolve_student(db: Session, claims: dict) -> Student:
    repo = IdentityRepository(db)
    identity = repo.get_identity(claims["sub"])
    if identity is None:
        raise HTTPException(401, "Complete sign-in first.")
    student = repo.get_student(identity.student_id)
    if student is None:
        raise HTTPException(401, "Account no longer exists.")
    return student


def current_student(claims=Depends(claims_dependency), db: Session = Depends(get_db)):
    return resolve_student(db, claims)


def account_view(db: Session, student: Student) -> Account:
    vendor_id = db.scalar(select(Vendor.vendor_id).where(Vendor.student_id == student.student_id).order_by(Vendor.vendor_id))
    return Account(studentId=student.student_id, vendorId=vendor_id, name=f"{student.first_name} {student.last_name}".strip())


router = APIRouter(prefix="/auth", tags=["Account"])


@router.post("/me")
def provision(claims=Depends(claims_dependency), db: Session = Depends(get_db)):
    repo = IdentityRepository(db)
    email = claims["email"].strip().lower()
    identity = repo.get_identity(claims["sub"])
    if identity is not None:
        student = repo.get_student(identity.student_id)
        if student is None:
            raise HTTPException(401, "Account no longer exists.")
        return account_view(db, student)

    # Do not silently replace an established provider identity.
    if repo.get_identity_by_email(email) is not None:
        raise HTTPException(409, "This email is already linked to another Google identity.")

    student = repo.get_student_by_email(email)
    if student is None:
        student = repo.create_student(str(claims.get("given_name") or claims.get("name") or "Student")[:25],
                                      str(claims.get("family_name") or "")[:25], email)
    try:
        repo.link(claims["sub"], email, student.student_id)
    except IntegrityError:
        db.rollback()
        identity = repo.get_identity(claims["sub"])
        if identity is None:
            raise HTTPException(409, "Account linking conflict. Please sign in again.")
        student = repo.get_student(identity.student_id)
    return account_view(db, student)


@router.post("/vendor")
def become_vendor(student: Student = Depends(current_student), db: Session = Depends(get_db)):
    repo = IdentityRepository(db)
    # Serialize provisioning per student, including concurrent tabs.
    db.scalar(select(Student).where(Student.student_id == student.student_id).with_for_update())
    vendor = db.scalar(select(Vendor).where(Vendor.student_id == student.student_id).with_for_update())
    if vendor is None:
        repo.create_vendor(student.student_id)
    return account_view(db, student)
