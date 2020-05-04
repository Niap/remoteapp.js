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

var freerdp = require('node-freerdp2');
var sharp = require('sharp');

/**
 * Create proxy between rdp layer and socket io
 * @param server {http(s).Server} http server
 */
module.exports = function (server) {
	var io = require('socket.io')(server);
	io.on('connection', function(client) {
		var rdpClient = null;
		client.on('infos', function (infos) {
			if (rdpClient) {
				// clean older connection
				rdpClient.close();
			};
			
			rdpClient = new freerdp.Session({
				host: infos.ip,
				domain : infos.domain, 
				username : infos.username,
				password : infos.password,
				port: 3389, // optional
				width: infos.screen.width, // optional
				height: infos.screen.height, // optional
				app:infos.app,
				certIgnore: true
			}).on('connect', function () {
				client.emit('rdp-connect');
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
					client.emit('rdp-bitmap', bitmap);
				}).catch( err => { 
					console.log(err)
				});
			}).on('close', function() {
				client.emit('rdp-close');
			}).on('error', function(err) {
				client.emit('rdp-error', err);
			}).connect();


		}).on('mouse', function (x, y, button, isPressed) {
			if (!rdpClient)  return;
			rdpClient.sendPointerEvent(x, y, button, isPressed);
		}).on('wheel', function (x, y, step, isNegative, isHorizontal) {
			if (!rdpClient) {
				return;
			}
			rdpClient.sendWheelEvent(x, y, step, isNegative, isHorizontal);
		}).on('scancode', function (code, isPressed) {
			if (!rdpClient) return;

			rdpClient.sendKeyEventScancode(code, isPressed);
		}).on('unicode', function (code, isPressed) {
			if (!rdpClient) return;

			//rdpClient.sendKeyEventUnicode(code, isPressed);
		}).on('disconnect', function() {
			if(!rdpClient) return;

			rdpClient.close();
		});
	});
}