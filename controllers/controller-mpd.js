// author: HoochDeveloper
// MPD daemon controller sketch
// this accepts the socket connection to the mpd daemon to be initialized
var libMpd = require('mpd');
var libEvents = require('events');
var libUtil = require('util');

// Define the ControllerMpd class
module.exports = ControllerMpd;
function ControllerMpd (nPort, nHost) {
	this.client = libMpd.connect({port: nPort,	host: nHost});
	this.cmd = libMpd.cmd;

	var thisControllerMpd = this;

	// Make a temporary track library for testing purposes
	this.library = new Object();
	this.library['B6+k7b7XGU+uZrpNI3ayYw=='] = {uri: 'http://2363.live.streamtheworld.com:80/KUSCMP128_SC', metadata: {title: 'KUSC Radio'}};
	this.library['Ae7R2pn6CEyVG7GNuGGtbQ=='] = {uri: 'http://uk4.internet-radio.com:15938/', metadata: {title: 'Go Ham Radio'}};

	// Inherit some default objects from the EventEmitter class
	libEvents.EventEmitter.call(this);

	// Create a listener for playback status updates
	this.client.on('system-player', function () {

		// Get the updated state
		this.sendCommand(libMpd.cmd("status", []), function (err, msg) {
			if (err) throw err;

			// Emit the updated state for the command router to hear
			thisControllerMpd.emit('controllerEvent', {type: 'mpdStateUpdate', data: libMpd.parseKeyValueMessage(msg)});

		});

	});

}

// Let this class inherit the methods of the EventEmitter class, such as 'emit'
libUtil.inherits(ControllerMpd, libEvents.EventEmitter);

// MPD play command
ControllerMpd.prototype.play = function (promisedResponse) {
	this.client.sendCommand(this.cmd('play', []), promisedResponse.resolve());

}

// MPD stop command
ControllerMpd.prototype.stop = function (promisedResponse) {
	this.client.sendCommand(this.cmd('stop', []), promisedResponse.resolve());

}

// MPD clear queue, add array of tracks, and play
ControllerMpd.prototype.clearAddPlay = function (arrayTrackIds, promisedResponse) {
	var thisControllerMpd = this;
	var arrayTrackUris = arrayTrackIds.map(function (curTrackId) {
		return thisControllerMpd.library[curTrackId].uri;

	});

	var arrayCommands = [];
	var thisControllerMpd = this;
	arrayCommands.push(thisControllerMpd.cmd('clear', []));
	arrayCommands = arrayCommands.concat(
		arrayTrackUris.map(function (curTrackUri) {
			return thisControllerMpd.cmd('add', [curTrackUri]);

		})

	);
	arrayCommands.push(thisControllerMpd.cmd('play', []));

	this.client.sendCommands(arrayCommands, promisedResponse.resolve());

}