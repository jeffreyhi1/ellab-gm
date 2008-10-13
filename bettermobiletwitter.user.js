// ==UserScript==
// @name           Better Mobile Twitter
// @version        1.0.0
// @namespace      http://ellab.org
// @author         angusdev
// @description    To enhance the mobile twitter page
// @include        http://m.twitter.com/home
// ==/UserScript==

var loading = false;
var scrollDetector;
var page = document.location.href.match(/page=(\d+)/);
page = parseInt(page?page[1]:1, 10);

function extract(s, prefix, suffix) {
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
}

function nextPage() {
  if (loading) {
    return;
  }
  loading = true;
  scrollDetector.innerHTML = 'Loading older tweets...';
  GM_xmlhttpRequest({
    method: 'GET',
    url: 'http://m.twitter.com/account/home.mobile?page=' + (page + 1),
    onload: function(fullt) {
      fullt = fullt.responseText;
      var t = extract(fullt, '<ul>', '</ul>');
      document.getElementsByTagName('ul')[0].innerHTML += '<li>Page ' + (page + 1) + '</li>' + t;
      loading = false;
      scrollDetector.innerHTML = '';
      page++;
    }
  });

}

function calcOffsetTop(e) {
  var top = 0;
  do {
    if (!isNaN(e.offsetTop)) top += e.offsetTop;
  } while (e = e.offsetParent);

  return top;
}

function detectScroll() {
  if (calcOffsetTop(scrollDetector) < document.documentElement.scrollTop + document.documentElement.clientHeight) {
    nextPage();
  }
}

function functionPrinciple() {
  // check if it is a mobile version
  if (document.getElementById('dim-screen')) return;

  // remove the BR between status editbox and update button
  var status = document.getElementById('status');
  if (status) {
    var br = status.nextSibling;
    while (br && br.tagName != 'br') br = br.nextSibling;
    if (br && br.parentNode) {
      br.parentNode.removeChild(br);
      status.style.marginRight = '7px';
    }
  }

  // Change the older link for scroll detector
  var res = document.getElementsByTagName('a');
  for (var i=res.length-1; i>=0; i--) {
    if (res[i].getAttribute('accesskey') == 6) {
      scrollDetector = res[i].parentNode;
      scrollDetector.innerHTML = '';
    }
  }

  setInterval(detectScroll, 500);
}

if (document.body) functionPrinciple();