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
go build -o app server.go       # Build production binary
./app                           # Run the built binary
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
