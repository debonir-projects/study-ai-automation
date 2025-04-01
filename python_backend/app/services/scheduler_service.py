from fastapi import BackgroundTasks
from datetime import datetime, timedelta
from typing import Dict, Any
from app.services.notification_service import NotificationService
from app.db.session import SessionLocal
import asyncio
import logging

logger = logging.getLogger(__name__)

class SchedulerService:
    def __init__(self):
        self.notification_service = NotificationService()
        self.is_running = False
        self.tasks = []

    async def start(self):
        """Start the scheduler service."""
        if self.is_running:
            return

        self.is_running = True
        logger.info("Starting scheduler service")

        # Start background tasks
        self.tasks = [
            asyncio.create_task(self._check_upcoming_events()),
            asyncio.create_task(self._check_pending_rsvps()),
            asyncio.create_task(self._check_deadlines())
        ]

    async def stop(self):
        """Stop the scheduler service."""
        if not self.is_running:
            return

        self.is_running = False
        logger.info("Stopping scheduler service")

        # Cancel all tasks
        for task in self.tasks:
            task.cancel()

        # Wait for tasks to complete
        await asyncio.gather(*self.tasks, return_exceptions=True)
        self.tasks = []

    async def _check_upcoming_events(self):
        """Check for upcoming events every hour."""
        while self.is_running:
            try:
                db = SessionLocal()
                await self.notification_service.process_upcoming_events(db)
                db.close()
            except Exception as e:
                logger.error(f"Error checking upcoming events: {str(e)}")
            
            # Wait for 1 hour before next check
            await asyncio.sleep(3600)

    async def _check_pending_rsvps(self):
        """Check for pending RSVPs every 6 hours."""
        while self.is_running:
            try:
                db = SessionLocal()
                await self.notification_service.process_pending_rsvps(db)
                db.close()
            except Exception as e:
                logger.error(f"Error checking pending RSVPs: {str(e)}")
            
            # Wait for 6 hours before next check
            await asyncio.sleep(21600)

    async def _check_deadlines(self):
        """Check for upcoming deadlines every 30 minutes."""
        while self.is_running:
            try:
                db = SessionLocal()
                now = datetime.utcnow()
                tomorrow = now + timedelta(days=1)

                # Get upcoming deadlines
                events = db.query(Event).filter(
                    Event.event_type.in_(['ASSIGNMENT', 'EXAM']),
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
                            await self.notification_service.send_deadline_reminder(event, user_preference)

                db.close()
            except Exception as e:
                logger.error(f"Error checking deadlines: {str(e)}")
            
            # Wait for 30 minutes before next check
            await asyncio.sleep(1800)

    async def schedule_immediate_check(self, background_tasks: BackgroundTasks):
        """Schedule an immediate check of all notifications."""
        background_tasks.add_task(self._run_immediate_check)

    async def _run_immediate_check(self):
        """Run an immediate check of all notifications."""
        try:
            db = SessionLocal()
            
            # Check upcoming events
            await self.notification_service.process_upcoming_events(db)
            
            # Check pending RSVPs
            await self.notification_service.process_pending_rsvps(db)
            
            # Check deadlines
            now = datetime.utcnow()
            tomorrow = now + timedelta(days=1)
            
            events = db.query(Event).filter(
                Event.event_type.in_(['ASSIGNMENT', 'EXAM']),
                Event.start_time >= now,
                Event.start_time <= tomorrow
            ).all()

            for event in events:
                rsvps = db.query(EventRSVP).filter(
                    EventRSVP.event_id == event.id,
                    EventRSVP.status == 'confirmed'
                ).all()

                for rsvp in rsvps:
                    user_preference = db.query(NotificationPreference).filter(
                        NotificationPreference.user_id == rsvp.user_id
                    ).first()

                    if user_preference:
                        await self.notification_service.send_deadline_reminder(event, user_preference)

            db.close()
            logger.info("Completed immediate notification check")
        except Exception as e:
            logger.error(f"Error during immediate check: {str(e)}") 