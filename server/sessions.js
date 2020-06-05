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
const dirname = process.cwd()+"\\server\\";

var getSession = function(sessionId){
    if(!sessions.hasOwnProperty(sessionId)){
        return null;
    }
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
    let session = getSession(sessionId);
    if(session == null)
        return false;
    return session['rdpClient'] != null;
}

var reconnectRdpSession = function(sessionId,client){
    let session = getSession(sessionId);
    if(session == null)
        return null;
    session['socketClient'] = client;
    let rdpSession = sessions[sessionId]['rdpClient'];
    rdpSession.requestKeyframe();
    rdpSession.sendPointerEvent(0,0,2,true);
    rdpSession.sendPointerEvent(0,0,2,false);
    rdpSession.sendPointerEvent(200,200,1,true);
    rdpSession.sendPointerEvent(200,200,1,false);
    client.emit('rdp-connect');
    return rdpSession;
}

var startRdpSession = function(sessionId,width,height,client,file_path){
    var server  = JSON.parse(fs.readFileSync(dirname+"\\server.json",'utf-8'));
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
        drive:file_path
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
        }).png({
			compressionLevel : 3
		}).toBuffer().then( data => {
            bitmap.buffer = "data:image/png;base64,"+new Buffer(data.buffer).toString('base64');
            sessions[sessionId]['socketClient'].emit('rdp-bitmap', bitmap);
        }).catch( err => { 
            console.log(err)
        });
	}).on('pointer',function(bitmap){
        sharp(bitmap.buffer,{
			raw: {
			  width: bitmap.w,
			  height: bitmap.h,
			  channels: 4,
			},
		}).png({
			compressionLevel : 3
		}).toBuffer().then( data => {
            bitmap.buffer = "data:image/png;base64,"+new Buffer(data.buffer).toString('base64');
			sessions[sessionId]['socketClient'].emit('rdp-pointer', bitmap);
		}).catch( err => { 
			console.log("sharp error"+err)
		});
    }).on('close', function(msg) {
        var socket = sessions[sessionId]['socketClient'];
        socket.emit('rdp-close',msg);
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