"""Import all model modules before SQLAlchemy configures relationships."""

from Services.models import Service, TimeBlock
from Students.models import Student
from Vendors.models import Vendor

__all__ = ["Service", "Student", "TimeBlock", "Vendor"]
