// RethinkDB Database setup with thinky.io
var thinky = require("thinky")({
	// options
	min: 10,
	max: 5000,
	db: 'ninethings'
});

// RethinkDB connection
// Need to come back and change these to ENV vars
module.exports = thinky;
