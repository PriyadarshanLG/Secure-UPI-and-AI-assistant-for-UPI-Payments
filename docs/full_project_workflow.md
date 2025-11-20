# Secure UPI – End-to-End Workflow

<style>
body {
  font-family: "Segoe UI", "Inter", sans-serif;
  background: #fef9f4;
  color: #203043;
}
.hero {
  background: linear-gradient(120deg, #f47560, #f9c74f);
  color: white;
  border-radius: 18px;
  padding: 28px;
  margin-bottom: 24px;
  box-shadow: 0 25px 60px rgba(244,117,96,0.35);
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,.2);
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.flow-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(230px,1fr));
  gap: 16px;
  margin: 24px 0;
}
.card {
  background: #fff;
  border-radius: 16px;
  padding: 18px;
  border: 1px solid rgba(32,48,67,0.08);
  box-shadow: 0 18px 40px rgba(32,48,67,0.08);
}
.card h3 {
  margin-top: 0;
  font-size: 18px;
  color: #f45d48;
}
.card small {
  color: #7c8797;
  text-transform: uppercase;
  letter-spacing: .1em;
}
.connector {
  border-left: 4px solid #f47560;
  margin: 24px 0;
  padding-left: 18px;
}
.badge {
  font-size: 12px;
  color: #f45d48;
  font-weight: 600;
}
.stacked {
  display: grid;
  gap: 18px;
}
.backend {
  background: #1f3654;
  color: white;
}
.backend h3 {
  color: #ffe066;
}
.legend {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.legend span {
  font-size: 13px;
  display: inline-flex;
  gap: 6px;
  align-items: center;
}
.legend b {
  width: 12px;
  height: 12px;
  display: inline-block;
  border-radius: 50%;
}
</style>

<div class="hero">
  <div class="pill">Secure UPI Journey</div>
  <h1 style="margin:8px 0 6px 0;">From First Click to Fraud Verdict</h1>
  <p style="max-width:640px;font-size:15px;line-height:1.5;">
    A single, color-coded workflow showing the UI states, backend routes, and machine-learning services that power every feature—register, login, dashboard data, fraud analyzers, admin tools, and audit trails.
  </p>
  <div class="legend">
    <span><b style="background:#f47560;"></b> UI View</span>
    <span><b style="background:#1f3654;"></b> Backend Route / Service</span>
    <span><b style="background:#f9c74f;"></b> Decision / Connector</span>
  </div>
</div>

## 1. Entry & Authentication

<div class="flow-grid">
  <div class="card">
    <small>Landing</small>
    <h3>CTA Hub</h3>
    <ul>
      <li>Visitors choose **Register** or **Login**</li>
      <li>Existing session → auto-route to Dashboard</li>
    </ul>
  </div>
  <div class="card">
    <small>Register</small>
    <h3>POST /auth/register</h3>
    <p>Collects name, email, password, phone and hits `backend/routes/auth.js`.</p>
    <ul>
      <li>bcrypt hashing</li>
      <li>Audit log entry</li>
      <li>MongoDB `User` insert</li>
    </ul>
  </div>
  <div class="card">
    <small>Login</small>
    <h3>POST /auth/login</h3>
    <p>Validates credentials, issues JWT, records audit log.</p>
  </div>
  <div class="card backend">
    <small>AuthContext</small>
    <h3>Persist Session</h3>
    <p>Stores token + user profile and shares across the routed layout.</p>
  </div>
</div>

## 2. Dashboard Bootstrap

<div class="stacked">
  <div class="card">
    <small>Layout / Dashboard</small>
    <h3>Token-Aware Fetch</h3>
    <p>Immediately loads stats via:</p>
    <ul>
      <li>`GET /transactions?limit=100`</li>
      <li>`GET /evidence?limit=100`</li>
    </ul>
  </div>
  <div class="card backend">
    <small>Backend</small>
    <h3>transactions.js / evidence.js</h3>
    <p>Each route authenticates, queries MongoDB collections, and returns:
      <ul>
        <li>Recent transactions with risk scores</li>
        <li>Evidence verdicts and metadata</li>
      </ul>
    </p>
  </div>
</div>

## 3. Feature Modules (Fan-out from Dashboard)

<div class="flow-grid">
  <div class="card">
    <small>Evidence Upload</small>
    <h3>POST /evidence/upload</h3>
    <ul>
      <li>FormData (image + manual details)</li>
      <li>`backend/routes/evidence.js` streams to ML service</li>
      <li>OCR, forgery, fraud indicators → MongoDB</li>
    </ul>
  </div>
  <div class="card">
    <small>Link Checker</small>
    <h3>POST /links/check</h3>
    <ul>
      <li>Regex heuristics + suspicious TLDs</li>
      <li>`verificationService` official whitelist</li>
      <li>Google Safe Browsing (optional)</li>
    </ul>
  </div>
  <div class="card">
    <small>SMS Analyzer</small>
    <h3>POST /sms/analyze</h3>
    <p>Pattern buckets + verification lookups return fraud score, warnings, CTA to Link Checker.</p>
  </div>
  <div class="card">
    <small>Voice Analyzer</small>
    <h3>POST /voice/detect</h3>
    <ul>
      <li>Multer (audio)</li>
      <li>Health check to ML service</li>
      <li>Deepfake/spam verdict + fallback analyzer</li>
    </ul>
  </div>
  <div class="card">
    <small>Transactions List</small>
    <h3>GET /transactions</h3>
    <p>Shows paginated history with risk badges; each row links to detail view.</p>
  </div>
  <div class="card">
    <small>Fake Account Intel</small>
    <h3>POST /social-accounts/analyze-screenshot</h3>
    <ul>
      <li>Analysts drop a profile screenshot; backend OCR extracts follower/bio stats</li>
      <li>Heuristics map the text to the nine detector signal families</li>
      <li>`socialAccountDetector` composes weighted scores + recommendations with explainability</li>
      <li>Original image is discarded post-analysis to avoid retaining PII</li>
    </ul>
  </div>
  <div class="card">
    <small>Profile</small>
    <h3>GET /users/me</h3>
    <p>Displays user metadata; demo mode uses static context.</p>
  </div>
  <div class="card">
    <small>Admin Dashboard</small>
    <h3>GET /admin/*</h3>
    <p>`authorize('admin')` protects routes for stats, users, audit logs.</p>
  </div>
</div>

## 4. ML & Storage Layer

<div class="card backend">
  <small>Services & Persistence</small>
  <h3>Always-on foundation</h3>
  <ul>
    <li><strong>ML Service (Python/FastAPI):</strong> OCR, forgery, deepfake, voice analysis, transaction risk.</li>
    <li><strong>MongoDB:</strong> Users, Transactions, Evidence, Merchants, DeviceTelemetry, AuditLog.</li>
    <li><strong>Audit Logger:</strong> `createAuditLog` invoked by auth, uploads, verifications, admin actions.</li>
  </ul>
</div>

## 5. Transaction Drill-down & Risk Loop

<div class="connector">
  <p class="badge">Detail View</p>
  <strong>GET /transactions/:id</strong> → shows merchant, risk, timeline + button to reassess.
</div>

<div class="flow-grid">
  <div class="card">
    <small>Reassess CTA</small>
    <h3>POST /score/assess</h3>
    <p>Payload: transactionId (+ optional deviceId). Invokes `backend/routes/score.js`.</p>
  </div>
  <div class="card backend">
    <small>score.js</small>
    <h3>calculateRiskScore()</h3>
    <ul>
      <li>Fetch Transaction + DeviceTelemetry</li>
      <li>Compute risk, update doc, add recommendation</li>
    </ul>
  </div>
  <div class="card">
    <small>Dashboard Refresh</small>
    <h3>UI Update</h3>
    <p>New risk propagates to Dashboard KPIs, tables, and timeline instantly.</p>
  </div>
</div>

## 6. Journey Summary

1. **Visitors** arrive on a branded landing page and choose authentication flows.
2. **Auth routes** (`/auth/register`, `/auth/login`) validate, hash, log, and persist to MongoDB, returning JWTs consumed by `AuthContext`.
3. **Dashboard** fan-out fetches `/transactions` + `/evidence` to populate KPIs and build links into deep-dive modules.
4. **Feature modules** call their respective routes (`/evidence/upload`, `/links/check`, `/sms/analyze`, `/voice/detect`, `/transactions`, `/users/me`, `/admin/*`), each backed by Express routers, verification services, and ML endpoints.
   - Fake social account intel now flows through `/social-accounts/analyze-screenshot`, turning profile images into explainable risk verdicts with zero manual data entry.
5. **ML & database layers** supply OCR, deepfake, spam detection, and persistent evidence/risk audit trails.
6. **Transactions detail** loops into `/score/assess`, ensuring risk recalculations feed back into the dashboard ecosystem.

This colorized workflow mirrors a product handoff diagram, making it easy to drop into presentations or reports and still retain the precise backend touchpoints.***

