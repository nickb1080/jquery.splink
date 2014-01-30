// Generated by CoffeeScript 1.6.3
var Gofer, get, set, wrapMethodPublish,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

set = window.sessionStorage.setItem;

get = window.sessionStorage.getItem;

Gofer = window.Gofer || {};

Gofer.Page = (function(_super) {
  __extends(Page, _super);

  function Page(options) {
    var fragment;
    if (options.fragments) {
      this.fragments = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = fragments.length; _i < _len; _i++) {
          fragment = fragments[_i];
          _results.push(this.add(fragment));
        }
        return _results;
      }).call(this);
    } else {
      this.fragments = [];
    }
    this.url = options.url;
    this.targets = Gofer.config.contentTargets;
    return this;
  }

  Page.prototype.save = function() {
    var collection, fragment, _i, _len, _ref;
    collection = [];
    _ref = this.fragments;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      fragment = _ref[_i];
      collection.push(fragment.serialize);
    }
    set(JSON.stringify(collection));
    return this;
  };

  Page.prototype.retrieve = function() {
    var fragment, _i, _len, _ref;
    _ref = JSON.parse(get(this.url));
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      fragment = _ref[_i];
      this.add(fragment);
    }
    return this;
  };

  Page.prototype.renderAll = function() {
    var fragment, _i, _len, _ref;
    _ref = this.fragments;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      fragment = _ref[_i];
      fragment.render();
    }
    if (Gofer.history === true) {
      this.addToHistory();
    }
    return this;
  };

  Page.prototype.empty = function() {
    delete this.fragments;
    return this;
  };

  Page.prototype.add = function(options) {
    this.fragments.push(new Fragment(options));
    return this;
  };

  Page.prototype.build = function(html) {
    var $html, fragmentHtml, target, _i, _len, _ref;
    $html = $(html);
    _ref = this.targets;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      target = _ref[_i];
      fragmentHtml = $html.find(selector).html();
      this.add({
        html: fragmentHtml,
        target: target
      });
    }
    return this;
  };

  Page.prototype.load = function() {
    var _this = this;
    return $.ajax({
      url: this.path,
      type: "GET",
      dataType: "html"
    });
    return {
      error: function(req, status, err) {
        return $.publish("gofer.loadError", [_this]);
      },
      success: function(data, status, req) {
        $.publish("gofer.loadSuccess", [_this]);
        return _this.build(data);
      },
      done: function(data, status, req) {
        if (_this.waiting) {
          return _this.deferred.resolve();
        }
      }
    };
  };

  Page.prototype.queue = function() {
    requestQueue.push(this.url);
    $.publish("gofer.queueRequest", this);
    this.deferred = $.Deferred;
    return this.deferred;
  };

  Page.prototype.addToHistory = function() {
    window.history.pushState({
      path: this.path
    }, null, this.path);
    return this;
  };

  return Page;

})(Object);

Gofer.Fragment = (function(_super) {
  __extends(Fragment, _super);

  function Fragment(options) {
    this.html = options.html;
    this.target = options.target;
    this.$target = $(this.target);
    this.$html = $(this.html);
  }

  Fragment.prototype.render = function() {
    this.$target.empty().append(this.$html);
    return this;
  };

  Fragment.prototype.preloadImages = function() {
    return this.$html.find("img").each(function() {
      var img, src;
      src = $(this).src;
      if (__indexOf.call(Gofer.imageCache, src) < 0) {
        img = new Image();
        img.src = src;
        return Gofer.imageCache.push(src);
      }
    });
  };

  Fragment.prototype.serialize = function() {
    return JSON.stringify({
      target: this.target,
      html: this.html
    });
  };

  return Fragment;

})(Object);

wrapMethodPublish = function(proto) {
  var key, _i, _len, _ref, _results;
  _ref = Object.keys(proto);
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    key = _ref[_i];
    if (typeof proto[key] === "function") {
      _results.push(proto[key] = Gofer.util.wrap(proto[key], function(func) {
        func(arguments);
        return $.publish("gofer." + key, [this]);
      }));
    } else {
      _results.push(void 0);
    }
  }
  return _results;
};

wrapMethodPublish(Gofer.Page.prototype);

wrapMethodPublish(Gofer.Fragment.prototype);