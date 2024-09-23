"use strict";

const { userSetting } = require("../basic-modules/setting");

const getAppDetail = function(req,res){
  res.send(userSetting.data.appData[req.body.id]);
}

module.exports = { getAppDetail };