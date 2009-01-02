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
3    18-Nov-2008    Add the character count function
                    Check for new tweets on background
                    Add an on-off button
                    Make the input box wider
                    Show error message if AJAX call fails
                    Change to a OO approach
2    06-Nov-2008    Support Chrome
1    13-Oct-2008    First release to userscripts.org
*/

function BetterMobileTwitter() {
  this.isChrome = false;
  this.enabled = true;
  this.loading = false;
  this.page = 1;
  this.lastMessage = '';
  this.onsrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAcCAMAAACppkqwAAAACXBIWXMAAAsTAAALEwEAmpwYAAADAFBMVEUoKCgwMDA5OTkZOXogP3xAQEBERUhHSUtOUVVVVVVUWF5YWFhOWnBXY3plZWZiZGhsbGxvc3p0dHR9fX0YP4seRI8bQpEeT64lQ4AnRYErSIMkSJIoTJQsT5YyToUzUIg4VIoyVJo6Wpc6W50rU6AjVLcoWbguXLsxWKMwXLI1YLYxYL44ZL0iWsYmXMotYMQsYcw5Z8I6acY0aNA5bdNCV4BVbJlCYqJAY6pMba5BaLRMcLdQbahAbcVDcc1JdMpBc9dKeddJetxTfM1af8ltgqx0h618jrFXgM9bhtxSgeBYh+NciuRfjedjh9BpjNJvkdZzldd5mtxxluFzmud6nueCg4OXl5mam5yRoL+lpaWqrK63t7e/v7+DpOiFp+yKq+yRr+ufuOqirsiptcyvus+a5Oi7zfDGxsbOzs7Hz9/V1dXf39/M1OTO2vLW3OjV3/Td4uvd5PXn5+fg5Ozk6O/v7+/s8Pft8vz39/fz9Pj4+vz7/P39/f0S8OgABAGVYIgS8PxFZh4MAAAS8PhCkIMS8SQAAAD//EgAAAAWbsAWbuAABQAWbdAAAABCkAk94RQCCYoS8bAAAAAWbdA94R8AAAAAAAAABQAAABOVYIgABAEAAAAFhqAQacBFZcBBlL5Cr0ICCYoABAEAAAAFhqAAAAAAArAAAAEAAAAAAAAAAAAAAACKACEABQBC9AuVYIgABAEAAAAAAAQAAaYAAAIABQAAABMWbuABGOQAAAAAAAAAAAAAAAAAAAAAAAAAAAC/YRwABABPLyCACxKA7mRPL0QS8XBPMpQAxCgS8oA9654WbdAAAAAWbmAAAAQAAAAS8ug95RsAAAAAAAABGlIAAADxn43xntwBGlIAAAAAAAAS9SAAAAAAACg95RsAAAAS8ogA//8AAADxn3g95RsAAAAS8pRBhzQCCYoABAoAAAAS9sQS8qxBhzQCCYoAAA8AAAAAAAA95Ru6q80AAAAS8ug95RsS8xRBiBb90AAS8xRBiFoS8tQoKCgoKCj4nXKPAAAAZ3RSTlP///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AFBa6eAAAAdZJREFUeNq91ulT00AYx/Eg1OLBGkHRUSbQcoyl5TKKogIppUjTDAq0HAU6CLgUSimXxPD753madwkduksYvi+y2+kz+5n0mInCOV9VQ5I9amp6whqnFjhXeLn1c9+QXG9etbC1rVLDNlWVgFBkWLL+zuYXhcbH1+ooKC+1Udn6XzczsfNLW6ryeEQaGCDgQDCmhKTPlwV06Qbet7CyYHcC4nLApxvp8Vhcdze67l5978e7ggExbTw9rsVo1619oGtEG/MOJAg4EowAw1dizgZw9XPQMBzsfjSMQyz4JrreBgHSwH5xH5irAfhhGBU/MBYImLKRpyWHqykCnMMEAb+8I5ORd+xcMAJmvKVgu6uN+RkHO0gnCfCOBAMWUXXXKpYIMO2Lb3WBS8EIML0t41+SluQFlkwC/mC9gt/ekeleLQCQASZomQCsGmCeOadYvE/APMHf6NfoHs5MFyjSb7YO4AhGQNZXDqjuVYB8NuuAXh8T4J1I9XbLAJa/7dof7f827ehjsqw8UPQOpL70MAhWD7CsXDFn3VJwoEHzDwEE+Q7uGQjLAykpYPX5ne7gXOz80orCw6HZjByQ+R5tWxERLg9YWeF842lY+slReSbw5MhYe5lfA3x4QqsW145cAAAAAElFTkSuQmCC';
  this.offsrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAcCAMAAACppkqwAAAACXBIWXMAAAsTAAALEwEAmpwYAAADAFBMVEU/Pz9AQEBCQkJDQ0NKSkpMTExNTU1OTk5QUFBRUVFSUlJUVFRVVVVYWFhZWVlbW1tcXFxdXV1eXl5fX19iYmJjY2NlZWVmZmZnZ2doaGhpaWlqamptbW10dHR1dXV2dnZ3d3d8fHx9fX1/f3+AgICBgYGCgoKDg4OFhYWGhoaHh4eIiIiJiYmKioqLi4uOjo6Pj4+QkJCSkpKUlJSVlZWWlpaYmJiZmZmampqbm5ucnJydnZ2enp6fn5+goKChoaGioqKjo6OkpKSlpaWmpqanp6epqamqqqqrq6utra2urq6wsLC1tbW3t7e4uLi5ubm7u7u8vLy9vb2+vr6a5OjAwMDBwcHCwsLDw8PExMTGxsbHx8fIyMjJycnKysrMzMzPz8/Q0NDR0dHS0tLT09PU1NTV1dXW1tbY2Nja2trb29vc3Nze3t7f39/g4ODh4eHi4uLj4+Pk5OTl5eXm5ubn5+fo6Ojp6enq6urr6+vs7Ozt7e3u7u7v7+/w8PDx8fHy8vLz8/P09PT19fX29vb39/f4+Pj5+fn6+vr7+/v8/Pz9/f3+/v7///8AAABCkAk94RQCCYoS8bAAAAAWbdA94R8AAAAAAAAABQAAABOVYIgABAEAAAAGH6QQacBFZcBBlL5Cr0ICCYoABAEAAAAGH6QAAAAAArAAAAEAAAAAAAAAAAAAAACKACEABQBC9AuVYIgABAEAAAAAAAQAAaYAAAIABQAAABMWbuABGOQAAAAAAAAAAAAAAAAAAAAAAAAAAAC/YRwABABPLyCACxKA7mRPL0QS8XBPMpQAxCgS8oA9654WbdAAAAAWbmAAAAQAAAAS8ug95RsAAAAAAAABGoQAAADxn43xntwBGoQAAAAAAAAS9SAAAAAAACg95RsAAAAS8ogA//8AAADxn3g95RsAAAAS8pRBhzQCCYoABAoAAAAS9sQS8qxBhzQCCYoAAA8AAAAAAAA95Ru6q80AAAAS8ug95RsS8xRBiBb90AAS8xRBiFoS8tQ/Pz8/Pz8VWo7vAAAAVXRSTlP///////////////////////////////////////////////////////////////////////////////////////////////////////////////8AsKEHzwAAAVhJREFUeNrt1i1vhTAUBmBOgsDgjkEgSOqqMEhkDUkVdZi6qsrKSn73TuHeDUIW2m5M7TUHGugT+kFazJphROqmY4nhwszzXCzNqO4jkCmbGCPZRABOEf0rNTWDcamxvSRgiQtmACSYBMCmA06JAnVc8gDLHwYc+wPAxIUAf4zTkzTbxb4o3auen/LZgEagMGpjsIWrvVYXIHLbnAFbAY59BW0Amp4iFZShjvmAO7zHgYXRqUASMGxNCmp/TS6AoHZnIIDTNtEBCPvFXYDI5XAGStgmeKQP4dvQl/41B+p3gBp0KANwAjD8Ogkowz/UXAAfFxzd+pUWxLvQMG1NNETrNbmAgJpulwLMQwDNcsU6gH79BJbvgDUuOPrjrW3DjA7+MWBdnTb+/rUfAHH5B+5ih4RlmgNIWTRPAprNRSdcRPeOoUgGnGR08JpjDo6ITd0mnx17QUfHDw3CUdHJl2jOAAAAAElFTkSuQmCC';
  this.loadingsrc = 'data:image/gif;base64,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';

  this.nsResolver = {
    lookupNamespaceURI:function (prefix) {
      if (prefix == "html") {
        return "http://www.w3.org/1999/xhtml";
      }
      else {
        return "";
      }
    }
  };
  this.expandUrlMap = [
    {name:'tinyurl',  func:this.expandUrl_tinyurl, ajax:true,  regex:/http:\/\/tinyurl\.com\//},
    {name:'snipurl',  func:this.expandUrl_tinyurl, ajax:true,  regex:/http:\/\/snipurl\.com\//},
    {name:'pingfm',   func:this.expandUrl_tinyurl, ajax:true,  regex:/http:\/\/ping\.fm\//},
    {name:'ffim',     func:this.expandUrl_tinyurl, ajax:true,  regex:/http:\/\/ff\.im\//},
    {name:'hellotxt', func:this.expandUrl_hellotxt, ajax:true,  regex:/http:\/\/hellotxt\.com\//},
    //{name:'funp',     func:this.expandUrl_tinyurl, ajax:true,  regex:/http:\/\/funp\.com\//},
    {name:'twitpic',  func:this.expandUrl_twitpic, ajax:true,  regex:/http:\/\/twitpic\.com\//},
    {name:'twinkle',  func:this.expandUrl_twinkle, ajax:true,  regex:/http:\/\/twinkle\.tapulous\.com\/index\.php\?hash=/},
    {name:'flickr',   func:this.expandUrl_flickr,  ajax:true,  regex:/(www\.)?flickr\.com\/photos/},
    {name:'youtube',  func:this.expandUrl_youtube, ajax:false, regex:/http:\/\/[a-z]*\.youtube\.com\//},
    {name:'img',      func:this.expandUrl_img,     ajax:false, regex:/http:\/\/.*\.(gif|jpg|png)/}
  ];
}

BetterMobileTwitter.prototype.encodeHTML = function(t) {
  t = t.replace(/&/g, '&amp;');
  t = t.replace(/\"/g, '&quot;');
  t = t.replace(/</g, '&lt;');
  t = t.replace(/>"/g, '&gt;');

  return t;
}

BetterMobileTwitter.prototype.init = function() {
  if (navigator.userAgent.match(/Chrome/)) {
    this.enabled = document.location.href == 'http://m.twitter.com/home';
    this.isChrome = true;
  }

  if (this.enabled && document.body) this.functionPrinciple();
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
        // Some tweets has special character, need to remove it
        for (var i=0;i<t.length;i++) {
          if (t.charCodeAt(i) < 32 && t.charCodeAt(i) != 10 && t.charCodeAt(i) != 13 && t.charCodeAt(i) != 9) {
            t = t.substring(0, i) + t.substring(i+1);
            --i;
          }
        }

        document.getElementsByTagName('ul')[0].innerHTML += '<li>Page ' + (bmt.page + 1) + '</li>' + t;
        bmt.loading = false;
        document.getElementById('bmt-scrolldetector').innerHTML = '';
        bmt.page++;
        bmt.expandUrl(1);
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
  if (!this.enabled) return;
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
  if (!bmt.enabled) {
    window.setTimeout(function() {bmt.checkUpdate(bmt);}, 60000);
    return;
  }

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
            document.getElementById('bmt-htmlholder').innerHTML = li;
            li = document.getElementById('bmt-htmlholder').innerHTML;
            if (li == bmt.lastMessage) {
              break;
            }
            else {
              newTweetsCount++;
            }
          }

          t = bmt.extract(t, '</li>');
        }
        document.getElementById('bmt-checkupdate').innerHTML = newTweetsCount?(newTweetsCount + ' new tweet' + (newTweetsCount>1?'s':'')):'';
      }
      else if (this.status) {
        document.getElementById('bmt-checkupdate').innerHTML = 'Error ' + this.status;
      }

      window.setTimeout(function() {bmt.checkUpdate(bmt);}, 60000);
    }
  }
  client.open('GET', 'http://m.twitter.com/account/home.mobile');
  client.send(null);
}

BetterMobileTwitter.prototype.expandUrl_tinyurl = function(bmt, a, url, t) {
  a.innerHTML = bmt.encodeHTML(decodeURIComponent(t.finalUrl));
  a.setAttribute('bmt-finalurl', t.finalUrl);
  if (!bmt.expandOneUrl(a)) {
    bmt.expandUrl(1);
  }
}

BetterMobileTwitter.prototype.expandUrl_image = function(a, url, imgsrc) {
  if (imgsrc[0] == '/') {
    imgsrc = url.match(/https?:\/\/[^\/]*/)[0] + imgsrc;
  }
  var img = document.createElement('img');
  img.setAttribute('style', 'border:none; margin-left:5px; height:70px;');
  img.src = imgsrc;
  a.appendChild(img);

  this.expandUrl(1);
}

BetterMobileTwitter.prototype.expandUrl_hellotxt = function(bmt, a, url, t) {
  if (url != t.finalUrl) {
    bmt.expandUrl_tinyurl(bmt, a, url, t);
  }

  t = bmt.extract(bmt.extract(t.responseText, '<div class="history-row big">'), '<p>', '</p>');
  if (t) {
    a.innerHTML = t;
  }

  bmt.expandUrl(1);
}

BetterMobileTwitter.prototype.expandUrl_twitpic = function(bmt, a, url, t) {
  t = bmt.extract(bmt.extract(t.responseText, '<img id="pic"'), 'src="', '"');
  bmt.expandUrl_image(a, url, t);
}

BetterMobileTwitter.prototype.expandUrl_twinkle = function(bmt, a, url, t) {
  t = bmt.extract(bmt.extract(t.responseText, '<div id="post">'), 'img src="', '"');
  bmt.expandUrl_image(a, url, t);
}

BetterMobileTwitter.prototype.expandUrl_flickr = function(bmt, a, url, t) {
  var pid = url.match(/flickr\.com\/photos\/[^\/]+\/(\d+)/);
  if (pid) {
    t = bmt.extract(bmt.extract(t.responseText, '<div id="photoImgDiv' + pid[1] + '"'), 'src="', '"');
    bmt.expandUrl_image(a, url, t);
  }
  else{
    bmt.expandUrl(1);
  }
}

BetterMobileTwitter.prototype.expandUrl_youtube = function(bmt, a, url) {
  var res = url.match(/[\?|&]v=([a-zA-Z0-9]*)(&.*$)?/);
  if (res) {
    a.innerHTML = a.innerHTML.replace(/([\?|&]v=[a-zA-Z0-9]*)(&amp;.*$)/, '$1&amp;...');

    bmt.expandUrl_image(a, url, 'http://i4.ytimg.com/vi/' + res[1] + '/default.jpg');
  }
}

BetterMobileTwitter.prototype.expandUrl_img = function(bmt, a, url) {
  bmt.expandUrl_image(a, url, url);

  bmt.expandUrl(1);
}

BetterMobileTwitter.prototype.expandOneUrl_ajaxWrapper = function(bmt, a, url, func) {
  var img = document.createElement('img');
  img.src = bmt.loadingsrc;
  img.setAttribute('style', 'margin-left:5px;');
  a.appendChild(img);

  GM_xmlhttpRequest({
    method: 'GET',
    url: url,
    onload: function(t) {
      a.removeChild(img);
      func(bmt, a, url, t);
    }
  });
}

BetterMobileTwitter.prototype.expandOneUrl = function(a) {
  a.setAttribute('bmt-expandurl', 'true');
  var url = a.getAttribute('bmt-finalurl');
  if (!url || url == '') {
    url = a.href;
  }
  for (var j=0;j<this.expandUrlMap.length;j++) {
    if (url.match(this.expandUrlMap[j].regex)) {
      //unsafeWindow.console.log('hit ' + a.href);
      if (this.expandUrlMap[j].ajax) {
        this.expandOneUrl_ajaxWrapper(this, a, url, this.expandUrlMap[j].func);
      }
      else {
        this.expandUrlMap[j].func(this, a, url);
      }

      return true;
    }
  }

  return false;
}

BetterMobileTwitter.prototype.expandUrl = function(maxRun) {
  //unsafeWindow.console.log('enter loop');
  if (!GM_xmlhttpRequest) return;

  var res = document.evaluate("//html:a[not(@bmt-expandurl)]", document, this.nsResolver, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
  //unsafeWindow.console.log(res.snapshotLength);
  var loadcount = 0;
  for (var i=0;i<res.snapshotLength;i++) {
    var a = res.snapshotItem(i);
    if (this.expandOneUrl(a)) {
      if (++loadcount >= maxRun) return;
    }
  }
  //unsafeWindow.console.log('exit loop');
}

BetterMobileTwitter.prototype.functionPrinciple = function() {
  // check if it is a mobile version
  if (document.getElementById('dim-screen')) return;

  var bmt = this;

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
    this.lastMessage = lastMessageLi[0].innerHTML;
    this.lastMessage = this.lastMessage.replace(/<small[^<]*<\/small>/, '');
  }
  var checkUpdateSpan = document.createElement('span');
  checkUpdateSpan.setAttribute('id', 'bmt-checkupdate');
  checkUpdateSpan.setAttribute('style', 'position: absolute; right: 100px; top: 3px;');
  document.getElementsByTagName('div')[0].appendChild(checkUpdateSpan);

  var onoff = document.createElement('img');
  onoff.src = bmt.onsrc;
  onoff.setAttribute('style', 'position: absolute; right: 0px; top: 0px; cursor:pointer;');
  onoff.addEventListener('click', function(e) {
    bmt.enabled = !bmt.enabled;
    e.target.src = bmt.enabled?bmt.onsrc:bmt.offsrc;
  }, false);
  document.getElementsByTagName('div')[0].appendChild(onoff);

  // an element to convert text to HTML, for comparing last message
  var htmlholder = document.createElement('span');
  htmlholder.setAttribute('id', 'bmt-htmlholder');
  htmlholder.style.display = 'none';
  document.body.appendChild(htmlholder);

  this.expandUrl(3);

  window.setInterval(function() {bmt.detectScroll(bmt);}, 500);
  window.setTimeout(function() {bmt.checkUpdate(bmt);}, 60000);
}
new BetterMobileTwitter().init();