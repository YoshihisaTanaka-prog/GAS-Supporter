"use strict";

const Command          = require("../basic-modules/exec")();
const { userSettings } = require("../basic-modules/setting");

const claspPush = function(path=""){
  Command.setAll("cd " + path + " && clasp push -f").runE();
}

const claspDeploy = function (appId) {
  const currentAppData = userSettings.data.appData[appId];
}

module.exports = { claspPush };