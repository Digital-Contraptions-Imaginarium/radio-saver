var async = require('async'),
	fs = require('fs-extra');

var DEFAULT_MAX_COPIES = null; // infinite duplicate copies

exports.tryFilename = function (pathAndBasename, ext, maxCopies, callback) {
	if (!callback) {
		callback = maxCopies;
		maxCopies = DEFAULT_MAX_COPIES;
	}
	var found = false,
		filename = null,
		disambiguationOrdinal = 1;
	async.doUntil(
		function (callback) {
			var candidateFilename = pathAndBasename + (disambiguationOrdinal === 1 ? '' : '-' + disambiguationOrdinal) + '.' + ext;
			fs.exists(candidateFilename, function (exists) {
				if (!exists) {
					found = true;
					filename = candidateFilename;
				}
				disambiguationOrdinal++;
				callback(null);
			})
		},
		function () {
			return found || (maxCopies ? disambiguationOrdinal >= maxCopies : false);
		},
		function (err) {
			callback(err, filename);
		}
	);
}
