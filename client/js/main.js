
function init(sessionId){
    var client = RemoteApp.createClient(RemoteApp.$("player"));
    client.connect(sessionId,function(){
        console.log("error");
    })
}