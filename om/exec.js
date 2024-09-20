const { spawn } = require('child_process');

const obj = {
  outputData: [],
  funcUnit: function(command, params){
    const self = this;
    const childProcess = spawn(command, params);
    childProcess.stdout.on('data', function(chunk){
      console.log(chunk.toString());
      for(const line of chunk.toString().split("\n").map( (l) => l.replaceAll("\r", "").replaceAll("\t", "    ") )){
        self.outputData.push(line);
      }
    });
    childProcess.stdout.on("close", function(){
      if(self.formattedCommands.length == 0){
        if(self.onClose){
          self.onClose(self.outputData);
        }
      } else{
        const unit = self.formattedCommands.shift();
        self.funcUnit(unit.command, unit.params);
      }
    });
  },
  formatCommand: function(command){
    let status = 0;
    let cachedParam = "";
    const unit = {command: "", params: []};
    for(const char of command){
      switch (status) {
        case 0:
          if("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".includes(char)){
            unit.command += char;
            status = 1;
          }
          break;
        case 1:
          if(char == " "){
            status = 2;
          } else if(char == "&"){
            const unit2 = {command: Object.freeze(unit.command), params: Object.freeze(unit.params)};
            this.formattedCommands.push(unit2);
            status = 0;
            unit.command = "";
            unit.params = [];
          } else{
            unit.command += char;
          }
          break;
        case 2:
          if(char == " "){
            if(cachedParam != ""){
              unit.params.push(cachedParam);
              cachedParam = "";
            }
          } else if(char == "&"){
            const unit2 = {command: Object.freeze(unit.command), params: Object.freeze(unit.params)};
            this.formattedCommands.push(unit2);
            status = 0;
            unit.command = "";
            unit.params = [];
          } else if(char == '"'){
            status = 3;
            cachedParam += '"';
          } else{
            cachedParam += char;
          }
          break;
        case 3:
          if(char == '"'){
            status = 2;
            cachedParam += '"';
          }
          cachedParam += char
          break;
        default:
          break;
      }
    }
    unit.params.push(cachedParam);
    this.formattedCommands.push(unit);
  },
  formattedCommands: [],
  mainFunc: function(command="", onClose){
    this.onClose = onClose;
    this.formatCommand(command);
    const unit = this.formattedCommands.shift();
    this.funcUnit(unit.command, unit.params);
  }
}

const exec = function(command="", onClose=(data)=>{}){
  obj.mainFunc(command, onClose);
};

exec("git add . & git commit -m \"test commit\"", (data)=>{console.log(data);});

module.exports = { exec };