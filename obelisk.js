// Messenger node

// receives messages from other nodes and displays them




// will need to listen on multiple ports:
//  port at: ui
//  port lots: peer conxn
define('obelisk', ['planet', 'd3'], function(Planet, d3) {
	var corpus = ['courier', 'messenger', 'carrier', 'postmaster', 'notetaker', 'deliverer', 'budare'];

	var Obelisk = function() {
		var self = this;
		this.planet = new Planet(corpus);
		var svg = d3.select('#graph');
		this.graphNodes = svg.selectAll('.node');
		this.graphLinks = svg.selectAll('.link');

		this.peerGraph = d3.layout.force()
			.size([500, 300])
			.linkDistance(50)
      .gravity(0.05)
			.charge(-60)
			.on('tick', tick.bind(this))
			.start();
		this.nodesMap = {};

		this.planet.on('msg', handleMessage.bind(this));
		d3.select('#messager').on('submit', messageSubmit.bind(this));
	};

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

	var handleMessage = function(msg) {
		var self = this;
		var path = msg.path;

		var allMessages = this.planet.getMessages();
		d3.select('#messages').selectAll('div').data(allMessages)
			.enter().append('div')
			.attr('class', 'msg')
			.text(function(d) { return d.from + ': ' + d.msg; });

		var nodes = this.peerGraph.nodes();
		var newNodes = path.map(function(nodeName) { return {meta: { name: nodeName } }; });
		var nodeData = d3.nest()
			.key(function(d) { return d.meta.name; })
			.map(d3.merge([nodes, newNodes]), d3.map).values().map(function(a) { return a[0]; });

		self.graphNodes = self.graphNodes.data(nodeData);
		self.graphNodes
			.enter().append('circle')
			.attr('class', 'node')
			.attr('r', 15)
			.each(function(newNode) { nodes.push(newNode); self.nodesMap[newNode.meta.name] = newNode; })
			.call(self.peerGraph.drag);
		self.graphNodes
			.exit().remove();

		var links = this.peerGraph.links();
		var newLinks = d3.pairs(path).map(function(pair) { return { source:self.nodesMap[pair[0]], target:self.nodesMap[pair[1]] }; });
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
	};

	var messageSubmit = function() {
		d3.event.preventDefault();
		var msgBox = d3.select('#messageBox');
		var messageContent = msgBox.property('value');
		this.broadcast(messageContent);
		msgBox.property('value', '');
	};

	Obelisk.prototype.broadcast = function(msg) {
		this.planet.broadcast(msg);
	};

	return Obelisk;
});