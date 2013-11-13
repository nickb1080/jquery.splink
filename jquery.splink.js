// Generated by CoffeeScript 1.6.3
(function($) {
  return $.fn.splink = function(targetSelector, callback) {
    var session, target;
    if (!(window.sessionStorage && window.history.pushState)) {
      return;
    }
    session = window.sessionStorage;
    target = $(targetSelector);
    window.addEventListener("popstate", function(event) {
      target.html(session[window.location.pathname]);
    });
    return $("body").on("click", "a[data-splink-selector]", function(event) {
      var $link, link, selector, url;
      event.preventDefault();
      link = this;
      $link = $(this);
      url = link.href;
      selector = $link.attr("data-splink-selector");
      
      if (session[url]) {
        target.html(session[url]);
        return window.history.pushState(null, null, url);
      } else {
        if (!session[window.location.pathname]) {
          session[window.location.pathname] = target.html();
        }
        return target.load("" + url + " " + selector, function(response, status, xhr) {
          if (status === "error") {
            console.log("" + xhr.status + " " + xhr.statusText);
          } else {
            window.history.pushState(null, null, url);
            session[window.location.pathname] = target.html();
          }
          callback(response, status, xhr);
        });
      }
    });
  };
})(jQuery);
