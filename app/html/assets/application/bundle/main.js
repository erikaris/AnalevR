window.css = require('./main.css');

window.$ = require("jquery");
window.jQuery = require("jquery");
window.React = require("react");
window.ReactDOM = require("react-dom");
window.ReactBootstrap = require("react-bootstrap");
window.ReactBootstrap.Select = require('@highpoint/react-bootstrap-select').default;
window.ReactBootstrap.Slider = require('react-rangeslider').default;
window._ = require("lodash");
window.moment = require('moment');
window.pace = require('pace-js');
window.swal = require('sweetalert');
window.URI = require('uri-js');
window.Papa = require('papaparse');

window.ReactBootstrap.SelectPicker = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return React.createElement(ReactBootstrap.Select, _.extend({}, this.props), 
      (this.props.options || [])
      .map(d => {
        if (!('selected' in d)) d.selected = false;
        return d;
      })
      .map((d, idx) => 
        React.createElement('option', { key: idx, value: d.value, selected: d.selected }, d.label))
    );
  }
}

/**********************************************/

window.AR = {}

/**********************************************/

$(function() {
	Pace.on('done', function() {});
});

if (!window.String.prototype.format) {
	window.String.prototype.format = function() {
		var a = this;
		for (var k in arguments) {
			a = a.replace(new RegExp("\\{" + k + "\\}", 'g'), arguments[k]);
		}
		return a
	};
}

//LZW Compression/Decompression for Strings
window.LZW = {
  compress: function (uncompressed) {
    "use strict";
    // Build the dictionary.
    var i,
      dictionary = {},
      c,
      wc,
      w = "",
      result = [],
      dictSize = 256;
    for (i = 0; i < 256; i += 1) {
      dictionary[String.fromCharCode(i)] = i;
    }
 
    for (i = 0; i < uncompressed.length; i += 1) {
      c = uncompressed.charAt(i);
      wc = w + c;
      //Do not use dictionary[wc] because javascript arrays 
      //will return values for array['pop'], array['push'] etc
       // if (dictionary[wc]) {
      if (dictionary.hasOwnProperty(wc)) {
        w = wc;
      } else {
        result.push(dictionary[w]);
        // Add wc to the dictionary.
        dictionary[wc] = dictSize++;
        w = String(c);
      }
    }
 
    // Output the code for w.
    if (w !== "") {
      result.push(dictionary[w]);
    }
    return result;
  },
 
 
  decompress: function (compressed) {
    "use strict";
    // Build the dictionary.
    var i,
      dictionary = [],
      w,
      result,
      k,
      entry = "",
      dictSize = 256;
    for (i = 0; i < 256; i += 1) {
      dictionary[i] = String.fromCharCode(i);
    }
 
    w = String.fromCharCode(compressed[0]);
    result = w;
    for (i = 1; i < compressed.length; i += 1) {
      k = compressed[i];
      if (dictionary[k]) {
        entry = dictionary[k];
      } else {
        if (k === dictSize) {
          entry = w + w.charAt(0);
        } else {
          return null;
        }
      }
 
      result += entry;
 
      // Add w+entry[0] to the dictionary.
      dictionary[dictSize++] = w + entry.charAt(0);
 
      w = entry;
    }
    return result;
  }
}

window.uuid = function() {
    var seed = Date.now();
    if (window.performance && typeof window.performance.now === "function") {
        seed += performance.now();
    }

    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (seed + Math.random() * 16) % 16 | 0;
        seed = Math.floor(seed/16);

        return (c === 'x' ? r : r & (0x3|0x8)).toString(16);
    });

    return uuid;
}

window.ajax_get = function(url, success, fail) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function() {
        if (xhr.status === 200) {
            resp = JSON.parse(xhr.responseText);
            if (success) success(resp, xhr.responseURL);
        } else {
            fail(xhr.responseText);
        }
    };
    xhr.send();
}

window.ajax_post = function(url, json_data, success, fail) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function() {
        if (xhr.status === 200) {
            resp = JSON.parse(xhr.responseText);
            if (success) success(resp);
        } else {
            if (fail) fail(xhr.responseText);
        }
    };
    xhr.send($.param(json_data));
}

window._send_cmd_request = function(req_id, cmd, callback) {
    var message = JSON.stringify({
            'sess': window.session_id, 'id': req_id, 'cmd': cmd 
        }), 
        redis_cmd = 'LPUSH/req/' + encodeURIComponent(message);

    ajax_get(window.webdis_url + '/' + redis_cmd, function (j_resp, s_url) {
        var parts = s_url.split('/'), 
            data = parts[parts.length-1], 
            data = decodeURIComponent(data), 
            data = JSON.parse(data), 
            req_id = data.id;

        Object.keys(j_resp).forEach(function (op) {
            var val = parseInt(j_resp[op]);
            if (val <= 0) {
                console.log(req_id, 'Command failed to execute')
            } else {
                callback(req_id, s_url);
            }
        });
    });
}

window._send_rpc_request = function(req_id, func_name, params, callback) {
    message = JSON.stringify({
        'sess': window.session_id, 'id': req_id, 'func': func_name, 'args': params
    });

    ajax_get(window.webdis_url + '/LPUSH/req/' + encodeURIComponent(message), function (j_resp, s_url) {
        var parts = s_url.split('/'), 
            data = parts[parts.length-1], 
            data = decodeURIComponent(data), 
            data = JSON.parse(data), 
            req_id = data.id;

        Object.keys(j_resp).forEach(function (op) {
            var val = parseInt(j_resp[op]);
            if (val <= 0) {
                console.log(req_id, 'Command failed to execute')
            } else {
                callback(req_id, s_url);
            }
        });
    });
}

window._wait_for_response = function(req_id) {
    ajax_get(window.webdis_url + '/BRPOP/resp-' + req_id + '/timeout/30', function (j_resp, s_url) {
        var parts = s_url.split('/'), 
            req_id = parts.filter(function (part) {
                if (part.includes('resp-')) return true;
                return false;
            })[0].replace('resp-', '');

        Object.keys(j_resp).forEach(function (op) {
            var resp = j_resp[op];
            if (resp == null) {
                console.log(req_id, 'Timeout. Retrying...');
                _wait_for_response(req_id);
            } else {
                if(req_id in window.req_callbacks) {
                    var req_url = null;
                    if (req_id in window.req_urls) req_url = window.req_urls[req_id];

                    window.req_callbacks[req_id](req_id, resp[1], req_url, s_url);

                    delete window.req_callbacks[req_id];
                    if (req_id in window.req_urls) delete window.req_urls[req_id];
                }
            }
        });
    });
}

window.ajax_post_v2 = function(url, data, content_type) {
    if(typeof data =='object') data = $.param(data);
        
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.url = url;
        xhr.payload = data;
        xhr.open('POST', url);
        xhr.setRequestHeader('Content-Type', content_type || 'application/x-www-form-urlencoded');
        xhr.onload = function(_xhr) {
            if (_xhr.currentTarget.status === 200) {
                resp = _xhr.currentTarget.responseText;
                resolve({
                    request: {
                        url: _xhr.currentTarget.url, 
                        payload: _xhr.currentTarget.payload
                    }, 
                    response: resp
                });
            } else {
                reject({
                    request: {
                        url: _xhr.currentTarget.url, 
                        payload: _xhr.currentTarget.payload
                    }, 
                    response: _xhr.currentTarget.responseText
                });
            }
        };
        xhr.send(data);
    });
}

window.send_request_v2 = function(message) {
    return new Promise((resolve, reject) => {
        ajax_post_v2(window.webdis_url, 'LPUSH/req/' + encodeURIComponent(message), 'text/plain')
            .then((resp) => {
                var s_url = URI.normalize(resp.request.url + '/' + resp.request.payload), 
                    parts = s_url.split('/'), 
                    data = parts[parts.length-1],  
                    data = decodeURIComponent(data),  
                    data = JSON.parse(data),  
                    req_id = data.id, 
                    j_resp = JSON.parse(resp.response);

                Object.keys(j_resp).forEach(function (op) {
                    var val = parseInt(j_resp[op]);
                    if (val <= 0) {
                        // reject(_.assign(data, { reason: 'Command failed to execute' }));
                        reject({
                            request: _.assign(data, { url: s_url }), 
                            reason: 'Command failed to execute'
                        });
                    } else {
                        resolve({
                            request: data
                        });
                    }
                });
            })
            .catch((resp) => {
                console.log(resp);
                var s_url = URI.normalize(resp.request.url + '/' + resp.request.payload), 
                    parts = s_url.split('/'), 
                    data = parts[parts.length-1],  
                    data = decodeURIComponent(data),  
                    data = JSON.parse(data);

                reject({
                    request: data, 
                    reason: resp.response
                });
            });
    });
}

window.send_cmd_request_v2 = function(req_id, cmd) {
    var message = JSON.stringify({
        'sess': window.session_id, 'id': req_id, 'cmd': cmd 
    });

    return send_request_v2(message);
}

window.send_rpc_request_v2 = function(req_id, func_name, params) {
    var message = JSON.stringify({
        'sess': window.session_id, 'id': req_id, 'func': func_name, 'args': params
    });

    return send_request_v2(message);
}

window.wait_for_response_v2 = function(req_id, resolve, reject) {
    ajax_post_v2(window.webdis_url, 'BRPOP/resp-' + req_id + '/timeout/30', 'text/plain')
        .then((resp) => {
            var s_url = URI.normalize(resp.request.url + '/' + resp.request.payload), 
                parts = s_url.split('/'), 
                req_id = parts.filter(function (part) {
                    if (part.includes('resp-')) return true;
                    return false;
                })[0].replace('resp-', ''), 
                j_resp = JSON.parse(resp.response);

            Object.keys(j_resp).forEach(function (op) {
                var resp = j_resp[op];
                if (resp == null) {
                    console.log(req_id, 'Timeout. Retrying...');
                    reject({
                        request: {
                            id: req_id, 
                            response_url: s_url
                        }, 
                        reason: 'Command failed to execute'
                    });
                } else {
                    if(req_id in window.req_callbacks) {
                        var req_url = null;
                        if (req_id in window.req_urls) {
                            req_url = window.req_urls[req_id];
                            delete window.req_urls[req_id];
                        }

                        resolve({
                            request: {
                                id: req_id, 
                                request_url: req_url,
                                response_url: s_url
                            }, 
                            response: resp[1]
                        });
                    }
                }
            });
        })
        .catch((resp) => {
            var s_url = URI.normalize(resp.request.url + '/' + resp.request.payload), 
                parts = s_url.split('/'), 
                req_id = parts.filter(function (part) {
                    if (part.includes('resp-')) return true;
                    return false;
                })[0].replace('resp-', ''), 
                j_resp = JSON.parse(resp.response);

                reject({
                    request: {
                        id: req_id, 
                        response_url: s_url
                    }, 
                    reason: 'Command failed to execute'
                });
        });
}

window.analev_eval = function(cmd, callback, req_id = uuid()) {
    if (! ('req_callbacks' in window)) window.req_callbacks = {};
    if (! ('req_urls' in window)) window.req_urls = {};
    if (callback) window.req_callbacks[req_id] = callback;

    // _send_cmd_request(req_id, cmd, function(_req_id, _req_url) {        
    //     if (_req_url) window.req_urls[_req_id] = _req_url;
    //     _wait_for_response(_req_id);
    // });

    send_cmd_request_v2(req_id, cmd)
        .then((resp) => {
            if (resp.request.url) window.req_urls[resp.request.id] = resp.request.url;

            var resolve = (resp) => {
                    window.req_callbacks[resp.request.id](resp.request.id, resp.response, resp.request.request_url, resp.request.response_url);
                    delete window.req_callbacks[resp.request.id];
                }, 
                reject = (resp) => {
                    wait_for_response_v2(resp.request.id, resolve, reject);
                };

            wait_for_response_v2(resp.request.id, resolve, reject);
        })
        .catch((resp) => {});
}

window.analev_call = function(func_name, json_params=[], callback, req_id = uuid()) {
    if (! ('req_callbacks' in window)) window.req_callbacks = {};
    if (! ('req_urls' in window)) window.req_urls = {};
    if (callback) window.req_callbacks[req_id] = callback;

    // _send_rpc_request(req_id, func_name, json_params, function(_req_id, _req_url) {
    //     if (_req_url) window.req_urls[_req_id] = _req_url;
    //     _wait_for_response(_req_id);
    // });

    send_rpc_request_v2(req_id, func_name, json_params)
        .then((resp) => {
            if (resp.request.url) window.req_urls[resp.request.id] = resp.request.url;
            // _wait_for_response(resp.request.id);

            var resolve = (resp) => {
                    window.req_callbacks[resp.request.id](resp.request.id, resp.response, resp.request.request_url, resp.request.response_url);
                    delete window.req_callbacks[resp.request.id];
                }, 
                reject = (resp) => {
                    wait_for_response_v2(resp.request.id, resolve, reject);
                };

            wait_for_response_v2(resp.request.id, resolve, reject);
        })
        .catch((resp) => {});
}

window.eval_file = function(filename, params, callback) { 
  // Ensure all values is string
  Object.keys(params).forEach((k) => {
    params[k] = params[k] + "";
  });

  analev_call('module.file.name.eval', [filename, params], function(_req_id, resp) {
    var resp = JSON.parse(resp);
    if (resp.success) {
      if (callback) {
        callback(resp.data.text);
      }
    } else {
      if (callback) {
        callback(resp.data.toString());
      }
    }
  });
}

window.eval_file_id = function(file_id, params, callback) { 
  // Ensure all values is string
  Object.keys(params).forEach((k) => {
    params[k] = params[k] + "";
  });

  analev_call('module.file.id.eval', [file_id, params], function(_req_id, resp) {
    var resp = JSON.parse(resp);
    if (resp.success) {
      if (callback) {
        callback(resp.data.text);
      }
    } else {
      if (callback) {
        callback("Error: " + resp.data.toString());
      }
    }
  });
}
