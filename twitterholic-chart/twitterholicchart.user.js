// ==UserScript==
// @name           Twitaholic Chart
// @version        2
// @namespace      http://ellab.org/
// @description    Show a more detail chart in twitaholic.com user stat page
// @include        http://Twitaholic.com/*
// ==/UserScript==

/*
Author: Angus http://angusdev.mysinablog.com/
              http://angusdev.blogspot.com/
Date:   2009-11-24

Version history:
1    24-Nov-2009    Initial release
*/

(function(){
'use strict';

var MONTH_NAME = [];
MONTH_NAME['January'] = 0;
MONTH_NAME['February'] = 1;
MONTH_NAME['March'] = 2;
MONTH_NAME['April'] = 3;
MONTH_NAME['May'] = 4;
MONTH_NAME['June'] = 5;
MONTH_NAME['July'] = 6;
MONTH_NAME['August'] = 7;
MONTH_NAME['September'] = 8;
MONTH_NAME['October'] = 9;
MONTH_NAME['November'] = 10;
MONTH_NAME['December'] = 11;

var MONTH_SHORT_NAME = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var CHART_HEIGHT = 125;
var CHART_WIDTH = 950;
var X_AXIS_LABEL_COUNT = 11;
var Y_AXIS_LABEL_COUNT = 6;

// normalize the y axis scale so the label will distribute evenly
// return true if the following and follower axis share same scale
function normalize_yaxis(data) {
  function log_base10(n) {
    return Math.log(n) / Math.log(10);
  }

  var share_axis = false;

  // following and follower axis share same scale if their number if close enough
  if (Math.max(data[0].max, data[1].max) / Math.min(data[0].max, data[1].max) <= 1.75) {
    data[0].max = data[1].max = Math.max(data[0].max, data[1].max);
    data[0].min = data[1].min = Math.min(data[0].min, data[1].min);

    share_axis = true;
  }

  for (var i=0;i<data.length;i++) {
    var factor = Math.max(10, Math.pow(10, parseInt(log_base10(data[i].max), 10) - 1));
    factor = factor * (Y_AXIS_LABEL_COUNT - 1);
    data[i].max = Math.ceil(data[i].max / factor) * factor;
    data[i].min = Math.floor(data[i].min / factor) * factor;
  }

  return share_axis;
}

// format the google chart data (extented format)
function encode_gchart_data_extended(n, m) {
  var data = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.";
  var v = Math.round(n / m * 4095);
  var v1 = parseInt(v / 64, 10);
  var v2 = v % 64;
  var r = '' + data[v1] + data[v2];
  return r;
}

// normalize the yaxis to K, M, B
function kmb_yaxis(n, min) {
  function kmb_yaxis_m(n) {
    n = (Math.round(n / 100000) / 10);
    if (min < 10000000 && n == parseInt(n, 10)) {
      n = n + '.0';
    }
    return n + 'M';
  }
  function kmb_yaxis_k(n) {
    return (Math.round(n / 100) / 10) + 'K';
  }

  if (min >= 1000000) {
    return kmb_yaxis_m(n);
  }
  else if (min >= 5000) {
    return kmb_yaxis_k(n);
  }
  else {
    return n;
  }
}

var charturl = 'http://chart.apis.google.com/chart?cht=lxy' +
               '&chdl=Followers|Following|Tweets' +
               '&chco=4671d5,6c8cd5,ffaa00&chs=' + CHART_WIDTH + 'x' + CHART_HEIGHT + '&chma=30,30,10,10|90,20&chd=e:';
var dateurl = '';

var table = document.getElementById('stat_history');
if (table) {
  var i, j;
  var data = [];
  var first_day = 0;
  // 0-follower, 1-following, 2-tweet
  var DATA_COUNT = 3;
  var control_data = [{url:'', url_chxl:'', min:999999999, max:0},
                      {url:'', url_chxl:'', min:999999999, max:0},
                      {url:'', url_chxl:'', min:999999999, max:0}];

  var tr = table.getElementsByTagName('tr');
  for (i=0;i<tr.length;i++) {
    // parse date
    var date_res = tr[i].cells[0].textContent.match(/([a-zA-Z]+)\s(\d+),\s(\d+)/);
    if (date_res && MONTH_NAME[date_res[1]]) {
      var date = new Date();
      date.setFullYear(parseInt(date_res[3], 10));
      date.setMonth(MONTH_NAME[date_res[1]], parseInt(date_res[2], 10));
      first_day = date.getTime() / 86400000;

      var data_item = [];
      for (j=0;j<DATA_COUNT;j++) {
        data_item[j] = parseInt(tr[i].cells[j+1].textContent.replace(/,/g, ''), 10);
        control_data[j].min = Math.min(control_data[j].min, data_item[j]);
        control_data[j].max = Math.max(control_data[j].max, data_item[j]);
      }
      data.push({date:date, day:first_day, data_item:data_item});
    }
  }

  // construct url
  var share_axis = normalize_yaxis(control_data, true);

  for (i=data.length-1;i>=0;i--) {
    dateurl += encode_gchart_data_extended(data[i].day - first_day, data[0].day - first_day);
    for (j=0;j<DATA_COUNT;j++) {
      control_data[j].url += encode_gchart_data_extended(data[i].data_item[j] - control_data[j].min, control_data[j].max - control_data[j].min);
    }
  }

  if (dateurl) {
    charturl += dateurl + ',' + control_data[0].url + ',' +
                dateurl + ',' + control_data[1].url + ',' +
                dateurl + ',' + control_data[2].url;

    var chxl_month = '';
    var chxl_year = '';
    var last_displayed_year = 0;
    for (i=0;i<X_AXIS_LABEL_COUNT;i++) {
      // calculate the date of each label point
      var x_time = (data[data.length-1].date.getTime() + i * Math.round((data[0].date.getTime() - data[data.length-1].date.getTime()) / (X_AXIS_LABEL_COUNT - 1)));
      var x_date = new Date();
      x_date.setTime(x_time);
      chxl_month += '|' + x_date.getDate() + ' ' + MONTH_SHORT_NAME[x_date.getMonth()];
      // add extra year label if it is first and last point, and change of year in middle
      chxl_year += '|';
      if (x_date.getFullYear() != last_displayed_year || i == X_AXIS_LABEL_COUNT - 1) {
        last_displayed_year = x_date.getFullYear();
        chxl_year += last_displayed_year;
      }
    }
    for (i=0 ; i<Y_AXIS_LABEL_COUNT ; i++) {
      for (j=0 ; j<DATA_COUNT ; j++) {
        var y = (control_data[j].min + i * Math.round((control_data[j].max - control_data[j].min) / (Y_AXIS_LABEL_COUNT - 1)));
        y = kmb_yaxis(y, control_data[j].min);
        control_data[j].url_chxl += '|' + y;
      }
    }

    if (share_axis) {
      charturl += '&chxt=x,x,r,r&chxl=0:' + chxl_month + '|1:' + chxl_year +
                  '|2:' + control_data[0].url_chxl +
                  '|3:' + control_data[2].url_chxl;
    }
    else {
      charturl += '&chxt=x,x,r,r,r&chxl=0:' + chxl_month + '|1:' + chxl_year +
                  '|2:' + control_data[0].url_chxl +
                  '|3:' + control_data[1].url_chxl +
                  '|4:' + control_data[2].url_chxl;
    }

    // add marker
    charturl += '&chm=o,999999,0,-1,4|o,999999,1,-1,4|o,999999,2,-1,4';

    // finally, add the chart to the dom
    var img = document.createElement('img');
    img.src = charturl;
    img.style.marginBottom = '10px';
    table.parentNode.insertBefore(img, table);
  }
}

})();
