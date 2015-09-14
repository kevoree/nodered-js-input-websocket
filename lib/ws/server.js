var WebSocket = require('ws');

function Server(options) {
  this.options = options;
  this.server = null;
  this.connHandlers = [];
  this.msgHandlers = [];
}

Server.prototype.listen = function (onmessage) {
  var that = this;
  if (this.options && this.options.path) {
    if (this.options.path.substr(0, 1) !== '/') {
      this.options.path = '/' + this.options.path;
    }
  }
  this.server = new WebSocket.Server(this.options);
  console.log('WebSocket server listening at ', this.options);
  this.server.on('connection', function connHandler(client) {
    // that.connHandlers.push(connHandler);
    var id = (1+Math.random()*4294967295).toString(16);
    console.log('new conn', id);
    client.on('message', function msgHandler(msg) {
      // that.msgHandlers.push(msgHandler);
      console.log('new msg', id, msg);
      onmessage(id, msg);
    });
  });
};

Server.prototype.close = function () {
  if (this.server) {
    // this.connHandlers.forEach(function (handler) {
    //   that.server.removeListener('connection', handler);
    // });
    // this.msgHandlers.forEach(function (handler) {
    //   that.server.removeListener('message', handler);
    // });
    // this.connHandlers.length = 0;
    // this.msgHandlers.length = 0;
    this.server.close();
    this.server = null;
    console.log('server closed');
  }
};

module.exports = Server;
