// Basic node

// sends/receives messages plus basic artificial intelligence



// things common to all nodes
// useful utilities
// sending messages
// reading messages listening for events
// remember peers
// look for patterns in peers
// generic memory, storage
// starting web workers and managing

// peer data:
/*
{
	name: "et cetera",
	uri: "jkhlgfdabnkvcwek",
	lastSeen: Date.now(),
	connections: [fgsfds, wjkafnkw, doop]
}
*/
define('planet', ['EventEmitter'], function(EventEmitter) {

	var Planet = function(corpus) {
		this.corpus = corpus;
		this.chooseName(this.corpus);
		console.log('somebody: initializing... i am... ' + this.name);
		this.mainReady = false;
		this.alphaReady = false;
		this.messageHistory = [];
		this.connectedPeers = [];

		this.inititateConnection();
	};
	Planet.prototype = Object.create(EventEmitter.prototype);

	// Creates main local peer and connects that peer to alpha peer
	Planet.prototype.inititateConnection = function() {
		var self = this;

		// Returns a function that sends data to a specified connection
		var send = function(data) {
			return function(conn) {
				// TODO: don't send data to the sender of the message
				conn.send(data);
			}
		};

		// Attempt to create the alpha node
		// If this succeeds, setup message routing
		// If this fails, alpha already exists somewhere else
		// Either way, main will be able to connect to alpha
		var createAlpha = function(callback) {
			var alpha = new Peer('alpha', {key:'vm4nrce6ilfpqfr'});
			alpha.on('open', function() {
				console.log('created alpha');
				var alphaConns = [];

				// Alpha automatically redirects all messages to all other connected peers
				alpha.on('connection', function(conn) {
					self.log('alpha: new connection:', conn);
					alphaConns.push(conn);
					conn.on('data', function(data) {
						//self.log('alpha:', data);
						data.path.push('alpha');
						alphaConns.forEach(send(data));
					});
					// handle connection close
				});

				// Succeeded creating alpha node
				if(callback) { 
					var x = callback;
					callback = null;
					x();
				}
			});
			alpha.on('error', function(err) {
				// Probably failed to create alpha node
				if(callback) { 
					var x = callback;
					callback = null;
					x();
				}
				// TODO decide if need to try recreate
			});
			alpha.on('close', function() {
				self.log('alpha closed');
				// TODO attempt to recreate
			});
		};

		// Create the main peer
		// This one will directly connect to other peers found by talking to alpha
		self.main = new Peer({key:'vm4nrce6ilfpqfr'});
		self.main.on('open', function(id) {
			console.log('main created: ' + id);
			self.main.on('connection', function(conn) {
				self.log('main connection:', conn);
			});
			self.mainReady = true;
			createAlpha(function() {
				self.log('connecting main to alpha');
				var meta = {name:self.name, id:self.main.id};
				self.listen = self.main.connect('alpha', {metadata:meta});
				//self.listen.metadata = meta;
				self.listen.on('open', function() {
					self.log('connected main to alpha');
					self.alphaReady = true;
					self.broadcast('hello from ' + self.name);

					// TODO emit deorbit events as well
					self.emit('orbit', 'alpha');
				});
				self.listen.on('data', function(data) {
					// check for malformed packet
					if(!data.msg || !data.from || !data.to || !data.path) return;
					data.path.push(self.name);

					self.message(data);
				})
				self.listen.on('close', function() {
					self.alphaReady = false;
				});
				self.listen.on('error', function() {
					self.alphaReady = false;
				});
			});
		});
		self.main.on('close', function() {
			self.mainReady = false;
		});
		self.main.on('error', function() {
			self.mainReady = false;
		});
	};

	Planet.prototype.broadcast = function(data) {
		if(this.mainReady && this.alphaReady) {
			// replace with peers.forEach(send)
			// currently only talks to the alpha node
			this.listen.send({msg: data, from: this.name, to:'broadcast', path:[this.name]});
		} else {
			this.log('not ready to send messages');
		}
	};

	Planet.prototype.message = function(msg) {
		this.messageHistory.push(msg);
		this.emit('msg', msg);
		this.log(msg.from + ': ' + msg.msg, msg.path);
	};

	Planet.prototype.ready = function() {
		return this.mainReady && this.alphaReady;
	};

	Planet.prototype.log = function() {
		var msg = Array.prototype.slice.call(arguments);
		msg.unshift(this.name + ':');
		console.log.apply(console, msg);
	};

	Planet.prototype.chooseName = function(corpus) {
		var pos = Math.floor(corpus.length * Math.random());
		this.name = corpus[pos] + '_' + Math.floor(Math.random() * 10000).toString(Math.floor(Math.random() * 30+2)) ;
	};

	Planet.prototype.getPeers = function() {
		return this.connectedPeers;
	};

	Planet.prototype.getMessages = function() {
		return this.messageHistory;
	};

	return Planet;
});