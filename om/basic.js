"use strict";
const { readFileSync } = require("fs");

const settingNames = ["app", "user"];
const myRelativePath = "app/om/basic.js";

const getType = function(object){
  var toString = Object.prototype.toString;
  return toString.call(object).split(" ")[1].slice(0, -1).toLowerCase();
}

const isSameObject = function(object1, object2, ignoreArrayOrder=false){
  if(getType(object1) == getType(object2)){
    switch (getType(object1)) {
      case "object":
        const keys = Object.keys(object1).toSorted();
        if(isSameObject(keys, Object.keys(object2).toSorted())){
          for(const key of keys){
            if(!isSameObject(object1[key], object2[key])){
              return false
            }
          }
          return true;
        } else{
          return false;
        }
        break;
      case "array":
        const length = object1.length;
        if(length == object2.length){
          if(ignoreArrayOrder){
            for(let i=0; i<length; i++){
              let isIncluded = false;
              for(let j=0; j<length; j++){
                if(isSameObject(object1[i], object2[j])){
                  isIncluded = true;
                  break;
                }
              }
              if(!isIncluded){
                return false;
              }
            }
          } else {
            for(let i=0; i<length; i++){
              if(!isSameObject(object1[i], object2[i])){
                return false
              }
            }
          }
          return true;
        } else{
          return false;
        }
        break;
      default:
        return object1 == object2;
    }
    return;
  }
  return false;
}

// for setting data
const settingPathInfo = function(){
  const mySplittedPath = myRelativePath.split("/").slice(0, -1);
  const negativeLength = -mySplittedPath.length;
  const returnObject = {};
  if( isSameObject(process.argv[1].split("\\").slice(0, -1).slice(negativeLength), mySplittedPath)){
    for(const key of settingNames){
      returnObject[key] = "settings/" + key + "-data.json";
    }
  } else {
    const rootPath = process.argv[1].split("\\").slice(0,-1).join("/");
    for(const key of settingNames){
      returnObject[key] = rootPath + "/settings/" + key + "-data.json";
    }
  }
  return returnObject;
}();

class Setting {
  constructor(path="", data){
    this.path = Object.freeze(path);
    this.data = data;
  }
  static new(path=""){
    try {
      const loadedText = readFileSync(path, "utf-8");
      const loadedData = loadedText == "" ? {} : JSON.parse(loadedText);
      return Object.freeze(new Setting(path, loadedData));
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}

const moduleObject = { getType, isSameObject };

for(const key of Object.keys(settingPathInfo)){
  moduleObject[key+"Setting"] = Setting.new(settingPathInfo[key]);
}

// console.log(moduleObject);

module.exports = moduleObject;