"use strict";

var _interopRequireWildcard = require("@babel/runtime-corejs2/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _assign2 = _interopRequireDefault(require("lodash/assign"));

var _inherits = _interopRequireDefault(require("inherits"));

var _tablecompiler = _interopRequireDefault(require("knex/lib/schema/tablecompiler"));

var helpers = _interopRequireWildcard(require("knex/lib/helpers"));

var _bluebird = _interopRequireDefault(require("bluebird"));

/* eslint max-len:0 no-console:0*/
// HDB Table Builder & Compiler
// -------
// Table Compiler
// ------
function TableCompiler_HDB() {
  _tablecompiler["default"].apply(this, arguments);
}

(0, _inherits["default"])(TableCompiler_HDB, _tablecompiler["default"]);
(0, _assign2["default"])(TableCompiler_HDB.prototype, {
  createQuery: function createQuery(columns) {
    var tableType = this.single.tableType || '';
    var createStatement = "create " + tableType + " table ";
    var client = this.client;
    var sql = createStatement + this.tableName() + ' (' + columns.sql.join(', ') + ')';

    if (this.single.comment) {
      var comment = this.single.comment || '';
      sql += " comment '" + comment + "'";
    }

    this.pushQuery(sql);
  },
  // Compiles the comment on the table.
  comment: function comment(_comment) {
    this.pushQuery("comment on " + this.tableName() + " comment is '" + _comment + "'");
  },
  // Create an index
  index: function index(columns, indexName) {
    indexName = indexName ? this.formatter.wrap(indexName) : this._indexCommand('index', this.tableNameRaw, columns);
    this.pushQuery("create index " + indexName + " on " + this.tableName() + " (" + this.formatter.columnize(columns) + ")");
  },
  // Set the primary key
  primary: function primary(columns, constraintName) {
    constraintName = constraintName ? this.formatter.wrap(constraintName) : this.formatter.wrap(this.tableNameRaw + "_pkey");
    this.pushQuery("alter table " + this.tableName() + " add constraint " + constraintName + " primary key (" + this.formatter.columnize(columns) + ")");
  },
  // Create an index
  unique: function unique(columns, indexName) {
    indexName = indexName ? this.formatter.wrap(indexName) : this._indexCommand('index', this.tableNameRaw, columns);
    this.pushQuery("create unique index " + indexName + " on " + this.tableName() + " (" + this.formatter.columnize(columns) + ")");
  }
});
var _default = TableCompiler_HDB;
exports["default"] = _default;
module.exports = exports["default"];