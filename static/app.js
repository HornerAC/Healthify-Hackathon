var app = {

	init:function(){
		steps.init();
		$("#step_recorder").on("click enter",app.view);
		$("#step_alert").on("click enter",steps.toggle);
		c.init();
	},

	view:function(){
		$("#view_steps").addClass("active");
		$("#view_main").removeClass("active");
		v.init();
	},

	update_permission:function(){
		if (!steps.allowed){
			alert("No accelerometer permission");
		}
	}
};

const ChartCol = [
	[
		'rgba(255, 99, 132, 0.2)',
		'rgba(54, 162, 235, 0.2)',
		'rgba(255, 206, 86, 0.2)',
		'rgba(75, 192, 192, 0.2)',
		'rgba(153, 102, 255, 0.2)',
		'rgba(255, 159, 64, 0.2)'
	],
	[
		'rgba(255, 99, 132, 1)',
		'rgba(54, 162, 235, 1)',
		'rgba(255, 206, 86, 1)',
		'rgba(75, 192, 192, 1)',
		'rgba(153, 102, 255, 1)',
		'rgba(255, 159, 64, 1)'
	]
];


var c = {
	currchart:"pie",
	ctx:document.getElementById('step_graph').getContext('2d'),
	data: {
		type: 'line',
		data: {
			labels: ['Red'],
			datasets: [{
				label: 'Speed',
				data: [],
				backgroundColor: ChartCol[0],
				borderColor: ChartCol[1],
				borderWidth: 1
			}]
		},
		options: {
			responsive:true,
			maintainAspectRatio:false,
			animation:{
				animateScale:true
			},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true
					}
				}]
			}
		}
	},
	curr:null,

	init:function(){
		c.drawSpeedChart();
	},

	drawSpeedChart:function(){
		c.curr = new Chart(c.ctx, c.data);
	},

	drawProportionChart:function(data_set){
		c.data.type = "doughnut";

		c.data.data.datasets = [{
			label: 'Samples per step type',
			data: data_set,
			backgroundColor: ChartCol[0],
			borderColor: ChartCol[1],
			borderWidth: 1
		}];

		c.data.data.labels = ["Idle", "Walk", "Jog", "Run", "Sprint"];

		c.curr.update(0);
	}
};

var d = {
	obj:null,
	init:function(){
		d.obj = new PouchDB("health-app");

		d.obj.on("change",d.changeOccur);
	},

	changeOccur:function(){
		console.log("Change made.");
	}
};

var v = {
	map:null,
	watch:null,
	lat:0.0,
	lon:0.0,
	zoom:15,
	ico:{
		main:null,
		multiple:null
	},

	markers:[],

	init:function(){
		v.map = L.map('step_map');
		v.initMapOsm();

		v.map.addEventListener('contextmenu',v.mapMove);
		v.getLocation(function(lat, lon){
			v.map.setView([lat, lon], v.zoom);
		});
	},

	getLocation:function(cb){
		navigator.geolocation.getCurrentPosition(function(position) {
			cb(position.coords.latitude, position.coords.longitude);
		});

		// Monitor position
		navigator.geolocation.watchPosition(function(position) {
			v.lat = position.coords.latitude;
			v.lon = position.coords.longitude;

			v.map.setView([v.lat, v.lon], v.zoom);
		});
	},

	changeMap:function(map){
		if (v.base){
			v.map.removeLayer(v.base);
		}
		if (map.value === "sat") v.initGMap("s");
		if (map.value === "ter") v.initGMap("p");
		if (map.value === "tro") v.initGMap("t");
		if (map.value === "rdo") v.initGMap("h");
		if (map.value === "rdi") v.initGMap("m");
		if (map.value === "arm") v.initGMap("r");
		if (map.value === "hyb") v.initGMap("y");
		if (map.value === "osm") v.initMapOsm();
	},

	initGMap:function(l){
		v.base = new L.TileLayer(
			'https://mt1.google.com/vt/lyrs='+l+'&x={x}&y={y}&z={z}',
			{attribution: '<a href="https://maps.google.co.uk">Google Maps</a>'}
		);
		v.map.addLayer(v.base);
	},
	initMapOsm:function(){
		v.base = new L.TileLayer(
			'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
			{attribution: '<a href="http://openstreetmap.org">OpenStreetMap</a>'}
		);
		v.map.addLayer(v.base);
	},

	mapMove:function(evt){
		console.log(evt);
		v.removeMapItems();
		v.loadPoints();
	},

	removeMapItems:function(){
		for (let marker in v.markers){
			v.map.removeLayer(v.markers[marker]);
		}
		v.markers = [];
	},

	loadPoints:function(){
		var bounds = v.map.getBounds();
		var data = {
			nelat:bounds._northEast.lat,
			nelng:bounds._northEast.lng,
			swlat:bounds._southWest.lat,
			swlng:bounds._southWest.lng
		};
	},

	placePoints:function(data){
		for (var i = 0;i<data.length;i++){
			let tLat = data[i].lat;
			let tLng = data[i].lng;
			v.markers.push(
				new L.marker([tLat,tLng])
			);
		}

		for (var marker in v.markers){
			v.map.addLayer(v.markers[marker]);
		}
	}
};


window.onload = app.init;