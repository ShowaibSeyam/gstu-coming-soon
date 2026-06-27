const { MongoClient } = require("mongodb");
const path = require("path");

// Load .env from backend directory
require("dotenv").config({ path: path.resolve(__dirname, "../backend/.env") });

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db();

const connectDb = async () => {
    try {
        await client.connect();
        console.log("Connected to MongoDB via Database connection module");
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
    }
};

module.exports = { client, db, connectDb };
