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

var express = require('express');
var http = require('http');
var sessions = require('./sessions');
var apps = require('./apps');

var app = express();
app.set("engine","ejs");
app.set("views","server/tpl");
app.use(express.static(__dirname + '/../client'))
//tpl
app.get('/', function(req, res) {
	res.render("index.ejs")
});
app.get('/session/:sessionId', function(req, res) {
	var sessionId = req.params.sessionId;
	if(sessions.getSession(sessionId) == null){
		res.send("no session");
	}
	res.render("session.ejs",{sessionId:sessionId})
});

//api
app.get('/applist',function(req,res){
	res.json({
		error:0,
		data:apps.getAll()
	})
})

app.get('/startSession/:appId',function(req,res){
	var app = apps.getOne(req.params.appId);
	var sessionId = sessions.genSessionId();
	sessions.setSessionApp(sessionId,app);
	res.send(sessionId);
})

var server = http.createServer(app).listen(process.env.PORT || 9250);

require('./mstsc')(server);