for(const option of templateOptions){
  $("#create-app-form-option").append('<option value="' + option + '">' + option + '</option>');
}
function sendNewAppInfo(){
  const alertTexts = [];
  if($("#create-app-form-name").val() == ""){
    alertTexts.push("・アプリ名を選択してください。");
  }
  if($("#create-app-form-path").val() == ""){
    alertTexts.push("・フォルダを選択してください。");
  }
  if(alertTexts.length == 0){
    const params = {};
    for(const key of ["name", "option", "path", "port"]){
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