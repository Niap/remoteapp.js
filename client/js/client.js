(function() {
    function Client(canvas) {
		this.canvas = canvas;
		this.socket = null;
        this.player = RemoteApp.createPlayer(this.canvas);
    }
    
    Client.prototype = {
        connect : function (ip, domain, username, password,app,next) {
            var parts = document.location.pathname.split('/')
		      , base = parts.slice(0, parts.length - 1).join('/') + '/'
              , path = base + 'socket.io';
            const that = this;
            this.socket = io(window.location.protocol + "//" + window.location.host, { "path": path }).on('rdp-connect', function() {

			}).on('rdp-bitmap', function(bitmap) {
				that.player.update(bitmap);
			}).on('rdp-close', function() {
				next(null);
			}).on('rdp-error', function (err) {
				next(err);
            });
            
            this.socket.emit('infos', {
				ip : ip, 
				port : 3389, 
				screen : { 
					width : this.canvas.width, 
					height : this.canvas.height 
				}, 
				domain : domain, 
				username : username, 
				password : password, 
				app : app
			});
        }
    }

    RemoteApp.createClient = function(canvas){
        return new Client(canvas);
    }
})();