var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var uuid = require('node-uuid');
var express = require('express');
var port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', function(req, res)
{
	res.sendFile(__dirname + '/index.html');
});

http.listen(port, function()
{
	console.log('listening on *:' + port);
});

function ConnectedClients()
{
	this.Client1 = 0;
	this.Client2 = 0;
	
	this.ConnectedClientsCount = 0;

	this.AddClient = function(newClient)
	{
		if(this.Client1 == 0)
		{
			this.Client1 = newClient;
			newClient.emit('connected', { id : this.Client1.userid });
			this.ConnectedClientsCount++;
		}
		else if(this.Client2 == 0)
		{
			this.Client2 = newClient;
			newClient.emit('connected', { id : this.Client2.userid });
			this.ConnectedClientsCount++;
		}
		else
		{
			Log("Over 2 players");
		}

		if(this.ConnectedClientsCount >= 2)
		{
			setTimeout(function()
			{
				io.emit('EnterGame');
			}, 2500);
		}
	};

	this.RemoveClient = function(ID)
	{
		this.ConnectedClientsCount--;
		switch(ID)
		{
			case this.Client1.userid:
				this.Client1 = 0;
				break;

			case this.Client2.userid:
				this.Client2 = 0;
				break;
		}
	};
}
var connected_clients = new ConnectedClients();

io.on('connection', function(newClient)
{	
	newClient.userid = uuid.v4();
	
	connected_clients.AddClient(newClient);	
	console.log('\t socket.io:: player ' + newClient.userid + ' connected');
	
	newClient.on('disconnect', function () 
	{	
		connected_clients.RemoveClient(newClient.userid);
		console.log('\t socket.io:: newClient disconnected ' + newClient.userid );
	});
});

function HandleInput(newClient)
{
	newClient.on('keypress', function(data)
	{

	});	
}

function Log(text)
{
	console.log(text);
}
