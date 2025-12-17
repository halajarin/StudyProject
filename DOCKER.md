# EcoRide - Docker Deployment Guide

This guide explains how to run the entire EcoRide stack using Docker Compose.

## Prerequisites

- Docker Engine 20.10 or higher
- Docker Compose 2.0 or higher
- At least 4GB of available RAM
- Ports 4200, 5000, 5432, and 27017 available on your machine

## Stack Components

The Docker Compose setup includes:

1. **PostgreSQL 16** - Relational database for core application data
2. **MongoDB 7** - NoSQL database for user preferences and notifications
3. **.NET 9 Backend** - RESTful API built with ASP.NET Core
4. **Angular 20 Frontend** - Single-page application served by Nginx

## Quick Start

### 1. Clone and Navigate

```bash
cd StudyProject
```

### 2. Build and Start All Services

```bash
docker-compose up --build
```

This command will:
- Build the backend and frontend Docker images
- Pull PostgreSQL and MongoDB images
- Create a network for inter-service communication
- Initialize the PostgreSQL database with schema and test data
- Start all services with health checks

### 3. Access the Application

Once all services are healthy (check with `docker-compose ps`):

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:5000
- **Swagger/OpenAPI**: http://localhost:5000/swagger
- **PostgreSQL**: localhost:5432 (username: `postgres`, password: `postgres`)
- **MongoDB**: localhost:27017

## Test Accounts

The database is initialized with test users:

| Email                    | Password      | Role(s)              | Credits |
|--------------------------|---------------|----------------------|---------|
| jean.dupont@email.com    | Password123!  | Passenger, Driver    | 50      |
| marie.martin@email.com   | Password123!  | Passenger, Driver    | 30      |
| pierre.durand@email.com  | Password123!  | Passenger, Driver    | 45      |
| sophie.bernard@email.com | Password123!  | Passenger            | 25      |
| admin@ecoride.fr         | Password123!  | Administrator        | 1000    |
| support@ecoride.fr       | Password123!  | Employee             | 0       |

## Docker Commands

### Start services (detached mode)
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes (deletes all data)
```bash
docker-compose down -v
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f mongodb
```

### Check service status
```bash
docker-compose ps
```

### Rebuild specific service
```bash
# Rebuild backend only
docker-compose up -d --build backend

# Rebuild frontend only
docker-compose up -d --build frontend
```

### Execute commands in containers
```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d ecoride

# Access MongoDB shell
docker-compose exec mongodb mongosh ecoride_nosql

# Access backend shell
docker-compose exec backend /bin/bash

# Access frontend shell
docker-compose exec frontend /bin/sh
```

## Environment Variables

The default configuration is defined in `docker-compose.yml`. To customize:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values

3. Update `docker-compose.yml` to use the `.env` file (uncomment `env_file` sections)

## Database Management

### PostgreSQL

The database is automatically initialized on first run with:
- Schema creation (tables, indexes, constraints)
- Initial data (roles, brands, test users, vehicles, carpools)

To reset the database:
```bash
docker-compose down -v  # Delete volumes
docker-compose up -d    # Recreate and initialize
```

### MongoDB

MongoDB is initialized empty. Collections are created automatically by the application when first accessed.

## Troubleshooting

### Port Conflicts

If ports are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Change 4200 to 8080
  backend:
    ports:
      - "5001:5000"  # Change 5000 to 5001
```

### Backend Can't Connect to Database

Check that PostgreSQL is healthy:
```bash
docker-compose ps postgres
docker-compose logs postgres
```

Wait for the health check to pass before starting the backend.

### Frontend Can't Reach Backend

Ensure the frontend is configured to use the correct backend URL. Check `environment.ts` in the Angular app.

### Out of Memory

Increase Docker's memory limit in Docker Desktop settings to at least 4GB.

### Build Fails

Clear Docker cache and rebuild:
```bash
docker-compose down -v
docker system prune -a --volumes
docker-compose up --build
```

## Production Considerations

For production deployment:

1. **Change default passwords** in `docker-compose.yml`
2. **Use secrets management** instead of environment variables
3. **Enable HTTPS** with a reverse proxy (Nginx, Traefik, Caddy)
4. **Configure email settings** for notifications
5. **Set up monitoring** (Prometheus, Grafana)
6. **Configure backups** for PostgreSQL and MongoDB volumes
7. **Use production-grade JWT secret**
8. **Implement rate limiting**
9. **Add log aggregation** (ELK stack, Loki)
10. **Use Docker secrets** for sensitive data

## Architecture

```
┌─────────────────┐
│   Frontend      │  Angular 20 + Nginx
│   Port: 4200    │  (http://localhost:4200)
└────────┬────────┘
         │
         │ HTTP API
         ▼
┌─────────────────┐
│   Backend       │  .NET 9 + ASP.NET Core
│   Port: 5000    │  (http://localhost:5000)
└────┬───────┬────┘
     │       │
     │       │
     ▼       ▼
┌─────────┐ ┌──────────┐
│PostgreSQL│ │ MongoDB  │
│Port: 5432│ │Port:27017│
└─────────┘ └──────────┘
```

## Health Checks

All services include health checks:

- **PostgreSQL**: `pg_isready` command
- **MongoDB**: `mongosh ping` command
- **Backend**: HTTP GET `/health`
- **Frontend**: HTTP GET `/health`

Health checks ensure services start in the correct order and detect failures.

## Volumes

Persistent data is stored in Docker volumes:

- `postgres_data`: PostgreSQL database files
- `mongodb_data`: MongoDB database files

To backup volumes:
```bash
# PostgreSQL
docker-compose exec postgres pg_dump -U postgres ecoride > backup.sql

# MongoDB
docker-compose exec mongodb mongodump --db=ecoride_nosql --out=/dump
```

## Network

All services communicate through the `ecoride-network` bridge network. This allows:
- Service discovery by name (e.g., `postgres`, `mongodb`)
- Isolated communication between containers
- Secure inter-service communication

## Support

For issues or questions:
- Check logs: `docker-compose logs`
- Review GitHub issues
- Check Docker and container status
