# 🚀 Postiz Deployment Guide

## Quick Start (Docker Compose - Recommended)

### 1. **Prerequisites**
- Server with Docker and Docker Compose installed
- Domain name pointing to your server
- At least 2GB RAM, 2 vCPUs recommended

### 2. **Deploy with Docker Compose**

```bash
# 1. Create deployment directory
mkdir postiz-deployment && cd postiz-deployment

# 2. Copy the docker-compose.production.yml file to docker-compose.yml
cp docker-compose.production.yml docker-compose.yml

# 3. Edit the environment variables
nano docker-compose.yml
# Replace:
# - postiz.yourdomain.com with your actual domain
# - JWT_SECRET with a long random string

# 4. Start the services
docker compose up -d

# 5. Check logs
docker compose logs -f postiz
```

### 3. **Important Configuration Changes**

**In `docker-compose.yml`, update these values:**
```yaml
MAIN_URL: "https://yourdomain.com"
FRONTEND_URL: "https://yourdomain.com"
NEXT_PUBLIC_BACKEND_URL: "https://yourdomain.com/api"
JWT_SECRET: "your-very-long-random-secret-key-here"
```

**For HTTP-only deployment (development):**
```yaml
NOT_SECURED: "true"  # Uncomment this line
```

### 4. **Set Up Reverse Proxy (HTTPS)**

**Option A: Caddy (Recommended)**
```bash
# Install Caddy
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy

# Create Caddyfile
sudo nano /etc/caddy/Caddyfile
```

**Caddyfile content:**
```
yourdomain.com {
    reverse_proxy localhost:5000
}
```

```bash
# Start Caddy
sudo systemctl reload caddy
```

**Option B: Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL configuration (use Let's Encrypt)
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Alternative Hosting Options

### 🏗️ **Custom Build & Deploy**

If you want to build from source:

```bash
# 1. Clone repository
git clone https://github.com/gitroomhq/postiz-app.git
cd postiz-app

# 2. Build Docker image
docker build -f Dockerfile.dev -t postiz-custom .

# 3. Update docker-compose.yml to use custom image
# Replace: image: ghcr.io/gitroomhq/postiz-app:latest
# With:    image: postiz-custom
```

### ☁️ **Cloud Platform Deployment**

**Railway:**
1. Connect GitHub repository
2. Add environment variables from docker-compose.yml
3. Deploy automatically

**Render:**
1. Create new web service
2. Connect repository
3. Set build command: `docker build -f Dockerfile.dev .`
4. Add environment variables

**DigitalOcean App Platform:**
1. Create new app from GitHub
2. Use Docker configuration
3. Add environment variables

### 🎯 **VPS Deployment (DigitalOcean, AWS, etc.)**

```bash
# 1. Create VPS with Ubuntu 22.04
# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Install Docker Compose
sudo apt update
sudo apt install docker-compose-plugin

# 4. Follow Docker Compose steps above
```

---

## Configuration Options

### 📧 **Email Configuration (Optional)**
```yaml
EMAIL_PROVIDER: "resend"  # or "nodemailer"
RESEND_API_KEY: "re_your_api_key"
# OR for SMTP:
EMAIL_HOST: "smtp.gmail.com"
EMAIL_PORT: "587"
EMAIL_USER: "your-email@gmail.com"
EMAIL_PASS: "your-app-password"
```

### 📁 **File Storage**
```yaml
# Local storage (default)
STORAGE_PROVIDER: "local"

# OR Cloudflare R2
STORAGE_PROVIDER: "cloudflare"
CLOUDFLARE_ACCOUNT_ID: "your-account-id"
CLOUDFLARE_ACCESS_KEY: "your-access-key"
CLOUDFLARE_SECRET_ACCESS_KEY: "your-secret-key"
CLOUDFLARE_BUCKETNAME: "postiz-uploads"
```

### 🔗 **Social Media Integration**
```yaml
# Add these to enable social platforms
X_API_KEY: "your-x-api-key"
X_API_SECRET: "your-x-api-secret"
LINKEDIN_CLIENT_ID: "your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET: "your-linkedin-client-secret"
REDDIT_CLIENT_ID: "your-reddit-client-id"
REDDIT_CLIENT_SECRET: "your-reddit-client-secret"
# ... and many more
```

---

## Maintenance Commands

```bash
# Update to latest version
docker compose pull
docker compose up -d

# View logs
docker compose logs -f postiz

# Backup database
docker exec postiz-postgres pg_dump -U postiz-user postiz-db-local > backup.sql

# Restore database
docker exec -i postiz-postgres psql -U postiz-user postiz-db-local < backup.sql

# Stop services
docker compose down

# Remove everything (DANGER!)
docker compose down -v
```

---

## Troubleshooting

### Common Issues:

1. **Port 5000 already in use:**
   ```bash
   # Change port in docker-compose.yml
   ports:
     - 5001:5000  # Use 5001 instead
   ```

2. **SSL/HTTPS issues:**
   ```yaml
   # Add this for HTTP-only
   NOT_SECURED: "true"
   ```

3. **Database connection errors:**
   ```bash
   # Check if containers are running
   docker compose ps
   
   # Check logs
   docker compose logs postiz-postgres
   ```

### Getting Help:
- [Official Documentation](https://docs.postiz.com)
- [Discord Community](https://discord.postiz.com)
- [GitHub Issues](https://github.com/gitroomhq/postiz-app/issues)

---

## Security Notes

1. **Change default passwords** in docker-compose.yml
2. **Use HTTPS** in production
3. **Set `DISABLE_REGISTRATION: "true"`** after creating your account
4. **Regular backups** of database and uploads
5. **Keep Docker images updated**

Happy hosting! 🎉 