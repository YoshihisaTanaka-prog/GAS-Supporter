"use strict";

const { readdirSync }                   = require("fs");
const { myOptions }                     = require("./basic-modules/basic")
const Command                           = require("./basic-modules/exec")();
const { read, isFile, isExists, write } = require("./basic-modules/file")([ 'cmd', 'css', 'html', 'js', 'json', 'txt' ]);
const { userSetting }                   = require("./basic-modules/setting");
const endpoints                         = require("./endpoints");

const appName = "GAS-Supporter";

// for options ----------------------------------------------------------------------------------------------------------------------------------------------------

isExists(__dirname + "\\node_modules").then((isInstalledNodeModules)=>{
  const optionKeys = Object.keys(myOptions.options);
  if(isInstalledNodeModules){
    userSetting.set({"isInstalledNodeModules": true});
  } else {
    Command.setAll("npm install --save").runE();
    // プラットフォームごとに場合分けをする。
    write(__dirname + "\\gas-supporter.cmd", "@echo off\n\nif not %0==\"%~dp0%~nx0\" (\n  start /min cmd /c \"%~dp0%~nx0\" %*\n  exit\n)\n\ncd " + __dirname + " & node index --open");
    optionKeys.push("--open");
    userSetting.set({"isInstalledNodeModules": false});
    setTimeout(() => {
      userSetting.set({"isInstalledNodeModules": true});
    }, 10000);
  }

  if(optionKeys.includes("-o") || optionKeys.includes("--open")){
    setTimeout(() => {
      Command.set("start chrome.exe http://localhost:" + server.address().port,
      "open -a 'Google Chrome' 'http://localhost:'" + server.address().port,
      "echo if you want to visit your web site, open http://localhost:" + server.address().port).runS();
    }, 1000);
  }

  // setting default userInfo -----------------------------------------------------------------------------------------------

  if( userSetting.data.lastOpenedDir == null ){
    const path = "C:/Users/" + Command.setAll("whoami").runE()[0].split("\\")[1];
    userSetting.set({lastOpenedDir: path, defaultPath: path});
  }
  userSetting.set({creatingAppUid: ""});

  // setting server -------------------------------------------------------------------------------------------------------------------------------------------------

  const bodyParser = require("body-parser");
  const express    = require("express");

  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  const server = app.listen(3001, function(){
    console.log("Node.js is listening to PORT:" + server.address().port);
  });

  // setting post ---------------------------------------------------------------------------------------------------------------------------------------------------

  console.log("\n** Endpoints Information **************************\n");
  for(const key of Object.keys(endpoints)){
    const path = "/" + key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
    app.post(path, endpoints[key]);
    console.log(path);
  }
  app.post('/', async function(req, res){
    if(req.body.id){
      const filePath = __dirname + "\\html\\templates\\" + req.body.id + ".html";
      if(await isFile(filePath)){
        res.send(await read(filePath));
      } else {
        res.send("<h1 align='center'>未実装機能</h1>");
      }
    } else {
      res.send(await getIndexCode(true));
    }
  });
  console.log("/\n\n** Endpoints Information **************************\n\n");

  // setting get ----------------------------------------------------------------------------------------------------------------------------------------------------

  const getIndexCode = async function(isSkipChecking=false){
    let htmlCode = await read("html/index.html");
    htmlCode = htmlCode.replace("<title></title>", "<title>" + appName + "</title>");
    if(userSetting.data.appData){
      const appData = userSetting.data.appData;
      const showData = {};
      for(const key of Object.keys(appData)){
        if([appData[key].folderId, appData[key].jsonFileId].includes("") && userSetting.data.creatingAppUid == ""){
          delete userSetting.data.appData[key];
        } else{
          showData[key] = {name: appData[key].name, path: appData[key].localRootPath};
        }
      }
      userSetting.set({});
      htmlCode = htmlCode.replace("%port%", server.address().port).replace('"%appData%"', JSON.stringify(showData));
    } else {
      userSetting.set({appData: {}});
      htmlCode = htmlCode.replace("%port%", server.address().port).replace('"%appData%"', "{}");
    }
    htmlCode = htmlCode.replace('"%isInitialRun%"', JSON.stringify(!userSetting.data.isInstalledNodeModules));
    htmlCode = htmlCode.replace('"%isSkipChecking%"', JSON.stringify(isSkipChecking));
    return htmlCode;
  };

  app.get("/", async function(req, res){
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
});