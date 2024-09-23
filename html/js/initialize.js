function initialCheck(){
  if(location.search == ""){
    $.post("/initial-check", {}, function(data){
      let confirmResult = true;
      if(data.isClaspInstalled){
        if(data.didLogin){
          start();
        } else {
          confirmResult = window.confirm('claspでログインていません。\nログインしますか？\n\nログインしない場合は当システムをご利用いただけません。');
          if(confirmResult){
            $.post("/login-to-clasp", {}, (data)=>{
              getLog(data, start);
            });
          } else{
            stop();
          }
        }
      } else {
        confirmResult = window.confirm('必須なnode_moduleのclaspがインストールされていません。\nインストールしますか？\n\nインストールしない場合は当システムをご利用いただけません。');
        if(confirmResult){
          $.post("/install-clasp", {}, (data)=>{
            getLog(data, function(){
              initialCheck();
            });
          });
        } else{
          stop();
        }
      }
    });
  } else if(location.search == "?skip=true"){
    start();
  } else {
    changeQueryParam();
    const params = {};
    for(const unit of location.search.slice(1).split("&")){
      const [key, value] = unit.split("=");
      params[key] = value;
    }
    $.post("/setup-new-app", params, (data)=>{
      if(data){
      } else{
        selectedTab("create-app");
        alert("予期せぬエラーが発生しました。アプリを再度作り直してください。");
      }
    });
  }
}

let num = 0;
const checkingDataIntervalId = setInterval(() => {
  checkingData();
}, 500);

function checkingData() {
  switch (num % 3) {
    case 0:
      $("#checking-data").html("Checking Data.&nbsp;&nbsp;&nbsp;");
      break;
    case 1:
      $("#checking-data").html("Checking Data..&nbsp;&nbsp;");
      break;
    case 2:
      $("#checking-data").html("Checking Data...&nbsp;");
      break;
    default:
      break;
  }
  num++;
}

const tabData = [
  {id: "app-list", displayName: "アプリ一覧", isShownInitially: false},
  {id: "how-to-use", displayName: "使い方", isShownInitially: true},
  {id: "create-app", displayName: "アプリの新規作成", isShownInitially: true},
  {id: "change-user", displayName: "ユーザ変更", isShownInitially: true, isRight: true},
  {id: "restart", displayName: "再起動", isShownInitially: true, isHalf: true, isRight: true, isNeedMargin: true},
  {id: "stop", displayName: "終了", isShownInitially: true, isHalf: true, isRight: true},
];

function start(){
  $("#tab-left").html("");
  $("#tab-right").html("");
  $("#main").html("");
  for(const unit of tabData){
    if(unit.id == "how-to-use"){
      if(isInitialRun){
        $("#tab-left").append('<button class="tab" id="' + unit.id + '-tab-btn">' + unit.displayName + '</button>');
      } else{
        $("#tab-right").append('<button class="tab" id="' + unit.id + '-tab-btn">' + unit.displayName + '</button>');
        $("#" + unit.id + "-tab-btn").css("width", "5em");
      }
    } else if(unit.isRight){
      $("#tab-right").append('<button class="tab" id="' + unit.id + '-tab-btn">' + unit.displayName + '</button>');
    } else{
      $("#tab-left").append('<button class="tab" id="' + unit.id + '-tab-btn">' + unit.displayName + '</button>');
    }
    $("#" + unit.id + "-tab-btn").on("click", ()=>{
      selectedTab(unit.id);
    });
    if(unit.isHalf){
      $("#" + unit.id + "-tab-btn").css("width", "5em");
    }
    if(unit.isNeedMargin){
      $("#" + unit.id + "-tab-btn").css("margin-left", "2em");
    }
    if(!unit.isShownInitially && Object.keys(appData).length == 0){
      $("#" + unit.id + "-tab-btn").css("display", "none");
    }
  }
  $("#stop-tab-btn").css("background-color", "#f00");
  selectedTab(localStorage.getItem('tabName') || getLastTabId());
}

function getLastTabId(){
  if(localStorage.getItem("tabName")){
    return localStorage.getItem("tabName");
  }
  if(Object.keys(appData).length == 0){
    return tabData.filter( (t) => t.isShownInitially )[0].id;
  }
  return tabData[0].id;
}