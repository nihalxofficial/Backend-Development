# Node.js + Express + Mongoose + MongoDB Atlas Setup Guide

> REST API built with **Node.js**, **Express** (web framework), **Mongoose** (ODM), and **MongoDB Atlas** (cloud database).

---

## 🧠 Why Each Piece Exists

| Tool | Why You Need It |
|---|---|
| **Node.js** | JavaScript runtime — runs JS on the server |
| **Express** | Web framework — handles routes and HTTP requests |
| **Mongoose** | ODM for MongoDB — define schemas and talk to DB with JS objects |
| **MongoDB Atlas** | Free cloud MongoDB database — no local DB setup needed |
| **dotenv** | Loads `.env` secrets into `process.env` |
| **cors** | Allows frontend apps on different origins to call your API |
| **nodemon** | Auto-restarts server on file changes during development |

---

## 📁 Project Structure

```
mongoose-app/
├── server.js        # Main file — routes, DB connection, schema
├── .env             # Secret environment variables (never commit)
├── .env.example     # Safe template to commit to Git
├── .gitignore
└── package.json
```

---

## 🚀 Step-by-Step Setup

### 1. Create Project Folder

```bash
mkdir mongoose-app
cd mongoose-app
```

---

### 2. Initialize npm

```bash
npm init -y
```

---

### 3. Install Dependencies

```bash
# Runtime
npm install express mongoose dotenv cors

# Dev
npm install -D nodemon
```

---

### 4. Add Scripts to `package.json`

```json
"scripts": {
  "dev": "nodemon server.js",
  "start": "node server.js"
}
```

---

### 5. Create MongoDB Atlas Database

1. Go to **[mongodb.com/atlas](https://www.mongodb.com/atlas)** and sign up
2. Click **Create a Free Cluster**
3. Choose a cloud provider and region
4. Click **Create Deployment**
5. Set a **username** and **password** — save these
6. Go to **Database → Connect → Drivers**
7. Copy the connection string:

```
mongodb+srv://username:password@cluster.mongodb.net/mydb?retryWrites=true&w=majority
```

8. Go to **Network Access → Add IP Address → Allow Access from Anywhere**

---

### 6. Create `.env`

```env
PORT=5000
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/mydb?retryWrites=true&w=majority"
```

---

### 7. Create `.env.example`

```env
PORT=5000
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/mydb?retryWrites=true&w=majority"
```

---

### 8. Create `.gitignore`

```
node_modules/
.env
```

---

### 9. Create `server.js`

```javascript
const express = require('express')
const mongoose = require('mongoose');
const dotenv = require("dotenv")
const cors = require("cors");

dotenv.config()

const app = express()
const port = process.env.PORT
const uri = process.env.MONGODB_URI
const { Schema } = mongoose;

app.use(cors())
app.use(express.json())

// Connect to MongoDB Atlas
mongoose.connect(uri).then(() => console.log("Connected Mongoose to Atlas"));

// Student Schema — defines the shape of documents in the collection
const StudentSchema = new Schema({
  name:       { type: String, required: true },
  age:        { type: Number, required: true, min: 18 },
  department: { type: String },
  cgpa:       { type: Number }
}, { timestamps: true })  // auto adds createdAt and updatedAt

// Model — the interface to query the students collection
const Student = mongoose.model('Student', StudentSchema);

// Routes go here...

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
```

---

### 10. Run the Server

```bash
npm run dev
```

Server starts at **http://localhost:5000** ✅

---

## 🧠 Key Concepts

### Schema vs Model

```javascript
// Schema — just the shape/rules of the data
const StudentSchema = new Schema({
  name: { type: String, required: true },
  age:  { type: Number, min: 18 },
})

// Model — the actual tool you use to query the DB
const Student = mongoose.model('Student', StudentSchema);
//                              ^^^^^^^^^^  ^^^^^^^^^^^^^
//                              Collection  Schema to use
//                              name in DB
```

| | Schema | Model |
|---|---|---|
| What it is | Blueprint / rules | Query interface |
| Used for | Defining structure | find, create, update, delete |

---

### Schema Field Options

```javascript
const StudentSchema = new Schema({
  name: { type: String, required: true },   // must be provided
  age:  { type: Number, min: 18 },          // minimum value validation
  cgpa: { type: Number },                   // optional field
}, { timestamps: true })                    // auto createdAt & updatedAt
```

| Option | What it does |
|---|---|
| `required: true` | Field must be provided or request fails |
| `min: 18` | Minimum value — rejects anything below |
| `timestamps: true` | Auto adds `createdAt` and `updatedAt` |

---

### `_id` in MongoDB vs `id` in SQL

MongoDB auto generates a unique `_id` for every document:

```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "name": "Ahmed Hassan",
  "age": 20
}
```

> Unlike SQL where `id` is a number (1, 2, 3...), MongoDB `_id` is a long random string called **ObjectId**.

---

### `timestamps: true` — Auto Time Fields

```javascript
// You never send these — Mongoose handles them automatically
{
  "createdAt": "2024-01-15T10:30:00.000Z",   // set on create, never changes
  "updatedAt": "2024-01-20T14:45:00.000Z"    // updates on every save
}
```

---

### Sort in Mongoose

```javascript
// -1 = descending (highest first)
// 1  = ascending  (lowest first)
Student.find().sort({ cgpa: -1 })   // highest CGPA first
Student.find().sort({ name: 1 })    // A → Z
```

---

## ✅ Quick Command Reference

```bash
npm init -y                   # Initialize project
npm install express mongoose dotenv cors    # Install packages
npm install -D nodemon        # Install dev dependency
npm run dev                   # Start dev server (with nodemon)
npm start                     # Start production server
```

---

## ⚠️ Common Issues

| Error | Fix |
|---|---|
| `MongoServerError: bad auth` | Wrong username/password in `MONGODB_URI` |
| `MongoNetworkError` | IP not whitelisted in Atlas Network Access |
| `Cannot read .env` | Make sure `dotenv.config()` is at the top |
| `port undefined` | Check `.env` has `PORT=5000` |
| `ValidationError` | Required field missing in request body |
| Changes not reflecting | Make sure nodemon is running via `npm run dev` |