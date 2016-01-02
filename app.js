var express = require('express')
	, app = express()
	, server = require('http').createServer(app)
	, path = require('path')
	, io = require('socket.io').listen(server)
	, spawn = require('child_process').spawn
	, omx = require('omxcontrol');

// all environments
app.set('port', process.env.TEST_PORT || 8080);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(omx());

// Routes
app.get('/', function (req, res) {
	res.sendfile(__dirname + '/public/index.html');
})

app.get('/remote', function (req, res) {
	res.sendfile(__dirname + '/public/remote.html');
});

// Socket.io config
io.set('log level', 1);

server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
})

//Run and pipe shell script output
function run_shell(cmd, args, cb, end) {
	var spawn = require('child_process').spawn,
		child = spawn(cmd, args),
		me = this;
	child.stdout.on('data', function (buffer) {cb(me, buffer) });
	child.stdout.on('end', end);
}

io.sockets.on('connection', function (socket) {
	socket.emit('message', { message: 'welcome to the chat' });
	socket.on('send', function (data) {
		//Emit to all
		io.sockets.emit('message', data);
	});
});

var ss;
//Socket.io Server
io.sockets.on('connection', function (socket) {

	socket.on("screen", function(data){
		socket.type = "screen";
		//save the screen socket
		ss = socket;
		console.log("Scree ready ...");
	})

	socket.on("remote", function(data) {
		socket.type = "remote";
		console.log("Remote ready ...");
		if(ss != undefined) {
			console.log("Synced...");
		}
	});
}); 
