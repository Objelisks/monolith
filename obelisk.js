// Messenger node

// receives messages from other nodes and displays them




// will need to listen on multiple ports:
//  port at: ui
//  port lots: peer conxn
define('obelisk', ['planet'], function(planet) {
	var corpus = ['courier', 'messenger', 'carrier', 'postmaster', 'notetaker', 'deliverer', 'budare'];

	var Obelisk = function() {
		this.planet = new planet.Planet(corpus);
		//this.peerGraph = d3.newGraph('forceDirected');
		//this.planet.on('orbit', function() {
			//this.peerGraph.addNode();
		//});

	};

	Obelisk.prototype.broadcast = function(msg) {
		this.planet.broadcast(msg);
	};

	return {
		'Obelisk': Obelisk
	};
});