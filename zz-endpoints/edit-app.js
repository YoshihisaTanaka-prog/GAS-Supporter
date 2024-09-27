"use strict";

const { readdirSync } = require("fs");
const { getUid }      = require("../basic-modules/basic");
const { isFile, read }      = require("../basic-modules/file")(["json"]);
const { userSetting } = require("../basic-modules/setting");

const sortAppOrder = async function(req, res){
  const appData = userSetting.data.appData;
  const showData = {};
  for(const key of req.body.order){
    showData[key] = {name: appData[key].name, path: appData[key].localRootPath};
  }
  await userSetting.sortKey("appData", req.body.order);
  res.send(showData);
};

const deleteApp = function (req, res) {
  delete userSetting.data.appData[req.body.id];
  userSetting.set({});
  res.send({});
}

const importApp = async function (req, res) {
  const newAppData = {};
  let newUid = "";
  if(req.body.id){
    newUid = req.body.id;
    newAppData[newUid] = {localRootPath: req.body.path, name: req.body.name};
  } else {
    newUid = getUid(Object.keys(userSetting.data.appData));
    newAppData[newUid] = {localRootPath: req.body.path, name: req.body.name};
    const backupData = await read(req.body.path + "/gas-supporter-backup-data.json");
    for(const key of Object.keys(backupData)){
      if(!["localRootPath", "name"].includes(key)){
        newAppData[newUid][key] = backupData[key];
      }
    }
  }
  await userSetting.set({appData: newAppData});
  write(req.body.path + "/gas-supporter-backup-data.json", newAppData[newUid]);
  const o = {};
  o[newUid] = {path: req.body.path, name: req.body.name};
  res.send(o);
}

const checkIfImportableFolder = async function (req, res){
  const files = readdirSync(req.body.path);
  const innerFolders = [];
  const innerFiles = [];
  for(const file of files){
    try {
      const judge = await isFile(req.body.path + "/" + file);
      if(judge){
        innerFiles.push(file);
      } else if(judge == false) {
        innerFolders.push(file);
      }
    } catch (e) {
      console.log(e);
      innerFolders.push(file);
    }
  }
  const checkObject = {innerFolders: innerFolders, innerFiles: innerFiles};
  switch (checkObject.innerFiles.length) {
    case 0:
      res.send(false);
      break;
    case 1:
      if(checkObject.innerFiles[0] == "gas-supporter-backup-data.json" && checkObject.innerFolders.length == 2 && checkObject.innerFolders.includes("edit") && checkObject.innerFolders.includes("out")){
        const savedList = [];
        for(const appDatum of Object.values(userSetting.data.appData)){
          savedList.push(appDatum.localRootPath);
        }
        if(savedList.includes(req.body.path)){
          res.send(false);
        } else{
          res.send(true);
        }
      } else{
        res.send(false);
      }
      break;
    default:
      res.send(false);
      break;
  }
}

module.exports ={ sortAppOrder, deleteApp, importApp, checkIfImportableFolder };