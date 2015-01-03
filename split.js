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
	argv = require('yargs')
		.demand([ 'in', 'out' ])
		.argv;

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
		console.log(SOX_PATH + ' "' + argv.in + '" "' + path.join(argv.out, track.artist + ' - ' + track.title + '.mp3') + '" trim ' + track.timestamp + ' ' + track.duration);
		exec(
			SOX_PATH + ' "' + argv.in + '" "' + path.join(argv.out, track.artist + ' - ' + track.title + '.mp3') + '" trim ' + track.timestamp + ' ' + track.duration,
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
	},
	function (err) {

	}
);


