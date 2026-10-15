# GHub Management System

GHub Management System is a gym-business management platform in development. It is intended to help gym owners manage their business from one place, including gym details, multiple branches, employees, instructors, and members.

## What it is for

The system is designed to support gym owners as they set up and organize their operations. The backend includes gym-owner registration and login logic, gym-center onboarding, and data models for gym centers, branches, employees, instructors, and members. Gym-center onboarding can also send a welcome email.

## Technology

- Node.js and Express for the backend API
- MongoDB and Mongoose for data storage
- JSON Web Tokens (JWT) for authentication
- Nodemailer for email delivery

## Project status

GHub is under active development. The backend contains the core models and controller logic, but the Express app currently exposes only a health-check endpoint; the authentication and gym-management controllers are not yet connected to API routes. The frontend is also under development.
