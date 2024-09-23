function initialCheck(){
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
          cannotUse();
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
        cannotUse();
      }
    }
  });
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
  {id: "test1", displayName: "テスト1", isShownInitially: true},
  {id: "test2", displayName: "テスト2", isShownInitially: false},
  {id: "change-user", displayName: "ユーザ変更", isShownInitially: true},
];

function start(){
  $("#tab").html("");
  $("#main").html("");
  for(const unit of tabData){
    $("#tab").append('<button class="tab" id="' + unit.id + '-tab-btn">' + unit.displayName + '</button>');
    $("#" + unit.id + "-tab-btn").on("click", ()=>{
      selectedTab(unit.id);
    });
    if(!unit.isShownInitially && Object.keys(appData).length == 0){
      $("#" + unit.id + "-tab-btn").css("display", "none");
    }
  }
  selectedTab(localStorage.getItem('tabName') || tabData[0].id);
}