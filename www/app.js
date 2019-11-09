var app = {

	init:function(){
		steps.init();
	},

	view:function(){

	},

	update_permission:function(){
		if (!steps.allowed){
			alert("No accelerometer permission");
		}
	}
};


window.onload = app.init;