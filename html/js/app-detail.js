var cachedAppData = {};
var cachedCdns = {};
var cachedSavedCdns = {};
var newCdn = "";
var newType = "";
var openedIdList = [];
var usedCdns = {
  css: [],
  js: [],
  group: [],
  reset: function(){
    this.css = [];
    this.js = [];
    this.group = [];
  }
};
var currentChangingElement = null;

if(["", null, undefined].includes(getStatusInfo("selectedAppId"))){
  selectedTab("app-selector");
} else{
  const currentWidth = $(".app-detail-separate-gas-line").width();
  const paddingWidth = $("#app-detail-main-ul").css("padding");
  console.log(paddingWidth);
  $(".app-detail-separate-gas-line").width(currentWidth + Number(paddingWidth.slice(0, -2))*2).css({"transform": "translateX( -" + paddingWidth + " )"});
  $.post("/get-my-cdns", {} , function(data){
    const object = {};
    for(const key of Object.keys(data)){
      object[key] = Object.freeze(data[key]);
    }
    cachedCdns = Object.freeze(object);
    $.post("/get-app-detail", {id: getStatusInfo("selectedAppId")}, (data)=>{
      $("#app-detail-tab-btn").html("アプリ編集：" + data.name + "　").css("display","inline-block");
      cachedAppData = data;
      writeContentStructure();
      setTimeout(() => {
        monitorAppFolder();
      }, 50);
    });
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
      const changeCdnButtonDiv = $("<div></div>", {class: "app-detail-select-cdn-btn-div", id: currentId.slice(1) + "-" + key + "-select-cdn-btn-div"});
      changeCdnButtonDiv.html("<button class='app-detail-select-cdn-btn' data-id='" + currentId.slice(1) + "-" + key + "'>変更</button>");
      const rightDiv = $("<div></div>");
      changeCdnButtonDiv.appendTo(rightDiv);
      rightDiv.append(deleteButtonCode);
      const cdnHeaderDiv = $("<div></div>", {class: "app-detail-cdn-header-div"});
      cdnHeaderDiv.append("<b></b>");
      rightDiv.appendTo(cdnHeaderDiv);
      const newCdnLiElement = $("<li>", {class: "bordered-li sortable-li", "data-from": currentId, "data-key": key});
      switch (unit.type) {
        case "block":
          const newId = currentId.slice(1) + "-" + key + "-value";
          let tagCode = "";
          tagCode = tagCode + '<div style="display: flex; justify-content: space-between;">';
          tagCode = tagCode + '  <div>';
          tagCode = tagCode + '    <button class="app-detail-open-close-btn" data-id="' + newId + '">▶</button>';
          tagCode = tagCode + '    <b><input type="text" class="app-detail-input" value="' + unit.enteredValue + '" data-keypath="' + currentId.slice(1) + "-" + key + '" style="width: 70vw;"></b>';
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
          newLiElement.append("<input type='text' class='app-detail-input' data-keypath='" + currentId.slice(1) + "-" + key + "' value='" + unit.enteredValue + "' style='width: 70vw;'>>");
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
            newChildLiElements[0].append("<input type='text' class='app-detail-input' data-keypath='" + currentId.slice(1) + "-" + key + "' value='" + unit.enteredValue + "' style='width: 70vw;'>>" + selectButtonCode + deleteButtonCode);
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
            newChildLiElements[0].append("<input type='text' class='app-detail-input' data-keypath='" + currentId.slice(1) + "-" + key + "' value='" + unit.enteredValue + "' style='width: 70vw;'>>" + selectButtonCode + deleteButtonCode);
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
        case "cdn-css":
          newCdnLiElement.text('<link rel="stylesheet" href="' + JSON.parse(unit.value) + '">');
          cdnHeaderDiv.find("b").text(unit.title);
          cdnHeaderDiv.find("button[class='app-detail-select-cdn-btn']").attr("data-title", unit.title).attr("data-type", "css");
          cdnHeaderDiv.prependTo(newCdnLiElement);
          $(currentId).append(newCdnLiElement);
          if(!usedCdns.css.includes(unit.title)){
            usedCdns.css.push(unit.title);
          }
          break;
        case "cdn-js":
          newCdnLiElement.text('<script src="' + JSON.parse(unit.value) + '"></script>');
          cdnHeaderDiv.find("b").text(unit.title);
          cdnHeaderDiv.find("button[class='app-detail-select-cdn-btn']").attr("data-title", unit.title).attr("data-type", "js");
          cdnHeaderDiv.prependTo(newCdnLiElement);
          $(currentId).append(newCdnLiElement);
          if(!usedCdns.js.includes(unit.title)){
            usedCdns.js.push(unit.title);
          }
          break;
        case "cdn-group":
          cdnHeaderDiv.find("b").text(unit.title);
          cdnHeaderDiv.find("button[class='app-detail-select-cdn-btn']").attr("data-title", unit.title).attr("data-type", "group");
          cdnHeaderDiv.appendTo(newCdnLiElement);
          for(const cdnUnit of JSON.parse(unit.value)){
            const divUnit = $("<div></div>");
            if(cdnUnit.type == "css"){
              divUnit.text('<link rel="stylesheet" href="' + cdnUnit.url + '">');
            }
            if(cdnUnit.type == "js"){
              divUnit.text('<script src="' + cdnUnit.url + '"></script>');
            }
            divUnit.appendTo(newCdnLiElement);
          }
          $(currentId).append(newCdnLiElement);
          if(!usedCdns.group.includes(unit.title)){
            usedCdns.group.push(unit.title);
          }
          break;
        case "text":
          $(currentId).append("<li class='bordered-li sortable-li' data-from='" + currentId + "' data-key='" + key + "'><input type='text' class='app-detail-input' data-keypath='" + currentId.slice(1) + "-" + key + "' value='" + unit.enteredValue + "' style='width: 80vw;'>" + deleteButtonCode + "</li>");
        default:
          break;
      }
    }
    
    if(keyLength == 0){
      $(currentId).append("<li class='sortable-li' style='font-size: 0.2rem; padding: 0;'>&nbsp;</li>");
    }
    return returnList;
  }
  
  const setButton = function(){
    $(".app-detail-select-type-btn").off("click");
    $(".app-detail-add-btn").off("click");
    $(".app-detail-delete-btn").off("click");
    $(".app-detail-open-close-btn").off("click");
    $(".app-detail-adding-type-selection").remove();
    $(".app-detail-select-cdn-btn").off("click");

    const selectionFormatElement = $("#app-detail-adding-type-selection-format");
    $(".app-detail-add-btn-div").each(function(){
      const myDataId = $(this).data("id");
      const sfe = selectionFormatElement.clone();
      sfe.attr("id", myDataId + "-type-selection");
      sfe.attr("class", "app-detail-adding-type-selection");
      sfe.children("div").eq(0).attr("id", myDataId + "-type-selection-main");
      sfe.children("div").eq(1).attr("id", myDataId + "-type-selection-sub");
      sfe.find("button").attr("data-id", myDataId).on("click", function(){
        addItem($(this).data("id"), $(this).data("type"));
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
        openedIdList = openedIdList.filter( id => id != childId );
      } else {
        $("#" + childId).attr("style", "display: block;");
        $(this).text("▼");
        openedIdList.push(childId);
      }
    }).each(function(){
      const childId = $(this).data("id");
      if(openedIdList.includes(childId)){
        $("#" + childId).attr("style", "display: block;");
        $(this).text("▼");
      }
    });
    $(".app-detail-select-cdn-btn").on("click", function(){
      currentChangingElement = $(this);
      $(this).off("click").addClass("selected-tab");
      setCdnSelection($(this).data("id") + "-select-cdn-btn-div", false, $(this).data("type"), $(this).data("title"));
    });
  }

  const setSortSystem = function(){
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

  $("#app-detail-gas").html("");
  for(const gasFile of cachedAppData.gs){
    $("#app-detail-gas").append('<li class="bordered-li sortable-li-gas">' + gasFile.slice(3) + '</li>');
  }

  usedCdns.reset();
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
  $(".app-detail-input").off("change").on("change", function(){
    const keyPath = $(this).data("keypath").slice(11);
    const enteredValue = $(this).val();
    const param = { keyPath, enteredValue };
    param.id = cachedAppData.id;
    $.post("/update-constructor-value", param, function(data){
      cachedAppData = data;
      writeContentStructure();
    });
  });
}

function setCdnSelection(addId="main", isMultiple=true, myType="", myCnd="") {
  const parentId = addId.split("-").slice(0, -1).join("-");
  $("#" + parentId + "-main").css("display", "none");
  $("#" + parentId).attr("style", "height: fit-content; width: fit-content; z-index: 10; border: 1px solid #000;").off("mouseenter, mouseleave");
  const inputType = isMultiple ? "checkbox" : "radio";

  function getNumbers(url=""){
    const returnList = [];
    let cachedNum = "";
    for(const char of url){
      if("0123456789".includes(char)){
        cachedNum += char;
      } else if (cachedNum != ""){
        returnList.push(Number(cachedNum));
        cachedNum = "";
      }
    }
    return returnList;
  }

  for(const i of [0, 1, 2]){
    $("#app-detail-edit-cdn-format").find("ul").eq(i).html("<li><b>" + ["CSS", "JS", "Group"][i] + "</b></li><li><hr></li>");
  }
  let count = 0;
  const cssCdns = Object.keys(cachedCdns.css).filter( cdn => !usedCdns.css.includes(cdn) );
  if(myType == "css" && myCnd != ""){
    cssCdns.push(myCnd);
  }
  count += cssCdns.sort((a,b)=>{
    if(a.toLowerCase() == b.toLowerCase()){
      if(a > b){
        return 1;
      }
      if(a < b){
        return -1;
      }
      return 0;
    }
    if(a.toLowerCase() > b.toLowerCase()){
      return 1;
    }
    if(a.toLowerCase() < b.toLowerCase()){
      return -1;
    }
    return 0;
  }).length;
  if(cssCdns.length == 0){
    const newLiElement = $("<li></li>");
    if(Object.keys(cachedCdns.css).length == 0){
      newLiElement.text('CSSのCDNが未登録。');
    } else{
      newLiElement.text('登録済みのCSSのCDNがすべて使用済。');
    }
    $("#app-detail-edit-cdn-format").find("ul").eq(0).append(newLiElement);
  } else {
    const additionalAttrCode = isMultiple ? 'name="css"' : 'name="cdn" data-type="css"';
    for(const cdn of cssCdns){
      const newLiElement = $("<li></li>", {class: "space-between"});
      newLiElement.append('<span><label class="space-between"><span>' + cdn + '</span><span>ver.' + getNumbers(cachedCdns.css[cdn]).join(".") + '</span></label></span>');
      if(myType == "css" && myCnd == cdn){
        newLiElement.find("label").children("span").eq(0).prepend('<input type="' + inputType + '" value="' + cdn + '" checked ' + additionalAttrCode + '>');
      } else{
        newLiElement.find("label").children("span").eq(0).prepend('<input type="' + inputType + '" value="' + cdn + '" ' + additionalAttrCode + '>');
      }
      newLiElement.append("<button type='button' class='edit-this-cdn-info' data-type='css' data-cdn='" + cdn + "'>編集</button>");
      $("#app-detail-edit-cdn-format").find("ul").eq(0).append(newLiElement);
    }
  }
  const jsCdns = Object.keys(cachedCdns.js).filter( cdn => !usedCdns.js.includes(cdn) );
  if(myType == "js" && myCnd != ""){
    jsCdns.push(myCnd);
  }
  count += jsCdns.sort((a,b)=>{
    if(a.toLowerCase() == b.toLowerCase()){
      if(a > b){
        return 1;
      }
      if(a < b){
        return -1;
      }
      return 0;
    }
    if(a.toLowerCase() > b.toLowerCase()){
      return 1;
    }
    if(a.toLowerCase() < b.toLowerCase()){
      return -1;
    }
    return 0;
  }).length;
  if(jsCdns.length == 0){
    const newLiElement = $("<li></li>");
    if(Object.keys(cachedCdns.js).length == 0){
      newLiElement.text('JSのCDNが未登録。');
    } else{
      newLiElement.text('登録済みのJSのCDNがすべて使用済。');
    }
    $("#app-detail-edit-cdn-format").find("ul").eq(1).append(newLiElement);
  } else {
    const additionalAttrCode = isMultiple ? 'name="js"' : 'name="cdn" data-type="js"';
    for(const cdn of jsCdns){
      const newLiElement = $("<li></li>", {class: "space-between"});
      newLiElement.append('<span><label class="space-between"><span>' + cdn + '</span><span>ver.' + getNumbers(cachedCdns.js[cdn]).join(".") + '</span></label></span>');
      if(myType == "js" && myCnd == cdn){
        newLiElement.find("label").children("span").eq(0).prepend('<input type="' + inputType + '" value="' + cdn + '" checked ' + additionalAttrCode + '>');
      } else{
        newLiElement.find("label").children("span").eq(0).prepend('<input type="' + inputType + '" value="' + cdn + '" ' + additionalAttrCode + '>');
      }
      newLiElement.append("<button type='button' class='edit-this-cdn-info' data-type='js' data-cdn='" + cdn + "'>編集</button>");
      $("#app-detail-edit-cdn-format").find("ul").eq(1).append(newLiElement);
    }
  }
  const groupCdns = Object.keys(cachedCdns.group).filter( cdn => !usedCdns.group.includes(cdn) );
  if(myType == "group" && myCnd != ""){
    groupCdns.push(myCnd);
  }
  count += groupCdns.sort((a,b)=>{
    if(a.toLowerCase() == b.toLowerCase()){
      if(a > b){
        return 1;
      }
      if(a < b){
        return -1;
      }
      return 0;
    }
    if(a.toLowerCase() > b.toLowerCase()){
      return 1;
    }
    if(a.toLowerCase() < b.toLowerCase()){
      return -1;
    }
    return 0;
  }).length;
  if(groupCdns.length == 0){
    const newLiElement = $("<li></li>");
    if(Object.keys(cachedCdns.group).length == 0){
      newLiElement.text('まとまったCDNが未登録。');
    } else{
      newLiElement.text('登録済みのまとまったCDNがすべて使用済。');
    }
    $("#app-detail-edit-cdn-format").find("ul").eq(2).append(newLiElement);
  } else {
    const additionalAttrCode = isMultiple ? 'name="group"' : 'name="cdn" data-type="group"';
    for(const cdn of groupCdns){
      const newLiElement = $("<li></li>")
      const childElements = [$("<p></p>", {class: "space-between"})];
      if(myType == "group" && myCnd == cdn){
        childElements[0].append('<span><label><input type="' + inputType + '" value="' + cdn + '" data-type="group" checked ' + additionalAttrCode + '>' + cdn + '</label></span>');
      } else{
        childElements[0].append('<span><label><input type="' + inputType + '" value="' + cdn + '" data-type="group" ' + additionalAttrCode + '>' + cdn + '</label></span>');
      }
      childElements[0].append("<button type='button' class='edit-this-cdn-info' data-type='group' data-cdn='" + cdn + "'>編集</button>");
      for(const unit of cachedCdns.group[cdn]){
        const element1 = $("<span></span>", {style: "padding-inline-start: 1rem"});
        element1.html("<span class='app-detail-group-cdn-code-type-span'>" + unit.type + "</span>" + unit.title);
        const element2 = $("<span></span>");
        element2.text("ver." + getNumbers(unit.url).join("."));
        const childElement = $("<p></p>", {class: "app-detail-group-cdn-code-p space-between"});
        childElement.append(element1).append(element2);
        childElements.push(childElement);
      }
      for(const childElement of childElements){
        newLiElement.append(childElement);
      }
      newLiElement.append("<p class='app-detail-group-cdn-code-p'></p>");
      $("#app-detail-edit-cdn-format").find("ul").eq(2).append(newLiElement);
    }
  }
  const clone = $("#app-detail-edit-cdn-format").clone();
  const keyPath = isMultiple ? parentId.split("-").slice(2, -2).join("-") : parentId.split("-").slice(2, -3).join("-");
  clone.find("input[name=keyPath]").eq(0).val(keyPath);
  clone.attr("id", "app-detail-edit-cdn").find("div,form").each(function(){
    const className = $(this).attr("class");
    if(!["", null, undefined].includes(className)){
      $(this).attr("id", className).removeAttr("class");
    }
  });
  clone.find("button").each(function(){
    const id = $(this).attr("id");
    if(!["", null, undefined].includes(id)){
      $(this).attr("id", id.slice(0,-7));
    }
  });
  clone.appendTo($("#" + addId));
  for(let i=0; i<3; i++){
    const key = ["css", "js", "group"][i];
    if(usedCdns[key].length != 0){
      clone.find("ul").eq(i).append("<li><hr></li><li><b>使用済みリスト</b></li><li><hr></li>");
      for(const cdn of usedCdns[key]){
        clone.find("ul").eq(i).append("<li>" + cdn + "</li>");
      }
    }
    if(i == 2){
      let maxWidth = 0;
      clone.find("ul").eq(i).find("p[class='app-detail-group-cdn-code-p space-between']").each(function(){
        const $span = $(this).children("span").eq(1);
        if($span.text() == "ver."){
          $span.text("ver.???");
        }
        const width = $span.width();
        if(width > maxWidth){
          maxWidth = width;
        }
      });
      clone.find("ul").eq(i).find("p[class='app-detail-group-cdn-code-p space-between']").each(function(){
        $(this).children("span").eq(1).width(maxWidth);
      });
      maxWidth = 0;
      $(".app-detail-group-cdn-code-type-span").each(function(){
        const width = $(this).width();
        if(width > maxWidth){
          maxWidth = width;
        }
      });
      $(".app-detail-group-cdn-code-type-span").css({"display": "inline-block"}).each(function(){
        const width = $(this).width(maxWidth);
      });
    } else{
      let maxSpanWidth = 0;
      clone.find("ul").eq(i).find("label").each(function(){
        const width = $(this).children("span").eq(1).width();
        if(width > maxSpanWidth){
          maxSpanWidth = width;
        }
      });
      let maxLabelWidth = 0;
      clone.find("ul").eq(i).find("label").each(function(){
        $(this).children("span").eq(1).width(maxSpanWidth);
        const width = $(this).width();
        if(width > maxLabelWidth){
          maxLabelWidth = width;
        }
      });
      clone.find("ul").eq(i).find("label").each(function(){
        $(this).width(maxLabelWidth);
      });
    }
  }
  $(".edit-this-cdn-info").off("click").on("click", function(){
    $(this).closest("label").click();
    openEditUserCdnElement({type: $(this).data("type"), cdn:  $(this).data("cdn")});
  });
  $(".app-detail-group-cdn-code-p").off("click").on("click", function(){
    $(this).closest("li").find("label").click();
  });
  $("#app-detail-edit-cdn-save-my-status").children("input").eq(0).val(addId);
  $("#app-detail-edit-cdn-save-my-status").children("input").eq(1).prop("checked", isMultiple);
  $("#app-detail-edit-cdn-save-my-status").children("input").eq(2).prop("checked", !isMultiple);
  if(count == 0){
    openEditUserCdnElement();
  }
  if(isMultiple){
    const $button = $("#app-detail-edit-cdn-main").find("button:last");
    const height = Object.freeze($button.height() + Number($button.css("border-width").slice(0,-2)*3));
    $button.removeAttr("style");
    $button.css({"color": "#fff", "background-color": "#fff", "border-color": "#fff", "border-style": "none", "height": height+"px"});
    $("input[type=checkbox]").on("change", function(){
      if($("input[type=checkbox]:checked").length == 0){
        const $button = $("#app-detail-edit-cdn-main").find("button:last");
        const height = Object.freeze($button.height() + Number($button.css("border-width").slice(0,-2)*3));
        $button.removeAttr("style");
        $button.css({"color": "#fff", "background-color": "#fff", "border-color": "#fff", "border-style": "none", "height": height+"px"}).removeAttr("onclick");
      } else {
        $("#app-detail-edit-cdn-main").find("button:last").removeAttr("style").attr("onclick", "sendNewCdnToEditApp()");
      }
    });
  } else{
    $("#app-detail-edit-cdn-main").find("button:last").attr("onclick", "sendNewCdnToEditApp()");
    $("#app-detail-select-cdn-form").append("<input type='hidden' name='type'>")
    $("#app-detail-select-cdn-form").find("input[name=type]").val(myType);
    $("input[type=radio]").on("change", function(){
      $("#app-detail-select-cdn-form").find("input[name=type]").val($(this).data("type"));
    });
    $("#app-detail-edit-cdn").attr("style", "background-color: #fff; padding: 0.3em; border: 1px solid #000; border-radius: 0.2em; position: absolute; top:2em; right: 0");
  }
}

function closeCdnSelectWindow(){
  if(currentChangingElement){
    currentChangingElement.on("click", function(){
      currentChangingElement = $(this);
      $(this).off("click").addClass("selected-tab");
      setCdnSelection($(this).data("id") + "-select-cdn-btn-div", false, $(this).data("type"), $(this).data("title"));
    });
    currentChangingElement = null;
  }
  const subId = $("#app-detail-edit-cdn-save-my-status").children("input").eq(0).val();
  const parentId = subId.slice(0, -4);
  $("#" + parentId).hover(()=>{},
    ()=>{
      $(".app-detail-adding-type-selection").removeAttr("style");
      $(".app-detail-add-btn").removeAttr("style")
    }
  );
  const mainId = parentId + "-main";
  $("#" + mainId).removeAttr("style");
  $("#app-detail-edit-cdn").remove();
}

function openEditUserCdnElement({type="", cdn=""}={}, isCreating=false){
  if(Object.keys(cachedSavedCdns).length == 0){
    for(const key1 of Object.keys(cachedCdns)){
      cachedSavedCdns[key1] = {};
      for(const key2 of Object.keys(cachedCdns[key1])){
        cachedSavedCdns[key1][key2] = cachedCdns[key1][key2];
      }
    }
    $("#app-detail-edit-cdn-form-save-old-data").find("input").eq(0).val(type);
    $("#app-detail-edit-cdn-form-save-old-data").find("input").eq(1).val(cdn);
    if(type != ""){
      newType = type;
    }
    if(cdn != ""){
      newCdn = cdn;
    }
    if(type + cdn == ""){
      isCreating = true;
    }
    if(type == "group"){
      selectEditUserCdnElement("group", isCreating);
    } else{
      selectEditUserCdnElement("css-js", isCreating);
    }
    return;
  }
  $(".sortable-div, .inner-of-app-detail-edit-cdn-form-group").remove();
  
  $("#app-detail-edit-cdn-main").css("display", "none");
  $("#app-detail-edit-cdn-sub").css("display", "block");
  const setOnchangeInGroupForm = function(){
    $(".app-detail-edit-cdn-form-input-main-title").off("change").on("change", function(){
      const cachedArray = [];
      if(newCdn != ""){
        for(const cdnUnit of cachedSavedCdns.group[newCdn]){
          cachedArray.push(cdnUnit);
        }
        delete cachedSavedCdns.group[newCdn];
      }
      newCdn = $(this).val();
      cachedSavedCdns.group[newCdn] = cachedArray;
    })
    $(".app-detail-edit-cdn-form-input-title").off("change").on("change", function(){
      const title = $(this).val();
      const index = $(this).data("index");
      cachedSavedCdns.group[newCdn][index].title = title;
    });
    $(".app-detail-edit-cdn-form-input-url").off("change").on("change", function(){
      const index = $(this).data("index");
      const url = $(this).val();
      let type = "";
      if(url.endsWith(".css")){
        $("#app-detail-edit-cdn-form-judge-css-" + index).prop("checked", true);
        type = "css";
      }
      if(url.endsWith(".js")){
        $("#app-detail-edit-cdn-form-judge-js-" + index).prop("checked", true);
        type = "js";
      }
      cachedSavedCdns.group[newCdn][index].type = type;
      cachedSavedCdns.group[newCdn][index].url = url;
    });
    $(".app-detail-edit-cdn-form-judge").off("change").on("change", function(){
      const [type, indexStr] = $(this).attr("id").split("-").slice(-2);
      const index = Number(indexStr);
      cachedSavedCdns.group[newCdn][index].type = type;
    });
    $(".app-detail-edit-cdn-form-delete-unit-btn").off("click").on("click", function(){
      const index = Number($(this).data("index"));
      $("#app-detail-edit-cdn-form-unit-" + index).remove();
      cachedSavedCdns.group[newCdn].splice(index, 1);
      const length = cachedSavedCdns.group[newCdn].length;
      if(length == 0){
        $("#app-detail-edit-cdn-sub").children("p").eq(0).removeAttr("style");
        $("#app-detail-edit-cdn-sub").children("hr").eq(0).removeAttr("style");
        $("#app-detail-edit-cdn-form-css-js").find("label").each(function(){
          $(this).find("input").prop("checked", false);
        })
      } else if(length == 1){
        $("#app-detail-edit-cdn-sub").children("p").eq(0).removeAttr("style");
        $("#app-detail-edit-cdn-sub").children("hr").eq(0).removeAttr("style");
      } else{
        newType = "group";
        $("#app-detail-edit-cdn-sub").children("p").eq(0).css("display","none");
        $("#app-detail-edit-cdn-sub").children("hr").eq(0).css("display","none");
      }
    });
    $(".app-detail-edit-cdn-form-add-unit-btn").off("click").on("click", function(){
      let length = cachedSavedCdns.group[newCdn].length;
      const unitElement = $("<div></div>", {class: "sortable-div", style: "background-color: #fff", id: "app-detail-edit-cdn-form-unit-" + length});
      unitElement.html($("#app-detail-edit-cdn-form-css-js").html());
      unitElement.find("input").eq(0).attr("data-index", length).addClass("app-detail-edit-cdn-form-input-title");
      unitElement.find("input").eq(1).attr("data-index", length).addClass("app-detail-edit-cdn-form-input-url");
      unitElement.find("input[name=type]").attr("name", "type-" + length);
      unitElement.find("input").eq(2).attr("id", "app-detail-edit-cdn-form-judge-css-" + length).addClass("app-detail-edit-cdn-form-judge");
      unitElement.find("input").eq(3).attr("id", "app-detail-edit-cdn-form-judge-js-" + length).addClass("app-detail-edit-cdn-form-judge");
      unitElement.insertBefore($("#app-detail-edit-cdn-form-group").children("hr").eq(1));
      const deleteButton = $("<button></button>", {type: "button", class: 'app-detail-edit-cdn-form-delete-unit-btn', "data-index": length, style: "width: 3em; margin-left: 1em;"});
      deleteButton.text("×").insertAfter($("#app-detail-edit-cdn-form-judge-js-" + length).parent("label"));
      cachedSavedCdns.group[newCdn].push({title: "", type: "", url: ""});
      length++;
      if(length == 1){
        $("#app-detail-edit-cdn-sub").children("p").eq(0).removeAttr("style");
        $("#app-detail-edit-cdn-sub").children("hr").eq(0).removeAttr("style");
      } else{
        $("#app-detail-edit-cdn-sub").children("p").eq(0).css("display","none");
        $("#app-detail-edit-cdn-sub").children("hr").eq(0).css("display","none");
      }
      setOnchangeInGroupForm();
    });
  };
  const setOnchangeInCssJsForm = function(){
    $("#app-detail-edit-cdn-form-css-js").find("input").eq(0).off("change").on("change", function(){
      if([newType, newCdn].includes("")){
        newCdn = $(this).val();
        if(newType != ""){
          cachedSavedCdns[newType][newCdn] = $("#app-detail-edit-cdn-form-css-js").find("input").eq(1).val();
        }
      } else{
        const url = Object.freeze(cachedSavedCdns[newType][newCdn]);
        delete cachedSavedCdns[newType][newCdn];
        newCdn = $(this).val();
        cachedSavedCdns[newType][newCdn] = url;
      }
    });
    $("#app-detail-edit-cdn-form-css-js").find("input").eq(1).off("change").on("change", function(){
      const url = $(this).val();
      if([newType, newCdn].includes("")){
        if(url.endsWith(".css")){
          $("#app-detail-edit-cdn-form-css-js").find("input[value=css]").eq(0).prop("checked", true);
          newType = "css";
        }
        if(url.endsWith(".js")){
          $("#app-detail-edit-cdn-form-css-js").find("input[value=js]").eq(0).prop("checked", true);
          newType = "js";
        }
        if(newCdn != ""){
          cachedSavedCdns[newType][newCdn] = url;
        }
      } else{
        delete cachedSavedCdns[newType][newCdn];
        if(url.endsWith(".css")){
          $("#app-detail-edit-cdn-form-css-js").find("input[value=css]").eq(0).prop("checked", true);
          newType = "css";
        }
        if(url.endsWith(".js")){
          $("#app-detail-edit-cdn-form-css-js").find("input[value=js]").eq(0).prop("checked", true);
          newType = "js";
        }
        cachedSavedCdns[newType][newCdn] = url;
      }
    });
    $("#app-detail-edit-cdn-form-css-js").find("input[name=type]").off("change").on("change", function(){
      if([newType, newCdn].includes("")){
        newType = $(this).val();
        if(newCdn != ""){
          cachedSavedCdns[newType][newCdn] = $("#app-detail-edit-cdn-form-css-js").find("input").eq(1).val();
        }
      } else{
        const url = Object.freeze(cachedSavedCdns[newType][newCdn]);
        delete cachedSavedCdns[newType][newCdn];
        newType = $(this).val();
        cachedSavedCdns[newType][newCdn] = url;
      }
    });
  };
  if(type == "group"){
    $("#app-detail-edit-cdn-btn").off("click").on("click", function(){
      editUserCdn("#app-detail-edit-cdn-form-group");
    });
    $("#app-detail-edit-cdn-form-group").find("input").eq(0).addClass("app-detail-edit-cdn-form-input-main-title").val(cdn);
    if([null, undefined].includes(cachedSavedCdns[type][cdn]) && cdn != ""){
      cachedCdns[type][cdn] = [];
    }
    const length = cdn == "" ? 0 : cachedSavedCdns[type][cdn].length;
    for(let i=0; i<length; i++){
      const cdnUnit = cachedSavedCdns[type][cdn][i];
      const unitElement = $("<div></div>", {class: "sortable-div", style: "background-color: #fff", id: "app-detail-edit-cdn-form-unit-" + i});
      unitElement.html($("#app-detail-edit-cdn-form-css-js").html());
      unitElement.find("input").eq(0).attr("value", cdnUnit.title).attr("data-index", i).addClass("app-detail-edit-cdn-form-input-title");
      unitElement.find("input").eq(1).attr("value", cdnUnit.url).attr("data-index", i).addClass("app-detail-edit-cdn-form-input-url");
      unitElement.find("input[name=type]").attr("name", "type-" + i);
      if(cdnUnit.type == "css"){
        unitElement.find("input").eq(2).attr("id", "app-detail-edit-cdn-form-judge-css-" + i).addClass("app-detail-edit-cdn-form-judge-css").prop("checked", true);
        unitElement.find("input").eq(3).attr("id", "app-detail-edit-cdn-form-judge-js-" + i).addClass("app-detail-edit-cdn-form-judge-js");
      }
      if(cdnUnit.type == "js"){
        unitElement.find("input").eq(2).attr("id", "app-detail-edit-cdn-form-judge-css-" + i).addClass("app-detail-edit-cdn-form-judge-css");
        unitElement.find("input").eq(3).attr("id", "app-detail-edit-cdn-form-judge-js-" + i).addClass("app-detail-edit-cdn-form-judge-js").prop("checked", true);
      }
      unitElement.appendTo($("#app-detail-edit-cdn-form-group"));
      const deleteButton = $("<button></button>", {type: "button", class: 'app-detail-edit-cdn-form-delete-unit-btn', "data-index": i, style: "width: 3em; margin-left: 1em;"});
      deleteButton.text("×").insertAfter($("#app-detail-edit-cdn-form-judge-js-" + i).parent("label"));
    }
    $("#app-detail-edit-cdn-form-group").append("<hr class='inner-of-app-detail-edit-cdn-form-group'><div class='inner-of-app-detail-edit-cdn-form-group' align='center'><button class='app-detail-edit-cdn-form-add-unit-btn' type='button' style='width: 3em'>+</button></div>");
    $("#app-detail-edit-cdn-form-group").sortable({items: ".sortable-div"});
    setOnchangeInGroupForm();
    if(length > 1){
      $("#app-detail-edit-cdn-sub").children("p").eq(0).css("display","none");
      $("#app-detail-edit-cdn-sub").children("hr").eq(0).css("display","none");
    } else{
      $("#app-detail-edit-cdn-sub").children("p").eq(0).removeAttr("style");
      $("#app-detail-edit-cdn-sub").children("hr").eq(0).removeAttr("style");
    }
  } else {
    $("#app-detail-edit-cdn-btn").off("click").on("click", function(){
      editUserCdn("#app-detail-edit-cdn-form-css-js");
    });
    if(![type, cdn].includes("")){
      const cdnUrl = cachedSavedCdns[type][cdn];
      newType = type;
      newCdn = cdn;
      $("#app-detail-edit-cdn-form-css-js").find("input").eq(0).val(cdn)
      $("#app-detail-edit-cdn-form-css-js").find("input").eq(1).val(cdnUrl)
      if(cdnUrl.endsWith(".css")){
        $("#app-detail-edit-cdn-form-css-js").find("input[value=css]").eq(0).prop("checked", true);
      }
      if(cdnUrl.endsWith(".js")){
        $("#app-detail-edit-cdn-form-css-js").find("input[value=js]").eq(0).prop("checked", true);
      }
    }
    setOnchangeInCssJsForm();
  }

  if(isCreating){
    $("#app-detail-edit-cdn-btn").text("作成");
  }

  setIgnoreKeyDown("do-not-work-enter");
}

function selectEditUserCdnElement(mode="", isCreating=false){
  if(mode == "css-js"){
    if(newType == "group" && newCdn != ""){
      const cachedCdnData = Object.freeze(cachedSavedCdns[newType][newCdn]);
      delete cachedSavedCdns[newType][newCdn];
      if(cachedCdnData.length == 1){
        newType = cachedCdnData[0].type;
        if(newCdn != cachedCdnData[0].title){
          newCdn += ("-" + cachedCdnData[0].title);
        }
        cachedSavedCdns.group[newCdn] = cachedCdnData[0].url;
      } else {
        cachedSavedCdns.group[newCdn] = "";
        newType = "";
      }
    }
    $("#app-detail-edit-cdn-form-css-js").removeAttr("style");
    $("#app-detail-edit-cdn-form-group").css("display", "none");
    $("#app-detail-edit-cdn-tab-css-js").addClass("selected-tab");
    $("#app-detail-edit-cdn-tab-group").removeClass("selected-tab");
    openEditUserCdnElement({type: newType, cdn: newCdn}, isCreating);
  }
  if(mode == "group"){
    if(["css", "js"].includes(newType)){
      if(newCdn != ""){
        const url = Object.freeze(cachedSavedCdns[newType][newCdn]);
        delete cachedSavedCdns[newType][newCdn];
        cachedSavedCdns.group[newCdn] = [{title: newCdn, type: Object.freeze(newType), url: url}];
      }
      newType = "group";
      openEditUserCdnElement({type: newType, cdn: newCdn}, isCreating);
    } else if(newType == ""){
      if(newCdn != ""){
        cachedSavedCdns.group[newCdn] = [{title: newCdn, type: "", url: ""}];
      }
      openEditUserCdnElement({type: "group", cdn: newCdn}, isCreating);
    } else {
      openEditUserCdnElement({type: newType, cdn: newCdn}, isCreating);
    }
    $("#app-detail-edit-cdn-form-group").removeAttr("style");
    $("#app-detail-edit-cdn-form-css-js").css("display", "none");
    $("#app-detail-edit-cdn-tab-css-js").removeClass("selected-tab");
    $("#app-detail-edit-cdn-tab-group").addClass("selected-tab");
  }
}

function closeEditUserCdnElement(){
  const clone = $("#app-detail-edit-cdn-format").find(".app-detail-edit-cdn-sub").eq(0).clone();
  clone.find("form").each(function(){
    const className = $(this).attr("class");
    if(!["", null, undefined].includes(className)){
      $(this).attr("id", className).removeAttr("class");
    }
  });
  clone.find("button").each(function(){
    const id = $(this).attr("id");
    if(!["", null, undefined].includes(id)){
      $(this).attr("id", id.slice(0,-7));
    }
  });
  $("#app-detail-edit-cdn-sub").removeAttr("style").html( clone.html() );
  $("#app-detail-edit-cdn-main").removeAttr("style");
  $("#app-detail-edit-cdn-form-save-old-data").find("input").eq(0).val("");
  $("#app-detail-edit-cdn-form-save-old-data").find("input").eq(1).val("");
  newType = "";
  newCdn = "";
  cachedSavedCdns = {};
}

function editUserCdn(id="#"){
  const params = {}
  const paramObject = {};
  switch(id){
    case "#app-detail-edit-cdn-form-css-js":
      for(const paramUnit of $(id).serializeArray()){
        paramObject[paramUnit.name] = paramUnit.value;
      }
      params.newType = paramObject.type;
      params.newKey = paramObject.title;
      params.newValue = paramObject.url;
      break;
    case "#app-detail-edit-cdn-form-group":
      for(const paramUnit of $(id).serializeArray()){
        if(paramUnit.name == "type-0"){
          paramObject.type = [paramUnit.value];
        } else if(paramUnit.name.startsWith("type-")){
          paramObject.type.push(paramUnit.value)
        } else if(paramUnit.name == "main-title") {
          paramObject[paramUnit.name] = paramUnit.value;
        } else {
          if(paramObject[paramUnit.name]){
            paramObject[paramUnit.name].push(paramUnit.value);
          } else {
            paramObject[paramUnit.name] = [paramUnit.value];
          }
        }
      }
      params.newType = "group";
      params.newKey = paramObject["main-title"];
      params.newValue = [];
      for(let i=0; i<paramObject.type.length; i++){
        const object = {};
        for(const key of ["title", "type", "url"]){
          object[key] = paramObject[key][i];
        }
        params.newValue.push(object);
      }
      break;
  }
  const oldData = {};
  for(const paramUnit of $("#app-detail-edit-cdn-form-save-old-data").serializeArray()){
    oldData[paramUnit.name] = paramUnit.value;
  }
  params.oldType = oldData.type;
  params.oldKey = oldData.title;
  $.post("/edit-user-setting-cdn", params, function(data){
    const object = {};
    for(const key of Object.keys(data)){
      object[key] = Object.freeze(data[key]);
    }
    cachedCdns = Object.freeze(object);
    const isMultiple = JSON.parse($("#app-detail-edit-cdn-save-my-status").find("input[name=isMultiple]:checked").val());
    const addId = $("#app-detail-edit-cdn-save-my-status").find("input[name=addId]").val();
    const myType = $("#app-detail-edit-cdn-form-save-old-data").find("input").eq(0).val();
    const myCdn = $("#app-detail-edit-cdn-form-save-old-data").find("input").eq(1).val();
    closeEditUserCdnElement();
    closeCdnSelectWindow();
    setCdnSelection(addId, isMultiple, myType, myCdn);
  });
}

function sendNewCdnToEditApp(){
  const isMultiple = JSON.parse( $("#app-detail-edit-cdn-save-my-status").find("input[name=isMultiple]:checked").val() );
  if(isMultiple){
    const selectedData = {css: [], js: [], group: []};
    for(const unit of $("#app-detail-select-cdn-form").serializeArray()){
      if(unit.name == "keyPath"){
        selectedData[unit.name] = unit.value;
      } else{
        selectedData[unit.name].push(unit.value);
      }
    }
    const keyPath = selectedData.keyPath;
    const units = [];
    for(const type of ["css", "js", "group"]){
      for(const cdn of selectedData[type]){
        units.push({type: type, title: cdn, value: JSON.stringify(cachedCdns[type][cdn])});
      }
    }
    if(units.length > 0){
      const type = "cdn";
      const params = { keyPath, type, units };
      params.id = cachedAppData.id;
      $.post("/add-constructor", params, function(data){
        closeCdnSelectWindow();
        $(".app-detail-add-btn").removeAttr("style");
        $(".app-detail-adding-type-selection").removeAttr("style");
        cachedAppData = data;
        writeContentStructure();
      });
    }
  } else {
    const selectedData = {};
    for(const unit of $("#app-detail-select-cdn-form").serializeArray()){
      selectedData[unit.name] = unit.value;
    }
    const keyPath = selectedData.keyPath;
    const type = selectedData.type;
    const title = selectedData.cdn;
    const value = JSON.stringify(cachedCdns[type][title]);
    const params = { keyPath, title, value };
    params.type = "cdn-" + type;
    params.id = cachedAppData.id;
    $.post("/update-constructor-value", params, function(data){
      closeCdnSelectWindow();
      $(".app-detail-add-btn").removeAttr("style");
      $(".app-detail-adding-type-selection").removeAttr("style");
      cachedAppData = data;
      writeContentStructure();
    });
  }
}

function addItem(id, type){
  switch(type){
    case "file":
      console.log($("#" + id + "-type-selection-sub").text());
      break;
    case "cdn":
      setCdnSelection(id + "-type-selection-sub");
      break;
    default:
      addConstructor(id, type);
      $(".app-detail-adding-type-selection").removeAttr("style");
      $(".app-detail-add-btn").removeAttr("style")
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