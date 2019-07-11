"use strict";

var _interopRequireWildcard = require("@babel/runtime-corejs2/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _construct2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/construct"));

var _assign2 = _interopRequireDefault(require("lodash/assign"));

var _inherits = _interopRequireDefault(require("inherits"));

var _client = _interopRequireDefault(require("knex/lib/client"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var helpers = _interopRequireWildcard(require("knex/lib/helpers"));

var _formatter = _interopRequireDefault(require("./formatter"));

var _compiler = _interopRequireDefault(require("./query/compiler"));

var _tablebuilder = _interopRequireDefault(require("./schema/tablebuilder"));

var _tablecompiler = _interopRequireDefault(require("./schema/tablecompiler"));

var _columncompiler = _interopRequireDefault(require("./schema/columncompiler"));

var _string = require("knex/lib/query/string");

// SAP HANA Client
// -------
// Always initialize with the "QueryBuilder" and "QueryCompiler"
// objects, which extend the base 'lib/query/builder' and
// 'lib/query/compiler', respectively.
function Client_HDB(config) {
  _client["default"].call(this, config);
}

(0, _inherits["default"])(Client_HDB, _client["default"]);
(0, _assign2["default"])(Client_HDB.prototype, {
  dialect: 'hdb',
  driverName: 'hdb',
  _driver: function _driver() {
    return require('hdb');
  },
  formatter: function formatter(builder) {
    return new _formatter["default"](this, builder);
  },
  queryCompiler: function queryCompiler() {
    return (0, _construct2["default"])(_compiler["default"], [this].concat(Array.prototype.slice.call(arguments)));
  },
  tableBuilder: function tableBuilder(type, tableName, fn) {
    return new _tablebuilder["default"](this, type, tableName, fn);
  },
  tableCompiler: function tableCompiler() {
    return (0, _construct2["default"])(_tablecompiler["default"], [this].concat(Array.prototype.slice.call(arguments)));
  },
  columnCompiler: function columnCompiler() {
    return (0, _construct2["default"])(_columncompiler["default"], [this].concat(Array.prototype.slice.call(arguments)));
  },
  transaction: function transaction() {
    throw new Error('Transaction not implemented yet');
  },
  _escapeBinding: (0, _string.makeEscape)(),
  wrapIdentifier: function wrapIdentifier(value) {
    if (value === '*') return value;
    var identifier = value.toUpperCase();
    var matched = identifier.match(/(.*?)(\[[0-9]\])/);
    if (matched) return this.wrapIdentifier(matched[1]) + matched[2];
    return "\"" + identifier.replace(/"/g, '""') + "\"";
  },
  // Get a raw connection, called by the `pool` whenever a new
  // connection needs to be added to the pool.
  acquireRawConnection: function acquireRawConnection() {
    var _this = this;

    var wrapIdentifier = this.wrapIdentifier;
    return new _bluebird["default"](function (resolver, rejecter) {
      var connection = _this.driver.createClient(_this.connectionSettings);

      connection.connect(function (err) {
        if (err) return rejecter(err);
        connection.on('error', function (err) {
          connection.__knex__disposed = err;
        });

        if (_this.connectionSettings.schema) {
          connection.exec("set schema " + wrapIdentifier(_this.connectionSettings.schema), function (err) {
            if (err) return rejecter(err);
            resolver(connection);
          });
        } else {
          resolver(connection);
        }
      });
    });
  },
  // Used to explicitly close a connection, called internally by the pool
  // when a connection times out or the pool is shutdown.
  destroyRawConnection: function destroyRawConnection(connection) {
    connection.end(function (err) {
      if (err) connection.__knex__disposed = err;
    });
  },
  validateConnection: function validateConnection(connection) {
    return connection.readyState === 'connected';
  },
  // Grab a connection, run the query via the HDB streaming interface,
  // and pass that through to the stream we've sent back to the client.
  _stream: function _stream(connection, obj, stream, options) {
    options = options || {};
    return new _bluebird["default"](function (resolver, rejecter) {
      stream.on('error', rejecter);
      stream.on('end', resolver);
      connection.query(obj.sql, obj.bindings).createArrayStream(options).pipe(stream);
    });
  },
  // Runs the query on the specified connection, providing the bindings
  // and any other necessary prep work.
  _query: function _query(connection, obj) {
    var returningSQL = null,
        returningHandler = null;
    if (obj.returningSQL) returningSQL = obj.returningSQL;
    if (obj.returningHandler) returningHandler = obj.returningHandler;
    if (!obj || typeof obj === 'string') obj = {
      sql: obj
    };
    return new _bluebird["default"](function (resolver, rejecter) {
      var _obj = obj,
          sql = _obj.sql;
      if (!sql) return resolver();
      if (obj.options) sql = (0, _assign2["default"])({
        sql: sql
      }, obj.options);
      connection.prepare(obj.sql, function (err, statement) {
        if (err) return rejecter(err);
        return statement.exec(obj.bindings || [], function (err, result) {
          if (err) return rejecter(err);

          if (returningSQL) {
            connection.exec(returningSQL, function (_err, res) {
              if (_err) return rejecter(_err);

              if (returningHandler) {
                obj.response = returningHandler(res);
                resolver(obj);
              } else {
                resolver(obj);
              }
            });
          } else {
            obj.response = result;
            resolver(obj);
          }
        });
      });
    });
  },
  // Process the response as returned from the query.
  processResponse: function processResponse(obj, runner) {
    if (obj == null) return;
    var response = obj.response;
    var method = obj.method;

    function handleReturn(response) {
      try {
        return typeof runner.client.config.postProcessResponse === 'function' ? runner.client.config.postProcessResponse(response, obj.options) : response;
      } catch (e) {
        return response;
      }
    }

    if (obj.output) return obj.output.call(runner, response);

    switch (method) {
      case 'select':
      case 'pluck':
      case 'first':
        {
          var resp = helpers.skim(response);
          if (method === 'pluck') return handleReturn((0, _map3["default"])(resp, obj.pluck));
          return method === 'first' ? handleReturn(resp[0]) : handleReturn(resp);
        }

      default:
        return handleReturn(response);
    }
  },
  canCancelQuery: false,
  cancelQuery: function cancelQuery(connectionToKill) {
    return _bluebird["default"].reject('cancel query not supported');
  }
});
var _default = Client_HDB;
exports["default"] = _default;
module.exports = exports["default"];