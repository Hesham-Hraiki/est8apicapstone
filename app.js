var express = require('express');
var mongoose = require('mongoose');
var app = express();
var mongojs = require('mongojs');
mongoose.connect('mongodb://159.203.29.179/meteor');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
	console.log("WE ARE connected!!!!!!!!!");
});
app.get('/', function(req,res){
	res.send("Hello from the Other Side");
});
app.get('/api', function(req,res){
	console.log("I received a request");
	db.collection('listings').find().toArray(function(err,docs){
		if(err)
		{
			res.send(err);
		}
	//	console.log(docs);
		res.json(docs);
	});
});

app.listen(8080);
console.log("App running on port 8080");
