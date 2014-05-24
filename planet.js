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
		console.log(obelisk.name + ' initializing...');
		this.peers = [];
		var peer = new peerjs.Peer({key:'vm4nrce6ilfpqfr'});
		peer.on('open', function(id) {
			console.log('i am ' + id);
		});
	};

	Planet.prototype.chooseName = function(corpus) {
		var pos = Math.floor(corpus.length * Math.random());
		this.name = '@' + corpus[pos] + '_' + Math.floor(Math.random() * 100).toString('4') ;
	};

	Planet.prototype.getPeers = function() {

	};

	return {
		'Planet': Planet
	};
});