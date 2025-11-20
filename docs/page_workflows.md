# Secure UPI – Page Workflows

The following workflows mirror the schematic style from your PPT reference. Each diagram shows how events move from user input, through the React page, into backend routes (`backend/routes/*`), supporting services, and finally to MongoDB or the ML services.

---

## Landing (`Landing.jsx`)

- Greets authenticated and guest users, syncs theme via `AuthContext`.
- CTA buttons simply route users toward Register/Login or Dashboard, so no backend call happens here.

```
┌─────────────────────────────┐
│ Visitor                     │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ React Router → Landing.jsx  │
├─────────────────────────────┤
│ • Sync theme from Outlet    │
│ • Read AuthContext status   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Hero / CTA Buttons          │
├──────────────┬──────────────┤
│ AUTH FALSE   │ AUTH TRUE    │
└──────┬───────┴──────┬───────┘
       │              │
       ▼              ▼
 Route → /register    Route → /dashboard
         or /login
```

---

## Register (`Register.jsx` → `/auth/register`)

```
┌──────────────────────────────────────┐
│ User Inputs                          │
│ (name, email, password, phone)       │
└─────────────────┬────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────┐
│ Register.jsx Form                    │
├──────────────────────────────────────┤
│ • Client validation                  │
│ • Build POST /auth/register payload  │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ backend/routes/auth.js               │
├──────────────────────────────────────┤
│ • express-validator                  │
│ • bcrypt hash                        │
│ • Insert User in Mongo               │
│ • Audit log                          │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ Tokens + User Payload                │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ AuthContext                          │
├──────────────────────────────────────┤
│ • Store user + token                 │
│ • Navigate to /dashboard             │
└──────────────────────────────────────┘
```

- Failure path: validation error or duplicate email returns `400`, surfaced near the form.

---

## Login (`Login.jsx` → `/auth/login`)

```
┌─────────────────────────────┐
│ Credentials Input           │
│ (email + password)          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Login.jsx Form              │
├─────────────────────────────┤
│ • Show loading/error states │
│ • POST /auth/login          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ backend/routes/auth.js      │
├─────────────────────────────┤
│ • Validate + bcrypt compare │
│ • Generate tokens           │
│ • Audit log entry           │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ AuthContext                 │
├─────────────────────────────┤
│ • Save token & user         │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Router                      │
├─────────────────────────────┤
│ navigate('/dashboard')      │
└─────────────────────────────┘
```

Errors return `[ERROR]` banner with backend message (e.g., invalid credentials).

---

## Dashboard (`Dashboard.jsx`)

```
┌─────────────────────────────┐
│ Authenticated User          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Dashboard.jsx useEffect     │
├─────────────────────────────┤
│ • GET /transactions?limit=100
│ • GET /evidence?limit=100   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ backend/routes/transactions │
│ backend/routes/evidence     │
├─────────────────────────────┤
│ • Auth middleware           │
│ • Mongo queries             │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ MongoDB Collections         │
│ (Transactions + Evidence)   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Dashboard State             │
├─────────────────────────────┤
│ • KPI widgets               │
│ • Recent activity           │
│ • Scam statistics           │
│ • Feature cards             │
└─────────────────────────────┘
```

- Fallback timers animate progress and terminal text even if data is delayed.

---

## Evidence Upload (`EvidenceUpload.jsx` → `/evidence/upload`)

```
┌──────────────────────────────────────┐
│ Upload Inputs                        │
│ (Screenshot or Manual Fields)        │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ EvidenceUpload.jsx                   │
├──────────────────────────────────────┤
│ • Build FormData                     │
│ • Progress Meter                     │
│ • POST /evidence/upload              │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ backend/routes/evidence.js           │
├──────────────────────────────────────┤
│ • multer upload + hash               │
│ • Manual-only branch                 │
│ • Call utils/mlService.analyzeImage  │
│ • Save Evidence + audit log          │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ ML Service (ml-service/main.py)      │
├──────────────────────────────────────┤
│ • OCR + forgery detection            │
│ • Fraud heuristics/duplicate flag    │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ MongoDB Evidence                     │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ UI Result Card                       │
├──────────────────────────────────────┤
│ • Verdicts & scores                  │
│ • Extracted data & indicators        │
└──────────────────────────────────────┘
```

Errors (Multer limits, validation, ML failures) are surfaced via `[ERROR]` banners.

---

## Link Checker (`LinkChecker.jsx` → `/links/check`)

```
┌──────────────────────────────────────┐
│ User URL Input                       │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ LinkChecker.jsx Form                 │
├──────────────────────────────────────┤
│ • Validate non-empty                 │
│ • POST /links/check                  │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ backend/routes/links.js              │
├──────────────────────────────────────┤
│ • express-validator                  │
│ • Pattern heuristics                 │
│ • verificationService checks         │
│ • Safe Browsing (if key)             │
│ • Audit log                          │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ Threat Verdict + Safety Score        │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ UI Result Card                       │
├──────────────────────────────────────┤
│ • Status badge                       │
│ • threats[] & warnings[]             │
│ • Score gauge                        │
└──────────────────────────────────────┘
```

---

## SMS Analyzer (`SMSChecker.jsx` → `/sms/analyze`)

```
┌──────────────────────────────────────┐
│ SMS Input                            │
│ (text + optional sender/phone)       │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ SMSChecker.jsx                       │
├──────────────────────────────────────┤
│ • POST /sms/analyze                  │
│ • Manage progress + errors           │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ backend/routes/sms.js                │
├──────────────────────────────────────┤
│ • Regex pattern buckets              │
│ • Link extraction + verificationSvc  │
│ • Sender / phone validation          │
│ • Fraud score + status               │
│ • Audit log                          │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ Response Payload                     │
│ (fraudScore, issues, warnings, etc.) │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ UI Result Widgets                    │
├──────────────────────────────────────┤
│ • Status, score, recommendations     │
│ • CTA → Link Checker for URLs        │
└──────────────────────────────────────┘
```

---

## Voice Analyzer (`VoiceDetector.jsx` → `/voice/detect`)

```
┌──────────────────────────────────────┐
│ Audio Upload (≤50 MB)                │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ VoiceDetector.jsx                    │
├──────────────────────────────────────┤
│ • Preview audio                      │
│ • POST /voice/detect (FormData)      │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ backend/routes/voice.js              │
├──────────────────────────────────────┤
│ • Multer (memory) + mime guard       │
│ • Check ML service health            │
│ • Call ML API or fallback analysis   │
│ • Audit log                          │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ ML Service Voice Endpoint            │
├──────────────────────────────────────┤
│ • Deepfake heuristics                │
│ • Spam indicators                    │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ Response (verdict, scores, details)  │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ UI Result Card                       │
├──────────────────────────────────────┤
│ • Audio replay + mitigation tips     │
└──────────────────────────────────────┘
```

---

## Transactions List (`Transactions.jsx`)

```
┌──────────────────────────────────────┐
│ User opens /transactions             │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ Transactions.jsx useEffect           │
├──────────────────────────────────────┤
│ • GET /transactions?page&limit       │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ backend/routes/transactions.js       │
├──────────────────────────────────────┤
│ • Auth scope per role                │
│ • Query builder + filters            │
│ • Pagination metadata                │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ MongoDB Transaction Collection       │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ Table View                           │
├──────────────────────────────────────┤
│ • Risk color badges                  │
│ • Status chips                       │
│ • Links to `/transactions/:id`       │
└──────────────────────────────────────┘
```

---

## Transaction Detail (`TransactionDetail.jsx`)

```
┌──────────────────────────────────────┐
│ React Router param (:id)             │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ useEffect → GET /transactions/:id    │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ backend/routes/transactions.js       │
├──────────────────────────────────────┤
│ • findById + access guard            │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ Detail Card                          │
├──────────────────────────────────────┤
│ • Amount / Merchant / Risk           │
│ • CTA: Assess Risk                   │
└───────┬──────────────────────────────┘
        │
        ▼
POST /score/assess (transactionId)
        │
        ▼
┌──────────────────────────────────────┐
│ backend/routes/score.js              │
├──────────────────────────────────────┤
│ • Optional telemetry lookup          │
│ • calculateRiskScore()               │
│ • Save + audit log                   │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ Updated Transaction Document         │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ UI Refresh                           │
├──────────────────────────────────────┤
│ • Show new score + alert             │
└──────────────────────────────────────┘
```

---

## Profile (`Profile.jsx`)

```
┌──────────────────────────────────────┐
│ User opens Profile                   │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ AuthContext                          │
├──────────────────────────────────────┤
│ • Demo mode: preset user             │
│ • Prod: GET /users/me                │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ Profile Widgets                      │
├──────────────────────────────────────┤
│ • Metadata, role, status             │
│ • CTA → Evidence Upload / Dashboard  │
└──────────────────────────────────────┘
```

For editable deployments, `PUT /users/me` (in `backend/routes/users.js`) would mirror the update flow, logging audit entries.

---

## Admin Dashboard (`AdminDashboard.jsx`)

```
┌──────────────────────────────────────┐
│ Admin visits /admin                  │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ useEffect Promise.all                │
├──────────────────────────────────────┤
│ • GET /admin/stats                   │
│ • GET /admin/users?limit=10          │
│ • GET /admin/logs?limit=10           │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ backend/routes/admin.js              │
├──────────────────────────────────────┤
│ • authenticate + authorize('admin')  │
│ • Aggregations (users/tx/evidence)   │
│ • Audit log queries                  │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ MongoDB Collections                  │
│ (Users, Transactions, Evidence, Logs)│
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ Admin Dashboard UI                   │
├──────────────────────────────────────┤
│ • Role distribution chart            │
│ • Stat tiles                         │
│ • Recent users & audit log table     │
└──────────────────────────────────────┘
```

---

## Page Interlinking Overview

```
┌────────┐      ┌──────────┐
│Landing │─────▶│Register  │
│        │      └────┬─────┘
│        │           │
│        │      ┌────▼─────┐
│        ├─────▶│Login     │
└──┬─────┘      └────┬─────┘
   │                 │
   ▼                 ▼
┌────────────────────────┐
│      Dashboard         │
└──┬────┬────┬────┬──────┘
   │    │    │    │
   │    │    │    └─────────────▶┌──────────────┐
   │    │    │                   │Transactions  │
   │    │    │                   └────┬─────────┘
   │    │    │                        │
   │    │    │                        ▼
   │    │    │                  ┌──────────────┐
   │    │    │                  │Transaction   │
   │    │    │                  │Detail        │
   │    │    │                  └────┬─────────┘
   │    │    │                        │
   │    │    │                        ▼
   │    │    │                  ┌──────────────┐
   │    │    │                  │Risk Assess   │
   │    │    │                  └──────────────┘
   │    │    │
   │    │    ├────────────▶┌──────────────┐
   │    │                   │Voice Analyzer│
   │    │
   │    ├────────────▶┌──────────────┐
   │                    │SMS Analyzer │
   │
   ├────────────▶┌──────────────┐
   │              │Link Checker  │
   │
   └────────────▶┌──────────────┐
                  │Evidence Upload│
                  └────┬─────────┘
                       ▼
                 ┌──────────────┐
                 │ML Service    │
                 └──────────────┘

┌────────┐──────▶ Shortcuts → analyzers
│Profile │
└────────┘

┌──────────────┐────▶ System oversight
│Admin Dashboard│
└──────────────┘
```

Use this document as the canonical reference when updating slides or onboarding new contributors; every arrow references concrete files and endpoints, so you can quickly show how UI intentions are enforced by backend logic and persisted in MongoDB.

