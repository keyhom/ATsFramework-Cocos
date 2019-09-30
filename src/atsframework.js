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
            name = name || '';
            var v_pDataTable = new DataTable();
            this.internalCreateDataTable(type, v_pDataTable, content);
            this.m_pDataTable.set(name, v_pDataTable);
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

},{"./Base":1}],6:[function(require,module,exports){
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

},{"./Base":1,"./Fsm":6}],8:[function(require,module,exports){
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

},{"./Base":1}],10:[function(require,module,exports){
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
            this.m_pSoundAsset;
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
                // this.m_pSoundAsset = null;
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
            if (!v_pSoundAgent) {
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
    var UIManager = /** @class */ (function (_super) {
        __extends(UIManager, _super);
        function UIManager() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.m_rUIGroups = new Map();
            _this.m_iSerialId = 0;
            _this.m_bIsShutdown = false;
            _this.m_rUIFormsBeingLoaded = new Map();
            _this.m_rUIFormsToReleaseOnLoad = new Set();
            _this.m_pInstancePool = new Map();
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
            var e_1, _a, e_2, _b;
            try {
                for (var _c = __values(this.m_pRecycleQueue), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var uiForm = _d.value;
                    if (this.m_pInstancePool.has(uiForm.uiFormAssetName)) {
                        var v_pInstanceObjects = this.m_pInstancePool.get(uiForm.uiFormAssetName);
                        if (v_pInstanceObjects && v_pInstanceObjects.length > 0) {
                            try {
                                for (var v_pInstanceObjects_1 = (e_2 = void 0, __values(v_pInstanceObjects)), v_pInstanceObjects_1_1 = v_pInstanceObjects_1.next(); !v_pInstanceObjects_1_1.done; v_pInstanceObjects_1_1 = v_pInstanceObjects_1.next()) {
                                    var v_pUiFormInstanceObject = v_pInstanceObjects_1_1.value;
                                    if (v_pUiFormInstanceObject.isValid) {
                                        uiForm.onRecycle();
                                        v_pUiFormInstanceObject.spawn = false;
                                    }
                                }
                            }
                            catch (e_2_1) { e_2 = { error: e_2_1 }; }
                            finally {
                                try {
                                    if (v_pInstanceObjects_1_1 && !v_pInstanceObjects_1_1.done && (_b = v_pInstanceObjects_1.return)) _b.call(v_pInstanceObjects_1);
                                }
                                finally { if (e_2) throw e_2.error; }
                            }
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (this.m_pRecycleQueue.length)
                this.m_pRecycleQueue.splice(0, this.m_pRecycleQueue.length);
            // TODO: auto release processing here.
            this.m_rUIGroups.forEach(function (uiGroup, key) {
                var v_pUiGroup = uiGroup;
                v_pUiGroup.update(elapsed, realElapsed);
            });
        };
        UIManager.prototype.shutdown = function () {
            var _this = this;
            this.m_bIsShutdown = true;
            this.closeAllLoadedUIForms();
            this.m_pRecycleQueue.splice(0, this.m_pRecycleQueue.length);
            if (this.m_pInstancePool) {
                this.m_pInstancePool.forEach(function (instanceObjects, key) {
                    var e_3, _a;
                    if (instanceObjects && instanceObjects.length > 0) {
                        try {
                            for (var instanceObjects_1 = __values(instanceObjects), instanceObjects_1_1 = instanceObjects_1.next(); !instanceObjects_1_1.done; instanceObjects_1_1 = instanceObjects_1.next()) {
                                var v_pUiFormInstanceObject = instanceObjects_1_1.value;
                                v_pUiFormInstanceObject.release(true);
                                v_pUiFormInstanceObject.clear();
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (instanceObjects_1_1 && !instanceObjects_1_1.done && (_a = instanceObjects_1.return)) _a.call(instanceObjects_1);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                        instanceObjects.splice(0, instanceObjects.length);
                        _this.m_pInstancePool.delete(key);
                    }
                });
                this.m_pInstancePool.clear();
            }
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
            var v_pUiFormInstanceObject;
            if (this.m_pInstancePool.has(uiFormAssetName)) {
                // Get spawn.
                var v_pInstanceObjects = this.m_pInstancePool.get(uiFormAssetName);
                if (v_pInstanceObjects && v_pInstanceObjects.length > 0) {
                    for (var i = 0; i < v_pInstanceObjects.length; i++) {
                        if (v_pInstanceObjects[i].isValid && !v_pInstanceObjects[i].spawn) {
                            v_pUiFormInstanceObject = v_pInstanceObjects[i];
                            v_pUiFormInstanceObject.spawn = true;
                            break;
                        }
                    }
                }
            }
            if (null == v_pUiFormInstanceObject) {
                if (this.m_rUIFormsBeingLoaded.has(v_iSerialId))
                    throw new Error("Key duplicated with: " + v_iSerialId);
                this.m_rUIFormsBeingLoaded.set(v_iSerialId, uiFormAssetName);
                // FIXME: call on resource manager to loadAsset.
                var v_rOpenUiFormInfo = {
                    serialId: v_iSerialId,
                    uiGroup: v_rUIGroup,
                    pauseCoveredUIForm: pauseCoveredUIForm,
                    userData: userData
                };
                this.m_pResourceManager.loadAsset(uiFormAssetName, priority, this.m_pLoadAssetCallbacks, v_rOpenUiFormInfo);
                // let v_fTimeStart: number = new Date().valueOf();
                // cc.loader.loadRes(uiFormAssetName, cc.Asset, (completeCount: number, totalCount: number, item: any) => {
                // // Progress processing update.
                // // cc.warn(`loading progress: ${completeCount}/${totalCount}, item: ${item}`);
                // this.fireOpenUIFormProgress(uiFormAssetName, completeCount / totalCount, v_rOpenUiFormInfo);
                // }, (error: Error, resource: object) => {
                // cc.warn(`loadRes complete with info: ${v_rOpenUiFormInfo.serialId}, ${v_rOpenUiFormInfo.uiGroup.name}, ${uiFormAssetName}`);
                // // load completed.
                // this.fireOpenUIFormComplete(error, uiFormAssetName, resource, new Date().valueOf() - v_fTimeStart, v_rOpenUiFormInfo);
                // });
            }
            else {
                this.openUIFormInternal(v_iSerialId, uiFormAssetName, v_rUIGroup, v_pUiFormInstanceObject.target, pauseCoveredUIForm, false, 0, userData);
            }
            return v_iSerialId;
        };
        UIManager.prototype.isLoadingUIForm = function (serialIdOrAssetName) {
            var e_4, _a;
            if ('string' === typeof serialIdOrAssetName) {
                try {
                    for (var _b = __values(this.m_rUIFormsBeingLoaded.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var uiFormAssetName = _c.value;
                        if (uiFormAssetName === serialIdOrAssetName)
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
            }
            else {
                return this.m_rUIFormsBeingLoaded.has(serialIdOrAssetName);
            }
        };
        UIManager.prototype.getUIForms = function (uiFormAssetName) {
            var e_5, _a;
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
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
            return v_rRet;
        };
        UIManager.prototype.getUIForm = function (serialIdOrAssetName) {
            var e_6, _a;
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
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_6) throw e_6.error; }
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
            var e_7, _a;
            var v_pRet = [];
            try {
                for (var _b = __values(this.m_rUIGroups.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var uiGroup = _c.value;
                    v_pRet.concat(uiGroup.getAllUIForms());
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_7) throw e_7.error; }
            }
            return v_pRet;
        };
        UIManager.prototype.closeAllLoadedUIForms = function (userData) {
            var e_8, _a;
            var v_pUIForms = this.getAllLoadedUIForms();
            try {
                for (var v_pUIForms_1 = __values(v_pUIForms), v_pUIForms_1_1 = v_pUIForms_1.next(); !v_pUIForms_1_1.done; v_pUIForms_1_1 = v_pUIForms_1.next()) {
                    var uiForm = v_pUIForms_1_1.value;
                    if (!this.hasUIForm(uiForm.serialId))
                        continue;
                    this.closeUIForm(uiForm, userData);
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (v_pUIForms_1_1 && !v_pUIForms_1_1.done && (_a = v_pUIForms_1.return)) _a.call(v_pUIForms_1);
                }
                finally { if (e_8) throw e_8.error; }
            }
        };
        UIManager.prototype.closeAllLoadingUIForms = function () {
            var e_9, _a;
            try {
                for (var _b = __values(this.m_rUIFormsBeingLoaded.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var serialId = _c.value;
                    this.m_rUIFormsToReleaseOnLoad.add(serialId);
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_9) throw e_9.error; }
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
            // Register to pool and mark spawn flag.
            if (!this.m_pInstancePool.has(uiFormAssetName)) {
                this.m_pInstancePool.set(uiFormAssetName, []);
            }
            var v_pInstanceObjects = this.m_pInstancePool.get(uiFormAssetName);
            if (v_pInstanceObjects && v_pInstanceObjects.length < this.m_uInstanceCapacity) {
                v_pUiFormInstanceObject.spawn = true;
                v_pInstanceObjects.push(v_pUiFormInstanceObject);
            }
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
    var UIFormInstanceObject = /** @class */ (function () {
        function UIFormInstanceObject() {
            this.isValid = true;
            this.spawn = false;
        }
        UIFormInstanceObject.create = function (name, uiFormAsset, uiFormInstance, uiFormHelper) {
            if (!uiFormAsset)
                throw new Error('UI form asset is invalid.');
            if (!uiFormHelper)
                throw new Error('UI form helper is invalid.');
            var v_pUiFormInstanceObject = new UIFormInstanceObject();
            v_pUiFormInstanceObject.name = name;
            v_pUiFormInstanceObject.target = uiFormInstance;
            v_pUiFormInstanceObject.m_pUIFormAsset = uiFormAsset;
            v_pUiFormInstanceObject.m_pUIFormHelper = uiFormHelper;
            return v_pUiFormInstanceObject;
        };
        UIFormInstanceObject.prototype.clear = function () {
            this.m_pUIFormAsset = null;
            this.m_pUIFormHelper = null;
        };
        UIFormInstanceObject.prototype.release = function (shutdown) {
            shutdown = shutdown || false;
            this.isValid = false;
            if (this.m_pUIFormHelper)
                this.m_pUIFormHelper.releaseUIForm(this.m_pUIFormAsset, this.target);
        };
        return UIFormInstanceObject;
    }()); // class UIFormInstanceObject
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
            var e_10, _a;
            try {
                for (var _b = __values(this.m_pUIFormInfos), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var info = _c.value;
                    if (info.paused) {
                        break;
                    }
                    info.uiForm.onUpdate(elapsed, realElapsed);
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
            var e_11, _a;
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
            catch (e_11_1) { e_11 = { error: e_11_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_11) throw e_11.error; }
            }
            return false;
        };
        UIGroup.prototype.getUIForm = function (idOrAssetName) {
            var e_12, _a;
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
            catch (e_12_1) { e_12 = { error: e_12_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_12) throw e_12.error; }
            }
            return null;
        };
        UIGroup.prototype.getUIForms = function (assetName) {
            var e_13, _a;
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
            catch (e_13_1) { e_13 = { error: e_13_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_13) throw e_13.error; }
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
            var e_14, _a;
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
            catch (e_14_1) { e_14 = { error: e_14_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_14) throw e_14.error; }
            }
        };
        return UIGroup;
    }()); // class UIGroup
    exports.UIGroup = UIGroup;
});

},{"./Base":1}],12:[function(require,module,exports){
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
    expose(require("./Event"));
    expose(require("./Procedure"));
    expose(require("./UI"));
    expose(require("./Sound"));
    expose(require("./Scene"));
    v_pGlobal.atsframework = atsframework;
    exports.default = atsframework;
});

},{"./Base":1,"./Config":2,"./DataNode":3,"./DataTable":4,"./Event":5,"./Fsm":6,"./Procedure":7,"./Resource":8,"./Scene":9,"./Sound":10,"./UI":11}]},{},[12])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIkJhc2UuanMiLCJDb25maWcuanMiLCJEYXRhTm9kZS5qcyIsIkRhdGFUYWJsZS5qcyIsIkV2ZW50LmpzIiwiRnNtLmpzIiwiUHJvY2VkdXJlLmpzIiwiUmVzb3VyY2UuanMiLCJTY2VuZS5qcyIsIlNvdW5kLmpzIiwiVUkuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9jQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcmRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3p6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdjRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICAvKipcbiAgICAgKiBMb2FkIHR5cGUuXG4gICAgICovXG4gICAgdmFyIExvYWRUeXBlO1xuICAgIChmdW5jdGlvbiAoTG9hZFR5cGUpIHtcbiAgICAgICAgTG9hZFR5cGVbTG9hZFR5cGVbXCJUZXh0XCJdID0gMF0gPSBcIlRleHRcIjtcbiAgICAgICAgTG9hZFR5cGVbTG9hZFR5cGVbXCJCeXRlc1wiXSA9IDFdID0gXCJCeXRlc1wiO1xuICAgICAgICBMb2FkVHlwZVtMb2FkVHlwZVtcIlN0cmVhbVwiXSA9IDJdID0gXCJTdHJlYW1cIjtcbiAgICB9KShMb2FkVHlwZSA9IGV4cG9ydHMuTG9hZFR5cGUgfHwgKGV4cG9ydHMuTG9hZFR5cGUgPSB7fSkpO1xuICAgIDtcbiAgICB2YXIgZ19wTW9kdWxlcyA9IFtdO1xuICAgIC8qKlxuICAgICAqIEFuIGV2ZW50IGhhbmRsZXIgbWFrZSBzaW1pbGFyIHdpdGggZXZlbnQgZGVsZWdhdGUgbW9kZS5cbiAgICAgKi9cbiAgICB2YXIgRXZlbnRIYW5kbGVyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBFdmVudEhhbmRsZXIoKSB7XG4gICAgICAgIH1cbiAgICAgICAgRXZlbnRIYW5kbGVyLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiAoZm4sIHRhcmdldCkge1xuICAgICAgICAgICAgaWYgKG51bGwgIT0gdGhpcy5tX3BIYW5kbGVycykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcEhhbmRsZXJzLnNvbWUoZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2X2JSZXQgPSB2YWx1ZVsxXSA9PSBmbjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZfYlJldCAmJiB1bmRlZmluZWQgIT0gdGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2X2JSZXQgPSB2YWx1ZVswXSA9PSB0YXJnZXQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZfYlJldDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgRXZlbnRIYW5kbGVyLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoZm4sIHRhcmdldCkge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BIYW5kbGVycylcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEhhbmRsZXJzID0gW107XG4gICAgICAgICAgICBpZiAodGhpcy5oYXMoZm4sIHRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEdXBsaWNhdGVkIGFkZCBldmVudCBoYW5kbGVyICdcIiArIGZuICsgXCInXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wSGFuZGxlcnMucHVzaChbdGFyZ2V0LCBmbiwgZmFsc2VdKTtcbiAgICAgICAgfTtcbiAgICAgICAgRXZlbnRIYW5kbGVyLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoZm4sIHRhcmdldCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmlzVmFsaWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1fcEhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZfcFR1cGxlID0gdGhpcy5tX3BIYW5kbGVyc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAodW5kZWZpbmVkID09IHRhcmdldCAmJiB2X3BUdXBsZVsxXSA9PSBmbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcEhhbmRsZXJzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHVuZGVmaW5lZCAhPSB0YXJnZXQgJiYgdl9wVHVwbGVbMF0gPT0gdGFyZ2V0ICYmIHZfcFR1cGxlWzFdID09IGZuKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wSGFuZGxlcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIEV2ZW50SGFuZGxlci5wcm90b3R5cGUuaXRlciA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmlzVmFsaWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5tX3BIYW5kbGVycy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhciBjYWxsYmFja0ZuID0gdmFsdWVbMV07XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlWzBdICE9IHVuZGVmaW5lZCAmJiBjYWxsYmFja0ZuIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbiA9IGNhbGxiYWNrRm4uYmluZCh2YWx1ZVswXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZuKGNhbGxiYWNrRm4pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIEV2ZW50SGFuZGxlci5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmlzVmFsaWQgJiYgdGhpcy5tX3BIYW5kbGVycy5zcGxpY2UoMCwgdGhpcy5tX3BIYW5kbGVycy5sZW5ndGgpO1xuICAgICAgICB9O1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRXZlbnRIYW5kbGVyLnByb3RvdHlwZSwgXCJpc1ZhbGlkXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcEhhbmRsZXJzICYmIHRoaXMubV9wSGFuZGxlcnMubGVuZ3RoID4gMDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRXZlbnRIYW5kbGVyLnByb3RvdHlwZSwgXCJzaXplXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcEhhbmRsZXJzLmxlbmd0aDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gRXZlbnRIYW5kbGVyO1xuICAgIH0oKSk7IC8vIGNsYXNzIEV2ZW50SGFuZGxlclxuICAgIGV4cG9ydHMuRXZlbnRIYW5kbGVyID0gRXZlbnRIYW5kbGVyO1xuICAgIHZhciBGcmFtZXdvcmtNb2R1bGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZ1bmN0aW9uIEZyYW1ld29ya01vZHVsZSgpIHtcbiAgICAgICAgICAgIHRoaXMubV9pUHJpb3JpdHkgPSAwO1xuICAgICAgICB9XG4gICAgICAgIEZyYW1ld29ya01vZHVsZS5nZXRNb2R1bGUgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnX3BNb2R1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG0gPSBnX3BNb2R1bGVzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChtIGluc3RhbmNlb2YgdHlwZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgRnJhbWV3b3JrTW9kdWxlLmdldE9yQWRkTW9kdWxlID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgICAgIHZhciB2X3BNb2R1bGUgPSB0aGlzLmdldE1vZHVsZSh0eXBlKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcE1vZHVsZSkge1xuICAgICAgICAgICAgICAgIHZfcE1vZHVsZSA9IG5ldyB0eXBlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRNb2R1bGUodl9wTW9kdWxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2X3BNb2R1bGU7XG4gICAgICAgIH07XG4gICAgICAgIEZyYW1ld29ya01vZHVsZS5hZGRNb2R1bGUgPSBmdW5jdGlvbiAobW9kdWxlKSB7XG4gICAgICAgICAgICB2YXIgbSA9IHRoaXMuZ2V0TW9kdWxlKG1vZHVsZS5jb25zdHJ1Y3Rvcik7XG4gICAgICAgICAgICBpZiAobSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEdXBsaWNhdGVkIGFkZGluZyBmcmFtZXdvcmsgbW9kdWxlOiBcIiArIHR5cGVvZiBtb2R1bGUpOyAvLyBGSVhNRTogRGV0ZWN0aW5nIGhvdyB0byBnZXQgdGhlIGNsYXNzIG5hbWUuXG4gICAgICAgICAgICBnX3BNb2R1bGVzLnB1c2gobW9kdWxlKTtcbiAgICAgICAgICAgIGdfcE1vZHVsZXMgPSBnX3BNb2R1bGVzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICBpZiAoYS5tX2lQcmlvcml0eSA+IGIubV9pUHJpb3JpdHkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChhLm1faVByaW9yaXR5IDwgYi5tX2lQcmlvcml0eSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgRnJhbWV3b3JrTW9kdWxlLnJlbW92ZU1vZHVsZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdfcE1vZHVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wTW9kdWxlID0gZ19wTW9kdWxlc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAodl9wTW9kdWxlICYmIHZfcE1vZHVsZSBpbnN0YW5jZW9mIHR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZ19wTW9kdWxlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2X3BNb2R1bGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIEZyYW1ld29ya01vZHVsZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ19wTW9kdWxlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIHZhciB2X3BNb2R1bGUgPSBnX3BNb2R1bGVzW2ldO1xuICAgICAgICAgICAgICAgIHZfcE1vZHVsZS51cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBGcmFtZXdvcmtNb2R1bGUuc2h1dGRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gZ19wTW9kdWxlcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICAgICAgICAgIHZhciB2X3BNb2R1bGUgPSBnX3BNb2R1bGVzW2ldO1xuICAgICAgICAgICAgICAgIHZfcE1vZHVsZS5zaHV0ZG93bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRnJhbWV3b3JrTW9kdWxlLnByb3RvdHlwZSwgXCJwcmlvcml0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX2lQcmlvcml0eTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gRnJhbWV3b3JrTW9kdWxlO1xuICAgIH0oKSk7IC8vIGNsYXNzIEZyYW1ld29ya01vZHVsZVxuICAgIGV4cG9ydHMuRnJhbWV3b3JrTW9kdWxlID0gRnJhbWV3b3JrTW9kdWxlO1xuICAgIHZhciBGcmFtZXdvcmtTZWdtZW50ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBGcmFtZXdvcmtTZWdtZW50KHNvdXJjZSwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICghc291cmNlKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU291cmNlIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBpZiAob2Zmc2V0IDwgMClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09mZnNldCBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgaWYgKGxlbmd0aCA8PSAwKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTGVuZ3RoIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB0aGlzLm1fdFNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIHRoaXMubV9pT2Zmc2V0ID0gb2Zmc2V0O1xuICAgICAgICAgICAgdGhpcy5tX2lMZW5ndGggPSBsZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZyYW1ld29ya1NlZ21lbnQucHJvdG90eXBlLCBcInNvdXJjZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3RTb3VyY2U7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZyYW1ld29ya1NlZ21lbnQucHJvdG90eXBlLCBcIm9mZnNldFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX2lPZmZzZXQ7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZyYW1ld29ya1NlZ21lbnQucHJvdG90eXBlLCBcImxlbmd0aFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX2lMZW5ndGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIEZyYW1ld29ya1NlZ21lbnQ7XG4gICAgfSgpKTsgLy8gY2xhc3MgRnJhbWV3b3JrU2VnbWVudDxUPlxuICAgIGV4cG9ydHMuRnJhbWV3b3JrU2VnbWVudCA9IEZyYW1ld29ya1NlZ21lbnQ7XG59KTtcbiIsInZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgICAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIiwgXCIuL0Jhc2VcIl0sIGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIHZhciBCYXNlXzEgPSByZXF1aXJlKFwiLi9CYXNlXCIpO1xuICAgIHZhciBDb25maWdNYW5hZ2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICBfX2V4dGVuZHMoQ29uZmlnTWFuYWdlciwgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gQ29uZmlnTWFuYWdlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XG4gICAgICAgICAgICBfdGhpcy5tX3BDb25maWdEYXRhID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZEFzc2V0Q2FsbGJhY2tzID0ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IF90aGlzLmxvYWRDb25maWdTdWNjZXNzQ2FsbGJhY2suYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgZmFpbHVyZTogX3RoaXMubG9hZENvbmZpZ0ZhaWx1cmVDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICB1cGRhdGU6IF90aGlzLmxvYWRDb25maWdVcGRhdGVDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICBkZXBlbmRlbmN5OiBfdGhpcy5sb2FkQ29uZmlnRGVwZW5kZW5jeUFzc2V0Q2FsbGJhY2suYmluZChfdGhpcylcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBfdGhpcy5tX3BMb2FkQ29uZmlnU3VjY2Vzc0RlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRDb25maWdGYWlsdXJlRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZENvbmZpZ1VwZGF0ZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRDb25maWdEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbmZpZ01hbmFnZXIucHJvdG90eXBlLCBcInJlc291cmNlTWFuYWdlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAobnVsbCA9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSZXNvdXJjZSBtYW5hZ2VyIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlciA9IHZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb25maWdNYW5hZ2VyLnByb3RvdHlwZSwgXCJjb25maWdIZWxwZXJcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wQ29uZmlnSGVscGVyO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG51bGwgPT0gdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbmZpZyBoZWxwZXIgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BDb25maWdIZWxwZXIgPSB2YWx1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ29uZmlnTWFuYWdlci5wcm90b3R5cGUsIFwiY29uZmlnQ291bnRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wQ29uZmlnRGF0YS5zaXplO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb25maWdNYW5hZ2VyLnByb3RvdHlwZSwgXCJsb2FkQ29uZmlnU3VjY2Vzc1wiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BMb2FkQ29uZmlnU3VjY2Vzc0RlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb25maWdNYW5hZ2VyLnByb3RvdHlwZSwgXCJsb2FkQ29uZmlnRmFpbHVyZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BMb2FkQ29uZmlnRmFpbHVyZURlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb25maWdNYW5hZ2VyLnByb3RvdHlwZSwgXCJsb2FkQ29uZmlnVXBkYXRlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcExvYWRDb25maWdVcGRhdGVEZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ29uZmlnTWFuYWdlci5wcm90b3R5cGUsIFwibG9hZENvbmZpZ0RlcGVuZGVuY3lBc3NldFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BMb2FkQ29uZmlnRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5wcm90b3R5cGUubG9hZENvbmZpZyA9IGZ1bmN0aW9uIChjb25maWdBc3NldE5hbWUsIGxvYWRUeXBlLCBhbnlBcmcxLCBhbnlBcmcyKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLm1fcFJlc291cmNlTWFuYWdlcikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IHNldCByZXNvdXJjZSBtYW5hZ2VyIGZpcnN0LlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMubV9wQ29uZmlnSGVscGVyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IGNvbmZpZyBoZWxwZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHByaW9yaXR5ID0gMDtcbiAgICAgICAgICAgIHZhciB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmICh1bmRlZmluZWQgIT09IGFueUFyZzEpIHtcbiAgICAgICAgICAgICAgICBpZiAoJ251bWJlcicgPT09IHR5cGVvZiBhbnlBcmcxKVxuICAgICAgICAgICAgICAgICAgICBwcmlvcml0eSA9IGFueUFyZzE7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YSA9IGFueUFyZzE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodW5kZWZpbmVkICE9PSBhbnlBcmcyICYmIG51bGwgPT0gdXNlckRhdGEpIHtcbiAgICAgICAgICAgICAgICB1c2VyRGF0YSA9IGFueUFyZzI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlci5sb2FkQXNzZXQoY29uZmlnQXNzZXROYW1lLCBwcmlvcml0eSwgdGhpcy5tX3BMb2FkQXNzZXRDYWxsYmFja3MsIHsgbG9hZFR5cGU6IGxvYWRUeXBlLCB1c2VyRGF0YTogdXNlckRhdGEgfSk7XG4gICAgICAgIH07XG4gICAgICAgIC8vIE5PVEU6IEFueSBqYXZhc2NyaXB0L3R5cGVzY3JpcHQgc3RyZWFtIGltcGxlbWVudGF0aW9uP1xuICAgICAgICBDb25maWdNYW5hZ2VyLnByb3RvdHlwZS5wYXJzZUNvbmZpZyA9IGZ1bmN0aW9uICh0ZXh0T3JCdWZmZXIsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoIXRleHRPckJ1ZmZlcikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgY29uZmlnIGRhdGEgZGV0ZWN0ZWQhXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BDb25maWdIZWxwZXIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgY29uZmlnIGhlbHBlciBmaXJzdC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1c2VyRGF0YSA9IHVzZXJEYXRhIHx8IG51bGw7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcENvbmZpZ0hlbHBlci5wYXJzZUNvbmZpZyh0ZXh0T3JCdWZmZXIsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5wcm90b3R5cGUuaGFzQ29uZmlnID0gZnVuY3Rpb24gKGNvbmZpZ05hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldENvbmZpZyhjb25maWdOYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5wcm90b3R5cGUuYWRkQ29uZmlnID0gZnVuY3Rpb24gKGNvbmZpZ05hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5oYXNDb25maWcoY29uZmlnTmFtZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcENvbmZpZ0RhdGEuc2V0KGNvbmZpZ05hbWUsIHZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuICAgICAgICBDb25maWdNYW5hZ2VyLnByb3RvdHlwZS5yZW1vdmVDb25maWcgPSBmdW5jdGlvbiAoY29uZmlnTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wQ29uZmlnRGF0YS5kZWxldGUoY29uZmlnTmFtZSk7XG4gICAgICAgIH07XG4gICAgICAgIENvbmZpZ01hbmFnZXIucHJvdG90eXBlLnJlbW92ZUFsbENvbmZpZ3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLm1fcENvbmZpZ0RhdGEuY2xlYXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5wcm90b3R5cGUuZ2V0Q29uZmlnID0gZnVuY3Rpb24gKGNvbmZpZ05hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcENvbmZpZ0RhdGEuZ2V0KGNvbmZpZ05hbWUpO1xuICAgICAgICB9O1xuICAgICAgICBDb25maWdNYW5hZ2VyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIC8vIE5PT1AuXG4gICAgICAgIH07XG4gICAgICAgIENvbmZpZ01hbmFnZXIucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gTk9PUC5cbiAgICAgICAgfTtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5wcm90b3R5cGUubG9hZENvbmZpZ1N1Y2Nlc3NDYWxsYmFjayA9IGZ1bmN0aW9uIChjb25maWdBc3NldE5hbWUsIGNvbmZpZ0Fzc2V0LCBkdXJhdGlvbiwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BJbmZvKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTG9hZCBjb25maWcgaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm1fcENvbmZpZ0hlbHBlci5sb2FkQ29uZmlnKGNvbmZpZ0Fzc2V0LCB2X3BJbmZvLmxvYWRUeXBlLCB2X3BJbmZvLnVzZXJEYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2FkIGNvbmZpZyBmYWlsdXJlIGluIGhlbHBlciwgYXNzZXQgbmFtZSAnXCIgKyBjb25maWdBc3NldE5hbWUgKyBcIidcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWRDb25maWdTdWNjZXNzRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRDb25maWdTdWNjZXNzRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihjb25maWdBc3NldE5hbWUsIHZfcEluZm8ubG9hZFR5cGUsIGR1cmF0aW9uLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkQ29uZmlnRmFpbHVyZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkQ29uZmlnRmFpbHVyZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oY29uZmlnQXNzZXROYW1lLCB2X3BJbmZvLmxvYWRUeXBlLCBlLnRvU3RyaW5nKCksIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BDb25maWdIZWxwZXIucmVsZWFzZUNvbmZpZ0Fzc2V0KGNvbmZpZ0Fzc2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5wcm90b3R5cGUubG9hZENvbmZpZ0ZhaWx1cmVDYWxsYmFjayA9IGZ1bmN0aW9uIChjb25maWdBc3NldE5hbWUsIHN0YXR1cywgZXJyb3JNZXNzYWdlLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcEluZm8pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2FkIGNvbmZpZyBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGFwcGVuZEVycm9yTWVzc2FnZSA9IFwiTG9hZCBjb25maWcgZmFpbHVyZSwgYXNzZXQgbmFtZSAnXCIgKyBjb25maWdBc3NldE5hbWUgKyBcIicsIHN0YXR1cyAnXCIgKyBzdGF0dXMgKyBcIicsIGVycm9yIG1lc3NhZ2UgJ1wiICsgZXJyb3JNZXNzYWdlICsgXCInLlwiO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wTG9hZENvbmZpZ0ZhaWx1cmVEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkQ29uZmlnRmFpbHVyZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihjb25maWdBc3NldE5hbWUsIHZfcEluZm8ubG9hZFR5cGUsIGFwcGVuZEVycm9yTWVzc2FnZSwgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGFwcGVuZEVycm9yTWVzc2FnZSk7XG4gICAgICAgIH07XG4gICAgICAgIENvbmZpZ01hbmFnZXIucHJvdG90eXBlLmxvYWRDb25maWdVcGRhdGVDYWxsYmFjayA9IGZ1bmN0aW9uIChjb25maWdBc3NldE5hbWUsIHByb2dyZXNzLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcEluZm8pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2FkIGNvbmZpZyBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubV9wTG9hZENvbmZpZ1VwZGF0ZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRDb25maWdVcGRhdGVEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oY29uZmlnQXNzZXROYW1lLCB2X3BJbmZvLmxvYWRUeXBlLCBwcm9ncmVzcywgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIENvbmZpZ01hbmFnZXIucHJvdG90eXBlLmxvYWRDb25maWdEZXBlbmRlbmN5QXNzZXRDYWxsYmFjayA9IGZ1bmN0aW9uIChjb25maWdBc3NldE5hbWUsIGRlcGVuZGVuY3lBc3NldE5hbWUsIGxvYWRlZENvdW50LCB0b3RhbENvdW50LCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcEluZm8pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2FkIGNvbmZpZyBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubV9wTG9hZENvbmZpZ0RlcGVuZGVuY3lBc3NldERlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRDb25maWdEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oY29uZmlnQXNzZXROYW1lLCBkZXBlbmRlbmN5QXNzZXROYW1lLCBsb2FkZWRDb3VudCwgdG90YWxDb3VudCwgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBDb25maWdNYW5hZ2VyO1xuICAgIH0oQmFzZV8xLkZyYW1ld29ya01vZHVsZSkpOyAvLyBjbGFzcyBDb25maWdNYW5hZ2VyXG4gICAgZXhwb3J0cy5Db25maWdNYW5hZ2VyID0gQ29uZmlnTWFuYWdlcjtcbn0pO1xuIiwidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgdmFyIEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XG4gICAgdmFyIERhdGFOb2RlTWFuYWdlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgX19leHRlbmRzKERhdGFOb2RlTWFuYWdlciwgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gRGF0YU5vZGVNYW5hZ2VyKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIERhdGFOb2RlTWFuYWdlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgRGF0YU5vZGVNYW5hZ2VyLnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBub3QgaW1wbGVtZW50ZWQuXCIpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gRGF0YU5vZGVNYW5hZ2VyO1xuICAgIH0oQmFzZV8xLkZyYW1ld29ya01vZHVsZSkpOyAvLyBjbGFzcyBEYXRhTm9kZU1hbmFnZXJcbiAgICBleHBvcnRzLkRhdGFOb2RlTWFuYWdlciA9IERhdGFOb2RlTWFuYWdlcjtcbn0pO1xuIiwidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG52YXIgX192YWx1ZXMgPSAodGhpcyAmJiB0aGlzLl9fdmFsdWVzKSB8fCBmdW5jdGlvbihvKSB7XG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcbiAgICBpZiAobyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHJldHVybiB7XG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IocyA/IFwiT2JqZWN0IGlzIG5vdCBpdGVyYWJsZS5cIiA6IFwiU3ltYm9sLml0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcbn07XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgdmFyIEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XG4gICAgdmFyIERhdGFUYWJsZUJhc2UgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZ1bmN0aW9uIERhdGFUYWJsZUJhc2UobmFtZSkge1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUgfHwgJyc7XG4gICAgICAgICAgICB0aGlzLm1fc05hbWUgPSBuYW1lO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRhVGFibGVCYXNlLnByb3RvdHlwZSwgXCJuYW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3NOYW1lOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIERhdGFUYWJsZUJhc2U7XG4gICAgfSgpKTsgLy8gY2xhc3MgRGF0YVRhYmxlQmFzZVxuICAgIGV4cG9ydHMuRGF0YVRhYmxlQmFzZSA9IERhdGFUYWJsZUJhc2U7XG4gICAgdmFyIERhdGFUYWJsZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgX19leHRlbmRzKERhdGFUYWJsZSwgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gRGF0YVRhYmxlKG5hbWUpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIG5hbWUpIHx8IHRoaXM7XG4gICAgICAgICAgICBfdGhpcy5tX3BEYXRhU2V0ID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRhVGFibGUucHJvdG90eXBlLCBcIm1pbklkRGF0YVJvd1wiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wTWluSWREYXRhUm93OyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KERhdGFUYWJsZS5wcm90b3R5cGUsIFwibWF4SWREYXRhUm93XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BNYXhJZERhdGFSb3c7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBEYXRhVGFibGUucHJvdG90eXBlLmhhc0RhdGFSb3cgPSBmdW5jdGlvbiAocHJlZCkge1xuICAgICAgICAgICAgdmFyIGVfMSwgX2E7XG4gICAgICAgICAgICB2YXIgdl9pZHg7XG4gICAgICAgICAgICBpZiAoJ251bWJlcicgPT09IHR5cGVvZiBwcmVkKSB7XG4gICAgICAgICAgICAgICAgdl9pZHggPSBwcmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHVuZGVmaW5lZCAhPSB2X2lkeCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcERhdGFTZXQuaGFzKHZfaWR4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BEYXRhU2V0LmtleXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMubV9wRGF0YVNldC5nZXQoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcmVkKHZhbHVlLCBrZXksIHRoaXMubV9wRGF0YVNldC52YWx1ZXMoKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV8xXzEpIHsgZV8xID0geyBlcnJvcjogZV8xXzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIERhdGFUYWJsZS5wcm90b3R5cGUuZ2V0RGF0YVJvdyA9IGZ1bmN0aW9uIChwcmVkKSB7XG4gICAgICAgICAgICB2YXIgZV8yLCBfYTtcbiAgICAgICAgICAgIHZhciB2X2lkeDtcbiAgICAgICAgICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIHByZWQpIHtcbiAgICAgICAgICAgICAgICB2X2lkeCA9IHByZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodW5kZWZpbmVkICE9IHZfaWR4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wRGF0YVNldC5nZXQodl9pZHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRGF0YVNldC5rZXlzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5tX3BEYXRhU2V0LmdldChrZXkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJlZCh2YWx1ZSwga2V5LCB0aGlzLm1fcERhdGFTZXQudmFsdWVzKCkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8yXzEpIHsgZV8yID0geyBlcnJvcjogZV8yXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMikgdGhyb3cgZV8yLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlLnByb3RvdHlwZS5nZXREYXRhUm93cyA9IGZ1bmN0aW9uIChwcmVkLCByZXN1bHRzKSB7XG4gICAgICAgICAgICB2YXIgZV8zLCBfYTtcbiAgICAgICAgICAgIGlmICghcHJlZClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbmRpdGlvbiBwcmVkaWNhdGUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzIHx8IFtdO1xuICAgICAgICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHJlc3VsdHMuc3BsaWNlKDAsIHJlc3VsdHMubGVuZ3RoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcERhdGFTZXQua2V5cygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMubV9wRGF0YVNldC5nZXQoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZWQodmFsdWUsIGtleSwgdGhpcy5tX3BEYXRhU2V0LnZhbHVlcygpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfM18xKSB7IGVfMyA9IHsgZXJyb3I6IGVfM18xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzMpIHRocm93IGVfMy5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICAgIERhdGFUYWJsZS5wcm90b3R5cGUuZ2V0QWxsRGF0YVJvd3MgPSBmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgICAgICAgdmFyIGVfNCwgX2E7XG4gICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cyB8fCBbXTtcbiAgICAgICAgICAgIGlmIChyZXN1bHRzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5zcGxpY2UoMCwgcmVzdWx0cy5sZW5ndGgpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRGF0YVNldC52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfNF8xKSB7IGVfNCA9IHsgZXJyb3I6IGVfNF8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzQpIHRocm93IGVfNC5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRhVGFibGUucHJvdG90eXBlLCBcImNvdW50XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcERhdGFTZXQuc2l6ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBEYXRhVGFibGUucHJvdG90eXBlLmFkZERhdGFSb3cgPSBmdW5jdGlvbiAocm93VHlwZSwgcm93U2VnbWVudCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wRGF0YVJvdyA9IG5ldyByb3dUeXBlKCk7XG4gICAgICAgICAgICAgICAgaWYgKCF2X3BEYXRhUm93LnBhcnNlRGF0YVJvdyhyb3dTZWdtZW50KSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxBZGREYXRhUm93KHZfcERhdGFSb3cpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlLnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMubV9wRGF0YVNldC5jbGVhcigpO1xuICAgICAgICB9O1xuICAgICAgICBEYXRhVGFibGUucHJvdG90eXBlLmludGVybmFsQWRkRGF0YVJvdyA9IGZ1bmN0aW9uIChkYXRhUm93KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5oYXNEYXRhUm93KGRhdGFSb3cuaWQpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQWxyZWFkeSBleGlzdCAnXCIgKyBkYXRhUm93LmlkICsgXCInIGluIGRhdGEgdGFibGUgJ1wiICsgbmFtZSArIFwiJ1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wRGF0YVNldC5zZXQoZGF0YVJvdy5pZCwgZGF0YVJvdyk7XG4gICAgICAgICAgICBpZiAoIXRoaXMubV9wTWluSWREYXRhUm93IHx8IHRoaXMubV9wTWluSWREYXRhUm93LmlkID4gZGF0YVJvdy5pZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTWluSWREYXRhUm93ID0gZGF0YVJvdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BNYXhJZERhdGFSb3cgfHwgdGhpcy5tX3BNYXhJZERhdGFSb3cuaWQgPCBkYXRhUm93LmlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BNYXhJZERhdGFSb3cgPSBkYXRhUm93O1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gRGF0YVRhYmxlO1xuICAgIH0oRGF0YVRhYmxlQmFzZSkpOyAvLyBjbGFzcyBEYXRhVGFibGVcbiAgICB2YXIgRGF0YVRhYmxlTWFuYWdlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgX19leHRlbmRzKERhdGFUYWJsZU1hbmFnZXIsIF9zdXBlcik7XG4gICAgICAgIGZ1bmN0aW9uIERhdGFUYWJsZU1hbmFnZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgICAgICAgICAgIF90aGlzLm1fcERhdGFUYWJsZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWREYXRhVGFibGVTdWNjZXNzRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZERhdGFUYWJsZUZhaWx1cmVEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BMb2FkRGF0YVRhYmxlVXBkYXRlRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZERhdGFUYWJsZURlcGVuZGVuY3lBc3NldERlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRBc3NldENhbGxiYWNrcyA9IHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBfdGhpcy5sb2FkRGF0YVRhYmxlU3VjY2Vzc0NhbGxiYWNrLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIGZhaWx1cmU6IF90aGlzLmxvYWREYXRhVGFibGVGYWlsdXJlQ2FsbGJhY2suYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgdXBkYXRlOiBfdGhpcy5sb2FkRGF0YVRhYmxlVXBkYXRlQ2FsbGJhY2suYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgZGVwZW5kZW5jeTogX3RoaXMubG9hZERhdGFUYWJsZURlcGVuZGVuY3lBc3NldENhbGxiYWNrLmJpbmQoX3RoaXMpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRhVGFibGVNYW5hZ2VyLnByb3RvdHlwZSwgXCJyZXNvdXJjZU1hbmFnZXJcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFJlc291cmNlTWFuYWdlcjsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUsIFwibG9hZERhdGFUYWJsZVN1Y2Nlc3NcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wTG9hZERhdGFUYWJsZVN1Y2Nlc3NEZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUsIFwibG9hZERhdGFUYWJsZUZhaWx1cmVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wTG9hZERhdGFUYWJsZUZhaWx1cmVEZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUsIFwibG9hZERhdGFUYWJsZVVwZGF0ZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BMb2FkRGF0YVRhYmxlVXBkYXRlRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KERhdGFUYWJsZU1hbmFnZXIucHJvdG90eXBlLCBcIkxvYWREYXRhVGFibGVEZXBlbmRlbmN5QXNzZXRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wTG9hZERhdGFUYWJsZURlcGVuZGVuY3lBc3NldERlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRhVGFibGVNYW5hZ2VyLnByb3RvdHlwZSwgXCJjb3VudFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BEYXRhVGFibGUuc2l6ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUsIFwiZGF0YVRhYmxlSGVscGVyXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcERhdGFUYWJsZUhlbHBlcjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRGF0YVRhYmxlSGVscGVyID0gdmFsdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUubG9hZERhdGFUYWJsZSA9IGZ1bmN0aW9uIChkYXRhVGFibGVBc3NldE5hbWUsIGxvYWRUeXBlLCBhbnlBcmcxLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1fcFJlc291cmNlTWFuYWdlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgcmVzb3VyY2UgbWFuYWdlciBmaXJzdC5cIik7XG4gICAgICAgICAgICBpZiAoIXRoaXMubV9wRGF0YVRhYmxlSGVscGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IHNldCBkYXRhIHRhYmxlIGhlbHBlciBmaXJzdC5cIik7XG4gICAgICAgICAgICB2YXIgcHJpb3JpdHkgPSAwO1xuICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2YgYW55QXJnMSkge1xuICAgICAgICAgICAgICAgIHByaW9yaXR5ID0gYW55QXJnMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHVuZGVmaW5lZCAhPSBhbnlBcmcxICYmIHVuZGVmaW5lZCA9PSB1c2VyRGF0YSkge1xuICAgICAgICAgICAgICAgIHVzZXJEYXRhID0gYW55QXJnMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVzZXJEYXRhID0gdXNlckRhdGEgfHwgbnVsbDtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0ge1xuICAgICAgICAgICAgICAgIGxvYWRUeXBlOiBsb2FkVHlwZSxcbiAgICAgICAgICAgICAgICB1c2VyRGF0YTogdXNlckRhdGFcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlci5sb2FkQXNzZXQoZGF0YVRhYmxlQXNzZXROYW1lLCBwcmlvcml0eSwgdGhpcy5tX3BMb2FkQXNzZXRDYWxsYmFja3MsIHZfcEluZm8pO1xuICAgICAgICB9O1xuICAgICAgICBEYXRhVGFibGVNYW5hZ2VyLnByb3RvdHlwZS5oYXNEYXRhVGFibGUgPSBmdW5jdGlvbiAoZGF0YVRhYmxlQXNzZXROYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbEhhc0RhdGFUYWJsZShkYXRhVGFibGVBc3NldE5hbWUpO1xuICAgICAgICB9O1xuICAgICAgICBEYXRhVGFibGVNYW5hZ2VyLnByb3RvdHlwZS5nZXREYXRhVGFibGUgPSBmdW5jdGlvbiAoZGF0YVRhYmxlQXNzZXROYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbEdldERhdGFUYWJsZShkYXRhVGFibGVBc3NldE5hbWUgfHwgJycpO1xuICAgICAgICB9O1xuICAgICAgICBEYXRhVGFibGVNYW5hZ2VyLnByb3RvdHlwZS5nZXRBbGxEYXRhVGFibGVzID0gZnVuY3Rpb24gKHJlc3VsdHMpIHtcbiAgICAgICAgICAgIHZhciBlXzUsIF9hO1xuICAgICAgICAgICAgdmFyIHZfcFJldCA9IHJlc3VsdHMgfHwgW107XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BEYXRhVGFibGUudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkdCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB2X3BSZXQucHVzaChkdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfNV8xKSB7IGVfNSA9IHsgZXJyb3I6IGVfNV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzUpIHRocm93IGVfNS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZfcFJldDtcbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUuY3JlYXRlRGF0YVRhYmxlID0gZnVuY3Rpb24gKHR5cGUsIGFueUFyZzEsIGFueUFyZzIpIHtcbiAgICAgICAgICAgIHZhciBjb250ZW50O1xuICAgICAgICAgICAgdmFyIG5hbWU7XG4gICAgICAgICAgICBpZiAodW5kZWZpbmVkICE9PSBhbnlBcmcyKSB7XG4gICAgICAgICAgICAgICAgY29udGVudCA9IGFueUFyZzI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY29udGVudCkge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBhbnlBcmcxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmFtZSA9IG5hbWUgfHwgJyc7XG4gICAgICAgICAgICB2YXIgdl9wRGF0YVRhYmxlID0gbmV3IERhdGFUYWJsZSgpO1xuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbENyZWF0ZURhdGFUYWJsZSh0eXBlLCB2X3BEYXRhVGFibGUsIGNvbnRlbnQpO1xuICAgICAgICAgICAgdGhpcy5tX3BEYXRhVGFibGUuc2V0KG5hbWUsIHZfcERhdGFUYWJsZSk7XG4gICAgICAgICAgICByZXR1cm4gdl9wRGF0YVRhYmxlO1xuICAgICAgICB9O1xuICAgICAgICBEYXRhVGFibGVNYW5hZ2VyLnByb3RvdHlwZS5kZXN0cm95RGF0YVRhYmxlID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmludGVybmFsRGVzdHJveURhdGFUYWJsZShuYW1lIHx8ICcnKTtcbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUuaW50ZXJuYWxIYXNEYXRhVGFibGUgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wRGF0YVRhYmxlLmhhcyhuYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUuaW50ZXJuYWxHZXREYXRhVGFibGUgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wRGF0YVRhYmxlLmdldChuYW1lKSB8fCBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBEYXRhVGFibGVNYW5hZ2VyLnByb3RvdHlwZS5pbnRlcm5hbENyZWF0ZURhdGFUYWJsZSA9IGZ1bmN0aW9uIChyb3dUeXBlLCBkYXRhVGFibGUsIGNvbnRlbnQpIHtcbiAgICAgICAgICAgIHZhciBlXzYsIF9hO1xuICAgICAgICAgICAgdmFyIHZfcEl0ZXJhdG9yO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2X3BJdGVyYXRvciA9IHRoaXMubV9wRGF0YVRhYmxlSGVscGVyLmdldERhdGFSb3dTZWdtZW50cyhjb250ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGdldCBkYXRhIHJvdyBzZWdtZW50cyB3aXRoIGV4Y2VwdGlvbjogJ1wiICsgZSArIFwiJy5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXZfcEl0ZXJhdG9yKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXRhIHJvdyBzZWdtZW50cyBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB2X3BJdGVyYXRvcl8xID0gX192YWx1ZXModl9wSXRlcmF0b3IpLCB2X3BJdGVyYXRvcl8xXzEgPSB2X3BJdGVyYXRvcl8xLm5leHQoKTsgIXZfcEl0ZXJhdG9yXzFfMS5kb25lOyB2X3BJdGVyYXRvcl8xXzEgPSB2X3BJdGVyYXRvcl8xLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YVJvd1NlZ21lbnQgPSB2X3BJdGVyYXRvcl8xXzEudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZGF0YVRhYmxlLmFkZERhdGFSb3cocm93VHlwZSwgZGF0YVJvd1NlZ21lbnQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBZGQgZGF0YSByb3cgZmFpbHVyZS4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV82XzEpIHsgZV82ID0geyBlcnJvcjogZV82XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEl0ZXJhdG9yXzFfMSAmJiAhdl9wSXRlcmF0b3JfMV8xLmRvbmUgJiYgKF9hID0gdl9wSXRlcmF0b3JfMS5yZXR1cm4pKSBfYS5jYWxsKHZfcEl0ZXJhdG9yXzEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNikgdGhyb3cgZV82LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIERhdGFUYWJsZU1hbmFnZXIucHJvdG90eXBlLmludGVybmFsRGVzdHJveURhdGFUYWJsZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICB2YXIgdl9wRGF0YVRhYmxlID0gdGhpcy5tX3BEYXRhVGFibGUuZ2V0KG5hbWUpO1xuICAgICAgICAgICAgaWYgKHZfcERhdGFUYWJsZSkge1xuICAgICAgICAgICAgICAgIHZfcERhdGFUYWJsZS5zaHV0ZG93bigpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcERhdGFUYWJsZS5kZWxldGUobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIERhdGFUYWJsZU1hbmFnZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgLy8gTk9PUC5cbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUuc2h1dGRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZV83LCBfYTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcERhdGFUYWJsZS52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGR0ID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGR0LnNodXRkb3duKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfN18xKSB7IGVfNyA9IHsgZXJyb3I6IGVfN18xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzcpIHRocm93IGVfNy5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3BEYXRhVGFibGUuY2xlYXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUubG9hZERhdGFUYWJsZVN1Y2Nlc3NDYWxsYmFjayA9IGZ1bmN0aW9uIChkYXRhVGFibGVBc3NldE5hbWUsIGRhdGFUYWJsZUFzc2V0LCBkdXJhdGlvbiwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAoIXZfcEluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTG9hZCBkYXRhIHRhYmxlIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5tX3BEYXRhVGFibGVIZWxwZXIubG9hZERhdGFUYWJsZShkYXRhVGFibGVBc3NldCwgdl9wSW5mby5sb2FkVHlwZSwgdl9wSW5mby51c2VyRGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTG9hZCBkYXRhIHRhYmxlIGZhaWx1cmUgaW4gaGVscGVyLCBhc3NldCBuYW1lICdcIiArIGRhdGFUYWJsZUFzc2V0TmFtZSArIFwiJy5cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWREYXRhVGFibGVTdWNjZXNzRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWREYXRhVGFibGVTdWNjZXNzRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihkYXRhVGFibGVBc3NldE5hbWUsIHZfcEluZm8ubG9hZFR5cGUsIGR1cmF0aW9uLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIEVycm9yICYmIHRoaXMubV9wTG9hZERhdGFUYWJsZUZhaWx1cmVEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZERhdGFUYWJsZUZhaWx1cmVEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGRhdGFUYWJsZUFzc2V0TmFtZSwgdl9wSW5mby5sb2FkVHlwZSwgZS5tZXNzYWdlLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIC8vIHJlbGVhc2VcbiAgICAgICAgICAgICAgICB0aGlzLm1fcERhdGFUYWJsZUhlbHBlci5yZWxlYXNlRGF0YVRhYmxlQXNzZXQoZGF0YVRhYmxlQXNzZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBEYXRhVGFibGVNYW5hZ2VyLnByb3RvdHlwZS5sb2FkRGF0YVRhYmxlRmFpbHVyZUNhbGxiYWNrID0gZnVuY3Rpb24gKGRhdGFUYWJsZUFzc2V0TmFtZSwgc3RhdHVzLCBlcnJvck1lc3NhZ2UsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKCF2X3BJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgZGF0YSB0YWJsZSBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgdmFyIHZfc0Vycm9yTWVzc2FnZSA9IFwiTG9hZCBkYXRhIHRhYmxlIGZhaWx1cmUsIGFzc2V0IG5hbWUgJ1wiICsgZGF0YVRhYmxlQXNzZXROYW1lICsgXCInLCBzdGF0dXMgJ1wiICsgc3RhdHVzICsgXCInLCBlcnJvciBtZXNzYWdlICdcIiArIGVycm9yTWVzc2FnZSArIFwiJy5cIjtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWREYXRhVGFibGVGYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZERhdGFUYWJsZUZhaWx1cmVEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oZGF0YVRhYmxlQXNzZXROYW1lLCB2X3BJbmZvLmxvYWRUeXBlLCB2X3NFcnJvck1lc3NhZ2UsIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih2X3NFcnJvck1lc3NhZ2UpO1xuICAgICAgICB9O1xuICAgICAgICBEYXRhVGFibGVNYW5hZ2VyLnByb3RvdHlwZS5sb2FkRGF0YVRhYmxlVXBkYXRlQ2FsbGJhY2sgPSBmdW5jdGlvbiAoZGF0YVRhYmxlQXNzZXROYW1lLCBwcm9ncmVzcywgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAoIXZfcEluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTG9hZCBkYXRhIHRhYmxlIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkRGF0YVRhYmxlVXBkYXRlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZERhdGFUYWJsZVVwZGF0ZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihkYXRhVGFibGVBc3NldE5hbWUsIHZfcEluZm8ubG9hZFR5cGUsIHByb2dyZXNzLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUubG9hZERhdGFUYWJsZURlcGVuZGVuY3lBc3NldENhbGxiYWNrID0gZnVuY3Rpb24gKGRhdGFUYWJsZUFzc2V0TmFtZSwgZGVwZW5kZW5jeUFzc2V0TmFtZSwgbG9hZGVkQ291bnQsIHRvdGFsQ291bnQsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKCF2X3BJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgZGF0YSB0YWJsZSBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wTG9hZERhdGFUYWJsZURlcGVuZGVuY3lBc3NldERlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWREYXRhVGFibGVEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oZGF0YVRhYmxlQXNzZXROYW1lLCBkZXBlbmRlbmN5QXNzZXROYW1lLCBsb2FkZWRDb3VudCwgdG90YWxDb3VudCwgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBEYXRhVGFibGVNYW5hZ2VyO1xuICAgIH0oQmFzZV8xLkZyYW1ld29ya01vZHVsZSkpOyAvLyBjbGFzcyBEYXRhVGFibGVNYW5hZ2VyXG4gICAgZXhwb3J0cy5EYXRhVGFibGVNYW5hZ2VyID0gRGF0YVRhYmxlTWFuYWdlcjtcbn0pO1xuIiwidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgdmFyIEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XG4gICAgLyoqXG4gICAgICogQSBzaW1wbGUgZXZlbnQgbWFuYWdlciBpbXBsZW1lbnRhdGlvbi5cbiAgICAgKlxuICAgICAqIEBhdXRob3IgSmVyZW15IENoZW4gKGtleWhvbS5jQGdtYWlsLmNvbSlcbiAgICAgKi9cbiAgICB2YXIgRXZlbnRNYW5hZ2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICBfX2V4dGVuZHMoRXZlbnRNYW5hZ2VyLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBFdmVudE1hbmFnZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgICAgICAgICAgIF90aGlzLm1fcEV2ZW50SGFuZGxlcnMgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEV2ZW50TWFuYWdlci5wcm90b3R5cGUsIFwicHJpb3JpdHlcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDEwMDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRXZlbnRNYW5hZ2VyLnByb3RvdHlwZSwgXCJldmVudENvdW50XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIEV2ZW50TWFuYWdlci5wcm90b3R5cGUuY291bnQgPSBmdW5jdGlvbiAoZXZlbnRJZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wRXZlbnRIYW5kbGVycy5oYXMoZXZlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wRXZlbnRIYW5kbGVyID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIGlmICgodl9wRXZlbnRIYW5kbGVyID0gdGhpcy5tX3BFdmVudEhhbmRsZXJzLmdldChldmVudElkKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZfcEV2ZW50SGFuZGxlci5zaXplO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9O1xuICAgICAgICBFdmVudE1hbmFnZXIucHJvdG90eXBlLmNoZWNrID0gZnVuY3Rpb24gKGV2ZW50SWQsIGhhbmRsZXIsIHRhcmdldCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wRXZlbnRIYW5kbGVycy5oYXMoZXZlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wRXZlbnRIYW5kbGVyID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyICYmICh2X3BFdmVudEhhbmRsZXIgPSB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50SWQpKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdl9wRXZlbnRIYW5kbGVyLmhhcyhoYW5kbGVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIEV2ZW50TWFuYWdlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXZlbnRJZCwgaGFuZGxlciwgdGFyZ2V0KSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMubV9wRXZlbnRIYW5kbGVycy5oYXMoZXZlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuc2V0KGV2ZW50SWQsIG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZfcEV2ZW50SGFuZGxlcjtcbiAgICAgICAgICAgIGlmICgodl9wRXZlbnRIYW5kbGVyID0gdGhpcy5tX3BFdmVudEhhbmRsZXJzLmdldChldmVudElkKSkpIHtcbiAgICAgICAgICAgICAgICB2X3BFdmVudEhhbmRsZXIuYWRkKGhhbmRsZXIsIHRhcmdldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIEV2ZW50TWFuYWdlci5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gKGV2ZW50SWQsIGhhbmRsZXIsIHRhcmdldCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wRXZlbnRIYW5kbGVycy5oYXMoZXZlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wRXZlbnRIYW5kbGVyID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIGlmICgodl9wRXZlbnRIYW5kbGVyID0gdGhpcy5tX3BFdmVudEhhbmRsZXJzLmdldChldmVudElkKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdl9wRXZlbnRIYW5kbGVyLnJlbW92ZShoYW5kbGVyLCB0YXJnZXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRXZlbnRNYW5hZ2VyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gKGV2ZW50SWQpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDE7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgIGFyZ3NbX2kgLSAxXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElkKSkge1xuICAgICAgICAgICAgICAgIHZhciB2X3BFdmVudEhhbmRsZXIgPSB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50SWQpO1xuICAgICAgICAgICAgICAgIGlmICh2X3BFdmVudEhhbmRsZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdl9wRXZlbnRIYW5kbGVyLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRXZlbnRNYW5hZ2VyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIC8vIE5PT1AuXG4gICAgICAgIH07XG4gICAgICAgIEV2ZW50TWFuYWdlci5wcm90b3R5cGUuc2h1dGRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BFdmVudEhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BFdmVudEhhbmRsZXJzLmZvckVhY2goZnVuY3Rpb24gKGVoLCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgZWguY2xlYXIoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuY2xlYXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIEV2ZW50TWFuYWdlcjtcbiAgICB9KEJhc2VfMS5GcmFtZXdvcmtNb2R1bGUpKTsgLy8gY2xhc3MgRXZlbnRNYW5hZ2VyXG4gICAgZXhwb3J0cy5FdmVudE1hbmFnZXIgPSBFdmVudE1hbmFnZXI7XG59KTtcbiIsInZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgICAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xudmFyIF9fdmFsdWVzID0gKHRoaXMgJiYgdGhpcy5fX3ZhbHVlcykgfHwgZnVuY3Rpb24obykge1xuICAgIHZhciBzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciwgbSA9IHMgJiYgb1tzXSwgaSA9IDA7XG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xuICAgICAgICB9XG4gICAgfTtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XG59O1xuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIiwgXCIuL0Jhc2VcIl0sIGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIHZhciBCYXNlXzEgPSByZXF1aXJlKFwiLi9CYXNlXCIpO1xuICAgIHZhciBGc21TdGF0ZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gRnNtU3RhdGUoKSB7XG4gICAgICAgICAgICB0aGlzLm1fcEV2ZW50SGFuZGxlcnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIH1cbiAgICAgICAgRnNtU3RhdGUucHJvdG90eXBlLm9uSW5pdCA9IGZ1bmN0aW9uIChmc20pIHtcbiAgICAgICAgICAgIC8vIE5PT1BcbiAgICAgICAgfTtcbiAgICAgICAgRnNtU3RhdGUucHJvdG90eXBlLm9uRW50ZXIgPSBmdW5jdGlvbiAoZnNtKSB7XG4gICAgICAgICAgICAvLyBOT09QXG4gICAgICAgIH07XG4gICAgICAgIEZzbVN0YXRlLnByb3RvdHlwZS5vblVwZGF0ZSA9IGZ1bmN0aW9uIChmc20sIGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICAvLyBOT09QXG4gICAgICAgIH07XG4gICAgICAgIEZzbVN0YXRlLnByb3RvdHlwZS5vbkxlYXZlID0gZnVuY3Rpb24gKGZzbSwgc2h1dGRvd24pIHtcbiAgICAgICAgICAgIC8vIE5PT1BcbiAgICAgICAgfTtcbiAgICAgICAgRnNtU3RhdGUucHJvdG90eXBlLm9uRGVzdHJveSA9IGZ1bmN0aW9uIChmc20pIHtcbiAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycy5jbGVhcigpO1xuICAgICAgICB9O1xuICAgICAgICBGc21TdGF0ZS5wcm90b3R5cGUuY2hhbmdlU3RhdGUgPSBmdW5jdGlvbiAoZnNtLCB0eXBlKSB7XG4gICAgICAgICAgICBpZiAoIWZzbSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZzbSBpcyBpbnZhbGlkOiBcIiArIGZzbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmc20uY2hhbmdlU3RhdGUodHlwZSk7XG4gICAgICAgIH07XG4gICAgICAgIEZzbVN0YXRlLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIChldmVudElkLCBldmVudEhhbmRsZXIpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IGV2ZW50SGFuZGxlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFdmVudCBoYW5kbGVyIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1fcEV2ZW50SGFuZGxlcnMuaGFzKGV2ZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVoID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuc2V0KGV2ZW50SWQsIGVoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2X3BIYW5kbGVycyA9IHRoaXMubV9wRXZlbnRIYW5kbGVycy5nZXQoZXZlbnRJZCk7XG4gICAgICAgICAgICBpZiAodl9wSGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICB2X3BIYW5kbGVycy5hZGQoZXZlbnRIYW5kbGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRnNtU3RhdGUucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uIChldmVudElkLCBldmVudEhhbmRsZXIpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IGV2ZW50SGFuZGxlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFdmVudCBoYW5kbGVyIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wRXZlbnRIYW5kbGVycy5oYXMoZXZlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wSGFuZGxlcnMgPSB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50SWQpO1xuICAgICAgICAgICAgICAgIGlmICh2X3BIYW5kbGVycykge1xuICAgICAgICAgICAgICAgICAgICB2X3BIYW5kbGVycy5yZW1vdmUoZXZlbnRIYW5kbGVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIEZzbVN0YXRlLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gKGZzbSwgc2VuZGVyLCBldmVudElkLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wRXZlbnRIYW5kbGVycy5oYXMoZXZlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wSGFuZGxlcnMgPSB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50SWQpO1xuICAgICAgICAgICAgICAgIGlmICh2X3BIYW5kbGVycykge1xuICAgICAgICAgICAgICAgICAgICB2X3BIYW5kbGVycy5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGZzbSwgc2VuZGVyLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIEZzbVN0YXRlO1xuICAgIH0oKSk7IC8vIGNsYXNzIEZzbVN0YXRlPFQ+XG4gICAgZXhwb3J0cy5Gc21TdGF0ZSA9IEZzbVN0YXRlO1xuICAgIHZhciBGc20gPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZ1bmN0aW9uIEZzbSgpIHtcbiAgICAgICAgICAgIHRoaXMubV9wU3RhdGVzID0gW107XG4gICAgICAgICAgICB0aGlzLm1fcERhdGFzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgdGhpcy5faXNEZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlVGltZSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgRnNtLmNyZWF0ZUZzbSA9IGZ1bmN0aW9uIChuYW1lLCBvd25lciwgc3RhdGVzKSB7XG4gICAgICAgICAgICB2YXIgZV8xLCBfYTtcbiAgICAgICAgICAgIGlmIChudWxsID09IG93bmVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRlNNIG93bmVyIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSBzdGF0ZXMgfHwgc3RhdGVzLmxlbmd0aCA8IDEpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGU00gc3RhdGVzIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB2YXIgdl9wRnNtID0gbmV3IEZzbSgpO1xuICAgICAgICAgICAgdl9wRnNtLm1fc05hbWUgPSBuYW1lO1xuICAgICAgICAgICAgdl9wRnNtLm1fcE93bmVyID0gb3duZXI7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHN0YXRlc18xID0gX192YWx1ZXMoc3RhdGVzKSwgc3RhdGVzXzFfMSA9IHN0YXRlc18xLm5leHQoKTsgIXN0YXRlc18xXzEuZG9uZTsgc3RhdGVzXzFfMSA9IHN0YXRlc18xLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdl9wU3RhdGUgPSBzdGF0ZXNfMV8xLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BTdGF0ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRlNNIHN0YXRlcyBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodl9wRnNtLmhhc1N0YXRlKHZfcFN0YXRlLmNvbnN0cnVjdG9yKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZTTSAnXCIgKyBuYW1lICsgXCInIHN0YXRlICdcIiArIHZfcFN0YXRlICsgXCInIGlzIGFscmVhZHkgZXhpc3QuXCIpO1xuICAgICAgICAgICAgICAgICAgICB2X3BGc20ubV9wU3RhdGVzLnB1c2godl9wU3RhdGUpO1xuICAgICAgICAgICAgICAgICAgICB2X3BTdGF0ZS5vbkluaXQodl9wRnNtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xXzEpIHsgZV8xID0geyBlcnJvcjogZV8xXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXRlc18xXzEgJiYgIXN0YXRlc18xXzEuZG9uZSAmJiAoX2EgPSBzdGF0ZXNfMS5yZXR1cm4pKSBfYS5jYWxsKHN0YXRlc18xKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdl9wRnNtLl9pc0Rlc3Ryb3llZCA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHZfcEZzbTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZzbS5wcm90b3R5cGUsIFwibmFtZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3NOYW1lO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGc20ucHJvdG90eXBlLCBcIm93bmVyXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BPd25lcjsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGc20ucHJvdG90eXBlLCBcImZzbVN0YXRlQ291bnRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFN0YXRlcy5sZW5ndGg7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRnNtLnByb3RvdHlwZSwgXCJpc1J1bm5pbmdcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBudWxsICE9IHRoaXMuX2N1cnJlbnRTdGF0ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGc20ucHJvdG90eXBlLCBcImlzRGVzdHJveWVkXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5faXNEZXN0cm95ZWQ7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRnNtLnByb3RvdHlwZSwgXCJjdXJyZW50U3RhdGVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLl9jdXJyZW50U3RhdGU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRnNtLnByb3RvdHlwZSwgXCJjdXJyZW50U3RhdGVOYW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBDdXJyZW50IHN0YXRlIG5hbWUgP1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTdGF0ZS5uYW1lO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGc20ucHJvdG90eXBlLCBcImN1cnJlbnRTdGF0ZVRpbWVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLl9jdXJyZW50U3RhdGVUaW1lOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgRnNtLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pc1J1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGU00gaXMgcnVubmluZywgY2FuIG5vdCBzdGFydCBhZ2Fpbi5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLmdldFN0YXRlKHR5cGUpO1xuICAgICAgICAgICAgaWYgKCFzdGF0ZSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZTTSAnXCIgKyB0aGlzLm5hbWUgKyBcIicgY2FuIG5vdCBzdGFydCBzdGF0ZSAnXCIgKyB0eXBlLm5hbWUgKyBcIicgd2hpY2ggaXMgbm90IGV4aXN0cy5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGVUaW1lID0gMDtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZSA9IHN0YXRlO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50U3RhdGUub25FbnRlcih0aGlzKTsgLy8gQ2FsbCBpbnRlcm5hbCBmdW5jdGlvbiB3aXRoIGFueSBjYXN0aW5nLlxuICAgICAgICB9O1xuICAgICAgICBGc20ucHJvdG90eXBlLmhhc1N0YXRlID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsICE9IHRoaXMuZ2V0U3RhdGUodHlwZSk7XG4gICAgICAgIH07XG4gICAgICAgIEZzbS5wcm90b3R5cGUuZ2V0U3RhdGUgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1fcFN0YXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciB2X3BTdGF0ZSA9IHRoaXMubV9wU3RhdGVzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChudWxsID09IHZfcFN0YXRlKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBpZiAodl9wU3RhdGUgaW5zdGFuY2VvZiB0eXBlKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdl9wU3RhdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgRnNtLnByb3RvdHlwZS5nZXRBbGxTdGF0ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BTdGF0ZXM7XG4gICAgICAgIH07XG4gICAgICAgIEZzbS5wcm90b3R5cGUuY2hhbmdlU3RhdGUgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9jdXJyZW50U3RhdGUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDdXJyZW50IHN0YXRlIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB2YXIgdl9wU3RhdGUgPSB0aGlzLmdldFN0YXRlKHR5cGUpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wU3RhdGUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRnNtIGNhbiBub3QgY2hhbmdlIHN0YXRlLCBzdGF0ZSBpcyBub3QgZXhpc3Q6IFwiICsgdHlwZSk7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGUub25MZWF2ZSh0aGlzLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGVUaW1lID0gMDtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZSA9IHZfcFN0YXRlO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlLm9uRW50ZXIodGhpcyk7XG4gICAgICAgIH07XG4gICAgICAgIEZzbS5wcm90b3R5cGUuZ2V0RGF0YSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BEYXRhcy5oYXMobmFtZSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wRGF0YXMuZ2V0KG5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIEZzbS5wcm90b3R5cGUuc2V0RGF0YSA9IGZ1bmN0aW9uIChuYW1lLCBkYXRhKSB7XG4gICAgICAgICAgICBpZiAoIW5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXRhIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHRoaXMubV9wRGF0YXMuc2V0KG5hbWUsIGRhdGEpO1xuICAgICAgICB9O1xuICAgICAgICBGc20ucHJvdG90eXBlLnJlbW92ZURhdGEgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgaWYgKCFuYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRGF0YSBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB2YXIgdl9iUmV0ID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BEYXRhcy5oYXMobmFtZSkpIHtcbiAgICAgICAgICAgICAgICB2X2JSZXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRGF0YXMuZGVsZXRlKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZfYlJldDtcbiAgICAgICAgfTtcbiAgICAgICAgRnNtLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMuX2N1cnJlbnRTdGF0ZSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGVUaW1lICs9IGVsYXBzZWQ7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGUub25VcGRhdGUodGhpcywgZWxhcHNlZCwgcmVhbEVsYXBzZWQpO1xuICAgICAgICB9O1xuICAgICAgICBGc20ucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gRklYTUU6IEZpZ3VlIG91dCBhIHdheSB0byByZWxlYXNlIHRoaXMuXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBGc207XG4gICAgfSgpKTsgLy8gY2xhc3MgRnNtPFQ+XG4gICAgZXhwb3J0cy5Gc20gPSBGc207XG4gICAgdmFyIEZzbU1hbmFnZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhGc21NYW5hZ2VyLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBGc21NYW5hZ2VyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgICAgICAgICBfdGhpcy5tX3BGc21zID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGc21NYW5hZ2VyLnByb3RvdHlwZSwgXCJwcmlvcml0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gNjA7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZzbU1hbmFnZXIucHJvdG90eXBlLCBcImNvdW50XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcEZzbXMuc2l6ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBGc21NYW5hZ2VyLnByb3RvdHlwZS5oYXNGc20gPSBmdW5jdGlvbiAobmFtZU9yVHlwZSkge1xuICAgICAgICAgICAgdmFyIGVfMiwgX2E7XG4gICAgICAgICAgICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIG5hbWVPclR5cGUgJiYgbmFtZU9yVHlwZS5wcm90b3R5cGUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRnNtcy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmc20gPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChudWxsICE9IGZzbSAmJiBmc20gaW5zdGFuY2VvZiBuYW1lT3JUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVfMl8xKSB7IGVfMiA9IHsgZXJyb3I6IGVfMl8xIH07IH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMikgdGhyb3cgZV8yLmVycm9yOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BGc21zLmhhcyhuYW1lT3JUeXBlLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBGc21NYW5hZ2VyLnByb3RvdHlwZS5nZXRGc20gPSBmdW5jdGlvbiAobmFtZU9yVHlwZSkge1xuICAgICAgICAgICAgdmFyIGVfMywgX2E7XG4gICAgICAgICAgICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIG5hbWVPclR5cGUgJiYgbmFtZU9yVHlwZS5wcm90b3R5cGUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRnNtcy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmc20gPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChudWxsICE9IGZzbSAmJiBmc20gaW5zdGFuY2VvZiBuYW1lT3JUeXBlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmc207XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVfM18xKSB7IGVfMyA9IHsgZXJyb3I6IGVfM18xIH07IH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMykgdGhyb3cgZV8zLmVycm9yOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wRnNtcy5nZXQobmFtZU9yVHlwZS50b1N0cmluZygpKSB8fCBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIEZzbU1hbmFnZXIucHJvdG90eXBlLmdldEFsbEZzbXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZV80LCBfYTtcbiAgICAgICAgICAgIHZhciB2X3BSZXQgPSBbXTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcEZzbXMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmc20gPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdl9wUmV0LnB1c2goZnNtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV80XzEpIHsgZV80ID0geyBlcnJvcjogZV80XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNCkgdGhyb3cgZV80LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdl9wUmV0O1xuICAgICAgICB9O1xuICAgICAgICBGc21NYW5hZ2VyLnByb3RvdHlwZS5jcmVhdGVGc20gPSBmdW5jdGlvbiAobmFtZSwgb3duZXIsIHN0YXRlcykge1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUgfHwgJyc7XG4gICAgICAgICAgICBpZiAodGhpcy5oYXNGc20obmFtZSkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBbHJlYWR5IGV4aXN0IEZTTSAnXCIgKyBuYW1lICsgXCInLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBmc20gPSBGc20uY3JlYXRlRnNtKG5hbWUsIG93bmVyLCBzdGF0ZXMpO1xuICAgICAgICAgICAgdGhpcy5tX3BGc21zLnNldChuYW1lLCBmc20pO1xuICAgICAgICAgICAgcmV0dXJuIGZzbTtcbiAgICAgICAgfTtcbiAgICAgICAgRnNtTWFuYWdlci5wcm90b3R5cGUuZGVzdHJveUZzbSA9IGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgICAgICAgIHZhciBlXzUsIF9hLCBlXzYsIF9iLCBlXzcsIF9jO1xuICAgICAgICAgICAgdmFyIHZfc05hbWU7XG4gICAgICAgICAgICB2YXIgdl9wVHlwZTtcbiAgICAgICAgICAgIHZhciB2X3BJbnN0YW5jZTtcbiAgICAgICAgICAgIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIGFyZykge1xuICAgICAgICAgICAgICAgIHZfc05hbWUgPSBhcmc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgYXJnKSB7XG4gICAgICAgICAgICAgICAgdl9wVHlwZSA9IGFyZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCdvYmplY3QnID09PSB0eXBlb2YgYXJnICYmIGFyZy5jb25zdHJ1Y3Rvcikge1xuICAgICAgICAgICAgICAgIHZfcEluc3RhbmNlID0gYXJnO1xuICAgICAgICAgICAgICAgIHZfcFR5cGUgPSBhcmcuY29uc3RydWN0b3I7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRoaXMuaGFzRnNtKHZfc05hbWUgfHwgdl9wVHlwZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodl9wSW5zdGFuY2UgJiYgT2JqZWN0LmdldFByb3RvdHlwZU9mKHZfcEluc3RhbmNlKS5oYXNPd25Qcm9wZXJ0eSgnc2h1dGRvd24nKSkge1xuICAgICAgICAgICAgICAgIHZfcEluc3RhbmNlLnNodXRkb3duKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobnVsbCAhPSB2X3BJbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9kID0gX192YWx1ZXModGhpcy5tX3BGc21zLmtleXMoKSksIF9lID0gX2QubmV4dCgpOyAhX2UuZG9uZTsgX2UgPSBfZC5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBfZS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2X3BGc20gPSB0aGlzLm1fcEZzbXMuZ2V0KGtleSkgfHwgbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2X3BGc20gPT0gdl9wSW5zdGFuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcEZzbXMuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVfNV8xKSB7IGVfNSA9IHsgZXJyb3I6IGVfNV8xIH07IH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfZSAmJiAhX2UuZG9uZSAmJiAoX2EgPSBfZC5yZXR1cm4pKSBfYS5jYWxsKF9kKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNSkgdGhyb3cgZV81LmVycm9yOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobnVsbCAhPSB2X3NOYW1lKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2YgPSBfX3ZhbHVlcyh0aGlzLm1fcEZzbXMua2V5cygpKSwgX2cgPSBfZi5uZXh0KCk7ICFfZy5kb25lOyBfZyA9IF9mLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IF9nLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZfcEZzbSA9IHRoaXMubV9wRnNtcy5nZXQoa2V5KSB8fCBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF2X3BGc20pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodl9wRnNtLm5hbWUgPT0gdl9zTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubV9wRnNtcy5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV82XzEpIHsgZV82ID0geyBlcnJvcjogZV82XzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9nICYmICFfZy5kb25lICYmIChfYiA9IF9mLnJldHVybikpIF9iLmNhbGwoX2YpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV82KSB0aHJvdyBlXzYuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChudWxsICE9IHZfcFR5cGUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfaCA9IF9fdmFsdWVzKHRoaXMubV9wRnNtcy5rZXlzKCkpLCBfaiA9IF9oLm5leHQoKTsgIV9qLmRvbmU7IF9qID0gX2gubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gX2oudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdl9wRnNtID0gdGhpcy5tX3BGc21zLmdldChrZXkpIHx8IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodl9wRnNtIGluc3RhbmNlb2Ygdl9wVHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubV9wRnNtcy5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV83XzEpIHsgZV83ID0geyBlcnJvcjogZV83XzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9qICYmICFfai5kb25lICYmIChfYyA9IF9oLnJldHVybikpIF9jLmNhbGwoX2gpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV83KSB0aHJvdyBlXzcuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICAgICAgRnNtTWFuYWdlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICB2YXIgZV84LCBfYTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcEZzbXMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZnNtID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZnNtIHx8IGZzbS5pc0Rlc3Ryb3llZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICBmc20udXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV84XzEpIHsgZV84ID0geyBlcnJvcjogZV84XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfOCkgdGhyb3cgZV84LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIEZzbU1hbmFnZXIucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfOSwgX2E7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BGc21zLmtleXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdl9Gc20gPSB0aGlzLm1fcEZzbXMuZ2V0KGtleSkgfHwgbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF2X0ZzbSB8fCB2X0ZzbS5pc0Rlc3Ryb3llZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB2X0ZzbS5zaHV0ZG93bigpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcEZzbXMuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfOV8xKSB7IGVfOSA9IHsgZXJyb3I6IGVfOV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzkpIHRocm93IGVfOS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gRnNtTWFuYWdlcjtcbiAgICB9KEJhc2VfMS5GcmFtZXdvcmtNb2R1bGUpKTsgLy8gY2xhc3MgRnNtTWFuYWdlclxuICAgIGV4cG9ydHMuRnNtTWFuYWdlciA9IEZzbU1hbmFnZXI7XG59KTtcbiIsInZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgICAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIiwgXCIuL0Jhc2VcIiwgXCIuL0ZzbVwiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgdmFyIEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XG4gICAgdmFyIEZzbV8xID0gcmVxdWlyZShcIi4vRnNtXCIpO1xuICAgIHZhciBQcm9jZWR1cmVCYXNlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICBfX2V4dGVuZHMoUHJvY2VkdXJlQmFzZSwgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gUHJvY2VkdXJlQmFzZSgpIHtcbiAgICAgICAgICAgIHJldHVybiBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvY2VkdXJlQmFzZTtcbiAgICB9KEZzbV8xLkZzbVN0YXRlKSk7IC8vIGNsYXNzIFByb2NlZHVyZUJhc2VcbiAgICBleHBvcnRzLlByb2NlZHVyZUJhc2UgPSBQcm9jZWR1cmVCYXNlO1xuICAgIHZhciBQcm9jZWR1cmVNYW5hZ2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICBfX2V4dGVuZHMoUHJvY2VkdXJlTWFuYWdlciwgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gUHJvY2VkdXJlTWFuYWdlcigpIHtcbiAgICAgICAgICAgIHJldHVybiBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUHJvY2VkdXJlTWFuYWdlci5wcm90b3R5cGUsIFwicHJpb3JpdHlcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiAtMTA7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUHJvY2VkdXJlTWFuYWdlci5wcm90b3R5cGUsIFwiY3VycmVudFByb2NlZHVyZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BQcm9jZWR1cmVGc20uY3VycmVudFN0YXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFByb2NlZHVyZU1hbmFnZXIucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbiAoZnNtTWFuYWdlciwgcHJvY2VkdXJlcykge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gZnNtTWFuYWdlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZTTSBtYW5hZ2VyIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB0aGlzLm1fcEZzbU1hbmFnZXIgPSBmc21NYW5hZ2VyO1xuICAgICAgICAgICAgdGhpcy5tX3BQcm9jZWR1cmVGc20gPSBmc21NYW5hZ2VyLmNyZWF0ZUZzbSgnJywgdGhpcywgcHJvY2VkdXJlcyk7XG4gICAgICAgIH07XG4gICAgICAgIFByb2NlZHVyZU1hbmFnZXIucHJvdG90eXBlLnN0YXJ0UHJvY2VkdXJlID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BQcm9jZWR1cmVGc20pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgbXVzdCBpbml0aWFsaXplIHByb2NlZHVyZSBmaXJzdC4nKTtcbiAgICAgICAgICAgIHRoaXMubV9wUHJvY2VkdXJlRnNtLnN0YXJ0KG9iai5jb25zdHJ1Y3Rvcik7XG4gICAgICAgIH07XG4gICAgICAgIFByb2NlZHVyZU1hbmFnZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgLy8gTm9vcC5cbiAgICAgICAgfTtcbiAgICAgICAgUHJvY2VkdXJlTWFuYWdlci5wcm90b3R5cGUuc2h1dGRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAobnVsbCAhPSB0aGlzLm1fcEZzbU1hbmFnZXIpIHtcbiAgICAgICAgICAgICAgICBpZiAobnVsbCAhPSB0aGlzLm1fcFByb2NlZHVyZUZzbSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcEZzbU1hbmFnZXIuZGVzdHJveUZzbSh0aGlzLm1fcFByb2NlZHVyZUZzbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBQcm9jZWR1cmVNYW5hZ2VyLnByb3RvdHlwZS5oYXNQcm9jZWR1cmUgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BQcm9jZWR1cmVGc20pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgbXVzdCBpbml0aWFsaXplIHByb2NlZHVyZSBmaXJzdC4nKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFByb2NlZHVyZUZzbS5oYXNTdGF0ZSh0eXBlKTtcbiAgICAgICAgfTtcbiAgICAgICAgUHJvY2VkdXJlTWFuYWdlci5wcm90b3R5cGUuZ2V0UHJvY2VkdXJlID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMubV9wUHJvY2VkdXJlRnNtKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignWW91IG11c3QgaW5pdGlhbGl6ZSBwcm9jZWR1cmUgZmlyc3QuJyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BQcm9jZWR1cmVGc20uZ2V0U3RhdGUodHlwZSk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBQcm9jZWR1cmVNYW5hZ2VyO1xuICAgIH0oQmFzZV8xLkZyYW1ld29ya01vZHVsZSkpOyAvLyBjbGFzcyBQcm9jZWR1cmVNYW5hZ2VyXG4gICAgZXhwb3J0cy5Qcm9jZWR1cmVNYW5hZ2VyID0gUHJvY2VkdXJlTWFuYWdlcjtcbn0pO1xuIiwidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgdmFyIEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XG4gICAgdmFyIFJlc291cmNlTW9kZTtcbiAgICAoZnVuY3Rpb24gKFJlc291cmNlTW9kZSkge1xuICAgICAgICBSZXNvdXJjZU1vZGVbUmVzb3VyY2VNb2RlW1wiVW5zcGVjaWZpZWRcIl0gPSAwXSA9IFwiVW5zcGVjaWZpZWRcIjtcbiAgICAgICAgUmVzb3VyY2VNb2RlW1Jlc291cmNlTW9kZVtcIlBhY2thZ2VcIl0gPSAxXSA9IFwiUGFja2FnZVwiO1xuICAgICAgICBSZXNvdXJjZU1vZGVbUmVzb3VyY2VNb2RlW1wiVXBkYXRhYmxlXCJdID0gMl0gPSBcIlVwZGF0YWJsZVwiO1xuICAgIH0pKFJlc291cmNlTW9kZSA9IGV4cG9ydHMuUmVzb3VyY2VNb2RlIHx8IChleHBvcnRzLlJlc291cmNlTW9kZSA9IHt9KSk7IC8vIGVudW0gUmVzb3VyY2VNb2RlXG4gICAgdmFyIExvYWRSZXNvdXJjZVN0YXR1cztcbiAgICAoZnVuY3Rpb24gKExvYWRSZXNvdXJjZVN0YXR1cykge1xuICAgICAgICBMb2FkUmVzb3VyY2VTdGF0dXNbTG9hZFJlc291cmNlU3RhdHVzW1wiU3VjY2Vzc1wiXSA9IDBdID0gXCJTdWNjZXNzXCI7XG4gICAgICAgIExvYWRSZXNvdXJjZVN0YXR1c1tMb2FkUmVzb3VyY2VTdGF0dXNbXCJOb3RSZWFkeVwiXSA9IDFdID0gXCJOb3RSZWFkeVwiO1xuICAgICAgICBMb2FkUmVzb3VyY2VTdGF0dXNbTG9hZFJlc291cmNlU3RhdHVzW1wiTm90RXhpc3RcIl0gPSAyXSA9IFwiTm90RXhpc3RcIjtcbiAgICAgICAgTG9hZFJlc291cmNlU3RhdHVzW0xvYWRSZXNvdXJjZVN0YXR1c1tcIkRlcGVuZGVuY3lFcnJvclwiXSA9IDNdID0gXCJEZXBlbmRlbmN5RXJyb3JcIjtcbiAgICAgICAgTG9hZFJlc291cmNlU3RhdHVzW0xvYWRSZXNvdXJjZVN0YXR1c1tcIlR5cGVFcnJvclwiXSA9IDRdID0gXCJUeXBlRXJyb3JcIjtcbiAgICAgICAgTG9hZFJlc291cmNlU3RhdHVzW0xvYWRSZXNvdXJjZVN0YXR1c1tcIkFzc2V0RXJyb3JcIl0gPSA1XSA9IFwiQXNzZXRFcnJvclwiO1xuICAgIH0pKExvYWRSZXNvdXJjZVN0YXR1cyA9IGV4cG9ydHMuTG9hZFJlc291cmNlU3RhdHVzIHx8IChleHBvcnRzLkxvYWRSZXNvdXJjZVN0YXR1cyA9IHt9KSk7IC8vIGVudW0gTG9hZFJlc291cmNlU3RhdHVzXG4gICAgLyoqXG4gICAgICogQSByZXNvdXJjZSBtYW5hZ2VyIG1vZHVsYXIgYmFzZSBvbiBgRnJhbWV3b3JrTW9kdWxlYC5cbiAgICAgKlxuICAgICAqIFRPRE86IEEgZ2VuZXJhbCByZXNvdXJjZSBtYW5hZ2VtZW50IHdhcyBub3QgeWV0IGltcGxlbWVudGVkLlxuICAgICAqXG4gICAgICogQGF1dGhvciBKZXJlbXkgQ2hlbiAoa2V5aG9tLmNAZ21haWwuY29tKVxuICAgICAqL1xuICAgIHZhciBSZXNvdXJjZU1hbmFnZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhSZXNvdXJjZU1hbmFnZXIsIF9zdXBlcik7XG4gICAgICAgIGZ1bmN0aW9uIFJlc291cmNlTWFuYWdlcigpIHtcbiAgICAgICAgICAgIHJldHVybiBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUmVzb3VyY2VNYW5hZ2VyLnByb3RvdHlwZSwgXCJyZXNvdXJjZUdyb3VwXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BSZXNvdXJjZUdyb3VwOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFJlc291cmNlTWFuYWdlci5wcm90b3R5cGUsIFwicmVzb3VyY2VMb2FkZXJcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFJlc291cmNlTG9hZGVyOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAobnVsbCA9PSB2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2V0dGluZyByZXNvdXJjZSBsb2FkZXIgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZUxvYWRlciA9IHZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZXNvdXJjZU1hbmFnZXIucHJvdG90eXBlLCBcInByaW9yaXR5XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiA3MDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBSZXNvdXJjZU1hbmFnZXIucHJvdG90eXBlLmhhc0Fzc2V0ID0gZnVuY3Rpb24gKGFzc2V0TmFtZSkge1xuICAgICAgICAgICAgaWYgKCFhc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXNzZXQgbmFtZSBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFJlc291cmNlTG9hZGVyLmhhc0Fzc2V0KGFzc2V0TmFtZSk7XG4gICAgICAgIH07XG4gICAgICAgIFJlc291cmNlTWFuYWdlci5wcm90b3R5cGUubG9hZEFzc2V0ID0gZnVuY3Rpb24gKGFzc2V0TmFtZSwgYXNzZXRUeXBlLCBwcmlvcml0eSwgbG9hZEFzc2V0Q2FsbGJhY2tzLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKCFhc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXNzZXQgbmFtZSBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICghbG9hZEFzc2V0Q2FsbGJhY2tzKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgYXNzZXQgY2FsbGJhY2tzIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZUxvYWRlci5sb2FkQXNzZXQoYXNzZXROYW1lLCBhc3NldFR5cGUsIHByaW9yaXR5LCBsb2FkQXNzZXRDYWxsYmFja3MsIHVzZXJEYXRhKTtcbiAgICAgICAgfTtcbiAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnByb3RvdHlwZS51bmxvYWRBc3NldCA9IGZ1bmN0aW9uIChhc3NldCkge1xuICAgICAgICAgICAgaWYgKCFhc3NldClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3NldCBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMubV9wUmVzb3VyY2VMb2FkZXIpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZUxvYWRlci51bmxvYWRBc3NldChhc3NldCk7XG4gICAgICAgIH07XG4gICAgICAgIFJlc291cmNlTWFuYWdlci5wcm90b3R5cGUubG9hZFNjZW5lID0gZnVuY3Rpb24gKHNjZW5lQXNzZXROYW1lLCBwcmlvcml0eSwgbG9hZFNjZW5lQ2FsbGJhY2tzLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKCFzY2VuZUFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCFsb2FkU2NlbmVDYWxsYmFja3MpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTG9hZCBzY2VuZSBhc3NldCBjYWxsYmFja3MgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTG9hZGVyLmxvYWRTY2VuZShzY2VuZUFzc2V0TmFtZSwgcHJpb3JpdHksIGxvYWRTY2VuZUNhbGxiYWNrcywgdXNlckRhdGEpO1xuICAgICAgICB9O1xuICAgICAgICBSZXNvdXJjZU1hbmFnZXIucHJvdG90eXBlLnVubG9hZFNjZW5lID0gZnVuY3Rpb24gKHNjZW5lQXNzZXROYW1lLCB1bmxvYWRTY2VuZUNhbGxiYWNrcywgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGlmICghc2NlbmVBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgbmFtZSBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICghdW5sb2FkU2NlbmVDYWxsYmFja3MpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5sb2FkIHNjZW5lIGNhbGxiYWNrcyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VMb2FkZXIudW5sb2FkU2NlbmUoc2NlbmVBc3NldE5hbWUsIHVubG9hZFNjZW5lQ2FsbGJhY2tzLCB1c2VyRGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIFJlc291cmNlTWFuYWdlci5wcm90b3R5cGUuaGFzUmVzb3VyY2VHcm91cCA9IGZ1bmN0aW9uIChyZXNvdXJjZUdyb3VwTmFtZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XG4gICAgICAgIH07XG4gICAgICAgIFJlc291cmNlTWFuYWdlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BSZXNvdXJjZUxvYWRlcikge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VMb2FkZXIudXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcFJlc291cmNlTG9hZGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZUxvYWRlci5zaHV0ZG93bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gUmVzb3VyY2VNYW5hZ2VyO1xuICAgIH0oQmFzZV8xLkZyYW1ld29ya01vZHVsZSkpOyAvLyBjbGFzcyBSZXNvdXJjZU1hbmFnZXJcbiAgICBleHBvcnRzLlJlc291cmNlTWFuYWdlciA9IFJlc291cmNlTWFuYWdlcjtcbn0pO1xuIiwidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG52YXIgX192YWx1ZXMgPSAodGhpcyAmJiB0aGlzLl9fdmFsdWVzKSB8fCBmdW5jdGlvbihvKSB7XG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcbiAgICBpZiAobyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHJldHVybiB7XG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IocyA/IFwiT2JqZWN0IGlzIG5vdCBpdGVyYWJsZS5cIiA6IFwiU3ltYm9sLml0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcbn07XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgdmFyIEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XG4gICAgdmFyIFNjZW5lTWFuYWdlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgX19leHRlbmRzKFNjZW5lTWFuYWdlciwgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gU2NlbmVNYW5hZ2VyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgICAgICAgICBfdGhpcy5tX3BMb2FkZWRTY2VuZUFzc2V0TmFtZXMgPSBbXTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXMgPSBbXTtcbiAgICAgICAgICAgIF90aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcyA9IFtdO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZFNjZW5lU3VjY2Vzc0RlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRTY2VuZUZhaWx1cmVEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BMb2FkU2NlbmVVcGRhdGVEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BMb2FkU2NlbmVEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BVbmxvYWRTY2VuZVN1Y2Nlc3NEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BVbmxvYWRTY2VuZUZhaWx1cmVEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BMb2FkU2NlbmVDYWxsYmFja3MgPSB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogX3RoaXMub25Mb2FkU2NlbmVTdWNjZXNzLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIGZhaWx1cmU6IF90aGlzLm9uTG9hZFNjZW5lRmFpbHVyZS5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICB1cGRhdGU6IF90aGlzLm9uTG9hZFNjZW5lVXBkYXRlLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIGRlcGVuZGVuY3k6IF90aGlzLm9uTG9hZFNjZW5lRGVwZW5kZW5jeUFzc2V0LmJpbmQoX3RoaXMpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgX3RoaXMubV9wVW5sb2FkU2NlbmVDYWxsYmFja3MgPSB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogX3RoaXMub25VbmxvYWRTY2VuZVN1Y2Nlc3MuYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgZmFpbHVyZTogX3RoaXMub25VbmxvYWRTY2VuZUZhaWx1cmUuYmluZChfdGhpcylcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNjZW5lTWFuYWdlci5wcm90b3R5cGUsIFwicHJpb3JpdHlcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDYwO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTY2VuZU1hbmFnZXIucHJvdG90eXBlLCBcImxvYWRTY2VuZVN1Y2Nlc3NcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wTG9hZFNjZW5lU3VjY2Vzc0RlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTY2VuZU1hbmFnZXIucHJvdG90eXBlLCBcImxvYWRTY2VuZUZhaWx1cmVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wTG9hZFNjZW5lRmFpbHVyZURlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTY2VuZU1hbmFnZXIucHJvdG90eXBlLCBcImxvYWRTY2VuZVVwZGF0ZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BMb2FkU2NlbmVVcGRhdGVEZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU2NlbmVNYW5hZ2VyLnByb3RvdHlwZSwgXCJsb2FkU2NlbmVEZXBlbmRlbmN5QXNzZXRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wTG9hZFNjZW5lRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNjZW5lTWFuYWdlci5wcm90b3R5cGUsIFwidW5sb2FkU2NlbmVTdWNjZXNzXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFVubG9hZFNjZW5lU3VjY2Vzc0RlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTY2VuZU1hbmFnZXIucHJvdG90eXBlLCBcInVubG9hZFNjZW5lRmFpbHVyZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BVbmxvYWRTY2VuZUZhaWx1cmVEZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU2NlbmVNYW5hZ2VyLnByb3RvdHlwZSwgXCJyZXNvdXJjZU1hbmFnZXJcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIgPSB2YWx1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLnNjZW5lSXNMb2FkaW5nID0gZnVuY3Rpb24gKHNjZW5lQXNzZXROYW1lKSB7XG4gICAgICAgICAgICBpZiAoIXNjZW5lQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjZW5lIGFzc2V0IG5hbWUgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICByZXR1cm4gc2NlbmVBc3NldE5hbWUgaW4gdGhpcy5tX3BMb2FkaW5nU2NlbmVBc3NldE5hbWVzO1xuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLnNjZW5lSXNMb2FkZWQgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUpIHtcbiAgICAgICAgICAgIGlmICghc2NlbmVBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgbmFtZSBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHJldHVybiBzY2VuZUFzc2V0TmFtZSBpbiB0aGlzLm1fcExvYWRlZFNjZW5lQXNzZXROYW1lcztcbiAgICAgICAgfTtcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnByb3RvdHlwZS5zY2VuZUlzVW5sb2FkaW5nID0gZnVuY3Rpb24gKHNjZW5lQXNzZXROYW1lKSB7XG4gICAgICAgICAgICBpZiAoIXNjZW5lQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjZW5lIGFzc2V0IG5hbWUgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICByZXR1cm4gc2NlbmVBc3NldE5hbWUgaW4gdGhpcy5tX3BVbmxvYWRpbmdTY2VuZUFzc2V0TmFtZXM7XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUuZ2V0TG9hZGVkU2NlbmVBc3NldE5hbWVzID0gZnVuY3Rpb24gKHJlc3VsdHMpIHtcbiAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzIHx8IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1fcExvYWRlZFNjZW5lQXNzZXROYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLm1fcExvYWRlZFNjZW5lQXNzZXROYW1lc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfTtcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnByb3RvdHlwZS5nZXRMb2FkaW5nU2NlbmVBc3NldE5hbWVzID0gZnVuY3Rpb24gKHJlc3VsdHMpIHtcbiAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzIHx8IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy5tX3BMb2FkaW5nU2NlbmVBc3NldE5hbWVzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLmdldFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcyA9IGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cyB8fCBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tX3BVbmxvYWRpbmdTY2VuZUFzc2V0TmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy5tX3BVbmxvYWRpbmdTY2VuZUFzc2V0TmFtZXNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUubG9hZFNjZW5lID0gZnVuY3Rpb24gKHNjZW5lQXNzZXROYW1lLCBwcmlvcml0eSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGlmICghc2NlbmVBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgbmFtZSBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IHJlc291cmNlIG1hbmFnZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2NlbmVJc1VubG9hZGluZyhzY2VuZUFzc2V0TmFtZSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgJ1wiICsgc2NlbmVBc3NldE5hbWUgKyBcIicgaXMgYmVpbmcgdW5sb2FkZWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2NlbmVJc0xvYWRpbmcoc2NlbmVBc3NldE5hbWUpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjZW5lIGFzc2V0ICdcIiArIHNjZW5lQXNzZXROYW1lICsgXCInIGlzIGJlaW5nIGxvYWRlZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5zY2VuZUlzTG9hZGVkKHNjZW5lQXNzZXROYW1lKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCAnXCIgKyBzY2VuZUFzc2V0TmFtZSArIFwiJyBpcyBhbHJlYWR5IGxvYWRlZC5cIik7XG4gICAgICAgICAgICB0aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXMucHVzaChzY2VuZUFzc2V0TmFtZSk7XG4gICAgICAgICAgICB2YXIgdl9pUHJpb3JpdHkgPSAwO1xuICAgICAgICAgICAgdmFyIHZfcFVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMikge1xuICAgICAgICAgICAgICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIHByaW9yaXR5KVxuICAgICAgICAgICAgICAgICAgICB2X2lQcmlvcml0eSA9IHByaW9yaXR5O1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdl9wVXNlckRhdGEgPSBwcmlvcml0eTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMykge1xuICAgICAgICAgICAgICAgIHZfaVByaW9yaXR5ID0gcHJpb3JpdHk7XG4gICAgICAgICAgICAgICAgdl9wVXNlckRhdGEgPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyLmxvYWRTY2VuZShzY2VuZUFzc2V0TmFtZSwgdl9pUHJpb3JpdHksIHRoaXMubV9wTG9hZFNjZW5lQ2FsbGJhY2tzLCB2X3BVc2VyRGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUudW5sb2FkU2NlbmUgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoIXNjZW5lQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjZW5lIGFzc2V0IG5hbWUgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAoIXRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IHNldCByZXNvdXJjZSBtYW5hZ2VyIGZpcnN0LlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnNjZW5lSXNVbmxvYWRpbmcoc2NlbmVBc3NldE5hbWUpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjZW5lIGFzc2V0ICdcIiArIHNjZW5lQXNzZXROYW1lICsgXCInIGlzIGJlaW5nIHVubG9hZGVkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnNjZW5lSXNMb2FkaW5nKHNjZW5lQXNzZXROYW1lKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCAnXCIgKyBzY2VuZUFzc2V0TmFtZSArIFwiJyBpcyBiZWluZyBsb2FkZWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2NlbmVJc0xvYWRlZChzY2VuZUFzc2V0TmFtZSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgJ1wiICsgc2NlbmVBc3NldE5hbWUgKyBcIicgaXMgYWxyZWFkeSBsb2FkZWQuXCIpO1xuICAgICAgICAgICAgdXNlckRhdGEgPSB1c2VyRGF0YSB8fCBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX3BVbmxvYWRpbmdTY2VuZUFzc2V0TmFtZXMucHVzaChzY2VuZUFzc2V0TmFtZSk7XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlci51bmxvYWRTY2VuZShzY2VuZUFzc2V0TmFtZSwgdGhpcy5tX3BVbmxvYWRTY2VuZUNhbGxiYWNrcywgdXNlckRhdGEpO1xuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgLy8gTk9PUC5cbiAgICAgICAgfTtcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBlXzEsIF9hO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wTG9hZGVkU2NlbmVBc3NldE5hbWVzKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc05hbWUgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2NlbmVJc1VubG9hZGluZyhzTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudW5sb2FkU2NlbmUoc05hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzFfMSkgeyBlXzEgPSB7IGVycm9yOiBlXzFfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wTG9hZGVkU2NlbmVBc3NldE5hbWVzLnNwbGljZSgwLCB0aGlzLm1fcExvYWRlZFNjZW5lQXNzZXROYW1lcy5sZW5ndGgpO1xuICAgICAgICAgICAgdGhpcy5tX3BMb2FkaW5nU2NlbmVBc3NldE5hbWVzLnNwbGljZSgwLCB0aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXMubGVuZ3RoKTtcbiAgICAgICAgICAgIHRoaXMubV9wVW5sb2FkaW5nU2NlbmVBc3NldE5hbWVzLnNwbGljZSgwLCB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcy5sZW5ndGgpO1xuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLm9uTG9hZFNjZW5lU3VjY2VzcyA9IGZ1bmN0aW9uIChzY2VuZUFzc2V0TmFtZSwgZHVyYXRpb24sIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9JZHg7XG4gICAgICAgICAgICBpZiAoKHZfSWR4ID0gdGhpcy5tX3BMb2FkaW5nU2NlbmVBc3NldE5hbWVzLmluZGV4T2Yoc2NlbmVBc3NldE5hbWUpKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkaW5nU2NlbmVBc3NldE5hbWVzLnNwbGljZSh2X0lkeCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoKHZfSWR4ID0gdGhpcy5tX3BVbmxvYWRpbmdTY2VuZUFzc2V0TmFtZXMuaW5kZXhPZihzY2VuZUFzc2V0TmFtZSkpID49IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcy5zcGxpY2Uodl9JZHgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3BMb2FkZWRTY2VuZUFzc2V0TmFtZXMucHVzaChzY2VuZUFzc2V0TmFtZSk7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZFNjZW5lU3VjY2Vzc0RlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihzY2VuZUFzc2V0TmFtZSwgZHVyYXRpb24sIHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnByb3RvdHlwZS5vbkxvYWRTY2VuZUZhaWx1cmUgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUsIHN0YXR1cywgZXJyb3JNZXNzYWdlLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfSWR4O1xuICAgICAgICAgICAgaWYgKCh2X0lkeCA9IHRoaXMubV9wTG9hZGluZ1NjZW5lQXNzZXROYW1lcy5pbmRleE9mKHNjZW5lQXNzZXROYW1lKSkgPj0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZGluZ1NjZW5lQXNzZXROYW1lcy5zcGxpY2Uodl9JZHgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubV9wTG9hZFNjZW5lRmFpbHVyZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRTY2VuZUZhaWx1cmVEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oc2NlbmVBc3NldE5hbWUsIGVycm9yTWVzc2FnZSwgdXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLm9uTG9hZFNjZW5lVXBkYXRlID0gZnVuY3Rpb24gKHNjZW5lQXNzZXROYW1lLCBwcm9ncmVzcywgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWRTY2VuZVVwZGF0ZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRTY2VuZVVwZGF0ZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihzY2VuZUFzc2V0TmFtZSwgcHJvZ3Jlc3MsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnByb3RvdHlwZS5vbkxvYWRTY2VuZURlcGVuZGVuY3lBc3NldCA9IGZ1bmN0aW9uIChzY2VuZUFzc2V0TmFtZSwgZGVwZW5kZW5jeUFzc2V0TmFtZSwgbG9hZGVkQ291bnQsIHRvdGFsQ291bnQsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkU2NlbmVEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkU2NlbmVEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oc2NlbmVBc3NldE5hbWUsIGRlcGVuZGVuY3lBc3NldE5hbWUsIGxvYWRlZENvdW50LCB0b3RhbENvdW50LCB1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUub25VbmxvYWRTY2VuZVN1Y2Nlc3MgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9JZHg7XG4gICAgICAgICAgICBpZiAoKHZfSWR4ID0gdGhpcy5tX3BVbmxvYWRpbmdTY2VuZUFzc2V0TmFtZXMuaW5kZXhPZihzY2VuZUFzc2V0TmFtZSkpID49IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcy5zcGxpY2Uodl9JZHgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCh2X0lkeCA9IHRoaXMubV9wTG9hZGVkU2NlbmVBc3NldE5hbWVzLmluZGV4T2Yoc2NlbmVBc3NldE5hbWUpKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkZWRTY2VuZUFzc2V0TmFtZXMuc3BsaWNlKHZfSWR4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm1fcFVubG9hZFNjZW5lU3VjY2Vzc0RlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFVubG9hZFNjZW5lU3VjY2Vzc0RlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihzY2VuZUFzc2V0TmFtZSwgdXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLm9uVW5sb2FkU2NlbmVGYWlsdXJlID0gZnVuY3Rpb24gKHNjZW5lQXNzZXROYW1lLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfSWR4O1xuICAgICAgICAgICAgaWYgKCh2X0lkeCA9IHRoaXMubV9wVW5sb2FkaW5nU2NlbmVBc3NldE5hbWVzLmluZGV4T2Yoc2NlbmVBc3NldE5hbWUpKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BVbmxvYWRpbmdTY2VuZUFzc2V0TmFtZXMuc3BsaWNlKHZfSWR4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm1fcFVubG9hZFNjZW5lRmFpbHVyZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFVubG9hZFNjZW5lRmFpbHVyZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihzY2VuZUFzc2V0TmFtZSwgdXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gU2NlbmVNYW5hZ2VyO1xuICAgIH0oQmFzZV8xLkZyYW1ld29ya01vZHVsZSkpOyAvLyBjbGFzcyBTY2VuZU1hbmFnZXJcbiAgICBleHBvcnRzLlNjZW5lTWFuYWdlciA9IFNjZW5lTWFuYWdlcjtcbn0pO1xuIiwidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG52YXIgX192YWx1ZXMgPSAodGhpcyAmJiB0aGlzLl9fdmFsdWVzKSB8fCBmdW5jdGlvbihvKSB7XG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcbiAgICBpZiAobyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHJldHVybiB7XG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IocyA/IFwiT2JqZWN0IGlzIG5vdCBpdGVyYWJsZS5cIiA6IFwiU3ltYm9sLml0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcbn07XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgdmFyIEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XG4gICAgdmFyIENvbnN0YW50O1xuICAgIChmdW5jdGlvbiAoQ29uc3RhbnQpIHtcbiAgICAgICAgQ29uc3RhbnQuRGVmYXVsdFRpbWUgPSAwO1xuICAgICAgICBDb25zdGFudC5EZWZhdWx0TXV0ZSA9IGZhbHNlO1xuICAgICAgICBDb25zdGFudC5EZWZhdWx0TG9vcCA9IGZhbHNlO1xuICAgICAgICBDb25zdGFudC5EZWZhdWx0UHJpb3JpdHkgPSAwO1xuICAgICAgICBDb25zdGFudC5EZWZhdWx0Vm9sdW1lID0gMTtcbiAgICAgICAgQ29uc3RhbnQuRGVmYXVsdEZhZGVJblNlY29uZHMgPSAwO1xuICAgICAgICBDb25zdGFudC5EZWZhdWx0RmFkZU91dFNlY29uZHMgPSAwO1xuICAgICAgICBDb25zdGFudC5EZWZhdWx0UGl0Y2ggPSAxO1xuICAgICAgICBDb25zdGFudC5EZWZhdWx0UGFuU3RlcmVvID0gMDtcbiAgICAgICAgQ29uc3RhbnQuRGVmYXVsdFNwYXRpYWxCbGVuZCA9IDA7XG4gICAgICAgIENvbnN0YW50LkRlZmF1bHRNYXhEaXN0YW5jZSA9IDEwMDtcbiAgICAgICAgQ29uc3RhbnQuRGVmYXVsdERvcHBsZXJMZXZlbCA9IDE7XG4gICAgfSkoQ29uc3RhbnQgPSBleHBvcnRzLkNvbnN0YW50IHx8IChleHBvcnRzLkNvbnN0YW50ID0ge30pKTsgLy8gbmFtZXNwYWNlIENvbnN0YW50XG4gICAgdmFyIFNvdW5kQWdlbnQgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZ1bmN0aW9uIFNvdW5kQWdlbnQoc291bmRHcm91cCwgc291bmRIZWxwZXIsIHNvdW5kQWdlbnRIZWxwZXIpIHtcbiAgICAgICAgICAgIGlmICghc291bmRHcm91cClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTb3VuZCBncm91cCBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICghc291bmRIZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU291bmQgaGVscGVyIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCFzb3VuZEFnZW50SGVscGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNvdW5kIGFnZW50IGhlbHBlciBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRHcm91cCA9IHNvdW5kR3JvdXA7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kSGVscGVyID0gc291bmRIZWxwZXI7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIgPSBzb3VuZEFnZW50SGVscGVyO1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnJlc2V0U291bmRBZ2VudC5hZGQodGhpcy5vblJlc2V0U291bmRBZ2VudCwgdGhpcyk7XG4gICAgICAgICAgICB0aGlzLm1faVNlcmlhbElkID0gMDtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRBc3NldDtcbiAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwic291bmRHcm91cFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU291bmRHcm91cDsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJzZXJpYWxJZFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9pU2VyaWFsSWQ7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1faVNlcmlhbElkID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwiaXNQbGF5aW5nXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLmlzUGxheWluZzsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJsZW5ndGhcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIubGVuZ3RoOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kQWdlbnQucHJvdG90eXBlLCBcInRpbWVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIudGltZTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9wU291bmRBZ2VudEhlbHBlci50aW1lID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwibXV0ZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5tdXRlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kQWdlbnQucHJvdG90eXBlLCBcIm11dGVJblNvdW5kR3JvdXBcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fYk11dGVJblNvdW5kR3JvdXA7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9iTXV0ZUluU291bmRHcm91cCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaE11dGUoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwibG9vcFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5sb29wOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLmxvb3AgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJwcmlvcml0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5wcmlvcml0eTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5wcmlvcml0eSA9IHZhbHVlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kQWdlbnQucHJvdG90eXBlLCBcInZvbHVtZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci52b2x1bWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwidm9sdW1lSW5Tb3VuZEdyb3VwXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX2ZWb2x1bWVJblNvdW5kR3JvdXA7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9mVm9sdW1lSW5Tb3VuZEdyb3VwID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoVm9sdW1lKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kQWdlbnQucHJvdG90eXBlLCBcInBpdGNoXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnBpdGNoOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnBpdGNoID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwicGFuU3RlcmVvXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnBhblN0ZXJlbzsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5wYW5TdGVyZW8gPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJzcGF0aWFsQmxlbmRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIuc3BhdGlhbEJsZW5kOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnNwYXRpYWxCbGVuZCA9IHZhbHVlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kQWdlbnQucHJvdG90eXBlLCBcIm1heERpc3RhbmNlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLm1heERpc3RhbmNlOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLm1heERpc3RhbmNlID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwiZG9wcGxlckxldmVsXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLmRvcHBsZXJMZXZlbDsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5kb3BwbGVyTGV2ZWwgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJoZWxwZXJcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXI7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwic2V0U291bmRBc3NldFRpbWVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fZlNldFNvdW5kQXNzZXRUaW1lOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgU291bmRBZ2VudC5wcm90b3R5cGUucGxheSA9IGZ1bmN0aW9uIChmYWRlSW5TZWNvbmRzKSB7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIucGxheShmYWRlSW5TZWNvbmRzIHx8IENvbnN0YW50LkRlZmF1bHRGYWRlSW5TZWNvbmRzKTtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRBZ2VudC5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uIChmYWRlT3V0U2Vjb25kcykge1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnN0b3AoZmFkZU91dFNlY29uZHMgfHwgQ29uc3RhbnQuRGVmYXVsdEZhZGVPdXRTZWNvbmRzKTtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRBZ2VudC5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbiAoZmFkZU91dFNlY29uZHMpIHtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5wYXVzZShmYWRlT3V0U2Vjb25kcyB8fCBDb25zdGFudC5EZWZhdWx0RmFkZU91dFNlY29uZHMpO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZEFnZW50LnByb3RvdHlwZS5yZXN1bWUgPSBmdW5jdGlvbiAoZmFkZUluU2Vjb25kcykge1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnJlc3VtZShmYWRlSW5TZWNvbmRzIHx8IENvbnN0YW50LkRlZmF1bHRGYWRlSW5TZWNvbmRzKTtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRBZ2VudC5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BTb3VuZEFzc2V0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEhlbHBlci5yZWxlYXNlU291bmRBc3NldCh0aGlzLm1fcFNvdW5kQXNzZXQpO1xuICAgICAgICAgICAgICAgIC8vIHRoaXMubV9wU291bmRBc3NldCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fZlNldFNvdW5kQXNzZXRUaW1lID0gTmFOO1xuICAgICAgICAgICAgdGhpcy50aW1lID0gQ29uc3RhbnQuRGVmYXVsdFRpbWU7XG4gICAgICAgICAgICB0aGlzLm11dGVJblNvdW5kR3JvdXAgPSBDb25zdGFudC5EZWZhdWx0TXV0ZTtcbiAgICAgICAgICAgIHRoaXMubG9vcCA9IENvbnN0YW50LkRlZmF1bHRMb29wO1xuICAgICAgICAgICAgdGhpcy5wcmlvcml0eSA9IENvbnN0YW50LkRlZmF1bHRQcmlvcml0eTtcbiAgICAgICAgICAgIHRoaXMudm9sdW1lSW5Tb3VuZEdyb3VwID0gQ29uc3RhbnQuRGVmYXVsdFZvbHVtZTtcbiAgICAgICAgICAgIHRoaXMucGl0Y2ggPSBDb25zdGFudC5EZWZhdWx0UGl0Y2g7XG4gICAgICAgICAgICB0aGlzLnBhblN0ZXJlbyA9IENvbnN0YW50LkRlZmF1bHRQYW5TdGVyZW87XG4gICAgICAgICAgICB0aGlzLnNwYXRpYWxCbGVuZCA9IENvbnN0YW50LkRlZmF1bHRTcGF0aWFsQmxlbmQ7XG4gICAgICAgICAgICB0aGlzLm1heERpc3RhbmNlID0gQ29uc3RhbnQuRGVmYXVsdE1heERpc3RhbmNlO1xuICAgICAgICAgICAgdGhpcy5kb3BwbGVyTGV2ZWwgPSBDb25zdGFudC5EZWZhdWx0RG9wcGxlckxldmVsO1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnJlc2V0KCk7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kQWdlbnQucHJvdG90eXBlLnNldFNvdW5kQXNzZXQgPSBmdW5jdGlvbiAoc291bmRBc3NldCkge1xuICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEFzc2V0ID0gc291bmRBc3NldDtcbiAgICAgICAgICAgIHRoaXMubV9mU2V0U291bmRBc3NldFRpbWUgPSBuZXcgRGF0ZSgpLnZhbHVlT2YoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIuc2V0U291bmRBc3NldChzb3VuZEFzc2V0KTtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRBZ2VudC5wcm90b3R5cGUucmVmcmVzaE11dGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIubXV0ZSA9IHRoaXMubV9wU291bmRHcm91cC5tdXRlIHx8IHRoaXMubV9iTXV0ZUluU291bmRHcm91cDtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRBZ2VudC5wcm90b3R5cGUucmVmcmVzaFZvbHVtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci52b2x1bWUgPSB0aGlzLm1fcFNvdW5kR3JvdXAudm9sdW1lIHx8IHRoaXMubV9mVm9sdW1lSW5Tb3VuZEdyb3VwO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZEFnZW50LnByb3RvdHlwZS5vblJlc2V0U291bmRBZ2VudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFNvdW5kQWdlbnQ7XG4gICAgfSgpKTsgLy8gY2xhc3MgU291bmRBZ2VudFxuICAgIGV4cG9ydHMuU291bmRBZ2VudCA9IFNvdW5kQWdlbnQ7XG4gICAgdmFyIFBsYXlTb3VuZEVycm9yQ29kZTtcbiAgICAoZnVuY3Rpb24gKFBsYXlTb3VuZEVycm9yQ29kZSkge1xuICAgICAgICBQbGF5U291bmRFcnJvckNvZGVbUGxheVNvdW5kRXJyb3JDb2RlW1wiVW5rbm93blwiXSA9IDBdID0gXCJVbmtub3duXCI7XG4gICAgICAgIFBsYXlTb3VuZEVycm9yQ29kZVtQbGF5U291bmRFcnJvckNvZGVbXCJTb3VuZEdyb3VwTm90RXhpc3RcIl0gPSAxXSA9IFwiU291bmRHcm91cE5vdEV4aXN0XCI7XG4gICAgICAgIFBsYXlTb3VuZEVycm9yQ29kZVtQbGF5U291bmRFcnJvckNvZGVbXCJTb3VuZEdyb3VwSGFzTm9BZ2VudFwiXSA9IDJdID0gXCJTb3VuZEdyb3VwSGFzTm9BZ2VudFwiO1xuICAgICAgICBQbGF5U291bmRFcnJvckNvZGVbUGxheVNvdW5kRXJyb3JDb2RlW1wiTG9hZEFzc2V0RmFpbHVyZVwiXSA9IDNdID0gXCJMb2FkQXNzZXRGYWlsdXJlXCI7XG4gICAgICAgIFBsYXlTb3VuZEVycm9yQ29kZVtQbGF5U291bmRFcnJvckNvZGVbXCJJZ25vcmVEdWVUb0xvd1ByaW9yaXR5XCJdID0gNF0gPSBcIklnbm9yZUR1ZVRvTG93UHJpb3JpdHlcIjtcbiAgICAgICAgUGxheVNvdW5kRXJyb3JDb2RlW1BsYXlTb3VuZEVycm9yQ29kZVtcIlNldFNvdW5kQXNzZXRGYWlsdXJlXCJdID0gNV0gPSBcIlNldFNvdW5kQXNzZXRGYWlsdXJlXCI7XG4gICAgfSkoUGxheVNvdW5kRXJyb3JDb2RlID0gZXhwb3J0cy5QbGF5U291bmRFcnJvckNvZGUgfHwgKGV4cG9ydHMuUGxheVNvdW5kRXJyb3JDb2RlID0ge30pKTsgLy8gZW51bSBQbGF5U291bmRFcnJvckNvZGVcbiAgICB2YXIgU291bmRHcm91cCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gU291bmRHcm91cChuYW1lLCBzb3VuZEdyb3VwSGVscGVyKSB7XG4gICAgICAgICAgICB0aGlzLm1fYkF2b2lkQmVpbmdSZXBsYWNlZEJ5U2FtZVByaW9yaXR5ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm1fYk11dGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubV9mVm9sdW1lID0gMTtcbiAgICAgICAgICAgIGlmICghbmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTb3VuZCBncm91cCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCFzb3VuZEdyb3VwSGVscGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNvdW5kIGdyb3VwIGhlbHBlciBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHRoaXMubV9zTmFtZSA9IG5hbWU7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kR3JvdXBIZWxwZXIgPSBzb3VuZEdyb3VwSGVscGVyO1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEFnZW50cyA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEdyb3VwLnByb3RvdHlwZSwgXCJuYW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3NOYW1lOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kR3JvdXAucHJvdG90eXBlLCBcInNvdW5kQWdlbnRDb3VudFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BTb3VuZEFnZW50cy5sZW5ndGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kR3JvdXAucHJvdG90eXBlLCBcImF2b2lkQmVpbmdSZXBsYWNlZEJ5U2FtZVByaW9yaXR5XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX2JBdm9pZEJlaW5nUmVwbGFjZWRCeVNhbWVQcmlvcml0eTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX2JBdm9pZEJlaW5nUmVwbGFjZWRCeVNhbWVQcmlvcml0eSA9IHZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEdyb3VwLnByb3RvdHlwZSwgXCJtdXRlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX2JNdXRlOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZV8xLCBfYTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fYk11dGUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRBZ2VudHMpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWdlbnQgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50LnJlZnJlc2hNdXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVfMV8xKSB7IGVfMSA9IHsgZXJyb3I6IGVfMV8xIH07IH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEdyb3VwLnByb3RvdHlwZSwgXCJ2b2x1bWVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fZlZvbHVtZTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVfMiwgX2E7XG4gICAgICAgICAgICAgICAgdGhpcy5tX2ZWb2x1bWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRBZ2VudHMpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWdlbnQgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50LnJlZnJlc2hWb2x1bWUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV8yXzEpIHsgZV8yID0geyBlcnJvcjogZV8yXzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8yKSB0aHJvdyBlXzIuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kR3JvdXAucHJvdG90eXBlLCBcImhlbHBlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU291bmRHcm91cEhlbHBlcjsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFNvdW5kR3JvdXAucHJvdG90eXBlLmFkZFNvdW5kQWdlbnRIZWxwZXIgPSBmdW5jdGlvbiAoc291bmRIZWxwZXIsIHNvdW5kQWdlbnRIZWxwZXIpIHtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRBZ2VudHMucHVzaChuZXcgU291bmRBZ2VudCh0aGlzLCBzb3VuZEhlbHBlciwgc291bmRBZ2VudEhlbHBlcikpO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZEdyb3VwLnByb3RvdHlwZS5wbGF5U291bmQgPSBmdW5jdGlvbiAoc2VyaWFsSWQsIHNvdW5kQXNzZXQsIHBsYXlTb3VuZFBhcmFtcywgZXJyb3JDb2RlKSB7XG4gICAgICAgICAgICB2YXIgZV8zLCBfYTtcbiAgICAgICAgICAgIGVycm9yQ29kZSA9IGVycm9yQ29kZSB8fCB7IGNvZGU6IDAgfTtcbiAgICAgICAgICAgIHZhciB2X3BDYW5kaWRhdGVBZ2VudDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFNvdW5kQWdlbnRzKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc291bmRBZ2VudCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXNvdW5kQWdlbnQuaXNQbGF5aW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudCA9IHNvdW5kQWdlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoc291bmRBZ2VudC5wcmlvcml0eSA8IHBsYXlTb3VuZFBhcmFtcy5wcmlvcml0eSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF2X3BDYW5kaWRhdGVBZ2VudCB8fCBzb3VuZEFnZW50LnByaW9yaXR5IDwgdl9wQ2FuZGlkYXRlQWdlbnQucHJpb3JpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudCA9IHNvdW5kQWdlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoIXRoaXMubV9iQXZvaWRCZWluZ1JlcGxhY2VkQnlTYW1lUHJpb3JpdHkgJiYgc291bmRBZ2VudC5wcmlvcml0eSA9PSBwbGF5U291bmRQYXJhbXMucHJpb3JpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdl9wQ2FuZGlkYXRlQWdlbnQgfHwgc291bmRBZ2VudC5zZXRTb3VuZEFzc2V0VGltZSA8IHZfcENhbmRpZGF0ZUFnZW50LnNldFNvdW5kQXNzZXRUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdl9wQ2FuZGlkYXRlQWdlbnQgPSBzb3VuZEFnZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfM18xKSB7IGVfMyA9IHsgZXJyb3I6IGVfM18xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzMpIHRocm93IGVfMy5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF2X3BDYW5kaWRhdGVBZ2VudCkge1xuICAgICAgICAgICAgICAgIGVycm9yQ29kZS5jb2RlID0gUGxheVNvdW5kRXJyb3JDb2RlLklnbm9yZUR1ZVRvTG93UHJpb3JpdHk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXZfcENhbmRpZGF0ZUFnZW50LnNldFNvdW5kQXNzZXQoc291bmRBc3NldCkpIHtcbiAgICAgICAgICAgICAgICBlcnJvckNvZGUuY29kZSA9IFBsYXlTb3VuZEVycm9yQ29kZS5TZXRTb3VuZEFzc2V0RmFpbHVyZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50LnNlcmlhbElkID0gc2VyaWFsSWQ7XG4gICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudC50aW1lID0gcGxheVNvdW5kUGFyYW1zLnRpbWU7XG4gICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudC5tdXRlSW5Tb3VuZEdyb3VwID0gcGxheVNvdW5kUGFyYW1zLm11dGVJblNvdW5kR3JvdXA7XG4gICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudC5sb29wID0gcGxheVNvdW5kUGFyYW1zLmxvb3A7XG4gICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudC5wcmlvcml0eSA9IHBsYXlTb3VuZFBhcmFtcy5wcmlvcml0eTtcbiAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50LnZvbHVtZUluU291bmRHcm91cCA9IHBsYXlTb3VuZFBhcmFtcy52b2x1bWVJblNvdW5kR3JvdXA7XG4gICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudC5waXRjaCA9IHBsYXlTb3VuZFBhcmFtcy5waXRjaDtcbiAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50LnBhblN0ZXJlbyA9IHBsYXlTb3VuZFBhcmFtcy5wYW5TdGVyZW87XG4gICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudC5zcGF0aWFsQmxlbmQgPSBwbGF5U291bmRQYXJhbXMuc3BhdGlhbEJsZW5kO1xuICAgICAgICAgICAgdl9wQ2FuZGlkYXRlQWdlbnQubWF4RGlzdGFuY2UgPSBwbGF5U291bmRQYXJhbXMubWF4RGlzdGFuY2U7XG4gICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudC5kb3BwbGVyTGV2ZWwgPSBwbGF5U291bmRQYXJhbXMuZG9wcGxlckxldmVsO1xuICAgICAgICAgICAgdl9wQ2FuZGlkYXRlQWdlbnQucGxheShwbGF5U291bmRQYXJhbXMuZmFkZUluU2Vjb25kcyk7XG4gICAgICAgICAgICByZXR1cm4gdl9wQ2FuZGlkYXRlQWdlbnQ7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kR3JvdXAucHJvdG90eXBlLnN0b3BTb3VuZCA9IGZ1bmN0aW9uIChzZXJpYWxJZCwgZmFkZU91dFNlY29uZHMpIHtcbiAgICAgICAgICAgIHZhciBlXzQsIF9hO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRBZ2VudHMpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3VuZEFnZW50ID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VuZEFnZW50LnNlcmlhbElkICE9IHNlcmlhbElkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzb3VuZEFnZW50LnN0b3AoZmFkZU91dFNlY29uZHMpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV80XzEpIHsgZV80ID0geyBlcnJvcjogZV80XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNCkgdGhyb3cgZV80LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kR3JvdXAucHJvdG90eXBlLnBhdXNlU291bmQgPSBmdW5jdGlvbiAoc2VyaWFsSWQsIGZhZGVPdXRTZWNvbmRzKSB7XG4gICAgICAgICAgICB2YXIgZV81LCBfYTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFNvdW5kQWdlbnRzKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc291bmRBZ2VudCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc291bmRBZ2VudC5zZXJpYWxJZCAhPSBzZXJpYWxJZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICBzb3VuZEFnZW50LnBhdXNlKGZhZGVPdXRTZWNvbmRzKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfNV8xKSB7IGVfNSA9IHsgZXJyb3I6IGVfNV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzUpIHRocm93IGVfNS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZEdyb3VwLnByb3RvdHlwZS5yZXN1bWVTb3VuZCA9IGZ1bmN0aW9uIChzZXJpYWxJZCwgZmFkZUluU2Vjb25kcykge1xuICAgICAgICAgICAgdmFyIGVfNiwgX2E7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BTb3VuZEFnZW50cyksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNvdW5kQWdlbnQgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNvdW5kQWdlbnQuc2VyaWFsSWQgIT0gc2VyaWFsSWQpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgc291bmRBZ2VudC5yZXN1bWUoZmFkZUluU2Vjb25kcyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzZfMSkgeyBlXzYgPSB7IGVycm9yOiBlXzZfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV82KSB0aHJvdyBlXzYuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRHcm91cC5wcm90b3R5cGUuc3RvcEFsbExvYWRlZFNvdW5kcyA9IGZ1bmN0aW9uIChmYWRlT3V0U2Vjb25kcykge1xuICAgICAgICAgICAgdmFyIGVfNywgX2E7XG4gICAgICAgICAgICBmYWRlT3V0U2Vjb25kcyA9IGZhZGVPdXRTZWNvbmRzIHx8IENvbnN0YW50LkRlZmF1bHRGYWRlT3V0U2Vjb25kcztcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFNvdW5kQWdlbnRzKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc291bmRBZ2VudCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc291bmRBZ2VudC5pc1BsYXlpbmcpXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VuZEFnZW50LnN0b3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV83XzEpIHsgZV83ID0geyBlcnJvcjogZV83XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNykgdGhyb3cgZV83LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBTb3VuZEdyb3VwO1xuICAgIH0oKSk7IC8vIGNsYXNzIFNvdW5kR3JvdXBcbiAgICBleHBvcnRzLlNvdW5kR3JvdXAgPSBTb3VuZEdyb3VwO1xuICAgIHZhciBTb3VuZE1hbmFnZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhTb3VuZE1hbmFnZXIsIF9zdXBlcik7XG4gICAgICAgIGZ1bmN0aW9uIFNvdW5kTWFuYWdlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICAgICAgX3RoaXMubV9wU291bmRHcm91cHMgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BTb3VuZHNCZWluZ0xvYWRlZCA9IG5ldyBTZXQoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcFNvdW5kc1RvUmVsZWFzZU9uTG9hZCA9IG5ldyBTZXQoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRBc3NldENhbGxiYWNrcyA9IHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBfdGhpcy5vbkxvYWRTb3VuZFN1Y2Nlc3NDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICBmYWlsdXJlOiBfdGhpcy5vbkxvYWRTb3VuZEZhaWx1cmVDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICB1cGRhdGU6IF90aGlzLm9uTG9hZFNvdW5kVXBkYXRlQ2FsbGJhY2suYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgZGVwZW5kZW5jeTogX3RoaXMub25Mb2FkU291bmREZXBlbmRlbmN5QXNzZXRDYWxsYmFjay5iaW5kKF90aGlzKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIF90aGlzLm1faVNlcmlhbCA9IDA7XG4gICAgICAgICAgICBfdGhpcy5tX3BQbGF5U291bmRTdWNjZXNzRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wUGxheVNvdW5kRmFpbHVyZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcFBsYXlTb3VuZFVwZGF0ZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcFBsYXlTb3VuZERlcGVuZGVuY3lBc3NldERlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRNYW5hZ2VyLnByb3RvdHlwZSwgXCJzb3VuZEdyb3VwQ291bnRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wU291bmRHcm91cHMuc2l6ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRNYW5hZ2VyLnByb3RvdHlwZSwgXCJwbGF5U291bmRTdWNjZXNzXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFBsYXlTb3VuZFN1Y2Nlc3NEZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRNYW5hZ2VyLnByb3RvdHlwZSwgXCJwbGF5U291bmRGYWlsdXJlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFBsYXlTb3VuZEZhaWx1cmVEZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRNYW5hZ2VyLnByb3RvdHlwZSwgXCJwbGF5U291bmRVcGRhdGVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUGxheVNvdW5kVXBkYXRlRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kTWFuYWdlci5wcm90b3R5cGUsIFwicGxheVNvdW5kRGVwZW5kZW5jeUFzc2V0XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFBsYXlTb3VuZERlcGVuZGVuY3lBc3NldERlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICAvLyBOT09QLlxuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5zdG9wQWxsTG9hZGVkU291bmRzKCk7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kR3JvdXBzLmNsZWFyKCk7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kc0JlaW5nTG9hZGVkLmNsZWFyKCk7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kc1RvUmVsZWFzZU9uTG9hZC5jbGVhcigpO1xuICAgICAgICB9O1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRNYW5hZ2VyLnByb3RvdHlwZSwgXCJyZXNvdXJjZU1hbmFnZXJcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFJlc291cmNlTWFuYWdlcjsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRNYW5hZ2VyLnByb3RvdHlwZSwgXCJzb3VuZEhlbHBlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU291bmRIZWxwZXI7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1fcFNvdW5kSGVscGVyID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLmhhc1NvdW5kR3JvdXAgPSBmdW5jdGlvbiAoc291bmRHcm91cE5hbWUpIHtcbiAgICAgICAgICAgIGlmICghc291bmRHcm91cE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU291bmQgZ3JvdXAgbmFtZSBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFNvdW5kR3JvdXBzLmhhcyhzb3VuZEdyb3VwTmFtZSk7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUuZ2V0U291bmRHcm91cCA9IGZ1bmN0aW9uIChzb3VuZEdyb3VwTmFtZSkge1xuICAgICAgICAgICAgaWYgKCFzb3VuZEdyb3VwTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTb3VuZCBncm91cCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wU291bmRHcm91cHMuZ2V0KHNvdW5kR3JvdXBOYW1lKSB8fCBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLmdldEFsbFNvdW5kR3JvdXBzID0gZnVuY3Rpb24gKHJlc3VsdHMpIHtcbiAgICAgICAgICAgIHZhciBlXzgsIF9hO1xuICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMgfHwgW107XG4gICAgICAgICAgICBpZiAocmVzdWx0cy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgIHJlc3VsdHMuc3BsaWNlKDAsIHJlc3VsdHMubGVuZ3RoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFNvdW5kR3JvdXBzLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc291bmRHcm91cCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goc291bmRHcm91cCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfOF8xKSB7IGVfOCA9IHsgZXJyb3I6IGVfOF8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzgpIHRocm93IGVfOC5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUuYWRkU291bmRHcm91cCA9IGZ1bmN0aW9uIChzb3VuZEdyb3VwTmFtZSwgYW55QXJnLCBzb3VuZEdyb3VwTXV0ZSwgc291bmRHcm91cFZvbHVtZSwgc291bmRHcm91cEhlbHBlcikge1xuICAgICAgICAgICAgaWYgKCFzb3VuZEdyb3VwTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTb3VuZCBncm91cCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgdmFyIHNvdW5kR3JvdXBBdm9pZEJlaW5nUmVwbGFjZWRCeVNhbWVQcmlvcml0eSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKCdib29sZWFuJyA9PT0gdHlwZW9mIGFueUFyZykge1xuICAgICAgICAgICAgICAgIHNvdW5kR3JvdXBBdm9pZEJlaW5nUmVwbGFjZWRCeVNhbWVQcmlvcml0eSA9IGFueUFyZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNvdW5kR3JvdXBIZWxwZXIgPSBhbnlBcmc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzb3VuZEdyb3VwTXV0ZSA9IHNvdW5kR3JvdXBNdXRlIHx8IENvbnN0YW50LkRlZmF1bHRNdXRlO1xuICAgICAgICAgICAgc291bmRHcm91cFZvbHVtZSA9IHNvdW5kR3JvdXBWb2x1bWUgfHwgQ29uc3RhbnQuRGVmYXVsdFZvbHVtZTtcbiAgICAgICAgICAgIGlmICghc291bmRHcm91cEhlbHBlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTb3VuZCBncm91cCBoZWxwZXIgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5oYXNTb3VuZEdyb3VwKHNvdW5kR3JvdXBOYW1lKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB2YXIgdl9wU291bmRHcm91cCA9IG5ldyBTb3VuZEdyb3VwKHNvdW5kR3JvdXBOYW1lLCBzb3VuZEdyb3VwSGVscGVyKTtcbiAgICAgICAgICAgIHZfcFNvdW5kR3JvdXAuYXZvaWRCZWluZ1JlcGxhY2VkQnlTYW1lUHJpb3JpdHkgPSBzb3VuZEdyb3VwQXZvaWRCZWluZ1JlcGxhY2VkQnlTYW1lUHJpb3JpdHk7XG4gICAgICAgICAgICB2X3BTb3VuZEdyb3VwLm11dGUgPSBzb3VuZEdyb3VwTXV0ZTtcbiAgICAgICAgICAgIHZfcFNvdW5kR3JvdXAudm9sdW1lID0gc291bmRHcm91cFZvbHVtZTtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRHcm91cHMuc2V0KHNvdW5kR3JvdXBOYW1lLCB2X3BTb3VuZEdyb3VwKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLmFkZFNvdW5kQWdlbnRIZWxwZXIgPSBmdW5jdGlvbiAoc291bmRHcm91cE5hbWUsIHNvdW5kQWdlbnRIZWxwZXIpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BTb3VuZEhlbHBlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgc291bmQgaGVscGVyIGZpcnN0LlwiKTtcbiAgICAgICAgICAgIHZhciB2X3BTb3VuZEdyb3VwID0gdGhpcy5nZXRTb3VuZEdyb3VwKHNvdW5kR3JvdXBOYW1lKTtcbiAgICAgICAgICAgIGlmICghdl9wU291bmRHcm91cClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTb3VuZCBncm91cCAnXCIgKyBzb3VuZEdyb3VwTmFtZSArIFwiJyBpcyBub3QgZXhpc3QuXCIpO1xuICAgICAgICAgICAgdl9wU291bmRHcm91cC5hZGRTb3VuZEFnZW50SGVscGVyKHRoaXMubV9wU291bmRIZWxwZXIsIHNvdW5kQWdlbnRIZWxwZXIpO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLmdldEFsbExvYWRpbmdTb3VuZFNlcmlhbElkcyA9IGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgICAgICB2YXIgdl9wUmV0ID0gcmVzdWx0cyB8fCBbXTtcbiAgICAgICAgICAgIHZfcFJldC5zcGxpY2UoMCwgdl9wUmV0Lmxlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kc0JlaW5nTG9hZGVkLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICB2X3BSZXQucHVzaCh2KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHZfcFJldDtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRNYW5hZ2VyLnByb3RvdHlwZS5pc0xvYWRpbmdTb3VuZCA9IGZ1bmN0aW9uIChzZXJpYWxJZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wU291bmRzQmVpbmdMb2FkZWQuaGFzKHNlcmlhbElkKTtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRNYW5hZ2VyLnByb3RvdHlwZS5wbGF5U291bmQgPSBmdW5jdGlvbiAoc291bmRBc3NldE5hbWUsIHNvdW5kR3JvdXBOYW1lLCBhbnlBcmcxLCBhbnlBcmcyLCBhbnlBcmczKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IHNldCByZXNvdXJjZSBtYW5hZ2VyIGZpcnN0LlwiKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BTb3VuZEhlbHBlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgc291bmQgaGVscGVyIGZpcnN0LlwiKTtcbiAgICAgICAgICAgIHZhciBwcmlvcml0eSA9IENvbnN0YW50LkRlZmF1bHRQcmlvcml0eTtcbiAgICAgICAgICAgIHZhciBwbGF5U291bmRQYXJhbXMgPSBudWxsO1xuICAgICAgICAgICAgdmFyIHVzZXJEYXRhID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIGFueUFyZzEpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJpb3JpdHkgPSBhbnlBcmcxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh1bmRlZmluZWQgIT0gYW55QXJnMSkge1xuICAgICAgICAgICAgICAgICAgICBwbGF5U291bmRQYXJhbXMgPSBhbnlBcmcxO1xuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YSA9IGFueUFyZzE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheVNvdW5kUGFyYW1zID0gYW55QXJnMjtcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGEgPSBhbnlBcmcyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDUpIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheVNvdW5kUGFyYW1zID0gYW55QXJnMjtcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGEgPSBhbnlBcmczO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2X2lTZXJpYWxJZCA9IHRoaXMubV9pU2VyaWFsKys7XG4gICAgICAgICAgICB2YXIgdl9wRXJyb3JDb2RlO1xuICAgICAgICAgICAgdmFyIHZfc0Vycm9yTWVzc2FnZTtcbiAgICAgICAgICAgIHZhciB2X3BTb3VuZEdyb3VwID0gdGhpcy5nZXRTb3VuZEdyb3VwKHNvdW5kR3JvdXBOYW1lKTtcbiAgICAgICAgICAgIGlmICghdl9wU291bmRHcm91cCkge1xuICAgICAgICAgICAgICAgIHZfcEVycm9yQ29kZSA9IFBsYXlTb3VuZEVycm9yQ29kZS5Tb3VuZEdyb3VwTm90RXhpc3Q7XG4gICAgICAgICAgICAgICAgdl9zRXJyb3JNZXNzYWdlID0gXCJTb3VuZCBncm91cCAnXCIgKyBzb3VuZEdyb3VwTmFtZSArIFwiJyBpcyBub3QgZXhpc3QuXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh2X3BTb3VuZEdyb3VwLnNvdW5kQWdlbnRDb3VudCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgdl9wRXJyb3JDb2RlID0gUGxheVNvdW5kRXJyb3JDb2RlLlNvdW5kR3JvdXBIYXNOb0FnZW50O1xuICAgICAgICAgICAgICAgIHZfc0Vycm9yTWVzc2FnZSA9IFwiU291bmQgZ3JvdXAgJ1wiICsgc291bmRHcm91cE5hbWUgKyBcIicgaXMgaGF2ZSBubyBzb3VuZCBhZ2VudC5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh2X3BFcnJvckNvZGUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tX3BQbGF5U291bmRGYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcFBsYXlTb3VuZEZhaWx1cmVEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHZfaVNlcmlhbElkLCBzb3VuZEFzc2V0TmFtZSwgc291bmRHcm91cE5hbWUsIHBsYXlTb3VuZFBhcmFtcywgdl9wRXJyb3JDb2RlLCB2X3NFcnJvck1lc3NhZ2UsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2X2lTZXJpYWxJZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHZfc0Vycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kc0JlaW5nTG9hZGVkLmFkZCh2X2lTZXJpYWxJZCk7XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlci5sb2FkQXNzZXQoc291bmRBc3NldE5hbWUsIHByaW9yaXR5LCB0aGlzLm1fcExvYWRBc3NldENhbGxiYWNrcywge1xuICAgICAgICAgICAgICAgIHNlcmlhbElkOiB2X2lTZXJpYWxJZCxcbiAgICAgICAgICAgICAgICBzb3VuZEdyb3VwOiB2X3BTb3VuZEdyb3VwLFxuICAgICAgICAgICAgICAgIHBsYXlTb3VuZFBhcmFtczogcGxheVNvdW5kUGFyYW1zLFxuICAgICAgICAgICAgICAgIHVzZXJEYXRhOiB1c2VyRGF0YVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdl9pU2VyaWFsSWQ7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUuc3RvcFNvdW5kID0gZnVuY3Rpb24gKHNlcmlhbElkLCBmYWRlT3V0U2Vjb25kcykge1xuICAgICAgICAgICAgdmFyIGVfOSwgX2E7XG4gICAgICAgICAgICBmYWRlT3V0U2Vjb25kcyA9IGZhZGVPdXRTZWNvbmRzIHx8IENvbnN0YW50LkRlZmF1bHRGYWRlT3V0U2Vjb25kcztcbiAgICAgICAgICAgIGlmICh0aGlzLmlzTG9hZGluZ1NvdW5kKHNlcmlhbElkKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wU291bmRzVG9SZWxlYXNlT25Mb2FkLmFkZChzZXJpYWxJZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BTb3VuZHNCZWluZ0xvYWRlZC5kZWxldGUoc2VyaWFsSWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRHcm91cHMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3VuZEdyb3VwID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VuZEdyb3VwLnN0b3BTb3VuZChzZXJpYWxJZCwgZmFkZU91dFNlY29uZHMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzlfMSkgeyBlXzkgPSB7IGVycm9yOiBlXzlfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV85KSB0aHJvdyBlXzkuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRNYW5hZ2VyLnByb3RvdHlwZS5zdG9wQWxsTG9hZGVkU291bmRzID0gZnVuY3Rpb24gKGZhZGVPdXRTZWNvbmRzKSB7XG4gICAgICAgICAgICB2YXIgZV8xMCwgX2E7XG4gICAgICAgICAgICBmYWRlT3V0U2Vjb25kcyA9IGZhZGVPdXRTZWNvbmRzIHx8IENvbnN0YW50LkRlZmF1bHRGYWRlT3V0U2Vjb25kcztcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFNvdW5kR3JvdXBzLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc291bmRHcm91cCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBzb3VuZEdyb3VwLnN0b3BBbGxMb2FkZWRTb3VuZHMoZmFkZU91dFNlY29uZHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzEwXzEpIHsgZV8xMCA9IHsgZXJyb3I6IGVfMTBfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xMCkgdGhyb3cgZV8xMC5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLnN0b3BBbGxMb2FkaW5nU291bmRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfMTEsIF9hO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRzQmVpbmdMb2FkZWQudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZXJpYWxJZCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcFNvdW5kc1RvUmVsZWFzZU9uTG9hZC5hZGQoc2VyaWFsSWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzExXzEpIHsgZV8xMSA9IHsgZXJyb3I6IGVfMTFfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xMSkgdGhyb3cgZV8xMS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLnBhdXNlU291bmQgPSBmdW5jdGlvbiAoc2VyaWFsSWQsIGZhZGVPdXRTZWNvbmRzKSB7XG4gICAgICAgICAgICB2YXIgZV8xMiwgX2E7XG4gICAgICAgICAgICBmYWRlT3V0U2Vjb25kcyA9IGZhZGVPdXRTZWNvbmRzIHx8IENvbnN0YW50LkRlZmF1bHRGYWRlT3V0U2Vjb25kcztcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFNvdW5kR3JvdXBzLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc291bmRHcm91cCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc291bmRHcm91cC5wYXVzZVNvdW5kKHNlcmlhbElkLCBmYWRlT3V0U2Vjb25kcykpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMTJfMSkgeyBlXzEyID0geyBlcnJvcjogZV8xMl8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEyKSB0aHJvdyBlXzEyLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGZpbmQgc291bmQgJ1wiICsgc2VyaWFsSWQgKyBcIicuXCIpO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLnJlc3VtZVNvdW5kID0gZnVuY3Rpb24gKHNlcmlhbElkLCBmYWRlSW5TZWNvbmRzKSB7XG4gICAgICAgICAgICB2YXIgZV8xMywgX2E7XG4gICAgICAgICAgICBmYWRlSW5TZWNvbmRzID0gZmFkZUluU2Vjb25kcyB8fCBDb25zdGFudC5EZWZhdWx0RmFkZUluU2Vjb25kcztcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFNvdW5kR3JvdXBzLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc291bmRHcm91cCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc291bmRHcm91cC5yZXN1bWVTb3VuZChzZXJpYWxJZCwgZmFkZUluU2Vjb25kcykpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMTNfMSkgeyBlXzEzID0geyBlcnJvcjogZV8xM18xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEzKSB0aHJvdyBlXzEzLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGZpbmQgc291bmQgJ1wiICsgc2VyaWFsSWQgKyBcIicuXCIpO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLm9uTG9hZFNvdW5kU3VjY2Vzc0NhbGxiYWNrID0gZnVuY3Rpb24gKHNvdW5kQXNzZXROYW1lLCBzb3VuZEFzc2V0LCBkdXJhdGlvbiwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAoIXZfcEluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGxheSBzb3VuZCBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wU291bmRzVG9SZWxlYXNlT25Mb2FkLmhhcyh2X3BJbmZvLnNlcmlhbElkKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wU291bmRzVG9SZWxlYXNlT25Mb2FkLmRlbGV0ZSh2X3BJbmZvLnNlcmlhbElkKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kc0JlaW5nTG9hZGVkLmRlbGV0ZSh2X3BJbmZvLnNlcmlhbElkKTtcbiAgICAgICAgICAgIHZhciB2X3BFcnJvckNvZGVPdXQgPSB7IGNvZGU6IDAgfTtcbiAgICAgICAgICAgIHZhciB2X3BTb3VuZEFnZW50ID0gdl9wSW5mby5zb3VuZEdyb3VwLnBsYXlTb3VuZCh2X3BJbmZvLnNlcmlhbElkLCBzb3VuZEFzc2V0LCB2X3BJbmZvLnBsYXlTb3VuZFBhcmFtcywgdl9wRXJyb3JDb2RlT3V0KTtcbiAgICAgICAgICAgIGlmICghdl9wU291bmRBZ2VudCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fcFBsYXlTb3VuZFN1Y2Nlc3NEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wUGxheVNvdW5kU3VjY2Vzc0RlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2X3BJbmZvKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4odl9wSW5mby5zZXJpYWxJZCwgc291bmRBc3NldE5hbWUsIHZfcFNvdW5kQWdlbnQsIGR1cmF0aW9uLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wU291bmRzVG9SZWxlYXNlT25Mb2FkLmRlbGV0ZSh2X3BJbmZvLnNlcmlhbElkKTtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRIZWxwZXIucmVsZWFzZVNvdW5kQXNzZXQoc291bmRBc3NldCk7XG4gICAgICAgICAgICB2YXIgdl9zRXJyb3JNZXNzYWdlID0gXCJTb3VuZCBncm91cCAnXCIgKyB2X3BJbmZvLnNvdW5kR3JvdXAubmFtZSArIFwiJyBwbGF5IHNvdW5kICdcIiArIHNvdW5kQXNzZXROYW1lICsgXCInIGZhaWx1cmUuXCI7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BQbGF5U291bmRGYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wUGxheVNvdW5kRmFpbHVyZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEluZm8pXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHZfcEluZm8uc2VyaWFsSWQsIHNvdW5kQXNzZXROYW1lLCB2X3BJbmZvLnNvdW5kR3JvdXAubmFtZSwgdl9wSW5mby5wbGF5U291bmRQYXJhbXMsIHZfcEVycm9yQ29kZU91dC5jb2RlLCB2X3NFcnJvck1lc3NhZ2UsIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHZfc0Vycm9yTWVzc2FnZSk7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUub25Mb2FkU291bmRGYWlsdXJlQ2FsbGJhY2sgPSBmdW5jdGlvbiAoc291bmRBc3NldE5hbWUsIHN0YXR1cywgZXJyb3JNZXNzYWdlLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmICghdl9wSW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQbGF5IHNvdW5kIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BTb3VuZHNUb1JlbGVhc2VPbkxvYWQuaGFzKHZfcEluZm8uc2VyaWFsSWQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BTb3VuZHNUb1JlbGVhc2VPbkxvYWQuZGVsZXRlKHZfcEluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wU291bmRzQmVpbmdMb2FkZWQuZGVsZXRlKHZfcEluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgdmFyIHZfc0Vycm9yTWVzc2FnZSA9IFwiTG9hZCBzb3VuZCBmYWlsdXJlLCBhc3NldCBuYW1lICdcIiArIHNvdW5kQXNzZXROYW1lICsgXCInLCBzdGF0dXMgJ1wiICsgc3RhdHVzICsgXCInLCBlcnJvciBtZXNzYWdlICdcIiArIGVycm9yTWVzc2FnZSArIFwiJ1wiO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wUGxheVNvdW5kRmFpbHVyZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFBsYXlTb3VuZEZhaWx1cmVEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2X3BJbmZvKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbih2X3BJbmZvLnNlcmlhbElkLCBzb3VuZEFzc2V0TmFtZSwgdl9wSW5mby5zb3VuZEdyb3VwLm5hbWUsIHZfcEluZm8ucGxheVNvdW5kUGFyYW1zLCBQbGF5U291bmRFcnJvckNvZGUuTG9hZEFzc2V0RmFpbHVyZSwgdl9zRXJyb3JNZXNzYWdlLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Iodl9zRXJyb3JNZXNzYWdlKTtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRNYW5hZ2VyLnByb3RvdHlwZS5vbkxvYWRTb3VuZFVwZGF0ZUNhbGxiYWNrID0gZnVuY3Rpb24gKHNvdW5kQXNzZXROYW1lLCBwcm9ncmVzcywgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAoIXZfcEluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGxheSBzb3VuZCBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wUGxheVNvdW5kVXBkYXRlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wUGxheVNvdW5kVXBkYXRlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAodl9wSW5mbylcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4odl9wSW5mby5zZXJpYWxJZCwgc291bmRBc3NldE5hbWUsIHZfcEluZm8uc291bmRHcm91cC5uYW1lLCB2X3BJbmZvLnBsYXlTb3VuZFBhcmFtcywgcHJvZ3Jlc3MsIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLm9uTG9hZFNvdW5kRGVwZW5kZW5jeUFzc2V0Q2FsbGJhY2sgPSBmdW5jdGlvbiAoc291bmRBc3NldE5hbWUsIGRlcGVuZGVuY3lBc3NldE5hbWUsIGxvYWRlZENvdW50LCB0b3RhbENvdW50LCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmICghdl9wSW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQbGF5IHNvdW5kIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BQbGF5U291bmREZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BQbGF5U291bmREZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2X3BJbmZvKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbih2X3BJbmZvLnNlcmlhbElkLCBzb3VuZEFzc2V0TmFtZSwgdl9wSW5mby5zb3VuZEdyb3VwLm5hbWUsIHZfcEluZm8ucGxheVNvdW5kUGFyYW1zLCBkZXBlbmRlbmN5QXNzZXROYW1lLCBsb2FkZWRDb3VudCwgdG90YWxDb3VudCwgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBTb3VuZE1hbmFnZXI7XG4gICAgfShCYXNlXzEuRnJhbWV3b3JrTW9kdWxlKSk7IC8vIGNsYXNzIFNvdW5kTWFuYWdlclxuICAgIGV4cG9ydHMuU291bmRNYW5hZ2VyID0gU291bmRNYW5hZ2VyO1xufSk7XG4iLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbnZhciBfX3ZhbHVlcyA9ICh0aGlzICYmIHRoaXMuX192YWx1ZXMpIHx8IGZ1bmN0aW9uKG8pIHtcbiAgICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xufTtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICB2YXIgVUlNYW5hZ2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICBfX2V4dGVuZHMoVUlNYW5hZ2VyLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBVSU1hbmFnZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgICAgICAgICAgIF90aGlzLm1fclVJR3JvdXBzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgX3RoaXMubV9pU2VyaWFsSWQgPSAwO1xuICAgICAgICAgICAgX3RoaXMubV9iSXNTaHV0ZG93biA9IGZhbHNlO1xuICAgICAgICAgICAgX3RoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgX3RoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZCA9IG5ldyBTZXQoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcEluc3RhbmNlUG9vbCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcFJlY3ljbGVRdWV1ZSA9IFtdO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZEFzc2V0Q2FsbGJhY2tzID0ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IF90aGlzLmxvYWRVSUZvcm1TdWNjZXNzQ2FsbGJhY2suYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgZmFpbHVyZTogX3RoaXMubG9hZFVJRm9ybUZhaWx1cmVDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICB1cGRhdGU6IF90aGlzLmxvYWRVSUZvcm1VcGRhdGVDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICBkZXBlbmRlbmN5OiBfdGhpcy5sb2FkVUlGb3JtRGVwZW5kZW5jeUFzc2V0Q2FsbGJhY2suYmluZChfdGhpcyksXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgX3RoaXMubV9wT3BlblVJRm9ybVN1Y2Nlc3NEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BPcGVuVUlGb3JtRmFpbHVyZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcE9wZW5VSUZvcm1VcGRhdGVEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BPcGVuVUlGb3JtRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wQ2xvc2VVSUZvcm1Db21wbGV0ZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fZkluc3RhbmNlQXV0b1JlbGVhc2VJbnRlcnZhbCA9IDA7XG4gICAgICAgICAgICBfdGhpcy5tX3VJbnN0YW5jZUNhcGFjaXR5ID0gMDtcbiAgICAgICAgICAgIF90aGlzLm1fZkluc3RhbmNlRXhwaXJlVGltZSA9IDA7XG4gICAgICAgICAgICBfdGhpcy5tX2lJbnN0YW5jZVByaW9yaXR5ID0gMDtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgICAgIC8vIHByaXZhdGUgZmlyZU9wZW5VSUZvcm1Db21wbGV0ZShlcnJvcjogRXJyb3IsIHVpRm9ybUFzc2V0TmFtZTogc3RyaW5nLCB1aUZvcm1Bc3NldDogb2JqZWN0LCBkdXJhdGlvbjogbnVtYmVyLCBpbmZvOiBPcGVuVUlGb3JtSW5mbyk6IHZvaWQge1xuICAgICAgICAgICAgLy8gdGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQuZGVsZXRlKGluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgLy8gaWYgKHRoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZC5oYXMoaW5mby5zZXJpYWxJZCkpIHtcbiAgICAgICAgICAgIC8vIHRoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZC5kZWxldGUoaW5mby5zZXJpYWxJZCk7XG4gICAgICAgICAgICAvLyBpZiAoIWVycm9yKVxuICAgICAgICAgICAgLy8gdGhpcy5tX3BVSUZvcm1IZWxwZXIucmVsZWFzZVVJRm9ybSh1aUZvcm1Bc3NldCBhcyBvYmplY3QsIG51bGwpO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gbGV0IHVpRm9ybTogSVVJRm9ybSA9IG51bGw7XG4gICAgICAgICAgICAvLyBpZiAoIWVycm9yKSB7XG4gICAgICAgICAgICAvLyBsZXQgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3Q6IFVJRm9ybUluc3RhbmNlT2JqZWN0ID0gVUlGb3JtSW5zdGFuY2VPYmplY3QuY3JlYXRlKHVpRm9ybUFzc2V0TmFtZSwgdWlGb3JtQXNzZXQsIHRoaXMubV9wVUlGb3JtSGVscGVyLmluc3RhbnRpYXRlVUlGb3JtKHVpRm9ybUFzc2V0IGFzIG9iamVjdCksIHRoaXMubV9wVUlGb3JtSGVscGVyKTtcbiAgICAgICAgICAgIC8vIC8vIFJlZ2lzdGVyIHRvIHBvb2wgYW5kIG1hcmsgc3Bhd24gZmxhZy5cbiAgICAgICAgICAgIC8vIGlmICghdGhpcy5tX3BJbnN0YW5jZVBvb2wuaGFzKHVpRm9ybUFzc2V0TmFtZSkpIHtcbiAgICAgICAgICAgIC8vIHRoaXMubV9wSW5zdGFuY2VQb29sLnNldCh1aUZvcm1Bc3NldE5hbWUsIFtdKTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIC8vIGxldCB2X3BJbnN0YW5jZU9iamVjdHM6IFVJRm9ybUluc3RhbmNlT2JqZWN0W10gPSB0aGlzLm1fcEluc3RhbmNlUG9vbC5nZXQodWlGb3JtQXNzZXROYW1lKTtcbiAgICAgICAgICAgIC8vIGlmICh2X3BJbnN0YW5jZU9iamVjdHMubGVuZ3RoIDwgdGhpcy5tX3VJbnN0YW5jZUNhcGFjaXR5KSB7XG4gICAgICAgICAgICAvLyB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC5zcGF3biA9IHRydWU7XG4gICAgICAgICAgICAvLyB2X3BJbnN0YW5jZU9iamVjdHMucHVzaCh2X3BVaUZvcm1JbnN0YW5jZU9iamVjdCk7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvLyB0aGlzLm9wZW5VSUZvcm1JbnRlcm5hbChpbmZvLnNlcmlhbElkLCB1aUZvcm1Bc3NldE5hbWUsIGluZm8udWlHcm91cCBhcyBVSUdyb3VwLCB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC50YXJnZXQsIGluZm8ucGF1c2VDb3ZlcmVkVUlGb3JtLCB0cnVlLCBkdXJhdGlvbiwgaW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAvLyB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gbGV0IGV2ZW50QXJnczogT3BlblVJRm9ybUZhaWx1cmVFdmVudEFyZ3MgPSB7XG4gICAgICAgICAgICAvLyBlcnJvck1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgICAvLyBzZXJpYWxJZDogaW5mby5zZXJpYWxJZCxcbiAgICAgICAgICAgIC8vIHBhdXNlQ292ZXJlZFVJRm9ybTogaW5mby5wYXVzZUNvdmVyZWRVSUZvcm0sXG4gICAgICAgICAgICAvLyB1aUdyb3VwTmFtZTogaW5mby51aUdyb3VwLm5hbWUsXG4gICAgICAgICAgICAvLyB1aUZvcm1Bc3NldE5hbWU6IHVpRm9ybUFzc2V0TmFtZSxcbiAgICAgICAgICAgIC8vIHVzZXJEYXRhOiBpbmZvLnVzZXJEYXRhXG4gICAgICAgICAgICAvLyB9O1xuICAgICAgICAgICAgLy8gdGhpcy5tX3BPcGVuVUlGb3JtRmFpbHVyZURlbGVnYXRlLml0ZXIoKGNhbGxiYWNrRm46IE9wZW5VSUZvcm1GYWlsdXJlRXZlbnRIYW5kbGVyKSA9PiB7XG4gICAgICAgICAgICAvLyBjYWxsYmFja0ZuKGV2ZW50QXJncyk7XG4gICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIC8vIHByaXZhdGUgZmlyZU9wZW5VSUZvcm1Qcm9ncmVzcyh1aUZvcm1Bc3NldE5hbWU6IHN0cmluZywgcHJvZ3Jlc3M6IG51bWJlciwgaW5mbzogT3BlblVJRm9ybUluZm8pOiB2b2lkIHtcbiAgICAgICAgICAgIC8vIGxldCBldmVudEFyZ3M6IE9wZW5VSUZvcm1VcGRhdGVFdmVudEFyZ3MgPSB7XG4gICAgICAgICAgICAvLyBzZXJpYWxJZDogaW5mby5zZXJpYWxJZCxcbiAgICAgICAgICAgIC8vIHBhdXNlQ292ZXJlZFVJRm9ybTogaW5mby5wYXVzZUNvdmVyZWRVSUZvcm0sXG4gICAgICAgICAgICAvLyBwcm9ncmVzczogcHJvZ3Jlc3MsXG4gICAgICAgICAgICAvLyB1aUZvcm1Bc3NldE5hbWU6IHVpRm9ybUFzc2V0TmFtZSxcbiAgICAgICAgICAgIC8vIHVpR3JvdXBOYW1lOiBpbmZvLnVpR3JvdXAubmFtZSxcbiAgICAgICAgICAgIC8vIHVzZXJEYXRhOiBpbmZvLnVzZXJEYXRhXG4gICAgICAgICAgICAvLyB9O1xuICAgICAgICAgICAgLy8gdGhpcy5tX3BPcGVuVUlGb3JtVXBkYXRlRGVsZWdhdGUuaXRlcigoY2FsbGJhY2tGbjogT3BlblVJRm9ybVVwZGF0ZUV2ZW50SGFuZGxlcikgPT4ge1xuICAgICAgICAgICAgLy8gY2FsbGJhY2tGbihldmVudEFyZ3MpO1xuICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJTWFuYWdlci5wcm90b3R5cGUsIFwidWlGb3JtSGVscGVyXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BVSUZvcm1IZWxwZXI7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICghdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBoZWxwZXIgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUhlbHBlciA9IHZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSU1hbmFnZXIucHJvdG90eXBlLCBcInJlc291cmNlTWFuYWdlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAobnVsbCA9PSB2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUmVzb3VyY2UgbWFuYWdlciBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlciA9IHZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSU1hbmFnZXIucHJvdG90eXBlLCBcInVpR3JvdXBDb3VudFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3JVSUdyb3Vwcy5zaXplO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSU1hbmFnZXIucHJvdG90eXBlLCBcIm9wZW5VSUZvcm1TdWNjZXNzXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BPcGVuVUlGb3JtU3VjY2Vzc0RlbGVnYXRlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJTWFuYWdlci5wcm90b3R5cGUsIFwib3BlblVJRm9ybUZhaWx1cmVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcE9wZW5VSUZvcm1GYWlsdXJlRGVsZWdhdGU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlNYW5hZ2VyLnByb3RvdHlwZSwgXCJvcGVuVUlGb3JtVXBkYXRlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BPcGVuVUlGb3JtVXBkYXRlRGVsZWdhdGU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlNYW5hZ2VyLnByb3RvdHlwZSwgXCJvcGVuVUlGb3JtRGVwZW5kZW5jeUFzc2V0XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BPcGVuVUlGb3JtRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlNYW5hZ2VyLnByb3RvdHlwZSwgXCJjbG9zZVVJRm9ybUNvbXBsZXRlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BDbG9zZVVJRm9ybUNvbXBsZXRlRGVsZWdhdGU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlNYW5hZ2VyLnByb3RvdHlwZSwgXCJpbnN0YW5jZUF1dG9SZWxlYXNlSW50ZXJ2YWxcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fZkluc3RhbmNlQXV0b1JlbGVhc2VJbnRlcnZhbDsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9mSW5zdGFuY2VBdXRvUmVsZWFzZUludGVydmFsID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlNYW5hZ2VyLnByb3RvdHlwZSwgXCJpbnN0YW5jZUNhcGFjaXR5XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3VJbnN0YW5jZUNhcGFjaXR5OyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX3VJbnN0YW5jZUNhcGFjaXR5ID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlNYW5hZ2VyLnByb3RvdHlwZSwgXCJpbnN0YW5jZUV4cGlyZVRpbWVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fZkluc3RhbmNlRXhwaXJlVGltZTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9mSW5zdGFuY2VFeHBpcmVUaW1lID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlNYW5hZ2VyLnByb3RvdHlwZSwgXCJpbnN0YW5jZVByaW9yaXR5XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX2lJbnN0YW5jZVByaW9yaXR5OyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX2lJbnN0YW5jZVByaW9yaXR5ID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgdmFyIGVfMSwgX2EsIGVfMiwgX2I7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9jID0gX192YWx1ZXModGhpcy5tX3BSZWN5Y2xlUXVldWUpLCBfZCA9IF9jLm5leHQoKTsgIV9kLmRvbmU7IF9kID0gX2MubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB1aUZvcm0gPSBfZC52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubV9wSW5zdGFuY2VQb29sLmhhcyh1aUZvcm0udWlGb3JtQXNzZXROYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZfcEluc3RhbmNlT2JqZWN0cyA9IHRoaXMubV9wSW5zdGFuY2VQb29sLmdldCh1aUZvcm0udWlGb3JtQXNzZXROYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2X3BJbnN0YW5jZU9iamVjdHMgJiYgdl9wSW5zdGFuY2VPYmplY3RzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciB2X3BJbnN0YW5jZU9iamVjdHNfMSA9IChlXzIgPSB2b2lkIDAsIF9fdmFsdWVzKHZfcEluc3RhbmNlT2JqZWN0cykpLCB2X3BJbnN0YW5jZU9iamVjdHNfMV8xID0gdl9wSW5zdGFuY2VPYmplY3RzXzEubmV4dCgpOyAhdl9wSW5zdGFuY2VPYmplY3RzXzFfMS5kb25lOyB2X3BJbnN0YW5jZU9iamVjdHNfMV8xID0gdl9wSW5zdGFuY2VPYmplY3RzXzEubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QgPSB2X3BJbnN0YW5jZU9iamVjdHNfMV8xLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1aUZvcm0ub25SZWN5Y2xlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3Quc3Bhd24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZV8yXzEpIHsgZV8yID0geyBlcnJvcjogZV8yXzEgfTsgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEluc3RhbmNlT2JqZWN0c18xXzEgJiYgIXZfcEluc3RhbmNlT2JqZWN0c18xXzEuZG9uZSAmJiAoX2IgPSB2X3BJbnN0YW5jZU9iamVjdHNfMS5yZXR1cm4pKSBfYi5jYWxsKHZfcEluc3RhbmNlT2JqZWN0c18xKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMikgdGhyb3cgZV8yLmVycm9yOyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMV8xKSB7IGVfMSA9IHsgZXJyb3I6IGVfMV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfZCAmJiAhX2QuZG9uZSAmJiAoX2EgPSBfYy5yZXR1cm4pKSBfYS5jYWxsKF9jKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubV9wUmVjeWNsZVF1ZXVlLmxlbmd0aClcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlY3ljbGVRdWV1ZS5zcGxpY2UoMCwgdGhpcy5tX3BSZWN5Y2xlUXVldWUubGVuZ3RoKTtcbiAgICAgICAgICAgIC8vIFRPRE86IGF1dG8gcmVsZWFzZSBwcm9jZXNzaW5nIGhlcmUuXG4gICAgICAgICAgICB0aGlzLm1fclVJR3JvdXBzLmZvckVhY2goZnVuY3Rpb24gKHVpR3JvdXAsIGtleSkge1xuICAgICAgICAgICAgICAgIHZhciB2X3BVaUdyb3VwID0gdWlHcm91cDtcbiAgICAgICAgICAgICAgICB2X3BVaUdyb3VwLnVwZGF0ZShlbGFwc2VkLCByZWFsRWxhcHNlZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLm1fYklzU2h1dGRvd24gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5jbG9zZUFsbExvYWRlZFVJRm9ybXMoKTtcbiAgICAgICAgICAgIHRoaXMubV9wUmVjeWNsZVF1ZXVlLnNwbGljZSgwLCB0aGlzLm1fcFJlY3ljbGVRdWV1ZS5sZW5ndGgpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wSW5zdGFuY2VQb29sKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BJbnN0YW5jZVBvb2wuZm9yRWFjaChmdW5jdGlvbiAoaW5zdGFuY2VPYmplY3RzLCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVfMywgX2E7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZU9iamVjdHMgJiYgaW5zdGFuY2VPYmplY3RzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaW5zdGFuY2VPYmplY3RzXzEgPSBfX3ZhbHVlcyhpbnN0YW5jZU9iamVjdHMpLCBpbnN0YW5jZU9iamVjdHNfMV8xID0gaW5zdGFuY2VPYmplY3RzXzEubmV4dCgpOyAhaW5zdGFuY2VPYmplY3RzXzFfMS5kb25lOyBpbnN0YW5jZU9iamVjdHNfMV8xID0gaW5zdGFuY2VPYmplY3RzXzEubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdCA9IGluc3RhbmNlT2JqZWN0c18xXzEudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LnJlbGVhc2UodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGVfM18xKSB7IGVfMyA9IHsgZXJyb3I6IGVfM18xIH07IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZU9iamVjdHNfMV8xICYmICFpbnN0YW5jZU9iamVjdHNfMV8xLmRvbmUgJiYgKF9hID0gaW5zdGFuY2VPYmplY3RzXzEucmV0dXJuKSkgX2EuY2FsbChpbnN0YW5jZU9iamVjdHNfMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8zKSB0aHJvdyBlXzMuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlT2JqZWN0cy5zcGxpY2UoMCwgaW5zdGFuY2VPYmplY3RzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5tX3BJbnN0YW5jZVBvb2wuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEluc3RhbmNlUG9vbC5jbGVhcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLm9wZW5VSUZvcm0gPSBmdW5jdGlvbiAodWlGb3JtQXNzZXROYW1lLCB1aUdyb3VwTmFtZSwgcHJpb3JpdHksIHBhdXNlQ292ZXJlZFVJRm9ybSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIC8vIGNjLmxvZyhgW1VJTWFuYWdlcl0gUmVxZXVzdCBPcGVuIFVJRm9ybSBhc3NldCAnJHt1aUZvcm1Bc3NldE5hbWV9JyB3aXRoIGdyb3VwICcke3VpR3JvdXBOYW1lfScgb24gcHJpb3JpdHkgJyR7cHJpb3JpdHl9JywgcGF1c2VDb3ZlcmVkVUlGb3JtOiAke3BhdXNlQ292ZXJlZFVJRm9ybX0sIHVzZXJEYXRhOiAke3VzZXJEYXRhfWApO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IHJlc291cmNlIG1hbmFnZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BVSUZvcm1IZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IFVJIGZvcm0gaGVscGVyIGZpcnN0LlwiKTtcbiAgICAgICAgICAgIGlmICghdWlGb3JtQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBhc3NldCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBpZiAoIXVpR3JvdXBOYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZ3JvdXAgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdmFyIHZfclVJR3JvdXAgPSB0aGlzLmdldFVJR3JvdXAodWlHcm91cE5hbWUpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9yVUlHcm91cCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVJIGdyb3VwICdcIiArIHVpR3JvdXBOYW1lICsgXCInIGlzIG5vdCBleGlzdC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdl9pU2VyaWFsSWQgPSArK3RoaXMubV9pU2VyaWFsSWQ7XG4gICAgICAgICAgICB2YXIgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3Q7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BJbnN0YW5jZVBvb2wuaGFzKHVpRm9ybUFzc2V0TmFtZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBHZXQgc3Bhd24uXG4gICAgICAgICAgICAgICAgdmFyIHZfcEluc3RhbmNlT2JqZWN0cyA9IHRoaXMubV9wSW5zdGFuY2VQb29sLmdldCh1aUZvcm1Bc3NldE5hbWUpO1xuICAgICAgICAgICAgICAgIGlmICh2X3BJbnN0YW5jZU9iamVjdHMgJiYgdl9wSW5zdGFuY2VPYmplY3RzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2X3BJbnN0YW5jZU9iamVjdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2X3BJbnN0YW5jZU9iamVjdHNbaV0uaXNWYWxpZCAmJiAhdl9wSW5zdGFuY2VPYmplY3RzW2ldLnNwYXduKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QgPSB2X3BJbnN0YW5jZU9iamVjdHNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3Quc3Bhd24gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQuaGFzKHZfaVNlcmlhbElkKSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiS2V5IGR1cGxpY2F0ZWQgd2l0aDogXCIgKyB2X2lTZXJpYWxJZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQuc2V0KHZfaVNlcmlhbElkLCB1aUZvcm1Bc3NldE5hbWUpO1xuICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBjYWxsIG9uIHJlc291cmNlIG1hbmFnZXIgdG8gbG9hZEFzc2V0LlxuICAgICAgICAgICAgICAgIHZhciB2X3JPcGVuVWlGb3JtSW5mbyA9IHtcbiAgICAgICAgICAgICAgICAgICAgc2VyaWFsSWQ6IHZfaVNlcmlhbElkLFxuICAgICAgICAgICAgICAgICAgICB1aUdyb3VwOiB2X3JVSUdyb3VwLFxuICAgICAgICAgICAgICAgICAgICBwYXVzZUNvdmVyZWRVSUZvcm06IHBhdXNlQ292ZXJlZFVJRm9ybSxcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGE6IHVzZXJEYXRhXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlci5sb2FkQXNzZXQodWlGb3JtQXNzZXROYW1lLCBwcmlvcml0eSwgdGhpcy5tX3BMb2FkQXNzZXRDYWxsYmFja3MsIHZfck9wZW5VaUZvcm1JbmZvKTtcbiAgICAgICAgICAgICAgICAvLyBsZXQgdl9mVGltZVN0YXJ0OiBudW1iZXIgPSBuZXcgRGF0ZSgpLnZhbHVlT2YoKTtcbiAgICAgICAgICAgICAgICAvLyBjYy5sb2FkZXIubG9hZFJlcyh1aUZvcm1Bc3NldE5hbWUsIGNjLkFzc2V0LCAoY29tcGxldGVDb3VudDogbnVtYmVyLCB0b3RhbENvdW50OiBudW1iZXIsIGl0ZW06IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIC8vIFByb2dyZXNzIHByb2Nlc3NpbmcgdXBkYXRlLlxuICAgICAgICAgICAgICAgIC8vIC8vIGNjLndhcm4oYGxvYWRpbmcgcHJvZ3Jlc3M6ICR7Y29tcGxldGVDb3VudH0vJHt0b3RhbENvdW50fSwgaXRlbTogJHtpdGVtfWApO1xuICAgICAgICAgICAgICAgIC8vIHRoaXMuZmlyZU9wZW5VSUZvcm1Qcm9ncmVzcyh1aUZvcm1Bc3NldE5hbWUsIGNvbXBsZXRlQ291bnQgLyB0b3RhbENvdW50LCB2X3JPcGVuVWlGb3JtSW5mbyk7XG4gICAgICAgICAgICAgICAgLy8gfSwgKGVycm9yOiBFcnJvciwgcmVzb3VyY2U6IG9iamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIGNjLndhcm4oYGxvYWRSZXMgY29tcGxldGUgd2l0aCBpbmZvOiAke3Zfck9wZW5VaUZvcm1JbmZvLnNlcmlhbElkfSwgJHt2X3JPcGVuVWlGb3JtSW5mby51aUdyb3VwLm5hbWV9LCAke3VpRm9ybUFzc2V0TmFtZX1gKTtcbiAgICAgICAgICAgICAgICAvLyAvLyBsb2FkIGNvbXBsZXRlZC5cbiAgICAgICAgICAgICAgICAvLyB0aGlzLmZpcmVPcGVuVUlGb3JtQ29tcGxldGUoZXJyb3IsIHVpRm9ybUFzc2V0TmFtZSwgcmVzb3VyY2UsIG5ldyBEYXRlKCkudmFsdWVPZigpIC0gdl9mVGltZVN0YXJ0LCB2X3JPcGVuVWlGb3JtSW5mbyk7XG4gICAgICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW5VSUZvcm1JbnRlcm5hbCh2X2lTZXJpYWxJZCwgdWlGb3JtQXNzZXROYW1lLCB2X3JVSUdyb3VwLCB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC50YXJnZXQsIHBhdXNlQ292ZXJlZFVJRm9ybSwgZmFsc2UsIDAsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2X2lTZXJpYWxJZDtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5pc0xvYWRpbmdVSUZvcm0gPSBmdW5jdGlvbiAoc2VyaWFsSWRPckFzc2V0TmFtZSkge1xuICAgICAgICAgICAgdmFyIGVfNCwgX2E7XG4gICAgICAgICAgICBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiBzZXJpYWxJZE9yQXNzZXROYW1lKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZC52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB1aUZvcm1Bc3NldE5hbWUgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1aUZvcm1Bc3NldE5hbWUgPT09IHNlcmlhbElkT3JBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVfNF8xKSB7IGVfNCA9IHsgZXJyb3I6IGVfNF8xIH07IH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNCkgdGhyb3cgZV80LmVycm9yOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZC5oYXMoc2VyaWFsSWRPckFzc2V0TmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUuZ2V0VUlGb3JtcyA9IGZ1bmN0aW9uICh1aUZvcm1Bc3NldE5hbWUpIHtcbiAgICAgICAgICAgIHZhciBlXzUsIF9hO1xuICAgICAgICAgICAgdmFyIHZfclJldCA9IFtdO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9yVUlHcm91cHMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB1aUdyb3VwID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChudWxsICE9IHVpR3JvdXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2X3BGb3JtcyA9IHVpR3JvdXAuZ2V0VUlGb3Jtcyh1aUZvcm1Bc3NldE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdl9yUmV0ID0gdl9yUmV0LmNvbmNhdCh2X3BGb3Jtcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV81XzEpIHsgZV81ID0geyBlcnJvcjogZV81XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNSkgdGhyb3cgZV81LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdl9yUmV0O1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmdldFVJRm9ybSA9IGZ1bmN0aW9uIChzZXJpYWxJZE9yQXNzZXROYW1lKSB7XG4gICAgICAgICAgICB2YXIgZV82LCBfYTtcbiAgICAgICAgICAgIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIHNlcmlhbElkT3JBc3NldE5hbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXNlcmlhbElkT3JBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBhc3NldCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdWlGb3JtO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9yVUlHcm91cHMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB1aUdyb3VwID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICgodWlGb3JtID0gdWlHcm91cC5nZXRVSUZvcm0oc2VyaWFsSWRPckFzc2V0TmFtZSkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdWlGb3JtO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfNl8xKSB7IGVfNiA9IHsgZXJyb3I6IGVfNl8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzYpIHRocm93IGVfNi5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUuaGFzVUlGb3JtID0gZnVuY3Rpb24gKHNlcmlhbElkT3JBc3NldE5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsICE9IHRoaXMuZ2V0VUlGb3JtKHNlcmlhbElkT3JBc3NldE5hbWUpO1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmNsb3NlVUlGb3JtID0gZnVuY3Rpb24gKHNlcmlhbElkT3JVaUZvcm0sIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdWlGb3JtID0gc2VyaWFsSWRPclVpRm9ybTtcbiAgICAgICAgICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIHNlcmlhbElkT3JVaUZvcm0pIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmdVSUZvcm0oc2VyaWFsSWRPclVpRm9ybSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3JVSUZvcm1zVG9SZWxlYXNlT25Mb2FkLmFkZChzZXJpYWxJZE9yVWlGb3JtKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQuZGVsZXRlKHNlcmlhbElkT3JVaUZvcm0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHVpRm9ybSA9IHRoaXMuZ2V0VUlGb3JtKHNlcmlhbElkT3JVaUZvcm0pO1xuICAgICAgICAgICAgICAgIGlmIChudWxsID09IHVpRm9ybSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGZpbmQgVUkgZm9ybSAnXCIgKyBzZXJpYWxJZE9yVWlGb3JtICsgXCInXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdWlGb3JtKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdmFyIHVpR3JvdXAgPSB1aUZvcm0udWlHcm91cDtcbiAgICAgICAgICAgIGlmIChudWxsID09IHVpR3JvdXApXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBncm91cCBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdXNlckRhdGEgPSB1c2VyRGF0YSB8fCBudWxsO1xuICAgICAgICAgICAgdWlHcm91cC5yZW1vdmVVSUZvcm0odWlGb3JtKTtcbiAgICAgICAgICAgIHVpRm9ybS5vbkNsb3NlKHRoaXMubV9iSXNTaHV0ZG93biwgdXNlckRhdGEpO1xuICAgICAgICAgICAgdWlHcm91cC5yZWZyZXNoKCk7XG4gICAgICAgICAgICB2YXIgZXZlbnRBcmdzID0ge1xuICAgICAgICAgICAgICAgIHNlcmlhbElkOiB1aUZvcm0uc2VyaWFsSWQsXG4gICAgICAgICAgICAgICAgdWlHcm91cDogdWlHcm91cCxcbiAgICAgICAgICAgICAgICB1aUZvcm1Bc3NldE5hbWU6IHVpRm9ybS51aUZvcm1Bc3NldE5hbWUsXG4gICAgICAgICAgICAgICAgdXNlckRhdGE6IHVzZXJEYXRhXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5tX3BDbG9zZVVJRm9ybUNvbXBsZXRlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oZXZlbnRBcmdzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5tX3BSZWN5Y2xlUXVldWUucHVzaCh1aUZvcm0pO1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmdldEFsbExvYWRlZFVJRm9ybXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZV83LCBfYTtcbiAgICAgICAgICAgIHZhciB2X3BSZXQgPSBbXTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fclVJR3JvdXBzLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdWlHcm91cCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB2X3BSZXQuY29uY2F0KHVpR3JvdXAuZ2V0QWxsVUlGb3JtcygpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV83XzEpIHsgZV83ID0geyBlcnJvcjogZV83XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNykgdGhyb3cgZV83LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdl9wUmV0O1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmNsb3NlQWxsTG9hZGVkVUlGb3JtcyA9IGZ1bmN0aW9uICh1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIGVfOCwgX2E7XG4gICAgICAgICAgICB2YXIgdl9wVUlGb3JtcyA9IHRoaXMuZ2V0QWxsTG9hZGVkVUlGb3JtcygpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB2X3BVSUZvcm1zXzEgPSBfX3ZhbHVlcyh2X3BVSUZvcm1zKSwgdl9wVUlGb3Jtc18xXzEgPSB2X3BVSUZvcm1zXzEubmV4dCgpOyAhdl9wVUlGb3Jtc18xXzEuZG9uZTsgdl9wVUlGb3Jtc18xXzEgPSB2X3BVSUZvcm1zXzEubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB1aUZvcm0gPSB2X3BVSUZvcm1zXzFfMS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmhhc1VJRm9ybSh1aUZvcm0uc2VyaWFsSWQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VVSUZvcm0odWlGb3JtLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfOF8xKSB7IGVfOCA9IHsgZXJyb3I6IGVfOF8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2X3BVSUZvcm1zXzFfMSAmJiAhdl9wVUlGb3Jtc18xXzEuZG9uZSAmJiAoX2EgPSB2X3BVSUZvcm1zXzEucmV0dXJuKSkgX2EuY2FsbCh2X3BVSUZvcm1zXzEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfOCkgdGhyb3cgZV84LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUuY2xvc2VBbGxMb2FkaW5nVUlGb3JtcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBlXzksIF9hO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkLmtleXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlcmlhbElkID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZC5hZGQoc2VyaWFsSWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzlfMSkgeyBlXzkgPSB7IGVycm9yOiBlXzlfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV85KSB0aHJvdyBlXzkuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkLmNsZWFyKCk7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUucmVmb2N1c1VJRm9ybSA9IGZ1bmN0aW9uICh1aUZvcm0sIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB1aUZvcm0pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB2YXIgdWlHcm91cCA9IHVpRm9ybS51aUdyb3VwO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdWlHcm91cClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGdyb3VwIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB1c2VyRGF0YSA9IHVzZXJEYXRhIHx8IG51bGw7XG4gICAgICAgICAgICB1aUdyb3VwLnJlZm9jdXNVSUZvcm0odWlGb3JtLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICB1aUdyb3VwLnJlZnJlc2goKTtcbiAgICAgICAgICAgIHVpRm9ybS5vblJlZm9jdXModXNlckRhdGEpO1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmhhc1VJR3JvdXAgPSBmdW5jdGlvbiAodWlHcm91cE5hbWUpIHtcbiAgICAgICAgICAgIGlmICghdWlHcm91cE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBncm91cCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3JVSUdyb3Vwcy5oYXModWlHcm91cE5hbWUpO1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmdldFVJR3JvdXAgPSBmdW5jdGlvbiAodWlHcm91cE5hbWUpIHtcbiAgICAgICAgICAgIGlmICghdWlHcm91cE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBncm91cCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3JVSUdyb3Vwcy5nZXQodWlHcm91cE5hbWUpIHx8IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUuYWRkVUlHcm91cCA9IGZ1bmN0aW9uICh1aUdyb3VwTmFtZSwgYXJnMSwgYXJnMikge1xuICAgICAgICAgICAgaWYgKCF1aUdyb3VwTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGdyb3VwIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHZhciB1aUdyb3VwRGVwdGggPSAwO1xuICAgICAgICAgICAgdmFyIHVpR3JvdXBIZWxwZXI7XG4gICAgICAgICAgICBpZiAoJ251bWJlcicgPT09IHR5cGVvZiBhcmcxKSB7XG4gICAgICAgICAgICAgICAgdWlHcm91cERlcHRoID0gYXJnMTtcbiAgICAgICAgICAgICAgICBpZiAodW5kZWZpbmVkICE9IGFyZzIpIHtcbiAgICAgICAgICAgICAgICAgICAgdWlHcm91cEhlbHBlciA9IGFyZzI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdWlHcm91cEhlbHBlciA9IGFyZzE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXVpR3JvdXBIZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBncm91cCBoZWxwZXIgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc1VJR3JvdXAodWlHcm91cE5hbWUpKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubV9yVUlHcm91cHMuc2V0KHVpR3JvdXBOYW1lLCBuZXcgVUlHcm91cCh1aUdyb3VwTmFtZSwgdWlHcm91cERlcHRoLCB1aUdyb3VwSGVscGVyKSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5vcGVuVUlGb3JtSW50ZXJuYWwgPSBmdW5jdGlvbiAoc2VyaWFsSWQsIHVpRm9ybUFzc2V0TmFtZSwgdWlHcm91cCwgdWlGb3JtSW5zdGFuY2UsIHBhdXNlQ292ZXJlZFVJRm9ybSwgaXNOZXdJbnN0YW5jZSwgZHVyYXRpb24sIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdWlGb3JtID0gdGhpcy5tX3BVSUZvcm1IZWxwZXIuY3JlYXRlVUlGb3JtKHVpRm9ybUluc3RhbmNlLCB1aUdyb3VwLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB1aUZvcm0pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW4gbm90IGNyZWF0ZSBVSSBmb3JtIGluIGhlbHBlci4nKTtcbiAgICAgICAgICAgIHVpRm9ybS5vbkluaXQoc2VyaWFsSWQsIHVpRm9ybUFzc2V0TmFtZSwgdWlHcm91cCwgcGF1c2VDb3ZlcmVkVUlGb3JtLCBpc05ld0luc3RhbmNlLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICB1aUdyb3VwLmFkZFVJRm9ybSh1aUZvcm0pO1xuICAgICAgICAgICAgdWlGb3JtLm9uT3Blbih1c2VyRGF0YSk7XG4gICAgICAgICAgICB1aUdyb3VwLnJlZnJlc2goKTtcbiAgICAgICAgICAgIHZhciBldmVudEFyZ3MgPSB7XG4gICAgICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uLFxuICAgICAgICAgICAgICAgIHVpRm9ybTogdWlGb3JtLFxuICAgICAgICAgICAgICAgIHVzZXJEYXRhOiB1c2VyRGF0YVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMubV9wT3BlblVJRm9ybVN1Y2Nlc3NEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2tGbihldmVudEFyZ3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUubG9hZFVJRm9ybVN1Y2Nlc3NDYWxsYmFjayA9IGZ1bmN0aW9uICh1aUZvcm1Bc3NldE5hbWUsIHVpRm9ybUFzc2V0LCBkdXJhdGlvbiwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk9wZW4gVUkgZm9ybSBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZC5oYXModl9wSW5mby5zZXJpYWxJZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNUb1JlbGVhc2VPbkxvYWQuZGVsZXRlKHZfcEluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wVUlGb3JtSGVscGVyLnJlbGVhc2VVSUZvcm0odWlGb3JtQXNzZXQsIG51bGwpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkLmRlbGV0ZSh2X3BJbmZvLnNlcmlhbElkKTtcbiAgICAgICAgICAgIHZhciB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdCA9IFVJRm9ybUluc3RhbmNlT2JqZWN0LmNyZWF0ZSh1aUZvcm1Bc3NldE5hbWUsIHVpRm9ybUFzc2V0LCB0aGlzLm1fcFVJRm9ybUhlbHBlci5pbnN0YW50aWF0ZVVJRm9ybSh1aUZvcm1Bc3NldCksIHRoaXMubV9wVUlGb3JtSGVscGVyKTtcbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIHRvIHBvb2wgYW5kIG1hcmsgc3Bhd24gZmxhZy5cbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BJbnN0YW5jZVBvb2wuaGFzKHVpRm9ybUFzc2V0TmFtZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEluc3RhbmNlUG9vbC5zZXQodWlGb3JtQXNzZXROYW1lLCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdl9wSW5zdGFuY2VPYmplY3RzID0gdGhpcy5tX3BJbnN0YW5jZVBvb2wuZ2V0KHVpRm9ybUFzc2V0TmFtZSk7XG4gICAgICAgICAgICBpZiAodl9wSW5zdGFuY2VPYmplY3RzICYmIHZfcEluc3RhbmNlT2JqZWN0cy5sZW5ndGggPCB0aGlzLm1fdUluc3RhbmNlQ2FwYWNpdHkpIHtcbiAgICAgICAgICAgICAgICB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC5zcGF3biA9IHRydWU7XG4gICAgICAgICAgICAgICAgdl9wSW5zdGFuY2VPYmplY3RzLnB1c2godl9wVWlGb3JtSW5zdGFuY2VPYmplY3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vcGVuVUlGb3JtSW50ZXJuYWwodl9wSW5mby5zZXJpYWxJZCwgdWlGb3JtQXNzZXROYW1lLCB2X3BJbmZvLnVpR3JvdXAsIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LnRhcmdldCwgdl9wSW5mby5wYXVzZUNvdmVyZWRVSUZvcm0sIHRydWUsIGR1cmF0aW9uLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5sb2FkVUlGb3JtRmFpbHVyZUNhbGxiYWNrID0gZnVuY3Rpb24gKHVpRm9ybUFzc2V0TmFtZSwgc3RhdHVzLCBlcnJvck1lc3NhZ2UsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wSW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJPcGVuIFVJIGZvcm0gaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fclVJRm9ybXNUb1JlbGVhc2VPbkxvYWQuaGFzKHZfcEluZm8uc2VyaWFsSWQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3JVSUZvcm1zVG9SZWxlYXNlT25Mb2FkLmRlbGV0ZSh2X3BJbmZvLnNlcmlhbElkKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZC5kZWxldGUodl9wSW5mby5zZXJpYWxJZCk7XG4gICAgICAgICAgICB2YXIgYXBwZW5kRXJyb3JNZXNzYWdlID0gXCJMb2FkIFVJIGZvcm0gZmFpbHVyZSwgYXNzZXQgbmFtZSAnXCIgKyB1aUZvcm1Bc3NldE5hbWUgKyBcIicsIHN0YXR1cyAnXCIgKyBzdGF0dXMudG9TdHJpbmcoKSArIFwiJywgZXJyb3IgbWVzc2FnZSAnXCIgKyBlcnJvck1lc3NhZ2UgKyBcIicuXCI7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BPcGVuVUlGb3JtRmFpbHVyZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnRBcmdzXzEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHNlcmlhbElkOiB2X3BJbmZvLnNlcmlhbElkLFxuICAgICAgICAgICAgICAgICAgICB1aUZvcm1Bc3NldE5hbWU6IHVpRm9ybUFzc2V0TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdWlHcm91cE5hbWU6IHZfcEluZm8udWlHcm91cC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGFwcGVuZEVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgcGF1c2VDb3ZlcmVkVUlGb3JtOiB2X3BJbmZvLnBhdXNlQ292ZXJlZFVJRm9ybSxcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGE6IHZfcEluZm8udXNlckRhdGFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMubV9wT3BlblVJRm9ybUZhaWx1cmVEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oZXZlbnRBcmdzXzEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihhcHBlbmRFcnJvck1lc3NhZ2UpO1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmxvYWRVSUZvcm1VcGRhdGVDYWxsYmFjayA9IGZ1bmN0aW9uICh1aUZvcm1Bc3NldE5hbWUsIHByb2dyZXNzLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcEluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiT3BlbiBVSSBmb3JtIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BPcGVuVUlGb3JtVXBkYXRlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHZhciBldmVudEFyZ3NfMiA9IHtcbiAgICAgICAgICAgICAgICAgICAgc2VyaWFsSWQ6IHZfcEluZm8uc2VyaWFsSWQsXG4gICAgICAgICAgICAgICAgICAgIHVpRm9ybUFzc2V0TmFtZTogdWlGb3JtQXNzZXROYW1lLFxuICAgICAgICAgICAgICAgICAgICB1aUdyb3VwTmFtZTogdl9wSW5mby51aUdyb3VwLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzOiBwcm9ncmVzcyxcbiAgICAgICAgICAgICAgICAgICAgcGF1c2VDb3ZlcmVkVUlGb3JtOiB2X3BJbmZvLnBhdXNlQ292ZXJlZFVJRm9ybSxcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGE6IHZfcEluZm8udXNlckRhdGFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMubV9wT3BlblVJRm9ybVVwZGF0ZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihldmVudEFyZ3NfMik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUubG9hZFVJRm9ybURlcGVuZGVuY3lBc3NldENhbGxiYWNrID0gZnVuY3Rpb24gKHVpRm9ybUFzc2V0TmFtZSwgZGVwZW5kZW5jeUFzc2V0TmFtZSwgbG9hZGVkQ291bnQsIHRvdGFsQ291bnQsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wSW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJPcGVuIFVJIGZvcm0gaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcE9wZW5VSUZvcm1EZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50QXJnc18zID0ge1xuICAgICAgICAgICAgICAgICAgICBzZXJpYWxJZDogdl9wSW5mby5zZXJpYWxJZCxcbiAgICAgICAgICAgICAgICAgICAgdWlGb3JtQXNzZXROYW1lOiB1aUZvcm1Bc3NldE5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHVpR3JvdXBOYW1lOiB2X3BJbmZvLnVpR3JvdXAubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgZGVwZW5kZW5jeUFzc2V0TmFtZTogZGVwZW5kZW5jeUFzc2V0TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVkQ291bnQ6IGxvYWRlZENvdW50LFxuICAgICAgICAgICAgICAgICAgICB0b3RhbENvdW50OiB0b3RhbENvdW50LFxuICAgICAgICAgICAgICAgICAgICBwYXVzZUNvdmVyZWRVSUZvcm06IHZfcEluZm8ucGF1c2VDb3ZlcmVkVUlGb3JtLFxuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YTogdl9wSW5mby51c2VyRGF0YVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BPcGVuVUlGb3JtRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGV2ZW50QXJnc18zKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFVJTWFuYWdlcjtcbiAgICB9KEJhc2VfMS5GcmFtZXdvcmtNb2R1bGUpKTsgLy8gY2xhc3MgVUlNYW5hZ2VyXG4gICAgZXhwb3J0cy5VSU1hbmFnZXIgPSBVSU1hbmFnZXI7XG4gICAgdmFyIFVJRm9ybUluc3RhbmNlT2JqZWN0ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBVSUZvcm1JbnN0YW5jZU9iamVjdCgpIHtcbiAgICAgICAgICAgIHRoaXMuaXNWYWxpZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnNwYXduID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgVUlGb3JtSW5zdGFuY2VPYmplY3QuY3JlYXRlID0gZnVuY3Rpb24gKG5hbWUsIHVpRm9ybUFzc2V0LCB1aUZvcm1JbnN0YW5jZSwgdWlGb3JtSGVscGVyKSB7XG4gICAgICAgICAgICBpZiAoIXVpRm9ybUFzc2V0KVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBhc3NldCBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgaWYgKCF1aUZvcm1IZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGhlbHBlciBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdmFyIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0ID0gbmV3IFVJRm9ybUluc3RhbmNlT2JqZWN0KCk7XG4gICAgICAgICAgICB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC5uYW1lID0gbmFtZTtcbiAgICAgICAgICAgIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LnRhcmdldCA9IHVpRm9ybUluc3RhbmNlO1xuICAgICAgICAgICAgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QubV9wVUlGb3JtQXNzZXQgPSB1aUZvcm1Bc3NldDtcbiAgICAgICAgICAgIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0Lm1fcFVJRm9ybUhlbHBlciA9IHVpRm9ybUhlbHBlcjtcbiAgICAgICAgICAgIHJldHVybiB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdDtcbiAgICAgICAgfTtcbiAgICAgICAgVUlGb3JtSW5zdGFuY2VPYmplY3QucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1Bc3NldCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUhlbHBlciA9IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIFVJRm9ybUluc3RhbmNlT2JqZWN0LnByb3RvdHlwZS5yZWxlYXNlID0gZnVuY3Rpb24gKHNodXRkb3duKSB7XG4gICAgICAgICAgICBzaHV0ZG93biA9IHNodXRkb3duIHx8IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5pc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BVSUZvcm1IZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1IZWxwZXIucmVsZWFzZVVJRm9ybSh0aGlzLm1fcFVJRm9ybUFzc2V0LCB0aGlzLnRhcmdldCk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBVSUZvcm1JbnN0YW5jZU9iamVjdDtcbiAgICB9KCkpOyAvLyBjbGFzcyBVSUZvcm1JbnN0YW5jZU9iamVjdFxuICAgIHZhciBVSUdyb3VwID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBVSUdyb3VwKG5hbWUsIGRlcHRoLCBoZWxwZXIpIHtcbiAgICAgICAgICAgIHRoaXMubV9pRGVwdGggPSAwO1xuICAgICAgICAgICAgdGhpcy5tX2JQYXVzZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1JbmZvcyA9IFtdO1xuICAgICAgICAgICAgaWYgKCFuYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZ3JvdXAgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgaWYgKCFoZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBncm91cCBoZWxwZXIgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHRoaXMubV9zTmFtZSA9IG5hbWU7XG4gICAgICAgICAgICB0aGlzLm1fYlBhdXNlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmhlbHBlciA9IGhlbHBlcjtcbiAgICAgICAgICAgIHRoaXMuZGVwdGggPSBkZXB0aDtcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlHcm91cC5wcm90b3R5cGUsIFwibmFtZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9zTmFtZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSUdyb3VwLnByb3RvdHlwZSwgXCJkZXB0aFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9pRGVwdGg7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSB0aGlzLm1faURlcHRoKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgdGhpcy5tX2lEZXB0aCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMuaGVscGVyLnNldERlcHRoKHRoaXMubV9pRGVwdGgpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSUdyb3VwLnByb3RvdHlwZSwgXCJwYXVzZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9iUGF1c2U7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fYlBhdXNlID09IHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgdGhpcy5tX2JQYXVzZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSUdyb3VwLnByb3RvdHlwZSwgXCJ1aUZvcm1Db3VudFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BVSUZvcm1JbmZvcy5sZW5ndGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJR3JvdXAucHJvdG90eXBlLCBcImN1cnJlbnRVSUZvcm1cIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wVUlGb3JtSW5mb3MubGVuZ3RoID4gMCA/IHRoaXMubV9wVUlGb3JtSW5mb3NbMF0udWlGb3JtIDogbnVsbDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBVSUdyb3VwLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIHZhciBlXzEwLCBfYTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFVJRm9ybUluZm9zKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5mbyA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5mby5wYXVzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGluZm8udWlGb3JtLm9uVXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xMF8xKSB7IGVfMTAgPSB7IGVycm9yOiBlXzEwXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMTApIHRocm93IGVfMTAuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgVUlHcm91cC5wcm90b3R5cGUuYWRkVUlGb3JtID0gZnVuY3Rpb24gKHVpRm9ybSkge1xuICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1JbmZvcy51bnNoaWZ0KHtcbiAgICAgICAgICAgICAgICB1aUZvcm06IHVpRm9ybSxcbiAgICAgICAgICAgICAgICBjb3ZlcmVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIHBhdXNlZDogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIFVJR3JvdXAucHJvdG90eXBlLnJlbW92ZVVJRm9ybSA9IGZ1bmN0aW9uICh1aUZvcm0pIHtcbiAgICAgICAgICAgIHZhciB2X3VJZHggPSAtMTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tX3BVSUZvcm1JbmZvcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fcFVJRm9ybUluZm9zW2ldLnVpRm9ybSA9PSB1aUZvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgdl91SWR4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHZfdUlkeCA9PSAtMSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGZpbmQgVUkgZm9ybSBpbmZvIGZvciBzZXJpYWwgaWQgJ1wiICsgdWlGb3JtLnNlcmlhbElkICsgXCInLCBVSSBmb3JtIGFzc2V0IG5hbWUgaXMgJ1wiICsgdWlGb3JtLnVpRm9ybUFzc2V0TmFtZSArIFwiJy5cIik7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHRoaXMubV9wVUlGb3JtSW5mb3Nbdl91SWR4XTtcbiAgICAgICAgICAgIGlmICghdl9wSW5mby5jb3ZlcmVkKSB7XG4gICAgICAgICAgICAgICAgdl9wSW5mby5jb3ZlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB1aUZvcm0ub25Db3ZlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF2X3BJbmZvLnBhdXNlZCkge1xuICAgICAgICAgICAgICAgIHZfcEluZm8ucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB1aUZvcm0ub25QYXVzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1JbmZvcy5zcGxpY2Uodl91SWR4LCAxKTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlHcm91cC5wcm90b3R5cGUuaGFzVUlGb3JtID0gZnVuY3Rpb24gKGlkT3JBc3NldE5hbWUpIHtcbiAgICAgICAgICAgIHZhciBlXzExLCBfYTtcbiAgICAgICAgICAgIHZhciBzdWJQcm9wTmFtZSA9ICdzZXJpYWxJZCc7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGlkT3JBc3NldE5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpZE9yQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGZvcm0gYXNzZXQgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgICAgIHN1YlByb3BOYW1lID0gJ3VpRm9ybUFzc2V0TmFtZSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BVSUZvcm1JbmZvcyksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZm8gPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZm8udWlGb3JtW3N1YlByb3BOYW1lXSA9PT0gaWRPckFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzExXzEpIHsgZV8xMSA9IHsgZXJyb3I6IGVfMTFfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xMSkgdGhyb3cgZV8xMS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBVSUdyb3VwLnByb3RvdHlwZS5nZXRVSUZvcm0gPSBmdW5jdGlvbiAoaWRPckFzc2V0TmFtZSkge1xuICAgICAgICAgICAgdmFyIGVfMTIsIF9hO1xuICAgICAgICAgICAgdmFyIHN1YlByb3BOYW1lID0gJ3NlcmlhbElkJztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaWRPckFzc2V0TmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlkT3JBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBhc3NldCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICAgICAgc3ViUHJvcE5hbWUgPSAndWlGb3JtQXNzZXROYW1lJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFVJRm9ybUluZm9zKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5mbyA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5mby51aUZvcm1bc3ViUHJvcE5hbWVdID09PSBpZE9yQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGluZm8udWlGb3JtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzEyXzEpIHsgZV8xMiA9IHsgZXJyb3I6IGVfMTJfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xMikgdGhyb3cgZV8xMi5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIFVJR3JvdXAucHJvdG90eXBlLmdldFVJRm9ybXMgPSBmdW5jdGlvbiAoYXNzZXROYW1lKSB7XG4gICAgICAgICAgICB2YXIgZV8xMywgX2E7XG4gICAgICAgICAgICBpZiAoIWFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGZvcm0gYXNzZXQgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdmFyIHZfcFJldCA9IFtdO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wVUlGb3JtSW5mb3MudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUudWlGb3JtLnVpRm9ybUFzc2V0TmFtZSA9PT0gYXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgdl9wUmV0LnB1c2godmFsdWUudWlGb3JtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xM18xKSB7IGVfMTMgPSB7IGVycm9yOiBlXzEzXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMTMpIHRocm93IGVfMTMuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2X3BSZXQ7XG4gICAgICAgIH07XG4gICAgICAgIFVJR3JvdXAucHJvdG90eXBlLmdldEFsbFVJRm9ybXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BVSUZvcm1JbmZvcy5tYXAoZnVuY3Rpb24gKGluZm8pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5mby51aUZvcm07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlHcm91cC5wcm90b3R5cGUucmVmb2N1c1VJRm9ybSA9IGZ1bmN0aW9uICh1aUZvcm0sIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl91SWR4ID0gLTE7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubV9wVUlGb3JtSW5mb3MubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tX3BVSUZvcm1JbmZvc1tpXS51aUZvcm0gPT0gdWlGb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgIHZfdUlkeCA9IGk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh2X3VJZHggPT0gLTEpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuIG5vdCBmaW5kIFVJIGZvcm0gaW5mbyBmb3Igc2VyaWFsIGlkICdcIiArIHVpRm9ybS5zZXJpYWxJZCArIFwiJywgVUkgZm9ybSBhc3NldCBuYW1lIGlzICdcIiArIHVpRm9ybS51aUZvcm1Bc3NldE5hbWUgKyBcIicuXCIpO1xuICAgICAgICAgICAgaWYgKHZfdUlkeCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1JbmZvcy5zcGxpY2Uodl91SWR4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdGhpcy5tX3BVSUZvcm1JbmZvc1t2X3VJZHhdO1xuICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1JbmZvcy51bnNoaWZ0KHZfcEluZm8pO1xuICAgICAgICB9O1xuICAgICAgICBVSUdyb3VwLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfMTQsIF9hO1xuICAgICAgICAgICAgdmFyIHZfYlBhdXNlID0gdGhpcy5wYXVzZTtcbiAgICAgICAgICAgIHZhciB2X2JDb3ZlciA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIHZfaURlcHRoID0gdGhpcy51aUZvcm1Db3VudDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFVJRm9ybUluZm9zKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5mbyA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAobnVsbCA9PSBpbmZvKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBpZiAodl9iUGF1c2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaW5mby5jb3ZlcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5jb3ZlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLnVpRm9ybS5vbkNvdmVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWluZm8ucGF1c2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5wYXVzZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8udWlGb3JtLm9uUGF1c2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmZvLnBhdXNlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8ucGF1c2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby51aUZvcm0ub25SZXN1bWUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmZvLnVpRm9ybS5wYXVzZUNvdmVyZWRVSUZvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2X2JQYXVzZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodl9iQ292ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWluZm8uY292ZXJlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLmNvdmVyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLnVpRm9ybS5vbkNvdmVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZm8uY292ZXJlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLmNvdmVyZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby51aUZvcm0ub25SZXZlYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdl9iQ292ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMTRfMSkgeyBlXzE0ID0geyBlcnJvcjogZV8xNF8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzE0KSB0aHJvdyBlXzE0LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBVSUdyb3VwO1xuICAgIH0oKSk7IC8vIGNsYXNzIFVJR3JvdXBcbiAgICBleHBvcnRzLlVJR3JvdXAgPSBVSUdyb3VwO1xufSk7XG4iLCIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgdmFyIGdsb2JhbCA9IGdsb2JhbCB8fCB7fTtcbiAgICB2YXIgdl9wR2xvYmFsID0gJ3VuZGVmaW5lZCcgPT0gdHlwZW9mIHdpbmRvdyA/IGdsb2JhbCA6IHdpbmRvdztcbiAgICB2YXIgYXRzZnJhbWV3b3JrID0gdl9wR2xvYmFsLmF0c2ZyYW1ld29yayB8fCB7fTtcbiAgICBmdW5jdGlvbiBleHBvc2UobSkge1xuICAgICAgICBmb3IgKHZhciBrIGluIG0pIHtcbiAgICAgICAgICAgIGF0c2ZyYW1ld29ya1trXSA9IG1ba107XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXhwb3NlKHJlcXVpcmUoJy4vQmFzZScpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vQ29uZmlnXCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vRGF0YU5vZGVcIikpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9EYXRhVGFibGVcIikpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9Gc21cIikpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9SZXNvdXJjZVwiKSk7XG4gICAgZXhwb3NlKHJlcXVpcmUoXCIuL0V2ZW50XCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vUHJvY2VkdXJlXCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vVUlcIikpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9Tb3VuZFwiKSk7XG4gICAgZXhwb3NlKHJlcXVpcmUoXCIuL1NjZW5lXCIpKTtcbiAgICB2X3BHbG9iYWwuYXRzZnJhbWV3b3JrID0gYXRzZnJhbWV3b3JrO1xuICAgIGV4cG9ydHMuZGVmYXVsdCA9IGF0c2ZyYW1ld29yaztcbn0pO1xuIl19
