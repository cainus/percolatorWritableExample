exports.handler = {
  GET : function(req, res){
    this.repr(this.uri.links());
  }


};
