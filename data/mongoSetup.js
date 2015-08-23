var mongoose = require('mongoose');  

//var connectionString = process.env.CUSTOMCONNSTR_MONGOLAB_URI;
//var connectionString = 'mongodb://<dbuser>:<dbpassword>@ds040898.mongolab.com:40898/deadlinersdb';
var connectionString = 'localhost:27017/deadlinersdatabase';
mongoose.connect(connectionString);
var Schema = mongoose.Schema;

//var Top5List = mongoose.model('Top5List');

/*Top5List.findOne({ player1Score: 72}, function (err, doc)
{
	console.log(doc);
});*/


/*var Top5ListSchema = new Schema({
	player1Name : String,
	player1Score : String,
	player2Name : String,
	player2Score : String,
	player3Name : String,
	player3Score : String,
	player4Name : String,
	player4Score : String,
	player5Name : String,
	player5Score : String
});

var Top5List = mongoose.model('Top5List', Top5ListSchema);

var List = new Top5List({
	player1Name : 'John Doe',
	player1Score : '72',
	player2Name : 'Noobronia',
	player2Score : '55',
	player3Name : 'Hesteronni',
	player3Score : '44',
	player4Name : 'Nope',
	player4Score : '15',
	player5Name : 'Lise',
	player5Score : '1'
});

List.save(function(err, thor) 
{
	if (err) return console.error(err);
	console.dir(thor);
});

Top5List.find(function(err, lists) 
{
	if (err) return console.error(err);
	console.log('YTO');	
	console.log(lists);
});*/