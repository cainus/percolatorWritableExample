var _ = require('underscore');
var Resource = require('resorcery').resource;
var Muster = require('muster');

exports.handler = {
  GET : function(req, res){
    var that = this;
    var links = this.uri.links();
    var artists = _.extend(this.app.artists);
    artists = _.map(artists, function(artist){
      artist._links = { self : that.uri.self() + '/' + artist.id };
      return artist;
    });
    this.repr({collection : artists, _links : links});
  },

  // TODO: make this work.  maybe it does.
  // switch to a uuid mode
  POST : function(req, res){
    console.log(req.body);
    var validator = new Muster();
    validator.mustHaveKeys(["name"]);
    try {
      validator.check(req.body);
    } catch(ex){
      this.status.badRequest(ex);
    }
    var id = this.app.artists.length;
    this.app.artists[id] = req.body;
    // TODO: need a this.redirect!
    //res.redirect(this.uri.self());
  }

};

var getArtistById = function(artists, id){
  return artists[parseInt(id, 10)];
};

exports.member = new Resource({

  fetch : function(req, cb){
    var artist = this.app.artists[parseInt(this.uri.params().artists, 10)];
    if (!artist){
      return cb(true); // error!
    }
    cb(null, artist);
  },

  GET : function(req, res){
    var artist = req.resource.fetched;
    var links = this.uri.links();
    artist = _.extend(artist, {_links : links});
    this.repr( artist );
  },

  DELETE : function(req, res){
    console.log("in delete");
    var artist = req.resource.fetched;
    if (!artist){
      return this.status.notFound(this.app.self());
    }
    var id = this.uri.param('artists');
    delete this.app.artists[id];
    res.end();
  },

  // TODO a PUT without "Content-Type: application/json" should throw a 406 Not Acceptable error
  // This will 400 if it doesn't get the right content-type
  PUT : function(req, res){
    console.log(req.body);
    req.body.id += '';
    var validator = new Muster();
    validator.mustHaveKeys(["id", "name"])
             .key("id").mustEqual(this.uri.params().artists + '')
             .key("id").mustMatch(/[0-9]+/);
    try {
      validator.check(req.body);
    } catch(ex){
      this.status.badRequest(ex);
    }
    this.app.artists[parseInt(req.body.id, 10)] = req.body; // the update

    var artist = this.app.artists[parseInt(req.body.id, 10)];
    var links = this.uri.links();
    artist = _.extend(artist, {_links : links});
    this.repr( artist );
  }

});

