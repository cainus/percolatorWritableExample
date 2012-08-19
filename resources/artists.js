var _ = require('underscore');
var Resource = require('resorcery').resource;
var Muster = require('muster');


var getMaxId = function(db){
  var max = 0;
  _.each(db, function(v, k){
    var id = parseInt(k, 10);
    if (max < id){
      max = id;
    }
  });
  return max;
};


exports.handler = {
  GET : function(req, res){
    var that = this;
    var artists = _.extend(this.app.artists);
    artists = _.map(artists, function(artist){
      artist._links = { self : that.uri.get('artists*', {artists : artist.id}) };
      return artist;
    });
    this.repr({collection : artists, _links : this.uri.links()});
  },

  POST : function(req, res){
    console.log(req.body);
    var validator = new Muster();
    validator.mustHaveKeys(["name"]);
    try {
      validator.check(req.body);
    } catch(ex){
      this.status.badRequest(ex);
    }
    var id = (getMaxId(this.app.artists) + 1) + '';
    req.body.id = id;
    this.app.artists[id] = req.body;
    this.status.created(this.uri.self());
  }

};

var getArtistById = function(artists, id){
  return artists[parseInt(id, 10)];
};

exports.member = new Resource({

  fetch : function(req, cb){
    var artist = this.app.artists[this.uri.param('artists')];
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

  PUT : function(req, res){
    console.log(req.body);
    req.body.id += '';
    var validator = new Muster();
    validator.mustHaveKeys(["id", "name"])
             .key("id").mustEqual(this.uri.param('artists'))
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

