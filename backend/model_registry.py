"""Import all model modules before SQLAlchemy configures relationships."""

from consumer_ratings.models import ConsumerRating
from services.models import Service, TimeBlock, TimeBlockConfig
from students.models import Student
from vendor_ratings.models import VendorRating
from vendors.models import Vendor

__all__ = [
    "ConsumerRating",
    "Service",
    "Student",
    "TimeBlock",
    "TimeBlockConfig",
    "Vendor",
    "VendorRating",
]
