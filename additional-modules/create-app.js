"use strict";

const { mkdirSync, access }           = require("fs");

const { getFolderInfo }       = require("./get-inner-path");
const { Command }             = require("../basic-modules/exec")();
const { read, write, isFile } = require("../basic-modules/file")([ 'cmd', 'css', 'html', 'js', 'json', 'txt' ]);
const { userSetting }         = require("../basic-modules/setting");

const copyAppFolder = async function(path, option){
  const folderInfo = await getFolderInfo("./gas-templates/" + option);
  if(await isFile(path + "/edit") == false){
    mkdirSync(path + "/edit");
    mkdirSync(path + "/out");
  }
  for(const childPath of folderInfo){
    const writePath = path + "/edit/" + childPath;
    if(childPath.endsWith("/")){
      if(await isFile(writePath.slice(0,-1)) == false){
        mkdirSync(writePath.slice(0,-1));
      }
    } else{
      const contents = await read("./gas-templates/" + option + "/" + childPath);
      if(childPath == "gs/main.js"){
        let headerContents = "";
        await write(writePath, headerContents + contents);
      } else {
        await write(writePath, contents);
      }
    }
  }
}

const initialClaspSetup = async function(uid){
  const newAppData = userSetting.data.appData[uid];
  Command.setAll(`clasp create --type ${newAppData.option.gasType[0]} --title ${newAppData.name} --parentId ${newAppData.mainFolderId} --rootDir ${newAppData.localRootPath}/out`).runE();
  const appsScriptData = JSON.parse(await read(newAppData.localRootPath + "/out/appsscript.json"));
  appsScriptData.webapp = {executeAs: newAppData.options.executeAs[0], access: newAppData.options.access[0]};
  await write(newAppData.localRootPath + "/out/appsscript.json", appsScriptData);
  let headerContents = "";
  headerContents += ("const mainJsonFileId = " + newAppData.jsonFileId + ";\n");
  headerContents += ("const dbFolderId = " + newAppData.dbFolderId + ";\n\n");
  const contents = await read(newAppData.localRootPath + "/edit/gs/main.js");
  await write(newAppData.localRootPath + "/edit/gs/main.js", headerContents + contents);
}

module.exports = { copyAppFolder, initialClaspSetup };