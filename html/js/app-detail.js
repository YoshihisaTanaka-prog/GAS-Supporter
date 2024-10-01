var cachedAppData = {};

if(["", null, undefined].includes(getStatusInfo("selectedAppId"))){
  selectedTab("app-selector");
} else{
  $.post("/get-app-detail", {id: getStatusInfo("selectedAppId")}, (data)=>{
    $("#app-detail-tab-btn").html("アプリ編集：" + data.name + "　").css("display","inline-block");
    cachedAppData = data;
    writeContentStructure();
    setTimeout(() => {
      monitorAppFolder();
    }, 50);
  });
}

function writeContentStructure(){

  const writeUnit = function(object={}, currentId=""){
    const returnList = [];
    $(currentId).html("");
    const keyLength = Object.keys(object).length;
    for(let i=0; i<keyLength; i++){
      const key = Object.keys(object)[i];
      const unit = object[key];
      const deleteButtonCode = "<button class='app-detail-delete-btn' data-id='" + currentId.slice(1) + "-" + key + "'>削除</button>";
      switch (unit.type) {
        case "block":
          const newId = currentId.slice(1) + "-" + key + "-value";
          let tagCode = "";
          tagCode = tagCode + '<div style="display: flex; justify-content: space-between;">';
          tagCode = tagCode + '  <div>';
          tagCode = tagCode + '    <button class="app-detail-open-close-btn" data-id="' + newId + '">▶</button>';
          tagCode = tagCode + '    <b>Original Block</b>';
          tagCode = tagCode + '  </div>';
          tagCode = tagCode + '  <div class="app-detail-add-btn-div app-detail-add-original-block-btn-div" data-id="' + newId + '">';
          tagCode = tagCode + '    <button class="app-detail-add-btn" data-id="' + newId + '">＋</button>';
          tagCode = tagCode + '    ' + deleteButtonCode;
          tagCode = tagCode + '  </div>';
          tagCode = tagCode + '</div>';
          $(currentId).append('<li class="bordered-li sortable-li" data-from="' + currentId + '" data-key="' + key + '">' + tagCode + '<ul id="' + newId + '"></ul></li>');
          const res = writeUnit(unit.value, currentId + "-" + key + "-value");
          for(const x of res){
            returnList.push(x);
          }
          break;
        case "super-fixed-start":
          var newLiElement = $("<li>", {class: "bordered-li", "data-key": key});
          newLiElement.text(unit.value + " ");
          newLiElement.append("<input type='text' value='" + unit.enteredValue + "' style='width: 70vw;'>>");
          $(currentId).append(newLiElement);
          if(keyLength == 2){
            $(currentId).append("<li class='sortable-li' style='font-size: 0.2rem; padding: 0;'>&nbsp;</li>");
          }
          break;
        case "super-fixed-end":
          var newLiElement = $("<li>", {class: "bordered-li", "data-key": key});
          newLiElement.text(unit.value);
          $(currentId).append(newLiElement);
          break;
        case "fixed":
          var newLiElement = $("<li>", {class: "bordered-li sortable-li", "data-from": currentId, "data-key": key});
          newLiElement.text(unit.value);
          $(currentId).append(newLiElement);
          break;
        case "file":
          let buttonText = "";
          let displayText = "";
          if(["", null, undefined].includes(unit.value)){
            buttonText = "選択";
            displayText = "未選択";
            unit.value = "";
          } else {
            buttonText = "変更";
            displayText = "「" + unit.value + "」";
            returnList.push(unit.value);
          }
          const selectButtonCode = "<button class='app-detail-select-file-btn' data-id='" + currentId + "-" + key + "'>" + buttonText + "</button>";
          var newLiElement = $("<li>", {class: "bordered-li sortable-li", "data-from": currentId, "data-key": key});
          if(unit.value.endsWith(".js")){
            const newChildLiElements = [$("<li></li>"), $("<li></li>"), $("<li></li>")];
            newChildLiElements[0].text("<script ");
            newChildLiElements[0].append("<input type='text' value='" + unit.enteredValue + "' style='width: 70vw;'>>" + selectButtonCode + deleteButtonCode);
            newChildLiElements[1].text("ファイル：" + displayText);
            newChildLiElements[2].text("</script>");
            const newUlElement = $("<ul></ul>").css("display", "block").css("margin", 0).css("border", "none");
            for(const newChildLiElement of newChildLiElements){
              newChildLiElement.css("padding", 0).appendTo(newUlElement);
            }
            newLiElement.append(newUlElement);
          } else if(unit.value.endsWith(".css")){
            const newChildLiElements = [$("<li></li>"), $("<li></li>"), $("<li></li>")];
            newChildLiElements[0].text("<style ");
            newChildLiElements[0].append("<input type='text' value='" + unit.enteredValue + "' style='width: 70vw;'>>" + selectButtonCode + deleteButtonCode);
            newChildLiElements[1].text("ファイル：" + displayText);
            newChildLiElements[2].text("</style>");
            const newUlElement = $("<ul></ul>").css("display", "block").css("margin", 0).css("border", "none");
            for(const newChildLiElement of newChildLiElements){
              newChildLiElement.css("padding", 0).appendTo(newUlElement);
            }
            newLiElement.append(newUlElement);
          } else{
            newLiElement.text("ファイル：" + displayText + "　");
            newLiElement.append(selectButtonCode + deleteButtonCode);
          }
          $(currentId).append(newLiElement);
          break;
        case "text":
          $(currentId).append("<li class='bordered-li sortable-li' data-from='" + currentId + "' data-key='" + key + "'><input type='text' value='" + unit.value + "' style='width: 80vw;'>" + deleteButtonCode + "</li>");
        default:
          break;
      }
    }
    
    if(keyLength == 0){
      $(currentId).append("<li class='sortable-li' style='font-size: 0.2rem; padding: 0;'>&nbsp;</li>");
    }
    return returnList;
  }

  $("#app-detail-gas").html("");
  for(const gasFile of cachedAppData.gs){
    $("#app-detail-gas").append('<li class="bordered-li sortable-li-gas">' + gasFile.slice(3) + '</li>');
  }

  const usedFiles = cachedAppData.gs.concat(writeUnit(cachedAppData.head, "#app-detail-head"), writeUnit(cachedAppData.body, "#app-detail-body"));
  let count = 0;
  $("#app-detail-did-not-set").html("");
  for(const file of cachedAppData.fileInfo){
    if(!usedFiles.includes(file)){
      $("#app-detail-did-not-set").append('<li class="bordered-li sortable-li" data-from="#app-detail-did-not-set">' + file + '</li>');
      count++;
    }
  }
  if(count == 0){
    $("#app-detail-did-not-set").append("<li class='sortable-li' style='font-size: 0.2rem; padding: 0;'>&nbsp;</li>");
  }
  $("#app-detail-did-not-set").css("display", "block");
  setButton();
  setSortSystem();
}

function setButton(){
  $(".app-detail-select-type-btn").off("click");
  $(".app-detail-add-btn").off("click");
  $(".app-detail-delete-btn").off("click");
  $(".app-detail-open-close-btn").off("click");
  $(".app-detail-adding-type-selection").remove();

  const selectionFormatElement = $("#app-detail-adding-type-selection-format");
  $(".app-detail-add-btn-div").each(function(){
    const myDataId = $(this).data("id");
    const sfe = selectionFormatElement.clone();
    sfe.attr("id", myDataId + "-type-selection");
    sfe.attr("class", "app-detail-adding-type-selection");
    if(myDataId == "app-detail-head"){
      sfe.children("div").eq(0).append('<div><button class="app-detail-select-type-btn" data-type="cdn">CDNを追加</button></div>');
    }
    sfe.children("div").eq(0).attr("id", myDataId + "-type-selection-main");
    sfe.children("div").eq(1).attr("id", myDataId + "-type-selection-sub");
    sfe.find("button").attr("data-id", myDataId).on("click", function(){
      addItem($(this).data("id"), $(this).data("type"));
      $(".app-detail-adding-type-selection").removeAttr("style");
      $(".app-detail-add-btn").removeAttr("style")
    });
    sfe.hover(()=>{},()=>{
      $(".app-detail-adding-type-selection").removeAttr("style");
      $(".app-detail-add-btn").removeAttr("style")
    });
    $(this).append(sfe);
  });

  $(".app-detail-add-btn").on("click", function(){
    if(["", null, undefined].includes($(this).attr("onclick"))){
      const selectElement = $("#" + $(this).data("id") + "-type-selection");
      if(selectElement.attr("style")){
        selectElement.removeAttr("style");
        $(this).removeAttr("style");
      } else{
        selectElement.css("height", "fit-content").css("width", "fit-content").css("z-index", "10").css("border", "1px solid #000");
        $(this).css("background-color", "#ccc").css("color", "#000");
      }
    }
  });

  $(".app-detail-delete-btn").on("click", function(){
    deleteConstructor($(this).data("id"));
  });

  $(".app-detail-open-close-btn").on("click", function(){
    const childId = $(this).data("id");
    if($("#" + childId).attr("style")){
      $("#" + childId).removeAttr("style");
      $(this).text("▶");
    } else {
      $("#" + childId).attr("style", "display: block;");
      $(this).text("▼");
    }
  });
}

function setSortSystem(){
  $(".sortable-ul").addClass("setup-sort").sortable({
    items: ".sortable-li",
    stop: function(e, ui){
      setTimeout(() => {
        moveConstructor(ui.item);
      }, 10);
      $("#app-detail-did-not-set").html(
        $("#app-detail-did-not-set").children().sort(function(a,b){
          if ($(a).text() > $(b).text()) {
            return 1;
          } else if ($(a).text() < $(b).text()) {
            return -1;
          } else {
            return 0;
          }
        })
      );
    }
  });
  $("#app-detail-gas").sortable({
    items: ".sortable-li-gas",
    stop: function(){
      sortGasList();
    }
  }).addClass("setup-sort");
}

function addItem(id, type){
  console.log("called addItem", id, type);
  switch(type){
    case "file":
      break;
    case "cdn":
      break;
    default:
      addConstructor(id, type);
      break;
  }
}

function sortGasList() {
  const orderedList = [];
  $("#app-detail-gas").children("li").each(function(){
    orderedList.push("gs/" + $(this).text());
  });
  const param = { orderedList };
  param.id = cachedAppData.id;
  $.post("/sort-gas-list", param, function(data){
    cachedAppData = data;
    writeContentStructure();
  });
}

function addConstructor(id, type, fileName=null){
  const keyPath = id.slice(11);
  const params = { keyPath, type, fileName };
  params.id = cachedAppData.id
  $.post("/add-constructor", params, function(data){
    cachedAppData = data;
    writeContentStructure();
  });
}

function sortConstructor(id="", orderedKeys=[]){
  const keyPath = id.slice(11);
  const params = { keyPath, orderedKeys };
  params.id = cachedAppData.id;
  $.post("/sort-constructor", params, function(data){
    cachedAppData = data;
    writeContentStructure();
  });
}

function moveConstructor(element){
  const from = element.data("from").slice(1);
  const to = element.closest("ul").attr("id");
  if(from == "app-detail-did-not-set"){
    if(to != "app-detail-did-not-set"){
      addConstructor(to, "file", element.text());
    }
  } else {
    if(from == to){
      const array = [];
      $("#" + from).children("li").each(function(){
        array.push($(this).data("key"));
      });
      sortConstructor(from, array);
    } else{
      const from = element.data("from").slice(12);
      const to = element.closest("ul").attr("id").slice(11);
      const key = element.data("key");
      const param = { from, to, key };
      param.id = cachedAppData.id;
      console.log(param);
      $.post("/move-constructor", param, function(data){
        cachedAppData = data;
        writeContentStructure();
      });
    }
  }
}

function deleteConstructor(id) {
  const keyPath = id.slice(11);
  $.post("/delete-constructor", {id: cachedAppData.id, keyPath: keyPath}, function(data){
    cachedAppData = data;
    writeContentStructure();
  });
}

function createGasFile(){}

function monitorAppFolder(){
  if(localStorage.getItem('tabName') == "app-detail"){
    $.post("/monitor-app-folder", {id: cachedAppData.id}, function(data){
      if (data.isValid) {
        const alertLines = [];
        for(const file of data.added){
          alertLines.push("・" + file + "が追加されました。");
        }
        for(const file of data.deleted){
          alertLines.push("・" + file + "が削除されました。");
        }
        if(alertLines.length == 0){
          setTimeout(() => {
            monitorAppFolder();
          }, 10000);
        } else {
          const afterFunction = function(){
            $.post("/get-app-detail", {id: cachedAppData.id}, (data)=>{
              cachedAppData = data;
              writeContentStructure();
            });
            setTimeout(() => {
              monitorAppFolder();
            }, 10000);
          }
          alert(alertLines.join("\n"));
          afterFunction();
        }
      } else {
        const result = confirm(cachedAppData.name + "は移動または削除されました。\n移動した場合はアプリ一覧からインポートしてください。\n\nアプリをインポートしますか？");
        if(result){
          $.post("/import-app", {id: cachedAppData.id, path: ""}, function(){
            setStatusInfo({"importing": {id: cachedAppData.id, name: cachedAppData.name}});
            selectedTab("app-selector");
          });
        } else {
          $.post("/delete-app", {id: cachedAppData.id}, function(){
            delete appData[cachedAppData.id];
            selectedTab("app-selector");
          });
        }
      }
    });
  }
}

function getParentLi(item){
  if(item.attr("id") == "app-detail-main-ul"){
    return null;
  } else {
    return item.closest("li");
  }
}