"use strict";

const fs                                         = require("fs");
const { copyAppFolder, initialClaspSetup }       = require("../additional-modules/create-app");
const { getFolderInfo, getFirstLevelFolderInfo } = require("../additional-modules/get-inner-path");
const { getUid }                                 = require("../basic-modules/basic");
const { isFile, isExists }                       = require("../basic-modules/file")();
const { userSetting }                            = require("../basic-modules/setting");

async function createApp(req, res){
  switch(await isFile(req.body.path)){
    case true:
      res.send({status: "error", message: "Selected path id not a directory."});
      break;
    case false:
      const newAppUid = getUid(Object.keys( userSetting.data.appData ));
      const newObject = {};
      newObject[newAppUid] = {
        name: req.body.name,
        mainFolderId: "",
        dbFolderId: "",
        jsonFileId: "",
        deploymentIds: {
          head: "",
          exec: ""
        },
        localRootPath: req.body.path,
        option: req.body.option,
        fileInfo: [],
        head: {},
        body: {}
      };
      userSetting.set({appData: newObject, creatingAppUid: newAppUid});
      res.send({status: "success"});
      break;
    default:
      res.send({status: "error", message: "Selected path does not exists."});
      break;
  }
}

const setupNewApp = async function(req, res){
  const newAppUid = userSetting.data.creatingAppUid;
  if(newAppUid == ""){
    res.send(false);
  } else{
    const newObject = {};
    const newAppData = userSetting.data.appData[newAppUid];
    const path = newAppData.localRootPath;
    if(!newAppData.option.templates.includes("basic")){
      await copyAppFolder(path, "basic");
    }
    for(const template of newAppData.option.templates){
      await copyAppFolder(path, template);
    }
    const fileInfo = await getFolderInfo(path + "/edit");
    newObject[newAppUid] = {mainFolderId: req.body.mainFolderId, dbFolderId: req.body.dbFolderId, jsonFileId: req.body.jsonFileId, fileInfo: fileInfo.filter( (f) => !f.endsWith("/") )};
    await userSetting.set({appData: newObject, creatingAppUid: ""});
    await initialClaspSetup(newAppUid);
    delete userSetting.data.appData[newAppUid].option;
    delete userSetting.data.appData[newAppUid].mainFolderId;
    await userSetting.set({});
    res.send(newAppUid);
  }
}

async function searchPathOfApp(req, res){
  let mainPath = req.body.path;
  if(["", null, undefined].includes(mainPath)){
    mainPath = userSetting.data.lastOpenedDir;
  } else{
    userSetting.set({lastOpenedDir: mainPath});
  }
  const object = await getFirstLevelFolderInfo(mainPath);
  object.platform = process.platform;
  res.send(object);
}

function getCreateAppOptions(req, res){
  const searchPath = __dirname.split("\\").slice(0, -1).join("/") + "/gas-templates";
  const templates = [{value: "basic", display: "標準機能のみ"}];
  for(const folder of fs.readdirSync(searchPath)){
    if(folder != "basic"){
      templates.push({value: folder, display: folder + "を追加"});
    }
  }
  res.send({
    "templates": {title: "使う機能", options: templates, isMultiple: true},
    "gasType": {title: "GASの形式",
      options: [
        {value: "standalone", display: "GAS単独"},
        {value: "docs", display: "Googleドキュメントと併用"},
        {value: "sheets", display: "Googleシートと併用"},
        {value: "slides", display: "Googleスライドと併用"},
        {value: "forms", display: "Googleフォームと併用"}
      ],
      isMultiple: false
    },
    "executeAs": {
      title: "GASのバックエンドを実行するユーザー",
      isMultiple: false,
      options: [
        {value: "USER_DEPLOYING", display: "あなた"},
        {value: "USER_ACCESSING", display: "アクセスしているユーザー"}
      ]
    },
    "access": {
      title: "GASにアクセスできるユーザー",
      isMultiple: false,
      options: [
        {value: "MYSELF", display: "あなたのみ"},
        {value: "DOMAIN", display: "あなたと同じドメインの人全員"},
        {value: "ANYONE", display: "グーグルアカウントを持つ全員"},
        {value: "ANYONE_ANONYMOUS", display: "全員"}
      ]
    }
  });
}

async function createNewFolder(req, res){
  const path = userSetting.data.lastOpenedDir + "/" + req.body.name;
  if(await isExists(path)){
    res.send(false);
  } else {
    fs.mkdirSync(path);
    res.send(path);
  }
}

module.exports = { createApp, searchPathOfApp, setupNewApp, getCreateAppOptions, createNewFolder };