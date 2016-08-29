var CLOSE_EVENT = "Close", BEFORE_CLOSE_EVENT = "BeforeClose", AFTER_CLOSE_EVENT = "AfterClose", BEFORE_APPEND_EVENT = "BeforeAppend", MARKUP_PARSE_EVENT = "MarkupParse", OPEN_EVENT = "Open", CHANGE_EVENT = "Change", NS = "mfp", EVENT_NS = "." + NS, READY_CLASS = "mfp-ready", REMOVING_CLASS = "mfp-removing", PREVENT_CLOSE_CLASS = "mfp-prevent-close";

var mfp, MagnificPopup = function() {}, _isJQ = !!window.jQuery, _prevStatus, _window = $(window), _body, _document, _prevContentType, _wrapClasses, _currPopupType;

var _mfpOn = function(a, b) {
    mfp.ev.on(NS + a + EVENT_NS, b);
}, _getEl = function(a, b, c, d) {
    var e = document.createElement("div");
    e.className = "mfp-" + a;
    if (c) {
        e.innerHTML = c;
    }
    if (!d) {
        e = $(e);
        if (b) {
            e.appendTo(b);
        }
    } else if (b) {
        b.appendChild(e);
    }
    return e;
}, _mfpTrigger = function(a, b) {
    mfp.ev.triggerHandler(NS + a, b);
    if (mfp.st.callbacks) {
        a = a.charAt(0).toLowerCase() + a.slice(1);
        if (mfp.st.callbacks[a]) {
            mfp.st.callbacks[a].apply(mfp, $.isArray(b) ? b : [ b ]);
        }
    }
}, _getCloseBtn = function(a) {
    if (a !== _currPopupType || !mfp.currTemplate.closeBtn) {
        mfp.currTemplate.closeBtn = $(mfp.st.closeMarkup.replace("%title%", mfp.st.tClose));
        _currPopupType = a;
    }
    return mfp.currTemplate.closeBtn;
}, _checkInstance = function() {
    if (!$.magnificPopup.instance) {
        mfp = new MagnificPopup();
        mfp.init();
        $.magnificPopup.instance = mfp;
    }
}, supportsTransitions = function() {
    var a = document.createElement("p").style, b = [ "ms", "O", "Moz", "Webkit" ];
    if (a["transition"] !== undefined) {
        return true;
    }
    while (b.length) {
        if (b.pop() + "Transition" in a) {
            return true;
        }
    }
    return false;
};

MagnificPopup.prototype = {
    constructor: MagnificPopup,
    init: function() {
        var a = navigator.appVersion;
        mfp.isIE7 = a.indexOf("MSIE 7.") !== -1;
        mfp.isIE8 = a.indexOf("MSIE 8.") !== -1;
        mfp.isLowIE = mfp.isIE7 || mfp.isIE8;
        mfp.isAndroid = /android/gi.test(a);
        mfp.isIOS = /iphone|ipad|ipod/gi.test(a);
        mfp.supportsTransition = supportsTransitions();
        mfp.probablyMobile = mfp.isAndroid || mfp.isIOS || /(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent);
        _body = $(document.body);
        _document = $(document);
        mfp.popupsCache = {};
    },
    open: function(a) {
        var b;
        if (a.isObj === false) {
            mfp.items = a.items.toArray();
            mfp.index = 0;
            var c = a.items, d;
            for (b = 0; b < c.length; b++) {
                d = c[b];
                if (d.parsed) {
                    d = d.el[0];
                }
                if (d === a.el[0]) {
                    mfp.index = b;
                    break;
                }
            }
        } else {
            mfp.items = $.isArray(a.items) ? a.items : [ a.items ];
            mfp.index = a.index || 0;
        }
        if (mfp.isOpen) {
            mfp.updateItemHTML();
            return;
        }
        mfp.types = [];
        _wrapClasses = "";
        if (a.mainEl && a.mainEl.length) {
            mfp.ev = a.mainEl.eq(0);
        } else {
            mfp.ev = _document;
        }
        if (a.key) {
            if (!mfp.popupsCache[a.key]) {
                mfp.popupsCache[a.key] = {};
            }
            mfp.currTemplate = mfp.popupsCache[a.key];
        } else {
            mfp.currTemplate = {};
        }
        mfp.st = $.extend(true, {}, $.magnificPopup.defaults, a);
        mfp.fixedContentPos = mfp.st.fixedContentPos === "auto" ? !mfp.probablyMobile : mfp.st.fixedContentPos;
        if (mfp.st.modal) {
            mfp.st.closeOnContentClick = false;
            mfp.st.closeOnBgClick = false;
            mfp.st.showCloseBtn = false;
            mfp.st.enableEscapeKey = false;
        }
        if (!mfp.bgOverlay) {
            mfp.bgOverlay = _getEl("bg").on("click" + EVENT_NS, function() {
                mfp.close();
            });
            mfp.wrap = _getEl("wrap").attr("tabindex", -1).on("click" + EVENT_NS, function(a) {
                if (mfp._checkIfClose(a.target)) {
                    mfp.close();
                }
            });
            mfp.container = _getEl("container", mfp.wrap);
        }
        mfp.contentContainer = _getEl("content");
        if (mfp.st.preloader) {
            mfp.preloader = _getEl("preloader", mfp.container, mfp.st.tLoading);
        }
        var e = $.magnificPopup.modules;
        for (b = 0; b < e.length; b++) {
            var f = e[b];
            f = f.charAt(0).toUpperCase() + f.slice(1);
            mfp["init" + f].call(mfp);
        }
        _mfpTrigger("BeforeOpen");
        if (mfp.st.showCloseBtn) {
            if (!mfp.st.closeBtnInside) {
                mfp.wrap.append(_getCloseBtn());
            } else {
                _mfpOn(MARKUP_PARSE_EVENT, function(a, b, c, d) {
                    c.close_replaceWith = _getCloseBtn(d.type);
                });
                _wrapClasses += " mfp-close-btn-in";
            }
        }
        if (mfp.st.alignTop) {
            _wrapClasses += " mfp-align-top";
        }
        if (mfp.fixedContentPos) {
            mfp.wrap.css({
                overflow: mfp.st.overflowY,
                overflowX: "hidden",
                overflowY: mfp.st.overflowY
            });
        } else {
            mfp.wrap.css({
                top: _window.scrollTop(),
                position: "absolute"
            });
        }
        if (mfp.st.fixedBgPos === false || mfp.st.fixedBgPos === "auto" && !mfp.fixedContentPos) {
            mfp.bgOverlay.css({
                height: _document.height(),
                position: "absolute"
            });
        }
        if (mfp.st.enableEscapeKey) {
            _document.on("keyup" + EVENT_NS, function(a) {
                if (a.keyCode === 27) {
                    mfp.close();
                }
            });
        }
        _window.on("resize" + EVENT_NS, function() {
            mfp.updateSize();
        });
        if (!mfp.st.closeOnContentClick) {
            _wrapClasses += " mfp-auto-cursor";
        }
        if (_wrapClasses) mfp.wrap.addClass(_wrapClasses);
        var g = mfp.wH = _window.height();
        var h = {};
        if (mfp.fixedContentPos) {
            if (mfp._hasScrollBar(g)) {
                var i = mfp._getScrollbarSize();
                if (i) {
                    h.marginRight = i;
                }
            }
        }
        if (mfp.fixedContentPos) {
            if (!mfp.isIE7) {
                h.overflow = "hidden";
            } else {
                $("body, html").css("overflow", "hidden");
            }
        }
        var j = mfp.st.mainClass;
        if (mfp.isIE7) {
            j += " mfp-ie7";
        }
        if (j) {
            mfp._addClassToMFP(j);
        }
        mfp.updateItemHTML();
        _mfpTrigger("BuildControls");
        $("html").css(h);
        mfp.bgOverlay.add(mfp.wrap).prependTo(document.body);
        mfp._lastFocusedEl = document.activeElement;
        setTimeout(function() {
            if (mfp.content) {
                mfp._addClassToMFP(READY_CLASS);
                mfp._setFocus();
            } else {
                mfp.bgOverlay.addClass(READY_CLASS);
            }
            _document.on("focusin" + EVENT_NS, mfp._onFocusIn);
        }, 16);
        mfp.isOpen = true;
        mfp.updateSize(g);
        _mfpTrigger(OPEN_EVENT);
        return a;
    },
    close: function() {
        if (!mfp.isOpen) return;
        _mfpTrigger(BEFORE_CLOSE_EVENT);
        mfp.isOpen = false;
        if (mfp.st.removalDelay && !mfp.isLowIE && mfp.supportsTransition) {
            mfp._addClassToMFP(REMOVING_CLASS);
            setTimeout(function() {
                mfp._close();
            }, mfp.st.removalDelay);
        } else {
            mfp._close();
        }
    },
    _close: function() {
        _mfpTrigger(CLOSE_EVENT);
        var a = REMOVING_CLASS + " " + READY_CLASS + " ";
        mfp.bgOverlay.detach();
        mfp.wrap.detach();
        mfp.container.empty();
        if (mfp.st.mainClass) {
            a += mfp.st.mainClass + " ";
        }
        mfp._removeClassFromMFP(a);
        if (mfp.fixedContentPos) {
            var b = {
                marginRight: ""
            };
            if (mfp.isIE7) {
                $("body, html").css("overflow", "");
            } else {
                b.overflow = "";
            }
            $("html").css(b);
        }
        _document.off("keyup" + EVENT_NS + " focusin" + EVENT_NS);
        mfp.ev.off(EVENT_NS);
        mfp.wrap.attr("class", "mfp-wrap").removeAttr("style");
        mfp.bgOverlay.attr("class", "mfp-bg");
        mfp.container.attr("class", "mfp-container");
        if (mfp.st.showCloseBtn && (!mfp.st.closeBtnInside || mfp.currTemplate[mfp.currItem.type] === true)) {
            if (mfp.currTemplate.closeBtn) mfp.currTemplate.closeBtn.detach();
        }
        if (mfp._lastFocusedEl) {
            $(mfp._lastFocusedEl).focus();
        }
        mfp.currItem = null;
        mfp.content = null;
        mfp.currTemplate = null;
        mfp.prevHeight = 0;
        _mfpTrigger(AFTER_CLOSE_EVENT);
    },
    updateSize: function(a) {
        if (mfp.isIOS) {
            var b = document.documentElement.clientWidth / window.innerWidth;
            var c = window.innerHeight * b;
            mfp.wrap.css("height", c);
            mfp.wH = c;
        } else {
            mfp.wH = a || _window.height();
        }
        if (!mfp.fixedContentPos) {
            mfp.wrap.css("height", mfp.wH);
        }
        _mfpTrigger("Resize");
    },
    updateItemHTML: function() {
        var a = mfp.items[mfp.index];
        mfp.contentContainer.detach();
        if (mfp.content) mfp.content.detach();
        if (!a.parsed) {
            a = mfp.parseEl(mfp.index);
        }
        var b = a.type;
        _mfpTrigger("BeforeChange", [ mfp.currItem ? mfp.currItem.type : "", b ]);
        mfp.currItem = a;
        if (!mfp.currTemplate[b]) {
            var c = mfp.st[b] ? mfp.st[b].markup : false;
            _mfpTrigger("FirstMarkupParse", c);
            if (c) {
                mfp.currTemplate[b] = $(c);
            } else {
                mfp.currTemplate[b] = true;
            }
        }
        if (_prevContentType && _prevContentType !== a.type) {
            mfp.container.removeClass("mfp-" + _prevContentType + "-holder");
        }
        var d = mfp["get" + b.charAt(0).toUpperCase() + b.slice(1)](a, mfp.currTemplate[b]);
        mfp.appendContent(d, b);
        a.preloaded = true;
        _mfpTrigger(CHANGE_EVENT, a);
        _prevContentType = a.type;
        mfp.container.prepend(mfp.contentContainer);
        _mfpTrigger("AfterChange");
    },
    appendContent: function(a, b) {
        mfp.content = a;
        if (a) {
            if (mfp.st.showCloseBtn && mfp.st.closeBtnInside && mfp.currTemplate[b] === true) {
                if (!mfp.content.find(".mfp-close").length) {
                    mfp.content.append(_getCloseBtn());
                }
            } else {
                mfp.content = a;
            }
        } else {
            mfp.content = "";
        }
        _mfpTrigger(BEFORE_APPEND_EVENT);
        mfp.container.addClass("mfp-" + b + "-holder");
        mfp.contentContainer.append(mfp.content);
    },
    parseEl: function(a) {
        var b = mfp.items[a], c = b.type;
        if (b.tagName) {
            b = {
                el: $(b)
            };
        } else {
            b = {
                data: b,
                src: b.src
            };
        }
        if (b.el) {
            var d = mfp.types;
            for (var e = 0; e < d.length; e++) {
                if (b.el.hasClass("mfp-" + d[e])) {
                    c = d[e];
                    break;
                }
            }
            b.src = b.el.attr("data-mfp-src");
            if (!b.src) {
                b.src = b.el.attr("href");
            }
        }
        b.type = c || mfp.st.type || "inline";
        b.index = a;
        b.parsed = true;
        mfp.items[a] = b;
        _mfpTrigger("ElementParse", b);
        return mfp.items[a];
    },
    addGroup: function(a, b) {
        var c = function(c) {
            c.mfpEl = this;
            mfp._openClick(c, a, b);
        };
        if (!b) {
            b = {};
        }
        var d = "click.magnificPopup";
        b.mainEl = a;
        if (b.items) {
            b.isObj = true;
            a.off(d).on(d, c);
        } else {
            b.isObj = false;
            if (b.delegate) {
                a.off(d).on(d, b.delegate, c);
            } else {
                b.items = a;
                a.off(d).on(d, c);
            }
        }
    },
    _openClick: function(a, b, c) {
        var d = c.midClick !== undefined ? c.midClick : $.magnificPopup.defaults.midClick;
        if (!d && (a.which === 2 || a.ctrlKey || a.metaKey)) {
            return;
        }
        var e = c.disableOn !== undefined ? c.disableOn : $.magnificPopup.defaults.disableOn;
        if (e) {
            if ($.isFunction(e)) {
                if (!e.call(mfp)) {
                    return true;
                }
            } else {
                if (_window.width() < e) {
                    return true;
                }
            }
        }
        if (a.type) {
            a.preventDefault();
            if (mfp.isOpen) {
                a.stopPropagation();
            }
        }
        c.el = $(a.mfpEl);
        if (c.delegate) {
            c.items = b.find(c.delegate);
        }
        mfp.open(c);
    },
    updateStatus: function(a, b) {
        if (mfp.preloader) {
            if (_prevStatus !== a) {
                mfp.container.removeClass("mfp-s-" + _prevStatus);
            }
            if (!b && a === "loading") {
                b = mfp.st.tLoading;
            }
            var c = {
                status: a,
                text: b
            };
            _mfpTrigger("UpdateStatus", c);
            a = c.status;
            b = c.text;
            mfp.preloader.html(b);
            mfp.preloader.find("a").on("click", function(a) {
                a.stopImmediatePropagation();
            });
            mfp.container.addClass("mfp-s-" + a);
            _prevStatus = a;
        }
    },
    _checkIfClose: function(a) {
        if ($(a).hasClass(PREVENT_CLOSE_CLASS)) {
            return;
        }
        var b = mfp.st.closeOnContentClick;
        var c = mfp.st.closeOnBgClick;
        if (b && c) {
            return true;
        } else {
            if (!mfp.content || $(a).hasClass("mfp-close") || mfp.preloader && a === mfp.preloader[0]) {
                return true;
            }
            if (a !== mfp.content[0] && !$.contains(mfp.content[0], a)) {
                if (c) {
                    if ($.contains(document, a)) {
                        return true;
                    }
                }
            } else if (b) {
                return true;
            }
        }
        return false;
    },
    _addClassToMFP: function(a) {
        mfp.bgOverlay.addClass(a);
        mfp.wrap.addClass(a);
    },
    _removeClassFromMFP: function(a) {
        this.bgOverlay.removeClass(a);
        mfp.wrap.removeClass(a);
    },
    _hasScrollBar: function(a) {
        return (mfp.isIE7 ? _document.height() : document.body.scrollHeight) > (a || _window.height());
    },
    _setFocus: function() {
        (mfp.st.focus ? mfp.content.find(mfp.st.focus).eq(0) : mfp.wrap).focus();
    },
    _onFocusIn: function(a) {
        if (a.target !== mfp.wrap[0] && !$.contains(mfp.wrap[0], a.target)) {
            mfp._setFocus();
            return false;
        }
    },
    _parseMarkup: function(a, b, c) {
        var d;
        if (c.data) {
            b = $.extend(c.data, b);
        }
        _mfpTrigger(MARKUP_PARSE_EVENT, [ a, b, c ]);
        $.each(b, function(b, c) {
            if (c === undefined || c === false) {
                return true;
            }
            d = b.split("_");
            if (d.length > 1) {
                var e = a.find(EVENT_NS + "-" + d[0]);
                if (e.length > 0) {
                    var f = d[1];
                    if (f === "replaceWith") {
                        if (e[0] !== c[0]) {
                            e.replaceWith(c);
                        }
                    } else if (f === "img") {
                        if (e.is("img")) {
                            e.attr("src", c);
                        } else {
                            e.replaceWith('<img src="' + c + '" class="' + e.attr("class") + '" />');
                        }
                    } else {
                        e.attr(d[1], c);
                    }
                }
            } else {
                a.find(EVENT_NS + "-" + b).html(c);
            }
        });
    },
    _getScrollbarSize: function() {
        if (mfp.scrollbarSize === undefined) {
            var a = document.createElement("div");
            a.id = "mfp-sbm";
            a.style.cssText = "width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;";
            document.body.appendChild(a);
            mfp.scrollbarSize = a.offsetWidth - a.clientWidth;
            document.body.removeChild(a);
        }
        return mfp.scrollbarSize;
    }
};

$.magnificPopup = {
    instance: null,
    proto: MagnificPopup.prototype,
    modules: [],
    open: function(a, b) {
        _checkInstance();
        if (!a) {
            a = {};
        } else {
            a = $.extend(true, {}, a);
        }
        a.isObj = true;
        a.index = b || 0;
        return this.instance.open(a);
    },
    close: function() {
        return $.magnificPopup.instance && $.magnificPopup.instance.close();
    },
    registerModule: function(a, b) {
        if (b.options) {
            $.magnificPopup.defaults[a] = b.options;
        }
        $.extend(this.proto, b.proto);
        this.modules.push(a);
    },
    defaults: {
        disableOn: 0,
        key: null,
        midClick: false,
        mainClass: "",
        preloader: true,
        focus: "",
        closeOnContentClick: false,
        closeOnBgClick: true,
        closeBtnInside: true,
        showCloseBtn: true,
        enableEscapeKey: true,
        modal: false,
        alignTop: false,
        removalDelay: 0,
        fixedContentPos: "auto",
        fixedBgPos: "auto",
        overflowY: "auto",
        closeMarkup: '<button title="%title%" type="button" class="mfp-close">&times;</button>',
        tClose: "Close (Esc)",
        tLoading: "Loading..."
    }
};

$.fn.magnificPopup = function(a) {
    _checkInstance();
    var b = $(this);
    if (typeof a === "string") {
        if (a === "open") {
            var c, d = _isJQ ? b.data("magnificPopup") : b[0].magnificPopup, e = parseInt(arguments[1], 10) || 0;
            if (d.items) {
                c = d.items[e];
            } else {
                c = b;
                if (d.delegate) {
                    c = c.find(d.delegate);
                }
                c = c.eq(e);
            }
            mfp._openClick({
                mfpEl: c
            }, b, d);
        } else {
            if (mfp.isOpen) mfp[a].apply(mfp, Array.prototype.slice.call(arguments, 1));
        }
    } else {
        a = $.extend(true, {}, a);
        if (_isJQ) {
            b.data("magnificPopup", a);
        } else {
            b[0].magnificPopup = a;
        }
        mfp.addGroup(b, a);
    }
    return b;
};

(function() {
    var a = 1e3, b = "ontouchstart" in window, c = function() {
        _window.off("touchmove" + e + " touchend" + e);
    }, d = "mfpFastClick", e = "." + d;
    $.fn.mfpFastClick = function(d) {
        return $(this).each(function() {
            var f = $(this), g;
            if (b) {
                var h, i, j, k, l, m;
                f.on("touchstart" + e, function(b) {
                    k = false;
                    m = 1;
                    l = b.originalEvent ? b.originalEvent.touches[0] : b.touches[0];
                    i = l.clientX;
                    j = l.clientY;
                    _window.on("touchmove" + e, function(a) {
                        l = a.originalEvent ? a.originalEvent.touches : a.touches;
                        m = l.length;
                        l = l[0];
                        if (Math.abs(l.clientX - i) > 10 || Math.abs(l.clientY - j) > 10) {
                            k = true;
                            c();
                        }
                    }).on("touchend" + e, function(b) {
                        c();
                        if (k || m > 1) {
                            return;
                        }
                        g = true;
                        b.preventDefault();
                        clearTimeout(h);
                        h = setTimeout(function() {
                            g = false;
                        }, a);
                        d();
                    });
                });
            }
            f.on("click" + e, function() {
                if (!g) {
                    d();
                }
            });
        });
    };
    $.fn.destroyMfpFastClick = function() {
        $(this).off("touchstart" + e + " click" + e);
        if (b) _window.off("touchmove" + e + " touchend" + e);
    };
})();

var _getLoopedId = function(a) {
    var b = mfp.items.length;
    if (a > b - 1) {
        return a - b;
    } else if (a < 0) {
        return b + a;
    }
    return a;
}, _replaceCurrTotal = function(a, b, c) {
    return a.replace(/%curr%/gi, b + 1).replace(/%total%/gi, c);
};

$.magnificPopup.registerModule("gallery", {
    options: {
        enabled: false,
        arrowMarkup: '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',
        preload: [ 0, 2 ],
        navigateByImgClick: true,
        arrows: true,
        tPrev: "Previous (Left arrow key)",
        tNext: "Next (Right arrow key)",
        tCounter: "%curr% of %total%"
    },
    proto: {
        initGallery: function() {
            var a = mfp.st.gallery, b = ".mfp-gallery", c = Boolean($.fn.mfpFastClick);
            mfp.direction = true;
            if (!a || !a.enabled) return false;
            _wrapClasses += " mfp-gallery";
            _mfpOn(OPEN_EVENT + b, function() {
                if (a.navigateByImgClick) {
                    mfp.wrap.on("click" + b, ".mfp-img", function() {
                        if (mfp.items.length > 1) {
                            mfp.next();
                            return false;
                        }
                    });
                }
                _document.on("keydown" + b, function(a) {
                    if (a.keyCode === 37) {
                        mfp.prev();
                    } else if (a.keyCode === 39) {
                        mfp.next();
                    }
                });
            });
            _mfpOn("UpdateStatus" + b, function(a, b) {
                if (b.text) {
                    b.text = _replaceCurrTotal(b.text, mfp.currItem.index, mfp.items.length);
                }
            });
            _mfpOn(MARKUP_PARSE_EVENT + b, function(b, c, d, e) {
                var f = mfp.items.length;
                d.counter = f > 1 ? _replaceCurrTotal(a.tCounter, e.index, f) : "";
            });
            _mfpOn("BuildControls" + b, function() {
                if (mfp.items.length > 1 && a.arrows && !mfp.arrowLeft) {
                    var b = a.arrowMarkup, d = mfp.arrowLeft = $(b.replace(/%title%/gi, a.tPrev).replace(/%dir%/gi, "left")).addClass(PREVENT_CLOSE_CLASS), e = mfp.arrowRight = $(b.replace(/%title%/gi, a.tNext).replace(/%dir%/gi, "right")).addClass(PREVENT_CLOSE_CLASS);
                    var f = c ? "mfpFastClick" : "click";
                    d[f](function() {
                        mfp.prev();
                    });
                    e[f](function() {
                        mfp.next();
                    });
                    if (mfp.isIE7) {
                        _getEl("b", d[0], false, true);
                        _getEl("a", d[0], false, true);
                        _getEl("b", e[0], false, true);
                        _getEl("a", e[0], false, true);
                    }
                    mfp.container.append(d.add(e));
                }
            });
            _mfpOn(CHANGE_EVENT + b, function() {
                if (mfp._preloadTimeout) clearTimeout(mfp._preloadTimeout);
                mfp._preloadTimeout = setTimeout(function() {
                    mfp.preloadNearbyImages();
                    mfp._preloadTimeout = null;
                }, 16);
            });
            _mfpOn(CLOSE_EVENT + b, function() {
                _document.off(b);
                mfp.wrap.off("click" + b);
                if (mfp.arrowLeft && c) {
                    mfp.arrowLeft.add(mfp.arrowRight).destroyMfpFastClick();
                }
                mfp.arrowRight = mfp.arrowLeft = null;
            });
        },
        next: function() {
            mfp.direction = true;
            mfp.index = _getLoopedId(mfp.index + 1);
            mfp.updateItemHTML();
        },
        prev: function() {
            mfp.direction = false;
            mfp.index = _getLoopedId(mfp.index - 1);
            mfp.updateItemHTML();
        },
        goTo: function(a) {
            mfp.direction = a >= mfp.index;
            mfp.index = a;
            mfp.updateItemHTML();
        },
        preloadNearbyImages: function() {
            var a = mfp.st.gallery.preload, b = Math.min(a[0], mfp.items.length), c = Math.min(a[1], mfp.items.length), d;
            for (d = 1; d <= (mfp.direction ? c : b); d++) {
                mfp._preloadItem(mfp.index + d);
            }
            for (d = 1; d <= (mfp.direction ? b : c); d++) {
                mfp._preloadItem(mfp.index - d);
            }
        },
        _preloadItem: function(a) {
            a = _getLoopedId(a);
            if (mfp.items[a].preloaded) {
                return;
            }
            var b = mfp.items[a];
            if (!b.parsed) {
                b = mfp.parseEl(a);
            }
            _mfpTrigger("LazyLoad", b);
            if (b.type === "image") {
                b.img = $('<img class="mfp-img" />').on("load.mfploader", function() {
                    b.hasSize = true;
                }).on("error.mfploader", function() {
                    b.hasSize = true;
                    b.loadError = true;
                    _mfpTrigger("LazyLoadError", b);
                }).attr("src", b.src);
            }
            b.preloaded = true;
        }
    }
});

var _imgInterval, _getTitle = function(a) {
    if (a.data && a.data.title !== undefined) return a.data.title;
    var b = mfp.st.image.titleSrc;
    if (b) {
        if ($.isFunction(b)) {
            return b.call(mfp, a);
        } else if (a.el) {
            return a.el.attr(b) || "";
        }
    }
    return "";
};

$.magnificPopup.registerModule("image", {
    options: {
        markup: '<div class="mfp-figure">' + '<div class="mfp-close"></div>' + "<figure>" + '<div class="mfp-img"></div>' + "<figcaption>" + '<div class="mfp-bottom-bar">' + '<div class="mfp-title"></div>' + '<div class="mfp-counter"></div>' + "</div>" + "</figcaption>" + "</figure>" + "</div>",
        cursor: "mfp-zoom-out-cur",
        titleSrc: "title",
        verticalFit: true,
        tError: '<a href="%url%">The image</a> could not be loaded.'
    },
    proto: {
        initImage: function() {
            var a = mfp.st.image, b = ".image";
            mfp.types.push("image");
            _mfpOn(OPEN_EVENT + b, function() {
                if (mfp.currItem.type === "image" && a.cursor) {
                    _body.addClass(a.cursor);
                }
            });
            _mfpOn(CLOSE_EVENT + b, function() {
                if (a.cursor) {
                    _body.removeClass(a.cursor);
                }
                _window.off("resize" + EVENT_NS);
            });
            _mfpOn("Resize" + b, mfp.resizeImage);
            if (mfp.isLowIE) {
                _mfpOn("AfterChange", mfp.resizeImage);
            }
        },
        resizeImage: function() {
            var a = mfp.currItem;
            if (!a || !a.img) return;
            if (mfp.st.image.verticalFit) {
                var b = 0;
                if (mfp.isLowIE) {
                    b = parseInt(a.img.css("padding-top"), 10) + parseInt(a.img.css("padding-bottom"), 10);
                }
                a.img.css("max-height", mfp.wH - b);
            }
        },
        _onImageHasSize: function(a) {
            if (a.img) {
                a.hasSize = true;
                if (_imgInterval) {
                    clearInterval(_imgInterval);
                }
                a.isCheckingImgSize = false;
                _mfpTrigger("ImageHasSize", a);
                if (a.imgHidden) {
                    if (mfp.content) mfp.content.removeClass("mfp-loading");
                    a.imgHidden = false;
                }
            }
        },
        findImageSize: function(a) {
            var b = 0, c = a.img[0], d = function(e) {
                if (_imgInterval) {
                    clearInterval(_imgInterval);
                }
                _imgInterval = setInterval(function() {
                    if (c.naturalWidth > 0) {
                        mfp._onImageHasSize(a);
                        return;
                    }
                    if (b > 200) {
                        clearInterval(_imgInterval);
                    }
                    b++;
                    if (b === 3) {
                        d(10);
                    } else if (b === 40) {
                        d(50);
                    } else if (b === 100) {
                        d(500);
                    }
                }, e);
            };
            d(1);
        },
        getImage: function(a, b) {
            var c = 0, d = function() {
                if (a) {
                    if (a.img[0].complete) {
                        a.img.off(".mfploader");
                        if (a === mfp.currItem) {
                            mfp._onImageHasSize(a);
                            mfp.updateStatus("ready");
                        }
                        a.hasSize = true;
                        a.loaded = true;
                        _mfpTrigger("ImageLoadComplete");
                    } else {
                        c++;
                        if (c < 200) {
                            setTimeout(d, 100);
                        } else {
                            e();
                        }
                    }
                }
            }, e = function() {
                if (a) {
                    a.img.off(".mfploader");
                    if (a === mfp.currItem) {
                        mfp._onImageHasSize(a);
                        mfp.updateStatus("error", f.tError.replace("%url%", a.src));
                    }
                    a.hasSize = true;
                    a.loaded = true;
                    a.loadError = true;
                }
            }, f = mfp.st.image;
            var g = b.find(".mfp-img");
            if (g.length) {
                var h = document.createElement("img");
                h.className = "mfp-img";
                a.img = $(h).on("load.mfploader", d).on("error.mfploader", e);
                h.src = a.src;
                if (g.is("img")) {
                    a.img = a.img.clone();
                }
                if (a.img[0].naturalWidth > 0) {
                    a.hasSize = true;
                }
            }
            mfp._parseMarkup(b, {
                title: _getTitle(a),
                img_replaceWith: a.img
            }, a);
            mfp.resizeImage();
            if (a.hasSize) {
                if (_imgInterval) clearInterval(_imgInterval);
                if (a.loadError) {
                    b.addClass("mfp-loading");
                    mfp.updateStatus("error", f.tError.replace("%url%", a.src));
                } else {
                    b.removeClass("mfp-loading");
                    mfp.updateStatus("ready");
                }
                return b;
            }
            mfp.updateStatus("loading");
            a.loading = true;
            if (!a.hasSize) {
                a.imgHidden = true;
                b.addClass("mfp-loading");
                mfp.findImageSize(a);
            }
            return b;
        }
    }
});

var INLINE_NS = "inline", _hiddenClass, _inlinePlaceholder, _lastInlineElement, _putInlineElementsBack = function() {
    if (_lastInlineElement) {
        _inlinePlaceholder.after(_lastInlineElement.addClass(_hiddenClass)).detach();
        _lastInlineElement = null;
    }
};

$.magnificPopup.registerModule(INLINE_NS, {
    options: {
        hiddenClass: "hide",
        markup: "",
        tNotFound: "Content not found"
    },
    proto: {
        initInline: function() {
            mfp.types.push(INLINE_NS);
            _mfpOn(CLOSE_EVENT + "." + INLINE_NS, function() {
                _putInlineElementsBack();
            });
        },
        getInline: function(a, b) {
            _putInlineElementsBack();
            if (a.src) {
                var c = mfp.st.inline, d = $(a.src);
                if (d.length) {
                    var e = d[0].parentNode;
                    if (e && e.tagName) {
                        if (!_inlinePlaceholder) {
                            _hiddenClass = c.hiddenClass;
                            _inlinePlaceholder = _getEl(_hiddenClass);
                            _hiddenClass = "mfp-" + _hiddenClass;
                        }
                        _lastInlineElement = d.after(_inlinePlaceholder).detach().removeClass(_hiddenClass);
                    }
                    mfp.updateStatus("ready");
                } else {
                    mfp.updateStatus("error", c.tNotFound);
                    d = $("<div>");
                }
                a.inlineElement = d;
                return d;
            }
            mfp.updateStatus("ready");
            mfp._parseMarkup(b, {}, a);
            return b;
        }
    }
});

var RETINA_NS = "retina";

$.magnificPopup.registerModule(RETINA_NS, {
    options: {
        replaceSrc: function(a) {
            return a.src.replace(/\.\w+$/, function(a) {
                return "@2x" + a;
            });
        },
        ratio: 1
    },
    proto: {
        initRetina: function() {
            if (window.devicePixelRatio > 1) {
                var a = mfp.st.retina, b = a.ratio;
                b = !isNaN(b) ? b : b();
                if (b > 1) {
                    _mfpOn("ImageHasSize" + "." + RETINA_NS, function(a, c) {
                        c.img.css({
                            "max-width": c.img[0].naturalWidth / b,
                            width: "100%"
                        });
                    });
                    _mfpOn("ElementParse" + "." + RETINA_NS, function(c, d) {
                        d.src = a.replaceSrc(d, b);
                    });
                }
            }
        }
    }
});

var hasMozTransform, getHasMozTransform = function() {
    if (hasMozTransform === undefined) {
        hasMozTransform = document.createElement("p").style.MozTransform !== undefined;
    }
    return hasMozTransform;
};

$.magnificPopup.registerModule("zoom", {
    options: {
        enabled: false,
        easing: "ease-in-out",
        duration: 300,
        opener: function(a) {
            return a.is("img") ? a : a.find("img");
        }
    },
    proto: {
        initZoom: function() {
            var a = mfp.st.zoom, b = ".zoom", c;
            if (!a.enabled || !mfp.supportsTransition) {
                return;
            }
            var d = a.duration, e = function(b) {
                var c = b.clone().removeAttr("style").removeAttr("class").addClass("mfp-animated-image"), d = "all " + a.duration / 1e3 + "s " + a.easing, e = {
                    position: "fixed",
                    zIndex: 9999,
                    left: 0,
                    top: 0,
                    "-webkit-backface-visibility": "hidden"
                }, f = "transition";
                e["-webkit-" + f] = e["-moz-" + f] = e["-o-" + f] = e[f] = d;
                c.css(e);
                return c;
            }, f = function() {
                mfp.content.css("visibility", "visible");
            }, g, h;
            _mfpOn("BuildControls" + b, function() {
                if (mfp._allowZoom()) {
                    clearTimeout(g);
                    mfp.content.css("visibility", "hidden");
                    c = mfp._getItemToZoom();
                    if (!c) {
                        f();
                        return;
                    }
                    h = e(c);
                    h.css(mfp._getOffset());
                    mfp.wrap.append(h);
                    g = setTimeout(function() {
                        h.css(mfp._getOffset(true));
                        g = setTimeout(function() {
                            f();
                            setTimeout(function() {
                                h.remove();
                                c = h = null;
                                _mfpTrigger("ZoomAnimationEnded");
                            }, 16);
                        }, d);
                    }, 16);
                }
            });
            _mfpOn(BEFORE_CLOSE_EVENT + b, function() {
                if (mfp._allowZoom()) {
                    clearTimeout(g);
                    mfp.st.removalDelay = d;
                    if (!c) {
                        c = mfp._getItemToZoom();
                        if (!c) {
                            return;
                        }
                        h = e(c);
                    }
                    h.css(mfp._getOffset(true));
                    mfp.wrap.append(h);
                    mfp.content.css("visibility", "hidden");
                    setTimeout(function() {
                        h.css(mfp._getOffset());
                    }, 16);
                }
            });
            _mfpOn(CLOSE_EVENT + b, function() {
                if (mfp._allowZoom()) {
                    f();
                    if (h) {
                        h.remove();
                    }
                    c = null;
                }
            });
        },
        _allowZoom: function() {
            return mfp.currItem.type === "image";
        },
        _getItemToZoom: function() {
            if (mfp.currItem.hasSize) {
                return mfp.currItem.img;
            } else {
                return false;
            }
        },
        _getOffset: function(a) {
            var b;
            if (a) {
                b = mfp.currItem.img;
            } else {
                b = mfp.st.zoom.opener(mfp.currItem.el || mfp.currItem);
            }
            var c = b.offset();
            var d = parseInt(b.css("padding-top"), 10);
            var e = parseInt(b.css("padding-bottom"), 10);
            c.top -= $(window).scrollTop() - d;
            var f = {
                width: b.width(),
                height: (_isJQ ? b.innerHeight() : b[0].offsetHeight) - e - d
            };
            if (getHasMozTransform()) {
                f["-moz-transform"] = f["transform"] = "translate(" + c.left + "px," + c.top + "px)";
            } else {
                f.left = c.left;
                f.top = c.top;
            }
            return f;
        }
    }
});

(function(a) {
    "use strict";
    var b = ".js-popup", c = b + "--img", d = b + "--gallery";
    a.extend(true, a.magnificPopup.defaults, {
        tClose: "Lukk (Esc)",
        tLoading: "Laster...",
        gallery: {
            tPrev: "Forrige (Venstre pil)",
            tNext: "Neste (Høyre pil)",
            tCounter: "<span>%curr% av %total%</span>"
        },
        image: {
            titleSrc: function(a) {
                var b = a.el.attr("data-title") !== undefined ? '<h3 class="mfp-title__header">' + a.el.attr("data-title") + "</h3>" : "";
                if (a.el.attr("data-caption") !== undefined) {
                    b += '<p class="mfp-title__caption">' + a.el.attr("data-caption") + "</p>";
                }
                if (a.el.attr("data-credit") !== undefined) {
                    b += '<p class="mfp-title__credit">Foto: ' + a.el.attr("data-credit") + "</p>";
                }
                return b;
            },
            tError: '<a href="%url%">Bildet</a> kunne ikke lastes.'
        },
        ajax: {
            tError: '<a href="%url%">Innholdet</a> kunne ikke lastes.'
        }
    });
    a(c).magnificPopup({
        type: "image"
    });
    a(d).magnificPopup({
        type: "image",
        gallery: {
            enabled: true
        }
    });
})(jQuery);