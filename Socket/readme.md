# Real-Time Dashboard with Socket.IO

A guide to integrating Socket.IO into a Node.js/Express backend and Next.js frontend for live dashboard updates.

---

## What We're Building

Whenever a student is **created**, **updated**, or **deleted**, the dashboard automatically refreshes — no manual page reload needed.

```
Client (Next.js)  ←──Socket.IO──→  Server (Express)  ←──→  Database (Prisma)
```

---

## 1. Installation

**Backend:**
```bash
npm install socket.io
```

**Frontend (Next.js):**
```bash
npm install socket.io-client
```

---

## 2. Backend Setup

### Step 1 — Wrap Express with an HTTP Server

Socket.IO requires a raw HTTP server, not `app.listen` directly.

```ts
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
```

### Step 2 — Listen for Connections

```ts
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});
```

### Step 3 — Emit Events on Data Changes

After each database operation, emit a socket event so all connected clients know something changed.

```ts
// Create
app.post('/students', async (req, res) => {
  const result = await prisma.student.create({ data: req.body });

  io.emit("student-created", result);
  io.emit("dashboard-updated");   // triggers dashboard refresh

  res.json(result);
});

// Update
app.patch('/students/:id', async (req, res) => {
  const result = await prisma.student.update({
    where: { id: req.params.id },
    data: req.body,
  });

  io.emit("student-updated", result);
  io.emit("dashboard-updated");

  res.json(result);
});

// Delete
app.delete('/students/:id', async (req, res) => {
  const result = await prisma.student.delete({
    where: { id: req.params.id },
  });

  io.emit("student-deleted", result.id);
  io.emit("dashboard-updated");

  res.json(result);
});
```

> **Pattern:** Two events are emitted per mutation — a specific one (`student-created`) for targeted listeners, and a generic `dashboard-updated` for anything that needs a full refresh.

### Step 4 — Start the Server

Replace `app.listen` with `httpServer.listen`:

```ts
httpServer.listen(PORT, () => {
  console.log(`Socket Server running on ${PORT}`);
});
```

---

## 3. Frontend Setup (Next.js)

### Step 1 — Create a Socket Client

`src/lib/socket.ts`

```ts
import { io } from "socket.io-client";

export const socket = io("http://localhost:5000");
```

This creates a **single shared socket instance** reused across the app.

### Step 2 — Listen for Events in the Dashboard

```tsx
"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

export default function DashboardClient({ stats, topPerformers }) {
  const [newStats, setNewStats] = useState(stats);
  const [newTopPerformers, setNewPerformers] = useState(topPerformers);

  useEffect(() => {
    socket.on("dashboard-updated", async () => {
      // Re-fetch fresh data from the API
      const analytics = await fetch("http://localhost:5000/analytics").then(r => r.json());
      const performers = await fetch("http://localhost:5000/top-students").then(r => r.json());

      setNewStats(analytics);
      setNewPerformers(performers);
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off("dashboard-updated");
    };
  }, []);

  // render with newStats and newTopPerformers...
}
```

> **Key principle:** The database is the source of truth. On each socket event, re-fetch from the API rather than trying to patch local state manually.

---

## 4. Event Reference

| Event | Direction | Payload | When |
|---|---|---|---|
| `student-created` | Server → Client | Student object | After `POST /students` |
| `student-updated` | Server → Client | Student object | After `PATCH /students/:id` |
| `student-deleted` | Server → Client | Student ID | After `DELETE /students/:id` |
| `dashboard-updated` | Server → Client | _(none)_ | After any mutation |

---

## 5. How It All Flows

```
User adds a student
        ↓
POST /students  →  Prisma creates record
        ↓
io.emit("dashboard-updated")
        ↓
All connected clients receive the event
        ↓
Dashboard re-fetches /analytics and /top-students
        ↓
React state updates → UI re-renders
```

---

## 6. Learning Path

Once this basic setup is working, here's what to explore next:

1. **Rooms** — Emit to specific groups of users instead of everyone (`io.to(roomId).emit(...)`)
2. **Acknowledgements** — Confirm the client received an event
3. **Redis Adapter** — Scale to multiple server instances (only needed in production with load balancing)

For most projects, steps 1–3 of this guide are all you need.