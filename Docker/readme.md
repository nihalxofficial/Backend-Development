# 🐳 Docker Beginner Guide

> A simple, clear guide for beginners — from installation to running real projects.

---

## 📋 Table of Contents

- [What is Docker?](#what-is-docker)
- [Setup (Windows)](#setup-windows)
- [Ubuntu — After Manual Install](#ubuntu--after-manual-install)
- [Essential Commands](#essential-commands)
- [Images — Pull from Docker Hub](#images)
- [Dockerfile — Build Your Own Image](#dockerfile--build-your-own-image)
- [Containers](#containers)
- [Docker Compose](#docker-compose)
- [WSL Commands](#wsl-commands)
- [Error Fixing](#error-fixing)

---

## 🤔 What is Docker?

| Term | Simple Meaning |
|---|---|
| **Image** | A blueprint / recipe (read-only) |
| **Container** | A running instance of an image (like a live app) |
| **Dockerfile** | Instructions to build your own image |
| **Docker Compose** | Tool to run multiple containers together |
| **Volume** | Persistent storage for containers |
| **Network** | How containers talk to each other |

> 🧠 Think of an **image** as a cake recipe and a **container** as the actual baked cake.

---

## ⚙️ Setup (Windows)

> Docker is installed manually from the website. Follow these steps after installing Docker Desktop.

### Step 1 — Download & Install
👉 Go to https://www.docker.com/products/docker-desktop and download **Docker Desktop for Windows**.

Run the installer and follow the steps. It will ask to enable **WSL 2** — click **Yes**.

### Step 2 — Enable WSL 2
Open **PowerShell as Administrator** and run:

```powershell
# Install WSL
wsl --install

# Set WSL 2 as default
wsl --set-default-version 2

# Install Ubuntu from Microsoft Store or via command
wsl --install -d Ubuntu
```

Restart your PC after this.

### Step 3 — Start Docker Desktop
Open **Docker Desktop** from the Start menu. Wait until the whale icon in the taskbar stops animating — Docker is ready.

### Step 4 — Verify Everything Works
Open **Windows Terminal** or **PowerShell**:

```bash
docker --version
docker compose version
docker run hello-world
```

If you see `Hello from Docker!` — you're all set. ✅

---

## 🐧 Ubuntu — After Manual Install

> Docker is already installed from the website. Do these steps once to set it up properly.

```bash
# Check Docker service is running
sudo systemctl status docker

# Start Docker service (if not running)
sudo systemctl start docker

# Enable Docker to auto-start on boot
sudo systemctl enable docker

# Run Docker without sudo (do this once — very useful!)
sudo usermod -aG docker $USER
newgrp docker

# Verify Docker works without sudo
docker ps
docker run hello-world
```

### Useful Ubuntu + Docker Commands
```bash
# Check Docker disk usage
du -sh /var/lib/docker

# View Docker system logs
sudo journalctl -u docker.service

# Check Docker socket permissions
ls -la /var/run/docker.sock

# Free up disk space
docker system prune -a --volumes
```

---

## 🔧 Essential Commands

### System Info
```bash
docker version          # Docker version details
docker info             # System-wide info
docker stats            # Live resource usage of all running containers
docker system df        # Disk usage by Docker
```

### Cleanup
```bash
docker system prune             # Remove stopped containers, unused images & networks
docker system prune -a          # Also removes unused images (more aggressive)
docker system prune --volumes   # Also removes unused volumes
```

---

## 🖼️ Images

> All images are pulled from **Docker Hub** → https://hub.docker.com
> Search for any image there, copy the name, and use it with `docker pull`.

### Pull an Image from Docker Hub
```bash
# Syntax
docker pull <image-name>              # pulls latest tag by default
docker pull <image-name>:<tag>        # pulls a specific version

# Examples
docker pull nginx                     # latest nginx
docker pull nginx:1.25                # specific nginx version
docker pull ubuntu:22.04              # Ubuntu 22.04
docker pull node:18-alpine            # Node.js Alpine (lightweight)
docker pull postgres:15               # PostgreSQL 15
docker pull mysql:8                   # MySQL 8
docker pull mongo:6                   # MongoDB 6
docker pull redis:7                   # Redis 7
```

> 🧠 Tags like `:alpine`, `:slim` are smaller images. `:latest` is the default if you don't specify a tag.

### List Images
```bash
docker images                   # Show all local images
docker images -a                # Show all including intermediate images
docker image ls                 # Same as docker images
```

### Remove Images
```bash
docker rmi nginx                        # Remove image by name
docker rmi abc123                       # Remove by image ID
docker rmi $(docker images -q)          # Remove ALL images
docker image prune                      # Remove dangling (unused) images
docker image prune -a                   # Remove all unused images
```

### Search & Inspect
```bash
docker search nginx             # Search Docker Hub from terminal
docker search --limit 5 node    # Show top 5 results
docker inspect nginx            # Full details about the image
docker history nginx            # Layer-by-layer build history
```

---

## 📦 Containers

### Run a Container
```bash
# Basic run
docker run nginx

# Run in background (detached)
docker run -d nginx

# Run with a name
docker run -d --name myapp nginx

# Run with port mapping  →  host_port:container_port
docker run -d -p 8080:80 nginx
# Now visit → http://localhost:8080

# Run with environment variable
docker run -d -e MYSQL_ROOT_PASSWORD=secret mysql

# Run interactively (go inside the container)
docker run -it ubuntu bash

# Run and auto-remove when stopped
docker run --rm ubuntu echo "Hello Docker"

# Run with volume mount  →  host_path:container_path
docker run -d -v /my/local/folder:/app nginx
```

### List Containers
```bash
docker ps                       # Running containers only
docker ps -a                    # All containers (including stopped)
docker ps -q                    # Only container IDs
```

### Start / Stop / Restart
```bash
docker start myapp              # Start a stopped container
docker stop myapp               # Gracefully stop
docker restart myapp            # Restart
docker kill myapp               # Force stop immediately
```

### Remove Containers
```bash
docker rm myapp                         # Remove stopped container
docker rm -f myapp                      # Force remove (even if running)
docker rm $(docker ps -aq)              # Remove ALL containers
docker container prune                  # Remove all stopped containers
```

### Interact with Running Containers
```bash
# Go inside a running container
docker exec -it myapp bash
docker exec -it myapp sh           # Use sh if bash is not available

# Run a single command inside container
docker exec myapp ls /app

# View logs
docker logs myapp
docker logs -f myapp               # Follow logs in real time
docker logs --tail 50 myapp        # Last 50 lines only

# Copy files between host and container
docker cp myapp:/app/file.txt ./   # Container → Host
docker cp ./file.txt myapp:/app/   # Host → Container

# View container details
docker inspect myapp

# View live resource usage
docker stats myapp
```

---

## 🏗️ Dockerfile — Build Your Own Image

> Before running a container, you need an image. You either **pull** one from Docker Hub (covered above) or **build** your own using a `Dockerfile`.

### What is a Dockerfile?
A `Dockerfile` is a plain text file with step-by-step instructions to build your image. You put it inside your project folder.

### Common Dockerfile Instructions

| Instruction | Meaning |
|---|---|
| `FROM` | Base image to start from |
| `WORKDIR` | Set working directory inside container |
| `COPY` | Copy files from host to container |
| `ADD` | Like COPY but also supports URLs and tar extraction |
| `RUN` | Run a command during build |
| `ENV` | Set environment variable |
| `EXPOSE` | Document which port the app uses |
| `CMD` | Default command to run when container starts |
| `ENTRYPOINT` | Like CMD but harder to override |
| `ARG` | Build-time variable (not available at runtime) |
| `VOLUME` | Create a mount point |

### Server Dockerfile (Node.js / Express)

```dockerfile
# 1. Start from Node.js 24 base image (pulled from Docker Hub)
FROM node:24-alpine

# 2. Set working directory inside the container
WORKDIR /app

# 3. Copy package files first (so Docker caches this layer)
COPY package.json package-lock.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the source code
COPY . .

# 6. Expose the port your server runs on
EXPOSE 5000

# 7. Start the server
CMD ["node", "index.js"]
```

### Client Dockerfile (Next.js)

```dockerfile
# 1. Start from Node.js 24 base image (pulled from Docker Hub)
FROM node:24-alpine

# 2. Set working directory inside the container
WORKDIR /app

# 3. Copy package files first (so Docker caches this layer)
COPY package.json package-lock.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the source code
COPY . .

# 6. Expose Next.js default port
EXPOSE 3000

# 7. Start the Next.js dev server
ENTRYPOINT [ "npm", "run", "dev" ]
```

### Build Commands
```bash
# Build from current directory (. = use Dockerfile here)
docker build -t myapp .

# Build with a version tag
docker build -t myapp:1.0 .

# Build from a specific Dockerfile location
docker build -f path/to/Dockerfile -t myapp .

# Build without cache (fresh build from scratch)
docker build --no-cache -t myapp .
```

### Run Your Built Image
```bash
# Run server — loads environment variables from .env
docker run -d -p 5000:5000 --name server --env-file .env server

# Run client — loads environment variables from .env.local
docker run -d -p 3000:3000 --name client --env-file .env.local client
```

### Push Your Image to Docker Hub
```bash
# Login to Docker Hub
docker login

# Tag image with your Docker Hub username
docker tag myapp yourusername/myapp:1.0

# Push to Docker Hub
docker push yourusername/myapp:1.0
```

---

## 🐙 Docker Compose

> Docker Compose lets you run all your services — server, client, database — together with **one command**.

### Project Structure

```
my-project/
├── docker-compose.yml        ← compose file lives at the root
├── server/
│   ├── Dockerfile
│   ├── package.json
│   └── index.js
└── client/
    ├── Dockerfile
    ├── package.json
    └── src/
```

### docker-compose.yml

```yaml
version: '3.8'

services:

  # ── Server (Node.js / Express) ──────────────────
  server:
    build: ./server               # Build using server/Dockerfile
    container_name: server
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USER=admin
      - DB_PASSWORD=secret
      - DB_NAME=mydb
    volumes:
      - ./server:/app             # Live code sync — changes reflect instantly
      - /app/node_modules         # Keep container's node_modules separate
    depends_on:
      - db
    restart: unless-stopped

  # ── Client (React / Vite) ───────────────────────
  client:
    build: ./client               # Build using client/Dockerfile
    container_name: client
    ports:
      - "3000:80"
    volumes:
      - ./client:/app
      - /app/node_modules
    depends_on:
      - server
    restart: unless-stopped

  # ── Database (PostgreSQL) ───────────────────────
  db:
    image: postgres:15            # Pulled directly from Docker Hub
    container_name: db
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: mydb
    volumes:
      - db_data:/var/lib/postgresql/data   # Persist data across restarts
    restart: unless-stopped

  # ── pgAdmin (Database UI) ───────────────────────
  pgadmin:
    image: dpage/pgadmin4         # Pulled from Docker Hub
    container_name: pgadmin
    ports:
      - "5050:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: secret
    depends_on:
      - db
    restart: unless-stopped

volumes:
  db_data:      # Named volume — data survives even if the container is removed
```

> 🧠 Services talk to each other using the **service name** as the hostname.
> From `server`, reach the database at host `db` — not `localhost`.

### Compose Commands
```bash
# Start all services in background
docker compose up -d

# Start and rebuild images (use this after code changes)
docker compose up -d --build

# Stop all services (keeps data)
docker compose down

# Stop and delete volumes too (⚠️ wipes database!)
docker compose down -v

# View logs of all services
docker compose logs

# Follow logs in real time
docker compose logs -f

# Follow logs for one service only
docker compose logs -f server
docker compose logs -f client

# List running services
docker compose ps

# Restart one service
docker compose restart server

# Go inside a running service
docker compose exec server bash
docker compose exec client sh
docker compose exec db psql -U admin -d mydb

# Rebuild only one service
docker compose up -d --build server

# Pull latest images for all services
docker compose pull
```

---

## 🪟 WSL Commands

> WSL = Windows Subsystem for Linux. Docker Desktop on Windows runs through WSL 2.

### Basic WSL Commands
```bash
# List all installed distros
wsl --list --verbose
wsl -l -v                          # Short form

# Set default distro
wsl --set-default Ubuntu

# Open WSL (default distro)
wsl

# Open a specific distro
wsl -d Ubuntu

# Shut down all WSL instances
wsl --shutdown

# Terminate a specific distro
wsl -t Ubuntu

# Check WSL version
wsl --version

# Update WSL
wsl --update
```

### WSL Version Management
```bash
# Set WSL 2 for a specific distro (recommended for Docker)
wsl --set-version Ubuntu 2

# Set WSL 2 as default for all new distros
wsl --set-default-version 2
```

### WSL + Docker Tips
```bash
# Access Windows files from inside WSL
cd /mnt/c/Users/YourName/Documents

# Access WSL files from Windows Explorer
# Type this in Explorer address bar:
\\wsl$\Ubuntu

# Check Docker is working inside WSL
docker ps

# If Docker stops working — restart WSL
wsl --shutdown
# Then reopen Docker Desktop, then WSL terminal
```

---

## 🚨 Error Fixing

### ❌ `permission denied while trying to connect to the Docker daemon`
```bash
# Add your user to the docker group
sudo usermod -aG docker $USER

# Apply without logging out
newgrp docker

# Then verify
docker ps
```

---

### ❌ `port is already allocated` / `bind: address already in use`
```bash
# Find what's using the port (example: 3000)
sudo lsof -i :3000
sudo ss -tulnp | grep 3000

# Kill the process by PID
sudo kill -9 <PID>

# Or just use a different host port
docker run -d -p 3001:3000 myapp
```

---

### ❌ `Cannot connect to the Docker daemon`
```bash
# Start Docker service
sudo systemctl start docker

# Check status
sudo systemctl status docker

# WSL users — restart WSL
wsl --shutdown
# Then reopen Docker Desktop and WSL terminal
```

---

### ❌ `No space left on device`
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything unused at once
docker system prune -a --volumes

# Check actual disk space
df -h
```

---

### ❌ `image not found` / `pull access denied`
```bash
# Search for correct image name
docker search nginx

# Log in for private images
docker login

# Try with full image path
docker pull docker.io/library/nginx:latest
```

---

### ❌ Container exits immediately after starting
```bash
# Check what went wrong
docker logs myapp

# Debug by running interactively
docker run -it myapp bash

# Inspect the container config
docker inspect myapp
```

---

### ❌ `docker compose` command not found
```bash
# Try the older hyphen form
docker-compose up -d

# Install compose plugin (Ubuntu)
sudo apt install docker-compose-plugin

# Verify
docker compose version
```

---

### ❌ WSL — Docker not working after PC restart
```bash
# Step 1: Open Docker Desktop from Windows and wait for it to fully start
# Step 2: In WSL terminal run:
wsl --shutdown
# Step 3: Reopen WSL terminal
docker ps    # Should work now
```

---

### ❌ Containers can't talk to each other
```bash
# List all networks
docker network ls

# Inspect a network
docker network inspect bridge

# Create a custom network
docker network create mynetwork

# Run both containers on the same network
docker run -d --network mynetwork --name app myapp
docker run -d --network mynetwork --name db postgres

# With Docker Compose — services can talk to each other
# using the service name as the hostname automatically
# e.g. from "app", reach "db" at host: db
```

---

## 📌 Quick Cheatsheet

```bash
# ── Images ────────────────────────────────────
docker pull <image>               # Download image
docker images                     # List images
docker rmi <image>                # Remove image
docker build -t <name> .          # Build from Dockerfile

# ── Containers ────────────────────────────────
docker run -d -p 8080:80 <image>  # Run container
docker ps                         # Running containers
docker ps -a                      # All containers
docker stop <name>                # Stop
docker start <name>               # Start
docker rm <name>                  # Remove
docker exec -it <name> bash       # Go inside
docker logs -f <name>             # Follow logs

# ── Compose ───────────────────────────────────
docker compose up -d              # Start all services
docker compose down               # Stop all services
docker compose logs -f            # Follow logs
docker compose exec app bash      # Go inside service

# ── Cleanup ───────────────────────────────────
docker system prune -a            # Remove everything unused
docker volume prune               # Remove unused volumes
```

---

> 💡 **Tip:** Always name your containers with `--name` — working with random IDs is painful.