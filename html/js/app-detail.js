console.log(sentData);
$.post("/get-app-detail", {id: sentData.appId}, (data)=>{
  console.log(data);
});