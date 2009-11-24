// ==UserScript==
// @name            Google Reader Unread Count
// @version         9
// @namespace       http://ellab.org/
// @author          angusdev
// @description     Display actual unread count instead of "1000+" in Google Reader
// @include         http://www.google.tld/reader/*
// @include         https://www.google.tld/reader/*
// ==/UserScript==

/*
Author: Angus http://angusdev.mysinablog.com/
              http://angusdev.blogspot.com/
Date:   2009-10-24

Version history:
8    24-Oct-2009    Issue #1 The node no longer has feed url, so use the node title as duplication check
7    02-Oct-2009    Supports Chrome extensions
6    14-May-2009    @include uses top-level-domain (tld) conversion
5    20-Mar-2009    Change the window title to (xxx) Google Reader
                    Listen to DOMTitleChanged event (gecko specified) so can response faster window title changed by Google
4    12-Nov-2008    Supports Chrome
                    Fix the bug that didn't show the '+' sign in total if a feed has 1000+ unread items
3    06-Nov-2008    Fix the problem due to Google changed DOM
                    Fix the problem that didn't count the untagged item
2    13-Jun-2008    Remove the button, change to refresh every 3 seconds, and will update the window title as well
1    27-Sep-2007    First release to userscripts.org
*/

(function(){

var totaltext = '';
var unreadCountElement = null;

function init() {
  var enabled = true;

  if (navigator.userAgent.match(/Chrome/)) {
    enabled = document.location.href.match(/https?:\/\/www\.google\.com(\.[a-z]+)?\/reader\/view/)?true:false;
  }

  if (enabled && document.body) waitForReady();
}

// Wait for the dom ready
function waitForReady() {
  if (unreadCountElement = document.getElementById('reading-list-unread-count')) {
    unreadCountElement.addEventListener('DOMSubtreeModified', modifySubtree, false);
    window.addEventListener("DOMTitleChanged", titleChanged, false);
    window.setTimeout(modifySubtree, 5000);
    window.setInterval(titleChanged, 3000);
  }
  else {
    window.setTimeout(waitForReady, 500);
  }
}

function modifySubtree() {
  if (unreadCountElement.textContent.match(/1000\+/)) {
    calcUnread();
  }
}

function titleChanged() {
  calcUnread();
  if (totaltext) {
    var newTitle = '(' + totaltext + ') ' + document.title.replace(/\s*\(\d+\+?\)$/, '').replace(/^\(\d+\+?\)\s*/, '');;
    if (document.title != newTitle) {
      document.title = newTitle;
    }
  }
}

function findItemUnread(checkDuplicated, item) {
  var hasplus = false;
  var count = 0;
  var alreadyCounted = false;
  var countres = item.innerHTML.match(/\((\d*)\+?\)/);
  if (countres) {
    count = parseInt(countres[1], 10);
    if (item.innerHTML.match(/\(1000\+\)/)) {
      hasplus = true;
    }
    var nodeTitle = item.parentNode.getAttribute('title');
    if (nodeTitle) {
      if (checkDuplicated.indexOf(nodeTitle) < 0) {
        checkDuplicated.push(nodeTitle);
      }
      else {
        alreadyCounted = true;
      }
    }
  }

  return {count:count,hasplus:hasplus,alreadyCounted:alreadyCounted};
}

function calcUnread() {
  var checkDuplicated = [];
  var total = 0;
  var totalplus = false;
  var res = document.evaluate("//li[contains(@class, 'folder')]//li[contains(@class, 'folder')]", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
  for (var i=0;i<res.snapshotLength;i++) {
    var res2 = document.evaluate(".//li[contains(@class, 'unread')]/a/span/span[contains(@class, 'unread-count')]", res.snapshotItem(i), null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    var subtotal = 0;
    var subtotalplus = false;
    for (var j=0;j<res2.snapshotLength;j++) {
      var result = findItemUnread(checkDuplicated, res2.snapshotItem(j));
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
    var result = findItemUnread(checkDuplicated, res2.snapshotItem(j));
    if (result.hasplus) {
      totalplus = true;
    }
    if (!result.alreadyCounted) {
      total += result.count;
    }
  }

  if (total > 0) {
    totaltext = total + (totalplus?'+':'');
    unreadCountElement.innerHTML = ' (' + totaltext + ')';
  }
}

init();

})();