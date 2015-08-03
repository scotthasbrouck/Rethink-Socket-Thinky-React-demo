// Model for thing
var thinky = require("../thinky.js");
var type = thinky.type;

var Thing = thinky.createModel("thing", {
	id: type.string(),
	name: type.string(),
	done: type.boolean()
});

module.exports = Thing;
