
function init(){
    var client = RemoteApp.createClient(RemoteApp.$("player"));
    client.connect("192.168.13.31","","administrator","Xietong12345",null,function(){
        console.log("error");
    })
}