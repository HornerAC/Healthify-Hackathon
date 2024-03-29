"use strict";

var version = 'v2:';
var base = '/health-app/';
var appName = "healthyapp";
var appAssets = [
	'https://code.jquery.com/jquery-3.4.1.min.js',
	'https://unpkg.com/leaflet@1.4.0/dist/leaflet.js',

	base,
	base + "app.js",
	base + "index.html",
	base + "steps.js",
	base + "style.css",
	base + "libraries/pouchdb/pouchdb.min.js",
	base + "libraries/chartjs/Chart.min.js",
	base + "libraries/chartjs/Chart.min.css",
	base + "libraries/bootstrap/css/bootstrap.css",
];

self.addEventListener("install", function (event) {
	self.skipWaiting();
	event.waitUntil(caches.open(version + appName).then(function(cache){
		return cache.addAll(appAssets);
	}).then(function () {
		console.log('sw: install completed');
	}));
});

self.addEventListener("fetch",function(event) {
	console.log('sw: fetch event in progress.');
	if (event.request.method !== 'GET') {
		console.log('sw: fetch event ignored.', event.request.method, event.request.url);
		return;
	}
	event.respondWith(
		caches.match(event.request).then(function(cached){
			var networked = fetch(event.request).then(fetchedFromNetwork,unableToResolve).catch(unableToResolve);
			
			console.log('sw: fetch event', cached ? '(cached)' : '(network)', event.request.url);
			return cached || networked;

			function fetchedFromNetwork(response) {
				var cacheCopy = response.clone();
				console.log('sw: fetch response from network.', event.request.url);
				caches.open(version + 'pages').then(function add(cache){
					cache.put(event.request, cacheCopy);
				}).then(function(){
					console.log('sw: fetch response stored in cache.', event.request.url);
				});
				return response;
			}

			function unableToResolve() {
				console.log('sw: fetch request failed in both cache and network.');
				return new Response('<h1 style="font-weight:100;font-family:sans-serif;">Service Unavailable</h1>', {
					status:503,
					statusText:'Healthify Unavailable',
					headers:new Headers({
						'Content-Type': 'text/html'
					})
				});
			}
		})
	);
});
self.addEventListener("activate", function(event){
	event.waitUntil(
		caches.keys().then(function(keys){
			return Promise.all(
				keys.filter(function(key){
					return !key.startsWith(version);
				}).map(function(key){
					return caches.delete(key);
				})
			);
		}).then(function(){
			console.log('sw: activate completed.');
		})
	);
});