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
  if(await isFile(path) == false){
    const loadedFolderInfo = await loadFolderInfo(path);
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
    formatFolderInfo(loadedFolderInfo);
    return formattedFolderInfo;
  } else {
    return null;
  }
}

const getFirstLevelFolderInfo = async function(path=""){
  const files = fs.readdirSync(path);
  const innerFolders = [];
  const innerFiles = [];
  for(const file of files){
    try {
      const judge = await isFile(path + "/" + file);
      if(judge){
        innerFiles.push(file);
      } else if(judge == false) {
        const files = fs.readdirSync(path + "/" + file);
        innerFolders.push({name: file, numOfContents: files.length});
      }
    } catch (e) {
    }
  }
  return {myPath: path, numOfContents: files.length, innerFolders: innerFolders, innerFiles: innerFiles};
}


module.exports = { getFolderInfo, getFirstLevelFolderInfo };