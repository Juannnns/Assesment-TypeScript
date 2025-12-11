# HelpDeskPro - Support Ticket Management System

## Overview
HelpDeskPro is a comprehensive support ticket management system built with React, TypeScript, Express, and MySQL (Sequelize ORM). It enables organizations to efficiently manage support tickets with role-based access control for clients and agents.

## Current State
The application is fully functional with:
- User authentication with role-based access (client/agent)
- Ticket CRUD operations with status and priority management
- Comment/response system for ticket conversations
- Email notifications (configurable via SMTP)
- Cron job for unanswered ticket reminders

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Express.js, Sequelize ORM
- **Database**: MySQL
- **Authentication**: JWT tokens
- **Email**: Nodemailer
- **Scheduling**: node-cron

## Project Structure
```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # React context providers (Auth)
│   │   ├── lib/          # Utilities, axios, services
│   │   ├── pages/        # Page components
│   │   └── hooks/        # Custom React hooks
├── server/               # Backend Express application
│   ├── config/           # Database configuration
│   ├── models/           # Sequelize models (User, Ticket, Comment)
│   ├── middleware/       # Auth middleware
│   ├── services/         # Email and cron services
│   └── routes.ts         # API endpoints
├── shared/               # Shared TypeScript types and schemas
```

## API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/tickets` - Get all tickets (agents only)
- `GET /api/tickets/my` - Get user's tickets (clients)
- `GET /api/tickets/:id` - Get single ticket
- `POST /api/tickets` - Create ticket (clients)
- `PATCH /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket (agents)
- `GET /api/comments/:ticketId` - Get ticket comments
- `POST /api/comments` - Add comment
- `GET /api/users/agents` - Get agents list

## Environment Variables
### Required for MySQL:
DATABASE_URL=mysql://miusuario:micontraseña@localhost:3306/midatabase
NODE_ENV=development
PORT=5000


### Other:
- `SESSION_SECRET` - JWT secret key
- `PORT` - Server port (default: 5000)

## User Roles
- **Client**: Can create tickets, view own tickets, add comments
- **Agent**: Can view all tickets, update status/priority, assign tickets, close tickets

## Ticket Status Flow
1. `open` - New ticket
2. `in_progress` - Being worked on
3. `resolved` - Solution provided
4. `closed` - Ticket completed

## Running Locally
1. Configure MySQL database credentials in environment variables
2. Run `npm run dev` to start the development server
3. Access the application at http://localhost:5000

## Developer Notes
- Frontend uses React Query for data fetching
- All forms use react-hook-form with Zod validation
- Auth state managed via React Context
- Tailwind CSS with Shadcn/UI component library
- Email notifications are logged to console if SMTP not configured
