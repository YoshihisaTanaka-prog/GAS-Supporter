"use strict";
const express = require("express");

const app = express();

const server = app.listen(0, function(){
  console.log("Node.js is listening to PORT:" + server.address().port + ".\nIf you want to access please visit http://localhost:" + server.address().port);
});

const port = server.address().port;

app.get("/", function(req, res, next){
  res.json(port);
});

app.get("*", function(req, res, next){
});