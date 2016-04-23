var fs = require('fs');
var events = require('events');

const entries = '### easy-conf-js';
const separators = [entries + ' - START', entries + ' - END'];

var easyConf = function(source, target) {
	this.projects = JSON.parse(fs.readFileSync(source));
	this.target = target;
	this._inspectTarget();
};

easyConf.prototype = new events.EventEmitter();

easyConf.prototype._inspectTarget = function() {
	var easy = this;

	fs.readFile(this.target, 'utf8', function(err, data) {
		easy.fileLines = data.split('\n');

		var entryPoints = {
			start: easy.fileLines.indexOf(separators[0]),
			end: easy.fileLines.indexOf(separators[1]),
			get size() {
				return this.end - this.start;
			}
		};

		easy.emit('target-loaded', data, entryPoints);
	});
};

easyConf.prototype.generateEntries = function(points) {
	var entries = [];

	var addSubDomains = function(domain, base, entries) {
		var b = Array.from(base);
		b.unshift(domain.domain);

		if (domain.address) {
			entries.push(domain.address + '\t' + b.join('.'));
		}

		if (domain.subdomains) {
			domain.subdomains.forEach(function(subDomain) {
				addSubDomains(subDomain, b, entries);
			});
		}
	};

	this.projects.forEach(function(project) {
		entries.push('## ' + project.project);
		addSubDomains(project, [], entries);
	});

	this.emit('entries-generated', entries, points);
};

easyConf.prototype.linesToInsert = function(entries, points) {
	var lines = (points.size) ? this.fileLines.slice(0, points.start) : this.fileLines;
	lines = lines.concat(separators[0], entries);

	if (points.size) {
		lines = lines.concat(this.fileLines.slice(points.end + 1));
	}

	return lines.concat(separators[1]);
};

easyConf.prototype.writeFile = function(lines) {
	fs.writeFile(this.target, lines.join('\n'), function(err) {
		if (err) throw err;
		console.log('Your configurations were added or updated...! =) ENJOY (=');
	});
};

module.exports = easyConf;