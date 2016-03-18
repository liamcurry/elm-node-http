Elm.Native = Elm.Native || {};
Elm.Native.Node = Elm.Native.Node || {};
Elm.Native.Node.Http = Elm.Native.Node.Http || {};

Elm.Native.Node.Http.make = function(localRuntime) {
    'use strict';

    localRuntime.Native = localRuntime.Native || {};
    localRuntime.Native.Node = Elm.Native.Node || {};
    localRuntime.Native.Node.Http = localRuntime.Native.Node.Http || {};
    if ('values' in localRuntime.Native.Node.Http) {
        return localRuntime.Native.Node.Http.values;
    }

    var Task = Elm.Native.Task.make(localRuntime);
    var Utils = Elm.Native.Utils.make(localRuntime);

    var http = require('http');

    function get(url) {
        return Task.asyncFunction(function(callback) {
            http.get(url, function(res) {
                var data = "";
                res.on("data", function (chunk) {
                        data += chunk.toString();
                });
                res.on("end", function () {
                    return callback(Task.succeed(data));
                });
            }).on('error', function(err) {
                return callback(Task.fail({ ctor: 'NetworkError', _0: url }));
            });
        });
    }

    function serve(port, task_function) {
        return Task.asyncFunction(function(callback) {
            http.createServer(function(request, response) {
                Task.perform(task_function(request)(response));
            }).listen(port);
            return callback(Task.succeed(Utils.Tuple0));
        });
    }

    function get_url(request) {
        return request.url;
    }

    function response_end(response, s) {
        response.end(s);
        return Utils.Tuple0;
    }

    return localRuntime.Native.Node.Http.values = {
        get: get,
        serve: F2(serve),
        get_url: get_url,
        response_end: F2(response_end),
    };
};

(function() {
    if (module.exports === Elm) {
        return;
    }

    if (typeof module == 'undefined') {
        throw new Error('You are trying to run a node Elm program in the browser!');
    }

    window = global;

    module.exports = Elm;
    setTimeout(function() {
        if (!module.parent) {
            if ('Main' in Elm) {
                setImmediate(Elm.worker, Elm.Main);
            } else {
                throw new Error('You are trying to run a node Elm program without a Main module.');
            }
        }
    });
})();
