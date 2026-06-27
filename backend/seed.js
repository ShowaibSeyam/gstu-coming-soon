const { auth, connectDb } = require("./auth");

async function seed() {
    await connectDb();

    try {
        // Create Super Admin
        await auth.api.signUpEmail({
            body: {
                email: "admin@gstu.edu",
                password: "adminpassword",
                name: "Super Admin",
                role: "superadmin"
            }
        });
        console.log("Super Admin user created.");
    } catch (e) {
        console.log("Super Admin might already exist.", e.message);
    }

    try {
        // Create Teacher
        await auth.api.signUpEmail({
            body: {
                email: "teacher@gstu.edu",
                password: "teacherpassword",
                name: "Dr. Ahmed Rahman",
                role: "teacher"
            }
        });
        console.log("Teacher user created.");
    } catch (e) {
        console.log("Teacher might already exist.", e.message);
    }

    try {
        // Create Student
        await auth.api.signUpEmail({
            body: {
                email: "student@gstu.edu",
                password: "studentpassword",
                name: "Student User",
                role: "student"
            }
        });
        console.log("Student user created.");
    } catch (e) {
        console.log("Student might already exist.", e.message);
    }

    console.log("Seeding complete. Press Ctrl+C to exit.");
    process.exit(0);
}

seed();
