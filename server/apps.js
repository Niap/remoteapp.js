var apps = [
    {
        id:"1",
        name:"notepad",
        cmd:"notepad",
        icon:"?"
    }
]

var getAll = function(){
    return apps;
}
var getOne = function(appId){
    for(var i=0;i<apps.length;i++){
        if(appId == apps[i]['id']){
            return apps[i];
        }
    }
    return null;
}

module.exports ={
    getAll,
    getOne
}