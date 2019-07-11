"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _assign2 = _interopRequireDefault(require("lodash/assign"));

var _inherits = _interopRequireDefault(require("inherits"));

var _tablebuilder = _interopRequireDefault(require("knex/lib/schema/tablebuilder"));

/* eslint max-len:0 no-console:0*/
// HDB Table Builder & Compiler
// -------
// Table Builder
// ------
function TableBuilder_HDB() {
  _tablebuilder["default"].apply(this, arguments);
}

(0, _inherits["default"])(TableBuilder_HDB, _tablebuilder["default"]);
(0, _assign2["default"])(TableBuilder_HDB.prototype, {
  tableType: function tableType(value) {
    this._single.tableType = value;
  }
});
module.exports = TableBuilder_HDB;