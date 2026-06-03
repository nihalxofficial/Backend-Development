# Go + Fiber + GORM + Neon Setup Guide

> REST API built with **Go**, **Fiber** (web framework), **GORM** (ORM), and **Neon** (PostgreSQL cloud database).

---

## 🧠 Why Each Piece Exists

| Tool | Why You Need It |
|---|---|
| **Go** | Fast, statically typed backend language |
| **Fiber** | Express-like web framework for Go — handles routes and HTTP |
| **GORM** | ORM for Go — talk to your database with Go structs instead of raw SQL |
| **gorm/driver/postgres** | GORM needs this to connect specifically to PostgreSQL |
| **Neon** | Free cloud PostgreSQL database — no local DB setup needed |
| **cors middleware** | Allows frontend apps on different origins to call your API |
| **AutoMigrate** | GORM auto creates/updates DB tables from your struct — no SQL needed |
| **WebSocket** | `gofiber/contrib/websocket` — real-time bidirectional communication |
| **Redis** | In-memory store — caching, sessions, pub/sub, rate limiting |


---

## 📁 Project Structure

```
go-fiber-app/
├── server.go        # Main file — routes, DB connection, models, WebSocket, Redis
├── Dockerfile       # Docker image definition
├── .dockerignore    # Files to exclude from Docker build
├── go.mod           # Go module definition & dependencies
├── go.sum           # Dependency checksums (auto-generated)
└── .env             # Environment variables (optional)
```

---

## 🚀 Step-by-Step Setup

### 1. Install Go

Download and install Go from **[go.dev/dl](https://go.dev/dl)**

Verify installation:
```bash
go version
```

---

### 2. Create Project Folder

```bash
mkdir go-fiber-app
cd go-fiber-app
```

---

### 3. Initialize Go Module

```bash
go mod init go-fiber-app
```

> This creates `go.mod` — like `package.json` in Node.js. It tracks your project name and dependencies.

---

### 4. Install Dependencies

```bash
# Fiber — web framework
go get github.com/gofiber/fiber/v3

# Fiber CORS middleware — allow cross-origin requests
go get github.com/gofiber/fiber/v3/middleware/cors

# GORM — ORM for Go
go get gorm.io/gorm

# PostgreSQL driver for GORM
go get gorm.io/driver/postgres
```

> `go get` is like `npm install` — downloads and adds to `go.mod` automatically.

---

### 5. Create Neon Database

1. Go to **[neon.tech](https://neon.tech)** and sign up
2. Click **New Project**
3. Set:
   - **Project Name** → `go-fiber-app`
   - **Database Name** → `neondb`
4. Click **Create Project**
5. Go to **Dashboard → Connection String**
6. Copy the connection string:

```
postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

---

### 6. Create `server.go`

```go
package main

import (
    "fmt"
    "log"
    "os"
    "strconv"
    "time"

    "github.com/gofiber/fiber/v3"
    "github.com/gofiber/fiber/v3/middleware/cors"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

// Student model — GORM maps this struct to a DB table automatically
type Student struct {
    ID            uint64    `json:"id"             gorm:"primaryKey"`
    Name          string    `json:"name"`
    Age           int       `json:"age"`
    Cgpa          float32   `json:"cgpa"`
    Department    string    `json:"department"`
    AdmissionDate time.Time `json:"admission_date"`
    UpdatedAt     time.Time `json:"updated_at"`
}

func main() {
    // Paste your Neon connection string here
    dsn := "your_neon_connection_string?sslmode=require&channel_binding=require"

    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }
    fmt.Println("Connected to Neon Postgres successfully ✔")

    // AutoMigrate — creates/updates the students table from the struct
    db.AutoMigrate(&Student{})

    app := fiber.New()
    port := os.Getenv("PORT")
    app.Use(cors.New())

    // Health check
    app.Get("/", func(c fiber.Ctx) error {
        return c.Status(200).JSON(fiber.Map{"message": "Server is running"})
    })

    // GET all students
    app.Get("/students", func(c fiber.Ctx) error {
        var students []Student
        db.Find(&students)
        return c.Status(200).JSON(&students)
    })

    // GET student by ID
    app.Get("/students/:sId", func(c fiber.Ctx) error {
        sId, err := strconv.Atoi(c.Params("sId"))
        if err != nil {
            return c.Status(400).JSON(fiber.Map{"message": "Invalid student ID"})
        }
        var student Student
        if err := db.First(&student, sId).Error; err != nil {
            return c.Status(500).JSON(fiber.Map{"message": err.Error()})
        }
        return c.Status(200).JSON(student)
    })

    // POST create student
    app.Post("/students", func(c fiber.Ctx) error {
        var student Student
        c.Bind().Body(&student)
        student.AdmissionDate = time.Now()
        student.UpdatedAt = time.Now()
        if err := db.Create(&student).Error; err != nil {
            return c.Status(500).JSON(fiber.Map{"message": err.Error()})
        }
        return c.Status(201).JSON(&student)
    })

    // PATCH update student by ID
    app.Patch("/students/:sId", func(c fiber.Ctx) error {
        sId, _ := strconv.Atoi(c.Params("sId"))
        var student Student
        c.Bind().Body(&student)
        db.Model(&Student{}).Where("id = ?", sId).Updates(&student)
        return c.JSON(fiber.Map{"message": "Student data updated!"})
    })

    // DELETE student by ID
    app.Delete("/students/:sId", func(c fiber.Ctx) error {
        sId, _ := strconv.Atoi(c.Params("sId"))
        var student Student
        db.First(&student, sId)
        db.Delete(&student)
        return c.JSON(fiber.Map{"message": "Student Deleted"})
    })

    if port == "" {
        port = "5000"
    }
    app.Listen(":" + port)
}
```

---

### 7. Run the Server

```bash
go run server.go
```

Server starts at **http://localhost:5000** ✅

---

### Golang Fiber (using Air)

```dockerfile
RUN go install github.com/cosmtrek/air@latest
CMD ["air"]
```

---

## 🐳 Docker

Containerize the app so it runs the same anywhere — locally, on a server, or on Render.

### 1. Create `Dockerfile`

```dockerfile
# Stage 1 — Build the binary
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copy dependency files first (layer caching)
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build
COPY . .
RUN go build -o server server.go

# Stage 2 — Minimal runtime image
FROM alpine:latest

WORKDIR /app

# Copy only the compiled binary from the builder stage
COPY --from=builder /app/server .

EXPOSE 5000

CMD ["./server"]
```

> **Two-stage build** keeps the final image tiny (~15 MB) by leaving out the Go compiler and source files.

---

### 2. Create `.dockerignore`

```
.env
*.md
.git
.gitignore
```

> Prevents sensitive files and git history from being baked into the image.

---

### 3. Build & Run Locally

```bash
# Build the image
docker build -t go-fiber-app .

# Run the container (pass your Neon DSN as an env var)
docker run -p 5000:5000 \
  -e DATABASE_URL="your_neon_connection_string" \
  go-fiber-app
```

API is now available at **http://localhost:5000** inside Docker ✅

---

### 4. Use `DATABASE_URL` from Environment

Update `server.go` to read the DSN from an environment variable instead of hardcoding it:

```go
dsn := os.Getenv("DATABASE_URL")
if dsn == "" {
    log.Fatal("DATABASE_URL environment variable is not set")
}
```

This makes the app work both locally and in production without changing code.

---

### Docker Quick Reference

```bash
docker build -t go-fiber-app .          # Build image
docker run -p 5000:5000 go-fiber-app    # Run container
docker ps                               # List running containers
docker stop <container_id>              # Stop a container
docker images                           # List local images
docker rmi go-fiber-app                 # Remove image
```

---

## ☁️ Deploy on Render

Render is a free cloud platform that deploys directly from GitHub — no servers to manage, no CLI required.

---

### Step 1 — Install & Set Up Render

Render has no local CLI required for basic deploys — everything is through the dashboard. But if you want to manage services from your terminal, install the Render CLI:

**macOS (Homebrew):**
```bash
brew install render
```

**Linux / Windows (via npm):**
```bash
npm install -g @render-oss/render-cli
```

**Verify installation:**
```bash
render --version
```

**Authenticate:**
```bash
render login
```

This opens a browser tab to log in and links your terminal to your Render account.

> You can skip the CLI entirely and use the **[Render Dashboard](https://dashboard.render.com)** for all steps below — the CLI is optional.

---

### Step 2 — Push Code to GitHub

Render deploys directly from a GitHub (or GitLab) repo. If you haven't already:

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/your-username/go-fiber-app.git
git push -u origin main
```

Make sure these files are committed:
- `server.go`
- `go.mod`
- `go.sum`
- `Dockerfile` (if using Docker deploy)

> **Never commit `.env`** — pass secrets as environment variables in the Render dashboard.

---

### Step 3 — Create a Render Account

1. Go to **[render.com](https://render.com)** and click **Get Started**
2. Sign up with **GitHub** (recommended — makes repo connection one-click)
3. Verify your email

---

### Step 4 — Create a Web Service

1. Go to **[dashboard.render.com](https://dashboard.render.com)**
2. Click **New → Web Service**
3. Click **Connect a repository** → select your `go-fiber-app` repo
4. Click **Connect**

---

### Option A — Deploy with Docker (Recommended)

1. Go to **[render.com](https://render.com)** → **New → Web Service**
2. Connect your GitHub repo
3. Configure the service:

| Setting | Value |
|---|---|
| **Name** | `go-fiber-app` |
| **Environment** | `Docker` |
| **Dockerfile Path** | `./Dockerfile` |
| **Instance Type** | `Free` |

4. Under **Environment Variables**, click **Add Environment Variable**:

| Key | Value |
|---|---|
| `DATABASE_URL` | `your_neon_connection_string` |
| `PORT` | `5000` |

5. Click **Create Web Service**

Render builds the Docker image and deploys automatically. Every `git push` triggers a redeploy. ✅

---

### Option B — Deploy without Docker (Native Go)

If you don't want to use Docker, Render can build Go directly.

1. Go to **Render → New → Web Service**
2. Connect your GitHub repo
3. Configure:

| Setting | Value |
|---|---|
| **Environment** | `Go` |
| **Build Command** | `go build -o server server.go` |
| **Start Command** | `./server` |

4. Add environment variables same as Option A
5. Click **Create Web Service** ✅

---

### Option C — `render.yaml` (Infrastructure as Code)

Add a `render.yaml` file to your repo to define the service declaratively:

```yaml
services:
  - type: web
    name: go-fiber-app
    env: docker
    plan: free
    dockerfilePath: ./Dockerfile
    envVars:
      - key: DATABASE_URL
        sync: false        # Set manually in Render dashboard (keeps it secret)
      - key: PORT
        value: 5000
```

Render detects this file automatically when you connect the repo.

---

### Render Deployment Flow

```
git push origin main
        ↓
  Render detects push
        ↓
  Pulls latest code
        ↓
  Builds Docker image
        ↓
  Runs container
        ↓
  Live at https://your-app.onrender.com ✅
```

> **Note:** Free tier services spin down after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to wake up. Upgrade to a paid plan to keep it always-on.

---

### Render Troubleshooting

| Problem | Fix |
|---|---|
| Build fails | Check `go.sum` is committed — run `go mod tidy` then commit |
| `DATABASE_URL` not found | Double-check env var name in Render dashboard |
| App crashes on start | Check Render logs → **Logs** tab in the dashboard |
| Port not binding | Make sure `PORT` env var is set and `app.Listen(":" + port)` uses it |
| Free tier sleeping | Expected behavior — upgrade plan or use a cron ping service |

---

## 🔌 WebSockets with Fiber

WebSockets let the server push data to clients in real time — no polling needed. Useful for live dashboards, chat, notifications, or streaming updates.

---

### 1. Install the WebSocket Middleware

```bash
go get github.com/gofiber/contrib/websocket
```

> This is a separate package from Fiber core — it's in the `contrib` org.

---

### 2. How It Works

```
Client                        Server
  |                              |
  |-- HTTP GET /ws ------------> |  (Upgrade request)
  |<-- 101 Switching Protocols - |  (Handshake)
  |                              |
  |<===== WebSocket Frame ======>|  (Full-duplex, persistent)
  |<===== WebSocket Frame ======>|
  |                              |
```

HTTP is used only for the handshake. After that, the connection stays open and both sides can send at any time.

---

### 3. Add WebSocket to `server.go`

```go
import (
    "github.com/gofiber/contrib/websocket"
    // ... existing imports
)

// WebSocket upgrade check middleware — must come before the handler
app.Use("/ws", func(c fiber.Ctx) error {
    if websocket.IsWebSocketUpgrade(c) {
        return c.Next()
    }
    return fiber.ErrUpgradeRequired
})

// WebSocket handler
app.Get("/ws", websocket.New(func(c *websocket.Conn) {
    fmt.Println("Client connected:", c.RemoteAddr())

    for {
        // Read message from client
        msgType, msg, err := c.ReadMessage()
        if err != nil {
            fmt.Println("Client disconnected:", err)
            break
        }
        fmt.Printf("Received: %s\n", msg)

        // Echo message back to client
        if err := c.WriteMessage(msgType, msg); err != nil {
            fmt.Println("Write error:", err)
            break
        }
    }
}))
```

---

### 4. Broadcast to All Connected Clients

Track all active connections in a map and write to each one:

```go
import "sync"

// Global connection hub
var (
    clients   = make(map[*websocket.Conn]bool)
    clientsMu sync.Mutex
)

func broadcast(message []byte) {
    clientsMu.Lock()
    defer clientsMu.Unlock()
    for conn := range clients {
        if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
            conn.Close()
            delete(clients, conn)
        }
    }
}

// In the WebSocket handler:
app.Get("/ws", websocket.New(func(c *websocket.Conn) {
    clientsMu.Lock()
    clients[c] = true
    clientsMu.Unlock()

    defer func() {
        clientsMu.Lock()
        delete(clients, c)
        clientsMu.Unlock()
        c.Close()
    }()

    for {
        _, msg, err := c.ReadMessage()
        if err != nil {
            break
        }
        broadcast(msg) // Send to every connected client
    }
}))
```

---

### 5. Send JSON over WebSocket

```go
type WSMessage struct {
    Event string      `json:"event"`
    Data  interface{} `json:"data"`
}

// Send structured JSON to a client
func sendJSON(conn *websocket.Conn, event string, data interface{}) error {
    payload, err := json.Marshal(WSMessage{Event: event, Data: data})
    if err != nil {
        return err
    }
    return conn.WriteMessage(websocket.TextMessage, payload)
}

// Example — push a student update to all clients
app.Patch("/students/:sId", func(c fiber.Ctx) error {
    // ... update logic ...
    broadcast([]byte(`{"event":"student_updated","data":{"id":` + c.Params("sId") + `}}`))
    return c.JSON(fiber.Map{"message": "Student data updated!"})
})
```

---

### 6. Test WebSocket with `wscat`

```bash
# Install wscat globally
npm install -g wscat

# Connect to the server
wscat -c ws://localhost:5000/ws

# Now type messages and press Enter — server will echo them back
> Hello
< Hello
```

Or test in the browser console:

```javascript
const ws = new WebSocket("ws://localhost:5000/ws");
ws.onmessage = (e) => console.log("Message:", e.data);
ws.send("Hello from browser!");
```

---

### WebSocket vs REST — When to Use Which

| Use Case | Use |
|---|---|
| Fetch a list of students | REST `GET /students` |
| Create / update / delete | REST `POST / PATCH / DELETE` |
| Live notifications | WebSocket |
| Real-time dashboard data | WebSocket |
| Chat / collaborative editing | WebSocket |
| File upload | REST |

---

### WebSocket + Docker & Render Notes

WebSockets work out of the box with Docker — no extra config needed.

On **Render**, WebSocket connections are supported on all plans. Make sure your Fiber app listens on `0.0.0.0` (Fiber does this by default), and Render's reverse proxy will handle the upgrade automatically.

---

## 🔴 Redis

Redis is an in-memory data store — lightning fast for caching, session storage, rate limiting, and pub/sub messaging. It sits alongside Postgres: Postgres stores permanent data, Redis stores temporary/fast-access data.

---

### 1. Install Redis Client for Go

```bash
go get github.com/redis/go-redis/v9
```

> `go-redis` is the official, actively maintained Redis client for Go.

---

### 2. Run Redis Locally (Docker)

The easiest way to run Redis locally without installing anything:

```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

Verify it's running:

```bash
docker exec -it redis redis-cli ping
# Output: PONG
```

Or install Redis natively:

| OS | Command |
|---|---|
| macOS | `brew install redis && brew services start redis` |
| Ubuntu/Debian | `sudo apt install redis-server && sudo systemctl start redis` |
| Windows | Use Docker (recommended) or WSL2 |

---

### 3. Connect to Redis in `server.go`

```go
import (
    "context"
    "github.com/redis/go-redis/v9"
)

var ctx = context.Background()

func connectRedis() *redis.Client {
    rdb := redis.NewClient(&redis.Options{
        Addr:     os.Getenv("REDIS_URL"), // e.g. localhost:6379
        Password: "",                      // empty if no auth
        DB:       0,                       // default DB
    })

    if err := rdb.Ping(ctx).Err(); err != nil {
        log.Fatal("Failed to connect to Redis:", err)
    }
    fmt.Println("Connected to Redis successfully ✔")
    return rdb
}
```

Call it in `main()`:

```go
rdb := connectRedis()
```

---

### 4. Use Cases & Code Examples

#### Cache GET /students (avoid hitting DB every request)

```go
app.Get("/students", func(c fiber.Ctx) error {
    cacheKey := "students:all"

    // Try cache first
    cached, err := rdb.Get(ctx, cacheKey).Result()
    if err == nil {
        // Cache hit — return immediately
        c.Set("Content-Type", "application/json")
        return c.Status(200).SendString(cached)
    }

    // Cache miss — query DB
    var students []Student
    db.Find(&students)

    // Store in Redis for 60 seconds
    data, _ := json.Marshal(students)
    rdb.Set(ctx, cacheKey, data, 60*time.Second)

    return c.Status(200).JSON(&students)
})

// Invalidate cache when data changes
app.Post("/students", func(c fiber.Ctx) error {
    // ... create logic ...
    rdb.Del(ctx, "students:all") // clear stale cache
    return c.Status(201).JSON(&student)
})
```

---

#### Store Sessions

```go
// Save session on login
func saveSession(rdb *redis.Client, sessionID string, userID uint64) error {
    key := "session:" + sessionID
    return rdb.Set(ctx, key, userID, 24*time.Hour).Err()
}

// Read session on request
func getSession(rdb *redis.Client, sessionID string) (string, error) {
    return rdb.Get(ctx, "session:"+sessionID).Result()
}

// Delete session on logout
func deleteSession(rdb *redis.Client, sessionID string) error {
    return rdb.Del(ctx, "session:"+sessionID).Err()
}
```

---

#### Rate Limiting

Limit each IP to 100 requests per minute:

```go
app.Use(func(c fiber.Ctx) error {
    ip := c.IP()
    key := "rate:" + ip

    count, err := rdb.Incr(ctx, key).Result()
    if err != nil {
        return c.Next()
    }

    if count == 1 {
        rdb.Expire(ctx, key, time.Minute) // reset window every minute
    }

    if count > 100 {
        return c.Status(429).JSON(fiber.Map{"message": "Too many requests"})
    }

    return c.Next()
})
```

---

#### Pub/Sub — Push Events Between Services

**Publisher** (e.g. after a student is created):

```go
func publishEvent(rdb *redis.Client, event string, data interface{}) {
    payload, _ := json.Marshal(data)
    rdb.Publish(ctx, event, payload)
}

// In POST /students handler:
publishEvent(rdb, "student.created", student)
```

**Subscriber** (e.g. a notification service):

```go
func subscribeEvents(rdb *redis.Client) {
    sub := rdb.Subscribe(ctx, "student.created")
    defer sub.Close()

    for msg := range sub.Channel() {
        fmt.Println("Event received:", msg.Payload)
        // e.g. send email, update cache, notify WebSocket clients
    }
}

// Start in a goroutine so it doesn't block
go subscribeEvents(rdb)
```

---

#### Redis + WebSocket — Real-time Pub/Sub

Combine Redis pub/sub with WebSocket to push DB events to browsers:

```go
go func() {
    sub := rdb.Subscribe(ctx, "student.created")
    defer sub.Close()
    for msg := range sub.Channel() {
        broadcast([]byte(msg.Payload)) // send to all WS clients
    }
}()
```

Now every time any service publishes `student.created`, all connected browsers receive it instantly.

---

### 5. Redis Data Types Cheat Sheet

| Type | Command | Use Case |
|---|---|---|
| String | `SET key val EX 60` | Cache, session tokens |
| Hash | `HSET user:1 name "Ali"` | User profiles |
| List | `RPUSH queue task1` | Job queues |
| Set | `SADD online user:1` | Online users, tags |
| Sorted Set | `ZADD leaderboard 95 user:1` | Rankings, scores |
| Pub/Sub | `PUBLISH / SUBSCRIBE` | Real-time events |

---

### 6. Redis in Docker Compose (local dev)

Add to a `docker-compose.yml` to run both the app and Redis together:

```yaml
version: "3.9"
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=your_neon_connection_string
      - REDIS_URL=redis:6379
    depends_on:
      - redis

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

```bash
docker compose up        # Start everything
docker compose down      # Stop everything
docker compose logs app  # View app logs
```

---

### 7. Redis in Production (Render + Upstash)

Render doesn't offer a free Redis add-on, so use **[Upstash](https://upstash.com)** — a free serverless Redis with a REST API.

**Setup:**
1. Go to [upstash.com](https://upstash.com) → **Create Database**
2. Choose region closest to your Render deployment
3. Copy the **Redis URL** (format: `redis://default:password@host:port`)
4. Add it to Render dashboard → **Environment Variables**:

| Key | Value |
|---|---|
| `REDIS_URL` | `redis://default:xxx@your-host.upstash.io:6379` |

**Update connection code for TLS (required by Upstash):**

```go
opt, err := redis.ParseURL(os.Getenv("REDIS_URL"))
if err != nil {
    log.Fatal("Invalid REDIS_URL:", err)
}
rdb := redis.NewClient(opt)
```

`redis.ParseURL` handles TLS automatically from the URL scheme — no extra config needed.

---

### Redis Quick Reference

```bash
# Local Redis CLI
redis-cli ping                        # Test connection
redis-cli set foo bar                 # Set a key
redis-cli get foo                     # Get a key
redis-cli keys "*"                    # List all keys
redis-cli flushdb                     # Clear all keys (dev only!)
redis-cli monitor                     # Watch all commands in real time

# Docker
docker run -d -p 6379:6379 redis:alpine       # Start Redis
docker exec -it redis redis-cli               # Open CLI in container
```

---

### Redis Troubleshooting

| Error | Fix |
|---|---|
| `connection refused` | Redis isn't running — start with Docker or `brew services start redis` |
| `NOAUTH` error | Redis requires a password — set `Password` in client options |
| `invalid URL` | Check `REDIS_URL` format: `redis://user:pass@host:port` |
| Cache never expires | Always set TTL: `rdb.Set(ctx, key, val, time.Minute)` |
| Upstash TLS error | Use `redis.ParseURL()` instead of manual `Options{}` |

---

## 🧪 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/students` | Get all students |
| GET | `/students/:sId` | Get student by ID |
| POST | `/students` | Create new student |
| PATCH | `/students/:sId` | Update student by ID |
| DELETE | `/students/:sId` | Delete student by ID |

---

## 📌 POST /students — Request Body

```json
{
  "name": "Ahmed Hassan",
  "age": 20,
  "cgpa": 3.85,
  "department": "Computer Science"
}
```

> `id`, `admission_date`, and `updated_at` are set automatically — do not include them.

---

## 🧠 Key Concepts

### Struct Tags Explained

```go
type Student struct {
    ID   uint64 `json:"id" gorm:"primaryKey"`
    //           ^^^^^^^^^^  ^^^^^^^^^^^^^^^
    //           JSON key     GORM behavior
    Name string `json:"name"`
}
```

| Tag | What it does |
|---|---|
| `json:"id"` | Key name when sending/receiving JSON |
| `gorm:"primaryKey"` | Marks this as the primary key in DB |
| `json:"admission_date"` | Snake case key in JSON response |

---

### AutoMigrate — No Manual Migration Needed

```go
// Runs on every server start — creates table if not exists, adds new columns
db.AutoMigrate(&Student{})
```

| | GORM AutoMigrate | Prisma Migrate |
|---|---|---|
| Command | `db.AutoMigrate(&Model{})` | `npx prisma migrate dev` |
| When it runs | Every server start automatically | Manually when you run the command |
| Migration files | ❌ No files | ✅ Creates migration files |

---

### Why `Where` + `Updates` for Patch

```go
// ✅ Correct — targets specific record, updates only sent fields
db.Model(&Student{}).Where("id = ?", sId).Updates(&student)

// ❌ Avoid — updates ALL fields including zero/empty values
db.Save(&student)
```

---

## ✅ Quick Command Reference

```bash
go mod init go-fiber-app        # Initialize module (do once)
go get <package>                # Install a package
go mod tidy                     # Remove unused dependencies
go run server.go                # Run the server (development)
go build -o server server.go    # Build production binary
./server                        # Run the built binary

docker build -t go-fiber-app .  # Build Docker image
docker run -p 5000:5000 \
  -e DATABASE_URL="..." \
  go-fiber-app                  # Run Docker container
```

---

## ⚠️ Common Issues

| Error | Fix |
|---|---|
| `Failed to connect to database` | Check your Neon connection string |
| `port already in use` | Change port or kill existing process |
| `undefined: fiber` | Run `go get github.com/gofiber/fiber/v3` |
| Missing `sslmode=require` | Always include it for Neon connections |
| `go.sum mismatch` | Run `go mod tidy` to fix checksums |
| Docker build fails | Ensure `go.sum` is committed to the repo |
| Render app sleeps | Free tier behavior — first request after idle takes ~30s |
