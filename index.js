//======================
//Import require files
//======================
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//======================
//middleware
//======================
app.use(
  cors({
    origin: ["https://knowledge-bridge-d084c.web.app", "http://localhost:5174","http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser())
// My Middlewares

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  console.log("Value of token in Middleware", token);
  if (!token) {
    return res.status(401).send({ message: "Not Authorized" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    // Error
    if (err) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    // If the user is valid then it would be decoded
    req.user = decoded;
    next();
  });
};
//======================
//MongoDB config
//======================

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ojansry.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    //=================
    // Authentication
    //=================
    app.post("/jwt", async (req, res) => {
      const userEmail = req.body;
      const token = jwt.sign(
        userEmail, process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "1h",
        }
      );
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
        })
        .send({ success: true });
    });
    app.post("/log-out", async (req, res) => {
      res.clearCookie("token").send({ success: true });
    });

    //==========
    // Books
    //==========

    const database = client.db("knowledgeBridge");
    const booksCollection = database.collection("books");
    const preBookingsCollection = database.collection("pre-bookings");
    const requestedBooksCollection = database.collection("requested-books");
    const BorrowedBooksCollection = database.collection("BorrowedBooks");
    // add book
    app.post("/books", async (req, res) => {
      const book = req.body;
      const result = await booksCollection.insertOne(book);
      res.send(result);
    });
    // Request for a book
    app.post("/request-a-book", async (req, res) => {
      const requestedBook = req.body;
      const result = await requestedBooksCollection.insertOne(requestedBook);
      res.send(result);
    });
    //read all book
    app.get("/books", async (req, res) => {
      const result = await booksCollection.find().toArray();
      res.send(result);
    });
    //read single book
    app.get("/books/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await booksCollection.findOne(query);
      res.send(result);
    });
    // update a single book info
    app.patch("/books/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateRequest = req.body;
      const updateDoc = {
        $set: {
          bookName: updateRequest.bookName,
          authorName: updateRequest.authorName,
          photo: updateRequest.photo,
          category: updateRequest.category,
          rating: updateRequest.rating,
          quantity: updateRequest.quantity,
        },
      };
      const result = await booksCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // read category products
    app.get("/category/:id", async (req, res) => {
      const categoryName = req.params.id;
      const query = { category: categoryName };
      const result = await booksCollection.find(query).toArray();
      res.send(result);
    });
    //==========
    // Borrowed Books
    //==========
    app.post("/borrowed-books", async (req, res) => {
      const borrowedBook = req.body;
      const result = await BorrowedBooksCollection.insertOne(borrowedBook);
      res.send(result);
    });
    app.post("/pre-bookings", async (req, res) => {
      const perBooked = req.body;
      const result = await preBookingsCollection.insertOne(perBooked);
      res.send(result);
    });
    app.get("/borrowed-books/:id", async (req, res) => {
      const userEmail = req.params.id;
      const query = { userEmail: userEmail };
      const result = await BorrowedBooksCollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/borrowed-books/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await BorrowedBooksCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
