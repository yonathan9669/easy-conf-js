var options = processArguments(process.argv.slice(2));

if (!options.help && options.source) {
	var appPath = __dirname;
	var LIB = require(appPath + '/lib/easy-conf');
	var easyConfJS = new LIB(options.source, options.target);

	easyConfJS.on('target-loaded', function(file, points) {
		if (process.env.VERBOSE) {
			console.log("-----------------Target Inspection-----------------");
			console.log('Target file LOADED...', '\n' + file + '\n', points, points.size);
		}

		easyConfJS.generateEntries(points);
	}).on('entries-generated', function(entries, points) {
		if (process.env.VERBOSE) {
			console.log("-----------------Entries Generation-----------------");
			console.log(entries.join('\n'));
		}

		var lines = easyConfJS.linesToInsert(entries, points);

		if (process.env.VERBOSE) {
			console.log("-----------------New File-----------------");
			console.log(lines.join('\n'));
		}

		easyConfJS.writeFile(lines);
	});
} else {
	if (options.help)
		printHelp();
	else
		console.log("The app need a file to serve, use -h to help");
}
//---------------------------------------------------------------------------------------
//Utilities functions
function processArguments(arguments) {
	var options = {source: 'config.json', target: '/etc/hosts'};

	arguments.forEach(function(arg, i) {
		switch (arg) {
			case "-v":
				options.VERBOSE = process.env.VERBOSE = true;
				break;
			case "-s":
				options.source = arguments[i + 1];
				break;
			case "-t":
				options.target = arguments[i + 1];
				break;
			case "-p":
				options.port = parseInt(arguments[i + 1]);
				break;
			case "-h":
				options.help = true;
		}
	});

	if (process.env.VERBOSE) {
		console.log("-----------------Program Options-----------------");
		console.log(JSON.stringify(options, undefined, 4));
	}

	return options;
}

function printHelp() {
	console.log("//----------------WELCOME----------------//");
	console.log("easyConfJS - Help\n");
	console.log("Use: node app.js [options]\n");
	console.log("\tOptions: ");
	console.log("\t-s /your/services.json\t\tSource file for services activation (DEFAULT: config.json)");
	console.log("\t-t /your/target/path\t\tTarget file for services activation (DEFAULT: /etc/hosts)");
	console.log("\t-h\t\t\t\tPrint this help");
	console.log("\t-v\t\t\t\tActivate VERBOSE mode in the app");
	console.log("\t-p\t\t\t\tSet a port for runtime server - DEFAULT:9001");
	console.log("\nExample: node app.js -p 8080 -s services.json -t /desktop/hosts");
}