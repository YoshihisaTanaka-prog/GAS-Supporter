const scrollStatus = {};

function setIgnoreKeyDown(className=""){
  $("." + className).on("keydown",function(ev){
    if ((ev.which && ev.which === 13) ||(ev.keyCode && ev.keyCode === 13)){
      return false;
    } else {
      return true;
    }
  });
}

function setHorizontalScroll() {
  for(const pos of ["left", "middle", "right"]){
    addHorizontalScroll("tab-" + pos);
  }
}

function addHorizontalScroll(id){
  $("#" + id).hover(
    function(){
      scrollStatus[id] = true;
    }, function(){
      scrollStatus[id] = false;
    }
  );
}
function removeHorizontalScroll(){
  for(const key of Object.keys(scrollStatus)){
    if(!key.startsWith("tab-")){
      $("#" + key).unbind('mouseenter').unbind('mouseleave')
      delete scrollStatus[key];
    }
  }
}

const remSize = $("#for-get-rem-size").height();

let defaultTabHeight = 0;

function setLength() {
  $(".tab-div").attr("style", "");
  $("#main").attr("style", "");
  if(defaultTabHeight == 0){
    defaultTabHeight = $("#tab-left").height();
  }
  let isNeedTabScroll = false;
  const windowWidth = $(window).width();
  const rightWidth = $("#tab-right").width();
  if(windowWidth*0.4 < rightWidth){
    $("#tab-right").width(windowWidth*0.4).css("overflow-x", "scroll");
    isNeedTabScroll = true;
  } else {
    $("#tab-right").css("display", "inline");
  }
  const restWidth = windowWidth - $("#tab-right").width();
  const leftWidth = $("#tab-left").width();
  const middleWidth = $("#tab-middle").width();
  if(leftWidth + middleWidth > restWidth){
    $("#tab-left").attr("style", "width: " + restWidth*0.7 + "px; overflow-x: scroll;");
    $("#tab-middle").width(restWidth*0.3).attr("style", "width: " + restWidth*0.4 + "px; overflow-x: scroll;");
    isNeedTabScroll = true;
  }
  const tabHeight = isNeedTabScroll ? defaultTabHeight + remSize/2 : defaultTabHeight;
  $(".tab-div").height(tabHeight);
  let scrollBarWidth = 0;
  const windowHeight = $(window).height();
  const maxMainHeight = windowHeight - tabHeight;
  const mainHeight = $("#main").height();
  let mainStyleCode = "";
  if(mainHeight > maxMainHeight){
    mainStyleCode += "height:" + maxMainHeight + "px;overflow-y:scroll;";
    scrollBarWidth = remSize*0.5
  }
  const mainWidth = $("#main").width();
  if(mainWidth > windowWidth - scrollBarWidth){
    mainStyleCode += "width:" + (windowWidth - scrollBarWidth) + "px;overflow-x:scroll;";
  }
  $("#main").attr("style", mainStyleCode);
}

function getLog(command, afterFunction=()=>{}){
  $("#command-output-background").css("display", "block");
  if(command){
    $.post("/get-running-command-logs", { command }, function(data){
      if(data.isRunning){
        $("#command-output").html(">> <b>" + command + "</b><br><br><div id='command-output-detail' style='overflow-wrap: break-word; word-break: break-all;'></div>");
        $("#command-output-detail").text(data.details.join("\n"));
        setTimeout(function(){
          getLog(command, afterFunction);
        }, 200);
      } else {
        $("#command-output-finished").html("<p><b>タスクが終了しました。</b></p><button id='run-after-function'>OK</button>");
        $('#run-after-function').on("click", function(){
          $(".command-output-background").css("display", "none");
          $(".command-output").html("");
          afterFunction();
        });
      }
    })
  }
}

function selectedTab(id){
  removeHorizontalScroll();
  if(id == "app-detail"){
    setLength();
  } else{
    $("#app-detail-tab-btn").css("display", "none");
    setLength();
  }
  $(".tab").each(function(){
    if($(this).attr("id") == (id + "-tab-btn") ){
      $(this).removeClass("un-selected-tab").addClass("selected-tab");
    } else{
      $(this).removeClass("selected-tab").addClass("un-selected-tab");
    }
  });
  if(num){
    clearInterval(checkingDataIntervalId);
    delete num;
  }
  switch(id){
    case "reload":
      $("#main").html("<h1 align='center'>リロード中</h1>");
      setTimeout(function(){
        $('#reload-form').submit();
      }, 500);
      break;
    case "change-user":
      if(confirm("claspでログアウトして、再ログインしますか？")){
        $.post("/change-user", {}, function(data){
          getLog(data, function(){
            selectedTab(getLastTabId());
          });
        });
      }
      break;
    case "stop":
      if(confirm("Webアプリを終了しますか？")){
        $.post("/stop", {}, ()=>{});
      }
      break;
    case "restart":
      if(confirm("Webアプリの再起動を行いますか？")){
        $.post("/restart", {}, function(){setTimeout(function(){
          $('#reload-form').submit();
        }, 1000);});
      }
      break;
    default:
      if(!["app-detail", "create-app"].includes(id)){
        localStorage.setItem("selectedAppId", "");
        setStatusInfo({selectedAppId: ""});
      }
      if(id != "app-selector"){
        setStatusInfo({"importing": {id: "", name: ""}});
      }
      $.post("/", {id}, function(data){
        if(!["create-app"].includes(id)){
          localStorage.setItem('tabName', id);
        }
        $("#main").html(data);
        $(".tab-script").remove();
        if(["app-detail", "app-selector", "create-app"].includes(id)){
          $("body").append("<script src='/js/" + id + ".js' class='tab-script'></script>");
        }
      });
      break;
  }
}

function setStatusInfo(object = {}){
  const currentStatus = JSON.parse(localStorage.getItem("status")) || {};
  for(const key of Object.keys(object)){
    currentStatus[key] = object[key];
  }
  localStorage.setItem("status", JSON.stringify(currentStatus));
}

function getStatusInfo(key="") {
  const currentStatus = JSON.parse(localStorage.getItem("status"));
  return currentStatus[key];
}

let isDrag = false;
$("body").on('mousedown', function() {
  isDrag = true;
});
$("body").on('mouseup mouseleave', function() {
  isDrag = false;
});