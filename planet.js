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
	uri: "1.2.3.4:1234/hello",
	lastSeen: Date.now()
}
*/
define('planet', [], function() {

	var Planet = function(corpus) {
		this.corpus = corpus;
		this.chooseName(this.corpus);
		console.log('somebody: initializing... i am... ' + this.name);
		this.peers = {};
		this.hosts = {};
		this.mainReady = false;
		this.alphaReady = false;

		this.inititateConnection();
	};

	Planet.prototype.inititateConnection = function() {
		var self = this;
		var send = function(data) {
			return function(conn) {
				conn.send(data);
			}
		};
		var createAlpha = function(callback) {
			var alpha = new Peer('alpha', {key:'vm4nrce6ilfpqfr'});
			alpha.on('open', function() {
				console.log('created alpha');
				var alphaConns = [];
				alpha.on('connection', function(conn) {
					self.log('alpha: new connection');
					alphaConns.push(conn);
					conn.on('data', function(data) {
						self.log('alpha:', data);
						alphaConns.forEach(send(data));
					});
				});
				callback();
			});
			alpha.on('error', function(err) {
				self.log('alpha error:', err);
				callback();
			});
			alpha.on('close', function() {
				self.log('alpha closed');
			});
		};
		self.main = new Peer({key:'vm4nrce6ilfpqfr'});
		self.main.on('open', function(id) {
			console.log('main created: ' + id);
			self.main.on('connection', function(conn) {
				self.log('main connection:', conn);
			});
			self.mainReady = true;
			createAlpha(function() {
				self.log('connecting main to alpha');
				self.alpha = self.main.connect('alpha', {metadata:{name:self.name, id:self.main.id}});
				self.alpha.on('open', function() {
					self.log('connected main to alpha');
					self.alphaReady = true;
					self.broadcast('hello from ' + self.name);
				});
				self.alpha.on('data', function(data) {
					self.log('alpha: from ' + data.from + ': ' + data.msg);
				})
				self.alpha.on('close', function() {
					self.alphaReady = false;
				});
				self.alpha.on('error', function() {
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
			this.alpha.send({msg: data, from: this.name});
		}
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

	return {
		'Planet': Planet
	};
});