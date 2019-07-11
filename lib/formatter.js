"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/inheritsLoose"));

var _formatter = _interopRequireDefault(require("knex/lib/formatter"));

var HDB_Formatter =
/*#__PURE__*/
function (_Formatter) {
  (0, _inheritsLoose2["default"])(HDB_Formatter, _Formatter);

  function HDB_Formatter() {
    return _Formatter.apply(this, arguments) || this;
  }

  var _proto = HDB_Formatter.prototype;

  _proto.parameter = function parameter(value, notSetValue) {
    if (value instanceof Date) {
      value = value.toISOString().replace(/\..+$/, '');
    }

    return _Formatter.prototype.parameter.call(this, value, notSetValue);
  };

  return HDB_Formatter;
}(_formatter["default"]);

exports["default"] = HDB_Formatter;
module.exports = exports["default"];