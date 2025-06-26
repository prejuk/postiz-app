# 🌊 DigitalOcean Setup for Postiz (schedule.andevergreen.com)

## Step 1: Create DigitalOcean Droplet

### 1.1 Create Account & Droplet
1. Go to [DigitalOcean](https://digitalocean.com)
2. Create account (use this link for $200 credit: https://m.do.co/c/your-referral)
3. Click **"Create"** → **"Droplets"**

### 1.2 Droplet Configuration
```
OS: Ubuntu 22.04 LTS
Plan: Basic
CPU: Regular Intel
Size: $12/month (2GB RAM, 1 vCPU, 50GB SSD) - Recommended minimum
      $24/month (4GB RAM, 2 vCPU, 80GB SSD) - Better performance

Datacenter: Choose closest to your users
Authentication: SSH Key (recommended) or Password
```

### 1.3 Add SSH Key (Recommended)
```bash
# On your local machine, generate SSH key if you don't have one
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Copy public key
cat ~/.ssh/id_rsa.pub
```
- Paste the public key in DigitalOcean's SSH Key field

## Step 2: Connect to Your Droplet

```bash
# SSH into your droplet (replace IP with your droplet's IP)
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y
```

## Step 3: Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Start Docker service
systemctl start docker
systemctl enable docker

# Test Docker
docker --version
docker compose version
```

## Step 4: Deploy Postiz

```bash
# Create deployment directory
mkdir /opt/postiz && cd /opt/postiz

# Create docker-compose.yml file
nano docker-compose.yml
```

**Paste this content:**
```yaml
services:
  postiz:
    image: ghcr.io/gitroomhq/postiz-app:latest
    container_name: postiz
    restart: always
    environment:
      MAIN_URL: "https://schedule.andevergreen.com"
      FRONTEND_URL: "https://schedule.andevergreen.com"
      NEXT_PUBLIC_BACKEND_URL: "https://schedule.andevergreen.com/api"
      JWT_SECRET: "your-super-secret-jwt-key-change-this-to-something-long-and-random-$(openssl rand -hex 32)"
      
      DATABASE_URL: "postgresql://postiz-user:postiz-password@postiz-postgres:5432/postiz-db-local"
      REDIS_URL: "redis://postiz-redis:6379"
      BACKEND_INTERNAL_URL: "http://localhost:3000"
      
      IS_GENERAL: "true"
      DISABLE_REGISTRATION: "false"
      
      STORAGE_PROVIDER: "local"
      UPLOAD_DIRECTORY: "/uploads"
      NEXT_PUBLIC_UPLOAD_DIRECTORY: "/uploads"
    volumes:
      - postiz-config:/config/
      - postiz-uploads:/uploads/
    ports:
      - 5000:5000
    networks:
      - postiz-network
    depends_on:
      postiz-postgres:
        condition: service_healthy
      postiz-redis:
        condition: service_healthy

  postiz-postgres:
    image: postgres:17-alpine
    container_name: postiz-postgres
    restart: always
    environment:
      POSTGRES_PASSWORD: postiz-password
      POSTGRES_USER: postiz-user
      POSTGRES_DB: postiz-db-local
    volumes:
      - postgres-volume:/var/lib/postgresql/data
    networks:
      - postiz-network
    healthcheck:
      test: pg_isready -U postiz-user -d postiz-db-local
      interval: 10s
      timeout: 3s
      retries: 3

  postiz-redis:
    image: redis:7.2
    container_name: postiz-redis
    restart: always
    healthcheck:
      test: redis-cli ping
      interval: 10s
      timeout: 3s
      retries: 3
    volumes:
      - postiz-redis-data:/data
    networks:
      - postiz-network

volumes:
  postgres-volume:
  postiz-redis-data:
  postiz-config:
  postiz-uploads:

networks:
  postiz-network:
```

```bash
# Start the application
docker compose up -d

# Check logs
docker compose logs -f postiz
```

## Step 5: Install & Configure Caddy (for HTTPS)

```bash
# Install Caddy
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install caddy

# Create Caddyfile
nano /etc/caddy/Caddyfile
```

**Caddyfile content:**
```
schedule.andevergreen.com {
    reverse_proxy localhost:5000
}
```

```bash
# Start Caddy
systemctl reload caddy
systemctl enable caddy

# Check Caddy status
systemctl status caddy
```

## Step 6: Configure Firewall

```bash
# Install UFW firewall
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable
```

## Step 7: Configure DNS (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your `andevergreen.com` domain
3. Go to **DNS** tab
4. Add new record:
   ```
   Type: A
   Name: schedule
   Value: YOUR_DROPLET_IP_ADDRESS
   TTL: 3600
   ```
5. Save the record

## Step 8: Test Your Deployment

1. Wait 5-10 minutes for DNS propagation
2. Visit: `https://schedule.andevergreen.com`
3. You should see Postiz login page
4. Create your account
5. Set `DISABLE_REGISTRATION: "true"` in docker-compose.yml after registering

## Maintenance Commands

```bash
# View logs
docker compose logs -f postiz

# Update Postiz
cd /opt/postiz
docker compose pull
docker compose up -d

# Backup database
docker exec postiz-postgres pg_dump -U postiz-user postiz-db-local > /opt/postiz-backup-$(date +%Y%m%d).sql

# Monitor system resources
htop
df -h
```

## Costs
- **$12/month** for basic droplet (2GB RAM)
- **Domain**: Already covered (Vercel)
- **SSL**: Free with Caddy + Let's Encrypt

Total: **~$12/month** 🎉 