var async = require('async'),
	fs = require('fs-extra');

exports.tryFilename = function (pathAndBasename, ext, callback) {
	var filename,
		disambiguationOrdinal = 1;
	async.doUntil(
		function (callback) {
			var candidateFilename = pathAndBasename + (disambiguationOrdinal === 1 ? '' : '-' + disambiguationOrdinal) + '.' + ext;
			fs.exists(candidateFilename, function (exists) {
				if (!exists) filename = candidateFilename;
				disambiguationOrdinal++;
				callback(null);
			})
		},
		function () {
			return filename;
		},
		function (err) {
			callback(err, filename);
		}
	);
}
