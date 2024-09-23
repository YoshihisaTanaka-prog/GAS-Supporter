"use strict";

const { fs }                    = require("fs");
const { getUid }                = require("../basic-modules/basic");
const { isFile }                = require("../basic-modules/file")();
const { userSetting }           = require("../basic-modules/setting");
const { createAppFolder }       = require("../additional-modules/create-app");

async function createApp(req, res){
  switch(await isFile(req.body.path)){
    case true:
      res.send({status: "error", message: "Selected path id not a directory."});
      break;
    case false:
      const newAppUid = getUid(Object.keys( userSetting.data.appData ));
      const newObject = {};
      newObject[newAppUid] = {name: req.body.name, folderId: "", jsonFileId: "", localPath: req.body.path, fileInfo: [], option: req.body.option};
      userSetting.set({appData: newObject, creatingAppUid: newAppUid});
      res.send({status: "success"});
      break;
    default:
      res.send({status: "error", message: "Selected path does not exists."});
      break;
  }
}

const setupNewApp = async function(req, res){
  const newAppUid = userSetting.data.creatingAppUid;
  if(newAppUid == ""){
    res.send(false);
  } else{
    const newAppPath = userSetting.data.appData[newAppUid].localPath;
    const newAppOption = userSetting.data.appData[newAppUid].option;
    const newObject = {};
    newObject[newAppUid] = {folderId: req.body.folderId, jsonFileId: req.body.jsonFileId, fileInfo: await createAppFolder(newAppPath, newAppUid, newAppOption)};
    userSetting.set({appData: newObject, creatingAppUid: ""});
    res.send(true);
  }
}

async function searchPathOfApp(req, res){
  let mainPath = req.body.path;
  if(!["", null, undefined].includes(mainPath)){
    mainPath = userSetting.data.lastOpenedDir;
  } else{
    userSetting.set({lastOpenedDir: mainPath});
  }
  for(const f of fs.readdirSync(mainPath)){
    if(isFile(f) == false){
      console.log(f);
    }
  }
  res.send("test");
}

module.exports = { createApp, searchPathOfApp, setupNewApp };