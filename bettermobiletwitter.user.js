// ==UserScript==
// @name            Better Mobile Twitter
// @version         6
// @namespace       http://ellab.org
// @author          angusdev
// @description     To enhance the mobile twitter page
// @include         http://twitter.com/*
// @include         https://twitter.com/*
// @include         http://m.twitter.com/*
// @include         https://m.twitter.com/*
// ==/UserScript==

/*
Author: Angus http://angusdev.mysinablog.com/
              http://angusdev.blogspot.com/
Date:   2009-03-17

Version history:
6    (beta)         View other's tweets inline (no page refresh)
                    Add @mentions sidebar
                    Show link of direct messages, @mentions, replies to can see full page
                    @mentions and direct message side bar can collapse after expand
                    Add the switch to standard version button to page top
                    ExpandUrl supports burnurl.com, snurl.com, bitly.com
                    ExpandUrl image supports skitch.com, phodroid.com
                    ExpandUrl matches url better for tinyurl
                    ExpandUrl fix the hellotxt and twitpic image layout changed
                    Provide limited support of ExpandUrl in Chrome (those doesn't need cross site ajax)
                    @include more URLs instead of only http://m.twitter.com/home
5    17-Mar-2009    Add direct messages sidebar
                    Add replies sidebar
                    Add reply button for tweets
                    Detect if cannot load the page and quit the script
                    ExpandUrl supports tr.im, short.to, twurl.nl
                    ExpandUrl supports url with ellipse
                    ExpandUrl matches url better for ff.im, youtube and hellotxt
                    ExpandUrl image supports ping.fm and hellotxt
                    ExpandUrl will directly show the continue url if need to login google account
                    ExpandUrl will add spaces in really long url to make sure it will wrap
                    Add a clear TwitPic cache button
                    Fix the bug that exception raised when url stored in sessionStorage is empty string
4    20-Feb-2009    Auto expand short URL
                    Image and Youtube preview
                    Filter by user
                    Show new tweets count in window title
                    Fine tune the checking of invalid char
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
  this.supportXSS = true;
  this.enabled = true;
  this.enableScrollDetection = true;
  this.loading = false;
  this.page = 1;
  this.lastMessage = '';
  this.myname = '';
  this.viewingUsername = '';
  this.friendList;

  this.CHECK_UPDATE_INTERVAL = 60000;   // millisecond
  this.DETECT_SCROLL_INTERVAL = 500;    // millisecond
  this.DIRECT_MESSAGE_MAX_DISPLAY = 2;
  this.MENTIONS_MAX_DISPLAY = 2;
  this.MENTIONS_MAX_PAGE = 3;
  this.EXPANDURL_INIT_COUNT = 3;

  this.onsrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAcCAMAAACppkqwAAAACXBIWXMAAAsTAAALEwEAmpwYAAADAFBMVEUoKCgwMDA5OTkZOXogP3xAQEBERUhHSUtOUVVVVVVUWF5YWFhOWnBXY3plZWZiZGhsbGxvc3p0dHR9fX0YP4seRI8bQpEeT64lQ4AnRYErSIMkSJIoTJQsT5YyToUzUIg4VIoyVJo6Wpc6W50rU6AjVLcoWbguXLsxWKMwXLI1YLYxYL44ZL0iWsYmXMotYMQsYcw5Z8I6acY0aNA5bdNCV4BVbJlCYqJAY6pMba5BaLRMcLdQbahAbcVDcc1JdMpBc9dKeddJetxTfM1af8ltgqx0h618jrFXgM9bhtxSgeBYh+NciuRfjedjh9BpjNJvkdZzldd5mtxxluFzmud6nueCg4OXl5mam5yRoL+lpaWqrK63t7e/v7+DpOiFp+yKq+yRr+ufuOqirsiptcyvus+a5Oi7zfDGxsbOzs7Hz9/V1dXf39/M1OTO2vLW3OjV3/Td4uvd5PXn5+fg5Ozk6O/v7+/s8Pft8vz39/fz9Pj4+vz7/P39/f0S8OgABAGVYIgS8PxFZh4MAAAS8PhCkIMS8SQAAAD//EgAAAAWbsAWbuAABQAWbdAAAABCkAk94RQCCYoS8bAAAAAWbdA94R8AAAAAAAAABQAAABOVYIgABAEAAAAFhqAQacBFZcBBlL5Cr0ICCYoABAEAAAAFhqAAAAAAArAAAAEAAAAAAAAAAAAAAACKACEABQBC9AuVYIgABAEAAAAAAAQAAaYAAAIABQAAABMWbuABGOQAAAAAAAAAAAAAAAAAAAAAAAAAAAC/YRwABABPLyCACxKA7mRPL0QS8XBPMpQAxCgS8oA9654WbdAAAAAWbmAAAAQAAAAS8ug95RsAAAAAAAABGlIAAADxn43xntwBGlIAAAAAAAAS9SAAAAAAACg95RsAAAAS8ogA//8AAADxn3g95RsAAAAS8pRBhzQCCYoABAoAAAAS9sQS8qxBhzQCCYoAAA8AAAAAAAA95Ru6q80AAAAS8ug95RsS8xRBiBb90AAS8xRBiFoS8tQoKCgoKCj4nXKPAAAAZ3RSTlP///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AFBa6eAAAAdZJREFUeNq91ulT00AYx/Eg1OLBGkHRUSbQcoyl5TKKogIppUjTDAq0HAU6CLgUSimXxPD753madwkduksYvi+y2+kz+5n0mInCOV9VQ5I9amp6whqnFjhXeLn1c9+QXG9etbC1rVLDNlWVgFBkWLL+zuYXhcbH1+ooKC+1Udn6XzczsfNLW6ryeEQaGCDgQDCmhKTPlwV06Qbet7CyYHcC4nLApxvp8Vhcdze67l5978e7ggExbTw9rsVo1619oGtEG/MOJAg4EowAw1dizgZw9XPQMBzsfjSMQyz4JrreBgHSwH5xH5irAfhhGBU/MBYImLKRpyWHqykCnMMEAb+8I5ORd+xcMAJmvKVgu6uN+RkHO0gnCfCOBAMWUXXXKpYIMO2Lb3WBS8EIML0t41+SluQFlkwC/mC9gt/ekeleLQCQASZomQCsGmCeOadYvE/APMHf6NfoHs5MFyjSb7YO4AhGQNZXDqjuVYB8NuuAXh8T4J1I9XbLAJa/7dof7f827ehjsqw8UPQOpL70MAhWD7CsXDFn3VJwoEHzDwEE+Q7uGQjLAykpYPX5ne7gXOz80orCw6HZjByQ+R5tWxERLg9YWeF842lY+slReSbw5MhYe5lfA3x4QqsW145cAAAAAElFTkSuQmCC';
  this.offsrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAcCAMAAACppkqwAAAACXBIWXMAAAsTAAALEwEAmpwYAAADAFBMVEU/Pz9AQEBCQkJDQ0NKSkpMTExNTU1OTk5QUFBRUVFSUlJUVFRVVVVYWFhZWVlbW1tcXFxdXV1eXl5fX19iYmJjY2NlZWVmZmZnZ2doaGhpaWlqamptbW10dHR1dXV2dnZ3d3d8fHx9fX1/f3+AgICBgYGCgoKDg4OFhYWGhoaHh4eIiIiJiYmKioqLi4uOjo6Pj4+QkJCSkpKUlJSVlZWWlpaYmJiZmZmampqbm5ucnJydnZ2enp6fn5+goKChoaGioqKjo6OkpKSlpaWmpqanp6epqamqqqqrq6utra2urq6wsLC1tbW3t7e4uLi5ubm7u7u8vLy9vb2+vr6a5OjAwMDBwcHCwsLDw8PExMTGxsbHx8fIyMjJycnKysrMzMzPz8/Q0NDR0dHS0tLT09PU1NTV1dXW1tbY2Nja2trb29vc3Nze3t7f39/g4ODh4eHi4uLj4+Pk5OTl5eXm5ubn5+fo6Ojp6enq6urr6+vs7Ozt7e3u7u7v7+/w8PDx8fHy8vLz8/P09PT19fX29vb39/f4+Pj5+fn6+vr7+/v8/Pz9/f3+/v7///8AAABCkAk94RQCCYoS8bAAAAAWbdA94R8AAAAAAAAABQAAABOVYIgABAEAAAAGH6QQacBFZcBBlL5Cr0ICCYoABAEAAAAGH6QAAAAAArAAAAEAAAAAAAAAAAAAAACKACEABQBC9AuVYIgABAEAAAAAAAQAAaYAAAIABQAAABMWbuABGOQAAAAAAAAAAAAAAAAAAAAAAAAAAAC/YRwABABPLyCACxKA7mRPL0QS8XBPMpQAxCgS8oA9654WbdAAAAAWbmAAAAQAAAAS8ug95RsAAAAAAAABGoQAAADxn43xntwBGoQAAAAAAAAS9SAAAAAAACg95RsAAAAS8ogA//8AAADxn3g95RsAAAAS8pRBhzQCCYoABAoAAAAS9sQS8qxBhzQCCYoAAA8AAAAAAAA95Ru6q80AAAAS8ug95RsS8xRBiBb90AAS8xRBiFoS8tQ/Pz8/Pz8VWo7vAAAAVXRSTlP///////////////////////////////////////////////////////////////////////////////////////////////////////////////8AsKEHzwAAAVhJREFUeNrt1i1vhTAUBmBOgsDgjkEgSOqqMEhkDUkVdZi6qsrKSn73TuHeDUIW2m5M7TUHGugT+kFazJphROqmY4nhwszzXCzNqO4jkCmbGCPZRABOEf0rNTWDcamxvSRgiQtmACSYBMCmA06JAnVc8gDLHwYc+wPAxIUAf4zTkzTbxb4o3auen/LZgEagMGpjsIWrvVYXIHLbnAFbAY59BW0Amp4iFZShjvmAO7zHgYXRqUASMGxNCmp/TS6AoHZnIIDTNtEBCPvFXYDI5XAGStgmeKQP4dvQl/41B+p3gBp0KANwAjD8Ogkowz/UXAAfFxzd+pUWxLvQMG1NNETrNbmAgJpulwLMQwDNcsU6gH79BJbvgDUuOPrjrW3DjA7+MWBdnTb+/rUfAHH5B+5ih4RlmgNIWTRPAprNRSdcRPeOoUgGnGR08JpjDo6ITd0mnx17QUfHDw3CUdHJl2jOAAAAAElFTkSuQmCC';
  this.loadingsrc = 'data:image/gif;base64,R0lGODlhEAAQAMQAAP///+7u7t3d3bu7u6qqqpmZmYiIiHd3d2ZmZlVVVURERDMzMyIiIhEREQARAAAAAP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFBwAQACwAAAAAEAAQAAAFdyAkQgGJJOWoQgIjBM8jkKsoPEzgyMGsCjPDw7ADpkQBxRDmSCRetpRA6Rj4kFBkgLC4IlUGhbNQIwXOYYWCXDufzYPDMaoKGBoKb886OjAKdgZAAgQkfCwzAgsDBAUCgl8jAQkHEAVkAoA1AgczlyIDczUDA2UhACH5BAUHABAALAAAAAAPABAAAAVjICSO0IGIATkqIiMKDaGKC8Q49jPMYsE0hQdrlABCGgvT45FKiRKQhWA0mPKGPAgBcTjsspBCAoH4gl+FmXNEUEBVAYHToJAVZK/XWoQQDAgBZioHaX8igigFKYYQVlkCjiMhACH5BAUHABAALAAAAAAQAA8AAAVgICSOUGGQqIiIChMESyo6CdQGdRqUENESI8FAdFgAFwqDISYwPB4CVSMnEhSej+FogNhtHyfRQFmIol5owmEta/fcKITB6y4choMBmk7yGgSAEAJ8JAVDgQFmKUCCZnwhACH5BAUHABAALAAAAAAQABAAAAViICSOYkGe4hFAiSImAwotB+si6Co2QxvjAYHIgBAqDoWCK2Bq6A40iA4yYMggNZKwGFgVCAQZotFwwJIF4QnxaC9IsZNgLtAJDKbraJCGzPVSIgEDXVNXA0JdgH6ChoCKKCEAIfkEBQcAEAAsAAAAABAADgAABUkgJI7QcZComIjPw6bs2kINLB5uW9Bo0gyQx8LkKgVHiccKVdyRlqjFSAApOKOtR810StVeU9RAmLqOxi0qRG3LptikAVQEh4UAACH5BAUHABAALAAAAAAQABAAAAVxICSO0DCQKBQQonGIh5AGB2sYkMHIqYAIN0EDRxoQZIaC6bAoMRSiwMAwCIwCggRkwRMJWKSAomBVCc5lUiGRUBjO6FSBwWggwijBooDCdiFfIlBRAlYBZQ0PWRANaSkED1oQYHgjDA8nM3kPfCmejiEAIfkEBQcAEAAsAAAAABAAEAAABWAgJI6QIJCoOIhFwabsSbiFAotGMEMKgZoB3cBUQIgURpFgmEI0EqjACYXwiYJBGAGBgGIDWsVicbiNEgSsGbKCIMCwA4IBCRgXt8bDACkvYQF6U1OADg8mDlaACQtwJCEAIfkEBQcAEAAsAAABABAADwAABV4gJEKCOAwiMa4Q2qIDwq4wiriBmItCCREHUsIwCgh2q8MiyEKODK7ZbHCoqqSjWGKI1d2kRp+RAWGyHg+DQUEmKliGx4HBKECIMwG61AgssAQPKA19EAxRKz4QCVIhACH5BAUHABAALAAAAAAQABAAAAVjICSOUBCQqHhCgiAOKyqcLVvEZOC2geGiK5NpQBAZCilgAYFMogo/J0lgqEpHgoO2+GIMUL6p4vFojhQNg8rxWLgYBQJCASkwEKLC17hYFJtRIwwBfRAJDk4ObwsidEkrWkkhACH5BAUHABAALAAAAQAQAA8AAAVcICSOUGAGAqmKpjis6vmuqSrUxQyPhDEEtpUOgmgYETCCcrB4OBWwQsGHEhQatVFhB/mNAojFVsQgBhgKpSHRTRxEhGwhoRg0CCXYAkKHHPZCZRAKUERZMAYGMCEAIfkEBQcAEAAsAAABABAADwAABV0gJI4kFJToGAilwKLCST6PUcrB8A70844CXenwILRkIoYyBRk4BQlHo3FIOQmvAEGBMpYSop/IgPBCFpCqIuEsIESHgkgoJxwQAjSzwb1DClwwgQhgAVVMIgVyKCEAIfkECQcAEAAsAAAAABAAEAAABWQgJI5kSQ6NYK7Dw6xr8hCw+ELC85hCIAq3Am0U6JUKjkHJNzIsFAqDqShQHRhY6bKqgvgGCZOSFDhAUiWCYQwJSxGHKqGAE/5EqIHBjOgyRQELCBB7EAQHfySDhGYQdDWGQyUhADs';

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
    {name:'tinyurl',     func:this.expandUrl_tinyurl,     ajax:true,  regex:/http:\/\/tinyurl\.com\/[a-zA-z0-9]+/},
    {name:'snipurl',     func:this.expandUrl_tinyurl,     ajax:true,  regex:/http:\/\/snipurl\.com\/[a-zA-z0-9]+$/},
    {name:'pingfm',      func:this.expandUrl_tinyurl,     ajax:true,  regex:/http:\/\/ping\.fm\/[a-zA-z0-9]+$/},
    {name:'ffim',        func:this.expandUrl_tinyurl,     ajax:true,  regex:/http:\/\/ff\.im\/[a-zA-z0-9\-\|]+$/},
    {name:'trim',        func:this.expandUrl_tinyurl,     ajax:true,  regex:/http:\/\/tr\.im\/[a-zA-z0-9]+$/},
    {name:'isgd',        func:this.expandUrl_tinyurl,     ajax:true,  regex:/http:\/\/is\.gd\/[a-zA-z0-9]+$/},
    {name:'bitly',       func:this.expandUrl_tinyurl,     ajax:true,  regex:/http:\/\/bit\.ly\/[a-zA-z0-9]+$/},
    {name:'bitlycom',    func:this.expandUrl_tinyurl,     ajax:true,  regex:/http:\/\/bitly\.com\/[a-zA-z0-9]+$/},
    {name:'twurl',       func:this.expandUrl_tinyurl,     ajax:true,  regex:/http:\/\/twurl\.nl\/[a-zA-z0-9]+$/},
    {name:'shortto',     func:this.expandUrl_tinyurl,     ajax:true,  regex:/http:\/\/short\.to\/[a-zA-z0-9]+$/},
    {name:'snurl',       func:this.expandUrl_tinyurl,     ajax:true,  regex:/http:\/\/snurl.com\/[a-zA-z0-9]+$/},
    {name:'hellotxt',    func:this.expandUrl_tinyurl,     ajax:true,  regex:/http:\/\/hellotxt\.com\/l\/[a-zA-z0-9]+$/},
    {name:'hellotxttxt', func:this.expandUrl_hellotxt,    ajax:true,  regex:/http:\/\/hellotxt\.com\/[a-zA-z0-9]+$/},
    {name:'burnurl',     func:this.expandUrl_burnurl,     ajax:true,  regex:/http:\/\/burnurl\.com\/[a-zA-z0-9]+$/},
    //{name:'funp',        func:this.expandUrl_tinyurl,     ajax:true,  regex:/http:\/\/funp\.com\//},
    {name:'twitpic',     func:this.expandUrl_twitpic,     ajax:true,  regex:/http:\/\/twitpic\.com\/[a-zA-z0-9]+$/},
    {name:'tapulous',    func:this.expandUrl_tapulous,    ajax:true,  regex:/http:\/\/twinkle\.tapulous\.com\/index\.php\?hash=/},
    {name:'flickr',      func:this.expandUrl_flickr,      ajax:true,  regex:/(www\.)?flickr\.com\/photos/},
    {name:'pingfmimg',   func:this.expandUrl_pingfmimg,   ajax:true,  regex:/http:\/\/ping\.fm\/p\/[a-zA-z0-9]+$/},
    {name:'hellotxtimg', func:this.expandUrl_hellotxtimg, ajax:true,  regex:/http:\/\/hellotxt\.com\/i\/[a-zA-z0-9]+$/},
    {name:'skitch',      func:this.expandUrl_skitch,      ajax:true,  regex:/http:\/\/skitch\.com\//},
    {name:'phodroid',    func:this.expandUrl_phodroid,    ajax:true,  regex:/http:\/\/phodroid\.com\//},
    {name:'youtube',     func:this.expandUrl_youtube,     ajax:false, regex:/http:\/\/[a-z]*\.youtube\.com\//},
    {name:'img',         func:this.expandUrl_img,         ajax:false, regex:/http:\/\/.*\.(gif|jpg|png)$/},
    {name:'googlelogin', func:this.expandUrl_googlelogin, ajax:false, regex:/^https?:\/\/[^\/]*\.google\.com?(\.[a-zA-Z]{1,2})?\/accounts\/ServiceLogin\?/},
    {name:'longurl',     func:this.expandUrl_longurl,     ajax:false, regex:/.{71}/},
  ];
}

BetterMobileTwitter.prototype.stringifyJSON = function(obj) {
  if (JSON && JSON.stringify) {
    return JSON.stringify(obj);
  }

  var Ci = Components.interfaces;
  var Cc = Components.classes;

  var nativeJSON = Cc["@mozilla.org/dom/json;1"].createInstance(Ci.nsIJSON);
  if (nativeJSON) {
    return nativeJSON.encode(obj);
  }

  return '{}';
}

BetterMobileTwitter.prototype.parseJSON = function(s) {
  if (JSON && JSON.parse) {
    return JSON.parse(s);
  }

  var Ci = Components.interfaces;
  var Cc = Components.classes;

  var nativeJSON = Cc["@mozilla.org/dom/json;1"].createInstance(Ci.nsIJSON);
  if (nativeJSON) {
    return nativeJSON.encode(s);
  }

  return {};
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
    this.enabled = document.location.href.match(/^https?:\/\/(m\.)?twitter\.com\//)?true:false;
    this.isChrome = true;
    this.supportXSS = false;
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

BetterMobileTwitter.prototype.removeInvalidChar = function(t) {
  // Some tweets has special character, need to remove it
  for (var i=0;i<t.length;i++) {
    if (t.charCodeAt(i) < 32 && t.charCodeAt(i) != 10 && t.charCodeAt(i) != 13 && t.charCodeAt(i) != 9) {
      t = t.substring(0, i) + t.substring(i+1);
      --i;
    }
  }

  return t;
}

BetterMobileTwitter.prototype.extractMobileTweetsHTML = function(fullt) {
  return this.removeInvalidChar(this.extract(fullt, '<ul>', '</ul>'));
}

BetterMobileTwitter.prototype.processMobileTweetsHTML = function(fullt) {
  var bmt = this;

  var targetul = document.getElementById('bmt-tweetsdiv').getElementsByTagName('ul')[0];

  if (this.page > 0) {
    var pageli = document.createElement('li');
    pageli.innerHTML = 'Page ' + (this.page + 1);
    targetul.appendChild(pageli);
  }
  else {
    // if viewing user's page, need to specially extract first message
    var t = this.extract(this.extract(fullt, '<td class="g">'), '</b> ', '<div');
    if (t) {
      var firstli = document.createElement('li');
      firstli.innerHTML = t;
      targetul.appendChild(firstli);
    }
  }

  var t = this.extractMobileTweetsHTML(fullt);
  var ulholder = document.createElement('ul');
  ulholder.innerHTML = t;
  var lilist = ulholder.getElementsByTagName('li');

  // no need to enable scroll detection to load next page because no more tweets left
  this.enableScrollDetection = lilist.length > 0;
  if (lilist.length == 0 && this.page == 0) {
    // first page no tweets, normally is protected

    // get the message
    var dummymsg = this.extract(fullt, '</div>', '<div');
    if (dummymsg) {
      var dummyli = document.createElement('li');
      dummyli.innerHTML = dummymsg;
      targetul.appendChild(dummyli);
    }
  }

  while (lilist.length) {
    lilist[0].addEventListener('mouseover', function(e) { bmt.onMouseOverOutTweets(e.target, true); }, false);
    lilist[0].addEventListener('mouseout', function(e) { bmt.onMouseOverOutTweets(e.target, false); }, false);
    targetul.appendChild(lilist[0]);
  }

  this.loading = false;
  document.getElementById('bmt-scrolldetector').innerHTML = '';

  // add user filter
  var filter = document.getElementById('bmt-userfilter');
  while (t) {
    var li = this.extract(t, '<li>', '</li>');
    if (li) {
      this.addUserFilter(filter, li);
    }

    t = this.extract(t, '</li>');
  }
  this.onUserFilterChanged(filter);

  this.page++;

  this.modifyUserLink();
  this.expandUrl(1);
}

BetterMobileTwitter.prototype.nextPage = function() {
  if (this.loading) {
    return;
  }

  this.loading = true;
  document.getElementById('bmt-scrolldetector').innerHTML = this.viewingUsername?('Loading ' + this.viewingUsername + ' ...'):'Loading more tweets ...';

  var bmt = this;
  var client = new XMLHttpRequest();
  client.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        bmt.processMobileTweetsHTML(this.responseText);
      }
      else {
        document.getElementById('bmt-scrolldetector').innerHTML = 'Error ' + this.status;
      }
    }
  }
  if (this.viewingUsername) {
    client.open('GET', document.location.protocol + '//' + document.location.host + '/account/profile.mobile?user=' + this.viewingUsername + '&page=' + (this.page + 1));
  }
  else {
    client.open('GET', document.location.protocol + '//' + document.location.host + '/account/home.mobile?page=' + (this.page + 1));
  }
  client.send(null);
}

BetterMobileTwitter.prototype.loadReplies = function() {
  var replyDiv = document.getElementById('bmt-replydiv');
  replyDiv.innerHTML = 'Loading replies ...';

  var bmt = this;
  var client = new XMLHttpRequest();
  client.onreadystatechange = function() {
    if (this.readyState == 4) {
      // Since the layer has set the min-height style, clear it so it won't take up too much space if no message
      replyDiv.style.minHeight = '';

      if (this.status == 200) {
        var t = bmt.extractMobileTweetsHTML(this.responseText);
        replyDiv.innerHTML = '<div class="s" style="font-size:133%;">' +
                             '<a href="http://' + document.location.host + '/replies"><b>replies</b></a>' +
                             '</div><ul>' + t + '</ul>';

      }
      else {
        replyDiv.innerHTML = 'Error ' + this.status;
      }
    }
  }
  client.open('GET', document.location.protocol + '//' + document.location.host + '/replies');
  client.send(null);
}

BetterMobileTwitter.prototype.loadDirectMessage = function(displayCount) {
  var directMessageDiv = document.getElementById('bmt-directdiv');
  directMessageDiv.innerHTML = 'Loading direct messages ...';

  var bmt = this;
  var client = new XMLHttpRequest();
  client.onreadystatechange = function() {
    if (this.readyState == 4) {
      // Since the layer has set the min-height style, clear it so it won't take up too much space if no message
      directMessageDiv.style.minHeight = '';

      if (this.status == 200) {
        var olbody = bmt.extract(this.responseText, '<ol class="statuses" id="timeline">', '</ol>');
        var cont = true;
        var count = 0;
        var html = '';
        while (cont) {
          var t = bmt.extract(olbody, '<li', '</li>');
          if (t) {
            t = bmt.extract(t, 'status-body">', '<span class="action');
            // span class="published" is the publish time, change to <small> as used in mobile version
            t = t.replace(/<span class="published">([^<]*)<\/span>/, ' <small>$1</small>');
            // remove all span tags
            t = t.replace(/<\/?span[^>]*>/g, '');
            // remove all image tags
            t = t.replace(/<img[^>]*>/g, '');
            // remove all class attribute
            t = t.replace(/\s+class="[^"]*"/g, '');
            // remove all title attribute
            t = t.replace(/\s+title="[^"]*"/g, '');
            // add spaces after the username
            t = t.replace(/(<\/strong>)/, '$1 ');
            // finally remove invalid chars
            t = bmt.removeInvalidChar(t);
            html = html + '<li' + (++count > displayCount?' class="bmt-moreitem" style="display:none;"':'') + '>' + t + '</li>';

            olbody = bmt.extract(olbody, '</li>');
          }
          else {
            cont = false;
          }
        }
        directMessageDiv.innerHTML = '<div class="s" style="font-size:133%;">' +
                                     '<a href="http://' + document.location.host + '/direct_messages"><b>direct messages</b></a>' +
                                     (count > displayCount?' <a id="bmt-directdiv-expand" href="javascript:void(0)">[+]</a>':'') +
                                     '</div><ul>' + html + '</ul>';
        var expandLink = document.getElementById('bmt-directdiv-expand');
        if (expandLink) {
          expandLink.addEventListener('click', function(e) {
            var isExpand = e.target.textContent == '[+]';
            var lilist = directMessageDiv.getElementsByClassName('bmt-moreitem');
            for (var i=0;i<lilist.length;i++) {
              lilist[i].style.display = isExpand?'':'none';
            }
            e.target.innerHTML = isExpand?'[-]':'[+]';
          }, false);
        }
      }
      else {
        directMessageDiv.innerHTML = 'Error ' + this.status;
      }
    }
  }
  client.open('GET', document.location.protocol + '//' + document.location.host + '/direct_messages');
  client.send(null);
}

BetterMobileTwitter.prototype.inlineViewUser = function(username) {
  document.getElementById('bmt-tweetsdiv').getElementsByTagName('ul')[0].innerHTML = '';
  var youAndFriendsDiv = document.evaluate("//html:div[@class='s']", document, this.nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  if (youAndFriendsDiv) {
    // find profile image
    var profileImage = '';
    for (var i=0;i<this.friendList.length;i++) {
      if (this.friendList[i].screen_name == username) {
        profileImage = this.friendList[i].profile_image_url;
      }
    }
    var html = '<span style="vertical-align:top"><a href="' + document.location.protocol + '//' + document.location.host + '/' + username + '"><b style="font-size:150%;">' + username + '</b></a></span>';
    if (profileImage) {
      html = '<img alt="' + username + '" height="48" src="' + profileImage + '"/> ' + html;
    }
    youAndFriendsDiv.innerHTML = html;
  }
  this.viewingUsername = username;
  this.page = 0;
  scroll(0, 0);
  this.nextPage();
}

BetterMobileTwitter.prototype.loadMentions = function(displayCount) {
  var mentionDiv = document.getElementById('bmt-mentiondiv');
  mentionDiv.innerHTML = 'Loading @mentions ...';

  this.loadMentionsPage(mentionDiv, displayCount, 1, '', 0);
}

BetterMobileTwitter.prototype.loadMentionsPage = function(mentionDiv, displayCount, page, html, mentionsCount) {
  var bmt = this;
  GM_xmlhttpRequest({
    method: 'GET',
    url: 'http://search.twitter.com/search?q=%40' + bmt.myname + (page>1?'&page='+page:''),
    onload: function(t) {
      var olbody = bmt.extract(t.responseText, '<div id="results">');
      var cont = true;
      while (cont) {
        var t = bmt.extract(olbody, '<li class="result', '</li>');
        if (t) {
          t = bmt.extract(t, '<div class="msg">', '<span class="source">');
          // change div class=info to small to display the tweets time
          t = t.replace(/<div class="info">\s*(.*)\s*$/m, '<small>$1</small>');
          // remove all span tags
          t = t.replace(/<\/?span[^>]*>/g, '');
          // remove all span tags
          t = t.replace(/<\/?div[^>]*>/g, '');
          // remove all target attribute
          t = t.replace(/\s+target="[^"]*"/g, '');
          // remove all onclick attribute
          t = t.replace(/\s+onclick="[^"]*"/g, '');
          // change the search topic link
          t = t.replace(/<a href="\/search\?([^"]*)/g, '<a href="http://search.twitter.com/search?$1');
          // finally remove invalid chars
          t = bmt.removeInvalidChar(t);

          var checkIsReply = t.match(/<a href="[^"]+"[^>]*>[^<]*<\/a>: <a href="([^"]+)"/);
          if (!checkIsReply || !checkIsReply[1].match('\\/' + bmt.myname + '$')) {
            html = html + '<li' + (++mentionsCount > displayCount?' class="bmt-moreitem" style="display:none;"':'') + '>' + t + '</li>';
          }

          olbody = bmt.extract(olbody, '</li>');
        }
        else {
          cont = false;
        }
      }
      if (page == bmt.MENTIONS_MAX_PAGE || (page > 1 && mentionsCount >= displayCount )) {
        // Since the layer has set the min-height style, clear it so it won't take up too much space if no message
        mentionDiv.style.minHeight = '';

        mentionDiv.innerHTML = '<div class="s" style="font-size:133%;">' +
                               '<a href="http://search.twitter.com/search?q=%40' + bmt.myname + '"><b>@mentions</b></a>' +
                               (mentionsCount > displayCount?' <a id="bmt-mentiondiv-expand" href="javascript:void(0)">[+]</a>':'') +
                               '</div><ul>' + html + '</ul>';
        var expandLink = document.getElementById('bmt-mentiondiv-expand');
        if (expandLink) {
          expandLink.addEventListener('click', function(e) {
            var isExpand = e.target.textContent == '[+]';
            var lilist = mentionDiv.getElementsByClassName('bmt-moreitem');
            for (var i=0;i<lilist.length;i++) {
              lilist[i].style.display = isExpand?'':'none';
            }
            e.target.innerHTML = isExpand?'[-]':'[+]';
          }, false);
        }
      }
      else {
        bmt.loadMentionsPage(mentionDiv, displayCount, ++page, html, mentionsCount);
      }
    }
  });
}

BetterMobileTwitter.prototype.calcOffsetTop = function(e) {
  var top = 0;
  do {
    if (!isNaN(e.offsetTop)) top += e.offsetTop;
  } while (e = e.offsetParent);

  return top;
}

BetterMobileTwitter.prototype.detectScroll = function() {
  if (!this.enabled || !this.enableScrollDetection) return;
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
  if (!this.enabled) {
    window.setTimeout(function() {bmt.checkUpdate();}, this.CHECK_UPDATE_INTERVAL);
    return;
  }

  var client = new XMLHttpRequest();
  client.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        var newTweetsCount = 0;
        var t = bmt.extractMobileTweetsHTML(this.responseText);
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
        if (newTweetsCount) {
          document.getElementById('bmt-checkupdate').innerHTML = newTweetsCount + ' new tweet' + (newTweetsCount>1?'s':'');
          if (document.title.match(/^\(\d+\)/)) {
            document.title = document.title.replace(/^\(\d+\)/, '(' + newTweetsCount + ')')
          }
          else {
            document.title = '(' + newTweetsCount + ') ' + document.title;
          }
        }
      }
      else if (this.status) {
        document.getElementById('bmt-checkupdate').innerHTML = 'Error ' + this.status;
      }

      window.setTimeout(function() {bmt.checkUpdate();}, bmt.CHECK_UPDATE_INTERVAL);
    }
  }
  client.open('GET', document.location.protocol + '//' + document.location.host + '/account/home.mobile');
  client.send(null);
}

BetterMobileTwitter.prototype.addUserFilter = function(filter, li) {
  // get user list
  var nameres = li.match(/^<a[^>]*>([^<]*)</);
  if (nameres) {
    var name = nameres[1];
    for (var i=1; i<filter.options.length; i++) {
      if (filter.options[i].value.toLowerCase() == name.toLowerCase()) return;
      if (filter.options[i].value.toLowerCase() > name.toLowerCase()) break;
    }

    var option = document.createElement('option');
    option.text = name;
    option.value = name;
    filter.options.add(option, i);
  }
}

BetterMobileTwitter.prototype.onUserFilterChanged = function(filter) {
  var name = filter.options[filter.selectedIndex].value;

  var lis = document.getElementById('bmt-tweetsdiv').getElementsByTagName('li');
  for (var i=0; i<lis.length; i++) {
    if (filter.selectedIndex == 0 || lis[i].innerHTML.match('href="\/' + name + '"')) {
      lis[i].style.display = '';
    }
    else {
      lis[i].style.display = 'none';
    }
  }
}

BetterMobileTwitter.prototype.sessionStorageWrapper = function(url, obj, key, func) {
  if (!window.sessionStorage) {
    return func();
  }

  key = key + '|';
  if (obj.value && obj.value.length > key.length && obj.value.substring(0, key.length) == key) {
    return obj.value.substring(key.length + 1);
  }

  var data = func();
  window.sessionStorage.setItem(url, key + '|' + data);
  return data;
}

BetterMobileTwitter.prototype.sessionStorageWrapper_image = function(a, url, obj, key, func) {
  var imgUrl = this.sessionStorageWrapper(url, obj, key, func);

  if (imgUrl) {
    this.expandUrl_image(a, url, imgUrl);
  }
  else{
    this.expandUrl(1);
  }
}

BetterMobileTwitter.prototype.expandUrl_tinyurl = function(bmt, a, url, t) {
  var finalUrl = bmt.sessionStorageWrapper(url, t, 'tinyurl', function() {
    return t.finalUrl;
  });

  if (finalUrl && url != finalUrl) {
    a.innerHTML = bmt.encodeHTML(decodeURIComponent(finalUrl));
  }
  a.setAttribute('bmt-finalurl', finalUrl);

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
  t = bmt.extract(bmt.extract(t.responseText, '<div class="history-row big">'), '<p>', '</p>');
  if (t) {
    a.innerHTML = t;
  }

  bmt.expandUrl(1);
}


BetterMobileTwitter.prototype.expandUrl_burnurl = function(bmt, a, url, t) {
  var finalUrl = bmt.sessionStorageWrapper(url, t, 'burnurl', function() {
    var res = t.responseText.match(/<frame [^>]*src="([^"]+)" [^>]*id="bottomFrame"[^>]*>/);
    if (res) {
      return res[1];
    }
    else {
      return null;
    }
  });

  if (finalUrl && url != finalUrl) {
    a.innerHTML = bmt.encodeHTML(decodeURIComponent(finalUrl));
    a.href = finalUrl;
    a.setAttribute('bmt-finalurl', finalUrl);
  }

  bmt.expandUrl(1);
}

BetterMobileTwitter.prototype.expandUrl_twitpic = function(bmt, a, url, t) {
  bmt.sessionStorageWrapper_image(a, url, t, 'twitpic', function() {
    return bmt.extract(bmt.extract(t.responseText, '<div id="photo"'), '<img class="photo-large" src="', '"');
  });
}

BetterMobileTwitter.prototype.expandUrl_tapulous = function(bmt, a, url, t) {
  var res = url.match(/[\?|&]hash=([a-zA-Z0-9]*)(&.*$)?/);
  if (res) {
    // show the first 4 hash, then follow by ...
    a.innerHTML = a.innerHTML.replace(/([\?|&amp;]hash=[a-zA-Z0-9]{4})[a-zA-Z0-9]*/, '$1...');
  }

  bmt.sessionStorageWrapper_image(a, url, t, 'tapulous', function() {
    return bmt.extract(bmt.extract(bmt.extract(t.responseText, '<div id="post">'), '</div>'), 'img src="', '"');
  });
}

BetterMobileTwitter.prototype.expandUrl_pingfmimg = function(bmt, a, url, t) {
  bmt.sessionStorageWrapper_image(a, url, t, 'pingfmimg', function() {
    return bmt.extract(bmt.extract(t.responseText, 'background:url(/_images/layout/loading.gif)'), '<img src="', '"');
  });
}


BetterMobileTwitter.prototype.expandUrl_hellotxtimg = function(bmt, a, url, t) {
  bmt.sessionStorageWrapper_image(a, url, t, 'hellotxtimg', function() {
    return bmt.extract(bmt.extract(t.responseText, '<div class="status_pic'), ' src="', '"');
  });
}

BetterMobileTwitter.prototype.expandUrl_flickr = function(bmt, a, url, t) {
  bmt.sessionStorageWrapper_image(a, url, t, 'flickr', function() {
    var pid = url.match(/flickr\.com\/photos\/[^\/]+\/(\d+)/);
    if (pid) {
      return bmt.extract(bmt.extract(t.responseText, '<div id="photoImgDiv' + pid[1] + '"'), 'src="', '"');
    }
    return '';
  });
}

BetterMobileTwitter.prototype.expandUrl_skitch = function(bmt, a, url, t) {
  bmt.sessionStorageWrapper_image(a, url, t, 'skitch', function() {
    return bmt.extract(t.responseText, "plasq.mySkitch.selectCopyContainer.addSelectCopy( 'Image only', '", "'");
  });
}

BetterMobileTwitter.prototype.expandUrl_phodroid = function(bmt, a, url, t) {
  bmt.sessionStorageWrapper_image(a, url, t, 'phodroid', function() {
    return bmt.extract(t.responseText, 'div id="photo"><img src="', '"');
  });
}

BetterMobileTwitter.prototype.expandUrl_youtube = function(bmt, a, url) {
  var res = url.match(/[\?|&]v=([a-zA-Z0-9_\-]*)(&.*$)?/);
  if (res) {
    a.innerHTML = a.innerHTML.replace(/([\?|&]v=[a-zA-Z0-9_\-]*)(&.*$)/, '$1&amp;...');

    bmt.expandUrl_image(a, url, 'http://i4.ytimg.com/vi/' + res[1] + '/default.jpg');
  }
  else {
    bmt.expandUrl_longurl(bmt, a, url);
  }
}

BetterMobileTwitter.prototype.expandUrl_img = function(bmt, a, url) {
  bmt.expandUrl_image(a, url, url);
}

BetterMobileTwitter.prototype.expandUrl_googlelogin = function(bmt, a, url) {
  var res = url.match(/&continue=(.*)/);
  if (res) {
    a.innerHTML = bmt.encodeHTML(decodeURIComponent(res[1]));
  }

  bmt.expandUrl(1);
}

BetterMobileTwitter.prototype.expandUrl_longurl = function(bmt, a, url) {
  var MAX_LENGTH = 70;
  var html = a.innerHTML;
  if (html.length > MAX_LENGTH) {
    var brokenurl = '';
    while (html.length > MAX_LENGTH) {
      brokenurl = brokenurl + (brokenurl.length?' ':'') + html.substring(0, MAX_LENGTH);
      html = html.substring(MAX_LENGTH);
    }
    brokenurl = brokenurl + (brokenurl.length?' ':'') + html.substring(0, MAX_LENGTH);

    a.innerHTML = bmt.encodeHTML(brokenurl);
  }

  bmt.expandUrl(1);
}

BetterMobileTwitter.prototype.expandOneUrl_ajaxWrapper = function(bmt, a, url, func) {
  if (window.sessionStorage) {
    // t.finalUrl only
    var t = window.sessionStorage.getItem(url);
    if (t) {
      func(bmt, a, url, t);
      return;
    }
  }

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
  var url = a.getAttribute('bmt-finalurl');
  if (!url || url == '') {
    url = a.href;
  }
  for (var j=0;j<this.expandUrlMap.length;j++) {
    if (url.match(this.expandUrlMap[j].regex)) {
      if (this.expandUrlMap[j].ajax) {
        if (this.supportXSS) {
          this.expandOneUrl_ajaxWrapper(this, a, url, this.expandUrlMap[j].func);
        }
        else {
          return false;
        }
      }
      else {
        this.expandUrlMap[j].func(this, a, url);
      }

      return true;
    }
  }

  var urlres = a.innerHTML.match(/(.*)\.\.\.+$/);
  if (urlres) {
    if (url.substring(0, urlres[1].length) == urlres[1]) {
      a.innerHTML = this.encodeHTML(url);
    }
  }

  return false;
}

BetterMobileTwitter.prototype.expandUrl = function(maxRun) {
  var res = document.evaluate("//html:div[@id='bmt-tweetsdiv']//html:a[not(@bmt-expandurl)]", document, this.nsResolver, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
  var loadcount = 0;
  for (var i=0;i<res.snapshotLength;i++) {
    var a = res.snapshotItem(i);
    if (!a.getAttribute('bmt-expandurl')) {
      a.setAttribute('bmt-expandurl', 'true');
      if (this.expandOneUrl(a)) {
        if (++loadcount >= maxRun) return;
      }
    }
  }
}

BetterMobileTwitter.prototype.onMouseOverOutTweets = function(obj, isover) {
  while (obj && obj.tagName.toUpperCase() != 'LI') {
    obj = obj.parentNode;
  }
  if (obj) {
    var actionspan = obj.getElementsByTagName('span');
    if (actionspan.length > 0 && actionspan[actionspan.length - 1].getAttribute('bmt-actionspan')) {
      actionspan = actionspan[actionspan.length - 1];
    }
    else if (isover && obj.getElementsByTagName('a').length && this.myname != obj.getElementsByTagName('a')[0].textContent) {
      actionspan = document.createElement('span');
      actionspan.setAttribute('bmt-actionspan', 'true');
      // tweets div is 80% width, so use right: 22%
      actionspan.setAttribute('style', 'position: absolute; right: 22%;');

      var replybtn = document.createElement('img');
      replybtn.src = 'http://static.twitter.com/images/icon_reply.gif';
      replybtn.setAttribute('style', 'cursor:pointer; padding:5px;');
      replybtn.addEventListener('click', function(e) {
        var status = document.getElementById('status');
        if (status) {
          var replyto = '@' + obj.getElementsByTagName('a')[0].textContent;
          // ignore if already start with the replyto string
          if (!status.value.match('^' + replyto)) {
            status.value = replyto + ' ' + status.value.replace(replyto, '');
            status.focus();
          }
        }
      }, false);

      actionspan.appendChild(replybtn);

      obj.appendChild(actionspan);
    }
    else {
      actionspan = null;
    }

    if (actionspan) {
      actionspan.style.visibility = isover?'visible':'hidden';
    }

    obj.style.backgroundColor = isover?'#f7f7f7':'';
  }
}

// Modify user link to be inline view user function
BetterMobileTwitter.prototype.modifyUserLink = function() {
  var bmt = this;
  var res = document.evaluate("//html:div[@id='bmt-tweetsdiv']//html:a[not(@bmt-processed-viewuser)]", document, this.nsResolver, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
  for (var i=0;i<res.snapshotLength;i++) {
    var a = res.snapshotItem(i);
    if (a.href == (document.location.protocol + '//' + document.location.host + '/' + a.innerHTML)) {
      a.addEventListener('click', function(e) {
        e.preventDefault();
        bmt.inlineViewUser(e.target.textContent);
      }, false);
    }
    a.setAttribute('bmt-processed-viewuser', true);
  }
}

BetterMobileTwitter.prototype.constructSubList = function() {
  var bmt = this;

  var friends = GM_getValue('friendlist');
  if (friends) {
    this.friendList = this.parseJSON(friends);
  }
  else {
    this.friendList = new Array();
  }

  var subscribeDiv = document.getElementById('bmt-subscribediv');
  subscribeDiv.style.minHeight = '';

  var html = '';
  html = '<li><span style="font-size:133%;font-weight:bold;">friends' +
         (this.friendList.length>0?' (' + this.friendList.length + ')':'') +
         ':</span> (<a id="bmt-reloadfriend" href="#" style="position:relative;">reload</a>)</li>';
  for (var i=0;i<this.friendList.length;i++) {
    html = html + '<li><a href="#" bmt-viewuser="' + this.friendList[i].screen_name + '">' + this.friendList[i].screen_name + '</a> (' + this.friendList[i].name + ')</li>';
  }
  subscribeDiv.innerHTML = '<div class="s" style="font-size:133%;"><b>subscriptions</b></div>'+
                           '<ul>' + html + '</ul>';

  var sublinks = subscribeDiv.getElementsByTagName('a');
  if (sublinks.length) {
    sublinks[0].addEventListener('click', function(e) {
      e.preventDefault();
      bmt.loadFriends(1, [], subscribeDiv.getElementsByTagName('ul')[0], bmt.constructSubList);
    }, false);
  }
  for (var i=1;i<sublinks.length;i++) {
    sublinks[i].addEventListener('click', function(e) {
      e.preventDefault();
      var viewuser = e.target.getAttribute('bmt-viewuser');
      bmt.inlineViewUser(viewuser);
    }, false);
  }
}

BetterMobileTwitter.prototype.loadFriends = function(page, friends, subscribeDiv, func) {
  var bmt = this;

  page = Math.max(page, 1);
  subscribeDiv.innerHTML = 'loading friends ' + ((page-1)*100+1) + ' to ' + ((1)*100) + '...';

  var client = new XMLHttpRequest();
  client.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        var pagefriend = bmt.parseJSON(this.responseText);
        for (var i=0;i<pagefriend.length;i++) {
          friends.push({
            id:pagefriend[i].id,
            name:pagefriend[i].name,
            screen_name:pagefriend[i].screen_name,
            profile_image_url:pagefriend[i].profile_image_url
          });
        }
        if (page < 5 && pagefriend.length >= 100) {
          bmt.loadFriends(page + 1, friends, subscribeDiv, func);
        }
        else {
          friends = friends.sort(function(a, b) {
            return a.screen_name.toLowerCase() > b.screen_name.toLowerCase()?1:-1;
          });
          if (GM_setValue) {
            GM_setValue('friendlist', bmt.stringifyJSON(friends));
          }
          if (func) {
            func.call(bmt);
          }
        }
      }
      else {
        //document.getElementById('bmt-scrolldetector').innerHTML = 'Error ' + this.status;
      }
    }
  }
  client.open('GET', document.location.protocol + '//' + document.location.host + '/statuses/friends.json?screen_name=' + this.myname + (page>1?'&page='+page:''));
  client.send(null);
}

BetterMobileTwitter.prototype.functionPrinciple = function() {
  // check if it is a mobile version
  if (document.getElementById('dim-screen')) return;

  var status = document.getElementById('status');

  // make sure the status input box is here
  if (!status) return;

  var bmt = this;

  this.page = document.location.href.match(/page=(\d+)/);
  this.page = this.page?paresInt(this.page[1], 10):1;

  // get user name
  var username = document.evaluate("//html:a[@accesskey='2']/@href", document, this.nsResolver, XPathResult.STRING_TYPE, null).stringValue;
  if (username) {
    var res = username.match(/twitter\.com\/(.*)$/);
    if (res) {
      this.myname = res[1];
    }
  }

  // add replies layer
  var tweetsDiv = document.createElement('div');
  var leftBarDiv = document.createElement('div');
  var rightBarDiv = document.createElement('div');
  var tweetsUl = document.getElementsByTagName('ul')[0];

  tweetsDiv.setAttribute('style', 'margin-left:200px;');
  tweetsDiv.setAttribute('id', 'bmt-tweetsdiv');

  rightBarDiv.setAttribute('style', 'float:right; width:19%; margin-left:1%; margin-right:3px; ');

  var directDiv = document.createElement('div');
  directDiv.setAttribute('style', 'min-height: 100px; padding:5px; font-size: 75%; ' +
                                  'background:#f9ffe8; border:1px solid #87bc44; ' +
                                  '-moz-border-radius:5px; -webkit-border-radius: 5px;');
  directDiv.setAttribute('id', 'bmt-directdiv');
  rightBarDiv.appendChild(directDiv);

  if (this.supportXSS) {
    var mentionDiv = document.createElement('div');
    mentionDiv.setAttribute('style', 'min-height: 100px; padding:5px; margin-top:8px; font-size: 75%; ' +
                                     'background:#f9ffe8; border:1px solid #87bc44; ' +
                                     '-moz-border-radius:5px; -webkit-border-radius: 5px;');
    mentionDiv.setAttribute('id', 'bmt-mentiondiv');
    rightBarDiv.appendChild(mentionDiv);
  }

  var replyDiv = document.createElement('div');
  replyDiv.setAttribute('style', 'min-height: 100px; padding:5px; margin-top:8px; font-size: 75%; ' +
                                 'background:#f9ffe8; border:1px solid #87bc44; ' +
                                 '-moz-border-radius:5px; -webkit-border-radius: 5px;');
  replyDiv.setAttribute('id', 'bmt-replydiv');
  rightBarDiv.appendChild(replyDiv);

  leftBarDiv.setAttribute('style', 'float:left; width:190px; margin-left:3px; margin-right:10px;');
  var subscribeDiv = document.createElement('div');
  subscribeDiv.setAttribute('style', 'min-height: 300px; padding:5px; font-size: 75%; ' +
                                     'background:#e5e5ff; border:1px solid #87bc44; ' +
                                     '-moz-border-radius:5px; -webkit-border-radius: 5px;');
  subscribeDiv.setAttribute('id', 'bmt-subscribediv');
  leftBarDiv.appendChild(subscribeDiv);

  tweetsUl.parentNode.insertBefore(leftBarDiv, tweetsUl);
  tweetsUl.parentNode.insertBefore(rightBarDiv, tweetsUl);
  tweetsUl.parentNode.insertBefore(tweetsDiv, tweetsUl);
  tweetsDiv.appendChild(tweetsUl);

  this.loadDirectMessage(this.DIRECT_MESSAGE_MAX_DISPLAY);
  if (this.supportXSS) {
    this.loadMentions(this.MENTIONS_MAX_DISPLAY);
  }
  this.loadReplies();
  if (GM_getValue) {
    this.constructSubList();
  }

  // modify status window
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

    // dropdown for user filter
    var filter = document.createElement('select');
    filter.setAttribute('id', 'bmt-userfilter');
    filter.setAttribute('style', 'margin-left: 30px;');
    filter.addEventListener('change', function(e) { bmt.onUserFilterChanged(e.target)}, false);

    var option = document.createElement('option');
    option.text = ' --- Filter --- ';
    option.value = ' ';
    filter.options.add(option, 0);

    // generate user filter list
    var lis = document.getElementsByTagName('li');
    for (var i=0;i<lis.length;i++) {
      this.addUserFilter(filter, lis[i].innerHTML);
    }

    status.parentNode.appendChild(filter);
  }

  // setup mouseover and mouseout event
  var tweetslilist = document.evaluate("//html:div[@id='bmt-tweetsdiv']//html:li", document, this.nsResolver, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
  for (var i=0;i<tweetslilist.snapshotLength;i++) {
    tweetslilist.snapshotItem(i).addEventListener('mouseover', function(e) { bmt.onMouseOverOutTweets(e.target, true); }, false);
    tweetslilist.snapshotItem(i).addEventListener('mouseout', function(e) { bmt.onMouseOverOutTweets(e.target, false); }, false);
  }

  // get last message
  if (tweetslilist.snapshotLength > 0) {
    this.lastMessage = tweetslilist.snapshotItem(0).innerHTML;
    this.lastMessage = this.lastMessage.replace(/<small[^<]*<\/small>/, '');
  }

  // change the older link for scroll detector
  var res = document.getElementsByTagName('a');
  for (var i=res.length-1; i>=0; i--) {
    if (res[i].getAttribute('accesskey') == 6) {
      var scrollDetector = res[i].parentNode;
      scrollDetector.setAttribute('id', 'bmt-scrolldetector');
      scrollDetector.innerHTML = '';
    }
  }

  // command panel
  var commandPanel = document.createElement('div');
  commandPanel.setAttribute('style', 'position: absolute; right: 0px; top: 0px;');
  document.getElementsByTagName('div')[0].appendChild(commandPanel);

  // n new tweets label
  var checkUpdateDiv = document.createElement('div');
  checkUpdateDiv.setAttribute('id', 'bmt-checkupdate');
  checkUpdateDiv.setAttribute('style', 'float:left; margin:3px 5px 0px 0px;');
  var checkUpdateContainer = document.createElement('span');
  checkUpdateContainer.appendChild(checkUpdateDiv);
  commandPanel.appendChild(checkUpdateContainer);

  // clear twitpic session
  if (window.sessionStorage) {
    var clearTwitpic = document.createElement('input');
    clearTwitpic.type = 'button';
    clearTwitpic.value = 'Clear TwitPic cache';
    clearTwitpic.className = 'b';
    clearTwitpic.setAttribute('style', 'vertical-align:top; margin:3px 5px 0px 0px; font-size:10pt;');
    clearTwitpic.title = 'TwitPic image URL may change after a while, clear cache to reload the image thumbnail';
    clearTwitpic.addEventListener('click', function(e) {
      var found = false;
      for (var i=0;i<window.sessionStorage.length;i++) {
        var domkey = window.sessionStorage.key(i);
        var domvalue = window.sessionStorage.getItem(domkey);
        if (domvalue.value.match(/^twitpic\|/)) {
          sessionStorage.removeItem(domkey);
          found = true;
        }
      }
      if (found) {
        document.location.reload();
      }
    }, false);
    commandPanel.appendChild(clearTwitpic);
  }

  // switch to standard button
  var changeuiform = document.evaluate("//html:form[@action='/sessions/change_ui']", document, this.nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  if (changeuiform) {
    var changeUiButton = document.createElement('input');
    changeUiButton.type = 'button';
    changeUiButton.value = 'Standard';
    changeUiButton.className = 'b';
    changeUiButton.setAttribute('style', 'vertical-align:top; margin:3px 5px 0px 0px; font-size:10pt;');
    changeUiButton.title = 'View Twitter in Standard version';
    changeUiButton.addEventListener('click', function(e) {
      changeuiform.submit();
    }, false);
    commandPanel.appendChild(changeUiButton);
  }

  // on off button
  var onoff = document.createElement('img');
  onoff.src = bmt.onsrc;
  onoff.setAttribute('style', 'cursor:pointer;');
  onoff.addEventListener('click', function(e) {
    bmt.enabled = !bmt.enabled;
    e.target.src = bmt.enabled?bmt.onsrc:bmt.offsrc;
  }, false);
  commandPanel.appendChild(onoff);

  // an element to convert text to HTML, for comparing last message
  var htmlholder = document.createElement('span');
  htmlholder.setAttribute('id', 'bmt-htmlholder');
  htmlholder.style.display = 'none';
  document.body.appendChild(htmlholder);

  // modify user link to enable inline viewing
  this.modifyUserLink();

  // expand URL
  this.expandUrl(this.EXPANDURL_INIT_COUNT);

  // cleanup old preference
  if (GM_deleteValue) {
      GM_deleteValue('directmessageoptionshtml');
  }

  window.setInterval(function() {bmt.detectScroll();}, this.DETECT_SCROLL_INTERVAL);
  window.setTimeout(function() {bmt.checkUpdate();}, this.CHECK_UPDATE_INTERVAL);
}
new BetterMobileTwitter().init();