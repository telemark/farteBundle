window.matchMedia || (window.matchMedia = function() {
    "use strict";
    var a = window.styleMedia || window.media;
    if (!a) {
        var b = document.createElement("style"), c = document.getElementsByTagName("script")[0], d = null;
        b.type = "text/css";
        b.id = "matchmediajs-test";
        c.parentNode.insertBefore(b, c);
        d = "getComputedStyle" in window && window.getComputedStyle(b, null) || b.currentStyle;
        a = {
            matchMedium: function(a) {
                var c = "@media " + a + "{ #matchmediajs-test { width: 1px; } }";
                if (b.styleSheet) {
                    b.styleSheet.cssText = c;
                } else {
                    b.textContent = c;
                }
                return d.width === "1px";
            }
        };
    }
    return function(b) {
        return {
            matches: a.matchMedium(b || "all"),
            media: b || "all"
        };
    };
}());

(function(a, b) {
    "use strict";
    if (a.HTMLPictureElement) {
        return;
    }
    b.createElement("picture");
    var c = {};
    c.ns = "picturefill";
    c.srcsetSupported = new a.Image().srcset !== undefined;
    c.trim = function(a) {
        return a.trim ? a.trim() : a.replace(/^\s+|\s+$/g, "");
    };
    c.endsWith = function(a, b) {
        return a.endsWith ? a.endsWith(b) : a.indexOf(b, a.length - b.length) !== -1;
    };
    c.matchesMedia = function(b) {
        return a.matchMedia && a.matchMedia(b).matches;
    };
    c.getDpr = function() {
        return a.devicePixelRatio || 1;
    };
    c.getWidthFromLength = function(a) {
        a = a && parseFloat(a) > 0 ? a : "100%";
        if (!c.lengthEl) {
            c.lengthEl = b.createElement("div");
            b.documentElement.insertBefore(c.lengthEl, b.documentElement.firstChild);
        }
        c.lengthEl.style.cssText = "width: " + a + ";";
        return c.lengthEl.offsetWidth;
    };
    c.types = {};
    c.types["image/svg+xml"] = b.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1");
    c.types["image/webp"] = function() {
        var b = new a.Image(), e = "image/webp";
        b.onerror = function() {
            c.types[e] = false;
            d();
        };
        b.onload = function() {
            c.types[e] = b.width === 1;
            d();
        };
        b.src = "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=";
    };
    c.verifyTypeSupport = function(a) {
        var b = a.getAttribute("type");
        if (b === null || b === "") {
            return true;
        } else {
            if (typeof c.types[b] === "function") {
                c.types[b]();
                return "pending";
            } else {
                return c.types[b];
            }
        }
    };
    c.parseSize = function(a) {
        var b = /(\([^)]+\))?\s*(.+)/g.exec(a);
        return {
            media: b && b[1],
            length: b && b[2]
        };
    };
    c.findWidthFromSourceSize = function(a) {
        var b = c.trim(a).split(/\s*,\s*/), d;
        for (var e = 0, f = b.length; e < f; e++) {
            var g = b[e], h = c.parseSize(g), i = h.length, j = h.media;
            if (!i) {
                continue;
            }
            if (!j || c.matchesMedia(j)) {
                d = i;
                break;
            }
        }
        return c.getWidthFromLength(d);
    };
    c.getCandidatesFromSourceSet = function(a, b) {
        var d = c.trim(a).split(/,\s+/), e = b ? c.findWidthFromSourceSize(b) : "100%", f = [];
        for (var g = 0, h = d.length; g < h; g++) {
            var i = d[g], j = i.split(/\s+/), k = j[1], l;
            if (k && (k.slice(-1) === "w" || k.slice(-1) === "x")) {
                k = k.slice(0, -1);
            }
            if (b) {
                l = parseFloat((parseInt(k, 10) / e).toFixed(2));
            } else {
                l = k ? parseFloat(k, 10) : 1;
            }
            var m = {
                url: j[0],
                resolution: l
            };
            f.push(m);
        }
        return f;
    };
    c.dodgeSrcset = function(a) {
        if (a.srcset) {
            a[c.ns].srcset = a.srcset;
            a.removeAttribute("srcset");
        }
    };
    c.processSourceSet = function(a) {
        var b = a.getAttribute("srcset"), d = a.getAttribute("sizes"), e = [];
        if (a.nodeName.toUpperCase() === "IMG" && a[c.ns] && a[c.ns].srcset) {
            b = a[c.ns].srcset;
        }
        if (b) {
            e = c.getCandidatesFromSourceSet(b, d);
        }
        return e;
    };
    c.applyBestCandidate = function(a, b) {
        var d, e, f;
        a.sort(c.ascendingSort);
        e = a.length;
        f = a[e - 1];
        for (var g = 0; g < e; g++) {
            d = a[g];
            if (d.resolution >= c.getDpr()) {
                f = d;
                break;
            }
        }
        if (!c.endsWith(b.src, f.url)) {
            b.src = f.url;
            b.currentSrc = b.src;
        }
    };
    c.ascendingSort = function(a, b) {
        return a.resolution - b.resolution;
    };
    c.removeVideoShim = function(a) {
        var b = a.getElementsByTagName("video");
        if (b.length) {
            var c = b[0], d = c.getElementsByTagName("source");
            while (d.length) {
                a.insertBefore(d[0], c);
            }
            c.parentNode.removeChild(c);
        }
    };
    c.getAllElements = function() {
        var a = b.getElementsByTagName("picture"), d = [], e = b.getElementsByTagName("img");
        for (var f = 0, g = a.length + e.length; f < g; f++) {
            if (f < a.length) {
                d[f] = a[f];
            } else {
                var h = e[f - a.length];
                if (h.parentNode.nodeName.toUpperCase() !== "PICTURE" && (c.srcsetSupported && h.getAttribute("sizes") || h.getAttribute("srcset") !== null)) {
                    d.push(h);
                }
            }
        }
        return d;
    };
    c.getMatch = function(a) {
        var b = a.childNodes, d;
        for (var e = 0, f = b.length; e < f; e++) {
            var g = b[e];
            if (g.nodeType !== 1) {
                continue;
            }
            if (g.nodeName.toUpperCase() === "IMG") {
                return d;
            }
            if (g.nodeName.toUpperCase() !== "SOURCE") {
                continue;
            }
            var h = g.getAttribute("media");
            if (!g.getAttribute("srcset")) {
                continue;
            }
            if (!h || c.matchesMedia(h)) {
                var i = c.verifyTypeSupport(g);
                if (i === true) {
                    d = g;
                    break;
                } else if (i === "pending") {
                    return false;
                }
            }
        }
        return d;
    };
    function d(a) {
        var b, d, e, f, g, h;
        a = a || {};
        b = a.elements || c.getAllElements();
        for (var i = 0, j = b.length; i < j; i++) {
            d = b[i];
            e = d.nodeName.toUpperCase();
            f = undefined;
            g = undefined;
            h = undefined;
            if (!d[c.ns]) {
                d[c.ns] = {};
            }
            if (!a.reevaluate && d[c.ns].evaluated) {
                continue;
            }
            if (e === "PICTURE") {
                c.removeVideoShim(d);
                f = c.getMatch(d);
                if (f === false) {
                    continue;
                }
                h = d.getElementsByTagName("img")[0];
            } else {
                f = undefined;
                h = d;
            }
            if (h) {
                if (!h[c.ns]) {
                    h[c.ns] = {};
                }
                if (h.srcset) {
                    c.dodgeSrcset(h);
                }
                if (f) {
                    g = c.processSourceSet(f);
                    c.applyBestCandidate(g, h);
                } else {
                    g = c.processSourceSet(h);
                    if (h.srcset === undefined || h.getAttribute("sizes")) {
                        c.applyBestCandidate(g, h);
                    }
                }
                d[c.ns].evaluated = true;
            }
        }
    }
    function e() {
        d();
        var c = setInterval(function() {
            a.picturefill();
            if (/^loaded|^i|^c/.test(b.readyState)) {
                clearInterval(c);
                return;
            }
        }, 250);
        if (a.addEventListener) {
            var e;
            a.addEventListener("resize", function() {
                a.clearTimeout(e);
                e = a.setTimeout(function() {
                    d({
                        reevaluate: true
                    });
                }, 60);
            }, false);
        }
    }
    e();
    d._ = c;
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = d;
    } else if (typeof define === "object" && define.amd) {
        define(function() {
            return d;
        });
    } else if (typeof a === "object") {
        a.picturefill = d;
    }
})(this, this.document);