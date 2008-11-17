// ==UserScript==
// @name           Better Mobile Twitter
// @version        2
// @namespace      http://ellab.org
// @author         angusdev
// @description    To enhance the mobile twitter page
// @include        http://m.twitter.com/home
// ==/UserScript==

function BetterMobileTwitter() {
  this.isChrome = false;
  this.loading = false;
  this.page = 1;
}

BetterMobileTwitter.prototype.init = function() {
  var enabled = true;

  if (navigator.userAgent.match(/Chrome/)) {
    enabled = document.location.href == 'http://m.twitter.com/home';
    this.isChrome = true;
  }

  if (enabled && document.body) this.functionPrinciple();
}

BetterMobileTwitter.prototype.extract = function(s, prefix, suffix) {
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

BetterMobileTwitter.prototype.nextPage = function() {
  if (this.loading) {
    return;
  }

  this.loading = true;
  document.getElementById('bmt-scrolldetector').innerHTML = 'Loading more tweets...';

  var bmt = this;
  var client = new XMLHttpRequest();
  client.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        var fullt = this.responseText;
        var t = bmt.extract(fullt, '<ul>', '</ul>');
        document.getElementsByTagName('ul')[0].innerHTML += '<li>Page ' + (bmt.page + 1) + '</li>' + t;
        bmt.loading = false;
        document.getElementById('bmt-scrolldetector').innerHTML = '';
        bmt.page++;
      }
      else {
        document.getElementById('bmt-scrolldetector').innerHTML = 'Error ' + this.status;
      }
    }
  }
  client.open('GET', 'http://m.twitter.com/account/home.mobile?page=' + (bmt.page + 1));
  client.send(null);
}

BetterMobileTwitter.prototype.calcOffsetTop = function(e) {
  var top = 0;
  do {
    if (!isNaN(e.offsetTop)) top += e.offsetTop;
  } while (e = e.offsetParent);

  return top;
}

BetterMobileTwitter.prototype.detectScroll = function() {
  var scrollTop = this.isChrome?document.body.scrollTop:document.documentElement.scrollTop;
  if (this.calcOffsetTop(document.getElementById('bmt-scrolldetector')) < scrollTop + document.documentElement.clientHeight) {
    this.nextPage();
  }
}

BetterMobileTwitter.prototype.statusMessageChanged = function(e) {
  document.getElementById('bmt-wordcount').innerHTML = 140 - e.target.value.length;
}

BetterMobileTwitter.prototype.functionPrinciple = function() {
  // check if it is a mobile version
  if (document.getElementById('dim-screen')) return;

  this.page = document.location.href.match(/page=(\d+)/);
  this.page = this.page?paresInt(this.page[1], 10):1;

  var status = document.getElementById('status');
  if (status) {
    // remove the BR between status editbox and update button
    var br = status.nextSibling;
    while (br && br.tagName != 'br') br = br.nextSibling;
    if (br && br.parentNode) {
      br.parentNode.removeChild(br);
      status.style.marginRight = '7px';
    }
    status.style.width = '500px';

    // show remaining char
    var wordCount = document.createElement('span');
    wordCount.setAttribute('id', 'bmt-wordcount');
    wordCount.innerHTML = '140';
    status.parentNode.appendChild(wordCount);
    status.addEventListener('keyup', this.statusMessageChanged, false);
    status.addEventListener('blur', this.statusMessageChanged, false);
    status.addEventListener('focus', this.statusMessageChanged, false);
  }

  // Change the older link for scroll detector
  var res = document.getElementsByTagName('a');
  for (var i=res.length-1; i>=0; i--) {
    if (res[i].getAttribute('accesskey') == 6) {
      var scrollDetector = res[i].parentNode;
      scrollDetector.setAttribute('id', 'bmt-scrolldetector');
      scrollDetector.innerHTML = '';
    }
  }

  var bmt = this;
  window.setInterval(function() {bmt.detectScroll(bmt);}, 500);
}
new BetterMobileTwitter().init();