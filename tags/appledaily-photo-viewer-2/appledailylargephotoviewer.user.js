// ==UserScript==
// @name           Appledaily Large Photo Viewer
// @namespace      http://ellab.org/
// @version        2
// @author         angusdev
// @description    ī�G����γ��ǴC�睊��� Flash ����ܩ�j�Ϥ��A���Q�j�a�x�s�M����C�o�� script �|�b�����W�[�@�ӹϥܫ��V�u�����j�Ϥ��C
// @include        http://*.nextmedia.com/template/*
// ==/UserScript==

/*
Version  2  06-Oct-2009    Fix as atnext changed html
Version  1  30-Apr-2009    First release
*/

(function() {

var ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAMAAAAolt3jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAwBQTFRFAAAAdZMTYrAfZLEfcbwccbkucbg1j4kvg5IuhJMthpQtiJ0zlI8vhKIWlJFilJJjk5x3q7JwlctoipyLkJ6IlZWVn6mMnq2an9G1pdCWvtrSttzmu9vo0deh2NjY//jJ////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADpL2qgAAAQB0Uk5T////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AFP3ByUAAAAYdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My4zNqnn4iUAAABgSURBVBhXXc/XDoAgDAVQ3LgH1m3l/38SgSYI3vTlQGkDU+hFMcTHBZEZAQAdWYKUkmyoZeqjbvYZ3P7e2smdEPPQ0yKdZTuve3Ws8+nYR8coSbO41aTuoqw4b5CFX3gBZCMYX6+YEv0AAAAASUVORK5CYII=';

function makeButton(imglink) {
  var newspan = document.createElement('span');
  newspan.className = 'photoEnlarge';
  newspan.innerHTML = '<a href="' + imglink + '" target="_blank" style="margin:5px 5px 0px 0px; background-image:url(' + ICON  + ');">��j�Ϥ�</a>';

  return newspan;
}

var articleIntroPhotoBox = document.getElementById('articleIntroPhotoBox');
if (articleIntroPhotoBox) {
  var intro_photo_img = document.getElementById('intro_photo_img');
  if (intro_photo_img) {
    var origButtonSpan = articleIntroPhotoBox.getElementsByTagName('SPAN')[0];
    origButtonSpan.parentNode.insertBefore(makeButton(intro_photo_img.src.replace(/\/small\//, '/large/')), origButtonSpan);
  }
}

var res = document.evaluate("//span[@class='photoEnlarge']/a", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
for (var i=0;i<res.snapshotLength;i++) {
  var modified = false;

  var ele = res.snapshotItem(i);

  if (!modified && ele.href.match(/javascript:photoviewer/) && ele.href.match(/\/large\//)) {
    var imglink = ele.href.match(/javascript:photoviewer\(\'([^\']+)\'/);
    console.log(ele.href);
     console.log(imglink);
    if (imglink) {
      imglink = imglink[1];
      var span = ele.parentNode;
      span.parentNode.insertBefore(makeButton(imglink), span);
      modified = true;
    }
  }
}

})();