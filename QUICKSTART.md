# Quick Start Guide

Get Secure UPI up and running in minutes!

## Prerequisites

- Docker and Docker Compose installed
- Git installed

## Steps

1. **Clone and navigate**
   ```bash
   git clone <repository-url>
   cd secure-upi
   ```

2. **Create environment file**
   ```bash
   # Copy the example (or create manually)
   # Edit .env if needed (defaults work for local dev)
   ```

3. **Start everything**
   ```bash
   docker-compose up -d
   ```

4. **Wait for services to start** (about 30 seconds)
   ```bash
   docker-compose ps
   ```

5. **Seed the database**
   ```bash
   docker-compose exec backend npm run seed
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API Docs: http://localhost:5000/healthz
   - ML Service: http://localhost:8000/health

## Login Credentials

After seeding, use these credentials:

**Admin:**
- Email: `admin@secureupi.com`
- Password: `admin123`

**User:**
- Email: `john@example.com`
- Password: `user123`

## Common Commands

```bash
# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Access backend shell
docker-compose exec backend sh

# Run tests
docker-compose exec backend npm test
```

## Troubleshooting

**Port already in use?**
- Change ports in `docker-compose.yml`

**MongoDB connection error?**
- Wait a bit longer for MongoDB to start
- Check: `docker-compose logs mongodb`

**Frontend not loading?**
- Check: `docker-compose logs frontend`
- Ensure backend is running: `docker-compose ps`

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- Review API endpoints in the README

Happy coding! 🚀






