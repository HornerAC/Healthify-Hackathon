var steps = {

	acc:null,
	dataset:[],
	freq:5,
	allowed:true,
	running:false,

	init:function(){
		steps.permission();
		app.update_permission();
		steps.record();
	},

	create:function(){
		steps.acc = new Accelerometer({frequency: parseInt(steps.freq)});
		steps.acc.addEventListener('reading',steps.record);
		steps.toggle();
	},

	toggle:function(){
		console.log("Changing running state to ->",!steps.running);
		if (steps.running){
			steps.acc.stop();
		} else {
			steps.acc.start();
		}
		steps.running = !steps.running;
	},

	permission:function(){
		navigator.permissions.query({ name: 'accelerometer' }).then(result => {
			steps.allowed = result.state === "granted";

			if (steps.allowed) {
				steps.create();
			}
		});
	},

	round:function(num, dp){
		let p = Math.pow(10,dp);
		return Math.round(num * p) / p;
	},

	count_steps:function(){

	},

	record:function(){
		if (steps.acc === null){
			return;
		}

		var readData = {
			x:steps.round(steps.acc.x,1),
			y:steps.round(steps.acc.y,1),
			z:steps.round(steps.acc.z,1)
		};

		console.log(readData);
	}

};