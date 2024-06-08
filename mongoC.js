import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config(); // Ensure environment variables are loaded

const password = encodeURIComponent(process.env.MONGO_PASSWORD.trim());
const connectionString = `mongodb+srv://r9young777:${password}@devcluster.cxbhzdm.mongodb.net/?retryWrites=true&w=majority&appName=DevCluster`;

const client = new MongoClient(connectionString);

let db;

async function connectDB() {
  try {
    const conn = await client.connect();
    console.log("Connection successful");
    db = conn.db("r9young777");
  } catch (e) {
    console.error("Failed to connect to the database", e);
  }
}

connectDB();

export default db;
