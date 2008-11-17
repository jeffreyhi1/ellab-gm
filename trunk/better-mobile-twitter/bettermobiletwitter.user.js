// ==UserScript==
// @name            Better Mobile Twitter
// @version         3
// @namespace       http://ellab.org
// @author          angusdev
// @description     To enhance the mobile twitter page
// @include         http://m.twitter.com/home
// ==/UserScript==

/*
Author: Angus http://angusdev.mysinablog.com/
              http://angusdev.blogspot.com/
Date:   2008-10-13

Version history:
3    17-Nov-2008    Add the character count function
                    Check for new tweets on background
                    Make the input box wider
                    Show error message if AJAX call fails
                    Change to a OO approach
2    06-Nov-2008    Support Chrome
1    13-Oct-2008    First release to userscripts.org
*/

function BetterMobileTwitter() {
  this.isChrome = false;
  this.loading = false;
  this.page = 1;
  this.lastMessage = '';
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

BetterMobileTwitter.prototype.checkUpdate = function() {
  var bmt = this;
  var client = new XMLHttpRequest();
  client.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        var newTweetsCount = 0;
        var fullt = this.responseText;
        var t = bmt.extract(fullt, '<ul>', '</ul>');
        while (t) {
          var li = bmt.extract(t, '<li>', '</li>');
          li = li?li.replace(/<small>[^<]*<\/small>/, ''):'';
          if (li) {
            if (li == bmt.lastMessage) {
              break;
            }
            else {
              newTweetsCount++;
            }
          }

          t = bmt.extract(t, '</li>');
        }
        newTweetsCount = 2;
        document.getElementById('bmt-checkupdate').innerHTML = newTweetsCount?(newTweetsCount + ' new tweet' + (newTweetsCount>1?'s':'')):'';
      }
      else if (this.status) {
        document.getElementById('bmt-checkupdate').innerHTML = 'Error ' + this.status;
      }

      window.setTimeout(function() {bmt.checkUpdate(bmt);}, 3000);
    }
  }
  client.open('GET', 'http://m.twitter.com/account/home.mobile');
  client.send(null);
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

  // get last message
  var lastMessageLi = document.getElementsByTagName('li');
  if (lastMessageLi.length) {
    this.lastMessage = lastMessageLi[0].innerHTML.replace(/ xmlns="[^"]*"/g, '');
    this.lastMessage = this.lastMessage.replace(/<small>[^<]*<\/small>/, '');
  }
  var checkUpdateSpan = document.createElement('span');
  checkUpdateSpan.setAttribute('id', 'bmt-checkupdate');
  checkUpdateSpan.setAttribute('style', 'position: absolute; right: 3px; top: 3px;');
  document.getElementsByTagName('div')[0].appendChild(checkUpdateSpan);

  var bmt = this;
  window.setInterval(function() {bmt.detectScroll(bmt);}, 500);
  window.setTimeout(function() {bmt.checkUpdate(bmt);}, 60000);
}
new BetterMobileTwitter().init();