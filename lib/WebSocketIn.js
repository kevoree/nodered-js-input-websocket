var AbstractComponent = require('kevoree-entities').AbstractComponent;
var noderedMsgConverter = require('nodered-msg-converter');
var Client = require('./ws/client');
var Server = require('./ws/server');

/**
 * Kevoree component
 * @type {WebSocketIn}
 */
var WebSocketIn = AbstractComponent.extend({
  toString: 'WebSocketIn',

  // if true, then the component will connect to a remote WS server, otherwise
  // attributes port and path must be set to start a server and listen on
  dic_connectTo: {
    optional: false,
    defaultValue: true
  },
  // if true, then the received messages will not be scrapped, otherwise it
  // will only get msg.payload
  dic_entireMsg: {
    optional: false,
    defaultValue: true
  },
  // when connectTo is true, then the url attribute will be used to connect the
  // WS client to the server
  dic_url: {
    datatype: 'string'
  },
  // when connectTo is false, then port & path must be defined to start
  // a server locally and start listening on
  dic_port: {
    datatype: 'number'
  },
  dic_path: {
    datatype: 'string'
  },

  construct: function () {
    this.client = null;
  },

  /**
   * this method will be called by the Kevoree platform when your component has to start
   * @param {Function} done
   */
  start: function (done) {
    var that = this;

    function processMsg(id, data) {
      var msg = noderedMsgConverter(data);
      if (that.dictionary.getBoolean('entireMsg', WebSocketIn.prototype.dic_entireMsg.defaultValue)) {
        if (!msg._session) {
          msg._session = {
            type: 'websocket',
            id: id
          };
        }
      } else {
        msg = msg.payload;
      }

      that.out_out(JSON.stringify(msg));
    }

    if (this.dictionary.getBoolean('connectTo', WebSocketIn.prototype.dic_connectTo.defaultValue)) {
      this.client = new Client(this.dictionary.getString('url'));
      this.client.connect(processMsg);
      this.log.info(this.toString(), '"' + this.getName() + '" connected to WebSocket endpoint ' + this.client.url);
    } else {
      this.server = new Server({
        port: this.dictionary.getNumber('port'),
        path: this.dictionary.getString('path')
      });
      this.server.listen(processMsg);
      this.log.info(this.toString(), '"' + this.getName() + '" WebSocket server listening at 0.0.0.0:' + this.server.options.port + this.server.options.path);
    }
    done();
  },

  /**
   * this method will be called by the Kevoree platform when your component has to stop
   * @param {Function} done
   */
  stop: function (done) {
    if (this.client) {
      this.client.close();
      this.client = null;
    }
    if (this.server) {
      this.server.close();
      this.server = null;
    }
    done();
  },

  update: function (done) {
    this.stop(function () {
      this.start(done);
    }.bind(this));
  },

  out_out: function (msg) {}
});

module.exports = WebSocketIn;
