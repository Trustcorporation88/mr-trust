# 📊 Production Monitoring & Alerting Setup

## Overview

Configuração completa de monitoramento para aplicação CRM em produção no Vercel com Supabase PostgreSQL.

---

## 🟢 Vercel Built-in Monitoring

### 1. Access Vercel Analytics

**Dashboard URL:** https://vercel.com/dashboard

**Steps:**
1. Login to Vercel
2. Select project: **crm**
3. Navigate to **Analytics** tab
4. View metrics:
   - Web Vitals (FCP, LCP, CLS)
   - Edge cache hit rate
   - Function execution time
   - API response times

### 2. Deployment Monitoring

**Location:** Vercel Dashboard → **Deployments**

**Metrics to Monitor:**
```
✅ Build Success/Failure Rate
✅ Build Duration (target < 2 min)
✅ Function Initialization Time (< 50ms)
✅ Cold Start Frequency
✅ Memory Usage
✅ Execution Time per Request
```

### 3. Function Performance

**Location:** Vercel Dashboard → **Functions** tab

**Key Metrics:**
- Invocation count (requests per minute)
- Average execution time
- Error rate
- P99 latency

---

## 🚨 Alerting Strategy

### Email Alerts (Built-in)

**Configure in:** https://vercel.com/dashboard/crm/settings

**Go to:** Settings → **Notifications**

**Enable:**
- ✅ Deployment succeeded
- ✅ Deployment failed
- ✅ Production error

**Recipients:**
```
admin@example.com
devops@example.com
```

### GitHub Notifications

**Status Check on Pull Requests:**
- PRs show build status before merge
- Blocks merge if deployment fails
- Automatically monitors main branch

**Configuration:**
```yaml
# GitHub automatically detects Vercel integration
# No additional setup needed for PR checks
```

---

## 📈 Recommended Third-Party Integrations

### Option 1: Sentry (Error Tracking)

**Setup Steps:**

1. **Create Sentry Account**
   - Navigate to: https://sentry.io
   - Sign up / Login
   - Create project for Node.js
   - Get DSN (Data Source Name)

2. **Install Sentry in Backend**
   ```bash
   npm install @sentry/node @sentry/tracing
   ```

3. **Configure in Vercel Functions**
   - Update API handlers with Sentry client
   - Add Sentry DSN to environment variables
   - Configure error boundaries

4. **Add Environment Variable to Vercel**
   ```bash
   vercel env add SENTRY_DSN https://xxx@sentry.io/xxx
   ```

5. **Example Integration in Function**
   ```javascript
   // api/auth/login.js
   const Sentry = require('@sentry/node');
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: 'production',
     tracesSampleRate: 0.1
   });
   
   export default async function handler(req, res) {
     try {
       // Authentication logic...
     } catch (error) {
       Sentry.captureException(error);
       return res.status(500).json({...});
     }
   }
   ```

**Sentry Benefits:**
- ✅ Real-time error notifications
- ✅ Error grouping and deduplication
- ✅ Source map integration
- ✅ Custom error tags and context
- ✅ Release tracking

---

### Option 2: DataDog APM (Full Stack Monitoring)

**Setup Steps:**

1. **Create DataDog Account**
   - Navigate to: https://app.datadoghq.com
   - Sign up / Login
   - Create API key

2. **Install DataDog Agent**
   ```bash
   npm install dd-trace
   ```

3. **Configure in Vercel Functions**
   ```javascript
   // Trace all serverless functions
   const tracer = require('dd-trace').init();
   
   export default async function handler(req, res) {
     const span = tracer.startSpan('auth.login');
     try {
       // Authentication logic...
       span.setTag('user.email', email);
     } finally {
       span.finish();
     }
   }
   ```

4. **Add DataDog Environment Variables**
   ```bash
   vercel env add DD_API_KEY <your-api-key>
   vercel env add DD_APP_KEY <your-app-key>
   vercel env add DD_SITE datadoghq.com  # or eu.datadoghq.com
   ```

**DataDog Benefits:**
- ✅ Distributed tracing
- ✅ Database query monitoring
- ✅ Custom metrics
- ✅ Log aggregation
- ✅ Infrastructure monitoring

---

### Option 3: New Relic APM

**Setup Steps:**

1. **Create New Relic Account**
   - Navigate to: https://newrelic.com
   - Sign up for free tier
   - Get license key

2. **Install New Relic Agent**
   ```bash
   npm install newrelic
   ```

3. **Initialize in Entry Point**
   ```javascript
   // At very top of handler
   require('newrelic');
   
   export default async function handler(req, res) {
     // Your code...
   }
   ```

4. **Add License Key**
   ```bash
   vercel env add NEW_RELIC_LICENSE_KEY <your-key>
   vercel env add NEW_RELIC_APP_NAME "CRM-Production"
   ```

**New Relic Benefits:**
- ✅ Real-time application monitoring
- ✅ Custom dashboards
- ✅ Synthetic monitoring
- ✅ Alert policy management

---

## 📊 Custom Metrics Dashboard

### Prometheus + Grafana Stack (Self-Hosted)

**Alternative if self-hosting:** Configure Node.js metrics endpoint in serverless functions

```javascript
// api/metrics.js
const prometheus = require('prom-client');

const register = new prometheus.Registry();
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

export default async function handler(req, res) {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
}
```

Then scrape with Prometheus at `/api/metrics`

---

## 🔔 Alert Rules Configuration

### Critical Alerts (Immediate Notification)

```javascript
// Alert Rules (pseudocode for configuration)

// 1. High Error Rate
condition: error_rate > 5%
duration: 5 minutes
severity: CRITICAL
notification: [Slack, Email, PagerDuty]

// 2. Function Timeout
condition: execution_time > 25 seconds  // Vercel limit
duration: 1 minute
severity: CRITICAL

// 3. Database Connection Failure
condition: db_connection_errors > 10
duration: 2 minutes
severity: CRITICAL

// 4. Unauthorized Access Attempts
condition: 401_responses > 100/min
duration: 5 minutes
severity: HIGH

// 5. Deployment Failure
condition: build_status == FAILED
duration: immediate
severity: HIGH
```

### Warning Alerts (Monitoring)

```javascript
// 6. High Response Time
condition: p95_latency > 1000ms
duration: 10 minutes
severity: WARNING

// 7. High Memory Usage
condition: memory_usage > 80%
duration: 5 minutes
severity: WARNING

// 8. Token Refresh Failures
condition: refresh_token_errors > 5
duration: 5 minutes
severity: WARNING

// 9. Slow Database Queries
condition: query_time > 500ms
duration: 5 minutes
severity: WARNING
```

---

## 📋 Monitoring Checklist

### Daily Monitoring

- [ ] Check Vercel deployment status
- [ ] Review error count in Sentry
- [ ] Check error rate < 1%
- [ ] Verify response time < 500ms median

### Weekly Monitoring

- [ ] Review DataDog performance trends
- [ ] Check database connection pool utilization
- [ ] Analyze user authentication patterns
- [ ] Review cost (compute + database)

### Monthly Monitoring

- [ ] Generate performance report
- [ ] Analyze token expiry patterns
- [ ] Review security logs
- [ ] Plan capacity upgrades

---

## 🛠️ Troubleshooting Common Issues

### Issue: High Function Initialization Time

**Symptoms:**
- First request to function takes > 5 seconds
- Subsequent requests are normal

**Cause:** Cold start - Vercel scaling down unused functions

**Solution:**
```javascript
// Add warmer function to keep warm
// Create: api/warmer.js
export default async function handler(req, res) {
  return res.status(200).json({ status: 'ok' });
}

// Call from external service every 5 minutes
```

### Issue: Database Connection Pool Exhausted

**Symptoms:**
- Error: "too many connections"
- 503 Service Unavailable

**Solution:**
```javascript
// Verify pool configuration in handlers
const pool = new Pool({
  max: 2,  // Vercel serverless limit
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
```

### Issue: JWT Token Expiry Causing 403 Errors

**Symptoms:**
- Users get logged out after 7 days
- 403 Forbidden on protected endpoints

**Solution:**
```javascript
// Implement token refresh flow in frontend
// Call /api/auth/refresh before token expires
// Or intercept 403 and retry with refresh
```

---

## 🔐 Security Monitoring

### Log Authentication Events

**Track:**
- Successful logins (by user, time, IP)
- Failed login attempts (brute force detection)
- Token refresh operations
- Password changes

**Implementation:**
```javascript
// In login handler
logger.info('Login attempt', {
  email,
  timestamp: new Date(),
  success: true/false,
  ip: req.headers['x-forwarded-for']
});
```

### Monitor Unauthorized Access

**Setup Alert:**
```javascript
condition: unauthorized_requests > 50/hour
severity: HIGH
action: Block IP temporarily (rate limiting)
```

---

## 📊 Recommended Monitoring Stack

**For MVP (Minimum Viable Product):**
1. ✅ Vercel built-in analytics
2. ✅ Email alerts
3. ✅ GitHub PR checks

**For Production (Recommended):**
1. ✅ Sentry (error tracking)
2. ✅ Vercel analytics
3. ✅ Custom logging to DataDog
4. ✅ PagerDuty (incident response)

**For Enterprise:**
1. ✅ Full DataDog APM
2. ✅ Prometheus + Grafana
3. ✅ ELK Stack (logs)
4. ✅ PagerDuty + incident management
5. ✅ Custom dashboards and reports

---

## 📞 Quick Setup Commands

### Add Sentry
```bash
npm install @sentry/node @sentry/tracing
vercel env add SENTRY_DSN https://xxx@sentry.io/xxx
```

### Add DataDog
```bash
npm install dd-trace
vercel env add DD_API_KEY <key>
vercel env add DD_SITE datadoghq.com
```

### Add New Relic
```bash
npm install newrelic
vercel env add NEW_RELIC_LICENSE_KEY <key>
vercel env add NEW_RELIC_APP_NAME CRM-Production
```

### Deploy Changes
```bash
git add .
git commit -m "feat: add monitoring integration"
git push origin main
# Vercel auto-deploys
```

---

## ✅ Monitoring Verification

After setup, verify:

1. **Errors are being tracked**
   - Sentry: Check dashboard for events
   - DataDog: Check metrics for custom events

2. **Alerts are working**
   - Test by triggering error
   - Confirm notification received

3. **Performance baseline**
   - Record current latency metrics
   - Set threshold for alerts above 2x baseline

4. **Dashboard access**
   - Verify team can access monitoring UI
   - Grant appropriate permissions

---

**Status:** 🟢 Ready for Production
**Last Updated:** 2024-12-XX
**Recommended Priority:** Set up Sentry first (2 hours), then DataDog (4 hours)
