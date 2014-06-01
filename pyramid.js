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
  var Pyramid = function() {
    var self = this;
    self.scrollDistance = 0;
    self.scrollDate = new Date();
    updateCalendar(self.scrollDate);
    d3.select('body').on('wheel', function() {
      d3.event.preventDefault();
      var amount = d3.event.deltaY;
      self.scrollDistance += amount;
      if(Math.abs(self.scrollDistance) > 50.0) {
        self.scrollDate = d3.time.week.offset(self.scrollDate, Math.sign(self.scrollDistance));
        self.scrollDistance = 0;
        updateCalendar(self.scrollDate);
      }
    });
  };
  
  var updateCalendar = function(startTime) {
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
      .attr('class', 'week');
    weeks.exit().remove();
    d3.select('#time').selectAll('.week')
      .style('position', 'relative')
      .style('top', '100px')
      .interrupt()
      .transition()
      .duration(100)
      .style('top', '0px');
    
    var days = weeks.selectAll('.day').data(function(d) {
        return d3.time.days(d, d3.time.week.offset(d, 1));
      }, function(d) { return d.toString(); });
    days.enter().append('div')
      .attr('class', 'day');
    days.exit().remove();
    days.text(function(d) { return formatter(d); });
    
  };
  
  return Pyramid;
});