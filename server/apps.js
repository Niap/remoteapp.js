var apps = {
    "1":{
            name:"calc",
            cmd:"calc",
            icon:"?"
    }
}

var getAll = function(){
    return apps;
}
var getOne = function(appId){
    return apps[appId];
}

module.exports ={
    getAll,
    getOne
}