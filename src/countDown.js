var CountdownIdCounter = 1;
function Countdown(opt) {

    "use strict";

    var options = {
        contId: CountdownIdCounter++,
            cont: null,
        countdown: true,
            endDate: {
                year: 0,
                month: 0,
                day: 0,
                hour: 0,
                minute: 0,
                second: 0
            },
            endCallback: null,
            outputFormat: 'year|week|day|hour|minute|second',
            outputTranslation: {
              year: 'Year',
              week: 'Week',
              day: 'Day',
              hour: 'Hour',
              minute: 'Minute',
              second: 'Second',
            }
        };

    var lastTick = null;

    var intervalsBySize = [
        'year', 'week', 'day', 'hour', 'minute', 'second',
    ];

    const TIMESTAMP_SECOND = 1000;
    const TIMESTAMP_MINUTE = 60 * TIMESTAMP_SECOND;
    const TIMESTAMP_HOUR = 60 * TIMESTAMP_MINUTE;
    const TIMESTAMP_DAY = 24 * TIMESTAMP_HOUR;
    const TIMESTAMP_WEEK = 7 * TIMESTAMP_DAY;
    const TIMESTAMP_YEAR = 365 * TIMESTAMP_DAY;

    var elementClassPrefix = 'countDown_';

    var interval = null;
    var digitConts = {};

    loadOptions(options, opt);

    /**
     * @param date
     * @returns {Date}
     */
    function getDate(date) {
        if ((typeof date === 'undefined' ? 'undefined' : _typeof(date)) === 'object') {
            if (date instanceof Date) {
                return date;
            } else {
                var expectedValues = {
                    day: 0,
                    month: 0,
                    year: 0,
                    hour: 0,
                    minute: 0,
                    second: 0
                };

                for (var i in expectedValues) {
                    if (expectedValues.hasOwnProperty(i) && date.hasOwnProperty(i)) {
                        expectedValues[i] = date[i];
                    }
                }

                return new Date(
                    expectedValues.year,
                    expectedValues.month > 0 ? expectedValues.month - 1 : expectedValues.month,
                    expectedValues.day,
                    expectedValues.hour,
                    expectedValues.minute,
                    expectedValues.second
                );
            }
        } else if (typeof date === 'number' || typeof date === 'string') {
            return new Date(date);
        } else {
            return new Date();
        }
    }

    /**
     * @param {Date} dateObj
     * @return {object}
     */
    function prepareTimeByOutputFormat(countdown, dateObj) {
        var usedIntervals = undefined,
            output = {},
            timeDiff = undefined;

        usedIntervals = intervalsBySize.filter(function (item) {
            return options.outputFormat.split('|').indexOf(item) !== -1;
        });

        timeDiff = countdown ? dateObj.getTime() - Date.now() : Date.now() - dateObj.getTime();

        usedIntervals.forEach(function (item) {
            var value = undefined;
            if (timeDiff > 0) {
                switch (item) {
                    case 'year':
                        value = Math.trunc(timeDiff / TIMESTAMP_YEAR);
                        timeDiff -= value * TIMESTAMP_YEAR;
                        break;
                    case 'week':
                        value = Math.trunc(timeDiff / TIMESTAMP_WEEK);
                        timeDiff -= value * TIMESTAMP_WEEK;
                        break;
                    case 'day':
                        value = Math.trunc(timeDiff / TIMESTAMP_DAY);
                        timeDiff -= value * TIMESTAMP_DAY;
                        break;
                    case 'hour':
                        value = Math.trunc(timeDiff / TIMESTAMP_HOUR);
                        timeDiff -= value * TIMESTAMP_HOUR;
                        break;
                    case 'minute':
                        value = Math.trunc(timeDiff / TIMESTAMP_MINUTE);
                        timeDiff -= value * TIMESTAMP_MINUTE;
                        break;
                    case 'second':
                        value = Math.trunc(timeDiff / TIMESTAMP_SECOND);
                        timeDiff -= value * TIMESTAMP_SECOND;
                        break;
                }
            } else {
                value = '00';
            }
            output[item] = (('' + value).length < 2 ? '0' + value : '' + value).split('');
        });

        return output;
    }

    function fixCompatibility() {
        Math.trunc = Math.trunc || function (x) {
                if (isNaN(x)) {
                    return NaN;
                }
                if (x > 0) {
                    return Math.floor(x);
                }
                return Math.ceil(x);
            };
    }

    function writeData(data) {
        var code = `<div class="${elementClassPrefix}cont" id="${elementClassPrefix}_${options.contId}">`,
            intervalName = undefined;

        for (intervalName in data) {
            if (data.hasOwnProperty(intervalName)) {
                var element = `<div class="${elementClassPrefix}_interval_basic_cont"><div class="${getIntervalContCommonClassName()} ${getIntervalContClassName(intervalName)}">`,
                    intervalDescription = `<div class="${elementClassPrefix}interval_basic_cont_description">${options.outputTranslation[intervalName]}</div>`;
                data[intervalName].forEach(function (digit, index) {
                    element += `<div class="${getDigitContCommonClassName()} ${getDigitContClassName(index)}">${getDigitElementString(digit, 0)}</div>`;
                });

                code += element + '</div>' + intervalDescription + '</div>';
            }
        }

        options.cont.innerHTML = code + '</div>';
        lastTick = data;
    }

    function getDigitElementString(newDigit, lastDigit) {
        return `<div class="${elementClassPrefix}digit_last_placeholder">
                        <div class="${elementClassPrefix}digit_last_placeholder_inner">
                            ${lastDigit}
                        </div>
                    </div>
                    <div class="${elementClassPrefix}digit_new_placeholder">${newDigit}</div>
                    <div class="${elementClassPrefix}digit_last_rotate">${lastDigit}</div>
                    <div class="${elementClassPrefix}digit_new_rotate">
                        <div class="${elementClassPrefix}digit_new_rotated">
                            <div class="${elementClassPrefix}digit_new_rotated_inner">
                                ${newDigit}
                            </div>
                        </div>
                    </div>`;
    }

    function updateView(data) {
        for (var intervalName in data) {
            if (data.hasOwnProperty(intervalName)) {
                data[intervalName].forEach(function (digit, index) {
                    if (lastTick !== null && lastTick[intervalName][index] !== data[intervalName][index]) {
                        getDigitCont(intervalName, index).innerHTML =
                            getDigitElementString(data[intervalName][index], lastTick[intervalName][index]);
                    }
                });
            }
        }

        lastTick = data;
    }

    function getDigitCont(intervalName, index) {
        if (!digitConts[`${intervalName}_${index}`]) {
            digitConts[`${intervalName}_${index}`] =
                document.querySelector(
                    `#${elementClassPrefix}_${options.contId} .${getIntervalContClassName(intervalName)} .${getDigitContClassName(index)}`
                );
        }

        return digitConts[`${intervalName}_${index}`];
    }

    function getIntervalContClassName(intervalName) {
        return `${elementClassPrefix}interval_cont_${intervalName}`;
    }

    function getIntervalContCommonClassName() {
        return `${elementClassPrefix}interval_cont`;
    }

    function getDigitContClassName(index) {
        return `${elementClassPrefix}digit_cont_${index}`;
    }

    function getDigitContCommonClassName() {
        return `${elementClassPrefix}digit_cont`;
    }

    function loadOptions(_options, _opt) {
        for (var i in _options) {
            if (_options.hasOwnProperty(i) && _opt.hasOwnProperty(i)) {
                if (_options[i] !== null && _typeof(_options[i]) === 'object' && _typeof(_opt[i]) === 'object') {
                    loadOptions(_options[i], _opt[i]);
                } else {
                    _options[i] = _opt[i];
                }
            }
        }
    }

    function start() {
        var endDate = undefined,
            endDateData = undefined;

        fixCompatibility();

        endDate = getDate(options.endDate);

        endDateData = prepareTimeByOutputFormat(options.countdown, endDate);

        writeData(endDateData);

        lastTick = endDateData;

        if (options.countdown && endDate.getTime() <= Date.now()) {
            if (typeof options.endCallback === 'function') {
                options.endCallback();
            }
        } else {
            interval = setInterval(
                function () {
                    updateView(
                        prepareTimeByOutputFormat(options.countdown, endDate)
                    );
                },
                TIMESTAMP_SECOND
            );
        }
    }

    function stop() {
        if (interval !== null) {
            clearInterval(interval);
        }
    }

    return {
        start: start,
        stop: stop
    };
}
