"use strict";

const { getFolderInfo } = require("../additional-modules/get-inner-path");
const { write }         = require("../basic-modules/file")(["json"]);
const { userSetting }   = require("../basic-modules/setting");

const getAppDetail = async function(req,res){
  const obj = userSetting.data.appData[req.body.id];
  res.send({id: req.body.id, name: obj.name, fileInfo: obj.fileInfo, gs: obj.gs, head: obj.head, body: obj.body, myId: obj.myId, deploymentIds: obj.deploymentIds});
}

const monitorAppFolder = async function(req, res){
  const currentSetFiles = userSetting.data.appData[req.body.id].fileInfo;
  const currentActualFiles = await getFolderInfo(userSetting.data.appData[req.body.id].localRootPath + "/edit");
  let gasFileList = userSetting.data.appData[req.body.id].gs;
  if(currentActualFiles){
    const added = [];
    const deleted = [];
    for(const file of currentActualFiles.filter( (f) => !f.endsWith("/") )){
      if(!currentSetFiles.includes(file)){
        added.push(file);
        if(file.startsWith("gs/")){
          gasFileList.push(file);
        }
      }
    }
    for(const file of currentSetFiles){
      if(!currentActualFiles.includes(file)){
        deleted.push(file);
        if(gasFileList.includes(file)){
          gasFileList = gasFileList.filter( f => f != file );
        }
      }
    }
    const isValid = true;
    const newObject = {};
    newObject[req.body.id] = {fileInfo: currentActualFiles.filter( (f) => !f.endsWith("/") ), gs: gasFileList};
    await userSetting.set({appData: newObject});
    write(userSetting.data.appData[req.body.id].localRootPath + "/gas-supporter-backup-data.json", userSetting.data.appData[req.body.id]);
    res.send({isValid, added, deleted});
  } else {
    res.send({isValid: false});
  }
}

const getMyCdns = async function(req, res) {
  res.send(userSetting.data.cdns);
}

module.exports = { getAppDetail, monitorAppFolder, getMyCdns };