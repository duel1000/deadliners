var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var uuid = require('node-uuid');
var express = require('express');
var port = process.env.PORT || 3000;
app.use(express.static('client'));
app.use(express.static('shared'));

var jsonfile = require('jsonfile');
var util = require('util');
 
app.get('/', function(req, res)
{
	res.sendFile(__dirname + '/index.html');
});

http.listen(port, function()
{
	console.log('listening on *:' + port);
});

var entities = require('./shared/modules/entities.js');
var entityFunctions = require('./shared/modules/entityFunctions.js');
var gridFunctions = require('./shared/modules/gridFunctions.js');
var math = require('./shared/modules/math.js');
var variables = require('./shared/modules/variables.js');

var map_values = variables.map_values;
var collisions = entities.collisions;