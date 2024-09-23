"use strict";

const Command = require("../basic-modules/exec")();

const stop = function (req, res){
  res.send("success");
  process.exit(0);
}

const restart = function (req, res){
  res.send("success");
  setTimeout(() => {
    Command.setAll('start /min cmd /c "taskkill /pid ' + process.pid + ' /f & node index"').runE();
  }, 100);
}

module.exports = { stop, restart };