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

const dirname = process.cwd();
const icon_path = path.join(dirname, '/uploads/icon');
var icon_storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, icon_path)
	},
	filename: function (req, file, cb) {
		var singfileArray = file.originalname.split('.');
		var fileExtension = singfileArray[singfileArray.length - 1];
		cb(null, singfileArray[0] + '-' + Date.now() + "." + fileExtension);
	}
})
var icon_uploader = multer({ storage:icon_storage});

const file_path = path.join(dirname, '/uploads/files');
var file_storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, file_path)
	},
	filename: function (req, file, cb) {
		var singfileArray = file.originalname.split('.');
		var fileExtension = singfileArray[singfileArray.length - 1];
		cb(null, singfileArray[0] + '-' + Date.now() + "." + fileExtension);
	}
})
var file_uploader = multer({ storage:file_storage});

var bodyParser = require('body-parser');
var fs = require("fs");


var app = express();
app.use(bodyParser());

app.use(express.static(path.join(__dirname, '/client/build')));
app.use("/icon",express.static(icon_path));
app.use("/files",express.static(file_path));

//api
//document
app.get('/api/filelist',function(req,res){
	let fileInfos = []
	fs.readdir(file_path,function(err, files){
		if (err) {
			res.send(err);
			return;
		}
		files.forEach(file=>{
			let info = fs.statSync(`${file_path}/${file}`)
			info['name'] = file;
			fileInfos.push(info)
		})
		res.json({
			error:0,
			data:{
				files:fileInfos
			}
		});
	 });
})
app.post('/api/upload/file',file_uploader.single('file'),function(req,res){
	let file = req.file;
    res.json({
		error:0,
		data:{}
	});
})
app.post('/api/file/delete',function(req,res){
	var files = req.body;
	files.forEach(file=>{
		fs.unlinkSync(`${file_path}/${file}`);
	})
	res.json({
		error:0,
		data:{
			
		}
	});
})
//app
app.get('/api/applist',function(req,res){
	res.json({
		error:0,
		data:apps.getAll()
	})
})

app.post('/api/upload/icon',icon_uploader.single('file'),function(req,res){
	let file = req.file;
    res.json({
		error:0,
		data:{
			file:{
				filename:file.filename
			}
		}
	});
})

app.get('/api/appdel/:appId',function(req,res){
	var app = apps.getOne(req.params.appId);
	if(app ==null){
		res.send("no app");
		return;
	}
	apps.delOne(req.params.appId);
	res.json({
		error:0,
		data:{
		}
	})
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

var server = http.createServer(app).listen(process.env.PORT || 9999);

require('./server/mstsc')(server,file_path);