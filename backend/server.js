const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/ecoLearn",{ useNewUrlParser:true, useUnifiedTopology:true })
  .then(()=>console.log("MongoDB connected"))
  .catch(err=>console.log(err));

// Use routes
app.use("/api", routes);

// Start server
app.listen(5000, ()=>console.log("Server running at http://localhost:5000"));
