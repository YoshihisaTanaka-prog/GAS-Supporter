function showAppDetail(appId){
  const array = [appId];
  for(const key of Object.keys(appData)){
    if(key != appId){
      array.push(key);
    }
  }
  $.post("/sort-app-order", {order: array}, function(data){
    appData = data;
  });
  setStatusInfo({"selectedAppId": appId});
  selectedTab("app-detail");
}

function searchApp(){
  function getName(element){
    return $(element).find(".app-li-btn-name").eq(0).text();
  }
  const searchWord = $("#search-app-name").val();
  if(searchWord == ""){
    $(".app-li-sortable").css("display", "list-item");
  } else{
    $('#app-selector').children(".app-li-sortable").each(function(){
      if(getName(this).includes(searchWord)){
        $(this).css("display", "list-item");
      } else {
        $(this).css("display", "none");
      }
    });
  }
}

startAppSelectorPage();

function startAppSelectorPage(){
  if(!["", null, undefined].includes(getStatusInfo("importing").id)){
    showImportPopup();
  }
  for(const key of Object.keys(appData)){
    $("#app-selector").append("<li class='app-li app-li-sortable' id='app-li-" + key + "'><button class='app-li-btn app-li-sortable-btn' id='app-li-" + key + "-btn' onclick='showAppDetail(\"" + key + "\")'><div class='app-li-btn-name'>" + appData[key].name + "　</div><div class='app-li-btn-path'>" + appData[key].path + "</div></button></li>");
  }
  $("#app-selector").append('<hr><li class="app-li-add"><p><button class="app-li-btn" onclick="selectedTab(\'create-app\')">アプリの新規作成</button><button class="app-li-btn" onclick="showImportPopup()">インポート</button></p></li>');

  setButton();

  $(function(){
    $("#app-selector").sortable({
      items: "li:not(.app-li-add)"
    });
    $('#app-selector').bind("sortstop", function(){
      const array = [];
      $(this).children(".app-li-sortable").each(function(){
        array.push($(this).attr("id").split("-")[2]);
      });
      $.post("/sort-app-order", {order: array}, function(data){
        appData = data;
      });
    })
  });

  function setButton(){
    let maxWidth = 0;
    $(".app-li-btn-name").each(function(){
      const width = $(this).width();
      if(width > maxWidth){
        maxWidth = width;
      }
    });
    $(".app-li-btn-name").width(maxWidth);
    maxWidth = 0;
    $(".app-li-btn-path").each(function(){
      const width = $(this).width();
      if(width > maxWidth){
        maxWidth = width;
      }
    });
    $(".app-li-btn-path").width(maxWidth);
    $(".app-li-sortable-btn").hover(
      function(){
        $("#" + $(this).attr("id").slice(0,-4)).removeClass("app-li-sortable");
      },function(){
        $("#" + $(this).attr("id").slice(0,-4)).addClass("app-li-sortable");
      }
    );
    const listWidth = $(".app-li-sortable").eq(0).width();
    $("#search-app-name").width(listWidth);
    $(".app-li-add").width(listWidth)
  }
}

function showImportPopup(){
  $("#folder-popup-background").css("display", "block");
  selectFolder();
}

function closeImportPopup(){
  $("#folder-popup-background").css("display", "none");
  $("#folder-popup-content").html("");
}

var cachedNewAppName = "";
function selectFolder(path=""){
  cachedNewAppName = $("#folder-popup-tab-new-app-name").val();
  $.post("/search-path-of-app", {path}, function(data){
    setFolderInfo(data);
  });
}

function selectedFolder(path=""){
  if(["", null, undefined].includes(cachedNewAppName)){
    alert("アプリ名を入力してください。");
  } else{
    $.post("/import-app", {id: getStatusInfo("importing").id, path: path, name: cachedNewAppName}, function(data){
      let newId = "";
      for(const key of Object.keys(data)){
        appData[key] = data[key];
        newId = key;
      }
      setStatusInfo({"importing": {id: "", name: ""}});
      closeImportPopup();
      showAppDetail(newId);
    });
  }
}

function setFolderInfo(data){
  currentFolders = [];
  let openParentCode = "";
  switch (data.platform) {
    case "win32":
      if(data.myPath.length > 2){
        openParentCode = `<button onclick="selectFolder('${data.myPath.split("/").slice(0,-1).join("/")}')">親フォルダを開く</button>`;
      }
      break;
    case "darwin":
      if(data.myPath != "/"){
        openParentCode = `<button onclick="selectFolder('${data.myPath.split("/").slice(0,-1).join("/")}')">親フォルダを開く</button>`;
      }
      break;
    case "linux":
      if(data.myPath != "/"){
        openParentCode = `<button onclick="selectFolder('${data.myPath.split("/").slice(0,-1).join("/")}')">親フォルダを開く</button>`;
      }
      break;
    default:
      break;
  }
  let appName = "";
  if(["", null, undefined].includes(cachedNewAppName)){
    appName = (getStatusInfo("importing") || {}).name;
    if([null, undefined].includes.appName){
      appName = "";
    }
  } else{
    appName = cachedNewAppName;
  }
  $("#folder-popup-content").html("<div id='folder-popup-tab'><div><span><input type='text' id='folder-popup-tab-new-app-name' value='" + appName + "'>の新しいルートフォルダ：" + data.myPath + "/<input type='text' id='folder-popup-search'></span></div><div><p>" + openParentCode + "</p><p align='right'><button onclick='closeImportPopup()'>閉じる</button></p></div></div>");
  $('#folder-popup-search').on("input", function(){
    const searchWord = $('#folder-popup-search').val();
    if(searchWord == ""){
      $(".select-folder-li").css("display", "list-item")
    } else{
      $(".select-folder-li").each(function(){
        if($(this).find(".select-folder-li-text").eq(0).text().includes(searchWord)){
          $(this).css("display", "list-item")
        } else {
          $(this).css("display", "none")
        }
      });
    }
  });
  $("#folder-popup-content").append("<div id='folder-popup-main'><ul id='select-folder-ul'></ul></div>");
  const innerFolders = data.innerFolders.map((unit)=>{
    return new Promise(function(resolve, reject){
      $.post("/check-if-importable-folder", {path: data.myPath + "/" + unit.name}, function(data){
        resolve({name: unit.name, importable: data});
      });
    });
  });
  Promise.all(innerFolders).then(function(list){
    const innerFolders = list;
    for (const unit of innerFolders){
      let selectCode = '<div class="select-folder-li-sub-button"></div>';
      if(unit.importable){
        selectCode = '<div class="select-folder-li-sub-button" onclick="selectedFolder(\'' + data.myPath + "/" + unit.name + '\')">選択</div>';
      }
      $("#select-folder-ul").append(`<li class="select-folder-li"><button class="select-folder-li-main-button" onclick="selectFolder('${data.myPath}/${unit.name}')"><div class="select-folder-li-text">${unit.name}</div>${selectCode}</button></li>`);
      currentFolders.push(unit.name);
    }
    $(".select-folder-li-sub-button").css("width", remSize*3);
    let folderMaxWidth = 0;
    $(".select-folder-li-text").each(function(){
      const thisWidth = $(this).width();
      if(thisWidth > folderMaxWidth){
        folderMaxWidth = thisWidth;
      }
    });
    $(".select-folder-li-text").width(folderMaxWidth);
    $(".select-folder-li-main-button").width(folderMaxWidth + remSize*3.5);
    const currentUlHeight = $("#select-folder-ul").height();
    const ulHeight = $("#folder-popup-content").height() - Number($("#folder-popup-content").css("padding").slice(0,-2)) - $("#folder-popup-tab").height();
    $("#select-folder-ul").height(ulHeight);
    if(currentUlHeight > ulHeight){
      $("#select-folder-ul").css("overflow-y", "scroll").css("height", ulHeight + "px");
    } else{
      $("#select-folder-ul").height(ulHeight);
    }
  });
}