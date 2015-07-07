var MessageQueue = function() {
    var RETRY_MAX = 5;
    var queue = [];
    var sending = false;
    var timer = null;
    return {
        reset: reset,
        sendAppMessage: sendAppMessage,
        size: size
    };
    function reset() {
        queue = [];
        sending = false;
    }
    function sendAppMessage(message, ack, nack) {
        if (!isValidMessage(message)) {
            return false;
        }
        queue.push({
            message: message,
            ack: ack || null,
            nack: nack || null,
            attempts: 0
        });
        setTimeout(function() {
            sendNextMessage();
        }, 1);
        return true;
    }
    function size() {
        return queue.length;
    }
    function isValidMessage(message) {
        if (message !== Object(message)) {
            return false;
        }
        var keys = Object.keys(message);
        if (!keys.length) {
            return false;
        }
        for (var k = 0; k < keys.length; k += 1) {
            var validKey = /^[0-9a-zA-Z-_]*$/.test(keys[k]);
            if (!validKey) {
                return false;
            }
            var value = message[keys[k]];
            if (!validValue(value)) {
                return false;
            }
        }
        return true;
        function validValue(value) {
            switch (typeof value) {
              case "string":
                return true;

              case "number":
                return true;

              case "object":
                if (toString.call(value) == "[object Array]") {
                    return true;
                }
            }
            return false;
        }
    }
    function sendNextMessage() {
        if (sending) {
            return;
        }
        var message = queue.shift();
        if (!message) {
            return;
        }
        message.attempts += 1;
        sending = true;
        Pebble.sendAppMessage(message.message, ack, nack);
        timer = setTimeout(function() {
            timeout();
        }, 1e3);
        function ack() {
            clearTimeout(timer);
            setTimeout(function() {
                sending = false;
                sendNextMessage();
            }, 200);
            if (message.ack) {
                message.ack.apply(null, arguments);
            }
        }
        function nack() {
            clearTimeout(timer);
            if (message.attempts < RETRY_MAX) {
                queue.unshift(message);
                setTimeout(function() {
                    sending = false;
                    sendNextMessage();
                }, 200 * message.attempts);
            } else {
                if (message.nack) {
                    message.nack.apply(null, arguments);
                }
            }
        }
        function timeout() {
            setTimeout(function() {
                sending = false;
                sendNextMessage();
            }, 1e3);
            if (message.ack) {
                message.ack.apply(null, arguments);
            }
        }
    }
}();

!function(name, context, definition) {
    if (typeof module != "undefined" && module.exports) module.exports = definition(); else if (typeof define == "function" && define.amd) define(definition); else context[name] = definition();
}("reqwest", this, function() {
    var win = window, doc = document, httpsRe = /^http/, protocolRe = /(^\w+):\/\//, twoHundo = /^(20\d|1223)$/, byTag = "getElementsByTagName", readyState = "readyState", contentType = "Content-Type", requestedWith = "X-Requested-With", head = doc[byTag]("head")[0], uniqid = 0, callbackPrefix = "reqwest_" + +new Date(), lastValue, xmlHttpRequest = "XMLHttpRequest", xDomainRequest = "XDomainRequest", noop = function() {}, isArray = typeof Array.isArray == "function" ? Array.isArray : function(a) {
        return a instanceof Array;
    }, defaultHeaders = {
        contentType: "application/x-www-form-urlencoded",
        requestedWith: xmlHttpRequest,
        accept: {
            "*": "text/javascript, text/html, application/xml, text/xml, */*",
            xml: "application/xml, text/xml",
            html: "text/html",
            text: "text/plain",
            json: "application/json, text/javascript",
            js: "application/javascript, text/javascript"
        }
    }, xhr = function(o) {
        if (o["crossOrigin"] === true) {
            var xhr = win[xmlHttpRequest] ? new XMLHttpRequest() : null;
            if (xhr && "withCredentials" in xhr) {
                return xhr;
            } else if (win[xDomainRequest]) {
                return new XDomainRequest();
            } else {
                throw new Error("Browser does not support cross-origin requests");
            }
        } else if (win[xmlHttpRequest]) {
            return new XMLHttpRequest();
        } else {
            return new ActiveXObject("Microsoft.XMLHTTP");
        }
    }, globalSetupOptions = {
        dataFilter: function(data) {
            return data;
        }
    };
    function succeed(r) {
        var protocol = protocolRe.exec(r.url);
        protocol = protocol && protocol[1] || window.location.protocol;
        return httpsRe.test(protocol) ? twoHundo.test(r.request.status) : !!r.request.response;
    }
    function handleReadyState(r, success, error) {
        return function() {
            if (r._aborted) return error(r.request);
            if (r._timedOut) return error(r.request, "Request is aborted: timeout");
            if (r.request && r.request[readyState] == 4) {
                r.request.onreadystatechange = noop;
                if (succeed(r)) success(r.request); else error(r.request);
            }
        };
    }
    function setHeaders(http, o) {
        var headers = o["headers"] || {}, h;
        headers["Accept"] = headers["Accept"] || defaultHeaders["accept"][o["type"]] || defaultHeaders["accept"]["*"];
        var isAFormData = typeof FormData === "function" && o["data"] instanceof FormData;
        if (!o["crossOrigin"] && !headers[requestedWith]) headers[requestedWith] = defaultHeaders["requestedWith"];
        if (!headers[contentType] && !isAFormData) headers[contentType] = o["contentType"] || defaultHeaders["contentType"];
        for (h in headers) headers.hasOwnProperty(h) && "setRequestHeader" in http && http.setRequestHeader(h, headers[h]);
    }
    function setCredentials(http, o) {
        if (typeof o["withCredentials"] !== "undefined" && typeof http.withCredentials !== "undefined") {
            http.withCredentials = !!o["withCredentials"];
        }
    }
    function generalCallback(data) {
        lastValue = data;
    }
    function urlappend(url, s) {
        return url + (/\?/.test(url) ? "&" : "?") + s;
    }
    function handleJsonp(o, fn, err, url) {
        var reqId = uniqid++, cbkey = o["jsonpCallback"] || "callback", cbval = o["jsonpCallbackName"] || reqwest.getcallbackPrefix(reqId), cbreg = new RegExp("((^|\\?|&)" + cbkey + ")=([^&]+)"), match = url.match(cbreg), script = doc.createElement("script"), loaded = 0, isIE10 = navigator.userAgent.indexOf("MSIE 10.0") !== -1;
        if (match) {
            if (match[3] === "?") {
                url = url.replace(cbreg, "$1=" + cbval);
            } else {
                cbval = match[3];
            }
        } else {
            url = urlappend(url, cbkey + "=" + cbval);
        }
        win[cbval] = generalCallback;
        script.type = "text/javascript";
        script.src = url;
        script.async = true;
        if (typeof script.onreadystatechange !== "undefined" && !isIE10) {
            script.htmlFor = script.id = "_reqwest_" + reqId;
        }
        script.onload = script.onreadystatechange = function() {
            if (script[readyState] && script[readyState] !== "complete" && script[readyState] !== "loaded" || loaded) {
                return false;
            }
            script.onload = script.onreadystatechange = null;
            script.onclick && script.onclick();
            fn(lastValue);
            lastValue = undefined;
            head.removeChild(script);
            loaded = 1;
        };
        head.appendChild(script);
        return {
            abort: function() {
                script.onload = script.onreadystatechange = null;
                err({}, "Request is aborted: timeout", {});
                lastValue = undefined;
                head.removeChild(script);
                loaded = 1;
            }
        };
    }
    function getRequest(fn, err) {
        var o = this.o, method = (o["method"] || "GET").toUpperCase(), url = typeof o === "string" ? o : o["url"], data = o["processData"] !== false && o["data"] && typeof o["data"] !== "string" ? reqwest.toQueryString(o["data"]) : o["data"] || null, http, sendWait = false;
        if ((o["type"] == "jsonp" || method == "GET") && data) {
            url = urlappend(url, data);
            data = null;
        }
        if (o["type"] == "jsonp") return handleJsonp(o, fn, err, url);
        http = o.xhr && o.xhr(o) || xhr(o);
        http.open(method, url, o["async"] === false ? false : true);
        setHeaders(http, o);
        setCredentials(http, o);
        if (win[xDomainRequest] && http instanceof win[xDomainRequest]) {
            http.onload = fn;
            http.onerror = err;
            http.onprogress = function() {};
            sendWait = true;
        } else {
            http.onreadystatechange = handleReadyState(this, fn, err);
        }
        o["before"] && o["before"](http);
        if (sendWait) {
            setTimeout(function() {
                http.send(data);
            }, 200);
        } else {
            http.send(data);
        }
        return http;
    }
    function Reqwest(o, fn) {
        this.o = o;
        this.fn = fn;
        init.apply(this, arguments);
    }
    function setType(header) {
        if (header.match("json")) return "json";
        if (header.match("javascript")) return "js";
        if (header.match("text")) return "html";
        if (header.match("xml")) return "xml";
    }
    function init(o, fn) {
        this.url = typeof o == "string" ? o : o["url"];
        this.timeout = null;
        this._fulfilled = false;
        this._successHandler = function() {};
        this._fulfillmentHandlers = [];
        this._errorHandlers = [];
        this._completeHandlers = [];
        this._erred = false;
        this._responseArgs = {};
        var self = this;
        fn = fn || function() {};
        if (o["timeout"]) {
            this.timeout = setTimeout(function() {
                timedOut();
            }, o["timeout"]);
        }
        if (o["success"]) {
            this._successHandler = function() {
                o["success"].apply(o, arguments);
            };
        }
        if (o["error"]) {
            this._errorHandlers.push(function() {
                o["error"].apply(o, arguments);
            });
        }
        if (o["complete"]) {
            this._completeHandlers.push(function() {
                o["complete"].apply(o, arguments);
            });
        }
        function complete(resp) {
            o["timeout"] && clearTimeout(self.timeout);
            self.timeout = null;
            while (self._completeHandlers.length > 0) {
                self._completeHandlers.shift()(resp);
            }
        }
        function success(resp) {
            var type = o["type"] || resp && setType(resp.getResponseHeader("Content-Type"));
            resp = type !== "jsonp" ? self.request : resp;
            var filteredResponse = globalSetupOptions.dataFilter(resp.responseText, type), r = filteredResponse;
            try {
                resp.responseText = r;
            } catch (e) {}
            if (r) {
                switch (type) {
                  case "json":
                    try {
                        resp = win.JSON ? win.JSON.parse(r) : eval("(" + r + ")");
                    } catch (err) {
                        return error(resp, "Could not parse JSON in response", err);
                    }
                    break;

                  case "js":
                    resp = eval(r);
                    break;

                  case "html":
                    resp = r;
                    break;

                  case "xml":
                    resp = resp.responseXML && resp.responseXML.parseError && resp.responseXML.parseError.errorCode && resp.responseXML.parseError.reason ? null : resp.responseXML;
                    break;
                }
            }
            self._responseArgs.resp = resp;
            self._fulfilled = true;
            fn(resp);
            self._successHandler(resp);
            while (self._fulfillmentHandlers.length > 0) {
                resp = self._fulfillmentHandlers.shift()(resp);
            }
            complete(resp);
        }
        function timedOut() {
            self._timedOut = true;
            self.request.abort();
        }
        function error(resp, msg, t) {
            resp = self.request;
            self._responseArgs.resp = resp;
            self._responseArgs.msg = msg;
            self._responseArgs.t = t;
            self._erred = true;
            while (self._errorHandlers.length > 0) {
                self._errorHandlers.shift()(resp, msg, t);
            }
            complete(resp);
        }
        this.request = getRequest.call(this, success, error);
    }
    Reqwest.prototype = {
        abort: function() {
            this._aborted = true;
            this.request.abort();
        },
        retry: function() {
            init.call(this, this.o, this.fn);
        },
        then: function(success, fail) {
            success = success || function() {};
            fail = fail || function() {};
            if (this._fulfilled) {
                this._responseArgs.resp = success(this._responseArgs.resp);
            } else if (this._erred) {
                fail(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t);
            } else {
                this._fulfillmentHandlers.push(success);
                this._errorHandlers.push(fail);
            }
            return this;
        },
        always: function(fn) {
            if (this._fulfilled || this._erred) {
                fn(this._responseArgs.resp);
            } else {
                this._completeHandlers.push(fn);
            }
            return this;
        },
        fail: function(fn) {
            if (this._erred) {
                fn(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t);
            } else {
                this._errorHandlers.push(fn);
            }
            return this;
        },
        "catch": function(fn) {
            return this.fail(fn);
        }
    };
    function reqwest(o, fn) {
        return new Reqwest(o, fn);
    }
    function normalize(s) {
        return s ? s.replace(/\r?\n/g, "\r\n") : "";
    }
    function serial(el, cb) {
        var n = el.name, t = el.tagName.toLowerCase(), optCb = function(o) {
            if (o && !o["disabled"]) cb(n, normalize(o["attributes"]["value"] && o["attributes"]["value"]["specified"] ? o["value"] : o["text"]));
        }, ch, ra, val, i;
        if (el.disabled || !n) return;
        switch (t) {
          case "input":
            if (!/reset|button|image|file/i.test(el.type)) {
                ch = /checkbox/i.test(el.type);
                ra = /radio/i.test(el.type);
                val = el.value;
                (!(ch || ra) || el.checked) && cb(n, normalize(ch && val === "" ? "on" : val));
            }
            break;

          case "textarea":
            cb(n, normalize(el.value));
            break;

          case "select":
            if (el.type.toLowerCase() === "select-one") {
                optCb(el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null);
            } else {
                for (i = 0; el.length && i < el.length; i++) {
                    el.options[i].selected && optCb(el.options[i]);
                }
            }
            break;
        }
    }
    function eachFormElement() {
        var cb = this, e, i, serializeSubtags = function(e, tags) {
            var i, j, fa;
            for (i = 0; i < tags.length; i++) {
                fa = e[byTag](tags[i]);
                for (j = 0; j < fa.length; j++) serial(fa[j], cb);
            }
        };
        for (i = 0; i < arguments.length; i++) {
            e = arguments[i];
            if (/input|select|textarea/i.test(e.tagName)) serial(e, cb);
            serializeSubtags(e, [ "input", "select", "textarea" ]);
        }
    }
    function serializeQueryString() {
        return reqwest.toQueryString(reqwest.serializeArray.apply(null, arguments));
    }
    function serializeHash() {
        var hash = {};
        eachFormElement.apply(function(name, value) {
            if (name in hash) {
                hash[name] && !isArray(hash[name]) && (hash[name] = [ hash[name] ]);
                hash[name].push(value);
            } else hash[name] = value;
        }, arguments);
        return hash;
    }
    reqwest.serializeArray = function() {
        var arr = [];
        eachFormElement.apply(function(name, value) {
            arr.push({
                name: name,
                value: value
            });
        }, arguments);
        return arr;
    };
    reqwest.serialize = function() {
        if (arguments.length === 0) return "";
        var opt, fn, args = Array.prototype.slice.call(arguments, 0);
        opt = args.pop();
        opt && opt.nodeType && args.push(opt) && (opt = null);
        opt && (opt = opt.type);
        if (opt == "map") fn = serializeHash; else if (opt == "array") fn = reqwest.serializeArray; else fn = serializeQueryString;
        return fn.apply(null, args);
    };
    reqwest.toQueryString = function(o, trad) {
        var prefix, i, traditional = trad || false, s = [], enc = encodeURIComponent, add = function(key, value) {
            value = "function" === typeof value ? value() : value == null ? "" : value;
            s[s.length] = enc(key) + "=" + enc(value);
        };
        if (isArray(o)) {
            for (i = 0; o && i < o.length; i++) add(o[i]["name"], o[i]["value"]);
        } else {
            for (prefix in o) {
                if (o.hasOwnProperty(prefix)) buildParams(prefix, o[prefix], traditional, add);
            }
        }
        return s.join("&").replace(/%20/g, "+");
    };
    function buildParams(prefix, obj, traditional, add) {
        var name, i, v, rbracket = /\[\]$/;
        if (isArray(obj)) {
            for (i = 0; obj && i < obj.length; i++) {
                v = obj[i];
                if (traditional || rbracket.test(prefix)) {
                    add(prefix, v);
                } else {
                    buildParams(prefix + "[" + (typeof v === "object" ? i : "") + "]", v, traditional, add);
                }
            }
        } else if (obj && obj.toString() === "[object Object]") {
            for (name in obj) {
                buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
            }
        } else {
            add(prefix, obj);
        }
    }
    reqwest.getcallbackPrefix = function() {
        return callbackPrefix;
    };
    reqwest.compat = function(o, fn) {
        if (o) {
            o["type"] && (o["method"] = o["type"]) && delete o["type"];
            o["dataType"] && (o["type"] = o["dataType"]);
            o["jsonpCallback"] && (o["jsonpCallbackName"] = o["jsonpCallback"]) && delete o["jsonpCallback"];
            o["jsonp"] && (o["jsonpCallback"] = o["jsonp"]);
        }
        return new Reqwest(o, fn);
    };
    reqwest.ajaxSetup = function(options) {
        options = options || {};
        for (var k in options) {
            globalSetupOptions[k] = options[k];
        }
    };
    return reqwest;
});

var accessToken, vehicleId, settings;

function log(message) {
    console.log("Tesla Time - " + message);
}

function jlog(data) {
    log(JSON.stringify(data));
}

var googleApiURL = "https://maps.googleapis.com/maps/api/", googleApiKey = "AIzaSyCEb5Pig6hK4Pl4kNbxEhA86p12gDWVitk";

function googleAjax(method, url, params, callback, errorCallback) {
    params.key = googleApiKey;
    reqwest({
        method: method,
        url: googleApiURL + url + "/json",
        type: "json",
        contentType: "application/json",
        data: params,
        success: callback,
        error: errorCallback
    });
}

function reverseGeocode(lat, lng, callback, errorCallback) {
    googleAjax("GET", "geocode", {
        latlng: lat + "," + lng
    }, callback, errorCallback);
}

var telsaApiURL = "https://owner-api.teslamotors.com", clientId = atob("ZTRhOTk0OWZjZmEwNDA2OGY1OWFiYjVhNjU4ZjJiYWMwYTM0MjhlNDY1MjMxNTQ5MGI2NTlkNWFiM2YzNWE5ZQ=="), clientSecret = atob("Yzc1ZjE0YmJhZGM4YmVlM2E3NTk0NDEyYzMxNDE2ZjgzMDAyNTZkNzY2OGVhN2U2ZTdmMDY3MjdiZmI5ZDIyMA==");

function teslaErrorCallback(data) {
    jlog(data);
}

function getState(endpoint, callback) {
    reqwest({
        method: "GET",
        url: telsaApiURL + "/api/1/vehicles/" + vehicleId + endpoint,
        headers: {
            Authorization: "Bearer " + accessToken
        },
        type: "json",
        contentType: "application/json",
        success: function(json) {
            callback(json.response, json);
        },
        error: teslaErrorCallback
    });
}

function postCommand(endpoint, options, callback) {
    reqwest({
        method: "POST",
        url: telsaApiURL + "/api/1/vehicles/" + vehicleId + endpoint,
        data: options,
        headers: {
            Authorization: "Bearer " + accessToken
        },
        type: "json",
        contentType: "application/json",
        success: function(json) {
            callback(json.response, json);
        },
        error: teslaErrorCallback
    });
}

function doLogin() {
    reqwest({
        method: "POST",
        url: telsaApiURL + "/oauth/token",
        data: {
            grant_type: "password",
            client_id: clientId,
            client_secret: clientSecret,
            email: settings.email,
            password: settings.password
        },
        type: "json",
        success: function(json) {
            log("Logged in!");
            jlog(json);
            accessToken = json.access_token;
            localStorage.setItem("accessToken", accessToken);
            getVehicle();
        },
        error: teslaErrorCallback
    });
}

function getVehicle() {
    reqwest({
        method: "GET",
        url: telsaApiURL + "/api/1/vehicles",
        headers: {
            Authorization: "Bearer " + accessToken
        },
        type: "html",
        contentType: "application/json",
        success: function(data) {
            var matches = /"id":(\d*)/.exec(data);
            vehicleId = matches[1];
            localStorage.setItem("vehicleId", vehicleId);
            log("Got a vehicle! " + vehicleId);
            getOverview();
        },
        error: teslaErrorCallback
    });
}

function getOverview() {
    getState("/data_request/vehicle_state", function(response) {
        MessageQueue.sendAppMessage({
            vehicle_name: response.vehicle_name
        });
    });
    getState("/data_request/charge_state", function(response) {
        MessageQueue.sendAppMessage({
            rated_miles: response.battery_range
        });
        MessageQueue.sendAppMessage({
            charging_state: response.charging_state
        });
    });
    getState("/data_request/drive_state", function(response) {
        reverseGeocode(response.latitude, response.longitude, function(json) {
            Pebble.sendAppMessage({
                location: json.results[0].formatted_address.substring(0, 48)
            });
        });
    });
}

Pebble.addEventListener("ready", function(event) {
    settings = JSON.parse(localStorage.getItem("settings"));
    if (settings) {
        accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            doLogin();
        } else {
            vehicleId = localStorage.getItem("vehicleId");
            if (!vehicleId) {
                getVehicle();
            } else {
                getOverview();
            }
        }
    }
});

Pebble.addEventListener("showConfiguration", function(event) {
    if (settings) {
        log("Email already configured");
        Pebble.openURL("http://timdorr.com/tesla-time/?email=" + settings.email);
    } else {
        log("New log in");
        Pebble.openURL("http://timdorr.com/tesla-time/");
    }
});

Pebble.addEventListener("webviewclosed", function(event) {
    log(event.response);
    var settings = JSON.parse(event.response);
    if (settings) {
        localStorage.setItem("settings", event.response);
    }
});