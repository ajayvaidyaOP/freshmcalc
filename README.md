# FreshmCalc

FreshmCalc is a Dubai fresh produce market-rate and India-to-Dubai export costing platform for fruit and vegetable traders, wholesalers, suppliers and exporters.

## Architecture

- `frontend/` — React + Vite + TypeScript, Tailwind CSS, shadcn/ui, React Router, TanStack Query, React Hook Form, Zod, Lucide React, Recharts
- `backend/` — Java 21, Spring Boot 3.x, Gradle, Spring Security, Spring Data JPA, Flyway, PostgreSQL, OpenAPI (springdoc), Razorpay, JUnit 5
- `infrastructure/` — Docker, Docker Compose, Nginx, HTTPS, backup scripts
- `docs/` — API, setup, and operational documentation

## Business requirement

Live market rates displayed to subscribers are **Dubai market rates (AED)**, not Indian domestic market rates. India is the sourcing/origin market; Dubai is the destination selling-price market.

## Getting started

See `docs/setup.md` for backend, frontend, Docker, and Razorpay test-mode setup instructions.
