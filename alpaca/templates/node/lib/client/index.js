var request = require("request");

var client = module.exports;

client.AuthHandler = require("./auth.js");
client.ErrorHandler = require("./error.js")

client.RequestHandler = require("./request.js")
client.ResponseHandler = require("./response.js")

/*
 * Main HttpClient which is used by Api classes
 */
client.HttpClient = function (auth, options) {
{{if .Api.authorization.oauth}}
  if (typeof auth == "string") {
    auth = { "access_token": auth };
  }
{{end}}
  this.options = {
    "base": "{{.Api.base}}",{{with .Api.version}}
    "api_version": "{{.}}",{{end}}
    "user_agent": "alpaca/0.1.0 (https://github.com/pksunkara/alpaca)"
  };

  for (var key in options) {
    this.options[key] = options[key];
  }

  this.headers = {
    "User-Agent": this.options['user_agent']
  };

  if (this.options['headers']) {
    for (var key in this.options['headers']) {
      this.headers[key] = this.options['headers'][key];
    }

    delete this.options['headers'];
  }

  return this;
}

client.HttpClient.prototype.get = function (path, params, options, callback) {
  if (typeof options == "function") {
    callback = options;
    options = {};
  }

  options['query'] = params;

  this.request(path, {}, 'GET', options, callback);
};

client.HttpClient.prototype.post = function (path, body, options, callback) {
  if (typeof options == "function") {
    callback = options;
    options = {};
  }

  this.request(path, body, 'POST', options, callback);
};

client.HttpClient.prototype.patch = function (path, body, options, callback) {
  if (typeof options == "function") {
    callback = options;
    options = {};
  }

  this.request(path, body, 'PATCH', options, callback);
};

client.HttpClient.prototype.delete = function (path, body, options, callback) {
  if (typeof options == "function") {
    callback = options;
    options = {};
  }

  this.request(path, body, 'DELETE', options, callback);
};

client.HttpClient.prototype.put = function (path, body, options, callback) {
  if (typeof options == "function") {
    callback = options;
    options = {};
  }

  this.request(path, body, 'PUT', options, callback);
};

/*
 * Intermediate function which does three main things
 *
 * - Transforms the body of request into correct format
 * - Creates the requests with give parameters
 * - Returns response body after parsing it into correct format
 */
client.HttpClient.prototype.request = function (path, body, method, options, callback) {
  var headers = {}, self = this;

  if (options['headers']) {
    headers = options['headers'];
    delete options['headers'];
  }

  var reqobj = {
    'url': path,
    'qs': options['query'],
    'method': method,
    'headers': headers
  };

  reqobj = this.setBody(reqobj, body, options);

  reqobj = this.createRequest(reqobj, function(err, response, body) {
    if (err) {
      return callback(err);
    }

    self.getBody(response, body, function(err, response, body) {
      if (err) {
        return callback(err);
      }

      client.ErrorHandler(response, body, function(err, response, body) {
        if (err) {
          return callback(err);
        }

        callback(null, body, response.statusCode, response.headers);
      });
    });
  });
};

/*
 * Creating a request with the given arguments
 *
 * If api_version is set, appends it immediately after host
 */
client.HttpClient.prototype.createRequest = function (reqobj, callback) {
  var version = (this.options['api_version'] ? '/' + this.options['api_version'] : '');
{{if .Api.response.suffix}}
  // Adds a suffix (".html", ".json") to url
  var suffix = (isset($options['response_type']) ? $options['response_type'] : "{{.Api.response.formats.default}}");
  reqobj['url'] = reqobj['url'] + '.' + suffix;
{{end}}
  reqobj['url'] = this.options['base'] + version + path;

  for (var key in this.headers) {
    if (!reqobj['headers'][key]) {
      reqobj['headers'][key] = this.headers[key];
    }
  }

  request(reqobj, callback);
};

/*
 * Get response body in correct format
 */
client.HttpClient.prototype.getBody = function (response, body, callback) {
  client.ResponseHandler.getBody(response, body, callback);
};

/*
 * Set request body in correct format
 */
client.HttpClient.prototype.setBody = function (request, body, options) {
  client.RequestHandler.setBody(request, body, options);
};