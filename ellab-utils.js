(function(){

function registerNS(ns) {
  var nsParts = ns.split(".");
  var root = window;

  for (var i=0; i<nsParts.length; i++) {
    if (typeof root[nsParts[i]] == "undefined") {
      root[nsParts[i]] = new Object();
    }
    root = root[nsParts[i]];
  }
}

registerNS("org.ellab.utils");

org.ellab.utils.isChrome = navigator.userAgent.match(/Chrome/)?true:false;

org.ellab.utils.extract = function(s, prefix, suffix) {
  var i = s.indexOf(prefix);
  if (i >= 0) {
    s = s.substring(i + prefix.length);
  }
  else {
    return '';
  }
  if (suffix) {
    i = s.indexOf(suffix);
    if (i >= 0) {
      s = s.substring(0, i);
    }
    else {
      return '';
    }
  }
  return s;
};

org.ellab.utils.crossOriginXMLHttpRequest_GM = function(params) {
  GM_xmlhttpRequest({
      method: params.method,
      url: params.url,
      overrideMimeType: params.overrideMimeType,
      onload: function(response){
        if (response.status == 301 || response.status == 302 || response.status == 303) {
          var loc = /Location: ([^\n]*)\n/.exec(response.responseHeaders)[1];
          GM_xmlhttpRequest({method:params.method, overrideMimeType: params.overrideMimeType, url:loc, onload:arguments.callee});
          return;
        }
        params.onload.call(this, response);
      }
  });
};

org.ellab.utils.crossOriginXMLHttpRequest_Chrome = function(params) {
  params.onComplete = function(status, data) {
    if (status == 200) {
      var response = {responseText:data};
      if (params.onload) {
        params.onload.call(this, response);
      }
    }
  };
  proxyXHR(params);
};

org.ellab.utils.crossOriginXMLHttpRequest = function(params) {
  if (this.isChrome) {
    this.crossOriginXMLHttpRequest_Chrome(params);
  }
  else {
    this.crossOriginXMLHttpRequest_GM(params);
  }
};

org.ellab.utils.getCookie = function(name) {
  if (document.cookie.length>0) {
    var start = document.cookie.indexOf(name + '=');
    if (start >= 0) {
      start = start + name.length + 1;
      var end = document.cookie.indexOf(';', start);
      if (end < 0) {
        end = document.cookie.length;
      }
      return unescape(document.cookie.substring(start, end));
    }
  }
  return '';
};

org.ellab.utils.setCookie = function(name, value, expiredays) {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + expiredays);
  document.cookie =name + "=" + escape(value) + ((expiredays==null)?'':';expires=' + exdate.toGMTString());
};

org.ellab.utils.getSession = function(name) {
  if (window.sessionStorage && window.sessionStorage.getItem) {
    return window.sessionStorage.getItem(name);
  }
  else {
    return this.getCookie(name);
  }
}

org.ellab.utils.setSession = function(name, value) {
  if (window.sessionStorage && window.sessionStorage.setItem) {
    return window.sessionStorage.setItem(name, value);
  }
  else {
    return this.setCookie(name, value);
  }
}


})();