package main

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"

	// "github.com/gofiber/fiber/v3/middleware/static"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Student struct {
	ID         uint    `json:"id" gorm:"primaryKey"`
	Name       string  `json:"name"`
	Age        int     `json:"age"`
	Cgpa       float32 `json:"cgpa"`
	Department string  `json:"department"`
	AdmissionDate time.Time `json:"admission_date"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func main() {
	dsn := "postgresql://neondb_owner:npg_djwAN13DgHbI@ep-tiny-waterfall-aqi3oiex-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	fmt.Println("Connected to Neon Postgres successfully ✔")

	db.AutoMigrate(&Student{})

	app := fiber.New()
	port := os.Getenv("PORT")
	app.Use(cors.New())

	// app.Use("/", static.New("./public"))

	app.Get("/", func(c fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{"message": "Server is running"})
	})

	app.Get("/students", func(c fiber.Ctx) error {
		var students []Student
		db.Find(&students)
		return c.Status(200).JSON(&students)
	})

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

	app.Post("/students", func(c fiber.Ctx) error {
		var student Student
		c.Bind().Body(&student)
		if err:= db.Create(&student).Error; err!=nil{
			return c.Status(500).JSON(fiber.Map{"message": err.Error()})
		}
		return c.Status(201).JSON(&student)
	})

	app.Patch("/students/:sId", func(c fiber.Ctx) error {
		sId, _ := strconv.Atoi(c.Params("sId"))
		var student Student
		c.Bind().Body(&student)
		db.Model(&Student{}).Where("id = ?", sId).Updates(&student)
		return c.JSON(fiber.Map{"message": "Student data updated!"})
	})

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
