var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
//app.use(express.bodyParser());
var mongojs = require('mongojs');
mongoose.connect('mongodb://159.203.17.174/meteor');
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

//url for profile details
app.get('/api/?:profileID',function(req,res){
	console.log("Show me JSON DATA OF " + req.params.profileID);
	db.collection('listings').find({_id:req.params.profileID}).toArray(function(err,docs){
		if(err)
		{
			res.send(err);
		}
	//	console.log(docs);
		res.json(docs);
	});
});
//filter options
app.post('/filter', function(req,res){
	var location = req.body.location;
	var bedroom = req.body.noOfBeds;
	var bathroom = req.body.noOfBaths;
	var minPrice = parseInt(req.body.minPrice);
	var maxPrice = parseInt(req.body.maxPrice);
	var category = req.body.type;
	db.collection('listings').find({
		$or:[{city:location},{province:location},{postal:location}],
		bedrooms: bedroom,
		bathrooms: bathroom,
		category: category,
		price: {$gte: minPrice,$lte: maxPrice}
		
	}).toArray(function(err,docs){
		if(err){
			console.log(err);
			res.send(err);
		}
		console.log(docs);
		res.json(docs);
	})
	//console.log(options);
	//res.send(options);
});

// test for openshift compatibility
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

app.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", server_port " + server_port )
}); 

//app.listen('3000');

