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
}
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
}
org.ellab.utils._testRemoveClass();

})();
