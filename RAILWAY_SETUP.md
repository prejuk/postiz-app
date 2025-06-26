# 🚂 Railway Setup for Postiz (schedule.andevergreen.com)

## Why Railway?
- **Super easy deployment** from GitHub
- **Automatic HTTPS**
- **Built-in database** (PostgreSQL & Redis)
- **Zero-config Docker deployment**
- **Free tier available** ($5/month for hobby plan)

## Step 1: Fork & Prepare Repository

### 1.1 Fork the Repository
1. Go to [Postiz GitHub](https://github.com/gitroomhq/postiz-app)
2. Click **"Fork"** → Create fork to your account

### 1.2 Clone Your Fork Locally
```bash
git clone https://github.com/YOUR_USERNAME/postiz-app.git
cd postiz-app
```

### 1.3 Add Railway Configuration
Create `railway.toml` in the root:
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile.dev"

[deploy]
startCommand = "pnpm run pm2"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### 1.4 Create Environment Template
Create `.env.railway` file:
```env
MAIN_URL=https://schedule.andevergreen.com
FRONTEND_URL=https://schedule.andevergreen.com
NEXT_PUBLIC_BACKEND_URL=https://schedule.andevergreen.com/api
JWT_SECRET=your-very-long-random-secret-key-here
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
BACKEND_INTERNAL_URL=http://localhost:3000
IS_GENERAL=true
DISABLE_REGISTRATION=false
STORAGE_PROVIDER=local
UPLOAD_DIRECTORY=/uploads
NEXT_PUBLIC_UPLOAD_DIRECTORY=/uploads
```

```bash
# Commit changes
git add .
git commit -m "Add Railway configuration"
git push origin main
```

## Step 2: Deploy on Railway

### 2.1 Create Railway Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Connect your GitHub account

### 2.2 Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your forked `postiz-app` repository
4. Click **"Deploy"**

### 2.3 Add Database Services
1. In your Railway project dashboard
2. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Click **"+ New"** → **"Database"** → **"Add Redis"**

## Step 3: Configure Environment Variables

### 3.1 Set Environment Variables
1. Click on your **Postiz service** (main app)
2. Go to **"Variables"** tab
3. Add these variables:

```
MAIN_URL=https://schedule.andevergreen.com
FRONTEND_URL=https://schedule.andevergreen.com
NEXT_PUBLIC_BACKEND_URL=https://schedule.andevergreen.com/api
JWT_SECRET=your-super-secret-jwt-key-change-this-$(openssl rand -hex 32)
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
BACKEND_INTERNAL_URL=http://localhost:3000
IS_GENERAL=true
DISABLE_REGISTRATION=false
STORAGE_PROVIDER=local
UPLOAD_DIRECTORY=/uploads
NEXT_PUBLIC_UPLOAD_DIRECTORY=/uploads
PORT=5000
```

**Important**: Railway auto-connects databases with `${{Postgres.DATABASE_URL}}` and `${{Redis.REDIS_URL}}`

### 3.2 Deploy Latest Changes
1. Go to **"Deployments"** tab
2. Click **"Redeploy"**
3. Wait for deployment to complete

## Step 4: Get Railway Domain

### 4.1 Get Railway URL
1. In your Railway project dashboard
2. Click on your **Postiz service**
3. Go to **"Settings"** tab
4. Copy the **Railway domain** (something like `postiz-app-production-xyz.up.railway.app`)

## Step 5: Configure Custom Domain

### 5.1 Add Custom Domain in Railway
1. In Railway project → **Postiz service** → **"Settings"**
2. Scroll to **"Domains"** section
3. Click **"Custom Domain"**
4. Enter: `schedule.andevergreen.com`
5. Railway will show you a **CNAME target**

### 5.2 Configure DNS in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on `andevergreen.com` domain
3. Go to **"DNS"** tab
4. Add new record:
   ```
   Type: CNAME
   Name: schedule
   Value: [Railway CNAME target from step 5.1]
   TTL: 3600
   ```
5. Save the record

## Step 6: Test Your Deployment

1. Wait 5-10 minutes for DNS propagation
2. Visit: `https://schedule.andevergreen.com`
3. You should see Postiz login page
4. Create your account
5. Update environment variable: `DISABLE_REGISTRATION=true`

## Step 7: Optional - Add Social Media Integrations

Add these to Railway environment variables:

```
# Twitter/X
X_API_KEY=your-x-api-key
X_API_SECRET=your-x-api-secret

# LinkedIn
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Reddit
REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_CLIENT_SECRET=your-reddit-client-secret

# Add more as needed...
```

## Costs & Scaling

### Railway Pricing:
- **Free Tier**: $0/month (limited usage)
- **Hobby Plan**: $5/month per service
- **Pro Plan**: Usage-based pricing

### Estimated Monthly Cost:
```
Postiz App: $5/month
PostgreSQL: $5/month
Redis: $5/month
Total: ~$15/month
```

## Maintenance

### Update Postiz:
1. Go to Railway dashboard
2. Click **"Redeploy"** to get latest version

### View Logs:
1. Railway dashboard → Postiz service
2. Click **"Logs"** tab

### Scale Up:
1. Railway dashboard → Postiz service → **"Settings"**
2. Increase memory/CPU if needed

## Troubleshooting

### Common Issues:

1. **Build Fails:**
   ```bash
   # Check your Dockerfile.dev exists
   # Ensure railway.toml is in root directory
   ```

2. **Database Connection:**
   ```bash
   # Make sure DATABASE_URL variable uses: ${{Postgres.DATABASE_URL}}
   # Same for Redis: ${{Redis.REDIS_URL}}
   ```

3. **Custom Domain Not Working:**
   ```bash
   # Check CNAME record in Vercel DNS
   # Wait up to 24 hours for full propagation
   # Verify Railway shows domain as "Active"
   ```

## Benefits of Railway vs DigitalOcean:

| Feature | Railway | DigitalOcean |
|---------|---------|--------------|
| **Setup Time** | 5 minutes | 30+ minutes |
| **Auto-scaling** | ✅ Built-in | ❌ Manual |
| **Managed DB** | ✅ Included | ❌ DIY |
| **Auto HTTPS** | ✅ Free | ❌ Setup required |
| **Cost** | ~$15/month | ~$12/month |
| **Maintenance** | ✅ Zero | ❌ Manual updates |

Railway is perfect if you want **zero maintenance** and don't mind paying a bit more! 🚂✨ 