"use strict";

const { spawn }           = require("child_process");
const { write }           = require("../basic-modules/file")(["cmd"]);
const { userSetting }     = require("../basic-modules/setting");

const runCommand = function(command={win32: "", darwin: "", linux: ""}, isFinishOnError=false) {
  
  let commandFilePath = process.argv[1].split("\\").slice(0,-1).join("/") + "/nwaps";
  const commandCode = command[process.platform];
  let editedCommandCode = "";
  switch (process.platform) {
    case "win32":
      commandFilePath += ".cmd";
      editedCommandCode = "@echo off\n\n" + commandCode;
      break;
    case "darwin":
      break;
    case "linux":
      break;
    default:
      break;
  }

  write(commandFilePath, editedCommandCode, () => {
    const logInfo = {isRunning: true, details: []};
    const settingLogInfo = {};
    settingLogInfo[commandCode] = logInfo;
    userSetting.set({logs: settingLogInfo});
    const proc = spawn(commandFilePath, []);
    proc.stdout.on('data', (data) => {
      console.log(data.toString());
      for(const line of data.toString().split("\n")){
        logInfo.details.push(line.replaceAll("\r", "").replaceAll("\t", "    "));
      }
      settingLogInfo[commandCode] = logInfo;
      userSetting.set({logs: settingLogInfo});
    });
    proc.stderr.on('data', (err) => {
      console.log(err.toString());
      for(const line of err.toString().split("\n")){
        logInfo.details.push(line.replaceAll("\r", "").replaceAll("\t", "    "));
      }
      settingLogInfo[commandCode] = logInfo;
      if(isFinishOnError){
        process.kill(proc.pid);
        settingLogInfo[commandCode].isRunning = false;
        setTimeout(() => {
          settingLogInfo[commandCode].details = [];
          userSetting.set({logs: settingLogInfo});
        }, 2000);
      }
      userSetting.set({logs: settingLogInfo});
    });
    proc.stdout.on("close", () =>{
      settingLogInfo[commandCode].isRunning = false;
      userSetting.set({logs: settingLogInfo});
      setTimeout(() => {
        settingLogInfo[commandCode].details = [];
        userSetting.set({logs: settingLogInfo});
      }, 2000);
    });
  }, ()=>{});
}

const getRunningCommandLogs = function(req, res){
  console.log(req.body);
  if(req.body.command){
    res.send(userSetting.data.logs[req.body.command]);
  } else{
    res.send(null);
  }
};

module.exports = { runCommand, getRunningCommandLogs };