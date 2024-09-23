"use strict";

const bodyParser       = require("body-parser");
const express          = require("express");
const { myOptions }    = require("./basic-modules/basic")
const Command          = require("./basic-modules/exec")();
const { read, isFile } = require("./basic-modules/file")([ 'css', 'html', 'js', 'json', 'txt' ]);
const { userSetting }  = require("./basic-modules/setting");
const endpoints        = require("./endpoints");

const appName = "GAS-Supporter";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(3001, function(){
  console.log("Node.js is listening to PORT:" + server.address().port);
});

// open chrome ----------------------------------------------------------------------------------------------------------------------------------------------------

function openChrome(){
  setTimeout(() => {
    Command.set("start chrome.exe http://localhost:" + server.address().port,
    "open -a 'Google Chrome' 'http://localhost:'" + server.address().port,
    "echo if you want to visit your web site, open http://localhost:" + server.address().port).runS();
  }, 500);
}

if( myOptions.options["-o"] ){
  openChrome();
} else if( myOptions.options["--open"] ){
  openChrome();
}

// setting post ---------------------------------------------------------------------------------------------------------------------------------------------------

console.log("\n** Endpoints Information **************************\n");
for(const key of Object.keys(endpoints)){
  const path = "/" + key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
  app.post(path, endpoints[key]);
  console.log(path);
}
app.post('/', async function(req, res){
  const filePath = __dirname + "\\html\\templates\\" + req.body.id + ".html";
  if(await isFile(filePath)){
    res.send(await read(filePath));
  } else {
    res.send("");
  }
});
console.log("\n/\n** Endpoints Information **************************\n\n");

// setting get ----------------------------------------------------------------------------------------------------------------------------------------------------

const getIndexCode = async function(){
  let htmlCode = await read("html/index.html");
  htmlCode = htmlCode.replace("<title></title>", "<title>" + appName + "</title>");
  htmlCode = htmlCode.replace("%port%", server.address().port).replace('"%appData%"', JSON.stringify(userSetting.appData || {}));
  return htmlCode;
};

app.get("/", async function(req, res){
  if(req.query.folderId){
    if(req.query.jsonFileId){
      console.log(req.query);
    }
  }
  const htmlCode = await getIndexCode();
  res.send(htmlCode);
});

app.get("/index.html", async function(req, res){
  const htmlCode = await getIndexCode();
  res.send(htmlCode);
});

app.get("*", async function(req, res){
  if(req.path.startsWith("/inner-templates/")){
    res.send((await read("html/404.html")).replace("<title></title>", "<title>" + appName + "：お探しのページが見つかりません。</title>"));
  }
  if(await isFile("html" + req.path)){
    res.sendFile(__dirname + "\\html" + req.path.replaceAll("/", "\\"));
  } else {
    res.send((await read("html/404.html")).replace("<title></title>", "<title>" + appName + "：お探しのページが見つかりません。</title>"));
  }
});