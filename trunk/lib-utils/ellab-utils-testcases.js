(function(){

// test cases for ellab-utils.js
// use by include the ellab-utils-testcases.js in manifest.json after ellab-utils.js
// REMOVE it after testing

org.ellab.utils._testHasClass = function() {
  function testHelper(old, expected) {
    var clazz = 'foo';
    var div = document.createElement('div');
    div.className = old;
    var actual = org.ellab.utils.hasClass(div, clazz);
    if (actual != expected) {
      console.log('_testHasClass fail "' + old + '" has "' + clazz + '"="' + actual + '" should be "' + expected + '"');
    }
    div = null;
  }

  testHelper('', false);
  testHelper('foo', true);
  testHelper(' foo ', true);
  testHelper(' foo', true);
  testHelper('foo ', true);
  testHelper('foo bar', true);
  testHelper(' foo bar ', true);
  testHelper('foobar', false);
  testHelper('barfoo', false);
  testHelper('foo-bar', false);
  console.log('_testHasClass finished');
};
org.ellab.utils._testHasClass();

org.ellab.utils._testRemoveClass = function() {
  function testHelper(old, clazz, expected) {
    var div = document.createElement('div');
    div.className = old;
    org.ellab.utils.removeClass(div, clazz);
    if (div.className != expected) {
      console.log('_testRemoveClass fail "' + old + '" remove "' + clazz + '"="' + div.className + '" should be "' + expected + '"');
    }
    div = null;
  }

  testHelper('', '', '');
  testHelper(' bar ', 'foo', ' bar ');
  testHelper('foo', 'foo', '');
  testHelper(' foo ', 'foo', '');
  testHelper(' foo', 'foo', '');
  testHelper('foo ', 'foo', '');
  testHelper('foo bar', 'foo', 'bar');
  testHelper(' foo bar ', 'foo', 'bar');
  testHelper('foo bar ', 'foo', 'bar');
  testHelper(' foo bar', 'foo', 'bar');
  testHelper('foo bar', 'bar', 'foo');
  testHelper(' foo bar ', 'bar', 'foo');
  testHelper('foo bar ', 'bar', 'foo');
  testHelper(' foo bar', 'bar', 'foo');
  testHelper('barfoo', 'foo', 'barfoo');
  testHelper('foo-bar', 'foo', 'foo-bar');
  console.log('_testRemoveClass finished');
};
org.ellab.utils._testRemoveClass();

org.ellab.utils._testParent = function() {
  var div = document.createElement('div');

  /*jshint multistr:true */
  div.innerHTML = '<div class="foo bar" id="div1"> \
                     text1 \
                     <span class="foo bar" id="span1">text2</span> \
                     <span class="foo" id="span2"> \
                       <span class="foo" id="span3"> \
                         text4 \
                         <div id="div2"> \
                           <div id="test"></div> \
                         </div> \
                       </span> \
                     </span> \
                   </div>';
  /*jshint multistr:false */
  document.body.appendChild(div);

  function testHelper(tag, className, expected) {
    var ele = document.getElementById('test');
    var res = org.ellab.utils.parent(ele, tag, className);
    var fail = false;
    var actual = res?res.getAttribute('id'):null;

    fail = expected?(expected !== actual):(actual !== null);

    if (fail) {
      console.log('_testParent fail tag=' + tag + ', className=' + className + ', expected=' + expected + ', actual=' + actual);
    }
  }

  testHelper(null, null, 'div2');
  testHelper('div', 'foo', 'div1');
  testHelper('DIV', 'foo', 'div1');
  testHelper('div', null, 'div2');
  testHelper('span', 'foo', 'span3');
  testHelper(null, 'foo', 'span3');
  testHelper(null, 'bar', 'div1');
  testHelper(null, 'tao', null);
  testHelper('h1', null, null);

  document.body.removeChild(div);
  div = null;
  console.log('_testParent finished');
};
org.ellab.utils._testParent();

})();
