"use strict";

// 特殊なパターンだけ先に処理 ----------------------------------------------------------------------------------------------------------------------------------

const { getRunningCommandLogs } = require("./zz-endpoints/run");
const outputModule = { getRunningCommandLogs };
const cachedKeys = Object.keys(outputModule);

// 普通のパターン ---------------------------------------------------------------------------------------------------------------------------------------------

const Auth      = require("./zz-endpoints/auth");
const CreateApp = require("./zz-endpoints/create-app");
const Running   = require("./zz-endpoints/running");
const Setup     = require("./zz-endpoints/setup");

for(const module of [Auth, CreateApp, Running, Setup]){
  for(const key of Object.keys(module)){
    if(cachedKeys.includes(key)){
      console.log("Key name", key, "is a duplicate.");
    } else {
      cachedKeys.push(key);
    }
    outputModule[key] = module[key];
  }
}

module.exports = outputModule;