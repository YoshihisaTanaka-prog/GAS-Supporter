window.onload = function(){
  initialCheck();
}

function initialCheck(){
  $.post("/initial-check", {}, function(data){
    let confirmResult = true;
    if(data.isClaspInstalled){
      if(data.didLogin){
        alert("ログインしています。");
      } else {
        confirmResult = window.confirm('claspでログインていません。\nログインしますか？\n\nログインしない場合は当システムをご利用いただけません。');
        if(confirmResult){
          $.post("/login-to-clasp", {}, (data)=>{
            getLog(data);
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
          afterFunction();
        });
      }
    })
  }
}

function start(){}