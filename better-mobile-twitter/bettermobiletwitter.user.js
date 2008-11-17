// ==UserScript==
// @name           Better Mobile Twitter
// @version        2
// @namespace      http://ellab.org
// @author         angusdev
// @description    To enhance the mobile twitter page
// @include        http://m.twitter.com/home
// ==/UserScript==

var enabled = true;
var isChrome = false;

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
  scrollDetector.innerHTML = 'Loading more tweets...';

  var client = new XMLHttpRequest();
  client.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      var fullt = this.responseText
      var t = extract(fullt, '<ul>', '</ul>');
      document.getElementsByTagName('ul')[0].innerHTML += '<li>Page ' + (page + 1) + '</li>' + t;
      loading = false;
      scrollDetector.innerHTML = '';
      page++;
    }
  }
  client.open('GET', 'http://m.twitter.com/account/home.mobile?page=' + (page + 1));
  client.send(null);
}

function calcOffsetTop(e) {
  var top = 0;
  do {
    if (!isNaN(e.offsetTop)) top += e.offsetTop;
  } while (e = e.offsetParent);

  return top;
}

function detectScroll() {
  var scrollTop = isChrome?document.body.scrollTop:document.documentElement.scrollTop;
  if (calcOffsetTop(scrollDetector) < scrollTop + document.documentElement.clientHeight) {
    nextPage();
  }
}

function statusMessageChanged(e) {
  document.getElementById('bmt-wordcount').innerHTML = 140 - e.target.value.length;
}

function functionPrinciple() {
  // check if it is a mobile version
  if (document.getElementById('dim-screen')) return;

  var status = document.getElementById('status');
  if (status) {
    // remove the BR between status editbox and update button
    var br = status.nextSibling;
    while (br && br.tagName != 'br') br = br.nextSibling;
    if (br && br.parentNode) {
      br.parentNode.removeChild(br);
      status.style.marginRight = '7px';
    }

    // show remaining char
    var wordCount = document.createElement('span');
    wordCount.setAttribute('id', 'bmt-wordcount');
    wordCount.innerHTML = '140';
    status.parentNode.appendChild(wordCount);
    status.addEventListener('keyup', statusMessageChanged, false);
    status.addEventListener('blur', statusMessageChanged, false);
    status.addEventListener('focus', statusMessageChanged, false);
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

if (navigator.userAgent.match(/Chrome/)) {
  enabled = document.location.href == 'http://m.twitter.com/home';
  isChrome = true;
}

if (enabled && document.body) functionPrinciple();