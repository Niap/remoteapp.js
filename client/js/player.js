(function() {
    function Player(canvas) {
        this.canvas = canvas;
        canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		this.ctx = canvas.getContext("2d");
    }
    
    Player.prototype = {
        update : function (bitmap) {
            var image = new Image();
			var context = this.ctx;
			image.src = bitmap.buffer;
			image.onload = function(){
				context.drawImage(image, bitmap.x, bitmap.y);
			}
        }
    }

    RemoteApp.createPlayer = function(canvas){
        return new Player(canvas);
    }
})();