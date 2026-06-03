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

---

## 📁 Project Structure

```
go-fiber-app/
├── server.go        # Main file — routes, DB connection, models
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

Render is a free cloud platform that can deploy directly from GitHub — no servers to manage.

### Prerequisites

- Code pushed to a **GitHub repository**
- A **Render account** at [render.com](https://render.com)
- Your **Neon connection string** ready

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
