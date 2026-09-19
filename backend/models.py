from typing import Optional
import datetime
import decimal

from sqlalchemy import DECIMAL, DateTime, ForeignKeyConstraint, Index, Integer, String, TIMESTAMP, Time, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass


class Students(Base):
    __tablename__ = 'students'
    __table_args__ = (
        Index('students_pk_2', 'sso_id', unique=True),
    )

    student_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    first_name: Mapped[int] = mapped_column(Integer, nullable=False)
    last_name: Mapped[int] = mapped_column(Integer, nullable=False)
    graduation_year: Mapped[int] = mapped_column(Integer, nullable=False)
    sso_id: Mapped[Optional[int]] = mapped_column(Integer)
    date_created: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))
    date_updated: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

    vendors: Mapped[list['Vendors']] = relationship('Vendors', back_populates='student')
    consumer_ratings: Mapped[list['ConsumerRatings']] = relationship('ConsumerRatings', back_populates='student')
    vendor_ratings: Mapped[list['VendorRatings']] = relationship('VendorRatings', back_populates='student')


class Vendors(Base):
    __tablename__ = 'vendors'
    __table_args__ = (
        ForeignKeyConstraint(['student_id'], ['students.student_id'], ondelete='CASCADE', onupdate='CASCADE', name='vendors_students_student_id_fk'),
        Index('vendors_students_student_id_fk', 'student_id')
    )

    vendor_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str] = mapped_column(String(1000), nullable=False)
    date_created: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    date_updated: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, server_default=text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

    student: Mapped['Students'] = relationship('Students', back_populates='vendors')
    consumer_ratings: Mapped[list['ConsumerRatings']] = relationship('ConsumerRatings', back_populates='vendor')
    services: Mapped[list['Services']] = relationship('Services', back_populates='vendor')
    vendor_ratings: Mapped[list['VendorRatings']] = relationship('VendorRatings', back_populates='vendor')


class ConsumerRatings(Base):
    __tablename__ = 'consumer_ratings'
    __table_args__ = (
        ForeignKeyConstraint(['student_id'], ['students.student_id'], ondelete='CASCADE', onupdate='CASCADE', name='consumer_ratings_students_student_id_fk'),
        ForeignKeyConstraint(['vendor_id'], ['vendors.vendor_id'], ondelete='CASCADE', onupdate='CASCADE', name='consumer_ratings_vendors_vendor_id_fk'),
        Index('consumer_ratings_students_student_id_fk', 'student_id'),
        Index('consumer_ratings_vendors_vendor_id_fk', 'vendor_id')
    )

    rating_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vendor_id: Mapped[int] = mapped_column(Integer, nullable=False)
    student_id: Mapped[int] = mapped_column(Integer, nullable=False)
    rating: Mapped[decimal.Decimal] = mapped_column(DECIMAL(10, 0), nullable=False)
    date_created: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    date_updated: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, server_default=text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

    student: Mapped['Students'] = relationship('Students', back_populates='consumer_ratings')
    vendor: Mapped['Vendors'] = relationship('Vendors', back_populates='consumer_ratings')


class Services(Base):
    __tablename__ = 'services'
    __table_args__ = (
        ForeignKeyConstraint(['vendor_id'], ['vendors.vendor_id'], ondelete='CASCADE', onupdate='CASCADE', name='services_vendors_vendor_id_fk'),
        Index('services_vendors_vendor_id_fk', 'vendor_id')
    )

    service_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vendor_id: Mapped[int] = mapped_column(Integer, nullable=False)
    service_name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(1000), nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String(255))
    schedule_type: Mapped[Optional[str]] = mapped_column(String(10), comment='"on-demand" or "per-block"')
    date_created: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))
    date_updated: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

    vendor: Mapped['Vendors'] = relationship('Vendors', back_populates='services')
    time_blocks_config: Mapped[list['TimeBlocksConfig']] = relationship('TimeBlocksConfig', back_populates='service')


class VendorRatings(Base):
    __tablename__ = 'vendor_ratings'
    __table_args__ = (
        ForeignKeyConstraint(['student_id'], ['students.student_id'], ondelete='CASCADE', onupdate='CASCADE', name='vendor_ratings_students_student_id_fk'),
        ForeignKeyConstraint(['vendor_id'], ['vendors.vendor_id'], ondelete='CASCADE', onupdate='CASCADE', name='vendor_ratings_vendors_vendor_id_fk'),
        Index('vendor_ratings_students_student_id_fk', 'student_id'),
        Index('vendor_ratings_vendors_vendor_id_fk', 'vendor_id')
    )

    rating_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(Integer, nullable=False)
    vendor_id: Mapped[int] = mapped_column(Integer, nullable=False)
    rating: Mapped[decimal.Decimal] = mapped_column(DECIMAL(10, 0), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(1000))
    date_created: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    date_updated: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, server_default=text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

    student: Mapped['Students'] = relationship('Students', back_populates='vendor_ratings')
    vendor: Mapped['Vendors'] = relationship('Vendors', back_populates='vendor_ratings')


class TimeBlocksConfig(Base):
    __tablename__ = 'time-blocks-config'
    __table_args__ = (
        ForeignKeyConstraint(['service_id'], ['services.service_id'], ondelete='CASCADE', onupdate='CASCADE', name='time-blocks-config_services_service_id_fk'),
        Index('time-blocks-config_services_service_id_fk', 'service_id')
    )

    config_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    service_id: Mapped[int] = mapped_column(Integer, nullable=False)
    duration: Mapped[datetime.time] = mapped_column(Time, nullable=False)
    price: Mapped[decimal.Decimal] = mapped_column(DECIMAL(10, 0), nullable=False)
    date_created: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    date_updated: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, server_default=text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

    service: Mapped['Services'] = relationship('Services', back_populates='time_blocks_config')
    time_blocks: Mapped[list['TimeBlocks']] = relationship('TimeBlocks', back_populates='config')


class TimeBlocks(Base):
    __tablename__ = 'time-blocks'
    __table_args__ = (
        ForeignKeyConstraint(['config_id'], ['time-blocks-config.config_id'], ondelete='CASCADE', onupdate='CASCADE', name='time-blocks_time-blocks-config_config_id_fk'),
        Index('time-blocks_time-blocks-config_config_id_fk', 'config_id')
    )

    time_block_id: Mapped[int] = mapped_column('time-block-id', Integer, primary_key=True, autoincrement=True)
    config_id: Mapped[int] = mapped_column(Integer, nullable=False)
    start_time: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    date_created: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    date_updated: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, server_default=text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

    config: Mapped['TimeBlocksConfig'] = relationship('TimeBlocksConfig', back_populates='time_blocks')
