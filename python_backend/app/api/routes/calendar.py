from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.db.session import get_db
from app.models.events import Event, EventType, EventRSVP, CalendarSync, NotificationPreference
from app.services.calendar_service import CalendarService
from app.services.notification_service import NotificationService
from app.services.scheduler_service import SchedulerService
from app.schemas.events import (
    EventCreate,
    EventUpdate,
    EventResponse,
    EventRSVPResponse,
    CalendarSyncResponse,
    NotificationPreferenceCreate,
    NotificationPreferenceResponse
)
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter()
calendar_service = CalendarService()
notification_service = NotificationService()
scheduler_service = SchedulerService()

@router.get("/authorize", response_model=dict)
async def get_google_auth_url():
    """Get Google OAuth2 authorization URL."""
    return {"url": calendar_service.get_authorization_url()}

@router.post("/callback")
async def google_callback(code: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Handle Google OAuth2 callback and save credentials."""
    try:
        credentials = calendar_service.get_credentials(code)
        
        # Create or update calendar sync settings
        calendar_sync = db.query(CalendarSync).filter(
            CalendarSync.user_id == current_user.id
        ).first()
        
        if not calendar_sync:
            calendar_sync = CalendarSync(
                user_id=current_user.id,
                credentials=credentials,
                sync_status='active'
            )
        else:
            calendar_sync.credentials = credentials
            calendar_sync.sync_status = 'active'
            calendar_sync.last_sync = datetime.utcnow()
        
        db.add(calendar_sync)
        db.commit()
        
        return {"message": "Calendar sync enabled successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/events", response_model=EventResponse)
async def create_event(
    event: EventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new event and sync with Google Calendar."""
    try:
        calendar_service.create_calendar_service(
            db.query(CalendarSync).filter(
                CalendarSync.user_id == current_user.id
            ).first().credentials
        )
        
        new_event = calendar_service.create_event(event.dict(), current_user.id, db)
        if not new_event:
            raise HTTPException(status_code=400, detail="Failed to create event")
        
        return new_event
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/events/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str,
    event: EventUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an event and sync with Google Calendar."""
    try:
        calendar_service.create_calendar_service(
            db.query(CalendarSync).filter(
                CalendarSync.user_id == current_user.id
            ).first().credentials
        )
        
        updated_event = calendar_service.update_event(event_id, event.dict(exclude_unset=True), db)
        if not updated_event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        return updated_event
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/events/{event_id}")
async def delete_event(
    event_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an event and remove from Google Calendar."""
    try:
        calendar_service.create_calendar_service(
            db.query(CalendarSync).filter(
                CalendarSync.user_id == current_user.id
            ).first().credentials
        )
        
        if not calendar_service.delete_event(event_id, db):
            raise HTTPException(status_code=404, detail="Event not found")
        
        return {"message": "Event deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/events", response_model=List[EventResponse])
async def get_events(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    event_type: Optional[EventType] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get events with optional filters."""
    try:
        query = db.query(Event).filter(Event.organizer_id == current_user.id)
        
        if start_date:
            query = query.filter(Event.start_time >= start_date)
        if end_date:
            query = query.filter(Event.end_time <= end_date)
        if event_type:
            query = query.filter(Event.event_type == event_type)
        
        return query.all()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/events/{event_id}/rsvp", response_model=EventRSVPResponse)
async def create_rsvp(
    event_id: str,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update RSVP for an event."""
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        rsvp = db.query(EventRSVP).filter(
            EventRSVP.event_id == event_id,
            EventRSVP.user_id == current_user.id
        ).first()
        
        if not rsvp:
            rsvp = EventRSVP(
                event_id=event_id,
                user_id=current_user.id,
                status=status
            )
            db.add(rsvp)
        else:
            rsvp.status = status
        
        db.commit()
        return rsvp
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/events/{event_id}/rsvps", response_model=List[EventRSVPResponse])
async def get_event_rsvps(
    event_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all RSVPs for an event."""
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        return db.query(EventRSVP).filter(EventRSVP.event_id == event_id).all()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/notifications/preferences", response_model=NotificationPreferenceResponse)
async def create_notification_preferences(
    preferences: NotificationPreferenceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update notification preferences."""
    try:
        user_preference = db.query(NotificationPreference).filter(
            NotificationPreference.user_id == current_user.id
        ).first()
        
        if not user_preference:
            user_preference = NotificationPreference(
                user_id=current_user.id,
                **preferences.dict()
            )
            db.add(user_preference)
        else:
            for key, value in preferences.dict().items():
                setattr(user_preference, key, value)
        
        db.commit()
        return user_preference
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/notifications/preferences", response_model=NotificationPreferenceResponse)
async def get_notification_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's notification preferences."""
    try:
        preferences = db.query(NotificationPreference).filter(
            NotificationPreference.user_id == current_user.id
        ).first()
        
        if not preferences:
            raise HTTPException(status_code=404, detail="Notification preferences not found")
        
        return preferences
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/notifications/test")
async def test_notifications(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Test notification delivery."""
    try:
        preferences = db.query(NotificationPreference).filter(
            NotificationPreference.user_id == current_user.id
        ).first()
        
        if not preferences:
            raise HTTPException(status_code=404, detail="Notification preferences not found")
        
        # Schedule an immediate check
        await scheduler_service.schedule_immediate_check(background_tasks)
        
        return {"message": "Test notification scheduled"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 