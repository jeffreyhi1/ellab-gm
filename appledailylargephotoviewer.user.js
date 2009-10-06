// ==UserScript==
// @name           Appledaily Large Photo Viewer
// @namespace      http://ellab.org/
// @version        1
// @author         angusdev
// @description    蘋果日報及壹傳媒改版後用 Flash 來顯示放大圖片，不利大家儲存和轉載。這個 script 會在版面增加一個圖示指向真正的大圖片。
// @include        http://*.nextmedia.com/template/*
// ==/UserScript==

(function() {

var ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAMAAAAolt3jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAwBQTFRFAAAAdZMTYrAfZLEfcbwccbkucbg1j4kvg5IuhJMthpQtiJ0zlI8vhKIWlJFilJJjk5x3q7JwlctoipyLkJ6IlZWVn6mMnq2an9G1pdCWvtrSttzmu9vo0deh2NjY//jJ////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADpL2qgAAAQB0Uk5T////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AFP3ByUAAAAYdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My4zNqnn4iUAAABgSURBVBhXXc/XDoAgDAVQ3LgH1m3l/38SgSYI3vTlQGkDU+hFMcTHBZEZAQAdWYKUkmyoZeqjbvYZ3P7e2smdEPPQ0yKdZTuve3Ws8+nYR8coSbO41aTuoqw4b5CFX3gBZCMYX6+YEv0AAAAASUVORK5CYII=';

var res = document.evaluate("//span[@class='photoEnlarge']/a", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
for (var i=0;i<res.snapshotLength;i++) {
  var ele = res.snapshotItem(i);
  if (ele.href.match(/#TB_inline/)) {
    var span = ele.parentNode;
    var newspan = document.createElement('span');
    newspan.className = 'photoEnlarge';
    newspan.innerHTML = span.innerHTML.replace(/id="[^"]*"/, '');
    newspan.innerHTML = newspan.innerHTML.replace(/href="#TB_inline[^\/]*/, 'style="margin:5px 5px 0px 0px; background-image:url(' + ICON  + ');" target="_blank" href="');
    span.parentNode.insertBefore(newspan, span);
  }
}

})();