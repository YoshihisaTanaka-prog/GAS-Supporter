function showAppDetail(appId){
  const array = [appId];
  for(const key of Object.keys(appData)){
    if(key != appId){
      array.push(key);
    }
  }
  console.log(array);
  $.post("/sort-app-order", {order: array}, function(data){
    appData = data;
  });
  localStorage.setItem("selectedAppId", appId);
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

setAppList();

function setAppList(){
  for(const key of Object.keys(appData)){
    $("#app-selector").append("<li class='app-li app-li-sortable' id='app-li-" + key + "'><button class='app-li-btn app-li-sortable-btn' id='app-li-" + key + "-btn' onclick='showAppDetail(\"" + key + "\")'><div class='app-li-btn-name'>" + appData[key].name + "　</div><div class='app-li-btn-path'>" + appData[key].path + "</div></button></li>");
  }
  $("#app-selector").append('<hr><li class="app-li-add"><p><button class="app-li-btn" onclick="selectedTab(\'create-app\')">アプリの新規作成</button></p></li>');

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