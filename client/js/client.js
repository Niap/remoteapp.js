(function() {

	function mouseButtonMap(button) {
		switch(button) {
		case 0:
			return 1;
		case 2:
			return 2;
		default:
			return 0;
		}
	};

    function Client(canvas) {
		this.canvas = canvas;
		this.socket = null;
        this.player = RemoteApp.createPlayer(this.canvas);
    }
    
    Client.prototype = {
		install : function () {
			var self = this;
			// bind mouse move event
			this.canvas.addEventListener('mousemove', function (e) {
				if (!self.socket) return;
				
				self.socket.emit('mouse', e.clientX, e.clientY, 0, false);
				e.preventDefault;
				return false;
			});
			this.canvas.addEventListener('mousedown', function (e) {
				if (!self.socket) return;
				self.socket.emit('mouse', e.clientX, e.clientY , mouseButtonMap(e.button), true);
				e.preventDefault();
				return false;
			});
			this.canvas.addEventListener('mouseup', function (e) {
				if (!self.socket) return;
				
				self.socket.emit('mouse', e.clientX, e.clientY, mouseButtonMap(e.button), false);
				e.preventDefault();
				return false;
			});
			this.canvas.addEventListener('contextmenu', function (e) {
				if (!self.socket) return;
				
				self.socket.emit('mouse', e.clientX, e.clientY , mouseButtonMap(e.button), false);
				e.preventDefault();
				return false;
			});
			
			this.canvas.addEventListener('mousewheel', function (e) {
				if (!self.socket) return;
				
				var isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
				var delta = isHorizontal?e.deltaX:e.deltaY;
				var step = Math.round(Math.abs(delta) / 10);
				
				self.socket.emit('wheel', e.clientX, e.clientY , step, delta > 0, isHorizontal);
				e.preventDefault();
				return false;
			});
			
			// bind keyboard event
			window.addEventListener('keydown', function (e) {
				if (!self.socket) return;
				
				self.socket.emit('scancode', RemoteApp.scancode(e), true);

				e.preventDefault();
				return false;
			});
			window.addEventListener('keyup', function (e) {
				if (!self.socket) return;
				
				self.socket.emit('scancode', RemoteApp.scancode(e), false);
				
				e.preventDefault();
				return false;
			});
			
			return this;
		},
        connect : function (sessionId,next) {
            var parts = document.location.pathname.split('/')
		      , base = parts.slice(0, parts.length - 1).join('/') + '/'
              , path = base + 'socket.io';
            const self = this;
            this.socket = io(window.location.protocol + "//" + window.location.host).on('rdp-connect', function() {
				self.install();
			}).on('rdp-bitmap', function(bitmap) {
				self.player.update(bitmap);
			}).on('rdp-close', function() {
				next(null);
			}).on('rdp-error', function (err) {
				next(err);
            });
            
            this.socket.emit('start', sessionId,this.canvas.width, this.canvas.height );
        }
    }

    RemoteApp.createClient = function(canvas){
        return new Client(canvas);
    }
})();