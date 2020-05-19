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
var fs = require("fs");
var server  = JSON.parse(fs.readFileSync(__dirname+"\\server.json",'utf-8'));

var getSession = function(sessionId){
    return sessions[sessionId];
}

var newSession = function(setsionApp){
    var sessionId = uuid.v4();
    sessions[sessionId] ={
        app:setsionApp,
        rdpClient:null,
        socketClient:null,
    };
    return sessionId;
}

var deleteSession = function(sessionId){
    delete(sessions[sessionId]);
}

var isRdpSessionConnected = function(sessionId){
    return sessions[sessionId]['rdpClient'] != null;
}

var reconnectRdpSession = function(sessionId,client){
    sessions[sessionId]['socketClient'] = client;
    client.emit('rdp-connect');
    return sessions[sessionId]['rdpClient'];
}

var startRdpSession = function(sessionId,width,height,client){

    var rdpClient = new freerdp.Session({
        host: server.host,
        domain : server.domain, 
        username : server.username,
        password : server.password,
        port: server.port, // optional
        width: width, // optional
        height:height, // optional
        app:sessions[sessionId]['app']['cmd'],
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
			console.log("sharp error"+err)
		});
	}).on('close', function() {
        var socket = sessions[sessionId]['socketClient'];
        socket.emit('rdp-close');
        socket.disconnect();
        deleteSession(sessionId);
	}).on('error', function(err) {
        var socket = sessions[sessionId]['socketClient'];
        socket.emit('rdp-error', err);
        socket.disconnect();
        deleteSession(sessionId);
	}).connect();
	return rdpClient;
}

module.exports ={
    getSession,
    newSession,
    isRdpSessionConnected,
    reconnectRdpSession,
    startRdpSession
}