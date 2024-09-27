"use strict";

const { getFolderInfo } = require("../additional-modules/get-inner-path");
const { userSetting }   = require("../basic-modules/setting");

const getAppDetail = async function(req,res){
  const obj = userSetting.data.appData[req.body.id];
  res.send({id: req.body.id, name: obj.name, fileInfo: obj.fileInfo, head: obj.head, body: obj.body});
}

const monitorAppFolder = async function(req, res){
  const currentSetFiles = userSetting.data.appData[req.body.id].fileInfo;
  const currentActualFiles = await getFolderInfo(userSetting.data.appData[req.body.id].localRootPath + "/edit");
  if(currentActualFiles){
    const added = [];
    const deleted = [];
    for(const file of currentActualFiles.filter( (f) => !f.endsWith("/") )){
      if(!currentSetFiles.includes(file)){
        added.push(file);
      }
    }
    for(const file of currentSetFiles){
      if(!currentActualFiles.includes(file)){
        deleted.push(file);
      }
    }
    const isValid = true;
    const newObject = {};
    newObject[req.body.id] = {fileInfo: currentActualFiles};
    await userSetting.set({appData: newObject});
    res.send({isValid, added, deleted});
  } else {
    res.send({isValid: false});
  }
}

module.exports = { getAppDetail, monitorAppFolder };