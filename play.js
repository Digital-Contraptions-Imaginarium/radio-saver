// Original source from https://github.com/TooTallNate/node-icecast 's examples

var fs = require('fs-extra')
    lame = require('lame'),
    icecast = require('icecast'),
    Speaker = require('speaker'),
    _ = require('underscore')
    argv = require('yargs')
        .argv;

// URL to a known Icecast stream
var url = 'http://mp3.ffh.de/fs_ffhchannels/hqschlager.mp3?amsparams=playerid:FFHPopup;skey:1420107539',
    timeStart = new Date();

// connect to the remote stream
icecast.get(url, function (res) {
    // log the HTTP response headers
    // console.error(res.headers);
    res.on('metadata', function (metadata) {
        if (argv.save) {
            var parsed = icecast.parse(metadata),
                metadata = { 
                    'artist': (parsed.StreamTitle !== '') ? parsed.StreamTitle.match(/FFH SCHLAGERKULT: (.*) - /)[1] : undefined,
                    'title': (parsed.StreamTitle !== '') ? parsed.StreamTitle.match(/FFH SCHLAGERKULT: .* - (.*)/)[1] : undefined,
                    'timestamp': parseInt(Math.floor(((new Date()) - timeStart) / 1000)),
                };
            console.log('Playing: ' + JSON.stringify(metadata));
            fs.appendFile(argv.save + '.jsonl', JSON.stringify(metadata) + '\n', { 'encoding': 'utf8' }, function (err) { });
        }
    });
    if (!argv.nosound) res.pipe(new lame.Decoder()).pipe(new Speaker());
    if (argv.save) res.pipe(fs.createWriteStream(argv.save));
});