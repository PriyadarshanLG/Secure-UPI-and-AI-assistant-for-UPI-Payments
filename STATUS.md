# 🎉 Secure UPI - Setup Complete!

## ✅ All Services Running

| Service | Status | URL |
|---------|--------|-----|
| **Backend** | ✅ Running | http://localhost:5000 |
| **Frontend** | ✅ Running | http://localhost:5173 |
| **ML Service** | ✅ Running | http://localhost:8000 |
| **MongoDB** | ✅ Connected | localhost:27017 |
| **Database** | ✅ Seeded | Sample data loaded |

---

## 🚀 Access Your Application

### Open in Browser:
**http://localhost:5173**

### Login Credentials:

**Admin Account:**
- Email: `admin@secureupi.com`
- Password: `admin123`
- Access: Full admin dashboard, user management, audit logs

**User Account:**
- Email: `john@example.com`
- Password: `user123`
- Access: Dashboard, transactions, evidence upload

---

## 📊 What You Can Do

### As Admin:
✅ View all users and transactions
✅ Check audit logs
✅ Monitor risk scores
✅ View analytics dashboard

### As User:
✅ Create transactions
✅ Upload evidence screenshots
✅ View risk assessments
✅ Track transaction history

---

## 🔧 Enable ML Service in Backend

To use real image analysis (not mock data):

1. Stop the backend (press Ctrl+C in backend terminal)
2. Edit `backend\.env` and change:
   ```
   ML_SERVICE_ENABLED=false
   ```
   to:
   ```
   ML_SERVICE_ENABLED=true
   ```
3. Restart backend: `npm run dev`

**Or use the batch file:**
- Double-click: `start-all-services.bat` (starts everything with ML enabled)

---

## 📝 Quick Commands

**Stop a service:**
- Press `Ctrl+C` in its terminal

**Restart backend:**
```bash
cd backend
npm run dev
```

**Restart frontend:**
```bash
cd frontend
npm run dev
```

**Restart ML service:**
```bash
cd ml-service
python main.py
```

---

## 🐛 Troubleshooting

**Backend not connecting to ML service?**
- Check ML service is running: http://localhost:8000/health
- Make sure `ML_SERVICE_ENABLED=true` in `backend\.env`
- Restart backend

**Port already in use?**
- Stop the service using that port
- Or change port in `.env` files

**Need to reset database?**
```bash
cd backend
npm run seed
```

---

## 📚 Next Steps

1. **Explore the app** - Try creating transactions and uploading evidence
2. **Check the admin dashboard** - Login as admin to see analytics
3. **Read the docs** - See [README.md](README.md) for full documentation
4. **Run tests** - `npm test` in backend or frontend folders

---

## 🎯 Your Setup is Complete!

Everything is installed and running. Start using your Secure UPI app now! 🚀

Visit: **http://localhost:5173**






