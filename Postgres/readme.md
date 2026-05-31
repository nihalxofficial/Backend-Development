# PostgreSQL Quick Reference Guide

> A clean, simple guide for PostgreSQL — from CLI basics to joins.

---

## 🖥️ CLI Commands (psql)

| What You Want | Command |
|---|---|
| Connect to PostgreSQL | `psql -U postgres` |
| Connect to a specific DB | `psql -U postgres -d mydb` |
| Show all databases | `\l` |
| Change / use a database | `\c mydb` |
| Show all tables | `\dt` |
| Show all views | `\dv` |
| Describe a table structure | `\d tablename` |
| Clear terminal | `\! cls` (Windows) / `\! clear` (Mac/Linux) |
| Show current database | `SELECT current_database();` |
| Show current user | `SELECT current_user;` |
| Exit psql | `\q` |

---

## 🗄️ Database Operations

```sql
-- Create database
CREATE DATABASE mydb;

-- Drop database
DROP DATABASE mydb;

-- Connect to it
\c mydb
```

---

## 📋 Table Operations

### Create Table

```sql
CREATE TABLE students (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) UNIQUE,
  roll       INT          UNIQUE NOT NULL,
  age        INT          NOT NULL,
  cgpa       DECIMAL(3,2),
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

| Keyword | Meaning |
|---|---|
| `SERIAL` | Auto-increment integer (1, 2, 3...) |
| `PRIMARY KEY` | Unique identifier — cannot be NULL or duplicate |
| `NOT NULL` | Field must have a value |
| `UNIQUE` | No two rows can have the same value |
| `DEFAULT NOW()` | Auto sets current time if not provided |
| `VARCHAR(n)` | Text with max n characters |
| `DECIMAL(3,2)` | Number like 3.85 (3 digits, 2 after decimal) |

---

### UNIQUE Constraint

```sql
-- UNIQUE on single column
CREATE TABLE students (
  email VARCHAR(100) UNIQUE,
  roll  INT UNIQUE
);

-- Add UNIQUE to existing column
ALTER TABLE students ADD CONSTRAINT unique_email UNIQUE (email);
ALTER TABLE students ADD CONSTRAINT unique_roll  UNIQUE (roll);

-- Remove UNIQUE constraint
ALTER TABLE students DROP CONSTRAINT unique_email;

-- UNIQUE on multiple columns together (combination must be unique)
CREATE TABLE enrollments (
  student_id INT,
  course_id  INT,
  UNIQUE (student_id, course_id)   -- same student can't enroll in same course twice
);
```

> 🧠 `PRIMARY KEY` = `UNIQUE` + `NOT NULL` together. `UNIQUE` alone still allows one `NULL`.

---

### Alter Table

```sql
-- Add a new column
ALTER TABLE students ADD COLUMN email VARCHAR(100);

-- Add UNIQUE to existing column
ALTER TABLE students ADD CONSTRAINT unique_email UNIQUE (email);

-- Remove a column
ALTER TABLE students DROP COLUMN email;

-- Rename a column
ALTER TABLE students RENAME COLUMN cgpa TO gpa;

-- Change column data type
ALTER TABLE students ALTER COLUMN age TYPE BIGINT;

-- Add NOT NULL constraint
ALTER TABLE students ALTER COLUMN name SET NOT NULL;

-- Remove NOT NULL constraint
ALTER TABLE students ALTER COLUMN department DROP NOT NULL;

-- Rename the table
ALTER TABLE students RENAME TO learners;
```

---

### Drop Table

```sql
-- Delete table completely
DROP TABLE students;

-- Delete only if it exists (no error if missing)
DROP TABLE IF EXISTS students;
```

---

## 📝 Data Manipulation (CRUD)

### INSERT

```sql
-- Insert one row
INSERT INTO students (name, email, roll, age, cgpa, department)
VALUES ('Ahmed Hassan', 'ahmed@example.com', 101, 20, 3.85, 'Computer Science');

-- Insert multiple rows
INSERT INTO students (name, email, roll, age, cgpa, department)
VALUES
  ('Sara Islam',   'sara@example.com',   102, 22, 3.92, 'Electrical'),
  ('Ravi Kumar',   'ravi@example.com',   103, 21, 3.45, 'Mathematics'),
  ('Fatima Noor',  'fatima@example.com', 104, 23, 3.70, 'Physics'),
  ('John Smith',   'john@example.com',   105, 20, 3.10, 'Civil');
```

---

### SELECT

```sql
-- Get all rows and columns
SELECT * FROM students;

-- Get specific columns
SELECT name, cgpa FROM students;

-- With condition
SELECT * FROM students WHERE department = 'Computer Science';

-- Multiple conditions
SELECT * FROM students WHERE age > 20 AND cgpa >= 3.5;

-- OR condition
SELECT * FROM students WHERE department = 'Physics' OR department = 'Mathematics';
```

---

### UPDATE

```sql
-- Update one field
UPDATE students SET cgpa = 3.95 WHERE id = 1;

-- Update multiple fields
UPDATE students SET age = 21, department = 'CSE' WHERE id = 1;
```

---

### DELETE

```sql
-- Delete a specific row
DELETE FROM students WHERE id = 1;

-- Delete all rows (keeps table structure)
DELETE FROM students;
```

---

## 🔢 Sorting, Limiting & Offset

```sql
-- Sort ascending (A→Z, 1→100)
SELECT * FROM students ORDER BY cgpa ASC;

-- Sort descending (highest first)
SELECT * FROM students ORDER BY cgpa DESC;

-- Limit results
SELECT * FROM students LIMIT 5;

-- Skip first 5, get next 5 (pagination)
SELECT * FROM students OFFSET 5 LIMIT 5;

-- Combined
SELECT * FROM students ORDER BY cgpa DESC LIMIT 3;
```

---

## 📊 Aggregate Functions

```sql
SELECT COUNT(*) FROM students;        -- total rows
SELECT SUM(cgpa)  FROM students;      -- sum
SELECT AVG(cgpa)  FROM students;      -- average
SELECT MAX(cgpa)  FROM students;      -- highest
SELECT MIN(cgpa)  FROM students;      -- lowest
```

---

## 🗂️ GROUP BY & HAVING

```sql
-- Count students per department
SELECT department, COUNT(*) AS total
FROM students
GROUP BY department;

-- Average CGPA per department
SELECT department, AVG(cgpa) AS avg_cgpa
FROM students
GROUP BY department;

-- HAVING — filter after grouping (like WHERE but for groups)
SELECT department, AVG(cgpa) AS avg_cgpa
FROM students
GROUP BY department
HAVING AVG(cgpa) >= 3.5;

-- Combined example
SELECT department, COUNT(*) AS total, AVG(cgpa) AS avg_cgpa
FROM students
GROUP BY department
HAVING COUNT(*) > 1
ORDER BY avg_cgpa DESC
LIMIT 3;
```

> 🧠 **WHERE** filters rows before grouping. **HAVING** filters groups after grouping.

---

## 🔤 String Operations

```sql
SELECT UPPER(name)                          FROM students;  -- AHMED HASSAN
SELECT LOWER(name)                          FROM students;  -- ahmed hassan
SELECT LENGTH(name)                         FROM students;  -- 12
SELECT TRIM(name)                           FROM students;  -- removes spaces
SELECT name || ' - ' || department          FROM students;  -- Ahmed Hassan - CSE
SELECT CONCAT(name, ' - ', department)      FROM students;  -- same as above
SELECT SUBSTRING(name FROM 1 FOR 5)         FROM students;  -- Ahmed
SELECT REPLACE(department,'Computer','CSE') FROM students;  -- CSE Science

-- LIKE pattern matching
SELECT * FROM students WHERE name LIKE 'A%';      -- starts with A
SELECT * FROM students WHERE name LIKE '%son';    -- ends with son
SELECT * FROM students WHERE name LIKE '%ah%';    -- contains ah
SELECT * FROM students WHERE name ILIKE '%ahmed%';-- case-insensitive
```

---

## 🔀 CASE (If-Else in SQL)

```sql
-- Grade by CGPA
SELECT name, cgpa,
  CASE
    WHEN cgpa >= 3.75 THEN 'A+'
    WHEN cgpa >= 3.50 THEN 'A'
    WHEN cgpa >= 3.00 THEN 'B'
    ELSE 'C'
  END AS grade
FROM students;

-- Label by age group
SELECT name, age,
  CASE
    WHEN age < 20            THEN 'Junior'
    WHEN age BETWEEN 20 AND 22 THEN 'Mid'
    ELSE                          'Senior'
  END AS level
FROM students;
```

---

## 🔗 Relationships & Joins

---

### One to Many

> One **department** has many **students** — a student belongs to one department.

```sql
-- 1. Create parent table first
CREATE TABLE departments (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- 2. Create child table with foreign key
CREATE TABLE students (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  roll          INT UNIQUE NOT NULL,
  cgpa          DECIMAL(3,2),
  department_id INT REFERENCES departments(id)  -- Foreign Key → links to departments
);
```

**Insert sample data:**

```sql
INSERT INTO departments (name) VALUES
  ('Computer Science'),
  ('Electrical'),
  ('Mathematics');

-- department_id 1 = Computer Science, 2 = Electrical, 3 = Mathematics
INSERT INTO students (name, roll, cgpa, department_id) VALUES
  ('Ahmed Hassan', 101, 3.85, 1),
  ('Sara Islam',   102, 3.92, 2),
  ('Ravi Kumar',   103, 3.45, 3),
  ('Fatima Noor',  104, 3.70, 1),
  ('John Smith',   105, 3.10, 2);
```

**How data looks:**

`departments` table:
| id | name |
|---|---|
| 1 | Computer Science |
| 2 | Electrical |
| 3 | Mathematics |

`students` table:
| id | name | roll | cgpa | department_id |
|---|---|---|---|---|
| 1 | Ahmed Hassan | 101 | 3.85 | 1 |
| 2 | Sara Islam | 102 | 3.92 | 2 |
| 3 | Ravi Kumar | 103 | 3.45 | 3 |
| 4 | Fatima Noor | 104 | 3.70 | 1 |
| 5 | John Smith | 105 | 3.10 | 2 |

---

### Many to Many

> One **student** enrolls in many **courses**. One **course** has many **students**.

```sql
-- 1. Students table
CREATE TABLE students (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  roll INT UNIQUE NOT NULL
);

-- 2. Courses table
CREATE TABLE courses (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  fee  DECIMAL(10,2)
);

-- 3. Junction table — links students and courses
CREATE TABLE enrollments (
  id         SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(id),
  course_id  INT REFERENCES courses(id),
  UNIQUE (student_id, course_id)   -- prevent duplicate enrollments
);
```

**Insert sample data:**

```sql
INSERT INTO students (name, roll) VALUES
  ('Ahmed Hassan', 101),
  ('Sara Islam',   102),
  ('Ravi Kumar',   103);

INSERT INTO courses (name, fee) VALUES
  ('Web Development',  299.99),
  ('Data Science',     499.99),
  ('Graphic Design',   199.99);

-- Ahmed → Web Dev, Data Science
-- Sara  → Data Science, Graphic Design
-- Ravi  → Web Dev
INSERT INTO enrollments (student_id, course_id) VALUES
  (1, 1), (1, 2),
  (2, 2), (2, 3),
  (3, 1);
```

**How data looks:**

`courses` table:
| id | name | fee |
|---|---|---|
| 1 | Web Development | 299.99 |
| 2 | Data Science | 499.99 |
| 3 | Graphic Design | 199.99 |

`enrollments` table:
| id | student_id | course_id |
|---|---|---|
| 1 | 1 (Ahmed) | 1 (Web Dev) |
| 2 | 1 (Ahmed) | 2 (Data Science) |
| 3 | 2 (Sara) | 2 (Data Science) |
| 4 | 2 (Sara) | 3 (Graphic Design) |
| 5 | 3 (Ravi) | 1 (Web Dev) |

---

### INNER JOIN

> Returns only rows where there is a **match in both tables**.

```sql
-- Students with their department name (One to Many)
SELECT s.name, s.cgpa, d.name AS department
FROM students s
INNER JOIN departments d ON s.department_id = d.id;
```

**Result:**
| name | cgpa | department |
|---|---|---|
| Ahmed Hassan | 3.85 | Computer Science |
| Sara Islam | 3.92 | Electrical |
| Ravi Kumar | 3.45 | Mathematics |
| Fatima Noor | 3.70 | Computer Science |
| John Smith | 3.10 | Electrical |

```sql
-- Students with their enrolled courses (Many to Many)
SELECT s.name, c.name AS course, c.fee
FROM students s
INNER JOIN enrollments e ON s.id = e.student_id
INNER JOIN courses c     ON e.course_id = c.id;
```

**Result:**
| name | course | fee |
|---|---|---|
| Ahmed Hassan | Web Development | 299.99 |
| Ahmed Hassan | Data Science | 499.99 |
| Sara Islam | Data Science | 499.99 |
| Sara Islam | Graphic Design | 199.99 |
| Ravi Kumar | Web Development | 299.99 |

---

### LEFT JOIN

> Returns **all rows from the left table**, with matching rows from right.
> No match → right side shows `NULL`.

```sql
-- All students even those with no department
SELECT s.name, d.name AS department
FROM students s
LEFT JOIN departments d ON s.department_id = d.id;
```

**Result** (if one student has no department):
| name | department |
|---|---|
| Ahmed Hassan | Computer Science |
| Sara Islam | Electrical |
| Ravi Kumar | Mathematics |
| New Student | NULL |

```sql
-- All students and their courses (including students not enrolled in anything)
SELECT s.name, c.name AS course
FROM students s
LEFT JOIN enrollments e ON s.id = e.student_id
LEFT JOIN courses c     ON e.course_id = c.id;
```

---

### INNER vs LEFT JOIN

| | INNER JOIN | LEFT JOIN |
|---|---|---|
| Returns | Only matched rows | All left rows + matched right rows |
| No match | Row excluded | Row kept, right side = NULL |
| Use when | You need only linked data | You need all records even if unlinked |

---

## 🔗➕ JOIN with GROUP BY, HAVING & Aggregates

> Using the same `students` and `departments` tables from One-to-Many above.

---

### Example 1 — Count students per department

```sql
SELECT d.name AS department, COUNT(s.id) AS total_students
FROM departments d
INNER JOIN students s ON s.department_id = d.id
GROUP BY d.name
ORDER BY total_students DESC;
```

**Result:**
| department | total_students |
|---|---|
| Computer Science | 2 |
| Electrical | 2 |
| Mathematics | 1 |

> 🧠 `JOIN` brings the department name. `COUNT` counts students. `GROUP BY` groups per department.

---

### Example 2 — Average CGPA per department

```sql
SELECT d.name AS department, ROUND(AVG(s.cgpa), 2) AS avg_cgpa
FROM departments d
INNER JOIN students s ON s.department_id = d.id
GROUP BY d.name
ORDER BY avg_cgpa DESC;
```

**Result:**
| department | avg_cgpa |
|---|---|
| Computer Science | 3.78 |
| Electrical | 3.51 |
| Mathematics | 3.45 |

> 🧠 `AVG` calculates average CGPA. `ROUND(..., 2)` keeps 2 decimal places.

---

### Example 3 — Only departments where avg CGPA >= 3.5 (HAVING)

```sql
SELECT d.name AS department,
       COUNT(s.id)        AS total_students,
       ROUND(AVG(s.cgpa), 2) AS avg_cgpa
FROM departments d
INNER JOIN students s ON s.department_id = d.id
GROUP BY d.name
HAVING AVG(s.cgpa) >= 3.5
ORDER BY avg_cgpa DESC;
```

**Result:**
| department | total_students | avg_cgpa |
|---|---|---|
| Computer Science | 2 | 3.78 |
| Electrical | 2 | 3.51 |

> 🧠 `HAVING AVG(...) >= 3.5` filters out groups (departments) where average CGPA is below 3.5. Mathematics (3.45) is excluded.

---

### Example 4 — Highest & lowest CGPA per department

```sql
SELECT d.name AS department,
       MAX(s.cgpa) AS highest_cgpa,
       MIN(s.cgpa) AS lowest_cgpa
FROM departments d
INNER JOIN students s ON s.department_id = d.id
GROUP BY d.name
ORDER BY highest_cgpa DESC;
```

**Result:**
| department | highest_cgpa | lowest_cgpa |
|---|---|---|
| Computer Science | 3.85 | 3.70 |
| Electrical | 3.92 | 3.10 |
| Mathematics | 3.45 | 3.45 |

---

### Example 5 — Departments with more than 1 student AND avg CGPA > 3.5

```sql
SELECT d.name AS department,
       COUNT(s.id)           AS total_students,
       ROUND(AVG(s.cgpa), 2) AS avg_cgpa,
       MAX(s.cgpa)           AS top_cgpa
FROM departments d
INNER JOIN students s ON s.department_id = d.id
GROUP BY d.name
HAVING COUNT(s.id) > 1 AND AVG(s.cgpa) > 3.5
ORDER BY avg_cgpa DESC;
```

**Result:**
| department | total_students | avg_cgpa | top_cgpa |
|---|---|---|---|
| Computer Science | 2 | 3.78 | 3.85 |
| Electrical | 2 | 3.51 | 3.92 |

> 🧠 Multiple conditions in `HAVING` work just like `WHERE` — use `AND` / `OR`.

---

### Example 6 — Many-to-Many: count enrollments per course

> Using `students`, `courses`, and `enrollments` tables.

```sql
SELECT c.name AS course,
       COUNT(e.student_id) AS total_enrolled,
       c.fee
FROM courses c
INNER JOIN enrollments e ON e.course_id = c.id
GROUP BY c.name, c.fee
ORDER BY total_enrolled DESC;
```

**Result:**
| course | total_enrolled | fee |
|---|---|---|
| Web Development | 2 | 299.99 |
| Data Science | 2 | 499.99 |
| Graphic Design | 1 | 199.99 |

---

### Example 7 — Many-to-Many: students enrolled in more than 1 course

```sql
SELECT s.name,
       COUNT(e.course_id) AS courses_enrolled
FROM students s
INNER JOIN enrollments e ON e.student_id = s.id
GROUP BY s.name
HAVING COUNT(e.course_id) > 1
ORDER BY courses_enrolled DESC;
```

**Result:**
| name | courses_enrolled |
|---|---|
| Ahmed Hassan | 2 |
| Sara Islam | 2 |

> 🧠 Ravi is excluded because he enrolled in only 1 course.

---

### Quick Summary

| Clause | Role |
|---|---|
| `JOIN` | Combines rows from multiple tables |
| `GROUP BY` | Groups combined rows by a column |
| `COUNT / SUM / AVG / MAX / MIN` | Calculates one value per group |
| `HAVING` | Filters groups (like `WHERE` but after grouping) |
| `ORDER BY` | Sorts the final result |

---

## 🧠 Query Order of Execution

```sql
SELECT department, COUNT(*) AS total   -- 5. select columns
FROM students                          -- 1. from this table
WHERE age > 18                         -- 2. filter rows
GROUP BY department                    -- 3. group them
HAVING COUNT(*) > 1                    -- 4. filter groups
ORDER BY total DESC                    -- 6. sort
LIMIT 5;                               -- 7. limit results
```

---

## 📌 Data Types Quick Reference

| Type | Use For | Example |
|---|---|---|
| `SERIAL` | Auto-increment ID | 1, 2, 3... |
| `INT` | Whole numbers | 20, 100 |
| `BIGINT` | Large whole numbers | 9999999999 |
| `DECIMAL(p,s)` | Precise decimals | 3.85 |
| `VARCHAR(n)` | Text with limit | 'Ahmed' |
| `TEXT` | Unlimited text | Long description |
| `BOOLEAN` | True/false | true, false |
| `TIMESTAMP` | Date and time | 2024-01-15 10:30:00 |
| `DATE` | Date only | 2024-01-15 |

---

## 📌 Constraints Quick Reference

| Constraint | Meaning | Example |
|---|---|---|
| `PRIMARY KEY` | Unique + Not Null — row identifier | `id SERIAL PRIMARY KEY` |
| `NOT NULL` | Must have a value | `name VARCHAR(100) NOT NULL` |
| `UNIQUE` | No duplicate values allowed | `email VARCHAR(100) UNIQUE` |
| `DEFAULT` | Auto value if not provided | `created_at TIMESTAMP DEFAULT NOW()` |
| `REFERENCES` | Foreign key — links to another table | `dept_id INT REFERENCES departments(id)` |
| `CHECK` | Custom validation rule | `age INT CHECK (age >= 18)` |