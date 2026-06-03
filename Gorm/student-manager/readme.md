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
| **Socket.IO** | `zishang520/socket.io` — real-time named events, rooms, auto-reconnect |
| **Redis** | In-memory store — caching, sessions, pub/sub, rate limiting |


---

## 📁 Project Structure

```
go-fiber-app/
├── server.go        # Main file — routes, DB connection, models, Socket.IO, Redis
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

## 🔌 Socket.IO with Go

Socket.IO enables real-time, event-based communication between server and client. It builds on WebSockets and adds named events, rooms, auto-reconnect, and HTTP long-polling fallback — so it works even behind corporate proxies that block raw WebSockets.

> **Why Socket.IO over raw WebSockets in Go?**
> If your frontend already uses `socket.io-client` (React, Vue, plain JS), the backend must also speak the Socket.IO protocol. A plain WebSocket server won't work with a Socket.IO client.

---

### 1. Install

```bash
go get github.com/zishang520/socket.io/v2
```

---

### 2. How It Works

```
Browser (socket.io-client)         Go Server (zishang520/socket.io)
  |                                         |
  |-- HTTP handshake (polling) -----------> |
  |<-- upgrade to WebSocket --------------- |
  |                                         |
  |-- emit("student:create", data) -------> |  named event
  |<-- emit("student:created", student) --- |  named event back
  |                                         |
  |  (connection stays open, full-duplex)   |
```

---

### 3. Add Socket.IO to `server.go`

Replace the `app.Listen` call with an `http.Server` so Socket.IO and Fiber share the same port:

```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "os"
    "strconv"
    "time"

    "github.com/gofiber/fiber/v3"
    "github.com/gofiber/fiber/v3/middleware/cors"
    sio "github.com/zishang520/socket.io/v2/socket"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

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
    dsn := os.Getenv("DATABASE_URL")
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }
    fmt.Println("Connected to Neon Postgres successfully ✔")
    db.AutoMigrate(&Student{})

    // --- Socket.IO server ---
    io := sio.NewServer(nil, nil)

    io.On("connection", func(clients ...any) {
        socket := clients[0].(*sio.Socket)
        fmt.Println("Socket.IO client connected:", socket.Id())

        socket.On("disconnect", func(...any) {
            fmt.Println("Socket.IO client disconnected:", socket.Id())
        })
    })

    // --- Fiber app ---
    app := fiber.New()
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

    // POST create student — emit event after creation
    app.Post("/students", func(c fiber.Ctx) error {
        var student Student
        c.Bind().Body(&student)
        student.AdmissionDate = time.Now()
        student.UpdatedAt = time.Now()
        if err := db.Create(&student).Error; err != nil {
            return c.Status(500).JSON(fiber.Map{"message": err.Error()})
        }
        // Notify all connected Socket.IO clients
        io.Emit("student:created", student)
        return c.Status(201).JSON(&student)
    })

    // PATCH update student — emit event after update
    app.Patch("/students/:sId", func(c fiber.Ctx) error {
        sId, _ := strconv.Atoi(c.Params("sId"))
        var student Student
        c.Bind().Body(&student)
        db.Model(&Student{}).Where("id = ?", sId).Updates(&student)
        io.Emit("student:updated", fiber.Map{"id": sId})
        return c.JSON(fiber.Map{"message": "Student data updated!"})
    })

    // DELETE student — emit event after delete
    app.Delete("/students/:sId", func(c fiber.Ctx) error {
        sId, _ := strconv.Atoi(c.Params("sId"))
        var student Student
        db.First(&student, sId)
        db.Delete(&student)
        io.Emit("student:deleted", fiber.Map{"id": sId})
        return c.JSON(fiber.Map{"message": "Student Deleted"})
    })

    // Mount both Fiber and Socket.IO on the same HTTP server
    mux := http.NewServeMux()
    mux.Handle("/socket.io/", io.ServeHandler(nil))
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        app.Handler()(w, r)
    })

    port := os.Getenv("PORT")
    if port == "" {
        port = "5000"
    }
    fmt.Println("Server running on http://localhost:" + port)
    log.Fatal(http.ListenAndServe(":"+port, mux))
}
```

---

### 4. Socket.IO Events for Students

Every REST action also fires a Socket.IO event so connected clients update in real time:

| REST Action | Socket.IO Event Emitted | Payload |
|---|---|---|
| `POST /students` | `student:created` | full student object |
| `PATCH /students/:id` | `student:updated` | `{ id }` |
| `DELETE /students/:id` | `student:deleted` | `{ id }` |

---

### 5. Frontend — Listen for Events

Install the client:

```bash
npm install socket.io-client
```

Connect and listen:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

// Listen for student events pushed by the server
socket.on("student:created", (student) => {
    console.log("New student added:", student);
    // e.g. append to your table/list
});

socket.on("student:updated", ({ id }) => {
    console.log("Student updated, id:", id);
    // e.g. re-fetch that row
});

socket.on("student:deleted", ({ id }) => {
    console.log("Student deleted, id:", id);
    // e.g. remove from list
});
```

---

### 6. Rooms — Notify Only a Department

Group clients by department so only relevant users receive updates:

```go
io.On("connection", func(clients ...any) {
    socket := clients[0].(*sio.Socket)

    // Client tells server which department they belong to
    socket.On("join:department", func(args ...any) {
        dept := fmt.Sprint(args[0])          // e.g. "Computer Science"
        socket.Join(sio.Room("dept:" + dept))
        fmt.Printf("Socket %s joined room dept:%s\n", socket.Id(), dept)
    })
})

// In PATCH handler — notify only that department's room
app.Patch("/students/:sId", func(c fiber.Ctx) error {
    sId, _ := strconv.Atoi(c.Params("sId"))
    var student Student
    c.Bind().Body(&student)
    db.Model(&Student{}).Where("id = ?", sId).Updates(&student)

    // Fetch updated record to get department
    db.First(&student, sId)
    io.To(sio.Room("dept:" + student.Department)).Emit("student:updated", fiber.Map{"id": sId})
    return c.JSON(fiber.Map{"message": "Student data updated!"})
})
```

Frontend joins a room:

```javascript
socket.emit("join:department", "Computer Science");
// Now only receives events for that department
```

---

### 7. Test with the Browser Console

Open `http://localhost:5000` in a browser, open DevTools → Console:

```javascript
const socket = io("http://localhost:5000");
socket.on("student:created", (data) => console.log("created:", data));
socket.on("student:updated", (data) => console.log("updated:", data));
socket.on("student:deleted", (data) => console.log("deleted:", data));
```

Then call the REST API (Postman or curl) and watch events fire live in the console.

---

### Socket.IO vs REST — When to Use Which

| Use Case | Use |
|---|---|
| Fetch list of students on page load | REST `GET /students` |
| Create / update / delete a student | REST `POST / PATCH / DELETE` |
| Push update to all open browser tabs | Socket.IO emit |
| Notify only one department's users | Socket.IO room |
| Auto-refresh a dashboard | Socket.IO |

---

### Socket.IO + Docker & Render Notes

Socket.IO works out of the box with Docker — no extra config.

On **Render**, Socket.IO is fully supported. The HTTP long-polling fallback means it works even if the WebSocket upgrade is blocked. No special settings needed — Render's reverse proxy handles it automatically.

---

## 🔴 Redis (Upstash)

Redis is an in-memory data store — lightning fast for caching, rate limiting, and pub/sub messaging. This guide uses **[Upstash](https://upstash.com)** — a free serverless Redis that works both locally and in production with zero infrastructure to manage. No Docker Redis container needed.

---

### 1. Create an Upstash Database

1. Go to **[upstash.com](https://upstash.com)** and sign up (free)
2. Click **Create Database**
3. Set:
   - **Name** → `go-fiber-app`
   - **Type** → `Regional`
   - **Region** → closest to your Render deployment (e.g. `US-East-1`)
4. Click **Create**
5. Go to **Details** tab → copy the **Redis URL**:

```
rediss://default:your_password@your-host.upstash.io:6379
```

> `rediss://` (with double `s`) means TLS — always required by Upstash.

---

### 2. Add to Environment Variables

**Local (`.env`):**
```bash
REDIS_URL=rediss://default:your_password@your-host.upstash.io:6379
```

**Render dashboard** → Environment Variables:

| Key | Value |
|---|---|
| `REDIS_URL` | `rediss://default:xxx@your-host.upstash.io:6379` |

---

### 3. Install Go Redis Client

```bash
go get github.com/redis/go-redis/v9
```

---

### 4. Connect to Upstash in `server.go`

Use `redis.ParseURL` — it reads the full Upstash URL including TLS automatically:

```go
import (
    "context"
    "github.com/redis/go-redis/v9"
)

var ctx = context.Background()

func connectRedis() *redis.Client {
    opt, err := redis.ParseURL(os.Getenv("REDIS_URL"))
    if err != nil {
        log.Fatal("Invalid REDIS_URL:", err)
    }

    rdb := redis.NewClient(opt)

    if err := rdb.Ping(ctx).Err(); err != nil {
        log.Fatal("Failed to connect to Upstash Redis:", err)
    }
    fmt.Println("Connected to Upstash Redis successfully ✔")
    return rdb
}
```

Call it in `main()`:

```go
rdb := connectRedis()
```

> `redis.ParseURL` handles TLS, password, host, and port all from the single `REDIS_URL` string — no manual `Options{}` needed.

---

### 5. Use Cases & Code Examples

#### Cache GET /students (avoid hitting DB every request)

```go
app.Get("/students", func(c fiber.Ctx) error {
    cacheKey := "students:all"

    // Try Upstash cache first
    cached, err := rdb.Get(ctx, cacheKey).Result()
    if err == nil {
        // Cache hit — return instantly, no DB query
        c.Set("Content-Type", "application/json")
        return c.Status(200).SendString(cached)
    }

    // Cache miss — query Neon Postgres
    var students []Student
    db.Find(&students)

    // Store in Upstash for 60 seconds
    data, _ := json.Marshal(students)
    rdb.Set(ctx, cacheKey, data, 60*time.Second)

    return c.Status(200).JSON(&students)
})

// Invalidate cache on any mutation
app.Post("/students", func(c fiber.Ctx) error {
    var student Student
    c.Bind().Body(&student)
    student.AdmissionDate = time.Now()
    student.UpdatedAt = time.Now()
    if err := db.Create(&student).Error; err != nil {
        return c.Status(500).JSON(fiber.Map{"message": err.Error()})
    }
    rdb.Del(ctx, "students:all") // clear stale cache
    io.Emit("student:created", student)
    return c.Status(201).JSON(&student)
})
```

---

#### Rate Limiting (per IP, 100 req/min)

```go
app.Use(func(c fiber.Ctx) error {
    ip := c.IP()
    key := "rate:" + ip

    count, err := rdb.Incr(ctx, key).Result()
    if err != nil {
        return c.Next() // fail open if Redis is down
    }

    if count == 1 {
        rdb.Expire(ctx, key, time.Minute) // start 1-minute window
    }

    if count > 100 {
        return c.Status(429).JSON(fiber.Map{"message": "Too many requests"})
    }

    return c.Next()
})
```

---

#### Pub/Sub — Push Events to Socket.IO

Publish from any REST handler, subscribe in a goroutine and forward to Socket.IO clients:

```go
// Publish after a student is created
func publishEvent(rdb *redis.Client, channel string, data interface{}) {
    payload, _ := json.Marshal(data)
    rdb.Publish(ctx, channel, payload)
}

// Subscribe and forward to all Socket.IO clients
func subscribeAndBroadcast(rdb *redis.Client, io *sio.Server) {
    sub := rdb.Subscribe(ctx, "student.created", "student.updated", "student.deleted")
    defer sub.Close()

    for msg := range sub.Channel() {
        // Forward Upstash message straight to every Socket.IO client
        io.Emit("db:event", fiber.Map{
            "channel": msg.Channel,
            "payload": msg.Payload,
        })
    }
}

// In main() — start subscriber in background
go subscribeAndBroadcast(rdb, io)
```

Then in each REST handler:

```go
app.Post("/students", func(c fiber.Ctx) error {
    // ... create logic ...
    publishEvent(rdb, "student.created", student)
    return c.Status(201).JSON(&student)
})

app.Patch("/students/:sId", func(c fiber.Ctx) error {
    // ... update logic ...
    publishEvent(rdb, "student.updated", fiber.Map{"id": sId})
    return c.JSON(fiber.Map{"message": "Student data updated!"})
})

app.Delete("/students/:sId", func(c fiber.Ctx) error {
    // ... delete logic ...
    publishEvent(rdb, "student.deleted", fiber.Map{"id": sId})
    return c.JSON(fiber.Map{"message": "Student Deleted"})
})
```

Frontend listens on the single `db:event` channel:

```javascript
socket.on("db:event", ({ channel, payload }) => {
    const data = JSON.parse(payload);
    if (channel === "student.created") console.log("New student:", data);
    if (channel === "student.updated") console.log("Updated:", data);
    if (channel === "student.deleted") console.log("Deleted:", data);
});
```

---

### 6. Test Upstash from the Dashboard

Upstash has a built-in **Data Browser** and **CLI** in the dashboard — no local redis-cli needed:

1. Go to your Upstash database → **CLI** tab
2. Run commands directly:

```
SET students:test "hello"
GET students:test
KEYS *
FLUSHDB
```

Or use the **Data Browser** tab to visually inspect all keys and values.

---

### 7. Docker Compose (local dev with Upstash)

Since Upstash is a cloud service, your local Docker container connects to it the same way production does — just set the env var:

```yaml
version: "3.9"
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=your_neon_connection_string
      - REDIS_URL=rediss://default:your_password@your-host.upstash.io:6379
```

No local Redis container needed. Both local dev and production point to the same Upstash instance.

```bash
docker compose up        # Start the app (Upstash is already in the cloud)
docker compose down      # Stop the app
docker compose logs app  # View logs
```

---

### Redis Data Types Cheat Sheet

| Type | Upstash CLI Example | Use Case |
|---|---|---|
| String | `SET key val EX 60` | Cache, session tokens |
| Hash | `HSET user:1 name "Ali"` | User profiles |
| List | `RPUSH queue task1` | Job queues |
| Set | `SADD online user:1` | Online users, tags |
| Sorted Set | `ZADD leaderboard 95 user:1` | Rankings, scores |
| Pub/Sub | `PUBLISH channel msg` | Real-time events |

---

### Upstash Troubleshooting

| Error | Fix |
|---|---|
| `tls: failed to verify certificate` | Use `rediss://` not `redis://` in the URL |
| `NOAUTH Authentication required` | Missing password — use full Upstash URL with `redis.ParseURL` |
| `invalid URL scheme` | URL must start with `redis://` or `rediss://` |
| Pub/Sub not firing | Upstash free tier supports pub/sub — check channel name matches exactly |
| Cache never expires | Always set TTL: `rdb.Set(ctx, key, val, 60*time.Second)` |
| Keys not showing in dashboard | Check **Data Browser** tab in Upstash, not the CLI |

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
