"use strict";

require("core-js/modules/es.array.slice");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fromNow = fromNow;
exports.toLocalISOString = toLocalISOString;

var _strings = require("./strings");

var _nls = require("./nls");

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const minute = 60;
const hour = minute * 60;
const day = hour * 24;
const week = day * 7;
const month = day * 30;
const year = day * 365;

function fromNow(date, appendAgoLabel) {
  if (typeof date !== 'number') {
    date = date.getTime();
  }

  const seconds = Math.round((new Date().getTime() - date) / 1000);

  if (seconds < -30) {
    return (0, _nls.localize)('date.fromNow.in', 'in {0}', fromNow(new Date().getTime() + seconds * 1000, false));
  }

  if (seconds < 30) {
    return (0, _nls.localize)('date.fromNow.now', 'now');
  }

  let value;

  if (seconds < minute) {
    value = seconds;

    if (appendAgoLabel) {
      return value === 1 ? (0, _nls.localize)('date.fromNow.seconds.singular.ago', '{0} sec ago', value) : (0, _nls.localize)('date.fromNow.seconds.plural.ago', '{0} secs ago', value);
    } else {
      return value === 1 ? (0, _nls.localize)('date.fromNow.seconds.singular', '{0} sec', value) : (0, _nls.localize)('date.fromNow.seconds.plural', '{0} secs', value);
    }
  }

  if (seconds < hour) {
    value = Math.floor(seconds / minute);

    if (appendAgoLabel) {
      return value === 1 ? (0, _nls.localize)('date.fromNow.minutes.singular.ago', '{0} min ago', value) : (0, _nls.localize)('date.fromNow.minutes.plural.ago', '{0} mins ago', value);
    } else {
      return value === 1 ? (0, _nls.localize)('date.fromNow.minutes.singular', '{0} min', value) : (0, _nls.localize)('date.fromNow.minutes.plural', '{0} mins', value);
    }
  }

  if (seconds < day) {
    value = Math.floor(seconds / hour);

    if (appendAgoLabel) {
      return value === 1 ? (0, _nls.localize)('date.fromNow.hours.singular.ago', '{0} hr ago', value) : (0, _nls.localize)('date.fromNow.hours.plural.ago', '{0} hrs ago', value);
    } else {
      return value === 1 ? (0, _nls.localize)('date.fromNow.hours.singular', '{0} hr', value) : (0, _nls.localize)('date.fromNow.hours.plural', '{0} hrs', value);
    }
  }

  if (seconds < week) {
    value = Math.floor(seconds / day);

    if (appendAgoLabel) {
      return value === 1 ? (0, _nls.localize)('date.fromNow.days.singular.ago', '{0} day ago', value) : (0, _nls.localize)('date.fromNow.days.plural.ago', '{0} days ago', value);
    } else {
      return value === 1 ? (0, _nls.localize)('date.fromNow.days.singular', '{0} day', value) : (0, _nls.localize)('date.fromNow.days.plural', '{0} days', value);
    }
  }

  if (seconds < month) {
    value = Math.floor(seconds / week);

    if (appendAgoLabel) {
      return value === 1 ? (0, _nls.localize)('date.fromNow.weeks.singular.ago', '{0} wk ago', value) : (0, _nls.localize)('date.fromNow.weeks.plural.ago', '{0} wks ago', value);
    } else {
      return value === 1 ? (0, _nls.localize)('date.fromNow.weeks.singular', '{0} wk', value) : (0, _nls.localize)('date.fromNow.weeks.plural', '{0} wks', value);
    }
  }

  if (seconds < year) {
    value = Math.floor(seconds / month);

    if (appendAgoLabel) {
      return value === 1 ? (0, _nls.localize)('date.fromNow.months.singular.ago', '{0} mo ago', value) : (0, _nls.localize)('date.fromNow.months.plural.ago', '{0} mos ago', value);
    } else {
      return value === 1 ? (0, _nls.localize)('date.fromNow.months.singular', '{0} mo', value) : (0, _nls.localize)('date.fromNow.months.plural', '{0} mos', value);
    }
  }

  value = Math.floor(seconds / year);

  if (appendAgoLabel) {
    return value === 1 ? (0, _nls.localize)('date.fromNow.years.singular.ago', '{0} yr ago', value) : (0, _nls.localize)('date.fromNow.years.plural.ago', '{0} yrs ago', value);
  } else {
    return value === 1 ? (0, _nls.localize)('date.fromNow.years.singular', '{0} yr', value) : (0, _nls.localize)('date.fromNow.years.plural', '{0} yrs', value);
  }
}

function toLocalISOString(date) {
  return date.getFullYear() + '-' + (0, _strings.pad)(date.getMonth() + 1, 2) + '-' + (0, _strings.pad)(date.getDate(), 2) + 'T' + (0, _strings.pad)(date.getHours(), 2) + ':' + (0, _strings.pad)(date.getMinutes(), 2) + ':' + (0, _strings.pad)(date.getSeconds(), 2) + '.' + (date.getMilliseconds() / 1000).toFixed(3).slice(2, 5) + 'Z';
}