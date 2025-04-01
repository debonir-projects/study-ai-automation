# Student Management System - Backend

This is the backend service for the Student Management System, which provides functionality for calendar management, event notifications, and student performance analysis.

## Features

- Google Calendar integration for event management
- WhatsApp and Telegram notifications for events and deadlines
- RSVP system for college events
- Automated reminders and notifications
- Student performance analysis and reporting

## Prerequisites

- Python 3.8 or higher
- PostgreSQL database
- Google Cloud Platform account (for Calendar API)
- Twilio account (for WhatsApp notifications)
- Telegram Bot Token

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd python_backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
   - Copy the `.env.example` file to `.env`
   - Update the variables with your credentials:
     - Database connection string
     - JWT secret key
     - Google Calendar API credentials
     - Twilio credentials
     - Telegram Bot token

5. Set up the database:
```bash
# Create the database
createdb student_management

# Run migrations
alembic upgrade head
```

## Running the Application

1. Start the FastAPI server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. The API will be available at `http://localhost:8000`

3. Access the API documentation:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Calendar Management
- `GET /api/calendar/authorize` - Get Google OAuth2 authorization URL
- `POST /api/calendar/callback` - Handle Google OAuth2 callback
- `POST /api/calendar/events` - Create a new event
- `PUT /api/calendar/events/{event_id}` - Update an event
- `DELETE /api/calendar/events/{event_id}` - Delete an event
- `GET /api/calendar/events` - Get events with filters

### RSVP Management
- `POST /api/calendar/events/{event_id}/rsvp` - Create or update RSVP
- `GET /api/calendar/events/{event_id}/rsvps` - Get all RSVPs for an event

### Notification Preferences
- `POST /api/calendar/notifications/preferences` - Create or update notification preferences
- `GET /api/calendar/notifications/preferences` - Get user's notification preferences
- `POST /api/calendar/notifications/test` - Test notification delivery

## Background Tasks

The application runs several background tasks for notification management:

1. Event Reminders (every hour)
   - Checks for upcoming events
   - Sends reminders to participants

2. RSVP Reminders (every 6 hours)
   - Checks for pending RSVPs
   - Sends reminders to users

3. Deadline Reminders (every 30 minutes)
   - Checks for upcoming deadlines
   - Sends reminders for assignments and exams

## Development

### Code Style

The project uses:
- Black for code formatting
- isort for import sorting
- flake8 for linting

To format code:
```bash
black .
isort .
```

To run linting:
```bash
flake8
```

### Testing

Run tests with pytest:
```bash
pytest
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 