#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var log = require('verbalize');
var argv = require('minimist')(process.argv.slice(2));

/**
 * Everything in the file should be customized
 */
var paths;

// Verbalize `runner`
log.runner = 'project-mouse';
loadConfig(scan);
/**
 * Application
 */

function scan(path,callback){
	if (path.length==0) log.error("No Path configured!! \n use [*] \t pm --save [PATH]");
	for (var p in path) {
		log.info("Scanning: " + path[p]);
		fs.readdir(path[p], function(err,files){
			if (err) throw err;

			for (var sd in files){
				log.info("[*] Subdir: " + files[sd]);

				projects = fs.readdirSync(path[p]+files[sd]);
				for(var pj in projects){
					var git = fs.existsSync(path[p]+files[sd]+"/"+ projects[pj] + "/.git");
					var bower = fs.existsSync(path[p]+files[sd]+"/"+ projects[pj] +"/bower.json");
					var npm = fs.existsSync(path[p]+files[sd]+"/"+ projects[pj] +"/package.json");
					var stack = bower ? parseBower(path[p]+files[sd]+"/"+ projects[pj] +"/bower.json") : false;
					var npmstack = npm ? parseNPM(path[p]+files[sd]+"/"+ projects[pj] +"/package.json") : false;

					log.success("\t [*] Project: " + projects[pj] + ((git) ? " ~git" : ""));
					if (stack && argv.b) log.error("\t\t [*] Bower-Stack: " + stack)	
					if (stack && argv.n) log.error("\t\t [*] NPM-Stack: " + npmstack)	
				} 


			}



		});
	}

}

function parseNPM(file){
	var npmraw = fs.readFileSync(file);
	var npm = JSON.parse(npmraw);
	var deps = [];
	for (var key in npm.dependencies) {
		deps.push(key);
	};

	return deps;
}

function parseBower(file){
	var bowerraw = fs.readFileSync(file);
	var bower = JSON.parse(bowerraw);
	var deps = [];
	for (var key in bower.dependencies) {
		deps.push(key);
	};

	return deps;
}

function loadConfig(callback){
	fs.readFile(__dirname + "/config.json", function (err,data) {
		if (err) throw err;
		var json = JSON.parse(data);

		if (argv.save && fs.existsSync(argv.save)) {
			json.projectpaths.push(argv.save);
			fs.writeFile(__dirname + "/config.json", JSON.stringify(json,null,2));
		}
		if (argv.remove) {
			log.info("Removing "+argv.remove+ "from Config");
			json.projectpaths.splice(
				json.projectpaths.indexOf(argv.remove),1
			);
			fs.writeFile(__dirname + "/config.json", JSON.stringify(json,null,2));
		};

		if (callback) callback(json.projectpaths);
	});
}