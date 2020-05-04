"use strict";
var exports = {};
Object.defineProperty(exports, "__esModule", { value: true });
var Iso8601PeriodUnits;
(function (Iso8601PeriodUnits) {
    Iso8601PeriodUnits[Iso8601PeriodUnits["years"] = "Years"] = "years";
    Iso8601PeriodUnits[Iso8601PeriodUnits["months"] = "Months"] = "months";
    Iso8601PeriodUnits[Iso8601PeriodUnits["weeks"] = "Weeks"] = "weeks";
    Iso8601PeriodUnits[Iso8601PeriodUnits["days"] = "Days"] = "days";
    Iso8601PeriodUnits[Iso8601PeriodUnits["hours"] = "Hours"] = "hours";
    Iso8601PeriodUnits[Iso8601PeriodUnits["minutes"] = "Minutes"] = "minutes";
    Iso8601PeriodUnits[Iso8601PeriodUnits["seconds"] = "Seconds"] = "seconds";
})(Iso8601PeriodUnits = exports.Iso8601PeriodUnits || (exports.Iso8601PeriodUnits = {}));
class Iso8601Period {
    constructor() {
        this.years = 0;
        this.months = 0;
        this.weeks = 0;
        this.days = 0;
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        // what units to use by default, such as in empty period
        this.preferredUnit = Iso8601PeriodUnits.seconds;
    }
    static valueOf(str) {
        assert(str, "Missing period");
        str = str.toUpperCase();
        assert(str.charAt(0) === 'P', "Period does not start with 'P'", str);
        const stream = new CharStream(str);
        stream.nextChar(); // skip leading 'P'
        const result = new Iso8601Period();
        let timePart = false;
        while (stream.peekChar()) {
            if (stream.peekChar() === 'T') {
                timePart = true;
                stream.nextChar();
                continue;
            }
            const num = stream.nextInt();
            assert(!isNaN(num), "Bad unit number", str, stream.readByNow);
            assert(num >= 0, "Period unit is negative", str, stream.readByNow, num);
            const unit = stream.nextChar();
            switch (unit) {
                case 'Y':
                    result.years = num;
                    result.preferredUnit = Iso8601PeriodUnits.years;
                    break;
                case 'M':
                    if (timePart) {
                        result.minutes = num;
                        result.preferredUnit = Iso8601PeriodUnits.minutes;
                    }
                    else {
                        result.months = num;
                        result.preferredUnit = Iso8601PeriodUnits.months;
                    }
                    break;
                case 'W':
                    result.weeks = num;
                    result.preferredUnit = Iso8601PeriodUnits.weeks;
                    break;
                case 'D':
                    result.days = num;
                    result.preferredUnit = Iso8601PeriodUnits.days;
                    break;
                case 'H':
                    result.hours = num;
                    result.preferredUnit = Iso8601PeriodUnits.hours;
                    break;
                case 'S':
                    result.seconds = num;
                    result.preferredUnit = Iso8601PeriodUnits.seconds;
                    break;
                default:
                    assert(false, "Bad period", str, stream.readByNow);
            }
        }
        return result;
    }
    static ofDuration(duration) {
        return Iso8601Period.ofUnits(duration.units, duration.value);
    }
    static ofUnits(unit, amount) {
        assert(unit, "Missing unit");
        assert(typeof amount === "number", "Missing amount");
        const result = new Iso8601Period();
        result[Iso8601PeriodUnits[unit]] = amount;
        result.preferredUnit = unit;
        return result;
    }
    toString(preferredUnit = this.preferredUnit) {
        function unit(num, unit) {
            if (!num)
                return "";
            return num.toString(10) + unit;
        }
        let result = 'P' + unit(this.years, 'Y') + unit(this.months, 'M') + unit(this.weeks, 'W') + unit(this.days, 'D');
        const time = unit(this.hours, 'H') + unit(this.minutes, 'M') + unit(this.seconds, 'S');
        if (time.length > 0) {
            result += 'T' + time;
        }
        if (result === 'P') {
            // return correct value if no units are present
            switch (preferredUnit) {
                case Iso8601PeriodUnits.years:
                    return "P0Y";
                case Iso8601PeriodUnits.months:
                    return "P0M";
                case Iso8601PeriodUnits.days:
                    return "P0D";
                case Iso8601PeriodUnits.hours:
                    return "PT0H";
                case Iso8601PeriodUnits.minutes:
                    return "PT0M";
                case Iso8601PeriodUnits.seconds:
                    return "PT0S";
                default:
                    assert(false, "Unknown units", preferredUnit);
            }
        }
        return result;
    }
    ;
    /**
     * @return array of all units with non-zero values, in descending order
     */
    definedUnits() {
        const units = Object.keys(Iso8601PeriodUnits).filter(u => typeof u === "string");
        const definedUnitStrings = units.filter(u => !!this[u]);
        return definedUnitStrings.map(u => Iso8601PeriodUnits[u]);
    }
    toHighestUnitsDuration(defaultHighest = this.preferredUnit) {
        const units = this.highestUnits(defaultHighest);
        const value = this.unitValue(units);
        return {
            value: value,
            units: units
        };
    }
    highestUnits(defaultHighest = this.preferredUnit) {
        const units = this.definedUnits();
        if (units.length === 0)
            return defaultHighest;
        else
            return units[0];
    }
    unitValue(unit) {
        const unitString = Iso8601PeriodUnits[unit];
        return (this[unitString] || 0);
    }
}
exports.Iso8601Period = Iso8601Period;
function assert(condition, message = null, ...params) {
    if (condition)
        return;
    if (!message) {
        message = "Assertion failed: " + condition;
    }
    console.error(message, params);
    if (params && params.length > 0) {
        message = message + ": \"" + params[0] + "\"";
    }
    throw new Error(message);
}
class CharStream {
    constructor(str) {
        this.pos = 0;
        this.str = str;
    }
    get readByNow() {
        return this.str.substring(0, this.pos);
    }
    peekChar() {
        if (this.pos >= this.str.length) {
            return null;
        }
        return this.str[this.pos];
    }
    nextChar() {
        if (this.pos >= this.str.length) {
            return null;
        }
        return this.str[this.pos++];
    }
    nextChars(charMatcher) {
        let start = this.pos;
        while (this.pos < this.str.length && charMatcher.test(this.str[this.pos])) {
            this.pos++;
        }
        return this.str.substring(start, this.pos);
    }
    nextQuotedString() {
        const quote = this.peekChar();
        assert(quote === "\"" || quote === "'", "Quoted string must start with a leading or trailing quote");
        // skip leading quote
        this.nextChar();
        let result = "";
        while (this.peekChar() !== quote) {
            result += this.nextChars(new RegExp("[^\\\\" + quote + "]"));
            if (this.peekChar() === "\\") {
                // skip "\" marker for literal
                this.nextChar();
                // use next character as literal
                result += this.nextChar();
            }
        }
        // skip trailing quote
        this.nextChar();
        return result;
    }
    /**
     * @return {number} next integer read, or NaN if not a valid integer
     */
    nextInt() {
        const str = this.nextChars(/-?\d+/);
        if (!str || str.length === 0)
            return NaN;
        return Math.ceil(Number(str));
    }
    peekChars(charMatcher) {
        let start = this.pos;
        let tempPos = this.pos;
        while (tempPos < this.str.length && charMatcher.test(this.str[tempPos])) {
            tempPos++;
        }
        return this.str.substring(start, tempPos);
    }
}
//# sourceMappingURL=Iso8601Period.js.map