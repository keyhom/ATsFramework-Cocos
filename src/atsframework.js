(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Load type.
     */
    var LoadType;
    (function (LoadType) {
        LoadType[LoadType["Text"] = 0] = "Text";
        LoadType[LoadType["Bytes"] = 1] = "Bytes";
        LoadType[LoadType["Stream"] = 2] = "Stream";
    })(LoadType = exports.LoadType || (exports.LoadType = {}));
    ;
    var g_pModules = [];
    /**
     * An event handler make similar with event delegate mode.
     */
    var EventHandler = /** @class */ (function () {
        function EventHandler() {
        }
        EventHandler.prototype.has = function (fn, target) {
            if (null != this.m_pHandlers) {
                return this.m_pHandlers.some(function (value) {
                    var v_bRet = value[1] == fn;
                    if (v_bRet && undefined != target) {
                        v_bRet = value[0] == target;
                    }
                    return v_bRet;
                });
            }
            return false;
        };
        EventHandler.prototype.add = function (fn, target) {
            if (null == this.m_pHandlers)
                this.m_pHandlers = [];
            if (this.has(fn, target)) {
                throw new Error("Duplicated add event handler '" + fn + "'");
                return;
            }
            this.m_pHandlers.push([target, fn, false]);
        };
        EventHandler.prototype.remove = function (fn, target) {
            if (!this.isValid)
                return;
            for (var i = 0; i < this.m_pHandlers.length; i++) {
                var v_pTuple = this.m_pHandlers[i];
                if (undefined == target && v_pTuple[1] == fn) {
                    this.m_pHandlers.splice(i, 1);
                    break;
                }
                else if (undefined != target && v_pTuple[0] == target && v_pTuple[1] == fn) {
                    this.m_pHandlers.splice(i, 1);
                    break;
                }
            }
        };
        EventHandler.prototype.iter = function (fn) {
            if (!this.isValid)
                return;
            this.m_pHandlers.forEach(function (value) {
                var callbackFn = value[1];
                if (value[0] != undefined && callbackFn instanceof Function) {
                    callbackFn = callbackFn.bind(value[0]);
                }
                fn(callbackFn);
            });
        };
        EventHandler.prototype.clear = function () {
            this.isValid && this.m_pHandlers.splice(0, this.m_pHandlers.length);
        };
        Object.defineProperty(EventHandler.prototype, "isValid", {
            get: function () {
                return this.m_pHandlers && this.m_pHandlers.length > 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventHandler.prototype, "size", {
            get: function () {
                return this.m_pHandlers.length;
            },
            enumerable: true,
            configurable: true
        });
        return EventHandler;
    }()); // class EventHandler
    exports.EventHandler = EventHandler;
    var FrameworkModule = /** @class */ (function () {
        function FrameworkModule() {
            this.m_iPriority = 0;
        }
        FrameworkModule.getModule = function (type) {
            for (var i = 0; i < g_pModules.length; i++) {
                var m = g_pModules[i];
                if (m instanceof type) {
                    return m;
                }
            }
            return null;
        };
        FrameworkModule.getOrAddModule = function (type) {
            var v_pModule = this.getModule(type);
            if (null == v_pModule) {
                v_pModule = new type();
                this.addModule(v_pModule);
            }
            return v_pModule;
        };
        FrameworkModule.addModule = function (module) {
            var m = this.getModule(module.constructor);
            if (m)
                throw new Error("Duplicated adding framework module: " + typeof module); // FIXME: Detecting how to get the class name.
            g_pModules.push(module);
            g_pModules = g_pModules.sort(function (a, b) {
                if (a.m_iPriority > b.m_iPriority)
                    return -1;
                else if (a.m_iPriority < b.m_iPriority)
                    return 1;
                return 0;
            });
        };
        FrameworkModule.removeModule = function (type) {
            for (var i = 0; i < g_pModules.length; i++) {
                var v_pModule = g_pModules[i];
                if (v_pModule && v_pModule instanceof type) {
                    g_pModules.splice(i, 1);
                    return v_pModule;
                }
            }
            return null;
        };
        FrameworkModule.update = function (elapsed, realElapsed) {
            for (var i = 0; i < g_pModules.length; ++i) {
                var v_pModule = g_pModules[i];
                v_pModule.update(elapsed, realElapsed);
            }
        };
        FrameworkModule.shutdown = function () {
            for (var i = g_pModules.length - 1; i >= 0; --i) {
                var v_pModule = g_pModules[i];
                v_pModule.shutdown();
            }
        };
        Object.defineProperty(FrameworkModule.prototype, "priority", {
            get: function () {
                return this.m_iPriority;
            },
            enumerable: true,
            configurable: true
        });
        return FrameworkModule;
    }()); // class FrameworkModule
    exports.FrameworkModule = FrameworkModule;
    var FrameworkSegment = /** @class */ (function () {
        function FrameworkSegment(source, offset, length) {
            if (!source)
                throw new Error('Source is invalid.');
            if (offset < 0)
                throw new Error('Offset is invalid.');
            if (length <= 0)
                throw new Error('Length is invalid.');
            this.m_tSource = source;
            this.m_iOffset = offset;
            this.m_iLength = length;
        }
        Object.defineProperty(FrameworkSegment.prototype, "source", {
            get: function () {
                return this.m_tSource;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FrameworkSegment.prototype, "offset", {
            get: function () {
                return this.m_iOffset;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FrameworkSegment.prototype, "length", {
            get: function () {
                return this.m_iLength;
            },
            enumerable: true,
            configurable: true
        });
        return FrameworkSegment;
    }()); // class FrameworkSegment<T>
    exports.FrameworkSegment = FrameworkSegment;
});

},{}],2:[function(require,module,exports){
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Base"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Base_1 = require("./Base");
    var ConfigManager = /** @class */ (function (_super) {
        __extends(ConfigManager, _super);
        function ConfigManager() {
            var _this = _super.call(this) || this;
            _this.m_pConfigData = new Map();
            _this.m_pLoadAssetCallbacks = {
                success: _this.loadConfigSuccessCallback.bind(_this),
                failure: _this.loadConfigFailureCallback.bind(_this),
                update: _this.loadConfigUpdateCallback.bind(_this),
                dependency: _this.loadConfigDependencyAssetCallback.bind(_this)
            };
            _this.m_pLoadConfigSuccessDelegate = new Base_1.EventHandler();
            _this.m_pLoadConfigFailureDelegate = new Base_1.EventHandler();
            _this.m_pLoadConfigUpdateDelegate = new Base_1.EventHandler();
            _this.m_pLoadConfigDependencyAssetDelegate = new Base_1.EventHandler();
            return _this;
        }
        Object.defineProperty(ConfigManager.prototype, "resourceManager", {
            get: function () {
                return this.m_pResourceManager;
            },
            set: function (value) {
                if (null == value) {
                    throw new Error("Resource manager is invalid.");
                }
                this.m_pResourceManager = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ConfigManager.prototype, "configHelper", {
            get: function () {
                return this.m_pConfigHelper;
            },
            set: function (value) {
                if (null == value)
                    throw new Error("Config helper is invalid.");
                this.m_pConfigHelper = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ConfigManager.prototype, "configCount", {
            get: function () {
                return this.m_pConfigData.size;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ConfigManager.prototype, "loadConfigSuccess", {
            get: function () {
                return this.m_pLoadConfigSuccessDelegate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ConfigManager.prototype, "loadConfigFailure", {
            get: function () {
                return this.m_pLoadConfigFailureDelegate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ConfigManager.prototype, "loadConfigUpdate", {
            get: function () {
                return this.m_pLoadConfigUpdateDelegate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ConfigManager.prototype, "loadConfigDependencyAsset", {
            get: function () {
                return this.m_pLoadConfigDependencyAssetDelegate;
            },
            enumerable: true,
            configurable: true
        });
        ConfigManager.prototype.loadConfig = function (configAssetName, loadType, anyArg1, anyArg2) {
            if (null == this.m_pResourceManager) {
                throw new Error("You must set resource manager first.");
            }
            if (null == this.m_pConfigHelper) {
                throw new Error("You must set config helper first.");
            }
            var priority = 0;
            var userData;
            if (undefined !== anyArg1) {
                if ('number' === typeof anyArg1)
                    priority = anyArg1;
                else
                    userData = anyArg1;
            }
            if (undefined !== anyArg2 && null == userData) {
                userData = anyArg2;
            }
            this.m_pResourceManager.loadAsset(configAssetName, priority, this.m_pLoadAssetCallbacks, { loadType: loadType, userData: userData });
        };
        // NOTE: Any javascript/typescript stream implementation?
        ConfigManager.prototype.parseConfig = function (textOrBuffer, userData) {
            if (!textOrBuffer) {
                throw new Error("Invalid config data detected!");
            }
            if (null == this.m_pConfigHelper) {
                throw new Error("You must set config helper first.");
            }
            userData = userData || null;
            try {
                return this.m_pConfigHelper.parseConfig(textOrBuffer, userData);
            }
            catch (e) {
                throw e;
            }
            return false;
        };
        ConfigManager.prototype.hasConfig = function (configName) {
            return this.getConfig(configName);
        };
        ConfigManager.prototype.addConfig = function (configName, value) {
            if (this.hasConfig(configName)) {
                return false;
            }
            this.m_pConfigData.set(configName, value);
            return true;
        };
        ConfigManager.prototype.removeConfig = function (configName) {
            return this.m_pConfigData.delete(configName);
        };
        ConfigManager.prototype.removeAllConfigs = function () {
            this.m_pConfigData.clear();
        };
        ConfigManager.prototype.getConfig = function (configName) {
            return this.m_pConfigData.get(configName);
        };
        ConfigManager.prototype.update = function (elapsed, realElapsed) {
            // NOOP.
        };
        ConfigManager.prototype.shutdown = function () {
            // NOOP.
        };
        ConfigManager.prototype.loadConfigSuccessCallback = function (configAssetName, configAsset, duration, userData) {
            var v_pInfo = userData;
            if (null == v_pInfo) {
                throw new Error("Load config info is invalid.");
            }
            try {
                if (!this.m_pConfigHelper.loadConfig(configAsset, v_pInfo.loadType, v_pInfo.userData)) {
                    throw new Error("Load config failure in helper, asset name '" + configAssetName + "'");
                }
                if (this.m_pLoadConfigSuccessDelegate.isValid) {
                    this.m_pLoadConfigSuccessDelegate.iter(function (callbackFn) {
                        callbackFn(configAssetName, v_pInfo.loadType, duration, v_pInfo.userData);
                    });
                }
            }
            catch (e) {
                if (this.m_pLoadConfigFailureDelegate.isValid) {
                    this.m_pLoadConfigFailureDelegate.iter(function (callbackFn) {
                        callbackFn(configAssetName, v_pInfo.loadType, e.toString(), v_pInfo.userData);
                    });
                    return;
                }
                throw e;
            }
            finally {
                this.m_pConfigHelper.releaseConfigAsset(configAsset);
            }
        };
        ConfigManager.prototype.loadConfigFailureCallback = function (configAssetName, status, errorMessage, userData) {
            var v_pInfo = userData;
            if (null == v_pInfo) {
                throw new Error("Load config info is invalid.");
            }
            var appendErrorMessage = "Load config failure, asset name '" + configAssetName + "', status '" + status + "', error message '" + errorMessage + "'.";
            if (this.m_pLoadConfigFailureDelegate.isValid) {
                this.m_pLoadConfigFailureDelegate.iter(function (callbackFn) {
                    callbackFn(configAssetName, v_pInfo.loadType, appendErrorMessage, v_pInfo.userData);
                });
                return;
            }
            throw new Error(appendErrorMessage);
        };
        ConfigManager.prototype.loadConfigUpdateCallback = function (configAssetName, progress, userData) {
            var v_pInfo = userData;
            if (null == v_pInfo) {
                throw new Error("Load config info is invalid.");
            }
            if (this.m_pLoadConfigUpdateDelegate.isValid) {
                this.m_pLoadConfigUpdateDelegate.iter(function (callbackFn) {
                    callbackFn(configAssetName, v_pInfo.loadType, progress, v_pInfo.userData);
                });
            }
        };
        ConfigManager.prototype.loadConfigDependencyAssetCallback = function (configAssetName, dependencyAssetName, loadedCount, totalCount, userData) {
            var v_pInfo = userData;
            if (null == v_pInfo) {
                throw new Error("Load config info is invalid.");
            }
            if (this.m_pLoadConfigDependencyAssetDelegate.isValid) {
                this.m_pLoadConfigDependencyAssetDelegate.iter(function (callbackFn) {
                    callbackFn(configAssetName, dependencyAssetName, loadedCount, totalCount, v_pInfo.userData);
                });
            }
        };
        return ConfigManager;
    }(Base_1.FrameworkModule)); // class ConfigManager
    exports.ConfigManager = ConfigManager;
});

},{"./Base":1}],3:[function(require,module,exports){
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Base"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Base_1 = require("./Base");
    var DataNodeManager = /** @class */ (function (_super) {
        __extends(DataNodeManager, _super);
        function DataNodeManager() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DataNodeManager.prototype.update = function (elapsed, realElapsed) {
            throw new Error("Method not implemented.");
        };
        DataNodeManager.prototype.shutdown = function () {
            throw new Error("Method not implemented.");
        };
        return DataNodeManager;
    }(Base_1.FrameworkModule)); // class DataNodeManager
    exports.DataNodeManager = DataNodeManager;
});

},{"./Base":1}],4:[function(require,module,exports){
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Base"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Base_1 = require("./Base");
    var DataTableBase = /** @class */ (function () {
        function DataTableBase(name) {
            name = name || '';
            this.m_sName = name;
        }
        Object.defineProperty(DataTableBase.prototype, "name", {
            get: function () { return this.m_sName; },
            enumerable: true,
            configurable: true
        });
        return DataTableBase;
    }()); // class DataTableBase
    exports.DataTableBase = DataTableBase;
    var DataTable = /** @class */ (function (_super) {
        __extends(DataTable, _super);
        function DataTable(name) {
            var _this = _super.call(this, name) || this;
            _this.m_pDataSet = new Map();
            return _this;
        }
        Object.defineProperty(DataTable.prototype, "minIdDataRow", {
            get: function () { return this.m_pMinIdDataRow; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataTable.prototype, "maxIdDataRow", {
            get: function () { return this.m_pMaxIdDataRow; },
            enumerable: true,
            configurable: true
        });
        DataTable.prototype.hasDataRow = function (pred) {
            var e_1, _a;
            var v_idx;
            if ('number' === typeof pred) {
                v_idx = pred;
            }
            if (undefined != v_idx) {
                return this.m_pDataSet.has(v_idx);
            }
            else {
                try {
                    for (var _b = __values(this.m_pDataSet.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var key = _c.value;
                        var value = this.m_pDataSet.get(key);
                        if (pred(value, key, this.m_pDataSet.values())) {
                            return true;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            return false;
        };
        DataTable.prototype.getDataRow = function (pred) {
            var e_2, _a;
            var v_idx;
            if ('number' === typeof pred) {
                v_idx = pred;
            }
            if (undefined != v_idx) {
                return this.m_pDataSet.get(v_idx);
            }
            if ('function' !== typeof pred) {
                throw new Error("Invalid pred, not a function. It's a type of '" + typeof pred + "'.");
            }
            try {
                for (var _b = __values(this.m_pDataSet.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var key = _c.value;
                    var value = this.m_pDataSet.get(key);
                    if (pred(value, key, this.m_pDataSet.values())) {
                        return value;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return null;
        };
        DataTable.prototype.getDataRows = function (pred, results) {
            var e_3, _a;
            if (!pred)
                throw new Error('Condition predicate is invalid.');
            results = results || [];
            if (results.length)
                results.splice(0, results.length);
            try {
                for (var _b = __values(this.m_pDataSet.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var key = _c.value;
                    var value = this.m_pDataSet.get(key);
                    if (pred(value, key, this.m_pDataSet.values()))
                        results.push(value);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return results;
        };
        DataTable.prototype.getAllDataRows = function (results) {
            var e_4, _a;
            results = results || [];
            if (results.length > 0)
                results.splice(0, results.length);
            try {
                for (var _b = __values(this.m_pDataSet.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var value = _c.value;
                    results.push(value);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return results;
        };
        Object.defineProperty(DataTable.prototype, "count", {
            get: function () {
                return this.m_pDataSet.size;
            },
            enumerable: true,
            configurable: true
        });
        DataTable.prototype.addDataRow = function (rowType, rowSegment) {
            try {
                var v_pDataRow = new rowType();
                if (!v_pDataRow.parseDataRow(rowSegment))
                    return false;
                this.internalAddDataRow(v_pDataRow);
                return true;
            }
            catch (e) {
                if (e instanceof Error) {
                    throw e;
                }
                throw new Error(e);
            }
        };
        DataTable.prototype.shutdown = function () {
            this.m_pDataSet.clear();
        };
        DataTable.prototype.internalAddDataRow = function (dataRow) {
            if (this.hasDataRow(dataRow.id)) {
                throw new Error("Already exist '" + dataRow.id + "' in data table '" + name + "'");
            }
            this.m_pDataSet.set(dataRow.id, dataRow);
            if (!this.m_pMinIdDataRow || this.m_pMinIdDataRow.id > dataRow.id) {
                this.m_pMinIdDataRow = dataRow;
            }
            if (!this.m_pMaxIdDataRow || this.m_pMaxIdDataRow.id < dataRow.id) {
                this.m_pMaxIdDataRow = dataRow;
            }
        };
        return DataTable;
    }(DataTableBase)); // class DataTable
    var DataTableManager = /** @class */ (function (_super) {
        __extends(DataTableManager, _super);
        function DataTableManager() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.m_pDataTable = new Map();
            _this.m_pLoadDataTableSuccessDelegate = new Base_1.EventHandler();
            _this.m_pLoadDataTableFailureDelegate = new Base_1.EventHandler();
            _this.m_pLoadDataTableUpdateDelegate = new Base_1.EventHandler();
            _this.m_pLoadDataTableDependencyAssetDelegate = new Base_1.EventHandler();
            _this.m_pLoadAssetCallbacks = {
                success: _this.loadDataTableSuccessCallback.bind(_this),
                failure: _this.loadDataTableFailureCallback.bind(_this),
                update: _this.loadDataTableUpdateCallback.bind(_this),
                dependency: _this.loadDataTableDependencyAssetCallback.bind(_this)
            };
            return _this;
        }
        Object.defineProperty(DataTableManager.prototype, "resourceManager", {
            get: function () { return this.m_pResourceManager; },
            set: function (value) { this.m_pResourceManager = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataTableManager.prototype, "loadDataTableSuccess", {
            get: function () {
                return this.m_pLoadDataTableSuccessDelegate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataTableManager.prototype, "loadDataTableFailure", {
            get: function () {
                return this.m_pLoadDataTableFailureDelegate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataTableManager.prototype, "loadDataTableUpdate", {
            get: function () {
                return this.m_pLoadDataTableUpdateDelegate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataTableManager.prototype, "LoadDataTableDependencyAsset", {
            get: function () {
                return this.m_pLoadDataTableDependencyAssetDelegate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataTableManager.prototype, "count", {
            get: function () {
                return this.m_pDataTable.size;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataTableManager.prototype, "dataTableHelper", {
            get: function () {
                return this.m_pDataTableHelper;
            },
            set: function (value) {
                this.m_pDataTableHelper = value;
            },
            enumerable: true,
            configurable: true
        });
        DataTableManager.prototype.loadDataTable = function (dataTableAssetName, loadType, anyArg1, userData) {
            if (!this.m_pResourceManager)
                throw new Error("You must set resource manager first.");
            if (!this.m_pDataTableHelper)
                throw new Error("You must set data table helper first.");
            var priority = 0;
            if ('number' === typeof anyArg1) {
                priority = anyArg1;
            }
            else if (undefined != anyArg1 && undefined == userData) {
                userData = anyArg1;
            }
            userData = userData || null;
            var v_pInfo = {
                loadType: loadType,
                userData: userData
            };
            this.m_pResourceManager.loadAsset(dataTableAssetName, priority, this.m_pLoadAssetCallbacks, v_pInfo);
        };
        DataTableManager.prototype.hasDataTable = function (dataTableAssetName) {
            return this.internalHasDataTable(dataTableAssetName);
        };
        DataTableManager.prototype.getDataTable = function (dataTableAssetName) {
            return this.internalGetDataTable(dataTableAssetName || '');
        };
        DataTableManager.prototype.getAllDataTables = function (results) {
            var e_5, _a;
            var v_pRet = results || [];
            try {
                for (var _b = __values(this.m_pDataTable.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var dt = _c.value;
                    v_pRet.push(dt);
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
            return v_pRet;
        };
        DataTableManager.prototype.createDataTable = function (type, anyArg1, anyArg2) {
            var content;
            var name;
            if (undefined !== anyArg2) {
                content = anyArg2;
            }
            if (content) {
                name = anyArg1;
            }
            var v_sFullName;
            // if (name) {
            //     v_sFullName = `${type.name}.${name}`;
            // } else {
            //     v_sFullName = type.name;
            // }
            v_sFullName = name || type.name;
            var v_pDataTable = new DataTable();
            this.internalCreateDataTable(type, v_pDataTable, content);
            this.m_pDataTable.set(v_sFullName, v_pDataTable);
            return v_pDataTable;
        };
        DataTableManager.prototype.destroyDataTable = function (name) {
            return this.internalDestroyDataTable(name || '');
        };
        DataTableManager.prototype.internalHasDataTable = function (name) {
            return this.m_pDataTable.has(name);
        };
        DataTableManager.prototype.internalGetDataTable = function (name) {
            return this.m_pDataTable.get(name) || null;
        };
        DataTableManager.prototype.internalCreateDataTable = function (rowType, dataTable, content) {
            var e_6, _a;
            var v_pIterator;
            try {
                v_pIterator = this.m_pDataTableHelper.getDataRowSegments(content);
            }
            catch (e) {
                if (e instanceof Error) {
                    throw e;
                }
                throw new Error("Can not get data row segments with exception: '" + e + "'.");
            }
            if (!v_pIterator) {
                throw new Error('Data row segments is invalid.');
            }
            try {
                for (var v_pIterator_1 = __values(v_pIterator), v_pIterator_1_1 = v_pIterator_1.next(); !v_pIterator_1_1.done; v_pIterator_1_1 = v_pIterator_1.next()) {
                    var dataRowSegment = v_pIterator_1_1.value;
                    if (!dataTable.addDataRow(rowType, dataRowSegment))
                        throw new Error('Add data row failure.');
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (v_pIterator_1_1 && !v_pIterator_1_1.done && (_a = v_pIterator_1.return)) _a.call(v_pIterator_1);
                }
                finally { if (e_6) throw e_6.error; }
            }
        };
        DataTableManager.prototype.internalDestroyDataTable = function (name) {
            var v_pDataTable = this.m_pDataTable.get(name);
            if (v_pDataTable) {
                v_pDataTable.shutdown();
                return this.m_pDataTable.delete(name);
            }
            return false;
        };
        DataTableManager.prototype.update = function (elapsed, realElapsed) {
            // NOOP.
        };
        DataTableManager.prototype.shutdown = function () {
            var e_7, _a;
            try {
                for (var _b = __values(this.m_pDataTable.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var dt = _c.value;
                    dt.shutdown();
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_7) throw e_7.error; }
            }
            this.m_pDataTable.clear();
        };
        DataTableManager.prototype.loadDataTableSuccessCallback = function (dataTableAssetName, dataTableAsset, duration, userData) {
            var v_pInfo = userData;
            if (!v_pInfo)
                throw new Error("Load data table info is invalid.");
            try {
                if (!this.m_pDataTableHelper.loadDataTable(dataTableAsset, v_pInfo.loadType, v_pInfo.userData)) {
                    throw new Error("Load data table failure in helper, asset name '" + dataTableAssetName + "'.");
                }
                if (this.m_pLoadDataTableSuccessDelegate.isValid) {
                    this.m_pLoadDataTableSuccessDelegate.iter(function (callbackFn) {
                        callbackFn(dataTableAssetName, v_pInfo.loadType, duration, v_pInfo.userData);
                    });
                }
            }
            catch (e) {
                if (e instanceof Error && this.m_pLoadDataTableFailureDelegate.isValid) {
                    this.m_pLoadDataTableFailureDelegate.iter(function (callbackFn) {
                        callbackFn(dataTableAssetName, v_pInfo.loadType, e.message, v_pInfo.userData);
                    });
                    return;
                }
                throw e;
            }
            finally {
                // release
                this.m_pDataTableHelper.releaseDataTableAsset(dataTableAsset);
            }
        };
        DataTableManager.prototype.loadDataTableFailureCallback = function (dataTableAssetName, status, errorMessage, userData) {
            var v_pInfo = userData;
            if (!v_pInfo)
                throw new Error("Load data table info is invalid.");
            var v_sErrorMessage = "Load data table failure, asset name '" + dataTableAssetName + "', status '" + status + "', error message '" + errorMessage + "'.";
            if (this.m_pLoadDataTableFailureDelegate.isValid) {
                this.m_pLoadDataTableFailureDelegate.iter(function (callbackFn) {
                    callbackFn(dataTableAssetName, v_pInfo.loadType, v_sErrorMessage, v_pInfo.userData);
                });
                return;
            }
            throw new Error(v_sErrorMessage);
        };
        DataTableManager.prototype.loadDataTableUpdateCallback = function (dataTableAssetName, progress, userData) {
            var v_pInfo = userData;
            if (!v_pInfo)
                throw new Error("Load data table info is invalid.");
            if (this.m_pLoadDataTableUpdateDelegate.isValid) {
                this.m_pLoadDataTableUpdateDelegate.iter(function (callbackFn) {
                    callbackFn(dataTableAssetName, v_pInfo.loadType, progress, v_pInfo.userData);
                });
            }
        };
        DataTableManager.prototype.loadDataTableDependencyAssetCallback = function (dataTableAssetName, dependencyAssetName, loadedCount, totalCount, userData) {
            var v_pInfo = userData;
            if (!v_pInfo)
                throw new Error("Load data table info is invalid.");
            if (this.m_pLoadDataTableDependencyAssetDelegate.isValid) {
                this.m_pLoadDataTableDependencyAssetDelegate.iter(function (callbackFn) {
                    callbackFn(dataTableAssetName, dependencyAssetName, loadedCount, totalCount, v_pInfo.userData);
                });
            }
        };
        return DataTableManager;
    }(Base_1.FrameworkModule)); // class DataTableManager
    exports.DataTableManager = DataTableManager;
});

},{"./Base":1}],5:[function(require,module,exports){
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Base", "./ObjectPool"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Base_1 = require("./Base");
    var ObjectPool_1 = require("./ObjectPool");
    var EntityStatus;
    (function (EntityStatus) {
        EntityStatus[EntityStatus["WillInit"] = 0] = "WillInit";
        EntityStatus[EntityStatus["Inited"] = 1] = "Inited";
        EntityStatus[EntityStatus["WillShow"] = 2] = "WillShow";
        EntityStatus[EntityStatus["Showed"] = 3] = "Showed";
        EntityStatus[EntityStatus["WillHide"] = 4] = "WillHide";
        EntityStatus[EntityStatus["Hidden"] = 5] = "Hidden";
        EntityStatus[EntityStatus["WillRecycle"] = 6] = "WillRecycle";
        EntityStatus[EntityStatus["Recycled"] = 7] = "Recycled";
    })(EntityStatus || (EntityStatus = {})); // class EntityStatus
    var EntityInfo = /** @class */ (function () {
        function EntityInfo(entity) {
            this.m_pStatus = EntityStatus.WillInit;
            if (!entity)
                throw new Error('Entity is invalid.');
            this.m_pEntity = entity;
        }
        Object.defineProperty(EntityInfo.prototype, "entity", {
            get: function () { return this.m_pEntity; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntityInfo.prototype, "status", {
            get: function () { return this.m_pStatus; },
            set: function (value) { this.m_pStatus = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntityInfo.prototype, "parentEntity", {
            get: function () { return this.m_pParentEntity; },
            set: function (value) { this.m_pParentEntity = value; },
            enumerable: true,
            configurable: true
        });
        EntityInfo.prototype.getChildEntities = function (results) {
            results = results || [];
            results.splice(0, results.length);
            if (this.m_pChildEntities) {
                for (var i = 0; i < this.m_pChildEntities.length; i++) {
                    results.push(this.m_pChildEntities[i]);
                }
            }
            return results;
        };
        EntityInfo.prototype.addChildEntity = function (childEntity) {
            this.m_pChildEntities = this.m_pChildEntities || [];
            var idx = this.m_pChildEntities.indexOf(childEntity);
            if (-1 < idx)
                throw new Error('Can not add child entity which is already exists.');
            this.m_pChildEntities.push(childEntity);
        };
        EntityInfo.prototype.removeChildEntity = function (childEntity) {
            if (!this.m_pChildEntities)
                return;
            var idx = this.m_pChildEntities.indexOf(childEntity);
            if (-1 < idx)
                this.m_pChildEntities.splice(idx, 1);
            else
                throw new Error('Can not remove child entity which is not exist.');
        };
        return EntityInfo;
    }()); // class EntityInfo
    var EntityGroup = /** @class */ (function () {
        function EntityGroup(name, instanceAutoReleaseInterval, instanceCapacity, instanceExpireTime, instancePriority, entityGroupHelper, objectPoolManager) {
            this.m_pEntities = new Set();
            if (!name)
                throw new Error('Entity group name is invalid.');
            if (!entityGroupHelper)
                throw new Error('Entity group helper is invalid.');
            this.m_sName = name;
            this.m_pEntityGroupHelper = entityGroupHelper;
            this.m_pInstancePool = objectPoolManager.createSingleSpawnObjectPool({
                name: "Entity Instance Pool (" + name + ")",
                capacity: instanceCapacity,
                expireTime: instanceExpireTime,
                priority: instancePriority
            });
            this.m_pEntities = new Set();
        }
        Object.defineProperty(EntityGroup.prototype, "name", {
            get: function () { return this.m_sName; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntityGroup.prototype, "entityCount", {
            get: function () { return this.m_pEntities.size; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntityGroup.prototype, "instanceAutoReleaseInterval", {
            get: function () { return this.m_fInstanceAutoReleaseInterval; },
            set: function (value) {
                this.m_fInstanceAutoReleaseInterval = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntityGroup.prototype, "instanceCapacity", {
            get: function () { return this.m_fInstanceCapacity; },
            set: function (value) {
                this.m_fInstanceCapacity = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntityGroup.prototype, "instanceExpireTime", {
            get: function () { return this.m_fInstanceExpireTime; },
            set: function (value) {
                this.m_fInstanceExpireTime = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntityGroup.prototype, "instancePriority", {
            get: function () { return this.m_fInstancePriority; },
            set: function (value) {
                this.m_fInstancePriority = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntityGroup.prototype, "helper", {
            get: function () { return this.m_pEntityGroupHelper; },
            enumerable: true,
            configurable: true
        });
        EntityGroup.prototype.update = function (elapsed, realElapsed) {
            var e_1, _a;
            try {
                for (var _b = __values(this.m_pEntities.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var entity = _c.value;
                    entity.onUpdate(elapsed, realElapsed);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        EntityGroup.prototype.hasEntity = function (entityIdOrAssetName) {
            var e_2, _a, e_3, _b;
            if ('number' === typeof entityIdOrAssetName) {
                try {
                    for (var _c = __values(this.m_pEntities.values()), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var entity = _d.value;
                        if (entity.id == entityIdOrAssetName)
                            return true;
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            else {
                if (!entityIdOrAssetName)
                    throw new Error('Entity asset name is invalid.');
                try {
                    for (var _e = __values(this.m_pEntities.values()), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var entity = _f.value;
                        if (entity.entityAssetName == entityIdOrAssetName)
                            return true;
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
            return false;
        };
        EntityGroup.prototype.getEntity = function (entityIdOrAssetName) {
            var e_4, _a, e_5, _b;
            if ('number' === typeof entityIdOrAssetName) {
                try {
                    for (var _c = __values(this.m_pEntities.values()), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var entity = _d.value;
                        if (entity.id == entityIdOrAssetName)
                            return entity;
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
            else {
                if (!entityIdOrAssetName)
                    throw new Error('Entity asset name is invalid.');
                try {
                    for (var _e = __values(this.m_pEntities.values()), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var entity = _f.value;
                        if (entity.entityAssetName == entityIdOrAssetName)
                            return entity;
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
            }
            return null;
        };
        EntityGroup.prototype.getEntities = function (entityAssetName, results) {
            var e_6, _a;
            if (!entityAssetName)
                throw new Error('Entity asset name is invalid.');
            results = results || [];
            results.splice(0, results.length);
            try {
                for (var _b = __values(this.m_pEntities.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var entity = _c.value;
                    if (entity.entityAssetName == entityAssetName)
                        results.push(entity);
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_6) throw e_6.error; }
            }
            return results;
        };
        EntityGroup.prototype.getAllEntities = function (results) {
            var e_7, _a;
            results = results || [];
            results.splice(0, results.length);
            try {
                for (var _b = __values(this.m_pEntities.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var entity = _c.value;
                    results.push(entity);
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_7) throw e_7.error; }
            }
            return results;
        };
        EntityGroup.prototype.addEntity = function (entity) {
            this.m_pEntities.add(entity);
        };
        EntityGroup.prototype.removeEntity = function (entity) {
            this.m_pEntities.delete(entity);
        };
        EntityGroup.prototype.registerEntityInstanceObject = function (entityInstanceObject, spawn) {
            this.m_pInstancePool.register(entityInstanceObject, spawn);
        };
        EntityGroup.prototype.spawnEntityInstanceObject = function (name) {
            return this.m_pInstancePool.spawn(name);
        };
        EntityGroup.prototype.unspawnEntity = function (entity) {
            this.m_pInstancePool.unspawnByTarget(entity.handle);
        };
        EntityGroup.prototype.setEntityInstanceLocked = function (entityInstance, locked) {
            if (!entityInstance)
                throw new Error('Entity instance is invalid.');
            this.m_pInstancePool.setLockedByTarget(entityInstance, locked);
        };
        EntityGroup.prototype.setEntityInstancePriority = function (entityInstance, priority) {
            if (!entityInstance)
                throw new Error('Entity instance is invalid.');
            this.m_pInstancePool.setPriorityByTarget(entityInstance, priority);
        };
        return EntityGroup;
    }()); // class EntityGroup
    /**
     * Entity management module.
     */
    var EntityManager = /** @class */ (function (_super) {
        __extends(EntityManager, _super);
        function EntityManager() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.m_pEntityInfos = new Map();
            _this.m_pEntityGroups = new Map();
            _this.m_pEntitiesBeingLoaded = new Map();
            _this.m_pEntitiesToReleaseOnLoad = new Set();
            _this.m_pRecycleQueue = new Set();
            _this.m_pShowEntitySuccessDelegate = new Base_1.EventHandler();
            _this.m_pShowEntityFailureDelegate = new Base_1.EventHandler();
            _this.m_pShowEntityUpdateDelegate = new Base_1.EventHandler();
            _this.m_pShowEntityDependencyAssetDelegate = new Base_1.EventHandler();
            _this.m_pHideEntityCompleteDelegate = new Base_1.EventHandler();
            _this.m_iSerial = 0;
            _this.m_pLoadAssetCallbacks = {
                success: _this.loadEntitySuccessCallback.bind(_this),
                failure: _this.loadEntityFailureCallback.bind(_this),
                update: _this.loadEntityUpdateCallback.bind(_this),
                dependency: _this.loadEntityDependencyAssetCallback.bind(_this)
            };
            return _this;
        }
        Object.defineProperty(EntityManager.prototype, "entityCount", {
            get: function () {
                return this.m_pEntityInfos.size;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntityManager.prototype, "entityGroupCount", {
            get: function () {
                return this.m_pEntityGroups.size;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntityManager.prototype, "showEntitySuccess", {
            get: function () { return this.m_pShowEntitySuccessDelegate; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntityManager.prototype, "showEntityFailure", {
            get: function () { return this.m_pShowEntityFailureDelegate; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntityManager.prototype, "showEntityUpdate", {
            get: function () { return this.m_pShowEntityUpdateDelegate; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntityManager.prototype, "showEntityDependencyAsset", {
            get: function () { return this.m_pShowEntityDependencyAssetDelegate; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntityManager.prototype, "hideEntityComplete", {
            get: function () { return this.m_pHideEntityCompleteDelegate; },
            enumerable: true,
            configurable: true
        });
        EntityManager.prototype.update = function (elapsed, realElapsed) {
            var e_8, _a, e_9, _b;
            try {
                for (var _c = __values(this.m_pRecycleQueue.values()), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var info = _d.value;
                    var v_pEntity = info.entity;
                    var v_pEntityGroup = v_pEntity.entityGroup;
                    if (!v_pEntityGroup)
                        throw new Error('Entity group is invalid.');
                    info.status = EntityStatus.WillRecycle;
                    v_pEntity.onRecycle();
                    info.status = EntityStatus.Recycled;
                    v_pEntityGroup.unspawnEntity(v_pEntity);
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_8) throw e_8.error; }
            }
            this.m_pRecycleQueue.clear();
            try {
                for (var _e = __values(this.m_pEntityGroups.values()), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var group = _f.value;
                    group.update(elapsed, realElapsed);
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_9) throw e_9.error; }
            }
        };
        EntityManager.prototype.shutdown = function () {
            this.hideAllLoadedEntities();
            this.m_pEntityGroups.clear();
            this.m_pEntitiesBeingLoaded.clear();
            this.m_pEntitiesToReleaseOnLoad.clear();
            this.m_pRecycleQueue.clear();
        };
        Object.defineProperty(EntityManager.prototype, "resourceManager", {
            get: function () { return this.m_pResourceManager; },
            set: function (value) {
                this.m_pResourceManager = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntityManager.prototype, "objectPoolManager", {
            get: function () { return this.m_pObjectPoolManager; },
            set: function (value) { this.m_pObjectPoolManager = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntityManager.prototype, "entityHelper", {
            get: function () { return this.m_pEntityHelper; },
            set: function (value) {
                this.m_pEntityHelper = value;
            },
            enumerable: true,
            configurable: true
        });
        EntityManager.prototype.hasEntityGroup = function (entityGroupName) {
            if (!entityGroupName)
                throw new Error('Entity group name is invalid.');
            return this.m_pEntityGroups.has(entityGroupName);
        };
        EntityManager.prototype.getEntityGroup = function (entityGroupName) {
            if (!entityGroupName)
                throw new Error('Entity group name is invalid.');
            return this.m_pEntityGroups.get(entityGroupName) || null;
        };
        EntityManager.prototype.getAllEntityGroups = function (results) {
            var e_10, _a;
            results = results || [];
            results.splice(0, results.length);
            try {
                for (var _b = __values(this.m_pEntityGroups.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var group = _c.value;
                    results.push(group);
                }
            }
            catch (e_10_1) { e_10 = { error: e_10_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_10) throw e_10.error; }
            }
            return results;
        };
        EntityManager.prototype.addEntityGroup = function (entityGroupName, instanceAutoReleaseInterval, instanceCapacity, instanceExpireTime, instancePriority, entityGroupHelper) {
            if (!entityGroupName)
                throw new Error('Entity group name is invalid.');
            if (!entityGroupHelper)
                throw new Error('Entity group helper is invalid.');
            if (!this.m_pObjectPoolManager)
                throw new Error('You must set object pool manager first.');
            if (this.hasEntityGroup(entityGroupName))
                return false;
            this.m_pEntityGroups.set(entityGroupName, new EntityGroup(entityGroupName, instanceAutoReleaseInterval, instanceCapacity, instanceExpireTime, instancePriority, entityGroupHelper, this.m_pObjectPoolManager));
            return true;
        };
        EntityManager.prototype.hasEntity = function (entityIdOrAssetName) {
            var e_11, _a;
            if ('number' === typeof entityIdOrAssetName) {
                return this.m_pEntityInfos.get(entityIdOrAssetName) ? true : false;
            }
            else {
                if (!entityIdOrAssetName)
                    throw new Error('Entity asset name is invalid.');
                try {
                    for (var _b = __values(this.m_pEntityInfos.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var info = _c.value;
                        if (info.entity.entityAssetName == entityIdOrAssetName)
                            return true;
                    }
                }
                catch (e_11_1) { e_11 = { error: e_11_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_11) throw e_11.error; }
                }
            }
            return false;
        };
        EntityManager.prototype.getEntity = function (entityIdOrAssetName) {
            var e_12, _a;
            if ('number' === typeof entityIdOrAssetName) {
                var v_pInfo = this.m_pEntityInfos.get(entityIdOrAssetName);
                if (v_pInfo) {
                    return v_pInfo.entity;
                }
            }
            else {
                if (!entityIdOrAssetName)
                    throw new Error('Entity asset name is invalid.');
                try {
                    for (var _b = __values(this.m_pEntityInfos.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var info = _c.value;
                        if (info.entity.entityAssetName == entityIdOrAssetName)
                            return info.entity;
                    }
                }
                catch (e_12_1) { e_12 = { error: e_12_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_12) throw e_12.error; }
                }
            }
            return null;
        };
        EntityManager.prototype.getEntities = function (entityAssetName, results) {
            var e_13, _a;
            results = results || [];
            results.splice(0, results.length);
            if (!entityAssetName)
                throw new Error('Entity asset name is invalid.');
            try {
                for (var _b = __values(this.m_pEntityInfos.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var info = _c.value;
                    if (info.entity.entityAssetName == entityAssetName)
                        results.push(info.entity);
                }
            }
            catch (e_13_1) { e_13 = { error: e_13_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_13) throw e_13.error; }
            }
            return results;
        };
        EntityManager.prototype.getAllLoadedEntities = function (results) {
            var e_14, _a;
            results = results || [];
            results.splice(0, results.length);
            try {
                for (var _b = __values(this.m_pEntityInfos.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var info = _c.value;
                    results.push(info.entity);
                }
            }
            catch (e_14_1) { e_14 = { error: e_14_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_14) throw e_14.error; }
            }
            return results;
        };
        EntityManager.prototype.getAllLoadingEntityIds = function (results) {
            var e_15, _a;
            results = results || [];
            results.splice(0, results.length);
            try {
                for (var _b = __values(this.m_pEntitiesBeingLoaded.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var key = _c.value;
                    results.push(key);
                }
            }
            catch (e_15_1) { e_15 = { error: e_15_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_15) throw e_15.error; }
            }
            return results;
        };
        EntityManager.prototype.isLoadingEntity = function (entityId) {
            return this.m_pEntitiesBeingLoaded.has(entityId);
        };
        EntityManager.prototype.isValidEntity = function (entity) {
            if (!entity)
                return false;
            return this.hasEntity(entity.id);
        };
        EntityManager.prototype.showEntity = function (entityId, entityAssetName, entityGroupName, anyArg1, anyArg2) {
            var priority = 0;
            var userData;
            if ('number' === typeof anyArg1) {
                priority = anyArg1;
            }
            else if (undefined != anyArg1 && undefined == anyArg2) {
                userData = anyArg1;
            }
            if (undefined != anyArg2)
                userData = anyArg2;
            if (!this.m_pResourceManager)
                throw new Error('You must set resource manager first.');
            if (!this.m_pEntityHelper)
                throw new Error('You must set entity helper first.');
            if (!entityAssetName)
                throw new Error('Entity asset name is invalid.');
            if (!entityGroupName)
                throw new Error('Entity group name is invalid.');
            if (this.m_pEntityInfos.has(entityId))
                throw new Error("Entity id '" + entityId + "' is already exists.");
            if (this.isLoadingEntity(entityId))
                throw new Error("Entity '" + entityId + "' is already being loaded.");
            var v_pEntityGroup = this.getEntityGroup(entityGroupName);
            if (!v_pEntityGroup)
                throw new Error("Entity group '" + entityGroupName + "' is not exist.");
            var v_pEntityInstanceObject = v_pEntityGroup.spawnEntityInstanceObject(entityAssetName);
            // if (this.m_pInstancePool.has(entityAssetName)) {
            //     let v_pInstanceObjects: EntityInstanceObject[] | undefined = this.m_pInstancePool.get(entityAssetName);
            //     if (v_pInstanceObjects && v_pInstanceObjects.length > 0) {
            //         for (const instanceObject of v_pInstanceObjects) {
            //             if (instanceObject.isValid && !instanceObject.spawn) {
            //                 v_pEntityInstanceObject = instanceObject;
            //                 instanceObject.spawn = true;
            //                 break;
            //             }
            //         }
            //     }
            // }
            if (!v_pEntityInstanceObject) {
                var v_iSerialId = this.m_iSerial++;
                this.m_pEntitiesBeingLoaded.set(entityId, v_iSerialId);
                this.m_pResourceManager.loadAsset(entityAssetName, priority, this.m_pLoadAssetCallbacks, {
                    serialId: v_iSerialId,
                    entityId: entityId,
                    entityGroup: v_pEntityGroup,
                    userData: userData
                });
                return;
            }
            this.internalShowEntity(entityId, entityAssetName, v_pEntityGroup, v_pEntityInstanceObject.target, false, 0, userData);
        };
        EntityManager.prototype.hideEntity = function (anyArg1, userData) {
            userData = userData || null;
            var entityId;
            if ('number' === typeof anyArg1) {
                entityId = anyArg1;
            }
            else {
                if (!anyArg1)
                    throw new Error('Entity is invalid.');
                entityId = anyArg1.id;
            }
            if (this.isLoadingEntity(entityId)) {
                if (!this.m_pEntitiesBeingLoaded.has(entityId))
                    throw new Error("Can not find entity '" + entityId + "'");
                var v_iSerialId = this.m_pEntitiesBeingLoaded.get(entityId) || 0;
                this.m_pEntitiesToReleaseOnLoad.add(v_iSerialId);
                this.m_pEntitiesBeingLoaded.delete(entityId);
                return;
            }
            var v_pInfo = this.getEntityInfo(entityId);
            if (!v_pInfo) {
                throw new Error("Can not find entity info '" + entityId + "'");
            }
            this.internalHideEntity(v_pInfo, userData);
        };
        EntityManager.prototype.hideAllLoadedEntities = function (userData) {
            var e_16, _a;
            userData = userData || null;
            try {
                for (var _b = __values(this.m_pEntityInfos.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var info = _c.value;
                    this.internalHideEntity(info, userData);
                }
            }
            catch (e_16_1) { e_16 = { error: e_16_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_16) throw e_16.error; }
            }
        };
        EntityManager.prototype.hideAllLoadingEntities = function () {
            var e_17, _a;
            try {
                for (var _b = __values(this.m_pEntitiesBeingLoaded.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var serialId = _c.value;
                    this.m_pEntitiesToReleaseOnLoad.add(serialId);
                }
            }
            catch (e_17_1) { e_17 = { error: e_17_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_17) throw e_17.error; }
            }
            this.m_pEntitiesBeingLoaded.clear();
        };
        EntityManager.prototype.getParentEntity = function (anyArg1) {
            var v_iChildEntityId;
            if ('number' === typeof anyArg1) {
                v_iChildEntityId = anyArg1;
            }
            else {
                if (!anyArg1)
                    throw new Error('Child entity is invalid.');
                v_iChildEntityId = anyArg1.id;
            }
            var v_pChildEntityInfo = this.getEntityInfo(v_iChildEntityId);
            if (!v_pChildEntityInfo)
                throw new Error("Can not find child entity '" + v_iChildEntityId + "'");
            return v_pChildEntityInfo.parentEntity;
        };
        EntityManager.prototype.getChildEntities = function (parentEntityId, results) {
            results = results || [];
            results.splice(0, results.length);
            var v_pInfo = this.getEntityInfo(parentEntityId);
            if (!v_pInfo)
                throw new Error("Can not find parent entity '" + parentEntityId + "'");
            return v_pInfo.getChildEntities(results);
        };
        EntityManager.prototype.attachEntity = function (childEntityOrId, parentEntityOrId, userData) {
            userData = userData || null;
            var childEntityId;
            var parentEntityId;
            if ('number' === typeof childEntityOrId) {
                childEntityId = childEntityOrId;
            }
            else {
                if (!childEntityOrId)
                    throw new Error('Child entity is invalid.');
                childEntityId = childEntityOrId.id;
            }
            if ('number' === typeof parentEntityOrId) {
                parentEntityId = parentEntityOrId;
            }
            else {
                if (!parentEntityOrId)
                    throw new Error('Parent entity is invalid.');
                parentEntityId = parentEntityOrId.id;
            }
            if (childEntityId == parentEntityId)
                throw new Error("Can not attach entity when child entity id equals to parent entity id '" + parentEntityId + "'");
            var v_pChildEntityInfo = this.getEntityInfo(childEntityId);
            if (!v_pChildEntityInfo)
                throw new Error("Can not find child entity '" + childEntityId + "'");
            if (v_pChildEntityInfo.status >= EntityStatus.WillHide)
                throw new Error("Can not attach entity when child entity status is '" + v_pChildEntityInfo.status + "'");
            var v_pParentEntityInfo = this.getEntityInfo(parentEntityId);
            if (!v_pParentEntityInfo)
                throw new Error("Can not find parent entity '" + parentEntityId + "'");
            if (v_pParentEntityInfo.status >= EntityStatus.WillHide)
                throw new Error("Can not attch entity when parent entity status is '" + v_pParentEntityInfo.status + "'");
            var v_pChildEntity = v_pChildEntityInfo.entity;
            var v_pParentEntity = v_pParentEntityInfo.entity;
            this.detachEntity(v_pChildEntity.id, userData);
            v_pChildEntityInfo.parentEntity = v_pParentEntity;
            v_pParentEntityInfo.addChildEntity(v_pChildEntity);
            v_pParentEntity.onAttached(v_pChildEntity, userData);
            v_pChildEntity.onAttachTo(v_pParentEntity, userData);
        };
        EntityManager.prototype.detachEntity = function (childEntityOrId, userData) {
            userData = userData || null;
            var childEntityId;
            if ('number' === typeof childEntityOrId) {
                childEntityId = childEntityOrId;
            }
            else {
                if (!childEntityOrId)
                    throw new Error('Child entity is invalid.');
                childEntityId = childEntityOrId.id;
            }
            var v_pChildEntityInfo = this.getEntityInfo(childEntityId);
            if (!v_pChildEntityInfo)
                throw new Error("Can not find child entity '" + childEntityId + "'");
            var v_pParentEntity = v_pChildEntityInfo.parentEntity;
            if (!v_pParentEntity)
                return;
            var v_pParentEntityInfo = this.getEntityInfo(v_pParentEntity.id);
            if (!v_pParentEntityInfo)
                throw new Error("Can not find parent entity '" + v_pParentEntity.id + "'");
            var v_pChildEntity = v_pChildEntityInfo.entity;
            v_pChildEntityInfo.parentEntity = null;
            v_pParentEntityInfo.removeChildEntity(v_pChildEntity);
            v_pParentEntity.onDetached(v_pChildEntity, userData);
            v_pChildEntity.onDetachFrom(v_pParentEntity, userData);
        };
        EntityManager.prototype.detachChildEntities = function (parentEntityOrId, userData) {
            var _this = this;
            var v_pUserData = userData || null;
            var parentEntityId;
            if ('number' === typeof parentEntityOrId) {
                parentEntityId = parentEntityOrId;
            }
            else {
                if (!parentEntityOrId)
                    throw new Error('Parent entity is invalid.');
                parentEntityId = parentEntityOrId.id;
            }
            var v_pParentEntityInfo = this.getEntityInfo(parentEntityId);
            if (!v_pParentEntityInfo)
                throw new Error("Can not find parent entity '" + parentEntityId + "'");
            var v_pChildEntities = v_pParentEntityInfo.getChildEntities();
            v_pChildEntities.forEach(function (entity) {
                _this.detachEntity(entity.id, v_pUserData);
            });
        };
        EntityManager.prototype.getEntityInfo = function (entityId) {
            return this.m_pEntityInfos.get(entityId) || null;
        };
        EntityManager.prototype.internalShowEntity = function (entityId, entityAssetName, entityGroup, entityInstance, isNewInstance, duration, userData) {
            try {
                var v_pEntity_1 = this.m_pEntityHelper.createEntity(entityInstance, entityGroup, userData);
                if (!v_pEntity_1)
                    throw new Error('Can not create entity in helper.');
                var v_pEntityInfo = new EntityInfo(v_pEntity_1);
                this.m_pEntityInfos.set(entityId, v_pEntityInfo);
                v_pEntityInfo.status = EntityStatus.WillInit;
                v_pEntity_1.onInit(entityId, entityAssetName, entityGroup, isNewInstance, userData);
                v_pEntityInfo.status = EntityStatus.Inited;
                entityGroup.addEntity(v_pEntity_1);
                v_pEntityInfo.status = EntityStatus.WillShow;
                v_pEntity_1.onShow(userData);
                v_pEntityInfo.status = EntityStatus.Showed;
                if (this.m_pShowEntitySuccessDelegate.isValid) {
                    this.m_pShowEntitySuccessDelegate.iter(function (callbackFn) {
                        callbackFn(v_pEntity_1, duration, userData);
                    });
                }
            }
            catch (e) {
                if (e instanceof Error && this.m_pShowEntityFailureDelegate.isValid) {
                    this.m_pShowEntityFailureDelegate.iter(function (callbackFn) {
                        callbackFn(entityId, entityAssetName, entityGroup.name, e.message, userData);
                    });
                    return;
                }
                throw e;
            }
        };
        EntityManager.prototype.internalHideEntity = function (entityInfo, userData) {
            var _this = this;
            var v_pEntity = entityInfo.entity;
            var v_pChildEntities = entityInfo.getChildEntities();
            v_pChildEntities.forEach(function (value) {
                _this.hideEntity(value, userData);
            });
            if (entityInfo.status == EntityStatus.Hidden || entityInfo.status == EntityStatus.WillHide) {
                return;
            }
            this.detachEntity(v_pEntity.id, userData);
            entityInfo.status = EntityStatus.WillHide;
            v_pEntity.onHide(userData);
            entityInfo.status = EntityStatus.Hidden;
            var v_pEntityGroup = v_pEntity.entityGroup;
            if (!v_pEntityGroup)
                throw new Error('Entity group is invalid.');
            v_pEntityGroup.removeEntity(v_pEntity);
            var v_bValidInfo = this.m_pEntityInfos.has(v_pEntity.id);
            this.m_pEntityInfos.delete(v_pEntity.id);
            if (!v_bValidInfo) {
                throw new Error("Entity info id '" + v_pEntity.id + "' is unmanaged.");
            }
            if (this.m_pHideEntityCompleteDelegate.isValid) {
                this.m_pHideEntityCompleteDelegate.iter(function (callbackFn) {
                    callbackFn(v_pEntity.id, v_pEntity.entityAssetName, v_pEntityGroup, userData);
                });
            }
            this.m_pRecycleQueue.add(entityInfo);
        };
        EntityManager.prototype.loadEntitySuccessCallback = function (entityAssetName, entityAsset, duration, userData) {
            var v_pShowEntityInfo = userData;
            if (!v_pShowEntityInfo)
                throw new Error('Show entity is invalid.');
            this.m_pEntitiesBeingLoaded.delete(v_pShowEntityInfo.entityId);
            if (this.m_pEntitiesToReleaseOnLoad.has(v_pShowEntityInfo.serialId)) {
                if (console)
                    console.log("Release entity '" + v_pShowEntityInfo.entityId + "' (serial id '" + v_pShowEntityInfo.serialId + "') on loading success.");
                this.m_pEntitiesToReleaseOnLoad.delete(v_pShowEntityInfo.serialId);
                this.m_pEntityHelper.releaseEntity(entityAsset, null);
                return;
            }
            var v_pEntityInstanceObject = EntityInstanceObject.create(entityAssetName, entityAsset, this.m_pEntityHelper.instantiateEntity(entityAsset), this.m_pEntityHelper);
            v_pShowEntityInfo.entityGroup.registerEntityInstanceObject(v_pEntityInstanceObject, true);
            // Register to pool and mark spawn
            // if (!this.m_pInstancePool.has(entityAssetName))
            //     this.m_pInstancePool.set(entityAssetName, []);
            // let v_pEntityInstanceObjects: EntityInstanceObject[] | undefined = this.m_pInstancePool.get(entityAssetName);
            // if (v_pEntityInstanceObjects /*&& v_pEntityInstanceObjects.length < v_pShowEntityInfo.entityGroup.instanceCapacity*/) {
            //     v_pEntityInstanceObjects.push(v_pEntityInstanceObject);
            //     v_pEntityInstanceObject.spawn = true;
            // }
            this.internalShowEntity(v_pShowEntityInfo.entityId, entityAssetName, v_pShowEntityInfo.entityGroup, v_pEntityInstanceObject.target, true, duration, v_pShowEntityInfo.userData);
        };
        EntityManager.prototype.loadEntityFailureCallback = function (entityAssetName, status, errorMessage, userData) {
            var v_pShowEntityInfo = userData;
            if (!v_pShowEntityInfo)
                throw new Error('Show entity is invalid.');
            this.m_pEntitiesBeingLoaded.delete(v_pShowEntityInfo.entityId);
            this.m_pEntitiesToReleaseOnLoad.delete(v_pShowEntityInfo.serialId);
            var v_pAppendErrorMessage = "Load entity failure, asset name '" + entityAssetName + "', status '" + status + "', error message '" + errorMessage + "'";
            if (this.m_pShowEntityFailureDelegate.isValid) {
                this.m_pShowEntityFailureDelegate.iter(function (callbackFn) {
                    callbackFn(v_pShowEntityInfo.entityId, entityAssetName, v_pShowEntityInfo.entityGroup.name, v_pAppendErrorMessage, v_pShowEntityInfo.userData);
                });
                return;
            }
            throw new Error(v_pAppendErrorMessage);
        };
        EntityManager.prototype.loadEntityUpdateCallback = function (entityAssetName, progress, userData) {
            var v_pShowEntityInfo = userData;
            if (!v_pShowEntityInfo)
                throw new Error('Show entity is invalid.');
            if (this.m_pShowEntityUpdateDelegate.isValid) {
                this.m_pShowEntityUpdateDelegate.iter(function (callbackFn) {
                    callbackFn(v_pShowEntityInfo.entityId, entityAssetName, v_pShowEntityInfo.entityGroup.name, progress, v_pShowEntityInfo.userData);
                });
            }
        };
        EntityManager.prototype.loadEntityDependencyAssetCallback = function (entityAssetName, dependencyAssetName, loadedCount, totalCount, userData) {
            var v_pShowEntityInfo = userData;
            if (!v_pShowEntityInfo)
                throw new Error('Show entity is invalid.');
            if (this.m_pShowEntityDependencyAssetDelegate.isValid) {
                this.m_pShowEntityDependencyAssetDelegate.iter(function (callbackFn) {
                    callbackFn(v_pShowEntityInfo.entityId, entityAssetName, v_pShowEntityInfo.entityGroup.name, dependencyAssetName, loadedCount, totalCount, v_pShowEntityInfo.userData);
                });
            }
        };
        return EntityManager;
    }(Base_1.FrameworkModule)); // class EntityManager
    exports.EntityManager = EntityManager;
    var EntityInstanceObject = /** @class */ (function (_super) {
        __extends(EntityInstanceObject, _super);
        function EntityInstanceObject() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.m_pEntityAsset = null;
            _this.m_pEntityHelper = null;
            return _this;
        }
        EntityInstanceObject.create = function (name, entityAsset, entityInstance, entityHelper) {
            if (!entityAsset)
                throw new Error('Entity asset is invalid.');
            if (!entityHelper)
                throw new Error('Entity helper is invalid.');
            var v_pEntityInstanceObject = new EntityInstanceObject(); // FIXME: Acquire EntityInstanceObject from ReferencePool.
            v_pEntityInstanceObject.initialize(name, entityInstance);
            v_pEntityInstanceObject.m_pEntityAsset = entityAsset;
            v_pEntityInstanceObject.m_pEntityHelper = entityHelper;
            return v_pEntityInstanceObject;
        };
        EntityInstanceObject.prototype.release = function (shutdown) {
            if (this.m_pEntityHelper)
                this.m_pEntityHelper.releaseEntity(this.m_pEntityAsset, this.target);
        };
        EntityInstanceObject.prototype.clear = function () {
            _super.prototype.clear.call(this);
            this.m_pEntityAsset = null;
            this.m_pEntityHelper = null;
        };
        return EntityInstanceObject;
    }(ObjectPool_1.ObjectBase)); // class EntityInstanceObject
});

},{"./Base":1,"./ObjectPool":8}],6:[function(require,module,exports){
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Base"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Base_1 = require("./Base");
    /**
     * A simple event manager implementation.
     *
     * @author Jeremy Chen (keyhom.c@gmail.com)
     */
    var EventManager = /** @class */ (function (_super) {
        __extends(EventManager, _super);
        function EventManager() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.m_pEventHandlers = new Map();
            return _this;
        }
        Object.defineProperty(EventManager.prototype, "priority", {
            get: function () {
                return 100;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventManager.prototype, "eventCount", {
            get: function () {
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        EventManager.prototype.count = function (eventId) {
            if (this.m_pEventHandlers.has(eventId)) {
                var v_pEventHandler = void 0;
                if ((v_pEventHandler = this.m_pEventHandlers.get(eventId))) {
                    return v_pEventHandler.size;
                }
            }
            return 0;
        };
        EventManager.prototype.check = function (eventId, handler, target) {
            if (this.m_pEventHandlers.has(eventId)) {
                var v_pEventHandler = void 0;
                if (handler && (v_pEventHandler = this.m_pEventHandlers.get(eventId))) {
                    return v_pEventHandler.has(handler);
                }
                return true;
            }
            return false;
        };
        EventManager.prototype.on = function (eventId, handler, target) {
            if (!this.m_pEventHandlers.has(eventId)) {
                this.m_pEventHandlers.set(eventId, new Base_1.EventHandler());
            }
            var v_pEventHandler;
            if ((v_pEventHandler = this.m_pEventHandlers.get(eventId))) {
                v_pEventHandler.add(handler, target);
            }
        };
        EventManager.prototype.off = function (eventId, handler, target) {
            if (this.m_pEventHandlers.has(eventId)) {
                var v_pEventHandler = void 0;
                if ((v_pEventHandler = this.m_pEventHandlers.get(eventId))) {
                    v_pEventHandler.remove(handler, target);
                }
            }
        };
        EventManager.prototype.emit = function (eventId) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (this.m_pEventHandlers.has(eventId)) {
                var v_pEventHandler = this.m_pEventHandlers.get(eventId);
                if (v_pEventHandler) {
                    v_pEventHandler.iter(function (callbackFn) {
                        callbackFn.apply(null, args);
                    });
                }
            }
        };
        EventManager.prototype.update = function (elapsed, realElapsed) {
            // NOOP.
        };
        EventManager.prototype.shutdown = function () {
            if (this.m_pEventHandlers) {
                this.m_pEventHandlers.forEach(function (eh, key) {
                    eh.clear();
                });
                this.m_pEventHandlers.clear();
            }
        };
        return EventManager;
    }(Base_1.FrameworkModule)); // class EventManager
    exports.EventManager = EventManager;
});

},{"./Base":1}],7:[function(require,module,exports){
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Base"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Base_1 = require("./Base");
    var FsmState = /** @class */ (function () {
        function FsmState() {
            this.m_pEventHandlers = new Map();
        }
        FsmState.prototype.onInit = function (fsm) {
            // NOOP
        };
        FsmState.prototype.onEnter = function (fsm) {
            // NOOP
        };
        FsmState.prototype.onUpdate = function (fsm, elapsed, realElapsed) {
            // NOOP
        };
        FsmState.prototype.onLeave = function (fsm, shutdown) {
            // NOOP
        };
        FsmState.prototype.onDestroy = function (fsm) {
            this.m_pEventHandlers.clear();
        };
        FsmState.prototype.changeState = function (fsm, type) {
            if (!fsm) {
                throw new Error("Fsm is invalid: " + fsm);
            }
            fsm.changeState(type);
        };
        FsmState.prototype.on = function (eventId, eventHandler) {
            if (null == eventHandler)
                throw new Error("Event handler is invalid.");
            if (!this.m_pEventHandlers.has(eventId)) {
                var eh = new Base_1.EventHandler();
                this.m_pEventHandlers.set(eventId, eh);
            }
            var v_pHandlers = this.m_pEventHandlers.get(eventId);
            if (v_pHandlers) {
                v_pHandlers.add(eventHandler);
            }
        };
        FsmState.prototype.off = function (eventId, eventHandler) {
            if (null == eventHandler)
                throw new Error("Event handler is invalid.");
            if (this.m_pEventHandlers.has(eventId)) {
                var v_pHandlers = this.m_pEventHandlers.get(eventId);
                if (v_pHandlers) {
                    v_pHandlers.remove(eventHandler);
                }
            }
        };
        FsmState.prototype.emit = function (fsm, sender, eventId, userData) {
            if (this.m_pEventHandlers.has(eventId)) {
                var v_pHandlers = this.m_pEventHandlers.get(eventId);
                if (v_pHandlers) {
                    v_pHandlers.iter(function (callbackFn) {
                        callbackFn(fsm, sender, userData);
                    });
                }
            }
        };
        return FsmState;
    }()); // class FsmState<T>
    exports.FsmState = FsmState;
    var Fsm = /** @class */ (function () {
        function Fsm() {
            this.m_pStates = [];
            this.m_pDatas = new Map();
            this._isDestroyed = true;
            this._currentStateTime = 0;
        }
        Fsm.createFsm = function (name, owner, states) {
            var e_1, _a;
            if (null == owner)
                throw new Error('FSM owner is invalid.');
            if (null == states || states.length < 1)
                throw new Error('FSM states is invalid.');
            var v_pFsm = new Fsm();
            v_pFsm.m_sName = name;
            v_pFsm.m_pOwner = owner;
            try {
                for (var states_1 = __values(states), states_1_1 = states_1.next(); !states_1_1.done; states_1_1 = states_1.next()) {
                    var v_pState = states_1_1.value;
                    if (null == v_pState)
                        throw new Error('FSM states is invalid.');
                    if (v_pFsm.hasState(v_pState.constructor))
                        throw new Error("FSM '" + name + "' state '" + v_pState + "' is already exist.");
                    v_pFsm.m_pStates.push(v_pState);
                    v_pState.onInit(v_pFsm);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (states_1_1 && !states_1_1.done && (_a = states_1.return)) _a.call(states_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            v_pFsm._isDestroyed = false;
            return v_pFsm;
        };
        Object.defineProperty(Fsm.prototype, "name", {
            get: function () {
                return this.m_sName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Fsm.prototype, "owner", {
            get: function () { return this.m_pOwner; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Fsm.prototype, "fsmStateCount", {
            get: function () { return this.m_pStates.length; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Fsm.prototype, "isRunning", {
            get: function () { return null != this._currentState; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Fsm.prototype, "isDestroyed", {
            get: function () { return this._isDestroyed; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Fsm.prototype, "currentState", {
            get: function () { return this._currentState; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Fsm.prototype, "currentStateName", {
            get: function () {
                // FIXME: Current state name ?
                return this.currentState.name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Fsm.prototype, "currentStateTime", {
            get: function () { return this._currentStateTime; },
            enumerable: true,
            configurable: true
        });
        Fsm.prototype.start = function (type) {
            if (this.isRunning) {
                throw new Error("FSM is running, can not start again.");
            }
            var state = this.getState(type);
            if (!state) {
                throw new Error("FSM '" + this.name + "' can not start state '" + type.name + "' which is not exists.");
            }
            this._currentStateTime = 0;
            this._currentState = state;
            this.currentState.onEnter(this); // Call internal function with any casting.
        };
        Fsm.prototype.hasState = function (type) {
            return null != this.getState(type);
        };
        Fsm.prototype.getState = function (type) {
            for (var i = 0; i < this.m_pStates.length; i++) {
                var v_pState = this.m_pStates[i];
                if (null == v_pState)
                    continue;
                if (v_pState instanceof type)
                    return v_pState;
            }
            return null;
        };
        Fsm.prototype.getAllStates = function () {
            return this.m_pStates;
        };
        Fsm.prototype.changeState = function (type) {
            if (!this._currentState)
                throw new Error('Current state is invalid.');
            var v_pState = this.getState(type);
            if (null == v_pState)
                throw new Error("Fsm can not change state, state is not exist: " + type);
            this._currentState.onLeave(this, false);
            this._currentStateTime = 0;
            this._currentState = v_pState;
            this._currentState.onEnter(this);
        };
        Fsm.prototype.getData = function (name) {
            if (this.m_pDatas.has(name))
                return this.m_pDatas.get(name);
            return null;
        };
        Fsm.prototype.setData = function (name, data) {
            if (!name)
                throw new Error('Data name is invalid.');
            this.m_pDatas.set(name, data);
        };
        Fsm.prototype.removeData = function (name) {
            if (!name)
                throw new Error('Data name is invalid.');
            var v_bRet = false;
            if (this.m_pDatas.has(name)) {
                v_bRet = true;
                this.m_pDatas.delete(name);
            }
            return v_bRet;
        };
        Fsm.prototype.update = function (elapsed, realElapsed) {
            if (null == this._currentState)
                return;
            this._currentStateTime += elapsed;
            this._currentState.onUpdate(this, elapsed, realElapsed);
        };
        Fsm.prototype.shutdown = function () {
            // FIXME: Figue out a way to release this.
        };
        return Fsm;
    }()); // class Fsm<T>
    exports.Fsm = Fsm;
    var FsmManager = /** @class */ (function (_super) {
        __extends(FsmManager, _super);
        function FsmManager() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.m_pFsms = new Map();
            return _this;
        }
        Object.defineProperty(FsmManager.prototype, "priority", {
            get: function () {
                return 60;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FsmManager.prototype, "count", {
            get: function () {
                return this.m_pFsms.size;
            },
            enumerable: true,
            configurable: true
        });
        FsmManager.prototype.hasFsm = function (nameOrType) {
            var e_2, _a;
            if ('function' === typeof nameOrType && nameOrType.prototype) {
                try {
                    for (var _b = __values(this.m_pFsms.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var fsm = _c.value;
                        if (null != fsm && fsm instanceof nameOrType) {
                            return true;
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            else {
                this.m_pFsms.has(nameOrType.toString());
            }
            return false;
        };
        FsmManager.prototype.getFsm = function (nameOrType) {
            var e_3, _a;
            if ('function' === typeof nameOrType && nameOrType.prototype) {
                try {
                    for (var _b = __values(this.m_pFsms.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var fsm = _c.value;
                        if (null != fsm && fsm instanceof nameOrType)
                            return fsm;
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
            else {
                return this.m_pFsms.get(nameOrType.toString()) || null;
            }
            return null;
        };
        FsmManager.prototype.getAllFsms = function () {
            var e_4, _a;
            var v_pRet = [];
            try {
                for (var _b = __values(this.m_pFsms.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var fsm = _c.value;
                    v_pRet.push(fsm);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return v_pRet;
        };
        FsmManager.prototype.createFsm = function (name, owner, states) {
            name = name || '';
            if (this.hasFsm(name)) {
                throw new Error("Already exist FSM '" + name + "'.");
            }
            var fsm = Fsm.createFsm(name, owner, states);
            this.m_pFsms.set(name, fsm);
            return fsm;
        };
        FsmManager.prototype.destroyFsm = function (arg) {
            var e_5, _a, e_6, _b, e_7, _c;
            var v_sName;
            var v_pType;
            var v_pInstance;
            if ('string' === typeof arg) {
                v_sName = arg;
            }
            else if ('function' === typeof arg) {
                v_pType = arg;
            }
            else if ('object' === typeof arg && arg.constructor) {
                v_pInstance = arg;
                v_pType = arg.constructor;
            }
            if (!this.hasFsm(v_sName || v_pType)) {
                return false;
            }
            if (v_pInstance && Object.getPrototypeOf(v_pInstance).hasOwnProperty('shutdown')) {
                v_pInstance.shutdown();
            }
            if (null != v_pInstance) {
                try {
                    for (var _d = __values(this.m_pFsms.keys()), _e = _d.next(); !_e.done; _e = _d.next()) {
                        var key = _e.value;
                        var v_pFsm = this.m_pFsms.get(key) || null;
                        if (v_pFsm == v_pInstance) {
                            this.m_pFsms.delete(key);
                            break;
                        }
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
            }
            else if (null != v_sName) {
                try {
                    for (var _f = __values(this.m_pFsms.keys()), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var key = _g.value;
                        var v_pFsm = this.m_pFsms.get(key) || null;
                        if (!v_pFsm)
                            continue;
                        if (v_pFsm.name == v_sName) {
                            this.m_pFsms.delete(key);
                            break;
                        }
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
            }
            else if (null != v_pType) {
                try {
                    for (var _h = __values(this.m_pFsms.keys()), _j = _h.next(); !_j.done; _j = _h.next()) {
                        var key = _j.value;
                        var v_pFsm = this.m_pFsms.get(key) || null;
                        if (v_pFsm instanceof v_pType) {
                            this.m_pFsms.delete(key);
                            break;
                        }
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
            }
            return true;
        };
        FsmManager.prototype.update = function (elapsed, realElapsed) {
            var e_8, _a;
            try {
                for (var _b = __values(this.m_pFsms.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var value = _c.value;
                    var fsm = value;
                    if (!fsm || fsm.isDestroyed)
                        continue;
                    fsm.update(elapsed, realElapsed);
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_8) throw e_8.error; }
            }
        };
        FsmManager.prototype.shutdown = function () {
            var e_9, _a;
            try {
                for (var _b = __values(this.m_pFsms.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var key = _c.value;
                    var v_Fsm = this.m_pFsms.get(key) || null;
                    if (!v_Fsm || v_Fsm.isDestroyed)
                        continue;
                    v_Fsm.shutdown();
                    this.m_pFsms.delete(key);
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_9) throw e_9.error; }
            }
        };
        return FsmManager;
    }(Base_1.FrameworkModule)); // class FsmManager
    exports.FsmManager = FsmManager;
});

},{"./Base":1}],8:[function(require,module,exports){
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Base"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Base_1 = require("./Base");
    var DefaultCapacity = Number.MAX_SAFE_INTEGER;
    var DefaultExpireTime = Number.MAX_VALUE;
    var DefaultPriority = 0;
    var DateTimeMinTimestamp = 978278400000;
    var DateTimeMaxTimestamp = 253402271999000;
    var ObjectPoolBase = /** @class */ (function () {
        function ObjectPoolBase(name) {
            this.m_sName = name || '';
        }
        Object.defineProperty(ObjectPoolBase.prototype, "name", {
            get: function () { return this.m_sName; },
            enumerable: true,
            configurable: true
        });
        return ObjectPoolBase;
    }()); // class ObjectPoolBase
    exports.ObjectPoolBase = ObjectPoolBase;
    var ObjectPool = /** @class */ (function (_super) {
        __extends(ObjectPool, _super);
        function ObjectPool(name, allowMultiSpawn, autoReleaseInterval, capacity, expireTime, priority) {
            var _this = _super.call(this, name) || this;
            _this.m_pObjects = new Map();
            _this.m_pObjectMap = new Map();
            _this.m_pCacheCanReleaseObjets = [];
            _this.m_pCacheToReleaseObjects = [];
            _this.m_bAllowMultiSpawn = allowMultiSpawn;
            _this.m_fAutoReleaseInterval = autoReleaseInterval;
            _this.m_iCapacity = capacity;
            _this.m_fExpireTime = expireTime;
            _this.m_iPriority = priority;
            _this.m_fAutoReleaseTime = 0;
            return _this;
        }
        Object.defineProperty(ObjectPool.prototype, "count", {
            get: function () { return this.m_pObjectMap.size; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ObjectPool.prototype, "canReleaseCount", {
            get: function () {
                this.getCanReleaseObjects(this.m_pCacheCanReleaseObjets);
                return this.m_pCacheCanReleaseObjets.length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ObjectPool.prototype, "allowMultiSpawn", {
            get: function () { return this.m_bAllowMultiSpawn; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ObjectPool.prototype, "autoReleaseInterval", {
            get: function () { return this.m_fAutoReleaseInterval; },
            set: function (value) { this.m_fAutoReleaseInterval = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ObjectPool.prototype, "capacity", {
            get: function () { return this.m_iCapacity; },
            set: function (value) {
                if (value < 0)
                    throw new Error('Capacity is invalid.');
                if (this.m_iCapacity == value)
                    return;
                this.m_iCapacity = value;
                this.release();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ObjectPool.prototype, "expireTime", {
            get: function () { return this.m_fExpireTime; },
            set: function (value) {
                if (value < 0)
                    throw new Error('ExpireTime is invalid.');
                if (this.m_fExpireTime == value)
                    return;
                this.m_fExpireTime = value;
                this.release();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ObjectPool.prototype, "priority", {
            get: function () { return this.m_iPriority; },
            set: function (value) { this.m_iPriority = value; },
            enumerable: true,
            configurable: true
        });
        ObjectPool.prototype.register = function (obj, spawned) {
            if (!obj)
                throw new Error('object is invalid.');
            var v_pObjects = this.getObjects(obj.name);
            if (!v_pObjects) {
                v_pObjects = [];
                this.m_pObjects.set(obj.name, v_pObjects);
            }
            var v_pInternalObject = RefObject.create(obj, spawned);
            v_pObjects.push(v_pInternalObject);
            this.m_pObjectMap.set(obj.target, v_pInternalObject);
            if (this.count > this.m_iCapacity)
                this.release();
        };
        ObjectPool.prototype.canSpawn = function (name) {
            var e_1, _a;
            name = name || '';
            var v_pObjects = this.getObjects(name);
            if (v_pObjects) {
                try {
                    for (var v_pObjects_1 = __values(v_pObjects), v_pObjects_1_1 = v_pObjects_1.next(); !v_pObjects_1_1.done; v_pObjects_1_1 = v_pObjects_1.next()) {
                        var internalObject = v_pObjects_1_1.value;
                        if (this.m_bAllowMultiSpawn || !internalObject.isInUse) {
                            return true;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (v_pObjects_1_1 && !v_pObjects_1_1.done && (_a = v_pObjects_1.return)) _a.call(v_pObjects_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            return false;
        };
        ObjectPool.prototype.spawn = function (name) {
            var e_2, _a;
            name = name || '';
            var v_pObjects = this.getObjects(name);
            if (v_pObjects) {
                try {
                    for (var v_pObjects_2 = __values(v_pObjects), v_pObjects_2_1 = v_pObjects_2.next(); !v_pObjects_2_1.done; v_pObjects_2_1 = v_pObjects_2.next()) {
                        var internalObject = v_pObjects_2_1.value;
                        if (this.m_bAllowMultiSpawn || !internalObject.isInUse) {
                            return internalObject.spawn();
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (v_pObjects_2_1 && !v_pObjects_2_1.done && (_a = v_pObjects_2.return)) _a.call(v_pObjects_2);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            return null;
        };
        ObjectPool.prototype.unspawn = function (obj) {
            if (!obj)
                throw new Error('Object is invalid.');
            this.unspawnByTarget(obj.target);
        };
        ObjectPool.prototype.unspawnByTarget = function (target) {
            if (!target)
                throw new Error('Target is invalid.');
            var v_pInternalObject = this.getObjectByTarget(target);
            if (v_pInternalObject) {
                v_pInternalObject.unspawn();
                if (this.count > this.m_iCapacity && v_pInternalObject.spawnCount <= 0) {
                    this.release();
                }
            }
            else {
                throw new Error("Can not find target in object pool '" + this.name + "'.");
            }
        };
        ObjectPool.prototype.setLocked = function (obj, locked) {
            if (!obj)
                throw new Error('Object is invalid.');
            this.setLockedByTarget(obj.target, locked);
        };
        ObjectPool.prototype.setLockedByTarget = function (target, locked) {
            if (!target)
                throw new Error('Target is invalid.');
            var v_pInternalObject = this.getObjectByTarget(target);
            if (v_pInternalObject) {
                v_pInternalObject.locked = locked;
            }
            else {
                throw new Error("Can not find target in object pool '" + this.name + "'.");
            }
        };
        ObjectPool.prototype.setPriority = function (obj, priority) {
            if (!obj)
                throw new Error('Object is invalid.');
            this.setPriorityByTarget(obj.target, priority);
        };
        ObjectPool.prototype.setPriorityByTarget = function (target, priority) {
            if (!target)
                throw new Error('Target is invalid.');
            var v_pInternalObject = this.getObjectByTarget(target);
            if (v_pInternalObject) {
                v_pInternalObject.priority = priority;
            }
            else {
                throw new Error("Can not find target in object pool '" + this.name + "'.");
            }
        };
        ObjectPool.prototype.release = function (a, b) {
            var e_3, _a;
            var toReleaseCount = this.count - this.m_iCapacity;
            var filter = this.defaultReleaseObjectFilterCallback.bind(this);
            if (undefined !== a) {
                if ('number' === typeof a) {
                    toReleaseCount = a;
                }
                else {
                    filter = a;
                }
                if (undefined !== b) {
                    if ('number' === typeof b) {
                        toReleaseCount = b;
                    }
                    else {
                        filter = b;
                    }
                }
            }
            if (!filter) {
                throw new Error('Release object filter callback is invalid.');
            }
            if (toReleaseCount < 0)
                toReleaseCount = 0;
            var v_fExpireTime = DateTimeMinTimestamp;
            if (this.m_fExpireTime < Number.MAX_VALUE)
                v_fExpireTime = new Date().valueOf() - this.m_fExpireTime;
            this.m_fAutoReleaseTime = 0;
            this.getCanReleaseObjects(this.m_pCacheCanReleaseObjets);
            var v_pToReleaseObjects = filter(this.m_pCacheCanReleaseObjets, toReleaseCount, v_fExpireTime);
            if (!v_pToReleaseObjects || v_pToReleaseObjects.length <= 0)
                return;
            try {
                for (var v_pToReleaseObjects_1 = __values(v_pToReleaseObjects), v_pToReleaseObjects_1_1 = v_pToReleaseObjects_1.next(); !v_pToReleaseObjects_1_1.done; v_pToReleaseObjects_1_1 = v_pToReleaseObjects_1.next()) {
                    var toReleaseObject = v_pToReleaseObjects_1_1.value;
                    this.releaseObject(toReleaseObject);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (v_pToReleaseObjects_1_1 && !v_pToReleaseObjects_1_1.done && (_a = v_pToReleaseObjects_1.return)) _a.call(v_pToReleaseObjects_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
        };
        ObjectPool.prototype.releaseAllUnused = function () {
            var e_4, _a;
            this.m_fAutoReleaseTime = 0;
            this.getCanReleaseObjects(this.m_pCacheCanReleaseObjets);
            try {
                for (var _b = __values(this.m_pCacheCanReleaseObjets), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var toReleaseObject = _c.value;
                    this.releaseObject(toReleaseObject);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
        };
        ObjectPool.prototype.getAllObjectInfos = function () {
            var e_5, _a, e_6, _b;
            var v_pResults = [];
            try {
                for (var _c = __values(this.m_pObjects.values()), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var objects = _d.value;
                    try {
                        for (var _e = (e_6 = void 0, __values(objects.values())), _f = _e.next(); !_f.done; _f = _e.next()) {
                            var internalObject = _f.value;
                            v_pResults.push({
                                name: internalObject.name,
                                locked: internalObject.locked,
                                customCanReleaseFlag: internalObject.customCanReleaseFlag,
                                priority: internalObject.priority,
                                lastUseTime: internalObject.lastUseTime,
                                spawnCount: internalObject.spawnCount,
                                isInUse: internalObject.isInUse
                            });
                        }
                    }
                    catch (e_6_1) { e_6 = { error: e_6_1 }; }
                    finally {
                        try {
                            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                        }
                        finally { if (e_6) throw e_6.error; }
                    }
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_5) throw e_5.error; }
            }
            return v_pResults;
        };
        ObjectPool.prototype.update = function (elapsed, realElapsed) {
            this.m_fAutoReleaseTime += realElapsed;
            if (this.m_fAutoReleaseTime < this.m_fAutoReleaseInterval)
                return;
            this.release();
        };
        ObjectPool.prototype.shutdown = function () {
            var e_7, _a;
            try {
                for (var _b = __values(this.m_pObjectMap.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var objectInMap = _c.value;
                    objectInMap.release(true);
                    // FIXME: ReferencePool.release(objectInMap)
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_7) throw e_7.error; }
            }
            this.m_pObjects.clear();
            this.m_pObjectMap.clear();
        };
        ObjectPool.prototype.getObjects = function (name) {
            if (!name) {
                throw new Error('Name is invalid.');
            }
            return this.m_pObjects.get(name) || null;
        };
        ObjectPool.prototype.getObjectByTarget = function (target) {
            if (!target)
                throw new Error('Target is invalid.');
            return this.m_pObjectMap.get(target) || null;
        };
        ObjectPool.prototype.releaseObject = function (obj) {
            if (!obj)
                throw new Error('Object is invalid.');
            var v_pObjects = this.getObjects(obj.name);
            var v_pInternalObject = this.getObjectByTarget(obj.target);
            if (null != v_pObjects && null != v_pInternalObject) {
                var idx = v_pObjects.indexOf(v_pInternalObject);
                if (idx > -1)
                    v_pObjects.splice(idx, 1);
                this.m_pObjectMap.delete(obj.target);
                if (v_pObjects.length <= 0) {
                    this.m_pObjects.delete(obj.name);
                }
                v_pInternalObject.release(false);
                // FIXME: ReferencePool.release(v_pInternalObject);
                return;
            }
            throw new Error('Can not release object which is not found.');
        };
        ObjectPool.prototype.getCanReleaseObjects = function (results) {
            var e_8, _a;
            if (!results)
                throw new Error('Results is invalid.');
            results.splice(0, results.length);
            try {
                for (var _b = __values(this.m_pObjectMap.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var internalObject = _c.value;
                    if (internalObject.isInUse || internalObject.locked || !internalObject.customCanReleaseFlag)
                        continue;
                    results.push(internalObject.peek());
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_8) throw e_8.error; }
            }
        };
        ObjectPool.prototype.defaultReleaseObjectFilterCallback = function (candidateObjects, toReleaseCount, expireTime) {
            this.m_pCacheToReleaseObjects.splice(0, this.m_pCacheToReleaseObjects.length);
            if (expireTime > DateTimeMinTimestamp) {
                for (var i = candidateObjects.length - 1; i >= 0; i--) {
                    if (candidateObjects[i].lastUseTime <= expireTime) {
                        this.m_pCacheToReleaseObjects.push(candidateObjects[i]);
                        candidateObjects.splice(i, 1);
                        continue;
                    }
                }
                toReleaseCount -= this.m_pCacheToReleaseObjects.length;
            }
            for (var i = 0; toReleaseCount > 0 && i < candidateObjects.length; i++) {
                for (var j = i + 1; j < candidateObjects.length; j++) {
                    if (candidateObjects[i].priority > candidateObjects[j].priority ||
                        candidateObjects[i].priority == candidateObjects[j].priority &&
                            candidateObjects[i].lastUseTime > candidateObjects[j].lastUseTime) {
                        var v_pTemp = candidateObjects[i];
                        candidateObjects[i] = candidateObjects[j];
                        candidateObjects[j] = v_pTemp;
                    }
                }
                this.m_pCacheToReleaseObjects.push(candidateObjects[i]);
                toReleaseCount--;
            }
            return this.m_pCacheToReleaseObjects;
        };
        return ObjectPool;
    }(ObjectPoolBase)); // class ObjectPool
    var RefObject = /** @class */ (function () {
        function RefObject() {
            this.m_pObject = null;
            this.m_iSpawnCount = 0;
        }
        Object.defineProperty(RefObject.prototype, "name", {
            get: function () { return this.m_pObject.name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RefObject.prototype, "locked", {
            get: function () { return this.m_pObject.locked; },
            set: function (value) { this.m_pObject.locked = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RefObject.prototype, "priority", {
            get: function () { return this.m_pObject.priority; },
            set: function (value) { this.m_pObject.priority = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RefObject.prototype, "customCanReleaseFlag", {
            get: function () { return this.m_pObject.customCanReleaseFlag; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RefObject.prototype, "lastUseTime", {
            get: function () { return this.m_pObject.lastUseTime; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RefObject.prototype, "isInUse", {
            get: function () { return this.m_iSpawnCount > 0; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RefObject.prototype, "spawnCount", {
            get: function () { return this.m_iSpawnCount; },
            enumerable: true,
            configurable: true
        });
        RefObject.create = function (obj, spawned) {
            if (!obj)
                throw new Error('Object is invalid.');
            // FIXME: let v_pInternalObject: RefObject<T> = ReferencePool.acquire<RefObject<T>>();
            var v_pInternalObject = new RefObject();
            v_pInternalObject.m_pObject = obj;
            v_pInternalObject.m_iSpawnCount = spawned ? 1 : 0;
            if (spawned)
                obj.onSpawn();
            return v_pInternalObject;
        };
        RefObject.prototype.clear = function () {
            this.m_pObject = null;
            this.m_iSpawnCount = 0;
        };
        RefObject.prototype.peek = function () {
            return this.m_pObject;
        };
        RefObject.prototype.spawn = function () {
            this.m_iSpawnCount++;
            this.m_pObject.lastUseTime = new Date().valueOf();
            this.m_pObject.onSpawn();
            return this.m_pObject;
        };
        RefObject.prototype.unspawn = function () {
            this.m_pObject.onUnspawn();
            this.m_pObject.lastUseTime = new Date().valueOf();
            this.m_iSpawnCount--;
            if (this.m_iSpawnCount < 0)
                throw new Error('Spawn count is less than 0.');
        };
        RefObject.prototype.release = function (isShutdown) {
            this.m_pObject.release(isShutdown);
            // FIXME: ReferencePool.release(this.m_pObject as IReference);
        };
        return RefObject;
    }()); // class RefObject
    function createObjectInfo(name, locked, customCanReleaseFlag, priority, lastUseTime, spawnCount) {
        return {
            name: name,
            locked: locked,
            customCanReleaseFlag: customCanReleaseFlag,
            priority: priority,
            lastUseTime: lastUseTime,
            isInUse: false,
            spawnCount: spawnCount
        };
    }
    var ObjectBase = /** @class */ (function () {
        function ObjectBase() {
            this.m_sName = null;
            this.m_pTarget = null;
            this.m_bLocked = false;
            this.m_iPriority = 0;
            this.m_uLastUseTime = 0;
        }
        Object.defineProperty(ObjectBase.prototype, "name", {
            get: function () { return this.m_sName; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ObjectBase.prototype, "target", {
            get: function () { return this.m_pTarget; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ObjectBase.prototype, "locked", {
            get: function () { return this.m_bLocked; },
            set: function (value) { this.m_bLocked = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ObjectBase.prototype, "priority", {
            get: function () { return this.m_iPriority; },
            set: function (value) { this.m_iPriority = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ObjectBase.prototype, "customCanReleaseFlag", {
            get: function () { return true; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ObjectBase.prototype, "lastUseTime", {
            get: function () { return this.m_uLastUseTime; },
            set: function (value) { this.m_uLastUseTime = value; },
            enumerable: true,
            configurable: true
        });
        ObjectBase.prototype.initialize = function (nameOrTarget, target, locked, priority) {
            var name;
            if ('string' === typeof nameOrTarget) {
                name = nameOrTarget;
            }
            else {
                target = nameOrTarget;
            }
            this.m_sName = name || '';
            this.m_pTarget = target || null;
            this.m_bLocked = locked || false;
            this.m_iPriority = priority || 0;
            this.m_uLastUseTime = new Date().valueOf();
        };
        ObjectBase.prototype.clear = function () {
            this.m_sName = null;
            this.m_pTarget = null;
            this.m_bLocked = false;
            this.m_iPriority = 0;
            this.m_uLastUseTime = 0;
        };
        ObjectBase.prototype.onSpawn = function () {
        };
        ObjectBase.prototype.onUnspawn = function () {
        };
        return ObjectBase;
    }()); // class ObjectBase
    exports.ObjectBase = ObjectBase;
    var ObjectPoolManager = /** @class */ (function (_super) {
        __extends(ObjectPoolManager, _super);
        function ObjectPoolManager() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.m_pObjectPools = new Map();
            return _this;
        }
        Object.defineProperty(ObjectPoolManager.prototype, "priority", {
            get: function () {
                return 90;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ObjectPoolManager.prototype, "count", {
            get: function () {
                return this.m_pObjectPools.size;
            },
            enumerable: true,
            configurable: true
        });
        ObjectPoolManager.prototype.update = function (elapsed, realElapsed) {
            var e_9, _a;
            try {
                for (var _b = __values(this.m_pObjectPools.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var objectPool = _c.value;
                    objectPool.update(elapsed, realElapsed);
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_9) throw e_9.error; }
            }
        };
        ObjectPoolManager.prototype.shutdown = function () {
            var e_10, _a;
            try {
                for (var _b = __values(this.m_pObjectPools.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var objectPool = _c.value;
                    objectPool.shutdown();
                }
            }
            catch (e_10_1) { e_10 = { error: e_10_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_10) throw e_10.error; }
            }
            this.m_pObjectPools.clear();
        };
        ObjectPoolManager.prototype.hasObjectPool = function (name) {
            // process with name just only.
            if (!name) {
                throw new Error("Full name is invalid.");
            }
            return this.m_pObjectPools.has(name);
        };
        ObjectPoolManager.prototype.getObjectPool = function (name) {
            return this.getObjectPoolBase(name);
        };
        ObjectPoolManager.prototype.getObjectPoolBase = function (nameOrPredicate) {
            var e_11, _a;
            var name;
            var predicate;
            if ('string' === typeof nameOrPredicate) {
                name = nameOrPredicate;
                if (!name)
                    throw new Error("Full name is invalid.");
            }
            else if ('function' === typeof nameOrPredicate) {
                predicate = nameOrPredicate;
                try {
                    for (var _b = __values(this.m_pObjectPools.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var obj = _c.value;
                        if (predicate(obj))
                            return obj;
                    }
                }
                catch (e_11_1) { e_11 = { error: e_11_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_11) throw e_11.error; }
                }
                return null;
            }
            return this.m_pObjectPools.get(name) || null;
        };
        ObjectPoolManager.prototype.getObjectPools = function (predicate, results) {
            var e_12, _a;
            results = results || [];
            results.splice(0, results.length);
            try {
                for (var _b = __values(this.m_pObjectPools.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var obj = _c.value;
                    if (predicate(obj)) {
                        results.push(obj);
                    }
                }
            }
            catch (e_12_1) { e_12 = { error: e_12_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_12) throw e_12.error; }
            }
            return results;
        };
        ObjectPoolManager.prototype.getAllObjectPools = function (sortOrResults, results) {
            var e_13, _a;
            var sort = false;
            if (undefined !== typeof sortOrResults) {
                if ('boolean' === typeof sortOrResults) {
                    sort = sortOrResults;
                }
                else {
                    results = sortOrResults;
                }
            }
            results = results || [];
            results.splice(0, results.length);
            try {
                for (var _b = __values(this.m_pObjectPools.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var obj = _c.value;
                    results.push(obj);
                }
            }
            catch (e_13_1) { e_13 = { error: e_13_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_13) throw e_13.error; }
            }
            if (sort) {
                return results.sort(function (a, b) {
                    if (a.priority > b.priority)
                        return 1;
                    else if (a.priority < b.priority)
                        return -1;
                    return 0;
                });
            }
            return results;
        };
        ObjectPoolManager.prototype.createSingleSpawnObjectPool = function (option) {
            var v_stParams = option || {};
            return this.internalCreateObjectPool(v_stParams.name || '', false, v_stParams.expireTime || DefaultExpireTime, v_stParams.capacity || DefaultCapacity, v_stParams.expireTime || DefaultExpireTime, v_stParams.priority || DefaultPriority);
        };
        ObjectPoolManager.prototype.createMutliSpawnObjectPool = function (option) {
            var v_stParams = option || {};
            return this.internalCreateObjectPool(v_stParams.name || '', v_stParams.allowMultiSpawn || true, v_stParams.autoReleaseInterval || DefaultExpireTime, v_stParams.capacity || DefaultCapacity, v_stParams.expireTime || DefaultExpireTime, v_stParams.priority || DefaultPriority);
        };
        ObjectPoolManager.prototype.destroyObjectPool = function (a) {
            var name = '';
            if ('string' === typeof a) {
                name = a;
            }
            else if (undefined !== a) {
                name = a.name;
            }
            return this.internalDestroyObjectPool(name);
        };
        ObjectPoolManager.prototype.release = function () {
            var e_14, _a;
            var v_pObjectPools = this.getAllObjectPools(true);
            try {
                for (var v_pObjectPools_1 = __values(v_pObjectPools), v_pObjectPools_1_1 = v_pObjectPools_1.next(); !v_pObjectPools_1_1.done; v_pObjectPools_1_1 = v_pObjectPools_1.next()) {
                    var objectPool = v_pObjectPools_1_1.value;
                    objectPool.release();
                }
            }
            catch (e_14_1) { e_14 = { error: e_14_1 }; }
            finally {
                try {
                    if (v_pObjectPools_1_1 && !v_pObjectPools_1_1.done && (_a = v_pObjectPools_1.return)) _a.call(v_pObjectPools_1);
                }
                finally { if (e_14) throw e_14.error; }
            }
        };
        ObjectPoolManager.prototype.releaseAllUnused = function () {
            var e_15, _a;
            var v_pObjectPools = this.getAllObjectPools(true);
            try {
                for (var v_pObjectPools_2 = __values(v_pObjectPools), v_pObjectPools_2_1 = v_pObjectPools_2.next(); !v_pObjectPools_2_1.done; v_pObjectPools_2_1 = v_pObjectPools_2.next()) {
                    var objectPool = v_pObjectPools_2_1.value;
                    objectPool.releaseAllUnused();
                }
            }
            catch (e_15_1) { e_15 = { error: e_15_1 }; }
            finally {
                try {
                    if (v_pObjectPools_2_1 && !v_pObjectPools_2_1.done && (_a = v_pObjectPools_2.return)) _a.call(v_pObjectPools_2);
                }
                finally { if (e_15) throw e_15.error; }
            }
        };
        ObjectPoolManager.prototype.internalCreateObjectPool = function (name, allowMultiSpawn, autoReleaseInterval, capacity, expireTime, priority) {
            if (this.hasObjectPool(name)) {
                throw new Error("Already exist object pool '" + name + "'.");
            }
            var v_pObjectPool = new ObjectPool(name, allowMultiSpawn, autoReleaseInterval, capacity, expireTime, priority);
            this.m_pObjectPools.set(name, v_pObjectPool);
            return v_pObjectPool;
        };
        ObjectPoolManager.prototype.internalDestroyObjectPool = function (name) {
            var v_pObjectPool = this.m_pObjectPools.get(name);
            if (v_pObjectPool) {
                v_pObjectPool.shutdown();
                return this.m_pObjectPools.delete(name);
            }
            return false;
        };
        return ObjectPoolManager;
    }(Base_1.FrameworkModule)); // class ObjectPoolManager
    exports.ObjectPoolManager = ObjectPoolManager;
});

},{"./Base":1}],9:[function(require,module,exports){
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Base", "./Fsm"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Base_1 = require("./Base");
    var Fsm_1 = require("./Fsm");
    var ProcedureBase = /** @class */ (function (_super) {
        __extends(ProcedureBase, _super);
        function ProcedureBase() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return ProcedureBase;
    }(Fsm_1.FsmState)); // class ProcedureBase
    exports.ProcedureBase = ProcedureBase;
    var ProcedureManager = /** @class */ (function (_super) {
        __extends(ProcedureManager, _super);
        function ProcedureManager() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(ProcedureManager.prototype, "priority", {
            get: function () { return -10; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProcedureManager.prototype, "currentProcedure", {
            get: function () {
                return this.m_pProcedureFsm.currentState;
            },
            enumerable: true,
            configurable: true
        });
        ProcedureManager.prototype.initialize = function (fsmManager, procedures) {
            if (null == fsmManager)
                throw new Error('FSM manager is invalid.');
            this.m_pFsmManager = fsmManager;
            this.m_pProcedureFsm = fsmManager.createFsm('', this, procedures);
        };
        ProcedureManager.prototype.startProcedure = function (obj) {
            if (null == this.m_pProcedureFsm)
                throw new Error('You must initialize procedure first.');
            this.m_pProcedureFsm.start(obj.constructor);
        };
        ProcedureManager.prototype.update = function (elapsed, realElapsed) {
            // Noop.
        };
        ProcedureManager.prototype.shutdown = function () {
            if (null != this.m_pFsmManager) {
                if (null != this.m_pProcedureFsm) {
                    this.m_pFsmManager.destroyFsm(this.m_pProcedureFsm);
                }
            }
        };
        ProcedureManager.prototype.hasProcedure = function (type) {
            if (null == this.m_pProcedureFsm)
                throw new Error('You must initialize procedure first.');
            return this.m_pProcedureFsm.hasState(type);
        };
        ProcedureManager.prototype.getProcedure = function (type) {
            if (null == this.m_pProcedureFsm)
                throw new Error('You must initialize procedure first.');
            return this.m_pProcedureFsm.getState(type);
        };
        return ProcedureManager;
    }(Base_1.FrameworkModule)); // class ProcedureManager
    exports.ProcedureManager = ProcedureManager;
});

},{"./Base":1,"./Fsm":7}],10:[function(require,module,exports){
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Base"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Base_1 = require("./Base");
    var ResourceMode;
    (function (ResourceMode) {
        ResourceMode[ResourceMode["Unspecified"] = 0] = "Unspecified";
        ResourceMode[ResourceMode["Package"] = 1] = "Package";
        ResourceMode[ResourceMode["Updatable"] = 2] = "Updatable";
    })(ResourceMode = exports.ResourceMode || (exports.ResourceMode = {})); // enum ResourceMode
    var LoadResourceStatus;
    (function (LoadResourceStatus) {
        LoadResourceStatus[LoadResourceStatus["Success"] = 0] = "Success";
        LoadResourceStatus[LoadResourceStatus["NotReady"] = 1] = "NotReady";
        LoadResourceStatus[LoadResourceStatus["NotExist"] = 2] = "NotExist";
        LoadResourceStatus[LoadResourceStatus["DependencyError"] = 3] = "DependencyError";
        LoadResourceStatus[LoadResourceStatus["TypeError"] = 4] = "TypeError";
        LoadResourceStatus[LoadResourceStatus["AssetError"] = 5] = "AssetError";
    })(LoadResourceStatus = exports.LoadResourceStatus || (exports.LoadResourceStatus = {})); // enum LoadResourceStatus
    /**
     * A resource manager modular base on `FrameworkModule`.
     *
     * TODO: A general resource management was not yet implemented.
     *
     * @author Jeremy Chen (keyhom.c@gmail.com)
     */
    var ResourceManager = /** @class */ (function (_super) {
        __extends(ResourceManager, _super);
        function ResourceManager() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(ResourceManager.prototype, "resourceGroup", {
            get: function () { return this.m_pResourceGroup; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResourceManager.prototype, "resourceLoader", {
            get: function () { return this.m_pResourceLoader; },
            set: function (value) {
                if (null == value)
                    throw new Error("Setting resource loader is invalid.");
                this.m_pResourceLoader = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResourceManager.prototype, "priority", {
            get: function () {
                return 70;
            },
            enumerable: true,
            configurable: true
        });
        ResourceManager.prototype.hasAsset = function (assetName) {
            if (!assetName)
                throw new Error("Asset name is invalid.");
            return this.m_pResourceLoader.hasAsset(assetName);
        };
        ResourceManager.prototype.loadAsset = function (assetName, assetType, priority, loadAssetCallbacks, userData) {
            if (!assetName)
                throw new Error("Asset name is invalid.");
            if (!loadAssetCallbacks)
                throw new Error("Load asset callbacks is invalid.");
            this.m_pResourceLoader.loadAsset(assetName, assetType, priority, loadAssetCallbacks, userData);
        };
        ResourceManager.prototype.unloadAsset = function (asset) {
            if (!asset)
                throw new Error("Asset is invalid.");
            if (null == this.m_pResourceLoader)
                return;
            this.m_pResourceLoader.unloadAsset(asset);
        };
        ResourceManager.prototype.loadScene = function (sceneAssetName, priority, loadSceneCallbacks, userData) {
            if (!sceneAssetName)
                throw new Error("Scene asset name is invalid.");
            if (!loadSceneCallbacks)
                throw new Error("Load scene asset callbacks is invalid.");
            this.m_pResourceLoader.loadScene(sceneAssetName, priority, loadSceneCallbacks, userData);
        };
        ResourceManager.prototype.unloadScene = function (sceneAssetName, unloadSceneCallbacks, userData) {
            if (!sceneAssetName)
                throw new Error("Scene asset name is invalid.");
            if (!unloadSceneCallbacks)
                throw new Error("Unload scene callbacks is invalid.");
            this.m_pResourceLoader.unloadScene(sceneAssetName, unloadSceneCallbacks, userData);
        };
        ResourceManager.prototype.hasResourceGroup = function (resourceGroupName) {
            throw new Error("Method not implemented.");
        };
        ResourceManager.prototype.update = function (elapsed, realElapsed) {
            if (this.m_pResourceLoader) {
                this.m_pResourceLoader.update(elapsed, realElapsed);
            }
        };
        ResourceManager.prototype.shutdown = function () {
            if (this.m_pResourceLoader) {
                this.m_pResourceLoader.shutdown();
            }
        };
        return ResourceManager;
    }(Base_1.FrameworkModule)); // class ResourceManager
    exports.ResourceManager = ResourceManager;
});

},{"./Base":1}],11:[function(require,module,exports){
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Base"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Base_1 = require("./Base");
    var SceneManager = /** @class */ (function (_super) {
        __extends(SceneManager, _super);
        function SceneManager() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.m_pLoadedSceneAssetNames = [];
            _this.m_pLoadingSceneAssetNames = [];
            _this.m_pUnloadingSceneAssetNames = [];
            _this.m_pLoadSceneSuccessDelegate = new Base_1.EventHandler();
            _this.m_pLoadSceneFailureDelegate = new Base_1.EventHandler();
            _this.m_pLoadSceneUpdateDelegate = new Base_1.EventHandler();
            _this.m_pLoadSceneDependencyAssetDelegate = new Base_1.EventHandler();
            _this.m_pUnloadSceneSuccessDelegate = new Base_1.EventHandler();
            _this.m_pUnloadSceneFailureDelegate = new Base_1.EventHandler();
            _this.m_pLoadSceneCallbacks = {
                success: _this.onLoadSceneSuccess.bind(_this),
                failure: _this.onLoadSceneFailure.bind(_this),
                update: _this.onLoadSceneUpdate.bind(_this),
                dependency: _this.onLoadSceneDependencyAsset.bind(_this)
            };
            _this.m_pUnloadSceneCallbacks = {
                success: _this.onUnloadSceneSuccess.bind(_this),
                failure: _this.onUnloadSceneFailure.bind(_this)
            };
            return _this;
        }
        Object.defineProperty(SceneManager.prototype, "priority", {
            get: function () {
                return 60;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SceneManager.prototype, "loadSceneSuccess", {
            get: function () {
                return this.m_pLoadSceneSuccessDelegate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SceneManager.prototype, "loadSceneFailure", {
            get: function () {
                return this.m_pLoadSceneFailureDelegate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SceneManager.prototype, "loadSceneUpdate", {
            get: function () {
                return this.m_pLoadSceneUpdateDelegate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SceneManager.prototype, "loadSceneDependencyAsset", {
            get: function () {
                return this.m_pLoadSceneDependencyAssetDelegate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SceneManager.prototype, "unloadSceneSuccess", {
            get: function () {
                return this.m_pUnloadSceneSuccessDelegate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SceneManager.prototype, "unloadSceneFailure", {
            get: function () {
                return this.m_pUnloadSceneFailureDelegate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SceneManager.prototype, "resourceManager", {
            get: function () {
                return this.m_pResourceManager;
            },
            set: function (value) {
                this.m_pResourceManager = value;
            },
            enumerable: true,
            configurable: true
        });
        SceneManager.prototype.sceneIsLoading = function (sceneAssetName) {
            if (!sceneAssetName)
                throw new Error("Scene asset name is invalid.");
            return sceneAssetName in this.m_pLoadingSceneAssetNames;
        };
        SceneManager.prototype.sceneIsLoaded = function (sceneAssetName) {
            if (!sceneAssetName)
                throw new Error("Scene asset name is invalid.");
            return sceneAssetName in this.m_pLoadedSceneAssetNames;
        };
        SceneManager.prototype.sceneIsUnloading = function (sceneAssetName) {
            if (!sceneAssetName)
                throw new Error("Scene asset name is invalid.");
            return sceneAssetName in this.m_pUnloadingSceneAssetNames;
        };
        SceneManager.prototype.getLoadedSceneAssetNames = function (results) {
            results = results || [];
            for (var i = 0; i < this.m_pLoadedSceneAssetNames.length; i++) {
                results.push(this.m_pLoadedSceneAssetNames[i]);
            }
            return results;
        };
        SceneManager.prototype.getLoadingSceneAssetNames = function (results) {
            results = results || [];
            for (var i = 0; i < this.m_pLoadingSceneAssetNames.length; i++) {
                results.push(this.m_pLoadingSceneAssetNames[i]);
            }
            return results;
        };
        SceneManager.prototype.getUnloadingSceneAssetNames = function (results) {
            results = results || [];
            for (var i = 0; i < this.m_pUnloadingSceneAssetNames.length; i++) {
                results.push(this.m_pUnloadingSceneAssetNames[i]);
            }
            return results;
        };
        SceneManager.prototype.loadScene = function (sceneAssetName, priority, userData) {
            if (!sceneAssetName)
                throw new Error("Scene asset name is invalid.");
            if (!this.m_pResourceManager)
                throw new Error("You must set resource manager first.");
            if (this.sceneIsUnloading(sceneAssetName))
                throw new Error("Scene asset '" + sceneAssetName + "' is being unloaded.");
            if (this.sceneIsLoading(sceneAssetName))
                throw new Error("Scene asset '" + sceneAssetName + "' is being loaded.");
            if (this.sceneIsLoaded(sceneAssetName))
                throw new Error("Scene asset '" + sceneAssetName + "' is already loaded.");
            this.m_pLoadingSceneAssetNames.push(sceneAssetName);
            var v_iPriority = 0;
            var v_pUserData;
            if (arguments.length == 2) {
                if ('number' === typeof priority)
                    v_iPriority = priority;
                else
                    v_pUserData = priority;
            }
            else if (arguments.length == 3) {
                v_iPriority = priority;
                v_pUserData = userData;
            }
            this.m_pResourceManager.loadScene(sceneAssetName, v_iPriority, this.m_pLoadSceneCallbacks, v_pUserData);
        };
        SceneManager.prototype.unloadScene = function (sceneAssetName, userData) {
            if (!sceneAssetName)
                throw new Error("Scene asset name is invalid.");
            if (!this.m_pResourceManager)
                throw new Error("You must set resource manager first.");
            if (this.sceneIsUnloading(sceneAssetName))
                throw new Error("Scene asset '" + sceneAssetName + "' is being unloaded.");
            if (this.sceneIsLoading(sceneAssetName))
                throw new Error("Scene asset '" + sceneAssetName + "' is being loaded.");
            if (this.sceneIsLoaded(sceneAssetName))
                throw new Error("Scene asset '" + sceneAssetName + "' is already loaded.");
            userData = userData || null;
            this.m_pUnloadingSceneAssetNames.push(sceneAssetName);
            this.m_pResourceManager.unloadScene(sceneAssetName, this.m_pUnloadSceneCallbacks, userData);
        };
        SceneManager.prototype.update = function (elapsed, realElapsed) {
            // NOOP.
        };
        SceneManager.prototype.shutdown = function () {
            var e_1, _a;
            try {
                for (var _b = __values(this.m_pLoadedSceneAssetNames), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var sName = _c.value;
                    if (this.sceneIsUnloading(sName)) {
                        continue;
                    }
                    this.unloadScene(sName);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            this.m_pLoadedSceneAssetNames.splice(0, this.m_pLoadedSceneAssetNames.length);
            this.m_pLoadingSceneAssetNames.splice(0, this.m_pLoadingSceneAssetNames.length);
            this.m_pUnloadingSceneAssetNames.splice(0, this.m_pUnloadingSceneAssetNames.length);
        };
        SceneManager.prototype.onLoadSceneSuccess = function (sceneAssetName, duration, userData) {
            var v_Idx;
            if ((v_Idx = this.m_pLoadingSceneAssetNames.indexOf(sceneAssetName)) >= 0) {
                this.m_pLoadingSceneAssetNames.splice(v_Idx, 1);
            }
            if ((v_Idx = this.m_pUnloadingSceneAssetNames.indexOf(sceneAssetName)) >= 0) {
                this.m_pUnloadingSceneAssetNames.splice(v_Idx, 1);
            }
            this.m_pLoadedSceneAssetNames.push(sceneAssetName);
            if (this.m_pLoadSceneSuccessDelegate.isValid) {
                this.m_pLoadSceneSuccessDelegate.iter(function (callbackFn) {
                    callbackFn(sceneAssetName, duration, userData);
                });
            }
        };
        SceneManager.prototype.onLoadSceneFailure = function (sceneAssetName, status, errorMessage, userData) {
            var v_Idx;
            if ((v_Idx = this.m_pLoadingSceneAssetNames.indexOf(sceneAssetName)) >= 0) {
                this.m_pLoadingSceneAssetNames.splice(v_Idx, 1);
            }
            if (this.m_pLoadSceneFailureDelegate.isValid) {
                this.m_pLoadSceneFailureDelegate.iter(function (callbackFn) {
                    callbackFn(sceneAssetName, errorMessage, userData);
                });
            }
        };
        SceneManager.prototype.onLoadSceneUpdate = function (sceneAssetName, progress, userData) {
            if (this.m_pLoadSceneUpdateDelegate.isValid) {
                this.m_pLoadSceneUpdateDelegate.iter(function (callbackFn) {
                    callbackFn(sceneAssetName, progress, userData);
                });
            }
        };
        SceneManager.prototype.onLoadSceneDependencyAsset = function (sceneAssetName, dependencyAssetName, loadedCount, totalCount, userData) {
            if (this.m_pLoadSceneDependencyAssetDelegate.isValid) {
                this.m_pLoadSceneDependencyAssetDelegate.iter(function (callbackFn) {
                    callbackFn(sceneAssetName, dependencyAssetName, loadedCount, totalCount, userData);
                });
            }
        };
        SceneManager.prototype.onUnloadSceneSuccess = function (sceneAssetName, userData) {
            var v_Idx;
            if ((v_Idx = this.m_pUnloadingSceneAssetNames.indexOf(sceneAssetName)) >= 0) {
                this.m_pUnloadingSceneAssetNames.splice(v_Idx, 1);
            }
            if ((v_Idx = this.m_pLoadedSceneAssetNames.indexOf(sceneAssetName)) >= 0) {
                this.m_pLoadedSceneAssetNames.splice(v_Idx, 1);
            }
            if (this.m_pUnloadSceneSuccessDelegate.isValid) {
                this.m_pUnloadSceneSuccessDelegate.iter(function (callbackFn) {
                    callbackFn(sceneAssetName, userData);
                });
            }
        };
        SceneManager.prototype.onUnloadSceneFailure = function (sceneAssetName, userData) {
            var v_Idx;
            if ((v_Idx = this.m_pUnloadingSceneAssetNames.indexOf(sceneAssetName)) >= 0) {
                this.m_pUnloadingSceneAssetNames.splice(v_Idx, 1);
            }
            if (this.m_pUnloadSceneFailureDelegate.isValid) {
                this.m_pUnloadSceneFailureDelegate.iter(function (callbackFn) {
                    callbackFn(sceneAssetName, userData);
                });
            }
        };
        return SceneManager;
    }(Base_1.FrameworkModule)); // class SceneManager
    exports.SceneManager = SceneManager;
});

},{"./Base":1}],12:[function(require,module,exports){
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Base"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Base_1 = require("./Base");
    /**
     * Setting configured management.
     */
    var SettingManager = /** @class */ (function (_super) {
        __extends(SettingManager, _super);
        function SettingManager() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.m_pSettingHelper = null;
            return _this;
        }
        Object.defineProperty(SettingManager.prototype, "settingHelper", {
            get: function () { return this.m_pSettingHelper; },
            set: function (value) {
                if (null == value)
                    throw new Error('Setting helper is invalid.');
                this.m_pSettingHelper = value;
            },
            enumerable: true,
            configurable: true
        });
        SettingManager.prototype.load = function () {
            return this.settingHelper.load();
        };
        SettingManager.prototype.save = function () {
            return this.settingHelper.save();
        };
        SettingManager.prototype.hasSetting = function (settingName) {
            if (!settingName)
                throw new Error('Setting name is invalid.');
            return this.settingHelper.hasSetting(settingName);
        };
        SettingManager.prototype.removeSetting = function (settingName) {
            if (!settingName)
                throw new Error('Setting name is invalid.');
            return this.settingHelper.removeSetting(settingName);
        };
        SettingManager.prototype.removeAllSettings = function () {
            this.settingHelper.removeAllSettings();
        };
        SettingManager.prototype.getBoolean = function (settingName, defaultValue) {
            if (!settingName)
                throw new Error('Setting name is invalid.');
            defaultValue = defaultValue || false;
            return this.settingHelper.getBoolean(settingName, defaultValue);
        };
        SettingManager.prototype.setBoolean = function (settingName, value) {
            if (!settingName)
                throw new Error('Setting name is invalid.');
            this.settingHelper.setBoolean(settingName, value);
        };
        SettingManager.prototype.getInteger = function (settingName, defaultValue) {
            if (!settingName)
                throw new Error('Setting name is invalid.');
            defaultValue = defaultValue || 0;
            return this.settingHelper.getInteger(settingName, defaultValue);
        };
        SettingManager.prototype.setInteger = function (settingName, value) {
            if (!settingName)
                throw new Error('Setting name is invalid.');
            this.settingHelper.setInteger(settingName, value);
        };
        SettingManager.prototype.getFloat = function (settingName, defaultValue) {
            if (!settingName)
                throw new Error('Setting name is invalid.');
            defaultValue = defaultValue || Number.NaN;
            return this.settingHelper.getFloat(settingName, defaultValue);
        };
        SettingManager.prototype.setFloat = function (settingName, value) {
            if (!settingName)
                throw new Error('Setting name is invalid.');
            this.settingHelper.setFloat(settingName, value);
        };
        SettingManager.prototype.getString = function (settingName, defaultValue) {
            if (!settingName)
                throw new Error('Setting name is invalid.');
            return this.settingHelper.getString(settingName);
        };
        SettingManager.prototype.setString = function (settingName, value) {
            if (!settingName)
                throw new Error('Setting name is invalid.');
            this.settingHelper.setString(settingName, value);
        };
        SettingManager.prototype.getObject = function (type, settingName, defaultValue) {
            if (!type)
                throw new Error('Object type is invalid.');
            if (!settingName)
                throw new Error('Setting name is invalid.');
            return this.settingHelper.getObject(type, settingName, defaultValue || null);
        };
        SettingManager.prototype.setObject = function (settingName, value) {
            if (!settingName)
                throw new Error('Setting name is invalid.');
            this.settingHelper.setObject(settingName, value);
        };
        SettingManager.prototype.update = function (elapsed, realElapsed) {
            // NOOP.
        };
        SettingManager.prototype.shutdown = function () {
            // NOOP.
        };
        return SettingManager;
    }(Base_1.FrameworkModule)); // class SettingManager
    exports.SettingManager = SettingManager;
});

},{"./Base":1}],13:[function(require,module,exports){
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Base"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Base_1 = require("./Base");
    var Constant;
    (function (Constant) {
        Constant.DefaultTime = 0;
        Constant.DefaultMute = false;
        Constant.DefaultLoop = false;
        Constant.DefaultPriority = 0;
        Constant.DefaultVolume = 1;
        Constant.DefaultFadeInSeconds = 0;
        Constant.DefaultFadeOutSeconds = 0;
        Constant.DefaultPitch = 1;
        Constant.DefaultPanStereo = 0;
        Constant.DefaultSpatialBlend = 0;
        Constant.DefaultMaxDistance = 100;
        Constant.DefaultDopplerLevel = 1;
    })(Constant = exports.Constant || (exports.Constant = {})); // namespace Constant
    var SoundAgent = /** @class */ (function () {
        function SoundAgent(soundGroup, soundHelper, soundAgentHelper) {
            if (!soundGroup)
                throw new Error("Sound group is invalid.");
            if (!soundHelper)
                throw new Error("Sound helper is invalid.");
            if (!soundAgentHelper)
                throw new Error("Sound agent helper is invalid.");
            this.m_pSoundGroup = soundGroup;
            this.m_pSoundHelper = soundHelper;
            this.m_pSoundAgentHelper = soundAgentHelper;
            this.m_pSoundAgentHelper.resetSoundAgent.add(this.onResetSoundAgent, this);
            this.m_iSerialId = 0;
            this.m_pSoundAsset = null;
            this.reset();
        }
        Object.defineProperty(SoundAgent.prototype, "soundGroup", {
            get: function () { return this.m_pSoundGroup; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundAgent.prototype, "serialId", {
            get: function () { return this.m_iSerialId; },
            set: function (value) { this.m_iSerialId = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundAgent.prototype, "isPlaying", {
            get: function () { return this.m_pSoundAgentHelper.isPlaying; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundAgent.prototype, "length", {
            get: function () { return this.m_pSoundAgentHelper.length; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundAgent.prototype, "time", {
            get: function () { return this.m_pSoundAgentHelper.time; },
            set: function (value) { this.m_pSoundAgentHelper.time = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundAgent.prototype, "mute", {
            get: function () { return this.m_pSoundAgentHelper.mute; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundAgent.prototype, "muteInSoundGroup", {
            get: function () { return this.m_bMuteInSoundGroup; },
            set: function (value) {
                this.m_bMuteInSoundGroup = value;
                this.refreshMute();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundAgent.prototype, "loop", {
            get: function () { return this.m_pSoundAgentHelper.loop; },
            set: function (value) { this.m_pSoundAgentHelper.loop = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundAgent.prototype, "priority", {
            get: function () { return this.m_pSoundAgentHelper.priority; },
            set: function (value) { this.m_pSoundAgentHelper.priority = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundAgent.prototype, "volume", {
            get: function () { return this.m_pSoundAgentHelper.volume; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundAgent.prototype, "volumeInSoundGroup", {
            get: function () { return this.m_fVolumeInSoundGroup; },
            set: function (value) {
                this.m_fVolumeInSoundGroup = value;
                this.refreshVolume();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundAgent.prototype, "pitch", {
            get: function () { return this.m_pSoundAgentHelper.pitch; },
            set: function (value) { this.m_pSoundAgentHelper.pitch = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundAgent.prototype, "panStereo", {
            get: function () { return this.m_pSoundAgentHelper.panStereo; },
            set: function (value) { this.m_pSoundAgentHelper.panStereo = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundAgent.prototype, "spatialBlend", {
            get: function () { return this.m_pSoundAgentHelper.spatialBlend; },
            set: function (value) { this.m_pSoundAgentHelper.spatialBlend = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundAgent.prototype, "maxDistance", {
            get: function () { return this.m_pSoundAgentHelper.maxDistance; },
            set: function (value) { this.m_pSoundAgentHelper.maxDistance = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundAgent.prototype, "dopplerLevel", {
            get: function () { return this.m_pSoundAgentHelper.dopplerLevel; },
            set: function (value) { this.m_pSoundAgentHelper.dopplerLevel = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundAgent.prototype, "helper", {
            get: function () { return this.m_pSoundAgentHelper; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundAgent.prototype, "setSoundAssetTime", {
            get: function () { return this.m_fSetSoundAssetTime; },
            enumerable: true,
            configurable: true
        });
        SoundAgent.prototype.play = function (fadeInSeconds) {
            this.m_pSoundAgentHelper.play(fadeInSeconds || Constant.DefaultFadeInSeconds);
        };
        SoundAgent.prototype.stop = function (fadeOutSeconds) {
            this.m_pSoundAgentHelper.stop(fadeOutSeconds || Constant.DefaultFadeOutSeconds);
        };
        SoundAgent.prototype.pause = function (fadeOutSeconds) {
            this.m_pSoundAgentHelper.pause(fadeOutSeconds || Constant.DefaultFadeOutSeconds);
        };
        SoundAgent.prototype.resume = function (fadeInSeconds) {
            this.m_pSoundAgentHelper.resume(fadeInSeconds || Constant.DefaultFadeInSeconds);
        };
        SoundAgent.prototype.reset = function () {
            if (this.m_pSoundAsset) {
                this.m_pSoundHelper.releaseSoundAsset(this.m_pSoundAsset);
                this.m_pSoundAsset = null;
            }
            this.m_fSetSoundAssetTime = NaN;
            this.time = Constant.DefaultTime;
            this.muteInSoundGroup = Constant.DefaultMute;
            this.loop = Constant.DefaultLoop;
            this.priority = Constant.DefaultPriority;
            this.volumeInSoundGroup = Constant.DefaultVolume;
            this.pitch = Constant.DefaultPitch;
            this.panStereo = Constant.DefaultPanStereo;
            this.spatialBlend = Constant.DefaultSpatialBlend;
            this.maxDistance = Constant.DefaultMaxDistance;
            this.dopplerLevel = Constant.DefaultDopplerLevel;
            this.m_pSoundAgentHelper.reset();
        };
        SoundAgent.prototype.setSoundAsset = function (soundAsset) {
            this.reset();
            this.m_pSoundAsset = soundAsset;
            this.m_fSetSoundAssetTime = new Date().valueOf();
            return this.m_pSoundAgentHelper.setSoundAsset(soundAsset);
        };
        SoundAgent.prototype.refreshMute = function () {
            this.m_pSoundAgentHelper.mute = this.m_pSoundGroup.mute || this.m_bMuteInSoundGroup;
        };
        SoundAgent.prototype.refreshVolume = function () {
            this.m_pSoundAgentHelper.volume = this.m_pSoundGroup.volume || this.m_fVolumeInSoundGroup;
        };
        SoundAgent.prototype.onResetSoundAgent = function () {
            this.reset();
        };
        return SoundAgent;
    }()); // class SoundAgent
    exports.SoundAgent = SoundAgent;
    var PlaySoundErrorCode;
    (function (PlaySoundErrorCode) {
        PlaySoundErrorCode[PlaySoundErrorCode["Unknown"] = 0] = "Unknown";
        PlaySoundErrorCode[PlaySoundErrorCode["SoundGroupNotExist"] = 1] = "SoundGroupNotExist";
        PlaySoundErrorCode[PlaySoundErrorCode["SoundGroupHasNoAgent"] = 2] = "SoundGroupHasNoAgent";
        PlaySoundErrorCode[PlaySoundErrorCode["LoadAssetFailure"] = 3] = "LoadAssetFailure";
        PlaySoundErrorCode[PlaySoundErrorCode["IgnoreDueToLowPriority"] = 4] = "IgnoreDueToLowPriority";
        PlaySoundErrorCode[PlaySoundErrorCode["SetSoundAssetFailure"] = 5] = "SetSoundAssetFailure";
    })(PlaySoundErrorCode = exports.PlaySoundErrorCode || (exports.PlaySoundErrorCode = {})); // enum PlaySoundErrorCode
    exports.DefaultPlaySoundParams = {
        time: 0,
        muteInSoundGroup: false,
        loop: false,
        priority: 0,
        volumeInSoundGroup: 1,
        fadeInSeconds: 0,
        pitch: 0,
        panStereo: 0,
        spatialBlend: 0,
        maxDistance: 0,
        dopplerLevel: 0,
        referenced: false
    }; // DefaultPlaySoundParams
    var SoundGroup = /** @class */ (function () {
        function SoundGroup(name, soundGroupHelper) {
            this.m_bAvoidBeingReplacedBySamePriority = false;
            this.m_bMute = false;
            this.m_fVolume = 1;
            if (!name)
                throw new Error("Sound group name is invalid.");
            if (!soundGroupHelper)
                throw new Error("Sound group helper is invalid.");
            this.m_sName = name;
            this.m_pSoundGroupHelper = soundGroupHelper;
            this.m_pSoundAgents = [];
        }
        Object.defineProperty(SoundGroup.prototype, "name", {
            get: function () { return this.m_sName; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundGroup.prototype, "soundAgentCount", {
            get: function () {
                return this.m_pSoundAgents.length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundGroup.prototype, "avoidBeingReplacedBySamePriority", {
            get: function () { return this.m_bAvoidBeingReplacedBySamePriority; },
            set: function (value) {
                this.m_bAvoidBeingReplacedBySamePriority = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundGroup.prototype, "mute", {
            get: function () { return this.m_bMute; },
            set: function (value) {
                var e_1, _a;
                this.m_bMute = value;
                try {
                    for (var _b = __values(this.m_pSoundAgents), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var agent = _c.value;
                        agent.refreshMute();
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundGroup.prototype, "volume", {
            get: function () { return this.m_fVolume; },
            set: function (value) {
                var e_2, _a;
                this.m_fVolume = value;
                try {
                    for (var _b = __values(this.m_pSoundAgents), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var agent = _c.value;
                        agent.refreshVolume();
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundGroup.prototype, "helper", {
            get: function () { return this.m_pSoundGroupHelper; },
            enumerable: true,
            configurable: true
        });
        SoundGroup.prototype.addSoundAgentHelper = function (soundHelper, soundAgentHelper) {
            this.m_pSoundAgents.push(new SoundAgent(this, soundHelper, soundAgentHelper));
        };
        SoundGroup.prototype.playSound = function (serialId, soundAsset, playSoundParams, errorCode) {
            var e_3, _a;
            errorCode = errorCode || { code: 0 };
            var v_pCandidateAgent;
            try {
                for (var _b = __values(this.m_pSoundAgents), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var soundAgent = _c.value;
                    if (!soundAgent.isPlaying) {
                        v_pCandidateAgent = soundAgent;
                        break;
                    }
                    if (soundAgent.priority < playSoundParams.priority) {
                        if (!v_pCandidateAgent || soundAgent.priority < v_pCandidateAgent.priority) {
                            v_pCandidateAgent = soundAgent;
                        }
                    }
                    else if (!this.m_bAvoidBeingReplacedBySamePriority && soundAgent.priority == playSoundParams.priority) {
                        if (!v_pCandidateAgent || soundAgent.setSoundAssetTime < v_pCandidateAgent.setSoundAssetTime) {
                            v_pCandidateAgent = soundAgent;
                        }
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            if (!v_pCandidateAgent) {
                errorCode.code = PlaySoundErrorCode.IgnoreDueToLowPriority;
                return null;
            }
            if (!v_pCandidateAgent.setSoundAsset(soundAsset)) {
                errorCode.code = PlaySoundErrorCode.SetSoundAssetFailure;
                return null;
            }
            v_pCandidateAgent.serialId = serialId;
            v_pCandidateAgent.time = playSoundParams.time;
            v_pCandidateAgent.muteInSoundGroup = playSoundParams.muteInSoundGroup;
            v_pCandidateAgent.loop = playSoundParams.loop;
            v_pCandidateAgent.priority = playSoundParams.priority;
            v_pCandidateAgent.volumeInSoundGroup = playSoundParams.volumeInSoundGroup;
            v_pCandidateAgent.pitch = playSoundParams.pitch;
            v_pCandidateAgent.panStereo = playSoundParams.panStereo;
            v_pCandidateAgent.spatialBlend = playSoundParams.spatialBlend;
            v_pCandidateAgent.maxDistance = playSoundParams.maxDistance;
            v_pCandidateAgent.dopplerLevel = playSoundParams.dopplerLevel;
            v_pCandidateAgent.play(playSoundParams.fadeInSeconds);
            return v_pCandidateAgent;
        };
        SoundGroup.prototype.stopSound = function (serialId, fadeOutSeconds) {
            var e_4, _a;
            try {
                for (var _b = __values(this.m_pSoundAgents), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var soundAgent = _c.value;
                    if (soundAgent.serialId != serialId) {
                        continue;
                    }
                    soundAgent.stop(fadeOutSeconds);
                    return true;
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return false;
        };
        SoundGroup.prototype.pauseSound = function (serialId, fadeOutSeconds) {
            var e_5, _a;
            try {
                for (var _b = __values(this.m_pSoundAgents), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var soundAgent = _c.value;
                    if (soundAgent.serialId != serialId)
                        continue;
                    soundAgent.pause(fadeOutSeconds);
                    return true;
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
            return false;
        };
        SoundGroup.prototype.resumeSound = function (serialId, fadeInSeconds) {
            var e_6, _a;
            try {
                for (var _b = __values(this.m_pSoundAgents), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var soundAgent = _c.value;
                    if (soundAgent.serialId != serialId)
                        continue;
                    soundAgent.resume(fadeInSeconds);
                    return true;
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_6) throw e_6.error; }
            }
            return false;
        };
        SoundGroup.prototype.stopAllLoadedSounds = function (fadeOutSeconds) {
            var e_7, _a;
            fadeOutSeconds = fadeOutSeconds || Constant.DefaultFadeOutSeconds;
            try {
                for (var _b = __values(this.m_pSoundAgents), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var soundAgent = _c.value;
                    if (soundAgent.isPlaying)
                        soundAgent.stop();
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_7) throw e_7.error; }
            }
        };
        return SoundGroup;
    }()); // class SoundGroup
    exports.SoundGroup = SoundGroup;
    var SoundManager = /** @class */ (function (_super) {
        __extends(SoundManager, _super);
        function SoundManager() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.m_pSoundGroups = new Map();
            _this.m_pSoundsBeingLoaded = new Set();
            _this.m_pSoundsToReleaseOnLoad = new Set();
            _this.m_pLoadAssetCallbacks = {
                success: _this.onLoadSoundSuccessCallback.bind(_this),
                failure: _this.onLoadSoundFailureCallback.bind(_this),
                update: _this.onLoadSoundUpdateCallback.bind(_this),
                dependency: _this.onLoadSoundDependencyAssetCallback.bind(_this)
            };
            _this.m_iSerial = 0;
            _this.m_pPlaySoundSuccessDelegate = new Base_1.EventHandler();
            _this.m_pPlaySoundFailureDelegate = new Base_1.EventHandler();
            _this.m_pPlaySoundUpdateDelegate = new Base_1.EventHandler();
            _this.m_pPlaySoundDependencyAssetDelegate = new Base_1.EventHandler();
            return _this;
        }
        Object.defineProperty(SoundManager.prototype, "soundGroupCount", {
            get: function () {
                return this.m_pSoundGroups.size;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundManager.prototype, "playSoundSuccess", {
            get: function () {
                return this.m_pPlaySoundSuccessDelegate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundManager.prototype, "playSoundFailure", {
            get: function () {
                return this.m_pPlaySoundFailureDelegate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundManager.prototype, "playSoundUpdate", {
            get: function () {
                return this.m_pPlaySoundUpdateDelegate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundManager.prototype, "playSoundDependencyAsset", {
            get: function () {
                return this.m_pPlaySoundDependencyAssetDelegate;
            },
            enumerable: true,
            configurable: true
        });
        SoundManager.prototype.update = function (elapsed, realElapsed) {
            // NOOP.
        };
        SoundManager.prototype.shutdown = function () {
            this.stopAllLoadedSounds();
            this.m_pSoundGroups.clear();
            this.m_pSoundsBeingLoaded.clear();
            this.m_pSoundsToReleaseOnLoad.clear();
        };
        Object.defineProperty(SoundManager.prototype, "resourceManager", {
            get: function () { return this.m_pResourceManager; },
            set: function (value) { this.m_pResourceManager = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundManager.prototype, "soundHelper", {
            get: function () { return this.m_pSoundHelper; },
            set: function (value) { this.m_pSoundHelper = value; },
            enumerable: true,
            configurable: true
        });
        SoundManager.prototype.hasSoundGroup = function (soundGroupName) {
            if (!soundGroupName)
                throw new Error("Sound group name is invalid.");
            return this.m_pSoundGroups.has(soundGroupName);
        };
        SoundManager.prototype.getSoundGroup = function (soundGroupName) {
            if (!soundGroupName)
                throw new Error("Sound group name is invalid.");
            return this.m_pSoundGroups.get(soundGroupName) || null;
        };
        SoundManager.prototype.getAllSoundGroups = function (results) {
            var e_8, _a;
            results = results || [];
            if (results.length > 0)
                results.splice(0, results.length);
            try {
                for (var _b = __values(this.m_pSoundGroups.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var soundGroup = _c.value;
                    results.push(soundGroup);
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_8) throw e_8.error; }
            }
            return results;
        };
        SoundManager.prototype.addSoundGroup = function (soundGroupName, anyArg, soundGroupMute, soundGroupVolume, soundGroupHelper) {
            if (!soundGroupName)
                throw new Error("Sound group name is invalid.");
            var soundGroupAvoidBeingReplacedBySamePriority = false;
            if ('boolean' === typeof anyArg) {
                soundGroupAvoidBeingReplacedBySamePriority = anyArg;
            }
            else {
                soundGroupHelper = anyArg;
            }
            soundGroupMute = soundGroupMute || Constant.DefaultMute;
            soundGroupVolume = soundGroupVolume || Constant.DefaultVolume;
            if (!soundGroupHelper)
                throw new Error("Sound group helper is invalid.");
            if (this.hasSoundGroup(soundGroupName))
                return false;
            var v_pSoundGroup = new SoundGroup(soundGroupName, soundGroupHelper);
            v_pSoundGroup.avoidBeingReplacedBySamePriority = soundGroupAvoidBeingReplacedBySamePriority;
            v_pSoundGroup.mute = soundGroupMute;
            v_pSoundGroup.volume = soundGroupVolume;
            this.m_pSoundGroups.set(soundGroupName, v_pSoundGroup);
            return true;
        };
        SoundManager.prototype.addSoundAgentHelper = function (soundGroupName, soundAgentHelper) {
            if (!this.m_pSoundHelper)
                throw new Error("You must set sound helper first.");
            var v_pSoundGroup = this.getSoundGroup(soundGroupName);
            if (!v_pSoundGroup)
                throw new Error("Sound group '" + soundGroupName + "' is not exist.");
            v_pSoundGroup.addSoundAgentHelper(this.m_pSoundHelper, soundAgentHelper);
        };
        SoundManager.prototype.getAllLoadingSoundSerialIds = function (results) {
            var v_pRet = results || [];
            v_pRet.splice(0, v_pRet.length);
            this.m_pSoundsBeingLoaded.forEach(function (v) {
                v_pRet.push(v);
            });
            return v_pRet;
        };
        SoundManager.prototype.isLoadingSound = function (serialId) {
            return this.m_pSoundsBeingLoaded.has(serialId);
        };
        SoundManager.prototype.playSound = function (soundAssetName, soundGroupName, anyArg1, anyArg2, anyArg3) {
            if (!this.m_pResourceManager)
                throw new Error("You must set resource manager first.");
            if (!this.m_pSoundHelper)
                throw new Error("You must set sound helper first.");
            var priority = Constant.DefaultPriority;
            var playSoundParams = null;
            var userData = null;
            if (arguments.length > 2) {
                if ('number' === typeof anyArg1) {
                    priority = anyArg1;
                }
                else if (undefined != anyArg1) {
                    playSoundParams = anyArg1;
                    userData = anyArg1;
                }
                if (arguments.length == 4) {
                    playSoundParams = anyArg2;
                    userData = anyArg2;
                }
                else if (arguments.length == 5) {
                    playSoundParams = anyArg2;
                    userData = anyArg3;
                }
            }
            var v_iSerialId = this.m_iSerial++;
            var v_pErrorCode;
            var v_sErrorMessage;
            var v_pSoundGroup = this.getSoundGroup(soundGroupName);
            if (!v_pSoundGroup) {
                v_pErrorCode = PlaySoundErrorCode.SoundGroupNotExist;
                v_sErrorMessage = "Sound group '" + soundGroupName + "' is not exist.";
            }
            else if (v_pSoundGroup.soundAgentCount <= 0) {
                v_pErrorCode = PlaySoundErrorCode.SoundGroupHasNoAgent;
                v_sErrorMessage = "Sound group '" + soundGroupName + "' is have no sound agent.";
            }
            if (v_pErrorCode) {
                if (this.m_pPlaySoundFailureDelegate.isValid) {
                    this.m_pPlaySoundFailureDelegate.iter(function (callbackFn) {
                        callbackFn(v_iSerialId, soundAssetName, soundGroupName, playSoundParams, v_pErrorCode, v_sErrorMessage, userData);
                    });
                    return v_iSerialId;
                }
                throw new Error(v_sErrorMessage);
            }
            this.m_pSoundsBeingLoaded.add(v_iSerialId);
            this.m_pResourceManager.loadAsset(soundAssetName, priority, this.m_pLoadAssetCallbacks, {
                serialId: v_iSerialId,
                soundGroup: v_pSoundGroup,
                playSoundParams: playSoundParams,
                userData: userData
            });
            return v_iSerialId;
        };
        SoundManager.prototype.stopSound = function (serialId, fadeOutSeconds) {
            var e_9, _a;
            fadeOutSeconds = fadeOutSeconds || Constant.DefaultFadeOutSeconds;
            if (this.isLoadingSound(serialId)) {
                this.m_pSoundsToReleaseOnLoad.add(serialId);
                this.m_pSoundsBeingLoaded.delete(serialId);
                return true;
            }
            try {
                for (var _b = __values(this.m_pSoundGroups.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var soundGroup = _c.value;
                    if (soundGroup.stopSound(serialId, fadeOutSeconds)) {
                        return true;
                    }
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_9) throw e_9.error; }
            }
            return false;
        };
        SoundManager.prototype.stopAllLoadedSounds = function (fadeOutSeconds) {
            var e_10, _a;
            fadeOutSeconds = fadeOutSeconds || Constant.DefaultFadeOutSeconds;
            try {
                for (var _b = __values(this.m_pSoundGroups.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var soundGroup = _c.value;
                    soundGroup.stopAllLoadedSounds(fadeOutSeconds);
                }
            }
            catch (e_10_1) { e_10 = { error: e_10_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_10) throw e_10.error; }
            }
        };
        SoundManager.prototype.stopAllLoadingSounds = function () {
            var e_11, _a;
            try {
                for (var _b = __values(this.m_pSoundsBeingLoaded.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var serialId = _c.value;
                    this.m_pSoundsToReleaseOnLoad.add(serialId);
                }
            }
            catch (e_11_1) { e_11 = { error: e_11_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_11) throw e_11.error; }
            }
        };
        SoundManager.prototype.pauseSound = function (serialId, fadeOutSeconds) {
            var e_12, _a;
            fadeOutSeconds = fadeOutSeconds || Constant.DefaultFadeOutSeconds;
            try {
                for (var _b = __values(this.m_pSoundGroups.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var soundGroup = _c.value;
                    if (soundGroup.pauseSound(serialId, fadeOutSeconds))
                        return;
                }
            }
            catch (e_12_1) { e_12 = { error: e_12_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_12) throw e_12.error; }
            }
            throw new Error("Can not find sound '" + serialId + "'.");
        };
        SoundManager.prototype.resumeSound = function (serialId, fadeInSeconds) {
            var e_13, _a;
            fadeInSeconds = fadeInSeconds || Constant.DefaultFadeInSeconds;
            try {
                for (var _b = __values(this.m_pSoundGroups.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var soundGroup = _c.value;
                    if (soundGroup.resumeSound(serialId, fadeInSeconds))
                        return;
                }
            }
            catch (e_13_1) { e_13 = { error: e_13_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_13) throw e_13.error; }
            }
            throw new Error("Can not find sound '" + serialId + "'.");
        };
        SoundManager.prototype.onLoadSoundSuccessCallback = function (soundAssetName, soundAsset, duration, userData) {
            var v_pInfo = userData;
            if (!v_pInfo)
                throw new Error("Play sound info is invalid.");
            if (this.m_pSoundsToReleaseOnLoad.has(v_pInfo.serialId)) {
                this.m_pSoundsToReleaseOnLoad.delete(v_pInfo.serialId);
                return;
            }
            this.m_pSoundsBeingLoaded.delete(v_pInfo.serialId);
            var v_pErrorCodeOut = { code: 0 };
            var v_pSoundAgent = v_pInfo.soundGroup.playSound(v_pInfo.serialId, soundAsset, v_pInfo.playSoundParams, v_pErrorCodeOut);
            if (v_pSoundAgent) {
                if (this.m_pPlaySoundSuccessDelegate.isValid) {
                    this.m_pPlaySoundSuccessDelegate.iter(function (callbackFn) {
                        if (v_pInfo)
                            callbackFn(v_pInfo.serialId, soundAssetName, v_pSoundAgent, duration, v_pInfo.userData);
                    });
                }
                return;
            }
            this.m_pSoundsToReleaseOnLoad.delete(v_pInfo.serialId);
            this.m_pSoundHelper.releaseSoundAsset(soundAsset);
            var v_sErrorMessage = "Sound group '" + v_pInfo.soundGroup.name + "' play sound '" + soundAssetName + "' failure.";
            if (this.m_pPlaySoundFailureDelegate.isValid) {
                this.m_pPlaySoundFailureDelegate.iter(function (callbackFn) {
                    if (v_pInfo)
                        callbackFn(v_pInfo.serialId, soundAssetName, v_pInfo.soundGroup.name, v_pInfo.playSoundParams, v_pErrorCodeOut.code, v_sErrorMessage, v_pInfo.userData);
                });
            }
            throw new Error(v_sErrorMessage);
        };
        SoundManager.prototype.onLoadSoundFailureCallback = function (soundAssetName, status, errorMessage, userData) {
            var v_pInfo = userData;
            if (!v_pInfo)
                throw new Error("Play sound info is invalid.");
            if (this.m_pSoundsToReleaseOnLoad.has(v_pInfo.serialId)) {
                this.m_pSoundsToReleaseOnLoad.delete(v_pInfo.serialId);
                return;
            }
            this.m_pSoundsBeingLoaded.delete(v_pInfo.serialId);
            var v_sErrorMessage = "Load sound failure, asset name '" + soundAssetName + "', status '" + status + "', error message '" + errorMessage + "'";
            if (this.m_pPlaySoundFailureDelegate.isValid) {
                this.m_pPlaySoundFailureDelegate.iter(function (callbackFn) {
                    if (v_pInfo)
                        callbackFn(v_pInfo.serialId, soundAssetName, v_pInfo.soundGroup.name, v_pInfo.playSoundParams, PlaySoundErrorCode.LoadAssetFailure, v_sErrorMessage, v_pInfo.userData);
                });
                return;
            }
            throw new Error(v_sErrorMessage);
        };
        SoundManager.prototype.onLoadSoundUpdateCallback = function (soundAssetName, progress, userData) {
            var v_pInfo = userData;
            if (!v_pInfo)
                throw new Error("Play sound info is invalid.");
            if (this.m_pPlaySoundUpdateDelegate.isValid) {
                this.m_pPlaySoundUpdateDelegate.iter(function (callbackFn) {
                    if (v_pInfo)
                        callbackFn(v_pInfo.serialId, soundAssetName, v_pInfo.soundGroup.name, v_pInfo.playSoundParams, progress, v_pInfo.userData);
                });
            }
        };
        SoundManager.prototype.onLoadSoundDependencyAssetCallback = function (soundAssetName, dependencyAssetName, loadedCount, totalCount, userData) {
            var v_pInfo = userData;
            if (!v_pInfo)
                throw new Error("Play sound info is invalid.");
            if (this.m_pPlaySoundDependencyAssetDelegate.isValid) {
                this.m_pPlaySoundDependencyAssetDelegate.iter(function (callbackFn) {
                    if (v_pInfo)
                        callbackFn(v_pInfo.serialId, soundAssetName, v_pInfo.soundGroup.name, v_pInfo.playSoundParams, dependencyAssetName, loadedCount, totalCount, v_pInfo.userData);
                });
            }
        };
        return SoundManager;
    }(Base_1.FrameworkModule)); // class SoundManager
    exports.SoundManager = SoundManager;
});

},{"./Base":1}],14:[function(require,module,exports){
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Base", "./ObjectPool"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Base_1 = require("./Base");
    var ObjectPool_1 = require("./ObjectPool");
    var UIManager = /** @class */ (function (_super) {
        __extends(UIManager, _super);
        function UIManager() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.m_rUIGroups = new Map();
            _this.m_iSerialId = 0;
            _this.m_bIsShutdown = false;
            _this.m_rUIFormsBeingLoaded = new Map();
            _this.m_rUIFormsToReleaseOnLoad = new Set();
            _this.m_pRecycleQueue = [];
            _this.m_pLoadAssetCallbacks = {
                success: _this.loadUIFormSuccessCallback.bind(_this),
                failure: _this.loadUIFormFailureCallback.bind(_this),
                update: _this.loadUIFormUpdateCallback.bind(_this),
                dependency: _this.loadUIFormDependencyAssetCallback.bind(_this),
            };
            _this.m_pOpenUIFormSuccessDelegate = new Base_1.EventHandler();
            _this.m_pOpenUIFormFailureDelegate = new Base_1.EventHandler();
            _this.m_pOpenUIFormUpdateDelegate = new Base_1.EventHandler();
            _this.m_pOpenUIFormDependencyAssetDelegate = new Base_1.EventHandler();
            _this.m_pCloseUIFormCompleteDelegate = new Base_1.EventHandler();
            _this.m_fInstanceAutoReleaseInterval = 0;
            _this.m_uInstanceCapacity = 0;
            _this.m_fInstanceExpireTime = 0;
            _this.m_iInstancePriority = 0;
            return _this;
            // private fireOpenUIFormComplete(error: Error, uiFormAssetName: string, uiFormAsset: object, duration: number, info: OpenUIFormInfo): void {
            // this.m_rUIFormsBeingLoaded.delete(info.serialId);
            // if (this.m_rUIFormsToReleaseOnLoad.has(info.serialId)) {
            // this.m_rUIFormsToReleaseOnLoad.delete(info.serialId);
            // if (!error)
            // this.m_pUIFormHelper.releaseUIForm(uiFormAsset as object, null);
            // }
            // let uiForm: IUIForm = null;
            // if (!error) {
            // let v_pUiFormInstanceObject: UIFormInstanceObject = UIFormInstanceObject.create(uiFormAssetName, uiFormAsset, this.m_pUIFormHelper.instantiateUIForm(uiFormAsset as object), this.m_pUIFormHelper);
            // // Register to pool and mark spawn flag.
            // if (!this.m_pInstancePool.has(uiFormAssetName)) {
            // this.m_pInstancePool.set(uiFormAssetName, []);
            // }
            // let v_pInstanceObjects: UIFormInstanceObject[] = this.m_pInstancePool.get(uiFormAssetName);
            // if (v_pInstanceObjects.length < this.m_uInstanceCapacity) {
            // v_pUiFormInstanceObject.spawn = true;
            // v_pInstanceObjects.push(v_pUiFormInstanceObject);
            // }
            // this.openUIFormInternal(info.serialId, uiFormAssetName, info.uiGroup as UIGroup, v_pUiFormInstanceObject.target, info.pauseCoveredUIForm, true, duration, info.userData);
            // } else {
            // let eventArgs: OpenUIFormFailureEventArgs = {
            // errorMessage: error.message,
            // serialId: info.serialId,
            // pauseCoveredUIForm: info.pauseCoveredUIForm,
            // uiGroupName: info.uiGroup.name,
            // uiFormAssetName: uiFormAssetName,
            // userData: info.userData
            // };
            // this.m_pOpenUIFormFailureDelegate.iter((callbackFn: OpenUIFormFailureEventHandler) => {
            // callbackFn(eventArgs);
            // });
            // }
            // }
            // private fireOpenUIFormProgress(uiFormAssetName: string, progress: number, info: OpenUIFormInfo): void {
            // let eventArgs: OpenUIFormUpdateEventArgs = {
            // serialId: info.serialId,
            // pauseCoveredUIForm: info.pauseCoveredUIForm,
            // progress: progress,
            // uiFormAssetName: uiFormAssetName,
            // uiGroupName: info.uiGroup.name,
            // userData: info.userData
            // };
            // this.m_pOpenUIFormUpdateDelegate.iter((callbackFn: OpenUIFormUpdateEventHandler) => {
            // callbackFn(eventArgs);
            // });
            // }
        }
        Object.defineProperty(UIManager.prototype, "uiFormHelper", {
            get: function () { return this.m_pUIFormHelper; },
            set: function (value) {
                if (!value)
                    throw new Error('UI form helper is invalid.');
                this.m_pUIFormHelper = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIManager.prototype, "resourceManager", {
            get: function () {
                return this.m_pResourceManager;
            },
            set: function (value) {
                if (null == value)
                    throw new Error("Resource manager is invalid.");
                this.m_pResourceManager = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIManager.prototype, "objectPoolManager", {
            get: function () {
                return this.m_pObjectPoolManager;
            },
            set: function (value) {
                if (null == value)
                    throw new Error('ObjectPool manager is invalid.');
                this.m_pObjectPoolManager = value;
                this.m_pInstancePool = this.m_pObjectPoolManager.createSingleSpawnObjectPool({
                    name: "UI Instance Pool"
                });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIManager.prototype, "uiGroupCount", {
            get: function () {
                return this.m_rUIGroups.size;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIManager.prototype, "openUIFormSuccess", {
            get: function () { return this.m_pOpenUIFormSuccessDelegate; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIManager.prototype, "openUIFormFailure", {
            get: function () { return this.m_pOpenUIFormFailureDelegate; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIManager.prototype, "openUIFormUpdate", {
            get: function () { return this.m_pOpenUIFormUpdateDelegate; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIManager.prototype, "openUIFormDependencyAsset", {
            get: function () { return this.m_pOpenUIFormDependencyAssetDelegate; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIManager.prototype, "closeUIFormComplete", {
            get: function () { return this.m_pCloseUIFormCompleteDelegate; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIManager.prototype, "instanceAutoReleaseInterval", {
            get: function () { return this.m_fInstanceAutoReleaseInterval; },
            set: function (value) { this.m_fInstanceAutoReleaseInterval = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIManager.prototype, "instanceCapacity", {
            get: function () { return this.m_uInstanceCapacity; },
            set: function (value) { this.m_uInstanceCapacity = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIManager.prototype, "instanceExpireTime", {
            get: function () { return this.m_fInstanceExpireTime; },
            set: function (value) { this.m_fInstanceExpireTime = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIManager.prototype, "instancePriority", {
            get: function () { return this.m_iInstancePriority; },
            set: function (value) { this.m_iInstancePriority = value; },
            enumerable: true,
            configurable: true
        });
        UIManager.prototype.update = function (elapsed, realElapsed) {
            var e_1, _a;
            try {
                for (var _b = __values(this.m_pRecycleQueue), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var uiForm = _c.value;
                    uiForm.onRecycle();
                    this.m_pInstancePool.unspawnByTarget(uiForm.handle);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (this.m_pRecycleQueue.length)
                this.m_pRecycleQueue.splice(0, this.m_pRecycleQueue.length);
            this.m_rUIGroups.forEach(function (uiGroup, key) {
                var v_pUiGroup = uiGroup;
                v_pUiGroup.update(elapsed, realElapsed);
            });
        };
        UIManager.prototype.shutdown = function () {
            this.m_bIsShutdown = true;
            this.closeAllLoadedUIForms();
            this.m_rUIGroups.clear();
            this.m_rUIFormsBeingLoaded.clear();
            this.m_rUIFormsToReleaseOnLoad.clear();
            this.m_pRecycleQueue.splice(0, this.m_pRecycleQueue.length);
        };
        UIManager.prototype.openUIForm = function (uiFormAssetName, uiGroupName, priority, pauseCoveredUIForm, userData) {
            // cc.log(`[UIManager] Reqeust Open UIForm asset '${uiFormAssetName}' with group '${uiGroupName}' on priority '${priority}', pauseCoveredUIForm: ${pauseCoveredUIForm}, userData: ${userData}`);
            if (null == this.m_pResourceManager)
                throw new Error("You must set resource manager first.");
            if (null == this.m_pUIFormHelper)
                throw new Error("You must set UI form helper first.");
            if (!uiFormAssetName)
                throw new Error('UI form asset name is invalid.');
            if (!uiGroupName)
                throw new Error('UI group name is invalid.');
            var v_rUIGroup = this.getUIGroup(uiGroupName);
            if (null == v_rUIGroup) {
                throw new Error("UI group '" + uiGroupName + "' is not exist.");
            }
            var v_iSerialId = ++this.m_iSerialId;
            var v_pUiFormInstanceObject = this.m_pInstancePool.spawn(uiFormAssetName);
            if (null == v_pUiFormInstanceObject) {
                if (this.m_rUIFormsBeingLoaded.has(v_iSerialId))
                    throw new Error("Key duplicated with: " + v_iSerialId);
                this.m_rUIFormsBeingLoaded.set(v_iSerialId, uiFormAssetName);
                var v_rOpenUiFormInfo = {
                    serialId: v_iSerialId,
                    uiGroup: v_rUIGroup,
                    pauseCoveredUIForm: pauseCoveredUIForm,
                    userData: userData
                };
                this.m_pResourceManager.loadAsset(uiFormAssetName, priority, this.m_pLoadAssetCallbacks, v_rOpenUiFormInfo);
            }
            else {
                this.openUIFormInternal(v_iSerialId, uiFormAssetName, v_rUIGroup, v_pUiFormInstanceObject.target, pauseCoveredUIForm, false, 0, userData);
            }
            return v_iSerialId;
        };
        UIManager.prototype.isLoadingUIForm = function (serialIdOrAssetName) {
            var e_2, _a;
            if ('string' === typeof serialIdOrAssetName) {
                try {
                    for (var _b = __values(this.m_rUIFormsBeingLoaded.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var uiFormAssetName = _c.value;
                        if (uiFormAssetName === serialIdOrAssetName)
                            return true;
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                return false;
            }
            else {
                return this.m_rUIFormsBeingLoaded.has(serialIdOrAssetName);
            }
        };
        UIManager.prototype.getUIForms = function (uiFormAssetName) {
            var e_3, _a;
            var v_rRet = [];
            try {
                for (var _b = __values(this.m_rUIGroups.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var uiGroup = _c.value;
                    if (null != uiGroup) {
                        var v_pForms = uiGroup.getUIForms(uiFormAssetName);
                        v_rRet = v_rRet.concat(v_pForms);
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return v_rRet;
        };
        UIManager.prototype.getUIForm = function (serialIdOrAssetName) {
            var e_4, _a;
            if ('string' === typeof serialIdOrAssetName) {
                if (!serialIdOrAssetName)
                    throw new Error('UI form asset name is invalid.');
            }
            var uiForm;
            try {
                for (var _b = __values(this.m_rUIGroups.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var uiGroup = _c.value;
                    if ((uiForm = uiGroup.getUIForm(serialIdOrAssetName))) {
                        return uiForm;
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return null;
        };
        UIManager.prototype.hasUIForm = function (serialIdOrAssetName) {
            return null != this.getUIForm(serialIdOrAssetName);
        };
        UIManager.prototype.closeUIForm = function (serialIdOrUiForm, userData) {
            var uiForm = serialIdOrUiForm;
            if ('number' === typeof serialIdOrUiForm) {
                if (this.isLoadingUIForm(serialIdOrUiForm)) {
                    this.m_rUIFormsToReleaseOnLoad.add(serialIdOrUiForm);
                    this.m_rUIFormsBeingLoaded.delete(serialIdOrUiForm);
                    return;
                }
                uiForm = this.getUIForm(serialIdOrUiForm);
                if (null == uiForm) {
                    throw new Error("Can not find UI form '" + serialIdOrUiForm + "'");
                }
            }
            if (!uiForm)
                throw new Error('UI form is invalid.');
            var uiGroup = uiForm.uiGroup;
            if (null == uiGroup)
                throw new Error('UI group is invalid.');
            userData = userData || null;
            uiGroup.removeUIForm(uiForm);
            uiForm.onClose(this.m_bIsShutdown, userData);
            uiGroup.refresh();
            var eventArgs = {
                serialId: uiForm.serialId,
                uiGroup: uiGroup,
                uiFormAssetName: uiForm.uiFormAssetName,
                userData: userData
            };
            this.m_pCloseUIFormCompleteDelegate.iter(function (callbackFn) {
                callbackFn(eventArgs);
            });
            this.m_pRecycleQueue.push(uiForm);
        };
        UIManager.prototype.getAllLoadedUIForms = function () {
            var e_5, _a;
            var v_pRet = [];
            try {
                for (var _b = __values(this.m_rUIGroups.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var uiGroup = _c.value;
                    v_pRet.concat(uiGroup.getAllUIForms());
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
            return v_pRet;
        };
        UIManager.prototype.closeAllLoadedUIForms = function (userData) {
            var e_6, _a;
            var v_pUIForms = this.getAllLoadedUIForms();
            try {
                for (var v_pUIForms_1 = __values(v_pUIForms), v_pUIForms_1_1 = v_pUIForms_1.next(); !v_pUIForms_1_1.done; v_pUIForms_1_1 = v_pUIForms_1.next()) {
                    var uiForm = v_pUIForms_1_1.value;
                    if (!this.hasUIForm(uiForm.serialId))
                        continue;
                    this.closeUIForm(uiForm, userData);
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (v_pUIForms_1_1 && !v_pUIForms_1_1.done && (_a = v_pUIForms_1.return)) _a.call(v_pUIForms_1);
                }
                finally { if (e_6) throw e_6.error; }
            }
        };
        UIManager.prototype.closeAllLoadingUIForms = function () {
            var e_7, _a;
            try {
                for (var _b = __values(this.m_rUIFormsBeingLoaded.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var serialId = _c.value;
                    this.m_rUIFormsToReleaseOnLoad.add(serialId);
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_7) throw e_7.error; }
            }
            this.m_rUIFormsBeingLoaded.clear();
        };
        UIManager.prototype.refocusUIForm = function (uiForm, userData) {
            if (null == uiForm)
                throw new Error('UI form is invalid.');
            var uiGroup = uiForm.uiGroup;
            if (null == uiGroup)
                throw new Error('UI group is invalid.');
            userData = userData || null;
            uiGroup.refocusUIForm(uiForm, userData);
            uiGroup.refresh();
            uiForm.onRefocus(userData);
        };
        UIManager.prototype.hasUIGroup = function (uiGroupName) {
            if (!uiGroupName)
                throw new Error('UI group name is invalid.');
            return this.m_rUIGroups.has(uiGroupName);
        };
        UIManager.prototype.getUIGroup = function (uiGroupName) {
            if (!uiGroupName)
                throw new Error('UI group name is invalid.');
            return this.m_rUIGroups.get(uiGroupName) || null;
        };
        UIManager.prototype.addUIGroup = function (uiGroupName, arg1, arg2) {
            if (!uiGroupName)
                throw new Error('UI group name is invalid.');
            var uiGroupDepth = 0;
            var uiGroupHelper;
            if ('number' === typeof arg1) {
                uiGroupDepth = arg1;
                if (undefined != arg2) {
                    uiGroupHelper = arg2;
                }
            }
            else {
                uiGroupHelper = arg1;
            }
            if (!uiGroupHelper)
                throw new Error('UI group helper is invalid.');
            if (this.hasUIGroup(uiGroupName))
                return false;
            this.m_rUIGroups.set(uiGroupName, new UIGroup(uiGroupName, uiGroupDepth, uiGroupHelper));
            return true;
        };
        UIManager.prototype.openUIFormInternal = function (serialId, uiFormAssetName, uiGroup, uiFormInstance, pauseCoveredUIForm, isNewInstance, duration, userData) {
            var uiForm = this.m_pUIFormHelper.createUIForm(uiFormInstance, uiGroup, userData);
            if (null == uiForm)
                throw new Error('Can not create UI form in helper.');
            uiForm.onInit(serialId, uiFormAssetName, uiGroup, pauseCoveredUIForm, isNewInstance, userData);
            uiGroup.addUIForm(uiForm);
            uiForm.onOpen(userData);
            uiGroup.refresh();
            var eventArgs = {
                duration: duration,
                uiForm: uiForm,
                userData: userData
            };
            this.m_pOpenUIFormSuccessDelegate.iter(function (callbackFn) {
                callbackFn(eventArgs);
            });
        };
        UIManager.prototype.loadUIFormSuccessCallback = function (uiFormAssetName, uiFormAsset, duration, userData) {
            var v_pInfo = userData;
            if (null == v_pInfo)
                throw new Error("Open UI form info is invalid.");
            if (this.m_rUIFormsToReleaseOnLoad.has(v_pInfo.serialId)) {
                this.m_rUIFormsToReleaseOnLoad.delete(v_pInfo.serialId);
                this.m_pUIFormHelper.releaseUIForm(uiFormAsset, null);
                return;
            }
            this.m_rUIFormsBeingLoaded.delete(v_pInfo.serialId);
            var v_pUiFormInstanceObject = UIFormInstanceObject.create(uiFormAssetName, uiFormAsset, this.m_pUIFormHelper.instantiateUIForm(uiFormAsset), this.m_pUIFormHelper);
            this.m_pInstancePool.register(v_pUiFormInstanceObject, true);
            this.openUIFormInternal(v_pInfo.serialId, uiFormAssetName, v_pInfo.uiGroup, v_pUiFormInstanceObject.target, v_pInfo.pauseCoveredUIForm, true, duration, v_pInfo.userData);
        };
        UIManager.prototype.loadUIFormFailureCallback = function (uiFormAssetName, status, errorMessage, userData) {
            var v_pInfo = userData;
            if (null == v_pInfo)
                throw new Error("Open UI form info is invalid.");
            if (this.m_rUIFormsToReleaseOnLoad.has(v_pInfo.serialId)) {
                this.m_rUIFormsToReleaseOnLoad.delete(v_pInfo.serialId);
                return;
            }
            this.m_rUIFormsBeingLoaded.delete(v_pInfo.serialId);
            var appendErrorMessage = "Load UI form failure, asset name '" + uiFormAssetName + "', status '" + status.toString() + "', error message '" + errorMessage + "'.";
            if (this.m_pOpenUIFormFailureDelegate.isValid) {
                var eventArgs_1 = {
                    serialId: v_pInfo.serialId,
                    uiFormAssetName: uiFormAssetName,
                    uiGroupName: v_pInfo.uiGroup.name,
                    errorMessage: appendErrorMessage,
                    pauseCoveredUIForm: v_pInfo.pauseCoveredUIForm,
                    userData: v_pInfo.userData
                };
                this.m_pOpenUIFormFailureDelegate.iter(function (callbackFn) {
                    callbackFn(eventArgs_1);
                });
                return;
            }
            throw new Error(appendErrorMessage);
        };
        UIManager.prototype.loadUIFormUpdateCallback = function (uiFormAssetName, progress, userData) {
            var v_pInfo = userData;
            if (null == v_pInfo)
                throw new Error("Open UI form info is invalid.");
            if (this.m_pOpenUIFormUpdateDelegate.isValid) {
                var eventArgs_2 = {
                    serialId: v_pInfo.serialId,
                    uiFormAssetName: uiFormAssetName,
                    uiGroupName: v_pInfo.uiGroup.name,
                    progress: progress,
                    pauseCoveredUIForm: v_pInfo.pauseCoveredUIForm,
                    userData: v_pInfo.userData
                };
                this.m_pOpenUIFormUpdateDelegate.iter(function (callbackFn) {
                    callbackFn(eventArgs_2);
                });
            }
        };
        UIManager.prototype.loadUIFormDependencyAssetCallback = function (uiFormAssetName, dependencyAssetName, loadedCount, totalCount, userData) {
            var v_pInfo = userData;
            if (null == v_pInfo)
                throw new Error("Open UI form info is invalid.");
            if (this.m_pOpenUIFormDependencyAssetDelegate.isValid) {
                var eventArgs_3 = {
                    serialId: v_pInfo.serialId,
                    uiFormAssetName: uiFormAssetName,
                    uiGroupName: v_pInfo.uiGroup.name,
                    dependencyAssetName: dependencyAssetName,
                    loadedCount: loadedCount,
                    totalCount: totalCount,
                    pauseCoveredUIForm: v_pInfo.pauseCoveredUIForm,
                    userData: v_pInfo.userData
                };
                this.m_pOpenUIFormDependencyAssetDelegate.iter(function (callbackFn) {
                    callbackFn(eventArgs_3);
                });
            }
        };
        return UIManager;
    }(Base_1.FrameworkModule)); // class UIManager
    exports.UIManager = UIManager;
    var UIFormInstanceObject = /** @class */ (function (_super) {
        __extends(UIFormInstanceObject, _super);
        function UIFormInstanceObject() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.m_pUIFormAsset = null;
            _this.m_pUIFormHelper = null;
            return _this;
        }
        UIFormInstanceObject.create = function (name, uiFormAsset, uiFormInstance, uiFormHelper) {
            if (!uiFormAsset)
                throw new Error('UI form asset is invalid.');
            if (!uiFormHelper)
                throw new Error('UI form helper is invalid.');
            var v_pUiFormInstanceObject = new UIFormInstanceObject();
            v_pUiFormInstanceObject.initialize(name, uiFormInstance);
            v_pUiFormInstanceObject.m_pUIFormAsset = uiFormAsset;
            v_pUiFormInstanceObject.m_pUIFormHelper = uiFormHelper;
            return v_pUiFormInstanceObject;
        };
        UIFormInstanceObject.prototype.clear = function () {
            _super.prototype.clear.call(this);
            this.m_pUIFormAsset = null;
            this.m_pUIFormHelper = null;
        };
        UIFormInstanceObject.prototype.release = function (shutdown) {
            shutdown = shutdown || false;
            if (this.m_pUIFormHelper)
                this.m_pUIFormHelper.releaseUIForm(this.m_pUIFormAsset, this.target);
        };
        return UIFormInstanceObject;
    }(ObjectPool_1.ObjectBase)); // class UIFormInstanceObject
    var UIGroup = /** @class */ (function () {
        function UIGroup(name, depth, helper) {
            this.m_iDepth = 0;
            this.m_bPause = false;
            this.m_pUIFormInfos = [];
            if (!name)
                throw new Error('UI group name is invalid.');
            if (!helper)
                throw new Error('UI group helper is invalid.');
            this.m_sName = name;
            this.m_bPause = false;
            this.helper = helper;
            this.depth = depth;
        }
        Object.defineProperty(UIGroup.prototype, "name", {
            get: function () { return this.m_sName; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIGroup.prototype, "depth", {
            get: function () { return this.m_iDepth; },
            set: function (value) {
                if (value == this.m_iDepth)
                    return;
                this.m_iDepth = value;
                this.helper.setDepth(this.m_iDepth);
                this.refresh();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIGroup.prototype, "pause", {
            get: function () { return this.m_bPause; },
            set: function (value) {
                if (this.m_bPause == value)
                    return;
                this.m_bPause = value;
                this.refresh();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIGroup.prototype, "uiFormCount", {
            get: function () {
                return this.m_pUIFormInfos.length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIGroup.prototype, "currentUIForm", {
            get: function () {
                return this.m_pUIFormInfos.length > 0 ? this.m_pUIFormInfos[0].uiForm : null;
            },
            enumerable: true,
            configurable: true
        });
        UIGroup.prototype.update = function (elapsed, realElapsed) {
            var e_8, _a;
            try {
                for (var _b = __values(this.m_pUIFormInfos), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var info = _c.value;
                    if (info.paused) {
                        break;
                    }
                    info.uiForm.onUpdate(elapsed, realElapsed);
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_8) throw e_8.error; }
            }
        };
        UIGroup.prototype.addUIForm = function (uiForm) {
            this.m_pUIFormInfos.unshift({
                uiForm: uiForm,
                covered: true,
                paused: true
            });
        };
        UIGroup.prototype.removeUIForm = function (uiForm) {
            var v_uIdx = -1;
            for (var i = 0; i < this.m_pUIFormInfos.length; ++i) {
                if (this.m_pUIFormInfos[i].uiForm == uiForm) {
                    v_uIdx = i;
                    break;
                }
            }
            if (v_uIdx == -1)
                throw new Error("Can not find UI form info for serial id '" + uiForm.serialId + "', UI form asset name is '" + uiForm.uiFormAssetName + "'.");
            var v_pInfo = this.m_pUIFormInfos[v_uIdx];
            if (!v_pInfo.covered) {
                v_pInfo.covered = true;
                uiForm.onCover();
            }
            if (!v_pInfo.paused) {
                v_pInfo.paused = true;
                uiForm.onPause();
            }
            this.m_pUIFormInfos.splice(v_uIdx, 1);
        };
        UIGroup.prototype.hasUIForm = function (idOrAssetName) {
            var e_9, _a;
            var subPropName = 'serialId';
            if (typeof idOrAssetName === 'string') {
                if (!idOrAssetName)
                    throw new Error('UI form asset name is invalid.');
                subPropName = 'uiFormAssetName';
            }
            try {
                for (var _b = __values(this.m_pUIFormInfos), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var info = _c.value;
                    if (info.uiForm[subPropName] === idOrAssetName)
                        return true;
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_9) throw e_9.error; }
            }
            return false;
        };
        UIGroup.prototype.getUIForm = function (idOrAssetName) {
            var e_10, _a;
            var subPropName = 'serialId';
            if (typeof idOrAssetName === 'string') {
                if (!idOrAssetName)
                    throw new Error('UI form asset name is invalid.');
                subPropName = 'uiFormAssetName';
            }
            try {
                for (var _b = __values(this.m_pUIFormInfos), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var info = _c.value;
                    if (info.uiForm[subPropName] === idOrAssetName)
                        return info.uiForm;
                }
            }
            catch (e_10_1) { e_10 = { error: e_10_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_10) throw e_10.error; }
            }
            return null;
        };
        UIGroup.prototype.getUIForms = function (assetName) {
            var e_11, _a;
            if (!assetName)
                throw new Error('UI form asset name is invalid.');
            var v_pRet = [];
            try {
                for (var _b = __values(this.m_pUIFormInfos.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var value = _c.value;
                    if (value.uiForm.uiFormAssetName === assetName)
                        v_pRet.push(value.uiForm);
                }
            }
            catch (e_11_1) { e_11 = { error: e_11_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_11) throw e_11.error; }
            }
            return v_pRet;
        };
        UIGroup.prototype.getAllUIForms = function () {
            return this.m_pUIFormInfos.map(function (info) {
                return info.uiForm;
            });
        };
        UIGroup.prototype.refocusUIForm = function (uiForm, userData) {
            var v_uIdx = -1;
            for (var i = 0; i < this.m_pUIFormInfos.length; ++i) {
                if (this.m_pUIFormInfos[i].uiForm == uiForm) {
                    v_uIdx = i;
                    break;
                }
            }
            if (v_uIdx == -1)
                throw new Error("Can not find UI form info for serial id '" + uiForm.serialId + "', UI form asset name is '" + uiForm.uiFormAssetName + "'.");
            if (v_uIdx >= 0) {
                this.m_pUIFormInfos.splice(v_uIdx, 1);
            }
            var v_pInfo = this.m_pUIFormInfos[v_uIdx];
            this.m_pUIFormInfos.unshift(v_pInfo);
        };
        UIGroup.prototype.refresh = function () {
            var e_12, _a;
            var v_bPause = this.pause;
            var v_bCover = false;
            var v_iDepth = this.uiFormCount;
            try {
                for (var _b = __values(this.m_pUIFormInfos), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var info = _c.value;
                    if (null == info)
                        return;
                    if (v_bPause) {
                        if (!info.covered) {
                            info.covered = true;
                            info.uiForm.onCover();
                        }
                        if (!info.paused) {
                            info.paused = true;
                            info.uiForm.onPause();
                        }
                    }
                    else {
                        if (info.paused) {
                            info.paused = false;
                            info.uiForm.onResume();
                        }
                        if (info.uiForm.pauseCoveredUIForm) {
                            v_bPause = true;
                        }
                        if (v_bCover) {
                            if (!info.covered) {
                                info.covered = true;
                                info.uiForm.onCover();
                            }
                        }
                        else {
                            if (info.covered) {
                                info.covered = false;
                                info.uiForm.onReveal();
                            }
                            v_bCover = true;
                        }
                    }
                }
            }
            catch (e_12_1) { e_12 = { error: e_12_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_12) throw e_12.error; }
            }
        };
        return UIGroup;
    }()); // class UIGroup
    exports.UIGroup = UIGroup;
});

},{"./Base":1,"./ObjectPool":8}],15:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var global = global || {};
    var v_pGlobal = 'undefined' == typeof window ? global : window;
    var atsframework = v_pGlobal.atsframework || {};
    function expose(m) {
        for (var k in m) {
            atsframework[k] = m[k];
        }
    }
    expose(require('./Base'));
    expose(require("./Config"));
    expose(require("./DataNode"));
    expose(require("./DataTable"));
    expose(require("./Fsm"));
    expose(require("./Resource"));
    expose(require("./Entity"));
    expose(require("./Event"));
    expose(require("./ObjectPool"));
    expose(require("./Procedure"));
    expose(require("./Sound"));
    expose(require("./Scene"));
    expose(require("./Setting"));
    expose(require("./UI"));
    v_pGlobal.atsframework = atsframework;
    exports.default = atsframework;
});

},{"./Base":1,"./Config":2,"./DataNode":3,"./DataTable":4,"./Entity":5,"./Event":6,"./Fsm":7,"./ObjectPool":8,"./Procedure":9,"./Resource":10,"./Scene":11,"./Setting":12,"./Sound":13,"./UI":14}]},{},[15])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIkJhc2UuanMiLCJDb25maWcuanMiLCJEYXRhTm9kZS5qcyIsIkRhdGFUYWJsZS5qcyIsIkVudGl0eS5qcyIsIkV2ZW50LmpzIiwiRnNtLmpzIiwiT2JqZWN0UG9vbC5qcyIsIlByb2NlZHVyZS5qcyIsIlJlc291cmNlLmpzIiwiU2NlbmUuanMiLCJTZXR0aW5nLmpzIiwiU291bmQuanMiLCJVSS5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeGRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2orQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzF6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2MEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzkwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgLyoqXG4gICAgICogTG9hZCB0eXBlLlxuICAgICAqL1xuICAgIHZhciBMb2FkVHlwZTtcbiAgICAoZnVuY3Rpb24gKExvYWRUeXBlKSB7XG4gICAgICAgIExvYWRUeXBlW0xvYWRUeXBlW1wiVGV4dFwiXSA9IDBdID0gXCJUZXh0XCI7XG4gICAgICAgIExvYWRUeXBlW0xvYWRUeXBlW1wiQnl0ZXNcIl0gPSAxXSA9IFwiQnl0ZXNcIjtcbiAgICAgICAgTG9hZFR5cGVbTG9hZFR5cGVbXCJTdHJlYW1cIl0gPSAyXSA9IFwiU3RyZWFtXCI7XG4gICAgfSkoTG9hZFR5cGUgPSBleHBvcnRzLkxvYWRUeXBlIHx8IChleHBvcnRzLkxvYWRUeXBlID0ge30pKTtcbiAgICA7XG4gICAgdmFyIGdfcE1vZHVsZXMgPSBbXTtcbiAgICAvKipcbiAgICAgKiBBbiBldmVudCBoYW5kbGVyIG1ha2Ugc2ltaWxhciB3aXRoIGV2ZW50IGRlbGVnYXRlIG1vZGUuXG4gICAgICovXG4gICAgdmFyIEV2ZW50SGFuZGxlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gRXZlbnRIYW5kbGVyKCkge1xuICAgICAgICB9XG4gICAgICAgIEV2ZW50SGFuZGxlci5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gKGZuLCB0YXJnZXQpIHtcbiAgICAgICAgICAgIGlmIChudWxsICE9IHRoaXMubV9wSGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BIYW5kbGVycy5zb21lKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdl9iUmV0ID0gdmFsdWVbMV0gPT0gZm47XG4gICAgICAgICAgICAgICAgICAgIGlmICh2X2JSZXQgJiYgdW5kZWZpbmVkICE9IHRhcmdldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdl9iUmV0ID0gdmFsdWVbMF0gPT0gdGFyZ2V0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2X2JSZXQ7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIEV2ZW50SGFuZGxlci5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKGZuLCB0YXJnZXQpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMubV9wSGFuZGxlcnMpXG4gICAgICAgICAgICAgICAgdGhpcy5tX3BIYW5kbGVycyA9IFtdO1xuICAgICAgICAgICAgaWYgKHRoaXMuaGFzKGZuLCB0YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRHVwbGljYXRlZCBhZGQgZXZlbnQgaGFuZGxlciAnXCIgKyBmbiArIFwiJ1wiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcEhhbmRsZXJzLnB1c2goW3RhcmdldCwgZm4sIGZhbHNlXSk7XG4gICAgICAgIH07XG4gICAgICAgIEV2ZW50SGFuZGxlci5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKGZuLCB0YXJnZXQpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pc1ZhbGlkKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tX3BIYW5kbGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciB2X3BUdXBsZSA9IHRoaXMubV9wSGFuZGxlcnNbaV07XG4gICAgICAgICAgICAgICAgaWYgKHVuZGVmaW5lZCA9PSB0YXJnZXQgJiYgdl9wVHVwbGVbMV0gPT0gZm4pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BIYW5kbGVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh1bmRlZmluZWQgIT0gdGFyZ2V0ICYmIHZfcFR1cGxlWzBdID09IHRhcmdldCAmJiB2X3BUdXBsZVsxXSA9PSBmbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcEhhbmRsZXJzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBFdmVudEhhbmRsZXIucHJvdG90eXBlLml0ZXIgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pc1ZhbGlkKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMubV9wSGFuZGxlcnMuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2FsbGJhY2tGbiA9IHZhbHVlWzFdO1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZVswXSAhPSB1bmRlZmluZWQgJiYgY2FsbGJhY2tGbiBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4gPSBjYWxsYmFja0ZuLmJpbmQodmFsdWVbMF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmbihjYWxsYmFja0ZuKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBFdmVudEhhbmRsZXIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5pc1ZhbGlkICYmIHRoaXMubV9wSGFuZGxlcnMuc3BsaWNlKDAsIHRoaXMubV9wSGFuZGxlcnMubGVuZ3RoKTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEV2ZW50SGFuZGxlci5wcm90b3R5cGUsIFwiaXNWYWxpZFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BIYW5kbGVycyAmJiB0aGlzLm1fcEhhbmRsZXJzLmxlbmd0aCA+IDA7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEV2ZW50SGFuZGxlci5wcm90b3R5cGUsIFwic2l6ZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BIYW5kbGVycy5sZW5ndGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIEV2ZW50SGFuZGxlcjtcbiAgICB9KCkpOyAvLyBjbGFzcyBFdmVudEhhbmRsZXJcbiAgICBleHBvcnRzLkV2ZW50SGFuZGxlciA9IEV2ZW50SGFuZGxlcjtcbiAgICB2YXIgRnJhbWV3b3JrTW9kdWxlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBGcmFtZXdvcmtNb2R1bGUoKSB7XG4gICAgICAgICAgICB0aGlzLm1faVByaW9yaXR5ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBGcmFtZXdvcmtNb2R1bGUuZ2V0TW9kdWxlID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ19wTW9kdWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBtID0gZ19wTW9kdWxlc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAobSBpbnN0YW5jZW9mIHR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIEZyYW1ld29ya01vZHVsZS5nZXRPckFkZE1vZHVsZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICB2YXIgdl9wTW9kdWxlID0gdGhpcy5nZXRNb2R1bGUodHlwZSk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BNb2R1bGUpIHtcbiAgICAgICAgICAgICAgICB2X3BNb2R1bGUgPSBuZXcgdHlwZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkTW9kdWxlKHZfcE1vZHVsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdl9wTW9kdWxlO1xuICAgICAgICB9O1xuICAgICAgICBGcmFtZXdvcmtNb2R1bGUuYWRkTW9kdWxlID0gZnVuY3Rpb24gKG1vZHVsZSkge1xuICAgICAgICAgICAgdmFyIG0gPSB0aGlzLmdldE1vZHVsZShtb2R1bGUuY29uc3RydWN0b3IpO1xuICAgICAgICAgICAgaWYgKG0pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRHVwbGljYXRlZCBhZGRpbmcgZnJhbWV3b3JrIG1vZHVsZTogXCIgKyB0eXBlb2YgbW9kdWxlKTsgLy8gRklYTUU6IERldGVjdGluZyBob3cgdG8gZ2V0IHRoZSBjbGFzcyBuYW1lLlxuICAgICAgICAgICAgZ19wTW9kdWxlcy5wdXNoKG1vZHVsZSk7XG4gICAgICAgICAgICBnX3BNb2R1bGVzID0gZ19wTW9kdWxlcy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGEubV9pUHJpb3JpdHkgPiBiLm1faVByaW9yaXR5KVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoYS5tX2lQcmlvcml0eSA8IGIubV9pUHJpb3JpdHkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIEZyYW1ld29ya01vZHVsZS5yZW1vdmVNb2R1bGUgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnX3BNb2R1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZfcE1vZHVsZSA9IGdfcE1vZHVsZXNbaV07XG4gICAgICAgICAgICAgICAgaWYgKHZfcE1vZHVsZSAmJiB2X3BNb2R1bGUgaW5zdGFuY2VvZiB0eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGdfcE1vZHVsZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdl9wTW9kdWxlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBGcmFtZXdvcmtNb2R1bGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdfcE1vZHVsZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wTW9kdWxlID0gZ19wTW9kdWxlc1tpXTtcbiAgICAgICAgICAgICAgICB2X3BNb2R1bGUudXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRnJhbWV3b3JrTW9kdWxlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IGdfcE1vZHVsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wTW9kdWxlID0gZ19wTW9kdWxlc1tpXTtcbiAgICAgICAgICAgICAgICB2X3BNb2R1bGUuc2h1dGRvd24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZyYW1ld29ya01vZHVsZS5wcm90b3R5cGUsIFwicHJpb3JpdHlcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9pUHJpb3JpdHk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIEZyYW1ld29ya01vZHVsZTtcbiAgICB9KCkpOyAvLyBjbGFzcyBGcmFtZXdvcmtNb2R1bGVcbiAgICBleHBvcnRzLkZyYW1ld29ya01vZHVsZSA9IEZyYW1ld29ya01vZHVsZTtcbiAgICB2YXIgRnJhbWV3b3JrU2VnbWVudCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gRnJhbWV3b3JrU2VnbWVudChzb3VyY2UsIG9mZnNldCwgbGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoIXNvdXJjZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NvdXJjZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgaWYgKG9mZnNldCA8IDApXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPZmZzZXQgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGlmIChsZW5ndGggPD0gMClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0xlbmd0aCBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdGhpcy5tX3RTb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICB0aGlzLm1faU9mZnNldCA9IG9mZnNldDtcbiAgICAgICAgICAgIHRoaXMubV9pTGVuZ3RoID0gbGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGcmFtZXdvcmtTZWdtZW50LnByb3RvdHlwZSwgXCJzb3VyY2VcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV90U291cmNlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGcmFtZXdvcmtTZWdtZW50LnByb3RvdHlwZSwgXCJvZmZzZXRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9pT2Zmc2V0O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGcmFtZXdvcmtTZWdtZW50LnByb3RvdHlwZSwgXCJsZW5ndGhcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9pTGVuZ3RoO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBGcmFtZXdvcmtTZWdtZW50O1xuICAgIH0oKSk7IC8vIGNsYXNzIEZyYW1ld29ya1NlZ21lbnQ8VD5cbiAgICBleHBvcnRzLkZyYW1ld29ya1NlZ21lbnQgPSBGcmFtZXdvcmtTZWdtZW50O1xufSk7XG4iLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICB2YXIgQ29uZmlnTWFuYWdlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgX19leHRlbmRzKENvbmZpZ01hbmFnZXIsIF9zdXBlcik7XG4gICAgICAgIGZ1bmN0aW9uIENvbmZpZ01hbmFnZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzKSB8fCB0aGlzO1xuICAgICAgICAgICAgX3RoaXMubV9wQ29uZmlnRGF0YSA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRBc3NldENhbGxiYWNrcyA9IHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBfdGhpcy5sb2FkQ29uZmlnU3VjY2Vzc0NhbGxiYWNrLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIGZhaWx1cmU6IF90aGlzLmxvYWRDb25maWdGYWlsdXJlQ2FsbGJhY2suYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgdXBkYXRlOiBfdGhpcy5sb2FkQ29uZmlnVXBkYXRlQ2FsbGJhY2suYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgZGVwZW5kZW5jeTogX3RoaXMubG9hZENvbmZpZ0RlcGVuZGVuY3lBc3NldENhbGxiYWNrLmJpbmQoX3RoaXMpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZENvbmZpZ1N1Y2Nlc3NEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BMb2FkQ29uZmlnRmFpbHVyZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRDb25maWdVcGRhdGVEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BMb2FkQ29uZmlnRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb25maWdNYW5hZ2VyLnByb3RvdHlwZSwgXCJyZXNvdXJjZU1hbmFnZXJcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG51bGwgPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUmVzb3VyY2UgbWFuYWdlciBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIgPSB2YWx1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ29uZmlnTWFuYWdlci5wcm90b3R5cGUsIFwiY29uZmlnSGVscGVyXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcENvbmZpZ0hlbHBlcjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChudWxsID09IHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb25maWcgaGVscGVyIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wQ29uZmlnSGVscGVyID0gdmFsdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbmZpZ01hbmFnZXIucHJvdG90eXBlLCBcImNvbmZpZ0NvdW50XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcENvbmZpZ0RhdGEuc2l6ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ29uZmlnTWFuYWdlci5wcm90b3R5cGUsIFwibG9hZENvbmZpZ1N1Y2Nlc3NcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wTG9hZENvbmZpZ1N1Y2Nlc3NEZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ29uZmlnTWFuYWdlci5wcm90b3R5cGUsIFwibG9hZENvbmZpZ0ZhaWx1cmVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wTG9hZENvbmZpZ0ZhaWx1cmVEZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ29uZmlnTWFuYWdlci5wcm90b3R5cGUsIFwibG9hZENvbmZpZ1VwZGF0ZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BMb2FkQ29uZmlnVXBkYXRlRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbmZpZ01hbmFnZXIucHJvdG90eXBlLCBcImxvYWRDb25maWdEZXBlbmRlbmN5QXNzZXRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wTG9hZENvbmZpZ0RlcGVuZGVuY3lBc3NldERlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIENvbmZpZ01hbmFnZXIucHJvdG90eXBlLmxvYWRDb25maWcgPSBmdW5jdGlvbiAoY29uZmlnQXNzZXROYW1lLCBsb2FkVHlwZSwgYW55QXJnMSwgYW55QXJnMikge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgcmVzb3VyY2UgbWFuYWdlciBmaXJzdC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLm1fcENvbmZpZ0hlbHBlcikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IHNldCBjb25maWcgaGVscGVyIGZpcnN0LlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwcmlvcml0eSA9IDA7XG4gICAgICAgICAgICB2YXIgdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAodW5kZWZpbmVkICE9PSBhbnlBcmcxKSB7XG4gICAgICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2YgYW55QXJnMSlcbiAgICAgICAgICAgICAgICAgICAgcHJpb3JpdHkgPSBhbnlBcmcxO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGEgPSBhbnlBcmcxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHVuZGVmaW5lZCAhPT0gYW55QXJnMiAmJiBudWxsID09IHVzZXJEYXRhKSB7XG4gICAgICAgICAgICAgICAgdXNlckRhdGEgPSBhbnlBcmcyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIubG9hZEFzc2V0KGNvbmZpZ0Fzc2V0TmFtZSwgcHJpb3JpdHksIHRoaXMubV9wTG9hZEFzc2V0Q2FsbGJhY2tzLCB7IGxvYWRUeXBlOiBsb2FkVHlwZSwgdXNlckRhdGE6IHVzZXJEYXRhIH0pO1xuICAgICAgICB9O1xuICAgICAgICAvLyBOT1RFOiBBbnkgamF2YXNjcmlwdC90eXBlc2NyaXB0IHN0cmVhbSBpbXBsZW1lbnRhdGlvbj9cbiAgICAgICAgQ29uZmlnTWFuYWdlci5wcm90b3R5cGUucGFyc2VDb25maWcgPSBmdW5jdGlvbiAodGV4dE9yQnVmZmVyLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKCF0ZXh0T3JCdWZmZXIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGNvbmZpZyBkYXRhIGRldGVjdGVkIVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMubV9wQ29uZmlnSGVscGVyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IGNvbmZpZyBoZWxwZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdXNlckRhdGEgPSB1c2VyRGF0YSB8fCBudWxsO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BDb25maWdIZWxwZXIucGFyc2VDb25maWcodGV4dE9yQnVmZmVyLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIENvbmZpZ01hbmFnZXIucHJvdG90eXBlLmhhc0NvbmZpZyA9IGZ1bmN0aW9uIChjb25maWdOYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRDb25maWcoY29uZmlnTmFtZSk7XG4gICAgICAgIH07XG4gICAgICAgIENvbmZpZ01hbmFnZXIucHJvdG90eXBlLmFkZENvbmZpZyA9IGZ1bmN0aW9uIChjb25maWdOYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaGFzQ29uZmlnKGNvbmZpZ05hbWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3BDb25maWdEYXRhLnNldChjb25maWdOYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5wcm90b3R5cGUucmVtb3ZlQ29uZmlnID0gZnVuY3Rpb24gKGNvbmZpZ05hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcENvbmZpZ0RhdGEuZGVsZXRlKGNvbmZpZ05hbWUpO1xuICAgICAgICB9O1xuICAgICAgICBDb25maWdNYW5hZ2VyLnByb3RvdHlwZS5yZW1vdmVBbGxDb25maWdzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5tX3BDb25maWdEYXRhLmNsZWFyKCk7XG4gICAgICAgIH07XG4gICAgICAgIENvbmZpZ01hbmFnZXIucHJvdG90eXBlLmdldENvbmZpZyA9IGZ1bmN0aW9uIChjb25maWdOYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BDb25maWdEYXRhLmdldChjb25maWdOYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICAvLyBOT09QLlxuICAgICAgICB9O1xuICAgICAgICBDb25maWdNYW5hZ2VyLnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIE5PT1AuXG4gICAgICAgIH07XG4gICAgICAgIENvbmZpZ01hbmFnZXIucHJvdG90eXBlLmxvYWRDb25maWdTdWNjZXNzQ2FsbGJhY2sgPSBmdW5jdGlvbiAoY29uZmlnQXNzZXROYW1lLCBjb25maWdBc3NldCwgZHVyYXRpb24sIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wSW5mbykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgY29uZmlnIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5tX3BDb25maWdIZWxwZXIubG9hZENvbmZpZyhjb25maWdBc3NldCwgdl9wSW5mby5sb2FkVHlwZSwgdl9wSW5mby51c2VyRGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTG9hZCBjb25maWcgZmFpbHVyZSBpbiBoZWxwZXIsIGFzc2V0IG5hbWUgJ1wiICsgY29uZmlnQXNzZXROYW1lICsgXCInXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkQ29uZmlnU3VjY2Vzc0RlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkQ29uZmlnU3VjY2Vzc0RlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oY29uZmlnQXNzZXROYW1lLCB2X3BJbmZvLmxvYWRUeXBlLCBkdXJhdGlvbiwgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubV9wTG9hZENvbmZpZ0ZhaWx1cmVEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZENvbmZpZ0ZhaWx1cmVEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGNvbmZpZ0Fzc2V0TmFtZSwgdl9wSW5mby5sb2FkVHlwZSwgZS50b1N0cmluZygpLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wQ29uZmlnSGVscGVyLnJlbGVhc2VDb25maWdBc3NldChjb25maWdBc3NldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIENvbmZpZ01hbmFnZXIucHJvdG90eXBlLmxvYWRDb25maWdGYWlsdXJlQ2FsbGJhY2sgPSBmdW5jdGlvbiAoY29uZmlnQXNzZXROYW1lLCBzdGF0dXMsIGVycm9yTWVzc2FnZSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BJbmZvKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTG9hZCBjb25maWcgaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBhcHBlbmRFcnJvck1lc3NhZ2UgPSBcIkxvYWQgY29uZmlnIGZhaWx1cmUsIGFzc2V0IG5hbWUgJ1wiICsgY29uZmlnQXNzZXROYW1lICsgXCInLCBzdGF0dXMgJ1wiICsgc3RhdHVzICsgXCInLCBlcnJvciBtZXNzYWdlICdcIiArIGVycm9yTWVzc2FnZSArIFwiJy5cIjtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWRDb25maWdGYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZENvbmZpZ0ZhaWx1cmVEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oY29uZmlnQXNzZXROYW1lLCB2X3BJbmZvLmxvYWRUeXBlLCBhcHBlbmRFcnJvck1lc3NhZ2UsIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihhcHBlbmRFcnJvck1lc3NhZ2UpO1xuICAgICAgICB9O1xuICAgICAgICBDb25maWdNYW5hZ2VyLnByb3RvdHlwZS5sb2FkQ29uZmlnVXBkYXRlQ2FsbGJhY2sgPSBmdW5jdGlvbiAoY29uZmlnQXNzZXROYW1lLCBwcm9ncmVzcywgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BJbmZvKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTG9hZCBjb25maWcgaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWRDb25maWdVcGRhdGVEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkQ29uZmlnVXBkYXRlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGNvbmZpZ0Fzc2V0TmFtZSwgdl9wSW5mby5sb2FkVHlwZSwgcHJvZ3Jlc3MsIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBDb25maWdNYW5hZ2VyLnByb3RvdHlwZS5sb2FkQ29uZmlnRGVwZW5kZW5jeUFzc2V0Q2FsbGJhY2sgPSBmdW5jdGlvbiAoY29uZmlnQXNzZXROYW1lLCBkZXBlbmRlbmN5QXNzZXROYW1lLCBsb2FkZWRDb3VudCwgdG90YWxDb3VudCwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BJbmZvKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTG9hZCBjb25maWcgaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWRDb25maWdEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkQ29uZmlnRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGNvbmZpZ0Fzc2V0TmFtZSwgZGVwZW5kZW5jeUFzc2V0TmFtZSwgbG9hZGVkQ291bnQsIHRvdGFsQ291bnQsIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gQ29uZmlnTWFuYWdlcjtcbiAgICB9KEJhc2VfMS5GcmFtZXdvcmtNb2R1bGUpKTsgLy8gY2xhc3MgQ29uZmlnTWFuYWdlclxuICAgIGV4cG9ydHMuQ29uZmlnTWFuYWdlciA9IENvbmZpZ01hbmFnZXI7XG59KTtcbiIsInZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgICAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIiwgXCIuL0Jhc2VcIl0sIGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIHZhciBCYXNlXzEgPSByZXF1aXJlKFwiLi9CYXNlXCIpO1xuICAgIHZhciBEYXRhTm9kZU1hbmFnZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhEYXRhTm9kZU1hbmFnZXIsIF9zdXBlcik7XG4gICAgICAgIGZ1bmN0aW9uIERhdGFOb2RlTWFuYWdlcigpIHtcbiAgICAgICAgICAgIHJldHVybiBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgICAgICAgfVxuICAgICAgICBEYXRhTm9kZU1hbmFnZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XG4gICAgICAgIH07XG4gICAgICAgIERhdGFOb2RlTWFuYWdlci5wcm90b3R5cGUuc2h1dGRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIERhdGFOb2RlTWFuYWdlcjtcbiAgICB9KEJhc2VfMS5GcmFtZXdvcmtNb2R1bGUpKTsgLy8gY2xhc3MgRGF0YU5vZGVNYW5hZ2VyXG4gICAgZXhwb3J0cy5EYXRhTm9kZU1hbmFnZXIgPSBEYXRhTm9kZU1hbmFnZXI7XG59KTtcbiIsInZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgICAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xudmFyIF9fdmFsdWVzID0gKHRoaXMgJiYgdGhpcy5fX3ZhbHVlcykgfHwgZnVuY3Rpb24obykge1xuICAgIHZhciBzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciwgbSA9IHMgJiYgb1tzXSwgaSA9IDA7XG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xuICAgICAgICB9XG4gICAgfTtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XG59O1xuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIiwgXCIuL0Jhc2VcIl0sIGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIHZhciBCYXNlXzEgPSByZXF1aXJlKFwiLi9CYXNlXCIpO1xuICAgIHZhciBEYXRhVGFibGVCYXNlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBEYXRhVGFibGVCYXNlKG5hbWUpIHtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lIHx8ICcnO1xuICAgICAgICAgICAgdGhpcy5tX3NOYW1lID0gbmFtZTtcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0YVRhYmxlQmFzZS5wcm90b3R5cGUsIFwibmFtZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9zTmFtZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBEYXRhVGFibGVCYXNlO1xuICAgIH0oKSk7IC8vIGNsYXNzIERhdGFUYWJsZUJhc2VcbiAgICBleHBvcnRzLkRhdGFUYWJsZUJhc2UgPSBEYXRhVGFibGVCYXNlO1xuICAgIHZhciBEYXRhVGFibGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhEYXRhVGFibGUsIF9zdXBlcik7XG4gICAgICAgIGZ1bmN0aW9uIERhdGFUYWJsZShuYW1lKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBuYW1lKSB8fCB0aGlzO1xuICAgICAgICAgICAgX3RoaXMubV9wRGF0YVNldCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0YVRhYmxlLnByb3RvdHlwZSwgXCJtaW5JZERhdGFSb3dcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcE1pbklkRGF0YVJvdzsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRhVGFibGUucHJvdG90eXBlLCBcIm1heElkRGF0YVJvd1wiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wTWF4SWREYXRhUm93OyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgRGF0YVRhYmxlLnByb3RvdHlwZS5oYXNEYXRhUm93ID0gZnVuY3Rpb24gKHByZWQpIHtcbiAgICAgICAgICAgIHZhciBlXzEsIF9hO1xuICAgICAgICAgICAgdmFyIHZfaWR4O1xuICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2YgcHJlZCkge1xuICAgICAgICAgICAgICAgIHZfaWR4ID0gcHJlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh1bmRlZmluZWQgIT0gdl9pZHgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BEYXRhU2V0Lmhhcyh2X2lkeCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRGF0YVNldC5rZXlzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLm1fcERhdGFTZXQuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJlZCh2YWx1ZSwga2V5LCB0aGlzLm1fcERhdGFTZXQudmFsdWVzKCkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVfMV8xKSB7IGVfMSA9IHsgZXJyb3I6IGVfMV8xIH07IH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBEYXRhVGFibGUucHJvdG90eXBlLmdldERhdGFSb3cgPSBmdW5jdGlvbiAocHJlZCkge1xuICAgICAgICAgICAgdmFyIGVfMiwgX2E7XG4gICAgICAgICAgICB2YXIgdl9pZHg7XG4gICAgICAgICAgICBpZiAoJ251bWJlcicgPT09IHR5cGVvZiBwcmVkKSB7XG4gICAgICAgICAgICAgICAgdl9pZHggPSBwcmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHVuZGVmaW5lZCAhPSB2X2lkeCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcERhdGFTZXQuZ2V0KHZfaWR4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgnZnVuY3Rpb24nICE9PSB0eXBlb2YgcHJlZCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcHJlZCwgbm90IGEgZnVuY3Rpb24uIEl0J3MgYSB0eXBlIG9mICdcIiArIHR5cGVvZiBwcmVkICsgXCInLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcERhdGFTZXQua2V5cygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMubV9wRGF0YVNldC5nZXQoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZWQodmFsdWUsIGtleSwgdGhpcy5tX3BEYXRhU2V0LnZhbHVlcygpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMl8xKSB7IGVfMiA9IHsgZXJyb3I6IGVfMl8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzIpIHRocm93IGVfMi5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIERhdGFUYWJsZS5wcm90b3R5cGUuZ2V0RGF0YVJvd3MgPSBmdW5jdGlvbiAocHJlZCwgcmVzdWx0cykge1xuICAgICAgICAgICAgdmFyIGVfMywgX2E7XG4gICAgICAgICAgICBpZiAoIXByZWQpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb25kaXRpb24gcHJlZGljYXRlIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cyB8fCBbXTtcbiAgICAgICAgICAgIGlmIChyZXN1bHRzLmxlbmd0aClcbiAgICAgICAgICAgICAgICByZXN1bHRzLnNwbGljZSgwLCByZXN1bHRzLmxlbmd0aCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BEYXRhU2V0LmtleXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLm1fcERhdGFTZXQuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmVkKHZhbHVlLCBrZXksIHRoaXMubV9wRGF0YVNldC52YWx1ZXMoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzNfMSkgeyBlXzMgPSB7IGVycm9yOiBlXzNfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8zKSB0aHJvdyBlXzMuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9O1xuICAgICAgICBEYXRhVGFibGUucHJvdG90eXBlLmdldEFsbERhdGFSb3dzID0gZnVuY3Rpb24gKHJlc3VsdHMpIHtcbiAgICAgICAgICAgIHZhciBlXzQsIF9hO1xuICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMgfHwgW107XG4gICAgICAgICAgICBpZiAocmVzdWx0cy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgIHJlc3VsdHMuc3BsaWNlKDAsIHJlc3VsdHMubGVuZ3RoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcERhdGFTZXQudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzRfMSkgeyBlXzQgPSB7IGVycm9yOiBlXzRfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV80KSB0aHJvdyBlXzQuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9O1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0YVRhYmxlLnByb3RvdHlwZSwgXCJjb3VudFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BEYXRhU2V0LnNpemU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgRGF0YVRhYmxlLnByb3RvdHlwZS5hZGREYXRhUm93ID0gZnVuY3Rpb24gKHJvd1R5cGUsIHJvd1NlZ21lbnQpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIHZfcERhdGFSb3cgPSBuZXcgcm93VHlwZSgpO1xuICAgICAgICAgICAgICAgIGlmICghdl9wRGF0YVJvdy5wYXJzZURhdGFSb3cocm93U2VnbWVudCkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmludGVybmFsQWRkRGF0YVJvdyh2X3BEYXRhUm93KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIERhdGFUYWJsZS5wcm90b3R5cGUuc2h1dGRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLm1fcERhdGFTZXQuY2xlYXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlLnByb3RvdHlwZS5pbnRlcm5hbEFkZERhdGFSb3cgPSBmdW5jdGlvbiAoZGF0YVJvdykge1xuICAgICAgICAgICAgaWYgKHRoaXMuaGFzRGF0YVJvdyhkYXRhUm93LmlkKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFscmVhZHkgZXhpc3QgJ1wiICsgZGF0YVJvdy5pZCArIFwiJyBpbiBkYXRhIHRhYmxlICdcIiArIG5hbWUgKyBcIidcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcERhdGFTZXQuc2V0KGRhdGFSb3cuaWQsIGRhdGFSb3cpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1fcE1pbklkRGF0YVJvdyB8fCB0aGlzLm1fcE1pbklkRGF0YVJvdy5pZCA+IGRhdGFSb3cuaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcE1pbklkRGF0YVJvdyA9IGRhdGFSb3c7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRoaXMubV9wTWF4SWREYXRhUm93IHx8IHRoaXMubV9wTWF4SWREYXRhUm93LmlkIDwgZGF0YVJvdy5pZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTWF4SWREYXRhUm93ID0gZGF0YVJvdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIERhdGFUYWJsZTtcbiAgICB9KERhdGFUYWJsZUJhc2UpKTsgLy8gY2xhc3MgRGF0YVRhYmxlXG4gICAgdmFyIERhdGFUYWJsZU1hbmFnZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhEYXRhVGFibGVNYW5hZ2VyLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBEYXRhVGFibGVNYW5hZ2VyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgICAgICAgICBfdGhpcy5tX3BEYXRhVGFibGUgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BMb2FkRGF0YVRhYmxlU3VjY2Vzc0RlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWREYXRhVGFibGVGYWlsdXJlRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZERhdGFUYWJsZVVwZGF0ZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWREYXRhVGFibGVEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BMb2FkQXNzZXRDYWxsYmFja3MgPSB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogX3RoaXMubG9hZERhdGFUYWJsZVN1Y2Nlc3NDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICBmYWlsdXJlOiBfdGhpcy5sb2FkRGF0YVRhYmxlRmFpbHVyZUNhbGxiYWNrLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIHVwZGF0ZTogX3RoaXMubG9hZERhdGFUYWJsZVVwZGF0ZUNhbGxiYWNrLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIGRlcGVuZGVuY3k6IF90aGlzLmxvYWREYXRhVGFibGVEZXBlbmRlbmN5QXNzZXRDYWxsYmFjay5iaW5kKF90aGlzKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUsIFwicmVzb3VyY2VNYW5hZ2VyXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXI7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1fcFJlc291cmNlTWFuYWdlciA9IHZhbHVlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KERhdGFUYWJsZU1hbmFnZXIucHJvdG90eXBlLCBcImxvYWREYXRhVGFibGVTdWNjZXNzXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcExvYWREYXRhVGFibGVTdWNjZXNzRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KERhdGFUYWJsZU1hbmFnZXIucHJvdG90eXBlLCBcImxvYWREYXRhVGFibGVGYWlsdXJlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcExvYWREYXRhVGFibGVGYWlsdXJlRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KERhdGFUYWJsZU1hbmFnZXIucHJvdG90eXBlLCBcImxvYWREYXRhVGFibGVVcGRhdGVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wTG9hZERhdGFUYWJsZVVwZGF0ZURlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRhVGFibGVNYW5hZ2VyLnByb3RvdHlwZSwgXCJMb2FkRGF0YVRhYmxlRGVwZW5kZW5jeUFzc2V0XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcExvYWREYXRhVGFibGVEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUsIFwiY291bnRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wRGF0YVRhYmxlLnNpemU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KERhdGFUYWJsZU1hbmFnZXIucHJvdG90eXBlLCBcImRhdGFUYWJsZUhlbHBlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BEYXRhVGFibGVIZWxwZXI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcERhdGFUYWJsZUhlbHBlciA9IHZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIERhdGFUYWJsZU1hbmFnZXIucHJvdG90eXBlLmxvYWREYXRhVGFibGUgPSBmdW5jdGlvbiAoZGF0YVRhYmxlQXNzZXROYW1lLCBsb2FkVHlwZSwgYW55QXJnMSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IHJlc291cmNlIG1hbmFnZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1fcERhdGFUYWJsZUhlbHBlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgZGF0YSB0YWJsZSBoZWxwZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgdmFyIHByaW9yaXR5ID0gMDtcbiAgICAgICAgICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIGFueUFyZzEpIHtcbiAgICAgICAgICAgICAgICBwcmlvcml0eSA9IGFueUFyZzE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh1bmRlZmluZWQgIT0gYW55QXJnMSAmJiB1bmRlZmluZWQgPT0gdXNlckRhdGEpIHtcbiAgICAgICAgICAgICAgICB1c2VyRGF0YSA9IGFueUFyZzE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1c2VyRGF0YSA9IHVzZXJEYXRhIHx8IG51bGw7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHtcbiAgICAgICAgICAgICAgICBsb2FkVHlwZTogbG9hZFR5cGUsXG4gICAgICAgICAgICAgICAgdXNlckRhdGE6IHVzZXJEYXRhXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIubG9hZEFzc2V0KGRhdGFUYWJsZUFzc2V0TmFtZSwgcHJpb3JpdHksIHRoaXMubV9wTG9hZEFzc2V0Q2FsbGJhY2tzLCB2X3BJbmZvKTtcbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUuaGFzRGF0YVRhYmxlID0gZnVuY3Rpb24gKGRhdGFUYWJsZUFzc2V0TmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxIYXNEYXRhVGFibGUoZGF0YVRhYmxlQXNzZXROYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUuZ2V0RGF0YVRhYmxlID0gZnVuY3Rpb24gKGRhdGFUYWJsZUFzc2V0TmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxHZXREYXRhVGFibGUoZGF0YVRhYmxlQXNzZXROYW1lIHx8ICcnKTtcbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUuZ2V0QWxsRGF0YVRhYmxlcyA9IGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgICAgICB2YXIgZV81LCBfYTtcbiAgICAgICAgICAgIHZhciB2X3BSZXQgPSByZXN1bHRzIHx8IFtdO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRGF0YVRhYmxlLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZHQgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdl9wUmV0LnB1c2goZHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzVfMSkgeyBlXzUgPSB7IGVycm9yOiBlXzVfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV81KSB0aHJvdyBlXzUuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2X3BSZXQ7XG4gICAgICAgIH07XG4gICAgICAgIERhdGFUYWJsZU1hbmFnZXIucHJvdG90eXBlLmNyZWF0ZURhdGFUYWJsZSA9IGZ1bmN0aW9uICh0eXBlLCBhbnlBcmcxLCBhbnlBcmcyKSB7XG4gICAgICAgICAgICB2YXIgY29udGVudDtcbiAgICAgICAgICAgIHZhciBuYW1lO1xuICAgICAgICAgICAgaWYgKHVuZGVmaW5lZCAhPT0gYW55QXJnMikge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBhbnlBcmcyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gYW55QXJnMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2X3NGdWxsTmFtZTtcbiAgICAgICAgICAgIC8vIGlmIChuYW1lKSB7XG4gICAgICAgICAgICAvLyAgICAgdl9zRnVsbE5hbWUgPSBgJHt0eXBlLm5hbWV9LiR7bmFtZX1gO1xuICAgICAgICAgICAgLy8gfSBlbHNlIHtcbiAgICAgICAgICAgIC8vICAgICB2X3NGdWxsTmFtZSA9IHR5cGUubmFtZTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIHZfc0Z1bGxOYW1lID0gbmFtZSB8fCB0eXBlLm5hbWU7XG4gICAgICAgICAgICB2YXIgdl9wRGF0YVRhYmxlID0gbmV3IERhdGFUYWJsZSgpO1xuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbENyZWF0ZURhdGFUYWJsZSh0eXBlLCB2X3BEYXRhVGFibGUsIGNvbnRlbnQpO1xuICAgICAgICAgICAgdGhpcy5tX3BEYXRhVGFibGUuc2V0KHZfc0Z1bGxOYW1lLCB2X3BEYXRhVGFibGUpO1xuICAgICAgICAgICAgcmV0dXJuIHZfcERhdGFUYWJsZTtcbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUuZGVzdHJveURhdGFUYWJsZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbERlc3Ryb3lEYXRhVGFibGUobmFtZSB8fCAnJyk7XG4gICAgICAgIH07XG4gICAgICAgIERhdGFUYWJsZU1hbmFnZXIucHJvdG90eXBlLmludGVybmFsSGFzRGF0YVRhYmxlID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcERhdGFUYWJsZS5oYXMobmFtZSk7XG4gICAgICAgIH07XG4gICAgICAgIERhdGFUYWJsZU1hbmFnZXIucHJvdG90eXBlLmludGVybmFsR2V0RGF0YVRhYmxlID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcERhdGFUYWJsZS5nZXQobmFtZSkgfHwgbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUuaW50ZXJuYWxDcmVhdGVEYXRhVGFibGUgPSBmdW5jdGlvbiAocm93VHlwZSwgZGF0YVRhYmxlLCBjb250ZW50KSB7XG4gICAgICAgICAgICB2YXIgZV82LCBfYTtcbiAgICAgICAgICAgIHZhciB2X3BJdGVyYXRvcjtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdl9wSXRlcmF0b3IgPSB0aGlzLm1fcERhdGFUYWJsZUhlbHBlci5nZXREYXRhUm93U2VnbWVudHMoY29udGVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGlmIChlIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuIG5vdCBnZXQgZGF0YSByb3cgc2VnbWVudHMgd2l0aCBleGNlcHRpb246ICdcIiArIGUgKyBcIicuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF2X3BJdGVyYXRvcikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRGF0YSByb3cgc2VnbWVudHMgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgdl9wSXRlcmF0b3JfMSA9IF9fdmFsdWVzKHZfcEl0ZXJhdG9yKSwgdl9wSXRlcmF0b3JfMV8xID0gdl9wSXRlcmF0b3JfMS5uZXh0KCk7ICF2X3BJdGVyYXRvcl8xXzEuZG9uZTsgdl9wSXRlcmF0b3JfMV8xID0gdl9wSXRlcmF0b3JfMS5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGFSb3dTZWdtZW50ID0gdl9wSXRlcmF0b3JfMV8xLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWRhdGFUYWJsZS5hZGREYXRhUm93KHJvd1R5cGUsIGRhdGFSb3dTZWdtZW50KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQWRkIGRhdGEgcm93IGZhaWx1cmUuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfNl8xKSB7IGVfNiA9IHsgZXJyb3I6IGVfNl8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2X3BJdGVyYXRvcl8xXzEgJiYgIXZfcEl0ZXJhdG9yXzFfMS5kb25lICYmIChfYSA9IHZfcEl0ZXJhdG9yXzEucmV0dXJuKSkgX2EuY2FsbCh2X3BJdGVyYXRvcl8xKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzYpIHRocm93IGVfNi5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBEYXRhVGFibGVNYW5hZ2VyLnByb3RvdHlwZS5pbnRlcm5hbERlc3Ryb3lEYXRhVGFibGUgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgdmFyIHZfcERhdGFUYWJsZSA9IHRoaXMubV9wRGF0YVRhYmxlLmdldChuYW1lKTtcbiAgICAgICAgICAgIGlmICh2X3BEYXRhVGFibGUpIHtcbiAgICAgICAgICAgICAgICB2X3BEYXRhVGFibGUuc2h1dGRvd24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BEYXRhVGFibGUuZGVsZXRlKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBEYXRhVGFibGVNYW5hZ2VyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIC8vIE5PT1AuXG4gICAgICAgIH07XG4gICAgICAgIERhdGFUYWJsZU1hbmFnZXIucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfNywgX2E7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BEYXRhVGFibGUudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkdCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBkdC5zaHV0ZG93bigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzdfMSkgeyBlXzcgPSB7IGVycm9yOiBlXzdfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV83KSB0aHJvdyBlXzcuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wRGF0YVRhYmxlLmNsZWFyKCk7XG4gICAgICAgIH07XG4gICAgICAgIERhdGFUYWJsZU1hbmFnZXIucHJvdG90eXBlLmxvYWREYXRhVGFibGVTdWNjZXNzQ2FsbGJhY2sgPSBmdW5jdGlvbiAoZGF0YVRhYmxlQXNzZXROYW1lLCBkYXRhVGFibGVBc3NldCwgZHVyYXRpb24sIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKCF2X3BJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgZGF0YSB0YWJsZSBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubV9wRGF0YVRhYmxlSGVscGVyLmxvYWREYXRhVGFibGUoZGF0YVRhYmxlQXNzZXQsIHZfcEluZm8ubG9hZFR5cGUsIHZfcEluZm8udXNlckRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgZGF0YSB0YWJsZSBmYWlsdXJlIGluIGhlbHBlciwgYXNzZXQgbmFtZSAnXCIgKyBkYXRhVGFibGVBc3NldE5hbWUgKyBcIicuXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkRGF0YVRhYmxlU3VjY2Vzc0RlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkRGF0YVRhYmxlU3VjY2Vzc0RlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oZGF0YVRhYmxlQXNzZXROYW1lLCB2X3BJbmZvLmxvYWRUeXBlLCBkdXJhdGlvbiwgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBFcnJvciAmJiB0aGlzLm1fcExvYWREYXRhVGFibGVGYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWREYXRhVGFibGVGYWlsdXJlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihkYXRhVGFibGVBc3NldE5hbWUsIHZfcEluZm8ubG9hZFR5cGUsIGUubWVzc2FnZSwgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAvLyByZWxlYXNlXG4gICAgICAgICAgICAgICAgdGhpcy5tX3BEYXRhVGFibGVIZWxwZXIucmVsZWFzZURhdGFUYWJsZUFzc2V0KGRhdGFUYWJsZUFzc2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUubG9hZERhdGFUYWJsZUZhaWx1cmVDYWxsYmFjayA9IGZ1bmN0aW9uIChkYXRhVGFibGVBc3NldE5hbWUsIHN0YXR1cywgZXJyb3JNZXNzYWdlLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmICghdl9wSW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2FkIGRhdGEgdGFibGUgaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHZhciB2X3NFcnJvck1lc3NhZ2UgPSBcIkxvYWQgZGF0YSB0YWJsZSBmYWlsdXJlLCBhc3NldCBuYW1lICdcIiArIGRhdGFUYWJsZUFzc2V0TmFtZSArIFwiJywgc3RhdHVzICdcIiArIHN0YXR1cyArIFwiJywgZXJyb3IgbWVzc2FnZSAnXCIgKyBlcnJvck1lc3NhZ2UgKyBcIicuXCI7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkRGF0YVRhYmxlRmFpbHVyZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWREYXRhVGFibGVGYWlsdXJlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGRhdGFUYWJsZUFzc2V0TmFtZSwgdl9wSW5mby5sb2FkVHlwZSwgdl9zRXJyb3JNZXNzYWdlLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Iodl9zRXJyb3JNZXNzYWdlKTtcbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUubG9hZERhdGFUYWJsZVVwZGF0ZUNhbGxiYWNrID0gZnVuY3Rpb24gKGRhdGFUYWJsZUFzc2V0TmFtZSwgcHJvZ3Jlc3MsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKCF2X3BJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgZGF0YSB0YWJsZSBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wTG9hZERhdGFUYWJsZVVwZGF0ZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWREYXRhVGFibGVVcGRhdGVEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oZGF0YVRhYmxlQXNzZXROYW1lLCB2X3BJbmZvLmxvYWRUeXBlLCBwcm9ncmVzcywgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIERhdGFUYWJsZU1hbmFnZXIucHJvdG90eXBlLmxvYWREYXRhVGFibGVEZXBlbmRlbmN5QXNzZXRDYWxsYmFjayA9IGZ1bmN0aW9uIChkYXRhVGFibGVBc3NldE5hbWUsIGRlcGVuZGVuY3lBc3NldE5hbWUsIGxvYWRlZENvdW50LCB0b3RhbENvdW50LCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmICghdl9wSW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2FkIGRhdGEgdGFibGUgaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWREYXRhVGFibGVEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkRGF0YVRhYmxlRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGRhdGFUYWJsZUFzc2V0TmFtZSwgZGVwZW5kZW5jeUFzc2V0TmFtZSwgbG9hZGVkQ291bnQsIHRvdGFsQ291bnQsIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gRGF0YVRhYmxlTWFuYWdlcjtcbiAgICB9KEJhc2VfMS5GcmFtZXdvcmtNb2R1bGUpKTsgLy8gY2xhc3MgRGF0YVRhYmxlTWFuYWdlclxuICAgIGV4cG9ydHMuRGF0YVRhYmxlTWFuYWdlciA9IERhdGFUYWJsZU1hbmFnZXI7XG59KTtcbiIsInZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgICAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xudmFyIF9fdmFsdWVzID0gKHRoaXMgJiYgdGhpcy5fX3ZhbHVlcykgfHwgZnVuY3Rpb24obykge1xuICAgIHZhciBzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciwgbSA9IHMgJiYgb1tzXSwgaSA9IDA7XG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xuICAgICAgICB9XG4gICAgfTtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XG59O1xuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIiwgXCIuL0Jhc2VcIiwgXCIuL09iamVjdFBvb2xcIl0sIGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIHZhciBCYXNlXzEgPSByZXF1aXJlKFwiLi9CYXNlXCIpO1xuICAgIHZhciBPYmplY3RQb29sXzEgPSByZXF1aXJlKFwiLi9PYmplY3RQb29sXCIpO1xuICAgIHZhciBFbnRpdHlTdGF0dXM7XG4gICAgKGZ1bmN0aW9uIChFbnRpdHlTdGF0dXMpIHtcbiAgICAgICAgRW50aXR5U3RhdHVzW0VudGl0eVN0YXR1c1tcIldpbGxJbml0XCJdID0gMF0gPSBcIldpbGxJbml0XCI7XG4gICAgICAgIEVudGl0eVN0YXR1c1tFbnRpdHlTdGF0dXNbXCJJbml0ZWRcIl0gPSAxXSA9IFwiSW5pdGVkXCI7XG4gICAgICAgIEVudGl0eVN0YXR1c1tFbnRpdHlTdGF0dXNbXCJXaWxsU2hvd1wiXSA9IDJdID0gXCJXaWxsU2hvd1wiO1xuICAgICAgICBFbnRpdHlTdGF0dXNbRW50aXR5U3RhdHVzW1wiU2hvd2VkXCJdID0gM10gPSBcIlNob3dlZFwiO1xuICAgICAgICBFbnRpdHlTdGF0dXNbRW50aXR5U3RhdHVzW1wiV2lsbEhpZGVcIl0gPSA0XSA9IFwiV2lsbEhpZGVcIjtcbiAgICAgICAgRW50aXR5U3RhdHVzW0VudGl0eVN0YXR1c1tcIkhpZGRlblwiXSA9IDVdID0gXCJIaWRkZW5cIjtcbiAgICAgICAgRW50aXR5U3RhdHVzW0VudGl0eVN0YXR1c1tcIldpbGxSZWN5Y2xlXCJdID0gNl0gPSBcIldpbGxSZWN5Y2xlXCI7XG4gICAgICAgIEVudGl0eVN0YXR1c1tFbnRpdHlTdGF0dXNbXCJSZWN5Y2xlZFwiXSA9IDddID0gXCJSZWN5Y2xlZFwiO1xuICAgIH0pKEVudGl0eVN0YXR1cyB8fCAoRW50aXR5U3RhdHVzID0ge30pKTsgLy8gY2xhc3MgRW50aXR5U3RhdHVzXG4gICAgdmFyIEVudGl0eUluZm8gPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZ1bmN0aW9uIEVudGl0eUluZm8oZW50aXR5KSB7XG4gICAgICAgICAgICB0aGlzLm1fcFN0YXR1cyA9IEVudGl0eVN0YXR1cy5XaWxsSW5pdDtcbiAgICAgICAgICAgIGlmICghZW50aXR5KVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW50aXR5IGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB0aGlzLm1fcEVudGl0eSA9IGVudGl0eTtcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRW50aXR5SW5mby5wcm90b3R5cGUsIFwiZW50aXR5XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BFbnRpdHk7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRW50aXR5SW5mby5wcm90b3R5cGUsIFwic3RhdHVzXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTdGF0dXM7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1fcFN0YXR1cyA9IHZhbHVlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEVudGl0eUluZm8ucHJvdG90eXBlLCBcInBhcmVudEVudGl0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wUGFyZW50RW50aXR5OyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX3BQYXJlbnRFbnRpdHkgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIEVudGl0eUluZm8ucHJvdG90eXBlLmdldENoaWxkRW50aXRpZXMgPSBmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMgfHwgW107XG4gICAgICAgICAgICByZXN1bHRzLnNwbGljZSgwLCByZXN1bHRzLmxlbmd0aCk7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BDaGlsZEVudGl0aWVzKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1fcENoaWxkRW50aXRpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMubV9wQ2hpbGRFbnRpdGllc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eUluZm8ucHJvdG90eXBlLmFkZENoaWxkRW50aXR5ID0gZnVuY3Rpb24gKGNoaWxkRW50aXR5KSB7XG4gICAgICAgICAgICB0aGlzLm1fcENoaWxkRW50aXRpZXMgPSB0aGlzLm1fcENoaWxkRW50aXRpZXMgfHwgW107XG4gICAgICAgICAgICB2YXIgaWR4ID0gdGhpcy5tX3BDaGlsZEVudGl0aWVzLmluZGV4T2YoY2hpbGRFbnRpdHkpO1xuICAgICAgICAgICAgaWYgKC0xIDwgaWR4KVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG5vdCBhZGQgY2hpbGQgZW50aXR5IHdoaWNoIGlzIGFscmVhZHkgZXhpc3RzLicpO1xuICAgICAgICAgICAgdGhpcy5tX3BDaGlsZEVudGl0aWVzLnB1c2goY2hpbGRFbnRpdHkpO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlJbmZvLnByb3RvdHlwZS5yZW1vdmVDaGlsZEVudGl0eSA9IGZ1bmN0aW9uIChjaGlsZEVudGl0eSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1fcENoaWxkRW50aXRpZXMpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIGlkeCA9IHRoaXMubV9wQ2hpbGRFbnRpdGllcy5pbmRleE9mKGNoaWxkRW50aXR5KTtcbiAgICAgICAgICAgIGlmICgtMSA8IGlkeClcbiAgICAgICAgICAgICAgICB0aGlzLm1fcENoaWxkRW50aXRpZXMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW4gbm90IHJlbW92ZSBjaGlsZCBlbnRpdHkgd2hpY2ggaXMgbm90IGV4aXN0LicpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gRW50aXR5SW5mbztcbiAgICB9KCkpOyAvLyBjbGFzcyBFbnRpdHlJbmZvXG4gICAgdmFyIEVudGl0eUdyb3VwID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBFbnRpdHlHcm91cChuYW1lLCBpbnN0YW5jZUF1dG9SZWxlYXNlSW50ZXJ2YWwsIGluc3RhbmNlQ2FwYWNpdHksIGluc3RhbmNlRXhwaXJlVGltZSwgaW5zdGFuY2VQcmlvcml0eSwgZW50aXR5R3JvdXBIZWxwZXIsIG9iamVjdFBvb2xNYW5hZ2VyKSB7XG4gICAgICAgICAgICB0aGlzLm1fcEVudGl0aWVzID0gbmV3IFNldCgpO1xuICAgICAgICAgICAgaWYgKCFuYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW50aXR5IGdyb3VwIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGlmICghZW50aXR5R3JvdXBIZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbnRpdHkgZ3JvdXAgaGVscGVyIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB0aGlzLm1fc05hbWUgPSBuYW1lO1xuICAgICAgICAgICAgdGhpcy5tX3BFbnRpdHlHcm91cEhlbHBlciA9IGVudGl0eUdyb3VwSGVscGVyO1xuICAgICAgICAgICAgdGhpcy5tX3BJbnN0YW5jZVBvb2wgPSBvYmplY3RQb29sTWFuYWdlci5jcmVhdGVTaW5nbGVTcGF3bk9iamVjdFBvb2woe1xuICAgICAgICAgICAgICAgIG5hbWU6IFwiRW50aXR5IEluc3RhbmNlIFBvb2wgKFwiICsgbmFtZSArIFwiKVwiLFxuICAgICAgICAgICAgICAgIGNhcGFjaXR5OiBpbnN0YW5jZUNhcGFjaXR5LFxuICAgICAgICAgICAgICAgIGV4cGlyZVRpbWU6IGluc3RhbmNlRXhwaXJlVGltZSxcbiAgICAgICAgICAgICAgICBwcmlvcml0eTogaW5zdGFuY2VQcmlvcml0eVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLm1fcEVudGl0aWVzID0gbmV3IFNldCgpO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFbnRpdHlHcm91cC5wcm90b3R5cGUsIFwibmFtZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9zTmFtZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFbnRpdHlHcm91cC5wcm90b3R5cGUsIFwiZW50aXR5Q291bnRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcEVudGl0aWVzLnNpemU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRW50aXR5R3JvdXAucHJvdG90eXBlLCBcImluc3RhbmNlQXV0b1JlbGVhc2VJbnRlcnZhbFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9mSW5zdGFuY2VBdXRvUmVsZWFzZUludGVydmFsOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fZkluc3RhbmNlQXV0b1JlbGVhc2VJbnRlcnZhbCA9IHZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFbnRpdHlHcm91cC5wcm90b3R5cGUsIFwiaW5zdGFuY2VDYXBhY2l0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9mSW5zdGFuY2VDYXBhY2l0eTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX2ZJbnN0YW5jZUNhcGFjaXR5ID0gdmFsdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEVudGl0eUdyb3VwLnByb3RvdHlwZSwgXCJpbnN0YW5jZUV4cGlyZVRpbWVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fZkluc3RhbmNlRXhwaXJlVGltZTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX2ZJbnN0YW5jZUV4cGlyZVRpbWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRW50aXR5R3JvdXAucHJvdG90eXBlLCBcImluc3RhbmNlUHJpb3JpdHlcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fZkluc3RhbmNlUHJpb3JpdHk7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9mSW5zdGFuY2VQcmlvcml0eSA9IHZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFbnRpdHlHcm91cC5wcm90b3R5cGUsIFwiaGVscGVyXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BFbnRpdHlHcm91cEhlbHBlcjsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIEVudGl0eUdyb3VwLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIHZhciBlXzEsIF9hO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRW50aXRpZXMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbnRpdHkgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgZW50aXR5Lm9uVXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xXzEpIHsgZV8xID0geyBlcnJvcjogZV8xXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eUdyb3VwLnByb3RvdHlwZS5oYXNFbnRpdHkgPSBmdW5jdGlvbiAoZW50aXR5SWRPckFzc2V0TmFtZSkge1xuICAgICAgICAgICAgdmFyIGVfMiwgX2EsIGVfMywgX2I7XG4gICAgICAgICAgICBpZiAoJ251bWJlcicgPT09IHR5cGVvZiBlbnRpdHlJZE9yQXNzZXROYW1lKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2MgPSBfX3ZhbHVlcyh0aGlzLm1fcEVudGl0aWVzLnZhbHVlcygpKSwgX2QgPSBfYy5uZXh0KCk7ICFfZC5kb25lOyBfZCA9IF9jLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVudGl0eSA9IF9kLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVudGl0eS5pZCA9PSBlbnRpdHlJZE9yQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzJfMSkgeyBlXzIgPSB7IGVycm9yOiBlXzJfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2QgJiYgIV9kLmRvbmUgJiYgKF9hID0gX2MucmV0dXJuKSkgX2EuY2FsbChfYyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzIpIHRocm93IGVfMi5lcnJvcjsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghZW50aXR5SWRPckFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbnRpdHkgYXNzZXQgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9lID0gX192YWx1ZXModGhpcy5tX3BFbnRpdGllcy52YWx1ZXMoKSksIF9mID0gX2UubmV4dCgpOyAhX2YuZG9uZTsgX2YgPSBfZS5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbnRpdHkgPSBfZi52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbnRpdHkuZW50aXR5QXNzZXROYW1lID09IGVudGl0eUlkT3JBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVfM18xKSB7IGVfMyA9IHsgZXJyb3I6IGVfM18xIH07IH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfZiAmJiAhX2YuZG9uZSAmJiAoX2IgPSBfZS5yZXR1cm4pKSBfYi5jYWxsKF9lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMykgdGhyb3cgZV8zLmVycm9yOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlHcm91cC5wcm90b3R5cGUuZ2V0RW50aXR5ID0gZnVuY3Rpb24gKGVudGl0eUlkT3JBc3NldE5hbWUpIHtcbiAgICAgICAgICAgIHZhciBlXzQsIF9hLCBlXzUsIF9iO1xuICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2YgZW50aXR5SWRPckFzc2V0TmFtZSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9jID0gX192YWx1ZXModGhpcy5tX3BFbnRpdGllcy52YWx1ZXMoKSksIF9kID0gX2MubmV4dCgpOyAhX2QuZG9uZTsgX2QgPSBfYy5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbnRpdHkgPSBfZC52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbnRpdHkuaWQgPT0gZW50aXR5SWRPckFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZW50aXR5O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzRfMSkgeyBlXzQgPSB7IGVycm9yOiBlXzRfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2QgJiYgIV9kLmRvbmUgJiYgKF9hID0gX2MucmV0dXJuKSkgX2EuY2FsbChfYyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzQpIHRocm93IGVfNC5lcnJvcjsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghZW50aXR5SWRPckFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbnRpdHkgYXNzZXQgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9lID0gX192YWx1ZXModGhpcy5tX3BFbnRpdGllcy52YWx1ZXMoKSksIF9mID0gX2UubmV4dCgpOyAhX2YuZG9uZTsgX2YgPSBfZS5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbnRpdHkgPSBfZi52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbnRpdHkuZW50aXR5QXNzZXROYW1lID09IGVudGl0eUlkT3JBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVudGl0eTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV81XzEpIHsgZV81ID0geyBlcnJvcjogZV81XzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9mICYmICFfZi5kb25lICYmIChfYiA9IF9lLnJldHVybikpIF9iLmNhbGwoX2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV81KSB0aHJvdyBlXzUuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5R3JvdXAucHJvdG90eXBlLmdldEVudGl0aWVzID0gZnVuY3Rpb24gKGVudGl0eUFzc2V0TmFtZSwgcmVzdWx0cykge1xuICAgICAgICAgICAgdmFyIGVfNiwgX2E7XG4gICAgICAgICAgICBpZiAoIWVudGl0eUFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VudGl0eSBhc3NldCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cyB8fCBbXTtcbiAgICAgICAgICAgIHJlc3VsdHMuc3BsaWNlKDAsIHJlc3VsdHMubGVuZ3RoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcEVudGl0aWVzLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZW50aXR5ID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbnRpdHkuZW50aXR5QXNzZXROYW1lID09IGVudGl0eUFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChlbnRpdHkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzZfMSkgeyBlXzYgPSB7IGVycm9yOiBlXzZfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV82KSB0aHJvdyBlXzYuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlHcm91cC5wcm90b3R5cGUuZ2V0QWxsRW50aXRpZXMgPSBmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgICAgICAgdmFyIGVfNywgX2E7XG4gICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cyB8fCBbXTtcbiAgICAgICAgICAgIHJlc3VsdHMuc3BsaWNlKDAsIHJlc3VsdHMubGVuZ3RoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcEVudGl0aWVzLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZW50aXR5ID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChlbnRpdHkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzdfMSkgeyBlXzcgPSB7IGVycm9yOiBlXzdfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV83KSB0aHJvdyBlXzcuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlHcm91cC5wcm90b3R5cGUuYWRkRW50aXR5ID0gZnVuY3Rpb24gKGVudGl0eSkge1xuICAgICAgICAgICAgdGhpcy5tX3BFbnRpdGllcy5hZGQoZW50aXR5KTtcbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5R3JvdXAucHJvdG90eXBlLnJlbW92ZUVudGl0eSA9IGZ1bmN0aW9uIChlbnRpdHkpIHtcbiAgICAgICAgICAgIHRoaXMubV9wRW50aXRpZXMuZGVsZXRlKGVudGl0eSk7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eUdyb3VwLnByb3RvdHlwZS5yZWdpc3RlckVudGl0eUluc3RhbmNlT2JqZWN0ID0gZnVuY3Rpb24gKGVudGl0eUluc3RhbmNlT2JqZWN0LCBzcGF3bikge1xuICAgICAgICAgICAgdGhpcy5tX3BJbnN0YW5jZVBvb2wucmVnaXN0ZXIoZW50aXR5SW5zdGFuY2VPYmplY3QsIHNwYXduKTtcbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5R3JvdXAucHJvdG90eXBlLnNwYXduRW50aXR5SW5zdGFuY2VPYmplY3QgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wSW5zdGFuY2VQb29sLnNwYXduKG5hbWUpO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlHcm91cC5wcm90b3R5cGUudW5zcGF3bkVudGl0eSA9IGZ1bmN0aW9uIChlbnRpdHkpIHtcbiAgICAgICAgICAgIHRoaXMubV9wSW5zdGFuY2VQb29sLnVuc3Bhd25CeVRhcmdldChlbnRpdHkuaGFuZGxlKTtcbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5R3JvdXAucHJvdG90eXBlLnNldEVudGl0eUluc3RhbmNlTG9ja2VkID0gZnVuY3Rpb24gKGVudGl0eUluc3RhbmNlLCBsb2NrZWQpIHtcbiAgICAgICAgICAgIGlmICghZW50aXR5SW5zdGFuY2UpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbnRpdHkgaW5zdGFuY2UgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHRoaXMubV9wSW5zdGFuY2VQb29sLnNldExvY2tlZEJ5VGFyZ2V0KGVudGl0eUluc3RhbmNlLCBsb2NrZWQpO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlHcm91cC5wcm90b3R5cGUuc2V0RW50aXR5SW5zdGFuY2VQcmlvcml0eSA9IGZ1bmN0aW9uIChlbnRpdHlJbnN0YW5jZSwgcHJpb3JpdHkpIHtcbiAgICAgICAgICAgIGlmICghZW50aXR5SW5zdGFuY2UpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbnRpdHkgaW5zdGFuY2UgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHRoaXMubV9wSW5zdGFuY2VQb29sLnNldFByaW9yaXR5QnlUYXJnZXQoZW50aXR5SW5zdGFuY2UsIHByaW9yaXR5KTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIEVudGl0eUdyb3VwO1xuICAgIH0oKSk7IC8vIGNsYXNzIEVudGl0eUdyb3VwXG4gICAgLyoqXG4gICAgICogRW50aXR5IG1hbmFnZW1lbnQgbW9kdWxlLlxuICAgICAqL1xuICAgIHZhciBFbnRpdHlNYW5hZ2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICBfX2V4dGVuZHMoRW50aXR5TWFuYWdlciwgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gRW50aXR5TWFuYWdlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICAgICAgX3RoaXMubV9wRW50aXR5SW5mb3MgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BFbnRpdHlHcm91cHMgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BFbnRpdGllc0JlaW5nTG9hZGVkID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgX3RoaXMubV9wRW50aXRpZXNUb1JlbGVhc2VPbkxvYWQgPSBuZXcgU2V0KCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BSZWN5Y2xlUXVldWUgPSBuZXcgU2V0KCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BTaG93RW50aXR5U3VjY2Vzc0RlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcFNob3dFbnRpdHlGYWlsdXJlRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wU2hvd0VudGl0eVVwZGF0ZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcFNob3dFbnRpdHlEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BIaWRlRW50aXR5Q29tcGxldGVEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX2lTZXJpYWwgPSAwO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZEFzc2V0Q2FsbGJhY2tzID0ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IF90aGlzLmxvYWRFbnRpdHlTdWNjZXNzQ2FsbGJhY2suYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgZmFpbHVyZTogX3RoaXMubG9hZEVudGl0eUZhaWx1cmVDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICB1cGRhdGU6IF90aGlzLmxvYWRFbnRpdHlVcGRhdGVDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICBkZXBlbmRlbmN5OiBfdGhpcy5sb2FkRW50aXR5RGVwZW5kZW5jeUFzc2V0Q2FsbGJhY2suYmluZChfdGhpcylcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEVudGl0eU1hbmFnZXIucHJvdG90eXBlLCBcImVudGl0eUNvdW50XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcEVudGl0eUluZm9zLnNpemU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEVudGl0eU1hbmFnZXIucHJvdG90eXBlLCBcImVudGl0eUdyb3VwQ291bnRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wRW50aXR5R3JvdXBzLnNpemU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEVudGl0eU1hbmFnZXIucHJvdG90eXBlLCBcInNob3dFbnRpdHlTdWNjZXNzXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTaG93RW50aXR5U3VjY2Vzc0RlbGVnYXRlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEVudGl0eU1hbmFnZXIucHJvdG90eXBlLCBcInNob3dFbnRpdHlGYWlsdXJlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTaG93RW50aXR5RmFpbHVyZURlbGVnYXRlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEVudGl0eU1hbmFnZXIucHJvdG90eXBlLCBcInNob3dFbnRpdHlVcGRhdGVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFNob3dFbnRpdHlVcGRhdGVEZWxlZ2F0ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZSwgXCJzaG93RW50aXR5RGVwZW5kZW5jeUFzc2V0XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTaG93RW50aXR5RGVwZW5kZW5jeUFzc2V0RGVsZWdhdGU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRW50aXR5TWFuYWdlci5wcm90b3R5cGUsIFwiaGlkZUVudGl0eUNvbXBsZXRlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BIaWRlRW50aXR5Q29tcGxldGVEZWxlZ2F0ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIEVudGl0eU1hbmFnZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgdmFyIGVfOCwgX2EsIGVfOSwgX2I7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9jID0gX192YWx1ZXModGhpcy5tX3BSZWN5Y2xlUXVldWUudmFsdWVzKCkpLCBfZCA9IF9jLm5leHQoKTsgIV9kLmRvbmU7IF9kID0gX2MubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmZvID0gX2QudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2X3BFbnRpdHkgPSBpbmZvLmVudGl0eTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZfcEVudGl0eUdyb3VwID0gdl9wRW50aXR5LmVudGl0eUdyb3VwO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXZfcEVudGl0eUdyb3VwKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbnRpdHkgZ3JvdXAgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgICAgICAgICAgaW5mby5zdGF0dXMgPSBFbnRpdHlTdGF0dXMuV2lsbFJlY3ljbGU7XG4gICAgICAgICAgICAgICAgICAgIHZfcEVudGl0eS5vblJlY3ljbGUoKTtcbiAgICAgICAgICAgICAgICAgICAgaW5mby5zdGF0dXMgPSBFbnRpdHlTdGF0dXMuUmVjeWNsZWQ7XG4gICAgICAgICAgICAgICAgICAgIHZfcEVudGl0eUdyb3VwLnVuc3Bhd25FbnRpdHkodl9wRW50aXR5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV84XzEpIHsgZV84ID0geyBlcnJvcjogZV84XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9kICYmICFfZC5kb25lICYmIChfYSA9IF9jLnJldHVybikpIF9hLmNhbGwoX2MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfOCkgdGhyb3cgZV84LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcFJlY3ljbGVRdWV1ZS5jbGVhcigpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfZSA9IF9fdmFsdWVzKHRoaXMubV9wRW50aXR5R3JvdXBzLnZhbHVlcygpKSwgX2YgPSBfZS5uZXh0KCk7ICFfZi5kb25lOyBfZiA9IF9lLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZ3JvdXAgPSBfZi52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXAudXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV85XzEpIHsgZV85ID0geyBlcnJvcjogZV85XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9mICYmICFfZi5kb25lICYmIChfYiA9IF9lLnJldHVybikpIF9iLmNhbGwoX2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfOSkgdGhyb3cgZV85LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eU1hbmFnZXIucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5oaWRlQWxsTG9hZGVkRW50aXRpZXMoKTtcbiAgICAgICAgICAgIHRoaXMubV9wRW50aXR5R3JvdXBzLmNsZWFyKCk7XG4gICAgICAgICAgICB0aGlzLm1fcEVudGl0aWVzQmVpbmdMb2FkZWQuY2xlYXIoKTtcbiAgICAgICAgICAgIHRoaXMubV9wRW50aXRpZXNUb1JlbGVhc2VPbkxvYWQuY2xlYXIoKTtcbiAgICAgICAgICAgIHRoaXMubV9wUmVjeWNsZVF1ZXVlLmNsZWFyKCk7XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZSwgXCJyZXNvdXJjZU1hbmFnZXJcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFJlc291cmNlTWFuYWdlcjsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIgPSB2YWx1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRW50aXR5TWFuYWdlci5wcm90b3R5cGUsIFwib2JqZWN0UG9vbE1hbmFnZXJcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcE9iamVjdFBvb2xNYW5hZ2VyOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX3BPYmplY3RQb29sTWFuYWdlciA9IHZhbHVlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEVudGl0eU1hbmFnZXIucHJvdG90eXBlLCBcImVudGl0eUhlbHBlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wRW50aXR5SGVscGVyOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEVudGl0eUhlbHBlciA9IHZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIEVudGl0eU1hbmFnZXIucHJvdG90eXBlLmhhc0VudGl0eUdyb3VwID0gZnVuY3Rpb24gKGVudGl0eUdyb3VwTmFtZSkge1xuICAgICAgICAgICAgaWYgKCFlbnRpdHlHcm91cE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbnRpdHkgZ3JvdXAgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wRW50aXR5R3JvdXBzLmhhcyhlbnRpdHlHcm91cE5hbWUpO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZS5nZXRFbnRpdHlHcm91cCA9IGZ1bmN0aW9uIChlbnRpdHlHcm91cE5hbWUpIHtcbiAgICAgICAgICAgIGlmICghZW50aXR5R3JvdXBOYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW50aXR5IGdyb3VwIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcEVudGl0eUdyb3Vwcy5nZXQoZW50aXR5R3JvdXBOYW1lKSB8fCBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZS5nZXRBbGxFbnRpdHlHcm91cHMgPSBmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgICAgICAgdmFyIGVfMTAsIF9hO1xuICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMgfHwgW107XG4gICAgICAgICAgICByZXN1bHRzLnNwbGljZSgwLCByZXN1bHRzLmxlbmd0aCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BFbnRpdHlHcm91cHMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBncm91cCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goZ3JvdXApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzEwXzEpIHsgZV8xMCA9IHsgZXJyb3I6IGVfMTBfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xMCkgdGhyb3cgZV8xMC5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eU1hbmFnZXIucHJvdG90eXBlLmFkZEVudGl0eUdyb3VwID0gZnVuY3Rpb24gKGVudGl0eUdyb3VwTmFtZSwgaW5zdGFuY2VBdXRvUmVsZWFzZUludGVydmFsLCBpbnN0YW5jZUNhcGFjaXR5LCBpbnN0YW5jZUV4cGlyZVRpbWUsIGluc3RhbmNlUHJpb3JpdHksIGVudGl0eUdyb3VwSGVscGVyKSB7XG4gICAgICAgICAgICBpZiAoIWVudGl0eUdyb3VwTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VudGl0eSBncm91cCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBpZiAoIWVudGl0eUdyb3VwSGVscGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW50aXR5IGdyb3VwIGhlbHBlciBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1fcE9iamVjdFBvb2xNYW5hZ2VyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignWW91IG11c3Qgc2V0IG9iamVjdCBwb29sIG1hbmFnZXIgZmlyc3QuJyk7XG4gICAgICAgICAgICBpZiAodGhpcy5oYXNFbnRpdHlHcm91cChlbnRpdHlHcm91cE5hbWUpKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubV9wRW50aXR5R3JvdXBzLnNldChlbnRpdHlHcm91cE5hbWUsIG5ldyBFbnRpdHlHcm91cChlbnRpdHlHcm91cE5hbWUsIGluc3RhbmNlQXV0b1JlbGVhc2VJbnRlcnZhbCwgaW5zdGFuY2VDYXBhY2l0eSwgaW5zdGFuY2VFeHBpcmVUaW1lLCBpbnN0YW5jZVByaW9yaXR5LCBlbnRpdHlHcm91cEhlbHBlciwgdGhpcy5tX3BPYmplY3RQb29sTWFuYWdlcikpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eU1hbmFnZXIucHJvdG90eXBlLmhhc0VudGl0eSA9IGZ1bmN0aW9uIChlbnRpdHlJZE9yQXNzZXROYW1lKSB7XG4gICAgICAgICAgICB2YXIgZV8xMSwgX2E7XG4gICAgICAgICAgICBpZiAoJ251bWJlcicgPT09IHR5cGVvZiBlbnRpdHlJZE9yQXNzZXROYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wRW50aXR5SW5mb3MuZ2V0KGVudGl0eUlkT3JBc3NldE5hbWUpID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFlbnRpdHlJZE9yQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VudGl0eSBhc3NldCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcEVudGl0eUluZm9zLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGluZm8gPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmZvLmVudGl0eS5lbnRpdHlBc3NldE5hbWUgPT0gZW50aXR5SWRPckFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV8xMV8xKSB7IGVfMTEgPSB7IGVycm9yOiBlXzExXzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xMSkgdGhyb3cgZV8xMS5lcnJvcjsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5TWFuYWdlci5wcm90b3R5cGUuZ2V0RW50aXR5ID0gZnVuY3Rpb24gKGVudGl0eUlkT3JBc3NldE5hbWUpIHtcbiAgICAgICAgICAgIHZhciBlXzEyLCBfYTtcbiAgICAgICAgICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIGVudGl0eUlkT3JBc3NldE5hbWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHRoaXMubV9wRW50aXR5SW5mb3MuZ2V0KGVudGl0eUlkT3JBc3NldE5hbWUpO1xuICAgICAgICAgICAgICAgIGlmICh2X3BJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2X3BJbmZvLmVudGl0eTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVudGl0eUlkT3JBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW50aXR5IGFzc2V0IG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRW50aXR5SW5mb3MudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5mbyA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZm8uZW50aXR5LmVudGl0eUFzc2V0TmFtZSA9PSBlbnRpdHlJZE9yQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpbmZvLmVudGl0eTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV8xMl8xKSB7IGVfMTIgPSB7IGVycm9yOiBlXzEyXzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xMikgdGhyb3cgZV8xMi5lcnJvcjsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZS5nZXRFbnRpdGllcyA9IGZ1bmN0aW9uIChlbnRpdHlBc3NldE5hbWUsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgIHZhciBlXzEzLCBfYTtcbiAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzIHx8IFtdO1xuICAgICAgICAgICAgcmVzdWx0cy5zcGxpY2UoMCwgcmVzdWx0cy5sZW5ndGgpO1xuICAgICAgICAgICAgaWYgKCFlbnRpdHlBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbnRpdHkgYXNzZXQgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRW50aXR5SW5mb3MudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmZvID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmZvLmVudGl0eS5lbnRpdHlBc3NldE5hbWUgPT0gZW50aXR5QXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGluZm8uZW50aXR5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xM18xKSB7IGVfMTMgPSB7IGVycm9yOiBlXzEzXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMTMpIHRocm93IGVfMTMuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZS5nZXRBbGxMb2FkZWRFbnRpdGllcyA9IGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgICAgICB2YXIgZV8xNCwgX2E7XG4gICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cyB8fCBbXTtcbiAgICAgICAgICAgIHJlc3VsdHMuc3BsaWNlKDAsIHJlc3VsdHMubGVuZ3RoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcEVudGl0eUluZm9zLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5mbyA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goaW5mby5lbnRpdHkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzE0XzEpIHsgZV8xNCA9IHsgZXJyb3I6IGVfMTRfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xNCkgdGhyb3cgZV8xNC5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eU1hbmFnZXIucHJvdG90eXBlLmdldEFsbExvYWRpbmdFbnRpdHlJZHMgPSBmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgICAgICAgdmFyIGVfMTUsIF9hO1xuICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMgfHwgW107XG4gICAgICAgICAgICByZXN1bHRzLnNwbGljZSgwLCByZXN1bHRzLmxlbmd0aCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BFbnRpdGllc0JlaW5nTG9hZGVkLmtleXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goa2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xNV8xKSB7IGVfMTUgPSB7IGVycm9yOiBlXzE1XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMTUpIHRocm93IGVfMTUuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZS5pc0xvYWRpbmdFbnRpdHkgPSBmdW5jdGlvbiAoZW50aXR5SWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcEVudGl0aWVzQmVpbmdMb2FkZWQuaGFzKGVudGl0eUlkKTtcbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5TWFuYWdlci5wcm90b3R5cGUuaXNWYWxpZEVudGl0eSA9IGZ1bmN0aW9uIChlbnRpdHkpIHtcbiAgICAgICAgICAgIGlmICghZW50aXR5KVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhhc0VudGl0eShlbnRpdHkuaWQpO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZS5zaG93RW50aXR5ID0gZnVuY3Rpb24gKGVudGl0eUlkLCBlbnRpdHlBc3NldE5hbWUsIGVudGl0eUdyb3VwTmFtZSwgYW55QXJnMSwgYW55QXJnMikge1xuICAgICAgICAgICAgdmFyIHByaW9yaXR5ID0gMDtcbiAgICAgICAgICAgIHZhciB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIGFueUFyZzEpIHtcbiAgICAgICAgICAgICAgICBwcmlvcml0eSA9IGFueUFyZzE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh1bmRlZmluZWQgIT0gYW55QXJnMSAmJiB1bmRlZmluZWQgPT0gYW55QXJnMikge1xuICAgICAgICAgICAgICAgIHVzZXJEYXRhID0gYW55QXJnMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh1bmRlZmluZWQgIT0gYW55QXJnMilcbiAgICAgICAgICAgICAgICB1c2VyRGF0YSA9IGFueUFyZzI7XG4gICAgICAgICAgICBpZiAoIXRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignWW91IG11c3Qgc2V0IHJlc291cmNlIG1hbmFnZXIgZmlyc3QuJyk7XG4gICAgICAgICAgICBpZiAoIXRoaXMubV9wRW50aXR5SGVscGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignWW91IG11c3Qgc2V0IGVudGl0eSBoZWxwZXIgZmlyc3QuJyk7XG4gICAgICAgICAgICBpZiAoIWVudGl0eUFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VudGl0eSBhc3NldCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBpZiAoIWVudGl0eUdyb3VwTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VudGl0eSBncm91cCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BFbnRpdHlJbmZvcy5oYXMoZW50aXR5SWQpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVudGl0eSBpZCAnXCIgKyBlbnRpdHlJZCArIFwiJyBpcyBhbHJlYWR5IGV4aXN0cy5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmdFbnRpdHkoZW50aXR5SWQpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVudGl0eSAnXCIgKyBlbnRpdHlJZCArIFwiJyBpcyBhbHJlYWR5IGJlaW5nIGxvYWRlZC5cIik7XG4gICAgICAgICAgICB2YXIgdl9wRW50aXR5R3JvdXAgPSB0aGlzLmdldEVudGl0eUdyb3VwKGVudGl0eUdyb3VwTmFtZSk7XG4gICAgICAgICAgICBpZiAoIXZfcEVudGl0eUdyb3VwKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVudGl0eSBncm91cCAnXCIgKyBlbnRpdHlHcm91cE5hbWUgKyBcIicgaXMgbm90IGV4aXN0LlwiKTtcbiAgICAgICAgICAgIHZhciB2X3BFbnRpdHlJbnN0YW5jZU9iamVjdCA9IHZfcEVudGl0eUdyb3VwLnNwYXduRW50aXR5SW5zdGFuY2VPYmplY3QoZW50aXR5QXNzZXROYW1lKTtcbiAgICAgICAgICAgIC8vIGlmICh0aGlzLm1fcEluc3RhbmNlUG9vbC5oYXMoZW50aXR5QXNzZXROYW1lKSkge1xuICAgICAgICAgICAgLy8gICAgIGxldCB2X3BJbnN0YW5jZU9iamVjdHM6IEVudGl0eUluc3RhbmNlT2JqZWN0W10gfCB1bmRlZmluZWQgPSB0aGlzLm1fcEluc3RhbmNlUG9vbC5nZXQoZW50aXR5QXNzZXROYW1lKTtcbiAgICAgICAgICAgIC8vICAgICBpZiAodl9wSW5zdGFuY2VPYmplY3RzICYmIHZfcEluc3RhbmNlT2JqZWN0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIGZvciAoY29uc3QgaW5zdGFuY2VPYmplY3Qgb2Ygdl9wSW5zdGFuY2VPYmplY3RzKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICBpZiAoaW5zdGFuY2VPYmplY3QuaXNWYWxpZCAmJiAhaW5zdGFuY2VPYmplY3Quc3Bhd24pIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICB2X3BFbnRpdHlJbnN0YW5jZU9iamVjdCA9IGluc3RhbmNlT2JqZWN0O1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgIGluc3RhbmNlT2JqZWN0LnNwYXduID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vICAgICAgICAgfVxuICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIGlmICghdl9wRW50aXR5SW5zdGFuY2VPYmplY3QpIHtcbiAgICAgICAgICAgICAgICB2YXIgdl9pU2VyaWFsSWQgPSB0aGlzLm1faVNlcmlhbCsrO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRW50aXRpZXNCZWluZ0xvYWRlZC5zZXQoZW50aXR5SWQsIHZfaVNlcmlhbElkKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlci5sb2FkQXNzZXQoZW50aXR5QXNzZXROYW1lLCBwcmlvcml0eSwgdGhpcy5tX3BMb2FkQXNzZXRDYWxsYmFja3MsIHtcbiAgICAgICAgICAgICAgICAgICAgc2VyaWFsSWQ6IHZfaVNlcmlhbElkLFxuICAgICAgICAgICAgICAgICAgICBlbnRpdHlJZDogZW50aXR5SWQsXG4gICAgICAgICAgICAgICAgICAgIGVudGl0eUdyb3VwOiB2X3BFbnRpdHlHcm91cCxcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGE6IHVzZXJEYXRhXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbFNob3dFbnRpdHkoZW50aXR5SWQsIGVudGl0eUFzc2V0TmFtZSwgdl9wRW50aXR5R3JvdXAsIHZfcEVudGl0eUluc3RhbmNlT2JqZWN0LnRhcmdldCwgZmFsc2UsIDAsIHVzZXJEYXRhKTtcbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5TWFuYWdlci5wcm90b3R5cGUuaGlkZUVudGl0eSA9IGZ1bmN0aW9uIChhbnlBcmcxLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdXNlckRhdGEgPSB1c2VyRGF0YSB8fCBudWxsO1xuICAgICAgICAgICAgdmFyIGVudGl0eUlkO1xuICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2YgYW55QXJnMSkge1xuICAgICAgICAgICAgICAgIGVudGl0eUlkID0gYW55QXJnMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghYW55QXJnMSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbnRpdHkgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgICAgICBlbnRpdHlJZCA9IGFueUFyZzEuaWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmdFbnRpdHkoZW50aXR5SWQpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm1fcEVudGl0aWVzQmVpbmdMb2FkZWQuaGFzKGVudGl0eUlkKSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuIG5vdCBmaW5kIGVudGl0eSAnXCIgKyBlbnRpdHlJZCArIFwiJ1wiKTtcbiAgICAgICAgICAgICAgICB2YXIgdl9pU2VyaWFsSWQgPSB0aGlzLm1fcEVudGl0aWVzQmVpbmdMb2FkZWQuZ2V0KGVudGl0eUlkKSB8fCAwO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRW50aXRpZXNUb1JlbGVhc2VPbkxvYWQuYWRkKHZfaVNlcmlhbElkKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEVudGl0aWVzQmVpbmdMb2FkZWQuZGVsZXRlKGVudGl0eUlkKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHRoaXMuZ2V0RW50aXR5SW5mbyhlbnRpdHlJZCk7XG4gICAgICAgICAgICBpZiAoIXZfcEluZm8pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGZpbmQgZW50aXR5IGluZm8gJ1wiICsgZW50aXR5SWQgKyBcIidcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmludGVybmFsSGlkZUVudGl0eSh2X3BJbmZvLCB1c2VyRGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eU1hbmFnZXIucHJvdG90eXBlLmhpZGVBbGxMb2FkZWRFbnRpdGllcyA9IGZ1bmN0aW9uICh1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIGVfMTYsIF9hO1xuICAgICAgICAgICAgdXNlckRhdGEgPSB1c2VyRGF0YSB8fCBudWxsO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRW50aXR5SW5mb3MudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmZvID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxIaWRlRW50aXR5KGluZm8sIHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xNl8xKSB7IGVfMTYgPSB7IGVycm9yOiBlXzE2XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMTYpIHRocm93IGVfMTYuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5TWFuYWdlci5wcm90b3R5cGUuaGlkZUFsbExvYWRpbmdFbnRpdGllcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBlXzE3LCBfYTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcEVudGl0aWVzQmVpbmdMb2FkZWQudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZXJpYWxJZCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcEVudGl0aWVzVG9SZWxlYXNlT25Mb2FkLmFkZChzZXJpYWxJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMTdfMSkgeyBlXzE3ID0geyBlcnJvcjogZV8xN18xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzE3KSB0aHJvdyBlXzE3LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcEVudGl0aWVzQmVpbmdMb2FkZWQuY2xlYXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5TWFuYWdlci5wcm90b3R5cGUuZ2V0UGFyZW50RW50aXR5ID0gZnVuY3Rpb24gKGFueUFyZzEpIHtcbiAgICAgICAgICAgIHZhciB2X2lDaGlsZEVudGl0eUlkO1xuICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2YgYW55QXJnMSkge1xuICAgICAgICAgICAgICAgIHZfaUNoaWxkRW50aXR5SWQgPSBhbnlBcmcxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFhbnlBcmcxKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NoaWxkIGVudGl0eSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgICAgIHZfaUNoaWxkRW50aXR5SWQgPSBhbnlBcmcxLmlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZfcENoaWxkRW50aXR5SW5mbyA9IHRoaXMuZ2V0RW50aXR5SW5mbyh2X2lDaGlsZEVudGl0eUlkKTtcbiAgICAgICAgICAgIGlmICghdl9wQ2hpbGRFbnRpdHlJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgZmluZCBjaGlsZCBlbnRpdHkgJ1wiICsgdl9pQ2hpbGRFbnRpdHlJZCArIFwiJ1wiKTtcbiAgICAgICAgICAgIHJldHVybiB2X3BDaGlsZEVudGl0eUluZm8ucGFyZW50RW50aXR5O1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZS5nZXRDaGlsZEVudGl0aWVzID0gZnVuY3Rpb24gKHBhcmVudEVudGl0eUlkLCByZXN1bHRzKSB7XG4gICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cyB8fCBbXTtcbiAgICAgICAgICAgIHJlc3VsdHMuc3BsaWNlKDAsIHJlc3VsdHMubGVuZ3RoKTtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdGhpcy5nZXRFbnRpdHlJbmZvKHBhcmVudEVudGl0eUlkKTtcbiAgICAgICAgICAgIGlmICghdl9wSW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGZpbmQgcGFyZW50IGVudGl0eSAnXCIgKyBwYXJlbnRFbnRpdHlJZCArIFwiJ1wiKTtcbiAgICAgICAgICAgIHJldHVybiB2X3BJbmZvLmdldENoaWxkRW50aXRpZXMocmVzdWx0cyk7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eU1hbmFnZXIucHJvdG90eXBlLmF0dGFjaEVudGl0eSA9IGZ1bmN0aW9uIChjaGlsZEVudGl0eU9ySWQsIHBhcmVudEVudGl0eU9ySWQsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB1c2VyRGF0YSA9IHVzZXJEYXRhIHx8IG51bGw7XG4gICAgICAgICAgICB2YXIgY2hpbGRFbnRpdHlJZDtcbiAgICAgICAgICAgIHZhciBwYXJlbnRFbnRpdHlJZDtcbiAgICAgICAgICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIGNoaWxkRW50aXR5T3JJZCkge1xuICAgICAgICAgICAgICAgIGNoaWxkRW50aXR5SWQgPSBjaGlsZEVudGl0eU9ySWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNoaWxkRW50aXR5T3JJZClcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDaGlsZCBlbnRpdHkgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgICAgICBjaGlsZEVudGl0eUlkID0gY2hpbGRFbnRpdHlPcklkLmlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2YgcGFyZW50RW50aXR5T3JJZCkge1xuICAgICAgICAgICAgICAgIHBhcmVudEVudGl0eUlkID0gcGFyZW50RW50aXR5T3JJZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghcGFyZW50RW50aXR5T3JJZClcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYXJlbnQgZW50aXR5IGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICAgICAgcGFyZW50RW50aXR5SWQgPSBwYXJlbnRFbnRpdHlPcklkLmlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNoaWxkRW50aXR5SWQgPT0gcGFyZW50RW50aXR5SWQpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuIG5vdCBhdHRhY2ggZW50aXR5IHdoZW4gY2hpbGQgZW50aXR5IGlkIGVxdWFscyB0byBwYXJlbnQgZW50aXR5IGlkICdcIiArIHBhcmVudEVudGl0eUlkICsgXCInXCIpO1xuICAgICAgICAgICAgdmFyIHZfcENoaWxkRW50aXR5SW5mbyA9IHRoaXMuZ2V0RW50aXR5SW5mbyhjaGlsZEVudGl0eUlkKTtcbiAgICAgICAgICAgIGlmICghdl9wQ2hpbGRFbnRpdHlJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgZmluZCBjaGlsZCBlbnRpdHkgJ1wiICsgY2hpbGRFbnRpdHlJZCArIFwiJ1wiKTtcbiAgICAgICAgICAgIGlmICh2X3BDaGlsZEVudGl0eUluZm8uc3RhdHVzID49IEVudGl0eVN0YXR1cy5XaWxsSGlkZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGF0dGFjaCBlbnRpdHkgd2hlbiBjaGlsZCBlbnRpdHkgc3RhdHVzIGlzICdcIiArIHZfcENoaWxkRW50aXR5SW5mby5zdGF0dXMgKyBcIidcIik7XG4gICAgICAgICAgICB2YXIgdl9wUGFyZW50RW50aXR5SW5mbyA9IHRoaXMuZ2V0RW50aXR5SW5mbyhwYXJlbnRFbnRpdHlJZCk7XG4gICAgICAgICAgICBpZiAoIXZfcFBhcmVudEVudGl0eUluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuIG5vdCBmaW5kIHBhcmVudCBlbnRpdHkgJ1wiICsgcGFyZW50RW50aXR5SWQgKyBcIidcIik7XG4gICAgICAgICAgICBpZiAodl9wUGFyZW50RW50aXR5SW5mby5zdGF0dXMgPj0gRW50aXR5U3RhdHVzLldpbGxIaWRlKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgYXR0Y2ggZW50aXR5IHdoZW4gcGFyZW50IGVudGl0eSBzdGF0dXMgaXMgJ1wiICsgdl9wUGFyZW50RW50aXR5SW5mby5zdGF0dXMgKyBcIidcIik7XG4gICAgICAgICAgICB2YXIgdl9wQ2hpbGRFbnRpdHkgPSB2X3BDaGlsZEVudGl0eUluZm8uZW50aXR5O1xuICAgICAgICAgICAgdmFyIHZfcFBhcmVudEVudGl0eSA9IHZfcFBhcmVudEVudGl0eUluZm8uZW50aXR5O1xuICAgICAgICAgICAgdGhpcy5kZXRhY2hFbnRpdHkodl9wQ2hpbGRFbnRpdHkuaWQsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgIHZfcENoaWxkRW50aXR5SW5mby5wYXJlbnRFbnRpdHkgPSB2X3BQYXJlbnRFbnRpdHk7XG4gICAgICAgICAgICB2X3BQYXJlbnRFbnRpdHlJbmZvLmFkZENoaWxkRW50aXR5KHZfcENoaWxkRW50aXR5KTtcbiAgICAgICAgICAgIHZfcFBhcmVudEVudGl0eS5vbkF0dGFjaGVkKHZfcENoaWxkRW50aXR5LCB1c2VyRGF0YSk7XG4gICAgICAgICAgICB2X3BDaGlsZEVudGl0eS5vbkF0dGFjaFRvKHZfcFBhcmVudEVudGl0eSwgdXNlckRhdGEpO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZS5kZXRhY2hFbnRpdHkgPSBmdW5jdGlvbiAoY2hpbGRFbnRpdHlPcklkLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdXNlckRhdGEgPSB1c2VyRGF0YSB8fCBudWxsO1xuICAgICAgICAgICAgdmFyIGNoaWxkRW50aXR5SWQ7XG4gICAgICAgICAgICBpZiAoJ251bWJlcicgPT09IHR5cGVvZiBjaGlsZEVudGl0eU9ySWQpIHtcbiAgICAgICAgICAgICAgICBjaGlsZEVudGl0eUlkID0gY2hpbGRFbnRpdHlPcklkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjaGlsZEVudGl0eU9ySWQpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2hpbGQgZW50aXR5IGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICAgICAgY2hpbGRFbnRpdHlJZCA9IGNoaWxkRW50aXR5T3JJZC5pZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2X3BDaGlsZEVudGl0eUluZm8gPSB0aGlzLmdldEVudGl0eUluZm8oY2hpbGRFbnRpdHlJZCk7XG4gICAgICAgICAgICBpZiAoIXZfcENoaWxkRW50aXR5SW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGZpbmQgY2hpbGQgZW50aXR5ICdcIiArIGNoaWxkRW50aXR5SWQgKyBcIidcIik7XG4gICAgICAgICAgICB2YXIgdl9wUGFyZW50RW50aXR5ID0gdl9wQ2hpbGRFbnRpdHlJbmZvLnBhcmVudEVudGl0eTtcbiAgICAgICAgICAgIGlmICghdl9wUGFyZW50RW50aXR5KVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHZhciB2X3BQYXJlbnRFbnRpdHlJbmZvID0gdGhpcy5nZXRFbnRpdHlJbmZvKHZfcFBhcmVudEVudGl0eS5pZCk7XG4gICAgICAgICAgICBpZiAoIXZfcFBhcmVudEVudGl0eUluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuIG5vdCBmaW5kIHBhcmVudCBlbnRpdHkgJ1wiICsgdl9wUGFyZW50RW50aXR5LmlkICsgXCInXCIpO1xuICAgICAgICAgICAgdmFyIHZfcENoaWxkRW50aXR5ID0gdl9wQ2hpbGRFbnRpdHlJbmZvLmVudGl0eTtcbiAgICAgICAgICAgIHZfcENoaWxkRW50aXR5SW5mby5wYXJlbnRFbnRpdHkgPSBudWxsO1xuICAgICAgICAgICAgdl9wUGFyZW50RW50aXR5SW5mby5yZW1vdmVDaGlsZEVudGl0eSh2X3BDaGlsZEVudGl0eSk7XG4gICAgICAgICAgICB2X3BQYXJlbnRFbnRpdHkub25EZXRhY2hlZCh2X3BDaGlsZEVudGl0eSwgdXNlckRhdGEpO1xuICAgICAgICAgICAgdl9wQ2hpbGRFbnRpdHkub25EZXRhY2hGcm9tKHZfcFBhcmVudEVudGl0eSwgdXNlckRhdGEpO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZS5kZXRhY2hDaGlsZEVudGl0aWVzID0gZnVuY3Rpb24gKHBhcmVudEVudGl0eU9ySWQsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIHZfcFVzZXJEYXRhID0gdXNlckRhdGEgfHwgbnVsbDtcbiAgICAgICAgICAgIHZhciBwYXJlbnRFbnRpdHlJZDtcbiAgICAgICAgICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIHBhcmVudEVudGl0eU9ySWQpIHtcbiAgICAgICAgICAgICAgICBwYXJlbnRFbnRpdHlJZCA9IHBhcmVudEVudGl0eU9ySWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIXBhcmVudEVudGl0eU9ySWQpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUGFyZW50IGVudGl0eSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgICAgIHBhcmVudEVudGl0eUlkID0gcGFyZW50RW50aXR5T3JJZC5pZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2X3BQYXJlbnRFbnRpdHlJbmZvID0gdGhpcy5nZXRFbnRpdHlJbmZvKHBhcmVudEVudGl0eUlkKTtcbiAgICAgICAgICAgIGlmICghdl9wUGFyZW50RW50aXR5SW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGZpbmQgcGFyZW50IGVudGl0eSAnXCIgKyBwYXJlbnRFbnRpdHlJZCArIFwiJ1wiKTtcbiAgICAgICAgICAgIHZhciB2X3BDaGlsZEVudGl0aWVzID0gdl9wUGFyZW50RW50aXR5SW5mby5nZXRDaGlsZEVudGl0aWVzKCk7XG4gICAgICAgICAgICB2X3BDaGlsZEVudGl0aWVzLmZvckVhY2goZnVuY3Rpb24gKGVudGl0eSkge1xuICAgICAgICAgICAgICAgIF90aGlzLmRldGFjaEVudGl0eShlbnRpdHkuaWQsIHZfcFVzZXJEYXRhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZS5nZXRFbnRpdHlJbmZvID0gZnVuY3Rpb24gKGVudGl0eUlkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BFbnRpdHlJbmZvcy5nZXQoZW50aXR5SWQpIHx8IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eU1hbmFnZXIucHJvdG90eXBlLmludGVybmFsU2hvd0VudGl0eSA9IGZ1bmN0aW9uIChlbnRpdHlJZCwgZW50aXR5QXNzZXROYW1lLCBlbnRpdHlHcm91cCwgZW50aXR5SW5zdGFuY2UsIGlzTmV3SW5zdGFuY2UsIGR1cmF0aW9uLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wRW50aXR5XzEgPSB0aGlzLm1fcEVudGl0eUhlbHBlci5jcmVhdGVFbnRpdHkoZW50aXR5SW5zdGFuY2UsIGVudGl0eUdyb3VwLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgaWYgKCF2X3BFbnRpdHlfMSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW4gbm90IGNyZWF0ZSBlbnRpdHkgaW4gaGVscGVyLicpO1xuICAgICAgICAgICAgICAgIHZhciB2X3BFbnRpdHlJbmZvID0gbmV3IEVudGl0eUluZm8odl9wRW50aXR5XzEpO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRW50aXR5SW5mb3Muc2V0KGVudGl0eUlkLCB2X3BFbnRpdHlJbmZvKTtcbiAgICAgICAgICAgICAgICB2X3BFbnRpdHlJbmZvLnN0YXR1cyA9IEVudGl0eVN0YXR1cy5XaWxsSW5pdDtcbiAgICAgICAgICAgICAgICB2X3BFbnRpdHlfMS5vbkluaXQoZW50aXR5SWQsIGVudGl0eUFzc2V0TmFtZSwgZW50aXR5R3JvdXAsIGlzTmV3SW5zdGFuY2UsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB2X3BFbnRpdHlJbmZvLnN0YXR1cyA9IEVudGl0eVN0YXR1cy5Jbml0ZWQ7XG4gICAgICAgICAgICAgICAgZW50aXR5R3JvdXAuYWRkRW50aXR5KHZfcEVudGl0eV8xKTtcbiAgICAgICAgICAgICAgICB2X3BFbnRpdHlJbmZvLnN0YXR1cyA9IEVudGl0eVN0YXR1cy5XaWxsU2hvdztcbiAgICAgICAgICAgICAgICB2X3BFbnRpdHlfMS5vblNob3codXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIHZfcEVudGl0eUluZm8uc3RhdHVzID0gRW50aXR5U3RhdHVzLlNob3dlZDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tX3BTaG93RW50aXR5U3VjY2Vzc0RlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BTaG93RW50aXR5U3VjY2Vzc0RlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4odl9wRW50aXR5XzEsIGR1cmF0aW9uLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBFcnJvciAmJiB0aGlzLm1fcFNob3dFbnRpdHlGYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcFNob3dFbnRpdHlGYWlsdXJlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihlbnRpdHlJZCwgZW50aXR5QXNzZXROYW1lLCBlbnRpdHlHcm91cC5uYW1lLCBlLm1lc3NhZ2UsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5TWFuYWdlci5wcm90b3R5cGUuaW50ZXJuYWxIaWRlRW50aXR5ID0gZnVuY3Rpb24gKGVudGl0eUluZm8sIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIHZfcEVudGl0eSA9IGVudGl0eUluZm8uZW50aXR5O1xuICAgICAgICAgICAgdmFyIHZfcENoaWxkRW50aXRpZXMgPSBlbnRpdHlJbmZvLmdldENoaWxkRW50aXRpZXMoKTtcbiAgICAgICAgICAgIHZfcENoaWxkRW50aXRpZXMuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5oaWRlRW50aXR5KHZhbHVlLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChlbnRpdHlJbmZvLnN0YXR1cyA9PSBFbnRpdHlTdGF0dXMuSGlkZGVuIHx8IGVudGl0eUluZm8uc3RhdHVzID09IEVudGl0eVN0YXR1cy5XaWxsSGlkZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZGV0YWNoRW50aXR5KHZfcEVudGl0eS5pZCwgdXNlckRhdGEpO1xuICAgICAgICAgICAgZW50aXR5SW5mby5zdGF0dXMgPSBFbnRpdHlTdGF0dXMuV2lsbEhpZGU7XG4gICAgICAgICAgICB2X3BFbnRpdHkub25IaWRlKHVzZXJEYXRhKTtcbiAgICAgICAgICAgIGVudGl0eUluZm8uc3RhdHVzID0gRW50aXR5U3RhdHVzLkhpZGRlbjtcbiAgICAgICAgICAgIHZhciB2X3BFbnRpdHlHcm91cCA9IHZfcEVudGl0eS5lbnRpdHlHcm91cDtcbiAgICAgICAgICAgIGlmICghdl9wRW50aXR5R3JvdXApXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbnRpdHkgZ3JvdXAgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHZfcEVudGl0eUdyb3VwLnJlbW92ZUVudGl0eSh2X3BFbnRpdHkpO1xuICAgICAgICAgICAgdmFyIHZfYlZhbGlkSW5mbyA9IHRoaXMubV9wRW50aXR5SW5mb3MuaGFzKHZfcEVudGl0eS5pZCk7XG4gICAgICAgICAgICB0aGlzLm1fcEVudGl0eUluZm9zLmRlbGV0ZSh2X3BFbnRpdHkuaWQpO1xuICAgICAgICAgICAgaWYgKCF2X2JWYWxpZEluZm8pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbnRpdHkgaW5mbyBpZCAnXCIgKyB2X3BFbnRpdHkuaWQgKyBcIicgaXMgdW5tYW5hZ2VkLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm1fcEhpZGVFbnRpdHlDb21wbGV0ZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEhpZGVFbnRpdHlDb21wbGV0ZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbih2X3BFbnRpdHkuaWQsIHZfcEVudGl0eS5lbnRpdHlBc3NldE5hbWUsIHZfcEVudGl0eUdyb3VwLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcFJlY3ljbGVRdWV1ZS5hZGQoZW50aXR5SW5mbyk7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eU1hbmFnZXIucHJvdG90eXBlLmxvYWRFbnRpdHlTdWNjZXNzQ2FsbGJhY2sgPSBmdW5jdGlvbiAoZW50aXR5QXNzZXROYW1lLCBlbnRpdHlBc3NldCwgZHVyYXRpb24sIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wU2hvd0VudGl0eUluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmICghdl9wU2hvd0VudGl0eUluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTaG93IGVudGl0eSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdGhpcy5tX3BFbnRpdGllc0JlaW5nTG9hZGVkLmRlbGV0ZSh2X3BTaG93RW50aXR5SW5mby5lbnRpdHlJZCk7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BFbnRpdGllc1RvUmVsZWFzZU9uTG9hZC5oYXModl9wU2hvd0VudGl0eUluZm8uc2VyaWFsSWQpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnNvbGUpXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVsZWFzZSBlbnRpdHkgJ1wiICsgdl9wU2hvd0VudGl0eUluZm8uZW50aXR5SWQgKyBcIicgKHNlcmlhbCBpZCAnXCIgKyB2X3BTaG93RW50aXR5SW5mby5zZXJpYWxJZCArIFwiJykgb24gbG9hZGluZyBzdWNjZXNzLlwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEVudGl0aWVzVG9SZWxlYXNlT25Mb2FkLmRlbGV0ZSh2X3BTaG93RW50aXR5SW5mby5zZXJpYWxJZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BFbnRpdHlIZWxwZXIucmVsZWFzZUVudGl0eShlbnRpdHlBc3NldCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZfcEVudGl0eUluc3RhbmNlT2JqZWN0ID0gRW50aXR5SW5zdGFuY2VPYmplY3QuY3JlYXRlKGVudGl0eUFzc2V0TmFtZSwgZW50aXR5QXNzZXQsIHRoaXMubV9wRW50aXR5SGVscGVyLmluc3RhbnRpYXRlRW50aXR5KGVudGl0eUFzc2V0KSwgdGhpcy5tX3BFbnRpdHlIZWxwZXIpO1xuICAgICAgICAgICAgdl9wU2hvd0VudGl0eUluZm8uZW50aXR5R3JvdXAucmVnaXN0ZXJFbnRpdHlJbnN0YW5jZU9iamVjdCh2X3BFbnRpdHlJbnN0YW5jZU9iamVjdCwgdHJ1ZSk7XG4gICAgICAgICAgICAvLyBSZWdpc3RlciB0byBwb29sIGFuZCBtYXJrIHNwYXduXG4gICAgICAgICAgICAvLyBpZiAoIXRoaXMubV9wSW5zdGFuY2VQb29sLmhhcyhlbnRpdHlBc3NldE5hbWUpKVxuICAgICAgICAgICAgLy8gICAgIHRoaXMubV9wSW5zdGFuY2VQb29sLnNldChlbnRpdHlBc3NldE5hbWUsIFtdKTtcbiAgICAgICAgICAgIC8vIGxldCB2X3BFbnRpdHlJbnN0YW5jZU9iamVjdHM6IEVudGl0eUluc3RhbmNlT2JqZWN0W10gfCB1bmRlZmluZWQgPSB0aGlzLm1fcEluc3RhbmNlUG9vbC5nZXQoZW50aXR5QXNzZXROYW1lKTtcbiAgICAgICAgICAgIC8vIGlmICh2X3BFbnRpdHlJbnN0YW5jZU9iamVjdHMgLyomJiB2X3BFbnRpdHlJbnN0YW5jZU9iamVjdHMubGVuZ3RoIDwgdl9wU2hvd0VudGl0eUluZm8uZW50aXR5R3JvdXAuaW5zdGFuY2VDYXBhY2l0eSovKSB7XG4gICAgICAgICAgICAvLyAgICAgdl9wRW50aXR5SW5zdGFuY2VPYmplY3RzLnB1c2godl9wRW50aXR5SW5zdGFuY2VPYmplY3QpO1xuICAgICAgICAgICAgLy8gICAgIHZfcEVudGl0eUluc3RhbmNlT2JqZWN0LnNwYXduID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxTaG93RW50aXR5KHZfcFNob3dFbnRpdHlJbmZvLmVudGl0eUlkLCBlbnRpdHlBc3NldE5hbWUsIHZfcFNob3dFbnRpdHlJbmZvLmVudGl0eUdyb3VwLCB2X3BFbnRpdHlJbnN0YW5jZU9iamVjdC50YXJnZXQsIHRydWUsIGR1cmF0aW9uLCB2X3BTaG93RW50aXR5SW5mby51c2VyRGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eU1hbmFnZXIucHJvdG90eXBlLmxvYWRFbnRpdHlGYWlsdXJlQ2FsbGJhY2sgPSBmdW5jdGlvbiAoZW50aXR5QXNzZXROYW1lLCBzdGF0dXMsIGVycm9yTWVzc2FnZSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BTaG93RW50aXR5SW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKCF2X3BTaG93RW50aXR5SW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Nob3cgZW50aXR5IGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB0aGlzLm1fcEVudGl0aWVzQmVpbmdMb2FkZWQuZGVsZXRlKHZfcFNob3dFbnRpdHlJbmZvLmVudGl0eUlkKTtcbiAgICAgICAgICAgIHRoaXMubV9wRW50aXRpZXNUb1JlbGVhc2VPbkxvYWQuZGVsZXRlKHZfcFNob3dFbnRpdHlJbmZvLnNlcmlhbElkKTtcbiAgICAgICAgICAgIHZhciB2X3BBcHBlbmRFcnJvck1lc3NhZ2UgPSBcIkxvYWQgZW50aXR5IGZhaWx1cmUsIGFzc2V0IG5hbWUgJ1wiICsgZW50aXR5QXNzZXROYW1lICsgXCInLCBzdGF0dXMgJ1wiICsgc3RhdHVzICsgXCInLCBlcnJvciBtZXNzYWdlICdcIiArIGVycm9yTWVzc2FnZSArIFwiJ1wiO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wU2hvd0VudGl0eUZhaWx1cmVEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BTaG93RW50aXR5RmFpbHVyZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbih2X3BTaG93RW50aXR5SW5mby5lbnRpdHlJZCwgZW50aXR5QXNzZXROYW1lLCB2X3BTaG93RW50aXR5SW5mby5lbnRpdHlHcm91cC5uYW1lLCB2X3BBcHBlbmRFcnJvck1lc3NhZ2UsIHZfcFNob3dFbnRpdHlJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Iodl9wQXBwZW5kRXJyb3JNZXNzYWdlKTtcbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5TWFuYWdlci5wcm90b3R5cGUubG9hZEVudGl0eVVwZGF0ZUNhbGxiYWNrID0gZnVuY3Rpb24gKGVudGl0eUFzc2V0TmFtZSwgcHJvZ3Jlc3MsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wU2hvd0VudGl0eUluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmICghdl9wU2hvd0VudGl0eUluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTaG93IGVudGl0eSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wU2hvd0VudGl0eVVwZGF0ZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFNob3dFbnRpdHlVcGRhdGVEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4odl9wU2hvd0VudGl0eUluZm8uZW50aXR5SWQsIGVudGl0eUFzc2V0TmFtZSwgdl9wU2hvd0VudGl0eUluZm8uZW50aXR5R3JvdXAubmFtZSwgcHJvZ3Jlc3MsIHZfcFNob3dFbnRpdHlJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5TWFuYWdlci5wcm90b3R5cGUubG9hZEVudGl0eURlcGVuZGVuY3lBc3NldENhbGxiYWNrID0gZnVuY3Rpb24gKGVudGl0eUFzc2V0TmFtZSwgZGVwZW5kZW5jeUFzc2V0TmFtZSwgbG9hZGVkQ291bnQsIHRvdGFsQ291bnQsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wU2hvd0VudGl0eUluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmICghdl9wU2hvd0VudGl0eUluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTaG93IGVudGl0eSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wU2hvd0VudGl0eURlcGVuZGVuY3lBc3NldERlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFNob3dFbnRpdHlEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4odl9wU2hvd0VudGl0eUluZm8uZW50aXR5SWQsIGVudGl0eUFzc2V0TmFtZSwgdl9wU2hvd0VudGl0eUluZm8uZW50aXR5R3JvdXAubmFtZSwgZGVwZW5kZW5jeUFzc2V0TmFtZSwgbG9hZGVkQ291bnQsIHRvdGFsQ291bnQsIHZfcFNob3dFbnRpdHlJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIEVudGl0eU1hbmFnZXI7XG4gICAgfShCYXNlXzEuRnJhbWV3b3JrTW9kdWxlKSk7IC8vIGNsYXNzIEVudGl0eU1hbmFnZXJcbiAgICBleHBvcnRzLkVudGl0eU1hbmFnZXIgPSBFbnRpdHlNYW5hZ2VyO1xuICAgIHZhciBFbnRpdHlJbnN0YW5jZU9iamVjdCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgX19leHRlbmRzKEVudGl0eUluc3RhbmNlT2JqZWN0LCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBFbnRpdHlJbnN0YW5jZU9iamVjdCgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICAgICAgX3RoaXMubV9wRW50aXR5QXNzZXQgPSBudWxsO1xuICAgICAgICAgICAgX3RoaXMubV9wRW50aXR5SGVscGVyID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgfVxuICAgICAgICBFbnRpdHlJbnN0YW5jZU9iamVjdC5jcmVhdGUgPSBmdW5jdGlvbiAobmFtZSwgZW50aXR5QXNzZXQsIGVudGl0eUluc3RhbmNlLCBlbnRpdHlIZWxwZXIpIHtcbiAgICAgICAgICAgIGlmICghZW50aXR5QXNzZXQpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbnRpdHkgYXNzZXQgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGlmICghZW50aXR5SGVscGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW50aXR5IGhlbHBlciBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdmFyIHZfcEVudGl0eUluc3RhbmNlT2JqZWN0ID0gbmV3IEVudGl0eUluc3RhbmNlT2JqZWN0KCk7IC8vIEZJWE1FOiBBY3F1aXJlIEVudGl0eUluc3RhbmNlT2JqZWN0IGZyb20gUmVmZXJlbmNlUG9vbC5cbiAgICAgICAgICAgIHZfcEVudGl0eUluc3RhbmNlT2JqZWN0LmluaXRpYWxpemUobmFtZSwgZW50aXR5SW5zdGFuY2UpO1xuICAgICAgICAgICAgdl9wRW50aXR5SW5zdGFuY2VPYmplY3QubV9wRW50aXR5QXNzZXQgPSBlbnRpdHlBc3NldDtcbiAgICAgICAgICAgIHZfcEVudGl0eUluc3RhbmNlT2JqZWN0Lm1fcEVudGl0eUhlbHBlciA9IGVudGl0eUhlbHBlcjtcbiAgICAgICAgICAgIHJldHVybiB2X3BFbnRpdHlJbnN0YW5jZU9iamVjdDtcbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5SW5zdGFuY2VPYmplY3QucHJvdG90eXBlLnJlbGVhc2UgPSBmdW5jdGlvbiAoc2h1dGRvd24pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcEVudGl0eUhlbHBlcilcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEVudGl0eUhlbHBlci5yZWxlYXNlRW50aXR5KHRoaXMubV9wRW50aXR5QXNzZXQsIHRoaXMudGFyZ2V0KTtcbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5SW5zdGFuY2VPYmplY3QucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3N1cGVyLnByb3RvdHlwZS5jbGVhci5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5tX3BFbnRpdHlBc3NldCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fcEVudGl0eUhlbHBlciA9IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBFbnRpdHlJbnN0YW5jZU9iamVjdDtcbiAgICB9KE9iamVjdFBvb2xfMS5PYmplY3RCYXNlKSk7IC8vIGNsYXNzIEVudGl0eUluc3RhbmNlT2JqZWN0XG59KTtcbiIsInZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgICAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIiwgXCIuL0Jhc2VcIl0sIGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIHZhciBCYXNlXzEgPSByZXF1aXJlKFwiLi9CYXNlXCIpO1xuICAgIC8qKlxuICAgICAqIEEgc2ltcGxlIGV2ZW50IG1hbmFnZXIgaW1wbGVtZW50YXRpb24uXG4gICAgICpcbiAgICAgKiBAYXV0aG9yIEplcmVteSBDaGVuIChrZXlob20uY0BnbWFpbC5jb20pXG4gICAgICovXG4gICAgdmFyIEV2ZW50TWFuYWdlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgX19leHRlbmRzKEV2ZW50TWFuYWdlciwgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gRXZlbnRNYW5hZ2VyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgICAgICAgICBfdGhpcy5tX3BFdmVudEhhbmRsZXJzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFdmVudE1hbmFnZXIucHJvdG90eXBlLCBcInByaW9yaXR5XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxMDA7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEV2ZW50TWFuYWdlci5wcm90b3R5cGUsIFwiZXZlbnRDb3VudFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBFdmVudE1hbmFnZXIucHJvdG90eXBlLmNvdW50ID0gZnVuY3Rpb24gKGV2ZW50SWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcEV2ZW50SGFuZGxlcnMuaGFzKGV2ZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZfcEV2ZW50SGFuZGxlciA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICBpZiAoKHZfcEV2ZW50SGFuZGxlciA9IHRoaXMubV9wRXZlbnRIYW5kbGVycy5nZXQoZXZlbnRJZCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2X3BFdmVudEhhbmRsZXIuc2l6ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfTtcbiAgICAgICAgRXZlbnRNYW5hZ2VyLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uIChldmVudElkLCBoYW5kbGVyLCB0YXJnZXQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcEV2ZW50SGFuZGxlcnMuaGFzKGV2ZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZfcEV2ZW50SGFuZGxlciA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICBpZiAoaGFuZGxlciAmJiAodl9wRXZlbnRIYW5kbGVyID0gdGhpcy5tX3BFdmVudEhhbmRsZXJzLmdldChldmVudElkKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZfcEV2ZW50SGFuZGxlci5oYXMoaGFuZGxlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBFdmVudE1hbmFnZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50SWQsIGhhbmRsZXIsIHRhcmdldCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1fcEV2ZW50SGFuZGxlcnMuaGFzKGV2ZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BFdmVudEhhbmRsZXJzLnNldChldmVudElkLCBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2X3BFdmVudEhhbmRsZXI7XG4gICAgICAgICAgICBpZiAoKHZfcEV2ZW50SGFuZGxlciA9IHRoaXMubV9wRXZlbnRIYW5kbGVycy5nZXQoZXZlbnRJZCkpKSB7XG4gICAgICAgICAgICAgICAgdl9wRXZlbnRIYW5kbGVyLmFkZChoYW5kbGVyLCB0YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBFdmVudE1hbmFnZXIucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uIChldmVudElkLCBoYW5kbGVyLCB0YXJnZXQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcEV2ZW50SGFuZGxlcnMuaGFzKGV2ZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZfcEV2ZW50SGFuZGxlciA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICBpZiAoKHZfcEV2ZW50SGFuZGxlciA9IHRoaXMubV9wRXZlbnRIYW5kbGVycy5nZXQoZXZlbnRJZCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZfcEV2ZW50SGFuZGxlci5yZW1vdmUoaGFuZGxlciwgdGFyZ2V0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIEV2ZW50TWFuYWdlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIChldmVudElkKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAxOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICBhcmdzW19pIC0gMV0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubV9wRXZlbnRIYW5kbGVycy5oYXMoZXZlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wRXZlbnRIYW5kbGVyID0gdGhpcy5tX3BFdmVudEhhbmRsZXJzLmdldChldmVudElkKTtcbiAgICAgICAgICAgICAgICBpZiAodl9wRXZlbnRIYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZfcEV2ZW50SGFuZGxlci5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIEV2ZW50TWFuYWdlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICAvLyBOT09QLlxuICAgICAgICB9O1xuICAgICAgICBFdmVudE1hbmFnZXIucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wRXZlbnRIYW5kbGVycykge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycy5mb3JFYWNoKGZ1bmN0aW9uIChlaCwga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGVoLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BFdmVudEhhbmRsZXJzLmNsZWFyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBFdmVudE1hbmFnZXI7XG4gICAgfShCYXNlXzEuRnJhbWV3b3JrTW9kdWxlKSk7IC8vIGNsYXNzIEV2ZW50TWFuYWdlclxuICAgIGV4cG9ydHMuRXZlbnRNYW5hZ2VyID0gRXZlbnRNYW5hZ2VyO1xufSk7XG4iLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbnZhciBfX3ZhbHVlcyA9ICh0aGlzICYmIHRoaXMuX192YWx1ZXMpIHx8IGZ1bmN0aW9uKG8pIHtcbiAgICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xufTtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICB2YXIgRnNtU3RhdGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZ1bmN0aW9uIEZzbVN0YXRlKCkge1xuICAgICAgICAgICAgdGhpcy5tX3BFdmVudEhhbmRsZXJzID0gbmV3IE1hcCgpO1xuICAgICAgICB9XG4gICAgICAgIEZzbVN0YXRlLnByb3RvdHlwZS5vbkluaXQgPSBmdW5jdGlvbiAoZnNtKSB7XG4gICAgICAgICAgICAvLyBOT09QXG4gICAgICAgIH07XG4gICAgICAgIEZzbVN0YXRlLnByb3RvdHlwZS5vbkVudGVyID0gZnVuY3Rpb24gKGZzbSkge1xuICAgICAgICAgICAgLy8gTk9PUFxuICAgICAgICB9O1xuICAgICAgICBGc21TdGF0ZS5wcm90b3R5cGUub25VcGRhdGUgPSBmdW5jdGlvbiAoZnNtLCBlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgLy8gTk9PUFxuICAgICAgICB9O1xuICAgICAgICBGc21TdGF0ZS5wcm90b3R5cGUub25MZWF2ZSA9IGZ1bmN0aW9uIChmc20sIHNodXRkb3duKSB7XG4gICAgICAgICAgICAvLyBOT09QXG4gICAgICAgIH07XG4gICAgICAgIEZzbVN0YXRlLnByb3RvdHlwZS5vbkRlc3Ryb3kgPSBmdW5jdGlvbiAoZnNtKSB7XG4gICAgICAgICAgICB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuY2xlYXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgRnNtU3RhdGUucHJvdG90eXBlLmNoYW5nZVN0YXRlID0gZnVuY3Rpb24gKGZzbSwgdHlwZSkge1xuICAgICAgICAgICAgaWYgKCFmc20pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGc20gaXMgaW52YWxpZDogXCIgKyBmc20pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnNtLmNoYW5nZVN0YXRlKHR5cGUpO1xuICAgICAgICB9O1xuICAgICAgICBGc21TdGF0ZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXZlbnRJZCwgZXZlbnRIYW5kbGVyKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSBldmVudEhhbmRsZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXZlbnQgaGFuZGxlciBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElkKSkge1xuICAgICAgICAgICAgICAgIHZhciBlaCA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BFdmVudEhhbmRsZXJzLnNldChldmVudElkLCBlaCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdl9wSGFuZGxlcnMgPSB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50SWQpO1xuICAgICAgICAgICAgaWYgKHZfcEhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgdl9wSGFuZGxlcnMuYWRkKGV2ZW50SGFuZGxlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIEZzbVN0YXRlLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAoZXZlbnRJZCwgZXZlbnRIYW5kbGVyKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSBldmVudEhhbmRsZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXZlbnQgaGFuZGxlciBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcEV2ZW50SGFuZGxlcnMuaGFzKGV2ZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZfcEhhbmRsZXJzID0gdGhpcy5tX3BFdmVudEhhbmRsZXJzLmdldChldmVudElkKTtcbiAgICAgICAgICAgICAgICBpZiAodl9wSGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgdl9wSGFuZGxlcnMucmVtb3ZlKGV2ZW50SGFuZGxlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBGc21TdGF0ZS5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIChmc20sIHNlbmRlciwgZXZlbnRJZCwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcEV2ZW50SGFuZGxlcnMuaGFzKGV2ZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZfcEhhbmRsZXJzID0gdGhpcy5tX3BFdmVudEhhbmRsZXJzLmdldChldmVudElkKTtcbiAgICAgICAgICAgICAgICBpZiAodl9wSGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgdl9wSGFuZGxlcnMuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihmc20sIHNlbmRlciwgdXNlckRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBGc21TdGF0ZTtcbiAgICB9KCkpOyAvLyBjbGFzcyBGc21TdGF0ZTxUPlxuICAgIGV4cG9ydHMuRnNtU3RhdGUgPSBGc21TdGF0ZTtcbiAgICB2YXIgRnNtID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBGc20oKSB7XG4gICAgICAgICAgICB0aGlzLm1fcFN0YXRlcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5tX3BEYXRhcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMuX2lzRGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZVRpbWUgPSAwO1xuICAgICAgICB9XG4gICAgICAgIEZzbS5jcmVhdGVGc20gPSBmdW5jdGlvbiAobmFtZSwgb3duZXIsIHN0YXRlcykge1xuICAgICAgICAgICAgdmFyIGVfMSwgX2E7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSBvd25lcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZTTSBvd25lciBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gc3RhdGVzIHx8IHN0YXRlcy5sZW5ndGggPCAxKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRlNNIHN0YXRlcyBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdmFyIHZfcEZzbSA9IG5ldyBGc20oKTtcbiAgICAgICAgICAgIHZfcEZzbS5tX3NOYW1lID0gbmFtZTtcbiAgICAgICAgICAgIHZfcEZzbS5tX3BPd25lciA9IG93bmVyO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBzdGF0ZXNfMSA9IF9fdmFsdWVzKHN0YXRlcyksIHN0YXRlc18xXzEgPSBzdGF0ZXNfMS5uZXh0KCk7ICFzdGF0ZXNfMV8xLmRvbmU7IHN0YXRlc18xXzEgPSBzdGF0ZXNfMS5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZfcFN0YXRlID0gc3RhdGVzXzFfMS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wU3RhdGUpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZTTSBzdGF0ZXMgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEZzbS5oYXNTdGF0ZSh2X3BTdGF0ZS5jb25zdHJ1Y3RvcikpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGU00gJ1wiICsgbmFtZSArIFwiJyBzdGF0ZSAnXCIgKyB2X3BTdGF0ZSArIFwiJyBpcyBhbHJlYWR5IGV4aXN0LlwiKTtcbiAgICAgICAgICAgICAgICAgICAgdl9wRnNtLm1fcFN0YXRlcy5wdXNoKHZfcFN0YXRlKTtcbiAgICAgICAgICAgICAgICAgICAgdl9wU3RhdGUub25Jbml0KHZfcEZzbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMV8xKSB7IGVfMSA9IHsgZXJyb3I6IGVfMV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0ZXNfMV8xICYmICFzdGF0ZXNfMV8xLmRvbmUgJiYgKF9hID0gc3RhdGVzXzEucmV0dXJuKSkgX2EuY2FsbChzdGF0ZXNfMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZfcEZzbS5faXNEZXN0cm95ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiB2X3BGc207XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGc20ucHJvdG90eXBlLCBcIm5hbWVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9zTmFtZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRnNtLnByb3RvdHlwZSwgXCJvd25lclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wT3duZXI7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRnNtLnByb3RvdHlwZSwgXCJmc21TdGF0ZUNvdW50XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTdGF0ZXMubGVuZ3RoOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZzbS5wcm90b3R5cGUsIFwiaXNSdW5uaW5nXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gbnVsbCAhPSB0aGlzLl9jdXJyZW50U3RhdGU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRnNtLnByb3RvdHlwZSwgXCJpc0Rlc3Ryb3llZFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuX2lzRGVzdHJveWVkOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZzbS5wcm90b3R5cGUsIFwiY3VycmVudFN0YXRlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5fY3VycmVudFN0YXRlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZzbS5wcm90b3R5cGUsIFwiY3VycmVudFN0YXRlTmFtZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAvLyBGSVhNRTogQ3VycmVudCBzdGF0ZSBuYW1lID9cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50U3RhdGUubmFtZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRnNtLnByb3RvdHlwZSwgXCJjdXJyZW50U3RhdGVUaW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5fY3VycmVudFN0YXRlVGltZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIEZzbS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNSdW5uaW5nKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRlNNIGlzIHJ1bm5pbmcsIGNhbiBub3Qgc3RhcnQgYWdhaW4uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5nZXRTdGF0ZSh0eXBlKTtcbiAgICAgICAgICAgIGlmICghc3RhdGUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGU00gJ1wiICsgdGhpcy5uYW1lICsgXCInIGNhbiBub3Qgc3RhcnQgc3RhdGUgJ1wiICsgdHlwZS5uYW1lICsgXCInIHdoaWNoIGlzIG5vdCBleGlzdHMuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlVGltZSA9IDA7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGUgPSBzdGF0ZTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFN0YXRlLm9uRW50ZXIodGhpcyk7IC8vIENhbGwgaW50ZXJuYWwgZnVuY3Rpb24gd2l0aCBhbnkgY2FzdGluZy5cbiAgICAgICAgfTtcbiAgICAgICAgRnNtLnByb3RvdHlwZS5oYXNTdGF0ZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbCAhPSB0aGlzLmdldFN0YXRlKHR5cGUpO1xuICAgICAgICB9O1xuICAgICAgICBGc20ucHJvdG90eXBlLmdldFN0YXRlID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tX3BTdGF0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wU3RhdGUgPSB0aGlzLm1fcFN0YXRlc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BTdGF0ZSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgaWYgKHZfcFN0YXRlIGluc3RhbmNlb2YgdHlwZSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZfcFN0YXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIEZzbS5wcm90b3R5cGUuZ2V0QWxsU3RhdGVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wU3RhdGVzO1xuICAgICAgICB9O1xuICAgICAgICBGc20ucHJvdG90eXBlLmNoYW5nZVN0YXRlID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fY3VycmVudFN0YXRlKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ3VycmVudCBzdGF0ZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdmFyIHZfcFN0YXRlID0gdGhpcy5nZXRTdGF0ZSh0eXBlKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcFN0YXRlKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZzbSBjYW4gbm90IGNoYW5nZSBzdGF0ZSwgc3RhdGUgaXMgbm90IGV4aXN0OiBcIiArIHR5cGUpO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlLm9uTGVhdmUodGhpcywgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlVGltZSA9IDA7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGUgPSB2X3BTdGF0ZTtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZS5vbkVudGVyKHRoaXMpO1xuICAgICAgICB9O1xuICAgICAgICBGc20ucHJvdG90eXBlLmdldERhdGEgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wRGF0YXMuaGFzKG5hbWUpKVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcERhdGFzLmdldChuYW1lKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBGc20ucHJvdG90eXBlLnNldERhdGEgPSBmdW5jdGlvbiAobmFtZSwgZGF0YSkge1xuICAgICAgICAgICAgaWYgKCFuYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRGF0YSBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB0aGlzLm1fcERhdGFzLnNldChuYW1lLCBkYXRhKTtcbiAgICAgICAgfTtcbiAgICAgICAgRnNtLnByb3RvdHlwZS5yZW1vdmVEYXRhID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIGlmICghbmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RhdGEgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdmFyIHZfYlJldCA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wRGF0YXMuaGFzKG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgdl9iUmV0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcERhdGFzLmRlbGV0ZShuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2X2JSZXQ7XG4gICAgICAgIH07XG4gICAgICAgIEZzbS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLl9jdXJyZW50U3RhdGUpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlVGltZSArPSBlbGFwc2VkO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlLm9uVXBkYXRlKHRoaXMsIGVsYXBzZWQsIHJlYWxFbGFwc2VkKTtcbiAgICAgICAgfTtcbiAgICAgICAgRnNtLnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIEZJWE1FOiBGaWd1ZSBvdXQgYSB3YXkgdG8gcmVsZWFzZSB0aGlzLlxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gRnNtO1xuICAgIH0oKSk7IC8vIGNsYXNzIEZzbTxUPlxuICAgIGV4cG9ydHMuRnNtID0gRnNtO1xuICAgIHZhciBGc21NYW5hZ2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICBfX2V4dGVuZHMoRnNtTWFuYWdlciwgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gRnNtTWFuYWdlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICAgICAgX3RoaXMubV9wRnNtcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRnNtTWFuYWdlci5wcm90b3R5cGUsIFwicHJpb3JpdHlcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDYwO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGc21NYW5hZ2VyLnByb3RvdHlwZSwgXCJjb3VudFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BGc21zLnNpemU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgRnNtTWFuYWdlci5wcm90b3R5cGUuaGFzRnNtID0gZnVuY3Rpb24gKG5hbWVPclR5cGUpIHtcbiAgICAgICAgICAgIHZhciBlXzIsIF9hO1xuICAgICAgICAgICAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBuYW1lT3JUeXBlICYmIG5hbWVPclR5cGUucHJvdG90eXBlKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcEZzbXMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZnNtID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobnVsbCAhPSBmc20gJiYgZnNtIGluc3RhbmNlb2YgbmFtZU9yVHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzJfMSkgeyBlXzIgPSB7IGVycm9yOiBlXzJfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzIpIHRocm93IGVfMi5lcnJvcjsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRnNtcy5oYXMobmFtZU9yVHlwZS50b1N0cmluZygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgRnNtTWFuYWdlci5wcm90b3R5cGUuZ2V0RnNtID0gZnVuY3Rpb24gKG5hbWVPclR5cGUpIHtcbiAgICAgICAgICAgIHZhciBlXzMsIF9hO1xuICAgICAgICAgICAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBuYW1lT3JUeXBlICYmIG5hbWVPclR5cGUucHJvdG90eXBlKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcEZzbXMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZnNtID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobnVsbCAhPSBmc20gJiYgZnNtIGluc3RhbmNlb2YgbmFtZU9yVHlwZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnNtO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzNfMSkgeyBlXzMgPSB7IGVycm9yOiBlXzNfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzMpIHRocm93IGVfMy5lcnJvcjsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcEZzbXMuZ2V0KG5hbWVPclR5cGUudG9TdHJpbmcoKSkgfHwgbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBGc21NYW5hZ2VyLnByb3RvdHlwZS5nZXRBbGxGc21zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfNCwgX2E7XG4gICAgICAgICAgICB2YXIgdl9wUmV0ID0gW107XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BGc21zLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZnNtID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHZfcFJldC5wdXNoKGZzbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfNF8xKSB7IGVfNCA9IHsgZXJyb3I6IGVfNF8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzQpIHRocm93IGVfNC5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZfcFJldDtcbiAgICAgICAgfTtcbiAgICAgICAgRnNtTWFuYWdlci5wcm90b3R5cGUuY3JlYXRlRnNtID0gZnVuY3Rpb24gKG5hbWUsIG93bmVyLCBzdGF0ZXMpIHtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lIHx8ICcnO1xuICAgICAgICAgICAgaWYgKHRoaXMuaGFzRnNtKG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQWxyZWFkeSBleGlzdCBGU00gJ1wiICsgbmFtZSArIFwiJy5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZnNtID0gRnNtLmNyZWF0ZUZzbShuYW1lLCBvd25lciwgc3RhdGVzKTtcbiAgICAgICAgICAgIHRoaXMubV9wRnNtcy5zZXQobmFtZSwgZnNtKTtcbiAgICAgICAgICAgIHJldHVybiBmc207XG4gICAgICAgIH07XG4gICAgICAgIEZzbU1hbmFnZXIucHJvdG90eXBlLmRlc3Ryb3lGc20gPSBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICAgICAgICB2YXIgZV81LCBfYSwgZV82LCBfYiwgZV83LCBfYztcbiAgICAgICAgICAgIHZhciB2X3NOYW1lO1xuICAgICAgICAgICAgdmFyIHZfcFR5cGU7XG4gICAgICAgICAgICB2YXIgdl9wSW5zdGFuY2U7XG4gICAgICAgICAgICBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiBhcmcpIHtcbiAgICAgICAgICAgICAgICB2X3NOYW1lID0gYXJnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGFyZykge1xuICAgICAgICAgICAgICAgIHZfcFR5cGUgPSBhcmc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICgnb2JqZWN0JyA9PT0gdHlwZW9mIGFyZyAmJiBhcmcuY29uc3RydWN0b3IpIHtcbiAgICAgICAgICAgICAgICB2X3BJbnN0YW5jZSA9IGFyZztcbiAgICAgICAgICAgICAgICB2X3BUeXBlID0gYXJnLmNvbnN0cnVjdG9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0aGlzLmhhc0ZzbSh2X3NOYW1lIHx8IHZfcFR5cGUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHZfcEluc3RhbmNlICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZih2X3BJbnN0YW5jZSkuaGFzT3duUHJvcGVydHkoJ3NodXRkb3duJykpIHtcbiAgICAgICAgICAgICAgICB2X3BJbnN0YW5jZS5zaHV0ZG93bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG51bGwgIT0gdl9wSW5zdGFuY2UpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfZCA9IF9fdmFsdWVzKHRoaXMubV9wRnNtcy5rZXlzKCkpLCBfZSA9IF9kLm5leHQoKTsgIV9lLmRvbmU7IF9lID0gX2QubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gX2UudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdl9wRnNtID0gdGhpcy5tX3BGc21zLmdldChrZXkpIHx8IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodl9wRnNtID09IHZfcEluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BGc21zLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzVfMSkgeyBlXzUgPSB7IGVycm9yOiBlXzVfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2UgJiYgIV9lLmRvbmUgJiYgKF9hID0gX2QucmV0dXJuKSkgX2EuY2FsbChfZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzUpIHRocm93IGVfNS5lcnJvcjsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG51bGwgIT0gdl9zTmFtZSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9mID0gX192YWx1ZXModGhpcy5tX3BGc21zLmtleXMoKSksIF9nID0gX2YubmV4dCgpOyAhX2cuZG9uZTsgX2cgPSBfZi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBfZy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2X3BGc20gPSB0aGlzLm1fcEZzbXMuZ2V0KGtleSkgfHwgbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdl9wRnNtKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEZzbS5uYW1lID09IHZfc05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcEZzbXMuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVfNl8xKSB7IGVfNiA9IHsgZXJyb3I6IGVfNl8xIH07IH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfZyAmJiAhX2cuZG9uZSAmJiAoX2IgPSBfZi5yZXR1cm4pKSBfYi5jYWxsKF9mKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNikgdGhyb3cgZV82LmVycm9yOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobnVsbCAhPSB2X3BUeXBlKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2ggPSBfX3ZhbHVlcyh0aGlzLm1fcEZzbXMua2V5cygpKSwgX2ogPSBfaC5uZXh0KCk7ICFfai5kb25lOyBfaiA9IF9oLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IF9qLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZfcEZzbSA9IHRoaXMubV9wRnNtcy5nZXQoa2V5KSB8fCBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEZzbSBpbnN0YW5jZW9mIHZfcFR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcEZzbXMuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVfN18xKSB7IGVfNyA9IHsgZXJyb3I6IGVfN18xIH07IH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfaiAmJiAhX2ouZG9uZSAmJiAoX2MgPSBfaC5yZXR1cm4pKSBfYy5jYWxsKF9oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNykgdGhyb3cgZV83LmVycm9yOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG4gICAgICAgIEZzbU1hbmFnZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgdmFyIGVfOCwgX2E7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BGc21zLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZzbSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWZzbSB8fCBmc20uaXNEZXN0cm95ZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgZnNtLnVwZGF0ZShlbGFwc2VkLCByZWFsRWxhcHNlZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfOF8xKSB7IGVfOCA9IHsgZXJyb3I6IGVfOF8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzgpIHRocm93IGVfOC5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBGc21NYW5hZ2VyLnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBlXzksIF9hO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRnNtcy5rZXlzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZfRnNtID0gdGhpcy5tX3BGc21zLmdldChrZXkpIHx8IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdl9Gc20gfHwgdl9Gc20uaXNEZXN0cm95ZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgdl9Gc20uc2h1dGRvd24oKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BGc21zLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzlfMSkgeyBlXzkgPSB7IGVycm9yOiBlXzlfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV85KSB0aHJvdyBlXzkuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIEZzbU1hbmFnZXI7XG4gICAgfShCYXNlXzEuRnJhbWV3b3JrTW9kdWxlKSk7IC8vIGNsYXNzIEZzbU1hbmFnZXJcbiAgICBleHBvcnRzLkZzbU1hbmFnZXIgPSBGc21NYW5hZ2VyO1xufSk7XG4iLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbnZhciBfX3ZhbHVlcyA9ICh0aGlzICYmIHRoaXMuX192YWx1ZXMpIHx8IGZ1bmN0aW9uKG8pIHtcbiAgICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xufTtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICB2YXIgRGVmYXVsdENhcGFjaXR5ID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG4gICAgdmFyIERlZmF1bHRFeHBpcmVUaW1lID0gTnVtYmVyLk1BWF9WQUxVRTtcbiAgICB2YXIgRGVmYXVsdFByaW9yaXR5ID0gMDtcbiAgICB2YXIgRGF0ZVRpbWVNaW5UaW1lc3RhbXAgPSA5NzgyNzg0MDAwMDA7XG4gICAgdmFyIERhdGVUaW1lTWF4VGltZXN0YW1wID0gMjUzNDAyMjcxOTk5MDAwO1xuICAgIHZhciBPYmplY3RQb29sQmFzZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gT2JqZWN0UG9vbEJhc2UobmFtZSkge1xuICAgICAgICAgICAgdGhpcy5tX3NOYW1lID0gbmFtZSB8fCAnJztcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0UG9vbEJhc2UucHJvdG90eXBlLCBcIm5hbWVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fc05hbWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gT2JqZWN0UG9vbEJhc2U7XG4gICAgfSgpKTsgLy8gY2xhc3MgT2JqZWN0UG9vbEJhc2VcbiAgICBleHBvcnRzLk9iamVjdFBvb2xCYXNlID0gT2JqZWN0UG9vbEJhc2U7XG4gICAgdmFyIE9iamVjdFBvb2wgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhPYmplY3RQb29sLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBPYmplY3RQb29sKG5hbWUsIGFsbG93TXVsdGlTcGF3biwgYXV0b1JlbGVhc2VJbnRlcnZhbCwgY2FwYWNpdHksIGV4cGlyZVRpbWUsIHByaW9yaXR5KSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBuYW1lKSB8fCB0aGlzO1xuICAgICAgICAgICAgX3RoaXMubV9wT2JqZWN0cyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcE9iamVjdE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcENhY2hlQ2FuUmVsZWFzZU9iamV0cyA9IFtdO1xuICAgICAgICAgICAgX3RoaXMubV9wQ2FjaGVUb1JlbGVhc2VPYmplY3RzID0gW107XG4gICAgICAgICAgICBfdGhpcy5tX2JBbGxvd011bHRpU3Bhd24gPSBhbGxvd011bHRpU3Bhd247XG4gICAgICAgICAgICBfdGhpcy5tX2ZBdXRvUmVsZWFzZUludGVydmFsID0gYXV0b1JlbGVhc2VJbnRlcnZhbDtcbiAgICAgICAgICAgIF90aGlzLm1faUNhcGFjaXR5ID0gY2FwYWNpdHk7XG4gICAgICAgICAgICBfdGhpcy5tX2ZFeHBpcmVUaW1lID0gZXhwaXJlVGltZTtcbiAgICAgICAgICAgIF90aGlzLm1faVByaW9yaXR5ID0gcHJpb3JpdHk7XG4gICAgICAgICAgICBfdGhpcy5tX2ZBdXRvUmVsZWFzZVRpbWUgPSAwO1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPYmplY3RQb29sLnByb3RvdHlwZSwgXCJjb3VudFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wT2JqZWN0TWFwLnNpemU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0UG9vbC5wcm90b3R5cGUsIFwiY2FuUmVsZWFzZUNvdW50XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0Q2FuUmVsZWFzZU9iamVjdHModGhpcy5tX3BDYWNoZUNhblJlbGVhc2VPYmpldHMpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcENhY2hlQ2FuUmVsZWFzZU9iamV0cy5sZW5ndGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE9iamVjdFBvb2wucHJvdG90eXBlLCBcImFsbG93TXVsdGlTcGF3blwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9iQWxsb3dNdWx0aVNwYXduOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE9iamVjdFBvb2wucHJvdG90eXBlLCBcImF1dG9SZWxlYXNlSW50ZXJ2YWxcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fZkF1dG9SZWxlYXNlSW50ZXJ2YWw7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1fZkF1dG9SZWxlYXNlSW50ZXJ2YWwgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPYmplY3RQb29sLnByb3RvdHlwZSwgXCJjYXBhY2l0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9pQ2FwYWNpdHk7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA8IDApXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2FwYWNpdHkgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tX2lDYXBhY2l0eSA9PSB2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRoaXMubV9pQ2FwYWNpdHkgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbGVhc2UoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0UG9vbC5wcm90b3R5cGUsIFwiZXhwaXJlVGltZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9mRXhwaXJlVGltZTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIDwgMClcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHBpcmVUaW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubV9mRXhwaXJlVGltZSA9PSB2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRoaXMubV9mRXhwaXJlVGltZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMucmVsZWFzZSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPYmplY3RQb29sLnByb3RvdHlwZSwgXCJwcmlvcml0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9pUHJpb3JpdHk7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1faVByaW9yaXR5ID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3RQb29sLnByb3RvdHlwZS5yZWdpc3RlciA9IGZ1bmN0aW9uIChvYmosIHNwYXduZWQpIHtcbiAgICAgICAgICAgIGlmICghb2JqKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignb2JqZWN0IGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB2YXIgdl9wT2JqZWN0cyA9IHRoaXMuZ2V0T2JqZWN0cyhvYmoubmFtZSk7XG4gICAgICAgICAgICBpZiAoIXZfcE9iamVjdHMpIHtcbiAgICAgICAgICAgICAgICB2X3BPYmplY3RzID0gW107XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BPYmplY3RzLnNldChvYmoubmFtZSwgdl9wT2JqZWN0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdl9wSW50ZXJuYWxPYmplY3QgPSBSZWZPYmplY3QuY3JlYXRlKG9iaiwgc3Bhd25lZCk7XG4gICAgICAgICAgICB2X3BPYmplY3RzLnB1c2godl9wSW50ZXJuYWxPYmplY3QpO1xuICAgICAgICAgICAgdGhpcy5tX3BPYmplY3RNYXAuc2V0KG9iai50YXJnZXQsIHZfcEludGVybmFsT2JqZWN0KTtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvdW50ID4gdGhpcy5tX2lDYXBhY2l0eSlcbiAgICAgICAgICAgICAgICB0aGlzLnJlbGVhc2UoKTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbC5wcm90b3R5cGUuY2FuU3Bhd24gPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgdmFyIGVfMSwgX2E7XG4gICAgICAgICAgICBuYW1lID0gbmFtZSB8fCAnJztcbiAgICAgICAgICAgIHZhciB2X3BPYmplY3RzID0gdGhpcy5nZXRPYmplY3RzKG5hbWUpO1xuICAgICAgICAgICAgaWYgKHZfcE9iamVjdHMpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciB2X3BPYmplY3RzXzEgPSBfX3ZhbHVlcyh2X3BPYmplY3RzKSwgdl9wT2JqZWN0c18xXzEgPSB2X3BPYmplY3RzXzEubmV4dCgpOyAhdl9wT2JqZWN0c18xXzEuZG9uZTsgdl9wT2JqZWN0c18xXzEgPSB2X3BPYmplY3RzXzEubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW50ZXJuYWxPYmplY3QgPSB2X3BPYmplY3RzXzFfMS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fYkFsbG93TXVsdGlTcGF3biB8fCAhaW50ZXJuYWxPYmplY3QuaXNJblVzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzFfMSkgeyBlXzEgPSB7IGVycm9yOiBlXzFfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodl9wT2JqZWN0c18xXzEgJiYgIXZfcE9iamVjdHNfMV8xLmRvbmUgJiYgKF9hID0gdl9wT2JqZWN0c18xLnJldHVybikpIF9hLmNhbGwodl9wT2JqZWN0c18xKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBPYmplY3RQb29sLnByb3RvdHlwZS5zcGF3biA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICB2YXIgZV8yLCBfYTtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lIHx8ICcnO1xuICAgICAgICAgICAgdmFyIHZfcE9iamVjdHMgPSB0aGlzLmdldE9iamVjdHMobmFtZSk7XG4gICAgICAgICAgICBpZiAodl9wT2JqZWN0cykge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHZfcE9iamVjdHNfMiA9IF9fdmFsdWVzKHZfcE9iamVjdHMpLCB2X3BPYmplY3RzXzJfMSA9IHZfcE9iamVjdHNfMi5uZXh0KCk7ICF2X3BPYmplY3RzXzJfMS5kb25lOyB2X3BPYmplY3RzXzJfMSA9IHZfcE9iamVjdHNfMi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbnRlcm5hbE9iamVjdCA9IHZfcE9iamVjdHNfMl8xLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubV9iQWxsb3dNdWx0aVNwYXduIHx8ICFpbnRlcm5hbE9iamVjdC5pc0luVXNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGludGVybmFsT2JqZWN0LnNwYXduKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVfMl8xKSB7IGVfMiA9IHsgZXJyb3I6IGVfMl8xIH07IH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2X3BPYmplY3RzXzJfMSAmJiAhdl9wT2JqZWN0c18yXzEuZG9uZSAmJiAoX2EgPSB2X3BPYmplY3RzXzIucmV0dXJuKSkgX2EuY2FsbCh2X3BPYmplY3RzXzIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8yKSB0aHJvdyBlXzIuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbC5wcm90b3R5cGUudW5zcGF3biA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIGlmICghb2JqKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignT2JqZWN0IGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB0aGlzLnVuc3Bhd25CeVRhcmdldChvYmoudGFyZ2V0KTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbC5wcm90b3R5cGUudW5zcGF3bkJ5VGFyZ2V0ID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICAgICAgaWYgKCF0YXJnZXQpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUYXJnZXQgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHZhciB2X3BJbnRlcm5hbE9iamVjdCA9IHRoaXMuZ2V0T2JqZWN0QnlUYXJnZXQodGFyZ2V0KTtcbiAgICAgICAgICAgIGlmICh2X3BJbnRlcm5hbE9iamVjdCkge1xuICAgICAgICAgICAgICAgIHZfcEludGVybmFsT2JqZWN0LnVuc3Bhd24oKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb3VudCA+IHRoaXMubV9pQ2FwYWNpdHkgJiYgdl9wSW50ZXJuYWxPYmplY3Quc3Bhd25Db3VudCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVsZWFzZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgZmluZCB0YXJnZXQgaW4gb2JqZWN0IHBvb2wgJ1wiICsgdGhpcy5uYW1lICsgXCInLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbC5wcm90b3R5cGUuc2V0TG9ja2VkID0gZnVuY3Rpb24gKG9iaiwgbG9ja2VkKSB7XG4gICAgICAgICAgICBpZiAoIW9iailcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09iamVjdCBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdGhpcy5zZXRMb2NrZWRCeVRhcmdldChvYmoudGFyZ2V0LCBsb2NrZWQpO1xuICAgICAgICB9O1xuICAgICAgICBPYmplY3RQb29sLnByb3RvdHlwZS5zZXRMb2NrZWRCeVRhcmdldCA9IGZ1bmN0aW9uICh0YXJnZXQsIGxvY2tlZCkge1xuICAgICAgICAgICAgaWYgKCF0YXJnZXQpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUYXJnZXQgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHZhciB2X3BJbnRlcm5hbE9iamVjdCA9IHRoaXMuZ2V0T2JqZWN0QnlUYXJnZXQodGFyZ2V0KTtcbiAgICAgICAgICAgIGlmICh2X3BJbnRlcm5hbE9iamVjdCkge1xuICAgICAgICAgICAgICAgIHZfcEludGVybmFsT2JqZWN0LmxvY2tlZCA9IGxvY2tlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgZmluZCB0YXJnZXQgaW4gb2JqZWN0IHBvb2wgJ1wiICsgdGhpcy5uYW1lICsgXCInLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbC5wcm90b3R5cGUuc2V0UHJpb3JpdHkgPSBmdW5jdGlvbiAob2JqLCBwcmlvcml0eSkge1xuICAgICAgICAgICAgaWYgKCFvYmopXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPYmplY3QgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHRoaXMuc2V0UHJpb3JpdHlCeVRhcmdldChvYmoudGFyZ2V0LCBwcmlvcml0eSk7XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdFBvb2wucHJvdG90eXBlLnNldFByaW9yaXR5QnlUYXJnZXQgPSBmdW5jdGlvbiAodGFyZ2V0LCBwcmlvcml0eSkge1xuICAgICAgICAgICAgaWYgKCF0YXJnZXQpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUYXJnZXQgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHZhciB2X3BJbnRlcm5hbE9iamVjdCA9IHRoaXMuZ2V0T2JqZWN0QnlUYXJnZXQodGFyZ2V0KTtcbiAgICAgICAgICAgIGlmICh2X3BJbnRlcm5hbE9iamVjdCkge1xuICAgICAgICAgICAgICAgIHZfcEludGVybmFsT2JqZWN0LnByaW9yaXR5ID0gcHJpb3JpdHk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGZpbmQgdGFyZ2V0IGluIG9iamVjdCBwb29sICdcIiArIHRoaXMubmFtZSArIFwiJy5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdFBvb2wucHJvdG90eXBlLnJlbGVhc2UgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgdmFyIGVfMywgX2E7XG4gICAgICAgICAgICB2YXIgdG9SZWxlYXNlQ291bnQgPSB0aGlzLmNvdW50IC0gdGhpcy5tX2lDYXBhY2l0eTtcbiAgICAgICAgICAgIHZhciBmaWx0ZXIgPSB0aGlzLmRlZmF1bHRSZWxlYXNlT2JqZWN0RmlsdGVyQ2FsbGJhY2suYmluZCh0aGlzKTtcbiAgICAgICAgICAgIGlmICh1bmRlZmluZWQgIT09IGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoJ251bWJlcicgPT09IHR5cGVvZiBhKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvUmVsZWFzZUNvdW50ID0gYTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlciA9IGE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh1bmRlZmluZWQgIT09IGIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2YgYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9SZWxlYXNlQ291bnQgPSBiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyID0gYjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghZmlsdGVyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZWxlYXNlIG9iamVjdCBmaWx0ZXIgY2FsbGJhY2sgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0b1JlbGVhc2VDb3VudCA8IDApXG4gICAgICAgICAgICAgICAgdG9SZWxlYXNlQ291bnQgPSAwO1xuICAgICAgICAgICAgdmFyIHZfZkV4cGlyZVRpbWUgPSBEYXRlVGltZU1pblRpbWVzdGFtcDtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fZkV4cGlyZVRpbWUgPCBOdW1iZXIuTUFYX1ZBTFVFKVxuICAgICAgICAgICAgICAgIHZfZkV4cGlyZVRpbWUgPSBuZXcgRGF0ZSgpLnZhbHVlT2YoKSAtIHRoaXMubV9mRXhwaXJlVGltZTtcbiAgICAgICAgICAgIHRoaXMubV9mQXV0b1JlbGVhc2VUaW1lID0gMDtcbiAgICAgICAgICAgIHRoaXMuZ2V0Q2FuUmVsZWFzZU9iamVjdHModGhpcy5tX3BDYWNoZUNhblJlbGVhc2VPYmpldHMpO1xuICAgICAgICAgICAgdmFyIHZfcFRvUmVsZWFzZU9iamVjdHMgPSBmaWx0ZXIodGhpcy5tX3BDYWNoZUNhblJlbGVhc2VPYmpldHMsIHRvUmVsZWFzZUNvdW50LCB2X2ZFeHBpcmVUaW1lKTtcbiAgICAgICAgICAgIGlmICghdl9wVG9SZWxlYXNlT2JqZWN0cyB8fCB2X3BUb1JlbGVhc2VPYmplY3RzLmxlbmd0aCA8PSAwKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgdl9wVG9SZWxlYXNlT2JqZWN0c18xID0gX192YWx1ZXModl9wVG9SZWxlYXNlT2JqZWN0cyksIHZfcFRvUmVsZWFzZU9iamVjdHNfMV8xID0gdl9wVG9SZWxlYXNlT2JqZWN0c18xLm5leHQoKTsgIXZfcFRvUmVsZWFzZU9iamVjdHNfMV8xLmRvbmU7IHZfcFRvUmVsZWFzZU9iamVjdHNfMV8xID0gdl9wVG9SZWxlYXNlT2JqZWN0c18xLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdG9SZWxlYXNlT2JqZWN0ID0gdl9wVG9SZWxlYXNlT2JqZWN0c18xXzEudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVsZWFzZU9iamVjdCh0b1JlbGVhc2VPYmplY3QpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzNfMSkgeyBlXzMgPSB7IGVycm9yOiBlXzNfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodl9wVG9SZWxlYXNlT2JqZWN0c18xXzEgJiYgIXZfcFRvUmVsZWFzZU9iamVjdHNfMV8xLmRvbmUgJiYgKF9hID0gdl9wVG9SZWxlYXNlT2JqZWN0c18xLnJldHVybikpIF9hLmNhbGwodl9wVG9SZWxlYXNlT2JqZWN0c18xKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzMpIHRocm93IGVfMy5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBPYmplY3RQb29sLnByb3RvdHlwZS5yZWxlYXNlQWxsVW51c2VkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfNCwgX2E7XG4gICAgICAgICAgICB0aGlzLm1fZkF1dG9SZWxlYXNlVGltZSA9IDA7XG4gICAgICAgICAgICB0aGlzLmdldENhblJlbGVhc2VPYmplY3RzKHRoaXMubV9wQ2FjaGVDYW5SZWxlYXNlT2JqZXRzKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcENhY2hlQ2FuUmVsZWFzZU9iamV0cyksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRvUmVsZWFzZU9iamVjdCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbGVhc2VPYmplY3QodG9SZWxlYXNlT2JqZWN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV80XzEpIHsgZV80ID0geyBlcnJvcjogZV80XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNCkgdGhyb3cgZV80LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdFBvb2wucHJvdG90eXBlLmdldEFsbE9iamVjdEluZm9zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfNSwgX2EsIGVfNiwgX2I7XG4gICAgICAgICAgICB2YXIgdl9wUmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYyA9IF9fdmFsdWVzKHRoaXMubV9wT2JqZWN0cy52YWx1ZXMoKSksIF9kID0gX2MubmV4dCgpOyAhX2QuZG9uZTsgX2QgPSBfYy5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9iamVjdHMgPSBfZC52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9lID0gKGVfNiA9IHZvaWQgMCwgX192YWx1ZXMob2JqZWN0cy52YWx1ZXMoKSkpLCBfZiA9IF9lLm5leHQoKTsgIV9mLmRvbmU7IF9mID0gX2UubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGludGVybmFsT2JqZWN0ID0gX2YudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdl9wUmVzdWx0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaW50ZXJuYWxPYmplY3QubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9ja2VkOiBpbnRlcm5hbE9iamVjdC5sb2NrZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbUNhblJlbGVhc2VGbGFnOiBpbnRlcm5hbE9iamVjdC5jdXN0b21DYW5SZWxlYXNlRmxhZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJpb3JpdHk6IGludGVybmFsT2JqZWN0LnByaW9yaXR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0VXNlVGltZTogaW50ZXJuYWxPYmplY3QubGFzdFVzZVRpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwYXduQ291bnQ6IGludGVybmFsT2JqZWN0LnNwYXduQ291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzSW5Vc2U6IGludGVybmFsT2JqZWN0LmlzSW5Vc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZV82XzEpIHsgZV82ID0geyBlcnJvcjogZV82XzEgfTsgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9mICYmICFfZi5kb25lICYmIChfYiA9IF9lLnJldHVybikpIF9iLmNhbGwoX2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzYpIHRocm93IGVfNi5lcnJvcjsgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfNV8xKSB7IGVfNSA9IHsgZXJyb3I6IGVfNV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfZCAmJiAhX2QuZG9uZSAmJiAoX2EgPSBfYy5yZXR1cm4pKSBfYS5jYWxsKF9jKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzUpIHRocm93IGVfNS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZfcFJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdFBvb2wucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgdGhpcy5tX2ZBdXRvUmVsZWFzZVRpbWUgKz0gcmVhbEVsYXBzZWQ7XG4gICAgICAgICAgICBpZiAodGhpcy5tX2ZBdXRvUmVsZWFzZVRpbWUgPCB0aGlzLm1fZkF1dG9SZWxlYXNlSW50ZXJ2YWwpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5yZWxlYXNlKCk7XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdFBvb2wucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfNywgX2E7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BPYmplY3RNYXAudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvYmplY3RJbk1hcCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBvYmplY3RJbk1hcC5yZWxlYXNlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAvLyBGSVhNRTogUmVmZXJlbmNlUG9vbC5yZWxlYXNlKG9iamVjdEluTWFwKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzdfMSkgeyBlXzcgPSB7IGVycm9yOiBlXzdfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV83KSB0aHJvdyBlXzcuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wT2JqZWN0cy5jbGVhcigpO1xuICAgICAgICAgICAgdGhpcy5tX3BPYmplY3RNYXAuY2xlYXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbC5wcm90b3R5cGUuZ2V0T2JqZWN0cyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcE9iamVjdHMuZ2V0KG5hbWUpIHx8IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdFBvb2wucHJvdG90eXBlLmdldE9iamVjdEJ5VGFyZ2V0ID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICAgICAgaWYgKCF0YXJnZXQpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUYXJnZXQgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcE9iamVjdE1hcC5nZXQodGFyZ2V0KSB8fCBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBPYmplY3RQb29sLnByb3RvdHlwZS5yZWxlYXNlT2JqZWN0ID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgaWYgKCFvYmopXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPYmplY3QgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHZhciB2X3BPYmplY3RzID0gdGhpcy5nZXRPYmplY3RzKG9iai5uYW1lKTtcbiAgICAgICAgICAgIHZhciB2X3BJbnRlcm5hbE9iamVjdCA9IHRoaXMuZ2V0T2JqZWN0QnlUYXJnZXQob2JqLnRhcmdldCk7XG4gICAgICAgICAgICBpZiAobnVsbCAhPSB2X3BPYmplY3RzICYmIG51bGwgIT0gdl9wSW50ZXJuYWxPYmplY3QpIHtcbiAgICAgICAgICAgICAgICB2YXIgaWR4ID0gdl9wT2JqZWN0cy5pbmRleE9mKHZfcEludGVybmFsT2JqZWN0KTtcbiAgICAgICAgICAgICAgICBpZiAoaWR4ID4gLTEpXG4gICAgICAgICAgICAgICAgICAgIHZfcE9iamVjdHMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BPYmplY3RNYXAuZGVsZXRlKG9iai50YXJnZXQpO1xuICAgICAgICAgICAgICAgIGlmICh2X3BPYmplY3RzLmxlbmd0aCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wT2JqZWN0cy5kZWxldGUob2JqLm5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2X3BJbnRlcm5hbE9iamVjdC5yZWxlYXNlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAvLyBGSVhNRTogUmVmZXJlbmNlUG9vbC5yZWxlYXNlKHZfcEludGVybmFsT2JqZWN0KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBub3QgcmVsZWFzZSBvYmplY3Qgd2hpY2ggaXMgbm90IGZvdW5kLicpO1xuICAgICAgICB9O1xuICAgICAgICBPYmplY3RQb29sLnByb3RvdHlwZS5nZXRDYW5SZWxlYXNlT2JqZWN0cyA9IGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgICAgICB2YXIgZV84LCBfYTtcbiAgICAgICAgICAgIGlmICghcmVzdWx0cylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Jlc3VsdHMgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHJlc3VsdHMuc3BsaWNlKDAsIHJlc3VsdHMubGVuZ3RoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcE9iamVjdE1hcC52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGludGVybmFsT2JqZWN0ID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnRlcm5hbE9iamVjdC5pc0luVXNlIHx8IGludGVybmFsT2JqZWN0LmxvY2tlZCB8fCAhaW50ZXJuYWxPYmplY3QuY3VzdG9tQ2FuUmVsZWFzZUZsYWcpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGludGVybmFsT2JqZWN0LnBlZWsoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfOF8xKSB7IGVfOCA9IHsgZXJyb3I6IGVfOF8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzgpIHRocm93IGVfOC5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBPYmplY3RQb29sLnByb3RvdHlwZS5kZWZhdWx0UmVsZWFzZU9iamVjdEZpbHRlckNhbGxiYWNrID0gZnVuY3Rpb24gKGNhbmRpZGF0ZU9iamVjdHMsIHRvUmVsZWFzZUNvdW50LCBleHBpcmVUaW1lKSB7XG4gICAgICAgICAgICB0aGlzLm1fcENhY2hlVG9SZWxlYXNlT2JqZWN0cy5zcGxpY2UoMCwgdGhpcy5tX3BDYWNoZVRvUmVsZWFzZU9iamVjdHMubGVuZ3RoKTtcbiAgICAgICAgICAgIGlmIChleHBpcmVUaW1lID4gRGF0ZVRpbWVNaW5UaW1lc3RhbXApIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gY2FuZGlkYXRlT2JqZWN0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2FuZGlkYXRlT2JqZWN0c1tpXS5sYXN0VXNlVGltZSA8PSBleHBpcmVUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcENhY2hlVG9SZWxlYXNlT2JqZWN0cy5wdXNoKGNhbmRpZGF0ZU9iamVjdHNbaV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FuZGlkYXRlT2JqZWN0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0b1JlbGVhc2VDb3VudCAtPSB0aGlzLm1fcENhY2hlVG9SZWxlYXNlT2JqZWN0cy5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgdG9SZWxlYXNlQ291bnQgPiAwICYmIGkgPCBjYW5kaWRhdGVPYmplY3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IGkgKyAxOyBqIDwgY2FuZGlkYXRlT2JqZWN0cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2FuZGlkYXRlT2JqZWN0c1tpXS5wcmlvcml0eSA+IGNhbmRpZGF0ZU9iamVjdHNbal0ucHJpb3JpdHkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbmRpZGF0ZU9iamVjdHNbaV0ucHJpb3JpdHkgPT0gY2FuZGlkYXRlT2JqZWN0c1tqXS5wcmlvcml0eSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbmRpZGF0ZU9iamVjdHNbaV0ubGFzdFVzZVRpbWUgPiBjYW5kaWRhdGVPYmplY3RzW2pdLmxhc3RVc2VUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdl9wVGVtcCA9IGNhbmRpZGF0ZU9iamVjdHNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBjYW5kaWRhdGVPYmplY3RzW2ldID0gY2FuZGlkYXRlT2JqZWN0c1tqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbmRpZGF0ZU9iamVjdHNbal0gPSB2X3BUZW1wO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMubV9wQ2FjaGVUb1JlbGVhc2VPYmplY3RzLnB1c2goY2FuZGlkYXRlT2JqZWN0c1tpXSk7XG4gICAgICAgICAgICAgICAgdG9SZWxlYXNlQ291bnQtLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcENhY2hlVG9SZWxlYXNlT2JqZWN0cztcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIE9iamVjdFBvb2w7XG4gICAgfShPYmplY3RQb29sQmFzZSkpOyAvLyBjbGFzcyBPYmplY3RQb29sXG4gICAgdmFyIFJlZk9iamVjdCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gUmVmT2JqZWN0KCkge1xuICAgICAgICAgICAgdGhpcy5tX3BPYmplY3QgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX2lTcGF3bkNvdW50ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUmVmT2JqZWN0LnByb3RvdHlwZSwgXCJuYW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BPYmplY3QubmFtZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZWZPYmplY3QucHJvdG90eXBlLCBcImxvY2tlZFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wT2JqZWN0LmxvY2tlZDsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9wT2JqZWN0LmxvY2tlZCA9IHZhbHVlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFJlZk9iamVjdC5wcm90b3R5cGUsIFwicHJpb3JpdHlcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcE9iamVjdC5wcmlvcml0eTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9wT2JqZWN0LnByaW9yaXR5ID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUmVmT2JqZWN0LnByb3RvdHlwZSwgXCJjdXN0b21DYW5SZWxlYXNlRmxhZ1wiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wT2JqZWN0LmN1c3RvbUNhblJlbGVhc2VGbGFnOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFJlZk9iamVjdC5wcm90b3R5cGUsIFwibGFzdFVzZVRpbWVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcE9iamVjdC5sYXN0VXNlVGltZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZWZPYmplY3QucHJvdG90eXBlLCBcImlzSW5Vc2VcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1faVNwYXduQ291bnQgPiAwOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFJlZk9iamVjdC5wcm90b3R5cGUsIFwic3Bhd25Db3VudFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9pU3Bhd25Db3VudDsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFJlZk9iamVjdC5jcmVhdGUgPSBmdW5jdGlvbiAob2JqLCBzcGF3bmVkKSB7XG4gICAgICAgICAgICBpZiAoIW9iailcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09iamVjdCBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgLy8gRklYTUU6IGxldCB2X3BJbnRlcm5hbE9iamVjdDogUmVmT2JqZWN0PFQ+ID0gUmVmZXJlbmNlUG9vbC5hY3F1aXJlPFJlZk9iamVjdDxUPj4oKTtcbiAgICAgICAgICAgIHZhciB2X3BJbnRlcm5hbE9iamVjdCA9IG5ldyBSZWZPYmplY3QoKTtcbiAgICAgICAgICAgIHZfcEludGVybmFsT2JqZWN0Lm1fcE9iamVjdCA9IG9iajtcbiAgICAgICAgICAgIHZfcEludGVybmFsT2JqZWN0Lm1faVNwYXduQ291bnQgPSBzcGF3bmVkID8gMSA6IDA7XG4gICAgICAgICAgICBpZiAoc3Bhd25lZClcbiAgICAgICAgICAgICAgICBvYmoub25TcGF3bigpO1xuICAgICAgICAgICAgcmV0dXJuIHZfcEludGVybmFsT2JqZWN0O1xuICAgICAgICB9O1xuICAgICAgICBSZWZPYmplY3QucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5tX3BPYmplY3QgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX2lTcGF3bkNvdW50ID0gMDtcbiAgICAgICAgfTtcbiAgICAgICAgUmVmT2JqZWN0LnByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wT2JqZWN0O1xuICAgICAgICB9O1xuICAgICAgICBSZWZPYmplY3QucHJvdG90eXBlLnNwYXduID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5tX2lTcGF3bkNvdW50Kys7XG4gICAgICAgICAgICB0aGlzLm1fcE9iamVjdC5sYXN0VXNlVGltZSA9IG5ldyBEYXRlKCkudmFsdWVPZigpO1xuICAgICAgICAgICAgdGhpcy5tX3BPYmplY3Qub25TcGF3bigpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wT2JqZWN0O1xuICAgICAgICB9O1xuICAgICAgICBSZWZPYmplY3QucHJvdG90eXBlLnVuc3Bhd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLm1fcE9iamVjdC5vblVuc3Bhd24oKTtcbiAgICAgICAgICAgIHRoaXMubV9wT2JqZWN0Lmxhc3RVc2VUaW1lID0gbmV3IERhdGUoKS52YWx1ZU9mKCk7XG4gICAgICAgICAgICB0aGlzLm1faVNwYXduQ291bnQtLTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1faVNwYXduQ291bnQgPCAwKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU3Bhd24gY291bnQgaXMgbGVzcyB0aGFuIDAuJyk7XG4gICAgICAgIH07XG4gICAgICAgIFJlZk9iamVjdC5wcm90b3R5cGUucmVsZWFzZSA9IGZ1bmN0aW9uIChpc1NodXRkb3duKSB7XG4gICAgICAgICAgICB0aGlzLm1fcE9iamVjdC5yZWxlYXNlKGlzU2h1dGRvd24pO1xuICAgICAgICAgICAgLy8gRklYTUU6IFJlZmVyZW5jZVBvb2wucmVsZWFzZSh0aGlzLm1fcE9iamVjdCBhcyBJUmVmZXJlbmNlKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFJlZk9iamVjdDtcbiAgICB9KCkpOyAvLyBjbGFzcyBSZWZPYmplY3RcbiAgICBmdW5jdGlvbiBjcmVhdGVPYmplY3RJbmZvKG5hbWUsIGxvY2tlZCwgY3VzdG9tQ2FuUmVsZWFzZUZsYWcsIHByaW9yaXR5LCBsYXN0VXNlVGltZSwgc3Bhd25Db3VudCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgIGxvY2tlZDogbG9ja2VkLFxuICAgICAgICAgICAgY3VzdG9tQ2FuUmVsZWFzZUZsYWc6IGN1c3RvbUNhblJlbGVhc2VGbGFnLFxuICAgICAgICAgICAgcHJpb3JpdHk6IHByaW9yaXR5LFxuICAgICAgICAgICAgbGFzdFVzZVRpbWU6IGxhc3RVc2VUaW1lLFxuICAgICAgICAgICAgaXNJblVzZTogZmFsc2UsXG4gICAgICAgICAgICBzcGF3bkNvdW50OiBzcGF3bkNvdW50XG4gICAgICAgIH07XG4gICAgfVxuICAgIHZhciBPYmplY3RCYXNlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBPYmplY3RCYXNlKCkge1xuICAgICAgICAgICAgdGhpcy5tX3NOYW1lID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9wVGFyZ2V0ID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9iTG9ja2VkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm1faVByaW9yaXR5ID0gMDtcbiAgICAgICAgICAgIHRoaXMubV91TGFzdFVzZVRpbWUgPSAwO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPYmplY3RCYXNlLnByb3RvdHlwZSwgXCJuYW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3NOYW1lOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE9iamVjdEJhc2UucHJvdG90eXBlLCBcInRhcmdldFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wVGFyZ2V0OyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE9iamVjdEJhc2UucHJvdG90eXBlLCBcImxvY2tlZFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9iTG9ja2VkOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX2JMb2NrZWQgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPYmplY3RCYXNlLnByb3RvdHlwZSwgXCJwcmlvcml0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9pUHJpb3JpdHk7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1faVByaW9yaXR5ID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0QmFzZS5wcm90b3R5cGUsIFwiY3VzdG9tQ2FuUmVsZWFzZUZsYWdcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0cnVlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE9iamVjdEJhc2UucHJvdG90eXBlLCBcImxhc3RVc2VUaW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3VMYXN0VXNlVGltZTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV91TGFzdFVzZVRpbWUgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdEJhc2UucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbiAobmFtZU9yVGFyZ2V0LCB0YXJnZXQsIGxvY2tlZCwgcHJpb3JpdHkpIHtcbiAgICAgICAgICAgIHZhciBuYW1lO1xuICAgICAgICAgICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgbmFtZU9yVGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWVPclRhcmdldDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhcmdldCA9IG5hbWVPclRhcmdldDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9zTmFtZSA9IG5hbWUgfHwgJyc7XG4gICAgICAgICAgICB0aGlzLm1fcFRhcmdldCA9IHRhcmdldCB8fCBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX2JMb2NrZWQgPSBsb2NrZWQgfHwgZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm1faVByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMDtcbiAgICAgICAgICAgIHRoaXMubV91TGFzdFVzZVRpbWUgPSBuZXcgRGF0ZSgpLnZhbHVlT2YoKTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0QmFzZS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLm1fc05hbWUgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX3BUYXJnZXQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX2JMb2NrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubV9pUHJpb3JpdHkgPSAwO1xuICAgICAgICAgICAgdGhpcy5tX3VMYXN0VXNlVGltZSA9IDA7XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdEJhc2UucHJvdG90eXBlLm9uU3Bhd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdEJhc2UucHJvdG90eXBlLm9uVW5zcGF3biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIE9iamVjdEJhc2U7XG4gICAgfSgpKTsgLy8gY2xhc3MgT2JqZWN0QmFzZVxuICAgIGV4cG9ydHMuT2JqZWN0QmFzZSA9IE9iamVjdEJhc2U7XG4gICAgdmFyIE9iamVjdFBvb2xNYW5hZ2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICBfX2V4dGVuZHMoT2JqZWN0UG9vbE1hbmFnZXIsIF9zdXBlcik7XG4gICAgICAgIGZ1bmN0aW9uIE9iamVjdFBvb2xNYW5hZ2VyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgICAgICAgICBfdGhpcy5tX3BPYmplY3RQb29scyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLCBcInByaW9yaXR5XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiA5MDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLCBcImNvdW50XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcE9iamVjdFBvb2xzLnNpemU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgdmFyIGVfOSwgX2E7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BPYmplY3RQb29scy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9iamVjdFBvb2wgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0UG9vbC51cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzlfMSkgeyBlXzkgPSB7IGVycm9yOiBlXzlfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV85KSB0aHJvdyBlXzkuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfMTAsIF9hO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wT2JqZWN0UG9vbHMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvYmplY3RQb29sID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIG9iamVjdFBvb2wuc2h1dGRvd24oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xMF8xKSB7IGVfMTAgPSB7IGVycm9yOiBlXzEwXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMTApIHRocm93IGVfMTAuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wT2JqZWN0UG9vbHMuY2xlYXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLmhhc09iamVjdFBvb2wgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgLy8gcHJvY2VzcyB3aXRoIG5hbWUganVzdCBvbmx5LlxuICAgICAgICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRnVsbCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wT2JqZWN0UG9vbHMuaGFzKG5hbWUpO1xuICAgICAgICB9O1xuICAgICAgICBPYmplY3RQb29sTWFuYWdlci5wcm90b3R5cGUuZ2V0T2JqZWN0UG9vbCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPYmplY3RQb29sQmFzZShuYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLmdldE9iamVjdFBvb2xCYXNlID0gZnVuY3Rpb24gKG5hbWVPclByZWRpY2F0ZSkge1xuICAgICAgICAgICAgdmFyIGVfMTEsIF9hO1xuICAgICAgICAgICAgdmFyIG5hbWU7XG4gICAgICAgICAgICB2YXIgcHJlZGljYXRlO1xuICAgICAgICAgICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgbmFtZU9yUHJlZGljYXRlKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWVPclByZWRpY2F0ZTtcbiAgICAgICAgICAgICAgICBpZiAoIW5hbWUpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZ1bGwgbmFtZSBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBuYW1lT3JQcmVkaWNhdGUpIHtcbiAgICAgICAgICAgICAgICBwcmVkaWNhdGUgPSBuYW1lT3JQcmVkaWNhdGU7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcE9iamVjdFBvb2xzLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9iaiA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByZWRpY2F0ZShvYmopKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVfMTFfMSkgeyBlXzExID0geyBlcnJvcjogZV8xMV8xIH07IH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMTEpIHRocm93IGVfMTEuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BPYmplY3RQb29scy5nZXQobmFtZSkgfHwgbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLmdldE9iamVjdFBvb2xzID0gZnVuY3Rpb24gKHByZWRpY2F0ZSwgcmVzdWx0cykge1xuICAgICAgICAgICAgdmFyIGVfMTIsIF9hO1xuICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMgfHwgW107XG4gICAgICAgICAgICByZXN1bHRzLnNwbGljZSgwLCByZXN1bHRzLmxlbmd0aCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BPYmplY3RQb29scy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9iaiA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJlZGljYXRlKG9iaikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChvYmopO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMTJfMSkgeyBlXzEyID0geyBlcnJvcjogZV8xMl8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEyKSB0aHJvdyBlXzEyLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLmdldEFsbE9iamVjdFBvb2xzID0gZnVuY3Rpb24gKHNvcnRPclJlc3VsdHMsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgIHZhciBlXzEzLCBfYTtcbiAgICAgICAgICAgIHZhciBzb3J0ID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAodW5kZWZpbmVkICE9PSB0eXBlb2Ygc29ydE9yUmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGlmICgnYm9vbGVhbicgPT09IHR5cGVvZiBzb3J0T3JSZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNvcnQgPSBzb3J0T3JSZXN1bHRzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IHNvcnRPclJlc3VsdHM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMgfHwgW107XG4gICAgICAgICAgICByZXN1bHRzLnNwbGljZSgwLCByZXN1bHRzLmxlbmd0aCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BPYmplY3RQb29scy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9iaiA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gob2JqKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xM18xKSB7IGVfMTMgPSB7IGVycm9yOiBlXzEzXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMTMpIHRocm93IGVfMTMuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzb3J0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYS5wcmlvcml0eSA+IGIucHJpb3JpdHkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoYS5wcmlvcml0eSA8IGIucHJpb3JpdHkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdFBvb2xNYW5hZ2VyLnByb3RvdHlwZS5jcmVhdGVTaW5nbGVTcGF3bk9iamVjdFBvb2wgPSBmdW5jdGlvbiAob3B0aW9uKSB7XG4gICAgICAgICAgICB2YXIgdl9zdFBhcmFtcyA9IG9wdGlvbiB8fCB7fTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmludGVybmFsQ3JlYXRlT2JqZWN0UG9vbCh2X3N0UGFyYW1zLm5hbWUgfHwgJycsIGZhbHNlLCB2X3N0UGFyYW1zLmV4cGlyZVRpbWUgfHwgRGVmYXVsdEV4cGlyZVRpbWUsIHZfc3RQYXJhbXMuY2FwYWNpdHkgfHwgRGVmYXVsdENhcGFjaXR5LCB2X3N0UGFyYW1zLmV4cGlyZVRpbWUgfHwgRGVmYXVsdEV4cGlyZVRpbWUsIHZfc3RQYXJhbXMucHJpb3JpdHkgfHwgRGVmYXVsdFByaW9yaXR5KTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLmNyZWF0ZU11dGxpU3Bhd25PYmplY3RQb29sID0gZnVuY3Rpb24gKG9wdGlvbikge1xuICAgICAgICAgICAgdmFyIHZfc3RQYXJhbXMgPSBvcHRpb24gfHwge307XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbENyZWF0ZU9iamVjdFBvb2wodl9zdFBhcmFtcy5uYW1lIHx8ICcnLCB2X3N0UGFyYW1zLmFsbG93TXVsdGlTcGF3biB8fCB0cnVlLCB2X3N0UGFyYW1zLmF1dG9SZWxlYXNlSW50ZXJ2YWwgfHwgRGVmYXVsdEV4cGlyZVRpbWUsIHZfc3RQYXJhbXMuY2FwYWNpdHkgfHwgRGVmYXVsdENhcGFjaXR5LCB2X3N0UGFyYW1zLmV4cGlyZVRpbWUgfHwgRGVmYXVsdEV4cGlyZVRpbWUsIHZfc3RQYXJhbXMucHJpb3JpdHkgfHwgRGVmYXVsdFByaW9yaXR5KTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLmRlc3Ryb3lPYmplY3RQb29sID0gZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHZhciBuYW1lID0gJyc7XG4gICAgICAgICAgICBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiBhKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IGE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh1bmRlZmluZWQgIT09IGEpIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gYS5uYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxEZXN0cm95T2JqZWN0UG9vbChuYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLnJlbGVhc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZV8xNCwgX2E7XG4gICAgICAgICAgICB2YXIgdl9wT2JqZWN0UG9vbHMgPSB0aGlzLmdldEFsbE9iamVjdFBvb2xzKHRydWUpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB2X3BPYmplY3RQb29sc18xID0gX192YWx1ZXModl9wT2JqZWN0UG9vbHMpLCB2X3BPYmplY3RQb29sc18xXzEgPSB2X3BPYmplY3RQb29sc18xLm5leHQoKTsgIXZfcE9iamVjdFBvb2xzXzFfMS5kb25lOyB2X3BPYmplY3RQb29sc18xXzEgPSB2X3BPYmplY3RQb29sc18xLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgb2JqZWN0UG9vbCA9IHZfcE9iamVjdFBvb2xzXzFfMS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0UG9vbC5yZWxlYXNlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMTRfMSkgeyBlXzE0ID0geyBlcnJvcjogZV8xNF8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2X3BPYmplY3RQb29sc18xXzEgJiYgIXZfcE9iamVjdFBvb2xzXzFfMS5kb25lICYmIChfYSA9IHZfcE9iamVjdFBvb2xzXzEucmV0dXJuKSkgX2EuY2FsbCh2X3BPYmplY3RQb29sc18xKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzE0KSB0aHJvdyBlXzE0LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdFBvb2xNYW5hZ2VyLnByb3RvdHlwZS5yZWxlYXNlQWxsVW51c2VkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfMTUsIF9hO1xuICAgICAgICAgICAgdmFyIHZfcE9iamVjdFBvb2xzID0gdGhpcy5nZXRBbGxPYmplY3RQb29scyh0cnVlKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgdl9wT2JqZWN0UG9vbHNfMiA9IF9fdmFsdWVzKHZfcE9iamVjdFBvb2xzKSwgdl9wT2JqZWN0UG9vbHNfMl8xID0gdl9wT2JqZWN0UG9vbHNfMi5uZXh0KCk7ICF2X3BPYmplY3RQb29sc18yXzEuZG9uZTsgdl9wT2JqZWN0UG9vbHNfMl8xID0gdl9wT2JqZWN0UG9vbHNfMi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9iamVjdFBvb2wgPSB2X3BPYmplY3RQb29sc18yXzEudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIG9iamVjdFBvb2wucmVsZWFzZUFsbFVudXNlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzE1XzEpIHsgZV8xNSA9IHsgZXJyb3I6IGVfMTVfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodl9wT2JqZWN0UG9vbHNfMl8xICYmICF2X3BPYmplY3RQb29sc18yXzEuZG9uZSAmJiAoX2EgPSB2X3BPYmplY3RQb29sc18yLnJldHVybikpIF9hLmNhbGwodl9wT2JqZWN0UG9vbHNfMik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xNSkgdGhyb3cgZV8xNS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBPYmplY3RQb29sTWFuYWdlci5wcm90b3R5cGUuaW50ZXJuYWxDcmVhdGVPYmplY3RQb29sID0gZnVuY3Rpb24gKG5hbWUsIGFsbG93TXVsdGlTcGF3biwgYXV0b1JlbGVhc2VJbnRlcnZhbCwgY2FwYWNpdHksIGV4cGlyZVRpbWUsIHByaW9yaXR5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5oYXNPYmplY3RQb29sKG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQWxyZWFkeSBleGlzdCBvYmplY3QgcG9vbCAnXCIgKyBuYW1lICsgXCInLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2X3BPYmplY3RQb29sID0gbmV3IE9iamVjdFBvb2wobmFtZSwgYWxsb3dNdWx0aVNwYXduLCBhdXRvUmVsZWFzZUludGVydmFsLCBjYXBhY2l0eSwgZXhwaXJlVGltZSwgcHJpb3JpdHkpO1xuICAgICAgICAgICAgdGhpcy5tX3BPYmplY3RQb29scy5zZXQobmFtZSwgdl9wT2JqZWN0UG9vbCk7XG4gICAgICAgICAgICByZXR1cm4gdl9wT2JqZWN0UG9vbDtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLmludGVybmFsRGVzdHJveU9iamVjdFBvb2wgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgdmFyIHZfcE9iamVjdFBvb2wgPSB0aGlzLm1fcE9iamVjdFBvb2xzLmdldChuYW1lKTtcbiAgICAgICAgICAgIGlmICh2X3BPYmplY3RQb29sKSB7XG4gICAgICAgICAgICAgICAgdl9wT2JqZWN0UG9vbC5zaHV0ZG93bigpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcE9iamVjdFBvb2xzLmRlbGV0ZShuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIE9iamVjdFBvb2xNYW5hZ2VyO1xuICAgIH0oQmFzZV8xLkZyYW1ld29ya01vZHVsZSkpOyAvLyBjbGFzcyBPYmplY3RQb29sTWFuYWdlclxuICAgIGV4cG9ydHMuT2JqZWN0UG9vbE1hbmFnZXIgPSBPYmplY3RQb29sTWFuYWdlcjtcbn0pO1xuIiwidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiLCBcIi4vRnNtXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICB2YXIgRnNtXzEgPSByZXF1aXJlKFwiLi9Gc21cIik7XG4gICAgdmFyIFByb2NlZHVyZUJhc2UgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhQcm9jZWR1cmVCYXNlLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBQcm9jZWR1cmVCYXNlKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBQcm9jZWR1cmVCYXNlO1xuICAgIH0oRnNtXzEuRnNtU3RhdGUpKTsgLy8gY2xhc3MgUHJvY2VkdXJlQmFzZVxuICAgIGV4cG9ydHMuUHJvY2VkdXJlQmFzZSA9IFByb2NlZHVyZUJhc2U7XG4gICAgdmFyIFByb2NlZHVyZU1hbmFnZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhQcm9jZWR1cmVNYW5hZ2VyLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBQcm9jZWR1cmVNYW5hZ2VyKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShQcm9jZWR1cmVNYW5hZ2VyLnByb3RvdHlwZSwgXCJwcmlvcml0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIC0xMDsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShQcm9jZWR1cmVNYW5hZ2VyLnByb3RvdHlwZSwgXCJjdXJyZW50UHJvY2VkdXJlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFByb2NlZHVyZUZzbS5jdXJyZW50U3RhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgUHJvY2VkdXJlTWFuYWdlci5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIChmc21NYW5hZ2VyLCBwcm9jZWR1cmVzKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSBmc21NYW5hZ2VyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRlNNIG1hbmFnZXIgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHRoaXMubV9wRnNtTWFuYWdlciA9IGZzbU1hbmFnZXI7XG4gICAgICAgICAgICB0aGlzLm1fcFByb2NlZHVyZUZzbSA9IGZzbU1hbmFnZXIuY3JlYXRlRnNtKCcnLCB0aGlzLCBwcm9jZWR1cmVzKTtcbiAgICAgICAgfTtcbiAgICAgICAgUHJvY2VkdXJlTWFuYWdlci5wcm90b3R5cGUuc3RhcnRQcm9jZWR1cmUgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLm1fcFByb2NlZHVyZUZzbSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBtdXN0IGluaXRpYWxpemUgcHJvY2VkdXJlIGZpcnN0LicpO1xuICAgICAgICAgICAgdGhpcy5tX3BQcm9jZWR1cmVGc20uc3RhcnQob2JqLmNvbnN0cnVjdG9yKTtcbiAgICAgICAgfTtcbiAgICAgICAgUHJvY2VkdXJlTWFuYWdlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICAvLyBOb29wLlxuICAgICAgICB9O1xuICAgICAgICBQcm9jZWR1cmVNYW5hZ2VyLnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChudWxsICE9IHRoaXMubV9wRnNtTWFuYWdlcikge1xuICAgICAgICAgICAgICAgIGlmIChudWxsICE9IHRoaXMubV9wUHJvY2VkdXJlRnNtKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wRnNtTWFuYWdlci5kZXN0cm95RnNtKHRoaXMubV9wUHJvY2VkdXJlRnNtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFByb2NlZHVyZU1hbmFnZXIucHJvdG90eXBlLmhhc1Byb2NlZHVyZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLm1fcFByb2NlZHVyZUZzbSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBtdXN0IGluaXRpYWxpemUgcHJvY2VkdXJlIGZpcnN0LicpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUHJvY2VkdXJlRnNtLmhhc1N0YXRlKHR5cGUpO1xuICAgICAgICB9O1xuICAgICAgICBQcm9jZWR1cmVNYW5hZ2VyLnByb3RvdHlwZS5nZXRQcm9jZWR1cmUgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BQcm9jZWR1cmVGc20pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgbXVzdCBpbml0aWFsaXplIHByb2NlZHVyZSBmaXJzdC4nKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFByb2NlZHVyZUZzbS5nZXRTdGF0ZSh0eXBlKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFByb2NlZHVyZU1hbmFnZXI7XG4gICAgfShCYXNlXzEuRnJhbWV3b3JrTW9kdWxlKSk7IC8vIGNsYXNzIFByb2NlZHVyZU1hbmFnZXJcbiAgICBleHBvcnRzLlByb2NlZHVyZU1hbmFnZXIgPSBQcm9jZWR1cmVNYW5hZ2VyO1xufSk7XG4iLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICB2YXIgUmVzb3VyY2VNb2RlO1xuICAgIChmdW5jdGlvbiAoUmVzb3VyY2VNb2RlKSB7XG4gICAgICAgIFJlc291cmNlTW9kZVtSZXNvdXJjZU1vZGVbXCJVbnNwZWNpZmllZFwiXSA9IDBdID0gXCJVbnNwZWNpZmllZFwiO1xuICAgICAgICBSZXNvdXJjZU1vZGVbUmVzb3VyY2VNb2RlW1wiUGFja2FnZVwiXSA9IDFdID0gXCJQYWNrYWdlXCI7XG4gICAgICAgIFJlc291cmNlTW9kZVtSZXNvdXJjZU1vZGVbXCJVcGRhdGFibGVcIl0gPSAyXSA9IFwiVXBkYXRhYmxlXCI7XG4gICAgfSkoUmVzb3VyY2VNb2RlID0gZXhwb3J0cy5SZXNvdXJjZU1vZGUgfHwgKGV4cG9ydHMuUmVzb3VyY2VNb2RlID0ge30pKTsgLy8gZW51bSBSZXNvdXJjZU1vZGVcbiAgICB2YXIgTG9hZFJlc291cmNlU3RhdHVzO1xuICAgIChmdW5jdGlvbiAoTG9hZFJlc291cmNlU3RhdHVzKSB7XG4gICAgICAgIExvYWRSZXNvdXJjZVN0YXR1c1tMb2FkUmVzb3VyY2VTdGF0dXNbXCJTdWNjZXNzXCJdID0gMF0gPSBcIlN1Y2Nlc3NcIjtcbiAgICAgICAgTG9hZFJlc291cmNlU3RhdHVzW0xvYWRSZXNvdXJjZVN0YXR1c1tcIk5vdFJlYWR5XCJdID0gMV0gPSBcIk5vdFJlYWR5XCI7XG4gICAgICAgIExvYWRSZXNvdXJjZVN0YXR1c1tMb2FkUmVzb3VyY2VTdGF0dXNbXCJOb3RFeGlzdFwiXSA9IDJdID0gXCJOb3RFeGlzdFwiO1xuICAgICAgICBMb2FkUmVzb3VyY2VTdGF0dXNbTG9hZFJlc291cmNlU3RhdHVzW1wiRGVwZW5kZW5jeUVycm9yXCJdID0gM10gPSBcIkRlcGVuZGVuY3lFcnJvclwiO1xuICAgICAgICBMb2FkUmVzb3VyY2VTdGF0dXNbTG9hZFJlc291cmNlU3RhdHVzW1wiVHlwZUVycm9yXCJdID0gNF0gPSBcIlR5cGVFcnJvclwiO1xuICAgICAgICBMb2FkUmVzb3VyY2VTdGF0dXNbTG9hZFJlc291cmNlU3RhdHVzW1wiQXNzZXRFcnJvclwiXSA9IDVdID0gXCJBc3NldEVycm9yXCI7XG4gICAgfSkoTG9hZFJlc291cmNlU3RhdHVzID0gZXhwb3J0cy5Mb2FkUmVzb3VyY2VTdGF0dXMgfHwgKGV4cG9ydHMuTG9hZFJlc291cmNlU3RhdHVzID0ge30pKTsgLy8gZW51bSBMb2FkUmVzb3VyY2VTdGF0dXNcbiAgICAvKipcbiAgICAgKiBBIHJlc291cmNlIG1hbmFnZXIgbW9kdWxhciBiYXNlIG9uIGBGcmFtZXdvcmtNb2R1bGVgLlxuICAgICAqXG4gICAgICogVE9ETzogQSBnZW5lcmFsIHJlc291cmNlIG1hbmFnZW1lbnQgd2FzIG5vdCB5ZXQgaW1wbGVtZW50ZWQuXG4gICAgICpcbiAgICAgKiBAYXV0aG9yIEplcmVteSBDaGVuIChrZXlob20uY0BnbWFpbC5jb20pXG4gICAgICovXG4gICAgdmFyIFJlc291cmNlTWFuYWdlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgX19leHRlbmRzKFJlc291cmNlTWFuYWdlciwgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gUmVzb3VyY2VNYW5hZ2VyKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZXNvdXJjZU1hbmFnZXIucHJvdG90eXBlLCBcInJlc291cmNlR3JvdXBcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFJlc291cmNlR3JvdXA7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUmVzb3VyY2VNYW5hZ2VyLnByb3RvdHlwZSwgXCJyZXNvdXJjZUxvYWRlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wUmVzb3VyY2VMb2FkZXI7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChudWxsID09IHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZXR0aW5nIHJlc291cmNlIGxvYWRlciBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTG9hZGVyID0gdmFsdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFJlc291cmNlTWFuYWdlci5wcm90b3R5cGUsIFwicHJpb3JpdHlcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDcwO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFJlc291cmNlTWFuYWdlci5wcm90b3R5cGUuaGFzQXNzZXQgPSBmdW5jdGlvbiAoYXNzZXROYW1lKSB7XG4gICAgICAgICAgICBpZiAoIWFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUmVzb3VyY2VMb2FkZXIuaGFzQXNzZXQoYXNzZXROYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnByb3RvdHlwZS5sb2FkQXNzZXQgPSBmdW5jdGlvbiAoYXNzZXROYW1lLCBhc3NldFR5cGUsIHByaW9yaXR5LCBsb2FkQXNzZXRDYWxsYmFja3MsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoIWFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCFsb2FkQXNzZXRDYWxsYmFja3MpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTG9hZCBhc3NldCBjYWxsYmFja3MgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTG9hZGVyLmxvYWRBc3NldChhc3NldE5hbWUsIGFzc2V0VHlwZSwgcHJpb3JpdHksIGxvYWRBc3NldENhbGxiYWNrcywgdXNlckRhdGEpO1xuICAgICAgICB9O1xuICAgICAgICBSZXNvdXJjZU1hbmFnZXIucHJvdG90eXBlLnVubG9hZEFzc2V0ID0gZnVuY3Rpb24gKGFzc2V0KSB7XG4gICAgICAgICAgICBpZiAoIWFzc2V0KVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzc2V0IGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BSZXNvdXJjZUxvYWRlcilcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTG9hZGVyLnVubG9hZEFzc2V0KGFzc2V0KTtcbiAgICAgICAgfTtcbiAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnByb3RvdHlwZS5sb2FkU2NlbmUgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUsIHByaW9yaXR5LCBsb2FkU2NlbmVDYWxsYmFja3MsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoIXNjZW5lQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjZW5lIGFzc2V0IG5hbWUgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAoIWxvYWRTY2VuZUNhbGxiYWNrcylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2FkIHNjZW5lIGFzc2V0IGNhbGxiYWNrcyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VMb2FkZXIubG9hZFNjZW5lKHNjZW5lQXNzZXROYW1lLCBwcmlvcml0eSwgbG9hZFNjZW5lQ2FsbGJhY2tzLCB1c2VyRGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIFJlc291cmNlTWFuYWdlci5wcm90b3R5cGUudW5sb2FkU2NlbmUgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUsIHVubG9hZFNjZW5lQ2FsbGJhY2tzLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKCFzY2VuZUFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCF1bmxvYWRTY2VuZUNhbGxiYWNrcylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmxvYWQgc2NlbmUgY2FsbGJhY2tzIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZUxvYWRlci51bmxvYWRTY2VuZShzY2VuZUFzc2V0TmFtZSwgdW5sb2FkU2NlbmVDYWxsYmFja3MsIHVzZXJEYXRhKTtcbiAgICAgICAgfTtcbiAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnByb3RvdHlwZS5oYXNSZXNvdXJjZUdyb3VwID0gZnVuY3Rpb24gKHJlc291cmNlR3JvdXBOYW1lKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcFJlc291cmNlTG9hZGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZUxvYWRlci51cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBSZXNvdXJjZU1hbmFnZXIucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wUmVzb3VyY2VMb2FkZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTG9hZGVyLnNodXRkb3duKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBSZXNvdXJjZU1hbmFnZXI7XG4gICAgfShCYXNlXzEuRnJhbWV3b3JrTW9kdWxlKSk7IC8vIGNsYXNzIFJlc291cmNlTWFuYWdlclxuICAgIGV4cG9ydHMuUmVzb3VyY2VNYW5hZ2VyID0gUmVzb3VyY2VNYW5hZ2VyO1xufSk7XG4iLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbnZhciBfX3ZhbHVlcyA9ICh0aGlzICYmIHRoaXMuX192YWx1ZXMpIHx8IGZ1bmN0aW9uKG8pIHtcbiAgICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xufTtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICB2YXIgU2NlbmVNYW5hZ2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICBfX2V4dGVuZHMoU2NlbmVNYW5hZ2VyLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBTY2VuZU1hbmFnZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRlZFNjZW5lQXNzZXROYW1lcyA9IFtdO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZGluZ1NjZW5lQXNzZXROYW1lcyA9IFtdO1xuICAgICAgICAgICAgX3RoaXMubV9wVW5sb2FkaW5nU2NlbmVBc3NldE5hbWVzID0gW107XG4gICAgICAgICAgICBfdGhpcy5tX3BMb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZFNjZW5lRmFpbHVyZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRTY2VuZVVwZGF0ZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRTY2VuZURlcGVuZGVuY3lBc3NldERlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcFVubG9hZFNjZW5lU3VjY2Vzc0RlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcFVubG9hZFNjZW5lRmFpbHVyZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRTY2VuZUNhbGxiYWNrcyA9IHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBfdGhpcy5vbkxvYWRTY2VuZVN1Y2Nlc3MuYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgZmFpbHVyZTogX3RoaXMub25Mb2FkU2NlbmVGYWlsdXJlLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIHVwZGF0ZTogX3RoaXMub25Mb2FkU2NlbmVVcGRhdGUuYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgZGVwZW5kZW5jeTogX3RoaXMub25Mb2FkU2NlbmVEZXBlbmRlbmN5QXNzZXQuYmluZChfdGhpcylcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBfdGhpcy5tX3BVbmxvYWRTY2VuZUNhbGxiYWNrcyA9IHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBfdGhpcy5vblVubG9hZFNjZW5lU3VjY2Vzcy5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICBmYWlsdXJlOiBfdGhpcy5vblVubG9hZFNjZW5lRmFpbHVyZS5iaW5kKF90aGlzKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU2NlbmVNYW5hZ2VyLnByb3RvdHlwZSwgXCJwcmlvcml0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gNjA7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNjZW5lTWFuYWdlci5wcm90b3R5cGUsIFwibG9hZFNjZW5lU3VjY2Vzc1wiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BMb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNjZW5lTWFuYWdlci5wcm90b3R5cGUsIFwibG9hZFNjZW5lRmFpbHVyZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BMb2FkU2NlbmVGYWlsdXJlRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNjZW5lTWFuYWdlci5wcm90b3R5cGUsIFwibG9hZFNjZW5lVXBkYXRlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcExvYWRTY2VuZVVwZGF0ZURlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTY2VuZU1hbmFnZXIucHJvdG90eXBlLCBcImxvYWRTY2VuZURlcGVuZGVuY3lBc3NldFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BMb2FkU2NlbmVEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU2NlbmVNYW5hZ2VyLnByb3RvdHlwZSwgXCJ1bmxvYWRTY2VuZVN1Y2Nlc3NcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wVW5sb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNjZW5lTWFuYWdlci5wcm90b3R5cGUsIFwidW5sb2FkU2NlbmVGYWlsdXJlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFVubG9hZFNjZW5lRmFpbHVyZURlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTY2VuZU1hbmFnZXIucHJvdG90eXBlLCBcInJlc291cmNlTWFuYWdlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlciA9IHZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUuc2NlbmVJc0xvYWRpbmcgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUpIHtcbiAgICAgICAgICAgIGlmICghc2NlbmVBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgbmFtZSBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHJldHVybiBzY2VuZUFzc2V0TmFtZSBpbiB0aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXM7XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUuc2NlbmVJc0xvYWRlZCA9IGZ1bmN0aW9uIChzY2VuZUFzc2V0TmFtZSkge1xuICAgICAgICAgICAgaWYgKCFzY2VuZUFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHNjZW5lQXNzZXROYW1lIGluIHRoaXMubV9wTG9hZGVkU2NlbmVBc3NldE5hbWVzO1xuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLnNjZW5lSXNVbmxvYWRpbmcgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUpIHtcbiAgICAgICAgICAgIGlmICghc2NlbmVBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgbmFtZSBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHJldHVybiBzY2VuZUFzc2V0TmFtZSBpbiB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcztcbiAgICAgICAgfTtcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnByb3RvdHlwZS5nZXRMb2FkZWRTY2VuZUFzc2V0TmFtZXMgPSBmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMgfHwgW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubV9wTG9hZGVkU2NlbmVBc3NldE5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMubV9wTG9hZGVkU2NlbmVBc3NldE5hbWVzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLmdldExvYWRpbmdTY2VuZUFzc2V0TmFtZXMgPSBmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMgfHwgW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubV9wTG9hZGluZ1NjZW5lQXNzZXROYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUuZ2V0VW5sb2FkaW5nU2NlbmVBc3NldE5hbWVzID0gZnVuY3Rpb24gKHJlc3VsdHMpIHtcbiAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzIHx8IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfTtcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnByb3RvdHlwZS5sb2FkU2NlbmUgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUsIHByaW9yaXR5LCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKCFzY2VuZUFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1fcFJlc291cmNlTWFuYWdlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgcmVzb3VyY2UgbWFuYWdlciBmaXJzdC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5zY2VuZUlzVW5sb2FkaW5nKHNjZW5lQXNzZXROYW1lKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCAnXCIgKyBzY2VuZUFzc2V0TmFtZSArIFwiJyBpcyBiZWluZyB1bmxvYWRlZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5zY2VuZUlzTG9hZGluZyhzY2VuZUFzc2V0TmFtZSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgJ1wiICsgc2NlbmVBc3NldE5hbWUgKyBcIicgaXMgYmVpbmcgbG9hZGVkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnNjZW5lSXNMb2FkZWQoc2NlbmVBc3NldE5hbWUpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjZW5lIGFzc2V0ICdcIiArIHNjZW5lQXNzZXROYW1lICsgXCInIGlzIGFscmVhZHkgbG9hZGVkLlwiKTtcbiAgICAgICAgICAgIHRoaXMubV9wTG9hZGluZ1NjZW5lQXNzZXROYW1lcy5wdXNoKHNjZW5lQXNzZXROYW1lKTtcbiAgICAgICAgICAgIHZhciB2X2lQcmlvcml0eSA9IDA7XG4gICAgICAgICAgICB2YXIgdl9wVXNlckRhdGE7XG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAyKSB7XG4gICAgICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2YgcHJpb3JpdHkpXG4gICAgICAgICAgICAgICAgICAgIHZfaVByaW9yaXR5ID0gcHJpb3JpdHk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB2X3BVc2VyRGF0YSA9IHByaW9yaXR5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAzKSB7XG4gICAgICAgICAgICAgICAgdl9pUHJpb3JpdHkgPSBwcmlvcml0eTtcbiAgICAgICAgICAgICAgICB2X3BVc2VyRGF0YSA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIubG9hZFNjZW5lKHNjZW5lQXNzZXROYW1lLCB2X2lQcmlvcml0eSwgdGhpcy5tX3BMb2FkU2NlbmVDYWxsYmFja3MsIHZfcFVzZXJEYXRhKTtcbiAgICAgICAgfTtcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnByb3RvdHlwZS51bmxvYWRTY2VuZSA9IGZ1bmN0aW9uIChzY2VuZUFzc2V0TmFtZSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGlmICghc2NlbmVBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgbmFtZSBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IHJlc291cmNlIG1hbmFnZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2NlbmVJc1VubG9hZGluZyhzY2VuZUFzc2V0TmFtZSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgJ1wiICsgc2NlbmVBc3NldE5hbWUgKyBcIicgaXMgYmVpbmcgdW5sb2FkZWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2NlbmVJc0xvYWRpbmcoc2NlbmVBc3NldE5hbWUpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjZW5lIGFzc2V0ICdcIiArIHNjZW5lQXNzZXROYW1lICsgXCInIGlzIGJlaW5nIGxvYWRlZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5zY2VuZUlzTG9hZGVkKHNjZW5lQXNzZXROYW1lKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCAnXCIgKyBzY2VuZUFzc2V0TmFtZSArIFwiJyBpcyBhbHJlYWR5IGxvYWRlZC5cIik7XG4gICAgICAgICAgICB1c2VyRGF0YSA9IHVzZXJEYXRhIHx8IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcy5wdXNoKHNjZW5lQXNzZXROYW1lKTtcbiAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyLnVubG9hZFNjZW5lKHNjZW5lQXNzZXROYW1lLCB0aGlzLm1fcFVubG9hZFNjZW5lQ2FsbGJhY2tzLCB1c2VyRGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICAvLyBOT09QLlxuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfMSwgX2E7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BMb2FkZWRTY2VuZUFzc2V0TmFtZXMpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzTmFtZSA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zY2VuZUlzVW5sb2FkaW5nKHNOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy51bmxvYWRTY2VuZShzTmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMV8xKSB7IGVfMSA9IHsgZXJyb3I6IGVfMV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3BMb2FkZWRTY2VuZUFzc2V0TmFtZXMuc3BsaWNlKDAsIHRoaXMubV9wTG9hZGVkU2NlbmVBc3NldE5hbWVzLmxlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXMuc3BsaWNlKDAsIHRoaXMubV9wTG9hZGluZ1NjZW5lQXNzZXROYW1lcy5sZW5ndGgpO1xuICAgICAgICAgICAgdGhpcy5tX3BVbmxvYWRpbmdTY2VuZUFzc2V0TmFtZXMuc3BsaWNlKDAsIHRoaXMubV9wVW5sb2FkaW5nU2NlbmVBc3NldE5hbWVzLmxlbmd0aCk7XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUub25Mb2FkU2NlbmVTdWNjZXNzID0gZnVuY3Rpb24gKHNjZW5lQXNzZXROYW1lLCBkdXJhdGlvbiwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X0lkeDtcbiAgICAgICAgICAgIGlmICgodl9JZHggPSB0aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXMuaW5kZXhPZihzY2VuZUFzc2V0TmFtZSkpID49IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXMuc3BsaWNlKHZfSWR4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgodl9JZHggPSB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcy5pbmRleE9mKHNjZW5lQXNzZXROYW1lKSkgPj0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wVW5sb2FkaW5nU2NlbmVBc3NldE5hbWVzLnNwbGljZSh2X0lkeCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcExvYWRlZFNjZW5lQXNzZXROYW1lcy5wdXNoKHNjZW5lQXNzZXROYW1lKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWRTY2VuZVN1Y2Nlc3NEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHNjZW5lQXNzZXROYW1lLCBkdXJhdGlvbiwgdXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLm9uTG9hZFNjZW5lRmFpbHVyZSA9IGZ1bmN0aW9uIChzY2VuZUFzc2V0TmFtZSwgc3RhdHVzLCBlcnJvck1lc3NhZ2UsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9JZHg7XG4gICAgICAgICAgICBpZiAoKHZfSWR4ID0gdGhpcy5tX3BMb2FkaW5nU2NlbmVBc3NldE5hbWVzLmluZGV4T2Yoc2NlbmVBc3NldE5hbWUpKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkaW5nU2NlbmVBc3NldE5hbWVzLnNwbGljZSh2X0lkeCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkU2NlbmVGYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZFNjZW5lRmFpbHVyZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihzY2VuZUFzc2V0TmFtZSwgZXJyb3JNZXNzYWdlLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUub25Mb2FkU2NlbmVVcGRhdGUgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUsIHByb2dyZXNzLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wTG9hZFNjZW5lVXBkYXRlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZFNjZW5lVXBkYXRlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHNjZW5lQXNzZXROYW1lLCBwcm9ncmVzcywgdXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLm9uTG9hZFNjZW5lRGVwZW5kZW5jeUFzc2V0ID0gZnVuY3Rpb24gKHNjZW5lQXNzZXROYW1lLCBkZXBlbmRlbmN5QXNzZXROYW1lLCBsb2FkZWRDb3VudCwgdG90YWxDb3VudCwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWRTY2VuZURlcGVuZGVuY3lBc3NldERlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRTY2VuZURlcGVuZGVuY3lBc3NldERlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihzY2VuZUFzc2V0TmFtZSwgZGVwZW5kZW5jeUFzc2V0TmFtZSwgbG9hZGVkQ291bnQsIHRvdGFsQ291bnQsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnByb3RvdHlwZS5vblVubG9hZFNjZW5lU3VjY2VzcyA9IGZ1bmN0aW9uIChzY2VuZUFzc2V0TmFtZSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X0lkeDtcbiAgICAgICAgICAgIGlmICgodl9JZHggPSB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcy5pbmRleE9mKHNjZW5lQXNzZXROYW1lKSkgPj0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wVW5sb2FkaW5nU2NlbmVBc3NldE5hbWVzLnNwbGljZSh2X0lkeCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoKHZfSWR4ID0gdGhpcy5tX3BMb2FkZWRTY2VuZUFzc2V0TmFtZXMuaW5kZXhPZihzY2VuZUFzc2V0TmFtZSkpID49IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRlZFNjZW5lQXNzZXROYW1lcy5zcGxpY2Uodl9JZHgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubV9wVW5sb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wVW5sb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHNjZW5lQXNzZXROYW1lLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUub25VbmxvYWRTY2VuZUZhaWx1cmUgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9JZHg7XG4gICAgICAgICAgICBpZiAoKHZfSWR4ID0gdGhpcy5tX3BVbmxvYWRpbmdTY2VuZUFzc2V0TmFtZXMuaW5kZXhPZihzY2VuZUFzc2V0TmFtZSkpID49IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcy5zcGxpY2Uodl9JZHgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubV9wVW5sb2FkU2NlbmVGYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wVW5sb2FkU2NlbmVGYWlsdXJlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHNjZW5lQXNzZXROYW1lLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBTY2VuZU1hbmFnZXI7XG4gICAgfShCYXNlXzEuRnJhbWV3b3JrTW9kdWxlKSk7IC8vIGNsYXNzIFNjZW5lTWFuYWdlclxuICAgIGV4cG9ydHMuU2NlbmVNYW5hZ2VyID0gU2NlbmVNYW5hZ2VyO1xufSk7XG4iLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICAvKipcbiAgICAgKiBTZXR0aW5nIGNvbmZpZ3VyZWQgbWFuYWdlbWVudC5cbiAgICAgKi9cbiAgICB2YXIgU2V0dGluZ01hbmFnZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhTZXR0aW5nTWFuYWdlciwgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gU2V0dGluZ01hbmFnZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgICAgICAgICAgIF90aGlzLm1fcFNldHRpbmdIZWxwZXIgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTZXR0aW5nTWFuYWdlci5wcm90b3R5cGUsIFwic2V0dGluZ0hlbHBlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU2V0dGluZ0hlbHBlcjsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG51bGwgPT0gdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU2V0dGluZyBoZWxwZXIgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFNldHRpbmdIZWxwZXIgPSB2YWx1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBTZXR0aW5nTWFuYWdlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldHRpbmdIZWxwZXIubG9hZCgpO1xuICAgICAgICB9O1xuICAgICAgICBTZXR0aW5nTWFuYWdlci5wcm90b3R5cGUuc2F2ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldHRpbmdIZWxwZXIuc2F2ZSgpO1xuICAgICAgICB9O1xuICAgICAgICBTZXR0aW5nTWFuYWdlci5wcm90b3R5cGUuaGFzU2V0dGluZyA9IGZ1bmN0aW9uIChzZXR0aW5nTmFtZSkge1xuICAgICAgICAgICAgaWYgKCFzZXR0aW5nTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NldHRpbmcgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0dGluZ0hlbHBlci5oYXNTZXR0aW5nKHNldHRpbmdOYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgU2V0dGluZ01hbmFnZXIucHJvdG90eXBlLnJlbW92ZVNldHRpbmcgPSBmdW5jdGlvbiAoc2V0dGluZ05hbWUpIHtcbiAgICAgICAgICAgIGlmICghc2V0dGluZ05hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXR0aW5nIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldHRpbmdIZWxwZXIucmVtb3ZlU2V0dGluZyhzZXR0aW5nTmFtZSk7XG4gICAgICAgIH07XG4gICAgICAgIFNldHRpbmdNYW5hZ2VyLnByb3RvdHlwZS5yZW1vdmVBbGxTZXR0aW5ncyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ0hlbHBlci5yZW1vdmVBbGxTZXR0aW5ncygpO1xuICAgICAgICB9O1xuICAgICAgICBTZXR0aW5nTWFuYWdlci5wcm90b3R5cGUuZ2V0Qm9vbGVhbiA9IGZ1bmN0aW9uIChzZXR0aW5nTmFtZSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIXNldHRpbmdOYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU2V0dGluZyBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBkZWZhdWx0VmFsdWUgPSBkZWZhdWx0VmFsdWUgfHwgZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXR0aW5nSGVscGVyLmdldEJvb2xlYW4oc2V0dGluZ05hbWUsIGRlZmF1bHRWYWx1ZSk7XG4gICAgICAgIH07XG4gICAgICAgIFNldHRpbmdNYW5hZ2VyLnByb3RvdHlwZS5zZXRCb29sZWFuID0gZnVuY3Rpb24gKHNldHRpbmdOYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKCFzZXR0aW5nTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NldHRpbmcgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdGhpcy5zZXR0aW5nSGVscGVyLnNldEJvb2xlYW4oc2V0dGluZ05hbWUsIHZhbHVlKTtcbiAgICAgICAgfTtcbiAgICAgICAgU2V0dGluZ01hbmFnZXIucHJvdG90eXBlLmdldEludGVnZXIgPSBmdW5jdGlvbiAoc2V0dGluZ05hbWUsIGRlZmF1bHRWYWx1ZSkge1xuICAgICAgICAgICAgaWYgKCFzZXR0aW5nTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NldHRpbmcgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgZGVmYXVsdFZhbHVlID0gZGVmYXVsdFZhbHVlIHx8IDA7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXR0aW5nSGVscGVyLmdldEludGVnZXIoc2V0dGluZ05hbWUsIGRlZmF1bHRWYWx1ZSk7XG4gICAgICAgIH07XG4gICAgICAgIFNldHRpbmdNYW5hZ2VyLnByb3RvdHlwZS5zZXRJbnRlZ2VyID0gZnVuY3Rpb24gKHNldHRpbmdOYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKCFzZXR0aW5nTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NldHRpbmcgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdGhpcy5zZXR0aW5nSGVscGVyLnNldEludGVnZXIoc2V0dGluZ05hbWUsIHZhbHVlKTtcbiAgICAgICAgfTtcbiAgICAgICAgU2V0dGluZ01hbmFnZXIucHJvdG90eXBlLmdldEZsb2F0ID0gZnVuY3Rpb24gKHNldHRpbmdOYW1lLCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghc2V0dGluZ05hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXR0aW5nIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZSA9IGRlZmF1bHRWYWx1ZSB8fCBOdW1iZXIuTmFOO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0dGluZ0hlbHBlci5nZXRGbG9hdChzZXR0aW5nTmFtZSwgZGVmYXVsdFZhbHVlKTtcbiAgICAgICAgfTtcbiAgICAgICAgU2V0dGluZ01hbmFnZXIucHJvdG90eXBlLnNldEZsb2F0ID0gZnVuY3Rpb24gKHNldHRpbmdOYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKCFzZXR0aW5nTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NldHRpbmcgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdGhpcy5zZXR0aW5nSGVscGVyLnNldEZsb2F0KHNldHRpbmdOYW1lLCB2YWx1ZSk7XG4gICAgICAgIH07XG4gICAgICAgIFNldHRpbmdNYW5hZ2VyLnByb3RvdHlwZS5nZXRTdHJpbmcgPSBmdW5jdGlvbiAoc2V0dGluZ05hbWUsIGRlZmF1bHRWYWx1ZSkge1xuICAgICAgICAgICAgaWYgKCFzZXR0aW5nTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NldHRpbmcgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0dGluZ0hlbHBlci5nZXRTdHJpbmcoc2V0dGluZ05hbWUpO1xuICAgICAgICB9O1xuICAgICAgICBTZXR0aW5nTWFuYWdlci5wcm90b3R5cGUuc2V0U3RyaW5nID0gZnVuY3Rpb24gKHNldHRpbmdOYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKCFzZXR0aW5nTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NldHRpbmcgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdGhpcy5zZXR0aW5nSGVscGVyLnNldFN0cmluZyhzZXR0aW5nTmFtZSwgdmFsdWUpO1xuICAgICAgICB9O1xuICAgICAgICBTZXR0aW5nTWFuYWdlci5wcm90b3R5cGUuZ2V0T2JqZWN0ID0gZnVuY3Rpb24gKHR5cGUsIHNldHRpbmdOYW1lLCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghdHlwZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09iamVjdCB0eXBlIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBpZiAoIXNldHRpbmdOYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU2V0dGluZyBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXR0aW5nSGVscGVyLmdldE9iamVjdCh0eXBlLCBzZXR0aW5nTmFtZSwgZGVmYXVsdFZhbHVlIHx8IG51bGwpO1xuICAgICAgICB9O1xuICAgICAgICBTZXR0aW5nTWFuYWdlci5wcm90b3R5cGUuc2V0T2JqZWN0ID0gZnVuY3Rpb24gKHNldHRpbmdOYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKCFzZXR0aW5nTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NldHRpbmcgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdGhpcy5zZXR0aW5nSGVscGVyLnNldE9iamVjdChzZXR0aW5nTmFtZSwgdmFsdWUpO1xuICAgICAgICB9O1xuICAgICAgICBTZXR0aW5nTWFuYWdlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICAvLyBOT09QLlxuICAgICAgICB9O1xuICAgICAgICBTZXR0aW5nTWFuYWdlci5wcm90b3R5cGUuc2h1dGRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBOT09QLlxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gU2V0dGluZ01hbmFnZXI7XG4gICAgfShCYXNlXzEuRnJhbWV3b3JrTW9kdWxlKSk7IC8vIGNsYXNzIFNldHRpbmdNYW5hZ2VyXG4gICAgZXhwb3J0cy5TZXR0aW5nTWFuYWdlciA9IFNldHRpbmdNYW5hZ2VyO1xufSk7XG4iLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbnZhciBfX3ZhbHVlcyA9ICh0aGlzICYmIHRoaXMuX192YWx1ZXMpIHx8IGZ1bmN0aW9uKG8pIHtcbiAgICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xufTtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICB2YXIgQ29uc3RhbnQ7XG4gICAgKGZ1bmN0aW9uIChDb25zdGFudCkge1xuICAgICAgICBDb25zdGFudC5EZWZhdWx0VGltZSA9IDA7XG4gICAgICAgIENvbnN0YW50LkRlZmF1bHRNdXRlID0gZmFsc2U7XG4gICAgICAgIENvbnN0YW50LkRlZmF1bHRMb29wID0gZmFsc2U7XG4gICAgICAgIENvbnN0YW50LkRlZmF1bHRQcmlvcml0eSA9IDA7XG4gICAgICAgIENvbnN0YW50LkRlZmF1bHRWb2x1bWUgPSAxO1xuICAgICAgICBDb25zdGFudC5EZWZhdWx0RmFkZUluU2Vjb25kcyA9IDA7XG4gICAgICAgIENvbnN0YW50LkRlZmF1bHRGYWRlT3V0U2Vjb25kcyA9IDA7XG4gICAgICAgIENvbnN0YW50LkRlZmF1bHRQaXRjaCA9IDE7XG4gICAgICAgIENvbnN0YW50LkRlZmF1bHRQYW5TdGVyZW8gPSAwO1xuICAgICAgICBDb25zdGFudC5EZWZhdWx0U3BhdGlhbEJsZW5kID0gMDtcbiAgICAgICAgQ29uc3RhbnQuRGVmYXVsdE1heERpc3RhbmNlID0gMTAwO1xuICAgICAgICBDb25zdGFudC5EZWZhdWx0RG9wcGxlckxldmVsID0gMTtcbiAgICB9KShDb25zdGFudCA9IGV4cG9ydHMuQ29uc3RhbnQgfHwgKGV4cG9ydHMuQ29uc3RhbnQgPSB7fSkpOyAvLyBuYW1lc3BhY2UgQ29uc3RhbnRcbiAgICB2YXIgU291bmRBZ2VudCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gU291bmRBZ2VudChzb3VuZEdyb3VwLCBzb3VuZEhlbHBlciwgc291bmRBZ2VudEhlbHBlcikge1xuICAgICAgICAgICAgaWYgKCFzb3VuZEdyb3VwKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNvdW5kIGdyb3VwIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCFzb3VuZEhlbHBlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTb3VuZCBoZWxwZXIgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAoIXNvdW5kQWdlbnRIZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU291bmQgYWdlbnQgaGVscGVyIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEdyb3VwID0gc291bmRHcm91cDtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRIZWxwZXIgPSBzb3VuZEhlbHBlcjtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRBZ2VudEhlbHBlciA9IHNvdW5kQWdlbnRIZWxwZXI7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIucmVzZXRTb3VuZEFnZW50LmFkZCh0aGlzLm9uUmVzZXRTb3VuZEFnZW50LCB0aGlzKTtcbiAgICAgICAgICAgIHRoaXMubV9pU2VyaWFsSWQgPSAwO1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEFzc2V0ID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwic291bmRHcm91cFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU291bmRHcm91cDsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJzZXJpYWxJZFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9pU2VyaWFsSWQ7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1faVNlcmlhbElkID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwiaXNQbGF5aW5nXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLmlzUGxheWluZzsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJsZW5ndGhcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIubGVuZ3RoOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kQWdlbnQucHJvdG90eXBlLCBcInRpbWVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIudGltZTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9wU291bmRBZ2VudEhlbHBlci50aW1lID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwibXV0ZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5tdXRlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kQWdlbnQucHJvdG90eXBlLCBcIm11dGVJblNvdW5kR3JvdXBcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fYk11dGVJblNvdW5kR3JvdXA7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9iTXV0ZUluU291bmRHcm91cCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaE11dGUoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwibG9vcFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5sb29wOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLmxvb3AgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJwcmlvcml0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5wcmlvcml0eTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5wcmlvcml0eSA9IHZhbHVlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kQWdlbnQucHJvdG90eXBlLCBcInZvbHVtZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci52b2x1bWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwidm9sdW1lSW5Tb3VuZEdyb3VwXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX2ZWb2x1bWVJblNvdW5kR3JvdXA7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9mVm9sdW1lSW5Tb3VuZEdyb3VwID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoVm9sdW1lKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kQWdlbnQucHJvdG90eXBlLCBcInBpdGNoXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnBpdGNoOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnBpdGNoID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwicGFuU3RlcmVvXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnBhblN0ZXJlbzsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5wYW5TdGVyZW8gPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJzcGF0aWFsQmxlbmRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIuc3BhdGlhbEJsZW5kOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnNwYXRpYWxCbGVuZCA9IHZhbHVlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kQWdlbnQucHJvdG90eXBlLCBcIm1heERpc3RhbmNlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLm1heERpc3RhbmNlOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLm1heERpc3RhbmNlID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwiZG9wcGxlckxldmVsXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLmRvcHBsZXJMZXZlbDsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5kb3BwbGVyTGV2ZWwgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJoZWxwZXJcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXI7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwic2V0U291bmRBc3NldFRpbWVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fZlNldFNvdW5kQXNzZXRUaW1lOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgU291bmRBZ2VudC5wcm90b3R5cGUucGxheSA9IGZ1bmN0aW9uIChmYWRlSW5TZWNvbmRzKSB7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIucGxheShmYWRlSW5TZWNvbmRzIHx8IENvbnN0YW50LkRlZmF1bHRGYWRlSW5TZWNvbmRzKTtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRBZ2VudC5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uIChmYWRlT3V0U2Vjb25kcykge1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnN0b3AoZmFkZU91dFNlY29uZHMgfHwgQ29uc3RhbnQuRGVmYXVsdEZhZGVPdXRTZWNvbmRzKTtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRBZ2VudC5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbiAoZmFkZU91dFNlY29uZHMpIHtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5wYXVzZShmYWRlT3V0U2Vjb25kcyB8fCBDb25zdGFudC5EZWZhdWx0RmFkZU91dFNlY29uZHMpO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZEFnZW50LnByb3RvdHlwZS5yZXN1bWUgPSBmdW5jdGlvbiAoZmFkZUluU2Vjb25kcykge1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnJlc3VtZShmYWRlSW5TZWNvbmRzIHx8IENvbnN0YW50LkRlZmF1bHRGYWRlSW5TZWNvbmRzKTtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRBZ2VudC5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BTb3VuZEFzc2V0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEhlbHBlci5yZWxlYXNlU291bmRBc3NldCh0aGlzLm1fcFNvdW5kQXNzZXQpO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wU291bmRBc3NldCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fZlNldFNvdW5kQXNzZXRUaW1lID0gTmFOO1xuICAgICAgICAgICAgdGhpcy50aW1lID0gQ29uc3RhbnQuRGVmYXVsdFRpbWU7XG4gICAgICAgICAgICB0aGlzLm11dGVJblNvdW5kR3JvdXAgPSBDb25zdGFudC5EZWZhdWx0TXV0ZTtcbiAgICAgICAgICAgIHRoaXMubG9vcCA9IENvbnN0YW50LkRlZmF1bHRMb29wO1xuICAgICAgICAgICAgdGhpcy5wcmlvcml0eSA9IENvbnN0YW50LkRlZmF1bHRQcmlvcml0eTtcbiAgICAgICAgICAgIHRoaXMudm9sdW1lSW5Tb3VuZEdyb3VwID0gQ29uc3RhbnQuRGVmYXVsdFZvbHVtZTtcbiAgICAgICAgICAgIHRoaXMucGl0Y2ggPSBDb25zdGFudC5EZWZhdWx0UGl0Y2g7XG4gICAgICAgICAgICB0aGlzLnBhblN0ZXJlbyA9IENvbnN0YW50LkRlZmF1bHRQYW5TdGVyZW87XG4gICAgICAgICAgICB0aGlzLnNwYXRpYWxCbGVuZCA9IENvbnN0YW50LkRlZmF1bHRTcGF0aWFsQmxlbmQ7XG4gICAgICAgICAgICB0aGlzLm1heERpc3RhbmNlID0gQ29uc3RhbnQuRGVmYXVsdE1heERpc3RhbmNlO1xuICAgICAgICAgICAgdGhpcy5kb3BwbGVyTGV2ZWwgPSBDb25zdGFudC5EZWZhdWx0RG9wcGxlckxldmVsO1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnJlc2V0KCk7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kQWdlbnQucHJvdG90eXBlLnNldFNvdW5kQXNzZXQgPSBmdW5jdGlvbiAoc291bmRBc3NldCkge1xuICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEFzc2V0ID0gc291bmRBc3NldDtcbiAgICAgICAgICAgIHRoaXMubV9mU2V0U291bmRBc3NldFRpbWUgPSBuZXcgRGF0ZSgpLnZhbHVlT2YoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIuc2V0U291bmRBc3NldChzb3VuZEFzc2V0KTtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRBZ2VudC5wcm90b3R5cGUucmVmcmVzaE11dGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIubXV0ZSA9IHRoaXMubV9wU291bmRHcm91cC5tdXRlIHx8IHRoaXMubV9iTXV0ZUluU291bmRHcm91cDtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRBZ2VudC5wcm90b3R5cGUucmVmcmVzaFZvbHVtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci52b2x1bWUgPSB0aGlzLm1fcFNvdW5kR3JvdXAudm9sdW1lIHx8IHRoaXMubV9mVm9sdW1lSW5Tb3VuZEdyb3VwO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZEFnZW50LnByb3RvdHlwZS5vblJlc2V0U291bmRBZ2VudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFNvdW5kQWdlbnQ7XG4gICAgfSgpKTsgLy8gY2xhc3MgU291bmRBZ2VudFxuICAgIGV4cG9ydHMuU291bmRBZ2VudCA9IFNvdW5kQWdlbnQ7XG4gICAgdmFyIFBsYXlTb3VuZEVycm9yQ29kZTtcbiAgICAoZnVuY3Rpb24gKFBsYXlTb3VuZEVycm9yQ29kZSkge1xuICAgICAgICBQbGF5U291bmRFcnJvckNvZGVbUGxheVNvdW5kRXJyb3JDb2RlW1wiVW5rbm93blwiXSA9IDBdID0gXCJVbmtub3duXCI7XG4gICAgICAgIFBsYXlTb3VuZEVycm9yQ29kZVtQbGF5U291bmRFcnJvckNvZGVbXCJTb3VuZEdyb3VwTm90RXhpc3RcIl0gPSAxXSA9IFwiU291bmRHcm91cE5vdEV4aXN0XCI7XG4gICAgICAgIFBsYXlTb3VuZEVycm9yQ29kZVtQbGF5U291bmRFcnJvckNvZGVbXCJTb3VuZEdyb3VwSGFzTm9BZ2VudFwiXSA9IDJdID0gXCJTb3VuZEdyb3VwSGFzTm9BZ2VudFwiO1xuICAgICAgICBQbGF5U291bmRFcnJvckNvZGVbUGxheVNvdW5kRXJyb3JDb2RlW1wiTG9hZEFzc2V0RmFpbHVyZVwiXSA9IDNdID0gXCJMb2FkQXNzZXRGYWlsdXJlXCI7XG4gICAgICAgIFBsYXlTb3VuZEVycm9yQ29kZVtQbGF5U291bmRFcnJvckNvZGVbXCJJZ25vcmVEdWVUb0xvd1ByaW9yaXR5XCJdID0gNF0gPSBcIklnbm9yZUR1ZVRvTG93UHJpb3JpdHlcIjtcbiAgICAgICAgUGxheVNvdW5kRXJyb3JDb2RlW1BsYXlTb3VuZEVycm9yQ29kZVtcIlNldFNvdW5kQXNzZXRGYWlsdXJlXCJdID0gNV0gPSBcIlNldFNvdW5kQXNzZXRGYWlsdXJlXCI7XG4gICAgfSkoUGxheVNvdW5kRXJyb3JDb2RlID0gZXhwb3J0cy5QbGF5U291bmRFcnJvckNvZGUgfHwgKGV4cG9ydHMuUGxheVNvdW5kRXJyb3JDb2RlID0ge30pKTsgLy8gZW51bSBQbGF5U291bmRFcnJvckNvZGVcbiAgICBleHBvcnRzLkRlZmF1bHRQbGF5U291bmRQYXJhbXMgPSB7XG4gICAgICAgIHRpbWU6IDAsXG4gICAgICAgIG11dGVJblNvdW5kR3JvdXA6IGZhbHNlLFxuICAgICAgICBsb29wOiBmYWxzZSxcbiAgICAgICAgcHJpb3JpdHk6IDAsXG4gICAgICAgIHZvbHVtZUluU291bmRHcm91cDogMSxcbiAgICAgICAgZmFkZUluU2Vjb25kczogMCxcbiAgICAgICAgcGl0Y2g6IDAsXG4gICAgICAgIHBhblN0ZXJlbzogMCxcbiAgICAgICAgc3BhdGlhbEJsZW5kOiAwLFxuICAgICAgICBtYXhEaXN0YW5jZTogMCxcbiAgICAgICAgZG9wcGxlckxldmVsOiAwLFxuICAgICAgICByZWZlcmVuY2VkOiBmYWxzZVxuICAgIH07IC8vIERlZmF1bHRQbGF5U291bmRQYXJhbXNcbiAgICB2YXIgU291bmRHcm91cCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gU291bmRHcm91cChuYW1lLCBzb3VuZEdyb3VwSGVscGVyKSB7XG4gICAgICAgICAgICB0aGlzLm1fYkF2b2lkQmVpbmdSZXBsYWNlZEJ5U2FtZVByaW9yaXR5ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm1fYk11dGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubV9mVm9sdW1lID0gMTtcbiAgICAgICAgICAgIGlmICghbmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTb3VuZCBncm91cCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCFzb3VuZEdyb3VwSGVscGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNvdW5kIGdyb3VwIGhlbHBlciBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHRoaXMubV9zTmFtZSA9IG5hbWU7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kR3JvdXBIZWxwZXIgPSBzb3VuZEdyb3VwSGVscGVyO1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEFnZW50cyA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEdyb3VwLnByb3RvdHlwZSwgXCJuYW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3NOYW1lOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kR3JvdXAucHJvdG90eXBlLCBcInNvdW5kQWdlbnRDb3VudFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BTb3VuZEFnZW50cy5sZW5ndGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kR3JvdXAucHJvdG90eXBlLCBcImF2b2lkQmVpbmdSZXBsYWNlZEJ5U2FtZVByaW9yaXR5XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX2JBdm9pZEJlaW5nUmVwbGFjZWRCeVNhbWVQcmlvcml0eTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX2JBdm9pZEJlaW5nUmVwbGFjZWRCeVNhbWVQcmlvcml0eSA9IHZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEdyb3VwLnByb3RvdHlwZSwgXCJtdXRlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX2JNdXRlOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZV8xLCBfYTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fYk11dGUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRBZ2VudHMpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWdlbnQgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50LnJlZnJlc2hNdXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVfMV8xKSB7IGVfMSA9IHsgZXJyb3I6IGVfMV8xIH07IH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEdyb3VwLnByb3RvdHlwZSwgXCJ2b2x1bWVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fZlZvbHVtZTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVfMiwgX2E7XG4gICAgICAgICAgICAgICAgdGhpcy5tX2ZWb2x1bWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRBZ2VudHMpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWdlbnQgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50LnJlZnJlc2hWb2x1bWUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV8yXzEpIHsgZV8yID0geyBlcnJvcjogZV8yXzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8yKSB0aHJvdyBlXzIuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kR3JvdXAucHJvdG90eXBlLCBcImhlbHBlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU291bmRHcm91cEhlbHBlcjsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFNvdW5kR3JvdXAucHJvdG90eXBlLmFkZFNvdW5kQWdlbnRIZWxwZXIgPSBmdW5jdGlvbiAoc291bmRIZWxwZXIsIHNvdW5kQWdlbnRIZWxwZXIpIHtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRBZ2VudHMucHVzaChuZXcgU291bmRBZ2VudCh0aGlzLCBzb3VuZEhlbHBlciwgc291bmRBZ2VudEhlbHBlcikpO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZEdyb3VwLnByb3RvdHlwZS5wbGF5U291bmQgPSBmdW5jdGlvbiAoc2VyaWFsSWQsIHNvdW5kQXNzZXQsIHBsYXlTb3VuZFBhcmFtcywgZXJyb3JDb2RlKSB7XG4gICAgICAgICAgICB2YXIgZV8zLCBfYTtcbiAgICAgICAgICAgIGVycm9yQ29kZSA9IGVycm9yQ29kZSB8fCB7IGNvZGU6IDAgfTtcbiAgICAgICAgICAgIHZhciB2X3BDYW5kaWRhdGVBZ2VudDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFNvdW5kQWdlbnRzKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc291bmRBZ2VudCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXNvdW5kQWdlbnQuaXNQbGF5aW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudCA9IHNvdW5kQWdlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoc291bmRBZ2VudC5wcmlvcml0eSA8IHBsYXlTb3VuZFBhcmFtcy5wcmlvcml0eSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF2X3BDYW5kaWRhdGVBZ2VudCB8fCBzb3VuZEFnZW50LnByaW9yaXR5IDwgdl9wQ2FuZGlkYXRlQWdlbnQucHJpb3JpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudCA9IHNvdW5kQWdlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoIXRoaXMubV9iQXZvaWRCZWluZ1JlcGxhY2VkQnlTYW1lUHJpb3JpdHkgJiYgc291bmRBZ2VudC5wcmlvcml0eSA9PSBwbGF5U291bmRQYXJhbXMucHJpb3JpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdl9wQ2FuZGlkYXRlQWdlbnQgfHwgc291bmRBZ2VudC5zZXRTb3VuZEFzc2V0VGltZSA8IHZfcENhbmRpZGF0ZUFnZW50LnNldFNvdW5kQXNzZXRUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdl9wQ2FuZGlkYXRlQWdlbnQgPSBzb3VuZEFnZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfM18xKSB7IGVfMyA9IHsgZXJyb3I6IGVfM18xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzMpIHRocm93IGVfMy5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF2X3BDYW5kaWRhdGVBZ2VudCkge1xuICAgICAgICAgICAgICAgIGVycm9yQ29kZS5jb2RlID0gUGxheVNvdW5kRXJyb3JDb2RlLklnbm9yZUR1ZVRvTG93UHJpb3JpdHk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXZfcENhbmRpZGF0ZUFnZW50LnNldFNvdW5kQXNzZXQoc291bmRBc3NldCkpIHtcbiAgICAgICAgICAgICAgICBlcnJvckNvZGUuY29kZSA9IFBsYXlTb3VuZEVycm9yQ29kZS5TZXRTb3VuZEFzc2V0RmFpbHVyZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50LnNlcmlhbElkID0gc2VyaWFsSWQ7XG4gICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudC50aW1lID0gcGxheVNvdW5kUGFyYW1zLnRpbWU7XG4gICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudC5tdXRlSW5Tb3VuZEdyb3VwID0gcGxheVNvdW5kUGFyYW1zLm11dGVJblNvdW5kR3JvdXA7XG4gICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudC5sb29wID0gcGxheVNvdW5kUGFyYW1zLmxvb3A7XG4gICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudC5wcmlvcml0eSA9IHBsYXlTb3VuZFBhcmFtcy5wcmlvcml0eTtcbiAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50LnZvbHVtZUluU291bmRHcm91cCA9IHBsYXlTb3VuZFBhcmFtcy52b2x1bWVJblNvdW5kR3JvdXA7XG4gICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudC5waXRjaCA9IHBsYXlTb3VuZFBhcmFtcy5waXRjaDtcbiAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50LnBhblN0ZXJlbyA9IHBsYXlTb3VuZFBhcmFtcy5wYW5TdGVyZW87XG4gICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudC5zcGF0aWFsQmxlbmQgPSBwbGF5U291bmRQYXJhbXMuc3BhdGlhbEJsZW5kO1xuICAgICAgICAgICAgdl9wQ2FuZGlkYXRlQWdlbnQubWF4RGlzdGFuY2UgPSBwbGF5U291bmRQYXJhbXMubWF4RGlzdGFuY2U7XG4gICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudC5kb3BwbGVyTGV2ZWwgPSBwbGF5U291bmRQYXJhbXMuZG9wcGxlckxldmVsO1xuICAgICAgICAgICAgdl9wQ2FuZGlkYXRlQWdlbnQucGxheShwbGF5U291bmRQYXJhbXMuZmFkZUluU2Vjb25kcyk7XG4gICAgICAgICAgICByZXR1cm4gdl9wQ2FuZGlkYXRlQWdlbnQ7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kR3JvdXAucHJvdG90eXBlLnN0b3BTb3VuZCA9IGZ1bmN0aW9uIChzZXJpYWxJZCwgZmFkZU91dFNlY29uZHMpIHtcbiAgICAgICAgICAgIHZhciBlXzQsIF9hO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRBZ2VudHMpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3VuZEFnZW50ID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VuZEFnZW50LnNlcmlhbElkICE9IHNlcmlhbElkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzb3VuZEFnZW50LnN0b3AoZmFkZU91dFNlY29uZHMpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV80XzEpIHsgZV80ID0geyBlcnJvcjogZV80XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNCkgdGhyb3cgZV80LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kR3JvdXAucHJvdG90eXBlLnBhdXNlU291bmQgPSBmdW5jdGlvbiAoc2VyaWFsSWQsIGZhZGVPdXRTZWNvbmRzKSB7XG4gICAgICAgICAgICB2YXIgZV81LCBfYTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFNvdW5kQWdlbnRzKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc291bmRBZ2VudCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc291bmRBZ2VudC5zZXJpYWxJZCAhPSBzZXJpYWxJZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICBzb3VuZEFnZW50LnBhdXNlKGZhZGVPdXRTZWNvbmRzKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfNV8xKSB7IGVfNSA9IHsgZXJyb3I6IGVfNV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzUpIHRocm93IGVfNS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZEdyb3VwLnByb3RvdHlwZS5yZXN1bWVTb3VuZCA9IGZ1bmN0aW9uIChzZXJpYWxJZCwgZmFkZUluU2Vjb25kcykge1xuICAgICAgICAgICAgdmFyIGVfNiwgX2E7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BTb3VuZEFnZW50cyksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNvdW5kQWdlbnQgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNvdW5kQWdlbnQuc2VyaWFsSWQgIT0gc2VyaWFsSWQpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgc291bmRBZ2VudC5yZXN1bWUoZmFkZUluU2Vjb25kcyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzZfMSkgeyBlXzYgPSB7IGVycm9yOiBlXzZfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV82KSB0aHJvdyBlXzYuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRHcm91cC5wcm90b3R5cGUuc3RvcEFsbExvYWRlZFNvdW5kcyA9IGZ1bmN0aW9uIChmYWRlT3V0U2Vjb25kcykge1xuICAgICAgICAgICAgdmFyIGVfNywgX2E7XG4gICAgICAgICAgICBmYWRlT3V0U2Vjb25kcyA9IGZhZGVPdXRTZWNvbmRzIHx8IENvbnN0YW50LkRlZmF1bHRGYWRlT3V0U2Vjb25kcztcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFNvdW5kQWdlbnRzKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc291bmRBZ2VudCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc291bmRBZ2VudC5pc1BsYXlpbmcpXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VuZEFnZW50LnN0b3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV83XzEpIHsgZV83ID0geyBlcnJvcjogZV83XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNykgdGhyb3cgZV83LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBTb3VuZEdyb3VwO1xuICAgIH0oKSk7IC8vIGNsYXNzIFNvdW5kR3JvdXBcbiAgICBleHBvcnRzLlNvdW5kR3JvdXAgPSBTb3VuZEdyb3VwO1xuICAgIHZhciBTb3VuZE1hbmFnZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhTb3VuZE1hbmFnZXIsIF9zdXBlcik7XG4gICAgICAgIGZ1bmN0aW9uIFNvdW5kTWFuYWdlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICAgICAgX3RoaXMubV9wU291bmRHcm91cHMgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BTb3VuZHNCZWluZ0xvYWRlZCA9IG5ldyBTZXQoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcFNvdW5kc1RvUmVsZWFzZU9uTG9hZCA9IG5ldyBTZXQoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRBc3NldENhbGxiYWNrcyA9IHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBfdGhpcy5vbkxvYWRTb3VuZFN1Y2Nlc3NDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICBmYWlsdXJlOiBfdGhpcy5vbkxvYWRTb3VuZEZhaWx1cmVDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICB1cGRhdGU6IF90aGlzLm9uTG9hZFNvdW5kVXBkYXRlQ2FsbGJhY2suYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgZGVwZW5kZW5jeTogX3RoaXMub25Mb2FkU291bmREZXBlbmRlbmN5QXNzZXRDYWxsYmFjay5iaW5kKF90aGlzKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIF90aGlzLm1faVNlcmlhbCA9IDA7XG4gICAgICAgICAgICBfdGhpcy5tX3BQbGF5U291bmRTdWNjZXNzRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wUGxheVNvdW5kRmFpbHVyZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcFBsYXlTb3VuZFVwZGF0ZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcFBsYXlTb3VuZERlcGVuZGVuY3lBc3NldERlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRNYW5hZ2VyLnByb3RvdHlwZSwgXCJzb3VuZEdyb3VwQ291bnRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wU291bmRHcm91cHMuc2l6ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRNYW5hZ2VyLnByb3RvdHlwZSwgXCJwbGF5U291bmRTdWNjZXNzXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFBsYXlTb3VuZFN1Y2Nlc3NEZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRNYW5hZ2VyLnByb3RvdHlwZSwgXCJwbGF5U291bmRGYWlsdXJlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFBsYXlTb3VuZEZhaWx1cmVEZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRNYW5hZ2VyLnByb3RvdHlwZSwgXCJwbGF5U291bmRVcGRhdGVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUGxheVNvdW5kVXBkYXRlRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kTWFuYWdlci5wcm90b3R5cGUsIFwicGxheVNvdW5kRGVwZW5kZW5jeUFzc2V0XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFBsYXlTb3VuZERlcGVuZGVuY3lBc3NldERlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICAvLyBOT09QLlxuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5zdG9wQWxsTG9hZGVkU291bmRzKCk7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kR3JvdXBzLmNsZWFyKCk7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kc0JlaW5nTG9hZGVkLmNsZWFyKCk7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kc1RvUmVsZWFzZU9uTG9hZC5jbGVhcigpO1xuICAgICAgICB9O1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRNYW5hZ2VyLnByb3RvdHlwZSwgXCJyZXNvdXJjZU1hbmFnZXJcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFJlc291cmNlTWFuYWdlcjsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRNYW5hZ2VyLnByb3RvdHlwZSwgXCJzb3VuZEhlbHBlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU291bmRIZWxwZXI7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1fcFNvdW5kSGVscGVyID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLmhhc1NvdW5kR3JvdXAgPSBmdW5jdGlvbiAoc291bmRHcm91cE5hbWUpIHtcbiAgICAgICAgICAgIGlmICghc291bmRHcm91cE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU291bmQgZ3JvdXAgbmFtZSBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFNvdW5kR3JvdXBzLmhhcyhzb3VuZEdyb3VwTmFtZSk7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUuZ2V0U291bmRHcm91cCA9IGZ1bmN0aW9uIChzb3VuZEdyb3VwTmFtZSkge1xuICAgICAgICAgICAgaWYgKCFzb3VuZEdyb3VwTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTb3VuZCBncm91cCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wU291bmRHcm91cHMuZ2V0KHNvdW5kR3JvdXBOYW1lKSB8fCBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLmdldEFsbFNvdW5kR3JvdXBzID0gZnVuY3Rpb24gKHJlc3VsdHMpIHtcbiAgICAgICAgICAgIHZhciBlXzgsIF9hO1xuICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMgfHwgW107XG4gICAgICAgICAgICBpZiAocmVzdWx0cy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgIHJlc3VsdHMuc3BsaWNlKDAsIHJlc3VsdHMubGVuZ3RoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFNvdW5kR3JvdXBzLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc291bmRHcm91cCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goc291bmRHcm91cCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfOF8xKSB7IGVfOCA9IHsgZXJyb3I6IGVfOF8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzgpIHRocm93IGVfOC5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUuYWRkU291bmRHcm91cCA9IGZ1bmN0aW9uIChzb3VuZEdyb3VwTmFtZSwgYW55QXJnLCBzb3VuZEdyb3VwTXV0ZSwgc291bmRHcm91cFZvbHVtZSwgc291bmRHcm91cEhlbHBlcikge1xuICAgICAgICAgICAgaWYgKCFzb3VuZEdyb3VwTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTb3VuZCBncm91cCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgdmFyIHNvdW5kR3JvdXBBdm9pZEJlaW5nUmVwbGFjZWRCeVNhbWVQcmlvcml0eSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKCdib29sZWFuJyA9PT0gdHlwZW9mIGFueUFyZykge1xuICAgICAgICAgICAgICAgIHNvdW5kR3JvdXBBdm9pZEJlaW5nUmVwbGFjZWRCeVNhbWVQcmlvcml0eSA9IGFueUFyZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNvdW5kR3JvdXBIZWxwZXIgPSBhbnlBcmc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzb3VuZEdyb3VwTXV0ZSA9IHNvdW5kR3JvdXBNdXRlIHx8IENvbnN0YW50LkRlZmF1bHRNdXRlO1xuICAgICAgICAgICAgc291bmRHcm91cFZvbHVtZSA9IHNvdW5kR3JvdXBWb2x1bWUgfHwgQ29uc3RhbnQuRGVmYXVsdFZvbHVtZTtcbiAgICAgICAgICAgIGlmICghc291bmRHcm91cEhlbHBlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTb3VuZCBncm91cCBoZWxwZXIgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5oYXNTb3VuZEdyb3VwKHNvdW5kR3JvdXBOYW1lKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB2YXIgdl9wU291bmRHcm91cCA9IG5ldyBTb3VuZEdyb3VwKHNvdW5kR3JvdXBOYW1lLCBzb3VuZEdyb3VwSGVscGVyKTtcbiAgICAgICAgICAgIHZfcFNvdW5kR3JvdXAuYXZvaWRCZWluZ1JlcGxhY2VkQnlTYW1lUHJpb3JpdHkgPSBzb3VuZEdyb3VwQXZvaWRCZWluZ1JlcGxhY2VkQnlTYW1lUHJpb3JpdHk7XG4gICAgICAgICAgICB2X3BTb3VuZEdyb3VwLm11dGUgPSBzb3VuZEdyb3VwTXV0ZTtcbiAgICAgICAgICAgIHZfcFNvdW5kR3JvdXAudm9sdW1lID0gc291bmRHcm91cFZvbHVtZTtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRHcm91cHMuc2V0KHNvdW5kR3JvdXBOYW1lLCB2X3BTb3VuZEdyb3VwKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLmFkZFNvdW5kQWdlbnRIZWxwZXIgPSBmdW5jdGlvbiAoc291bmRHcm91cE5hbWUsIHNvdW5kQWdlbnRIZWxwZXIpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BTb3VuZEhlbHBlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgc291bmQgaGVscGVyIGZpcnN0LlwiKTtcbiAgICAgICAgICAgIHZhciB2X3BTb3VuZEdyb3VwID0gdGhpcy5nZXRTb3VuZEdyb3VwKHNvdW5kR3JvdXBOYW1lKTtcbiAgICAgICAgICAgIGlmICghdl9wU291bmRHcm91cClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTb3VuZCBncm91cCAnXCIgKyBzb3VuZEdyb3VwTmFtZSArIFwiJyBpcyBub3QgZXhpc3QuXCIpO1xuICAgICAgICAgICAgdl9wU291bmRHcm91cC5hZGRTb3VuZEFnZW50SGVscGVyKHRoaXMubV9wU291bmRIZWxwZXIsIHNvdW5kQWdlbnRIZWxwZXIpO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLmdldEFsbExvYWRpbmdTb3VuZFNlcmlhbElkcyA9IGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgICAgICB2YXIgdl9wUmV0ID0gcmVzdWx0cyB8fCBbXTtcbiAgICAgICAgICAgIHZfcFJldC5zcGxpY2UoMCwgdl9wUmV0Lmxlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kc0JlaW5nTG9hZGVkLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICB2X3BSZXQucHVzaCh2KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHZfcFJldDtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRNYW5hZ2VyLnByb3RvdHlwZS5pc0xvYWRpbmdTb3VuZCA9IGZ1bmN0aW9uIChzZXJpYWxJZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wU291bmRzQmVpbmdMb2FkZWQuaGFzKHNlcmlhbElkKTtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRNYW5hZ2VyLnByb3RvdHlwZS5wbGF5U291bmQgPSBmdW5jdGlvbiAoc291bmRBc3NldE5hbWUsIHNvdW5kR3JvdXBOYW1lLCBhbnlBcmcxLCBhbnlBcmcyLCBhbnlBcmczKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IHNldCByZXNvdXJjZSBtYW5hZ2VyIGZpcnN0LlwiKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BTb3VuZEhlbHBlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgc291bmQgaGVscGVyIGZpcnN0LlwiKTtcbiAgICAgICAgICAgIHZhciBwcmlvcml0eSA9IENvbnN0YW50LkRlZmF1bHRQcmlvcml0eTtcbiAgICAgICAgICAgIHZhciBwbGF5U291bmRQYXJhbXMgPSBudWxsO1xuICAgICAgICAgICAgdmFyIHVzZXJEYXRhID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIGFueUFyZzEpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJpb3JpdHkgPSBhbnlBcmcxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh1bmRlZmluZWQgIT0gYW55QXJnMSkge1xuICAgICAgICAgICAgICAgICAgICBwbGF5U291bmRQYXJhbXMgPSBhbnlBcmcxO1xuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YSA9IGFueUFyZzE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheVNvdW5kUGFyYW1zID0gYW55QXJnMjtcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGEgPSBhbnlBcmcyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDUpIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheVNvdW5kUGFyYW1zID0gYW55QXJnMjtcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGEgPSBhbnlBcmczO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2X2lTZXJpYWxJZCA9IHRoaXMubV9pU2VyaWFsKys7XG4gICAgICAgICAgICB2YXIgdl9wRXJyb3JDb2RlO1xuICAgICAgICAgICAgdmFyIHZfc0Vycm9yTWVzc2FnZTtcbiAgICAgICAgICAgIHZhciB2X3BTb3VuZEdyb3VwID0gdGhpcy5nZXRTb3VuZEdyb3VwKHNvdW5kR3JvdXBOYW1lKTtcbiAgICAgICAgICAgIGlmICghdl9wU291bmRHcm91cCkge1xuICAgICAgICAgICAgICAgIHZfcEVycm9yQ29kZSA9IFBsYXlTb3VuZEVycm9yQ29kZS5Tb3VuZEdyb3VwTm90RXhpc3Q7XG4gICAgICAgICAgICAgICAgdl9zRXJyb3JNZXNzYWdlID0gXCJTb3VuZCBncm91cCAnXCIgKyBzb3VuZEdyb3VwTmFtZSArIFwiJyBpcyBub3QgZXhpc3QuXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh2X3BTb3VuZEdyb3VwLnNvdW5kQWdlbnRDb3VudCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgdl9wRXJyb3JDb2RlID0gUGxheVNvdW5kRXJyb3JDb2RlLlNvdW5kR3JvdXBIYXNOb0FnZW50O1xuICAgICAgICAgICAgICAgIHZfc0Vycm9yTWVzc2FnZSA9IFwiU291bmQgZ3JvdXAgJ1wiICsgc291bmRHcm91cE5hbWUgKyBcIicgaXMgaGF2ZSBubyBzb3VuZCBhZ2VudC5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh2X3BFcnJvckNvZGUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tX3BQbGF5U291bmRGYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcFBsYXlTb3VuZEZhaWx1cmVEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHZfaVNlcmlhbElkLCBzb3VuZEFzc2V0TmFtZSwgc291bmRHcm91cE5hbWUsIHBsYXlTb3VuZFBhcmFtcywgdl9wRXJyb3JDb2RlLCB2X3NFcnJvck1lc3NhZ2UsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2X2lTZXJpYWxJZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHZfc0Vycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kc0JlaW5nTG9hZGVkLmFkZCh2X2lTZXJpYWxJZCk7XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlci5sb2FkQXNzZXQoc291bmRBc3NldE5hbWUsIHByaW9yaXR5LCB0aGlzLm1fcExvYWRBc3NldENhbGxiYWNrcywge1xuICAgICAgICAgICAgICAgIHNlcmlhbElkOiB2X2lTZXJpYWxJZCxcbiAgICAgICAgICAgICAgICBzb3VuZEdyb3VwOiB2X3BTb3VuZEdyb3VwLFxuICAgICAgICAgICAgICAgIHBsYXlTb3VuZFBhcmFtczogcGxheVNvdW5kUGFyYW1zLFxuICAgICAgICAgICAgICAgIHVzZXJEYXRhOiB1c2VyRGF0YVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdl9pU2VyaWFsSWQ7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUuc3RvcFNvdW5kID0gZnVuY3Rpb24gKHNlcmlhbElkLCBmYWRlT3V0U2Vjb25kcykge1xuICAgICAgICAgICAgdmFyIGVfOSwgX2E7XG4gICAgICAgICAgICBmYWRlT3V0U2Vjb25kcyA9IGZhZGVPdXRTZWNvbmRzIHx8IENvbnN0YW50LkRlZmF1bHRGYWRlT3V0U2Vjb25kcztcbiAgICAgICAgICAgIGlmICh0aGlzLmlzTG9hZGluZ1NvdW5kKHNlcmlhbElkKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wU291bmRzVG9SZWxlYXNlT25Mb2FkLmFkZChzZXJpYWxJZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BTb3VuZHNCZWluZ0xvYWRlZC5kZWxldGUoc2VyaWFsSWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRHcm91cHMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3VuZEdyb3VwID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VuZEdyb3VwLnN0b3BTb3VuZChzZXJpYWxJZCwgZmFkZU91dFNlY29uZHMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzlfMSkgeyBlXzkgPSB7IGVycm9yOiBlXzlfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV85KSB0aHJvdyBlXzkuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRNYW5hZ2VyLnByb3RvdHlwZS5zdG9wQWxsTG9hZGVkU291bmRzID0gZnVuY3Rpb24gKGZhZGVPdXRTZWNvbmRzKSB7XG4gICAgICAgICAgICB2YXIgZV8xMCwgX2E7XG4gICAgICAgICAgICBmYWRlT3V0U2Vjb25kcyA9IGZhZGVPdXRTZWNvbmRzIHx8IENvbnN0YW50LkRlZmF1bHRGYWRlT3V0U2Vjb25kcztcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFNvdW5kR3JvdXBzLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc291bmRHcm91cCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBzb3VuZEdyb3VwLnN0b3BBbGxMb2FkZWRTb3VuZHMoZmFkZU91dFNlY29uZHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzEwXzEpIHsgZV8xMCA9IHsgZXJyb3I6IGVfMTBfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xMCkgdGhyb3cgZV8xMC5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLnN0b3BBbGxMb2FkaW5nU291bmRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfMTEsIF9hO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRzQmVpbmdMb2FkZWQudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZXJpYWxJZCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcFNvdW5kc1RvUmVsZWFzZU9uTG9hZC5hZGQoc2VyaWFsSWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzExXzEpIHsgZV8xMSA9IHsgZXJyb3I6IGVfMTFfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xMSkgdGhyb3cgZV8xMS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLnBhdXNlU291bmQgPSBmdW5jdGlvbiAoc2VyaWFsSWQsIGZhZGVPdXRTZWNvbmRzKSB7XG4gICAgICAgICAgICB2YXIgZV8xMiwgX2E7XG4gICAgICAgICAgICBmYWRlT3V0U2Vjb25kcyA9IGZhZGVPdXRTZWNvbmRzIHx8IENvbnN0YW50LkRlZmF1bHRGYWRlT3V0U2Vjb25kcztcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFNvdW5kR3JvdXBzLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc291bmRHcm91cCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc291bmRHcm91cC5wYXVzZVNvdW5kKHNlcmlhbElkLCBmYWRlT3V0U2Vjb25kcykpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMTJfMSkgeyBlXzEyID0geyBlcnJvcjogZV8xMl8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEyKSB0aHJvdyBlXzEyLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGZpbmQgc291bmQgJ1wiICsgc2VyaWFsSWQgKyBcIicuXCIpO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLnJlc3VtZVNvdW5kID0gZnVuY3Rpb24gKHNlcmlhbElkLCBmYWRlSW5TZWNvbmRzKSB7XG4gICAgICAgICAgICB2YXIgZV8xMywgX2E7XG4gICAgICAgICAgICBmYWRlSW5TZWNvbmRzID0gZmFkZUluU2Vjb25kcyB8fCBDb25zdGFudC5EZWZhdWx0RmFkZUluU2Vjb25kcztcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFNvdW5kR3JvdXBzLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc291bmRHcm91cCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc291bmRHcm91cC5yZXN1bWVTb3VuZChzZXJpYWxJZCwgZmFkZUluU2Vjb25kcykpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMTNfMSkgeyBlXzEzID0geyBlcnJvcjogZV8xM18xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEzKSB0aHJvdyBlXzEzLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGZpbmQgc291bmQgJ1wiICsgc2VyaWFsSWQgKyBcIicuXCIpO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLm9uTG9hZFNvdW5kU3VjY2Vzc0NhbGxiYWNrID0gZnVuY3Rpb24gKHNvdW5kQXNzZXROYW1lLCBzb3VuZEFzc2V0LCBkdXJhdGlvbiwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAoIXZfcEluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGxheSBzb3VuZCBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wU291bmRzVG9SZWxlYXNlT25Mb2FkLmhhcyh2X3BJbmZvLnNlcmlhbElkKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wU291bmRzVG9SZWxlYXNlT25Mb2FkLmRlbGV0ZSh2X3BJbmZvLnNlcmlhbElkKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kc0JlaW5nTG9hZGVkLmRlbGV0ZSh2X3BJbmZvLnNlcmlhbElkKTtcbiAgICAgICAgICAgIHZhciB2X3BFcnJvckNvZGVPdXQgPSB7IGNvZGU6IDAgfTtcbiAgICAgICAgICAgIHZhciB2X3BTb3VuZEFnZW50ID0gdl9wSW5mby5zb3VuZEdyb3VwLnBsYXlTb3VuZCh2X3BJbmZvLnNlcmlhbElkLCBzb3VuZEFzc2V0LCB2X3BJbmZvLnBsYXlTb3VuZFBhcmFtcywgdl9wRXJyb3JDb2RlT3V0KTtcbiAgICAgICAgICAgIGlmICh2X3BTb3VuZEFnZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubV9wUGxheVNvdW5kU3VjY2Vzc0RlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BQbGF5U291bmRTdWNjZXNzRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEluZm8pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbih2X3BJbmZvLnNlcmlhbElkLCBzb3VuZEFzc2V0TmFtZSwgdl9wU291bmRBZ2VudCwgZHVyYXRpb24sIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZHNUb1JlbGVhc2VPbkxvYWQuZGVsZXRlKHZfcEluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEhlbHBlci5yZWxlYXNlU291bmRBc3NldChzb3VuZEFzc2V0KTtcbiAgICAgICAgICAgIHZhciB2X3NFcnJvck1lc3NhZ2UgPSBcIlNvdW5kIGdyb3VwICdcIiArIHZfcEluZm8uc291bmRHcm91cC5uYW1lICsgXCInIHBsYXkgc291bmQgJ1wiICsgc291bmRBc3NldE5hbWUgKyBcIicgZmFpbHVyZS5cIjtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcFBsYXlTb3VuZEZhaWx1cmVEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BQbGF5U291bmRGYWlsdXJlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAodl9wSW5mbylcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4odl9wSW5mby5zZXJpYWxJZCwgc291bmRBc3NldE5hbWUsIHZfcEluZm8uc291bmRHcm91cC5uYW1lLCB2X3BJbmZvLnBsYXlTb3VuZFBhcmFtcywgdl9wRXJyb3JDb2RlT3V0LmNvZGUsIHZfc0Vycm9yTWVzc2FnZSwgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Iodl9zRXJyb3JNZXNzYWdlKTtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRNYW5hZ2VyLnByb3RvdHlwZS5vbkxvYWRTb3VuZEZhaWx1cmVDYWxsYmFjayA9IGZ1bmN0aW9uIChzb3VuZEFzc2V0TmFtZSwgc3RhdHVzLCBlcnJvck1lc3NhZ2UsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKCF2X3BJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBsYXkgc291bmQgaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcFNvdW5kc1RvUmVsZWFzZU9uTG9hZC5oYXModl9wSW5mby5zZXJpYWxJZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFNvdW5kc1RvUmVsZWFzZU9uTG9hZC5kZWxldGUodl9wSW5mby5zZXJpYWxJZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZHNCZWluZ0xvYWRlZC5kZWxldGUodl9wSW5mby5zZXJpYWxJZCk7XG4gICAgICAgICAgICB2YXIgdl9zRXJyb3JNZXNzYWdlID0gXCJMb2FkIHNvdW5kIGZhaWx1cmUsIGFzc2V0IG5hbWUgJ1wiICsgc291bmRBc3NldE5hbWUgKyBcIicsIHN0YXR1cyAnXCIgKyBzdGF0dXMgKyBcIicsIGVycm9yIG1lc3NhZ2UgJ1wiICsgZXJyb3JNZXNzYWdlICsgXCInXCI7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BQbGF5U291bmRGYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wUGxheVNvdW5kRmFpbHVyZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEluZm8pXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHZfcEluZm8uc2VyaWFsSWQsIHNvdW5kQXNzZXROYW1lLCB2X3BJbmZvLnNvdW5kR3JvdXAubmFtZSwgdl9wSW5mby5wbGF5U291bmRQYXJhbXMsIFBsYXlTb3VuZEVycm9yQ29kZS5Mb2FkQXNzZXRGYWlsdXJlLCB2X3NFcnJvck1lc3NhZ2UsIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih2X3NFcnJvck1lc3NhZ2UpO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLm9uTG9hZFNvdW5kVXBkYXRlQ2FsbGJhY2sgPSBmdW5jdGlvbiAoc291bmRBc3NldE5hbWUsIHByb2dyZXNzLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmICghdl9wSW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQbGF5IHNvdW5kIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BQbGF5U291bmRVcGRhdGVEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BQbGF5U291bmRVcGRhdGVEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2X3BJbmZvKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbih2X3BJbmZvLnNlcmlhbElkLCBzb3VuZEFzc2V0TmFtZSwgdl9wSW5mby5zb3VuZEdyb3VwLm5hbWUsIHZfcEluZm8ucGxheVNvdW5kUGFyYW1zLCBwcm9ncmVzcywgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUub25Mb2FkU291bmREZXBlbmRlbmN5QXNzZXRDYWxsYmFjayA9IGZ1bmN0aW9uIChzb3VuZEFzc2V0TmFtZSwgZGVwZW5kZW5jeUFzc2V0TmFtZSwgbG9hZGVkQ291bnQsIHRvdGFsQ291bnQsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKCF2X3BJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBsYXkgc291bmQgaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcFBsYXlTb3VuZERlcGVuZGVuY3lBc3NldERlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFBsYXlTb3VuZERlcGVuZGVuY3lBc3NldERlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEluZm8pXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHZfcEluZm8uc2VyaWFsSWQsIHNvdW5kQXNzZXROYW1lLCB2X3BJbmZvLnNvdW5kR3JvdXAubmFtZSwgdl9wSW5mby5wbGF5U291bmRQYXJhbXMsIGRlcGVuZGVuY3lBc3NldE5hbWUsIGxvYWRlZENvdW50LCB0b3RhbENvdW50LCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFNvdW5kTWFuYWdlcjtcbiAgICB9KEJhc2VfMS5GcmFtZXdvcmtNb2R1bGUpKTsgLy8gY2xhc3MgU291bmRNYW5hZ2VyXG4gICAgZXhwb3J0cy5Tb3VuZE1hbmFnZXIgPSBTb3VuZE1hbmFnZXI7XG59KTtcbiIsInZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgICAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xudmFyIF9fdmFsdWVzID0gKHRoaXMgJiYgdGhpcy5fX3ZhbHVlcykgfHwgZnVuY3Rpb24obykge1xuICAgIHZhciBzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciwgbSA9IHMgJiYgb1tzXSwgaSA9IDA7XG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xuICAgICAgICB9XG4gICAgfTtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XG59O1xuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIiwgXCIuL0Jhc2VcIiwgXCIuL09iamVjdFBvb2xcIl0sIGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIHZhciBCYXNlXzEgPSByZXF1aXJlKFwiLi9CYXNlXCIpO1xuICAgIHZhciBPYmplY3RQb29sXzEgPSByZXF1aXJlKFwiLi9PYmplY3RQb29sXCIpO1xuICAgIHZhciBVSU1hbmFnZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhVSU1hbmFnZXIsIF9zdXBlcik7XG4gICAgICAgIGZ1bmN0aW9uIFVJTWFuYWdlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICAgICAgX3RoaXMubV9yVUlHcm91cHMgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBfdGhpcy5tX2lTZXJpYWxJZCA9IDA7XG4gICAgICAgICAgICBfdGhpcy5tX2JJc1NodXRkb3duID0gZmFsc2U7XG4gICAgICAgICAgICBfdGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3JVSUZvcm1zVG9SZWxlYXNlT25Mb2FkID0gbmV3IFNldCgpO1xuICAgICAgICAgICAgX3RoaXMubV9wUmVjeWNsZVF1ZXVlID0gW107XG4gICAgICAgICAgICBfdGhpcy5tX3BMb2FkQXNzZXRDYWxsYmFja3MgPSB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogX3RoaXMubG9hZFVJRm9ybVN1Y2Nlc3NDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICBmYWlsdXJlOiBfdGhpcy5sb2FkVUlGb3JtRmFpbHVyZUNhbGxiYWNrLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIHVwZGF0ZTogX3RoaXMubG9hZFVJRm9ybVVwZGF0ZUNhbGxiYWNrLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIGRlcGVuZGVuY3k6IF90aGlzLmxvYWRVSUZvcm1EZXBlbmRlbmN5QXNzZXRDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBfdGhpcy5tX3BPcGVuVUlGb3JtU3VjY2Vzc0RlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcE9wZW5VSUZvcm1GYWlsdXJlRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wT3BlblVJRm9ybVVwZGF0ZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcE9wZW5VSUZvcm1EZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BDbG9zZVVJRm9ybUNvbXBsZXRlRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9mSW5zdGFuY2VBdXRvUmVsZWFzZUludGVydmFsID0gMDtcbiAgICAgICAgICAgIF90aGlzLm1fdUluc3RhbmNlQ2FwYWNpdHkgPSAwO1xuICAgICAgICAgICAgX3RoaXMubV9mSW5zdGFuY2VFeHBpcmVUaW1lID0gMDtcbiAgICAgICAgICAgIF90aGlzLm1faUluc3RhbmNlUHJpb3JpdHkgPSAwO1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgICAgICAgICAgLy8gcHJpdmF0ZSBmaXJlT3BlblVJRm9ybUNvbXBsZXRlKGVycm9yOiBFcnJvciwgdWlGb3JtQXNzZXROYW1lOiBzdHJpbmcsIHVpRm9ybUFzc2V0OiBvYmplY3QsIGR1cmF0aW9uOiBudW1iZXIsIGluZm86IE9wZW5VSUZvcm1JbmZvKTogdm9pZCB7XG4gICAgICAgICAgICAvLyB0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZC5kZWxldGUoaW5mby5zZXJpYWxJZCk7XG4gICAgICAgICAgICAvLyBpZiAodGhpcy5tX3JVSUZvcm1zVG9SZWxlYXNlT25Mb2FkLmhhcyhpbmZvLnNlcmlhbElkKSkge1xuICAgICAgICAgICAgLy8gdGhpcy5tX3JVSUZvcm1zVG9SZWxlYXNlT25Mb2FkLmRlbGV0ZShpbmZvLnNlcmlhbElkKTtcbiAgICAgICAgICAgIC8vIGlmICghZXJyb3IpXG4gICAgICAgICAgICAvLyB0aGlzLm1fcFVJRm9ybUhlbHBlci5yZWxlYXNlVUlGb3JtKHVpRm9ybUFzc2V0IGFzIG9iamVjdCwgbnVsbCk7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvLyBsZXQgdWlGb3JtOiBJVUlGb3JtID0gbnVsbDtcbiAgICAgICAgICAgIC8vIGlmICghZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIGxldCB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdDogVUlGb3JtSW5zdGFuY2VPYmplY3QgPSBVSUZvcm1JbnN0YW5jZU9iamVjdC5jcmVhdGUodWlGb3JtQXNzZXROYW1lLCB1aUZvcm1Bc3NldCwgdGhpcy5tX3BVSUZvcm1IZWxwZXIuaW5zdGFudGlhdGVVSUZvcm0odWlGb3JtQXNzZXQgYXMgb2JqZWN0KSwgdGhpcy5tX3BVSUZvcm1IZWxwZXIpO1xuICAgICAgICAgICAgLy8gLy8gUmVnaXN0ZXIgdG8gcG9vbCBhbmQgbWFyayBzcGF3biBmbGFnLlxuICAgICAgICAgICAgLy8gaWYgKCF0aGlzLm1fcEluc3RhbmNlUG9vbC5oYXModWlGb3JtQXNzZXROYW1lKSkge1xuICAgICAgICAgICAgLy8gdGhpcy5tX3BJbnN0YW5jZVBvb2wuc2V0KHVpRm9ybUFzc2V0TmFtZSwgW10pO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gbGV0IHZfcEluc3RhbmNlT2JqZWN0czogVUlGb3JtSW5zdGFuY2VPYmplY3RbXSA9IHRoaXMubV9wSW5zdGFuY2VQb29sLmdldCh1aUZvcm1Bc3NldE5hbWUpO1xuICAgICAgICAgICAgLy8gaWYgKHZfcEluc3RhbmNlT2JqZWN0cy5sZW5ndGggPCB0aGlzLm1fdUluc3RhbmNlQ2FwYWNpdHkpIHtcbiAgICAgICAgICAgIC8vIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LnNwYXduID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIHZfcEluc3RhbmNlT2JqZWN0cy5wdXNoKHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0KTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIC8vIHRoaXMub3BlblVJRm9ybUludGVybmFsKGluZm8uc2VyaWFsSWQsIHVpRm9ybUFzc2V0TmFtZSwgaW5mby51aUdyb3VwIGFzIFVJR3JvdXAsIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LnRhcmdldCwgaW5mby5wYXVzZUNvdmVyZWRVSUZvcm0sIHRydWUsIGR1cmF0aW9uLCBpbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBsZXQgZXZlbnRBcmdzOiBPcGVuVUlGb3JtRmFpbHVyZUV2ZW50QXJncyA9IHtcbiAgICAgICAgICAgIC8vIGVycm9yTWVzc2FnZTogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgICAgIC8vIHNlcmlhbElkOiBpbmZvLnNlcmlhbElkLFxuICAgICAgICAgICAgLy8gcGF1c2VDb3ZlcmVkVUlGb3JtOiBpbmZvLnBhdXNlQ292ZXJlZFVJRm9ybSxcbiAgICAgICAgICAgIC8vIHVpR3JvdXBOYW1lOiBpbmZvLnVpR3JvdXAubmFtZSxcbiAgICAgICAgICAgIC8vIHVpRm9ybUFzc2V0TmFtZTogdWlGb3JtQXNzZXROYW1lLFxuICAgICAgICAgICAgLy8gdXNlckRhdGE6IGluZm8udXNlckRhdGFcbiAgICAgICAgICAgIC8vIH07XG4gICAgICAgICAgICAvLyB0aGlzLm1fcE9wZW5VSUZvcm1GYWlsdXJlRGVsZWdhdGUuaXRlcigoY2FsbGJhY2tGbjogT3BlblVJRm9ybUZhaWx1cmVFdmVudEhhbmRsZXIpID0+IHtcbiAgICAgICAgICAgIC8vIGNhbGxiYWNrRm4oZXZlbnRBcmdzKTtcbiAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gcHJpdmF0ZSBmaXJlT3BlblVJRm9ybVByb2dyZXNzKHVpRm9ybUFzc2V0TmFtZTogc3RyaW5nLCBwcm9ncmVzczogbnVtYmVyLCBpbmZvOiBPcGVuVUlGb3JtSW5mbyk6IHZvaWQge1xuICAgICAgICAgICAgLy8gbGV0IGV2ZW50QXJnczogT3BlblVJRm9ybVVwZGF0ZUV2ZW50QXJncyA9IHtcbiAgICAgICAgICAgIC8vIHNlcmlhbElkOiBpbmZvLnNlcmlhbElkLFxuICAgICAgICAgICAgLy8gcGF1c2VDb3ZlcmVkVUlGb3JtOiBpbmZvLnBhdXNlQ292ZXJlZFVJRm9ybSxcbiAgICAgICAgICAgIC8vIHByb2dyZXNzOiBwcm9ncmVzcyxcbiAgICAgICAgICAgIC8vIHVpRm9ybUFzc2V0TmFtZTogdWlGb3JtQXNzZXROYW1lLFxuICAgICAgICAgICAgLy8gdWlHcm91cE5hbWU6IGluZm8udWlHcm91cC5uYW1lLFxuICAgICAgICAgICAgLy8gdXNlckRhdGE6IGluZm8udXNlckRhdGFcbiAgICAgICAgICAgIC8vIH07XG4gICAgICAgICAgICAvLyB0aGlzLm1fcE9wZW5VSUZvcm1VcGRhdGVEZWxlZ2F0ZS5pdGVyKChjYWxsYmFja0ZuOiBPcGVuVUlGb3JtVXBkYXRlRXZlbnRIYW5kbGVyKSA9PiB7XG4gICAgICAgICAgICAvLyBjYWxsYmFja0ZuKGV2ZW50QXJncyk7XG4gICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlNYW5hZ2VyLnByb3RvdHlwZSwgXCJ1aUZvcm1IZWxwZXJcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFVJRm9ybUhlbHBlcjsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGhlbHBlciBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wVUlGb3JtSGVscGVyID0gdmFsdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJTWFuYWdlci5wcm90b3R5cGUsIFwicmVzb3VyY2VNYW5hZ2VyXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFJlc291cmNlTWFuYWdlcjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChudWxsID09IHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSZXNvdXJjZSBtYW5hZ2VyIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyID0gdmFsdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJTWFuYWdlci5wcm90b3R5cGUsIFwib2JqZWN0UG9vbE1hbmFnZXJcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wT2JqZWN0UG9vbE1hbmFnZXI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAobnVsbCA9PSB2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPYmplY3RQb29sIG1hbmFnZXIgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcE9iamVjdFBvb2xNYW5hZ2VyID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BJbnN0YW5jZVBvb2wgPSB0aGlzLm1fcE9iamVjdFBvb2xNYW5hZ2VyLmNyZWF0ZVNpbmdsZVNwYXduT2JqZWN0UG9vbCh7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiVUkgSW5zdGFuY2UgUG9vbFwiXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJTWFuYWdlci5wcm90b3R5cGUsIFwidWlHcm91cENvdW50XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fclVJR3JvdXBzLnNpemU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJTWFuYWdlci5wcm90b3R5cGUsIFwib3BlblVJRm9ybVN1Y2Nlc3NcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcE9wZW5VSUZvcm1TdWNjZXNzRGVsZWdhdGU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlNYW5hZ2VyLnByb3RvdHlwZSwgXCJvcGVuVUlGb3JtRmFpbHVyZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wT3BlblVJRm9ybUZhaWx1cmVEZWxlZ2F0ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSU1hbmFnZXIucHJvdG90eXBlLCBcIm9wZW5VSUZvcm1VcGRhdGVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcE9wZW5VSUZvcm1VcGRhdGVEZWxlZ2F0ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSU1hbmFnZXIucHJvdG90eXBlLCBcIm9wZW5VSUZvcm1EZXBlbmRlbmN5QXNzZXRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcE9wZW5VSUZvcm1EZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSU1hbmFnZXIucHJvdG90eXBlLCBcImNsb3NlVUlGb3JtQ29tcGxldGVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcENsb3NlVUlGb3JtQ29tcGxldGVEZWxlZ2F0ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSU1hbmFnZXIucHJvdG90eXBlLCBcImluc3RhbmNlQXV0b1JlbGVhc2VJbnRlcnZhbFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9mSW5zdGFuY2VBdXRvUmVsZWFzZUludGVydmFsOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX2ZJbnN0YW5jZUF1dG9SZWxlYXNlSW50ZXJ2YWwgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSU1hbmFnZXIucHJvdG90eXBlLCBcImluc3RhbmNlQ2FwYWNpdHlcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fdUluc3RhbmNlQ2FwYWNpdHk7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1fdUluc3RhbmNlQ2FwYWNpdHkgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSU1hbmFnZXIucHJvdG90eXBlLCBcImluc3RhbmNlRXhwaXJlVGltZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9mSW5zdGFuY2VFeHBpcmVUaW1lOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX2ZJbnN0YW5jZUV4cGlyZVRpbWUgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSU1hbmFnZXIucHJvdG90eXBlLCBcImluc3RhbmNlUHJpb3JpdHlcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1faUluc3RhbmNlUHJpb3JpdHk7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1faUluc3RhbmNlUHJpb3JpdHkgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICB2YXIgZV8xLCBfYTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFJlY3ljbGVRdWV1ZSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHVpRm9ybSA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB1aUZvcm0ub25SZWN5Y2xlKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wSW5zdGFuY2VQb29sLnVuc3Bhd25CeVRhcmdldCh1aUZvcm0uaGFuZGxlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xXzEpIHsgZV8xID0geyBlcnJvcjogZV8xXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BSZWN5Y2xlUXVldWUubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHRoaXMubV9wUmVjeWNsZVF1ZXVlLnNwbGljZSgwLCB0aGlzLm1fcFJlY3ljbGVRdWV1ZS5sZW5ndGgpO1xuICAgICAgICAgICAgdGhpcy5tX3JVSUdyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uICh1aUdyb3VwLCBrZXkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wVWlHcm91cCA9IHVpR3JvdXA7XG4gICAgICAgICAgICAgICAgdl9wVWlHcm91cC51cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUuc2h1dGRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLm1fYklzU2h1dGRvd24gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5jbG9zZUFsbExvYWRlZFVJRm9ybXMoKTtcbiAgICAgICAgICAgIHRoaXMubV9yVUlHcm91cHMuY2xlYXIoKTtcbiAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkLmNsZWFyKCk7XG4gICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNUb1JlbGVhc2VPbkxvYWQuY2xlYXIoKTtcbiAgICAgICAgICAgIHRoaXMubV9wUmVjeWNsZVF1ZXVlLnNwbGljZSgwLCB0aGlzLm1fcFJlY3ljbGVRdWV1ZS5sZW5ndGgpO1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLm9wZW5VSUZvcm0gPSBmdW5jdGlvbiAodWlGb3JtQXNzZXROYW1lLCB1aUdyb3VwTmFtZSwgcHJpb3JpdHksIHBhdXNlQ292ZXJlZFVJRm9ybSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIC8vIGNjLmxvZyhgW1VJTWFuYWdlcl0gUmVxZXVzdCBPcGVuIFVJRm9ybSBhc3NldCAnJHt1aUZvcm1Bc3NldE5hbWV9JyB3aXRoIGdyb3VwICcke3VpR3JvdXBOYW1lfScgb24gcHJpb3JpdHkgJyR7cHJpb3JpdHl9JywgcGF1c2VDb3ZlcmVkVUlGb3JtOiAke3BhdXNlQ292ZXJlZFVJRm9ybX0sIHVzZXJEYXRhOiAke3VzZXJEYXRhfWApO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IHJlc291cmNlIG1hbmFnZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BVSUZvcm1IZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IFVJIGZvcm0gaGVscGVyIGZpcnN0LlwiKTtcbiAgICAgICAgICAgIGlmICghdWlGb3JtQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBhc3NldCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBpZiAoIXVpR3JvdXBOYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZ3JvdXAgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdmFyIHZfclVJR3JvdXAgPSB0aGlzLmdldFVJR3JvdXAodWlHcm91cE5hbWUpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9yVUlHcm91cCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVJIGdyb3VwICdcIiArIHVpR3JvdXBOYW1lICsgXCInIGlzIG5vdCBleGlzdC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdl9pU2VyaWFsSWQgPSArK3RoaXMubV9pU2VyaWFsSWQ7XG4gICAgICAgICAgICB2YXIgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QgPSB0aGlzLm1fcEluc3RhbmNlUG9vbC5zcGF3bih1aUZvcm1Bc3NldE5hbWUpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQuaGFzKHZfaVNlcmlhbElkKSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiS2V5IGR1cGxpY2F0ZWQgd2l0aDogXCIgKyB2X2lTZXJpYWxJZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQuc2V0KHZfaVNlcmlhbElkLCB1aUZvcm1Bc3NldE5hbWUpO1xuICAgICAgICAgICAgICAgIHZhciB2X3JPcGVuVWlGb3JtSW5mbyA9IHtcbiAgICAgICAgICAgICAgICAgICAgc2VyaWFsSWQ6IHZfaVNlcmlhbElkLFxuICAgICAgICAgICAgICAgICAgICB1aUdyb3VwOiB2X3JVSUdyb3VwLFxuICAgICAgICAgICAgICAgICAgICBwYXVzZUNvdmVyZWRVSUZvcm06IHBhdXNlQ292ZXJlZFVJRm9ybSxcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGE6IHVzZXJEYXRhXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlci5sb2FkQXNzZXQodWlGb3JtQXNzZXROYW1lLCBwcmlvcml0eSwgdGhpcy5tX3BMb2FkQXNzZXRDYWxsYmFja3MsIHZfck9wZW5VaUZvcm1JbmZvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMub3BlblVJRm9ybUludGVybmFsKHZfaVNlcmlhbElkLCB1aUZvcm1Bc3NldE5hbWUsIHZfclVJR3JvdXAsIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LnRhcmdldCwgcGF1c2VDb3ZlcmVkVUlGb3JtLCBmYWxzZSwgMCwgdXNlckRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZfaVNlcmlhbElkO1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmlzTG9hZGluZ1VJRm9ybSA9IGZ1bmN0aW9uIChzZXJpYWxJZE9yQXNzZXROYW1lKSB7XG4gICAgICAgICAgICB2YXIgZV8yLCBfYTtcbiAgICAgICAgICAgIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIHNlcmlhbElkT3JBc3NldE5hbWUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHVpRm9ybUFzc2V0TmFtZSA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVpRm9ybUFzc2V0TmFtZSA9PT0gc2VyaWFsSWRPckFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV8yXzEpIHsgZV8yID0geyBlcnJvcjogZV8yXzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8yKSB0aHJvdyBlXzIuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkLmhhcyhzZXJpYWxJZE9yQXNzZXROYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5nZXRVSUZvcm1zID0gZnVuY3Rpb24gKHVpRm9ybUFzc2V0TmFtZSkge1xuICAgICAgICAgICAgdmFyIGVfMywgX2E7XG4gICAgICAgICAgICB2YXIgdl9yUmV0ID0gW107XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3JVSUdyb3Vwcy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHVpR3JvdXAgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG51bGwgIT0gdWlHcm91cCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZfcEZvcm1zID0gdWlHcm91cC5nZXRVSUZvcm1zKHVpRm9ybUFzc2V0TmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2X3JSZXQgPSB2X3JSZXQuY29uY2F0KHZfcEZvcm1zKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzNfMSkgeyBlXzMgPSB7IGVycm9yOiBlXzNfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8zKSB0aHJvdyBlXzMuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2X3JSZXQ7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUuZ2V0VUlGb3JtID0gZnVuY3Rpb24gKHNlcmlhbElkT3JBc3NldE5hbWUpIHtcbiAgICAgICAgICAgIHZhciBlXzQsIF9hO1xuICAgICAgICAgICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2Ygc2VyaWFsSWRPckFzc2V0TmFtZSkge1xuICAgICAgICAgICAgICAgIGlmICghc2VyaWFsSWRPckFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGFzc2V0IG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB1aUZvcm07XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3JVSUdyb3Vwcy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHVpR3JvdXAgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCh1aUZvcm0gPSB1aUdyb3VwLmdldFVJRm9ybShzZXJpYWxJZE9yQXNzZXROYW1lKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB1aUZvcm07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV80XzEpIHsgZV80ID0geyBlcnJvcjogZV80XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNCkgdGhyb3cgZV80LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5oYXNVSUZvcm0gPSBmdW5jdGlvbiAoc2VyaWFsSWRPckFzc2V0TmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGwgIT0gdGhpcy5nZXRVSUZvcm0oc2VyaWFsSWRPckFzc2V0TmFtZSk7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUuY2xvc2VVSUZvcm0gPSBmdW5jdGlvbiAoc2VyaWFsSWRPclVpRm9ybSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB1aUZvcm0gPSBzZXJpYWxJZE9yVWlGb3JtO1xuICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2Ygc2VyaWFsSWRPclVpRm9ybSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzTG9hZGluZ1VJRm9ybShzZXJpYWxJZE9yVWlGb3JtKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNUb1JlbGVhc2VPbkxvYWQuYWRkKHNlcmlhbElkT3JVaUZvcm0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZC5kZWxldGUoc2VyaWFsSWRPclVpRm9ybSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdWlGb3JtID0gdGhpcy5nZXRVSUZvcm0oc2VyaWFsSWRPclVpRm9ybSk7XG4gICAgICAgICAgICAgICAgaWYgKG51bGwgPT0gdWlGb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgZmluZCBVSSBmb3JtICdcIiArIHNlcmlhbElkT3JVaUZvcm0gKyBcIidcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF1aUZvcm0pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB2YXIgdWlHcm91cCA9IHVpRm9ybS51aUdyb3VwO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdWlHcm91cClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGdyb3VwIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB1c2VyRGF0YSA9IHVzZXJEYXRhIHx8IG51bGw7XG4gICAgICAgICAgICB1aUdyb3VwLnJlbW92ZVVJRm9ybSh1aUZvcm0pO1xuICAgICAgICAgICAgdWlGb3JtLm9uQ2xvc2UodGhpcy5tX2JJc1NodXRkb3duLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICB1aUdyb3VwLnJlZnJlc2goKTtcbiAgICAgICAgICAgIHZhciBldmVudEFyZ3MgPSB7XG4gICAgICAgICAgICAgICAgc2VyaWFsSWQ6IHVpRm9ybS5zZXJpYWxJZCxcbiAgICAgICAgICAgICAgICB1aUdyb3VwOiB1aUdyb3VwLFxuICAgICAgICAgICAgICAgIHVpRm9ybUFzc2V0TmFtZTogdWlGb3JtLnVpRm9ybUFzc2V0TmFtZSxcbiAgICAgICAgICAgICAgICB1c2VyRGF0YTogdXNlckRhdGFcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLm1fcENsb3NlVUlGb3JtQ29tcGxldGVEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2tGbihldmVudEFyZ3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLm1fcFJlY3ljbGVRdWV1ZS5wdXNoKHVpRm9ybSk7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUuZ2V0QWxsTG9hZGVkVUlGb3JtcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBlXzUsIF9hO1xuICAgICAgICAgICAgdmFyIHZfcFJldCA9IFtdO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9yVUlHcm91cHMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB1aUdyb3VwID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHZfcFJldC5jb25jYXQodWlHcm91cC5nZXRBbGxVSUZvcm1zKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzVfMSkgeyBlXzUgPSB7IGVycm9yOiBlXzVfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV81KSB0aHJvdyBlXzUuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2X3BSZXQ7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUuY2xvc2VBbGxMb2FkZWRVSUZvcm1zID0gZnVuY3Rpb24gKHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgZV82LCBfYTtcbiAgICAgICAgICAgIHZhciB2X3BVSUZvcm1zID0gdGhpcy5nZXRBbGxMb2FkZWRVSUZvcm1zKCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHZfcFVJRm9ybXNfMSA9IF9fdmFsdWVzKHZfcFVJRm9ybXMpLCB2X3BVSUZvcm1zXzFfMSA9IHZfcFVJRm9ybXNfMS5uZXh0KCk7ICF2X3BVSUZvcm1zXzFfMS5kb25lOyB2X3BVSUZvcm1zXzFfMSA9IHZfcFVJRm9ybXNfMS5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHVpRm9ybSA9IHZfcFVJRm9ybXNfMV8xLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaGFzVUlGb3JtKHVpRm9ybS5zZXJpYWxJZCkpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZVVJRm9ybSh1aUZvcm0sIHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV82XzEpIHsgZV82ID0geyBlcnJvcjogZV82XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZfcFVJRm9ybXNfMV8xICYmICF2X3BVSUZvcm1zXzFfMS5kb25lICYmIChfYSA9IHZfcFVJRm9ybXNfMS5yZXR1cm4pKSBfYS5jYWxsKHZfcFVJRm9ybXNfMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV82KSB0aHJvdyBlXzYuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5jbG9zZUFsbExvYWRpbmdVSUZvcm1zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfNywgX2E7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQua2V5cygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2VyaWFsSWQgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3JVSUZvcm1zVG9SZWxlYXNlT25Mb2FkLmFkZChzZXJpYWxJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfN18xKSB7IGVfNyA9IHsgZXJyb3I6IGVfN18xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzcpIHRocm93IGVfNy5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQuY2xlYXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5yZWZvY3VzVUlGb3JtID0gZnVuY3Rpb24gKHVpRm9ybSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IHVpRm9ybSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGZvcm0gaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHZhciB1aUdyb3VwID0gdWlGb3JtLnVpR3JvdXA7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB1aUdyb3VwKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZ3JvdXAgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHVzZXJEYXRhID0gdXNlckRhdGEgfHwgbnVsbDtcbiAgICAgICAgICAgIHVpR3JvdXAucmVmb2N1c1VJRm9ybSh1aUZvcm0sIHVzZXJEYXRhKTtcbiAgICAgICAgICAgIHVpR3JvdXAucmVmcmVzaCgpO1xuICAgICAgICAgICAgdWlGb3JtLm9uUmVmb2N1cyh1c2VyRGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUuaGFzVUlHcm91cCA9IGZ1bmN0aW9uICh1aUdyb3VwTmFtZSkge1xuICAgICAgICAgICAgaWYgKCF1aUdyb3VwTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGdyb3VwIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fclVJR3JvdXBzLmhhcyh1aUdyb3VwTmFtZSk7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUuZ2V0VUlHcm91cCA9IGZ1bmN0aW9uICh1aUdyb3VwTmFtZSkge1xuICAgICAgICAgICAgaWYgKCF1aUdyb3VwTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGdyb3VwIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fclVJR3JvdXBzLmdldCh1aUdyb3VwTmFtZSkgfHwgbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5hZGRVSUdyb3VwID0gZnVuY3Rpb24gKHVpR3JvdXBOYW1lLCBhcmcxLCBhcmcyKSB7XG4gICAgICAgICAgICBpZiAoIXVpR3JvdXBOYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZ3JvdXAgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdmFyIHVpR3JvdXBEZXB0aCA9IDA7XG4gICAgICAgICAgICB2YXIgdWlHcm91cEhlbHBlcjtcbiAgICAgICAgICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIGFyZzEpIHtcbiAgICAgICAgICAgICAgICB1aUdyb3VwRGVwdGggPSBhcmcxO1xuICAgICAgICAgICAgICAgIGlmICh1bmRlZmluZWQgIT0gYXJnMikge1xuICAgICAgICAgICAgICAgICAgICB1aUdyb3VwSGVscGVyID0gYXJnMjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB1aUdyb3VwSGVscGVyID0gYXJnMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdWlHcm91cEhlbHBlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGdyb3VwIGhlbHBlciBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgaWYgKHRoaXMuaGFzVUlHcm91cCh1aUdyb3VwTmFtZSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5tX3JVSUdyb3Vwcy5zZXQodWlHcm91cE5hbWUsIG5ldyBVSUdyb3VwKHVpR3JvdXBOYW1lLCB1aUdyb3VwRGVwdGgsIHVpR3JvdXBIZWxwZXIpKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLm9wZW5VSUZvcm1JbnRlcm5hbCA9IGZ1bmN0aW9uIChzZXJpYWxJZCwgdWlGb3JtQXNzZXROYW1lLCB1aUdyb3VwLCB1aUZvcm1JbnN0YW5jZSwgcGF1c2VDb3ZlcmVkVUlGb3JtLCBpc05ld0luc3RhbmNlLCBkdXJhdGlvbiwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB1aUZvcm0gPSB0aGlzLm1fcFVJRm9ybUhlbHBlci5jcmVhdGVVSUZvcm0odWlGb3JtSW5zdGFuY2UsIHVpR3JvdXAsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHVpRm9ybSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBub3QgY3JlYXRlIFVJIGZvcm0gaW4gaGVscGVyLicpO1xuICAgICAgICAgICAgdWlGb3JtLm9uSW5pdChzZXJpYWxJZCwgdWlGb3JtQXNzZXROYW1lLCB1aUdyb3VwLCBwYXVzZUNvdmVyZWRVSUZvcm0sIGlzTmV3SW5zdGFuY2UsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgIHVpR3JvdXAuYWRkVUlGb3JtKHVpRm9ybSk7XG4gICAgICAgICAgICB1aUZvcm0ub25PcGVuKHVzZXJEYXRhKTtcbiAgICAgICAgICAgIHVpR3JvdXAucmVmcmVzaCgpO1xuICAgICAgICAgICAgdmFyIGV2ZW50QXJncyA9IHtcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24sXG4gICAgICAgICAgICAgICAgdWlGb3JtOiB1aUZvcm0sXG4gICAgICAgICAgICAgICAgdXNlckRhdGE6IHVzZXJEYXRhXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5tX3BPcGVuVUlGb3JtU3VjY2Vzc0RlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGV2ZW50QXJncyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5sb2FkVUlGb3JtU3VjY2Vzc0NhbGxiYWNrID0gZnVuY3Rpb24gKHVpRm9ybUFzc2V0TmFtZSwgdWlGb3JtQXNzZXQsIGR1cmF0aW9uLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcEluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiT3BlbiBVSSBmb3JtIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3JVSUZvcm1zVG9SZWxlYXNlT25Mb2FkLmhhcyh2X3BJbmZvLnNlcmlhbElkKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZC5kZWxldGUodl9wSW5mby5zZXJpYWxJZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1IZWxwZXIucmVsZWFzZVVJRm9ybSh1aUZvcm1Bc3NldCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQuZGVsZXRlKHZfcEluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgdmFyIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0ID0gVUlGb3JtSW5zdGFuY2VPYmplY3QuY3JlYXRlKHVpRm9ybUFzc2V0TmFtZSwgdWlGb3JtQXNzZXQsIHRoaXMubV9wVUlGb3JtSGVscGVyLmluc3RhbnRpYXRlVUlGb3JtKHVpRm9ybUFzc2V0KSwgdGhpcy5tX3BVSUZvcm1IZWxwZXIpO1xuICAgICAgICAgICAgdGhpcy5tX3BJbnN0YW5jZVBvb2wucmVnaXN0ZXIodl9wVWlGb3JtSW5zdGFuY2VPYmplY3QsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy5vcGVuVUlGb3JtSW50ZXJuYWwodl9wSW5mby5zZXJpYWxJZCwgdWlGb3JtQXNzZXROYW1lLCB2X3BJbmZvLnVpR3JvdXAsIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LnRhcmdldCwgdl9wSW5mby5wYXVzZUNvdmVyZWRVSUZvcm0sIHRydWUsIGR1cmF0aW9uLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5sb2FkVUlGb3JtRmFpbHVyZUNhbGxiYWNrID0gZnVuY3Rpb24gKHVpRm9ybUFzc2V0TmFtZSwgc3RhdHVzLCBlcnJvck1lc3NhZ2UsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wSW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJPcGVuIFVJIGZvcm0gaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fclVJRm9ybXNUb1JlbGVhc2VPbkxvYWQuaGFzKHZfcEluZm8uc2VyaWFsSWQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3JVSUZvcm1zVG9SZWxlYXNlT25Mb2FkLmRlbGV0ZSh2X3BJbmZvLnNlcmlhbElkKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZC5kZWxldGUodl9wSW5mby5zZXJpYWxJZCk7XG4gICAgICAgICAgICB2YXIgYXBwZW5kRXJyb3JNZXNzYWdlID0gXCJMb2FkIFVJIGZvcm0gZmFpbHVyZSwgYXNzZXQgbmFtZSAnXCIgKyB1aUZvcm1Bc3NldE5hbWUgKyBcIicsIHN0YXR1cyAnXCIgKyBzdGF0dXMudG9TdHJpbmcoKSArIFwiJywgZXJyb3IgbWVzc2FnZSAnXCIgKyBlcnJvck1lc3NhZ2UgKyBcIicuXCI7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BPcGVuVUlGb3JtRmFpbHVyZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnRBcmdzXzEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHNlcmlhbElkOiB2X3BJbmZvLnNlcmlhbElkLFxuICAgICAgICAgICAgICAgICAgICB1aUZvcm1Bc3NldE5hbWU6IHVpRm9ybUFzc2V0TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdWlHcm91cE5hbWU6IHZfcEluZm8udWlHcm91cC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGFwcGVuZEVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgcGF1c2VDb3ZlcmVkVUlGb3JtOiB2X3BJbmZvLnBhdXNlQ292ZXJlZFVJRm9ybSxcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGE6IHZfcEluZm8udXNlckRhdGFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMubV9wT3BlblVJRm9ybUZhaWx1cmVEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oZXZlbnRBcmdzXzEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihhcHBlbmRFcnJvck1lc3NhZ2UpO1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmxvYWRVSUZvcm1VcGRhdGVDYWxsYmFjayA9IGZ1bmN0aW9uICh1aUZvcm1Bc3NldE5hbWUsIHByb2dyZXNzLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcEluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiT3BlbiBVSSBmb3JtIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BPcGVuVUlGb3JtVXBkYXRlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHZhciBldmVudEFyZ3NfMiA9IHtcbiAgICAgICAgICAgICAgICAgICAgc2VyaWFsSWQ6IHZfcEluZm8uc2VyaWFsSWQsXG4gICAgICAgICAgICAgICAgICAgIHVpRm9ybUFzc2V0TmFtZTogdWlGb3JtQXNzZXROYW1lLFxuICAgICAgICAgICAgICAgICAgICB1aUdyb3VwTmFtZTogdl9wSW5mby51aUdyb3VwLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzOiBwcm9ncmVzcyxcbiAgICAgICAgICAgICAgICAgICAgcGF1c2VDb3ZlcmVkVUlGb3JtOiB2X3BJbmZvLnBhdXNlQ292ZXJlZFVJRm9ybSxcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGE6IHZfcEluZm8udXNlckRhdGFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMubV9wT3BlblVJRm9ybVVwZGF0ZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihldmVudEFyZ3NfMik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUubG9hZFVJRm9ybURlcGVuZGVuY3lBc3NldENhbGxiYWNrID0gZnVuY3Rpb24gKHVpRm9ybUFzc2V0TmFtZSwgZGVwZW5kZW5jeUFzc2V0TmFtZSwgbG9hZGVkQ291bnQsIHRvdGFsQ291bnQsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wSW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJPcGVuIFVJIGZvcm0gaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcE9wZW5VSUZvcm1EZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50QXJnc18zID0ge1xuICAgICAgICAgICAgICAgICAgICBzZXJpYWxJZDogdl9wSW5mby5zZXJpYWxJZCxcbiAgICAgICAgICAgICAgICAgICAgdWlGb3JtQXNzZXROYW1lOiB1aUZvcm1Bc3NldE5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHVpR3JvdXBOYW1lOiB2X3BJbmZvLnVpR3JvdXAubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgZGVwZW5kZW5jeUFzc2V0TmFtZTogZGVwZW5kZW5jeUFzc2V0TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVkQ291bnQ6IGxvYWRlZENvdW50LFxuICAgICAgICAgICAgICAgICAgICB0b3RhbENvdW50OiB0b3RhbENvdW50LFxuICAgICAgICAgICAgICAgICAgICBwYXVzZUNvdmVyZWRVSUZvcm06IHZfcEluZm8ucGF1c2VDb3ZlcmVkVUlGb3JtLFxuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YTogdl9wSW5mby51c2VyRGF0YVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BPcGVuVUlGb3JtRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGV2ZW50QXJnc18zKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFVJTWFuYWdlcjtcbiAgICB9KEJhc2VfMS5GcmFtZXdvcmtNb2R1bGUpKTsgLy8gY2xhc3MgVUlNYW5hZ2VyXG4gICAgZXhwb3J0cy5VSU1hbmFnZXIgPSBVSU1hbmFnZXI7XG4gICAgdmFyIFVJRm9ybUluc3RhbmNlT2JqZWN0ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICBfX2V4dGVuZHMoVUlGb3JtSW5zdGFuY2VPYmplY3QsIF9zdXBlcik7XG4gICAgICAgIGZ1bmN0aW9uIFVJRm9ybUluc3RhbmNlT2JqZWN0KCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgICAgICAgICBfdGhpcy5tX3BVSUZvcm1Bc3NldCA9IG51bGw7XG4gICAgICAgICAgICBfdGhpcy5tX3BVSUZvcm1IZWxwZXIgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgICAgICB9XG4gICAgICAgIFVJRm9ybUluc3RhbmNlT2JqZWN0LmNyZWF0ZSA9IGZ1bmN0aW9uIChuYW1lLCB1aUZvcm1Bc3NldCwgdWlGb3JtSW5zdGFuY2UsIHVpRm9ybUhlbHBlcikge1xuICAgICAgICAgICAgaWYgKCF1aUZvcm1Bc3NldClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGZvcm0gYXNzZXQgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGlmICghdWlGb3JtSGVscGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBoZWxwZXIgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHZhciB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdCA9IG5ldyBVSUZvcm1JbnN0YW5jZU9iamVjdCgpO1xuICAgICAgICAgICAgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QuaW5pdGlhbGl6ZShuYW1lLCB1aUZvcm1JbnN0YW5jZSk7XG4gICAgICAgICAgICB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC5tX3BVSUZvcm1Bc3NldCA9IHVpRm9ybUFzc2V0O1xuICAgICAgICAgICAgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QubV9wVUlGb3JtSGVscGVyID0gdWlGb3JtSGVscGVyO1xuICAgICAgICAgICAgcmV0dXJuIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0O1xuICAgICAgICB9O1xuICAgICAgICBVSUZvcm1JbnN0YW5jZU9iamVjdC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfc3VwZXIucHJvdG90eXBlLmNsZWFyLmNhbGwodGhpcyk7XG4gICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUFzc2V0ID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9wVUlGb3JtSGVscGVyID0gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgVUlGb3JtSW5zdGFuY2VPYmplY3QucHJvdG90eXBlLnJlbGVhc2UgPSBmdW5jdGlvbiAoc2h1dGRvd24pIHtcbiAgICAgICAgICAgIHNodXRkb3duID0gc2h1dGRvd24gfHwgZmFsc2U7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BVSUZvcm1IZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1IZWxwZXIucmVsZWFzZVVJRm9ybSh0aGlzLm1fcFVJRm9ybUFzc2V0LCB0aGlzLnRhcmdldCk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBVSUZvcm1JbnN0YW5jZU9iamVjdDtcbiAgICB9KE9iamVjdFBvb2xfMS5PYmplY3RCYXNlKSk7IC8vIGNsYXNzIFVJRm9ybUluc3RhbmNlT2JqZWN0XG4gICAgdmFyIFVJR3JvdXAgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZ1bmN0aW9uIFVJR3JvdXAobmFtZSwgZGVwdGgsIGhlbHBlcikge1xuICAgICAgICAgICAgdGhpcy5tX2lEZXB0aCA9IDA7XG4gICAgICAgICAgICB0aGlzLm1fYlBhdXNlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUluZm9zID0gW107XG4gICAgICAgICAgICBpZiAoIW5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBncm91cCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBpZiAoIWhlbHBlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGdyb3VwIGhlbHBlciBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdGhpcy5tX3NOYW1lID0gbmFtZTtcbiAgICAgICAgICAgIHRoaXMubV9iUGF1c2UgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuaGVscGVyID0gaGVscGVyO1xuICAgICAgICAgICAgdGhpcy5kZXB0aCA9IGRlcHRoO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSUdyb3VwLnByb3RvdHlwZSwgXCJuYW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3NOYW1lOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJR3JvdXAucHJvdG90eXBlLCBcImRlcHRoXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX2lEZXB0aDsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IHRoaXMubV9pRGVwdGgpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB0aGlzLm1faURlcHRoID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5oZWxwZXIuc2V0RGVwdGgodGhpcy5tX2lEZXB0aCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJR3JvdXAucHJvdG90eXBlLCBcInBhdXNlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX2JQYXVzZTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubV9iUGF1c2UgPT0gdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB0aGlzLm1fYlBhdXNlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJR3JvdXAucHJvdG90eXBlLCBcInVpRm9ybUNvdW50XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFVJRm9ybUluZm9zLmxlbmd0aDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlHcm91cC5wcm90b3R5cGUsIFwiY3VycmVudFVJRm9ybVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BVSUZvcm1JbmZvcy5sZW5ndGggPiAwID8gdGhpcy5tX3BVSUZvcm1JbmZvc1swXS51aUZvcm0gOiBudWxsO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFVJR3JvdXAucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgdmFyIGVfOCwgX2E7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BVSUZvcm1JbmZvcyksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZm8gPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZm8ucGF1c2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpbmZvLnVpRm9ybS5vblVwZGF0ZShlbGFwc2VkLCByZWFsRWxhcHNlZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfOF8xKSB7IGVfOCA9IHsgZXJyb3I6IGVfOF8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzgpIHRocm93IGVfOC5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBVSUdyb3VwLnByb3RvdHlwZS5hZGRVSUZvcm0gPSBmdW5jdGlvbiAodWlGb3JtKSB7XG4gICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUluZm9zLnVuc2hpZnQoe1xuICAgICAgICAgICAgICAgIHVpRm9ybTogdWlGb3JtLFxuICAgICAgICAgICAgICAgIGNvdmVyZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgcGF1c2VkOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlHcm91cC5wcm90b3R5cGUucmVtb3ZlVUlGb3JtID0gZnVuY3Rpb24gKHVpRm9ybSkge1xuICAgICAgICAgICAgdmFyIHZfdUlkeCA9IC0xO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1fcFVJRm9ybUluZm9zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubV9wVUlGb3JtSW5mb3NbaV0udWlGb3JtID09IHVpRm9ybSkge1xuICAgICAgICAgICAgICAgICAgICB2X3VJZHggPSBpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodl91SWR4ID09IC0xKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgZmluZCBVSSBmb3JtIGluZm8gZm9yIHNlcmlhbCBpZCAnXCIgKyB1aUZvcm0uc2VyaWFsSWQgKyBcIicsIFVJIGZvcm0gYXNzZXQgbmFtZSBpcyAnXCIgKyB1aUZvcm0udWlGb3JtQXNzZXROYW1lICsgXCInLlwiKTtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdGhpcy5tX3BVSUZvcm1JbmZvc1t2X3VJZHhdO1xuICAgICAgICAgICAgaWYgKCF2X3BJbmZvLmNvdmVyZWQpIHtcbiAgICAgICAgICAgICAgICB2X3BJbmZvLmNvdmVyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHVpRm9ybS5vbkNvdmVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXZfcEluZm8ucGF1c2VkKSB7XG4gICAgICAgICAgICAgICAgdl9wSW5mby5wYXVzZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHVpRm9ybS5vblBhdXNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUluZm9zLnNwbGljZSh2X3VJZHgsIDEpO1xuICAgICAgICB9O1xuICAgICAgICBVSUdyb3VwLnByb3RvdHlwZS5oYXNVSUZvcm0gPSBmdW5jdGlvbiAoaWRPckFzc2V0TmFtZSkge1xuICAgICAgICAgICAgdmFyIGVfOSwgX2E7XG4gICAgICAgICAgICB2YXIgc3ViUHJvcE5hbWUgPSAnc2VyaWFsSWQnO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpZE9yQXNzZXROYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGlmICghaWRPckFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGFzc2V0IG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgICAgICBzdWJQcm9wTmFtZSA9ICd1aUZvcm1Bc3NldE5hbWUnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wVUlGb3JtSW5mb3MpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmZvID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmZvLnVpRm9ybVtzdWJQcm9wTmFtZV0gPT09IGlkT3JBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV85XzEpIHsgZV85ID0geyBlcnJvcjogZV85XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfOSkgdGhyb3cgZV85LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIFVJR3JvdXAucHJvdG90eXBlLmdldFVJRm9ybSA9IGZ1bmN0aW9uIChpZE9yQXNzZXROYW1lKSB7XG4gICAgICAgICAgICB2YXIgZV8xMCwgX2E7XG4gICAgICAgICAgICB2YXIgc3ViUHJvcE5hbWUgPSAnc2VyaWFsSWQnO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpZE9yQXNzZXROYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGlmICghaWRPckFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGFzc2V0IG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgICAgICBzdWJQcm9wTmFtZSA9ICd1aUZvcm1Bc3NldE5hbWUnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wVUlGb3JtSW5mb3MpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmZvID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmZvLnVpRm9ybVtzdWJQcm9wTmFtZV0gPT09IGlkT3JBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW5mby51aUZvcm07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMTBfMSkgeyBlXzEwID0geyBlcnJvcjogZV8xMF8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEwKSB0aHJvdyBlXzEwLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgVUlHcm91cC5wcm90b3R5cGUuZ2V0VUlGb3JtcyA9IGZ1bmN0aW9uIChhc3NldE5hbWUpIHtcbiAgICAgICAgICAgIHZhciBlXzExLCBfYTtcbiAgICAgICAgICAgIGlmICghYXNzZXROYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBhc3NldCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB2YXIgdl9wUmV0ID0gW107XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BVSUZvcm1JbmZvcy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZS51aUZvcm0udWlGb3JtQXNzZXROYW1lID09PSBhc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICB2X3BSZXQucHVzaCh2YWx1ZS51aUZvcm0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzExXzEpIHsgZV8xMSA9IHsgZXJyb3I6IGVfMTFfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xMSkgdGhyb3cgZV8xMS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZfcFJldDtcbiAgICAgICAgfTtcbiAgICAgICAgVUlHcm91cC5wcm90b3R5cGUuZ2V0QWxsVUlGb3JtcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFVJRm9ybUluZm9zLm1hcChmdW5jdGlvbiAoaW5mbykge1xuICAgICAgICAgICAgICAgIHJldHVybiBpbmZvLnVpRm9ybTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBVSUdyb3VwLnByb3RvdHlwZS5yZWZvY3VzVUlGb3JtID0gZnVuY3Rpb24gKHVpRm9ybSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3VJZHggPSAtMTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tX3BVSUZvcm1JbmZvcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fcFVJRm9ybUluZm9zW2ldLnVpRm9ybSA9PSB1aUZvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgdl91SWR4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHZfdUlkeCA9PSAtMSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGZpbmQgVUkgZm9ybSBpbmZvIGZvciBzZXJpYWwgaWQgJ1wiICsgdWlGb3JtLnNlcmlhbElkICsgXCInLCBVSSBmb3JtIGFzc2V0IG5hbWUgaXMgJ1wiICsgdWlGb3JtLnVpRm9ybUFzc2V0TmFtZSArIFwiJy5cIik7XG4gICAgICAgICAgICBpZiAodl91SWR4ID49IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUluZm9zLnNwbGljZSh2X3VJZHgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB0aGlzLm1fcFVJRm9ybUluZm9zW3ZfdUlkeF07XG4gICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUluZm9zLnVuc2hpZnQodl9wSW5mbyk7XG4gICAgICAgIH07XG4gICAgICAgIFVJR3JvdXAucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZV8xMiwgX2E7XG4gICAgICAgICAgICB2YXIgdl9iUGF1c2UgPSB0aGlzLnBhdXNlO1xuICAgICAgICAgICAgdmFyIHZfYkNvdmVyID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgdl9pRGVwdGggPSB0aGlzLnVpRm9ybUNvdW50O1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wVUlGb3JtSW5mb3MpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmZvID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChudWxsID09IGluZm8pXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIGlmICh2X2JQYXVzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpbmZvLmNvdmVyZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLmNvdmVyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8udWlGb3JtLm9uQ292ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaW5mby5wYXVzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLnBhdXNlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby51aUZvcm0ub25QYXVzZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZm8ucGF1c2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLnVpRm9ybS5vblJlc3VtZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZm8udWlGb3JtLnBhdXNlQ292ZXJlZFVJRm9ybSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZfYlBhdXNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2X2JDb3Zlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaW5mby5jb3ZlcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8uY292ZXJlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8udWlGb3JtLm9uQ292ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5mby5jb3ZlcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8uY292ZXJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLnVpRm9ybS5vblJldmVhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2X2JDb3ZlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xMl8xKSB7IGVfMTIgPSB7IGVycm9yOiBlXzEyXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMTIpIHRocm93IGVfMTIuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFVJR3JvdXA7XG4gICAgfSgpKTsgLy8gY2xhc3MgVUlHcm91cFxuICAgIGV4cG9ydHMuVUlHcm91cCA9IFVJR3JvdXA7XG59KTtcbiIsIihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgZ2xvYmFsID0gZ2xvYmFsIHx8IHt9O1xuICAgIHZhciB2X3BHbG9iYWwgPSAndW5kZWZpbmVkJyA9PSB0eXBlb2Ygd2luZG93ID8gZ2xvYmFsIDogd2luZG93O1xuICAgIHZhciBhdHNmcmFtZXdvcmsgPSB2X3BHbG9iYWwuYXRzZnJhbWV3b3JrIHx8IHt9O1xuICAgIGZ1bmN0aW9uIGV4cG9zZShtKSB7XG4gICAgICAgIGZvciAodmFyIGsgaW4gbSkge1xuICAgICAgICAgICAgYXRzZnJhbWV3b3JrW2tdID0gbVtrXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBleHBvc2UocmVxdWlyZSgnLi9CYXNlJykpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9Db25maWdcIikpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9EYXRhTm9kZVwiKSk7XG4gICAgZXhwb3NlKHJlcXVpcmUoXCIuL0RhdGFUYWJsZVwiKSk7XG4gICAgZXhwb3NlKHJlcXVpcmUoXCIuL0ZzbVwiKSk7XG4gICAgZXhwb3NlKHJlcXVpcmUoXCIuL1Jlc291cmNlXCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vRW50aXR5XCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vRXZlbnRcIikpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9PYmplY3RQb29sXCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vUHJvY2VkdXJlXCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vU291bmRcIikpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9TY2VuZVwiKSk7XG4gICAgZXhwb3NlKHJlcXVpcmUoXCIuL1NldHRpbmdcIikpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9VSVwiKSk7XG4gICAgdl9wR2xvYmFsLmF0c2ZyYW1ld29yayA9IGF0c2ZyYW1ld29yaztcbiAgICBleHBvcnRzLmRlZmF1bHQgPSBhdHNmcmFtZXdvcms7XG59KTtcbiJdfQ==
