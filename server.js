var Percolator = require('Percolator');
var express = require('express');

var artists = {
  '0' : {name : "Joe Strummer", id : '0'},
  '1' : {name : "Neil Young", id : '1' },
  '2' : {name : "Joey Ramone", id : '2'},
  '3' : {name : "Bruce Springsteen", id : '3'}
};


var server = new Percolator({artists : artists});
server.routeDirectory(__dirname + '/resources', function(err){
  if (!!err) {console.log(err);}
  server.listen(function(err){
    console.log('server is listening on port ', server.port);
  });
});


