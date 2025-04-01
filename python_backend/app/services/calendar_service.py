from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from app.models.events import Event, EventType, CalendarSync
from app.core.config import settings
import json

class CalendarService:
    def __init__(self):
        self.SCOPES = ['https://www.googleapis.com/auth/calendar']
        self.CALENDAR_API_VERSION = 'v3'
        self.service = None

    def get_authorization_url(self) -> str:
        """Generate Google OAuth2 authorization URL."""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
                    "scopes": self.SCOPES
                }
            }
        )
        flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true'
        )
        return authorization_url

    def get_credentials(self, code: str) -> Dict[str, Any]:
        """Exchange authorization code for credentials."""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
                    "scopes": self.SCOPES
                }
            }
        )
        flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
        flow.fetch_token(code=code)
        return flow.credentials.to_json()

    def create_calendar_service(self, credentials_json: str):
        """Create Google Calendar service instance."""
        credentials = Credentials.from_authorized_user_info(
            json.loads(credentials_json),
            self.SCOPES
        )
        self.service = build('calendar', self.CALENDAR_API_VERSION, credentials=credentials)

    def sync_events(self, user_id: int, db) -> List[Event]:
        """Sync events from Google Calendar to local database."""
        try:
            # Get user's calendar sync settings
            calendar_sync = db.query(CalendarSync).filter(
                CalendarSync.user_id == user_id,
                CalendarSync.sync_status == 'active'
            ).first()
            
            if not calendar_sync:
                return []

            # Get events from Google Calendar
            events_result = self.service.events().list(
                calendarId=calendar_sync.google_calendar_id,
                timeMin=datetime.utcnow().isoformat(),
                maxResults=100,
                singleEvents=True,
                orderBy='startTime'
            ).execute()

            events = events_result.get('items', [])
            synced_events = []

            for event in events:
                # Check if event already exists
                existing_event = db.query(Event).filter(
                    Event.google_calendar_id == event['id']
                ).first()

                if existing_event:
                    # Update existing event
                    existing_event.title = event['summary']
                    existing_event.description = event.get('description', '')
                    existing_event.start_time = datetime.fromisoformat(event['start']['dateTime'].replace('Z', '+00:00'))
                    existing_event.end_time = datetime.fromisoformat(event['end']['dateTime'].replace('Z', '+00:00'))
                    existing_event.location = event.get('location', '')
                    synced_events.append(existing_event)
                else:
                    # Create new event
                    new_event = Event(
                        title=event['summary'],
                        description=event.get('description', ''),
                        event_type=self._determine_event_type(event),
                        start_time=datetime.fromisoformat(event['start']['dateTime'].replace('Z', '+00:00')),
                        end_time=datetime.fromisoformat(event['end']['dateTime'].replace('Z', '+00:00')),
                        location=event.get('location', ''),
                        organizer_id=user_id,
                        google_calendar_id=event['id']
                    )
                    db.add(new_event)
                    synced_events.append(new_event)

            db.commit()
            return synced_events

        except HttpError as error:
            print(f'An error occurred: {error}')
            return []

    def create_event(self, event_data: Dict[str, Any], user_id: int, db) -> Optional[Event]:
        """Create a new event in both Google Calendar and local database."""
        try:
            # Create event in Google Calendar
            google_event = {
                'summary': event_data['title'],
                'description': event_data.get('description', ''),
                'start': {
                    'dateTime': event_data['start_time'].isoformat(),
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': event_data['end_time'].isoformat(),
                    'timeZone': 'UTC',
                },
                'location': event_data.get('location', ''),
            }

            # Get user's calendar ID
            calendar_sync = db.query(CalendarSync).filter(
                CalendarSync.user_id == user_id,
                CalendarSync.sync_status == 'active'
            ).first()

            if not calendar_sync:
                return None

            # Create event in Google Calendar
            created_event = self.service.events().insert(
                calendarId=calendar_sync.google_calendar_id,
                body=google_event
            ).execute()

            # Create event in local database
            new_event = Event(
                title=event_data['title'],
                description=event_data.get('description', ''),
                event_type=event_data['event_type'],
                start_time=event_data['start_time'],
                end_time=event_data['end_time'],
                location=event_data.get('location', ''),
                organizer_id=user_id,
                course_id=event_data.get('course_id'),
                google_calendar_id=created_event['id']
            )

            db.add(new_event)
            db.commit()
            return new_event

        except HttpError as error:
            print(f'An error occurred: {error}')
            return None

    def update_event(self, event_id: str, event_data: Dict[str, Any], db) -> Optional[Event]:
        """Update an event in both Google Calendar and local database."""
        try:
            # Get event from database
            event = db.query(Event).filter(Event.id == event_id).first()
            if not event or not event.google_calendar_id:
                return None

            # Update event in Google Calendar
            google_event = {
                'summary': event_data.get('title', event.title),
                'description': event_data.get('description', event.description),
                'start': {
                    'dateTime': event_data.get('start_time', event.start_time).isoformat(),
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': event_data.get('end_time', event.end_time).isoformat(),
                    'timeZone': 'UTC',
                },
                'location': event_data.get('location', event.location),
            }

            self.service.events().update(
                calendarId=event.google_calendar_id,
                eventId=event.google_calendar_id,
                body=google_event
            ).execute()

            # Update event in local database
            for key, value in event_data.items():
                setattr(event, key, value)

            db.commit()
            return event

        except HttpError as error:
            print(f'An error occurred: {error}')
            return None

    def delete_event(self, event_id: str, db) -> bool:
        """Delete an event from both Google Calendar and local database."""
        try:
            # Get event from database
            event = db.query(Event).filter(Event.id == event_id).first()
            if not event or not event.google_calendar_id:
                return False

            # Delete event from Google Calendar
            self.service.events().delete(
                calendarId=event.google_calendar_id,
                eventId=event.google_calendar_id
            ).execute()

            # Delete event from local database
            db.delete(event)
            db.commit()
            return True

        except HttpError as error:
            print(f'An error occurred: {error}')
            return False

    def get_upcoming_events(self, user_id: int, days: int = 7, db) -> List[Event]:
        """Get upcoming events for a user."""
        try:
            # Get user's calendar sync settings
            calendar_sync = db.query(CalendarSync).filter(
                CalendarSync.user_id == user_id,
                CalendarSync.sync_status == 'active'
            ).first()

            if not calendar_sync:
                return []

            # Calculate time range
            now = datetime.utcnow()
            time_max = now + timedelta(days=days)

            # Get events from Google Calendar
            events_result = self.service.events().list(
                calendarId=calendar_sync.google_calendar_id,
                timeMin=now.isoformat(),
                timeMax=time_max.isoformat(),
                singleEvents=True,
                orderBy='startTime'
            ).execute()

            events = events_result.get('items', [])
            return [self._convert_google_event(event) for event in events]

        except HttpError as error:
            print(f'An error occurred: {error}')
            return []

    def _determine_event_type(self, google_event: Dict[str, Any]) -> EventType:
        """Determine event type from Google Calendar event."""
        title = google_event.get('summary', '').lower()
        description = google_event.get('description', '').lower()

        if any(keyword in title or keyword in description for keyword in ['lecture', 'class']):
            return EventType.LECTURE
        elif any(keyword in title or keyword in description for keyword in ['exam', 'test', 'quiz']):
            return EventType.EXAM
        elif any(keyword in title or keyword in description for keyword in ['assignment', 'homework', 'project']):
            return EventType.ASSIGNMENT
        elif any(keyword in title or keyword in description for keyword in ['workshop', 'seminar']):
            return EventType.WORKSHOP
        elif 'hackathon' in title or 'hackathon' in description:
            return EventType.HACKATHON
        elif any(keyword in title or keyword in description for keyword in ['fest', 'cultural', 'event']):
            return EventType.CULTURAL
        else:
            return EventType.OTHER

    def _convert_google_event(self, google_event: Dict[str, Any]) -> Event:
        """Convert Google Calendar event to local Event model."""
        return Event(
            title=google_event['summary'],
            description=google_event.get('description', ''),
            event_type=self._determine_event_type(google_event),
            start_time=datetime.fromisoformat(google_event['start']['dateTime'].replace('Z', '+00:00')),
            end_time=datetime.fromisoformat(google_event['end']['dateTime'].replace('Z', '+00:00')),
            location=google_event.get('location', ''),
            google_calendar_id=google_event['id']
        ) 