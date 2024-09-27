var cachedAppData = {};

if(["", null, undefined].includes(getStatusInfo("selectedAppId"))){
  selectedTab("app-selector");
} else{
  $.post("/get-app-detail", {id: getStatusInfo("selectedAppId")}, (data)=>{
    $("#app-detail-tab-btn").html("アプリ編集：" + data.name + "　").css("display","inline-block");
    cachedAppData = data;
    console.log(cachedAppData);
    setTimeout(() => {
      monitorAppFolder();
    }, 50);
  });
}

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
          alert(alertLines.join("\n"));
          setTimeout(() => {
            monitorAppFolder();
          }, 10000);
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