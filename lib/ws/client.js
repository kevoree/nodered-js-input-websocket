var WebSocket = require('ws');

function Client(url) {
  this.url = url;
  this.client = null;
  this.timeout = null;
  this.closing = false;
}

Client.prototype.connect = function (onmessage) {
  var that = this;
  var id = (1+Math.random()*4294967295).toString(16);

  this.client = new WebSocket(this.url);

  function reconnect() {
    clearTimeout(that.timeout);
    if (!that.closing) {
      that.timeout = setTimeout(function () {
        that.connect(onmessage);
      }, 3000);
    }
  }

  this.client.on('message', function (msg) {
    if (msg.data) {
      // browser compatibility
      msg = msg.data;
    }
    onmessage(id, msg);
  });

  this.client.on('close', reconnect);
  this.client.on('error', reconnect);
};

Client.prototype.close = function () {
  if (this.client) {
    this.closing = true;
    this.client.close();
  }
};

module.exports = Client;
