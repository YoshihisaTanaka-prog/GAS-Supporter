"use strict";

const { userSetting } = require("../basic-modules/setting");

const sortAppOrder = function(req, res){
  userSetting.sortKey("appData", req.body.order);
  res.send("");
};

module.exports ={ sortAppOrder };