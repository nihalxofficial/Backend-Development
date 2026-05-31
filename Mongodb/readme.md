# MongoDB Quick Reference Guide

> A clean, simple guide for MongoDB — using **NoSQLBooster** GUI tool.

---

## 🛠️ NoSQLBooster Setup

1. Download from **[nosqlbooster.com](https://nosqlbooster.com)** and install
2. Open NoSQLBooster
3. Click **"Connect"** → **"New Connection"**
4. Paste your **MongoDB Atlas connection string**:
```
mongodb+srv://username:password@cluster.mongodb.net/mydb
```
5. Click **"Test Connection"** → then **"Save & Connect"**

---

## 🖥️ NoSQLBooster UI Overview

| Panel | What it does |
|---|---|
| **Left sidebar** | Shows all databases and collections |
| **Shell tab** | Write and run MongoDB queries |
| **Result tab** | See query results in Table / Tree / JSON view |
| **Collection tab** | Browse, filter, edit documents visually |
| **Server Monitor** | See DB stats, connections, memory usage |

---

## 🗄️ Database Operations

> In NoSQLBooster — right click on the left sidebar to create/drop databases and collections visually. Or use the Shell tab:

```js
// Create or switch to a database
use mydb

// Drop current database
db.dropDatabase()
```

> 🧠 MongoDB creates the database automatically when you first insert data.

---

## 📋 Collection Operations

> In MongoDB, **Collection = Table** and **Document = Row**

```js
// Create collection
db.createCollection("students")

// Drop a collection
db.students.drop()

// Show all collections
show collections
```

> ✅ In NoSQLBooster you can also right-click any collection → **Drop Collection** or **Create Collection** from the sidebar.

---

## 📌 MongoDB vs PostgreSQL — Key Differences

| PostgreSQL | MongoDB | Meaning |
|---|---|---|
| Database | Database | Same concept |
| Table | Collection | Group of records |
| Row | Document | Single record |
| Column | Field | Single data point |
| Primary Key (`id`) | `_id` (ObjectId) | Unique identifier |
| Foreign Key | Reference (manual) | Link to another document |
| JOIN | `$lookup` | Combine collections |
| Schema required | Schema optional | Structure flexibility |

---

## 📝 Data Manipulation (CRUD)

> Write all queries in the **Shell tab** of NoSQLBooster and press **F5** or click **Run** to execute.

### INSERT

```js
// Insert one document
db.students.insertOne({
  name: "Ahmed Hassan",
  email: "ahmed@example.com",
  roll: 101,
  age: 20,
  cgpa: 3.85,
  department: "Computer Science"
})

// Insert multiple documents
db.students.insertMany([
  { name: "Sara Islam",  email: "sara@example.com",   roll: 102, age: 22, cgpa: 3.92, department: "Electrical" },
  { name: "Ravi Kumar",  email: "ravi@example.com",   roll: 103, age: 21, cgpa: 3.45, department: "Mathematics" },
  { name: "Fatima Noor", email: "fatima@example.com", roll: 104, age: 23, cgpa: 3.70, department: "Physics" },
  { name: "John Smith",  email: "john@example.com",   roll: 105, age: 20, cgpa: 3.10, department: "Civil" }
])
```

---

### SELECT (find)

```js
// Get all documents
db.students.find()

// Get specific fields only (1 = show, 0 = hide)
db.students.find({}, { name: 1, cgpa: 1, _id: 0 })

// With condition
db.students.find({ department: "Computer Science" })

// Greater than / Less than
db.students.find({ age: { $gt: 20 } })    // age > 20
db.students.find({ cgpa: { $gte: 3.5 } }) // cgpa >= 3.5
db.students.find({ age: { $lt: 22 } })    // age < 22

// Multiple conditions (AND)
db.students.find({ age: { $gt: 20 }, cgpa: { $gte: 3.5 } })

// OR condition
db.students.find({ $or: [{ department: "Physics" }, { department: "Mathematics" }] })

// Find one document
db.students.findOne({ roll: 101 })
```

> ✅ In NoSQLBooster results appear in **Table view** — you can click any document to edit it directly.

---

### Comparison Operators

| Operator | Meaning | Example |
|---|---|---|
| `$eq` | Equal | `{ age: { $eq: 20 } }` |
| `$ne` | Not equal | `{ age: { $ne: 20 } }` |
| `$gt` | Greater than | `{ age: { $gt: 18 } }` |
| `$gte` | Greater than or equal | `{ cgpa: { $gte: 3.5 } }` |
| `$lt` | Less than | `{ age: { $lt: 25 } }` |
| `$lte` | Less than or equal | `{ cgpa: { $lte: 4.0 } }` |
| `$in` | Match any in array | `{ dept: { $in: ["CSE","EEE"] } }` |
| `$nin` | Not in array | `{ dept: { $nin: ["Civil"] } }` |

---

### UPDATE

```js
// Update one document
db.students.updateOne(
  { roll: 101 },             // filter — who to update
  { $set: { cgpa: 3.95 } }  // what to update
)

// Update multiple fields
db.students.updateOne(
  { roll: 101 },
  { $set: { cgpa: 3.95, department: "CSE" } }
)

// Update many documents
db.students.updateMany(
  { department: "Electrical" },
  { $set: { department: "EEE" } }
)

// Increment a value
db.students.updateOne(
  { roll: 101 },
  { $inc: { age: 1 } }  // age + 1
)
```

| Update Operator | Meaning |
|---|---|
| `$set` | Set / update a field value |
| `$unset` | Remove a field |
| `$inc` | Increment a number field |
| `$push` | Add item to an array field |
| `$pull` | Remove item from an array field |

> ✅ In NoSQLBooster you can also double-click any cell in Table view to edit directly without writing a query.

---

### DELETE

```js
// Delete one document
db.students.deleteOne({ roll: 101 })

// Delete many documents
db.students.deleteMany({ department: "Civil" })

// Delete all documents in collection
db.students.deleteMany({})
```

> ✅ In NoSQLBooster right-click any document → **Delete Document** to delete without writing a query.

---

## 🔢 Sorting, Limiting & Skip

```js
// Sort ascending (1 = A→Z / lowest first)
db.students.find().sort({ cgpa: 1 })

// Sort descending (-1 = highest first)
db.students.find().sort({ cgpa: -1 })

// Limit results
db.students.find().limit(3)

// Skip first 3, get next 3 (pagination)
db.students.find().skip(3).limit(3)

// Top 3 highest CGPA
db.students.find().sort({ cgpa: -1 }).limit(3)
```

---

## 📊 Aggregation (GROUP BY equivalent)

```js
// Count all documents
db.students.countDocuments()

// Count with condition
db.students.countDocuments({ department: "CSE" })

// Group by department — count per department
db.students.aggregate([
  { $group: { _id: "$department", total: { $sum: 1 } } }
])

// Average CGPA per department
db.students.aggregate([
  { $group: { _id: "$department", avg_cgpa: { $avg: "$cgpa" } } }
])

// HAVING equivalent — filter groups
db.students.aggregate([
  { $group: { _id: "$department", total: { $sum: 1 }, avg_cgpa: { $avg: "$cgpa" } } },
  { $match: { avg_cgpa: { $gte: 3.5 } } }
])

// Full pipeline — group, filter, sort, limit
db.students.aggregate([
  { $group: { _id: "$department", total: { $sum: 1 }, avg_cgpa: { $avg: "$cgpa" } } },
  { $match: { total: { $gt: 1 } } },
  { $sort:  { avg_cgpa: -1 } },
  { $limit: 3 }
])
```

> ✅ In NoSQLBooster — use the **Aggregation Editor** (toolbar → Aggregation) to build pipelines stage by stage visually.

---

## 🔤 String Operations

```js
// Find by regex pattern
db.students.find({ name: /^A/ })       // starts with A
db.students.find({ name: /n$/ })       // ends with n
db.students.find({ name: /ah/i })      // contains ah (case-insensitive)

// In aggregation
db.students.aggregate([
  { $project: { name: { $toUpper: "$name" } } }              // UPPERCASE
])
db.students.aggregate([
  { $project: { name: { $toLower: "$name" } } }              // lowercase
])
db.students.aggregate([
  { $project: { nameLength: { $strLenCP: "$name" } } }       // length
])
db.students.aggregate([
  { $project: { info: { $concat: ["$name", " - ", "$department"] } } } // concat
])
```

---

## 🔀 CASE equivalent — $switch

```js
db.students.aggregate([
  {
    $project: {
      name: 1, cgpa: 1,
      grade: {
        $switch: {
          branches: [
            { case: { $gte: ["$cgpa", 3.75] }, then: "A+" },
            { case: { $gte: ["$cgpa", 3.50] }, then: "A"  },
            { case: { $gte: ["$cgpa", 3.00] }, then: "B"  }
          ],
          default: "C"
        }
      }
    }
  }
])
```

---

## 🔗 Relationships

---

### One to Many

> One **department** has many **students**.

```js
// Insert departments
db.departments.insertMany([
  { _id: 1, name: "Computer Science" },
  { _id: 2, name: "Electrical" },
  { _id: 3, name: "Mathematics" }
])

// Insert students with department_id reference
db.students.insertMany([
  { name: "Ahmed Hassan", roll: 101, cgpa: 3.85, department_id: 1 },
  { name: "Sara Islam",   roll: 102, cgpa: 3.92, department_id: 2 },
  { name: "Ravi Kumar",   roll: 103, cgpa: 3.45, department_id: 3 },
  { name: "Fatima Noor",  roll: 104, cgpa: 3.70, department_id: 1 },
  { name: "John Smith",   roll: 105, cgpa: 3.10, department_id: 2 }
])
```

**departments collection:**
| _id | name |
|---|---|
| 1 | Computer Science |
| 2 | Electrical |
| 3 | Mathematics |

**students collection:**
| name | roll | cgpa | department_id |
|---|---|---|---|
| Ahmed Hassan | 101 | 3.85 | 1 |
| Sara Islam | 102 | 3.92 | 2 |
| Ravi Kumar | 103 | 3.45 | 3 |
| Fatima Noor | 104 | 3.70 | 1 |
| John Smith | 105 | 3.10 | 2 |

---

### Many to Many

> One **student** enrolls in many **courses**. One **course** has many **students**.
> Use a **bridge collection** with two reference IDs.

```js
db.students.insertMany([
  { _id: 1, name: "Ahmed Hassan", roll: 101 },
  { _id: 2, name: "Sara Islam",   roll: 102 },
  { _id: 3, name: "Ravi Kumar",   roll: 103 }
])

db.courses.insertMany([
  { _id: 1, name: "Web Development", fee: 299.99 },
  { _id: 2, name: "Data Science",    fee: 499.99 },
  { _id: 3, name: "Graphic Design",  fee: 199.99 }
])

// Bridge collection
db.enrollments.insertMany([
  { student_id: 1, course_id: 1 },  // Ahmed → Web Dev
  { student_id: 1, course_id: 2 },  // Ahmed → Data Science
  { student_id: 2, course_id: 2 },  // Sara  → Data Science
  { student_id: 2, course_id: 3 },  // Sara  → Graphic Design
  { student_id: 3, course_id: 1 }   // Ravi  → Web Dev
])
```

**courses collection:**
| _id | name | fee |
|---|---|---|
| 1 | Web Development | 299.99 |
| 2 | Data Science | 499.99 |
| 3 | Graphic Design | 199.99 |

**enrollments collection (bridge):**
| student_id | course_id |
|---|---|
| 1 (Ahmed) | 1 (Web Dev) |
| 1 (Ahmed) | 2 (Data Science) |
| 2 (Sara) | 2 (Data Science) |
| 2 (Sara) | 3 (Graphic Design) |
| 3 (Ravi) | 1 (Web Dev) |

---

### $lookup (JOIN equivalent)

```js
// One to Many — students with their department name
db.students.aggregate([
  {
    $lookup: {
      from: "departments",
      localField: "department_id",
      foreignField: "_id",
      as: "department_info"
    }
  },
  { $unwind: "$department_info" }
])
```

**Result:**
| name | roll | cgpa | department_info.name |
|---|---|---|---|
| Ahmed Hassan | 101 | 3.85 | Computer Science |
| Sara Islam | 102 | 3.92 | Electrical |
| Ravi Kumar | 103 | 3.45 | Mathematics |
| Fatima Noor | 104 | 3.70 | Computer Science |
| John Smith | 105 | 3.10 | Electrical |

```js
// Many to Many — students with their enrolled courses
db.enrollments.aggregate([
  {
    $lookup: {
      from: "students",
      localField: "student_id",
      foreignField: "_id",
      as: "student"
    }
  },
  { $unwind: "$student" },
  {
    $lookup: {
      from: "courses",
      localField: "course_id",
      foreignField: "_id",
      as: "course"
    }
  },
  { $unwind: "$course" },
  {
    $project: {
      _id: 0,
      student_name: "$student.name",
      course_name:  "$course.name",
      fee:          "$course.fee"
    }
  }
])
```

**Result:**
| student_name | course_name | fee |
|---|---|---|
| Ahmed Hassan | Web Development | 299.99 |
| Ahmed Hassan | Data Science | 499.99 |
| Sara Islam | Data Science | 499.99 |
| Sara Islam | Graphic Design | 199.99 |
| Ravi Kumar | Web Development | 299.99 |

> ✅ In NoSQLBooster — results show in **Table view**. Click any column header to sort. Use the **export button** to export results as CSV or JSON.

---

## 💡 NoSQLBooster Tips

| Feature | How to Use |
|---|---|
| Run query | Press **F5** or click the ▶ Run button |
| Auto-complete | Start typing — IntelliSense suggests fields and operators |
| View modes | Switch between **Table / Tree / JSON** in result panel |
| Edit document | Double-click any cell in Table view to edit inline |
| Export results | Click **Export** button → save as JSON or CSV |
| Aggregation builder | Toolbar → **Aggregation** → build stages visually |
| SQL query | Toolbar → **SQL** → write SQL and run against MongoDB |
| Server monitor | Toolbar → **Server Monitor** → see DB stats live |
| Multiple tabs | Open multiple Shell tabs for different queries |

---

## 📌 SQL vs MongoDB Cheat Sheet

| SQL | MongoDB |
|---|---|
| `SELECT * FROM students` | `db.students.find()` |
| `SELECT name, cgpa FROM students` | `db.students.find({}, { name:1, cgpa:1 })` |
| `WHERE age > 20` | `{ age: { $gt: 20 } }` |
| `ORDER BY cgpa DESC` | `.sort({ cgpa: -1 })` |
| `LIMIT 5` | `.limit(5)` |
| `OFFSET 5` | `.skip(5)` |
| `GROUP BY department` | `$group: { _id: "$department" }` |
| `HAVING COUNT(*) > 1` | `$match: { total: { $gt: 1 } }` |
| `INNER JOIN` | `$lookup` + `$unwind` |
| `COUNT(*)` | `countDocuments()` |
| `AVG(cgpa)` | `$avg: "$cgpa"` |
| `SUM(cgpa)` | `$sum: "$cgpa"` |
| `MAX(cgpa)` | `$max: "$cgpa"` |
| `MIN(cgpa)` | `$min: "$cgpa"` |