"use strict";

const { mkdirSync }           = require("fs");

const { getFolderInfo }       = require("./get-inner-path");
const { read, write, isFile } = require("../basic-modules/file")([ 'cmd', 'css', 'html', 'js', 'json', 'txt' ]);

const copyAppFolder = async function(path, uid, option){
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
      const content = await read("./gas-templates/" + option + "/" + childPath);
      await write(writePath, content);
    }
  }
  return folderInfo.filter( (path) => !path.endsWith("/") );
}

module.exports = { copyAppFolder }