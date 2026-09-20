"""Import all model modules before SQLAlchemy configures relationships."""

from appointments.models import Appointment
from consumer_ratings.models import ConsumerRating
from identity.models import GoogleIdentity
from items.models import Item
from services.models import Service, TimeBlock
from students.models import Student
from vendor_ratings.models import VendorRating
from vendors.models import Vendor

__all__ = [
    "Appointment",
    "ConsumerRating",
    "GoogleIdentity",
    "Item",
    "Service",
    "Student",
    "TimeBlock",
    "Vendor",
    "VendorRating",
]
