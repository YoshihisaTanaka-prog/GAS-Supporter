const createAppOptionKeyAndTitles = [];
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
  $.post("/search-path-of-app", {path}, function(data){
    console.log(data);
  });
}

function selectedFolder(path=""){}

function confirmToOpenGas(){
  const result = confirm('外部サイト(GAS)を利用してあなたのGASを保存するフォルダを決めますか？')
  if(result){
    location.href='https://script.google.com/macros/s/AKfycbwslh0A0p2eQwHFI7m1nPuSbRZnd4goayZyxoVb_p4hAyDuSwFeC2lgBZoxYLRXP87VZw/exec?port=' + port + '&appName=' + $("#create-app-form-name").val();
  } else{
    alert('当アプリをご利用いただけません。終了いたします。');
    selectedTab('stop');
  }
};