# Job Application Tracker

## Project Overview

A full-stack web application that allows students to manage and track
their job and internship applications.

## Technology Stack

### Frontend
- Next.js
- JavaScript
- Responsive UI

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL
- Neon PostgreSQL

### Deployment
- Vercel for frontend
- Backend deployment service

## Main Features

- Add job or internship applications
- View all applications
- View individual applications
- Update application status
- Delete applications
- Sort applications by date
- Sort applications by status
- Display application statistics

## Application Statuses

The system uses the following statuses:

- Applied
- Interview
- Offer
- Rejected

## Project Structure

The project is divided into:

- `frontend/` — Next.js application
- `backend/` — Express.js API
- PostgreSQL — application database

## Development Principles

1. Keep the system simple and easy to understand.
2. Separate frontend, backend, and database responsibilities.
3. Use REST API principles.
4. Validate user input.
5. Handle errors properly.
6. Keep database credentials in environment variables.
7. Write maintainable and reusable code.
8. Test backend endpoints before connecting the frontend.