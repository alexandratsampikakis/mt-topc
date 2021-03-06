(function (d, a) {
    d.version = "0.9.6";
    d.protocol = 1;
    d.transports = [];
    d.j = [];
    d.sockets = {};
    d.connect = function (c, b) {
        var e = d.util.parseUri(c),
            f, j;
        a && a.location && (e.protocol = e.protocol || a.location.protocol.slice(0, -1), e.host = e.host || (a.document ? a.document.domain : a.location.hostname), e.port = e.port || a.location.port);
        f = d.util.uniqueUri(e);
        var g = {
            host: e.host,
            secure: "https" == e.protocol,
            port: e.port || ("https" == e.protocol ? 443 : 80),
            query: e.query || ""
        };
        d.util.merge(g, b);
        if (g["force new connection"] || !d.sockets[f]) j = new d.Socket(g);
        !g["force new connection"] && j && (d.sockets[f] = j);
        j = j || d.sockets[f];
        return j.of(1 < e.path.length ? e.path : "")
    }
})("object" === typeof module ? module.exports : this.io = {}, this);
(function (d, a) {
    var c = d.util = {}, b = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
        e = "source,protocol,authority,userInfo,user,password,host,port,relative,path,directory,file,query,anchor".split(",");
    c.parseUri = function (a) {
        for (var a = b.exec(a || ""), g = {}, c = 14; c--;) g[e[c]] = a[c] || "";
        return g
    };
    c.uniqueUri = function (b) {
        var g = b.protocol,
            c = b.host,
            b = b.port;
        "document" in
            a ? (c = c || document.domain, b = b || ("https" == g && "https:" !== document.location.protocol ? 443 : document.location.port)) : (c = c || "localhost", !b && "https" == g && (b = 443));
        return (g || "http") + "://" + c + ":" + (b || 80)
    };
    c.query = function (a, b) {
        var f = c.chunkQuery(a || ""),
            e = [];
        c.merge(f, c.chunkQuery(b || ""));
        for (var d in f) f.hasOwnProperty(d) && e.push(d + "=" + f[d]);
        return e.length ? "?" + e.join("&") : ""
    };
    c.chunkQuery = function (a) {
        for (var b = {}, a = a.split("&"), c = 0, f = a.length, e; c < f; ++c) e = a[c].split("="), e[0] && (b[e[0]] = e[1]);
        return b
    };
    var f = !1;
    c.load = function (b) {
        if ("document" in a && "complete" === document.readyState || f) return b();
        c.on(a, "load", b, !1)
    };
    c.on = function (a, b, c, f) {
        a.attachEvent ? a.attachEvent("on" + b, c) : a.addEventListener && a.addEventListener(b, c, f)
    };
    c.request = function (a) {
        if (a && "undefined" != typeof XDomainRequest) return new XDomainRequest;
        if ("undefined" != typeof XMLHttpRequest && (!a || c.ua.hasCORS)) return new XMLHttpRequest;
        if (!a) try {
                return new(window[["Active"].concat("Object").join("X")])("Microsoft.XMLHTTP")
        } catch (b) {}
        return null
    };
    "undefined" !=
        typeof window && c.load(function () {
        f = !0
    });
    c.defer = function (a) {
        if (!c.ua.webkit || "undefined" != typeof importScripts) return a();
        c.load(function () {
            setTimeout(a, 100)
        })
    };
    c.merge = function (a, b, f, e) {
        var e = e || [],
            f = "undefined" == typeof f ? 2 : f,
            d;
        for (d in b) b.hasOwnProperty(d) && 0 > c.indexOf(e, d) && ("object" !== typeof a[d] || !f ? (a[d] = b[d], e.push(b[d])) : c.merge(a[d], b[d], f - 1, e));
        return a
    };
    c.mixin = function (a, b) {
        c.merge(a.prototype, b.prototype)
    };
    c.inherit = function (a, b) {
        function c() {}
        c.prototype = b.prototype;
        a.prototype = new c
    };
    c.isArray = Array.isArray || function (a) {
        return "[object Array]" === Object.prototype.toString.call(a)
    };
    c.intersect = function (a, b) {
        for (var f = [], e = a.length > b.length ? a : b, d = a.length > b.length ? b : a, m = 0, q = d.length; m < q; m++)~ c.indexOf(e, d[m]) && f.push(d[m]);
        return f
    };
    c.indexOf = function (a, b, c) {
        for (var f = a.length, c = 0 > c ? 0 > c + f ? 0 : c + f : c || 0; c < f && a[c] !== b; c++);
        return f <= c ? -1 : c
    };
    c.toArray = function (a) {
        for (var b = [], c = 0, f = a.length; c < f; c++) b.push(a[c]);
        return b
    };
    c.ua = {};
    c.ua.hasCORS = "undefined" != typeof XMLHttpRequest && function () {
        try {
            var a =
                new XMLHttpRequest
        } catch (b) {
            return !1
        }
        return void 0 != a.withCredentials
    }();
    c.ua.webkit = "undefined" != typeof navigator && /webkit/i.test(navigator.userAgent)
})("undefined" != typeof io ? io : module.exports, this);
(function (d, a) {
    function c() {}
    d.EventEmitter = c;
    c.prototype.on = function (b, c) {
        this.$events || (this.$events = {});
        this.$events[b] ? a.util.isArray(this.$events[b]) ? this.$events[b].push(c) : this.$events[b] = [this.$events[b], c] : this.$events[b] = c;
        return this
    };
    c.prototype.addListener = c.prototype.on;
    c.prototype.once = function (a, c) {
        function f() {
            d.removeListener(a, f);
            c.apply(this, arguments)
        }
        var d = this;
        f.listener = c;
        this.on(a, f);
        return this
    };
    c.prototype.removeListener = function (b, c) {
        if (this.$events && this.$events[b]) {
            var f =
                this.$events[b];
            if (a.util.isArray(f)) {
                for (var d = -1, g = 0, k = f.length; g < k; g++) if (f[g] === c || f[g].listener && f[g].listener === c) {
                        d = g;
                        break
                    }
                if (0 > d) return this;
                f.splice(d, 1);
                f.length || delete this.$events[b]
            } else(f === c || f.listener && f.listener === c) && delete this.$events[b]
            }
            return this
        };
        c.prototype.removeAllListeners = function (a) {
            this.$events && this.$events[a] && (this.$events[a] = null);
            return this
        };
        c.prototype.listeners = function (b) {
            this.$events || (this.$events = {});
            this.$events[b] || (this.$events[b] = []);
            a.util.isArray(this.$events[b]) ||
                (this.$events[b] = [this.$events[b]]);
            return this.$events[b]
        };
        c.prototype.emit = function (b) {
            if (!this.$events) return !1;
            var c = this.$events[b];
            if (!c) return !1;
            var f = Array.prototype.slice.call(arguments, 1);
            if ("function" == typeof c) c.apply(this, f);
            else if (a.util.isArray(c)) for (var c = c.slice(), d = 0, g = c.length; d < g; d++) c[d].apply(this, f);
            else return !1;
            return !0
        }
    })("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports);
(function (d, a) {
    function c(a) {
        return 10 > a ? "0" + a : a
    }
    function b(a) {
        g.lastIndex = 0;
        return g.test(a) ? '"' + a.replace(g, function (a) {
            var b = h[a];
            return "string" === typeof b ? b : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
        }) + '"' : '"' + a + '"'
    }
    function e(a, g) {
        var f, d, j, h, o = k,
            r, p = g[a];
        p instanceof Date && (p = isFinite(a.valueOf()) ? a.getUTCFullYear() + "-" + c(a.getUTCMonth() + 1) + "-" + c(a.getUTCDate()) + "T" + c(a.getUTCHours()) + ":" + c(a.getUTCMinutes()) + ":" + c(a.getUTCSeconds()) + "Z" : null);
        "function" === typeof m && (p = m.call(g, a,
        p));
        switch (typeof p) {
            case "string":
                return b(p);
            case "number":
                return isFinite(p) ? "" + p : "null";
            case "boolean":
            case "null":
                return "" + p;
            case "object":
                if (!p) return "null";
                k += n;
                r = [];
                if ("[object Array]" === Object.prototype.toString.apply(p)) {
                    h = p.length;
                    for (f = 0; f < h; f += 1) r[f] = e(f, p) || "null";
                    j = 0 === r.length ? "[]" : k ? "[\n" + k + r.join(",\n" + k) + "\n" + o + "]" : "[" + r.join(",") + "]";
                    k = o;
                    return j
                }
                if (m && "object" === typeof m) {
                    h = m.length;
                    for (f = 0; f < h; f += 1) "string" === typeof m[f] && (d = m[f], (j = e(d, p)) && r.push(b(d) + (k ? ": " : ":") + j))
                    } else for (d in p) Object.prototype.hasOwnProperty.call(p,
                            d) && (j = e(d, p)) && r.push(b(d) + (k ? ": " : ":") + j);
                    j = 0 === r.length ? "{}" : k ? "{\n" + k + r.join(",\n" + k) + "\n" + o + "}" : "{" + r.join(",") + "}";
                    k = o;
                    return j
                }
        }
        if (a && a.parse) return d.JSON = {
                parse: a.parse,
                stringify: a.stringify
        };
        var f = d.JSON = {}, j = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            g = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            k, n, h = {
                "\u0008": "\\b",
                "\t": "\\t",
                "\n": "\\n",
                "\u000c": "\\f",
                "\r": "\\r",
                '"': '\\"',
                "\\": "\\\\"
            }, m;
        f.stringify = function (a, b, c) {
            var g;
            n = k = "";
            if ("number" === typeof c) for (g = 0; g < c; g += 1) n += " ";
            else "string" === typeof c && (n = c);
            if ((m = b) && "function" !== typeof b && ("object" !== typeof b || "number" !== typeof b.length)) throw Error("JSON.stringify");
            return e("", {
                "": a
            })
        };
        f.parse = function (a, b) {
            function c(a, g) {
                var f, d, e = a[g];
                if (e && "object" === typeof e) for (f in e) Object.prototype.hasOwnProperty.call(e, f) && (d = c(e, f), void 0 !== d ? e[f] = d : delete e[f]);
                return b.call(a, g, e)
            }
            var g, a = "" + a;
            j.lastIndex =
                0;
            j.test(a) && (a = a.replace(j, function (a) {
                return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
            }));
            if (/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) return g = eval("(" + a + ")"), "function" === typeof b ? c({
                    "": g
                }, "") : g;
            throw new SyntaxError("JSON.parse");
        }
    })("undefined" != typeof io ? io : module.exports, "undefined" !== typeof JSON ? JSON : void 0);
(function (d, a) {
    var c = d.parser = {}, b = c.packets = "disconnect,connect,heartbeat,message,json,event,ack,error,noop".split(","),
        e = c.reasons = ["transport not supported", "client not handshaken", "unauthorized"],
        f = c.advice = ["reconnect"],
        j = a.JSON,
        g = a.util.indexOf;
    c.encodePacket = function (a) {
        var c = g(b, a.type),
            d = a.id || "",
            k = a.endpoint || "",
            s = a.ack,
            t = null;
        switch (a.type) {
            case "error":
                var A = a.reason ? g(e, a.reason) : "",
                    a = a.advice ? g(f, a.advice) : "";
                if ("" !== A || "" !== a) t = A + ("" !== a ? "+" + a : "");
                break;
            case "message":
                "" !== a.data &&
                    (t = a.data);
                break;
            case "event":
                t = {
                    name: a.name
                };
                a.args && a.args.length && (t.args = a.args);
                t = j.stringify(t);
                break;
            case "json":
                t = j.stringify(a.data);
                break;
            case "connect":
                a.qs && (t = a.qs);
                break;
            case "ack":
                t = a.ackId + (a.args && a.args.length ? "+" + j.stringify(a.args) : "")
        }
        c = [c, d + ("data" == s ? "+" : ""), k];
        null !== t && void 0 !== t && c.push(t);
        return c.join(":")
    };
    c.encodePayload = function (a) {
        var b = "";
        if (1 == a.length) return a[0];
        for (var c = 0, g = a.length; c < g; c++) b += "\ufffd" + a[c].length + "\ufffd" + a[c];
        return b
    };
    var k = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?([\s\S]*)?/;
    c.decodePacket = function (a) {
        var c = a.match(k);
        if (!c) return {};
        var g = c[2] || "",
            a = c[5] || "",
            d = {
                type: b[c[1]],
                endpoint: c[4] || ""
            };
        g && (d.id = g, d.ack = c[3] ? "data" : !0);
        switch (d.type) {
            case "error":
                c = a.split("+");
                d.reason = e[c[0]] || "";
                d.advice = f[c[1]] || "";
                break;
            case "message":
                d.data = a || "";
                break;
            case "event":
                try {
                    var s = j.parse(a);
                    d.name = s.name;
                    d.args = s.args
                } catch (t) {}
                d.args = d.args || [];
                break;
            case "json":
                try {
                    d.data = j.parse(a)
                } catch (A) {}
                break;
            case "connect":
                d.qs = a || "";
                break;
            case "ack":
                if (c = a.match(/^([0-9]+)(\+)?(.*)/)) if (d.ackId =
                        c[1], d.args = [], c[3]) try {
                            d.args = c[3] ? j.parse(c[3]) : []
                    } catch (w) {}
        }
        return d
    };
    c.decodePayload = function (a) {
        if ("\ufffd" == a.charAt(0)) {
            for (var b = [], g = 1, f = ""; g < a.length; g++) "\ufffd" == a.charAt(g) ? (b.push(c.decodePacket(a.substr(g + 1).substr(0, f))), g += Number(f) + 1, f = "") : f += a.charAt(g);
            return b
        }
        return [c.decodePacket(a)]
    }
})("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports);
(function (d, a) {
    function c(a, c) {
        this.socket = a;
        this.sessid = c
    }
    d.Transport = c;
    a.util.mixin(c, a.EventEmitter);
    c.prototype.onData = function (b) {
        this.clearCloseTimeout();
        (this.socket.connected || this.socket.connecting || this.socket.reconnecting) && this.setCloseTimeout();
        if ("" !== b && (b = a.parser.decodePayload(b)) && b.length) for (var c = 0, f = b.length; c < f; c++) this.onPacket(b[c]);
        return this
    };
    c.prototype.onPacket = function (a) {
        this.socket.setHeartbeatTimeout();
        if ("heartbeat" == a.type) return this.onHeartbeat();
        if ("connect" ==
            a.type && "" == a.endpoint) this.onConnect();
        "error" == a.type && "reconnect" == a.advice && (this.open = !1);
        this.socket.onPacket(a);
        return this
    };
    c.prototype.setCloseTimeout = function () {
        if (!this.closeTimeout) {
            var a = this;
            this.closeTimeout = setTimeout(function () {
                a.onDisconnect()
            }, this.socket.closeTimeout)
        }
    };
    c.prototype.onDisconnect = function () {
        this.close && this.open && this.close();
        this.clearTimeouts();
        this.socket.onDisconnect();
        return this
    };
    c.prototype.onConnect = function () {
        this.socket.onConnect();
        return this
    };
    c.prototype.clearCloseTimeout = function () {
        this.closeTimeout && (clearTimeout(this.closeTimeout), this.closeTimeout = null)
    };
    c.prototype.clearTimeouts = function () {
        this.clearCloseTimeout();
        this.reopenTimeout && clearTimeout(this.reopenTimeout)
    };
    c.prototype.packet = function (b) {
        this.send(a.parser.encodePacket(b))
    };
    c.prototype.onHeartbeat = function () {
        this.packet({
            type: "heartbeat"
        })
    };
    c.prototype.onOpen = function () {
        this.open = !0;
        this.clearCloseTimeout();
        this.socket.onOpen()
    };
    c.prototype.onClose = function () {
        this.open = !1;
        this.socket.onClose();
        this.onDisconnect()
    };
    c.prototype.prepareUrl = function () {
        var b = this.socket.options;
        return this.scheme() + "://" + b.host + ":" + b.port + "/" + b.resource + "/" + a.protocol + "/" + this.name + "/" + this.sessid
    };
    c.prototype.ready = function (a, c) {
        c.call(this)
    }
})("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports);
(function (d, a, c) {
    function b(b) {
        this.options = {
            port: 80,
            secure: !1,
            document: "document" in c ? document : !1,
            resource: "socket.io",
            transports: a.transports,
            "connect timeout": 1E4,
            "try multiple transports": !0,
            reconnect: !0,
            "reconnection delay": 500,
            "reconnection limit": Infinity,
            "reopen delay": 3E3,
            "max reconnection attempts": 10,
            "sync disconnect on unload": !0,
            "auto connect": !0,
            "flash policy port": 10843
        };
        a.util.merge(this.options, b);
        this.reconnecting = this.connecting = this.open = this.connected = !1;
        this.namespaces = {};
        this.buffer = [];
        this.doBuffer = !1;
        if (this.options["sync disconnect on unload"] && (!this.isXDomain() || a.util.ua.hasCORS)) {
            var d = this;
            a.util.on(c, "unload", function () {
                d.disconnectSync()
            }, !1)
        }
        this.options["auto connect"] && this.connect()
    }
    function e() {}
    d.Socket = b;
    a.util.mixin(b, a.EventEmitter);
    b.prototype.of = function (b) {
        this.namespaces[b] || (this.namespaces[b] = new a.SocketNamespace(this, b), "" !== b && this.namespaces[b].packet({
            type: "connect"
        }));
        return this.namespaces[b]
    };
    b.prototype.publish = function () {
        this.emit.apply(this,
        arguments);
        var a, b;
        for (b in this.namespaces) this.namespaces.hasOwnProperty(b) && (a = this.of(b), a.$emit.apply(a, arguments))
        };
        b.prototype.handshake = function (b) {
            function c(a) {
                if (a instanceof Error) g.onError(a.message);
                else b.apply(null, a.split(":"))
                }
                var g = this,
                    d = this.options,
                    d = ["http" + (d.secure ? "s" : "") + ":/", d.host + ":" + d.port, d.resource, a.protocol, a.util.query(this.options.query, "t=" + +new Date)].join("/");
                if (this.isXDomain() && !a.util.ua.hasCORS) {
                    var n = document.getElementsByTagName("script")[0],
                        h = document.createElement("script");
                    h.src = d + "&jsonp=" + a.j.length;
                    n.parentNode.insertBefore(h, n);
                    a.j.push(function (a) {
                        c(a);
                        h.parentNode.removeChild(h)
                    })
                } else {
                    var m = a.util.request();
                    m.open("GET", d, !0);
                    m.withCredentials = !0;
                    m.onreadystatechange = function () {
                        4 == m.readyState && (m.onreadystatechange = e, 200 == m.status ? c(m.responseText) : !g.reconnecting && g.onError(m.responseText))
                    };
                    m.send(null)
                }
            };
            b.prototype.getTransport = function (b) {
                for (var b = b || this.transports, c = 0, g; g = b[c]; c++) if (a.Transport[g] && a.Transport[g].check(this) && (!this.isXDomain() || a.Transport[g].xdomainCheck())) return new a.Transport[g](this,
                        this.sessionid);
                return null
            };
            b.prototype.connect = function (b) {
                if (this.connecting) return this;
                var c = this;
                this.handshake(function (g, d, e, h) {
                    function m(a) {
                        c.transport && c.transport.clearTimeouts();
                        c.transport = c.getTransport(a);
                        if (!c.transport) return c.publish("connect_failed");
                        c.transport.ready(c, function () {
                            c.connecting = !0;
                            c.publish("connecting", c.transport.name);
                            c.transport.open();
                            c.options["connect timeout"] && (c.connectTimeoutTimer = setTimeout(function () {
                                if (!c.connected && (c.connecting = !1, c.options["try multiple transports"])) {
                                    c.remainingTransports ||
                                        (c.remainingTransports = c.transports.slice(0));
                                    for (var a = c.remainingTransports; 0 < a.length && a.splice(0, 1)[0] != c.transport.name;);
                                    a.length ? m(a) : c.publish("connect_failed")
                                }
                            }, c.options["connect timeout"]))
                        })
                    }
                    c.sessionid = g;
                    c.closeTimeout = 1E3 * e;
                    c.heartbeatTimeout = 1E3 * d;
                    c.transports = h ? a.util.intersect(h.split(","), c.options.transports) : c.options.transports;
                    c.setHeartbeatTimeout();
                    m(c.transports);
                    c.once("connect", function () {
                        clearTimeout(c.connectTimeoutTimer);
                        b && "function" == typeof b && b()
                    })
                });
                return this
            };
            b.prototype.setHeartbeatTimeout = function () {
                clearTimeout(this.heartbeatTimeoutTimer);
                var a = this;
                this.heartbeatTimeoutTimer = setTimeout(function () {
                    a.transport.onClose()
                }, this.heartbeatTimeout)
            };
            b.prototype.packet = function (a) {
                this.connected && !this.doBuffer ? this.transport.packet(a) : this.buffer.push(a);
                return this
            };
            b.prototype.setBuffer = function (a) {
                this.doBuffer = a;
                !a && this.connected && this.buffer.length && (this.transport.payload(this.buffer), this.buffer = [])
            };
            b.prototype.disconnect = function () {
                if (this.connected ||
                    this.connecting) this.open && this.of("").packet({
                        type: "disconnect"
                    }), this.onDisconnect("booted");
                return this
            };
            b.prototype.disconnectSync = function () {
                a.util.request().open("GET", this.resource + "/" + a.protocol + "/" + this.sessionid, !0);
                this.onDisconnect("booted")
            };
            b.prototype.isXDomain = function () {
                var a = c.location.port || ("https:" == c.location.protocol ? 443 : 80);
                return this.options.host !== c.location.hostname || this.options.port != a
            };
            b.prototype.onConnect = function () {
                this.connected || (this.connected = !0, this.connecting = !1, this.doBuffer || this.setBuffer(!1), this.emit("connect"))
            };
            b.prototype.onOpen = function () {
                this.open = !0
            };
            b.prototype.onClose = function () {
                this.open = !1;
                clearTimeout(this.heartbeatTimeoutTimer)
            };
            b.prototype.onPacket = function (a) {
                this.of(a.endpoint).onPacket(a)
            };
            b.prototype.onError = function (a) {
                if (a && a.advice && "reconnect" === a.advice && (this.connected || this.connecting)) this.disconnect(), this.options.reconnect && this.reconnect();
                this.publish("error", a && a.reason ? a.reason : a)
            };
            b.prototype.onDisconnect = function (a) {
                var b =
                    this.connected,
                    c = this.connecting;
                this.open = this.connecting = this.connected = !1;
                if (b || c) this.transport.close(), this.transport.clearTimeouts(), b && (this.publish("disconnect", a), "booted" != a && this.options.reconnect && !this.reconnecting && this.reconnect())
                };
                b.prototype.reconnect = function () {
                    function a() {
                        if (c.connected) {
                            for (var d in c.namespaces) c.namespaces.hasOwnProperty(d) && "" !== d && c.namespaces[d].packet({
                                    type: "connect"
                                });
                            c.publish("reconnect", c.transport.name, c.reconnectionAttempts)
                        }
                        clearTimeout(c.reconnectionTimer);
                        c.removeListener("connect_failed", b);
                        c.removeListener("connect", b);
                        c.reconnecting = !1;
                        delete c.reconnectionAttempts;
                        delete c.reconnectionDelay;
                        delete c.reconnectionTimer;
                        delete c.redoTransports;
                        c.options["try multiple transports"] = e
                    }
                    function b() {
                        if (c.reconnecting) {
                            if (c.connected) return a();
                            if (c.connecting && c.reconnecting) return c.reconnectionTimer = setTimeout(b, 1E3);
                            c.reconnectionAttempts++ >= d ? c.redoTransports ? (c.publish("reconnect_failed"), a()) : (c.on("connect_failed", b), c.options["try multiple transports"] = !0, c.transport = c.getTransport(), c.redoTransports = !0, c.connect()) : (c.reconnectionDelay < h && (c.reconnectionDelay *= 2), c.connect(), c.publish("reconnecting", c.reconnectionDelay, c.reconnectionAttempts), c.reconnectionTimer = setTimeout(b, c.reconnectionDelay))
                        }
                    }
                    this.reconnecting = !0;
                    this.reconnectionAttempts = 0;
                    this.reconnectionDelay = this.options["reconnection delay"];
                    var c = this,
                        d = this.options["max reconnection attempts"],
                        e = this.options["try multiple transports"],
                        h = this.options["reconnection limit"];
                    this.options["try multiple transports"] = !1;
                    this.reconnectionTimer = setTimeout(b, this.reconnectionDelay);
                    this.on("connect", b)
                }
            })("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports, this);
        (function (d, a) {
            function c(a, c) {
                this.socket = a;
                this.name = c || "";
                this.flags = {};
                this.json = new b(this, "json");
                this.ackPackets = 0;
                this.acks = {}
            }
            function b(a, b) {
                this.namespace = a;
                this.name = b
            }
            d.SocketNamespace = c;
            a.util.mixin(c, a.EventEmitter);
            c.prototype.$emit = a.EventEmitter.prototype.emit;
            c.prototype.of = function () {
                return this.socket.of.apply(this.socket, arguments)
            };
            c.prototype.packet = function (a) {
                a.endpoint = this.name;
                this.socket.packet(a);
                this.flags = {};
                return this
            };
            c.prototype.send = function (a, b) {
                var c = {
                    type: this.flags.json ? "json" : "message",
                    data: a
                };
                "function" == typeof b && (c.id = ++this.ackPackets, c.ack = !0, this.acks[c.id] = b);
                return this.packet(c)
            };
            c.prototype.emit = function (a) {
                var b = Array.prototype.slice.call(arguments, 1),
                    c = b[b.length - 1],
                    d = {
                        type: "event",
                        name: a
                    };
                "function" == typeof c && (d.id = ++this.ackPackets, d.ack = "data", this.acks[d.id] = c, b = b.slice(0, b.length - 1));
                d.args = b;
                return this.packet(d)
            };
            c.prototype.disconnect = function () {
                "" === this.name ? this.socket.disconnect() : (this.packet({
                    type: "disconnect"
                }), this.$emit("disconnect"));
                return this
            };
            c.prototype.onPacket = function (b) {
                function c() {
                    d.packet({
                        type: "ack",
                        args: a.util.toArray(arguments),
                        ackId: b.id
                    })
                }
                var d = this;
                switch (b.type) {
                    case "connect":
                        this.$emit("connect");
                        break;
                    case "disconnect":
                        if ("" === this.name) this.socket.onDisconnect(b.reason || "booted");
                        else this.$emit("disconnect", b.reason);
                        break;
                    case "message":
                    case "json":
                        var g = ["message", b.data];
                        "data" == b.ack ? g.push(c) : b.ack && this.packet({
                            type: "ack",
                            ackId: b.id
                        });
                        this.$emit.apply(this, g);
                        break;
                    case "event":
                        g = [b.name].concat(b.args);
                        "data" == b.ack && g.push(c);
                        this.$emit.apply(this, g);
                        break;
                    case "ack":
                        this.acks[b.ackId] && (this.acks[b.ackId].apply(this, b.args), delete this.acks[b.ackId]);
                        break;
                    case "error":
                        if (b.advice) this.socket.onError(b);
                        else "unauthorized" == b.reason ? this.$emit("connect_failed", b.reason) : this.$emit("error", b.reason)
                        }
                };
                b.prototype.send = function () {
                    this.namespace.flags[this.name] = !0;
                    this.namespace.send.apply(this.namespace, arguments)
                };
                b.prototype.emit = function () {
                    this.namespace.flags[this.name] = !0;
                    this.namespace.emit.apply(this.namespace,
                    arguments)
                }
            })("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports);
        (function (d, a, c) {
            function b(b) {
                a.Transport.apply(this, arguments)
            }
            d.websocket = b;
            a.util.inherit(b, a.Transport);
            b.prototype.name = "websocket";
            b.prototype.open = function () {
                var b = a.util.query(this.socket.options.query),
                    d = this,
                    j;
                j || (j = c.MozWebSocket || c.WebSocket);
                this.websocket = new j(this.prepareUrl() + b);
                this.websocket.onopen = function () {
                    d.onOpen();
                    d.socket.setBuffer(!1)
                };
                this.websocket.onmessage = function (a) {
                    d.onData(a.data)
                };
                this.websocket.onclose = function () {
                    d.onClose();
                    d.socket.setBuffer(!0)
                };
                this.websocket.onerror = function (a) {
                    d.onError(a)
                };
                return this
            };
            b.prototype.send = function (a) {
                this.websocket.send(a);
                return this
            };
            b.prototype.payload = function (a) {
                for (var b = 0, c = a.length; b < c; b++) this.packet(a[b]);
                return this
            };
            b.prototype.close = function () {
                this.websocket.close();
                return this
            };
            b.prototype.onError = function (a) {
                this.socket.onError(a)
            };
            b.prototype.scheme = function () {
                return this.socket.options.secure ? "wss" : "ws"
            };
            b.check = function () {
                return "WebSocket" in c && !("__addTask" in WebSocket) || "MozWebSocket" in c
            };
            b.xdomainCheck = function () {
                return !0
            };
            a.transports.push("websocket")
        })("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports, this);
        (function (d, a) {
            function c() {
                a.Transport.websocket.apply(this, arguments)
            }
            d.flashsocket = c;
            a.util.inherit(c, a.Transport.websocket);
            c.prototype.name = "flashsocket";
            c.prototype.open = function () {
                var b = this,
                    c = arguments;
                WebSocket.__addTask(function () {
                    a.Transport.websocket.prototype.open.apply(b, c)
                });
                return this
            };
            c.prototype.send = function () {
                var b = this,
                    c = arguments;
                WebSocket.__addTask(function () {
                    a.Transport.websocket.prototype.send.apply(b, c)
                });
                return this
            };
            c.prototype.close = function () {
                WebSocket.__tasks.length =
                    0;
                a.Transport.websocket.prototype.close.call(this);
                return this
            };
            c.prototype.ready = function (b, d) {
                function f() {
                    var a = b.options,
                        f = a["flash policy port"],
                        n = ["http" + (a.secure ? "s" : "") + ":/", a.host + ":" + a.port, a.resource, "static/flashsocket", "WebSocketMain" + (b.isXDomain() ? "Insecure" : "") + ".swf"];
                    c.loaded || ("undefined" === typeof WEB_SOCKET_SWF_LOCATION && (WEB_SOCKET_SWF_LOCATION = n.join("/")), 843 !== f && WebSocket.loadFlashPolicyFile("xmlsocket://" + a.host + ":" + f), WebSocket.__initialize(), c.loaded = !0);
                    d.call(j)
                }
                var j =
                    this;
                if (document.body) return f();
                a.util.load(f)
            };
            c.check = function () {
                return "undefined" == typeof WebSocket || !("__initialize" in WebSocket) || !swfobject ? !1 : 10 <= swfobject.getFlashPlayerVersion().major
            };
            c.xdomainCheck = function () {
                return !0
            };
            "undefined" != typeof window && (WEB_SOCKET_DISABLE_AUTO_INITIALIZATION = !0);
            a.transports.push("flashsocket")
        })("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports);
        if ("undefined" != typeof window) var swfobject = function () {
                function d() {
                    if (!z) {
                        try {
                            var a = l.getElementsByTagName("body")[0].appendChild(l.createElement("span"));
                            a.parentNode.removeChild(a)
                        } catch (b) {
                            return
                        }
                        z = !0;
                        for (var a = D.length, c = 0; c < a; c++) D[c]()
                        }
                    }
                    function a(a) {
                        z ? a() : D[D.length] = a
                    }
                    function c(a) {
                        if (typeof u.addEventListener != o) u.addEventListener("load", a, !1);
                        else if (typeof l.addEventListener != o) l.addEventListener("load", a, !1);
                        else if (typeof u.attachEvent != o) s(u, "onload", a);
                        else if ("function" == typeof u.onload) {
                            var b =
                                u.onload;
                            u.onload = function () {
                                b();
                                a()
                            }
                        } else u.onload = a
                        }
                        function b() {
                            var a = l.getElementsByTagName("body")[0],
                                b = l.createElement(r);
                            b.setAttribute("type", p);
                            var c = a.appendChild(b);
                            if (c) {
                                var d = 0;
                                (function () {
                                    if (typeof c.GetVariable != o) {
                                        var g = c.GetVariable("$version");
                                        g && (g = g.split(" ")[1].split(","), i.pv = [parseInt(g[0], 10), parseInt(g[1], 10), parseInt(g[2], 10)])
                                    } else if (10 > d) {
                                        d++;
                                        setTimeout(arguments.callee, 10);
                                        return
                                    }
                                    a.removeChild(b);
                                    c = null;
                                    e()
                                })()
                            } else e()
                            }
                            function e() {
                                var a = x.length;
                                if (0 < a) for (var b = 0; b <
                                        a; b++) {
                                        var c = x[b].id,
                                            d = x[b].callbackFn,
                                            e = {
                                                success: !1,
                                                id: c
                                            };
                                        if (0 < i.pv[0]) {
                                            var h = q(c);
                                            if (h) if (t(x[b].swfVersion) && !(i.wk && 312 > i.wk)) w(c, !0), d && (e.success = !0, e.ref = f(c), d(e));
                                                else if (x[b].expressInstall && j()) {
                                                e = {};
                                                e.data = x[b].expressInstall;
                                                e.width = h.getAttribute("width") || "0";
                                                e.height = h.getAttribute("height") || "0";
                                                h.getAttribute("class") && (e.styleclass = h.getAttribute("class"));
                                                h.getAttribute("align") && (e.align = h.getAttribute("align"));
                                                for (var n = {}, h = h.getElementsByTagName("param"), m = h.length, l = 0; l <
                                                    m; l++) "movie" != h[l].getAttribute("name").toLowerCase() && (n[h[l].getAttribute("name")] = h[l].getAttribute("value"));
                                                g(e, n, c, d)
                                            } else k(h), d && d(e)
                                            } else if (w(c, !0), d) {
                                                if ((c = f(c)) && typeof c.SetVariable != o) e.success = !0, e.ref = c;
                                                d(e)
                                            }
                                        }
                                }
                                function f(a) {
                                    var b = null;
                                    if ((a = q(a)) && "OBJECT" == a.nodeName) typeof a.SetVariable != o ? b = a : (a = a.getElementsByTagName(r)[0]) && (b = a);
                                    return b
                                }
                                function j() {
                                    return !E && t("6.0.65") && (i.win || i.mac) && !(i.wk && 312 > i.wk)
                                }
                                function g(a, b, c, d) {
                                    E = !0;
                                    H = d || null;
                                    K = {
                                        success: !1,
                                        id: c
                                    };
                                    var g = q(c);
                                    if (g) {
                                        "OBJECT" ==
                                            g.nodeName ? (C = n(g), F = null) : (C = g, F = c);
                                        a.id = M;
                                        if (typeof a.width == o || !/%$/.test(a.width) && 310 > parseInt(a.width, 10)) a.width = "310";
                                        if (typeof a.height == o || !/%$/.test(a.height) && 137 > parseInt(a.height, 10)) a.height = "137";
                                        l.title = l.title.slice(0, 47) + " - Flash Player Installation";
                                        d = i.ie && i.win ? ["Active"].concat("").join("X") : "PlugIn";
                                        d = "MMredirectURL=" + u.location.toString().replace(/&/g, "%26") + "&MMplayerType=" + d + "&MMdoctitle=" + l.title;
                                        b.flashvars = typeof b.flashvars != o ? b.flashvars + ("&" + d) : d;
                                        i.ie && i.win && 4 !=
                                            g.readyState && (d = l.createElement("div"), c += "SWFObjectNew", d.setAttribute("id", c), g.parentNode.insertBefore(d, g), g.style.display = "none", function () {
                                            g.readyState == 4 ? g.parentNode.removeChild(g) : setTimeout(arguments.callee, 10)
                                        }());
                                        h(a, b, c)
                                    }
                                }
                                function k(a) {
                                    if (i.ie && i.win && 4 != a.readyState) {
                                        var b = l.createElement("div");
                                        a.parentNode.insertBefore(b, a);
                                        b.parentNode.replaceChild(n(a), b);
                                        a.style.display = "none";
                                        (function () {
                                            4 == a.readyState ? a.parentNode.removeChild(a) : setTimeout(arguments.callee, 10)
                                        })()
                                    } else a.parentNode.replaceChild(n(a),
                                        a)
                                    }
                                    function n(a) {
                                        var b = l.createElement("div");
                                        if (i.win && i.ie) b.innerHTML = a.innerHTML;
                                        else if (a = a.getElementsByTagName(r)[0]) if (a = a.childNodes) for (var c = a.length, d = 0; d < c; d++)!(1 == a[d].nodeType && "PARAM" == a[d].nodeName) && 8 != a[d].nodeType && b.appendChild(a[d].cloneNode(!0));
                                        return b
                                    }
                                    function h(a, b, c) {
                                        var d, g = q(c);
                                        if (i.wk && 312 > i.wk) return d;
                                        if (g) if (typeof a.id == o && (a.id = c), i.ie && i.win) {
                                                var f = "",
                                                    e;
                                                for (e in a) a[e] != Object.prototype[e] && ("data" == e.toLowerCase() ? b.movie = a[e] : "styleclass" == e.toLowerCase() ? f +=
                                                        ' class="' + a[e] + '"' : "classid" != e.toLowerCase() && (f += " " + e + '="' + a[e] + '"'));
                                                e = "";
                                                for (var h in b) b[h] != Object.prototype[h] && (e += '<param name="' + h + '" value="' + b[h] + '" />');
                                                g.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + f + ">" + e + "</object>";
                                                G[G.length] = a.id;
                                                d = q(a.id)
                                            } else {
                                                h = l.createElement(r);
                                                h.setAttribute("type", p);
                                                for (var k in a) a[k] != Object.prototype[k] && ("styleclass" == k.toLowerCase() ? h.setAttribute("class", a[k]) : "classid" != k.toLowerCase() && h.setAttribute(k, a[k]));
                                                for (f in b) b[f] !=
                                                        Object.prototype[f] && "movie" != f.toLowerCase() && (a = h, e = f, k = b[f], c = l.createElement("param"), c.setAttribute("name", e), c.setAttribute("value", k), a.appendChild(c));
                                                g.parentNode.replaceChild(h, g);
                                                d = h
                                            }
                                        return d
                                    }
                                    function m(a) {
                                        var b = q(a);
                                        b && "OBJECT" == b.nodeName && (i.ie && i.win ? (b.style.display = "none", function () {
                                            if (4 == b.readyState) {
                                                var c = q(a);
                                                if (c) {
                                                    for (var d in c) "function" == typeof c[d] && (c[d] = null);
                                                    c.parentNode.removeChild(c)
                                                }
                                            } else setTimeout(arguments.callee, 10)
                                            }()): b.parentNode.removeChild(b))
                                        }
                                        function q(a) {
                                            var b =
                                                null;
                                            try {
                                                b = l.getElementById(a)
                                            } catch (c) {}
                                            return b
                                        }
                                        function s(a, b, c) {
                                            a.attachEvent(b, c);
                                            B[B.length] = [a, b, c]
                                        }
                                        function t(a) {
                                            var b = i.pv,
                                                a = a.split(".");
                                            a[0] = parseInt(a[0], 10);
                                            a[1] = parseInt(a[1], 10) || 0;
                                            a[2] = parseInt(a[2], 10) || 0;
                                            return b[0] > a[0] || b[0] == a[0] && b[1] > a[1] || b[0] == a[0] && b[1] == a[1] && b[2] >= a[2] ? !0 : !1
                                        }
                                        function A(a, b, c, d) {
                                            if (!i.ie || !i.mac) {
                                                var g = l.getElementsByTagName("head")[0];
                                                if (g) {
                                                    c = c && "string" == typeof c ? c : "screen";
                                                    d && (I = v = null);
                                                    if (!v || I != c) d = l.createElement("style"), d.setAttribute("type", "text/css"),
                                                    d.setAttribute("media", c), v = g.appendChild(d), i.ie && i.win && typeof l.styleSheets != o && 0 < l.styleSheets.length && (v = l.styleSheets[l.styleSheets.length - 1]), I = c;
                                                    i.ie && i.win ? v && typeof v.addRule == r && v.addRule(a, b) : v && typeof l.createTextNode != o && v.appendChild(l.createTextNode(a + " {" + b + "}"))
                                                }
                                            }
                                        }
                                        function w(a, b) {
                                            if (N) {
                                                var c = b ? "visible" : "hidden";
                                                z && q(a) ? q(a).style.visibility = c : A("#" + a, "visibility:" + c)
                                            }
                                        }
                                        function J(a) {
                                            return null != /[\\\"<>\.;]/.exec(a) && typeof encodeURIComponent != o ? encodeURIComponent(a) : a
                                        }
                                        var o = "undefined",
                                            r = "object",
                                            p = "application/x-shockwave-flash",
                                            M = "SWFObjectExprInst",
                                            u = window,
                                            l = document,
                                            y = navigator,
                                            O = !1,
                                            D = [function () {
                                                O ? b() : e()
                                            }],
                                            x = [],
                                            G = [],
                                            B = [],
                                            C, F, H, K, z = !1,
                                            E = !1,
                                            v, I, N = !0,
                                            i = function () {
                                                var a = typeof l.getElementById != o && typeof l.getElementsByTagName != o && typeof l.createElement != o,
                                                    b = y.userAgent.toLowerCase(),
                                                    c = y.platform.toLowerCase(),
                                                    d = c ? /win/.test(c) : /win/.test(b),
                                                    c = c ? /mac/.test(c) : /mac/.test(b),
                                                    b = /webkit/.test(b) ? parseFloat(b.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : !1,
                                                    g = !+"\v1",
                                                    f = [0, 0, 0],
                                                    e = null;
                                                if (typeof y.plugins != o && typeof y.plugins["Shockwave Flash"] == r) {
                                                    if ((e = y.plugins["Shockwave Flash"].description) && !(typeof y.mimeTypes != o && y.mimeTypes[p] && !y.mimeTypes[p].enabledPlugin)) O = !0, g = !1, e = e.replace(/^.*\s+(\S+\s+\S+$)/, "$1"), f[0] = parseInt(e.replace(/^(.*)\..*$/, "$1"), 10), f[1] = parseInt(e.replace(/^.*\.(.*)\s.*$/, "$1"), 10), f[2] = /[a-zA-Z]/.test(e) ? parseInt(e.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0
                                                    } else if (typeof u[["Active"].concat("Object").join("X")] != o) try {
                                                            var h = new(window[["Active"].concat("Object").join("X")])("ShockwaveFlash.ShockwaveFlash");
                                                            if (h && (e = h.GetVariable("$version"))) g = !0, e = e.split(" ")[1].split(","), f = [parseInt(e[0], 10), parseInt(e[1], 10), parseInt(e[2], 10)]
                                                            } catch (k) {}
                                                            return {
                                                                w3: a,
                                                                pv: f,
                                                                wk: b,
                                                                ie: g,
                                                                win: d,
                                                                mac: c
                                                            }
                                                    }();
                                                    (function () {
                                                        i.w3 && ((typeof l.readyState != o && "complete" == l.readyState || typeof l.readyState == o && (l.getElementsByTagName("body")[0] || l.body)) && d(), z || (typeof l.addEventListener != o && l.addEventListener("DOMContentLoaded", d, !1), i.ie && i.win && (l.attachEvent("onreadystatechange", function () {
                                                            "complete" == l.readyState && (l.detachEvent("onreadystatechange",
                                                            arguments.callee), d())
                                                        }), u == top && function () {
                                                            if (!z) {
                                                                try {
                                                                    l.documentElement.doScroll("left")
                                                                } catch (a) {
                                                                    setTimeout(arguments.callee, 0);
                                                                    return
                                                                }
                                                                d()
                                                            }
                                                        }()), i.wk && function () {
                                                            z || (/loaded|complete/.test(l.readyState) ? d() : setTimeout(arguments.callee, 0))
                                                        }(), c(d)))
                                                    })();
                                                    (function () {
                                                        i.ie && i.win && window.attachEvent("onunload", function () {
                                                            for (var a = B.length, b = 0; b < a; b++) B[b][0].detachEvent(B[b][1], B[b][2]);
                                                            a = G.length;
                                                            for (b = 0; b < a; b++) m(G[b]);
                                                            for (var c in i) i[c] = null;
                                                            i = null;
                                                            for (var d in swfobject) swfobject[d] = null;
                                                            swfobject =
                                                                null
                                                        })
                                                    })();
                                                    return {
                                                        registerObject: function (a, b, c, d) {
                                                            if (i.w3 && a && b) {
                                                                var g = {};
                                                                g.id = a;
                                                                g.swfVersion = b;
                                                                g.expressInstall = c;
                                                                g.callbackFn = d;
                                                                x[x.length] = g;
                                                                w(a, !1)
                                                            } else d && d({
                                                                    success: !1,
                                                                    id: a
                                                                })
                                                            }, getObjectById: function (a) {
                                                                if (i.w3) return f(a)
                                                                }, embedSWF: function (b, c, d, f, e, k, n, m, l, q) {
                                                                    var s = {
                                                                        success: !1,
                                                                        id: c
                                                                    };
                                                                    i.w3 && !(i.wk && 312 > i.wk) && b && c && d && f && e ? (w(c, !1), a(function () {
                                                                        d += "";
                                                                        f += "";
                                                                        var a = {};
                                                                        if (l && typeof l === r) for (var i in l) a[i] = l[i];
                                                                        a.data = b;
                                                                        a.width = d;
                                                                        a.height = f;
                                                                        i = {};
                                                                        if (m && typeof m === r) for (var p in m) i[p] = m[p];
                                                                        if (n &&
                                                                            typeof n === r) for (var u in n) i.flashvars = typeof i.flashvars != o ? i.flashvars + ("&" + u + "=" + n[u]) : u + "=" + n[u];
                                                                        if (t(e)) p = h(a, i, c), a.id == c && w(c, !0), s.success = !0, s.ref = p;
                                                                        else {
                                                                            if (k && j()) {
                                                                                a.data = k;
                                                                                g(a, i, c, q);
                                                                                return
                                                                            }
                                                                            w(c, !0)
                                                                        }
                                                                        q && q(s)
                                                                    })) : q && q(s)
                                                                },
                                                                switchOffAutoHideShow: function () {
                                                                    N = !1
                                                                },
                                                                ua: i,
                                                                getFlashPlayerVersion: function () {
                                                                    return {
                                                                        major: i.pv[0],
                                                                        minor: i.pv[1],
                                                                        release: i.pv[2]
                                                                    }
                                                                },
                                                                hasFlashPlayerVersion: t,
                                                                createSWF: function (a, b, c) {
                                                                    if (i.w3) return h(a, b, c)
                                                                    }, showExpressInstall: function (a, b, c, d) {
                                                                        i.w3 && j() && g(a, b, c, d)
                                                                    },
                                                                    removeSWF: function (a) {
                                                                        i.w3 &&
                                                                            m(a)
                                                                    },
                                                                    createCSS: function (a, b, c, d) {
                                                                        i.w3 && A(a, b, c, d)
                                                                    },
                                                                    addDomLoadEvent: a,
                                                                    addLoadEvent: c,
                                                                    getQueryParamValue: function (a) {
                                                                        var b = l.location.search || l.location.hash;
                                                                        if (b) {
                                                                            /\?/.test(b) && (b = b.split("?")[1]);
                                                                            if (null == a) return J(b);
                                                                            for (var b = b.split("&"), c = 0; c < b.length; c++) if (b[c].substring(0, b[c].indexOf("=")) == a) return J(b[c].substring(b[c].indexOf("=") + 1))
                                                                                }
                                                                            return ""
                                                                        }, expressInstallCallback: function () {
                                                                            if (E) {
                                                                                var a = q(M);
                                                                                a && C && (a.parentNode.replaceChild(C, a), F && (w(F, !0), i.ie && i.win && (C.style.display = "block")),
                                                                                H && H(K));
                                                                                E = !1
                                                                            }
                                                                        }
                                                                    }
                                                                }();
                                                                (function () {
                                                                    if (!("undefined" == typeof window || window.WebSocket)) {
                                                                        var d = window.console;
                                                                        if (!d || !d.log || !d.error) d = {
                                                                                log: function () {},
                                                                                error: function () {}
                                                                        };
                                                                        swfobject.hasFlashPlayerVersion("10.0.0") ? ("file:" == location.protocol && d.error("WARNING: web-socket-js doesn't work in file:///... URL unless you set Flash Security Settings properly. Open the page via Web server i.e. http://..."), WebSocket = function (a, c, b, d, f) {
                                                                            var j = this;
                                                                            j.__id = WebSocket.__nextId++;
                                                                            WebSocket.__instances[j.__id] = j;
                                                                            j.readyState = WebSocket.CONNECTING;
                                                                            j.bufferedAmount = 0;
                                                                            j.__events = {};
                                                                            c ? "string" == typeof c && (c = [c]) : c = [];
                                                                            setTimeout(function () {
                                                                                WebSocket.__addTask(function () {
                                                                                    WebSocket.__flash.create(j.__id, a, c, b || null, d || 0, f || null)
                                                                                })
                                                                            }, 0)
                                                                        }, WebSocket.prototype.send = function (a) {
                                                                            if (this.readyState == WebSocket.CONNECTING) throw "INVALID_STATE_ERR: Web Socket connection has not been established";
                                                                            a = WebSocket.__flash.send(this.__id, encodeURIComponent(a));
                                                                            if (0 > a) return !0;
                                                                            this.bufferedAmount += a;
                                                                            return !1
                                                                        }, WebSocket.prototype.close = function () {
                                                                            this.readyState == WebSocket.CLOSED ||
                                                                                this.readyState == WebSocket.CLOSING || (this.readyState = WebSocket.CLOSING, WebSocket.__flash.close(this.__id))
                                                                        }, WebSocket.prototype.addEventListener = function (a, c) {
                                                                            a in this.__events || (this.__events[a] = []);
                                                                            this.__events[a].push(c)
                                                                        }, WebSocket.prototype.removeEventListener = function (a, c) {
                                                                            if (a in this.__events) for (var b = this.__events[a], d = b.length - 1; 0 <= d; --d) if (b[d] === c) {
                                                                                        b.splice(d, 1);
                                                                                        break
                                                                                    }
                                                                            }, WebSocket.prototype.dispatchEvent = function (a) {
                                                                                for (var c = this.__events[a.type] || [], b = 0; b < c.length; ++b) c[b](a);
                                                                                (c = this["on" +
                                                                                    a.type]) && c(a)
                                                                            }, WebSocket.prototype.__handleEvent = function (a) {
                                                                                "readyState" in a && (this.readyState = a.readyState);
                                                                                "protocol" in a && (this.protocol = a.protocol);
                                                                                if ("open" == a.type || "error" == a.type) a = this.__createSimpleEvent(a.type);
                                                                                else if ("close" == a.type) a = this.__createSimpleEvent("close");
                                                                                else if ("message" == a.type) a = this.__createMessageEvent("message", decodeURIComponent(a.message));
                                                                                else throw "unknown event type: " + a.type;
                                                                                this.dispatchEvent(a)
                                                                            }, WebSocket.prototype.__createSimpleEvent = function (a) {
                                                                                if (document.createEvent &&
                                                                                    window.Event) {
                                                                                    var c = document.createEvent("Event");
                                                                                    c.initEvent(a, !1, !1);
                                                                                    return c
                                                                                }
                                                                                return {
                                                                                    type: a,
                                                                                    bubbles: !1,
                                                                                    cancelable: !1
                                                                                }
                                                                            }, WebSocket.prototype.__createMessageEvent = function (a, c) {
                                                                                if (document.createEvent && window.MessageEvent && !window.opera) {
                                                                                    var b = document.createEvent("MessageEvent");
                                                                                    b.initMessageEvent("message", !1, !1, c, null, null, window, null);
                                                                                    return b
                                                                                }
                                                                                return {
                                                                                    type: a,
                                                                                    data: c,
                                                                                    bubbles: !1,
                                                                                    cancelable: !1
                                                                                }
                                                                            }, WebSocket.CONNECTING = 0, WebSocket.OPEN = 1, WebSocket.CLOSING = 2, WebSocket.CLOSED = 3, WebSocket.__flash = null, WebSocket.__instances = {}, WebSocket.__tasks = [], WebSocket.__nextId = 0, WebSocket.loadFlashPolicyFile = function (a) {
                                                                                WebSocket.__addTask(function () {
                                                                                    WebSocket.__flash.loadManualPolicyFile(a)
                                                                                })
                                                                            }, WebSocket.__initialize = function () {
                                                                                if (!WebSocket.__flash) if (WebSocket.__swfLocation && (window.WEB_SOCKET_SWF_LOCATION = WebSocket.__swfLocation), window.WEB_SOCKET_SWF_LOCATION) {
                                                                                        var a = document.createElement("div");
                                                                                        a.id = "webSocketContainer";
                                                                                        a.style.position = "absolute";
                                                                                        WebSocket.__isFlashLite() ? (a.style.left = "0px", a.style.top = "0px") : (a.style.left =
                                                                                            "-100px", a.style.top = "-100px");
                                                                                        var c = document.createElement("div");
                                                                                        c.id = "webSocketFlash";
                                                                                        a.appendChild(c);
                                                                                        document.body.appendChild(a);
                                                                                        swfobject.embedSWF(WEB_SOCKET_SWF_LOCATION, "webSocketFlash", "1", "1", "10.0.0", null, null, {
                                                                                            hasPriority: !0,
                                                                                            swliveconnect: !0,
                                                                                            allowScriptAccess: "always"
                                                                                        }, null, function (a) {
                                                                                            a.success || d.error("[WebSocket] swfobject.embedSWF failed")
                                                                                        })
                                                                                    } else d.error("[WebSocket] set WEB_SOCKET_SWF_LOCATION to location of WebSocketMain.swf")
                                                                                    }, WebSocket.__onFlashInitialized = function () {
                                                                                    setTimeout(function () {
                                                                                        WebSocket.__flash =
                                                                                            document.getElementById("webSocketFlash");
                                                                                        WebSocket.__flash.setCallerUrl(location.href);
                                                                                        WebSocket.__flash.setDebug( !! window.WEB_SOCKET_DEBUG);
                                                                                        for (var a = 0; a < WebSocket.__tasks.length; ++a) WebSocket.__tasks[a]();
                                                                                        WebSocket.__tasks = []
                                                                                    }, 0)
                                                                                }, WebSocket.__onFlashEvent = function () {
                                                                                    setTimeout(function () {
                                                                                        try {
                                                                                            for (var a = WebSocket.__flash.receiveEvents(), c = 0; c < a.length; ++c) WebSocket.__instances[a[c].webSocketId].__handleEvent(a[c])
                                                                                            } catch (b) {
                                                                                                d.error(b)
                                                                                            }
                                                                                        }, 0);
                                                                                    return !0
                                                                                    }, WebSocket.__log = function (a) {
                                                                                        d.log(decodeURIComponent(a))
                                                                                    },
                                                                                    WebSocket.__error = function (a) {
                                                                                        d.error(decodeURIComponent(a))
                                                                                    }, WebSocket.__addTask = function (a) {
                                                                                        WebSocket.__flash ? a() : WebSocket.__tasks.push(a)
                                                                                    }, WebSocket.__isFlashLite = function () {
                                                                                        if (!window.navigator || !window.navigator.mimeTypes) return !1;
                                                                                        var a = window.navigator.mimeTypes["application/x-shockwave-flash"];
                                                                                        return !a || !a.enabledPlugin || !a.enabledPlugin.filename ? !1 : a.enabledPlugin.filename.match(/flashlite/i) ? !0 : !1
                                                                                    }, window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION || (window.addEventListener ? window.addEventListener("load",

                                                                                    function () {
                                                                                        WebSocket.__initialize()
                                                                                    }, !1) : window.attachEvent("onload", function () {
                                                                                        WebSocket.__initialize()
                                                                                    }))): d.error("Flash Player >= 10.0.0 is required.")
                                                                            }
                                                                        })();
                                                                        (function (d, a, c) {
                                                                            function b(b) {
                                                                                b && (a.Transport.apply(this, arguments), this.sendBuffer = [])
                                                                            }
                                                                            function e() {}
                                                                            d.XHR = b;
                                                                            a.util.inherit(b, a.Transport);
                                                                            b.prototype.open = function () {
                                                                                this.socket.setBuffer(!1);
                                                                                this.onOpen();
                                                                                this.get();
                                                                                this.setCloseTimeout();
                                                                                return this
                                                                            };
                                                                            b.prototype.payload = function (b) {
                                                                                for (var c = [], d = 0, e = b.length; d < e; d++) c.push(a.parser.encodePacket(b[d]));
                                                                                this.send(a.parser.encodePayload(c))
                                                                            };
                                                                            b.prototype.send = function (a) {
                                                                                this.post(a);
                                                                                return this
                                                                            };
                                                                            b.prototype.post = function (a) {
                                                                                function b() {
                                                                                    if (4 ==
                                                                                        this.readyState) if (this.onreadystatechange = e, k.posting = !1, 200 == this.status) k.socket.setBuffer(!1);
                                                                                        else k.onClose()
                                                                                        }
                                                                                    function d() {
                                                                                        this.onload = e;
                                                                                        k.socket.setBuffer(!1)
                                                                                    }
                                                                                    var k = this;
                                                                                    this.socket.setBuffer(!0);
                                                                                    this.sendXHR = this.request("POST");
                                                                                    c.XDomainRequest && this.sendXHR instanceof XDomainRequest ? this.sendXHR.onload = this.sendXHR.onerror = d : this.sendXHR.onreadystatechange = b;
                                                                                    this.sendXHR.send(a)
                                                                                };
                                                                                b.prototype.close = function () {
                                                                                    this.onClose();
                                                                                    return this
                                                                                };
                                                                                b.prototype.request = function (b) {
                                                                                    var c = a.util.request(this.socket.isXDomain()),
                                                                                        d = a.util.query(this.socket.options.query, "t=" + +new Date);
                                                                                    c.open(b || "GET", this.prepareUrl() + d, !0);
                                                                                    if ("POST" == b) try {
                                                                                            c.setRequestHeader ? c.setRequestHeader("Content-type", "text/plain;charset=UTF-8") : c.contentType = "text/plain"
                                                                                    } catch (e) {}
                                                                                    return c
                                                                                };
                                                                                b.prototype.scheme = function () {
                                                                                    return this.socket.options.secure ? "https" : "http"
                                                                                };
                                                                                b.check = function (b, d) {
                                                                                    try {
                                                                                        var g = a.util.request(d),
                                                                                            e = c.XDomainRequest && g instanceof XDomainRequest,
                                                                                            n = (b && b.options && b.options.secure ? "https:" : "http:") != c.location.protocol;
                                                                                        if (g && (!e || !n)) return !0
                                                                                        } catch (h) {}
                                                                                        return !1
                                                                                    };
                                                                                    b.xdomainCheck = function () {
                                                                                        return b.check(null, !0)
                                                                                    }
                                                                                })("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports, this);
                                                                            (function (d, a) {
                                                                                function c(b) {
                                                                                    a.Transport.XHR.apply(this, arguments)
                                                                                }
                                                                                d.htmlfile = c;
                                                                                a.util.inherit(c, a.Transport.XHR);
                                                                                c.prototype.name = "htmlfile";
                                                                                c.prototype.get = function () {
                                                                                    this.doc = new(window[["Active"].concat("Object").join("X")])("htmlfile");
                                                                                    this.doc.open();
                                                                                    this.doc.write("<html></html>");
                                                                                    this.doc.close();
                                                                                    this.doc.parentWindow.s = this;
                                                                                    var b = this.doc.createElement("div");
                                                                                    b.className = "socketio";
                                                                                    this.doc.body.appendChild(b);
                                                                                    this.iframe = this.doc.createElement("iframe");
                                                                                    b.appendChild(this.iframe);
                                                                                    var c =
                                                                                        this,
                                                                                        b = a.util.query(this.socket.options.query, "t=" + +new Date);
                                                                                    this.iframe.src = this.prepareUrl() + b;
                                                                                    a.util.on(window, "unload", function () {
                                                                                        c.destroy()
                                                                                    })
                                                                                };
                                                                                c.prototype._ = function (a, c) {
                                                                                    this.onData(a);
                                                                                    try {
                                                                                        var d = c.getElementsByTagName("script")[0];
                                                                                        d.parentNode.removeChild(d)
                                                                                    } catch (j) {}
                                                                                };
                                                                                c.prototype.destroy = function () {
                                                                                    if (this.iframe) {
                                                                                        try {
                                                                                            this.iframe.src = "about:blank"
                                                                                        } catch (a) {}
                                                                                        this.doc = null;
                                                                                        this.iframe.parentNode.removeChild(this.iframe);
                                                                                        this.iframe = null;
                                                                                        CollectGarbage()
                                                                                    }
                                                                                };
                                                                                c.prototype.close = function () {
                                                                                    this.destroy();
                                                                                    return a.Transport.XHR.prototype.close.call(this)
                                                                                };
                                                                                c.check = function () {
                                                                                    if ("undefined" != typeof window && ["Active"].concat("Object").join("X") in window) try {
                                                                                            return new(window[["Active"].concat("Object").join("X")])("htmlfile") && a.Transport.XHR.check()
                                                                                    } catch (b) {}
                                                                                    return !1
                                                                                };
                                                                                c.xdomainCheck = function () {
                                                                                    return !1
                                                                                };
                                                                                a.transports.push("htmlfile")
                                                                            })("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports);
                                                                            (function (d, a, c) {
                                                                                function b() {
                                                                                    a.Transport.XHR.apply(this, arguments)
                                                                                }
                                                                                function e() {}
                                                                                d["xhr-polling"] = b;
                                                                                a.util.inherit(b, a.Transport.XHR);
                                                                                a.util.merge(b, a.Transport.XHR);
                                                                                b.prototype.name = "xhr-polling";
                                                                                b.prototype.open = function () {
                                                                                    a.Transport.XHR.prototype.open.call(this);
                                                                                    return !1
                                                                                };
                                                                                b.prototype.get = function () {
                                                                                    function a() {
                                                                                        if (4 == this.readyState) if (this.onreadystatechange = e, 200 == this.status) k.onData(this.responseText), k.get();
                                                                                            else k.onClose()
                                                                                            }
                                                                                        function b() {
                                                                                            this.onerror = this.onload = e;
                                                                                            k.onData(this.responseText);
                                                                                            k.get()
                                                                                        }
                                                                                        function d() {
                                                                                            k.onClose()
                                                                                        }
                                                                                        if (this.open) {
                                                                                            var k = this;
                                                                                            this.xhr = this.request();
                                                                                            c.XDomainRequest && this.xhr instanceof XDomainRequest ? (this.xhr.onload = b, this.xhr.onerror = d) : this.xhr.onreadystatechange = a;
                                                                                            this.xhr.send(null)
                                                                                        }
                                                                                    };
                                                                                    b.prototype.onClose = function () {
                                                                                        a.Transport.XHR.prototype.onClose.call(this);
                                                                                        if (this.xhr) {
                                                                                            this.xhr.onreadystatechange = this.xhr.onload = this.xhr.onerror = e;
                                                                                            try {
                                                                                                this.xhr.abort()
                                                                                            } catch (b) {}
                                                                                            this.xhr = null
                                                                                        }
                                                                                    };
                                                                                    b.prototype.ready = function (b, c) {
                                                                                        var d = this;
                                                                                        a.util.defer(function () {
                                                                                            c.call(d)
                                                                                        })
                                                                                    };
                                                                                    a.transports.push("xhr-polling")
                                                                                })("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports, this);
                                                                            (function (d, a, c) {
                                                                                function b(b) {
                                                                                    a.Transport["xhr-polling"].apply(this, arguments);
                                                                                    this.index = a.j.length;
                                                                                    var c = this;
                                                                                    a.j.push(function (a) {
                                                                                        c._(a)
                                                                                    })
                                                                                }
                                                                                var e = c.document && "MozAppearance" in c.document.documentElement.style;
                                                                                d["jsonp-polling"] = b;
                                                                                a.util.inherit(b, a.Transport["xhr-polling"]);
                                                                                b.prototype.name = "jsonp-polling";
                                                                                b.prototype.post = function (b) {
                                                                                    function c() {
                                                                                        d();
                                                                                        e.socket.setBuffer(!1)
                                                                                    }
                                                                                    function d() {
                                                                                        e.iframe && e.form.removeChild(e.iframe);
                                                                                        try {
                                                                                            s = document.createElement('<iframe name="' + e.iframeId + '">')
                                                                                        } catch (a) {
                                                                                            s =
                                                                                                document.createElement("iframe"), s.name = e.iframeId
                                                                                        }
                                                                                        s.id = e.iframeId;
                                                                                        e.form.appendChild(s);
                                                                                        e.iframe = s
                                                                                    }
                                                                                    var e = this,
                                                                                        n = a.util.query(this.socket.options.query, "t=" + +new Date + "&i=" + this.index);
                                                                                    if (!this.form) {
                                                                                        var h = document.createElement("form"),
                                                                                            m = document.createElement("textarea"),
                                                                                            q = this.iframeId = "socketio_iframe_" + this.index,
                                                                                            s;
                                                                                        h.className = "socketio";
                                                                                        h.style.position = "absolute";
                                                                                        h.style.top = "0px";
                                                                                        h.style.left = "0px";
                                                                                        h.style.display = "none";
                                                                                        h.target = q;
                                                                                        h.method = "POST";
                                                                                        h.setAttribute("accept-charset", "utf-8");
                                                                                        m.name = "d";
                                                                                        h.appendChild(m);
                                                                                        document.body.appendChild(h);
                                                                                        this.form = h;
                                                                                        this.area = m
                                                                                    }
                                                                                    this.form.action = this.prepareUrl() + n;
                                                                                    d();
                                                                                    this.area.value = a.JSON.stringify(b);
                                                                                    try {
                                                                                        this.form.submit()
                                                                                    } catch (t) {}
                                                                                    this.iframe.attachEvent ? s.onreadystatechange = function () {
                                                                                        "complete" == e.iframe.readyState && c()
                                                                                    } : this.iframe.onload = c;
                                                                                    this.socket.setBuffer(!0)
                                                                                };
                                                                                b.prototype.get = function () {
                                                                                    var b = this,
                                                                                        c = document.createElement("script"),
                                                                                        d = a.util.query(this.socket.options.query, "t=" + +new Date + "&i=" + this.index);
                                                                                    this.script && (this.script.parentNode.removeChild(this.script),
                                                                                    this.script = null);
                                                                                    c.async = !0;
                                                                                    c.src = this.prepareUrl() + d;
                                                                                    c.onerror = function () {
                                                                                        b.onClose()
                                                                                    };
                                                                                    d = document.getElementsByTagName("script")[0];
                                                                                    d.parentNode.insertBefore(c, d);
                                                                                    this.script = c;
                                                                                    e && setTimeout(function () {
                                                                                        var a = document.createElement("iframe");
                                                                                        document.body.appendChild(a);
                                                                                        document.body.removeChild(a)
                                                                                    }, 100)
                                                                                };
                                                                                b.prototype._ = function (a) {
                                                                                    this.onData(a);
                                                                                    this.open && this.get();
                                                                                    return this
                                                                                };
                                                                                b.prototype.ready = function (b, c) {
                                                                                    var d = this;
                                                                                    if (!e) return c.call(this);
                                                                                    a.util.load(function () {
                                                                                        c.call(d)
                                                                                    })
                                                                                };
                                                                                b.check = function () {
                                                                                    return "document" in
                                                                                        c
                                                                                };
                                                                                b.xdomainCheck = function () {
                                                                                    return !0
                                                                                };
                                                                                a.transports.push("jsonp-polling")
                                                                            })("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports, this);
                                                                            var Erizo = Erizo || {};
                                                                            Erizo.EventDispatcher = function (d) {
                                                                                var a = {};
                                                                                d.dispatcher = {};
                                                                                d.dispatcher.eventListeners = {};
                                                                                a.addEventListener = function (a, b) {
                                                                                    void 0 === d.dispatcher.eventListeners[a] && (d.dispatcher.eventListeners[a] = []);
                                                                                    d.dispatcher.eventListeners[a].push(b)
                                                                                };
                                                                                a.removeEventListener = function (a, b) {
                                                                                    var e;
                                                                                    e = d.dispatcher.eventListeners[a].indexOf(b); - 1 !== e && d.dispatcher.eventListeners[a].splice(e, 1)
                                                                                };
                                                                                a.dispatchEvent = function (a) {
                                                                                    var b;
                                                                                    L.Logger.debug("Event: " + a.type);
                                                                                    for (b in d.dispatcher.eventListeners[a.type]) if (d.dispatcher.eventListeners[a.type].hasOwnProperty(b)) d.dispatcher.eventListeners[a.type][b](a)
                                                                                        };
                                                                                    return a
                                                                                };
                                                                                Erizo.LynckiaEvent = function (d) {
                                                                                    var a = {};
                                                                                    a.type = d.type;
                                                                                    return a
                                                                                };
                                                                                Erizo.RoomEvent = function (d) {
                                                                                    var a = Erizo.LynckiaEvent(d);
                                                                                    a.streams = d.streams;
                                                                                    return a
                                                                                };
                                                                                Erizo.StreamEvent = function (d) {
                                                                                    var a = Erizo.LynckiaEvent(d);
                                                                                    a.stream = d.stream;
                                                                                    a.msg = d.msg;
                                                                                    return a
                                                                                };
                                                                                Erizo.PublisherEvent = function (d) {
                                                                                    return Erizo.LynckiaEvent(d)
                                                                                };
                                                                                Erizo = Erizo || {};
                                                                                Erizo.FcStack = function () {
                                                                                    return {
                                                                                        addStream: function () {}
                                                                                    }
                                                                                };
                                                                                Erizo = Erizo || {};
                                                                                Erizo.ChromeStableStack = function (d) {
                                                                                    var a = {}, c = webkitRTCPeerConnection;
                                                                                    a.pc_config = {
                                                                                        iceServers: []
                                                                                    };
                                                                                    void 0 !== d.stunServerUrl && a.pc_config.iceServers.push({
                                                                                        url: d.stunServerUrl
                                                                                    });
                                                                                    a.mediaConstraints = {
                                                                                        mandatory: {
                                                                                            OfferToReceiveVideo: "true",
                                                                                            OfferToReceiveAudio: "true"
                                                                                        }
                                                                                    };
                                                                                    a.roapSessionId = 103;
                                                                                    a.peerConnection = new c(a.pc_config);
                                                                                    a.peerConnection.onicecandidate = function (b) {
                                                                                        console.log("PeerConnection: ", d.session_id);
                                                                                        if (b.candidate) a.iceCandidateCount += 1;
                                                                                        else if (console.log("State: " + a.peerConnection.iceGatheringState), void 0 ===
                                                                                            a.ices && (a.ices = 0), a.ices += 1, console.log(a.ices), 1 <= a.ices && a.moreIceComing) a.moreIceComing = !1, a.markActionNeeded()
                                                                                        };
                                                                                        console.log('Created webkitRTCPeerConnnection with config "' + JSON.stringify(a.pc_config) + '".');
                                                                                        a.processSignalingMessage = function (b) {
                                                                                            console.log("Activity on conn " + a.sessionId);
                                                                                            b = JSON.parse(b);
                                                                                            a.incomingMessage = b;
                                                                                            "new" === a.state ? "OFFER" === b.messageType ? (b = {
                                                                                                sdp: b.sdp,
                                                                                                type: "offer"
                                                                                            }, a.peerConnection.setRemoteDescription(new RTCSessionDescription(b)), a.state = "offer-received", a.markActionNeeded()) :
                                                                                                a.error("Illegal message for this state: " + b.messageType + " in state " + a.state) : "offer-sent" === a.state ? "ANSWER" === b.messageType ? (b = {
                                                                                                sdp: b.sdp,
                                                                                                type: "answer"
                                                                                            }, console.log("Received ANSWER: ", b), a.peerConnection.setRemoteDescription(new RTCSessionDescription(b)), a.sendOK(), a.state = "established") : "pr-answer" === b.messageType ? (b = {
                                                                                                sdp: b.sdp,
                                                                                                type: "pr-answer"
                                                                                            }, a.peerConnection.setRemoteDescription(new RTCSessionDescription(b))) : "offer" === b.messageType ? a.error("Not written yet") : a.error("Illegal message for this state: " +
                                                                                                b.messageType + " in state " + a.state) : "established" === a.state && ("OFFER" === b.messageType ? (b = {
                                                                                                sdp: b.sdp,
                                                                                                type: "offer"
                                                                                            }, a.peerConnection.setRemoteDescription(new RTCSessionDescription(b)), a.state = "offer-received", a.markActionNeeded()) : a.error("Illegal message for this state: " + b.messageType + " in state " + a.state))
                                                                                        };
                                                                                        a.addStream = function (b) {
                                                                                            a.peerConnection.addStream(b);
                                                                                            a.markActionNeeded()
                                                                                        };
                                                                                        a.removeStream = function () {
                                                                                            a.markActionNeeded()
                                                                                        };
                                                                                        a.close = function () {
                                                                                            a.state = "closed";
                                                                                            a.peerConnection.close()
                                                                                        };
                                                                                        a.markActionNeeded = function () {
                                                                                            a.actionNeeded = !0;
                                                                                            a.doLater(function () {
                                                                                                a.onstablestate()
                                                                                            })
                                                                                        };
                                                                                        a.doLater = function (a) {
                                                                                            window.setTimeout(a, 1)
                                                                                        };
                                                                                        a.onstablestate = function () {
                                                                                            var b;
                                                                                            if (a.actionNeeded) {
                                                                                                if ("new" === a.state || "established" === a.state) a.peerConnection.createOffer(function (b) {
                                                                                                        var c = b.sdp;
                                                                                                        console.log("Changed", b.sdp);
                                                                                                        c !== a.prevOffer ? (a.peerConnection.setLocalDescription(b), a.state = "preparing-offer", a.markActionNeeded()) : console.log("Not sending a new offer")
                                                                                                    }, null, a.mediaConstraints);
                                                                                                else if ("preparing-offer" === a.state) {
                                                                                                    if (a.moreIceComing) return;
                                                                                                    a.prevOffer = a.peerConnection.localDescription.sdp;
                                                                                                    console.log("Sending OFFER: ", a.prevOffer);
                                                                                                    a.sendMessage("OFFER", a.prevOffer);
                                                                                                    a.state = "offer-sent"
                                                                                                } else if ("offer-received" === a.state) a.peerConnection.createAnswer(function (b) {
                                                                                                        a.peerConnection.setLocalDescription(b);
                                                                                                        a.state = "offer-received-preparing-answer";
                                                                                                        a.iceStarted ? a.markActionNeeded() : (console.log((new Date).getTime() + ": Starting ICE in responder"), a.iceStarted = !0)
                                                                                                    }, null, a.mediaConstraints);
                                                                                                else if ("offer-received-preparing-answer" === a.state) {
                                                                                                    if (a.moreIceComing) return;
                                                                                                    b = a.peerConnection.localDescription.sdp;
                                                                                                    a.sendMessage("ANSWER", b);
                                                                                                    a.state = "established"
                                                                                                } else a.error("Dazed and confused in state " + a.state + ", stopping here");
                                                                                                a.actionNeeded = !1
                                                                                            }
                                                                                        };
                                                                                        a.sendOK = function () {
                                                                                            a.sendMessage("OK")
                                                                                        };
                                                                                        a.sendMessage = function (b, c) {
                                                                                            var d = {};
                                                                                            d.messageType = b;
                                                                                            d.sdp = c;
                                                                                            "OFFER" === b ? (d.offererSessionId = a.sessionId, d.answererSessionId = a.otherSessionId, d.seq = a.sequenceNumber += 1, d.tiebreaker = Math.floor(429496723 * Math.random() + 1)) : (d.offererSessionId = a.incomingMessage.offererSessionId, d.answererSessionId =
                                                                                                a.sessionId, d.seq = a.incomingMessage.seq);
                                                                                            a.onsignalingmessage(JSON.stringify(d))
                                                                                        };
                                                                                        a.error = function (a) {
                                                                                            throw "Error in RoapOnJsep: " + a;
                                                                                        };
                                                                                        a.sessionId = a.roapSessionId += 1;
                                                                                        a.sequenceNumber = 0;
                                                                                        a.actionNeeded = !1;
                                                                                        a.iceStarted = !1;
                                                                                        a.moreIceComing = !0;
                                                                                        a.iceCandidateCount = 0;
                                                                                        a.onsignalingmessage = d.callback;
                                                                                        a.peerConnection.onopen = function () {
                                                                                            if (a.onopen) a.onopen()
                                                                                            };
                                                                                            a.peerConnection.onaddstream = function (b) {
                                                                                                if (a.onaddstream) a.onaddstream(b)
                                                                                                };
                                                                                                a.peerConnection.onremovestream = function (b) {
                                                                                                    if (a.onremovestream) a.onremovestream(b)
                                                                                                    };
                                                                                                    a.onaddstream = null;
                                                                                                    a.onremovestream = null;
                                                                                                    a.state = "new";
                                                                                                    a.markActionNeeded();
                                                                                                    return a
                                                                                                };
                                                                                                Erizo = Erizo || {};
                                                                                                Erizo.ChromeCanaryStack = function (d) {
                                                                                                    var a = {}, c = webkitRTCPeerConnection;
                                                                                                    a.pc_config = {
                                                                                                        iceServers: []
                                                                                                    };
                                                                                                    void 0 !== d.stunServerUrl && a.pc_config.iceServers.push({
                                                                                                        url: d.stunServerUrl
                                                                                                    });
                                                                                                    a.mediaConstraints = {
                                                                                                        mandatory: {
                                                                                                            OfferToReceiveVideo: "true",
                                                                                                            OfferToReceiveAudio: "true"
                                                                                                        }
                                                                                                    };
                                                                                                    a.roapSessionId = 103;
                                                                                                    a.peerConnection = new c(a.pc_config);
                                                                                                    a.peerConnection.onicecandidate = function (b) {
                                                                                                        console.log("PeerConnection: ", d.session_id);
                                                                                                        if (b.candidate) a.iceCandidateCount += 1;
                                                                                                        else if (console.log("State: " + a.peerConnection.iceGatheringState), void 0 ===
                                                                                                            a.ices && (a.ices = 0), a.ices += 1, console.log(a.ices), 1 <= a.ices && a.moreIceComing) a.moreIceComing = !1, a.markActionNeeded()
                                                                                                        };
                                                                                                        console.log('Created webkitRTCPeerConnnection with config "' + JSON.stringify(a.pc_config) + '".');
                                                                                                        a.processSignalingMessage = function (b) {
                                                                                                            console.log("Activity on conn " + a.sessionId);
                                                                                                            b = JSON.parse(b);
                                                                                                            a.incomingMessage = b;
                                                                                                            "new" === a.state ? "OFFER" === b.messageType ? (b = {
                                                                                                                sdp: b.sdp,
                                                                                                                type: "offer"
                                                                                                            }, a.peerConnection.setRemoteDescription(new RTCSessionDescription(b)), a.state = "offer-received", a.markActionNeeded()) :
                                                                                                                a.error("Illegal message for this state: " + b.messageType + " in state " + a.state) : "offer-sent" === a.state ? "ANSWER" === b.messageType ? (b = {
                                                                                                                sdp: b.sdp,
                                                                                                                type: "answer"
                                                                                                            }, console.log("Received ANSWER: ", b), a.peerConnection.setRemoteDescription(new RTCSessionDescription(b)), a.sendOK(), a.state = "established") : "pr-answer" === b.messageType ? (b = {
                                                                                                                sdp: b.sdp,
                                                                                                                type: "pr-answer"
                                                                                                            }, a.peerConnection.setRemoteDescription(new RTCSessionDescription(b))) : "offer" === b.messageType ? a.error("Not written yet") : a.error("Illegal message for this state: " +
                                                                                                                b.messageType + " in state " + a.state) : "established" === a.state && ("OFFER" === b.messageType ? (b = {
                                                                                                                sdp: b.sdp,
                                                                                                                type: "offer"
                                                                                                            }, a.peerConnection.setRemoteDescription(new RTCSessionDescription(b)), a.state = "offer-received", a.markActionNeeded()) : a.error("Illegal message for this state: " + b.messageType + " in state " + a.state))
                                                                                                        };
                                                                                                        a.addStream = function (b) {
                                                                                                            a.peerConnection.addStream(b);
                                                                                                            a.markActionNeeded()
                                                                                                        };
                                                                                                        a.removeStream = function () {
                                                                                                            a.markActionNeeded()
                                                                                                        };
                                                                                                        a.close = function () {
                                                                                                            a.state = "closed";
                                                                                                            a.peerConnection.close()
                                                                                                        };
                                                                                                        a.markActionNeeded = function () {
                                                                                                            a.actionNeeded = !0;
                                                                                                            a.doLater(function () {
                                                                                                                a.onstablestate()
                                                                                                            })
                                                                                                        };
                                                                                                        a.doLater = function (a) {
                                                                                                            window.setTimeout(a, 1)
                                                                                                        };
                                                                                                        a.onstablestate = function () {
                                                                                                            var b;
                                                                                                            if (a.actionNeeded) {
                                                                                                                if ("new" === a.state || "established" === a.state) a.peerConnection.createOffer(function (b) {
                                                                                                                        var c = b.sdp;
                                                                                                                        console.log("Changed", b.sdp);
                                                                                                                        c !== a.prevOffer ? (a.peerConnection.setLocalDescription(b), a.state = "preparing-offer", a.markActionNeeded()) : console.log("Not sending a new offer")
                                                                                                                    }, null, a.mediaConstraints);
                                                                                                                else if ("preparing-offer" === a.state) {
                                                                                                                    if (a.moreIceComing) return;
                                                                                                                    a.prevOffer = a.peerConnection.localDescription.sdp;
                                                                                                                    console.log("Sending OFFER: ", a.prevOffer);
                                                                                                                    a.sendMessage("OFFER", a.prevOffer);
                                                                                                                    a.state = "offer-sent"
                                                                                                                } else if ("offer-received" === a.state) a.peerConnection.createAnswer(function (b) {
                                                                                                                        a.peerConnection.setLocalDescription(b);
                                                                                                                        a.state = "offer-received-preparing-answer";
                                                                                                                        a.iceStarted ? a.markActionNeeded() : (console.log((new Date).getTime() + ": Starting ICE in responder"), a.iceStarted = !0)
                                                                                                                    }, null, a.mediaConstraints);
                                                                                                                else if ("offer-received-preparing-answer" === a.state) {
                                                                                                                    if (a.moreIceComing) return;
                                                                                                                    b = a.peerConnection.localDescription.sdp;
                                                                                                                    a.sendMessage("ANSWER", b);
                                                                                                                    a.state = "established"
                                                                                                                } else a.error("Dazed and confused in state " + a.state + ", stopping here");
                                                                                                                a.actionNeeded = !1
                                                                                                            }
                                                                                                        };
                                                                                                        a.sendOK = function () {
                                                                                                            a.sendMessage("OK")
                                                                                                        };
                                                                                                        a.sendMessage = function (b, c) {
                                                                                                            var d = {};
                                                                                                            d.messageType = b;
                                                                                                            d.sdp = c;
                                                                                                            "OFFER" === b ? (d.offererSessionId = a.sessionId, d.answererSessionId = a.otherSessionId, d.seq = a.sequenceNumber += 1, d.tiebreaker = Math.floor(429496723 * Math.random() + 1)) : (d.offererSessionId = a.incomingMessage.offererSessionId, d.answererSessionId =
                                                                                                                a.sessionId, d.seq = a.incomingMessage.seq);
                                                                                                            a.onsignalingmessage(JSON.stringify(d))
                                                                                                        };
                                                                                                        a.error = function (a) {
                                                                                                            throw "Error in RoapOnJsep: " + a;
                                                                                                        };
                                                                                                        a.sessionId = a.roapSessionId += 1;
                                                                                                        a.sequenceNumber = 0;
                                                                                                        a.actionNeeded = !1;
                                                                                                        a.iceStarted = !1;
                                                                                                        a.moreIceComing = !0;
                                                                                                        a.iceCandidateCount = 0;
                                                                                                        a.onsignalingmessage = d.callback;
                                                                                                        a.peerConnection.onopen = function () {
                                                                                                            if (a.onopen) a.onopen()
                                                                                                            };
                                                                                                            a.peerConnection.onaddstream = function (b) {
                                                                                                                if (a.onaddstream) a.onaddstream(b)
                                                                                                                };
                                                                                                                a.peerConnection.onremovestream = function (b) {
                                                                                                                    if (a.onremovestream) a.onremovestream(b)
                                                                                                                    };
                                                                                                                    a.onaddstream = null;
                                                                                                                    a.onremovestream = null;
                                                                                                                    a.state = "new";
                                                                                                                    a.markActionNeeded();
                                                                                                                    return a
                                                                                                                };
                                                                                                                Erizo = Erizo || {};
                                                                                                                Erizo.sessionId = 103;
                                                                                                                Erizo.Connection = function (d) {
                                                                                                                    var a = {};
                                                                                                                    d.session_id = Erizo.sessionId += 1;
                                                                                                                    a.browser = "";
                                                                                                                    if ("undefined" !== typeof module && module.exports) L.Logger.error("Publish/subscribe video/audio streams not supported in erizofc yet"), a = Erizo.FcStack(d);
                                                                                                                    else if ("23" === window.navigator.appVersion.match(/Chrome\/([\w\W]*?)\./)[1] || "24" === window.navigator.appVersion.match(/Chrome\/([\w\W]*?)\./)[1]) console.log("Stable!"), a = Erizo.ChromeStableStack(d), a.browser = "chrome-stable";
                                                                                                                    else if ("26" === window.navigator.appVersion.match(/Chrome\/([\w\W]*?)\./)[1] ||
                                                                                                                        "27" === window.navigator.appVersion.match(/Chrome\/([\w\W]*?)\./)[1]) console.log("Canary!"), a = Erizo.ChromeCanaryStack(d), a.browser = "chrome-canary";
                                                                                                                    else if ("25" === window.navigator.appVersion.match(/Bowser\/([\w\W]*?)\./)[1]) a.browser = "bowser";
                                                                                                                    else if ("25" === window.navigator.appVersion.match(/Mozilla\/([\w\W]*?)\./)[1]) a.browser = "mozilla";
                                                                                                                    else throw a.browser = "none", "WebRTC stack not available";
                                                                                                                    return a
                                                                                                                };
                                                                                                                Erizo.GetUserMedia = function (d, a) {
                                                                                                                    if ("undefined" !== typeof module && module.exports) L.Logger.error("Video/audio streams not supported in erizofc yet");
                                                                                                                    else try {
                                                                                                                            navigator.webkitGetUserMedia("audio, video", a), console.log("GetUserMedia BOWSER")
                                                                                                                    } catch (c) {
                                                                                                                        navigator.webkitGetUserMedia(d, a), console.log("GetUserMedia CHROME")
                                                                                                                    }
                                                                                                                };
                                                                                                                Erizo = Erizo || {};
                                                                                                                Erizo.Stream = function (d) {
                                                                                                                    var a = Erizo.EventDispatcher(d),
                                                                                                                        c;
                                                                                                                    a.stream = d.stream;
                                                                                                                    a.room = void 0;
                                                                                                                    a.showing = !1;
                                                                                                                    a.local = !1;
                                                                                                                    if (void 0 === d.local || !0 === d.local) a.local = !0;
                                                                                                                    a.getID = function () {
                                                                                                                        return d.streamID
                                                                                                                    };
                                                                                                                    a.getAttributes = function () {
                                                                                                                        return d.attributes
                                                                                                                    };
                                                                                                                    a.hasAudio = function () {
                                                                                                                        return d.audio
                                                                                                                    };
                                                                                                                    a.hasVideo = function () {
                                                                                                                        return d.video
                                                                                                                    };
                                                                                                                    a.hasData = function () {
                                                                                                                        return d.data
                                                                                                                    };
                                                                                                                    a.sendData = function () {};
                                                                                                                    a.init = function () {
                                                                                                                        try {
                                                                                                                            if (d.audio || d.video) L.Logger.debug("Requested access to local media"), Erizo.GetUserMedia({
                                                                                                                                    video: d.video,
                                                                                                                                    audio: d.audio
                                                                                                                                },

                                                                                                                                function (b) {
                                                                                                                                    L.Logger.info("User has granted access to local media.");
                                                                                                                                    a.stream = b;
                                                                                                                                    b = Erizo.StreamEvent({
                                                                                                                                        type: "access-accepted"
                                                                                                                                    });
                                                                                                                                    a.dispatchEvent(b)
                                                                                                                                }, function (b) {
                                                                                                                                    L.Logger.error("Failed to get access to local media. Error code was " + b.code + ".");
                                                                                                                                    b = Erizo.StreamEvent({
                                                                                                                                        type: "access-denied"
                                                                                                                                    });
                                                                                                                                    a.dispatchEvent(b)
                                                                                                                                });
                                                                                                                            else {
                                                                                                                                var b = Erizo.StreamEvent({
                                                                                                                                    type: "access-accepted"
                                                                                                                                });
                                                                                                                                a.dispatchEvent(b)
                                                                                                                            }
                                                                                                                        } catch (c) {
                                                                                                                            L.Logger.error("Error accessing to local media")
                                                                                                                        }
                                                                                                                    };
                                                                                                                    a.close = function () {
                                                                                                                        a.local && (void 0 !== a.room && a.room.unpublish(a),
                                                                                                                        a.hide(), void 0 !== a.stream && a.stream.stop(), a.stream = void 0)
                                                                                                                    };
                                                                                                                    a.show = function (b, c) {
                                                                                                                        a.elementID = b;
                                                                                                                        if (a.hasVideo() && void 0 !== b) {
                                                                                                                            var d = new Erizo.VideoPlayer({
                                                                                                                                id: a.getID(),
                                                                                                                                stream: a.stream,
                                                                                                                                elementID: b,
                                                                                                                                options: c
                                                                                                                            });
                                                                                                                            a.player = d;
                                                                                                                            a.showing = !0
                                                                                                                        }
                                                                                                                    };
                                                                                                                    a.hide = function () {
                                                                                                                        a.showing && void 0 !== a.player && (a.player.destroy(), a.showing = !1)
                                                                                                                    };
                                                                                                                    c = function () {
                                                                                                                        if (void 0 !== a.player && void 0 !== a.stream) {
                                                                                                                            var b = a.player.video,
                                                                                                                                c = document.defaultView.getComputedStyle(b),
                                                                                                                                d = parseInt(c.getPropertyValue("width"), 10),
                                                                                                                                j = parseInt(c.getPropertyValue("height"),
                                                                                                                                10),
                                                                                                                                g = parseInt(c.getPropertyValue("left"), 10),
                                                                                                                                c = parseInt(c.getPropertyValue("top"), 10),
                                                                                                                                k = document.getElementById(a.elementID),
                                                                                                                                n = document.defaultView.getComputedStyle(k),
                                                                                                                                k = parseInt(n.getPropertyValue("width"), 10),
                                                                                                                                n = parseInt(n.getPropertyValue("height"), 10),
                                                                                                                                h = document.createElement("canvas");
                                                                                                                            h.id = "testing";
                                                                                                                            h.width = k;
                                                                                                                            h.height = n;
                                                                                                                            h.setAttribute("style", "display: none");
                                                                                                                            h.getContext("2d").drawImage(b, g, c, d, j);
                                                                                                                            return h
                                                                                                                        }
                                                                                                                        return null
                                                                                                                    };
                                                                                                                    a.getVideoFrameURL = function () {
                                                                                                                        var a = c();
                                                                                                                        return null !== a ? a.toDataURL() : null
                                                                                                                    };
                                                                                                                    a.getVideoFrame = function () {
                                                                                                                        var a = c();
                                                                                                                        return null !== a ? a.getContext("2d").getImageData(0, 0, a.width, a.height) : null
                                                                                                                    };
                                                                                                                    return a
                                                                                                                };
                                                                                                                Erizo = Erizo || {};
                                                                                                                Erizo.Room = function (d) {
                                                                                                                    var a = Erizo.EventDispatcher(d),
                                                                                                                        c, b, e, f, j;
                                                                                                                    a.remoteStreams = {};
                                                                                                                    a.localStreams = {};
                                                                                                                    a.roomID = "";
                                                                                                                    a.socket = {};
                                                                                                                    a.state = 0;
                                                                                                                    a.addEventListener("room-disconnected", function () {
                                                                                                                        var b, c;
                                                                                                                        a.state = 0;
                                                                                                                        for (b in a.remoteStreams) a.remoteStreams.hasOwnProperty(b) && (c = a.remoteStreams[b], j(c), delete a.remoteStreams[b], c = Erizo.StreamEvent({
                                                                                                                                type: "stream-removed",
                                                                                                                                stream: c
                                                                                                                            }), a.dispatchEvent(c));
                                                                                                                        a.remoteStreams = {};
                                                                                                                        for (b in a.localStreams) a.localStreams.hasOwnProperty(b) && (c = a.localStreams[b], c.pc.close(),
                                                                                                                            delete a.localStreams[b]);
                                                                                                                        try {
                                                                                                                            a.socket.disconnect()
                                                                                                                        } catch (d) {
                                                                                                                            L.Logger.debug("Socket already disconnected")
                                                                                                                        }
                                                                                                                        a.socket = void 0
                                                                                                                    });
                                                                                                                    j = function (a) {
                                                                                                                        void 0 !== a.stream && (a.hide(), a.pc.close(), a.local && a.stream.stop())
                                                                                                                    };
                                                                                                                    f = function (a, c) {
                                                                                                                        a.local && b("sendDataStream", {
                                                                                                                            id: a.getID(),
                                                                                                                            msg: c
                                                                                                                        })
                                                                                                                    };
                                                                                                                    c = function (c, d, e) {
                                                                                                                        delete io.sockets["http://" + c.host];
                                                                                                                        a.socket = io.connect(c.host, {
                                                                                                                            reconnect: !1
                                                                                                                        });
                                                                                                                        a.socket.on("onAddStream", function (b) {
                                                                                                                            console.log(b);
                                                                                                                            var c = Erizo.Stream({
                                                                                                                                streamID: b.id,
                                                                                                                                local: !1,
                                                                                                                                audio: b.audio,
                                                                                                                                video: b.video,
                                                                                                                                data: b.data,
                                                                                                                                attributes: b.attributes
                                                                                                                            });
                                                                                                                            a.remoteStreams[b.id] = c;
                                                                                                                            b = Erizo.StreamEvent({
                                                                                                                                type: "stream-added",
                                                                                                                                stream: c
                                                                                                                            });
                                                                                                                            a.dispatchEvent(b)
                                                                                                                        });
                                                                                                                        a.socket.on("onDataStream", function (b) {
                                                                                                                            var c = a.remoteStreams[b.id],
                                                                                                                                b = Erizo.StreamEvent({
                                                                                                                                    type: "stream-data",
                                                                                                                                    msg: b.msg,
                                                                                                                                    stream: c
                                                                                                                                });
                                                                                                                            c.dispatchEvent(b)
                                                                                                                        });
                                                                                                                        a.socket.on("onRemoveStream", function (b) {
                                                                                                                            var c = a.remoteStreams[b.id];
                                                                                                                            delete a.remoteStreams[b.id];
                                                                                                                            j(c);
                                                                                                                            b = Erizo.StreamEvent({
                                                                                                                                type: "stream-removed",
                                                                                                                                stream: c
                                                                                                                            });
                                                                                                                            a.dispatchEvent(b)
                                                                                                                        });
                                                                                                                        a.socket.on("disconnect", function () {
                                                                                                                            L.Logger.info("Socket disconnected");
                                                                                                                            var b = Erizo.RoomEvent({
                                                                                                                                type: "room-disconnected"
                                                                                                                            });
                                                                                                                            a.dispatchEvent(b)
                                                                                                                        });
                                                                                                                        b("token", c, d, e)
                                                                                                                    };
                                                                                                                    b = function (b, c, d, e) {
                                                                                                                        a.socket.emit(b, c, function (a, b) {
                                                                                                                            "success" === a ? void 0 !== d && d(b) : void 0 !== e && e(b)
                                                                                                                        })
                                                                                                                    };
                                                                                                                    e = function (b, c, d, e) {
                                                                                                                        a.socket.emit(b, c, d, function (a, b) {
                                                                                                                            void 0 !== e && e(a, b)
                                                                                                                        })
                                                                                                                    };
                                                                                                                    a.connect = function () {
                                                                                                                        var b = L.Base64.decodeBase64(d.token);
                                                                                                                        0 !== a.state && L.Logger.error("Room already connected");
                                                                                                                        a.state = 1;
                                                                                                                        c(JSON.parse(b), function (b) {
                                                                                                                            var c = 0,
                                                                                                                                d = [],
                                                                                                                                g, e, f;
                                                                                                                            g = b.streams;
                                                                                                                            e = b.id;
                                                                                                                            a.stunServerUrl = b.stunServerUrl;
                                                                                                                            a.state = 2;
                                                                                                                            for (c in g) g.hasOwnProperty(c) &&
                                                                                                                                    (f = g[c], b = Erizo.Stream({
                                                                                                                                    streamID: f.id,
                                                                                                                                    local: !1,
                                                                                                                                    audio: f.audio,
                                                                                                                                    video: f.video,
                                                                                                                                    data: f.data,
                                                                                                                                    attributes: f.attributes
                                                                                                                                }), d.push(b), a.remoteStreams[f.id] = b);
                                                                                                                            a.roomID = e;
                                                                                                                            L.Logger.info("Connected to room " + a.roomID);
                                                                                                                            c = Erizo.RoomEvent({
                                                                                                                                type: "room-connected",
                                                                                                                                streams: d
                                                                                                                            });
                                                                                                                            a.dispatchEvent(c)
                                                                                                                        }, function (a) {
                                                                                                                            L.Logger.error("Not Connected! Error: " + a)
                                                                                                                        })
                                                                                                                    };
                                                                                                                    a.disconnect = function () {
                                                                                                                        var b = Erizo.RoomEvent({
                                                                                                                            type: "room-disconnected"
                                                                                                                        });
                                                                                                                        a.dispatchEvent(b)
                                                                                                                    };
                                                                                                                    a.publish = function (b) {
                                                                                                                        b.local && void 0 === a.localStreams[b.getID()] && (b.hasAudio() ||
                                                                                                                            b.hasVideo() ? (b.pc = Erizo.Connection({
                                                                                                                            callback: function (c) {
                                                                                                                                e("publish", {
                                                                                                                                    state: "offer",
                                                                                                                                    data: !0,
                                                                                                                                    audio: b.hasAudio(),
                                                                                                                                    video: b.hasVideo(),
                                                                                                                                    attributes: b.getAttributes()
                                                                                                                                }, c, function (c, d) {
                                                                                                                                    b.pc.onsignalingmessage = function (c) {
                                                                                                                                        b.pc.onsignalingmessage = function () {};
                                                                                                                                        e("publish", {
                                                                                                                                            state: "ok",
                                                                                                                                            streamId: d,
                                                                                                                                            data: !0,
                                                                                                                                            audio: b.hasAudio(),
                                                                                                                                            video: b.hasVideo(),
                                                                                                                                            attributes: b.getAttributes()
                                                                                                                                        }, c);
                                                                                                                                        L.Logger.info("Stream published");
                                                                                                                                        b.getID = function () {
                                                                                                                                            return d
                                                                                                                                        };
                                                                                                                                        b.sendData = function (a) {
                                                                                                                                            f(b, a)
                                                                                                                                        };
                                                                                                                                        a.localStreams[d] = b;
                                                                                                                                        b.room = a
                                                                                                                                    };
                                                                                                                                    b.pc.processSignalingMessage(c)
                                                                                                                                })
                                                                                                                            },
                                                                                                                            stunServerUrl: a.stunServerUrl
                                                                                                                        }), b.pc.addStream(b.stream)) : b.hasData() && e("publish", {
                                                                                                                            state: "data",
                                                                                                                            data: !0,
                                                                                                                            audio: !1,
                                                                                                                            video: !1,
                                                                                                                            attributes: b.getAttributes()
                                                                                                                        }, void 0, function (c, d) {
                                                                                                                            L.Logger.info("Stream published");
                                                                                                                            b.getID = function () {
                                                                                                                                return d
                                                                                                                            };
                                                                                                                            b.sendData = function (a) {
                                                                                                                                f(b, a)
                                                                                                                            };
                                                                                                                            a.localStreams[d] = b;
                                                                                                                            b.room = a
                                                                                                                        }))
                                                                                                                    };
                                                                                                                    a.unpublish = function (c) {
                                                                                                                        if (c.local) {
                                                                                                                            b("unpublish", c.getID());
                                                                                                                            c.room = void 0;
                                                                                                                            if (c.hasAudio() || c.hasVideo()) c.pc.close(), c.pc = void 0;
                                                                                                                            delete a.localStreams[c.getID()];
                                                                                                                            c.getID = function () {};
                                                                                                                            c.sendData = function () {}
                                                                                                                        }
                                                                                                                    };
                                                                                                                    a.subscribe = function (b) {
                                                                                                                        b.local || (b.hasVideo() || b.hasAudio() ? (b.pc = Erizo.Connection({
                                                                                                                            callback: function (a) {
                                                                                                                                e("subscribe", {
                                                                                                                                    streamId: b.getID()
                                                                                                                                }, a, function (a) {
                                                                                                                                    b.pc.processSignalingMessage(a)
                                                                                                                                })
                                                                                                                            },
                                                                                                                            stunServerUrl: a.stunServerUrl
                                                                                                                        }), b.pc.onaddstream = function (c) {
                                                                                                                            L.Logger.info("Stream subscribed");
                                                                                                                            b.stream = c.stream;
                                                                                                                            c = Erizo.StreamEvent({
                                                                                                                                type: "stream-subscribed",
                                                                                                                                stream: b
                                                                                                                            });
                                                                                                                            a.dispatchEvent(c)
                                                                                                                        }) : b.hasData() && e("subscribe", {
                                                                                                                            streamId: b.getID()
                                                                                                                        }, void 0, function () {
                                                                                                                            L.Logger.info("Stream subscribed");
                                                                                                                            var c = Erizo.StreamEvent({
                                                                                                                                type: "stream-subscribed",
                                                                                                                                stream: b
                                                                                                                            });
                                                                                                                            a.dispatchEvent(c)
                                                                                                                        }), L.Logger.info("Subscribing to: " + b.getID()))
                                                                                                                    };
                                                                                                                    a.unsubscribe = function (c) {
                                                                                                                        void 0 !== a.socket && (c.local || b("unsubscribe", c.getID(), function () {
                                                                                                                            j(c)
                                                                                                                        }, function () {
                                                                                                                            L.Logger.error("Error calling unsubscribe.")
                                                                                                                        }))
                                                                                                                    };
                                                                                                                    a.getStreamsByAttribute = function (b, c) {
                                                                                                                        var d = [],
                                                                                                                            e, f;
                                                                                                                        for (e in a.remoteStreams) a.remoteStreams.hasOwnProperty(e) && (f = a.remoteStreams[e], void 0 !== f.getAttributes() && void 0 !== f.getAttributes()[b] && f.getAttributes()[b] === c && d.push(f));
                                                                                                                        return d
                                                                                                                    };
                                                                                                                    return a
                                                                                                                };
                                                                                                                var L = L || {};
                                                                                                                L.Logger = function (d) {
                                                                                                                    return {
                                                                                                                        DEBUG: 0,
                                                                                                                        TRACE: 1,
                                                                                                                        INFO: 2,
                                                                                                                        WARNING: 3,
                                                                                                                        ERROR: 4,
                                                                                                                        NONE: 5,
                                                                                                                        enableLogPanel: function () {
                                                                                                                            d.Logger.panel = document.createElement("textarea");
                                                                                                                            d.Logger.panel.setAttribute("id", "lynckia-logs");
                                                                                                                            d.Logger.panel.setAttribute("style", "width: 100%; height: 100%; display: none");
                                                                                                                            d.Logger.panel.setAttribute("rows", 20);
                                                                                                                            d.Logger.panel.setAttribute("cols", 20);
                                                                                                                            d.Logger.panel.setAttribute("readOnly", !0);
                                                                                                                            document.body.appendChild(d.Logger.panel)
                                                                                                                        },
                                                                                                                        setLogLevel: function (a) {
                                                                                                                            a > d.Logger.NONE ? a = d.Logger.NONE : a <
                                                                                                                                d.Logger.DEBUG && (a = d.Logger.DEBUG);
                                                                                                                            d.Logger.logLevel = a
                                                                                                                        },
                                                                                                                        log: function (a, c) {
                                                                                                                            var b = "";
                                                                                                                            a < d.Logger.logLevel || (a === d.Logger.DEBUG ? b += "DEBUG" : a === d.Logger.TRACE ? b += "TRACE" : a === d.Logger.INFO ? b += "INFO" : a === d.Logger.WARNING ? b += "WARNING" : a === d.Logger.ERROR && (b += "ERROR"), b = b + ": " + c, void 0 !== d.Logger.panel ? d.Logger.panel.value = d.Logger.panel.value + "\n" + b : console.log(b))
                                                                                                                        },
                                                                                                                        debug: function (a) {
                                                                                                                            d.Logger.log(d.Logger.DEBUG, a)
                                                                                                                        },
                                                                                                                        trace: function (a) {
                                                                                                                            d.Logger.log(d.Logger.TRACE, a)
                                                                                                                        },
                                                                                                                        info: function (a) {
                                                                                                                            d.Logger.log(d.Logger.INFO,
                                                                                                                            a)
                                                                                                                        },
                                                                                                                        warning: function (a) {
                                                                                                                            d.Logger.log(d.Logger.WARNING, a)
                                                                                                                        },
                                                                                                                        error: function (a) {
                                                                                                                            d.Logger.log(d.Logger.ERROR, a)
                                                                                                                        }
                                                                                                                    }
                                                                                                                }(L);
                                                                                                                L = L || {};
                                                                                                                L.Base64 = function () {
                                                                                                                    var d, a, c, b, e, f, j, g, k;
                                                                                                                    d = "A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,0,1,2,3,4,5,6,7,8,9,+,/".split(",");
                                                                                                                    a = [];
                                                                                                                    for (e = 0; e < d.length; e += 1) a[d[e]] = e;
                                                                                                                    f = function (a) {
                                                                                                                        c = a;
                                                                                                                        b = 0
                                                                                                                    };
                                                                                                                    j = function () {
                                                                                                                        var a;
                                                                                                                        if (!c || b >= c.length) return -1;
                                                                                                                        a = c.charCodeAt(b) & 255;
                                                                                                                        b += 1;
                                                                                                                        return a
                                                                                                                    };
                                                                                                                    g = function () {
                                                                                                                        if (!c) return -1;
                                                                                                                        for (;;) {
                                                                                                                            if (b >= c.length) return -1;
                                                                                                                            var d = c.charAt(b);
                                                                                                                            b += 1;
                                                                                                                            if (a[d]) return a[d];
                                                                                                                            if ("A" === d) return 0
                                                                                                                            }
                                                                                                                        };
                                                                                                                        k = function (a) {
                                                                                                                            a = a.toString(16);
                                                                                                                            1 === a.length && (a =
                                                                                                                                "0" + a);
                                                                                                                            return unescape("%" + a)
                                                                                                                        };
                                                                                                                        return {
                                                                                                                            encodeBase64: function (a) {
                                                                                                                                var b, c, e;
                                                                                                                                f(a);
                                                                                                                                a = "";
                                                                                                                                b = Array(3);
                                                                                                                                c = 0;
                                                                                                                                for (e = !1; !e && -1 !== (b[0] = j());) if (b[1] = j(), b[2] = j(), a += d[b[0] >> 2], -1 !== b[1] ? (a += d[b[0] << 4 & 48 | b[1] >> 4], -1 !== b[2] ? (a += d[b[1] << 2 & 60 | b[2] >> 6], a += d[b[2] & 63]) : (a += d[b[1] << 2 & 60], a += "=", e = !0)) : (a += d[b[0] << 4 & 48], a += "=", a += "=", e = !0), c += 4, 76 <= c) a += "\n", c = 0;
                                                                                                                                return a
                                                                                                                            },
                                                                                                                            decodeBase64: function (a) {
                                                                                                                                var b, c;
                                                                                                                                f(a);
                                                                                                                                a = "";
                                                                                                                                b = Array(4);
                                                                                                                                for (c = !1; !c && -1 !== (b[0] = g()) && -1 !== (b[1] = g());) b[2] = g(), b[3] = g(), a += k(b[0] << 2 & 255 | b[1] >> 4), -1 !==
                                                                                                                                        b[2] ? (a += k(b[1] << 4 & 255 | b[2] >> 2), -1 !== b[3] ? a += k(b[2] << 6 & 255 | b[3]) : c = !0) : c = !0;
                                                                                                                                return a
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }(L);
                                                                                                                    Erizo = Erizo || {};
                                                                                                                    Erizo.View = function () {
                                                                                                                        var d = Erizo.EventDispatcher({});
                                                                                                                        d.url = "http://chotis2.dit.upm.es:3000";
                                                                                                                        return d
                                                                                                                    };
                                                                                                                    Erizo = Erizo || {};
                                                                                                                    Erizo.VideoPlayer = function (d) {
                                                                                                                        var a = Erizo.View({});
                                                                                                                        a.id = d.id;
                                                                                                                        a.stream = d.stream;
                                                                                                                        a.elementID = d.elementID;
                                                                                                                        a.destroy = function () {
                                                                                                                            a.video.pause();
                                                                                                                            clearInterval(a.resize);
                                                                                                                            a.parentNode.removeChild(a.div)
                                                                                                                        };
                                                                                                                        //Why is this even here?
                                                                                                                        //window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (a, b, d) {
                                                                                                                            //document.getElementById(b).value = unescape(d)
                                                                                                                        //});
                                                                                                                        console.log("href: " + window.location.href);
                                                                                                                        L.Logger.debug("Creating URL from stream " + a.stream);
                                                                                                                        a.stream_url = webkitURL.createObjectURL(a.stream);
                                                                                                                        a.div = document.createElement("div");
                                                                                                                        a.div.setAttribute("id", "player_" + a.id);
                                                                                                                        a.div.setAttribute("style",
                                                                                                                            "width: 100%; height: 100%; position: relative; background-color: black; overflow: hidden;");
                                                                                                                        a.loader = document.createElement("img");
                                                                                                                        a.loader.setAttribute("style", "width: 16px; height: 16px; position: absolute; top: 50%; left: 50%; margin-top: -8px; margin-left: -8px");
                                                                                                                        a.loader.setAttribute("id", "back_" + a.id);
                                                                                                                        a.loader.setAttribute("src", a.url + "/assets/loader.gif");
                                                                                                                        a.video = document.createElement("video");
                                                                                                                        a.video.setAttribute("id", "stream" + a.id);
                                                                                                                        a.video.setAttribute("style", "width: 100%; height: 100%; position: absolute");
                                                                                                                        a.video.setAttribute("autoplay", "autoplay");
                                                                                                                        void 0 !== a.elementID ? (document.getElementById(a.elementID).appendChild(a.div), a.container = document.getElementById(a.elementID)) : (document.body.appendChild(a.div), a.container = document.body);
                                                                                                                        a.parentNode = a.div.parentNode;
                                                                                                                        a.div.appendChild(a.loader);
                                                                                                                        a.div.appendChild(a.video);
                                                                                                                        a.containerWidth = 0;
                                                                                                                        a.containerHeight = 0;
                                                                                                                        a.resize = setInterval(function () {
                                                                                                                            var c = a.container.offsetWidth,
                                                                                                                                b = a.container.offsetHeight;
                                                                                                                            if (c !== a.containerWidth || b !== a.containerHeight) {
                                                                                                                                if (c * 0.75 >
                                                                                                                                    b) {
                                                                                                                                    a.video.style.width = c + "px";
                                                                                                                                    a.video.style.height = 0.75 * c + "px";
                                                                                                                                    a.video.style.top = -(0.75 * c / 2 - b / 2) + "px";
                                                                                                                                    a.video.style.left = "0px"
                                                                                                                                } else {
                                                                                                                                    a.video.style.height = b + "px";
                                                                                                                                    a.video.style.width = 4 / 3 * b + "px";
                                                                                                                                    a.video.style.left = -(4 / 3 * b / 2 - c / 2) + "px";
                                                                                                                                    a.video.style.top = "0px"
                                                                                                                                }
                                                                                                                                a.containerWidth = c;
                                                                                                                                a.containerHeight = b
                                                                                                                            }
                                                                                                                        }, 500);
                                                                                                                        a.bar = new Erizo.Bar({
                                                                                                                            elementID: "player_" + a.id,
                                                                                                                            id: a.id,
                                                                                                                            video: a.video,
                                                                                                                            options: d.options
                                                                                                                        });
                                                                                                                        a.div.onmouseover = function () {
                                                                                                                            a.bar.display()
                                                                                                                        };
                                                                                                                        a.div.onmouseout = function () {
                                                                                                                            a.bar.hide()
                                                                                                                        };
                                                                                                                        a.video.src = a.stream_url;
                                                                                                                        return a
                                                                                                                    };
                                                                                                                    Erizo = Erizo || {};
                                                                                                                    Erizo.Bar = function (d) {
                                                                                                                        var a = Erizo.View({}),
                                                                                                                            c, b;
                                                                                                                        a.elementID = d.elementID;
                                                                                                                        a.id = d.id;
                                                                                                                        a.div = document.createElement("div");
                                                                                                                        a.div.setAttribute("id", "bar_" + a.id);
                                                                                                                        a.bar = document.createElement("div");
                                                                                                                        a.bar.setAttribute("style", "width: 100%; height: 15%; max-height: 30px; position: absolute; bottom: 0; right: 0; background-color: rgba(255,255,255,0.62)");
                                                                                                                        a.bar.setAttribute("id", "subbar_" + a.id);
                                                                                                                        /*a.link = document.createElement("a");
                                                                                                                        a.link.setAttribute("href", "http://www.lynckia.com/");
                                                                                                                        a.link.setAttribute("target", "_blank");
                                                                                                                        a.logo = document.createElement("img");
                                                                                                                        a.logo.setAttribute("style", "width: 10%; height: 100%; max-width: 30px; position: absolute; top: 0; left: 2px;");
                                                                                                                        a.logo.setAttribute("alt", "Lynckia");
                                                                                                                        a.logo.setAttribute("src", a.url + "/assets/star.svg");*/
                                                                                                                        b = function (b) {
                                                                                                                            "block" !== b ? b = "none" : clearTimeout(c);
                                                                                                                            a.div.setAttribute("style", "width: 100%; height: 100%; position: relative; bottom: 0; right: 0; display:" + b)
                                                                                                                        };
                                                                                                                        a.display = function () {
                                                                                                                            b("block")
                                                                                                                        };
                                                                                                                        a.hide = function () {
                                                                                                                            c = setTimeout(b, 1E3)
                                                                                                                        };
                                                                                                                        document.getElementById(a.elementID).appendChild(a.div);
                                                                                                                        a.div.appendChild(a.bar);
                                                                                                                        //a.bar.appendChild(a.link);
                                                                                                                        //a.link.appendChild(a.logo);
                                                                                                                        if (void 0 === d.options || void 0 === d.options.speaker || !0 === d.options.speaker) a.speaker = new Erizo.Speaker({
                                                                                                                                elementID: "subbar_" + a.id,
                                                                                                                                id: a.id,
                                                                                                                                video: d.video
                                                                                                                            });
                                                                                                                        a.display();
                                                                                                                        a.hide();
                                                                                                                        return a
                                                                                                                    };
                                                                                                                    Erizo = Erizo || {};
                                                                                                                    Erizo.Speaker = function (d) {
                                                                                                                        var a = Erizo.View({}),
                                                                                                                            c;
                                                                                                                        a.elementID = d.elementID;
                                                                                                                        a.video = d.video;
                                                                                                                        a.id = d.id;
                                                                                                                        a.div = document.createElement("div");
                                                                                                                        a.div.setAttribute("style", "width: 10%; height: 100%; max-width: 30px; position: absolute; bottom: 0; right: 0;");
                                                                                                                        a.icon = document.createElement("img");
                                                                                                                        a.icon.setAttribute("id", "volume_" + a.id);
                                                                                                                        a.icon.setAttribute("src", a.url + "/assets/sound48.png");
                                                                                                                        a.icon.setAttribute("style", "width: 100%; height: 100%; position: absolute;");
                                                                                                                        a.div.appendChild(a.icon);
                                                                                                                        a.picker = document.createElement("input");
                                                                                                                        a.picker.setAttribute("id", "picker_" + a.id);
                                                                                                                        a.picker.type = "range";
                                                                                                                        a.picker.min = 0;
                                                                                                                        a.picker.max = 100;
                                                                                                                        a.picker.step = 10;
                                                                                                                        a.picker.value = 50;
                                                                                                                        a.div.appendChild(a.picker);
                                                                                                                        a.video.volume = a.picker.value / 100;
                                                                                                                        a.picker.oninput = function () {
                                                                                                                            0 < a.picker.value ? a.icon.setAttribute("src", a.url + "/assets/sound48.png") : a.icon.setAttribute("src", a.url + "/assets/mute48.png");
                                                                                                                            a.video.volume = a.picker.value / 100
                                                                                                                        };
                                                                                                                        c = function (b) {
                                                                                                                            a.picker.setAttribute("style", "width: 32px; height: 100px; position: absolute; bottom: " + a.div.offsetHeight +
                                                                                                                                "px; right: 0px; -webkit-appearance: slider-vertical; display: " + b)
                                                                                                                        };
                                                                                                                        a.div.onmouseover = function () {
                                                                                                                            c("block")
                                                                                                                        };
                                                                                                                        a.div.onmouseout = function () {
                                                                                                                            c("none")
                                                                                                                        };
                                                                                                                        c("none");
                                                                                                                        document.getElementById(a.elementID).appendChild(a.div);
                                                                                                                        return a
                                                                                                                    };