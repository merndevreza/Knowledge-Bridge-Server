//======================
//Import require files
//======================
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion } = require("mongodb");

//======================
//middleware
//======================
app.use(cors());
app.use(express.json());

//======================
//MongoDB config
//======================

const uri = `mongodb+srv://rk-knowledge-bridge:Qgj8DUQX28gweHY0@cluster0.ojansry.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("knowledgeBridge");
    const booksCollection = database.collection("books");
    //==========
    // Books
    //==========
    // add book
    app.post("/books", async (req, res) => {
      const book = req.body;
      const result = await booksCollection.insertOne(book);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //  await client.close();
  }
}
run().catch(console.dir);

//======================
//Express server initialize
//======================
app.get("/", (req, res) => {
  res.send("Knowledge Bridge Server is Active");
});
app.listen(port, () => {
  console.log(`Knowledge Bridge Server is running on port: ${port}`);
});