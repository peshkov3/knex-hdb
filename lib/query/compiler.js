"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/array/is-array"));

var _isEmpty2 = _interopRequireDefault(require("lodash/isEmpty"));

var _assign2 = _interopRequireDefault(require("lodash/assign"));

var _inherits = _interopRequireDefault(require("inherits"));

var _compiler = _interopRequireDefault(require("knex/lib/query/compiler"));

// HDB Query Compiler
// ------
function QueryCompiler_HDB(client, builder) {
  _compiler["default"].call(this, client, builder);
}

(0, _inherits["default"])(QueryCompiler_HDB, _compiler["default"]);
(0, _assign2["default"])(QueryCompiler_HDB.prototype, {
  _emptyInsertValue: '() values ()',
  // Update method, including joins, wheres, order & limits.
  update: function update() {
    var join = this.join();

    var updates = this._prepUpdate(this.single.update);

    var where = this.where();
    var order = this.order();
    var limit = this.limit();
    return "update " + this.tableName + (limit ? " " + limit : '') + (join ? " from " + this.tableName + " " + join : '') + ' set ' + updates.join(', ') + (where ? " " + where : '');
  },
  // Compiles an "insert" query, allowing for multiple
  // inserts using a single query statement.
  insert: function insert() {
    var insertValues = this.single.insert || [];
    var returning = this.single.returning;
    var sql = this["with"]() + ("insert into " + this.tableName + " ");

    if ((0, _isArray["default"])(insertValues)) {
      if (insertValues.length === 0) {
        return '';
      }
    } else if (typeof insertValues === 'object' && (0, _isEmpty2["default"])(insertValues)) {
      return sql + this._emptyInsertValue;
    }

    var insertData = this._prepInsert(insertValues);

    if (typeof insertData === 'string') {
      sql += insertData;
    } else {
      if (insertData.columns.length) {
        sql += "(" + this.formatter.columnize(insertData.columns);
        sql += ') values (';
        var i = -1;

        while (++i < insertData.values.length) {
          if (i !== 0) sql += '), (';
          sql += this.formatter.parameterize(insertData.values[i], this.client.valueForUndefined);
        }

        sql += ')';
      } else if (insertValues.length === 1 && insertValues[0]) {
        sql += this._emptyInsertValue;
      } else {
        sql = '';
      }
    }

    if (returning) {
      sql = {
        sql: sql,
        returning: '*',
        returningSQL: "select " + this.tableName.replace(/"/g, '') + "_ID_INCREMENTER.CURRVAL AS ID from DUMMY;",
        returningHandler: function returningHandler(response) {
          return response[0].ID;
        }
      };
    }

    return sql;
  },
  forUpdate: function forUpdate() {
    return 'for update';
  },
  forShare: function forShare() {
    return ''; // not supported
  },
  // Compiles a `columnInfo` query.
  columnInfo: function columnInfo() {
    var column = this.single.columnInfo;
    var dbname = this.client.connectOptions.databaseName || '';
    return {
      sql: 'select * from TABLE_COLUMNS where TABLE_NAME = ? and SCHEMA_NAME = CURRENT_SCHEMA' + (column ? ' and COLUMN_NAME = ?' : ''),
      bindings: [this.single.table.toUpperCase(), column ? column.toUpperCase() : ''],
      output: function output(resp) {
        var out = resp.reduce(function (columns, val) {
          columns[val.COLUMN_NAME] = {
            defaultValue: val.COLUMN_DEFAULT,
            type: val.DATA_TYPE_NAME,
            maxLength: val.LENGTH,
            nullable: val.IS_NULLABLE
          };
          return columns;
        }, {});
        return column && out[column] || out;
      }
    };
  },
  limit: function limit() {
    var noLimit = !this.single.limit && this.single.limit !== 0;
    if (noLimit && !this.single.offset) return ''; // Workaround for offset only.

    var limit = this.single.offset && noLimit ? '18446744073709551615' : this.formatter.parameter(this.single.limit);
    return "limit " + limit;
  }
}); // Set the QueryBuilder & QueryCompiler on the client object,
// in case anyone wants to modify things to suit their own purposes.

var _default = QueryCompiler_HDB;
exports["default"] = _default;
module.exports = exports["default"];