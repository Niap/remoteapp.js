var fs = require("fs");

const dirname = process.cwd()+"\\server\\";

var get = function(){
    return JSON.parse(fs.readFileSync(dirname+"\\server.json",'utf-8'));
}

var save = function(server){
    if(server['domain'] == null){
		server['domain'] = null;
    }
    var serverStr = JSON.stringify(server);
    fs.writeFileSync(dirname+"\\server.json",serverStr,'utf-8');
}

module.exports ={
    get,
    save
}