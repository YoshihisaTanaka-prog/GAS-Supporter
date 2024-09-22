"use strict";
const express = require("express");
const Command= require("./basic-modules/exec")();
const f = require("./basic-modules/file");
const { appSetting, userSetting } = require("./basic-modules/setting");
const { read, isFile } = f([ 'css', 'html', 'js', 'json', 'txt' ]);

const appName = "GAS-Supporter";

const app = express();

const server = app.listen(3001, function(){
  console.log("Node.js is listening to PORT:" + server.address().port);
});

setTimeout(() => {
  Command.set("start chrome.exe http://localhost:" + server.address().port,
  "open -a 'Google Chrome' 'http://localhost:'" + server.address().port,
  "echo if you want to visit your web site, open http://localhost:" + server.address().port).runE();
}, 500);

app.get("/", async function(req, res){
  console.log("/ get");
  console.log(req.query);
  const gasUrl = "https://script.google.com/macros/s/AKfycbwslh0A0p2eQwHFI7m1nPuSbRZnd4goayZyxoVb_p4hAyDuSwFeC2lgBZoxYLRXP87VZw/exec?port=" + server.address().port;
  res.send((await read("html/index.html")).replace("<title></title>", "<title>" + appName + "</title>").replace("%gasUrl%", gasUrl));
});


app.post("/", async function(req, res){
  console.log("/ post");
  console.log(req.query);
  const gasUrl = "https://script.google.com/macros/s/AKfycbwslh0A0p2eQwHFI7m1nPuSbRZnd4goayZyxoVb_p4hAyDuSwFeC2lgBZoxYLRXP87VZw/exec?port=" + server.address().port;
  res.send((await read("html/index.html")).replace("<title></title>", "<title>" + appName + "</title>").replace("%gasUrl%", gasUrl));
});

app.get("*", async function(req, res){
  if(await isFile("html" + req.path)){
    res.sendFile(__dirname + "\\html" + req.path.replaceAll("/", "\\"));
  } else {
    res.send((await read("html/404.html")).replace("<title></title>", "<title>" + appName + "：お探しのページが見つかりません。</title>"));
  }
});