/* Test of:
* Node
* Socket.io
* Passport
* Rethinkdb
* Reflux
* React
*/

// Import required modules
import express from "express";
import http from "http";
import socket from "socket.io";

// Models
import Thing from "./db/models/thing.js";

// Instantiate express and socket.io
var app = express();
var server = http.Server(app);
var io = socket(server);
var connection = null;

// Expose all static files in the public directory
// We mostly use this to serve client side bower dependenices
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
	res.sendfile('index.html');
});

io.on('connection', socket => {
	// listen for new things, and insert them to rethinkdb
	socket.on('thing', (name) => {
		console.log(name);
		var thing = new Thing({
			name: name,
			done: false
		});
		thing.save();
	});

	// emit changes of all the things
	Thing.changes().then((feed) => {
		feed.each((err, thing) => {
			if (err) { throw err; }
			// TODO: Put new, updated, deleted on the model
			// new document inserted
			else if (thing.getOldValue() === null) {
				thing.new = true;
				socket.emit('thing', thing);
			}
			// doc deleted
			else if (thing.isSaved() === false) {
				socket.emit('thing', { id: thing.id, deleted: true })
			}
			// doc updated
			else {
				thing.updated = true;
				socket.emit('thing', thing);
			}
		});
	});

	// get on initial socket load
	Thing.run().then((things) => {
		things.forEach((thing) => {
			socket.emit('thing', thing);
		});
	});
});

server.listen(3000, () => {
	console.log('listening on 3000');
});
