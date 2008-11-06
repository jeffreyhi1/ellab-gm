// ==UserScript==
// @name        Google Reader Unread Count
// @namespace   http://ellab.org/
// @version     2.0
// @description Display actual unread count instead of "1000+" in Google Reader
// @include     http*://www.google.com/reader/*
// ==/UserScript==

/*
Author: Angus http://angusdev.mysinablog.com/
Date:   2007-09-27

Version history:
2.0    13-Jun-2008   Remove the button, change to refresh every 3 seconds, and will update the window title as well
1.0    27-Sep-2007   First release to userscripts.org
*/

var g_totaltext;

function $(id){ return document.getElementById(id); }

function calcUnread() {
  var countedUrl = new Array();

  var res = document.evaluate("//li[contains(@class, 'folder')]//li[contains(@class, 'folder')]", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
  var total = 0;
  var totalplus = false;
  for (var i=0;i<res.snapshotLength;i++) {
    var res2 = document.evaluate(".//li[contains(@class, 'unread')]/a/span/span[contains(@class, 'unread-count')]", res.snapshotItem(i), null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    var subtotal = 0;
    var subtotalplus = false;
    for (var j=0;j<res2.snapshotLength;j++) {
      var countres = res2.snapshotItem(j).innerHTML.match(/\((\d*)\+?\)/);
      if (countres) {
        var count = parseInt(countres[1], 10);
        subtotal += count;
        if (res2.snapshotItem(j).innerHTML.match(/\(100\+\)/)) {
          subtotalplus = true;
          totalplus = true;
        }
        if (countedUrl.indexOf(res2.snapshotItem(j).parentNode.parentNode.href) < 0) {
          total += count;
          countedUrl[countedUrl.length] = res2.snapshotItem(j).parentNode.parentNode.href;
        }
      }
    }
    if (subtotal > 0) {
      var resfolder = document.evaluate(".//a/span/span[contains(@class, 'unread-count')]", res.snapshotItem(i), null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (resfolder) {
        resfolder.innerHTML = '&nbsp;(' + subtotal + (subtotalplus?'+':'') + ')';
      }
    }
  }
  if (total > 0) {
    g_totaltext = total + (totalplus?'+':'');
    $('reading-list-unread-count').innerHTML = ' (' + g_totaltext + ')';
  }
}

function modifySubtree() {
  if ($('reading-list-unread-count').textContent.match(/1000\+/)) {
    calcUnread();
  }
}

if ($('reading-list-selector')) {
  /*
  var a = document.createElement('A');
  a.innerHTML = "<img src='/reader/ui/favicon.ico' border='0' style='vertical-align:bottom;' />";
  a.href = 'javascript:void(0)';
  a.addEventListener("click", calcUnread, false);

  $('reading-list-selector').appendChild(document.createTextNode(' '));
  $('reading-list-selector').appendChild(a);
  */

  $('reading-list-unread-count').addEventListener('DOMSubtreeModified', modifySubtree, false);
  window.setTimeout(modifySubtree, 5000);

  window.setInterval(function() {
    calcUnread();
    if (g_totaltext) {
      document.title = document.title.replace(/1000\+/, g_totaltext).replace('Google Reader', 'GReader');
    }
  }, 3000);
}