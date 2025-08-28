const express = require("express");

const app = express();

const PORT = process.env.PORT || 4000;

require("dotenv").config();
app.use(express.json());

const dbConnect = require('./config/database.js');
dbConnect();

app.listen(PORT,()=>{
    console.log(`Server Starting at Port ${PORT}`)  
})