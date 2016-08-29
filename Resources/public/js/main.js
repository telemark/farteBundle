/*! telemark-frontend - v0.0.0 - 2015-06-18 *//*!
 * SVGeezy.js 1.0
 *
 * Copyright 2012, Ben Howdle http://twostepmedia.co.uk
 * Released under the WTFPL license
 * http://sam.zoy.org/wtfpl/
 *
 * Date: Sun Aug 26 20:38 2012 GMT
 *  //call like so, pass in a class name that you don't want it to check and a filetype to replace .svg with
 *  svgeezy.init('nocheck', 'png');
*/
var svgeezy = function() {
    return {
        init: function(a, b) {
            this.avoid = a || !1, this.filetype = b || "png", this.svgSupport = this.supportsSvg(),
            this.svgSupport || (this.images = document.getElementsByTagName("img"), this.imgL = this.images.length,
            this.fallbacks());
        },
        fallbacks: function() {
            for (;this.imgL--; ) if (!this.hasClass(this.images[this.imgL], this.avoid) || !this.avoid) {
                var a = this.images[this.imgL].getAttribute("src");
                if (null === a) continue;
                if ("svg" == this.getFileExt(a)) {
                    var b = a.replace(".svg", "." + this.filetype);
                    this.images[this.imgL].setAttribute("src", b);
                }
            }
        },
        getFileExt: function(a) {
            var b = a.split(".").pop();
            return -1 !== b.indexOf("?") && (b = b.split("?")[0]), b;
        },
        hasClass: function(a, b) {
            return (" " + a.className + " ").indexOf(" " + b + " ") > -1;
        },
        supportsSvg: function() {
            return document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1");
        }
    };
}();

/**
 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
 *
 * @version 0.6.12
 * @codingstandard ftlabs-jsv2
 * @copyright The Financial Times Limited [All Rights Reserved]
 * @license MIT License (see LICENSE.txt)
 */
function FastClick(a) {
    "use strict";
    var b, c = this;
    this.trackingClick = false;
    this.trackingClickStart = 0;
    this.targetElement = null;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.lastTouchIdentifier = 0;
    this.touchBoundary = 10;
    this.layer = a;
    if (!a || !a.nodeType) {
        throw new TypeError("Layer must be a document node");
    }
    this.onClick = function() {
        return FastClick.prototype.onClick.apply(c, arguments);
    };
    this.onMouse = function() {
        return FastClick.prototype.onMouse.apply(c, arguments);
    };
    this.onTouchStart = function() {
        return FastClick.prototype.onTouchStart.apply(c, arguments);
    };
    this.onTouchMove = function() {
        return FastClick.prototype.onTouchMove.apply(c, arguments);
    };
    this.onTouchEnd = function() {
        return FastClick.prototype.onTouchEnd.apply(c, arguments);
    };
    this.onTouchCancel = function() {
        return FastClick.prototype.onTouchCancel.apply(c, arguments);
    };
    if (FastClick.notNeeded(a)) {
        return;
    }
    if (this.deviceIsAndroid) {
        a.addEventListener("mouseover", this.onMouse, true);
        a.addEventListener("mousedown", this.onMouse, true);
        a.addEventListener("mouseup", this.onMouse, true);
    }
    a.addEventListener("click", this.onClick, true);
    a.addEventListener("touchstart", this.onTouchStart, false);
    a.addEventListener("touchmove", this.onTouchMove, false);
    a.addEventListener("touchend", this.onTouchEnd, false);
    a.addEventListener("touchcancel", this.onTouchCancel, false);
    if (!Event.prototype.stopImmediatePropagation) {
        a.removeEventListener = function(b, c, d) {
            var e = Node.prototype.removeEventListener;
            if (b === "click") {
                e.call(a, b, c.hijacked || c, d);
            } else {
                e.call(a, b, c, d);
            }
        };
        a.addEventListener = function(b, c, d) {
            var e = Node.prototype.addEventListener;
            if (b === "click") {
                e.call(a, b, c.hijacked || (c.hijacked = function(a) {
                    if (!a.propagationStopped) {
                        c(a);
                    }
                }), d);
            } else {
                e.call(a, b, c, d);
            }
        };
    }
    if (typeof a.onclick === "function") {
        b = a.onclick;
        a.addEventListener("click", function(a) {
            b(a);
        }, false);
        a.onclick = null;
    }
}

FastClick.prototype.deviceIsAndroid = navigator.userAgent.indexOf("Android") > 0;

FastClick.prototype.deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent);

FastClick.prototype.deviceIsIOS4 = FastClick.prototype.deviceIsIOS && /OS 4_\d(_\d)?/.test(navigator.userAgent);

FastClick.prototype.deviceIsIOSWithBadTarget = FastClick.prototype.deviceIsIOS && /OS ([6-9]|\d{2})_\d/.test(navigator.userAgent);

FastClick.prototype.needsClick = function(a) {
    "use strict";
    switch (a.nodeName.toLowerCase()) {
      case "button":
      case "select":
      case "textarea":
        if (a.disabled) {
            return true;
        }
        break;

      case "input":
        if (this.deviceIsIOS && a.type === "file" || a.disabled) {
            return true;
        }
        break;

      case "label":
      case "video":
        return true;
    }
    return /\bneedsclick\b/.test(a.className);
};

FastClick.prototype.needsFocus = function(a) {
    "use strict";
    switch (a.nodeName.toLowerCase()) {
      case "textarea":
        return true;

      case "select":
        return !this.deviceIsAndroid;

      case "input":
        switch (a.type) {
          case "button":
          case "checkbox":
          case "file":
          case "image":
          case "radio":
          case "submit":
            return false;
        }
        return !a.disabled && !a.readOnly;

      default:
        return /\bneedsfocus\b/.test(a.className);
    }
};

FastClick.prototype.sendClick = function(a, b) {
    "use strict";
    var c, d;
    if (document.activeElement && document.activeElement !== a) {
        document.activeElement.blur();
    }
    d = b.changedTouches[0];
    c = document.createEvent("MouseEvents");
    c.initMouseEvent(this.determineEventType(a), true, true, window, 1, d.screenX, d.screenY, d.clientX, d.clientY, false, false, false, false, 0, null);
    c.forwardedTouchEvent = true;
    a.dispatchEvent(c);
};

FastClick.prototype.determineEventType = function(a) {
    "use strict";
    if (this.deviceIsAndroid && a.tagName.toLowerCase() === "select") {
        return "mousedown";
    }
    return "click";
};

FastClick.prototype.focus = function(a) {
    "use strict";
    var b;
    if (this.deviceIsIOS && a.setSelectionRange && a.type.indexOf("date") !== 0 && a.type !== "time") {
        b = a.value.length;
        a.setSelectionRange(b, b);
    } else {
        a.focus();
    }
};

FastClick.prototype.updateScrollParent = function(a) {
    "use strict";
    var b, c;
    b = a.fastClickScrollParent;
    if (!b || !b.contains(a)) {
        c = a;
        do {
            if (c.scrollHeight > c.offsetHeight) {
                b = c;
                a.fastClickScrollParent = c;
                break;
            }
            c = c.parentElement;
        } while (c);
    }
    if (b) {
        b.fastClickLastScrollTop = b.scrollTop;
    }
};

FastClick.prototype.getTargetElementFromEventTarget = function(a) {
    "use strict";
    if (a.nodeType === Node.TEXT_NODE) {
        return a.parentNode;
    }
    return a;
};

FastClick.prototype.onTouchStart = function(a) {
    "use strict";
    var b, c, d;
    if (a.targetTouches.length > 1) {
        return true;
    }
    b = this.getTargetElementFromEventTarget(a.target);
    c = a.targetTouches[0];
    if (this.deviceIsIOS) {
        d = window.getSelection();
        if (d.rangeCount && !d.isCollapsed) {
            return true;
        }
        if (!this.deviceIsIOS4) {
            if (c.identifier === this.lastTouchIdentifier) {
                a.preventDefault();
                return false;
            }
            this.lastTouchIdentifier = c.identifier;
            this.updateScrollParent(b);
        }
    }
    this.trackingClick = true;
    this.trackingClickStart = a.timeStamp;
    this.targetElement = b;
    this.touchStartX = c.pageX;
    this.touchStartY = c.pageY;
    if (a.timeStamp - this.lastClickTime < 200) {
        a.preventDefault();
    }
    return true;
};

FastClick.prototype.touchHasMoved = function(a) {
    "use strict";
    var b = a.changedTouches[0], c = this.touchBoundary;
    if (Math.abs(b.pageX - this.touchStartX) > c || Math.abs(b.pageY - this.touchStartY) > c) {
        return true;
    }
    return false;
};

FastClick.prototype.onTouchMove = function(a) {
    "use strict";
    if (!this.trackingClick) {
        return true;
    }
    if (this.targetElement !== this.getTargetElementFromEventTarget(a.target) || this.touchHasMoved(a)) {
        this.trackingClick = false;
        this.targetElement = null;
    }
    return true;
};

FastClick.prototype.findControl = function(a) {
    "use strict";
    if (a.control !== undefined) {
        return a.control;
    }
    if (a.htmlFor) {
        return document.getElementById(a.htmlFor);
    }
    return a.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea");
};

FastClick.prototype.onTouchEnd = function(a) {
    "use strict";
    var b, c, d, e, f, g = this.targetElement;
    if (!this.trackingClick) {
        return true;
    }
    if (a.timeStamp - this.lastClickTime < 200) {
        this.cancelNextClick = true;
        return true;
    }
    this.cancelNextClick = false;
    this.lastClickTime = a.timeStamp;
    c = this.trackingClickStart;
    this.trackingClick = false;
    this.trackingClickStart = 0;
    if (this.deviceIsIOSWithBadTarget) {
        f = a.changedTouches[0];
        g = document.elementFromPoint(f.pageX - window.pageXOffset, f.pageY - window.pageYOffset) || g;
        g.fastClickScrollParent = this.targetElement.fastClickScrollParent;
    }
    d = g.tagName.toLowerCase();
    if (d === "label") {
        b = this.findControl(g);
        if (b) {
            this.focus(g);
            if (this.deviceIsAndroid) {
                return false;
            }
            g = b;
        }
    } else if (this.needsFocus(g)) {
        if (a.timeStamp - c > 100 || this.deviceIsIOS && window.top !== window && d === "input") {
            this.targetElement = null;
            return false;
        }
        this.focus(g);
        this.sendClick(g, a);
        if (!this.deviceIsIOS4 || d !== "select") {
            this.targetElement = null;
            a.preventDefault();
        }
        return false;
    }
    if (this.deviceIsIOS && !this.deviceIsIOS4) {
        e = g.fastClickScrollParent;
        if (e && e.fastClickLastScrollTop !== e.scrollTop) {
            return true;
        }
    }
    if (!this.needsClick(g)) {
        a.preventDefault();
        this.sendClick(g, a);
    }
    return false;
};

FastClick.prototype.onTouchCancel = function() {
    "use strict";
    this.trackingClick = false;
    this.targetElement = null;
};

FastClick.prototype.onMouse = function(a) {
    "use strict";
    if (!this.targetElement) {
        return true;
    }
    if (a.forwardedTouchEvent) {
        return true;
    }
    if (!a.cancelable) {
        return true;
    }
    if (!this.needsClick(this.targetElement) || this.cancelNextClick) {
        if (a.stopImmediatePropagation) {
            a.stopImmediatePropagation();
        } else {
            a.propagationStopped = true;
        }
        a.stopPropagation();
        a.preventDefault();
        return false;
    }
    return true;
};

FastClick.prototype.onClick = function(a) {
    "use strict";
    var b;
    if (this.trackingClick) {
        this.targetElement = null;
        this.trackingClick = false;
        return true;
    }
    if (a.target.type === "submit" && a.detail === 0) {
        return true;
    }
    b = this.onMouse(a);
    if (!b) {
        this.targetElement = null;
    }
    return b;
};

FastClick.prototype.destroy = function() {
    "use strict";
    var a = this.layer;
    if (this.deviceIsAndroid) {
        a.removeEventListener("mouseover", this.onMouse, true);
        a.removeEventListener("mousedown", this.onMouse, true);
        a.removeEventListener("mouseup", this.onMouse, true);
    }
    a.removeEventListener("click", this.onClick, true);
    a.removeEventListener("touchstart", this.onTouchStart, false);
    a.removeEventListener("touchmove", this.onTouchMove, false);
    a.removeEventListener("touchend", this.onTouchEnd, false);
    a.removeEventListener("touchcancel", this.onTouchCancel, false);
};

FastClick.notNeeded = function(a) {
    "use strict";
    var b;
    var c;
    if (typeof window.ontouchstart === "undefined") {
        return true;
    }
    c = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [ , 0 ])[1];
    if (c) {
        if (FastClick.prototype.deviceIsAndroid) {
            b = document.querySelector("meta[name=viewport]");
            if (b) {
                if (b.content.indexOf("user-scalable=no") !== -1) {
                    return true;
                }
                if (c > 31 && window.innerWidth <= window.screen.width) {
                    return true;
                }
            }
        } else {
            return true;
        }
    }
    if (a.style.msTouchAction === "none") {
        return true;
    }
    return false;
};

FastClick.attach = function(a) {
    "use strict";
    return new FastClick(a);
};

if (typeof define !== "undefined" && define.amd) {
    define(function() {
        "use strict";
        return FastClick;
    });
} else if (typeof module !== "undefined" && module.exports) {
    module.exports = FastClick.attach;
    module.exports.FastClick = FastClick;
} else {
    window.FastClick = FastClick;
}

svgeezy.init("nocheck", "png");

$(".js-font-adjust").hover(function() {
    $(".js-font-adjust-message").addClass("font-adjust__message--active");
}, function() {
    $(".js-font-adjust-message").removeClass("font-adjust__message--active");
});

(function(a) {
    a(".js-sl").each(function() {
        var b = a(this);
        b.find(".js-sl-facebook").attr("href", "https://www.facebook.com/sharer/sharer.php?u=" + encodeURI(window.location.href) + "&lang=nb_NO");
        b.find(".js-sl-twitter").attr("href", "https://twitter.com/intent/tweet?via=telemarkfylke&lang=no&text=" + encodeURIComponent(a("h1").eq(0).text()) + "&url=" + encodeURI(window.location.href));
        b.find(".js-sl-googlepluss").attr("href", "https://plus.google.com/share?url=" + encodeURI(window.location.href));
    });
    a(".js-sl-facebook, .js-sl-twitter, .js-sl-googlepluss").click(function(b) {
        var c = a(this);
        b.preventDefault();
        window.open(c.attr("href"), c.text(), "menubar=0, resizable=0, width=500, height=500");
    });
})(jQuery);

/*!
 * grunticon Stylesheet Loader | https://github.com/filamentgroup/grunticon | (c) 2012 Scott Jehl, Filament Group, Inc. | MIT license.
 */
window.grunticon = function(a) {
    if (a && 3 === a.length) {
        var b = window, c = !(!b.document.createElementNS || !b.document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect || !document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1") || window.opera && -1 === navigator.userAgent.indexOf("Chrome")), d = function(d) {
            var e = b.document.createElement("link"), f = b.document.getElementsByTagName("script")[0];
            e.rel = "stylesheet", e.href = a[d && c ? 0 : d ? 1 : 2], f.parentNode.insertBefore(e, f);
        }, e = new b.Image();
        e.onerror = function() {
            d(!1);
        }, e.onload = function() {
            d(1 === e.width && 1 === e.height);
        }, e.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
    }
};



/*!
 * classie - class helper functions
 * from bonzo https://github.com/ded/bonzo
 *
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */
(function(a) {
    "use strict";
    function b(a) {
        return new RegExp("(^|\\s+)" + a + "(\\s+|$)");
    }
    var c, d, e;
    if ("classList" in document.documentElement) {
        c = function(a, b) {
            return a.classList.contains(b);
        };
        d = function(a, b) {
            a.classList.add(b);
        };
        e = function(a, b) {
            a.classList.remove(b);
        };
    } else {
        c = function(a, c) {
            return b(c).test(a.className);
        };
        d = function(a, b) {
            if (!c(a, b)) {
                a.className = a.className + " " + b;
            }
        };
        e = function(a, c) {
            a.className = a.className.replace(b(c), " ");
        };
    }
    function f(a, b) {
        var f = c(a, b) ? e : d;
        f(a, b);
    }
    var g = {
        hasClass: c,
        addClass: d,
        removeClass: e,
        toggleClass: f,
        has: c,
        add: d,
        remove: e,
        toggle: f
    };
    if (typeof define === "function" && define.amd) {
        define(g);
    } else {
        a.classie = g;
    }
})(window);

function addEvent(a, b, c) {
    if (b.addEventListener) b.addEventListener(a, c, false); else if (b.attachEvent) {
        b.attachEvent("on" + a, c);
    } else {
        b[a] = c;
    }
}

var mp = {
    module: "menu",
    container: "menu-container",
    pusher: "menu-pusher",
    pushed: "menu-pushed",
    level: "menu__level",
    levelClass: ".menu__level",
    levelOpen: "menu__level--open",
    levelOpenClass: ".menu__level--open",
    levelOverlay: "menu__level--overlay",
    levelOverlayClass: ".menu__level--overlay",
    levelBackLink: "menu__back-level",
    backLinkText: "Tilbake",
    menuIsInit: false
};

/*!
 * mlpushmenu.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
(function(a, b) {
    "use strict";
    function c(a, b) {
        for (var c in b) {
            if (b.hasOwnProperty(c)) {
                a[c] = b[c];
            }
        }
        return a;
    }
    function d(a, b) {
        if (!a) return false;
        var c = a.target || a.srcElement || a || false;
        while (c && c.id != b) {
            c = c.parentNode || false;
        }
        return c !== false;
    }
    function e(a, b, c, d) {
        d = d || 0;
        if (a.id.indexOf(b) >= 0) return d;
        if (classie.has(a, c)) {
            ++d;
        }
        return a.parentNode && e(a.parentNode, b, c, d);
    }
    function f() {
        var b = false;
        (function(a) {
            if (/(android|ipad|playbook|silk|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) b = true;
        })(navigator.userAgent || navigator.vendor || a.opera);
        return b;
    }
    function g(a, b) {
        if (classie.has(a, b)) {
            return a;
        }
        return a.parentNode && g(a.parentNode, b);
    }
    function h(a, d, e) {
        this.el = a;
        this.trigger = d;
        this.options = c(this.defaults, e);
        this.support = Modernizr.csstransforms3d;
        if (this.support) {
            this._init();
            b.menuIsInit = true;
        }
    }
    function i(a, b) {
        this.el = a;
        this.trigger = b;
        this.support = Modernizr.csstransforms3d;
        if (this.support) {
            this._resetMenu();
        }
    }
    h.prototype = {
        defaults: {
            overlap: true,
            type: "overlap",
            levelSpacing: 40,
            backClass: b.levelBackLink
        },
        _init: function() {
            this.open = false;
            this.level = 0;
            this.wrapper = document.getElementById("mp-pusher");
            this.levels = Array.prototype.slice.call(this.el.querySelectorAll(b.levelClass));
            var a = this;
            var c = document.createElement("a");
            c.setAttribute("href", "#");
            c.setAttribute("class", this.options.backClass);
            c.appendChild(document.createTextNode(b.backLinkText));
            this.levels.forEach(function(d, f) {
                d.setAttribute("data-level", e(d, a.el.id, b.level));
                d.insertBefore(c, d.firstChild);
            });
            this.menuItems = Array.prototype.slice.call(this.el.querySelectorAll("li"));
            this.levelBack = Array.prototype.slice.call(this.el.querySelectorAll("." + this.options.backClass));
            this.eventtype = f() ? "touchend" : "click";
            classie.add(this.el, "mp-" + this.options.type);
            this._initEvents();
        },
        _initEvents: function() {
            var a = this;
            var c = function(b) {
                a._resetMenu();
                b.removeEventListener(a.eventtype, c);
            };
            this.trigger.addEventListener(this.eventtype, function(b) {
                b.stopPropagation();
                b.preventDefault();
                if (a.open) {
                    a._resetMenu();
                } else {
                    a._openMenu();
                    document.addEventListener(a.eventtype, function(b) {
                        if (a.open && !d(b.target, a.el.id)) {
                            c(this);
                        }
                    });
                }
            });
            this.menuItems.forEach(function(c, d) {
                var e = c.querySelector(b.levelClass);
                if (e) {
                    c.querySelector(".js-menu-dropdown").addEventListener(a.eventtype, function(d) {
                        d.stopPropagation();
                        d.preventDefault();
                        var f = g(c, b.level).getAttribute("data-level");
                        if (a.level <= f) {
                            classie.add(g(c, b.level), b.levelOverlay);
                            a._openMenu(e);
                        }
                        return false;
                    });
                }
            });
            this.levels.forEach(function(b, c) {
                b.addEventListener(a.eventtype, function(c) {
                    c.stopPropagation();
                    var d = b.getAttribute("data-level");
                    if (a.level > d) {
                        a.level = d;
                        a._closeMenu();
                    }
                });
            });
            this.levelBack.forEach(function(c, d) {
                c.addEventListener(a.eventtype, function(d) {
                    d.preventDefault();
                    var e = g(c, b.level).getAttribute("data-level");
                    if (a.level <= e) {
                        d.stopPropagation();
                        a.level = g(c, b.level).getAttribute("data-level") - 1;
                        a.level === 0 ? a._resetMenu() : a._closeMenu();
                    }
                });
            });
        },
        _openMenu: function(a) {
            ++this.level;
            var c = (this.level - 1) * this.options.levelSpacing, d = this.options.type === "overlap" ? this.el.offsetWidth + c : this.el.offsetWidth;
            this._setTransform("translate3d(-" + d + "px,0,0)");
            if (a) {
                this._setTransform("", a);
                for (var e = 0, f = this.levels.length; e < f; ++e) {
                    var g = this.levels[e];
                    if (g != a && !classie.has(g, b.levelOpen)) {
                        this._setTransform("translate3d(100%,0,0) translate3d(" + -1 * c + "px,0,0)", g);
                    }
                }
            }
            if (this.level === 1) {
                classie.add(this.wrapper, b.pushed);
                this.open = true;
            }
            var h = a || this.levels[0], i = this.levels[this.level - 2];
            classie.add(h, b.levelOpen);
            if (i) {
                classie.remove(i, "menu__level--scroll");
                classie.add(i, "menu__level--noscroll");
            }
            setTimeout(function() {
                classie.remove(h, "menu__level--noscroll");
                classie.add(h, "menu__level--scroll");
            }, 500);
        },
        _resetMenu: function() {
            this._setTransform("translate3d(0,0,0)");
            this.level = 0;
            classie.remove(this.wrapper, b.pushed);
            this._toggleLevels();
            this.open = false;
        },
        _closeMenu: function() {
            var a = this.options.type === "overlap" ? this.el.offsetWidth + (this.level - 1) * this.options.levelSpacing : this.el.offsetWidth;
            this._setTransform("translate3d(-" + a + "px,0,0)");
            this._toggleLevels();
        },
        _setTransform: function(a, b) {
            b = b || this.wrapper;
            b.style.WebkitTransform = a;
            b.style.MozTransform = a;
            b.style.transform = a;
        },
        _toggleLevels: function() {
            for (var a = 0, c = this.levels.length; a < c; ++a) {
                var d = this.levels[a], e = a - 1;
                if (d.getAttribute("data-level") >= this.level + 1) {
                    classie.remove(d, b.levelOpen);
                    classie.remove(d, b.levelOverlay);
                } else if (Number(d.getAttribute("data-level")) == this.level) {
                    classie.remove(d, b.levelOverlay);
                    this._overflowHidden(d);
                }
            }
        },
        _overflowHidden: function(a) {
            if (this.setOverflow) clearTimeout(this.setOverflow);
            this.setOverflow = setTimeout(function() {
                classie.remove(a, "menu__level--noscroll");
                classie.add(a, "menu__level--scroll");
            }, 500);
        }
    };
    a.mlPushMenu = h;
})(window, mp);

$(window).resize(function() {
    if (this.resizeTO) clearTimeout(this.resizeTO);
    this.resizeTO = setTimeout(function() {
        $(this).trigger("resizeEnd");
    }, 500);
});

var MpObj, menuElm = document.getElementById("menu"), menuTrigger = document.getElementById("menu-trigger");

$(window).bind("resizeEnd", function() {
    if (!mp.menuIsInit) {
        setUpMainMenu();
    } else if (Modernizr.mq("only screen and (min-width: 1025px")) {
        MpObj._resetMenu();
    }
});

function setUpMainMenu() {
    var a = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    if (a < 1024) {
        MpObj = new mlPushMenu(menuElm, menuTrigger);
    }
}

setUpMainMenu();