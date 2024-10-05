"use strict";

const { userSetting } = require("../basic-modules/setting");

const editUserSettingCdn = async function(req, res){
  const newObject = {};
  newObject[req.body.newType] = {};
  newObject[req.body.newType][req.body.newKey] = req.body.newValue;
  if(![req.body.oldType, req.body.oldKey].includes("")){
    if(req.body.oldType != req.body.newType || req.body.oldKey != req.body.newKey){
      delete userSetting.data.cdns[req.body.oldType][req.body.oldKey];
    }
  }
  await userSetting.set({cdns: newObject});
  res.send(userSetting.data.cdns);
}

module.exports = { editUserSettingCdn };