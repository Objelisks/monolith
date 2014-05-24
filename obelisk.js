// Messenger node

// receives messages from other nodes and displays them




// will need to listen on multiple ports:
//  port at: ui
//  port lots: peer conxn
define('obelisk', ['planet', 'peer'], function(planet, peerjs) {
	var corpus = ['courier', 'messenger', 'carrier', 'crier', 'postmaster', 'notetaker', 'deliverer', 'budare'];
	var obelisk;

	function init() {
		obelisk = new planet.Planet(corpus);
	}

	return {
		'init': init
	};
});