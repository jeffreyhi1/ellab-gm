// ==UserScript==
// @name            Google Reader Unread Count
// @version         7
// @namespace       http://ellab.org/
// @author          angusdev
// @description     Display actual unread count instead of "1000+" in Google Reader
// @include         http://www.google.tld/reader/*
// @include         https://www.google.tld/reader/*
// ==/UserScript==

/*
Author: Angus http://angusdev.mysinablog.com/
              http://angusdev.blogspot.com/
Date:   2009-05-14

Version history:
7    02-Oct-2009    Support Chrome extensions
6    14-May-2009    @include uses top-level-domain (tld) conversion
5    20-Mar-2009    Change the window title to (xxx) Google Reader
                    Listen to DOMTitleChanged event (gecko specified) so can response faster window title changed by Google
4    12-Nov-2008    Support Chrome
                    Fix the bug that didn't show the '+' sign in total if a feed has 1000+ unread items
3    06-Nov-2008    Fix the problem due to Google changed DOM
                    Fix the problem that didn't count the untagged item
2    13-Jun-2008    Remove the button, change to refresh every 3 seconds, and will update the window title as well
1    27-Sep-2007    First release to userscripts.org
*/

var GReaderUnreadCount = {
  isChrome:false,
  totaltext:'',

  init:function() {
    var enabled = true;

    if (navigator.userAgent.match(/Chrome/)) {
      enabled = document.location.href.match(/https?:\/\/www\.google\.com(\.[a-z]+)?\/reader\/view/)?true:false;
      GReaderUnreadCount.isChrome = true;
    }

    if (enabled && document.body) GReaderUnreadCount.waitForReady();
  },
  // Wait for the dom ready
  waitForReady:function() {
    if (document.getElementById('reading-list-unread-count')) {
      document.getElementById('reading-list-unread-count').addEventListener('DOMSubtreeModified', GReaderUnreadCount.modifySubtree, false);
      window.addEventListener("DOMTitleChanged", GReaderUnreadCount.titleChanged, false);
      window.setTimeout(GReaderUnreadCount.modifySubtree, 5000);
      window.setInterval(GReaderUnreadCount.titleChanged, 3000);
    }
    else {
      window.setTimeout(GReaderUnreadCount.waitForReady, 500);
    }
  },


  modifySubtree:function() {
    if (document.getElementById('reading-list-unread-count').textContent.match(/1000\+/)) {
      GReaderUnreadCount.calcUnread();
    }
  },

  titleChanged:function() {
    GReaderUnreadCount.calcUnread();
    if (GReaderUnreadCount.totaltext) {
      var newTitle = '(' + GReaderUnreadCount.totaltext + ') ' + document.title.replace(/\s*\(\d+\+?\)$/, '').replace(/^\(\d+\+?\)\s*/, '');;
      if (document.title != newTitle) {
        document.title = newTitle;
      }
    }
  },

  findItemUnread:function(countedUrl, item) {
    var hasplus = false;
    var count = 0;
    var alreadyCounted = false;
    var countres = item.innerHTML.match(/\((\d*)\+?\)/);
    if (countres) {
      count = parseInt(countres[1], 10);
      if (item.innerHTML.match(/\(1000\+\)/)) {
        hasplus = true;
      }
      if (countedUrl.indexOf(item.parentNode.parentNode.href) < 0) {
        countedUrl[countedUrl.length] = item.parentNode.parentNode.href;
      }
      else {
        alreadyCounted = true;
      }
    }

    return {count:count,hasplus:hasplus,alreadyCounted:alreadyCounted};
  },

  calcUnread:function() {
    var countedUrl = new Array();
    var res = document.evaluate("//li[contains(@class, 'folder')]//li[contains(@class, 'folder')]", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    var total = 0;
    var totalplus = false;
    for (var i=0;i<res.snapshotLength;i++) {
      var res2 = document.evaluate(".//li[contains(@class, 'unread')]/a/span/span[contains(@class, 'unread-count')]", res.snapshotItem(i), null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
      var subtotal = 0;
      var subtotalplus = false;
      for (var j=0;j<res2.snapshotLength;j++) {
        var result = GReaderUnreadCount.findItemUnread(countedUrl, res2.snapshotItem(j));
        if (result.hasplus) {
          totalplus = true;
          subtotalplus = true;
        }
        subtotal += result.count;
        if (!result.alreadyCounted) {
          total += result.count;
        }
      }
      if (subtotal > 0) {
        var resfolder = document.evaluate(".//a/span/span[contains(@class, 'unread-count')]", res.snapshotItem(i), null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (resfolder) {
          resfolder.innerHTML = '&nbsp;(' + subtotal + (subtotalplus?'+':'') + ')';
        }
      }
    }

    // untagged items
    var res2 = document.evaluate("//ul[@id='sub-tree']/li/ul/li[not(contains(@class, 'folder')) and contains(@class, 'unread')]/a/span/span[contains(@class, 'unread-count')]", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var j=0;j<res2.snapshotLength;j++) {
      var result = GReaderUnreadCount.findItemUnread(countedUrl, res2.snapshotItem(j));
      if (result.hasplus) {
        totalplus = true;
      }
      if (!result.alreadyCounted) {
        total += result.count;
      }
    }

    //alert(total + (totalplus?'+':''));
    if (total > 0) {
      GReaderUnreadCount.totaltext = total + (totalplus?'+':'');
      document.getElementById('reading-list-unread-count').innerHTML = ' (' + GReaderUnreadCount.totaltext + ')';
    }
  }
}

GReaderUnreadCount.init();