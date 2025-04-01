from twilio.rest import Client
from telegram import Bot
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from app.models.events import Event, EventRSVP, NotificationPreference
from app.core.config import settings
import asyncio
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self):
        self.twilio_client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        self.telegram_bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)

    async def send_whatsapp_message(self, to_number: str, message: str) -> bool:
        """Send WhatsApp message using Twilio."""
        try:
            message = self.twilio_client.messages.create(
                from_=f'whatsapp:{settings.TWILIO_WHATSAPP_NUMBER}',
                body=message,
                to=f'whatsapp:{to_number}'
            )
            logger.info(f"WhatsApp message sent successfully to {to_number}")
            return True
        except Exception as e:
            logger.error(f"Failed to send WhatsApp message: {str(e)}")
            return False

    async def send_telegram_message(self, chat_id: str, message: str) -> bool:
        """Send Telegram message using Telegram Bot API."""
        try:
            await self.telegram_bot.send_message(
                chat_id=chat_id,
                text=message,
                parse_mode='HTML'
            )
            logger.info(f"Telegram message sent successfully to {chat_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to send Telegram message: {str(e)}")
            return False

    async def send_event_reminder(self, event: Event, user_preference: NotificationPreference) -> bool:
        """Send event reminder based on user's notification preferences."""
        message = self._format_event_reminder(event)
        
        if user_preference.whatsapp_enabled and user_preference.whatsapp_number:
            return await self.send_whatsapp_message(user_preference.whatsapp_number, message)
        elif user_preference.telegram_enabled and user_preference.telegram_chat_id:
            return await self.send_telegram_message(user_preference.telegram_chat_id, message)
        
        return False

    async def send_rsvp_reminder(self, event: Event, rsvp: EventRSVP, user_preference: NotificationPreference) -> bool:
        """Send RSVP reminder for an event."""
        message = self._format_rsvp_reminder(event)
        
        if user_preference.whatsapp_enabled and user_preference.whatsapp_number:
            return await self.send_whatsapp_message(user_preference.whatsapp_number, message)
        elif user_preference.telegram_enabled and user_preference.telegram_chat_id:
            return await self.send_telegram_message(user_preference.telegram_chat_id, message)
        
        return False

    async def send_deadline_reminder(self, event: Event, user_preference: NotificationPreference) -> bool:
        """Send deadline reminder for assignments or exams."""
        message = self._format_deadline_reminder(event)
        
        if user_preference.whatsapp_enabled and user_preference.whatsapp_number:
            return await self.send_whatsapp_message(user_preference.whatsapp_number, message)
        elif user_preference.telegram_enabled and user_preference.telegram_chat_id:
            return await self.send_telegram_message(user_preference.telegram_chat_id, message)
        
        return False

    async def process_upcoming_events(self, db) -> None:
        """Process upcoming events and send reminders."""
        try:
            # Get events in the next 24 hours
            now = datetime.utcnow()
            tomorrow = now + timedelta(days=1)
            
            events = db.query(Event).filter(
                Event.start_time >= now,
                Event.start_time <= tomorrow
            ).all()

            for event in events:
                # Get RSVPs for the event
                rsvps = db.query(EventRSVP).filter(
                    EventRSVP.event_id == event.id,
                    EventRSVP.status == 'confirmed'
                ).all()

                for rsvp in rsvps:
                    # Get user's notification preferences
                    user_preference = db.query(NotificationPreference).filter(
                        NotificationPreference.user_id == rsvp.user_id
                    ).first()

                    if user_preference:
                        # Send event reminder
                        await self.send_event_reminder(event, user_preference)

                        # If it's an assignment or exam, send deadline reminder
                        if event.event_type in ['ASSIGNMENT', 'EXAM']:
                            await self.send_deadline_reminder(event, user_preference)

        except Exception as e:
            logger.error(f"Error processing upcoming events: {str(e)}")

    async def process_pending_rsvps(self, db) -> None:
        """Process pending RSVPs and send reminders."""
        try:
            # Get events in the next 48 hours with pending RSVPs
            now = datetime.utcnow()
            two_days_later = now + timedelta(days=2)
            
            events = db.query(Event).filter(
                Event.start_time >= now,
                Event.start_time <= two_days_later
            ).all()

            for event in events:
                # Get pending RSVPs
                pending_rsvps = db.query(EventRSVP).filter(
                    EventRSVP.event_id == event.id,
                    EventRSVP.status == 'pending'
                ).all()

                for rsvp in pending_rsvps:
                    # Get user's notification preferences
                    user_preference = db.query(NotificationPreference).filter(
                        NotificationPreference.user_id == rsvp.user_id
                    ).first()

                    if user_preference:
                        await self.send_rsvp_reminder(event, rsvp, user_preference)

        except Exception as e:
            logger.error(f"Error processing pending RSVPs: {str(e)}")

    def _format_event_reminder(self, event: Event) -> str:
        """Format event reminder message."""
        return (
            f"🔔 Event Reminder\n\n"
            f"Title: {event.title}\n"
            f"Type: {event.event_type.value}\n"
            f"Start: {event.start_time.strftime('%Y-%m-%d %H:%M')}\n"
            f"Location: {event.location}\n\n"
            f"Don't forget to attend!"
        )

    def _format_rsvp_reminder(self, event: Event) -> str:
        """Format RSVP reminder message."""
        return (
            f"📅 RSVP Reminder\n\n"
            f"Event: {event.title}\n"
            f"Date: {event.start_time.strftime('%Y-%m-%d %H:%M')}\n"
            f"Location: {event.location}\n\n"
            f"Please confirm your attendance!"
        )

    def _format_deadline_reminder(self, event: Event) -> str:
        """Format deadline reminder message."""
        return (
            f"⏰ Deadline Reminder\n\n"
            f"Title: {event.title}\n"
            f"Type: {event.event_type.value}\n"
            f"Deadline: {event.start_time.strftime('%Y-%m-%d %H:%M')}\n\n"
            f"Make sure to submit on time!"
        ) 