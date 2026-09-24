import type { Project } from '@/content/types';

export const projects = [
  {
    slug: 'car-tracker',
    name: 'car-tracker',
    summary:
      'Tracks a car’s services, fuel, trips, documents and reminders.',
    stack: ['Laravel 13.26', 'Filament 5.7', 'PostgreSQL', 'Pest', 'Firebase Cloud Messaging'],
    highlights: [
      '100 routes and 32 test files.',
      'Spatie role permissions, with the admin role carrying 132 permissions on the api guard.',
      'Reminders resolve by date or by odometer threshold through a single whereColumn query, plus an OdometerAdvanced event so a threshold crossed mid-day does not wait for the daily scheduled run.',
      'Firebase push notifications for due and overdue reminders.',
    ],
    repoUrl: 'https://github.com/Naderadelp/car-tracker',
    hasScreenshots: true,
  },
  {
    slug: 'gym-app',
    name: 'gym-app',
    summary: 'Membership and class booking for a gym, built as a Laravel API with an Inertia front end.',
    stack: ['Laravel 13', 'Vue 3', 'Inertia', 'Sanctum', 'Pest'],
    highlights: [
      'Repository pattern behind interfaces, so controllers depend on contracts rather than on Eloquent.',
      'Policies for authorisation, with Sanctum token abilities synced from role permissions.',
      'Versioned /v1 routes and Pest feature tests.',
    ],
    repoUrl: 'https://github.com/Naderadelp/gym-app',
    hasScreenshots: false,
  },
  {
    slug: 'node-express-rest-api',
    name: 'Node / Express REST API',
    summary: 'A TypeScript REST API built to the same layering I use in Laravel, as my own Node.js reference implementation.',
    stack: ['TypeScript', 'Node.js', 'Express', 'JWT', 'bcrypt'],
    highlights: [
      'Layered controller → service → repository, with no business logic in the HTTP layer.',
      'JWT authentication with bcrypt password hashing.',
      'Correlation-id request tracing, so one request can be followed end to end through the logs.',
      'Centralised error middleware, structured logging and typed environment configuration.',
    ],
    repoUrl: null,
    note: 'Repository is currently private',
    hasScreenshots: false,
  },
  {
    slug: 'broker-portal',
    name: 'Broker portal',
    summary:
      'A self-serve deal pipeline for external brokerages, built against the internal CRM.',
    stack: ['Laravel 12', 'PostgreSQL', 'Passport'],
    highlights: [
      'Deal lifecycle with stage-specific pricing and per-role commission fields, behind a three-party approval flow, so no deal advances until every party has signed off.',
      'Two-way CRM sync: observers push on write and store the remote id without re-firing model events, so brokers see the same inventory as internal agents with no double entry.',
      'Suspending an account revokes every Passport access token immediately, with TOTP two-factor and recovery codes on top.',
    ],
    repoUrl: null,
    note: 'Internal project, no public repository',
    hasScreenshots: false,
  },
] satisfies Project[];
