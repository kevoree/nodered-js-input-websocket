var WebSocket = require('ws');

function Server(options) {
  this.options = options;
  this.server = null;
}

Server.prototype.listen = function (onmessage) {
  if (this.options && this.options.path) {
    if (this.options.path.substr(0, 1) !== '/') {
      this.options.path = '/' + this.options.path;
    }
  }
  this.server = new WebSocket.Server(this.options);
  this.server.on('connection', function (client) {
    var id = (1+Math.random()*4294967295).toString(16);
    client.on('message', function (msg) {
      onmessage(id, msg);
    });
  });
};

Server.prototype.close = function () {
  if (this.server) {
    this.server.close();
  }
};

module.exports = Server;
