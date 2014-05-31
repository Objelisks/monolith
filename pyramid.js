// todo and calendar

define('pyramid', ['planet', 'd3'], function(Planet, d3) {
  var Pyramid = function() {
    var self = this;
    var things = d3.select('#things');
    var formatter = d3.time.format('%A');
    
    things.selectAll('div').data(d3.time.week.range(new Date(), d3.time.month.offset(new Date(), 1)))
      .enter().append('div')
        .attr('class', 'week')
        .selectAll('div').data(function(d) {
          return d3.time.day.range(d, d3.time.week.offset(d, 1));
        }).enter().append('div')
        .attr('class', 'day')
        .text(function(d) { return formatter(d); });
  };
  
  return Pyramid;
});