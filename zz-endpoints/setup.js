"use strict";

const Command        = require("../basic-modules/exec")();
const { isExists }   = require("../basic-modules/file")([]);
const { runCommand } = require("./run");

const initialCheck = async function(req, res){
  let isClaspInstalled = false;
  for(const moduleInfo of Command.setAll("npm list -g --depth=0").runE().slice(1)){
    if(moduleInfo.includes("@google/clasp")){
      isClaspInstalled = true;
      break;
    }
  }

  if(!isClaspInstalled){
    res.send({ isClaspInstalled });
    return;
  }

  let clasprcPath = "";
  switch (process.platform) {
    case "win32":
      clasprcPath = "C:/Users/" + Command.setAll("whoami").runE()[0].split("\\")[1] + "/.clasprc.json";
      break;
    case "darwin":
      break;
    case "linux":
      break;
    default:
      break;
  }
  const didLogin = await isExists(clasprcPath);
  res.send({ isClaspInstalled, didLogin });
}

const installClasp = function(req, res){
  runCommand({win32: "npm install -g clasp"});
  res.send("npm install -g clasp");
}

module.exports = { initialCheck , installClasp };