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
var sessions = require('./server/sessions');
var apps = require('./server/apps');
var path = require('path');
var multer  = require('multer');
var upload = multer({ dest: 'uploads/'});
var bodyParser = require('body-parser');


var app = express();
app.use(bodyParser());

app.use(express.static(path.join(__dirname, '/client/build')));
app.use("/uploads",express.static(path.join(__dirname, '/uploads')));

//api
app.get('/api/applist',function(req,res){
	res.json({
		error:0,
		data:apps.getAll()
	})
})

app.post('/api/upload/icon',upload.single('file'),function(req,res){
	let file = req.file;
    res.json({
		error:0,
		data:{
			file
		}
	});
})

app.post('/api/appadd',function(req,res){
	var app = req.body;
	apps.addOne(app);
	res.json({
		error:0,
		data:{
			
		}
	})
})


app.post('/api/appedit/:appId',function(req,res){
	var app = req.body;
	apps.saveOne(req.params.appId,app);
	res.json({
		error:0,
		data:{

		}
	})
})

app.get('/api/appinfo/:appId',function(req,res){
	var app = apps.getOne(req.params.appId);
	if(app ==null){
		res.send("no app");
		return;
	}
	res.json({
		error:0,
		data:{
			app
		}
	})
})

app.get('/api/startSession/:appId',function(req,res){
	var app = apps.getOne(req.params.appId);
	if(app ==null){
		res.send("no app");
		return;
	}
	var sessionId = sessions.newSession(app);
	res.json({
		error:0,
		data:{
			sessionId
		}
	})
})

app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

var server = http.createServer(app).listen(process.env.PORT || 9250);

require('./server/mstsc')(server);