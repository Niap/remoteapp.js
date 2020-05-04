
(function() {

	RemoteApp = function () {
	}
	
	RemoteApp.prototype = {
		$ : function (id) {
			return document.getElementById(id);
		},

	}
	
})();

this.RemoteApp = new RemoteApp();