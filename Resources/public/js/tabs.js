var tabsIdList = [];

(function(a, b) {
    "use strict";
    function c(b, c, d) {
        this.el = b;
        this.options = a.extend(this.defaults, c || {});
        this.tabs = [];
        this.content = [];
        this.activeTab = d ? d : 0;
        this._init();
    }
    c.prototype = {
        defaults: {
            tabsBarClass: "tabs__bar",
            tabsBarItemClass: "tabs__bar__item",
            tabsBarItemActiveClass: "tabs__bar__item--active",
            tabsBarItemLink: "tabs__bar__item__link",
            tabsBarItemJSLink: "js-tab-link",
            tabsBarItemJSLinkClass: ".js-tab-link",
            tabsBarItemLinkActive: "tabs__bar__item__link--active",
            contentActive: "tabs__content__block--active",
            contentHidden: "tabs__content__block--hidden",
            tabsContentHeaderClass: ".tabs__content__header",
            tabsContentHeaderActive: "tabs__content__header--active"
        },
        _init: function() {
            var c = this, d = c.el, e = a("<ul></ul>").addClass(c.options.tabsBarClass);
            if (a(d).find(".js-tabs-tab").length > 1 ) {
                a(d).find(".js-tabs-tab").each(function(d) {
                    var f = encodeURIComponent(a(this).text().toLowerCase().replace(" ", "-")), g = f, h = a("<a></a>").addClass(c.options.tabsBarItemLink + " " + c.options.tabsBarItemJSLink).text(a(this).text()), i = a("<li></li>").addClass(c.options.tabsBarItemClass), j = 1, k = a(this).next();
                    while (a.inArray(g, b) !== -1) {
                        g = f + j;
                        j++;
                    }
                    b.push(g);
                    h.attr("href", function() {
                        return "#" + g;
                    }).data("index", d);
                    i.append(h);
                    a(this).wrap(a("<a></a>").addClass(c.options.tabsBarItemJSLink).attr("href", function() {
                        return "#" + g;
                    }).data("index", d));
                    i.append(h);
                    e.append(i);
                    k.attr("id", g).attr("tabindex", "-1").addClass(c.options.contentHidden);
                    c.tabs.push(h);
                    c.content.push(k);
                    if (location.hash.substr(1) === g) {
                        c.activeTab = d;
                    }
                });
                c._setActiveTab(this.activeTab, true);
                a(d).prepend(e);
                a(d).addClass("tabs--ready").on("click", c.options.tabsBarItemJSLinkClass, function() {
                    var b = a(this).attr("href");
                    if (history.pushState) {
                        history.pushState(null, null, b);
                    } else {
                        location.hash = b;
                    }
                    c._setActiveTab(a(this).data("index"));
                    return false;
                });
            }
        },
        _setActiveTab: function(b, c) {
            var c = c ? c : false, d = this.activeTab, e = this.tabs[d], f = this.content[d], g = f.prev().children(this.options.tabsContentHeaderClass), h = this.tabs[b], i = this.content[b], j = i.prev().children(this.options.tabsContentHeaderClass);
            if (c || b !== d) {
                if (!c) {
                    e.removeClass(this.options.tabsBarItemLinkActive);
                    f.removeClass(this.options.contentActive).addClass(this.options.contentHidden);
                    g.removeClass(this.options.tabsContentHeaderActive);
                }
                h.addClass(this.options.tabsBarItemLinkActive);
                i.removeClass(this.options.contentHidden).addClass(this.options.contentActive);
                j.addClass(this.options.tabsContentHeaderActive);
                this.activeTab = b;
                if (!c && a(window).scrollTop() > i.offset().top) {
                    a("html, body").animate({
                        scrollTop: i.offset().top
                    }, 500);
                }
            }
        }
    };
    window.vpTabs = c;
})(jQuery, tabsIdList);

(function(a) {
    "use strict";
    a.fn.tabs = function(b, c) {
        return this.each(function() {
            new vpTabs(a(this), b, c);
        });
    };
})(jQuery);

$(function() {
  $(".js-tabs").tabs();
});