var steps = {

	acc:null,
	dataset:[],
	freq:6,
	allowed:true,
	running:false,
	tstart:new Date(0,0,0,0,0,1),
	counter:{
		"idle":0,
		"walk":0,
		"jog":0,
		"run":0,
		"sprint":0
	},

	init:function(){
		steps.permission();
		app.update_permission();
		steps.record();

		setTimeout(function() {
			$("#step_better").fadeIn(500).on("click enter", steps.view_better)
		},15000);
		$("#step_view").on("click enter", steps.view_better);
	},

	view_better:function(){
		if ($("#view_better").is(":visible")){
			$("#view_better").removeClass("active");
			$("#view_steps").addClass("active");
		} else {
			$("#view_better").addClass("active");
			$("#view_steps").removeClass("active");
			$("#step_better").hide();
		}
	},

	create:function(){
		steps.acc = new Accelerometer({frequency: parseInt(steps.freq)});
		steps.acc.addEventListener('reading',steps.record);
		steps.toggle();
	},

	changeSensitivity:function(newsett){
		steps.acc.stop();
		steps.freq = parseInt($("#stepSensitive").val());
		steps.create();
		steps.acc.start();
	},

	toggle:function(){
		console.log("Changing running state to ->",!steps.running);
		if (steps.running){
			steps.acc.stop();
			$("#step_alert").removeClass("alert-danger").addClass("alert-success").text("Click to start recording steps.")
		} else {
			steps.acc.start();
			$("#step_alert").removeClass("alert-success").addClass("alert-danger").text("Click to stop recording steps.")
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
		if (steps.dataset.length <= 2) return;

		let curr = steps.dataset[steps.dataset.length - 2];
		let last = steps.dataset[steps.dataset.length - 1];

		let diff = {
			x:curr.x - last.x,
			y:curr.y - last.y,
			z:curr.z - last.z
		};

		let total_diff = Math.sqrt(
			Math.pow(diff["x"],2) + Math.pow(diff["y"],2) + Math.pow(diff["z"],2)
		);

		//console.log(diff);
		console.log(total_diff);
		if (total_diff <= 3) {
			steps.counter["idle"] = steps.counter["idle"] + 1;
		} else if (total_diff > 3 && total_diff < 7){
			steps.counter["walk"] = steps.counter["walk"] + 1;
		} else if (total_diff > 7 && total_diff < 12){
			steps.counter["jog"] = steps.counter["jog"] + 1;
		} else if (total_diff > 12 && total_diff < 21){
			steps.counter["run"] = steps.counter["run"] + 1;
		} else if (total_diff > 21){
			steps.counter["sprint"] = steps.counter["sprint"] + 1;
		}

		document.getElementById("step_int").innerText = steps.round(total_diff,1);
		steps.updatetable();
		steps.updategraph();
	},

	updategraph:function(){
		if (c.currchart === "pie"){
			c.drawProportionChart(Object.values(steps.counter));
		} else if (c.currchart === "speed") {
			c.drawSpeedChart();
		}
	},

	updatetable:function(){
		document.getElementById("step_timer").innerText = steps.tstart.getHours()+'h:'+steps.tstart.getMinutes()+'m:'+steps.tstart.getSeconds()+'s';

		var types = ["walk", "jog", "run", "sprint"];
		for (let i = 0; i<types.length;i++){
			let el = "#step_" + types[i];
			if (steps.counter[types[i]] === 0){
				$($(el).parent()).hide();
			} else {
				$($(el).parent()).show();
				$(el).text(steps.counter[types[i]]);
			}
		}

	},

	record:function(){
		if (steps.acc === null){
			return;
		}

		let readData = {
			x:steps.round(steps.acc.x,1),
			y:steps.round(steps.acc.y,1),
			z:steps.round(steps.acc.z,1)
		};

		steps.tstart = new Date(steps.tstart.getTime() + 1/steps.freq*1000);
		steps.dataset.push(readData);

		// If dataset length is 0, add record and return
		if (steps.dataset.length === 0){
			return;
		}

		// Compare current accelerometer
		//console.log(steps.dataset[steps.dataset.length - 1]);
		steps.count_steps();
	}

};