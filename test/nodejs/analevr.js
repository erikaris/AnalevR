var _ = require("lodash");
var uuid = require('uuidv4');
var XMLHttpRequest = require('xhr2');

if (!String.prototype.format) {
	String.prototype.format = function() {
		var a = this;
		for (var k in arguments) {
			a = a.replace(new RegExp("\\{" + k + "\\}", 'g'), arguments[k]);
		}
		return a
	};
}

var AnalevR = {
    session_id: "", 
    webdis_url: "", 
    ajax_post: (options) => {
      var options = _.extend({}, {
        'url': null, 
        'message': {}, 
        'contentType': 'application/x-www-form-urlencoded', 
        'onFinish': () => {}, 
        'onSuccess': (responseText, request) => {}, 
        'onFailed': (responseText, request) => {},  
      }, options);
  
      if(typeof options.message =='object') options.message = $.param(options.message);
  
      var xhr = new XMLHttpRequest();
      xhr.url = options.url;
      xhr.payload = options.message;
      xhr.open('POST', options.url);
      xhr.setRequestHeader('Content-Type', options.contentType || 'application/x-www-form-urlencoded');
      xhr.onload = function(_xhr) {
        if (_xhr.currentTarget.status === 200) {
          options.onSuccess(_xhr.currentTarget.responseText, {
            url: _xhr.currentTarget.url, 
            payload: _xhr.currentTarget.payload
          });
          options.onFinish();
        } else {
          options.onFailed(_xhr.currentTarget.responseText, {
            url: _xhr.currentTarget.url, 
            payload: _xhr.currentTarget.payload
          });
          options.onFinish();
        }
      };
      xhr.send(options.message);
    }, 
  
    ajax_get: (options) => {
      var options = _.extend({}, {
        'url': null, 
        'onFinish': () => {}, 
        'onSuccess': (responseText, request) => {}, 
        'onFailed': (responseText, request) => {},  
      }, options);
  
      var xhr = new XMLHttpRequest();
      xhr.url = options.url;
      xhr.open('GET', options.url);
      xhr.onload = function(_xhr) {
        if (_xhr.currentTarget.status === 200) {
          options.onSuccess(_xhr.currentTarget.responseText, {
            url: _xhr.currentTarget.url, 
          });
          options.onFinish();
        } else {
          options.onFailed(_xhr.currentTarget.responseText, {
            url: _xhr.currentTarget.url, 
          });
          options.onFinish();
        }
      };
      xhr.send();
    }, 
  
    _send_request: (options) => {
      var options = _.extend({}, {
        'message': '', 
        'onFinish': () => {}, 
        'onSuccess': (responseText, request) => {}, 
        'onFailed': (responseText, request) => {},  
      }, options);
  
      AnalevR.ajax_post({
        'url': AnalevR.webdis_url, 
        'message': 'LPUSH/req/' + encodeURIComponent(options.message), 
        'contentType': 'text/plain', 
        'onFinish': options.onFinish, 
        'onSuccess': options.onSuccess, 
        'onFailed': options.onFailed,  
      });
    }, 
  
    _send_command_request: (options) => {
      var options = _.extend({}, {
        'requestId': null, 
        'command': '', 
        'onFinish': () => {}, 
        'onSuccess': (responseText, request) => {}, 
        'onFailed': (responseText, request) => {},  
      }, options);
  
      var message = JSON.stringify({
          'sess': AnalevR.session_id, 'id': options.requestId, 'cmd': options.command 
      });
  
      AnalevR._send_request({
        'message': message, 
        'onFinish': options.onFinish, 
        'onSuccess': options.onSuccess, 
        'onFailed': options.onFailed, 
      });
    }, 
  
    _send_rpc_request: (options) => {
      var options = _.extend({}, {
        'requestId': null, 
        'function': '', 
        'params': [], 
        'onFinish': () => {}, 
        'onSuccess': (responseText, request) => {}, 
        'onFailed': (responseText, request) => {},  
      }, options);
  
      var message = JSON.stringify({
          'sess': AnalevR.session_id, 'id': options.requestId, 'func': options.function, 'args': options.params 
      });
  
      AnalevR._send_request({
        'message': message, 
        'onFinish': options.onFinish, 
        'onSuccess': options.onSuccess, 
        'onFailed': options.onFailed, 
      });
    }, 
  
    _get_response: (options) => {
      var options = _.extend({}, {
        'requestId': null,
        'onFinish': () => {}, 
        'onSuccess': (message, request) => {}, 
        'onFailed': (message, request) => {},  
      }, options);
  
      AnalevR.ajax_post({
        'url': AnalevR.webdis_url, 
        'message': 'BRPOP/resp-{0}/timeout/30'.format(options.requestId), 
        'contentType': 'text/plain', 
        'onFinish': options.onFinish, 
        'onSuccess': (message, request) => {
          var jResp = JSON.parse(message);
          var body = jResp['BRPOP'];
          options.onSuccess(body ? body[1] : null, request);
        }, 
        'onFailed': options.onFailed,  
      });
    }, 
  
    _get_progress: (options) => {
      var options = _.extend({}, {
        'requestId': null,
        'onFinish': () => {}, 
        'onSuccess': (message, request) => {}, 
        'onFailed': (message, request) => {},  
      }, options);
  
      var get_length = () => {
        return new Promise((resolve, reject) => {
          AnalevR.ajax_post({
            'url': AnalevR.webdis_url, 
            'message': 'LLEN/log.{0}'.format(options.requestId), 
            'contentType': 'text/plain', 
            'onSuccess': (message, request) => {
              var jResp = JSON.parse(message);
              var len = parseInt(jResp['LLEN']);
              resolve(len > 10000 ? 10000 : len);
            }, 
            'onFailed': options.onFailed,  
          });
        });
      }
  
      var yield_messages = (len) => {
        return new Promise((resolve, reject) => {
          if (len > 0) {
            AnalevR.ajax_post({
              'url': AnalevR.webdis_url, 
              'message': 'LRANGE/log.{0}/0/{1}'.format(options.requestId, len-1), 
              'contentType': 'text/plain', 
              'onSuccess': (message, request) => {
                var jResp = JSON.parse(message);
                var messages = jResp['LRANGE'];
                _.takeRight(messages, 5).forEach((m) => options.onSuccess(m));
              }, 
              'onFailed': options.onFailed,  
              'onFinish': () => {
                resolve(len);
              }
            });
          } else {
            resolve(len);
          }
        });
      }
  
      var trim = (len) => {
        if (len  > 0) {
          AnalevR.ajax_post({
            'url': AnalevR.webdis_url, 
            'message': 'LTRIM/log.{0}/{1}/-1'.format(options.requestId, len), 
            'contentType': 'text/plain', 
            'onFinish': options.onFinish, 
          });
        } else {
          options.onFinish();
        }
      }
  
      get_length().then(yield_messages).then(trim);
    }, 
  
    call: (options) => {
      var options = _.extend({}, {
        'function': null, 
        'params': [], 
        'retry': 1, 
        'maxRetry': 20, 
        'requestId': uuid(),       
        'onProgress': (message) => {}, 
        'onFinish': () => {}, 
        'onSuccess': (responseText) => {}, 
        'onFailed': (responseText) => {}, 
      }, options);
  
      var isFinished = false;
  
      var responseOptions = {
        'requestId': options.requestId,
        'onFinish': options.onFinish, 
        'onSuccess': (message) => {
          var message = JSON.parse(message);
          if (message.success) {
            options.onSuccess(message.data);
            options.onFinish();
          } else {
            options.onFailed(message.data);
            options.onFinish();
          }
  
          isFinished = true;
        }, 
        'onFailed': (message) => {
          if (options.retry <= options.maxRetry) {
            console.log(options.requestId, message, 'Retrying #{0}'.format(options.retry));
            AnalevR._get_response(responseOptions);
          } else {
            options.onFailed('Maximum {0} retry is reached.'.format(options.maxRetry));
            options.onFinish();
            isFinished = true;
          }
  
          options.retry = options.retry + 1;
        },  
      };
  
      var wait_for_progress = () => {
        setTimeout(() => {
          if (! isFinished) {
            AnalevR._get_progress({
              'requestId': options.requestId,
              'onSuccess': options.onProgress, 
              'onFinish': wait_for_progress
            });
          }
        }, 500);
      }
  
      AnalevR._send_rpc_request({
        'requestId': options.requestId, 
        'function': options.function, 
        'params': options.params, 
        'onSuccess': (message, request) => {
          AnalevR._get_response(responseOptions);
        }, 
        'onFailed': options.onFailed, 
        'onFinish': () => {
          wait_for_progress();
        }
      });
    }, 
  
    eval: (options) => {
      var options = _.extend({}, {
        'command': '', 
        'retry': 1, 
        'maxRetry': 20, 
        'requestId': uuid(),       
        'onProgress': (message) => {}, 
        'onFinish': () => {}, 
        'onSuccess': (responseText, request) => {}, 
        'onFailed': (responseText, request) => {}, 
      }, options);
  
      var isFinished = false;
  
      var responseOptions = {
        'requestId': options.requestId,
        'onFinish': options.onFinish, 
        'onSuccess': (message) => {
          var message = JSON.parse(message);
          if (message.success) {
            options.onSuccess(message.data);
            options.onFinish();
          } else {
            options.onFailed(message.data);
            options.onFinish();
          }
          
          isFinished = true;
        }, 
        'onFailed': (message) => {
          if (options.retry <= options.maxRetry) {
            console.log(options.requestId, message, 'Retrying #{0}'.format(options.retry));
            AnalevR._get_response(responseOptions);
          } else {
            options.onFailed('Maximum {0} retry is reached.'.format(options.maxRetry));
            options.onFinish();
            isFinished = true;
          }
  
          options.retry = options.retry + 1;
        },  
      };
  
      var wait_for_progress = () => {
        setTimeout(() => {
          if (! isFinished) {
            AnalevR._get_progress({
              'requestId': options.requestId,
              'onSuccess': options.onProgress, 
              'onFinish': wait_for_progress
            });
          }
        }, 500);
      }
  
      AnalevR._send_command_request({
        'requestId': options.requestId, 
        'command': options.command, 
        'onSuccess': (message, request) => {
          AnalevR._get_response(responseOptions);
        }, 
        'onFailed': options.onFailed, 
        'onFinish': () => {
          wait_for_progress();
        }
      });
    }, 
  
    eval_file: (options) => {
      var options = _.extend({}, {
        'function': 'module.file.id.eval', 
        'id': null, 
        'params': {}, 
        'onProgress': () => {}, 
        'onFinish': () => {}, 
        'onSuccess': () => {}, 
        'onFailed': () => {},  
      }, options);
  
      Object.keys(options.params).forEach((k) => {
        options.params[k] = options.params[k] + "";
      });
  
      AnalevR.call({
        function: options.function, 
        params: [options.id, options.params], 
        onProgress: options.onProgress, 
        onSuccess: (message) => {
          options.onSuccess(message);
          options.onFinish();
        }, 
        onFailed: (resp) => {
          options.onFailed(resp);
          options.onFinish();
        }
      });
    }
  }

  module.exports = AnalevR;