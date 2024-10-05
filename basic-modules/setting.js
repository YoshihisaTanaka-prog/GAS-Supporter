"use strict";

const loadSetting = require("./load-setting");
const settingFileInfo = [
  {
    "key": "app",
    "path": "C:/Users/tany1/project/GasSupporter/settings/app-data.json",
    "isMust": true
  },
  {
    "key": "user",
    "path": "C:/Users/tany1/project/GasSupporter/settings/user-data.json"
  }
];

module.exports = loadSetting(settingFileInfo);