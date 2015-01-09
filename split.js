var SOX_PATH = '/usr/local/bin/sox',
	SOX_ERROR_MESSAGES_TO_IGNORE = [
		'WARN mp3: recoverable MAD error',
		'WARN mp3: MAD lost sync'
	];

var async = require('async'),
	fs = require('fs-extra'),
	_ = require('underscore'),
	exec = require('child_process').exec,
	path = require('path'),
	tentativeFilename = require('./lib/tentative-filename'),
	argv = require('yargs')
		.demand([ 'in', 'out' ])
		.default('max', 3) // max no. of tracks with the same name
		.default('left', 10) // seconds
		.default('right', 30) // seconds
		.argv;

// read the list of songs to be ignored
var toBeIgnored = !argv.ignore ? [ ] : fs
	.readFileSync(argv.ignore, { 'encoding': 'utf8' })
	.split('\n')
	.reduce(function (memo, line) {
		line = line.trim();
		if ((line !== '') && !line.match(/^#/)) memo = memo.concat(line);
		return memo;
	}, [ ]);
// read the tracks metadata
var tracks = fs
	.readFileSync(argv.in + '.jsonl', { 'encoding': 'utf8' })
	.split('\n')
	.reduce(function (memo, line) {
		if (line.trim() !== '') memo = memo.concat(JSON.parse(line));
		return memo;
	}, [ ]);
// calculates the tracks' duration
for (var i = tracks.length - 2; i > 0; i--) {
	tracks[i].duration = tracks[i + 1].timestamp - tracks[i].timestamp;
}
// drop the first and the last, that are truncated
tracks = _.rest(_.initial(tracks));
// drop the tracks without artist or title
tracks = tracks.filter(function (track) { return track.artist || track.title; });
// does the trimming
async.eachSeries(
	tracks,
	function (track, callback) {
		var basename = track.artist + ' - ' + track.title;
		if (!_.contains(toBeIgnored, basename)) {
			tentativeFilename.tryFilename(path.join(argv.out, basename), 'mp3', parseInt(argv.max), function (err, filename) {
				if (!filename) {
					// too many duplicates
					callback(null);
				} else {
					// TODO: if the specified trimming duration goes beyond the actual duration of the file, sox will return a warning apparently the trimming works anyway
					var command = SOX_PATH + ' "' + argv.in + '" "' + filename + '" trim ' + Math.max(0, track.timestamp - parseInt(argv.left)) + ' ' + (track.duration + parseInt(argv.left) + parseInt(argv.right));
					console.log(command);
					exec(
						command,
						function (err, stdout, stderr) {
							// remove the error messages to ignore from stderr
							stderr = stderr.split('\n').filter(function (line) {
								return !_.some(
									[ '' ].concat(SOX_ERROR_MESSAGES_TO_IGNORE.map(function (errorMessage) { return SOX_PATH + ' ' + errorMessage; })),
									function (errorMessage) {
										return errorMessage === line;
									})
								}).join('\n');
								// and print it if anything is left
								if (stderr !== '') console.log(stderr);
								callback(err);
							});
				}
			});
		} else {
			callback(null);
		}
	},
	function (err) {

	}
);
