/*
    session:{
        app:{

        },
        socketClient:
        rdpClient:
    }
*/

var sessions = {};
var uuid = require('uuid');
var freerdp = require('node-freerdp2');
var sharp = require('sharp');

var getSession = function(sessionId){
    return sessions[sessionId];
}

var genSessionId = function(){
    var sessionId = uuid.v4();
    sessions[sessionId] ={};
    return sessionId;
}

var setSessionApp = function(sessionId,session){
    sessions[sessionId]['app'] = session;
}

var isRdpConnected = function(sessionId){
    return sessions[sessionId]['rdpClient'] != null;
}

var reconnectSession = function(sessionId,client){
    sessions[sessionId]['socketClient'] = client;
    client.emit('rdp-connect');
    return sessions[sessionId]['rdpClient'];
}

var startSession = function(sessionId,width,height,client){

    var rdpClient = new freerdp.Session({
        host: "192.168.13.89",
        domain : null, 
        username : "niap",
        password : "niap",
        port: 3389, // optional
        width: width, // optional
        height:height, // optional
        //app:session['app']['cmd'],
        certIgnore: true,
    })
    sessions[sessionId]['rdpClient'] = rdpClient;
    sessions[sessionId]['socketClient'] = client;
	
	rdpClient.on('connect', function () {
		sessions[sessionId]['socketClient'].emit('rdp-connect');
	}).on('bitmap',function(bitmap) {
		sharp(bitmap.buffer,{
			raw: {
			  width: bitmap.w,
			  height: bitmap.h,
			  channels: 4,
			},
		}).removeAlpha().png({
			compressionLevel : 3
		}).toBuffer().then( data => {
			bitmap.buffer = "data:image/png;base64,"+new Buffer(data.buffer).toString('base64');
			sessions[sessionId]['socketClient'].emit('rdp-bitmap', bitmap);
		}).catch( err => { 
			console.log(err)
		});
	}).on('close', function() {
		sessions[sessionId]['socketClient'].emit('rdp-close');
	}).on('error', function(err) {
		sessions[sessionId]['socketClient'].emit('rdp-error', err);
	}).connect();
	return rdpClient;
}

module.exports ={
    getSession,
    genSessionId,
    setSessionApp,
    startSession,
    reconnectSession,
    isRdpConnected
}