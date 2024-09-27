"use strict";

const { mkdirSync }           = require("fs");

const { getFolderInfo }       = require("./get-inner-path");
const Command                 = require("../basic-modules/exec")();
const { read, write, isFile } = require("../basic-modules/file")([ 'cmd', 'css', 'html', 'js', 'json', 'txt' ]);
const { userSetting }         = require("../basic-modules/setting");

const copyAppFolder = async function(path, option){
  const folderInfo = await getFolderInfo("./gas-templates/" + option);
  const folderJudge = await isFile(path + "/edit");
  console.log("copyAppFolder >>", folderJudge);
  if(folderJudge == null){
    mkdirSync(path + "/edit");
    mkdirSync(path + "/out");
  }
  for(const childPath of folderInfo){
    const writePath = path + "/edit/" + childPath;
    if(childPath.endsWith("/")){
      if(await isFile(writePath.slice(0,-1)) == null){
        mkdirSync(writePath.slice(0,-1));
      }
    } else{
      await write(writePath, await read("./gas-templates/" + option + "/" + childPath));
    }
  }
}


const initialClaspSetup = async function(uid){
  const newAppData = userSetting.data.appData[uid];
  Command.setAll(`clasp create --type ${newAppData.option.gasType[0]} --title "${newAppData.name}" --parentId ${newAppData.mainFolderId} --rootDir ${newAppData.localRootPath}/out`).runE();
  const appsScriptData = await read(newAppData.localRootPath + "/out/appsscript.json");
  appsScriptData.webapp = {executeAs: newAppData.option.executeAs[0], access: newAppData.option.access[0]};
  await write(newAppData.localRootPath + "/out/appsscript.json", appsScriptData);
  let headerContents = "const gasSupporterAppName = \"" + newAppData.name + "\";\n";
  headerContents += ("const gasSupporterMainJsonFileId = \"" + newAppData.jsonFileId + "\";\n");
  headerContents += ("const gasSupporterDbFolderId = \"" + newAppData.dbFolderId + "\";\n\n");
  const contents = await read(newAppData.localRootPath + "/edit/gs/main.js");
  await write(newAppData.localRootPath + "/edit/gs/main.js", headerContents + contents);
}

module.exports = { copyAppFolder, initialClaspSetup };