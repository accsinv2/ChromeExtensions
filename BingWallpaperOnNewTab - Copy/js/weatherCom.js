/// <reference path="../manager.js" />
var weatherCom = {
    getWeather: function (city, callback) {
        //        if (dataManager.getWeather(city) && dataManager.getForcosts(city) && dataManager.getDetail(city)) {
        //            if (callback) {
        //                callback({
        //                    weather: dataManager.getWeather(city),
        //                    forcasts: dataManager.getForcosts(city),
        //                    details: dataManager.getDetail(city),
        //                    options: {
        //                        temp: localStorage.op_temp,
        //                        time: localStorage.op_time,
        //                        wind: localStorage.op_wind,
        //                        disablesns: localStorage.disablesns
        //                    }
        //                });
        //                return;
        //            }
        //        }

        weatherCom.getLocIdByCity(city, function (locId, _city) {
            console.log(locId);
            var wurl = 'http://www.weather.com/weather/today/' + locId;
            $.get(wurl, function (r) {

                /**  get current weather **/
                var current = $(r).find('.wx-today');
                var isC = $(r).find('button.wx-active').text().indexOf('C') > 0;
                var mweather = {};

                mweather.temp_f = {};
                mweather.temp_c = {};

                mweather.temp_f.cur = parseInt(current.find('.wx-temperature').eq(0).text().replace('°', '').replace('F', '').replace('C', '').trim());
                mweather.temp_f.high = parseInt(current.find('.wx-temperature').eq(1).text().replace('°', '').replace('F', '').replace('C', '').trim());
                mweather.temp_f.low = parseInt(current.find('.wx-temperature').eq(2).text().replace('°', '').replace('F', '').replace('C', '').trim());

                if (isC) {
                    mweather.temp_f.cur = Math.ceil(mweather.temp_f.cur * 1.8 + 32);
                    mweather.temp_f.high = Math.ceil(mweather.temp_f.high * 1.8 + 32);
                    mweather.temp_f.low = Math.ceil(mweather.temp_f.low * 1.8 + 32);
                }

                mweather.temp_c.cur = Math.round((mweather.temp_f.cur - 32) / 1.8);
                mweather.temp_c.high = Math.round((mweather.temp_f.high - 32) / 1.8);
                mweather.temp_c.low = Math.round((mweather.temp_f.low - 32) / 1.8);

                mweather.icon = mweather.text = current.find('.wx-weather-icon').eq(0).attr('alt');
                try {
                    if (!mweather.icon || mweather.icon == 'N/A')
                        mweather.icon = mweather.text = current.find('.wx-weather-icon').eq(1).attr('alt');
                    if (!mweather.icon || mweather.icon == 'N/A')
                        mweather.icon = mweather.text = current.find('.wx-weather-icon').eq(2).attr('alt');
                } catch (ex) { }
                var locaInfo = $(r).find('.wx-location-title h1').eq(0).text().replace(/ Weather/g, '');
                mweather.city = _city; // locaInfo.split(',')[0].trim();
                mweather.scity = city;
                mweather.province = locaInfo.split(',')[1] ? locaInfo.split(',')[1].trim() : 'US';

                /** timezone offset **/
                mweather.locTime = r.match(/"loctime":"(.*?)"/)[1];
                mweather.locDate = r.match(/"locdate":"(.*?)"/)[1];
                mweather.locampm = r.match(/"locampm":"(.*?)"/)[1];
                var locTime = new Date(mweather.locTime + ' ' + mweather.locDate);
                if (mweather.locampm == 'PM' && locTime.getHours() < 12)
                    locTime.setHours(locTime.getHours() + 12);
                mweather.locOffset = new Date().getTime() - locTime.getTime() + new Date().getTimezoneOffset() * 1000 * 60;

                mweather.locId = locId;

                if (mweather.temp_f.cur)
                    dataManager.saveWeather(city, mweather);

                /**  get details **/
                var mdetails = {};
                current.find('.wx-label').each(function (i, lb) {
                    var name = $(lb).text().replace(':', '').trim();
                    var value = $(lb).next().text().trim();

                    if (!mdetails[name])
                        mdetails[name] = value;
                });
                current.find('dt').each(function (i, lb) {
                    var name = $(lb).text().replace(':', '').trim();
                    var value = $(lb).next().text().trim();

                    if (!mdetails[name])
                        mdetails[name] = value;
                });

                try {
                    mdetails['FEELS LIKE'] = parseInt($(r).find('.wx-temperature-label').eq(0).find('span').text());
                    if (isC) {
                        mdetails['FEELS LIKE'] = Math.ceil(mdetails['FEELS LIKE'] * 1.8 + 32);
                    }
                } catch (exx) {
                    mdetails['FEELS LIKE'] = mweather.temp_f.cur;
                }

                mweather.details = mdetails;
                dataManager.saveDetail(city, mdetails);

                console.log({ w: mweather, d: mdetails });

                /**  get forcasts **/
                weatherCom.getForcasts(mweather.city, function (f) {

                    if (callback)
                        callback({
                            weather: mweather,
                            details: mdetails,
                            forcasts: f,
                            options: {
                                temp: localStorage.op_temp,
                                time: localStorage.op_time,
                                wind: localStorage.op_wind,
                                disablesns: localStorage.disablesns
                            }
                        });
                    if (mweather.icon && mweather.city && mweather.temp_c.cur) {
                        update(city, 'weather', mweather);
                        if (f.length > 0)
                            update(city, 'dayforcast', f);
                    }
                });
            })

        });
    },

    getForcasts: function (city, callback) {
        //        if (dataManager.getForcosts(city)) {
        //            if (callback) {
        //                var mh = dataManager.getForcosts(city);
        //                if (mh && mh.length > 0) {
        //                    callback(mh);
        //                    return;
        //                }
        //            }
        //        }

        weatherCom.getLocIdByCity(city, function (locId, _city) {
            var url = "http://www.weather.com/weather/tenday/" + locId;
            $.get(url, function (r) {
                forcasts = [];
                var isC = $(r).find('button.wx-active').text().indexOf('C') > 0;
                $(r).find('.wx-daypart').each(function (i, div) {
                    var time = $(div).find('h3').eq(0).text().replace(/\n/g, ' ').trim();
                    var temp_l = parseInt($(div).find('.wx-temp-alt').text()
                               .replace('°', '').replace('F', '').replace('C', '').trim());
                    var temp_h = parseInt($(div).find('.wx-temp').text()
                               .replace('°', '').replace('F', '').replace('C', '').trim());
                    if (isC) {
                        temp_l = Math.ceil(temp_l * 1.8 + 32);
                        temp_h = Math.ceil(temp_h * 1.8 + 32);
                    }

                    try {
                        var icon = $(div).find('.wx-weather-icon').attr('alt').trim();
                        var detail = $(div).find('.wx-more a').attr('href');
                        var cor = $(div).find('dd').eq(0).text();
                    } catch (e) {
                        var icon = '';
                        var detail = '';
                        var cor = '';
                    }

                    forcasts.push({ time: time, cor: cor, temp_h: temp_h, temp_l: temp_l, icon: icon, detail: detail });
                });

                dataManager.saveForcosts(city, forcasts);

                if (callback != null)
                    callback(forcasts);
            })
        });
    },

    getHourlyWeather: function (city, callback) {
        //        if (dataManager.getHours(city)) {
        //            if (callback) {
        //                var mh = dataManager.getHours(city);
        //                if (mh && mh.length > 0) {
        //                    callback(mh);
        //                    return;
        //                }
        //            }
        //        }

        weatherCom.getLocIdByCity(city, function (locId, _city) {
            var page = 1;
            var url = "http://www.weather.com/weather/hourbyhour/graph/" + locId + "?pagenum="
                + (page + 1) + "&nextbeginIndex=" + (18 * (page - 1));
            $.get(url, function (r) {
                hours = [];
                var isC = $(r).find('button.wx-active').text().indexOf('C') > 0;
                $(r).find('.wx-timepart').each(function (i, div) {
                    var time = $(div).find('.wx-time').html().replace(/<\/span>/g, '')
                                   .replace('<span class="wx-meridian">', '').replace(/\n/g, '')
                                   .replace('<span class="wx-label wx-day-label">', '|')
                                   .replace('<span class="wx-label wx-date-label">', '|');
                    var temp_f = parseInt($(div).find('.wx-conditions .wx-temp').text()
                               .replace('°', '').replace('F', '').replace('C', '').trim());
                    if (isC)
                        temp_f = Math.round(temp_f * 1.8 + 32);
                    var icon = $(div).find('.wx-weather-icon').attr('alt').trim();

                    var detail = {};
                    $(div).find('.wx-details').find('dl').each(function (j, dl) {
                        detail[$(dl).find('dt').text().trim()] = $(dl).find('dd').text().trim();
                    });
                    hours.push({ time: time, temp: temp_f, icon: icon, details: detail });
                });

                dataManager.saveHours(city, hours);

                if (callback != null)
                    callback(hours);

                if (hours.length > 0)
                    update(city, 'hourforcast', hours);
            })
        });
    },

    getAutoComplete: function (input, callback) {
        var url = 'http://wxdata.weather.com/wxdata/ta/' + input + '.js?key=2227ef4c-dfa4-11e0-80d5-0022198344f4&max=10';
        if (navigator.language)
            url += '&locale=' + navigator.language.replace('-', '_');
        $.getJSON(url, function (re) {
            if (callback)
                callback(re);
        });
    },


    getLocIdByCity: function (city, callback) {
        if (localStorage[city + 'locId']) {
            callback(localStorage[city + 'locId'], localStorage[city + '_city']);
            return;
        }
        var url = 'http://wxdata.weather.com/wxdata/ta/' + city + '.js?key=2227ef4c-dfa4-11e0-80d5-0022198344f4';
        if (navigator.language)
            url += '&locale=' + navigator.language.replace('-', '_');
        $.getJSON(url, function (re) {
            console.log(re);
            if (re.results.length > 0) {
                var locId = re.results[0].key;
                var _city = re.results[0].name + ',' + re.results[0].state;
                localStorage[city + 'locId'] = locId;
                localStorage[city + '_city'] = _city;
                callback(locId, _city);
            } else {
                callback('USNY0996');
            }
        });
    }
}