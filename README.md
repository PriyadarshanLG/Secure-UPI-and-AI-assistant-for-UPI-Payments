# Secure UPI - AI-Assisted Fraud Detection

A comprehensive full-stack MERN application for secure UPI payments with AI-powered fraud detection, real-time risk assessment, deepfake detection, voice analysis, and evidence verification.

## 🎯 Overview

**Purpose**: Secure UPI payments with multi-modal AI-assisted fraud detection

**User Roles**: Admin, Merchant, Customer

This application provides:
- **Real-time transaction risk scoring** with advanced ML algorithms
- **Image forensics analysis** for transaction screenshots (8 forensics algorithms)
- **Deepfake detection** for images and videos using AI
- **Voice analysis** for detecting synthetic/manipulated audio
- **Link safety checking** with Google Safe Browsing API integration
- **SMS fraud detection** for fake messages and scams
- **Device telemetry monitoring** for suspicious patterns
- **Blockchain integration** for tamper-proof audit trails
- **WebSocket support** for real-time updates
- **Comprehensive audit logging** for all system activities
- **Role-based access control (RBAC)** with JWT authentication
- **RESTful API** with extensive validation and security

## 🛠️ Tech Stack

### Backend
- **Node.js** (LTS) + **Express.js**
- **MongoDB** with **Mongoose** ODM
- **JWT** authentication with refresh tokens
- **bcrypt** for password hashing
- **Joi** + **express-validator** for validation
- **Winston** for logging

### Frontend
- **React 18** with **Vite**
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Recharts** for analytics

### ML Service
- **Python FastAPI** for ML operations
- **OpenCV** for image forensics and analysis
- **MediaPipe** for deepfake detection
- **Librosa** for voice/audio analysis
- **TensorFlow/PyTorch** models for AI detection
- OCR and metadata extraction

### DevOps & Infrastructure
- **Docker** + **docker-compose** for containerization
- **Redis** for caching and rate limiting
- **WebSocket** for real-time communication
- **Blockchain** integration for audit trails
- **GitHub Actions** for CI/CD
- **Jest** + **Supertest** for testing
- **Winston** for structured logging

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose (for containerized setup)
- MongoDB (if running locally without Docker)
- Python 3.11+ (for ML service, if running separately)

## 🚀 Quick Start

### Windows Users (Easiest)

For Windows, use the provided batch scripts:

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd secure-upi
   ```

2. **Setup ML Service**
   - Double-click `setup-ml-service.bat`
   - This installs Python dependencies including OpenCV

3. **Start all services**
   - Double-click `start-all-services.bat`
   - This starts Backend, Frontend, and ML Service

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - ML Service: http://localhost:8000

### Using Docker (Recommended for Linux/Mac)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd secure-upi
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start all services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - MongoDB on port 27017
   - Redis on port 6379
   - Backend API on port 5000
   - Frontend on port 5173
   - ML Service on port 8000

4. **Seed the database**
   ```bash
   docker-compose exec backend npm run seed
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - ML Service: http://localhost:8000
   - API Health: http://localhost:5000/healthz

### Local Development (Without Docker)

1. **Install dependencies**
   ```bash
   npm run install:all
   ```

2. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGO_URI` in `.env`

3. **Start backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. **Start frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Start ML service** (in a new terminal)
   ```bash
   cd ml-service
   pip install -r requirements.txt
   python main.py
   ```

6. **Seed the database**
   ```bash
   cd backend
   npm run seed
   ```

## 📁 Project Structure

```
secure-upi/
├── backend/
│   ├── models/              # Mongoose schemas
│   │   ├── User.js          # User model with roles
│   │   ├── Transaction.js   # Transaction records
│   │   ├── Evidence.js      # Evidence/screenshot uploads
│   │   ├── AuditLog.js      # Audit trail
│   │   ├── Merchant.js      # Merchant profiles
│   │   └── DeviceTelemetry.js # Device fingerprinting
│   ├── routes/              # API routes
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── users.js         # User management
│   │   ├── transactions.js  # Transaction operations
│   │   ├── evidence.js      # Evidence upload/analysis
│   │   ├── score.js         # Risk scoring
│   │   ├── links.js         # Link safety checker
│   │   ├── sms.js           # SMS fraud detection
│   │   ├── deepfake.js      # Deepfake detection
│   │   ├── voice.js         # Voice analysis
│   │   └── admin.js         # Admin operations
│   ├── middleware/          # Express middleware
│   │   ├── auth.js          # JWT authentication
│   │   ├── errorHandler.js  # Global error handling
│   │   └── rateLimiter.js   # Rate limiting
│   ├── utils/               # Utility functions
│   │   ├── logger.js        # Winston logger
│   │   ├── auditLogger.js   # Audit trail logger
│   │   ├── mlService.js     # ML service client
│   │   ├── fileUpload.js    # File upload handler
│   │   ├── blockchain.js    # Blockchain integration
│   │   ├── websocket.js     # WebSocket server
│   │   └── advancedRiskAnalysis.js # Risk algorithms
│   ├── scripts/             # Utility scripts
│   │   └── seed.js          # Database seeding
│   ├── tests/               # Backend tests
│   │   └── auth.test.js     # Authentication tests
│   ├── uploads/             # Uploaded files storage
│   ├── logs/                # Application logs
│   └── server.js            # Express server
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── Layout.jsx   # App layout wrapper
│   │   │   └── PrivateRoute.jsx # Protected routes
│   │   ├── pages/           # Page components
│   │   │   ├── Landing.jsx           # Landing page
│   │   │   ├── Login.jsx             # Login page
│   │   │   ├── Register.jsx          # Registration
│   │   │   ├── Dashboard.jsx         # User dashboard
│   │   │   ├── AdminDashboard.jsx    # Admin panel
│   │   │   ├── EvidenceUpload.jsx    # Evidence/fraud detection
│   │   │   ├── Transactions.jsx      # Transaction list
│   │   │   ├── TransactionDetail.jsx # Transaction details
│   │   │   ├── LinkChecker.jsx       # Link safety check
│   │   │   ├── SMSChecker.jsx        # SMS fraud check
│   │   │   ├── DeepfakeDetector.jsx  # Deepfake detection
│   │   │   ├── VoiceDetector.jsx     # Voice analysis
│   │   │   └── Profile.jsx           # User profile
│   │   ├── context/         # React context
│   │   │   └── AuthContext.jsx # Auth state management
│   │   ├── utils/           # Helper utilities
│   │   │   └── api.js       # API client (Axios)
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # App entry point
│   ├── public/              # Static assets
│   └── Dockerfile           # Frontend Docker config
├── ml-service/
│   ├── main.py              # FastAPI application
│   ├── upi_validator.py     # UPI validation logic
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile           # ML service Docker config
├── docker-compose.yml       # Docker Compose config
├── start-all-services.bat   # Windows startup script
├── setup-ml-service.bat     # ML service setup script
├── start-ml-service.bat     # ML service start script
├── README.md                # This file
├── QUICKSTART.md            # Quick start guide
├── QUICK_REFERENCE.md       # Quick reference guide
├── STATUS.md                # Setup status
├── TESTING_GUIDE.md         # Testing instructions
└── TROUBLESHOOTING.md       # Troubleshooting guide
```

## 🔐 Authentication

The application uses JWT-based authentication with refresh tokens:

- **Access Token**: Short-lived (15 minutes), sent in Authorization header
- **Refresh Token**: Long-lived (7 days), stored in httpOnly cookie

### Default Credentials (after seeding)

**Admin:**
- Email: `admin@secureupi.com`
- Password: `admin123`

**User:**
- Email: `john@example.com`
- Password: `user123`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile

### Transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions` - List transactions (with filters)
- `GET /api/transactions/:id` - Get transaction details

### Evidence
- `POST /api/evidence/upload` - Upload screenshot/image
- `GET /api/evidence/:id` - Get evidence details
- `GET /api/evidence/:id/download` - Download evidence file

### Risk Scoring
- `POST /api/score/assess` - Assess transaction risk
- `GET /api/score/history` - Get risk assessment history

### Link Safety
- `POST /api/links/check` - Check if a URL is safe to open
- `GET /api/links/history` - Get link check history (coming soon)

### SMS Fraud Detection
- `POST /api/sms/analyze` - Analyze SMS message for fraud indicators
- `GET /api/sms/history` - Get SMS analysis history (coming soon)

### Deepfake Detection
- `POST /api/deepfake/analyze` - Analyze image/video for deepfake indicators
- `POST /api/deepfake/analyze-video` - Specialized video deepfake analysis
- `GET /api/deepfake/history` - Get deepfake analysis history
- `GET /api/deepfake/health` - Check ML service health for deepfake detection

### Voice Analysis
- `POST /api/voice/analyze` - Analyze audio for synthetic/manipulated voice
- `POST /api/voice/transcribe` - Transcribe audio to text with fraud detection
- `GET /api/voice/history` - Get voice analysis history
- `GET /api/voice/health` - Check ML service health for voice analysis

### Admin
- `GET /api/admin/users` - List all users (admin only)
- `GET /api/admin/logs` - View audit logs (admin only)
- `GET /api/admin/stats` - Dashboard statistics (admin only)

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Run All Tests
```bash
npm test
```

## 📊 Seed Data

The seed script creates:
- 2 admin users
- 5 merchant profiles
- 10 regular users
- 30 transactions (varied statuses and risk scores)
- 10 evidence items with mock OCR and forgery flags
- Device telemetry for all users

Run seed:
```bash
cd backend
npm run seed
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild containers
docker-compose up -d --build

# Access backend container
docker-compose exec backend sh

# Run seed in container
docker-compose exec backend npm run seed
```

## 🚢 Deployment

### Heroku

1. Install Heroku CLI
2. Create Heroku app
3. Set environment variables
4. Deploy:
   ```bash
   git push heroku main
   ```

### Render

1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

### Railway

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Docker on VPS

1. Build production images:
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. Run:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## ✨ Key Features

### 🔍 Advanced Fraud Detection
- **8 Image Forensics Algorithms**: Detect edited/fake transaction screenshots
  - Metadata analysis
  - Compression artifact detection
  - Noise pattern analysis
  - Edge consistency checks
  - Color histogram analysis
  - Resolution validation
  - Screenshot indicators
  - Statistical inconsistency detection

### 🤖 AI-Powered Detection
- **Deepfake Detection**: Identify manipulated images and videos using AI models
- **Voice Analysis**: Detect synthetic/manipulated audio recordings
- **Pattern Recognition**: ML-based transaction pattern analysis
- **Behavioral Analytics**: User behavior anomaly detection

### 🔐 Multi-Layer Security
- **UPI Validation**: Format checking, pattern detection for fake UPI IDs
- **Transaction ID Verification**: 12-digit validation with pattern analysis
- **Amount Validation**: Suspicious pattern detection (round numbers, high values)
- **Link Safety**: Google Safe Browsing API integration
- **SMS Fraud Detection**: Analyze text messages for scam indicators

### 📊 Real-Time Monitoring
- **WebSocket Updates**: Real-time notifications for fraud alerts
- **Risk Scoring**: Instant transaction risk assessment
- **Device Telemetry**: Track and analyze device fingerprints
- **Audit Trails**: Comprehensive logging with blockchain integration

## 🔒 Security Features

- **JWT authentication** with refresh tokens (15-min access, 7-day refresh)
- **Password hashing** with bcrypt (12 rounds)
- **Rate limiting** on all API endpoints
- **Input validation** with Joi and express-validator
- **CORS configuration** with whitelisting
- **Helmet** for security headers
- **Secure cookie settings** (httpOnly, sameSite)
- **Role-based access control (RBAC)**
- **Comprehensive audit logging** for all actions
- **File upload restrictions** with size and type validation
- **SQL injection protection** via parameterized queries
- **XSS protection** with input sanitization

## 📝 Environment Variables

See `.env.example` for all required environment variables:

### Backend (.env in backend/)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `JWT_EXPIRES_IN` - Access token expiry (default: 15m)
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiry (default: 7d)
- `CORS_ORIGIN` - Allowed CORS origin
- `ML_SERVICE_URL` - ML service endpoint (default: http://localhost:8000)
- `ML_SERVICE_ENABLED` - Enable/disable ML service (true/false)
- `GOOGLE_SAFE_BROWSING_API_KEY` - (Optional) Google Safe Browsing API key
- `REDIS_URL` - Redis connection string for caching
- `LOG_LEVEL` - Logging level (debug/info/warn/error)
- `UPLOAD_PATH` - Path for uploaded files
- `MAX_FILE_SIZE` - Maximum file upload size (default: 100MB)

### Frontend (.env in frontend/)
- `VITE_API_URL` - Backend API URL (default: http://localhost:5000)
- `VITE_WS_URL` - WebSocket URL for real-time updates

### ML Service (.env in ml-service/)
- `PORT` - Service port (default: 8000)
- `MODEL_PATH` - Path to ML models
- `ENABLE_DEEPFAKE_DETECTION` - Enable deepfake features
- `ENABLE_VOICE_ANALYSIS` - Enable voice analysis features

**Note**: For detailed setup guides:
- Google Safe Browsing API: [GOOGLE_SAFE_BROWSING_SETUP.md](GOOGLE_SAFE_BROWSING_SETUP.md)
- ML Service setup: [SETUP_ML_SERVICE.md](SETUP_ML_SERVICE.md)
- Quick setup: [QUICK_SETUP_SAFE_BROWSING.md](QUICK_SETUP_SAFE_BROWSING.md)
- OpenCV installation: [INSTALL_OPENCV.md](INSTALL_OPENCV.md)

## 📚 Additional Documentation

This project includes extensive documentation to help you get started and troubleshoot issues:

### Setup & Installation
- [QUICKSTART.md](QUICKSTART.md) - Get up and running in minutes
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick reference for common tasks
- [SETUP_LOCAL.md](SETUP_LOCAL.md) - Detailed local setup instructions
- [SETUP_ML_SERVICE.md](SETUP_ML_SERVICE.md) - ML service configuration
- [INSTALL_DEPENDENCIES.md](INSTALL_DEPENDENCIES.md) - Dependency installation guide
- [INSTALL_OPENCV.md](INSTALL_OPENCV.md) - OpenCV setup for image analysis

### Configuration
- [GOOGLE_SAFE_BROWSING_SETUP.md](GOOGLE_SAFE_BROWSING_SETUP.md) - Google Safe Browsing API setup
- [QUICK_SETUP_SAFE_BROWSING.md](QUICK_SETUP_SAFE_BROWSING.md) - Quick Safe Browsing setup
- [NO_AUTH_MODE.md](NO_AUTH_MODE.md) - Running without authentication (demo mode)
- [MANUAL_ONLY_MODE.md](MANUAL_ONLY_MODE.md) - Manual transaction mode

### Features & Usage
- [HACKATHON_FEATURES.md](HACKATHON_FEATURES.md) - Key features for presentations
- [DEMO_SCRIPT.md](DEMO_SCRIPT.md) - Full demo script
- [DEMO_SCRIPT_STREAMLINED.md](DEMO_SCRIPT_STREAMLINED.md) - Quick demo guide
- [STREAMLINED_APP.md](STREAMLINED_APP.md) - Simplified app workflow
- [EDIT_DETECTION_FEATURE.md](EDIT_DETECTION_FEATURE.md) - Image edit detection details
- [FRAUD_DETECTION_IMPROVEMENTS.md](FRAUD_DETECTION_IMPROVEMENTS.md) - Fraud detection enhancements
- [AGGRESSIVE_FRAUD_DETECTION.md](AGGRESSIVE_FRAUD_DETECTION.md) - Advanced detection strategies

### Testing & Troubleshooting
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Comprehensive testing guide
- [TEST_LINK_CHECKER.md](TEST_LINK_CHECKER.md) - Link checker testing
- [TEST_LINKS_EXAMPLES.md](TEST_LINKS_EXAMPLES.md) - Test URLs and examples
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions
- [ERRORS_FOUND.md](ERRORS_FOUND.md) - Known issues and fixes

### Development
- [STATUS.md](STATUS.md) - Current project status
- [CHANGELOG.md](CHANGELOG.md) - Version history and changes
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [FINAL_FIXES_SUMMARY.md](FINAL_FIXES_SUMMARY.md) - Recent fixes and updates

### Presentations
- [PROJECT_PRESENTATION.md](PROJECT_PRESENTATION.md) - Project presentation content
- [PROJECT_PRESENTATION.html](PROJECT_PRESENTATION.html) - HTML presentation
- [CREATE_PPT_INSTRUCTIONS.md](CREATE_PPT_INSTRUCTIONS.md) - Creating presentations
- [HOW_TO_USE_PRESENTATION.md](HOW_TO_USE_PRESENTATION.md) - Presentation guide

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes with clear commit messages
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Update documentation as needed
7. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📄 License

MIT License - see the LICENSE file for details

## 🐛 Troubleshooting

### MongoDB Connection Issues
- **Issue**: Cannot connect to MongoDB
- **Solutions**:
  - Ensure MongoDB is running: `docker ps` or check local MongoDB service
  - Verify `MONGO_URI` in backend `.env` file
  - Check network connectivity and firewall settings
  - For Docker: Wait 30-60 seconds for MongoDB to fully initialize

### Port Conflicts
- **Issue**: Port already in use (EADDRINUSE)
- **Solutions**:
  - Check what's using the port: `netstat -ano | findstr :[PORT]` (Windows) or `lsof -i :[PORT]` (Linux/Mac)
  - Kill the process or change ports in `.env` files
  - Default ports: Backend (5000), Frontend (5173), ML Service (8000), MongoDB (27017)

### ML Service Not Responding
- **Issue**: ML service health check fails or timeouts
- **Solutions**:
  - Check if ML service is running: `http://localhost:8000/health`
  - Verify `ML_SERVICE_URL` in backend `.env`
  - Install Python dependencies: `pip install -r ml-service/requirements.txt`
  - Check ML service logs for errors
  - For OpenCV issues, see [INSTALL_OPENCV.md](INSTALL_OPENCV.md)
  - Temporarily disable ML: Set `ML_SERVICE_ENABLED=false` in backend `.env`

### Frontend Not Loading
- **Issue**: Frontend shows blank page or errors
- **Solutions**:
  - Check browser console for errors (F12)
  - Verify backend is running: `http://localhost:5000/healthz`
  - Check `VITE_API_URL` in frontend `.env`
  - Clear browser cache and hard refresh (Ctrl+Shift+R)
  - Rebuild: `cd frontend && npm run build`

### Authentication/Token Issues
- **Issue**: JWT token expired or invalid
- **Solutions**:
  - Logout and login again
  - Check token expiry settings in backend `.env`
  - Clear browser cookies and localStorage
  - Verify `JWT_SECRET` is set and consistent

### File Upload Issues
- **Issue**: Cannot upload images/videos/audio
- **Solutions**:
  - Check file size (max 100MB for videos, 50MB for audio)
  - Verify file format is supported
  - Check backend `uploads/` directory permissions
  - Review `MAX_FILE_SIZE` in backend `.env`
  - Check backend logs for detailed error messages

### Windows-Specific Issues
- **Issue**: Batch scripts not working
- **Solutions**:
  - Run as Administrator
  - Check Python is in PATH
  - Use PowerShell instead of Command Prompt
  - Manually run commands from batch files

### Docker Issues
- **Issue**: Containers not starting or crashing
- **Solutions**:
  - Check Docker logs: `docker-compose logs [service-name]`
  - Rebuild containers: `docker-compose up -d --build`
  - Remove volumes: `docker-compose down -v` (⚠️ deletes data)
  - Ensure Docker has enough resources (RAM, CPU)
  - Check Docker Desktop is running

### Database Seeding Issues
- **Issue**: Seed command fails or incomplete data
- **Solutions**:
  - Ensure MongoDB is connected
  - Clear existing data first (optional): Drop database in MongoDB
  - Run seed script: `cd backend && npm run seed`
  - Check for validation errors in logs

For more detailed troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## 📞 Support

For issues and questions:
- 📖 Check the [documentation](#-additional-documentation) first
- 🐛 Open an issue on GitHub with detailed information
- 💬 Include error messages, logs, and steps to reproduce
- 🔍 Search existing issues for similar problems

## 🏆 Credits

Built with ❤️ using the MERN stack (MongoDB, Express.js, React, Node.js) + Python FastAPI

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**License**: MIT
