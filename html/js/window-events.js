window.onload = function(){
  if(isInitialRun){
    alert("ご利用いただきありがとうございました。");
  }
  checkingData();
  initialCheck();
  setHorizontalScroll()
}
window.onwheel = function(e){
  for(const key of Object.keys(scrollStatus)){
    if(scrollStatus[key]){
      const current = $("#" + key).scrollLeft();
      $("#" + key).scrollLeft(current + e.deltaY*0.3);
    }
  }
}
window.onresize = function(){
  setLength();
}