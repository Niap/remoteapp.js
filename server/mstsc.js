/*
 * Copyright (c) 2015 Sylvain Peyrefitte
 *
 * This file is part of mstsc.js.
 *
 * mstsc.js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

var sessions = require('./sessions');
/**
 * Create proxy between rdp layer and socket io
 * @param server {http(s).Server} http server
 */


module.exports = function (server) {
	var io = require('socket.io')(server);
	io.on('connection', function(client) {
		var rdpClient = null;
		client.on('start', function (sessionId,width,height) {
			if (rdpClient) {
				// clean older connection
				rdpClient.close();
			};
			
			if(sessions.isRdpSessionConnected(sessionId)){
				rdpClient = sessions.reconnectRdpSession(sessionId,client);
			}else{
				rdpClient = sessions.startRdpSession(sessionId,width,height,client);
			}
			
			
		}).on('mouse', function (x, y, button, isPressed) {
			if (!rdpClient)  return;
			rdpClient.sendPointerEvent(x, y, button, isPressed);
		}).on('wheel', function (x, y, step, isNegative, isHorizontal) {
			if (!rdpClient) {
				return;
			}
			rdpClient.sendWheelEvent(x, y, step, isNegative, isHorizontal);
		}).on('paste', function (clipboardData,callbak) {
			rdpClient.sendClipboard(clipboardData);
			callbak();
		}).on('scancode', function (code, isPressed) {
			if (!rdpClient) return;
				rdpClient.sendKeyEventScancode(code, isPressed);

		}).on('disconnect', function() {
			if(!rdpClient) return;

			//rdpClient.close();
		});
	});
}