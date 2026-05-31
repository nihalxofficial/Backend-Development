# Running Your Projects in Docker
**Node.js · React · Next.js · TypeScript · Golang Fiber**

---

## How It Works (Simple Explanation)

```
Your Project Folder
      ↓
  Dockerfile  ← instructions for Docker
      ↓
  Docker builds an Image
      ↓
  Docker runs a Container  ← your app runs here
```

---

## PART 1 — Node.js / Express (Backend)

### Project Structure
```
my-express-app/
├── src/
│   └── index.js
├── package.json
└── Dockerfile        ← you create this
```

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]
```

### Commands to Build & Run
```bash
# Build the image
docker build -t my-express-app .

# Run the container
docker run -d -p 3000:3000 --name express-app my-express-app

# Open in browser
http://localhost:3000
```

---

## PART 2 — Node.js / Express with TypeScript

### Project Structure
```
my-ts-app/
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
└── Dockerfile
```

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### Commands to Build & Run
```bash
# Build the image
docker build -t my-ts-app .

# Run the container
docker run -d -p 3000:3000 --name ts-app my-ts-app

# Open in browser
http://localhost:3000
```

---

## PART 3 — React (Frontend)

### Project Structure
```
my-react-app/
├── src/
├── public/
├── package.json
└── Dockerfile
```

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
```

### Commands to Build & Run
```bash
# Build the image
docker build -t my-react-app .

# Run the container
docker run -d -p 5173:5173 --name react-app my-react-app

# Open in browser
http://localhost:5173
```

---

## PART 4 — Next.js

### Project Structure
```
my-nextjs-app/
├── app/
├── public/
├── package.json
├── next.config.js
└── Dockerfile
```

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Commands to Build & Run
```bash
# Build the image
docker build -t my-nextjs-app .

# Run the container
docker run -d -p 3000:3000 --name nextjs-app my-nextjs-app

# Open in browser
http://localhost:3000
```

---

## PART 5 — Golang Fiber (Backend)

### Project Structure
```
my-fiber-app/
├── main.go
├── go.mod
├── go.sum
└── Dockerfile
```

### Dockerfile
```dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o main .

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]
```

### Commands to Build & Run
```bash
# Build the image
docker build -t my-fiber-app .

# Run the container
docker run -d -p 8080:8080 --name fiber-app my-fiber-app

# Open in browser
http://localhost:8080
```

---

## PART 6 — Client + Server Together (Docker Compose)

Run your **Next.js frontend + Golang Fiber backend** together with one command.

### Project Structure
```
my-project/
├── client/          ← Next.js or React
│   └── Dockerfile
├── server/          ← Golang Fiber or Express
│   └── Dockerfile
└── docker-compose.yml   ← you create this
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  server:
    build: ./server
    container_name: backend
    ports:
      - "8080:8080"
    networks:
      - mynetwork

  client:
    build: ./client
    container_name: frontend
    ports:
      - "3000:3000"
    depends_on:
      - server
    networks:
      - mynetwork

networks:
  mynetwork:
    driver: bridge
```

### Commands to Run Everything
```bash
# Start both client and server together
docker compose up -d

# Stop everything
docker compose down

# Rebuild after code changes
docker compose up -d --build

# See logs of all services
docker compose logs -f

# See logs of one service only
docker compose logs -f server
docker compose logs -f client
```

---

## PART 7 — Live Code Reload (Dev Mode)

See your code changes instantly without rebuilding — mount your project folder into the container.

### For Node.js / Express / Next.js
```bash
docker run -d \
  -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  --name my-app \
  my-app-image
```

### For Golang Fiber (using Air for live reload)
Add this to your Dockerfile for dev:
```dockerfile
RUN go install github.com/cosmtrek/air@latest
CMD ["air"]
```

---

## PART 8 — Environment Variables (.env)

### Pass env file to container
```bash
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name my-app \
  my-app-image
```

### In docker-compose.yml
```yaml
services:
  server:
    build: ./server
    env_file:
      - .env
    ports:
      - "8080:8080"
```

---

## PART 9 — Most Used Commands for Your Projects

| Task | Command |
|---|---|
| Build image | `docker build -t appname .` |
| Run container | `docker run -d -p 3000:3000 --name appname appname` |
| Stop container | `docker stop appname` |
| Restart container | `docker restart appname` |
| See running apps | `docker ps` |
| See app logs | `docker logs -f appname` |
| Go inside container | `docker exec -it appname sh` |
| Delete container | `docker rm appname` |
| Delete image | `docker rmi appname` |
| Run all services | `docker compose up -d` |
| Stop all services | `docker compose down` |
| Rebuild after changes | `docker compose up -d --build` |

---

## PART 10 — Common Mistakes & Fixes

| Problem | Fix |
|---|---|
| Port already in use | Change port: `-p 3001:3000` |
| Code changes not showing | Rebuild: `docker build -t appname .` |
| Container keeps stopping | Check logs: `docker logs appname` |
| Can't connect client to server | Use service name in URL: `http://server:8080` not `localhost` |
| node_modules missing | Add `-v /app/node_modules` when mounting volume |

---

*One Dockerfile per service. One docker-compose.yml to run them all together.*
