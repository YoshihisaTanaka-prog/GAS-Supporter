"use strict";

const { readdirSync }         = require("fs");
const { getUid }              = require("../basic-modules/basic");
const { isFile, read, write } = require("../basic-modules/file")(["json"]);
const { userSetting }         = require("../basic-modules/setting");
const { getAppDetail }        = require("./show-app");

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
  write(req.body.path + "/gas-supporter-backup-data.json", userSetting.data.appData[newUid]);
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

const addConstructor = async function(req, res){
  let cachedAppData = userSetting.data.appData[req.body.id];
  const obj = {};
  obj[req.body.id] = {};
  const objectList = [obj];
  const keys = req.body.keyPath.split("-");
  for(const key of keys){
    const obj = {};
    obj[key] = {}
    objectList.push(obj);
    cachedAppData = cachedAppData[key];
  }
  const newObject = {type: req.body.type};
  if(newObject.type == "block"){
    newObject.value = {};
  } else if(newObject.type == "file"){
    if(["", null, undefined].includes(req.body.fileName)){
      newObject.value = "";
    } else{
      newObject.value = req.body.fileName;
      if(req.body.fileName.endsWith(".js") || req.body.fileName.endsWith(".css")){
        newObject.enteredValue = "";
      }
    }
  } else{
    newObject.value = "";
  }
  const cachedAppDataKeys = Object.keys(cachedAppData);
  const newUid = getUid(cachedAppDataKeys);
  objectList[keys.length][keys[keys.length-1]][newUid] = newObject;
  for(let i=keys.length; i>0; i--){
    const key = i == 1 ? req.body.id : keys[i-2];
    objectList[i-1][key] = objectList[i];
  }
  await userSetting.set({appData: objectList[0]});
  if(["head", "body"].includes(req.body.keyPath)){
    const sortedKeys = cachedAppDataKeys;
    sortedKeys.splice(-1,0, newUid);
    await userSetting.sortKey("appData." + req.body.id + "." + keys.join("."), sortedKeys);
  }
  getAppDetail(req, res);
}

const moveConstructor = async function(req, res){
  let cachedAppData1 = userSetting.data.appData[req.body.id];
  for(const key of req.body.from.split("-")){
    cachedAppData1 = cachedAppData1[key];
  }
  const movedData = Object.freeze(cachedAppData1[req.body.key]);
  delete cachedAppData1[req.body.key];
  let cachedAppData2 = userSetting.data.appData[req.body.id];
  const obj1 = {};
  obj1[req.body.id] = {};
  const objectList = [obj1];
  const toKeyPath = req.body.to.split("-")
  for(const key of toKeyPath){
    const obj = {};
    obj[key] = {}
    objectList.push(obj);
    cachedAppData2 = cachedAppData2[key];
  }
  toKeyPath.unshift(req.body.id);
  const newUid = getUid(Object.keys(cachedAppData2));
  const obj2 = {};
  obj2[newUid] = movedData;
  objectList.push(obj2);
  for(let i=toKeyPath.length; i>0; i--){
    objectList[i-1][toKeyPath[i-1]] = objectList[i];
  }
  await userSetting.set({appData: objectList[0]});
  if(["head", "body"].includes(req.body.to)){
    const currentKeys = Object.keys(userSetting.data.appData[req.body.id][req.body.to]);
    const orderedKeys = currentKeys.filter(key => key != "super-fixed-end");
    orderedKeys.push("super-fixed-end");
    await userSetting.sortKey(["appData", req.body.id, req.body.to].join("."), orderedKeys);
  }
  getAppDetail(req, res);
}

const sortConstructor = async function(req, res){
  await userSetting.sortKey("appData." + req.body.id + "." + req.body.keyPath.replaceAll("-", "."), req.body.orderedKeys);
  getAppDetail(req, res);
}

const sortGasList = async function(req, res){
  const newObject = {};
  newObject[req.body.id] = {gs: req.body.orderedList};
  await userSetting.set({appData: newObject});
  getAppDetail(req, res);
}

const deleteConstructor = async function(req, res){
  let cachedAppData = userSetting.data.appData[req.body.id];
  const keys = req.body.keyPath.split("-");
  let key = "";
  for(let i=0; i<keys.length; i++){
    key = keys[i];
    if(i == keys.length-1){
      break;
    }
    cachedAppData = cachedAppData[key];
  }
  delete cachedAppData[key];
  await userSetting.set({});
  getAppDetail(req, res);
}

module.exports ={ sortAppOrder, deleteApp, importApp, checkIfImportableFolder, addConstructor, deleteConstructor, sortConstructor, sortGasList, moveConstructor };