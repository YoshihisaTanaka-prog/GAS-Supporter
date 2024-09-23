const fs         = require("fs");
const { isFile } = require("../basic-modules/file")();

const getFolderInfo = async function(path=""){
  const loadFolderInfo = async function(path="") {
    const returnObject = {};
    const files = fs.readdirSync(path);
    for(const file of files){
      if(await isFile(path + "/" + file)){
        returnObject[file] = "";
      } else {
        returnObject[file] = await loadFolderInfo(path + "/" + file);
      }
    }
    return returnObject;
  }
  const loadedfolderInfo = await loadFolderInfo(path);
  const formattedFolderInfo = [];
  const formatFolderInfo = function(object={}, currentPath=""){
    for(const key of Object.keys(object)){
      if(![".git", "node_modules"].includes(key)){
        if(typeof object[key] == "string"){
          formattedFolderInfo.push(currentPath + key);
        } else{
          formattedFolderInfo.push(currentPath + key + "/");
          formatFolderInfo(object[key], currentPath + key + "/");
        }
      }
    }
  }
  formatFolderInfo(loadedfolderInfo);
  return formattedFolderInfo;
}

module.exports = { getFolderInfo };