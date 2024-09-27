var createAppOptionKeyAndTitles = [];
var currentFolders = [];
$.post("/get-create-app-options", {}, function(data){
  const havingDefaultOptionKeys = ["templates"];
  for(const key of Object.keys(data)){
    createAppOptionKeyAndTitles.push({key: key, title: data[key].title});
    const name = "create-app-form-option-" + key;
    $("#create-app-form-option").append("<div><p><span><b>" + data[key].title + "</b></span></p><p id='" + name + "'></p></div>");
    const type = data[key].isMultiple ? "checkbox" : "radio";
    for(let i=0; i<data[key].options.length; i++){
      const unit = data[key].options[i]
      const code = (i == 0 ? "" : "<br>") + `<input type="${type}" name="${name}" value="${unit.value}">${unit.display}`;
      if(havingDefaultOptionKeys.includes(key)){
        if(i == 0){
          $("#" + name).append("<span><label id='" + name + "-default'>" + code + "</label></span>");
        } else{
          $("#" + name).append("<span><label class='" + name + "-non-default'>" + code + "</label></span>");
        }
      } else {
        $("#" + name).append("<span><label>" + code + "</label></span>");
      }
    }
    if(havingDefaultOptionKeys.includes(key)){
      $("#" + name + "-default").on("click", function(){
        if($(this).find("input").eq(0).prop("checked")){
          $("." + name + "-non-default").find("input").prop("checked", false).change();
        }
      });
      $("." + name + "-non-default").on("click", function(){
        if($(this).find("input").eq(0).prop("checked")){
          $("#" + name + "-default").find("input").prop("checked", false).change();
        }
      });
    }
  }
});

addHorizontalScroll("create-app-form-option");

function sendNewAppInfo(){
  const alertTexts = [];
  if($("#create-app-form-name").val() == ""){
    alertTexts.push("・アプリ名を選択してください。");
  }
  if($("#create-app-form-path").val() == ""){
    alertTexts.push("・フォルダを選択してください。");
  }
  const option = {};
  for(const unit of createAppOptionKeyAndTitles){
    option[unit.key] = [];
  }
  for(const unit of $("#create-app-form").serializeArray()){
    option[unit.name.split("-")[4]].push(unit.value);
  }
  for(const unit of createAppOptionKeyAndTitles){
    if(option[unit.key].length == 0){
      alertTexts.push("オプション選択：" + unit.title + "の項目に値を入力してください。");
    }
  }
  if(alertTexts.length == 0){
    const params = {option};
    for(const key of ["name", "path", "port"]){
      params[key] = $("#create-app-form-" + key).val();
    }
    $.post("/create-app", params, function(data){
      if(data.status == "success"){
        confirmToOpenGas();
      } else {
        alert(data.message);
      }
    });
  } else {
    alert(alertTexts.join("\n\n"));
  }
}

function selectFolder(path=""){
  $("#folder-popup-background").css("display", "block");
  $.post("/search-path-of-app", {path}, function(data){
    console.log(data);
    setFolderInfo(data);
  });
}

function setFolderInfo(data, isCheckIfRootFolder=true){
  currentFolders = [];
  let openParentCode = "";
  if(isCheckIfRootFolder){
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
  } else{
    openParentCode = `<button onclick="selectFolder('${data.myPath.split("/").slice(0,-1).join("/")}')">親フォルダを開く</button>`;
  }
  $("#folder-popup-content").html("<div id='folder-popup-tab'><div><span><b>" + data.myPath + "/</b><input type='text' id='folder-popup-search'></span></div><div><p>" + openParentCode + "<button id='folder-popup-tab-create-new-folder'>新規フォルダーを作成</button></p><p align='right'><button onclick='closeFolderSelectPopup()'>閉じる</button></p></div></div>");
  $('#folder-popup-tab-create-new-folder').on('click', function(){
    openNewFolderNameForm();
  });
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
  for (const unit of data.innerFolders){
    if(unit.numOfContents == 0){
      selectCode = '<div class="select-folder-li-sub-button" onclick="selectedFolder(\'' + data.myPath + "/" + unit.name + '\')">選択</div>';
    }
    $("#select-folder-ul").append(`<li class="select-folder-li"><button class="select-folder-li-main-button" onclick="selectFolder('${data.myPath}/${unit.name}')"><div class="select-folder-li-text">${unit.name}</div>${selectCode}</button></li>`);
    currentFolders.push(unit.name);
  }
  $("#select-folder-ul").append("<li class='select-folder-li-file' style='border: none; padding-left: 0'><hr style='margin: 5px 0;'></li>");
  for(const file of data.innerFiles){
    $("#select-folder-ul").append("<li class='select-folder-li-file'>" + file + "</li>");
  }
  $(".select-folder-li-sub-button").css("width", remSize*3);
  let folderMaxWidth = 0;
  $(".select-folder-li-text").each(function(){
    const thisWidth = $(this).width();
    if(thisWidth > folderMaxWidth){
      folderMaxWidth = thisWidth;
    }
  });
  let fileMaxWidth = 0;
  $(".select-folder-li-file").each(function(){
    const thisWidth = $(this).width();
    if(thisWidth > fileMaxWidth){
      fileMaxWidth = thisWidth;
    }
  });
  $(".select-folder-li-file").width(fileMaxWidth);
  $(".select-folder-li-text").width(folderMaxWidth);
  $(".select-folder-li-main-button").width(folderMaxWidth + remSize*3.5);
  const folderWidth = $(".select-folder-li-main-button").eq(0).outerWidth();
  const fileWidth = $(".select-folder-li-file").eq(0).width();
  if(folderWidth > fileWidth){
    $(".select-folder-li-file").each(function(){
      $(this).width(folderWidth - Number($(this).css("padding-left").slice(0,-2)));
    });
  } else{
    $(".select-folder-li-main-button").width(fileWidth);
  }
  const currentUlHeight = $("#select-folder-ul").height();
  const ulHeight = $("#folder-popup-content").height() - Number($("#folder-popup-content").css("padding").slice(0,-2)) - $("#folder-popup-tab").height();
  $("#select-folder-ul").height(ulHeight);
  if(currentUlHeight > ulHeight){
    $("#select-folder-ul").css("overflow-y", "scroll").css("height", ulHeight + "px");
  } else{
    $("#select-folder-ul").height(ulHeight);
  }
}
var currentHtmlCode = "";
function openNewFolderNameForm(){
  currentHtmlCode = $("#folder-popup-content").html();
  $("#folder-popup-content").html('<form style="width: 50vw; margin-left: auto; margin-right: auto; margin-top: 10vh; text-align: center;"><p><input type="text" id="select-folder-new-name"></p><p><button type="button" onclick="createNewFolder()">決定</button>　<button type="button" onclick="closeNewFolderNameForm()">閉じる</button></p></form>');
}
function createNewFolder(){
  const newFolderName = $("#select-folder-new-name").val();
  if(["", null, undefined].includes(newFolderName)){
    alert("フォルダ名を入力してください。");
  } else {
    const usedWrongLetters = [];
    for(const char of newFolderName){
      if("\\/:*?\"><| ".includes(char) && !usedWrongLetters.includes(char)){
        usedWrongLetters.push(char);
      }
    }
    if(usedWrongLetters.length == 0){
      $.post("/create-new-folder", {name: newFolderName}, function(data){
        if(data){
          setFolderInfo({myPath: data, numOfContents: 0, innerFolders: [], innerFiles: []}, false);
        } else {
          alert("同名のファイルまたはフォルダが存在します。別の名前のフォルダを作ってください。");
        }
      });
    } else {
      alert(usedWrongLetters.map( (l) => l == " " ? "「半角スペース」" : `「${l}」` ).join("、") + "はフォルダ名に含めないでください。");
    }
  }
}
function closeNewFolderNameForm(){
  $("#folder-popup-content").html(currentHtmlCode);
}

function closeFolderSelectPopup(){
  $("#folder-popup-content").html("");
  $("#folder-popup-background").removeAttr("style");
}

function selectedFolder(path=""){
  setTimeout(() => {
    $("#create-app-form-select-folder-btn").text("選択完了");
    closeFolderSelectPopup();
    $("#create-app-form-path").val(path);
  }, 50);
}

function confirmToOpenGas(){
  const result = confirm('外部サイト(GAS)を利用してあなたのGASを保存するフォルダを決めますか？')
  if(result){
    location.href='https://script.google.com/macros/s/AKfycbwslh0A0p2eQwHFI7m1nPuSbRZnd4goayZyxoVb_p4hAyDuSwFeC2lgBZoxYLRXP87VZw/exec?port=' + port + '&appName=' + $("#create-app-form-name").val();
  } else{
    alert('当アプリをご利用いただけません。終了いたします。');
    selectedTab('stop');
  }
};