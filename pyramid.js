// todo and calendar

/*
Things:
  calendar
    switch between week, month, year views
      transitions
    ability to add events
      storage of events
      color days based on events
  todo list
    lists upcoming events
    lists tasks
    organize tasks by project
      milestones/subtasks
      highlight days on calendar
  the concept of scrolling in the z axis

*/
define('pyramid', ['planet', 'd3'], function(Planet, d3) {
  var selected = null;
  var lastSelected = null;
  
  var Pyramid = function() {
    var self = this;
    self.scrollDistance = 0;
    self.scrollDate = new Date();
    updateCalendar(self.scrollDate, 0);
    d3.select('body').on('wheel', function() {
      d3.event.preventDefault();
      var amount = d3.event.deltaY;
      self.scrollDistance += amount;
      if(Math.abs(self.scrollDistance) > 50.0) {
        self.scrollDate = d3.time.week.offset(self.scrollDate, Math.sign(self.scrollDistance));
        self.scrollDistance = 0;
        updateCalendar(self.scrollDate, Math.sign(amount));
      }
    });
  };
  
  var updateCalendar = function(startTime, direction) {
    var startDate = d3.time.week.floor(startTime);
    var formatter = d3.time.format('%B %e');
    var headerFormatter = d3.time.format('%A');
    
    var header = d3.select('#calendar_header').selectAll('div')
      .data(d3.time.days(startDate, d3.time.week.offset(startDate, 1)));
    header.enter().append('div')
        .attr('class', 'header_day')
        .text(function(d) { return headerFormatter(d); });
    
    var weeks = d3.select('#time').selectAll('.week')
      .data(d3.time.weeks(startDate, d3.time.month.offset(startDate, 1)));
    weeks.enter().append('div')
      .classed('week', true)
      .style('position', 'relative')
      .style('opacity', 0);
    weeks.exit()/*
      .style('display', 'none')
      .style('width', function() { return this.clientWidth; })
      .style('height', '0px')
      .style('top', function() { return (this.clientHeight*direction)+'px'; })
      .transition().duration(200)
      .style('opacity', 0)
      .style('top', '0px')*/
      .remove();
    weeks
      .style('top', function() { return (this.clientHeight*direction)+'px'; })
      /*.style('opacity', function(d, i) {
        if(direction < 0)
          return i === 0 ? 0.0 : 1.0;
        else
          return i === weeks.size()-1 ? 0.0 : 1.0;
        })*/
      .interrupt()
      .transition()
      .duration(200)
      .ease('linear-in-out')
      .style('opacity', 1)
      .style('top', '0px');
    
    var days = weeks.selectAll('.day').data(function(d) {
        return d3.time.days(d, d3.time.week.offset(d, 1));
      });
    days.enter().append('div')
      .classed('day', true);
    days.exit();
    days
      .text(function(d) { return formatter(d); })
      .on('click', function(d) {
        d3.select('.selected').classed('selected', false);
        selected = d;
        d3.event.target.classList.add('selected');
      })
      .classed('selected', function(d) { if(!selected) return false; return d.getTime() == selected.getTime(); });
    
  };
  
  return Pyramid;
});