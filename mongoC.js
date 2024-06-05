// import { MongoClient } from "mongodb";

// const password = encodeURIComponent(process.env.MONGO_PASSWORD.trim());
// // const connectionString = `mongodb+srv://integrationninjas:${password}@devcluster.xf2gcci.mongodb.net/?retryWrites=true&w=majority`; // clustore url
// const connectionString =`mongodb+srv://r9young777:${password}@devcluster.cxbhzdm.mongodb.net/?retryWrites=true&w=majority&appName=DevCluster`

// const client = new MongoClient(connectionString);
// let conn;
// try {
//   conn = await client.connect();
//   console.log("connection successful")
// } catch(e) {
//   console.error(e);
// }
// let db = conn.db("r9young777");
// export default db;


import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const username = encodeURIComponent(process.env.MONGO_USERNAME.trim());
const password = encodeURIComponent(process.env.MONGO_PASSWORD.trim());
const connectionString = `mongodb+srv://${username}:${password}@devcluster.cxbhzdm.mongodb.net/?retryWrites=true&w=majority&appName=DevCluster`;

const client = new MongoClient(connectionString);
let conn;
try {
  conn = await client.connect();
  console.log("Connection successful");
} catch (e) {
  console.error(e);
}
let db = conn.db("r9young777"); // Use the correct database name
export default db;
