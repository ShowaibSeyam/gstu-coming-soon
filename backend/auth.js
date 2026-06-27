const { betterAuth } = require("better-auth");
const { mongodbAdapter } = require("better-auth/adapters/mongodb");
const { admin: adminPlugin } = require("better-auth/plugins");
require("dotenv").config();

// Import the connected client and db from our new database module
const { client, db, connectDb } = require("./database/connection");

const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: ["http://localhost:3000",
        process.env.FRONTEND_URL,
    ],
    database: mongodbAdapter(db, {
        client, // optional: enables transactions
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        adminPlugin({
            // Allow superadmin and teacher roles
            defaultRole: "student",
            adminRole: ["superadmin"],
        }),
    ],
});

module.exports = { auth, connectDb, db, client };
