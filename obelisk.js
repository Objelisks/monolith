// Messenger node

// receives messages from other nodes and displays them




// will need to listen on multiple ports:
//  port at: ui
//  port lots: peer conxn
define('obelisk', ['planet', 'd3'], function(Planet, d3) {
	var corpus = ['courier', 'messenger', 'carrier', 'postmaster', 'notetaker', 'deliverer', 'budare'];

	var tick = function() {
		this.graphNodes
			.attr('cx', function(d) { return d.x; })
			.attr('cy', function(d) { return d.y; });
		this.graphLinks
			.attr('x1', function(d) { return d.source.x; })
			.attr('x2', function(d) { return d.target.x; })
			.attr('y1', function(d) { return d.source.y; })
			.attr('y2', function(d) { return d.target.y; });
	};

	var mousedown = function() {

	};

	var Obelisk = function() {
		var self = this;
		this.planet = new Planet(corpus);
		var width = 500;
		var height = 500;
		var svg = d3.select('body').append('svg')
			.attr('width', width)
			.attr('height', height)
			.on('mousedown', mousedown);
		this.graphNodes = svg.selectAll('.node');
		this.graphLinks = svg.selectAll('.link');

		this.peerGraph = d3.layout.force()
			.size([width, height])
			.linkDistance(20)
    		.gravity(.05)
			.charge(-60)
			.on('tick', tick.bind(this))
			.start();
		var nodes = this.peerGraph.nodes();
		var links = this.peerGraph.links();
		var nodesMap = {};

		this.planet.on('msg', function(msg) {
			var path = msg.path;
			var newNodes = path.map(function(nodeName) { return {meta: { name: nodeName } }; });
			var nodeData = d3.nest()
				.key(function(d) { return d.meta.name; })
				.map(d3.merge([nodes, newNodes]), d3.map).values().map(function(a) { return a[0]; });

			self.graphNodes = self.graphNodes.data(nodeData);
			self.graphNodes
				.enter().append('circle')
				.attr('class', 'node')
				.attr('r', 5)
				.each(function(newNode) { nodes.push(newNode); nodesMap[newNode.meta.name] = newNode; })
				.call(self.peerGraph.drag);
			self.graphNodes
				.exit().remove();

			var newLinks = d3.pairs(path).map(function(pair) { return { source:nodesMap[pair[0]], target:nodesMap[pair[1]] }; });
			var linkData = d3.nest()
				.key(function(d) { return d.source.meta.name + ',' + d.target.meta.name; })
				.map(d3.merge([links, newLinks]), d3.map).values().map(function(a) { return a[0]; });

			self.graphLinks = self.graphLinks.data(linkData);
			self.graphLinks
				.enter().insert('line', '.node')
				.attr('class', 'link')
				.each(function(newLink) { links.push(newLink); });
			self.graphLinks
				.exit().remove();

			self.peerGraph.start();
		});
	};

	Obelisk.prototype.broadcast = function(msg) {
		this.planet.broadcast(msg);
	};

	return {
		'Obelisk': Obelisk
	};
});