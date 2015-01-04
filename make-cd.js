var async = require('async'),
    fs = require('fs-extra'),
    path = require('path'),
    _ = require('underscore'),
    argv = require('yargs')
        .demand([ 'from', 'to' ])
        .argv;

// number padding trick from http://stackoverflow.com/a/7254108
var makeACompleteCD = function (callback) {
    var MAX_CD_SIZE = 737, // Mb
        artists = [ ],
        trackNo = 0,
        totalSize = 0,
        full = false;
    console.log("Preparing CD no. " + cdNumber + "...");
    // prepare the folder
    fs.ensureDir(path.join(argv.to, (1e15 + cdNumber + "").slice(-3)), function (err) {
        async.whilst(
            function () {
                // create a randomly sorted list of the available artists
                if (artists.length === 0) {
                    artists = _.unique(tracks.map(function (t) { return t.artist; })));
                    artists = _.sample(artists, artists.length);
                }
                return !full;
            },
            function (callback) {
                // get a random track from the next artist
                var chosenTrack = _.sample(_.where(tracks, { 'artist': _.first(artists) }));
                fs.stat(path.join(argv.from, chosenTrack.artist + ' - ' + chosenTrack.title + '.mp3'), function (err, stat) {
                    trackSize = stat.size / 1000000.0;
                    // if there still room in the CD
                    if (totalSize + trackSize > MAX_CD_SIZE) {
                        callback(null);
                    } else {
                        fs.copy(
                            path.join(argv.from, chosenTrack.artist + ' - ' + chosenTrack.title + '.mp3'),
                            path.join(argv.to, (1e15 + cdNumber + "").slice(-3), (1e15 + (++trackNo) + "").slice(-3) + ' ' + chosenTrack.artist + ' - ' + chosenTrack.title + '.mp3'),
                            function (err) {
                                totalSize += trackSize;
                                tracks = _.without(tracks, chosenTrack);
                                artists = _.rest(artists);
                                console.log("Copying " + JSON.stringify(chosenTrack) + "...");
                                callback(null);
                            });
                    }
                });
            },
            callback
        );
    });
}

var cdNumber = 0,
    // read available songs
    tracks = fs
        .readdirSync(argv.from)
        // takes only MP3 files
        .filter(function (filename) { return path.extname(filename) === '.mp3'; })
        // drop the disambiguation copies of the same track
        .filter(function (filename) { return !path.basename(filename, '.mp3').match(/-\d+/); })
        .map(function (filename) {
            return {
                'artist': filename.match(/([^-]+) - /)[1],
                'title': filename.match(/ - (.+).mp3/)[1]
            };
        });
async.whilst(
    function () { return tracks.length > 0; },
    function (callback) {
        cdNumber++;
        makeACompleteCD(callback);
    },
    function (err) {
        // finished
    }
);
