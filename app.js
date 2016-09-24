var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
//app.use(express.bodyParser());
var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'est8app@gmail.com', // Your email id
            pass: 'mobileest8app' // Your password
        }
    });
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
	db.collection('listings').find({pictures:{$exists: true}}).toArray(function(err,docs){
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
	console.log(req.body);
	var location = req.body.location;
	var bedroom = req.body.noOfBeds;
	var bathroom = req.body.noOfBaths;
	var minPrice = parseInt(req.body.minPrice);
	var maxPrice = parseInt(req.body.maxPrice);
	var category = req.body.type;
	db.collection('listings').find({
		$or:[{city:location},{province:location},{postal:location}],
		bedrooms: {$gte: bedroom},
		bathrooms: {$gte: bathroom},
		category: category,
		pictures: {$exists: true},
		price: {$exists:true, $gte: minPrice,$lte: maxPrice} 
		
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
// new filter route for new simple location and price based search 
app.post('/simplefilter', function(req,res){
	console.log(req.body);
	var location = req.body.location;
	var minPrice = parseInt(req.body.minPrice);
	var maxPrice = parseInt(req.body.maxPrice);
	db.collection('listings').find({
		$or:[{city:location},{province:location},{postal:location}],
		price: {$exists:true, $gte: minPrice,$lte: maxPrice} 
		
	}).toArray(function(err,docs){
		if(err){
			console.log(err);
			res.send(err);
		}
		console.log(docs);
		res.json(docs);
	})
});

// email service to send to realtor
app.post('/emailmsg', function(req,res){
	var emails = [];
	var mailOptions = req.body;
	/*var test = db.collection('users').find({_id: 'B6foJjtp3orNyCXjL'},{emails:1, _id:0});
	console.log(test);*/
	//fetch reltor ID form request and use that to get the email of realtor... sending message is dependent of fetching info from database
	db.collection('users').find({_id: mailOptions.realtorId},{emails:1, _id:0}).toArray(function(err,msg){
		if(err)
		{
			console.log(err);
		}
		//res.send(msg);
		//console.log(msg[0].emails[0].address);
		mailOptions.to = msg[0].emails[0].address;
		console.log(mailOptions.to);
	
	// create a transporter
	/**
	var text = 'Hello world from \n\n' + req.body.name;
	var mailOptions = {
    from: 'est8app@gmail.com', // sender address
    to: 'toni.ademilua@gmail.com', // list of receivers
    subject: 'Email Example', // Subject line
    text: text //, // plaintext body
    // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
	};**/
	transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
        res.json({yo: 'error'});
    }else{
        console.log('Message sent: ' + info.response);
        res.json({yo: info.response});
    };
});
});

});

// test for openshift compatibility
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 3000
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

app.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", server_port " + server_port )
}); 

//app.listen('3000');

