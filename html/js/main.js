function getLog(command, afterFunction=()=>{}){
  if(command){
    $.post("/get-running-command-logs", { command }, function(data){
      console.log();
      if(data.isRunning){
        $("#command-output").html(">> <b>" + command + "</b><br><br><div id='command-output-detail' style='overflow-wrap: break-word; word-break: break-all;'></div>");
        $("#command-output-detail").text(data.details.join("\n"));
        setTimeout(function(){
          getLog(command, afterFunction);
        }, 200);
      } else {
        $("#command-output-finished").html("<p><b>タスクが終了しました。</b></p><button id='run-after-function'>OK</button>");
        $('#run-after-function').on("click", function(){
          $(".command-output").html("");
          afterFunction();
        });
      }
    })
  }
}

function selectedTab(id){
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
        $.post("/restart", {}, function(){setTimeout(function(){reloadWindow()}, 1000);});
      }
      break;
    default:
      $.post("/", {id}, function(data){
        if(!["create-app"].includes(id)){
          localStorage.setItem('tabName', id);
        }
        $("#main").html(data);
        $(".tab-script").remove();
        $("body").append("<script src='/js/" + id + ".js' class='tab-script'></script>");
      });
      break;
  }
}

function reloadWindow(){
  window.location.reload();
}