"use strict";

const Command          = require("../basic-modules/exec")();
const { userSettings } = require("../basic-modules/setting");

const claspPush = function(path=""){
  Command.setAll("cd path && clasp push -f").runE();
}

module.exports = { claspPush };