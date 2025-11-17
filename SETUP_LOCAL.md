# Running Secure UPI Without Docker

Complete guide to run the application locally without Docker containers.

## Prerequisites

1. **Node.js 18+** and npm 9+
   - Download from: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **MongoDB**
   - Option A: Install MongoDB locally
     - Windows: https://www.mongodb.com/try/download/community
     - Mac: `brew install mongodb-community`
     - Linux: `sudo apt-get install mongodb`
   - Option B: Use MongoDB Atlas (cloud, free tier)
     - Sign up: https://www.mongodb.com/cloud/atlas
     - Get connection string

3. **Python 3.11+** (for ML service)
   - Download from: https://www.python.org/downloads/
   - Verify: `python --version`

## Step-by-Step Setup

### Step 1: Install Dependencies

Open terminal in the project root and run:

```bash
# Install root dependencies (if any)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install ML service dependencies
cd ../ml-service
pip install -r requirements.txt
```

### Step 2: Set Up MongoDB

#### Option A: Local MongoDB

1. **Start MongoDB service:**
   ```bash
   # Windows (if installed as service, it starts automatically)
   # Or run: mongod
   
   # Mac/Linux
   sudo systemctl start mongod
   # Or: mongod
   ```

2. **Verify MongoDB is running:**
   ```bash
   mongosh
   # Should connect successfully
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/secure-upi`)
4. Use this in your `.env` file

### Step 3: Configure Environment Variables

#### Backend Configuration

Create `backend/.env` file:

```bash
cd backend
# Copy example
cp .env.example .env
```

Edit `backend/.env`:

```env
NODE_ENV=development
PORT=5000

# MongoDB - Choose one:
# Local MongoDB:
MONGO_URI=mongodb://localhost:27017/secure-upi
# OR MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/secure-upi

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

CORS_ORIGIN=http://localhost:5173

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg

ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_ENABLED=true

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_ENABLED=false

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

BCRYPT_ROUNDS=12
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax

# Google Safe Browsing API (Optional - for link safety checking)
# Get your API key from: https://console.cloud.google.com/
# See QUICK_SETUP_SAFE_BROWSING.md for setup instructions
GOOGLE_SAFE_BROWSING_API_KEY=your_api_key_here
```

#### Frontend Configuration

Create `frontend/.env` file:

```bash
cd frontend
# Create .env file
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 4: Create Required Directories

```bash
# From project root
mkdir -p backend/uploads
mkdir -p backend/logs
```

### Step 5: Start All Services

You need **3 separate terminal windows/tabs**:

#### Terminal 1: Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
Connected to MongoDB
Server running on port 5000
```

#### Terminal 2: Frontend Development Server

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

#### Terminal 3: ML Service

```bash
cd ml-service
python main.py
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 6: Seed the Database

In a new terminal (or Terminal 4):

```bash
cd backend
npm run seed
```

You should see:
```
Connected to MongoDB
Cleared existing data
Created admin users
Created merchants
Created users
Created transactions
Created evidence items
Created device telemetry
✅ Seed data created successfully!
```

### Step 7: Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/healthz
- **ML Service**: http://localhost:8000/health

### Step 8: Login

Use these credentials (created by seed script):

**Admin Account:**
- Email: `admin@secureupi.com`
- Password: `admin123`

**User Account:**
- Email: `john@example.com`
- Password: `user123`

## Development Workflow

### Making Changes

1. **Backend changes**: Save file, nodemon auto-restarts
2. **Frontend changes**: Save file, Vite hot-reloads
3. **ML service changes**: Restart Python server manually

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Viewing Logs

- Backend logs: Check terminal 1 or `backend/logs/` directory
- Frontend: Check browser console
- ML service: Check terminal 3

## Troubleshooting

### MongoDB Connection Issues

**Error: "MongoServerError: connect ECONNREFUSED"**

- **Local MongoDB**: Ensure MongoDB is running
  ```bash
  # Check if running
  mongosh
  # If fails, start MongoDB:
  # Windows: Check Services app
  # Mac/Linux: sudo systemctl start mongod
  ```

- **MongoDB Atlas**: 
  - Check connection string is correct
  - Ensure IP is whitelisted in Atlas dashboard
  - Check username/password are correct

### Port Already in Use

**Error: "Port 5000 already in use"**

```bash
# Find process using port
# Windows:
netstat -ano | findstr :5000

# Mac/Linux:
lsof -i :5000

# Kill process or change PORT in backend/.env
```

### Python/ML Service Issues

**Error: "Module not found"**

```bash
cd ml-service
pip install -r requirements.txt
```

**Error: "Python not found"**

- Ensure Python 3.11+ is installed
- Use `python3` instead of `python` on Mac/Linux

### Frontend Not Connecting to Backend

1. Check backend is running on port 5000
2. Verify `VITE_API_URL` in `frontend/.env`
3. Check CORS settings in `backend/.env`
4. Check browser console for errors

### File Upload Issues

1. Ensure `backend/uploads` directory exists
2. Check permissions on uploads directory
3. Verify `UPLOAD_DIR` in `backend/.env`

## Stopping Services

Press `Ctrl+C` in each terminal to stop:
- Terminal 1: Backend
- Terminal 2: Frontend  
- Terminal 3: ML Service

## Quick Reference Commands

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Start ML service
cd ml-service && python main.py

# Seed database
cd backend && npm run seed

# Run tests
cd backend && npm test
cd frontend && npm test

# Install new packages
cd backend && npm install <package>
cd frontend && npm install <package>
cd ml-service && pip install <package>
```

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Review API endpoints in README

Happy coding! 🚀



