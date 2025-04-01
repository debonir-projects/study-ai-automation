from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from app.models.events import EventType

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: EventType
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    course_id: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[EventType] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    course_id: Optional[str] = None

class EventResponse(EventBase):
    id: str
    organizer_id: int
    google_calendar_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class EventRSVPBase(BaseModel):
    event_id: str
    user_id: int
    status: str

class EventRSVPResponse(EventRSVPBase):
    id: str
    created_at: datetime
    updated_at: datetime
    reminder_sent: bool = False

    class Config:
        orm_mode = True

class CalendarSyncBase(BaseModel):
    user_id: int
    credentials: str
    sync_status: str
    google_calendar_id: Optional[str] = None

class CalendarSyncResponse(CalendarSyncBase):
    id: str
    last_sync: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class NotificationPreferenceBase(BaseModel):
    user_id: int
    whatsapp_enabled: bool = False
    whatsapp_number: Optional[str] = None
    telegram_enabled: bool = False
    telegram_chat_id: Optional[str] = None
    reminder_before_hours: int = Field(default=1, ge=0, le=24)
    reminder_frequency: str = "daily"  # daily, weekly, monthly

class NotificationPreferenceCreate(NotificationPreferenceBase):
    pass

class NotificationPreferenceResponse(NotificationPreferenceBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True 