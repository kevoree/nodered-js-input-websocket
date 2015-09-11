var WebSocket = require('ws');

function Client(url) {
  this.url = url;
  this.client = null;
  this.timeout = null;
}

Client.prototype.connect = function (onmessage) {
  var that = this;
  var id = (1+Math.random()*4294967295).toString(16);

  this.client = new WebSocket(this.url);

  function reconnect() {
    clearTimeout(that.timeout);
    that.timeout = setTimeout(function () {
      that.connect(onmessage);
    }, 3000);
  }

  this.client.addEventListener('message', function (msg) {
    if (msg.data) {
      // browser compatibility
      msg = msg.data;
    }
    onmessage(id, msg);
  });

  this.client.addEventListener('close', reconnect);
  this.client.addEventListener('error', reconnect);
};

Client.prototype.close = function () {
  if (this.client) {
    this.client.close();
  }
};

module.exports = Client;
