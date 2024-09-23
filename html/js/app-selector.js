$("head").append('<script src="https://code.jquery.com/ui/1.14.0/jquery-ui.js" class="tab-script"></script>')

for(const key of Object.keys(appData)){
  $("#app-selector").append("<li class='app-li' id='app-li-" + key + "'><button onclick='showApp(\"" + key + "\")'><b style='font-size: 1.5em;'>" + appData[key].name + "　</b>" + appData[key].path + "</button></li>");
}
$(function(){
  $("#app-selector").sortable();
  $('#app-selector').bind("sortstop", function(){
    const array = [];
    $(this).children(".app-li").each(function(){
      console.log(this);
      array.push($(this).attr("id").split("-")[2]);
    });
    $.post("/sort-app-order", {order: array}, () =>{});
  })
});

function showApp(appId){
  const id = "app-detail"
  $.post("/", { id, appId }, function(data){
    $("#main").html(data);
    $(".tab-script").remove();
    $("body").append("<script src='/js/" + id + ".js' class='tab-script'></script>");
  });
}