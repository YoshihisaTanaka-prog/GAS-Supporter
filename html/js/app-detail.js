$.post("/get-app-detail", {id: localStorage.getItem("selectedAppId")}, (data)=>{
  $("#app-detail-tab-btn").html("アプリ編集：" + data.name + "　").css("display","inline-block");
  console.log(data);
});