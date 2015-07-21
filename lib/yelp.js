var querystring = require('querystring');
var OAuth = require('oauth').OAuth;

var Client = function(oauth_config) {
  this.oauthToken = oauth_config.token;
  this.oauthTokenSecret = oauth_config.token_secret;
  
  this.oauth = new OAuth(
    null,
    null,
    oauth_config.consumer_key,
    oauth_config.consumer_secret,
    oauth_config.version || "1.0",
    null,
    'HMAC-SHA1'
  );

  return this;
};

var base_url = "http://api.yelp.com/v2/";

Client.prototype.get = function(resource, params, callback) {
  var query_url;
  /*
  If searching with term and ll (latitude and longitude) 
  Example: 
  yelp.search({term: "restaurants", ll: ['41.891519', '-87.638257']}, function(error, data) {
    console.log(error);
    console.log(data);
  });
  */
  if(params.ll && params.term && resource === 'search'){
    query_url = base_url + resource + '?term=' + params.term + '&ll=' + params.ll[0] + ',' + params.ll[1]
  } 
  else {
    query_url = base_url + resource + '?' + querystring.stringify(params)
  }
  return this.oauth.get(
    query_url, 
    this.oauthToken, 
    this.oauthTokenSecret, 
    function(error, data, response) {
      if(!error) data = JSON.parse(data);
      callback(error, data, response);
    }
  );
}

/*
Exampe:
yelp.search({term: "food", location: "Montreal"}, function(error, data) {});
*/
Client.prototype.search = function(params, callback) {
  return this.get('search', params, callback);
}

/*
Example:
yelp.business("yelp-san-francisco", function(error, data) {});
*/
Client.prototype.business = function(id, callback) {
  return this.get('business/' + id, null, callback);
}

/*
Exampe:
yelp.phone_search({phone: "+12223334444"}, function(error, data) {});
*/
Client.prototype.phone_search = function(params, callback) {
  return this.get('phone_search', params, callback);
}

// @see http://www.yelp.com/developers/documentation/v2/authentication
module.exports.createClient = function(oauth_config) {
  return new Client(oauth_config);
};
