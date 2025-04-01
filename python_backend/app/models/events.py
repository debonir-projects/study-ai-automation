from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class EventType(enum.Enum):
    LECTURE = "lecture"
    EXAM = "exam"
    ASSIGNMENT = "assignment"
    WORKSHOP = "workshop"
    HACKATHON = "hackathon"
    CULTURAL = "cultural"
    OTHER = "other"

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    event_type = Column(Enum(EventType), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    location = Column(String)
    organizer_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(String, nullable=True)  # For course-related events
    google_calendar_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    organizer = relationship("User", back_populates="organized_events")
    rsvps = relationship("EventRSVP", back_populates="event")

class EventRSVP(Base):
    __tablename__ = "event_rsvps"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String)  # confirmed, declined, maybe
    reminder_sent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    event = relationship("Event", back_populates="rsvps")
    user = relationship("User", back_populates="event_rsvps")

class CalendarSync(Base):
    __tablename__ = "calendar_syncs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    google_calendar_id = Column(String, nullable=False)
    last_sync = Column(DateTime)
    sync_status = Column(String)  # active, failed, disabled
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="calendar_syncs")

class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    platform = Column(String)  # whatsapp, telegram
    contact_info = Column(String)  # phone number or telegram chat ID
    reminder_time = Column(Integer)  # hours before event
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notification_preferences") 