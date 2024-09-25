"use strict";

const { userSetting } = require("../basic-modules/setting");

const sortAppOrder = async function(req, res){
  const appData = userSetting.data.appData;
  const showData = {};
  for(const key of req.body.order){
    showData[key] = {name: appData[key].name, path: appData[key].localRootPath};
  }
  res.send(showData);
  await userSetting.sortKey("appData", req.body.order);
};

module.exports ={ sortAppOrder };