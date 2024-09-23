"use strict";

const { runCommand } = require("./run");

const loginToClasp = function(req, res){
  runCommand({win32: "clasp login"}, true);
  res.send("clasp login");
}

const changeUser = function(req, res){
  runCommand({win32: "clasp logout & clasp login"}, true);
  res.send("clasp logout & clasp login");
}

module.exports = { loginToClasp, changeUser };