/*
 * Author : Niranja Arjuna Jayasinghe
 * swipedown swipeup Events Reference : http://www.adomas.org/javascript-mouse-wheel/
 * dateFormat Reference: http://www.mattkruse.com/javascript/date/source.html
 * // Field        | Full Form          | Short Form
 * // -------------+--------------------+-----------------------
 * // Year         | yyyy (4 digits)    | yy (2 digits), y (2 or 4 digits)
 * // Month        | MMM (name or abbr.)| MM (2 digits), M (1 or 2 digits)
 * //              | NNN (abbr.)        |
 * // Day of Month | dd (2 digits)      | d (1 or 2 digits)
 * // Day of Week  | EE (name)          | E (abbr)
 */

(function($) {

    var MONTH_NAMES = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
    var DAY_NAMES = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat');


    var DatePicker = function(elements, options) {
        this.yearsDiv;
        this.monthsDiv;
        this.datesDiv;
        this.selectedDateSpan;
        this.elements = elements;
        this.settings = jQuery.extend({}, this.defaults, options);
        this.init(elements);
    };

    DatePicker.prototype = {
        defaults: {
            position: "C", // T-top C-center B-bottom I-inline
            selectedDate: new Date(),
            maxDate: null,
            minDate: null,
            dateFmt: "MM/dd/yyyy",
            dmyOrder: "MDY", // Month Day Year
            monthFormat: "NNN", // MM,MMM,NNN (02,February,Feb)
            onChange: function(date) {
            }
        },
        init: function() {
            var self = this;
            $(this.elements).attr('readonly', 'readonly');
            var selDate = this.settings.selectedDate;
            if (this.settings.minDate != null && this.settings.selectedDate.getTime() < this.settings.minDate.getTime()) {
                selDate = this.settings.minDate;
            }
            if (this.settings.maxDate != null && this.settings.selectedDate.getTime() > this.settings.maxDate.getTime()) {
                selDate = this.settings.maxDate;
            }
            $(this.elements).val(this.formatDate(selDate, this.settings.dateFmt));
            // init calendar click            
            $(this.elements).click(function(e) {
                e.preventDefault();
                // remove all other calendars
                $(".ds-calendar-cont").remove();
                var calendarCont = self.buildCalendar();
                self.setPosition(e, calendarCont, self.settings.position);
            });
            // hide calendar when click out side
            $('*').click(function(e) {
                var source = e.target || e.srcElement;
                if (!$(source).hasClass("calendar") && $(source).attr("id") != $(this).attr("id") && $(source).parents(".ds-calendar").length == 0) {
                    self.destroyCalendar();
                }
            });
        },
        mPreventDef: function(e) {
            e.preventDefault();
        },
        destroyCalendar: function() {
            var self = this;
            $(".ds-calendar-cont").remove();
            $(document).unbind('touchmove', self.mPreventDef);
        },
        buildCalendar: function() {
            var self = this;
            // stop browser move up and down
            $(document).bind('touchmove', self.mPreventDef);
            // DMY Oder    
            var DMYID = new Array("D", "M", "Y");
            var calTitles = new Array("Day", "Month", "Year");
            var dsDMY = new Array("ds-dates", "ds-months", "ds-years");
            var fo = DMYID.indexOf(this.settings.dmyOrder.charAt(0));
            var so = DMYID.indexOf(this.settings.dmyOrder.charAt(1));
            var to = DMYID.indexOf(this.settings.dmyOrder.charAt(2));
            var calendarCont = $("<div  class='ds-calendar-cont' />");
            var dsCalendar = $("<div  class='ds-calendar' />");
            var calendarSt = "<div class='ds-show-date'><span id='selected-date'>08/31/2013</span></div>" +
                    "<table class='ds-calendar-table'>" +
                    "<tr><td>" + calTitles[fo] + "</td><td>" + calTitles[so] + "</td><td>" + calTitles[to] + "</td></tr>" +
                    "<tr>" +
                    "<td><div class='ds-mdy-cont'><div id='" + dsDMY[fo] + "' class='ds-mdy-scroller'></div></div><div id='" + DMYID[fo] + "' class='ds-mdy-cont-gradient'></div></td>" +
                    "<td><div class='ds-mdy-cont'><div id='" + dsDMY[so] + "' class='ds-mdy-scroller'></div></div><div id='" + DMYID[so] + "' class='ds-mdy-cont-gradient'></div></td></td>" +
                    "<td><div class='ds-mdy-cont'><div id='" + dsDMY[to] + "' class='ds-mdy-scroller'></div></div><div id='" + DMYID[to] + "' class='ds-mdy-cont-gradient'></div></td></td>" +
                    "</tr></table>";
            var calBottom = $("<div class='ds-calendar-Bottom' />");
            var btnCont = $("<div class='ds-btn-cont'/>");
            var select = $("<input class='ds-button' type='button' value='Set' />");
            var cancel = $("<input class='ds-button' type='button' value='Cancel' />");
            $(btnCont).append(select).append(cancel);
            $(calBottom).append(btnCont);
            $(dsCalendar).append(calendarSt).append(calBottom);
            this.yearsDiv = $(dsCalendar).find("#ds-years");
            this.monthsDiv = $(dsCalendar).find("#ds-months");
            this.datesDiv = $(dsCalendar).find("#ds-dates");
            $(calendarCont).append(dsCalendar);
            this.selectedDateSpan = $(dsCalendar).find("#selected-date");

            $(this.selectedDateSpan).text(new Date(this.parseDate($(this.elements).val())).toLocaleDateString());
            $(select).click(function() {
                if (!$(self.datesDiv).find(".ds-mdy:nth-child(3)").hasClass("dis-d") && !$(this.datesDiv).find(".ds-mdy:nth-child(3)").hasClass("dis-u")) {
                    $(calendarCont).remove();
                    $(self.elements).val(self.formatDate(self.getDSDate()));
                    self.settings.onChange.call(this, self.getDSDate());
                } else {
                    self.selectedDateSpan.text("Please select valid date");
                }
            });
            $(cancel).click(function() {
                self.destroyCalendar();
            });
            // mouse wheel Handdle for desktops             
            $(calendarCont).find(".ds-mdy-cont-gradient").each(function(i, o) {
                if (window.addEventListener) {
                    // DOMMouseScroll is for mozilla.              
                    o.addEventListener('DOMMouseScroll', function(e) {
                        self.wheel(e, self);
                    }, false);
                }
                // IE/Opera. 
                o.onmousewheel = function(e) {
                    self.wheel(e, self);
                }
            });
            // thouch handdle for mobiles
            $(calendarCont).find(".ds-mdy-cont-gradient").each(function(i, o) {
                $(o).bind("swipeup", function(event) {
                    event.preventDefault();
                    self.handle(1, o, self);
                });
                $(o).bind("swipedown", function(event) {
                    event.preventDefault();
                    self.handle(-1, o, self);
                });
            });
            this.buildDMY(this, new Date(this.parseDate($(this.elements).val())));
            $(calendarCont).css("display", "block");
            $("body").append(calendarCont);
            return calendarCont;
        },
        buildDMY: function(self, selectedDate) {

            var year = selectedDate.getFullYear();
            var month = selectedDate.getMonth() + 1;
            var date = selectedDate.getDate();
            var y = 0;
            //set years   
            var i = 1;
            year = this.closetDMY("Y", year);
            for (y = year - 2; y <= year + 2; y++) {
                var v = self.validateDMY("Y", y);
                var secondClass = "dis-d";
                if (i > 3) {
                    secondClass = "dis-u";
                }
                var sClass = (!v ? "ds-mdy " + secondClass : "ds-mdy");
                $(self.yearsDiv).append("<div class='" + sClass + "' id='" + y + "'>" + y + "</div>");
                i++;
            }
            //set months 
            self.populateMonths(self, month);
            //set dates   
            self.populateDates(self, date);
        },
        setPosition: function(e, calendarCont, position) {
            var source = e.target || e.srcElement;
            var viewPortWidth = $(window).width();
            var calWidth = $(calendarCont).find(".ds-calendar").width();
            var left = (viewPortWidth - calWidth) / 2;
            $(calendarCont).css("left", left);
            $(calendarCont).css("position", "absolute");
            switch (position) {
                case "I":
                    {
                        $(calendarCont).css("position", "relative");
                        $(calendarCont).css("top", $(source).offset().top + $(source).height() + 14);
                        $(calendarCont).css("left", $(source).offset().left);
                        break;
                    }
                case "T":
                    {
                        $(calendarCont).css("top", 0);
                        break;
                    }
                case "B":
                    {
                        $(calendarCont).css("bottom", "65px");
                        break;
                    }
                case "C":
                    {
                        var viewPortHeight = $(window).height();
                        var calHeight = $(calendarCont).find(".ds-calendar").height();
                        var top = (viewPortHeight - calHeight) / 2;
                        $(calendarCont).css("top", top);
                        break;
                    }
            }
            $(calendarCont).find(".ds-calendar").css("margin", "0px");
        },
        setDateString: function() {
            $(this.selectedDateSpan).text(this.getDSDate().toLocaleDateString());
        },
        getDSDate: function() {
            var selectedMonth = parseInt($(this.monthsDiv).find(".ds-mdy:nth-child(3)").attr("id"), 10);
            var selectedDay = parseInt($(this.datesDiv).find(".ds-mdy:nth-child(3)").attr("id"), 10);
            var selectedYear = parseInt($(this.yearsDiv).find(".ds-mdy:nth-child(3)").attr("id"), 10);
            return new Date(selectedYear, selectedMonth - 1, selectedDay);
        },
        populateDates: function(self, d) {
            if (d == 0) {
                d = parseInt($(this.datesDiv).find(".ds-mdy:nth-child(3)").attr("id"), 10);
            }
            d = self.closetDMY("D", d);
            var daysArr = self.daysInMonth();
            if (d > daysArr.length) {
                d = daysArr.length;
            }
            var i = 1;
            var start = d - 3;
            if (start < 0) {
                start = daysArr.length + start;
            }
            var reset = false;
            $(self.datesDiv).empty();
            while (i < 6) {
                if (start >= daysArr.length && !reset) {
                    start = 0;
                    reset = true;
                }
                var next = daysArr[start++];
                var v = self.validateDMY("D", next);
                var secondClass = "dis-d";
                if (i > 3) {
                    secondClass = "dis-u";
                }
                var sClass = (!v ? "ds-mdy " + secondClass : "ds-mdy");
                $(self.datesDiv).append("<div class='" + sClass + "' id='" + next + "'>" + self.LZ(next) + "</div>");
                i++;
            }
        },
        populateMonths: function(self, m) {
            if (m == 0) {
                m = parseInt($(self.monthsDiv).find(".ds-mdy:nth-child(3)").attr("id"), 10);
            }
            var i = 1;
            m = this.closetDMY("M", m);
            var start = m - 2;
            if (start < 1) {
                start = 12 + start;
            }
            $(self.monthsDiv).empty();
            var reset = false;
            while (i < 6) {
                var next = start++;

                if (start > 12 && !reset) {
                    start = 1;
                    reset = true;
                }
                var v = self.validateDMY("M", next);
                var secondClass = "dis-d";
                if (i > 3) {
                    secondClass = "dis-u"
                }
                var sClass = (!v ? "ds-mdy " + secondClass : "ds-mdy");
                $(self.monthsDiv).append("<div class='" + sClass + "' id='" + next + "'>" + self.getMonthName(self, next) + "</div>");
                i++;
            }
        },
        getMonthName: function(self, m) {
            switch (self.settings.monthFormat) {
                case "MM":
                    return self.LZ(m);
                    break;
                case "MMM":
                    return MONTH_NAMES[m - 1];
                    break;
                case "NNN":
                    return MONTH_NAMES[m + 11];
                    break;
                default:
                    return m;
            }
        },
        handle: function(delta, parent, self) {
            var DMY = $(parent).attr("id");
            var scroller;
            if (DMY === "M") {
                scroller = self.monthsDiv;
            } else if (DMY === "D") {
                scroller = self.datesDiv;
            } else {
                scroller = self.yearsDiv;
            }
            if (delta < 0) {// down
                if (!$(scroller).find(".ds-mdy:nth-child(2)").hasClass("dis-d")) {
                    $(scroller).animate({
                        top: "30px"
                    }, {
                        duration: 100,
                        complete: function() {
                            var firstChildVal = parseInt($(scroller).find(".ds-mdy:first-child").attr("id"));
                            var next = --firstChildVal;
                            if (self.validDate(DMY, next) == 0) {
                                if (DMY === "M") {
                                    next = 12;
                                }
                                else if (DMY === "D") {
                                    next = 32;
                                    do {
                                        next--;
                                    } while (self.validDate(DMY, next) == 0);
                                }
                            }
                            var disl = $(this).find(".ds-mdy:nth-child(2)").hasClass("dis-d");
                            if (!disl) {
                                var v = self.validateDMY(DMY, next);
                                var sClass = (!v ? "ds-mdy dis-d" : "ds-mdy");
                                var displaySt = (DMY === "M" ? self.getMonthName(self, next) : DMY === "D" ? self.LZ(next) : next);
                                $(this).prepend("<div class='" + sClass + "' id='" + next + "'>" + displaySt + "</div>");
                                $(this).css("top", "0px");
                                $(this).find(".ds-mdy:last-child").remove();
                                if (DMY === "Y") {
                                    self.populateMonths(self, 0);
                                    self.populateDates(self, 0);
                                } else if (DMY === "M") {
                                    self.populateDates(self, 0);
                                }
                                self.setDateString();
                            } else {
                                $(scroller).css("top", "0px");
                            }
                        }
                    });
                }
            } else {//up
                if (!$(scroller).find(".ds-mdy:nth-child(4)").hasClass("dis-u")) {
                    $(scroller).animate({
                        top: "-30px"
                    }, {
                        duration: 100,
                        complete: function() {
                            var lastChildVal = parseInt($(scroller).find(".ds-mdy:last-child").attr("id"));
                            var next = ++lastChildVal;
                            if (self.validDate(DMY, next) == 0) {
                                next = 1;
                            }
                            var disl = $(this).find(".ds-mdy:nth-child(4)").hasClass("dis-u");
                            if (!disl) {
                                var v = self.validateDMY(DMY, next);
                                var sClass = (!v ? "ds-mdy dis-u" : "ds-mdy");
                                $(this).find(".ds-mdy:first-child").remove();
                                var displaySt = (DMY === "M" ? self.getMonthName(self, next) : DMY === "D" ? self.LZ(next) : next);
                                $(this).append("<div class='" + sClass + "' id='" + next + "'>" + displaySt + "</div>");
                                $(this).css("top", "0px");
                                if (DMY === "Y") {
                                    self.populateMonths(self, 0);
                                    self.populateDates(self, 0);
                                } else if (DMY === "M") {
                                    self.populateDates(self, 0);
                                }
                                self.setDateString();
                            } else {
                                $(scroller).css("top", "0px");
                            }
                        }
                    });
                }
            }
        },
        /** Event handler for mouse wheel event.
         */
        wheel: function(event, self) {
            var parent = $(event.target);
            var delta = 0;
            if (!event) /* For IE. */
                event = window.event;
            if (event.wheelDelta) { /* IE/Opera. */
                delta = event.wheelDelta / 120;
            } else if (event.detail) { /** Mozilla case. */
                /** In Mozilla, sign of delta is different than in IE.
                 * Also, delta is multiple of 3.
                 */
                delta = -event.detail / 3;
            }
            /** If delta is nonzero, handle it.
             * scrolled up  delta = 1,
             * scrolled down delta = -1.
             */
            if (delta)
                self.handle(delta, parent, self);
            /** Prevent default actions caused by mouse wheel.        
             */
            if (event.preventDefault)
                event.preventDefault();
            event.returnValue = false;
        },
        closetDMY: function(DMY, v) {
            if (this.settings.maxDate != null && this.settings.minDate != null) {
                if (DMY === "D") {
                    var y = parseInt($(this.yearsDiv).find(".ds-mdy:nth-child(3)").attr("id"), 10);
                    var m = parseInt($(this.monthsDiv).find(".ds-mdy:nth-child(3)").attr("id"), 10);
                    var date = new Date(y, m - 1, v);
                    if (this.settings.maxDate.getTime() < date.getTime()) {
                        return this.settings.maxDate.getDate();
                    }
                    if (this.settings.minDate.getTime() > date.getTime()) {
                        return this.settings.minDate.getDate();
                    }
                } else if (DMY === "M") {
                    var y = parseInt($(this.yearsDiv).find(".ds-mdy:nth-child(3)").attr("id"), 10);
                    if (this.settings.maxDate.getFullYear() == y && this.settings.maxDate.getMonth() + 1 < v) {
                        return this.settings.maxDate.getMonth() + 1;
                    }
                    if (this.settings.minDate.getFullYear() == y && this.settings.minDate.getMonth() + 1 > v) {
                        return  this.settings.minDate.getMonth() + 1;
                    }
                } else {
                    if (this.settings.maxDate.getFullYear() < v) {
                        return this.settings.maxDate.getFullYear();
                    }
                    if (this.settings.minDate.getFullYear() > v) {
                        return this.settings.maxDate.getFullYear();
                    }
                }
            }
            return v;
        },
        validateDMY: function(DMY, v) {
            var validated = true;
            if (this.settings.maxDate != null && this.settings.minDate != null) {
                if (DMY === "D") {
                    var y = parseInt($(this.yearsDiv).find(".ds-mdy:nth-child(3)").attr("id"), 10);
                    var m = parseInt($(this.monthsDiv).find(".ds-mdy:nth-child(3)").attr("id"), 10);
                    var date = new Date(y, m - 1, v);
                    if (this.settings.maxDate.getTime() < date.getTime() || this.settings.minDate.getTime() > date.getTime()) {
                        validated = false;
                    }
                } else if (DMY === "M") {
                    var y = parseInt($(this.yearsDiv).find(".ds-mdy:nth-child(3)").attr("id"), 10);
                    if ((this.settings.maxDate.getFullYear() == y && this.settings.maxDate.getMonth() + 1 < v) || (this.settings.minDate.getFullYear() == y && this.settings.minDate.getMonth() + 1 > v)) {
                        validated = false;
                    }
                } else {
                    if ((this.settings.maxDate.getFullYear() < v || this.settings.minDate.getFullYear() > v)) {
                        validated = false;
                    }
                }
            }
            return validated;
        },
        validDate: function(DMY, c) {
            var validated = 0;
            var m = parseInt($(this.monthsDiv).find(".ds-mdy:nth-child(3)").attr("id"), 10);
            var d = parseInt($(this.datesDiv).find(".ds-mdy:nth-child(3)").attr("id"), 10);
            var y = parseInt($(this.yearsDiv).find(".ds-mdy:nth-child(3)").attr("id"), 10);
            if (DMY === "M") {
                m = c;
            } else if (DMY === "D") {
                d = c;
            } else {
                y = c;
            }
            var date = new Date(y, m - 1, d);
            if (date.getFullYear() == y && date.getMonth() + 1 == m && date.getDate() == d) {
                validated = 1;
                if ((this.settings.maxDate != null && this.settings.minDate != null) && (this.settings.maxDate.getTime() < date.getTime() || this.settings.minDate.getTime() > date.getTime())) {
                    validated = 2;
                }
            }
            return validated;
        },
        daysInMonth: function()
        {
            var m = parseInt($(this.monthsDiv).find(".ds-mdy:nth-child(3)").attr("id"), 10);
            var y = parseInt($(this.yearsDiv).find(".ds-mdy:nth-child(3)").attr("id"), 10);
            var max = 32 - new Date(y, m - 1, 32).getDate();
            var i = 0;
            var tempArray = new Array();
            for (i = 1; i <= max; i++) {
                tempArray.push(i);
            }
            return tempArray;
        },
        formatDate: function(date) {
            format = this.settings.dateFmt + "";
            var result = "";
            var i_format = 0;
            var c = "";
            var token = "";
            var y = date.getYear() + "";
            var M = date.getMonth() + 1;
            var d = date.getDate();
            var E = date.getDay();
            var H = date.getHours();
            var m = date.getMinutes();
            var s = date.getSeconds();
            var yyyy, yy, MMM, MM, dd, hh, h, mm, ss, ampm, HH, H, KK, K, kk, k;
            // Convert real date parts into formatted versions
            var value = new Object();
            if (y.length < 4) {
                y = "" + (y - 0 + 1900);
            }
            value["y"] = "" + y;
            value["yyyy"] = y;
            value["yy"] = y.substring(2, 4);
            value["M"] = M;
            value["MM"] = this.LZ(M);
            value["MMM"] = MONTH_NAMES[M - 1];
            value["NNN"] = MONTH_NAMES[M + 11];
            value["d"] = d;
            value["dd"] = this.LZ(d);
            value["E"] = DAY_NAMES[E + 7];
            value["EE"] = DAY_NAMES[E];
            value["H"] = H;
            value["HH"] = this.LZ(H);

            if (H == 0) {
                value["h"] = 12;
            }
            else if (H > 12) {
                value["h"] = H - 12;
            }
            else {
                value["h"] = H;
            }
            value["hh"] = this.LZ(value["h"]);
            if (H > 11) {
                value["K"] = H - 12;
            } else {
                value["K"] = H;
            }
            value["k"] = H + 1;
            value["KK"] = this.LZ(value["K"]);
            value["kk"] = this.LZ(value["k"]);
            if (H > 11) {
                value["a"] = "PM";
            }
            else {
                value["a"] = "AM";
            }
            value["m"] = m;
            value["mm"] = this.LZ(m);
            value["s"] = s;
            value["ss"] = this.LZ(s);
            while (i_format < format.length) {
                c = format.charAt(i_format);
                token = "";
                while ((format.charAt(i_format) == c) && (i_format < format.length)) {
                    token += format.charAt(i_format++);
                }
                if (value[token] != null) {
                    result = result + value[token];
                }
                else {
                    result = result + token;
                }
            }
            return result;
        },
        LZ: function(x) {
            return(x < 0 || x > 9 ? "" : "0") + x;
        },
        parseDate: function(val) {
            var preferEuro = (arguments.length == 2) ? arguments[1] : false;
            generalFormats = new Array('y-M-d', 'MMM d, y', 'MMM d,y', 'y-MMM-d', 'd-MMM-y', 'MMM d');
            monthFirst = new Array('M/d/y', 'M-d-y', 'M.d.y', 'MMM-d', 'M/d', 'M-d');
            dateFirst = new Array('d/M/y', 'd-M-y', 'd.M.y', 'd-MMM', 'd/M', 'd-M');
            var checkList = new Array('generalFormats', preferEuro ? 'dateFirst' : 'monthFirst', preferEuro ? 'monthFirst' : 'dateFirst');
            var d = null;
            for (var i = 0; i < checkList.length; i++) {
                var l = window[checkList[i]];
                for (var j = 0; j < l.length; j++) {
                    d = this.getDateFromFormat(val, l[j]);
                    if (d != 0) {
                        return new Date(d);
                    }
                }
            }
            return null;
        },
        _getInt: function(str, i, minlength, maxlength) {
            for (var x = maxlength; x >= minlength; x--) {
                var token = str.substring(i, i + x);
                if (token.length < minlength) {
                    return null;
                }
                if (this._isInteger(token)) {
                    return token;
                }
            }
            return null;
        },
        _isInteger: function(val) {
            var digits = "1234567890";
            for (var i = 0; i < val.length; i++) {
                if (digits.indexOf(val.charAt(i)) == -1) {
                    return false;
                }
            }
            return true;
        },
        getDateFromFormat: function(val, format) {
            val = val + "";
            format = format + "";
            var i_val = 0;
            var i_format = 0;
            var c = "";
            var token = "";
            var token2 = "";
            var x, y;
            var now = new Date();
            var year = now.getYear();
            var month = now.getMonth() + 1;
            var date = 1;
            var hh = now.getHours();
            var mm = now.getMinutes();
            var ss = now.getSeconds();
            var ampm = "";
            while (i_format < format.length) {
// Get next token from format string
                c = format.charAt(i_format);
                token = "";
                while ((format.charAt(i_format) == c) && (i_format < format.length)) {
                    token += format.charAt(i_format++);
                }
// Extract contents of value based on format token
                if (token == "yyyy" || token == "yy" || token == "y") {
                    if (token == "yyyy") {
                        x = 4;
                        y = 4;
                    }
                    if (token == "yy") {
                        x = 2;
                        y = 2;
                    }
                    if (token == "y") {
                        x = 2;
                        y = 4;
                    }
                    year = this._getInt(val, i_val, x, y);
                    if (year == null) {
                        return 0;
                    }
                    i_val += year.length;
                    if (year.length == 2) {
                        if (year > 70) {
                            year = 1900 + (year - 0);
                        }
                        else {
                            year = 2000 + (year - 0);
                        }
                    }
                }
                else if (token == "MMM" || token == "NNN") {
                    month = 0;
                    for (var i = 0; i < MONTH_NAMES.length; i++) {
                        var month_name = MONTH_NAMES[i];
                        if (val.substring(i_val, i_val + month_name.length).toLowerCase() == month_name.toLowerCase()) {
                            if (token == "MMM" || (token == "NNN" && i > 11)) {
                                month = i + 1;
                                if (month > 12) {
                                    month -= 12;
                                }
                                i_val += month_name.length;
                                break;
                            }
                        }
                    }
                    if ((month < 1) || (month > 12)) {
                        return 0;
                    }
                }
                else if (token == "EE" || token == "E") {
                    for (var i = 0; i < DAY_NAMES.length; i++) {
                        var day_name = DAY_NAMES[i];
                        if (val.substring(i_val, i_val + day_name.length).toLowerCase() == day_name.toLowerCase()) {
                            i_val += day_name.length;
                            break;
                        }
                    }
                }
                else if (token == "MM" || token == "M") {
                    month = this._getInt(val, i_val, token.length, 2);
                    if (month == null || (month < 1) || (month > 12)) {
                        return 0;
                    }
                    i_val += month.length;
                }
                else if (token == "dd" || token == "d") {
                    date = this._getInt(val, i_val, token.length, 2);
                    if (date == null || (date < 1) || (date > 31)) {
                        return 0;
                    }
                    i_val += date.length;
                }
                else if (token == "hh" || token == "h") {
                    hh = this._getInt(val, i_val, token.length, 2);
                    if (hh == null || (hh < 1) || (hh > 12)) {
                        return 0;
                    }
                    i_val += hh.length;
                }
                else if (token == "HH" || token == "H") {
                    hh = this._getInt(val, i_val, token.length, 2);
                    if (hh == null || (hh < 0) || (hh > 23)) {
                        return 0;
                    }
                    i_val += hh.length;
                }
                else if (token == "KK" || token == "K") {
                    hh = this._getInt(val, i_val, token.length, 2);
                    if (hh == null || (hh < 0) || (hh > 11)) {
                        return 0;
                    }
                    i_val += hh.length;
                }
                else if (token == "kk" || token == "k") {
                    hh = this._getInt(val, i_val, token.length, 2);
                    if (hh == null || (hh < 1) || (hh > 24)) {
                        return 0;
                    }
                    i_val += hh.length;
                    hh--;
                }
                else if (token == "mm" || token == "m") {
                    mm = this._getInt(val, i_val, token.length, 2);
                    if (mm == null || (mm < 0) || (mm > 59)) {
                        return 0;
                    }
                    i_val += mm.length;
                }
                else if (token == "ss" || token == "s") {
                    ss = this._getInt(val, i_val, token.length, 2);
                    if (ss == null || (ss < 0) || (ss > 59)) {
                        return 0;
                    }
                    i_val += ss.length;
                }
                else if (token == "a") {
                    if (val.substring(i_val, i_val + 2).toLowerCase() == "am") {
                        ampm = "AM";
                    }
                    else if (val.substring(i_val, i_val + 2).toLowerCase() == "pm") {
                        ampm = "PM";
                    }
                    else {
                        return 0;
                    }
                    i_val += 2;
                }
                else {
                    if (val.substring(i_val, i_val + token.length) != token) {
                        return 0;
                    }
                    else {
                        i_val += token.length;
                    }
                }
            }
// If there are any trailing characters left in the value, it doesn't match
            if (i_val != val.length) {
                return 0;
            }
// Is date valid for month?
            if (month == 2) {
// Check for leap year
                if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) { // leap year
                    if (date > 29) {
                        return 0;
                    }
                }
                else {
                    if (date > 28) {
                        return 0;
                    }
                }
            }
            if ((month == 4) || (month == 6) || (month == 9) || (month == 11)) {
                if (date > 30) {
                    return 0;
                }
            }
// Correct hours value
            if (hh < 12 && ampm == "PM") {
                hh = hh - 0 + 12;
            }
            else if (hh > 11 && ampm == "AM") {
                hh -= 12;
            }
            var newdate = new Date(year, month - 1, date, hh, mm, ss);
            return newdate.getTime();
        }
    };

    jQuery.fn.dateSelector = function(options) {
        new DatePicker(this, options);
        return this;
    };

}(jQuery));

/*
 * 
 * swipeupdown event
 * 
 * Reference : http://developingwithstyle.blogspot.co.uk/2012_12_01_archive.html
 */

(function() {
    var supportTouch = $.support.touch,
            touchStartEvent = supportTouch ? "touchstart" : "mousedown",
            touchStopEvent = supportTouch ? "touchend" : "mouseup",
            touchMoveEvent = supportTouch ? "touchmove" : "mousemove";
    $.event.special.swipeupdown = {
        setup: function() {
            var thisObject = this;
            var $this = $(thisObject);
            $this.bind(touchStartEvent, function(event) {
                var data = event.originalEvent.touches ?
                        event.originalEvent.touches[ 0 ] :
                        event,
                        start = {
                    time: (new Date).getTime(),
                    coords: [data.pageX, data.pageY],
                    origin: $(event.target)
                },
                stop;
                function moveHandler(event) {
                    event.preventDefault();
                    if (!start) {
                        return;
                    }
                    var data = event.originalEvent.touches ?
                            event.originalEvent.touches[ 0 ] :
                            event;
                    stop = {
                        time: (new Date).getTime(),
                        coords: [data.pageX, data.pageY]
                    };
                    // prevent scrolling
                    if (Math.abs(start.coords[1] - stop.coords[1]) > 8) {
                        event.preventDefault();
                    }
                }
                $this.bind(touchMoveEvent, moveHandler)
                        .one(touchStopEvent, function(event) {
                    event.preventDefault();
                    $this.unbind(touchMoveEvent, moveHandler);
                    if (start && stop) {
                        if (stop.time - start.time < 1000 &&
                                Math.abs(start.coords[1] - stop.coords[1]) > 30 &&
                                Math.abs(start.coords[0] - stop.coords[0]) < 75) {
                            var speed = Math.abs(start.coords[1] - stop.coords[1]) / (stop.time - start.time);
                            var nOe = speed / 0.2;
                            var up = start.coords[1] > stop.coords[1];
                            for (nOe; nOe > 0; nOe--) {
                                start.origin.trigger("swipeupdown").trigger(up ? "swipeup" : "swipedown");
                            }
                        }
                    }
                    start = stop = undefined;
                });
            });
        }
    };
    $.each({
        swipedown: "swipeupdown",
        swipeup: "swipeupdown"
    }, function(event, sourceEvent) {
        $.event.special[event] = {
            setup: function() {
                $(this).bind(sourceEvent, $.noop);
            }
        };
    });
})();