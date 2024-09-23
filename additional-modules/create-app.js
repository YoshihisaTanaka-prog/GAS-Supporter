"use strict";

const { mkdir }         = require("fs");

const { getFolderInfo } = require("./get-inner-path");
const { read, write }   = require("../basic-modules/file")([ 'cmd', 'css', 'html', 'js', 'json', 'txt' ]);

const createAppFolder = async function(path, uid, option){
  const folderInfo = await getFolderInfo("./gas-templates/" + option);
  await new Promise((resolve, reject) => {
    mkdir(path + "/edit", (err)=>{
      if(err){
        return resolve(err.message);
      } else{
        return resolve("");
      }
    })
  })
  for(const childPath of folderInfo){
    const writePath = path + "/edit/" + childPath;
    if(childPath.endsWith("/")){
      await new Promise((resolve, reject) => {
        mkdir(writePath.slice(0,-1), (err)=>{
          if(err){
            return resolve(err.message);
          } else{
            return resolve("");
          }
        })
      })
    } else{
      const content = await read("./gas-templates/" + option + "/" + childPath);
      await write(writePath, content);
    }
  }
  return folderInfo.filter( (path) => !path.endsWith("/") );
}

module.exports = { createAppFolder }