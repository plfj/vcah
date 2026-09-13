# 🚀 Atomic Grade PyVM - Installation & Setup Guide

## Quick Start (5 Minutes)

### Prerequisites

- Node.js >= 20.0.0 (LTS)
- Python 3.8+ (for generated code execution)
- npm, pnpm, or bun

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/vcah.git
cd vcah

# Install dependencies
npm install

# Install additional security packages
npm install class-validator class-transformer winston pycryptodome

# Build project
npm run build

# Start server
npm start
```

Server will start on `http://localhost:3000`

---

## 📦 Dependencies Added

### Production Dependencies

```json
{
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.1",
  "winston": "^3.11.0"
}
```

### Python Runtime Dependencies

```bash
# Required on systems that will RUN obfuscated code
pip install pycryptodome
```

---

## 🔐 Initial Configuration

### 1. Environment Variables

Create `.env` file:

```bash
# Server Configuration
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# Security
API_KEY_SALT=your-secret-salt-here-change-this
SESSION_SECRET=your-session-secret-here-change-this

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10

# Python Sandbox
SANDBOX_MAX_EXECUTION_TIME_MS=5000
SANDBOX_MAX_MEMORY_MB=512

# Crypto
PBKDF2_ITERATIONS=600000
DEFAULT_ENCRYPTION_KEY=PyShield_Master_Key_Atomic_2026
```

### 2. Generate Initial API Key

```typescript
// scripts/generate-api-key.ts
import { AuthenticationService } from './src/server/services/authentication.service';

const { apiKey, keyHash } = AuthenticationService.createApiKey(
  'admin',
  ['*'], // All permissions
  1000, // High rate limit
  365 * 24 * 60 * 60 * 1000 // 1 year expiry
);

console.log('='.repeat(60));
console.log('🔑 ADMIN API KEY GENERATED');
console.log('='.repeat(60));
console.log('API Key:', apiKey);
console.log('Key Hash:', keyHash);
console.log('User ID: admin');
console.log('Permissions: All (*)');
console.log('Rate Limit: 1000 req/min');
console.log('Expires: 1 year from now');
console.log('='.repeat(60));
console.log('⚠️  IMPORTANT: Save this API key securely!');
console.log('⚠️  It will not be shown again.');
console.log('='.repeat(60));
```

Run:
```bash
npx ts-node scripts/generate-api-key.ts
```

---

## 🧪 Testing the Installation

### Test 1: Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-09-13T12:00:00.000Z"
}
```

### Test 2: Rate Limiting

```bash
# Should succeed
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/obfuscate-secure \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $YOUR_API_KEY" \
    -d '{"sourceCode":"print(1)","useAtomicGrade":true}'
done

# 11th request should return 429
curl -X POST http://localhost:3000/api/obfuscate-secure \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $YOUR_API_KEY" \
  -d '{"sourceCode":"print(1)","useAtomicGrade":true}'
```

### Test 3: Basic Obfuscation

```bash
curl -X POST http://localhost:3000/api/obfuscate-secure \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $YOUR_API_KEY" \
  -d '{
    "sourceCode": "print(\"Hello, Atomic World!\")",
    "useAtomicGrade": true,
    "config": {
      "targetOutputSizeMb": 1,
      "intensityLevel": "maximum"
    }
  }' | jq .
```

### Test 4: Python Sandbox Security

```bash
# This should FAIL (dangerous import blocked)
curl -X POST http://localhost:3000/api/obfuscate-secure \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $YOUR_API_KEY" \
  -d '{
    "sourceCode": "import subprocess; subprocess.call([\"ls\"])",
    "useAtomicGrade": true
  }'
```

Expected error:
```json
{
  "error": "Obfuscation failed",
  "message": "Security validation failed: Dangerous import detected"
}
```

### Test 5: Run Obfuscated Code

```bash
# Save obfuscated output
curl -X POST http://localhost:3000/api/obfuscate-secure \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $YOUR_API_KEY" \
  -d '{"sourceCode":"print(\"Test successful!\")","useAtomicGrade":true}' \
  | jq -r '.obfuscatedCode' > test_output.py

# Run it
python3 test_output.py
```

Expected output:
```
Test successful!
```

---

## 🔧 Production Deployment

### 1. Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/pyvm
upstream pyvm_backend {
    server 127.0.0.1:3000;
}

server {
    listen 443 ssl http2;
    server_name pyvm.example.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/pyvm.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pyvm.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=pyvm_limit:10m rate=10r/m;
    limit_req zone=pyvm_limit burst=5 nodelay;

    # Proxy Configuration
    location / {
        proxy_pass http://pyvm_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;

        # Size limits
        client_max_body_size 1M;
    }

    # API specific limits
    location /api/obfuscate {
        limit_req zone=pyvm_limit burst=2 nodelay;
        proxy_pass http://pyvm_backend;
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://pyvm_backend;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name pyvm.example.com;
    return 301 https://$server_name$request_uri;
}
```

### 2. Systemd Service

```ini
# /etc/systemd/system/pyvm.service
[Unit]
Description=PyVM Atomic Grade Obfuscator
After=network.target

[Service]
Type=simple
User=pyvm
Group=pyvm
WorkingDirectory=/opt/pyvm
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/node dist/src/main.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

# Security hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/pyvm/logs

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable pyvm
sudo systemctl start pyvm
sudo systemctl status pyvm
```

### 3. Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Install Python for sandbox
RUN apk add --no-cache python3 py3-pip && \
    pip3 install pycryptodome

# Create non-root user
RUN addgroup -g 1001 pyvm && \
    adduser -D -u 1001 -G pyvm pyvm

# Copy built files
COPY --from=builder --chown=pyvm:pyvm /app/dist ./dist
COPY --from=builder --chown=pyvm:pyvm /app/node_modules ./node_modules
COPY --from=builder --chown=pyvm:pyvm /app/package*.json ./

# Create logs directory
RUN mkdir -p logs && chown pyvm:pyvm logs

USER pyvm

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); });"

CMD ["node", "dist/src/main.js"]
```

Docker Compose:
```yaml
# docker-compose.yml
version: '3.8'

services:
  pyvm:
    build: .
    container_name: pyvm-atomic
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - LOG_LEVEL=info
    volumes:
      - ./logs:/app/logs
      - ./config:/app/config:ro
    networks:
      - pyvm-network
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 512M
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE

networks:
  pyvm-network:
    driver: bridge
```

Run:
```bash
docker-compose up -d
docker-compose logs -f pyvm
```

---

## 📊 Monitoring & Logging

### 1. Log Files

```bash
# View logs
tail -f logs/combined.log
tail -f logs/error.log

# Search for security events
grep "Security event" logs/combined.log

# Performance metrics
grep "Performance metric" logs/combined.log | \
  jq '.durationMs' | \
  awk '{sum+=$1; count++} END {print "Average:", sum/count, "ms"}'
```

### 2. Prometheus Metrics (Optional)

```typescript
// Add to main.ts
import { register, Counter, Histogram } from 'prom-client';

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
});

const obfuscationCounter = new Counter({
  name: 'obfuscations_total',
  help: 'Total number of obfuscation requests',
  labelNames: ['status', 'atomic_grade'],
});

// Expose metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### 3. Health Monitoring Script

```bash
#!/bin/bash
# monitor.sh

API_KEY="your-api-key-here"
ENDPOINT="http://localhost:3000"

while true; do
  # Health check
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" $ENDPOINT/health)
  
  if [ $STATUS -eq 200 ]; then
    echo "[$(date)] ✓ Service healthy"
  else
    echo "[$(date)] ✗ Service unhealthy (HTTP $STATUS)"
    # Send alert (email, Slack, PagerDuty, etc.)
  fi
  
  # Test obfuscation
  RESPONSE=$(curl -s -X POST $ENDPOINT/api/obfuscate-secure \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -d '{"sourceCode":"print(1)","useAtomicGrade":true}')
  
  if echo "$RESPONSE" | jq -e '.obfuscatedCode' > /dev/null 2>&1; then
    echo "[$(date)] ✓ Obfuscation working"
  else
    echo "[$(date)] ✗ Obfuscation failed"
    echo "$RESPONSE" | jq .
  fi
  
  sleep 60
done
```

---

## 🔒 Security Hardening Checklist

### Server Level

- [ ] Change default SSH port
- [ ] Disable root login
- [ ] Configure firewall (UFW/iptables)
- [ ] Enable fail2ban
- [ ] Set up automatic security updates
- [ ] Configure log rotation
- [ ] Enable SELinux/AppArmor

### Application Level

- [ ] Change default encryption key
- [ ] Generate unique API keys
- [ ] Configure rate limits per use case
- [ ] Set up SSL/TLS certificates
- [ ] Enable HSTS
- [ ] Configure CSP headers
- [ ] Set up log aggregation
- [ ] Configure backup strategy

### Monitoring

- [ ] Set up uptime monitoring
- [ ] Configure log alerts
- [ ] Monitor rate limit violations
- [ ] Track error rates
- [ ] Monitor resource usage
- [ ] Set up security event alerts

---

## 🐛 Troubleshooting

### Issue: "PyCryptodome not found"

```bash
# Install PyCryptodome
pip install pycryptodome

# Or use Cryptodome
pip install pycryptodomex
```

### Issue: "Permission denied" errors

```bash
# Fix permissions
sudo chown -R pyvm:pyvm /opt/pyvm
sudo chmod -R 755 /opt/pyvm

# Fix log directory
sudo mkdir -p /opt/pyvm/logs
sudo chown pyvm:pyvm /opt/pyvm/logs
```

### Issue: Rate limit too restrictive

Edit `src/server/services/rate-limit.service.ts`:
```typescript
obfuscate: { requests: 100, windowMs: 60000 }, // 100 req/min instead of 10
```

### Issue: Sandbox timeout

Increase timeout in `.env`:
```
SANDBOX_MAX_EXECUTION_TIME_MS=10000
```

### Issue: High memory usage

Reduce max memory in sandbox:
```
SANDBOX_MAX_MEMORY_MB=256
```

---

## 📚 Additional Resources

- **Documentation:** See `SECURITY_IMPROVEMENTS.md`
- **Security Audit:** See `SECURITY_REVIEW.md`
- **API Reference:** (Coming soon)
- **GitHub Issues:** Report bugs
- **Security:** security@pyvm.example.com

---

## 🎉 Success!

Your Atomic Grade PyVM installation is complete. You now have:

✅ Enterprise-grade obfuscation with AES-256-GCM  
✅ Sandboxed Python execution  
✅ API key authentication  
✅ Rate limiting  
✅ Comprehensive logging  
✅ Production-ready deployment  

**Next steps:**
1. Generate API keys for your users
2. Configure monitoring and alerts
3. Set up backup strategy
4. Review security hardening checklist
5. Run load tests

---

**Document Version:** 1.0  
**Last Updated:** 2026-09-13
