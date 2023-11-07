//======================
//Import require files
//======================
const express = require('express');
const cors = require('cors');
const app=express();
const port =process.env.PORT||5000

//======================
//middleware
//======================
app.use(cors())
app.use(express.json())

//======================
//MongoDB config
//======================



//======================
//Express server initialize
//====================== 
app.get("/",(req,res)=>{
   res.send("Knowledge Bridge Server is Active")
})
app.listen(port,()=>{
   console.log(`Knowledge Bridge Server is running on port: ${port}`);
})