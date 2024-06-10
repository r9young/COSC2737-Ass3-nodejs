

import { MongoClient } from "mongodb";

// load environment variables from a .env file into process.env. 
// This allows you to use environment variables defined in the .env file within your application.
import dotenv from 'dotenv';
dotenv.config();

const password = encodeURIComponent(process.env.MONGO_PASSWORD.trim());
const connectionString = `mongodb+srv://r9young777:${password}@devcluster.cxbhzdm.mongodb.net/?retryWrites=true&w=majority&appName=DevCluster`;

const client = new MongoClient(connectionString);
let conn;
try {
  conn = await client.connect();
  console.log("connection successful");
} catch(e) {
  console.error(e);
}
let db = conn.db("r9young777");
export default db;