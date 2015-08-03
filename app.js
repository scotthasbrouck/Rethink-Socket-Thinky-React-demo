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
import r from "rethinkdb";

// Instantiate express and socket.io
var app = express();
var server = http.Server(app);
var io = socket(server);
var connection = null;

// RethinkDB connection
// Need to come back and change these to ENV vars
r.connect({
	host: 'localhost',
	port: 28015,
	db: 'ninethings'
 }, (err, conn) => {
	if (err) throw err;
	connection = conn;

	// Expose all static files in the public directory
	// We mostly use this to serve client side bower dependenices
	app.use(express.static(__dirname + '/public'));

	app.get('/', (req, res) => {
		res.sendfile('index.html');
	});

	io.on('connection', socket => {
		// listen for new things, and insert them to rethinkdb
		socket.on('thing', (thing) => {
			r.table('things')
			.insert({ name: thing, done: false })
			.run(connection);
		});

		// get the things already in the database
		r.table('things').run(connection, (err, cursor) => {
			if (err) throw err;
			cursor.each((err, row) => {
				socket.emit('thing', row);
			});
		});

		// subscribe to rethink query for things, and emit them
		r.table('things').changes().run(connection, (err, feed) => {
			if (err) throw err;
			feed.each((err, row) => {
				if (err) throw err;
				// row still present and was just chagned
				if (row.new_val) { socket.emit('thing', row.new_val); }
				// row deleted
				else {  socket.emit('thing', { id: row.old_val.id })}
			});
		});
	});

	server.listen(3000, () => {
		console.log('listening on 3000');
	});
});
