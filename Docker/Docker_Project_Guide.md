# Running Your Projects in Docker

**Node.js · React · Next.js · TypeScript · Golang Fiber · Prisma**

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
└── Dockerfile
```

### Dockerfile

```dockerfile
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "src/index.js"]
```

### Commands to Build & Run

```bash
docker build -t my-express-app .
docker run -d -p 5000:5000 --name express-app my-express-app
# http://localhost:5000
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
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["node", "dist/index.js"]
```

### Commands to Build & Run

```bash
docker build -t my-ts-app .
docker run -d -p 5000:5000 --name ts-app my-ts-app
# http://localhost:5000
```

---

## PART 2b — Express + TypeScript + Prisma (Backend)

### Project Structure

```
my-ts-prisma-app/
├── src/
│   └── index.ts
├── prisma/
│   └── schema.prisma
├── package.json
├── tsconfig.json
└── Dockerfile
```

### Dockerfile

```dockerfile
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["node", "dist/index.js"]
```

### ⚠️ Critical: package.json build script

Your `build` script must only run `tsc` — **not** `prisma generate`.

```json
// ✅ Correct
"scripts": {
  "build": "tsc"
}

// ❌ Wrong — crashes the Docker build (DATABASE_URL not available at build time)
"scripts": {
  "build": "prisma generate && tsc"
}
```

The Dockerfile already handles `prisma generate` as a separate step before `npm run build`. Running it again inside the build script fails because `DATABASE_URL` is not available during image builds.

### Why this order?

| Step | Why |
|------|-----|
| `RUN npm install` | Installs all dependencies including Prisma CLI |
| `RUN npx prisma generate` | Writes Prisma client into `node_modules/.prisma/client` — no `DATABASE_URL` needed |
| `RUN npm run build` (tsc only) | Compiles TypeScript → `dist/`. Prisma client already exists so imports resolve |
| `npx prisma migrate deploy` (CMD) | Applies pending migrations at container startup when `DATABASE_URL` is available |

> Never use `prisma migrate dev` in Docker — it's interactive and can reset your data.

### Commands to Build & Run

```bash
docker build -t my-ts-prisma-app .

# DATABASE_URL must be in your .env
docker run -d -p 5000:5000 --env-file .env --name ts-prisma-app my-ts-prisma-app
# http://localhost:5000
```

> ⚠️ Never hardcode `DATABASE_URL` in the Dockerfile. Always pass it at runtime with `--env-file .env`.

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
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev", "--", "--host"]
```

### Commands to Build & Run

```bash
docker build -t my-react-app .
docker run -d -p 5000:5000 --name react-app my-react-app
# http://localhost:5000
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
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

### Commands to Build & Run

```bash
docker build -t my-nextjs-app .
docker run -d -p 5000:5000 --name nextjs-app my-nextjs-app
# http://localhost:5000
```

---

## PART 4b — Next.js + Prisma + Better Auth (Frontend)

### Project Structure

```
my-nextjs-prisma-app/
├── app/
├── prisma/
│   └── schema.prisma
├── public/
├── package.json
├── next.config.js
└── Dockerfile
```

### Dockerfile

```dockerfile
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

> **Why `prisma generate` before `npm run build`?**
> Next.js imports Prisma in server components and API routes at build time. If the client isn't generated first, `npm run build` itself fails. Better Auth uses Prisma under the hood for sessions and users, so the same rule applies.

### Commands to Build & Run

```bash
docker build -t my-nextjs-prisma-app .

# DATABASE_URL and BETTER_AUTH_SECRET must be in your .env
docker run -d -p 5000:5000 --env-file .env --name nextjs-prisma my-nextjs-prisma-app
# http://localhost:5000
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
docker build -t my-fiber-app .
docker run -d -p 8080:8080 --name fiber-app my-fiber-app
# http://localhost:8080
```

---

## PART 6 — Client + Server Together (Docker Compose)

Run your Next.js frontend + Golang Fiber backend together with one command.

### Project Structure

```
my-project/
├── client/          ← Next.js or React
│   └── Dockerfile
├── server/          ← Golang Fiber or Express
│   └── Dockerfile
└── docker-compose.yml
```

### docker-compose.yml

```yaml
version: "3.9"

services:
  client:
    build: ./(project-client-name)
    image: (hubUserName)/(project-client-name):v1
    ports:
      - "3000:3000"
    env_file:
      - ./(project-client-name)/.env.local
    depends_on:
      - server

  server:
    build: ./(project-server-name)
    image: (hubUserName)/(project-server-name):v1
    ports:
      - "5000:5000"
    env_file:
      - ./(project-server-name)/.env
```

### Commands

```bash
docker compose up -d          # start everything
docker compose down           # stop everything
docker compose up -d --build  # rebuild after code changes
docker compose logs -f        # all logs
docker compose logs -f server # logs for one service
```

---

## PART 7 — Live Code Reload (Dev Mode)

### Node.js / Express / Next.js

```bash
docker run -d \
  -p 5000:5000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  --name my-app \
  my-app-image
```

### Golang Fiber (using Air)

```dockerfile
RUN go install github.com/cosmtrek/air@latest
CMD ["air"]
```

---

## PART 8 — Environment Variables (.env)

### Single container

```bash
docker run -d -p 5000:5000 --env-file .env --name my-app my-app-image
```

### Docker Compose

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

## PART 9 — Most Used Commands

| Task | Command |
|------|---------|
| Build image | `docker build -t appname .` |
| Run container | `docker run -d -p 5000:5000 --name appname appname` |
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
|---------|-----|
| Port already in use | Change port: `-p 5001:5000` |
| Code changes not showing | Rebuild: `docker build -t appname .` |
| Container keeps stopping | Check logs: `docker logs appname` |
| Can't connect client to server | Use service name in URL: `http://server:8080` not `localhost` |
| `node_modules` missing | Add `-v /app/node_modules` when mounting volume |
| PrismaClient error at runtime | Add `RUN npx prisma generate` before `RUN npm run build` |
| Build fails with Prisma import | `prisma generate` must run before `npm run build` |
| `DATABASE_URL` not found at build time | Remove `prisma generate` from build script. Set `"build": "tsc"` only. |
| `DATABASE_URL` not found at runtime | Pass at runtime: `docker run --env-file .env ...` |
| Migrations not applied | Add `npx prisma migrate deploy` at the start of `CMD` |
| `schema.prisma` not found | Copy the folder: `COPY prisma ./prisma/` |

---

*One Dockerfile per service. One docker-compose.yml to run them all together.*
