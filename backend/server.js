require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 5000;

const { auth, connectDb, db } = require("./auth");
const { toNodeHandler, fromNodeHeaders } = require("better-auth/node");

// ── Middleware ──────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      process.env.FRONTEND_URL,
    ],
    credentials: true,
  })
);
app.all("/api/auth/*path", toNodeHandler(auth));
app.use(express.json());

// ── Helpers ─────────────────────────────────────────────────────────
/** Convert MongoDB doc → plain object with string `id` */
function norm(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}
function normAll(docs) { return docs.map(norm); }

/** Safe ObjectId conversion */
function toOid(id) {
  try { return new ObjectId(id); } catch { return null; }
}

const { initDb } = require("./database/init");

// ── Role Middleware ──────────────────────────────────────────────────
async function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
      });

      if (!session || !session.user) {
        return res.status(401).json({ error: "Unauthorized — please log in" });
      }

      const user = session.user;
      const role = user.role || "student";

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ error: `Forbidden — requires: ${allowedRoles.join(" or ")}` });
      }

      req.currentUser = user;
      await next();
    } catch (err) {
      console.error("[requireRole] error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error in role check" });
      }
    }
  };
}

// ════════════════════════════════════════════════════════════════════
//  PUBLIC / STUDENT ROUTES
// ════════════════════════════════════════════════════════════════════

// Academic
app.get("/api/academic", async (req, res) => {
  const [syllabusItems, pyqItems, ebookItems] = await Promise.all([
    db.collection("syllabusItems").find({}).toArray().then(normAll),
    db.collection("pyqItems").find({}).toArray().then(normAll),
    db.collection("ebookItems").find({}).toArray().then(normAll),
  ]);
  res.json({ syllabusItems, pyqItems, ebookItems });
});

// Admin (public read)
app.get("/api/admin", async (req, res) => {
  const [courses, feeItems, events, notices] = await Promise.all([
    db.collection("courses").find({}).toArray().then(normAll),
    db.collection("feeItems").find({}).toArray().then(normAll),
    db.collection("events").find({}).toArray().then(normAll),
    db.collection("notices").find({}).toArray().then(normAll),
  ]);
  res.json({ courses, feeItems, events, notices });
});

// Course register (student action)
app.post("/api/admin/courses/register", async (req, res) => {
  const { code } = req.body;
  const course = await db.collection("courses").findOne({ code });
  if (!course) return res.status(404).json({ error: "Course not found" });
  if (course.enrolled >= course.slots) return res.status(400).json({ error: "Course is full" });
  await db.collection("courses").updateOne({ code }, { $inc: { enrolled: 1 } });
  const updated = await db.collection("courses").findOne({ code });
  res.json({ success: true, course: norm(updated) });
});

// Library
app.get("/api/library", async (req, res) => {
  const [digitalResources, books, journals] = await Promise.all([
    db.collection("digitalResources").find({}).toArray().then(normAll),
    db.collection("books").find({}).toArray().then(normAll),
    db.collection("journals").find({}).toArray().then(normAll),
  ]);
  res.json({ digitalResources, books, journals });
});

// Library book reserve
app.post("/api/library/books/reserve", async (req, res) => {
  const { title } = req.body;
  const book = await db.collection("books").findOne({ title });
  if (!book) return res.status(404).json({ error: "Book not found" });
  if (!book.available) return res.status(400).json({ error: "Book is already reserved" });
  const returnDate = new Date();
  returnDate.setDate(returnDate.getDate() + 14);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dueDate = `${months[returnDate.getMonth()]} ${returnDate.getDate()}`;
  await db.collection("books").updateOne({ title }, { $set: { available: false, dueDate } });
  const updated = await db.collection("books").findOne({ title });
  res.json({ success: true, book: norm(updated) });
});

// Support
app.get("/api/support", async (req, res) => {
  const [existingTickets, scholarships, mhResources] = await Promise.all([
    db.collection("existingTickets").find({}).toArray().then(normAll),
    db.collection("scholarships").find({}).toArray().then(normAll),
    db.collection("mhResources").find({}).toArray().then(normAll),
  ]);
  res.json({ existingTickets, scholarships, mhResources });
});

// Support ticket create
app.post("/api/support/tickets", async (req, res) => {
  const { issue, category, details } = req.body;
  if (!issue) return res.status(400).json({ error: "Issue title is required" });
  const count = await db.collection("existingTickets").countDocuments();
  const ticketId = `TKT-${String(count + 1).padStart(3, "0")}`;
  const newTicket = {
    ticketId,
    issue,
    category: category || "IT",
    details: details || "",
    status: "Open",
    created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    priority: "Medium",
  };
  const result = await db.collection("existingTickets").insertOne(newTicket);
  res.json({ success: true, ticket: norm({ _id: result.insertedId, ...newTicket }) });
});

// Alumni
app.get("/api/alumni", async (req, res) => {
  const [alumni, jobs, careerResources] = await Promise.all([
    db.collection("alumni").find({}).toArray().then(normAll),
    db.collection("jobs").find({}).toArray().then(normAll),
    db.collection("careerResources").find({}).toArray().then(normAll),
  ]);
  res.json({ alumni, jobs, careerResources });
});

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Student dashboard
app.get("/api/student/dashboard", async (req, res) => {
  const [enrolledCourses, feeItems, events, notices] = await Promise.all([
    db.collection("courses").find({}).limit(4).toArray().then(normAll),
    db.collection("feeItems").find({}).toArray().then(normAll),
    db.collection("events").find({}).limit(4).toArray().then(normAll),
    db.collection("notices").find({}).limit(3).toArray().then(normAll),
  ]);
  res.json({ enrolledCourses, feeItems, events, notices });
});

// ════════════════════════════════════════════════════════════════════
//  TEACHER ROUTES
// ════════════════════════════════════════════════════════════════════

// GET all teacher data
app.get("/api/teacher/data", async (req, res) => {
  (await requireRole("teacher", "superadmin"))(req, res, async () => {
    const [teacherSyllabus, classSchedule, teacherBooks, examResults, teacherNotices, teacherMaterials] =
      await Promise.all([
        db.collection("teacherSyllabus").find({}).toArray().then(normAll),
        db.collection("classSchedule").find({}).toArray().then(normAll),
        db.collection("teacherBooks").find({}).toArray().then(normAll),
        db.collection("examResults").find({}).toArray().then(normAll),
        db.collection("teacherNotices").find({}).toArray().then(normAll),
        db.collection("teacherMaterials").find({}).toArray().then(normAll),
      ]);
    res.json({ teacherSyllabus, classSchedule, teacherBooks, examResults, teacherNotices, teacherMaterials });
  });
});

// POST syllabus
app.post("/api/teacher/syllabus", async (req, res) => {
  (await requireRole("teacher", "superadmin"))(req, res, async () => {
    const { code, name, semester } = req.body;
    if (!code || !name || !semester) return res.status(400).json({ error: "code, name and semester required" });
    const isSA = req.currentUser?.role === "superadmin";
    const entry = { code, name, semester, updated: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }), addedBy: req.currentUser?.name || "Teacher", status: isSA ? "approved" : "pending" };
    const result = await db.collection("teacherSyllabus").insertOne(entry);
    res.json({ success: true, entry: norm({ _id: result.insertedId, ...entry }) });
  });
});

// DELETE syllabus
app.delete("/api/teacher/syllabus/:id", async (req, res) => {
  (await requireRole("teacher", "superadmin"))(req, res, async () => {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    await db.collection("teacherSyllabus").deleteOne({ _id: oid });
    res.json({ success: true });
  });
});

// POST schedule
app.post("/api/teacher/schedule", async (req, res) => {
  (await requireRole("teacher", "superadmin"))(req, res, async () => {
    const { course, day, time, room } = req.body;
    if (!course || !day || !time || !room) return res.status(400).json({ error: "course, day, time, room required" });
    const isSA = req.currentUser?.role === "superadmin";
    const entry = { course, day, time, room, teacher: req.currentUser?.name || "Teacher", status: isSA ? "approved" : "pending" };
    const result = await db.collection("classSchedule").insertOne(entry);
    res.json({ success: true, entry: norm({ _id: result.insertedId, ...entry }) });
  });
});

// DELETE schedule
app.delete("/api/teacher/schedule/:id", async (req, res) => {
  (await requireRole("teacher", "superadmin"))(req, res, async () => {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    await db.collection("classSchedule").deleteOne({ _id: oid });
    res.json({ success: true });
  });
});

// POST books
app.post("/api/teacher/books", async (req, res) => {
  (await requireRole("teacher", "superadmin"))(req, res, async () => {
    const { title, author, copies } = req.body;
    if (!title || !author) return res.status(400).json({ error: "title and author required" });
    const isSA = req.currentUser?.role === "superadmin";
    const entry = { title, author, copies: parseInt(copies) || 1, available: true, addedBy: req.currentUser?.name || "Teacher", status: isSA ? "approved" : "pending" };
    const result = await db.collection("teacherBooks").insertOne(entry);
    res.json({ success: true, entry: norm({ _id: result.insertedId, ...entry }) });
  });
});

// DELETE teacher books
app.delete("/api/teacher/books/:id", async (req, res) => {
  (await requireRole("teacher", "superadmin"))(req, res, async () => {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    await db.collection("teacherBooks").deleteOne({ _id: oid });
    res.json({ success: true });
  });
});

// POST exam results
app.post("/api/teacher/results", async (req, res) => {
  (await requireRole("teacher", "superadmin"))(req, res, async () => {
    const { student, studentId, course, grade, marks, semester } = req.body;
    if (!student || !course || !grade) return res.status(400).json({ error: "student, course and grade required" });
    const isSA = req.currentUser?.role === "superadmin";
    const entry = { student, studentId: studentId || "N/A", course, grade, marks: parseInt(marks) || 0, semester: semester || "Spring 2026", addedBy: req.currentUser?.name || "Teacher", status: isSA ? "approved" : "pending" };
    const result = await db.collection("examResults").insertOne(entry);
    res.json({ success: true, entry: norm({ _id: result.insertedId, ...entry }) });
  });
});

// DELETE exam results
app.delete("/api/teacher/results/:id", async (req, res) => {
  (await requireRole("teacher", "superadmin"))(req, res, async () => {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    await db.collection("examResults").deleteOne({ _id: oid });
    res.json({ success: true });
  });
});

// POST teacher notices
app.post("/api/teacher/notices", async (req, res) => {
  (await requireRole("teacher", "superadmin"))(req, res, async () => {
    const { title, body } = req.body;
    if (!title || !body) return res.status(400).json({ error: "title and body required" });
    const isSA = req.currentUser?.role === "superadmin";
    const entry = { title, body, addedBy: req.currentUser?.name || "Teacher", date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), status: isSA ? "approved" : "pending" };
    const result = await db.collection("teacherNotices").insertOne(entry);
    res.json({ success: true, entry: norm({ _id: result.insertedId, ...entry }) });
  });
});

// DELETE teacher notices
app.delete("/api/teacher/notices/:id", async (req, res) => {
  (await requireRole("teacher", "superadmin"))(req, res, async () => {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    await db.collection("teacherNotices").deleteOne({ _id: oid });
    res.json({ success: true });
  });
});

// POST teacher materials
app.post("/api/teacher/materials", async (req, res) => {
  (await requireRole("teacher", "superadmin"))(req, res, async () => {
    const { title, description, url, course, type } = req.body;
    if (!title || !url) return res.status(400).json({ error: "title and url required" });
    const isSA = req.currentUser?.role === "superadmin";
    const entry = { title, description: description || "", url, course: course || "", type: type || "Document", addedBy: req.currentUser?.name || "Teacher", date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), status: isSA ? "approved" : "pending" };
    const result = await db.collection("teacherMaterials").insertOne(entry);
    res.json({ success: true, entry: norm({ _id: result.insertedId, ...entry }) });
  });
});

// DELETE teacher materials
app.delete("/api/teacher/materials/:id", async (req, res) => {
  (await requireRole("teacher", "superadmin"))(req, res, async () => {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    await db.collection("teacherMaterials").deleteOne({ _id: oid });
    res.json({ success: true });
  });
});

// ════════════════════════════════════════════════════════════════════
//  SUPERADMIN — APPROVAL ROUTES
// ════════════════════════════════════════════════════════════════════

const TEACHER_COLS = { syllabus: "teacherSyllabus", schedule: "classSchedule", books: "teacherBooks", results: "examResults", notices: "teacherNotices", materials: "teacherMaterials" };

// GET pending items
app.get("/api/superadmin/pending", async (req, res) => {
  (await requireRole("superadmin"))(req, res, async () => {
    const results = await Promise.all(
      Object.entries(TEACHER_COLS).map(async ([key, col]) => {
        const items = await db.collection(col).find({ status: "pending" }).toArray().then(normAll);
        return [key, items];
      })
    );
    res.json(Object.fromEntries(results));
  });
});

// PATCH approve
app.patch("/api/superadmin/approve/:type/:id", async (req, res) => {
  (await requireRole("superadmin"))(req, res, async () => {
    const col = TEACHER_COLS[req.params.type];
    if (!col) return res.status(400).json({ error: "Unknown type" });
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    await db.collection(col).updateOne({ _id: oid }, { $set: { status: "approved" }, $unset: { rejectedReason: "" } });
    const item = await db.collection(col).findOne({ _id: oid });
    res.json({ success: true, item: norm(item) });
  });
});

// PATCH reject
app.patch("/api/superadmin/reject/:type/:id", async (req, res) => {
  (await requireRole("superadmin"))(req, res, async () => {
    const col = TEACHER_COLS[req.params.type];
    if (!col) return res.status(400).json({ error: "Unknown type" });
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    const { reason } = req.body;
    await db.collection(col).updateOne({ _id: oid }, { $set: { status: "rejected", rejectedReason: reason || "" } });
    const item = await db.collection(col).findOne({ _id: oid });
    res.json({ success: true, item: norm(item) });
  });
});

// ════════════════════════════════════════════════════════════════════
//  SUPERADMIN — USER MANAGEMENT
// ════════════════════════════════════════════════════════════════════

// GET all users
app.get("/api/superadmin/users", async (req, res) => {
  (await requireRole("superadmin"))(req, res, async () => {
    try {
      const users = await db.collection("user").find({}, { projection: { password: 0, hashedPassword: 0 } }).toArray();
      res.json({ users: normAll(users) });
    } catch (err) {
      console.error("Error fetching users", err);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
});

// PATCH user role
app.patch("/api/superadmin/users/:id/role", async (req, res) => {
  (await requireRole("superadmin"))(req, res, async () => {
    try {
      const { role } = req.body;
      const allowed = ["student", "teacher", "superadmin"];
      if (!allowed.includes(role)) return res.status(400).json({ error: `Role must be one of: ${allowed.join(", ")}` });
      const oid = toOid(req.params.id);
      if (!oid) return res.status(400).json({ error: "Invalid id" });
      const result = await db.collection("user").updateOne({ _id: oid }, { $set: { role } });
      if (result.matchedCount === 0) return res.status(404).json({ error: "User not found" });
      res.json({ success: true, role });
    } catch (err) {
      console.error("Error updating role", err);
      res.status(500).json({ error: "Failed to update role" });
    }
  });
});

// ════════════════════════════════════════════════════════════════════
//  SUPERADMIN — ADMIN PANEL CRUD
// ════════════════════════════════════════════════════════════════════

// ── Courses ──────────────────────────────────────────────────────────
app.get("/api/superadmin/admin/courses", async (req, res) => {
  (await requireRole("superadmin"))(req, res, async () => {
    const courses = await db.collection("courses").find({}).toArray().then(normAll);
    res.json({ courses });
  });
});

app.post("/api/superadmin/admin/courses", async (req, res) => {
  (await requireRole("superadmin"))(req, res, async () => {
    const { code, name, credits, instructor, slots } = req.body;
    if (!code || !name || !instructor) return res.status(400).json({ error: "code, name, instructor required" });
    const entry = { code, name, credits: parseInt(credits) || 3, instructor, slots: parseInt(slots) || 30, enrolled: 0 };
    const result = await db.collection("courses").insertOne(entry);
    res.json({ success: true, course: norm({ _id: result.insertedId, ...entry }) });
  });
});

app.delete("/api/superadmin/admin/courses/:id", async (req, res) => {
  (await requireRole("superadmin"))(req, res, async () => {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    await db.collection("courses").deleteOne({ _id: oid });
    res.json({ success: true });
  });
});

// ── Fee Items ─────────────────────────────────────────────────────────
app.get("/api/superadmin/admin/fees", async (req, res) => {
  (await requireRole("superadmin"))(req, res, async () => {
    const feeItems = await db.collection("feeItems").find({}).toArray().then(normAll);
    res.json({ feeItems });
  });
});

app.post("/api/superadmin/admin/fees", async (req, res) => {
  (await requireRole("superadmin"))(req, res, async () => {
    const { label, amount, status, paid } = req.body;
    if (!label || !amount) return res.status(400).json({ error: "label and amount required" });
    const entry = { label, amount, status: status || "", paid: !!paid };
    const result = await db.collection("feeItems").insertOne(entry);
    res.json({ success: true, feeItem: norm({ _id: result.insertedId, ...entry }) });
  });
});

app.patch("/api/superadmin/admin/fees/:id/paid", async (req, res) => {
  (await requireRole("superadmin"))(req, res, async () => {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    const item = await db.collection("feeItems").findOne({ _id: oid });
    if (!item) return res.status(404).json({ error: "Not found" });
    await db.collection("feeItems").updateOne({ _id: oid }, { $set: { paid: !item.paid } });
    const updated = await db.collection("feeItems").findOne({ _id: oid });
    res.json({ success: true, feeItem: norm(updated) });
  });
});

app.delete("/api/superadmin/admin/fees/:id", async (req, res) => {
  (await requireRole("superadmin"))(req, res, async () => {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    await db.collection("feeItems").deleteOne({ _id: oid });
    res.json({ success: true });
  });
});

// ── Events ────────────────────────────────────────────────────────────
app.get("/api/superadmin/admin/events", async (req, res) => {
  (await requireRole("superadmin"))(req, res, async () => {
    const events = await db.collection("events").find({}).toArray().then(normAll);
    res.json({ events });
  });
});

app.post("/api/superadmin/admin/events", async (req, res) => {
  (await requireRole("superadmin"))(req, res, async () => {
    const { date, label, type } = req.body;
    if (!date || !label) return res.status(400).json({ error: "date and label required" });
    const entry = { date, label, type: type || "holiday" };
    const result = await db.collection("events").insertOne(entry);
    res.json({ success: true, event: norm({ _id: result.insertedId, ...entry }) });
  });
});

app.delete("/api/superadmin/admin/events/:id", async (req, res) => {
  (await requireRole("superadmin"))(req, res, async () => {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    await db.collection("events").deleteOne({ _id: oid });
    res.json({ success: true });
  });
});

// ── Notices ───────────────────────────────────────────────────────────
app.get("/api/superadmin/admin/notices", async (req, res) => {
  (await requireRole("superadmin"))(req, res, async () => {
    const notices = await db.collection("notices").find({}).toArray().then(normAll);
    res.json({ notices });
  });
});

app.post("/api/superadmin/admin/notices", async (req, res) => {
  (await requireRole("superadmin"))(req, res, async () => {
    const { title, urgent } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });
    const entry = { title, urgent: !!urgent, date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) };
    const result = await db.collection("notices").insertOne(entry);
    res.json({ success: true, notice: norm({ _id: result.insertedId, ...entry }) });
  });
});

app.delete("/api/superadmin/admin/notices/:id", async (req, res) => {
  (await requireRole("superadmin"))(req, res, async () => {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    await db.collection("notices").deleteOne({ _id: oid });
    res.json({ success: true });
  });
});

// ════════════════════════════════════════════════════════════════════
//  SUPERADMIN SEED — ensure role on startup
// ════════════════════════════════════════════════════════════════════

async function seedSuperAdmin() {
  // Just make sure any account with these emails has the correct role
  const adminEmails = ["admin@gstu.edu", "admin@unihub.edu"];
  for (const email of adminEmails) {
    const user = await db.collection("user").findOne({ email });
    if (user) {
      if (user.role !== "superadmin") {
        await db.collection("user").updateOne({ email }, { $set: { role: "superadmin" } });
        console.log(`✅ ${email} promoted to superadmin`);
      } else {
        console.log(`✅ Superadmin OK: ${email}`);
      }
    }
  }
}

// ────────────────────────────────────────────────────────────────────
//  START SERVER
// ────────────────────────────────────────────────────────────────────
connectDb().then(async () => {
  await initDb();
  app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    setTimeout(seedSuperAdmin, 500);
  });
});
