// ==UserScript==
// @name            Google Reader Unread Count
// @version         12
// @namespace       http://ellab.org/
// @author          angusdev
// @description     Display actual unread count instead of "1000+" in Google Reader
// @include         http://www.google.tld/reader/*
// @include         https://www.google.tld/reader/*
// ==/UserScript==

/*
Author: Angus http://angusdev.mysinablog.com/
              http://angusdev.blogspot.com/
Date:   2011-12-18

Version history:
12   18-Dec-2011    Issue #34 Refine the matches URL
                    Issue #35 Double count if a feed is in more than 1 tag
11   06-Nov-2011    Issue #32 Fix the problem on Google new version
10   09-Jun-2010    Issue #14 Suppport Safari Extensions
9    25-Nov-2009    Refactoring and optimization
                    Now will listen to each feed's unread count change and recalculate
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

var isChrome = false;
var isSafari = false;

var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

// features switch
var hasDOMSubtreeModified = false;

var unreadCountElement = null;
var starredItemCountElement = null;

var starredItemObserver = new MutationObserver(function(mutations, observer) { countStarredItem(); });

function init() {
  if (navigator.userAgent.match(/Chrome/)) {
    isChrome = true;
  }
  else if (navigator.userAgent.match(/Safari/)) {
    isSafari = true;
  }

  hasDOMSubtreeModified = !isChrome && !isSafari;

  if (document.body) waitForReady();
}

// Wait for the dom ready
function waitForReady() {
  unreadCountElement = document.getElementById('reading-list-unread-count');
  if (unreadCountElement) {
    if (hasDOMSubtreeModified) {
      var res = document.evaluate("//span[contains(@class, 'unread-count') and contains(@class, 'sub-unread-count') and not(contains(@class, 'folder-unread-count'))]", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
      for (var i=0;i<res.snapshotLength;i++) {
        res.snapshotItem(i).parentNode.addEventListener('DOMSubtreeModified', modifySubtree, false);
      }
      window.addEventListener("DOMTitleChanged", calcUnread, false);
    }
    else {
      window.setInterval(calcUnread, 3000);
    }
    calcUnread();

    var starElement = document.evaluate("//div[@id='star-selector']//span[@class='text']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (starElement) {
      starredItemCountElement = document.createElement("span");
      starredItemCountElement.className = "unread-count";
      starElement.appendChild(starredItemCountElement);

      var starredHelp = document.createElement("a");
      starredHelp.setAttribute("id", "ellab-starred-help");
      starredHelp.className = "unread-count";
      starredHelp.innerHTML = "[?]";
      starredHelp.href = "#";
      starredHelp.addEventListener("click", function(e) { e.preventDefault(); e.stopPropagation(); return false; }, false);
      starredHelp.addEventListener("mouseover", function(e) { e.target.style.textDecoration = "underline"; }, false);
      starredHelp.addEventListener("mouseout", function(e) { e.target.style.textDecoration = "none"; }, false);
      starredHelp.setAttribute("style", "display:none; ");
      starredHelp.setAttribute("title", "Only count the displayed starred items");
      starElement.appendChild(starredHelp);

      window.addEventListener("hashchange", onHashChange, false);
      onHashChange();
    }
  }
  else {
    window.setTimeout(waitForReady, 500);
  }
}

function modifySubtree() {
  if (unreadCountElement.textContent.match(/\d{4}\+?/)) {
    calcUnread();
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
    var nodeHref = item.parentNode.getAttribute('href');
    if (nodeHref) {
      if (checkDuplicated.indexOf(nodeHref) < 0) {
        checkDuplicated.push(nodeHref);
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
    var res2 = document.evaluate(".//li[contains(@class, 'unread')]/a/div[contains(@class, 'unread-count')]", res.snapshotItem(i), null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
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
      var resfolder = document.evaluate(".//a/div[contains(@class, 'unread-count')]", res.snapshotItem(i), null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (resfolder) {
        resfolder.innerHTML = '&nbsp;(' + subtotal + (subtotalplus?'+':'') + ')';
      }
    }
  }

  // untagged items
  var resUntagged = document.evaluate("//ul[@id='sub-tree']/li/ul/li[not(contains(@class, 'folder')) and contains(@class, 'unread')]/a/div[contains(@class, 'unread-count')]", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
  for (var k=0;k<resUntagged.snapshotLength;k++) {
    var resultUntagged = findItemUnread(checkDuplicated, resUntagged.snapshotItem(k));
    if (resultUntagged.hasplus) {
      totalplus = true;
    }
    if (!resultUntagged.alreadyCounted) {
      total += resultUntagged.count;
    }
  }

  if (total > 0) {
    var totaltext = total + (totalplus?'+':'');
    unreadCountElement.innerHTML = ' (' + totaltext + ')';

    // update windows title as well
    if (totaltext) {
      var newTitle = '(' + totaltext + ') ' + document.title.replace(/\s*\(\d+\+?\)$/, '').replace(/^\(\d+\+?\)\s*/, '');
      if (document.title != newTitle) {
        document.title = newTitle;
      }
    }
  }
}

function countStarredItem() {
  var res = document.evaluate("//div[@id='entries']/div[contains(@class, 'entry')]//div[contains(@class, 'item-star-active')]", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
  if (res.snapshotLength > 0) {
    starredItemCountElement.innerHTML = ' (' + res.snapshotLength + ')';
    document.getElementById("ellab-starred-help").style.display = "inline";
  }
}

function onHashChange() {
  if (starredItemCountElement) {
    if (document.location.hash.indexOf("%2Fstate%2Fcom.google%2Fstarred") > 0 || document.location.hash.indexOf("/state/com.google/starred") > 0) {
      starredItemObserver.observe(document.getElementById("entries"), { childList: true, subtree: true, attributes: true });
    }
    else {
      starredItemObserver.disconnect();
    }
  }
}

init();

})();
