const { db, connectDb } = require("./auth");

connectDb().then(async () => {
  // Set admin@gstu.edu as superadmin
  const r1 = await db.collection("user").updateOne(
    { email: "admin@gstu.edu" },
    { $set: { role: "superadmin", name: "Super Admin" } }
  );
  console.log("admin@gstu.edu -> superadmin:", r1.modifiedCount > 0 ? "Done" : "Not modified");

  // Set student@gstu.edu as teacher
  const r2 = await db.collection("user").updateOne(
    { email: "student@gstu.edu" },
    { $set: { role: "teacher", name: "Teacher Demo" } }
  );
  console.log("student@gstu.edu -> teacher:", r2.modifiedCount > 0 ? "Done" : "Not modified");

  // Print all users
  const users = await db.collection("user").find({}).toArray();
  console.log("\nAll users:");
  users.forEach(u => console.log(" - " + u.email + " | role: " + (u.role || "(none)") + " | name: " + u.name));

  process.exit(0);
});
