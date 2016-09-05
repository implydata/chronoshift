# Chronoshift

Chronoshift is a library to manipulate time with timezones

## Installation

In node simply run: `npm install chronoshift`

In the browser you should use the browserified package/chronoshift.js


## Usage

Chronoshift can be used in two ways:

### 1. By using the provided floor, ceil, and move methods

Use `chronoshift[period][fn](date, timezone, moveAmount)` where

- `period` is one of `['year', 'month', 'day', 'hour', 'minute', 'second', 'millisecond']`
- `fn` is one of `['floor, ceil, move']`

```javascript
var tz = Timezone.fromJS("America/Los_Angeles");

var hourStart = chronoshift.hour.floor(new Date("2012-11-04T00:30:00-07:00"), tz));

hourStart.getTime() === new Date("2012-11-04T00:00:00-07:00").getTime()
```


### 2. By using the Duration class

Construct a new duration with a [ISO Duration string](http://en.wikipedia.org/wiki/ISO_8601#Durations). Then you can call `floor`, `ceil` and `move` on it.

Note that `floor` and `ceil` only work for 'simple' durations like "P1x" and "PT1x".

```javascript
var Duration = chronoshift.Duration;
var tz = Timezone.fromJS("America/Los_Angeles");

p1w = Duration.formJS('P1W');

var weekStart;

weekStart = p1w.floor(new Date("2013-09-29T01:02:03.456-07:00"), tz)
weekStart.getTime() === new Date("2013-09-29T00:00:00.000-07:00").getTime()

weekStart = p1w.floor(new Date("2013-10-03T01:02:03.456-07:00"), tz)
weekStart.getTime() === new Date("2013-09-29T00:00:00.000-07:00").getTime()
```

A duration can also be constructed from two dates and a timezone:

```javascript
new Duration(
  new Date("2012-10-29T00:00:00-07:00")
  new Date("2012-11-05T00:00:00-08:00")
  tz
).toString() // => 'P7D'

new Duration(
  new Date("2012-01-01T00:00:00-08:00")
  new Date("2013-03-04T04:05:06-08:00")
  tz
).toString() // => 'P1Y2M3DT4H5M6S'
```

Useful!

## Development

Clone the repository :

```
$ git clone https://github.com/implyio/chronoshift.git
```

Install the dependencies :

```
$ npm install
```

Watch :

```
$ gulp watch
```

## Questions & Support

Please file bugs and feature requests by opening and issue on GitHub and direct all questions to our [user groups](https://groups.google.com/forum/#!forum/imply-user-group).
