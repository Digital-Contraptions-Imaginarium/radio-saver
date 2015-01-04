radio-saver
===========

Does what it says on the tin. The ```play.js``` script captures an MP3 audio stream (Icecast) and its metadata, plays it back and saves it for hearing it again. The ```split.js``` script splits the .MP3 file saved by ```play.js``` wherever its metadata changed, e.g. updated artist and track name information, and tries to name the file accordingly.

##play.js
Use the ```--save [filename]``` parameter to specify the destination audio file. E.g. ```--save foo.mp3``` will create two files: *foo.mp3* with the audio and *foo.mp3.jsonl* with its metadata history. Use the ```--nosound``` parameter to capture the audio quietly.

##split.js
```node split.js --in [filename] --out [foldername]``` splits the specified file and puts the resulting files in the specified folder. Files candidate to have the same filename are not overwritten. Disambiguation is done by adding *-2*, *-3* etc. at the end of the file's basename. Use the ```--ignore [filename]``` argument to specify the list of basenames of tracks to be ignored (e.g. songs you've got already), one per line. You can prepend *#* to leave comments in the file. Use the ```--left l``` and ```--right r``` arguments to cut *l* extra seconds before and *r* after each track The default is 10 and 30 respectively.

##make-cd.js
```node make-cd.js --from [fromFolder] --to [toFolder]``` copies all tracks from *fromFolder* to *n* folders *001*, *002* etc. in *toFolder*, each of which is sized to fit into a CD, and shuffling them and avoiding as much as possible repeating the same artist. The tracks are also numbered, so that if the player cannot shuffle the tracks by itself they are not played in alphabetical order.
