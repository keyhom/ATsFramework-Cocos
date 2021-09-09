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
    var PathSplitSeparator = ['.', '/', '\\\\'];
    var DataNode = /** @class */ (function () {
        function DataNode() {
            this.m_sName = null;
            this.m_pData = null;
            this.m_pParent = null;
            this.m_pChilds = null;
        }
        DataNode.create = function (name, parent) {
            if (!this.isValidName(name))
                throw new Error('Name of data node is invalid.');
            var v_pNode = new DataNode();
            v_pNode.m_sName = name;
            v_pNode.m_pParent = parent;
            return v_pNode;
        };
        DataNode.isValidName = function (name) {
            var e_1, _a;
            if (!name)
                return false;
            try {
                for (var PathSplitSeparator_1 = __values(PathSplitSeparator), PathSplitSeparator_1_1 = PathSplitSeparator_1.next(); !PathSplitSeparator_1_1.done; PathSplitSeparator_1_1 = PathSplitSeparator_1.next()) {
                    var pathSplitSeparator = PathSplitSeparator_1_1.value;
                    if (name.indexOf(pathSplitSeparator) != -1)
                        return false;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (PathSplitSeparator_1_1 && !PathSplitSeparator_1_1.done && (_a = PathSplitSeparator_1.return)) _a.call(PathSplitSeparator_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return true;
        };
        Object.defineProperty(DataNode.prototype, "name", {
            get: function () {
                return this.m_sName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataNode.prototype, "fullName", {
            get: function () {
                return null == this.m_pParent ? this.name : "" + this.m_pParent.fullName + PathSplitSeparator[0] + this.name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataNode.prototype, "parent", {
            get: function () {
                return this.m_pParent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataNode.prototype, "childCount", {
            get: function () {
                return this.m_pChilds ? this.m_pChilds.length : 0;
            },
            enumerable: true,
            configurable: true
        });
        DataNode.prototype.getData = function () {
            return this.m_pData;
        };
        DataNode.prototype.setData = function (data) {
            this.m_pData = data;
        };
        DataNode.prototype.getChild = function (nameOrIndex) {
            var e_2, _a;
            if ('string' == typeof nameOrIndex) {
                var name_1 = nameOrIndex;
                if (!DataNode.isValidName(name_1)) {
                    throw new Error('Name is invalid.');
                }
                if (null == this.m_pChilds) {
                    return null;
                }
                try {
                    for (var _b = __values(this.m_pChilds), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var child = _c.value;
                        if (!child)
                            continue;
                        if (child.name == name_1) {
                            return child;
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
            }
            else {
                var index = nameOrIndex;
                return index >= this.childCount ? null : (this.m_pChilds ? this.m_pChilds[index] : null);
            }
        };
        DataNode.prototype.getOrAddChild = function (name) {
            var v_pNode = this.getChild(name);
            if (v_pNode)
                return v_pNode;
            v_pNode = DataNode.create(name, this);
            if (!this.m_pChilds) {
                this.m_pChilds = [];
            }
            this.m_pChilds.push(v_pNode);
            return v_pNode;
        };
        DataNode.prototype.getAllChild = function (results) {
            var e_3, _a;
            results = results || [];
            results.splice(0, results.length);
            if (this.m_pChilds) {
                try {
                    for (var _b = __values(this.m_pChilds), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var child = _c.value;
                        results.push(child);
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
            return results;
        };
        DataNode.prototype.removeChild = function (nameOrIndex) {
            var v_pNode = this.getChild(nameOrIndex);
            if (!v_pNode)
                return;
            if (!this.m_pChilds)
                return;
            var v_idx = this.m_pChilds.indexOf(v_pNode);
            if (-1 == v_idx)
                return;
            this.m_pChilds.splice(v_idx, 1);
            v_pNode.destroy();
        };
        DataNode.prototype.destroy = function () {
            this.m_sName = null;
            this.m_pParent = null;
            this.clear();
        };
        DataNode.prototype.clear = function () {
            var e_4, _a;
            this.m_pData = null;
            if (this.m_pChilds) {
                try {
                    for (var _b = __values(this.m_pChilds), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var child = _c.value;
                        child.destroy();
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                this.m_pChilds.splice(0, this.m_pChilds.length);
            }
        };
        DataNode.prototype.toDataString = function () {
            if (undefined == this.m_pData || null == this.m_pData)
                return '<Null>';
            return "[" + typeof this.m_pData + "] " + this.m_pData;
        };
        DataNode.prototype.toString = function () {
            return this.fullName + ": " + this.toDataString();
        };
        DataNode.s_pEmptyArray = [];
        return DataNode;
    }()); // class DataNode
    exports.DataNode = DataNode;
    var RootName = '<Root>';
    var DataNodeManager = /** @class */ (function (_super) {
        __extends(DataNodeManager, _super);
        function DataNodeManager() {
            var _this = _super.call(this) || this;
            _this.m_pRoot = DataNode.create(RootName, null);
            return _this;
        }
        DataNodeManager.getSplitPath = function (path) {
            if (!path) {
                return [];
            }
            return path.split(new RegExp("[" + PathSplitSeparator.join('') + "]"));
        };
        Object.defineProperty(DataNodeManager.prototype, "root", {
            get: function () {
                return this.m_pRoot;
            },
            enumerable: true,
            configurable: true
        });
        DataNodeManager.prototype.update = function (elapsed, realElapsed) {
            // NOOP.
        };
        DataNodeManager.prototype.shutdown = function () {
            if (this.m_pRoot)
                this.m_pRoot.destroy();
            this.m_pRoot = null;
        };
        DataNodeManager.prototype.getData = function (path, node) {
            var v_pCurrent = this.getNode(path, node);
            if (null == v_pCurrent) {
                throw new Error("Data node is not exist, path '" + path + "', node '" + (node ? node.fullName : "") + "'");
            }
            return v_pCurrent.getData();
        };
        DataNodeManager.prototype.setData = function (path, data, node) {
            var v_pCurrent = this.getOrAddNode(path, node);
            v_pCurrent.setData(data);
        };
        DataNodeManager.prototype.getNode = function (path, node) {
            var e_5, _a;
            var v_pCurrent = node ? node : this.m_pRoot;
            if (null != v_pCurrent) {
                var v_pSplitPath = DataNodeManager.getSplitPath(path);
                try {
                    for (var v_pSplitPath_1 = __values(v_pSplitPath), v_pSplitPath_1_1 = v_pSplitPath_1.next(); !v_pSplitPath_1_1.done; v_pSplitPath_1_1 = v_pSplitPath_1.next()) {
                        var i = v_pSplitPath_1_1.value;
                        v_pCurrent = v_pCurrent.getChild(i);
                        if (null == v_pCurrent)
                            return null;
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (v_pSplitPath_1_1 && !v_pSplitPath_1_1.done && (_a = v_pSplitPath_1.return)) _a.call(v_pSplitPath_1);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
            }
            return v_pCurrent;
        };
        DataNodeManager.prototype.getOrAddNode = function (path, node) {
            var e_6, _a;
            var v_pCurrent = node ? node : this.m_pRoot;
            var v_pSplitPath = DataNodeManager.getSplitPath(path);
            try {
                for (var v_pSplitPath_2 = __values(v_pSplitPath), v_pSplitPath_2_1 = v_pSplitPath_2.next(); !v_pSplitPath_2_1.done; v_pSplitPath_2_1 = v_pSplitPath_2.next()) {
                    var i = v_pSplitPath_2_1.value;
                    v_pCurrent = v_pCurrent.getOrAddChild(i);
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (v_pSplitPath_2_1 && !v_pSplitPath_2_1.done && (_a = v_pSplitPath_2.return)) _a.call(v_pSplitPath_2);
                }
                finally { if (e_6) throw e_6.error; }
            }
            return v_pCurrent;
        };
        DataNodeManager.prototype.removeNode = function (path, node) {
            var e_7, _a;
            var v_pCurrent = node ? node : this.m_pRoot;
            if (!v_pCurrent)
                return;
            var v_pParent = v_pCurrent.parent;
            var v_pSplitPath = DataNodeManager.getSplitPath(path);
            try {
                for (var v_pSplitPath_3 = __values(v_pSplitPath), v_pSplitPath_3_1 = v_pSplitPath_3.next(); !v_pSplitPath_3_1.done; v_pSplitPath_3_1 = v_pSplitPath_3.next()) {
                    var i = v_pSplitPath_3_1.value;
                    v_pParent = v_pCurrent;
                    if (v_pCurrent) {
                        v_pCurrent = v_pCurrent.getChild(i);
                    }
                    if (!v_pCurrent)
                        return;
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (v_pSplitPath_3_1 && !v_pSplitPath_3_1.done && (_a = v_pSplitPath_3.return)) _a.call(v_pSplitPath_3);
                }
                finally { if (e_7) throw e_7.error; }
            }
            if (v_pParent)
                v_pParent.removeChild(v_pCurrent.name);
        };
        DataNodeManager.prototype.clear = function () {
            if (this.m_pRoot) {
                this.m_pRoot.clear();
            }
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

},{"./Base":1,"./ObjectPool":9}],6:[function(require,module,exports){
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
    var NetworkErrorCode;
    (function (NetworkErrorCode) {
        NetworkErrorCode[NetworkErrorCode["Unknown"] = 0] = "Unknown";
        NetworkErrorCode[NetworkErrorCode["AddressFamilyError"] = 1] = "AddressFamilyError";
        NetworkErrorCode[NetworkErrorCode["SocketError"] = 2] = "SocketError";
        NetworkErrorCode[NetworkErrorCode["SerializeError"] = 3] = "SerializeError";
        NetworkErrorCode[NetworkErrorCode["DeserializePacketHeadError"] = 4] = "DeserializePacketHeadError";
        NetworkErrorCode[NetworkErrorCode["DeserializePacketError"] = 5] = "DeserializePacketError";
        NetworkErrorCode[NetworkErrorCode["ConnectError"] = 6] = "ConnectError";
        NetworkErrorCode[NetworkErrorCode["SendError"] = 7] = "SendError";
        NetworkErrorCode[NetworkErrorCode["ReceiveError"] = 8] = "ReceiveError";
    })(NetworkErrorCode = exports.NetworkErrorCode || (exports.NetworkErrorCode = {})); // enum NetworkErrorCode
    exports.DefaultHeartBeatInterval = 30.0;
    var NetworkChannel = /** @class */ (function () {
        function NetworkChannel(name, networkChannelHelper) {
            this.m_pUserData = null;
            this.m_sName = name || '';
            this.m_pNetworkChannelHelper = networkChannelHelper;
            this.m_fHeartBeatInterval = exports.DefaultHeartBeatInterval;
            this.networkChannelOpened = new Base_1.EventHandler();
            this.networkChannelClosed = new Base_1.EventHandler();
            this.networkChannelMissHeartBeat = new Base_1.EventHandler();
            this.networkChannelError = new Base_1.EventHandler();
            this.networkChannelCustomError = new Base_1.EventHandler();
            this.m_pNetworkChannelHelper.initialize(this);
        }
        Object.defineProperty(NetworkChannel.prototype, "id", {
            get: function () {
                return this.m_pNetworkChannelHelper.id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NetworkChannel.prototype, "name", {
            get: function () {
                return this.m_sName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NetworkChannel.prototype, "userData", {
            get: function () {
                return this.m_pUserData;
            },
            enumerable: true,
            configurable: true
        });
        NetworkChannel.prototype.connect = function (host, port, userData) {
            if (this.m_pNetworkChannelHelper.isOpen)
                this.close();
            this.m_pUserData = userData || null;
            this.m_pNetworkChannelHelper.connect(host, port);
        };
        NetworkChannel.prototype.fireChannelOpen = function () {
            var _this = this;
            if (this.networkChannelOpened.isValid) {
                this.networkChannelOpened.iter(function (fn) {
                    fn(_this, _this.m_pUserData);
                });
            }
        };
        NetworkChannel.prototype.fireChannelMessageReceive = function (data) {
            // TODO:
        };
        NetworkChannel.prototype.fireErrorCaught = function (errorOrMessage) {
            var _this = this;
            var v_pError;
            if ('string' == typeof errorOrMessage) {
                v_pError = new Error(errorOrMessage);
            }
            else {
                v_pError = errorOrMessage;
            }
            if (this.networkChannelError.isValid) {
                this.networkChannelError.iter(function (fn) {
                    fn(_this, NetworkErrorCode.SocketError, v_pError.message);
                });
            }
        };
        NetworkChannel.prototype.fireChannelClose = function () {
            var _this = this;
            if (this.networkChannelClosed.isValid) {
                this.networkChannelClosed.iter(function (fn) {
                    fn(_this);
                });
            }
        };
        NetworkChannel.prototype.close = function () {
            this.m_pNetworkChannelHelper.close();
        };
        NetworkChannel.prototype.update = function (elapsed, realElapsed) {
            // TODO: update network channel.
        };
        NetworkChannel.prototype.shutdown = function () {
            this.m_pNetworkChannelHelper.shutdown();
        };
        return NetworkChannel;
    }()); // class NetworkChannel
    exports.NetworkChannel = NetworkChannel;
    var NetworkManager = /** @class */ (function (_super) {
        __extends(NetworkManager, _super);
        function NetworkManager() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.m_pNetworkChannels = new Map();
            _this.m_pNetworkConnectedDelegate = new Base_1.EventHandler();
            _this.m_pNetworkClosedDelegate = new Base_1.EventHandler();
            _this.m_pNetworkMissHeartBeatDelegate = new Base_1.EventHandler();
            _this.m_pNetworkErrorDelegate = new Base_1.EventHandler();
            _this.m_pNetworkCustomErrorDelegate = new Base_1.EventHandler();
            return _this;
        }
        Object.defineProperty(NetworkManager.prototype, "networkChannelCount", {
            get: function () {
                return this.m_pNetworkChannels.size;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NetworkManager.prototype, "networkConnected", {
            get: function () {
                return this.m_pNetworkConnectedDelegate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NetworkManager.prototype, "networkClosed", {
            get: function () {
                return this.m_pNetworkClosedDelegate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NetworkManager.prototype, "networkMissHeartBeat", {
            get: function () {
                return this.m_pNetworkMissHeartBeatDelegate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NetworkManager.prototype, "networkError", {
            get: function () {
                return this.m_pNetworkErrorDelegate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NetworkManager.prototype, "networkCustomError", {
            get: function () {
                return this.m_pNetworkCustomErrorDelegate;
            },
            enumerable: true,
            configurable: true
        });
        NetworkManager.prototype.hasNetworkChannel = function (name) {
            return this.m_pNetworkChannels.has(name);
        };
        NetworkManager.prototype.getNetworkChannel = function (name) {
            return this.m_pNetworkChannels.get(name) || null;
        };
        NetworkManager.prototype.getAllNetworkChannels = function (results) {
            var e_1, _a;
            results = results || [];
            results.splice(0, results.length);
            try {
                for (var _b = __values(this.m_pNetworkChannels.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var networkChannel = _c.value;
                    results.push(networkChannel);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return results;
        };
        NetworkManager.prototype.createNetworkChannel = function (name, networkChannelHelper) {
            if (!networkChannelHelper) {
                throw new Error('Network channel helper is invalid.');
            }
            if (networkChannelHelper.packetHeaderLength < 0) {
                throw new Error('Packet header length is invalid.');
            }
            if (this.hasNetworkChannel(name))
                throw new Error("Already exist network channel '" + (name ? name : '') + "'");
            var networkChannel = new NetworkChannel(name, networkChannelHelper);
            networkChannel.networkChannelOpened.add(this.onNetworkChannelConnected, this);
            networkChannel.networkChannelClosed.add(this.onNetworkChannelClosed, this);
            networkChannel.networkChannelMissHeartBeat.add(this.onNetworkChannelMissHeartBeat, this);
            networkChannel.networkChannelError.add(this.onNetworkChannelError, this);
            networkChannel.networkChannelCustomError.add(this.onNetworkChannelCustomError, this);
            return networkChannel;
        };
        NetworkManager.prototype.destroyNetworkChannel = function (name) {
            var v_pChannel = this.getNetworkChannel(name);
            if (v_pChannel) {
                v_pChannel.networkChannelOpened.remove(this.onNetworkChannelConnected, this);
                v_pChannel.networkChannelClosed.remove(this.onNetworkChannelClosed, this);
                v_pChannel.networkChannelMissHeartBeat.remove(this.onNetworkChannelMissHeartBeat, this);
                v_pChannel.networkChannelError.remove(this.onNetworkChannelError, this);
                v_pChannel.networkChannelCustomError.remove(this.onNetworkChannelCustomError, this);
                v_pChannel.shutdown();
                return this.m_pNetworkChannels.delete(name);
            }
            return false;
        };
        NetworkManager.prototype.onNetworkChannelConnected = function (networkChannel, userData) {
            if (this.m_pNetworkConnectedDelegate.isValid) {
                // lock this.m_pNetworkConnectedDelegate
                this.m_pNetworkConnectedDelegate.iter(function (callback) {
                    callback(networkChannel, userData);
                });
            }
        };
        NetworkManager.prototype.onNetworkChannelClosed = function (networkChannel) {
            if (this.m_pNetworkClosedDelegate.isValid) {
                this.m_pNetworkClosedDelegate.iter(function (callback) {
                    callback(networkChannel);
                });
            }
        };
        NetworkManager.prototype.onNetworkChannelMissHeartBeat = function (networkChannel, missHeartBeatCount) {
            if (this.m_pNetworkMissHeartBeatDelegate.isValid) {
                this.m_pNetworkMissHeartBeatDelegate.iter(function (callback) {
                    callback(networkChannel, missHeartBeatCount);
                });
            }
        };
        NetworkManager.prototype.onNetworkChannelError = function (networkChannel, errorCode, errorMessage) {
            if (this.m_pNetworkErrorDelegate.isValid) {
                this.m_pNetworkErrorDelegate.iter(function (callback) {
                    callback(networkChannel, errorCode, errorMessage);
                });
            }
        };
        NetworkManager.prototype.onNetworkChannelCustomError = function (networkChannel, customErrorData) {
            if (this.m_pNetworkCustomErrorDelegate.isValid) {
                this.m_pNetworkCustomErrorDelegate.iter(function (callback) {
                    callback(networkChannel, customErrorData);
                });
            }
        };
        NetworkManager.prototype.update = function (elapsed, realElapsed) {
            var e_2, _a;
            try {
                for (var _b = __values(this.m_pNetworkChannels.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var networkChannel = _c.value;
                    networkChannel.update(elapsed, realElapsed);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
        };
        NetworkManager.prototype.shutdown = function () {
            var e_3, _a;
            try {
                for (var _b = __values(this.m_pNetworkChannels.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var networkChannel = _c.value;
                    networkChannel.shutdown();
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            this.m_pNetworkChannels.clear();
        };
        return NetworkManager;
    }(Base_1.FrameworkModule)); // class NetworkManager
    exports.NetworkManager = NetworkManager;
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

},{"./Base":1,"./Fsm":7}],11:[function(require,module,exports){
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
            return this.settingHelper.getString(settingName, defaultValue);
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

},{"./Base":1}],15:[function(require,module,exports){
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

},{"./Base":1,"./ObjectPool":9}],16:[function(require,module,exports){
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
    expose(require("./Network"));
    expose(require("./ObjectPool"));
    expose(require("./Procedure"));
    expose(require("./Sound"));
    expose(require("./Scene"));
    expose(require("./Setting"));
    expose(require("./UI"));
    v_pGlobal.atsframework = atsframework;
    exports.default = atsframework;
});

},{"./Base":1,"./Config":2,"./DataNode":3,"./DataTable":4,"./Entity":5,"./Event":6,"./Fsm":7,"./Network":8,"./ObjectPool":9,"./Procedure":10,"./Resource":11,"./Scene":12,"./Setting":13,"./Sound":14,"./UI":15}]},{},[16])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIkJhc2UuanMiLCJDb25maWcuanMiLCJEYXRhTm9kZS5qcyIsIkRhdGFUYWJsZS5qcyIsIkVudGl0eS5qcyIsIkV2ZW50LmpzIiwiRnNtLmpzIiwiTmV0d29yay5qcyIsIk9iamVjdFBvb2wuanMiLCJQcm9jZWR1cmUuanMiLCJSZXNvdXJjZS5qcyIsIlNjZW5lLmpzIiwiU2V0dGluZy5qcyIsIlNvdW5kLmpzIiwiVUkuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqK0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzF6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2MEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzkwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICAvKipcbiAgICAgKiBMb2FkIHR5cGUuXG4gICAgICovXG4gICAgdmFyIExvYWRUeXBlO1xuICAgIChmdW5jdGlvbiAoTG9hZFR5cGUpIHtcbiAgICAgICAgTG9hZFR5cGVbTG9hZFR5cGVbXCJUZXh0XCJdID0gMF0gPSBcIlRleHRcIjtcbiAgICAgICAgTG9hZFR5cGVbTG9hZFR5cGVbXCJCeXRlc1wiXSA9IDFdID0gXCJCeXRlc1wiO1xuICAgICAgICBMb2FkVHlwZVtMb2FkVHlwZVtcIlN0cmVhbVwiXSA9IDJdID0gXCJTdHJlYW1cIjtcbiAgICB9KShMb2FkVHlwZSA9IGV4cG9ydHMuTG9hZFR5cGUgfHwgKGV4cG9ydHMuTG9hZFR5cGUgPSB7fSkpO1xuICAgIDtcbiAgICB2YXIgZ19wTW9kdWxlcyA9IFtdO1xuICAgIC8qKlxuICAgICAqIEFuIGV2ZW50IGhhbmRsZXIgbWFrZSBzaW1pbGFyIHdpdGggZXZlbnQgZGVsZWdhdGUgbW9kZS5cbiAgICAgKi9cbiAgICB2YXIgRXZlbnRIYW5kbGVyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBFdmVudEhhbmRsZXIoKSB7XG4gICAgICAgIH1cbiAgICAgICAgRXZlbnRIYW5kbGVyLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiAoZm4sIHRhcmdldCkge1xuICAgICAgICAgICAgaWYgKG51bGwgIT0gdGhpcy5tX3BIYW5kbGVycykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcEhhbmRsZXJzLnNvbWUoZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2X2JSZXQgPSB2YWx1ZVsxXSA9PSBmbjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZfYlJldCAmJiB1bmRlZmluZWQgIT0gdGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2X2JSZXQgPSB2YWx1ZVswXSA9PSB0YXJnZXQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZfYlJldDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgRXZlbnRIYW5kbGVyLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoZm4sIHRhcmdldCkge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BIYW5kbGVycylcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEhhbmRsZXJzID0gW107XG4gICAgICAgICAgICBpZiAodGhpcy5oYXMoZm4sIHRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEdXBsaWNhdGVkIGFkZCBldmVudCBoYW5kbGVyICdcIiArIGZuICsgXCInXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wSGFuZGxlcnMucHVzaChbdGFyZ2V0LCBmbiwgZmFsc2VdKTtcbiAgICAgICAgfTtcbiAgICAgICAgRXZlbnRIYW5kbGVyLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoZm4sIHRhcmdldCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmlzVmFsaWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1fcEhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZfcFR1cGxlID0gdGhpcy5tX3BIYW5kbGVyc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAodW5kZWZpbmVkID09IHRhcmdldCAmJiB2X3BUdXBsZVsxXSA9PSBmbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcEhhbmRsZXJzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHVuZGVmaW5lZCAhPSB0YXJnZXQgJiYgdl9wVHVwbGVbMF0gPT0gdGFyZ2V0ICYmIHZfcFR1cGxlWzFdID09IGZuKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wSGFuZGxlcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIEV2ZW50SGFuZGxlci5wcm90b3R5cGUuaXRlciA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmlzVmFsaWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5tX3BIYW5kbGVycy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhciBjYWxsYmFja0ZuID0gdmFsdWVbMV07XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlWzBdICE9IHVuZGVmaW5lZCAmJiBjYWxsYmFja0ZuIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbiA9IGNhbGxiYWNrRm4uYmluZCh2YWx1ZVswXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZuKGNhbGxiYWNrRm4pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIEV2ZW50SGFuZGxlci5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmlzVmFsaWQgJiYgdGhpcy5tX3BIYW5kbGVycy5zcGxpY2UoMCwgdGhpcy5tX3BIYW5kbGVycy5sZW5ndGgpO1xuICAgICAgICB9O1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRXZlbnRIYW5kbGVyLnByb3RvdHlwZSwgXCJpc1ZhbGlkXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcEhhbmRsZXJzICYmIHRoaXMubV9wSGFuZGxlcnMubGVuZ3RoID4gMDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRXZlbnRIYW5kbGVyLnByb3RvdHlwZSwgXCJzaXplXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcEhhbmRsZXJzLmxlbmd0aDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gRXZlbnRIYW5kbGVyO1xuICAgIH0oKSk7IC8vIGNsYXNzIEV2ZW50SGFuZGxlclxuICAgIGV4cG9ydHMuRXZlbnRIYW5kbGVyID0gRXZlbnRIYW5kbGVyO1xuICAgIHZhciBGcmFtZXdvcmtNb2R1bGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZ1bmN0aW9uIEZyYW1ld29ya01vZHVsZSgpIHtcbiAgICAgICAgICAgIHRoaXMubV9pUHJpb3JpdHkgPSAwO1xuICAgICAgICB9XG4gICAgICAgIEZyYW1ld29ya01vZHVsZS5nZXRNb2R1bGUgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnX3BNb2R1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG0gPSBnX3BNb2R1bGVzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChtIGluc3RhbmNlb2YgdHlwZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgRnJhbWV3b3JrTW9kdWxlLmdldE9yQWRkTW9kdWxlID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgICAgIHZhciB2X3BNb2R1bGUgPSB0aGlzLmdldE1vZHVsZSh0eXBlKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcE1vZHVsZSkge1xuICAgICAgICAgICAgICAgIHZfcE1vZHVsZSA9IG5ldyB0eXBlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRNb2R1bGUodl9wTW9kdWxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2X3BNb2R1bGU7XG4gICAgICAgIH07XG4gICAgICAgIEZyYW1ld29ya01vZHVsZS5hZGRNb2R1bGUgPSBmdW5jdGlvbiAobW9kdWxlKSB7XG4gICAgICAgICAgICB2YXIgbSA9IHRoaXMuZ2V0TW9kdWxlKG1vZHVsZS5jb25zdHJ1Y3Rvcik7XG4gICAgICAgICAgICBpZiAobSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEdXBsaWNhdGVkIGFkZGluZyBmcmFtZXdvcmsgbW9kdWxlOiBcIiArIHR5cGVvZiBtb2R1bGUpOyAvLyBGSVhNRTogRGV0ZWN0aW5nIGhvdyB0byBnZXQgdGhlIGNsYXNzIG5hbWUuXG4gICAgICAgICAgICBnX3BNb2R1bGVzLnB1c2gobW9kdWxlKTtcbiAgICAgICAgICAgIGdfcE1vZHVsZXMgPSBnX3BNb2R1bGVzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICBpZiAoYS5tX2lQcmlvcml0eSA+IGIubV9pUHJpb3JpdHkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChhLm1faVByaW9yaXR5IDwgYi5tX2lQcmlvcml0eSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgRnJhbWV3b3JrTW9kdWxlLnJlbW92ZU1vZHVsZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdfcE1vZHVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wTW9kdWxlID0gZ19wTW9kdWxlc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAodl9wTW9kdWxlICYmIHZfcE1vZHVsZSBpbnN0YW5jZW9mIHR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZ19wTW9kdWxlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2X3BNb2R1bGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIEZyYW1ld29ya01vZHVsZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ19wTW9kdWxlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIHZhciB2X3BNb2R1bGUgPSBnX3BNb2R1bGVzW2ldO1xuICAgICAgICAgICAgICAgIHZfcE1vZHVsZS51cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBGcmFtZXdvcmtNb2R1bGUuc2h1dGRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gZ19wTW9kdWxlcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICAgICAgICAgIHZhciB2X3BNb2R1bGUgPSBnX3BNb2R1bGVzW2ldO1xuICAgICAgICAgICAgICAgIHZfcE1vZHVsZS5zaHV0ZG93bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRnJhbWV3b3JrTW9kdWxlLnByb3RvdHlwZSwgXCJwcmlvcml0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX2lQcmlvcml0eTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gRnJhbWV3b3JrTW9kdWxlO1xuICAgIH0oKSk7IC8vIGNsYXNzIEZyYW1ld29ya01vZHVsZVxuICAgIGV4cG9ydHMuRnJhbWV3b3JrTW9kdWxlID0gRnJhbWV3b3JrTW9kdWxlO1xuICAgIHZhciBGcmFtZXdvcmtTZWdtZW50ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBGcmFtZXdvcmtTZWdtZW50KHNvdXJjZSwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICghc291cmNlKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU291cmNlIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBpZiAob2Zmc2V0IDwgMClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09mZnNldCBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgaWYgKGxlbmd0aCA8PSAwKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTGVuZ3RoIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB0aGlzLm1fdFNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIHRoaXMubV9pT2Zmc2V0ID0gb2Zmc2V0O1xuICAgICAgICAgICAgdGhpcy5tX2lMZW5ndGggPSBsZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZyYW1ld29ya1NlZ21lbnQucHJvdG90eXBlLCBcInNvdXJjZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3RTb3VyY2U7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZyYW1ld29ya1NlZ21lbnQucHJvdG90eXBlLCBcIm9mZnNldFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX2lPZmZzZXQ7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZyYW1ld29ya1NlZ21lbnQucHJvdG90eXBlLCBcImxlbmd0aFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX2lMZW5ndGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIEZyYW1ld29ya1NlZ21lbnQ7XG4gICAgfSgpKTsgLy8gY2xhc3MgRnJhbWV3b3JrU2VnbWVudDxUPlxuICAgIGV4cG9ydHMuRnJhbWV3b3JrU2VnbWVudCA9IEZyYW1ld29ya1NlZ21lbnQ7XG59KTtcbiIsInZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgICAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIiwgXCIuL0Jhc2VcIl0sIGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIHZhciBCYXNlXzEgPSByZXF1aXJlKFwiLi9CYXNlXCIpO1xuICAgIHZhciBDb25maWdNYW5hZ2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICBfX2V4dGVuZHMoQ29uZmlnTWFuYWdlciwgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gQ29uZmlnTWFuYWdlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XG4gICAgICAgICAgICBfdGhpcy5tX3BDb25maWdEYXRhID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZEFzc2V0Q2FsbGJhY2tzID0ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IF90aGlzLmxvYWRDb25maWdTdWNjZXNzQ2FsbGJhY2suYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgZmFpbHVyZTogX3RoaXMubG9hZENvbmZpZ0ZhaWx1cmVDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICB1cGRhdGU6IF90aGlzLmxvYWRDb25maWdVcGRhdGVDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICBkZXBlbmRlbmN5OiBfdGhpcy5sb2FkQ29uZmlnRGVwZW5kZW5jeUFzc2V0Q2FsbGJhY2suYmluZChfdGhpcylcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBfdGhpcy5tX3BMb2FkQ29uZmlnU3VjY2Vzc0RlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRDb25maWdGYWlsdXJlRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZENvbmZpZ1VwZGF0ZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRDb25maWdEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbmZpZ01hbmFnZXIucHJvdG90eXBlLCBcInJlc291cmNlTWFuYWdlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAobnVsbCA9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSZXNvdXJjZSBtYW5hZ2VyIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlciA9IHZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb25maWdNYW5hZ2VyLnByb3RvdHlwZSwgXCJjb25maWdIZWxwZXJcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wQ29uZmlnSGVscGVyO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG51bGwgPT0gdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbmZpZyBoZWxwZXIgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BDb25maWdIZWxwZXIgPSB2YWx1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ29uZmlnTWFuYWdlci5wcm90b3R5cGUsIFwiY29uZmlnQ291bnRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wQ29uZmlnRGF0YS5zaXplO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb25maWdNYW5hZ2VyLnByb3RvdHlwZSwgXCJsb2FkQ29uZmlnU3VjY2Vzc1wiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BMb2FkQ29uZmlnU3VjY2Vzc0RlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb25maWdNYW5hZ2VyLnByb3RvdHlwZSwgXCJsb2FkQ29uZmlnRmFpbHVyZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BMb2FkQ29uZmlnRmFpbHVyZURlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb25maWdNYW5hZ2VyLnByb3RvdHlwZSwgXCJsb2FkQ29uZmlnVXBkYXRlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcExvYWRDb25maWdVcGRhdGVEZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ29uZmlnTWFuYWdlci5wcm90b3R5cGUsIFwibG9hZENvbmZpZ0RlcGVuZGVuY3lBc3NldFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BMb2FkQ29uZmlnRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5wcm90b3R5cGUubG9hZENvbmZpZyA9IGZ1bmN0aW9uIChjb25maWdBc3NldE5hbWUsIGxvYWRUeXBlLCBhbnlBcmcxLCBhbnlBcmcyKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLm1fcFJlc291cmNlTWFuYWdlcikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IHNldCByZXNvdXJjZSBtYW5hZ2VyIGZpcnN0LlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMubV9wQ29uZmlnSGVscGVyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IGNvbmZpZyBoZWxwZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHByaW9yaXR5ID0gMDtcbiAgICAgICAgICAgIHZhciB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmICh1bmRlZmluZWQgIT09IGFueUFyZzEpIHtcbiAgICAgICAgICAgICAgICBpZiAoJ251bWJlcicgPT09IHR5cGVvZiBhbnlBcmcxKVxuICAgICAgICAgICAgICAgICAgICBwcmlvcml0eSA9IGFueUFyZzE7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YSA9IGFueUFyZzE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodW5kZWZpbmVkICE9PSBhbnlBcmcyICYmIG51bGwgPT0gdXNlckRhdGEpIHtcbiAgICAgICAgICAgICAgICB1c2VyRGF0YSA9IGFueUFyZzI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlci5sb2FkQXNzZXQoY29uZmlnQXNzZXROYW1lLCBwcmlvcml0eSwgdGhpcy5tX3BMb2FkQXNzZXRDYWxsYmFja3MsIHsgbG9hZFR5cGU6IGxvYWRUeXBlLCB1c2VyRGF0YTogdXNlckRhdGEgfSk7XG4gICAgICAgIH07XG4gICAgICAgIC8vIE5PVEU6IEFueSBqYXZhc2NyaXB0L3R5cGVzY3JpcHQgc3RyZWFtIGltcGxlbWVudGF0aW9uP1xuICAgICAgICBDb25maWdNYW5hZ2VyLnByb3RvdHlwZS5wYXJzZUNvbmZpZyA9IGZ1bmN0aW9uICh0ZXh0T3JCdWZmZXIsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoIXRleHRPckJ1ZmZlcikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgY29uZmlnIGRhdGEgZGV0ZWN0ZWQhXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BDb25maWdIZWxwZXIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgY29uZmlnIGhlbHBlciBmaXJzdC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1c2VyRGF0YSA9IHVzZXJEYXRhIHx8IG51bGw7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcENvbmZpZ0hlbHBlci5wYXJzZUNvbmZpZyh0ZXh0T3JCdWZmZXIsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5wcm90b3R5cGUuaGFzQ29uZmlnID0gZnVuY3Rpb24gKGNvbmZpZ05hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldENvbmZpZyhjb25maWdOYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5wcm90b3R5cGUuYWRkQ29uZmlnID0gZnVuY3Rpb24gKGNvbmZpZ05hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5oYXNDb25maWcoY29uZmlnTmFtZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcENvbmZpZ0RhdGEuc2V0KGNvbmZpZ05hbWUsIHZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuICAgICAgICBDb25maWdNYW5hZ2VyLnByb3RvdHlwZS5yZW1vdmVDb25maWcgPSBmdW5jdGlvbiAoY29uZmlnTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wQ29uZmlnRGF0YS5kZWxldGUoY29uZmlnTmFtZSk7XG4gICAgICAgIH07XG4gICAgICAgIENvbmZpZ01hbmFnZXIucHJvdG90eXBlLnJlbW92ZUFsbENvbmZpZ3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLm1fcENvbmZpZ0RhdGEuY2xlYXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5wcm90b3R5cGUuZ2V0Q29uZmlnID0gZnVuY3Rpb24gKGNvbmZpZ05hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcENvbmZpZ0RhdGEuZ2V0KGNvbmZpZ05hbWUpO1xuICAgICAgICB9O1xuICAgICAgICBDb25maWdNYW5hZ2VyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIC8vIE5PT1AuXG4gICAgICAgIH07XG4gICAgICAgIENvbmZpZ01hbmFnZXIucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gTk9PUC5cbiAgICAgICAgfTtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5wcm90b3R5cGUubG9hZENvbmZpZ1N1Y2Nlc3NDYWxsYmFjayA9IGZ1bmN0aW9uIChjb25maWdBc3NldE5hbWUsIGNvbmZpZ0Fzc2V0LCBkdXJhdGlvbiwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BJbmZvKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTG9hZCBjb25maWcgaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm1fcENvbmZpZ0hlbHBlci5sb2FkQ29uZmlnKGNvbmZpZ0Fzc2V0LCB2X3BJbmZvLmxvYWRUeXBlLCB2X3BJbmZvLnVzZXJEYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2FkIGNvbmZpZyBmYWlsdXJlIGluIGhlbHBlciwgYXNzZXQgbmFtZSAnXCIgKyBjb25maWdBc3NldE5hbWUgKyBcIidcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWRDb25maWdTdWNjZXNzRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRDb25maWdTdWNjZXNzRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihjb25maWdBc3NldE5hbWUsIHZfcEluZm8ubG9hZFR5cGUsIGR1cmF0aW9uLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkQ29uZmlnRmFpbHVyZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkQ29uZmlnRmFpbHVyZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oY29uZmlnQXNzZXROYW1lLCB2X3BJbmZvLmxvYWRUeXBlLCBlLnRvU3RyaW5nKCksIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BDb25maWdIZWxwZXIucmVsZWFzZUNvbmZpZ0Fzc2V0KGNvbmZpZ0Fzc2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5wcm90b3R5cGUubG9hZENvbmZpZ0ZhaWx1cmVDYWxsYmFjayA9IGZ1bmN0aW9uIChjb25maWdBc3NldE5hbWUsIHN0YXR1cywgZXJyb3JNZXNzYWdlLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcEluZm8pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2FkIGNvbmZpZyBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGFwcGVuZEVycm9yTWVzc2FnZSA9IFwiTG9hZCBjb25maWcgZmFpbHVyZSwgYXNzZXQgbmFtZSAnXCIgKyBjb25maWdBc3NldE5hbWUgKyBcIicsIHN0YXR1cyAnXCIgKyBzdGF0dXMgKyBcIicsIGVycm9yIG1lc3NhZ2UgJ1wiICsgZXJyb3JNZXNzYWdlICsgXCInLlwiO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wTG9hZENvbmZpZ0ZhaWx1cmVEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkQ29uZmlnRmFpbHVyZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihjb25maWdBc3NldE5hbWUsIHZfcEluZm8ubG9hZFR5cGUsIGFwcGVuZEVycm9yTWVzc2FnZSwgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGFwcGVuZEVycm9yTWVzc2FnZSk7XG4gICAgICAgIH07XG4gICAgICAgIENvbmZpZ01hbmFnZXIucHJvdG90eXBlLmxvYWRDb25maWdVcGRhdGVDYWxsYmFjayA9IGZ1bmN0aW9uIChjb25maWdBc3NldE5hbWUsIHByb2dyZXNzLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcEluZm8pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2FkIGNvbmZpZyBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubV9wTG9hZENvbmZpZ1VwZGF0ZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRDb25maWdVcGRhdGVEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oY29uZmlnQXNzZXROYW1lLCB2X3BJbmZvLmxvYWRUeXBlLCBwcm9ncmVzcywgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIENvbmZpZ01hbmFnZXIucHJvdG90eXBlLmxvYWRDb25maWdEZXBlbmRlbmN5QXNzZXRDYWxsYmFjayA9IGZ1bmN0aW9uIChjb25maWdBc3NldE5hbWUsIGRlcGVuZGVuY3lBc3NldE5hbWUsIGxvYWRlZENvdW50LCB0b3RhbENvdW50LCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcEluZm8pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2FkIGNvbmZpZyBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubV9wTG9hZENvbmZpZ0RlcGVuZGVuY3lBc3NldERlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRDb25maWdEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oY29uZmlnQXNzZXROYW1lLCBkZXBlbmRlbmN5QXNzZXROYW1lLCBsb2FkZWRDb3VudCwgdG90YWxDb3VudCwgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBDb25maWdNYW5hZ2VyO1xuICAgIH0oQmFzZV8xLkZyYW1ld29ya01vZHVsZSkpOyAvLyBjbGFzcyBDb25maWdNYW5hZ2VyXG4gICAgZXhwb3J0cy5Db25maWdNYW5hZ2VyID0gQ29uZmlnTWFuYWdlcjtcbn0pO1xuIiwidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG52YXIgX192YWx1ZXMgPSAodGhpcyAmJiB0aGlzLl9fdmFsdWVzKSB8fCBmdW5jdGlvbihvKSB7XG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcbiAgICBpZiAobyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHJldHVybiB7XG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IocyA/IFwiT2JqZWN0IGlzIG5vdCBpdGVyYWJsZS5cIiA6IFwiU3ltYm9sLml0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcbn07XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgdmFyIEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XG4gICAgdmFyIFBhdGhTcGxpdFNlcGFyYXRvciA9IFsnLicsICcvJywgJ1xcXFxcXFxcJ107XG4gICAgdmFyIERhdGFOb2RlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBEYXRhTm9kZSgpIHtcbiAgICAgICAgICAgIHRoaXMubV9zTmFtZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fcERhdGEgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX3BQYXJlbnQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX3BDaGlsZHMgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIERhdGFOb2RlLmNyZWF0ZSA9IGZ1bmN0aW9uIChuYW1lLCBwYXJlbnQpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pc1ZhbGlkTmFtZShuYW1lKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05hbWUgb2YgZGF0YSBub2RlIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB2YXIgdl9wTm9kZSA9IG5ldyBEYXRhTm9kZSgpO1xuICAgICAgICAgICAgdl9wTm9kZS5tX3NOYW1lID0gbmFtZTtcbiAgICAgICAgICAgIHZfcE5vZGUubV9wUGFyZW50ID0gcGFyZW50O1xuICAgICAgICAgICAgcmV0dXJuIHZfcE5vZGU7XG4gICAgICAgIH07XG4gICAgICAgIERhdGFOb2RlLmlzVmFsaWROYW1lID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIHZhciBlXzEsIF9hO1xuICAgICAgICAgICAgaWYgKCFuYW1lKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgUGF0aFNwbGl0U2VwYXJhdG9yXzEgPSBfX3ZhbHVlcyhQYXRoU3BsaXRTZXBhcmF0b3IpLCBQYXRoU3BsaXRTZXBhcmF0b3JfMV8xID0gUGF0aFNwbGl0U2VwYXJhdG9yXzEubmV4dCgpOyAhUGF0aFNwbGl0U2VwYXJhdG9yXzFfMS5kb25lOyBQYXRoU3BsaXRTZXBhcmF0b3JfMV8xID0gUGF0aFNwbGl0U2VwYXJhdG9yXzEubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXRoU3BsaXRTZXBhcmF0b3IgPSBQYXRoU3BsaXRTZXBhcmF0b3JfMV8xLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmFtZS5pbmRleE9mKHBhdGhTcGxpdFNlcGFyYXRvcikgIT0gLTEpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMV8xKSB7IGVfMSA9IHsgZXJyb3I6IGVfMV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChQYXRoU3BsaXRTZXBhcmF0b3JfMV8xICYmICFQYXRoU3BsaXRTZXBhcmF0b3JfMV8xLmRvbmUgJiYgKF9hID0gUGF0aFNwbGl0U2VwYXJhdG9yXzEucmV0dXJuKSkgX2EuY2FsbChQYXRoU3BsaXRTZXBhcmF0b3JfMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0YU5vZGUucHJvdG90eXBlLCBcIm5hbWVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9zTmFtZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0YU5vZGUucHJvdG90eXBlLCBcImZ1bGxOYW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsID09IHRoaXMubV9wUGFyZW50ID8gdGhpcy5uYW1lIDogXCJcIiArIHRoaXMubV9wUGFyZW50LmZ1bGxOYW1lICsgUGF0aFNwbGl0U2VwYXJhdG9yWzBdICsgdGhpcy5uYW1lO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRhTm9kZS5wcm90b3R5cGUsIFwicGFyZW50XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFBhcmVudDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0YU5vZGUucHJvdG90eXBlLCBcImNoaWxkQ291bnRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wQ2hpbGRzID8gdGhpcy5tX3BDaGlsZHMubGVuZ3RoIDogMDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBEYXRhTm9kZS5wcm90b3R5cGUuZ2V0RGF0YSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcERhdGE7XG4gICAgICAgIH07XG4gICAgICAgIERhdGFOb2RlLnByb3RvdHlwZS5zZXREYXRhID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMubV9wRGF0YSA9IGRhdGE7XG4gICAgICAgIH07XG4gICAgICAgIERhdGFOb2RlLnByb3RvdHlwZS5nZXRDaGlsZCA9IGZ1bmN0aW9uIChuYW1lT3JJbmRleCkge1xuICAgICAgICAgICAgdmFyIGVfMiwgX2E7XG4gICAgICAgICAgICBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIG5hbWVPckluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIG5hbWVfMSA9IG5hbWVPckluZGV4O1xuICAgICAgICAgICAgICAgIGlmICghRGF0YU5vZGUuaXNWYWxpZE5hbWUobmFtZV8xKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BDaGlsZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BDaGlsZHMpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGQgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY2hpbGQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQubmFtZSA9PSBuYW1lXzEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVfMl8xKSB7IGVfMiA9IHsgZXJyb3I6IGVfMl8xIH07IH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMikgdGhyb3cgZV8yLmVycm9yOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gbmFtZU9ySW5kZXg7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluZGV4ID49IHRoaXMuY2hpbGRDb3VudCA/IG51bGwgOiAodGhpcy5tX3BDaGlsZHMgPyB0aGlzLm1fcENoaWxkc1tpbmRleF0gOiBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRGF0YU5vZGUucHJvdG90eXBlLmdldE9yQWRkQ2hpbGQgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgdmFyIHZfcE5vZGUgPSB0aGlzLmdldENoaWxkKG5hbWUpO1xuICAgICAgICAgICAgaWYgKHZfcE5vZGUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZfcE5vZGU7XG4gICAgICAgICAgICB2X3BOb2RlID0gRGF0YU5vZGUuY3JlYXRlKG5hbWUsIHRoaXMpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1fcENoaWxkcykge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wQ2hpbGRzID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcENoaWxkcy5wdXNoKHZfcE5vZGUpO1xuICAgICAgICAgICAgcmV0dXJuIHZfcE5vZGU7XG4gICAgICAgIH07XG4gICAgICAgIERhdGFOb2RlLnByb3RvdHlwZS5nZXRBbGxDaGlsZCA9IGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgICAgICB2YXIgZV8zLCBfYTtcbiAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzIHx8IFtdO1xuICAgICAgICAgICAgcmVzdWx0cy5zcGxpY2UoMCwgcmVzdWx0cy5sZW5ndGgpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wQ2hpbGRzKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcENoaWxkcyksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV8zXzEpIHsgZV8zID0geyBlcnJvcjogZV8zXzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8zKSB0aHJvdyBlXzMuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfTtcbiAgICAgICAgRGF0YU5vZGUucHJvdG90eXBlLnJlbW92ZUNoaWxkID0gZnVuY3Rpb24gKG5hbWVPckluZGV4KSB7XG4gICAgICAgICAgICB2YXIgdl9wTm9kZSA9IHRoaXMuZ2V0Q2hpbGQobmFtZU9ySW5kZXgpO1xuICAgICAgICAgICAgaWYgKCF2X3BOb2RlKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BDaGlsZHMpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHZfaWR4ID0gdGhpcy5tX3BDaGlsZHMuaW5kZXhPZih2X3BOb2RlKTtcbiAgICAgICAgICAgIGlmICgtMSA9PSB2X2lkeClcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB0aGlzLm1fcENoaWxkcy5zcGxpY2Uodl9pZHgsIDEpO1xuICAgICAgICAgICAgdl9wTm9kZS5kZXN0cm95KCk7XG4gICAgICAgIH07XG4gICAgICAgIERhdGFOb2RlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5tX3NOYW1lID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9wUGFyZW50ID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgRGF0YU5vZGUucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfNCwgX2E7XG4gICAgICAgICAgICB0aGlzLm1fcERhdGEgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wQ2hpbGRzKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcENoaWxkcyksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQuZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzRfMSkgeyBlXzQgPSB7IGVycm9yOiBlXzRfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzQpIHRocm93IGVfNC5lcnJvcjsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLm1fcENoaWxkcy5zcGxpY2UoMCwgdGhpcy5tX3BDaGlsZHMubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRGF0YU5vZGUucHJvdG90eXBlLnRvRGF0YVN0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh1bmRlZmluZWQgPT0gdGhpcy5tX3BEYXRhIHx8IG51bGwgPT0gdGhpcy5tX3BEYXRhKVxuICAgICAgICAgICAgICAgIHJldHVybiAnPE51bGw+JztcbiAgICAgICAgICAgIHJldHVybiBcIltcIiArIHR5cGVvZiB0aGlzLm1fcERhdGEgKyBcIl0gXCIgKyB0aGlzLm1fcERhdGE7XG4gICAgICAgIH07XG4gICAgICAgIERhdGFOb2RlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZ1bGxOYW1lICsgXCI6IFwiICsgdGhpcy50b0RhdGFTdHJpbmcoKTtcbiAgICAgICAgfTtcbiAgICAgICAgRGF0YU5vZGUuc19wRW1wdHlBcnJheSA9IFtdO1xuICAgICAgICByZXR1cm4gRGF0YU5vZGU7XG4gICAgfSgpKTsgLy8gY2xhc3MgRGF0YU5vZGVcbiAgICBleHBvcnRzLkRhdGFOb2RlID0gRGF0YU5vZGU7XG4gICAgdmFyIFJvb3ROYW1lID0gJzxSb290Pic7XG4gICAgdmFyIERhdGFOb2RlTWFuYWdlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgX19leHRlbmRzKERhdGFOb2RlTWFuYWdlciwgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gRGF0YU5vZGVNYW5hZ2VyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcykgfHwgdGhpcztcbiAgICAgICAgICAgIF90aGlzLm1fcFJvb3QgPSBEYXRhTm9kZS5jcmVhdGUoUm9vdE5hbWUsIG51bGwpO1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgICAgICB9XG4gICAgICAgIERhdGFOb2RlTWFuYWdlci5nZXRTcGxpdFBhdGggPSBmdW5jdGlvbiAocGF0aCkge1xuICAgICAgICAgICAgaWYgKCFwYXRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHBhdGguc3BsaXQobmV3IFJlZ0V4cChcIltcIiArIFBhdGhTcGxpdFNlcGFyYXRvci5qb2luKCcnKSArIFwiXVwiKSk7XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRhTm9kZU1hbmFnZXIucHJvdG90eXBlLCBcInJvb3RcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUm9vdDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBEYXRhTm9kZU1hbmFnZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgLy8gTk9PUC5cbiAgICAgICAgfTtcbiAgICAgICAgRGF0YU5vZGVNYW5hZ2VyLnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcFJvb3QpXG4gICAgICAgICAgICAgICAgdGhpcy5tX3BSb290LmRlc3Ryb3koKTtcbiAgICAgICAgICAgIHRoaXMubV9wUm9vdCA9IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIERhdGFOb2RlTWFuYWdlci5wcm90b3R5cGUuZ2V0RGF0YSA9IGZ1bmN0aW9uIChwYXRoLCBub2RlKSB7XG4gICAgICAgICAgICB2YXIgdl9wQ3VycmVudCA9IHRoaXMuZ2V0Tm9kZShwYXRoLCBub2RlKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcEN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEYXRhIG5vZGUgaXMgbm90IGV4aXN0LCBwYXRoICdcIiArIHBhdGggKyBcIicsIG5vZGUgJ1wiICsgKG5vZGUgPyBub2RlLmZ1bGxOYW1lIDogXCJcIikgKyBcIidcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdl9wQ3VycmVudC5nZXREYXRhKCk7XG4gICAgICAgIH07XG4gICAgICAgIERhdGFOb2RlTWFuYWdlci5wcm90b3R5cGUuc2V0RGF0YSA9IGZ1bmN0aW9uIChwYXRoLCBkYXRhLCBub2RlKSB7XG4gICAgICAgICAgICB2YXIgdl9wQ3VycmVudCA9IHRoaXMuZ2V0T3JBZGROb2RlKHBhdGgsIG5vZGUpO1xuICAgICAgICAgICAgdl9wQ3VycmVudC5zZXREYXRhKGRhdGEpO1xuICAgICAgICB9O1xuICAgICAgICBEYXRhTm9kZU1hbmFnZXIucHJvdG90eXBlLmdldE5vZGUgPSBmdW5jdGlvbiAocGF0aCwgbm9kZSkge1xuICAgICAgICAgICAgdmFyIGVfNSwgX2E7XG4gICAgICAgICAgICB2YXIgdl9wQ3VycmVudCA9IG5vZGUgPyBub2RlIDogdGhpcy5tX3BSb290O1xuICAgICAgICAgICAgaWYgKG51bGwgIT0gdl9wQ3VycmVudCkge1xuICAgICAgICAgICAgICAgIHZhciB2X3BTcGxpdFBhdGggPSBEYXRhTm9kZU1hbmFnZXIuZ2V0U3BsaXRQYXRoKHBhdGgpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHZfcFNwbGl0UGF0aF8xID0gX192YWx1ZXModl9wU3BsaXRQYXRoKSwgdl9wU3BsaXRQYXRoXzFfMSA9IHZfcFNwbGl0UGF0aF8xLm5leHQoKTsgIXZfcFNwbGl0UGF0aF8xXzEuZG9uZTsgdl9wU3BsaXRQYXRoXzFfMSA9IHZfcFNwbGl0UGF0aF8xLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGkgPSB2X3BTcGxpdFBhdGhfMV8xLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdl9wQ3VycmVudCA9IHZfcEN1cnJlbnQuZ2V0Q2hpbGQoaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BDdXJyZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzVfMSkgeyBlXzUgPSB7IGVycm9yOiBlXzVfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodl9wU3BsaXRQYXRoXzFfMSAmJiAhdl9wU3BsaXRQYXRoXzFfMS5kb25lICYmIChfYSA9IHZfcFNwbGl0UGF0aF8xLnJldHVybikpIF9hLmNhbGwodl9wU3BsaXRQYXRoXzEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV81KSB0aHJvdyBlXzUuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdl9wQ3VycmVudDtcbiAgICAgICAgfTtcbiAgICAgICAgRGF0YU5vZGVNYW5hZ2VyLnByb3RvdHlwZS5nZXRPckFkZE5vZGUgPSBmdW5jdGlvbiAocGF0aCwgbm9kZSkge1xuICAgICAgICAgICAgdmFyIGVfNiwgX2E7XG4gICAgICAgICAgICB2YXIgdl9wQ3VycmVudCA9IG5vZGUgPyBub2RlIDogdGhpcy5tX3BSb290O1xuICAgICAgICAgICAgdmFyIHZfcFNwbGl0UGF0aCA9IERhdGFOb2RlTWFuYWdlci5nZXRTcGxpdFBhdGgocGF0aCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHZfcFNwbGl0UGF0aF8yID0gX192YWx1ZXModl9wU3BsaXRQYXRoKSwgdl9wU3BsaXRQYXRoXzJfMSA9IHZfcFNwbGl0UGF0aF8yLm5leHQoKTsgIXZfcFNwbGl0UGF0aF8yXzEuZG9uZTsgdl9wU3BsaXRQYXRoXzJfMSA9IHZfcFNwbGl0UGF0aF8yLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaSA9IHZfcFNwbGl0UGF0aF8yXzEudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHZfcEN1cnJlbnQgPSB2X3BDdXJyZW50LmdldE9yQWRkQ2hpbGQoaSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfNl8xKSB7IGVfNiA9IHsgZXJyb3I6IGVfNl8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2X3BTcGxpdFBhdGhfMl8xICYmICF2X3BTcGxpdFBhdGhfMl8xLmRvbmUgJiYgKF9hID0gdl9wU3BsaXRQYXRoXzIucmV0dXJuKSkgX2EuY2FsbCh2X3BTcGxpdFBhdGhfMik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV82KSB0aHJvdyBlXzYuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2X3BDdXJyZW50O1xuICAgICAgICB9O1xuICAgICAgICBEYXRhTm9kZU1hbmFnZXIucHJvdG90eXBlLnJlbW92ZU5vZGUgPSBmdW5jdGlvbiAocGF0aCwgbm9kZSkge1xuICAgICAgICAgICAgdmFyIGVfNywgX2E7XG4gICAgICAgICAgICB2YXIgdl9wQ3VycmVudCA9IG5vZGUgPyBub2RlIDogdGhpcy5tX3BSb290O1xuICAgICAgICAgICAgaWYgKCF2X3BDdXJyZW50KVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHZhciB2X3BQYXJlbnQgPSB2X3BDdXJyZW50LnBhcmVudDtcbiAgICAgICAgICAgIHZhciB2X3BTcGxpdFBhdGggPSBEYXRhTm9kZU1hbmFnZXIuZ2V0U3BsaXRQYXRoKHBhdGgpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB2X3BTcGxpdFBhdGhfMyA9IF9fdmFsdWVzKHZfcFNwbGl0UGF0aCksIHZfcFNwbGl0UGF0aF8zXzEgPSB2X3BTcGxpdFBhdGhfMy5uZXh0KCk7ICF2X3BTcGxpdFBhdGhfM18xLmRvbmU7IHZfcFNwbGl0UGF0aF8zXzEgPSB2X3BTcGxpdFBhdGhfMy5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGkgPSB2X3BTcGxpdFBhdGhfM18xLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB2X3BQYXJlbnQgPSB2X3BDdXJyZW50O1xuICAgICAgICAgICAgICAgICAgICBpZiAodl9wQ3VycmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdl9wQ3VycmVudCA9IHZfcEN1cnJlbnQuZ2V0Q2hpbGQoaSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF2X3BDdXJyZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzdfMSkgeyBlXzcgPSB7IGVycm9yOiBlXzdfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodl9wU3BsaXRQYXRoXzNfMSAmJiAhdl9wU3BsaXRQYXRoXzNfMS5kb25lICYmIChfYSA9IHZfcFNwbGl0UGF0aF8zLnJldHVybikpIF9hLmNhbGwodl9wU3BsaXRQYXRoXzMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNykgdGhyb3cgZV83LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodl9wUGFyZW50KVxuICAgICAgICAgICAgICAgIHZfcFBhcmVudC5yZW1vdmVDaGlsZCh2X3BDdXJyZW50Lm5hbWUpO1xuICAgICAgICB9O1xuICAgICAgICBEYXRhTm9kZU1hbmFnZXIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wUm9vdCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wUm9vdC5jbGVhcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gRGF0YU5vZGVNYW5hZ2VyO1xuICAgIH0oQmFzZV8xLkZyYW1ld29ya01vZHVsZSkpOyAvLyBjbGFzcyBEYXRhTm9kZU1hbmFnZXJcbiAgICBleHBvcnRzLkRhdGFOb2RlTWFuYWdlciA9IERhdGFOb2RlTWFuYWdlcjtcbn0pO1xuIiwidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG52YXIgX192YWx1ZXMgPSAodGhpcyAmJiB0aGlzLl9fdmFsdWVzKSB8fCBmdW5jdGlvbihvKSB7XG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcbiAgICBpZiAobyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHJldHVybiB7XG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IocyA/IFwiT2JqZWN0IGlzIG5vdCBpdGVyYWJsZS5cIiA6IFwiU3ltYm9sLml0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcbn07XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgdmFyIEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XG4gICAgdmFyIERhdGFUYWJsZUJhc2UgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZ1bmN0aW9uIERhdGFUYWJsZUJhc2UobmFtZSkge1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUgfHwgJyc7XG4gICAgICAgICAgICB0aGlzLm1fc05hbWUgPSBuYW1lO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRhVGFibGVCYXNlLnByb3RvdHlwZSwgXCJuYW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3NOYW1lOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIERhdGFUYWJsZUJhc2U7XG4gICAgfSgpKTsgLy8gY2xhc3MgRGF0YVRhYmxlQmFzZVxuICAgIGV4cG9ydHMuRGF0YVRhYmxlQmFzZSA9IERhdGFUYWJsZUJhc2U7XG4gICAgdmFyIERhdGFUYWJsZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgX19leHRlbmRzKERhdGFUYWJsZSwgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gRGF0YVRhYmxlKG5hbWUpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIG5hbWUpIHx8IHRoaXM7XG4gICAgICAgICAgICBfdGhpcy5tX3BEYXRhU2V0ID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRhVGFibGUucHJvdG90eXBlLCBcIm1pbklkRGF0YVJvd1wiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wTWluSWREYXRhUm93OyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KERhdGFUYWJsZS5wcm90b3R5cGUsIFwibWF4SWREYXRhUm93XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BNYXhJZERhdGFSb3c7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBEYXRhVGFibGUucHJvdG90eXBlLmhhc0RhdGFSb3cgPSBmdW5jdGlvbiAocHJlZCkge1xuICAgICAgICAgICAgdmFyIGVfMSwgX2E7XG4gICAgICAgICAgICB2YXIgdl9pZHg7XG4gICAgICAgICAgICBpZiAoJ251bWJlcicgPT09IHR5cGVvZiBwcmVkKSB7XG4gICAgICAgICAgICAgICAgdl9pZHggPSBwcmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHVuZGVmaW5lZCAhPSB2X2lkeCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcERhdGFTZXQuaGFzKHZfaWR4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BEYXRhU2V0LmtleXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMubV9wRGF0YVNldC5nZXQoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcmVkKHZhbHVlLCBrZXksIHRoaXMubV9wRGF0YVNldC52YWx1ZXMoKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV8xXzEpIHsgZV8xID0geyBlcnJvcjogZV8xXzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIERhdGFUYWJsZS5wcm90b3R5cGUuZ2V0RGF0YVJvdyA9IGZ1bmN0aW9uIChwcmVkKSB7XG4gICAgICAgICAgICB2YXIgZV8yLCBfYTtcbiAgICAgICAgICAgIHZhciB2X2lkeDtcbiAgICAgICAgICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIHByZWQpIHtcbiAgICAgICAgICAgICAgICB2X2lkeCA9IHByZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodW5kZWZpbmVkICE9IHZfaWR4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wRGF0YVNldC5nZXQodl9pZHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCdmdW5jdGlvbicgIT09IHR5cGVvZiBwcmVkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBwcmVkLCBub3QgYSBmdW5jdGlvbi4gSXQncyBhIHR5cGUgb2YgJ1wiICsgdHlwZW9mIHByZWQgKyBcIicuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRGF0YVNldC5rZXlzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5tX3BEYXRhU2V0LmdldChrZXkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJlZCh2YWx1ZSwga2V5LCB0aGlzLm1fcERhdGFTZXQudmFsdWVzKCkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8yXzEpIHsgZV8yID0geyBlcnJvcjogZV8yXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMikgdGhyb3cgZV8yLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlLnByb3RvdHlwZS5nZXREYXRhUm93cyA9IGZ1bmN0aW9uIChwcmVkLCByZXN1bHRzKSB7XG4gICAgICAgICAgICB2YXIgZV8zLCBfYTtcbiAgICAgICAgICAgIGlmICghcHJlZClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbmRpdGlvbiBwcmVkaWNhdGUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzIHx8IFtdO1xuICAgICAgICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHJlc3VsdHMuc3BsaWNlKDAsIHJlc3VsdHMubGVuZ3RoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcERhdGFTZXQua2V5cygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMubV9wRGF0YVNldC5nZXQoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZWQodmFsdWUsIGtleSwgdGhpcy5tX3BEYXRhU2V0LnZhbHVlcygpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfM18xKSB7IGVfMyA9IHsgZXJyb3I6IGVfM18xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzMpIHRocm93IGVfMy5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICAgIERhdGFUYWJsZS5wcm90b3R5cGUuZ2V0QWxsRGF0YVJvd3MgPSBmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgICAgICAgdmFyIGVfNCwgX2E7XG4gICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cyB8fCBbXTtcbiAgICAgICAgICAgIGlmIChyZXN1bHRzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5zcGxpY2UoMCwgcmVzdWx0cy5sZW5ndGgpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRGF0YVNldC52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfNF8xKSB7IGVfNCA9IHsgZXJyb3I6IGVfNF8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzQpIHRocm93IGVfNC5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRhVGFibGUucHJvdG90eXBlLCBcImNvdW50XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcERhdGFTZXQuc2l6ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBEYXRhVGFibGUucHJvdG90eXBlLmFkZERhdGFSb3cgPSBmdW5jdGlvbiAocm93VHlwZSwgcm93U2VnbWVudCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wRGF0YVJvdyA9IG5ldyByb3dUeXBlKCk7XG4gICAgICAgICAgICAgICAgaWYgKCF2X3BEYXRhUm93LnBhcnNlRGF0YVJvdyhyb3dTZWdtZW50KSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxBZGREYXRhUm93KHZfcERhdGFSb3cpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlLnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMubV9wRGF0YVNldC5jbGVhcigpO1xuICAgICAgICB9O1xuICAgICAgICBEYXRhVGFibGUucHJvdG90eXBlLmludGVybmFsQWRkRGF0YVJvdyA9IGZ1bmN0aW9uIChkYXRhUm93KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5oYXNEYXRhUm93KGRhdGFSb3cuaWQpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQWxyZWFkeSBleGlzdCAnXCIgKyBkYXRhUm93LmlkICsgXCInIGluIGRhdGEgdGFibGUgJ1wiICsgbmFtZSArIFwiJ1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wRGF0YVNldC5zZXQoZGF0YVJvdy5pZCwgZGF0YVJvdyk7XG4gICAgICAgICAgICBpZiAoIXRoaXMubV9wTWluSWREYXRhUm93IHx8IHRoaXMubV9wTWluSWREYXRhUm93LmlkID4gZGF0YVJvdy5pZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTWluSWREYXRhUm93ID0gZGF0YVJvdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BNYXhJZERhdGFSb3cgfHwgdGhpcy5tX3BNYXhJZERhdGFSb3cuaWQgPCBkYXRhUm93LmlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BNYXhJZERhdGFSb3cgPSBkYXRhUm93O1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gRGF0YVRhYmxlO1xuICAgIH0oRGF0YVRhYmxlQmFzZSkpOyAvLyBjbGFzcyBEYXRhVGFibGVcbiAgICB2YXIgRGF0YVRhYmxlTWFuYWdlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgX19leHRlbmRzKERhdGFUYWJsZU1hbmFnZXIsIF9zdXBlcik7XG4gICAgICAgIGZ1bmN0aW9uIERhdGFUYWJsZU1hbmFnZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgICAgICAgICAgIF90aGlzLm1fcERhdGFUYWJsZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWREYXRhVGFibGVTdWNjZXNzRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZERhdGFUYWJsZUZhaWx1cmVEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BMb2FkRGF0YVRhYmxlVXBkYXRlRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZERhdGFUYWJsZURlcGVuZGVuY3lBc3NldERlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRBc3NldENhbGxiYWNrcyA9IHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBfdGhpcy5sb2FkRGF0YVRhYmxlU3VjY2Vzc0NhbGxiYWNrLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIGZhaWx1cmU6IF90aGlzLmxvYWREYXRhVGFibGVGYWlsdXJlQ2FsbGJhY2suYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgdXBkYXRlOiBfdGhpcy5sb2FkRGF0YVRhYmxlVXBkYXRlQ2FsbGJhY2suYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgZGVwZW5kZW5jeTogX3RoaXMubG9hZERhdGFUYWJsZURlcGVuZGVuY3lBc3NldENhbGxiYWNrLmJpbmQoX3RoaXMpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRhVGFibGVNYW5hZ2VyLnByb3RvdHlwZSwgXCJyZXNvdXJjZU1hbmFnZXJcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFJlc291cmNlTWFuYWdlcjsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUsIFwibG9hZERhdGFUYWJsZVN1Y2Nlc3NcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wTG9hZERhdGFUYWJsZVN1Y2Nlc3NEZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUsIFwibG9hZERhdGFUYWJsZUZhaWx1cmVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wTG9hZERhdGFUYWJsZUZhaWx1cmVEZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUsIFwibG9hZERhdGFUYWJsZVVwZGF0ZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BMb2FkRGF0YVRhYmxlVXBkYXRlRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KERhdGFUYWJsZU1hbmFnZXIucHJvdG90eXBlLCBcIkxvYWREYXRhVGFibGVEZXBlbmRlbmN5QXNzZXRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wTG9hZERhdGFUYWJsZURlcGVuZGVuY3lBc3NldERlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRhVGFibGVNYW5hZ2VyLnByb3RvdHlwZSwgXCJjb3VudFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BEYXRhVGFibGUuc2l6ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUsIFwiZGF0YVRhYmxlSGVscGVyXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcERhdGFUYWJsZUhlbHBlcjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRGF0YVRhYmxlSGVscGVyID0gdmFsdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUubG9hZERhdGFUYWJsZSA9IGZ1bmN0aW9uIChkYXRhVGFibGVBc3NldE5hbWUsIGxvYWRUeXBlLCBhbnlBcmcxLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1fcFJlc291cmNlTWFuYWdlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgcmVzb3VyY2UgbWFuYWdlciBmaXJzdC5cIik7XG4gICAgICAgICAgICBpZiAoIXRoaXMubV9wRGF0YVRhYmxlSGVscGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IHNldCBkYXRhIHRhYmxlIGhlbHBlciBmaXJzdC5cIik7XG4gICAgICAgICAgICB2YXIgcHJpb3JpdHkgPSAwO1xuICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2YgYW55QXJnMSkge1xuICAgICAgICAgICAgICAgIHByaW9yaXR5ID0gYW55QXJnMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHVuZGVmaW5lZCAhPSBhbnlBcmcxICYmIHVuZGVmaW5lZCA9PSB1c2VyRGF0YSkge1xuICAgICAgICAgICAgICAgIHVzZXJEYXRhID0gYW55QXJnMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVzZXJEYXRhID0gdXNlckRhdGEgfHwgbnVsbDtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0ge1xuICAgICAgICAgICAgICAgIGxvYWRUeXBlOiBsb2FkVHlwZSxcbiAgICAgICAgICAgICAgICB1c2VyRGF0YTogdXNlckRhdGFcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlci5sb2FkQXNzZXQoZGF0YVRhYmxlQXNzZXROYW1lLCBwcmlvcml0eSwgdGhpcy5tX3BMb2FkQXNzZXRDYWxsYmFja3MsIHZfcEluZm8pO1xuICAgICAgICB9O1xuICAgICAgICBEYXRhVGFibGVNYW5hZ2VyLnByb3RvdHlwZS5oYXNEYXRhVGFibGUgPSBmdW5jdGlvbiAoZGF0YVRhYmxlQXNzZXROYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbEhhc0RhdGFUYWJsZShkYXRhVGFibGVBc3NldE5hbWUpO1xuICAgICAgICB9O1xuICAgICAgICBEYXRhVGFibGVNYW5hZ2VyLnByb3RvdHlwZS5nZXREYXRhVGFibGUgPSBmdW5jdGlvbiAoZGF0YVRhYmxlQXNzZXROYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbEdldERhdGFUYWJsZShkYXRhVGFibGVBc3NldE5hbWUgfHwgJycpO1xuICAgICAgICB9O1xuICAgICAgICBEYXRhVGFibGVNYW5hZ2VyLnByb3RvdHlwZS5nZXRBbGxEYXRhVGFibGVzID0gZnVuY3Rpb24gKHJlc3VsdHMpIHtcbiAgICAgICAgICAgIHZhciBlXzUsIF9hO1xuICAgICAgICAgICAgdmFyIHZfcFJldCA9IHJlc3VsdHMgfHwgW107XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BEYXRhVGFibGUudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkdCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB2X3BSZXQucHVzaChkdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfNV8xKSB7IGVfNSA9IHsgZXJyb3I6IGVfNV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzUpIHRocm93IGVfNS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZfcFJldDtcbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUuY3JlYXRlRGF0YVRhYmxlID0gZnVuY3Rpb24gKHR5cGUsIGFueUFyZzEsIGFueUFyZzIpIHtcbiAgICAgICAgICAgIHZhciBjb250ZW50O1xuICAgICAgICAgICAgdmFyIG5hbWU7XG4gICAgICAgICAgICBpZiAodW5kZWZpbmVkICE9PSBhbnlBcmcyKSB7XG4gICAgICAgICAgICAgICAgY29udGVudCA9IGFueUFyZzI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY29udGVudCkge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBhbnlBcmcxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZfc0Z1bGxOYW1lO1xuICAgICAgICAgICAgLy8gaWYgKG5hbWUpIHtcbiAgICAgICAgICAgIC8vICAgICB2X3NGdWxsTmFtZSA9IGAke3R5cGUubmFtZX0uJHtuYW1lfWA7XG4gICAgICAgICAgICAvLyB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gICAgIHZfc0Z1bGxOYW1lID0gdHlwZS5uYW1lO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgdl9zRnVsbE5hbWUgPSBuYW1lIHx8IHR5cGUubmFtZTtcbiAgICAgICAgICAgIHZhciB2X3BEYXRhVGFibGUgPSBuZXcgRGF0YVRhYmxlKCk7XG4gICAgICAgICAgICB0aGlzLmludGVybmFsQ3JlYXRlRGF0YVRhYmxlKHR5cGUsIHZfcERhdGFUYWJsZSwgY29udGVudCk7XG4gICAgICAgICAgICB0aGlzLm1fcERhdGFUYWJsZS5zZXQodl9zRnVsbE5hbWUsIHZfcERhdGFUYWJsZSk7XG4gICAgICAgICAgICByZXR1cm4gdl9wRGF0YVRhYmxlO1xuICAgICAgICB9O1xuICAgICAgICBEYXRhVGFibGVNYW5hZ2VyLnByb3RvdHlwZS5kZXN0cm95RGF0YVRhYmxlID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmludGVybmFsRGVzdHJveURhdGFUYWJsZShuYW1lIHx8ICcnKTtcbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUuaW50ZXJuYWxIYXNEYXRhVGFibGUgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wRGF0YVRhYmxlLmhhcyhuYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUuaW50ZXJuYWxHZXREYXRhVGFibGUgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wRGF0YVRhYmxlLmdldChuYW1lKSB8fCBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBEYXRhVGFibGVNYW5hZ2VyLnByb3RvdHlwZS5pbnRlcm5hbENyZWF0ZURhdGFUYWJsZSA9IGZ1bmN0aW9uIChyb3dUeXBlLCBkYXRhVGFibGUsIGNvbnRlbnQpIHtcbiAgICAgICAgICAgIHZhciBlXzYsIF9hO1xuICAgICAgICAgICAgdmFyIHZfcEl0ZXJhdG9yO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2X3BJdGVyYXRvciA9IHRoaXMubV9wRGF0YVRhYmxlSGVscGVyLmdldERhdGFSb3dTZWdtZW50cyhjb250ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGdldCBkYXRhIHJvdyBzZWdtZW50cyB3aXRoIGV4Y2VwdGlvbjogJ1wiICsgZSArIFwiJy5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXZfcEl0ZXJhdG9yKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXRhIHJvdyBzZWdtZW50cyBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB2X3BJdGVyYXRvcl8xID0gX192YWx1ZXModl9wSXRlcmF0b3IpLCB2X3BJdGVyYXRvcl8xXzEgPSB2X3BJdGVyYXRvcl8xLm5leHQoKTsgIXZfcEl0ZXJhdG9yXzFfMS5kb25lOyB2X3BJdGVyYXRvcl8xXzEgPSB2X3BJdGVyYXRvcl8xLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YVJvd1NlZ21lbnQgPSB2X3BJdGVyYXRvcl8xXzEudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZGF0YVRhYmxlLmFkZERhdGFSb3cocm93VHlwZSwgZGF0YVJvd1NlZ21lbnQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBZGQgZGF0YSByb3cgZmFpbHVyZS4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV82XzEpIHsgZV82ID0geyBlcnJvcjogZV82XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEl0ZXJhdG9yXzFfMSAmJiAhdl9wSXRlcmF0b3JfMV8xLmRvbmUgJiYgKF9hID0gdl9wSXRlcmF0b3JfMS5yZXR1cm4pKSBfYS5jYWxsKHZfcEl0ZXJhdG9yXzEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNikgdGhyb3cgZV82LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIERhdGFUYWJsZU1hbmFnZXIucHJvdG90eXBlLmludGVybmFsRGVzdHJveURhdGFUYWJsZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICB2YXIgdl9wRGF0YVRhYmxlID0gdGhpcy5tX3BEYXRhVGFibGUuZ2V0KG5hbWUpO1xuICAgICAgICAgICAgaWYgKHZfcERhdGFUYWJsZSkge1xuICAgICAgICAgICAgICAgIHZfcERhdGFUYWJsZS5zaHV0ZG93bigpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcERhdGFUYWJsZS5kZWxldGUobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIERhdGFUYWJsZU1hbmFnZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgLy8gTk9PUC5cbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUuc2h1dGRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZV83LCBfYTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcERhdGFUYWJsZS52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGR0ID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGR0LnNodXRkb3duKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfN18xKSB7IGVfNyA9IHsgZXJyb3I6IGVfN18xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzcpIHRocm93IGVfNy5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3BEYXRhVGFibGUuY2xlYXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUubG9hZERhdGFUYWJsZVN1Y2Nlc3NDYWxsYmFjayA9IGZ1bmN0aW9uIChkYXRhVGFibGVBc3NldE5hbWUsIGRhdGFUYWJsZUFzc2V0LCBkdXJhdGlvbiwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAoIXZfcEluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTG9hZCBkYXRhIHRhYmxlIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5tX3BEYXRhVGFibGVIZWxwZXIubG9hZERhdGFUYWJsZShkYXRhVGFibGVBc3NldCwgdl9wSW5mby5sb2FkVHlwZSwgdl9wSW5mby51c2VyRGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTG9hZCBkYXRhIHRhYmxlIGZhaWx1cmUgaW4gaGVscGVyLCBhc3NldCBuYW1lICdcIiArIGRhdGFUYWJsZUFzc2V0TmFtZSArIFwiJy5cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWREYXRhVGFibGVTdWNjZXNzRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWREYXRhVGFibGVTdWNjZXNzRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihkYXRhVGFibGVBc3NldE5hbWUsIHZfcEluZm8ubG9hZFR5cGUsIGR1cmF0aW9uLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIEVycm9yICYmIHRoaXMubV9wTG9hZERhdGFUYWJsZUZhaWx1cmVEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZERhdGFUYWJsZUZhaWx1cmVEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGRhdGFUYWJsZUFzc2V0TmFtZSwgdl9wSW5mby5sb2FkVHlwZSwgZS5tZXNzYWdlLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIC8vIHJlbGVhc2VcbiAgICAgICAgICAgICAgICB0aGlzLm1fcERhdGFUYWJsZUhlbHBlci5yZWxlYXNlRGF0YVRhYmxlQXNzZXQoZGF0YVRhYmxlQXNzZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBEYXRhVGFibGVNYW5hZ2VyLnByb3RvdHlwZS5sb2FkRGF0YVRhYmxlRmFpbHVyZUNhbGxiYWNrID0gZnVuY3Rpb24gKGRhdGFUYWJsZUFzc2V0TmFtZSwgc3RhdHVzLCBlcnJvck1lc3NhZ2UsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKCF2X3BJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgZGF0YSB0YWJsZSBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgdmFyIHZfc0Vycm9yTWVzc2FnZSA9IFwiTG9hZCBkYXRhIHRhYmxlIGZhaWx1cmUsIGFzc2V0IG5hbWUgJ1wiICsgZGF0YVRhYmxlQXNzZXROYW1lICsgXCInLCBzdGF0dXMgJ1wiICsgc3RhdHVzICsgXCInLCBlcnJvciBtZXNzYWdlICdcIiArIGVycm9yTWVzc2FnZSArIFwiJy5cIjtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWREYXRhVGFibGVGYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZERhdGFUYWJsZUZhaWx1cmVEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oZGF0YVRhYmxlQXNzZXROYW1lLCB2X3BJbmZvLmxvYWRUeXBlLCB2X3NFcnJvck1lc3NhZ2UsIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih2X3NFcnJvck1lc3NhZ2UpO1xuICAgICAgICB9O1xuICAgICAgICBEYXRhVGFibGVNYW5hZ2VyLnByb3RvdHlwZS5sb2FkRGF0YVRhYmxlVXBkYXRlQ2FsbGJhY2sgPSBmdW5jdGlvbiAoZGF0YVRhYmxlQXNzZXROYW1lLCBwcm9ncmVzcywgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAoIXZfcEluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTG9hZCBkYXRhIHRhYmxlIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkRGF0YVRhYmxlVXBkYXRlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZERhdGFUYWJsZVVwZGF0ZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihkYXRhVGFibGVBc3NldE5hbWUsIHZfcEluZm8ubG9hZFR5cGUsIHByb2dyZXNzLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRGF0YVRhYmxlTWFuYWdlci5wcm90b3R5cGUubG9hZERhdGFUYWJsZURlcGVuZGVuY3lBc3NldENhbGxiYWNrID0gZnVuY3Rpb24gKGRhdGFUYWJsZUFzc2V0TmFtZSwgZGVwZW5kZW5jeUFzc2V0TmFtZSwgbG9hZGVkQ291bnQsIHRvdGFsQ291bnQsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKCF2X3BJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgZGF0YSB0YWJsZSBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wTG9hZERhdGFUYWJsZURlcGVuZGVuY3lBc3NldERlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWREYXRhVGFibGVEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oZGF0YVRhYmxlQXNzZXROYW1lLCBkZXBlbmRlbmN5QXNzZXROYW1lLCBsb2FkZWRDb3VudCwgdG90YWxDb3VudCwgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBEYXRhVGFibGVNYW5hZ2VyO1xuICAgIH0oQmFzZV8xLkZyYW1ld29ya01vZHVsZSkpOyAvLyBjbGFzcyBEYXRhVGFibGVNYW5hZ2VyXG4gICAgZXhwb3J0cy5EYXRhVGFibGVNYW5hZ2VyID0gRGF0YVRhYmxlTWFuYWdlcjtcbn0pO1xuIiwidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG52YXIgX192YWx1ZXMgPSAodGhpcyAmJiB0aGlzLl9fdmFsdWVzKSB8fCBmdW5jdGlvbihvKSB7XG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcbiAgICBpZiAobyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHJldHVybiB7XG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IocyA/IFwiT2JqZWN0IGlzIG5vdCBpdGVyYWJsZS5cIiA6IFwiU3ltYm9sLml0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcbn07XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiLCBcIi4vT2JqZWN0UG9vbFwiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgdmFyIEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XG4gICAgdmFyIE9iamVjdFBvb2xfMSA9IHJlcXVpcmUoXCIuL09iamVjdFBvb2xcIik7XG4gICAgdmFyIEVudGl0eVN0YXR1cztcbiAgICAoZnVuY3Rpb24gKEVudGl0eVN0YXR1cykge1xuICAgICAgICBFbnRpdHlTdGF0dXNbRW50aXR5U3RhdHVzW1wiV2lsbEluaXRcIl0gPSAwXSA9IFwiV2lsbEluaXRcIjtcbiAgICAgICAgRW50aXR5U3RhdHVzW0VudGl0eVN0YXR1c1tcIkluaXRlZFwiXSA9IDFdID0gXCJJbml0ZWRcIjtcbiAgICAgICAgRW50aXR5U3RhdHVzW0VudGl0eVN0YXR1c1tcIldpbGxTaG93XCJdID0gMl0gPSBcIldpbGxTaG93XCI7XG4gICAgICAgIEVudGl0eVN0YXR1c1tFbnRpdHlTdGF0dXNbXCJTaG93ZWRcIl0gPSAzXSA9IFwiU2hvd2VkXCI7XG4gICAgICAgIEVudGl0eVN0YXR1c1tFbnRpdHlTdGF0dXNbXCJXaWxsSGlkZVwiXSA9IDRdID0gXCJXaWxsSGlkZVwiO1xuICAgICAgICBFbnRpdHlTdGF0dXNbRW50aXR5U3RhdHVzW1wiSGlkZGVuXCJdID0gNV0gPSBcIkhpZGRlblwiO1xuICAgICAgICBFbnRpdHlTdGF0dXNbRW50aXR5U3RhdHVzW1wiV2lsbFJlY3ljbGVcIl0gPSA2XSA9IFwiV2lsbFJlY3ljbGVcIjtcbiAgICAgICAgRW50aXR5U3RhdHVzW0VudGl0eVN0YXR1c1tcIlJlY3ljbGVkXCJdID0gN10gPSBcIlJlY3ljbGVkXCI7XG4gICAgfSkoRW50aXR5U3RhdHVzIHx8IChFbnRpdHlTdGF0dXMgPSB7fSkpOyAvLyBjbGFzcyBFbnRpdHlTdGF0dXNcbiAgICB2YXIgRW50aXR5SW5mbyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gRW50aXR5SW5mbyhlbnRpdHkpIHtcbiAgICAgICAgICAgIHRoaXMubV9wU3RhdHVzID0gRW50aXR5U3RhdHVzLldpbGxJbml0O1xuICAgICAgICAgICAgaWYgKCFlbnRpdHkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbnRpdHkgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHRoaXMubV9wRW50aXR5ID0gZW50aXR5O1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFbnRpdHlJbmZvLnByb3RvdHlwZSwgXCJlbnRpdHlcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcEVudGl0eTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFbnRpdHlJbmZvLnByb3RvdHlwZSwgXCJzdGF0dXNcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFN0YXR1czsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9wU3RhdHVzID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRW50aXR5SW5mby5wcm90b3R5cGUsIFwicGFyZW50RW50aXR5XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BQYXJlbnRFbnRpdHk7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1fcFBhcmVudEVudGl0eSA9IHZhbHVlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgRW50aXR5SW5mby5wcm90b3R5cGUuZ2V0Q2hpbGRFbnRpdGllcyA9IGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cyB8fCBbXTtcbiAgICAgICAgICAgIHJlc3VsdHMuc3BsaWNlKDAsIHJlc3VsdHMubGVuZ3RoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcENoaWxkRW50aXRpZXMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubV9wQ2hpbGRFbnRpdGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy5tX3BDaGlsZEVudGl0aWVzW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5SW5mby5wcm90b3R5cGUuYWRkQ2hpbGRFbnRpdHkgPSBmdW5jdGlvbiAoY2hpbGRFbnRpdHkpIHtcbiAgICAgICAgICAgIHRoaXMubV9wQ2hpbGRFbnRpdGllcyA9IHRoaXMubV9wQ2hpbGRFbnRpdGllcyB8fCBbXTtcbiAgICAgICAgICAgIHZhciBpZHggPSB0aGlzLm1fcENoaWxkRW50aXRpZXMuaW5kZXhPZihjaGlsZEVudGl0eSk7XG4gICAgICAgICAgICBpZiAoLTEgPCBpZHgpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW4gbm90IGFkZCBjaGlsZCBlbnRpdHkgd2hpY2ggaXMgYWxyZWFkeSBleGlzdHMuJyk7XG4gICAgICAgICAgICB0aGlzLm1fcENoaWxkRW50aXRpZXMucHVzaChjaGlsZEVudGl0eSk7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eUluZm8ucHJvdG90eXBlLnJlbW92ZUNoaWxkRW50aXR5ID0gZnVuY3Rpb24gKGNoaWxkRW50aXR5KSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMubV9wQ2hpbGRFbnRpdGllcylcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB2YXIgaWR4ID0gdGhpcy5tX3BDaGlsZEVudGl0aWVzLmluZGV4T2YoY2hpbGRFbnRpdHkpO1xuICAgICAgICAgICAgaWYgKC0xIDwgaWR4KVxuICAgICAgICAgICAgICAgIHRoaXMubV9wQ2hpbGRFbnRpdGllcy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBub3QgcmVtb3ZlIGNoaWxkIGVudGl0eSB3aGljaCBpcyBub3QgZXhpc3QuJyk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBFbnRpdHlJbmZvO1xuICAgIH0oKSk7IC8vIGNsYXNzIEVudGl0eUluZm9cbiAgICB2YXIgRW50aXR5R3JvdXAgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZ1bmN0aW9uIEVudGl0eUdyb3VwKG5hbWUsIGluc3RhbmNlQXV0b1JlbGVhc2VJbnRlcnZhbCwgaW5zdGFuY2VDYXBhY2l0eSwgaW5zdGFuY2VFeHBpcmVUaW1lLCBpbnN0YW5jZVByaW9yaXR5LCBlbnRpdHlHcm91cEhlbHBlciwgb2JqZWN0UG9vbE1hbmFnZXIpIHtcbiAgICAgICAgICAgIHRoaXMubV9wRW50aXRpZXMgPSBuZXcgU2V0KCk7XG4gICAgICAgICAgICBpZiAoIW5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbnRpdHkgZ3JvdXAgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgaWYgKCFlbnRpdHlHcm91cEhlbHBlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VudGl0eSBncm91cCBoZWxwZXIgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHRoaXMubV9zTmFtZSA9IG5hbWU7XG4gICAgICAgICAgICB0aGlzLm1fcEVudGl0eUdyb3VwSGVscGVyID0gZW50aXR5R3JvdXBIZWxwZXI7XG4gICAgICAgICAgICB0aGlzLm1fcEluc3RhbmNlUG9vbCA9IG9iamVjdFBvb2xNYW5hZ2VyLmNyZWF0ZVNpbmdsZVNwYXduT2JqZWN0UG9vbCh7XG4gICAgICAgICAgICAgICAgbmFtZTogXCJFbnRpdHkgSW5zdGFuY2UgUG9vbCAoXCIgKyBuYW1lICsgXCIpXCIsXG4gICAgICAgICAgICAgICAgY2FwYWNpdHk6IGluc3RhbmNlQ2FwYWNpdHksXG4gICAgICAgICAgICAgICAgZXhwaXJlVGltZTogaW5zdGFuY2VFeHBpcmVUaW1lLFxuICAgICAgICAgICAgICAgIHByaW9yaXR5OiBpbnN0YW5jZVByaW9yaXR5XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubV9wRW50aXRpZXMgPSBuZXcgU2V0KCk7XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEVudGl0eUdyb3VwLnByb3RvdHlwZSwgXCJuYW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3NOYW1lOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEVudGl0eUdyb3VwLnByb3RvdHlwZSwgXCJlbnRpdHlDb3VudFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wRW50aXRpZXMuc2l6ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFbnRpdHlHcm91cC5wcm90b3R5cGUsIFwiaW5zdGFuY2VBdXRvUmVsZWFzZUludGVydmFsXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX2ZJbnN0YW5jZUF1dG9SZWxlYXNlSW50ZXJ2YWw7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9mSW5zdGFuY2VBdXRvUmVsZWFzZUludGVydmFsID0gdmFsdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEVudGl0eUdyb3VwLnByb3RvdHlwZSwgXCJpbnN0YW5jZUNhcGFjaXR5XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX2ZJbnN0YW5jZUNhcGFjaXR5OyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fZkluc3RhbmNlQ2FwYWNpdHkgPSB2YWx1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRW50aXR5R3JvdXAucHJvdG90eXBlLCBcImluc3RhbmNlRXhwaXJlVGltZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9mSW5zdGFuY2VFeHBpcmVUaW1lOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fZkluc3RhbmNlRXhwaXJlVGltZSA9IHZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFbnRpdHlHcm91cC5wcm90b3R5cGUsIFwiaW5zdGFuY2VQcmlvcml0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9mSW5zdGFuY2VQcmlvcml0eTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX2ZJbnN0YW5jZVByaW9yaXR5ID0gdmFsdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEVudGl0eUdyb3VwLnByb3RvdHlwZSwgXCJoZWxwZXJcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcEVudGl0eUdyb3VwSGVscGVyOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgRW50aXR5R3JvdXAucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgdmFyIGVfMSwgX2E7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BFbnRpdGllcy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVudGl0eSA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBlbnRpdHkub25VcGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzFfMSkgeyBlXzEgPSB7IGVycm9yOiBlXzFfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5R3JvdXAucHJvdG90eXBlLmhhc0VudGl0eSA9IGZ1bmN0aW9uIChlbnRpdHlJZE9yQXNzZXROYW1lKSB7XG4gICAgICAgICAgICB2YXIgZV8yLCBfYSwgZV8zLCBfYjtcbiAgICAgICAgICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIGVudGl0eUlkT3JBc3NldE5hbWUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYyA9IF9fdmFsdWVzKHRoaXMubV9wRW50aXRpZXMudmFsdWVzKCkpLCBfZCA9IF9jLm5leHQoKTsgIV9kLmRvbmU7IF9kID0gX2MubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZW50aXR5ID0gX2QudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZW50aXR5LmlkID09IGVudGl0eUlkT3JBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVfMl8xKSB7IGVfMiA9IHsgZXJyb3I6IGVfMl8xIH07IH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfZCAmJiAhX2QuZG9uZSAmJiAoX2EgPSBfYy5yZXR1cm4pKSBfYS5jYWxsKF9jKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMikgdGhyb3cgZV8yLmVycm9yOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFlbnRpdHlJZE9yQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VudGl0eSBhc3NldCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2UgPSBfX3ZhbHVlcyh0aGlzLm1fcEVudGl0aWVzLnZhbHVlcygpKSwgX2YgPSBfZS5uZXh0KCk7ICFfZi5kb25lOyBfZiA9IF9lLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVudGl0eSA9IF9mLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVudGl0eS5lbnRpdHlBc3NldE5hbWUgPT0gZW50aXR5SWRPckFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV8zXzEpIHsgZV8zID0geyBlcnJvcjogZV8zXzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9mICYmICFfZi5kb25lICYmIChfYiA9IF9lLnJldHVybikpIF9iLmNhbGwoX2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8zKSB0aHJvdyBlXzMuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eUdyb3VwLnByb3RvdHlwZS5nZXRFbnRpdHkgPSBmdW5jdGlvbiAoZW50aXR5SWRPckFzc2V0TmFtZSkge1xuICAgICAgICAgICAgdmFyIGVfNCwgX2EsIGVfNSwgX2I7XG4gICAgICAgICAgICBpZiAoJ251bWJlcicgPT09IHR5cGVvZiBlbnRpdHlJZE9yQXNzZXROYW1lKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2MgPSBfX3ZhbHVlcyh0aGlzLm1fcEVudGl0aWVzLnZhbHVlcygpKSwgX2QgPSBfYy5uZXh0KCk7ICFfZC5kb25lOyBfZCA9IF9jLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVudGl0eSA9IF9kLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVudGl0eS5pZCA9PSBlbnRpdHlJZE9yQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbnRpdHk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVfNF8xKSB7IGVfNCA9IHsgZXJyb3I6IGVfNF8xIH07IH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfZCAmJiAhX2QuZG9uZSAmJiAoX2EgPSBfYy5yZXR1cm4pKSBfYS5jYWxsKF9jKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNCkgdGhyb3cgZV80LmVycm9yOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFlbnRpdHlJZE9yQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VudGl0eSBhc3NldCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2UgPSBfX3ZhbHVlcyh0aGlzLm1fcEVudGl0aWVzLnZhbHVlcygpKSwgX2YgPSBfZS5uZXh0KCk7ICFfZi5kb25lOyBfZiA9IF9lLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVudGl0eSA9IF9mLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVudGl0eS5lbnRpdHlBc3NldE5hbWUgPT0gZW50aXR5SWRPckFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZW50aXR5O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzVfMSkgeyBlXzUgPSB7IGVycm9yOiBlXzVfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2YgJiYgIV9mLmRvbmUgJiYgKF9iID0gX2UucmV0dXJuKSkgX2IuY2FsbChfZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzUpIHRocm93IGVfNS5lcnJvcjsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlHcm91cC5wcm90b3R5cGUuZ2V0RW50aXRpZXMgPSBmdW5jdGlvbiAoZW50aXR5QXNzZXROYW1lLCByZXN1bHRzKSB7XG4gICAgICAgICAgICB2YXIgZV82LCBfYTtcbiAgICAgICAgICAgIGlmICghZW50aXR5QXNzZXROYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW50aXR5IGFzc2V0IG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzIHx8IFtdO1xuICAgICAgICAgICAgcmVzdWx0cy5zcGxpY2UoMCwgcmVzdWx0cy5sZW5ndGgpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRW50aXRpZXMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbnRpdHkgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVudGl0eS5lbnRpdHlBc3NldE5hbWUgPT0gZW50aXR5QXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGVudGl0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfNl8xKSB7IGVfNiA9IHsgZXJyb3I6IGVfNl8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzYpIHRocm93IGVfNi5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eUdyb3VwLnByb3RvdHlwZS5nZXRBbGxFbnRpdGllcyA9IGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgICAgICB2YXIgZV83LCBfYTtcbiAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzIHx8IFtdO1xuICAgICAgICAgICAgcmVzdWx0cy5zcGxpY2UoMCwgcmVzdWx0cy5sZW5ndGgpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRW50aXRpZXMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbnRpdHkgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGVudGl0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfN18xKSB7IGVfNyA9IHsgZXJyb3I6IGVfN18xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzcpIHRocm93IGVfNy5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eUdyb3VwLnByb3RvdHlwZS5hZGRFbnRpdHkgPSBmdW5jdGlvbiAoZW50aXR5KSB7XG4gICAgICAgICAgICB0aGlzLm1fcEVudGl0aWVzLmFkZChlbnRpdHkpO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlHcm91cC5wcm90b3R5cGUucmVtb3ZlRW50aXR5ID0gZnVuY3Rpb24gKGVudGl0eSkge1xuICAgICAgICAgICAgdGhpcy5tX3BFbnRpdGllcy5kZWxldGUoZW50aXR5KTtcbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5R3JvdXAucHJvdG90eXBlLnJlZ2lzdGVyRW50aXR5SW5zdGFuY2VPYmplY3QgPSBmdW5jdGlvbiAoZW50aXR5SW5zdGFuY2VPYmplY3QsIHNwYXduKSB7XG4gICAgICAgICAgICB0aGlzLm1fcEluc3RhbmNlUG9vbC5yZWdpc3RlcihlbnRpdHlJbnN0YW5jZU9iamVjdCwgc3Bhd24pO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlHcm91cC5wcm90b3R5cGUuc3Bhd25FbnRpdHlJbnN0YW5jZU9iamVjdCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BJbnN0YW5jZVBvb2wuc3Bhd24obmFtZSk7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eUdyb3VwLnByb3RvdHlwZS51bnNwYXduRW50aXR5ID0gZnVuY3Rpb24gKGVudGl0eSkge1xuICAgICAgICAgICAgdGhpcy5tX3BJbnN0YW5jZVBvb2wudW5zcGF3bkJ5VGFyZ2V0KGVudGl0eS5oYW5kbGUpO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlHcm91cC5wcm90b3R5cGUuc2V0RW50aXR5SW5zdGFuY2VMb2NrZWQgPSBmdW5jdGlvbiAoZW50aXR5SW5zdGFuY2UsIGxvY2tlZCkge1xuICAgICAgICAgICAgaWYgKCFlbnRpdHlJbnN0YW5jZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VudGl0eSBpbnN0YW5jZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdGhpcy5tX3BJbnN0YW5jZVBvb2wuc2V0TG9ja2VkQnlUYXJnZXQoZW50aXR5SW5zdGFuY2UsIGxvY2tlZCk7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eUdyb3VwLnByb3RvdHlwZS5zZXRFbnRpdHlJbnN0YW5jZVByaW9yaXR5ID0gZnVuY3Rpb24gKGVudGl0eUluc3RhbmNlLCBwcmlvcml0eSkge1xuICAgICAgICAgICAgaWYgKCFlbnRpdHlJbnN0YW5jZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VudGl0eSBpbnN0YW5jZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdGhpcy5tX3BJbnN0YW5jZVBvb2wuc2V0UHJpb3JpdHlCeVRhcmdldChlbnRpdHlJbnN0YW5jZSwgcHJpb3JpdHkpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gRW50aXR5R3JvdXA7XG4gICAgfSgpKTsgLy8gY2xhc3MgRW50aXR5R3JvdXBcbiAgICAvKipcbiAgICAgKiBFbnRpdHkgbWFuYWdlbWVudCBtb2R1bGUuXG4gICAgICovXG4gICAgdmFyIEVudGl0eU1hbmFnZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhFbnRpdHlNYW5hZ2VyLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBFbnRpdHlNYW5hZ2VyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgICAgICAgICBfdGhpcy5tX3BFbnRpdHlJbmZvcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcEVudGl0eUdyb3VwcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcEVudGl0aWVzQmVpbmdMb2FkZWQgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BFbnRpdGllc1RvUmVsZWFzZU9uTG9hZCA9IG5ldyBTZXQoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcFJlY3ljbGVRdWV1ZSA9IG5ldyBTZXQoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcFNob3dFbnRpdHlTdWNjZXNzRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wU2hvd0VudGl0eUZhaWx1cmVEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BTaG93RW50aXR5VXBkYXRlRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wU2hvd0VudGl0eURlcGVuZGVuY3lBc3NldERlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcEhpZGVFbnRpdHlDb21wbGV0ZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1faVNlcmlhbCA9IDA7XG4gICAgICAgICAgICBfdGhpcy5tX3BMb2FkQXNzZXRDYWxsYmFja3MgPSB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogX3RoaXMubG9hZEVudGl0eVN1Y2Nlc3NDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICBmYWlsdXJlOiBfdGhpcy5sb2FkRW50aXR5RmFpbHVyZUNhbGxiYWNrLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIHVwZGF0ZTogX3RoaXMubG9hZEVudGl0eVVwZGF0ZUNhbGxiYWNrLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIGRlcGVuZGVuY3k6IF90aGlzLmxvYWRFbnRpdHlEZXBlbmRlbmN5QXNzZXRDYWxsYmFjay5iaW5kKF90aGlzKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRW50aXR5TWFuYWdlci5wcm90b3R5cGUsIFwiZW50aXR5Q291bnRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wRW50aXR5SW5mb3Muc2l6ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRW50aXR5TWFuYWdlci5wcm90b3R5cGUsIFwiZW50aXR5R3JvdXBDb3VudFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BFbnRpdHlHcm91cHMuc2l6ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRW50aXR5TWFuYWdlci5wcm90b3R5cGUsIFwic2hvd0VudGl0eVN1Y2Nlc3NcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFNob3dFbnRpdHlTdWNjZXNzRGVsZWdhdGU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRW50aXR5TWFuYWdlci5wcm90b3R5cGUsIFwic2hvd0VudGl0eUZhaWx1cmVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFNob3dFbnRpdHlGYWlsdXJlRGVsZWdhdGU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRW50aXR5TWFuYWdlci5wcm90b3R5cGUsIFwic2hvd0VudGl0eVVwZGF0ZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU2hvd0VudGl0eVVwZGF0ZURlbGVnYXRlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEVudGl0eU1hbmFnZXIucHJvdG90eXBlLCBcInNob3dFbnRpdHlEZXBlbmRlbmN5QXNzZXRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFNob3dFbnRpdHlEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZSwgXCJoaWRlRW50aXR5Q29tcGxldGVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcEhpZGVFbnRpdHlDb21wbGV0ZURlbGVnYXRlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgRW50aXR5TWFuYWdlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICB2YXIgZV84LCBfYSwgZV85LCBfYjtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2MgPSBfX3ZhbHVlcyh0aGlzLm1fcFJlY3ljbGVRdWV1ZS52YWx1ZXMoKSksIF9kID0gX2MubmV4dCgpOyAhX2QuZG9uZTsgX2QgPSBfYy5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZm8gPSBfZC52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZfcEVudGl0eSA9IGluZm8uZW50aXR5O1xuICAgICAgICAgICAgICAgICAgICB2YXIgdl9wRW50aXR5R3JvdXAgPSB2X3BFbnRpdHkuZW50aXR5R3JvdXA7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdl9wRW50aXR5R3JvdXApXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VudGl0eSBncm91cCBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgICAgICAgICBpbmZvLnN0YXR1cyA9IEVudGl0eVN0YXR1cy5XaWxsUmVjeWNsZTtcbiAgICAgICAgICAgICAgICAgICAgdl9wRW50aXR5Lm9uUmVjeWNsZSgpO1xuICAgICAgICAgICAgICAgICAgICBpbmZvLnN0YXR1cyA9IEVudGl0eVN0YXR1cy5SZWN5Y2xlZDtcbiAgICAgICAgICAgICAgICAgICAgdl9wRW50aXR5R3JvdXAudW5zcGF3bkVudGl0eSh2X3BFbnRpdHkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzhfMSkgeyBlXzggPSB7IGVycm9yOiBlXzhfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2QgJiYgIV9kLmRvbmUgJiYgKF9hID0gX2MucmV0dXJuKSkgX2EuY2FsbChfYyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV84KSB0aHJvdyBlXzguZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wUmVjeWNsZVF1ZXVlLmNsZWFyKCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9lID0gX192YWx1ZXModGhpcy5tX3BFbnRpdHlHcm91cHMudmFsdWVzKCkpLCBfZiA9IF9lLm5leHQoKTsgIV9mLmRvbmU7IF9mID0gX2UubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBncm91cCA9IF9mLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBncm91cC51cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzlfMSkgeyBlXzkgPSB7IGVycm9yOiBlXzlfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2YgJiYgIV9mLmRvbmUgJiYgKF9iID0gX2UucmV0dXJuKSkgX2IuY2FsbChfZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV85KSB0aHJvdyBlXzkuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5TWFuYWdlci5wcm90b3R5cGUuc2h1dGRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVBbGxMb2FkZWRFbnRpdGllcygpO1xuICAgICAgICAgICAgdGhpcy5tX3BFbnRpdHlHcm91cHMuY2xlYXIoKTtcbiAgICAgICAgICAgIHRoaXMubV9wRW50aXRpZXNCZWluZ0xvYWRlZC5jbGVhcigpO1xuICAgICAgICAgICAgdGhpcy5tX3BFbnRpdGllc1RvUmVsZWFzZU9uTG9hZC5jbGVhcigpO1xuICAgICAgICAgICAgdGhpcy5tX3BSZWN5Y2xlUXVldWUuY2xlYXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEVudGl0eU1hbmFnZXIucHJvdG90eXBlLCBcInJlc291cmNlTWFuYWdlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlciA9IHZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZSwgXCJvYmplY3RQb29sTWFuYWdlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wT2JqZWN0UG9vbE1hbmFnZXI7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1fcE9iamVjdFBvb2xNYW5hZ2VyID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRW50aXR5TWFuYWdlci5wcm90b3R5cGUsIFwiZW50aXR5SGVscGVyXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BFbnRpdHlIZWxwZXI7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRW50aXR5SGVscGVyID0gdmFsdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgRW50aXR5TWFuYWdlci5wcm90b3R5cGUuaGFzRW50aXR5R3JvdXAgPSBmdW5jdGlvbiAoZW50aXR5R3JvdXBOYW1lKSB7XG4gICAgICAgICAgICBpZiAoIWVudGl0eUdyb3VwTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VudGl0eSBncm91cCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BFbnRpdHlHcm91cHMuaGFzKGVudGl0eUdyb3VwTmFtZSk7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eU1hbmFnZXIucHJvdG90eXBlLmdldEVudGl0eUdyb3VwID0gZnVuY3Rpb24gKGVudGl0eUdyb3VwTmFtZSkge1xuICAgICAgICAgICAgaWYgKCFlbnRpdHlHcm91cE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbnRpdHkgZ3JvdXAgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wRW50aXR5R3JvdXBzLmdldChlbnRpdHlHcm91cE5hbWUpIHx8IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eU1hbmFnZXIucHJvdG90eXBlLmdldEFsbEVudGl0eUdyb3VwcyA9IGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgICAgICB2YXIgZV8xMCwgX2E7XG4gICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cyB8fCBbXTtcbiAgICAgICAgICAgIHJlc3VsdHMuc3BsaWNlKDAsIHJlc3VsdHMubGVuZ3RoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcEVudGl0eUdyb3Vwcy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGdyb3VwID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChncm91cCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMTBfMSkgeyBlXzEwID0geyBlcnJvcjogZV8xMF8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEwKSB0aHJvdyBlXzEwLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5TWFuYWdlci5wcm90b3R5cGUuYWRkRW50aXR5R3JvdXAgPSBmdW5jdGlvbiAoZW50aXR5R3JvdXBOYW1lLCBpbnN0YW5jZUF1dG9SZWxlYXNlSW50ZXJ2YWwsIGluc3RhbmNlQ2FwYWNpdHksIGluc3RhbmNlRXhwaXJlVGltZSwgaW5zdGFuY2VQcmlvcml0eSwgZW50aXR5R3JvdXBIZWxwZXIpIHtcbiAgICAgICAgICAgIGlmICghZW50aXR5R3JvdXBOYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW50aXR5IGdyb3VwIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGlmICghZW50aXR5R3JvdXBIZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbnRpdHkgZ3JvdXAgaGVscGVyIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBpZiAoIXRoaXMubV9wT2JqZWN0UG9vbE1hbmFnZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgbXVzdCBzZXQgb2JqZWN0IHBvb2wgbWFuYWdlciBmaXJzdC4nKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc0VudGl0eUdyb3VwKGVudGl0eUdyb3VwTmFtZSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5tX3BFbnRpdHlHcm91cHMuc2V0KGVudGl0eUdyb3VwTmFtZSwgbmV3IEVudGl0eUdyb3VwKGVudGl0eUdyb3VwTmFtZSwgaW5zdGFuY2VBdXRvUmVsZWFzZUludGVydmFsLCBpbnN0YW5jZUNhcGFjaXR5LCBpbnN0YW5jZUV4cGlyZVRpbWUsIGluc3RhbmNlUHJpb3JpdHksIGVudGl0eUdyb3VwSGVscGVyLCB0aGlzLm1fcE9iamVjdFBvb2xNYW5hZ2VyKSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5TWFuYWdlci5wcm90b3R5cGUuaGFzRW50aXR5ID0gZnVuY3Rpb24gKGVudGl0eUlkT3JBc3NldE5hbWUpIHtcbiAgICAgICAgICAgIHZhciBlXzExLCBfYTtcbiAgICAgICAgICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIGVudGl0eUlkT3JBc3NldE5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BFbnRpdHlJbmZvcy5nZXQoZW50aXR5SWRPckFzc2V0TmFtZSkgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVudGl0eUlkT3JBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW50aXR5IGFzc2V0IG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRW50aXR5SW5mb3MudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5mbyA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZm8uZW50aXR5LmVudGl0eUFzc2V0TmFtZSA9PSBlbnRpdHlJZE9yQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzExXzEpIHsgZV8xMSA9IHsgZXJyb3I6IGVfMTFfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzExKSB0aHJvdyBlXzExLmVycm9yOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZS5nZXRFbnRpdHkgPSBmdW5jdGlvbiAoZW50aXR5SWRPckFzc2V0TmFtZSkge1xuICAgICAgICAgICAgdmFyIGVfMTIsIF9hO1xuICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2YgZW50aXR5SWRPckFzc2V0TmFtZSkge1xuICAgICAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdGhpcy5tX3BFbnRpdHlJbmZvcy5nZXQoZW50aXR5SWRPckFzc2V0TmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKHZfcEluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZfcEluZm8uZW50aXR5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghZW50aXR5SWRPckFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbnRpdHkgYXNzZXQgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BFbnRpdHlJbmZvcy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbmZvID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5mby5lbnRpdHkuZW50aXR5QXNzZXROYW1lID09IGVudGl0eUlkT3JBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGluZm8uZW50aXR5O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzEyXzEpIHsgZV8xMiA9IHsgZXJyb3I6IGVfMTJfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEyKSB0aHJvdyBlXzEyLmVycm9yOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eU1hbmFnZXIucHJvdG90eXBlLmdldEVudGl0aWVzID0gZnVuY3Rpb24gKGVudGl0eUFzc2V0TmFtZSwgcmVzdWx0cykge1xuICAgICAgICAgICAgdmFyIGVfMTMsIF9hO1xuICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMgfHwgW107XG4gICAgICAgICAgICByZXN1bHRzLnNwbGljZSgwLCByZXN1bHRzLmxlbmd0aCk7XG4gICAgICAgICAgICBpZiAoIWVudGl0eUFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VudGl0eSBhc3NldCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BFbnRpdHlJbmZvcy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZm8gPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZm8uZW50aXR5LmVudGl0eUFzc2V0TmFtZSA9PSBlbnRpdHlBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goaW5mby5lbnRpdHkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzEzXzEpIHsgZV8xMyA9IHsgZXJyb3I6IGVfMTNfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xMykgdGhyb3cgZV8xMy5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eU1hbmFnZXIucHJvdG90eXBlLmdldEFsbExvYWRlZEVudGl0aWVzID0gZnVuY3Rpb24gKHJlc3VsdHMpIHtcbiAgICAgICAgICAgIHZhciBlXzE0LCBfYTtcbiAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzIHx8IFtdO1xuICAgICAgICAgICAgcmVzdWx0cy5zcGxpY2UoMCwgcmVzdWx0cy5sZW5ndGgpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRW50aXR5SW5mb3MudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmZvID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChpbmZvLmVudGl0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMTRfMSkgeyBlXzE0ID0geyBlcnJvcjogZV8xNF8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzE0KSB0aHJvdyBlXzE0LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5TWFuYWdlci5wcm90b3R5cGUuZ2V0QWxsTG9hZGluZ0VudGl0eUlkcyA9IGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgICAgICB2YXIgZV8xNSwgX2E7XG4gICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cyB8fCBbXTtcbiAgICAgICAgICAgIHJlc3VsdHMuc3BsaWNlKDAsIHJlc3VsdHMubGVuZ3RoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcEVudGl0aWVzQmVpbmdMb2FkZWQua2V5cygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzE1XzEpIHsgZV8xNSA9IHsgZXJyb3I6IGVfMTVfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xNSkgdGhyb3cgZV8xNS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eU1hbmFnZXIucHJvdG90eXBlLmlzTG9hZGluZ0VudGl0eSA9IGZ1bmN0aW9uIChlbnRpdHlJZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wRW50aXRpZXNCZWluZ0xvYWRlZC5oYXMoZW50aXR5SWQpO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZS5pc1ZhbGlkRW50aXR5ID0gZnVuY3Rpb24gKGVudGl0eSkge1xuICAgICAgICAgICAgaWYgKCFlbnRpdHkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFzRW50aXR5KGVudGl0eS5pZCk7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eU1hbmFnZXIucHJvdG90eXBlLnNob3dFbnRpdHkgPSBmdW5jdGlvbiAoZW50aXR5SWQsIGVudGl0eUFzc2V0TmFtZSwgZW50aXR5R3JvdXBOYW1lLCBhbnlBcmcxLCBhbnlBcmcyKSB7XG4gICAgICAgICAgICB2YXIgcHJpb3JpdHkgPSAwO1xuICAgICAgICAgICAgdmFyIHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2YgYW55QXJnMSkge1xuICAgICAgICAgICAgICAgIHByaW9yaXR5ID0gYW55QXJnMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHVuZGVmaW5lZCAhPSBhbnlBcmcxICYmIHVuZGVmaW5lZCA9PSBhbnlBcmcyKSB7XG4gICAgICAgICAgICAgICAgdXNlckRhdGEgPSBhbnlBcmcxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHVuZGVmaW5lZCAhPSBhbnlBcmcyKVxuICAgICAgICAgICAgICAgIHVzZXJEYXRhID0gYW55QXJnMjtcbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgbXVzdCBzZXQgcmVzb3VyY2UgbWFuYWdlciBmaXJzdC4nKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BFbnRpdHlIZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgbXVzdCBzZXQgZW50aXR5IGhlbHBlciBmaXJzdC4nKTtcbiAgICAgICAgICAgIGlmICghZW50aXR5QXNzZXROYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW50aXR5IGFzc2V0IG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGlmICghZW50aXR5R3JvdXBOYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW50aXR5IGdyb3VwIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcEVudGl0eUluZm9zLmhhcyhlbnRpdHlJZCkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW50aXR5IGlkICdcIiArIGVudGl0eUlkICsgXCInIGlzIGFscmVhZHkgZXhpc3RzLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzTG9hZGluZ0VudGl0eShlbnRpdHlJZCkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW50aXR5ICdcIiArIGVudGl0eUlkICsgXCInIGlzIGFscmVhZHkgYmVpbmcgbG9hZGVkLlwiKTtcbiAgICAgICAgICAgIHZhciB2X3BFbnRpdHlHcm91cCA9IHRoaXMuZ2V0RW50aXR5R3JvdXAoZW50aXR5R3JvdXBOYW1lKTtcbiAgICAgICAgICAgIGlmICghdl9wRW50aXR5R3JvdXApXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW50aXR5IGdyb3VwICdcIiArIGVudGl0eUdyb3VwTmFtZSArIFwiJyBpcyBub3QgZXhpc3QuXCIpO1xuICAgICAgICAgICAgdmFyIHZfcEVudGl0eUluc3RhbmNlT2JqZWN0ID0gdl9wRW50aXR5R3JvdXAuc3Bhd25FbnRpdHlJbnN0YW5jZU9iamVjdChlbnRpdHlBc3NldE5hbWUpO1xuICAgICAgICAgICAgLy8gaWYgKHRoaXMubV9wSW5zdGFuY2VQb29sLmhhcyhlbnRpdHlBc3NldE5hbWUpKSB7XG4gICAgICAgICAgICAvLyAgICAgbGV0IHZfcEluc3RhbmNlT2JqZWN0czogRW50aXR5SW5zdGFuY2VPYmplY3RbXSB8IHVuZGVmaW5lZCA9IHRoaXMubV9wSW5zdGFuY2VQb29sLmdldChlbnRpdHlBc3NldE5hbWUpO1xuICAgICAgICAgICAgLy8gICAgIGlmICh2X3BJbnN0YW5jZU9iamVjdHMgJiYgdl9wSW5zdGFuY2VPYmplY3RzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgZm9yIChjb25zdCBpbnN0YW5jZU9iamVjdCBvZiB2X3BJbnN0YW5jZU9iamVjdHMpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgIGlmIChpbnN0YW5jZU9iamVjdC5pc1ZhbGlkICYmICFpbnN0YW5jZU9iamVjdC5zcGF3bikge1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgIHZfcEVudGl0eUluc3RhbmNlT2JqZWN0ID0gaW5zdGFuY2VPYmplY3Q7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgaW5zdGFuY2VPYmplY3Quc3Bhd24gPSB0cnVlO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gICAgICAgICB9XG4gICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgaWYgKCF2X3BFbnRpdHlJbnN0YW5jZU9iamVjdCkge1xuICAgICAgICAgICAgICAgIHZhciB2X2lTZXJpYWxJZCA9IHRoaXMubV9pU2VyaWFsKys7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BFbnRpdGllc0JlaW5nTG9hZGVkLnNldChlbnRpdHlJZCwgdl9pU2VyaWFsSWQpO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyLmxvYWRBc3NldChlbnRpdHlBc3NldE5hbWUsIHByaW9yaXR5LCB0aGlzLm1fcExvYWRBc3NldENhbGxiYWNrcywge1xuICAgICAgICAgICAgICAgICAgICBzZXJpYWxJZDogdl9pU2VyaWFsSWQsXG4gICAgICAgICAgICAgICAgICAgIGVudGl0eUlkOiBlbnRpdHlJZCxcbiAgICAgICAgICAgICAgICAgICAgZW50aXR5R3JvdXA6IHZfcEVudGl0eUdyb3VwLFxuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YTogdXNlckRhdGFcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmludGVybmFsU2hvd0VudGl0eShlbnRpdHlJZCwgZW50aXR5QXNzZXROYW1lLCB2X3BFbnRpdHlHcm91cCwgdl9wRW50aXR5SW5zdGFuY2VPYmplY3QudGFyZ2V0LCBmYWxzZSwgMCwgdXNlckRhdGEpO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZS5oaWRlRW50aXR5ID0gZnVuY3Rpb24gKGFueUFyZzEsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB1c2VyRGF0YSA9IHVzZXJEYXRhIHx8IG51bGw7XG4gICAgICAgICAgICB2YXIgZW50aXR5SWQ7XG4gICAgICAgICAgICBpZiAoJ251bWJlcicgPT09IHR5cGVvZiBhbnlBcmcxKSB7XG4gICAgICAgICAgICAgICAgZW50aXR5SWQgPSBhbnlBcmcxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFhbnlBcmcxKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VudGl0eSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgICAgIGVudGl0eUlkID0gYW55QXJnMS5pZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmlzTG9hZGluZ0VudGl0eShlbnRpdHlJZCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubV9wRW50aXRpZXNCZWluZ0xvYWRlZC5oYXMoZW50aXR5SWQpKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGZpbmQgZW50aXR5ICdcIiArIGVudGl0eUlkICsgXCInXCIpO1xuICAgICAgICAgICAgICAgIHZhciB2X2lTZXJpYWxJZCA9IHRoaXMubV9wRW50aXRpZXNCZWluZ0xvYWRlZC5nZXQoZW50aXR5SWQpIHx8IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BFbnRpdGllc1RvUmVsZWFzZU9uTG9hZC5hZGQodl9pU2VyaWFsSWQpO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRW50aXRpZXNCZWluZ0xvYWRlZC5kZWxldGUoZW50aXR5SWQpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdGhpcy5nZXRFbnRpdHlJbmZvKGVudGl0eUlkKTtcbiAgICAgICAgICAgIGlmICghdl9wSW5mbykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgZmluZCBlbnRpdHkgaW5mbyAnXCIgKyBlbnRpdHlJZCArIFwiJ1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxIaWRlRW50aXR5KHZfcEluZm8sIHVzZXJEYXRhKTtcbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5TWFuYWdlci5wcm90b3R5cGUuaGlkZUFsbExvYWRlZEVudGl0aWVzID0gZnVuY3Rpb24gKHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgZV8xNiwgX2E7XG4gICAgICAgICAgICB1c2VyRGF0YSA9IHVzZXJEYXRhIHx8IG51bGw7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BFbnRpdHlJbmZvcy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZm8gPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnRlcm5hbEhpZGVFbnRpdHkoaW5mbywgdXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzE2XzEpIHsgZV8xNiA9IHsgZXJyb3I6IGVfMTZfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xNikgdGhyb3cgZV8xNi5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZS5oaWRlQWxsTG9hZGluZ0VudGl0aWVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfMTcsIF9hO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRW50aXRpZXNCZWluZ0xvYWRlZC52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlcmlhbElkID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wRW50aXRpZXNUb1JlbGVhc2VPbkxvYWQuYWRkKHNlcmlhbElkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xN18xKSB7IGVfMTcgPSB7IGVycm9yOiBlXzE3XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMTcpIHRocm93IGVfMTcuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wRW50aXRpZXNCZWluZ0xvYWRlZC5jbGVhcigpO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZS5nZXRQYXJlbnRFbnRpdHkgPSBmdW5jdGlvbiAoYW55QXJnMSkge1xuICAgICAgICAgICAgdmFyIHZfaUNoaWxkRW50aXR5SWQ7XG4gICAgICAgICAgICBpZiAoJ251bWJlcicgPT09IHR5cGVvZiBhbnlBcmcxKSB7XG4gICAgICAgICAgICAgICAgdl9pQ2hpbGRFbnRpdHlJZCA9IGFueUFyZzE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIWFueUFyZzEpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2hpbGQgZW50aXR5IGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICAgICAgdl9pQ2hpbGRFbnRpdHlJZCA9IGFueUFyZzEuaWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdl9wQ2hpbGRFbnRpdHlJbmZvID0gdGhpcy5nZXRFbnRpdHlJbmZvKHZfaUNoaWxkRW50aXR5SWQpO1xuICAgICAgICAgICAgaWYgKCF2X3BDaGlsZEVudGl0eUluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuIG5vdCBmaW5kIGNoaWxkIGVudGl0eSAnXCIgKyB2X2lDaGlsZEVudGl0eUlkICsgXCInXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHZfcENoaWxkRW50aXR5SW5mby5wYXJlbnRFbnRpdHk7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eU1hbmFnZXIucHJvdG90eXBlLmdldENoaWxkRW50aXRpZXMgPSBmdW5jdGlvbiAocGFyZW50RW50aXR5SWQsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzIHx8IFtdO1xuICAgICAgICAgICAgcmVzdWx0cy5zcGxpY2UoMCwgcmVzdWx0cy5sZW5ndGgpO1xuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB0aGlzLmdldEVudGl0eUluZm8ocGFyZW50RW50aXR5SWQpO1xuICAgICAgICAgICAgaWYgKCF2X3BJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgZmluZCBwYXJlbnQgZW50aXR5ICdcIiArIHBhcmVudEVudGl0eUlkICsgXCInXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHZfcEluZm8uZ2V0Q2hpbGRFbnRpdGllcyhyZXN1bHRzKTtcbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5TWFuYWdlci5wcm90b3R5cGUuYXR0YWNoRW50aXR5ID0gZnVuY3Rpb24gKGNoaWxkRW50aXR5T3JJZCwgcGFyZW50RW50aXR5T3JJZCwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHVzZXJEYXRhID0gdXNlckRhdGEgfHwgbnVsbDtcbiAgICAgICAgICAgIHZhciBjaGlsZEVudGl0eUlkO1xuICAgICAgICAgICAgdmFyIHBhcmVudEVudGl0eUlkO1xuICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2YgY2hpbGRFbnRpdHlPcklkKSB7XG4gICAgICAgICAgICAgICAgY2hpbGRFbnRpdHlJZCA9IGNoaWxkRW50aXR5T3JJZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghY2hpbGRFbnRpdHlPcklkKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NoaWxkIGVudGl0eSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgICAgIGNoaWxkRW50aXR5SWQgPSBjaGlsZEVudGl0eU9ySWQuaWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoJ251bWJlcicgPT09IHR5cGVvZiBwYXJlbnRFbnRpdHlPcklkKSB7XG4gICAgICAgICAgICAgICAgcGFyZW50RW50aXR5SWQgPSBwYXJlbnRFbnRpdHlPcklkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJlbnRFbnRpdHlPcklkKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhcmVudCBlbnRpdHkgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgICAgICBwYXJlbnRFbnRpdHlJZCA9IHBhcmVudEVudGl0eU9ySWQuaWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY2hpbGRFbnRpdHlJZCA9PSBwYXJlbnRFbnRpdHlJZClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGF0dGFjaCBlbnRpdHkgd2hlbiBjaGlsZCBlbnRpdHkgaWQgZXF1YWxzIHRvIHBhcmVudCBlbnRpdHkgaWQgJ1wiICsgcGFyZW50RW50aXR5SWQgKyBcIidcIik7XG4gICAgICAgICAgICB2YXIgdl9wQ2hpbGRFbnRpdHlJbmZvID0gdGhpcy5nZXRFbnRpdHlJbmZvKGNoaWxkRW50aXR5SWQpO1xuICAgICAgICAgICAgaWYgKCF2X3BDaGlsZEVudGl0eUluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuIG5vdCBmaW5kIGNoaWxkIGVudGl0eSAnXCIgKyBjaGlsZEVudGl0eUlkICsgXCInXCIpO1xuICAgICAgICAgICAgaWYgKHZfcENoaWxkRW50aXR5SW5mby5zdGF0dXMgPj0gRW50aXR5U3RhdHVzLldpbGxIaWRlKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgYXR0YWNoIGVudGl0eSB3aGVuIGNoaWxkIGVudGl0eSBzdGF0dXMgaXMgJ1wiICsgdl9wQ2hpbGRFbnRpdHlJbmZvLnN0YXR1cyArIFwiJ1wiKTtcbiAgICAgICAgICAgIHZhciB2X3BQYXJlbnRFbnRpdHlJbmZvID0gdGhpcy5nZXRFbnRpdHlJbmZvKHBhcmVudEVudGl0eUlkKTtcbiAgICAgICAgICAgIGlmICghdl9wUGFyZW50RW50aXR5SW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGZpbmQgcGFyZW50IGVudGl0eSAnXCIgKyBwYXJlbnRFbnRpdHlJZCArIFwiJ1wiKTtcbiAgICAgICAgICAgIGlmICh2X3BQYXJlbnRFbnRpdHlJbmZvLnN0YXR1cyA+PSBFbnRpdHlTdGF0dXMuV2lsbEhpZGUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuIG5vdCBhdHRjaCBlbnRpdHkgd2hlbiBwYXJlbnQgZW50aXR5IHN0YXR1cyBpcyAnXCIgKyB2X3BQYXJlbnRFbnRpdHlJbmZvLnN0YXR1cyArIFwiJ1wiKTtcbiAgICAgICAgICAgIHZhciB2X3BDaGlsZEVudGl0eSA9IHZfcENoaWxkRW50aXR5SW5mby5lbnRpdHk7XG4gICAgICAgICAgICB2YXIgdl9wUGFyZW50RW50aXR5ID0gdl9wUGFyZW50RW50aXR5SW5mby5lbnRpdHk7XG4gICAgICAgICAgICB0aGlzLmRldGFjaEVudGl0eSh2X3BDaGlsZEVudGl0eS5pZCwgdXNlckRhdGEpO1xuICAgICAgICAgICAgdl9wQ2hpbGRFbnRpdHlJbmZvLnBhcmVudEVudGl0eSA9IHZfcFBhcmVudEVudGl0eTtcbiAgICAgICAgICAgIHZfcFBhcmVudEVudGl0eUluZm8uYWRkQ2hpbGRFbnRpdHkodl9wQ2hpbGRFbnRpdHkpO1xuICAgICAgICAgICAgdl9wUGFyZW50RW50aXR5Lm9uQXR0YWNoZWQodl9wQ2hpbGRFbnRpdHksIHVzZXJEYXRhKTtcbiAgICAgICAgICAgIHZfcENoaWxkRW50aXR5Lm9uQXR0YWNoVG8odl9wUGFyZW50RW50aXR5LCB1c2VyRGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eU1hbmFnZXIucHJvdG90eXBlLmRldGFjaEVudGl0eSA9IGZ1bmN0aW9uIChjaGlsZEVudGl0eU9ySWQsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB1c2VyRGF0YSA9IHVzZXJEYXRhIHx8IG51bGw7XG4gICAgICAgICAgICB2YXIgY2hpbGRFbnRpdHlJZDtcbiAgICAgICAgICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIGNoaWxkRW50aXR5T3JJZCkge1xuICAgICAgICAgICAgICAgIGNoaWxkRW50aXR5SWQgPSBjaGlsZEVudGl0eU9ySWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNoaWxkRW50aXR5T3JJZClcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDaGlsZCBlbnRpdHkgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgICAgICBjaGlsZEVudGl0eUlkID0gY2hpbGRFbnRpdHlPcklkLmlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZfcENoaWxkRW50aXR5SW5mbyA9IHRoaXMuZ2V0RW50aXR5SW5mbyhjaGlsZEVudGl0eUlkKTtcbiAgICAgICAgICAgIGlmICghdl9wQ2hpbGRFbnRpdHlJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgZmluZCBjaGlsZCBlbnRpdHkgJ1wiICsgY2hpbGRFbnRpdHlJZCArIFwiJ1wiKTtcbiAgICAgICAgICAgIHZhciB2X3BQYXJlbnRFbnRpdHkgPSB2X3BDaGlsZEVudGl0eUluZm8ucGFyZW50RW50aXR5O1xuICAgICAgICAgICAgaWYgKCF2X3BQYXJlbnRFbnRpdHkpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHZfcFBhcmVudEVudGl0eUluZm8gPSB0aGlzLmdldEVudGl0eUluZm8odl9wUGFyZW50RW50aXR5LmlkKTtcbiAgICAgICAgICAgIGlmICghdl9wUGFyZW50RW50aXR5SW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGZpbmQgcGFyZW50IGVudGl0eSAnXCIgKyB2X3BQYXJlbnRFbnRpdHkuaWQgKyBcIidcIik7XG4gICAgICAgICAgICB2YXIgdl9wQ2hpbGRFbnRpdHkgPSB2X3BDaGlsZEVudGl0eUluZm8uZW50aXR5O1xuICAgICAgICAgICAgdl9wQ2hpbGRFbnRpdHlJbmZvLnBhcmVudEVudGl0eSA9IG51bGw7XG4gICAgICAgICAgICB2X3BQYXJlbnRFbnRpdHlJbmZvLnJlbW92ZUNoaWxkRW50aXR5KHZfcENoaWxkRW50aXR5KTtcbiAgICAgICAgICAgIHZfcFBhcmVudEVudGl0eS5vbkRldGFjaGVkKHZfcENoaWxkRW50aXR5LCB1c2VyRGF0YSk7XG4gICAgICAgICAgICB2X3BDaGlsZEVudGl0eS5vbkRldGFjaEZyb20odl9wUGFyZW50RW50aXR5LCB1c2VyRGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eU1hbmFnZXIucHJvdG90eXBlLmRldGFjaENoaWxkRW50aXRpZXMgPSBmdW5jdGlvbiAocGFyZW50RW50aXR5T3JJZCwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgdl9wVXNlckRhdGEgPSB1c2VyRGF0YSB8fCBudWxsO1xuICAgICAgICAgICAgdmFyIHBhcmVudEVudGl0eUlkO1xuICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2YgcGFyZW50RW50aXR5T3JJZCkge1xuICAgICAgICAgICAgICAgIHBhcmVudEVudGl0eUlkID0gcGFyZW50RW50aXR5T3JJZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghcGFyZW50RW50aXR5T3JJZClcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYXJlbnQgZW50aXR5IGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICAgICAgcGFyZW50RW50aXR5SWQgPSBwYXJlbnRFbnRpdHlPcklkLmlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZfcFBhcmVudEVudGl0eUluZm8gPSB0aGlzLmdldEVudGl0eUluZm8ocGFyZW50RW50aXR5SWQpO1xuICAgICAgICAgICAgaWYgKCF2X3BQYXJlbnRFbnRpdHlJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgZmluZCBwYXJlbnQgZW50aXR5ICdcIiArIHBhcmVudEVudGl0eUlkICsgXCInXCIpO1xuICAgICAgICAgICAgdmFyIHZfcENoaWxkRW50aXRpZXMgPSB2X3BQYXJlbnRFbnRpdHlJbmZvLmdldENoaWxkRW50aXRpZXMoKTtcbiAgICAgICAgICAgIHZfcENoaWxkRW50aXRpZXMuZm9yRWFjaChmdW5jdGlvbiAoZW50aXR5KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuZGV0YWNoRW50aXR5KGVudGl0eS5pZCwgdl9wVXNlckRhdGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIEVudGl0eU1hbmFnZXIucHJvdG90eXBlLmdldEVudGl0eUluZm8gPSBmdW5jdGlvbiAoZW50aXR5SWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcEVudGl0eUluZm9zLmdldChlbnRpdHlJZCkgfHwgbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5TWFuYWdlci5wcm90b3R5cGUuaW50ZXJuYWxTaG93RW50aXR5ID0gZnVuY3Rpb24gKGVudGl0eUlkLCBlbnRpdHlBc3NldE5hbWUsIGVudGl0eUdyb3VwLCBlbnRpdHlJbnN0YW5jZSwgaXNOZXdJbnN0YW5jZSwgZHVyYXRpb24sIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHZhciB2X3BFbnRpdHlfMSA9IHRoaXMubV9wRW50aXR5SGVscGVyLmNyZWF0ZUVudGl0eShlbnRpdHlJbnN0YW5jZSwgZW50aXR5R3JvdXAsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICBpZiAoIXZfcEVudGl0eV8xKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBub3QgY3JlYXRlIGVudGl0eSBpbiBoZWxwZXIuJyk7XG4gICAgICAgICAgICAgICAgdmFyIHZfcEVudGl0eUluZm8gPSBuZXcgRW50aXR5SW5mbyh2X3BFbnRpdHlfMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BFbnRpdHlJbmZvcy5zZXQoZW50aXR5SWQsIHZfcEVudGl0eUluZm8pO1xuICAgICAgICAgICAgICAgIHZfcEVudGl0eUluZm8uc3RhdHVzID0gRW50aXR5U3RhdHVzLldpbGxJbml0O1xuICAgICAgICAgICAgICAgIHZfcEVudGl0eV8xLm9uSW5pdChlbnRpdHlJZCwgZW50aXR5QXNzZXROYW1lLCBlbnRpdHlHcm91cCwgaXNOZXdJbnN0YW5jZSwgdXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIHZfcEVudGl0eUluZm8uc3RhdHVzID0gRW50aXR5U3RhdHVzLkluaXRlZDtcbiAgICAgICAgICAgICAgICBlbnRpdHlHcm91cC5hZGRFbnRpdHkodl9wRW50aXR5XzEpO1xuICAgICAgICAgICAgICAgIHZfcEVudGl0eUluZm8uc3RhdHVzID0gRW50aXR5U3RhdHVzLldpbGxTaG93O1xuICAgICAgICAgICAgICAgIHZfcEVudGl0eV8xLm9uU2hvdyh1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgdl9wRW50aXR5SW5mby5zdGF0dXMgPSBFbnRpdHlTdGF0dXMuU2hvd2VkO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fcFNob3dFbnRpdHlTdWNjZXNzRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcFNob3dFbnRpdHlTdWNjZXNzRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbih2X3BFbnRpdHlfMSwgZHVyYXRpb24sIHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIEVycm9yICYmIHRoaXMubV9wU2hvd0VudGl0eUZhaWx1cmVEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wU2hvd0VudGl0eUZhaWx1cmVEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGVudGl0eUlkLCBlbnRpdHlBc3NldE5hbWUsIGVudGl0eUdyb3VwLm5hbWUsIGUubWVzc2FnZSwgdXNlckRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZS5pbnRlcm5hbEhpZGVFbnRpdHkgPSBmdW5jdGlvbiAoZW50aXR5SW5mbywgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgdl9wRW50aXR5ID0gZW50aXR5SW5mby5lbnRpdHk7XG4gICAgICAgICAgICB2YXIgdl9wQ2hpbGRFbnRpdGllcyA9IGVudGl0eUluZm8uZ2V0Q2hpbGRFbnRpdGllcygpO1xuICAgICAgICAgICAgdl9wQ2hpbGRFbnRpdGllcy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIF90aGlzLmhpZGVFbnRpdHkodmFsdWUsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGVudGl0eUluZm8uc3RhdHVzID09IEVudGl0eVN0YXR1cy5IaWRkZW4gfHwgZW50aXR5SW5mby5zdGF0dXMgPT0gRW50aXR5U3RhdHVzLldpbGxIaWRlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kZXRhY2hFbnRpdHkodl9wRW50aXR5LmlkLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICBlbnRpdHlJbmZvLnN0YXR1cyA9IEVudGl0eVN0YXR1cy5XaWxsSGlkZTtcbiAgICAgICAgICAgIHZfcEVudGl0eS5vbkhpZGUodXNlckRhdGEpO1xuICAgICAgICAgICAgZW50aXR5SW5mby5zdGF0dXMgPSBFbnRpdHlTdGF0dXMuSGlkZGVuO1xuICAgICAgICAgICAgdmFyIHZfcEVudGl0eUdyb3VwID0gdl9wRW50aXR5LmVudGl0eUdyb3VwO1xuICAgICAgICAgICAgaWYgKCF2X3BFbnRpdHlHcm91cClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VudGl0eSBncm91cCBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdl9wRW50aXR5R3JvdXAucmVtb3ZlRW50aXR5KHZfcEVudGl0eSk7XG4gICAgICAgICAgICB2YXIgdl9iVmFsaWRJbmZvID0gdGhpcy5tX3BFbnRpdHlJbmZvcy5oYXModl9wRW50aXR5LmlkKTtcbiAgICAgICAgICAgIHRoaXMubV9wRW50aXR5SW5mb3MuZGVsZXRlKHZfcEVudGl0eS5pZCk7XG4gICAgICAgICAgICBpZiAoIXZfYlZhbGlkSW5mbykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVudGl0eSBpbmZvIGlkICdcIiArIHZfcEVudGl0eS5pZCArIFwiJyBpcyB1bm1hbmFnZWQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubV9wSGlkZUVudGl0eUNvbXBsZXRlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wSGlkZUVudGl0eUNvbXBsZXRlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHZfcEVudGl0eS5pZCwgdl9wRW50aXR5LmVudGl0eUFzc2V0TmFtZSwgdl9wRW50aXR5R3JvdXAsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wUmVjeWNsZVF1ZXVlLmFkZChlbnRpdHlJbmZvKTtcbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5TWFuYWdlci5wcm90b3R5cGUubG9hZEVudGl0eVN1Y2Nlc3NDYWxsYmFjayA9IGZ1bmN0aW9uIChlbnRpdHlBc3NldE5hbWUsIGVudGl0eUFzc2V0LCBkdXJhdGlvbiwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BTaG93RW50aXR5SW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKCF2X3BTaG93RW50aXR5SW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Nob3cgZW50aXR5IGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB0aGlzLm1fcEVudGl0aWVzQmVpbmdMb2FkZWQuZGVsZXRlKHZfcFNob3dFbnRpdHlJbmZvLmVudGl0eUlkKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcEVudGl0aWVzVG9SZWxlYXNlT25Mb2FkLmhhcyh2X3BTaG93RW50aXR5SW5mby5zZXJpYWxJZCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29uc29sZSlcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZWxlYXNlIGVudGl0eSAnXCIgKyB2X3BTaG93RW50aXR5SW5mby5lbnRpdHlJZCArIFwiJyAoc2VyaWFsIGlkICdcIiArIHZfcFNob3dFbnRpdHlJbmZvLnNlcmlhbElkICsgXCInKSBvbiBsb2FkaW5nIHN1Y2Nlc3MuXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRW50aXRpZXNUb1JlbGVhc2VPbkxvYWQuZGVsZXRlKHZfcFNob3dFbnRpdHlJbmZvLnNlcmlhbElkKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEVudGl0eUhlbHBlci5yZWxlYXNlRW50aXR5KGVudGl0eUFzc2V0LCBudWxsKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdl9wRW50aXR5SW5zdGFuY2VPYmplY3QgPSBFbnRpdHlJbnN0YW5jZU9iamVjdC5jcmVhdGUoZW50aXR5QXNzZXROYW1lLCBlbnRpdHlBc3NldCwgdGhpcy5tX3BFbnRpdHlIZWxwZXIuaW5zdGFudGlhdGVFbnRpdHkoZW50aXR5QXNzZXQpLCB0aGlzLm1fcEVudGl0eUhlbHBlcik7XG4gICAgICAgICAgICB2X3BTaG93RW50aXR5SW5mby5lbnRpdHlHcm91cC5yZWdpc3RlckVudGl0eUluc3RhbmNlT2JqZWN0KHZfcEVudGl0eUluc3RhbmNlT2JqZWN0LCB0cnVlKTtcbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIHRvIHBvb2wgYW5kIG1hcmsgc3Bhd25cbiAgICAgICAgICAgIC8vIGlmICghdGhpcy5tX3BJbnN0YW5jZVBvb2wuaGFzKGVudGl0eUFzc2V0TmFtZSkpXG4gICAgICAgICAgICAvLyAgICAgdGhpcy5tX3BJbnN0YW5jZVBvb2wuc2V0KGVudGl0eUFzc2V0TmFtZSwgW10pO1xuICAgICAgICAgICAgLy8gbGV0IHZfcEVudGl0eUluc3RhbmNlT2JqZWN0czogRW50aXR5SW5zdGFuY2VPYmplY3RbXSB8IHVuZGVmaW5lZCA9IHRoaXMubV9wSW5zdGFuY2VQb29sLmdldChlbnRpdHlBc3NldE5hbWUpO1xuICAgICAgICAgICAgLy8gaWYgKHZfcEVudGl0eUluc3RhbmNlT2JqZWN0cyAvKiYmIHZfcEVudGl0eUluc3RhbmNlT2JqZWN0cy5sZW5ndGggPCB2X3BTaG93RW50aXR5SW5mby5lbnRpdHlHcm91cC5pbnN0YW5jZUNhcGFjaXR5Ki8pIHtcbiAgICAgICAgICAgIC8vICAgICB2X3BFbnRpdHlJbnN0YW5jZU9iamVjdHMucHVzaCh2X3BFbnRpdHlJbnN0YW5jZU9iamVjdCk7XG4gICAgICAgICAgICAvLyAgICAgdl9wRW50aXR5SW5zdGFuY2VPYmplY3Quc3Bhd24gPSB0cnVlO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbFNob3dFbnRpdHkodl9wU2hvd0VudGl0eUluZm8uZW50aXR5SWQsIGVudGl0eUFzc2V0TmFtZSwgdl9wU2hvd0VudGl0eUluZm8uZW50aXR5R3JvdXAsIHZfcEVudGl0eUluc3RhbmNlT2JqZWN0LnRhcmdldCwgdHJ1ZSwgZHVyYXRpb24sIHZfcFNob3dFbnRpdHlJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgfTtcbiAgICAgICAgRW50aXR5TWFuYWdlci5wcm90b3R5cGUubG9hZEVudGl0eUZhaWx1cmVDYWxsYmFjayA9IGZ1bmN0aW9uIChlbnRpdHlBc3NldE5hbWUsIHN0YXR1cywgZXJyb3JNZXNzYWdlLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfcFNob3dFbnRpdHlJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAoIXZfcFNob3dFbnRpdHlJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU2hvdyBlbnRpdHkgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHRoaXMubV9wRW50aXRpZXNCZWluZ0xvYWRlZC5kZWxldGUodl9wU2hvd0VudGl0eUluZm8uZW50aXR5SWQpO1xuICAgICAgICAgICAgdGhpcy5tX3BFbnRpdGllc1RvUmVsZWFzZU9uTG9hZC5kZWxldGUodl9wU2hvd0VudGl0eUluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgdmFyIHZfcEFwcGVuZEVycm9yTWVzc2FnZSA9IFwiTG9hZCBlbnRpdHkgZmFpbHVyZSwgYXNzZXQgbmFtZSAnXCIgKyBlbnRpdHlBc3NldE5hbWUgKyBcIicsIHN0YXR1cyAnXCIgKyBzdGF0dXMgKyBcIicsIGVycm9yIG1lc3NhZ2UgJ1wiICsgZXJyb3JNZXNzYWdlICsgXCInXCI7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BTaG93RW50aXR5RmFpbHVyZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFNob3dFbnRpdHlGYWlsdXJlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHZfcFNob3dFbnRpdHlJbmZvLmVudGl0eUlkLCBlbnRpdHlBc3NldE5hbWUsIHZfcFNob3dFbnRpdHlJbmZvLmVudGl0eUdyb3VwLm5hbWUsIHZfcEFwcGVuZEVycm9yTWVzc2FnZSwgdl9wU2hvd0VudGl0eUluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih2X3BBcHBlbmRFcnJvck1lc3NhZ2UpO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZS5sb2FkRW50aXR5VXBkYXRlQ2FsbGJhY2sgPSBmdW5jdGlvbiAoZW50aXR5QXNzZXROYW1lLCBwcm9ncmVzcywgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BTaG93RW50aXR5SW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKCF2X3BTaG93RW50aXR5SW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Nob3cgZW50aXR5IGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BTaG93RW50aXR5VXBkYXRlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wU2hvd0VudGl0eVVwZGF0ZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbih2X3BTaG93RW50aXR5SW5mby5lbnRpdHlJZCwgZW50aXR5QXNzZXROYW1lLCB2X3BTaG93RW50aXR5SW5mby5lbnRpdHlHcm91cC5uYW1lLCBwcm9ncmVzcywgdl9wU2hvd0VudGl0eUluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlNYW5hZ2VyLnByb3RvdHlwZS5sb2FkRW50aXR5RGVwZW5kZW5jeUFzc2V0Q2FsbGJhY2sgPSBmdW5jdGlvbiAoZW50aXR5QXNzZXROYW1lLCBkZXBlbmRlbmN5QXNzZXROYW1lLCBsb2FkZWRDb3VudCwgdG90YWxDb3VudCwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BTaG93RW50aXR5SW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKCF2X3BTaG93RW50aXR5SW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Nob3cgZW50aXR5IGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BTaG93RW50aXR5RGVwZW5kZW5jeUFzc2V0RGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wU2hvd0VudGl0eURlcGVuZGVuY3lBc3NldERlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbih2X3BTaG93RW50aXR5SW5mby5lbnRpdHlJZCwgZW50aXR5QXNzZXROYW1lLCB2X3BTaG93RW50aXR5SW5mby5lbnRpdHlHcm91cC5uYW1lLCBkZXBlbmRlbmN5QXNzZXROYW1lLCBsb2FkZWRDb3VudCwgdG90YWxDb3VudCwgdl9wU2hvd0VudGl0eUluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gRW50aXR5TWFuYWdlcjtcbiAgICB9KEJhc2VfMS5GcmFtZXdvcmtNb2R1bGUpKTsgLy8gY2xhc3MgRW50aXR5TWFuYWdlclxuICAgIGV4cG9ydHMuRW50aXR5TWFuYWdlciA9IEVudGl0eU1hbmFnZXI7XG4gICAgdmFyIEVudGl0eUluc3RhbmNlT2JqZWN0ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICBfX2V4dGVuZHMoRW50aXR5SW5zdGFuY2VPYmplY3QsIF9zdXBlcik7XG4gICAgICAgIGZ1bmN0aW9uIEVudGl0eUluc3RhbmNlT2JqZWN0KCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgICAgICAgICBfdGhpcy5tX3BFbnRpdHlBc3NldCA9IG51bGw7XG4gICAgICAgICAgICBfdGhpcy5tX3BFbnRpdHlIZWxwZXIgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgICAgICB9XG4gICAgICAgIEVudGl0eUluc3RhbmNlT2JqZWN0LmNyZWF0ZSA9IGZ1bmN0aW9uIChuYW1lLCBlbnRpdHlBc3NldCwgZW50aXR5SW5zdGFuY2UsIGVudGl0eUhlbHBlcikge1xuICAgICAgICAgICAgaWYgKCFlbnRpdHlBc3NldClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VudGl0eSBhc3NldCBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgaWYgKCFlbnRpdHlIZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbnRpdHkgaGVscGVyIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB2YXIgdl9wRW50aXR5SW5zdGFuY2VPYmplY3QgPSBuZXcgRW50aXR5SW5zdGFuY2VPYmplY3QoKTsgLy8gRklYTUU6IEFjcXVpcmUgRW50aXR5SW5zdGFuY2VPYmplY3QgZnJvbSBSZWZlcmVuY2VQb29sLlxuICAgICAgICAgICAgdl9wRW50aXR5SW5zdGFuY2VPYmplY3QuaW5pdGlhbGl6ZShuYW1lLCBlbnRpdHlJbnN0YW5jZSk7XG4gICAgICAgICAgICB2X3BFbnRpdHlJbnN0YW5jZU9iamVjdC5tX3BFbnRpdHlBc3NldCA9IGVudGl0eUFzc2V0O1xuICAgICAgICAgICAgdl9wRW50aXR5SW5zdGFuY2VPYmplY3QubV9wRW50aXR5SGVscGVyID0gZW50aXR5SGVscGVyO1xuICAgICAgICAgICAgcmV0dXJuIHZfcEVudGl0eUluc3RhbmNlT2JqZWN0O1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlJbnN0YW5jZU9iamVjdC5wcm90b3R5cGUucmVsZWFzZSA9IGZ1bmN0aW9uIChzaHV0ZG93bikge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wRW50aXR5SGVscGVyKVxuICAgICAgICAgICAgICAgIHRoaXMubV9wRW50aXR5SGVscGVyLnJlbGVhc2VFbnRpdHkodGhpcy5tX3BFbnRpdHlBc3NldCwgdGhpcy50YXJnZXQpO1xuICAgICAgICB9O1xuICAgICAgICBFbnRpdHlJbnN0YW5jZU9iamVjdC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfc3VwZXIucHJvdG90eXBlLmNsZWFyLmNhbGwodGhpcyk7XG4gICAgICAgICAgICB0aGlzLm1fcEVudGl0eUFzc2V0ID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9wRW50aXR5SGVscGVyID0gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIEVudGl0eUluc3RhbmNlT2JqZWN0O1xuICAgIH0oT2JqZWN0UG9vbF8xLk9iamVjdEJhc2UpKTsgLy8gY2xhc3MgRW50aXR5SW5zdGFuY2VPYmplY3Rcbn0pO1xuIiwidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgdmFyIEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XG4gICAgLyoqXG4gICAgICogQSBzaW1wbGUgZXZlbnQgbWFuYWdlciBpbXBsZW1lbnRhdGlvbi5cbiAgICAgKlxuICAgICAqIEBhdXRob3IgSmVyZW15IENoZW4gKGtleWhvbS5jQGdtYWlsLmNvbSlcbiAgICAgKi9cbiAgICB2YXIgRXZlbnRNYW5hZ2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICBfX2V4dGVuZHMoRXZlbnRNYW5hZ2VyLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBFdmVudE1hbmFnZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgICAgICAgICAgIF90aGlzLm1fcEV2ZW50SGFuZGxlcnMgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEV2ZW50TWFuYWdlci5wcm90b3R5cGUsIFwicHJpb3JpdHlcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDEwMDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRXZlbnRNYW5hZ2VyLnByb3RvdHlwZSwgXCJldmVudENvdW50XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIEV2ZW50TWFuYWdlci5wcm90b3R5cGUuY291bnQgPSBmdW5jdGlvbiAoZXZlbnRJZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wRXZlbnRIYW5kbGVycy5oYXMoZXZlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wRXZlbnRIYW5kbGVyID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIGlmICgodl9wRXZlbnRIYW5kbGVyID0gdGhpcy5tX3BFdmVudEhhbmRsZXJzLmdldChldmVudElkKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZfcEV2ZW50SGFuZGxlci5zaXplO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9O1xuICAgICAgICBFdmVudE1hbmFnZXIucHJvdG90eXBlLmNoZWNrID0gZnVuY3Rpb24gKGV2ZW50SWQsIGhhbmRsZXIsIHRhcmdldCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wRXZlbnRIYW5kbGVycy5oYXMoZXZlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wRXZlbnRIYW5kbGVyID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyICYmICh2X3BFdmVudEhhbmRsZXIgPSB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50SWQpKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdl9wRXZlbnRIYW5kbGVyLmhhcyhoYW5kbGVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIEV2ZW50TWFuYWdlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXZlbnRJZCwgaGFuZGxlciwgdGFyZ2V0KSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMubV9wRXZlbnRIYW5kbGVycy5oYXMoZXZlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuc2V0KGV2ZW50SWQsIG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZfcEV2ZW50SGFuZGxlcjtcbiAgICAgICAgICAgIGlmICgodl9wRXZlbnRIYW5kbGVyID0gdGhpcy5tX3BFdmVudEhhbmRsZXJzLmdldChldmVudElkKSkpIHtcbiAgICAgICAgICAgICAgICB2X3BFdmVudEhhbmRsZXIuYWRkKGhhbmRsZXIsIHRhcmdldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIEV2ZW50TWFuYWdlci5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gKGV2ZW50SWQsIGhhbmRsZXIsIHRhcmdldCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wRXZlbnRIYW5kbGVycy5oYXMoZXZlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wRXZlbnRIYW5kbGVyID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIGlmICgodl9wRXZlbnRIYW5kbGVyID0gdGhpcy5tX3BFdmVudEhhbmRsZXJzLmdldChldmVudElkKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdl9wRXZlbnRIYW5kbGVyLnJlbW92ZShoYW5kbGVyLCB0YXJnZXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRXZlbnRNYW5hZ2VyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gKGV2ZW50SWQpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDE7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgIGFyZ3NbX2kgLSAxXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElkKSkge1xuICAgICAgICAgICAgICAgIHZhciB2X3BFdmVudEhhbmRsZXIgPSB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50SWQpO1xuICAgICAgICAgICAgICAgIGlmICh2X3BFdmVudEhhbmRsZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdl9wRXZlbnRIYW5kbGVyLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRXZlbnRNYW5hZ2VyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIC8vIE5PT1AuXG4gICAgICAgIH07XG4gICAgICAgIEV2ZW50TWFuYWdlci5wcm90b3R5cGUuc2h1dGRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BFdmVudEhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BFdmVudEhhbmRsZXJzLmZvckVhY2goZnVuY3Rpb24gKGVoLCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgZWguY2xlYXIoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuY2xlYXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIEV2ZW50TWFuYWdlcjtcbiAgICB9KEJhc2VfMS5GcmFtZXdvcmtNb2R1bGUpKTsgLy8gY2xhc3MgRXZlbnRNYW5hZ2VyXG4gICAgZXhwb3J0cy5FdmVudE1hbmFnZXIgPSBFdmVudE1hbmFnZXI7XG59KTtcbiIsInZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgICAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xudmFyIF9fdmFsdWVzID0gKHRoaXMgJiYgdGhpcy5fX3ZhbHVlcykgfHwgZnVuY3Rpb24obykge1xuICAgIHZhciBzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciwgbSA9IHMgJiYgb1tzXSwgaSA9IDA7XG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xuICAgICAgICB9XG4gICAgfTtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XG59O1xuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIiwgXCIuL0Jhc2VcIl0sIGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIHZhciBCYXNlXzEgPSByZXF1aXJlKFwiLi9CYXNlXCIpO1xuICAgIHZhciBGc21TdGF0ZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gRnNtU3RhdGUoKSB7XG4gICAgICAgICAgICB0aGlzLm1fcEV2ZW50SGFuZGxlcnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIH1cbiAgICAgICAgRnNtU3RhdGUucHJvdG90eXBlLm9uSW5pdCA9IGZ1bmN0aW9uIChmc20pIHtcbiAgICAgICAgICAgIC8vIE5PT1BcbiAgICAgICAgfTtcbiAgICAgICAgRnNtU3RhdGUucHJvdG90eXBlLm9uRW50ZXIgPSBmdW5jdGlvbiAoZnNtKSB7XG4gICAgICAgICAgICAvLyBOT09QXG4gICAgICAgIH07XG4gICAgICAgIEZzbVN0YXRlLnByb3RvdHlwZS5vblVwZGF0ZSA9IGZ1bmN0aW9uIChmc20sIGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICAvLyBOT09QXG4gICAgICAgIH07XG4gICAgICAgIEZzbVN0YXRlLnByb3RvdHlwZS5vbkxlYXZlID0gZnVuY3Rpb24gKGZzbSwgc2h1dGRvd24pIHtcbiAgICAgICAgICAgIC8vIE5PT1BcbiAgICAgICAgfTtcbiAgICAgICAgRnNtU3RhdGUucHJvdG90eXBlLm9uRGVzdHJveSA9IGZ1bmN0aW9uIChmc20pIHtcbiAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycy5jbGVhcigpO1xuICAgICAgICB9O1xuICAgICAgICBGc21TdGF0ZS5wcm90b3R5cGUuY2hhbmdlU3RhdGUgPSBmdW5jdGlvbiAoZnNtLCB0eXBlKSB7XG4gICAgICAgICAgICBpZiAoIWZzbSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZzbSBpcyBpbnZhbGlkOiBcIiArIGZzbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmc20uY2hhbmdlU3RhdGUodHlwZSk7XG4gICAgICAgIH07XG4gICAgICAgIEZzbVN0YXRlLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIChldmVudElkLCBldmVudEhhbmRsZXIpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IGV2ZW50SGFuZGxlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFdmVudCBoYW5kbGVyIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1fcEV2ZW50SGFuZGxlcnMuaGFzKGV2ZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVoID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuc2V0KGV2ZW50SWQsIGVoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2X3BIYW5kbGVycyA9IHRoaXMubV9wRXZlbnRIYW5kbGVycy5nZXQoZXZlbnRJZCk7XG4gICAgICAgICAgICBpZiAodl9wSGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICB2X3BIYW5kbGVycy5hZGQoZXZlbnRIYW5kbGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRnNtU3RhdGUucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uIChldmVudElkLCBldmVudEhhbmRsZXIpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IGV2ZW50SGFuZGxlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFdmVudCBoYW5kbGVyIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wRXZlbnRIYW5kbGVycy5oYXMoZXZlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wSGFuZGxlcnMgPSB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50SWQpO1xuICAgICAgICAgICAgICAgIGlmICh2X3BIYW5kbGVycykge1xuICAgICAgICAgICAgICAgICAgICB2X3BIYW5kbGVycy5yZW1vdmUoZXZlbnRIYW5kbGVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIEZzbVN0YXRlLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gKGZzbSwgc2VuZGVyLCBldmVudElkLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wRXZlbnRIYW5kbGVycy5oYXMoZXZlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wSGFuZGxlcnMgPSB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50SWQpO1xuICAgICAgICAgICAgICAgIGlmICh2X3BIYW5kbGVycykge1xuICAgICAgICAgICAgICAgICAgICB2X3BIYW5kbGVycy5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGZzbSwgc2VuZGVyLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIEZzbVN0YXRlO1xuICAgIH0oKSk7IC8vIGNsYXNzIEZzbVN0YXRlPFQ+XG4gICAgZXhwb3J0cy5Gc21TdGF0ZSA9IEZzbVN0YXRlO1xuICAgIHZhciBGc20gPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZ1bmN0aW9uIEZzbSgpIHtcbiAgICAgICAgICAgIHRoaXMubV9wU3RhdGVzID0gW107XG4gICAgICAgICAgICB0aGlzLm1fcERhdGFzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgdGhpcy5faXNEZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlVGltZSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgRnNtLmNyZWF0ZUZzbSA9IGZ1bmN0aW9uIChuYW1lLCBvd25lciwgc3RhdGVzKSB7XG4gICAgICAgICAgICB2YXIgZV8xLCBfYTtcbiAgICAgICAgICAgIGlmIChudWxsID09IG93bmVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRlNNIG93bmVyIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSBzdGF0ZXMgfHwgc3RhdGVzLmxlbmd0aCA8IDEpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGU00gc3RhdGVzIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB2YXIgdl9wRnNtID0gbmV3IEZzbSgpO1xuICAgICAgICAgICAgdl9wRnNtLm1fc05hbWUgPSBuYW1lO1xuICAgICAgICAgICAgdl9wRnNtLm1fcE93bmVyID0gb3duZXI7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHN0YXRlc18xID0gX192YWx1ZXMoc3RhdGVzKSwgc3RhdGVzXzFfMSA9IHN0YXRlc18xLm5leHQoKTsgIXN0YXRlc18xXzEuZG9uZTsgc3RhdGVzXzFfMSA9IHN0YXRlc18xLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdl9wU3RhdGUgPSBzdGF0ZXNfMV8xLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BTdGF0ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRlNNIHN0YXRlcyBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodl9wRnNtLmhhc1N0YXRlKHZfcFN0YXRlLmNvbnN0cnVjdG9yKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZTTSAnXCIgKyBuYW1lICsgXCInIHN0YXRlICdcIiArIHZfcFN0YXRlICsgXCInIGlzIGFscmVhZHkgZXhpc3QuXCIpO1xuICAgICAgICAgICAgICAgICAgICB2X3BGc20ubV9wU3RhdGVzLnB1c2godl9wU3RhdGUpO1xuICAgICAgICAgICAgICAgICAgICB2X3BTdGF0ZS5vbkluaXQodl9wRnNtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xXzEpIHsgZV8xID0geyBlcnJvcjogZV8xXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXRlc18xXzEgJiYgIXN0YXRlc18xXzEuZG9uZSAmJiAoX2EgPSBzdGF0ZXNfMS5yZXR1cm4pKSBfYS5jYWxsKHN0YXRlc18xKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdl9wRnNtLl9pc0Rlc3Ryb3llZCA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHZfcEZzbTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZzbS5wcm90b3R5cGUsIFwibmFtZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3NOYW1lO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGc20ucHJvdG90eXBlLCBcIm93bmVyXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BPd25lcjsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGc20ucHJvdG90eXBlLCBcImZzbVN0YXRlQ291bnRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFN0YXRlcy5sZW5ndGg7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRnNtLnByb3RvdHlwZSwgXCJpc1J1bm5pbmdcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBudWxsICE9IHRoaXMuX2N1cnJlbnRTdGF0ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGc20ucHJvdG90eXBlLCBcImlzRGVzdHJveWVkXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5faXNEZXN0cm95ZWQ7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRnNtLnByb3RvdHlwZSwgXCJjdXJyZW50U3RhdGVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLl9jdXJyZW50U3RhdGU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRnNtLnByb3RvdHlwZSwgXCJjdXJyZW50U3RhdGVOYW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBDdXJyZW50IHN0YXRlIG5hbWUgP1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTdGF0ZS5uYW1lO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGc20ucHJvdG90eXBlLCBcImN1cnJlbnRTdGF0ZVRpbWVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLl9jdXJyZW50U3RhdGVUaW1lOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgRnNtLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pc1J1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGU00gaXMgcnVubmluZywgY2FuIG5vdCBzdGFydCBhZ2Fpbi5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLmdldFN0YXRlKHR5cGUpO1xuICAgICAgICAgICAgaWYgKCFzdGF0ZSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZTTSAnXCIgKyB0aGlzLm5hbWUgKyBcIicgY2FuIG5vdCBzdGFydCBzdGF0ZSAnXCIgKyB0eXBlLm5hbWUgKyBcIicgd2hpY2ggaXMgbm90IGV4aXN0cy5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGVUaW1lID0gMDtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZSA9IHN0YXRlO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50U3RhdGUub25FbnRlcih0aGlzKTsgLy8gQ2FsbCBpbnRlcm5hbCBmdW5jdGlvbiB3aXRoIGFueSBjYXN0aW5nLlxuICAgICAgICB9O1xuICAgICAgICBGc20ucHJvdG90eXBlLmhhc1N0YXRlID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsICE9IHRoaXMuZ2V0U3RhdGUodHlwZSk7XG4gICAgICAgIH07XG4gICAgICAgIEZzbS5wcm90b3R5cGUuZ2V0U3RhdGUgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1fcFN0YXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciB2X3BTdGF0ZSA9IHRoaXMubV9wU3RhdGVzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChudWxsID09IHZfcFN0YXRlKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBpZiAodl9wU3RhdGUgaW5zdGFuY2VvZiB0eXBlKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdl9wU3RhdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgRnNtLnByb3RvdHlwZS5nZXRBbGxTdGF0ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BTdGF0ZXM7XG4gICAgICAgIH07XG4gICAgICAgIEZzbS5wcm90b3R5cGUuY2hhbmdlU3RhdGUgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9jdXJyZW50U3RhdGUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDdXJyZW50IHN0YXRlIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB2YXIgdl9wU3RhdGUgPSB0aGlzLmdldFN0YXRlKHR5cGUpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wU3RhdGUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRnNtIGNhbiBub3QgY2hhbmdlIHN0YXRlLCBzdGF0ZSBpcyBub3QgZXhpc3Q6IFwiICsgdHlwZSk7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGUub25MZWF2ZSh0aGlzLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGVUaW1lID0gMDtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZSA9IHZfcFN0YXRlO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlLm9uRW50ZXIodGhpcyk7XG4gICAgICAgIH07XG4gICAgICAgIEZzbS5wcm90b3R5cGUuZ2V0RGF0YSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BEYXRhcy5oYXMobmFtZSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wRGF0YXMuZ2V0KG5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIEZzbS5wcm90b3R5cGUuc2V0RGF0YSA9IGZ1bmN0aW9uIChuYW1lLCBkYXRhKSB7XG4gICAgICAgICAgICBpZiAoIW5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXRhIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHRoaXMubV9wRGF0YXMuc2V0KG5hbWUsIGRhdGEpO1xuICAgICAgICB9O1xuICAgICAgICBGc20ucHJvdG90eXBlLnJlbW92ZURhdGEgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgaWYgKCFuYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRGF0YSBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB2YXIgdl9iUmV0ID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BEYXRhcy5oYXMobmFtZSkpIHtcbiAgICAgICAgICAgICAgICB2X2JSZXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRGF0YXMuZGVsZXRlKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZfYlJldDtcbiAgICAgICAgfTtcbiAgICAgICAgRnNtLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMuX2N1cnJlbnRTdGF0ZSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGVUaW1lICs9IGVsYXBzZWQ7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGUub25VcGRhdGUodGhpcywgZWxhcHNlZCwgcmVhbEVsYXBzZWQpO1xuICAgICAgICB9O1xuICAgICAgICBGc20ucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gRklYTUU6IEZpZ3VlIG91dCBhIHdheSB0byByZWxlYXNlIHRoaXMuXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBGc207XG4gICAgfSgpKTsgLy8gY2xhc3MgRnNtPFQ+XG4gICAgZXhwb3J0cy5Gc20gPSBGc207XG4gICAgdmFyIEZzbU1hbmFnZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhGc21NYW5hZ2VyLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBGc21NYW5hZ2VyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgICAgICAgICBfdGhpcy5tX3BGc21zID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGc21NYW5hZ2VyLnByb3RvdHlwZSwgXCJwcmlvcml0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gNjA7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZzbU1hbmFnZXIucHJvdG90eXBlLCBcImNvdW50XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcEZzbXMuc2l6ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBGc21NYW5hZ2VyLnByb3RvdHlwZS5oYXNGc20gPSBmdW5jdGlvbiAobmFtZU9yVHlwZSkge1xuICAgICAgICAgICAgdmFyIGVfMiwgX2E7XG4gICAgICAgICAgICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIG5hbWVPclR5cGUgJiYgbmFtZU9yVHlwZS5wcm90b3R5cGUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRnNtcy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmc20gPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChudWxsICE9IGZzbSAmJiBmc20gaW5zdGFuY2VvZiBuYW1lT3JUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVfMl8xKSB7IGVfMiA9IHsgZXJyb3I6IGVfMl8xIH07IH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMikgdGhyb3cgZV8yLmVycm9yOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BGc21zLmhhcyhuYW1lT3JUeXBlLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBGc21NYW5hZ2VyLnByb3RvdHlwZS5nZXRGc20gPSBmdW5jdGlvbiAobmFtZU9yVHlwZSkge1xuICAgICAgICAgICAgdmFyIGVfMywgX2E7XG4gICAgICAgICAgICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIG5hbWVPclR5cGUgJiYgbmFtZU9yVHlwZS5wcm90b3R5cGUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRnNtcy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmc20gPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChudWxsICE9IGZzbSAmJiBmc20gaW5zdGFuY2VvZiBuYW1lT3JUeXBlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmc207XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVfM18xKSB7IGVfMyA9IHsgZXJyb3I6IGVfM18xIH07IH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMykgdGhyb3cgZV8zLmVycm9yOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wRnNtcy5nZXQobmFtZU9yVHlwZS50b1N0cmluZygpKSB8fCBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIEZzbU1hbmFnZXIucHJvdG90eXBlLmdldEFsbEZzbXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZV80LCBfYTtcbiAgICAgICAgICAgIHZhciB2X3BSZXQgPSBbXTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcEZzbXMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmc20gPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdl9wUmV0LnB1c2goZnNtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV80XzEpIHsgZV80ID0geyBlcnJvcjogZV80XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNCkgdGhyb3cgZV80LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdl9wUmV0O1xuICAgICAgICB9O1xuICAgICAgICBGc21NYW5hZ2VyLnByb3RvdHlwZS5jcmVhdGVGc20gPSBmdW5jdGlvbiAobmFtZSwgb3duZXIsIHN0YXRlcykge1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUgfHwgJyc7XG4gICAgICAgICAgICBpZiAodGhpcy5oYXNGc20obmFtZSkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBbHJlYWR5IGV4aXN0IEZTTSAnXCIgKyBuYW1lICsgXCInLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBmc20gPSBGc20uY3JlYXRlRnNtKG5hbWUsIG93bmVyLCBzdGF0ZXMpO1xuICAgICAgICAgICAgdGhpcy5tX3BGc21zLnNldChuYW1lLCBmc20pO1xuICAgICAgICAgICAgcmV0dXJuIGZzbTtcbiAgICAgICAgfTtcbiAgICAgICAgRnNtTWFuYWdlci5wcm90b3R5cGUuZGVzdHJveUZzbSA9IGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgICAgICAgIHZhciBlXzUsIF9hLCBlXzYsIF9iLCBlXzcsIF9jO1xuICAgICAgICAgICAgdmFyIHZfc05hbWU7XG4gICAgICAgICAgICB2YXIgdl9wVHlwZTtcbiAgICAgICAgICAgIHZhciB2X3BJbnN0YW5jZTtcbiAgICAgICAgICAgIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIGFyZykge1xuICAgICAgICAgICAgICAgIHZfc05hbWUgPSBhcmc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgYXJnKSB7XG4gICAgICAgICAgICAgICAgdl9wVHlwZSA9IGFyZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCdvYmplY3QnID09PSB0eXBlb2YgYXJnICYmIGFyZy5jb25zdHJ1Y3Rvcikge1xuICAgICAgICAgICAgICAgIHZfcEluc3RhbmNlID0gYXJnO1xuICAgICAgICAgICAgICAgIHZfcFR5cGUgPSBhcmcuY29uc3RydWN0b3I7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRoaXMuaGFzRnNtKHZfc05hbWUgfHwgdl9wVHlwZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodl9wSW5zdGFuY2UgJiYgT2JqZWN0LmdldFByb3RvdHlwZU9mKHZfcEluc3RhbmNlKS5oYXNPd25Qcm9wZXJ0eSgnc2h1dGRvd24nKSkge1xuICAgICAgICAgICAgICAgIHZfcEluc3RhbmNlLnNodXRkb3duKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobnVsbCAhPSB2X3BJbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9kID0gX192YWx1ZXModGhpcy5tX3BGc21zLmtleXMoKSksIF9lID0gX2QubmV4dCgpOyAhX2UuZG9uZTsgX2UgPSBfZC5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBfZS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2X3BGc20gPSB0aGlzLm1fcEZzbXMuZ2V0KGtleSkgfHwgbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2X3BGc20gPT0gdl9wSW5zdGFuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcEZzbXMuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVfNV8xKSB7IGVfNSA9IHsgZXJyb3I6IGVfNV8xIH07IH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfZSAmJiAhX2UuZG9uZSAmJiAoX2EgPSBfZC5yZXR1cm4pKSBfYS5jYWxsKF9kKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNSkgdGhyb3cgZV81LmVycm9yOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobnVsbCAhPSB2X3NOYW1lKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2YgPSBfX3ZhbHVlcyh0aGlzLm1fcEZzbXMua2V5cygpKSwgX2cgPSBfZi5uZXh0KCk7ICFfZy5kb25lOyBfZyA9IF9mLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IF9nLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZfcEZzbSA9IHRoaXMubV9wRnNtcy5nZXQoa2V5KSB8fCBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF2X3BGc20pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodl9wRnNtLm5hbWUgPT0gdl9zTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubV9wRnNtcy5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV82XzEpIHsgZV82ID0geyBlcnJvcjogZV82XzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9nICYmICFfZy5kb25lICYmIChfYiA9IF9mLnJldHVybikpIF9iLmNhbGwoX2YpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV82KSB0aHJvdyBlXzYuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChudWxsICE9IHZfcFR5cGUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfaCA9IF9fdmFsdWVzKHRoaXMubV9wRnNtcy5rZXlzKCkpLCBfaiA9IF9oLm5leHQoKTsgIV9qLmRvbmU7IF9qID0gX2gubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gX2oudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdl9wRnNtID0gdGhpcy5tX3BGc21zLmdldChrZXkpIHx8IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodl9wRnNtIGluc3RhbmNlb2Ygdl9wVHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubV9wRnNtcy5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV83XzEpIHsgZV83ID0geyBlcnJvcjogZV83XzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9qICYmICFfai5kb25lICYmIChfYyA9IF9oLnJldHVybikpIF9jLmNhbGwoX2gpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV83KSB0aHJvdyBlXzcuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICAgICAgRnNtTWFuYWdlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICB2YXIgZV84LCBfYTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcEZzbXMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZnNtID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZnNtIHx8IGZzbS5pc0Rlc3Ryb3llZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICBmc20udXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV84XzEpIHsgZV84ID0geyBlcnJvcjogZV84XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfOCkgdGhyb3cgZV84LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIEZzbU1hbmFnZXIucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfOSwgX2E7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BGc21zLmtleXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdl9Gc20gPSB0aGlzLm1fcEZzbXMuZ2V0KGtleSkgfHwgbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF2X0ZzbSB8fCB2X0ZzbS5pc0Rlc3Ryb3llZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB2X0ZzbS5zaHV0ZG93bigpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcEZzbXMuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfOV8xKSB7IGVfOSA9IHsgZXJyb3I6IGVfOV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzkpIHRocm93IGVfOS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gRnNtTWFuYWdlcjtcbiAgICB9KEJhc2VfMS5GcmFtZXdvcmtNb2R1bGUpKTsgLy8gY2xhc3MgRnNtTWFuYWdlclxuICAgIGV4cG9ydHMuRnNtTWFuYWdlciA9IEZzbU1hbmFnZXI7XG59KTtcbiIsInZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgICAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xudmFyIF9fdmFsdWVzID0gKHRoaXMgJiYgdGhpcy5fX3ZhbHVlcykgfHwgZnVuY3Rpb24obykge1xuICAgIHZhciBzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciwgbSA9IHMgJiYgb1tzXSwgaSA9IDA7XG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xuICAgICAgICB9XG4gICAgfTtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XG59O1xuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIiwgXCIuL0Jhc2VcIl0sIGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIHZhciBCYXNlXzEgPSByZXF1aXJlKFwiLi9CYXNlXCIpO1xuICAgIHZhciBOZXR3b3JrRXJyb3JDb2RlO1xuICAgIChmdW5jdGlvbiAoTmV0d29ya0Vycm9yQ29kZSkge1xuICAgICAgICBOZXR3b3JrRXJyb3JDb2RlW05ldHdvcmtFcnJvckNvZGVbXCJVbmtub3duXCJdID0gMF0gPSBcIlVua25vd25cIjtcbiAgICAgICAgTmV0d29ya0Vycm9yQ29kZVtOZXR3b3JrRXJyb3JDb2RlW1wiQWRkcmVzc0ZhbWlseUVycm9yXCJdID0gMV0gPSBcIkFkZHJlc3NGYW1pbHlFcnJvclwiO1xuICAgICAgICBOZXR3b3JrRXJyb3JDb2RlW05ldHdvcmtFcnJvckNvZGVbXCJTb2NrZXRFcnJvclwiXSA9IDJdID0gXCJTb2NrZXRFcnJvclwiO1xuICAgICAgICBOZXR3b3JrRXJyb3JDb2RlW05ldHdvcmtFcnJvckNvZGVbXCJTZXJpYWxpemVFcnJvclwiXSA9IDNdID0gXCJTZXJpYWxpemVFcnJvclwiO1xuICAgICAgICBOZXR3b3JrRXJyb3JDb2RlW05ldHdvcmtFcnJvckNvZGVbXCJEZXNlcmlhbGl6ZVBhY2tldEhlYWRFcnJvclwiXSA9IDRdID0gXCJEZXNlcmlhbGl6ZVBhY2tldEhlYWRFcnJvclwiO1xuICAgICAgICBOZXR3b3JrRXJyb3JDb2RlW05ldHdvcmtFcnJvckNvZGVbXCJEZXNlcmlhbGl6ZVBhY2tldEVycm9yXCJdID0gNV0gPSBcIkRlc2VyaWFsaXplUGFja2V0RXJyb3JcIjtcbiAgICAgICAgTmV0d29ya0Vycm9yQ29kZVtOZXR3b3JrRXJyb3JDb2RlW1wiQ29ubmVjdEVycm9yXCJdID0gNl0gPSBcIkNvbm5lY3RFcnJvclwiO1xuICAgICAgICBOZXR3b3JrRXJyb3JDb2RlW05ldHdvcmtFcnJvckNvZGVbXCJTZW5kRXJyb3JcIl0gPSA3XSA9IFwiU2VuZEVycm9yXCI7XG4gICAgICAgIE5ldHdvcmtFcnJvckNvZGVbTmV0d29ya0Vycm9yQ29kZVtcIlJlY2VpdmVFcnJvclwiXSA9IDhdID0gXCJSZWNlaXZlRXJyb3JcIjtcbiAgICB9KShOZXR3b3JrRXJyb3JDb2RlID0gZXhwb3J0cy5OZXR3b3JrRXJyb3JDb2RlIHx8IChleHBvcnRzLk5ldHdvcmtFcnJvckNvZGUgPSB7fSkpOyAvLyBlbnVtIE5ldHdvcmtFcnJvckNvZGVcbiAgICBleHBvcnRzLkRlZmF1bHRIZWFydEJlYXRJbnRlcnZhbCA9IDMwLjA7XG4gICAgdmFyIE5ldHdvcmtDaGFubmVsID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBOZXR3b3JrQ2hhbm5lbChuYW1lLCBuZXR3b3JrQ2hhbm5lbEhlbHBlcikge1xuICAgICAgICAgICAgdGhpcy5tX3BVc2VyRGF0YSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fc05hbWUgPSBuYW1lIHx8ICcnO1xuICAgICAgICAgICAgdGhpcy5tX3BOZXR3b3JrQ2hhbm5lbEhlbHBlciA9IG5ldHdvcmtDaGFubmVsSGVscGVyO1xuICAgICAgICAgICAgdGhpcy5tX2ZIZWFydEJlYXRJbnRlcnZhbCA9IGV4cG9ydHMuRGVmYXVsdEhlYXJ0QmVhdEludGVydmFsO1xuICAgICAgICAgICAgdGhpcy5uZXR3b3JrQ2hhbm5lbE9wZW5lZCA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICB0aGlzLm5ldHdvcmtDaGFubmVsQ2xvc2VkID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIHRoaXMubmV0d29ya0NoYW5uZWxNaXNzSGVhcnRCZWF0ID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIHRoaXMubmV0d29ya0NoYW5uZWxFcnJvciA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICB0aGlzLm5ldHdvcmtDaGFubmVsQ3VzdG9tRXJyb3IgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgdGhpcy5tX3BOZXR3b3JrQ2hhbm5lbEhlbHBlci5pbml0aWFsaXplKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShOZXR3b3JrQ2hhbm5lbC5wcm90b3R5cGUsIFwiaWRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wTmV0d29ya0NoYW5uZWxIZWxwZXIuaWQ7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE5ldHdvcmtDaGFubmVsLnByb3RvdHlwZSwgXCJuYW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fc05hbWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE5ldHdvcmtDaGFubmVsLnByb3RvdHlwZSwgXCJ1c2VyRGF0YVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BVc2VyRGF0YTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBOZXR3b3JrQ2hhbm5lbC5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uIChob3N0LCBwb3J0LCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wTmV0d29ya0NoYW5uZWxIZWxwZXIuaXNPcGVuKVxuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICAgIHRoaXMubV9wVXNlckRhdGEgPSB1c2VyRGF0YSB8fCBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX3BOZXR3b3JrQ2hhbm5lbEhlbHBlci5jb25uZWN0KGhvc3QsIHBvcnQpO1xuICAgICAgICB9O1xuICAgICAgICBOZXR3b3JrQ2hhbm5lbC5wcm90b3R5cGUuZmlyZUNoYW5uZWxPcGVuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgIGlmICh0aGlzLm5ldHdvcmtDaGFubmVsT3BlbmVkLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5ldHdvcmtDaGFubmVsT3BlbmVkLml0ZXIoZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGZuKF90aGlzLCBfdGhpcy5tX3BVc2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIE5ldHdvcmtDaGFubmVsLnByb3RvdHlwZS5maXJlQ2hhbm5lbE1lc3NhZ2VSZWNlaXZlID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIC8vIFRPRE86XG4gICAgICAgIH07XG4gICAgICAgIE5ldHdvcmtDaGFubmVsLnByb3RvdHlwZS5maXJlRXJyb3JDYXVnaHQgPSBmdW5jdGlvbiAoZXJyb3JPck1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgdl9wRXJyb3I7XG4gICAgICAgICAgICBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIGVycm9yT3JNZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgdl9wRXJyb3IgPSBuZXcgRXJyb3IoZXJyb3JPck1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdl9wRXJyb3IgPSBlcnJvck9yTWVzc2FnZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm5ldHdvcmtDaGFubmVsRXJyb3IuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubmV0d29ya0NoYW5uZWxFcnJvci5pdGVyKGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgICAgICAgICBmbihfdGhpcywgTmV0d29ya0Vycm9yQ29kZS5Tb2NrZXRFcnJvciwgdl9wRXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIE5ldHdvcmtDaGFubmVsLnByb3RvdHlwZS5maXJlQ2hhbm5lbENsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgIGlmICh0aGlzLm5ldHdvcmtDaGFubmVsQ2xvc2VkLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5ldHdvcmtDaGFubmVsQ2xvc2VkLml0ZXIoZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGZuKF90aGlzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgTmV0d29ya0NoYW5uZWwucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5tX3BOZXR3b3JrQ2hhbm5lbEhlbHBlci5jbG9zZSgpO1xuICAgICAgICB9O1xuICAgICAgICBOZXR3b3JrQ2hhbm5lbC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICAvLyBUT0RPOiB1cGRhdGUgbmV0d29yayBjaGFubmVsLlxuICAgICAgICB9O1xuICAgICAgICBOZXR3b3JrQ2hhbm5lbC5wcm90b3R5cGUuc2h1dGRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLm1fcE5ldHdvcmtDaGFubmVsSGVscGVyLnNodXRkb3duKCk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBOZXR3b3JrQ2hhbm5lbDtcbiAgICB9KCkpOyAvLyBjbGFzcyBOZXR3b3JrQ2hhbm5lbFxuICAgIGV4cG9ydHMuTmV0d29ya0NoYW5uZWwgPSBOZXR3b3JrQ2hhbm5lbDtcbiAgICB2YXIgTmV0d29ya01hbmFnZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhOZXR3b3JrTWFuYWdlciwgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gTmV0d29ya01hbmFnZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgICAgICAgICAgIF90aGlzLm1fcE5ldHdvcmtDaGFubmVscyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcE5ldHdvcmtDb25uZWN0ZWREZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BOZXR3b3JrQ2xvc2VkRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wTmV0d29ya01pc3NIZWFydEJlYXREZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BOZXR3b3JrRXJyb3JEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BOZXR3b3JrQ3VzdG9tRXJyb3JEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE5ldHdvcmtNYW5hZ2VyLnByb3RvdHlwZSwgXCJuZXR3b3JrQ2hhbm5lbENvdW50XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcE5ldHdvcmtDaGFubmVscy5zaXplO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShOZXR3b3JrTWFuYWdlci5wcm90b3R5cGUsIFwibmV0d29ya0Nvbm5lY3RlZFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BOZXR3b3JrQ29ubmVjdGVkRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE5ldHdvcmtNYW5hZ2VyLnByb3RvdHlwZSwgXCJuZXR3b3JrQ2xvc2VkXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcE5ldHdvcmtDbG9zZWREZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTmV0d29ya01hbmFnZXIucHJvdG90eXBlLCBcIm5ldHdvcmtNaXNzSGVhcnRCZWF0XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcE5ldHdvcmtNaXNzSGVhcnRCZWF0RGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE5ldHdvcmtNYW5hZ2VyLnByb3RvdHlwZSwgXCJuZXR3b3JrRXJyb3JcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wTmV0d29ya0Vycm9yRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE5ldHdvcmtNYW5hZ2VyLnByb3RvdHlwZSwgXCJuZXR3b3JrQ3VzdG9tRXJyb3JcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wTmV0d29ya0N1c3RvbUVycm9yRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgTmV0d29ya01hbmFnZXIucHJvdG90eXBlLmhhc05ldHdvcmtDaGFubmVsID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcE5ldHdvcmtDaGFubmVscy5oYXMobmFtZSk7XG4gICAgICAgIH07XG4gICAgICAgIE5ldHdvcmtNYW5hZ2VyLnByb3RvdHlwZS5nZXROZXR3b3JrQ2hhbm5lbCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BOZXR3b3JrQ2hhbm5lbHMuZ2V0KG5hbWUpIHx8IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIE5ldHdvcmtNYW5hZ2VyLnByb3RvdHlwZS5nZXRBbGxOZXR3b3JrQ2hhbm5lbHMgPSBmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgICAgICAgdmFyIGVfMSwgX2E7XG4gICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cyB8fCBbXTtcbiAgICAgICAgICAgIHJlc3VsdHMuc3BsaWNlKDAsIHJlc3VsdHMubGVuZ3RoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcE5ldHdvcmtDaGFubmVscy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ldHdvcmtDaGFubmVsID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChuZXR3b3JrQ2hhbm5lbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMV8xKSB7IGVfMSA9IHsgZXJyb3I6IGVfMV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICAgIE5ldHdvcmtNYW5hZ2VyLnByb3RvdHlwZS5jcmVhdGVOZXR3b3JrQ2hhbm5lbCA9IGZ1bmN0aW9uIChuYW1lLCBuZXR3b3JrQ2hhbm5lbEhlbHBlcikge1xuICAgICAgICAgICAgaWYgKCFuZXR3b3JrQ2hhbm5lbEhlbHBlcikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTmV0d29yayBjaGFubmVsIGhlbHBlciBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5ldHdvcmtDaGFubmVsSGVscGVyLnBhY2tldEhlYWRlckxlbmd0aCA8IDApIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhY2tldCBoZWFkZXIgbGVuZ3RoIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5oYXNOZXR3b3JrQ2hhbm5lbChuYW1lKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBbHJlYWR5IGV4aXN0IG5ldHdvcmsgY2hhbm5lbCAnXCIgKyAobmFtZSA/IG5hbWUgOiAnJykgKyBcIidcIik7XG4gICAgICAgICAgICB2YXIgbmV0d29ya0NoYW5uZWwgPSBuZXcgTmV0d29ya0NoYW5uZWwobmFtZSwgbmV0d29ya0NoYW5uZWxIZWxwZXIpO1xuICAgICAgICAgICAgbmV0d29ya0NoYW5uZWwubmV0d29ya0NoYW5uZWxPcGVuZWQuYWRkKHRoaXMub25OZXR3b3JrQ2hhbm5lbENvbm5lY3RlZCwgdGhpcyk7XG4gICAgICAgICAgICBuZXR3b3JrQ2hhbm5lbC5uZXR3b3JrQ2hhbm5lbENsb3NlZC5hZGQodGhpcy5vbk5ldHdvcmtDaGFubmVsQ2xvc2VkLCB0aGlzKTtcbiAgICAgICAgICAgIG5ldHdvcmtDaGFubmVsLm5ldHdvcmtDaGFubmVsTWlzc0hlYXJ0QmVhdC5hZGQodGhpcy5vbk5ldHdvcmtDaGFubmVsTWlzc0hlYXJ0QmVhdCwgdGhpcyk7XG4gICAgICAgICAgICBuZXR3b3JrQ2hhbm5lbC5uZXR3b3JrQ2hhbm5lbEVycm9yLmFkZCh0aGlzLm9uTmV0d29ya0NoYW5uZWxFcnJvciwgdGhpcyk7XG4gICAgICAgICAgICBuZXR3b3JrQ2hhbm5lbC5uZXR3b3JrQ2hhbm5lbEN1c3RvbUVycm9yLmFkZCh0aGlzLm9uTmV0d29ya0NoYW5uZWxDdXN0b21FcnJvciwgdGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gbmV0d29ya0NoYW5uZWw7XG4gICAgICAgIH07XG4gICAgICAgIE5ldHdvcmtNYW5hZ2VyLnByb3RvdHlwZS5kZXN0cm95TmV0d29ya0NoYW5uZWwgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgdmFyIHZfcENoYW5uZWwgPSB0aGlzLmdldE5ldHdvcmtDaGFubmVsKG5hbWUpO1xuICAgICAgICAgICAgaWYgKHZfcENoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICB2X3BDaGFubmVsLm5ldHdvcmtDaGFubmVsT3BlbmVkLnJlbW92ZSh0aGlzLm9uTmV0d29ya0NoYW5uZWxDb25uZWN0ZWQsIHRoaXMpO1xuICAgICAgICAgICAgICAgIHZfcENoYW5uZWwubmV0d29ya0NoYW5uZWxDbG9zZWQucmVtb3ZlKHRoaXMub25OZXR3b3JrQ2hhbm5lbENsb3NlZCwgdGhpcyk7XG4gICAgICAgICAgICAgICAgdl9wQ2hhbm5lbC5uZXR3b3JrQ2hhbm5lbE1pc3NIZWFydEJlYXQucmVtb3ZlKHRoaXMub25OZXR3b3JrQ2hhbm5lbE1pc3NIZWFydEJlYXQsIHRoaXMpO1xuICAgICAgICAgICAgICAgIHZfcENoYW5uZWwubmV0d29ya0NoYW5uZWxFcnJvci5yZW1vdmUodGhpcy5vbk5ldHdvcmtDaGFubmVsRXJyb3IsIHRoaXMpO1xuICAgICAgICAgICAgICAgIHZfcENoYW5uZWwubmV0d29ya0NoYW5uZWxDdXN0b21FcnJvci5yZW1vdmUodGhpcy5vbk5ldHdvcmtDaGFubmVsQ3VzdG9tRXJyb3IsIHRoaXMpO1xuICAgICAgICAgICAgICAgIHZfcENoYW5uZWwuc2h1dGRvd24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BOZXR3b3JrQ2hhbm5lbHMuZGVsZXRlKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBOZXR3b3JrTWFuYWdlci5wcm90b3R5cGUub25OZXR3b3JrQ2hhbm5lbENvbm5lY3RlZCA9IGZ1bmN0aW9uIChuZXR3b3JrQ2hhbm5lbCwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcE5ldHdvcmtDb25uZWN0ZWREZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgLy8gbG9jayB0aGlzLm1fcE5ldHdvcmtDb25uZWN0ZWREZWxlZ2F0ZVxuICAgICAgICAgICAgICAgIHRoaXMubV9wTmV0d29ya0Nvbm5lY3RlZERlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG5ldHdvcmtDaGFubmVsLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIE5ldHdvcmtNYW5hZ2VyLnByb3RvdHlwZS5vbk5ldHdvcmtDaGFubmVsQ2xvc2VkID0gZnVuY3Rpb24gKG5ldHdvcmtDaGFubmVsKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BOZXR3b3JrQ2xvc2VkRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTmV0d29ya0Nsb3NlZERlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG5ldHdvcmtDaGFubmVsKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgTmV0d29ya01hbmFnZXIucHJvdG90eXBlLm9uTmV0d29ya0NoYW5uZWxNaXNzSGVhcnRCZWF0ID0gZnVuY3Rpb24gKG5ldHdvcmtDaGFubmVsLCBtaXNzSGVhcnRCZWF0Q291bnQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcE5ldHdvcmtNaXNzSGVhcnRCZWF0RGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTmV0d29ya01pc3NIZWFydEJlYXREZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhuZXR3b3JrQ2hhbm5lbCwgbWlzc0hlYXJ0QmVhdENvdW50KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgTmV0d29ya01hbmFnZXIucHJvdG90eXBlLm9uTmV0d29ya0NoYW5uZWxFcnJvciA9IGZ1bmN0aW9uIChuZXR3b3JrQ2hhbm5lbCwgZXJyb3JDb2RlLCBlcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcE5ldHdvcmtFcnJvckRlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcE5ldHdvcmtFcnJvckRlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG5ldHdvcmtDaGFubmVsLCBlcnJvckNvZGUsIGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIE5ldHdvcmtNYW5hZ2VyLnByb3RvdHlwZS5vbk5ldHdvcmtDaGFubmVsQ3VzdG9tRXJyb3IgPSBmdW5jdGlvbiAobmV0d29ya0NoYW5uZWwsIGN1c3RvbUVycm9yRGF0YSkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wTmV0d29ya0N1c3RvbUVycm9yRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTmV0d29ya0N1c3RvbUVycm9yRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobmV0d29ya0NoYW5uZWwsIGN1c3RvbUVycm9yRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIE5ldHdvcmtNYW5hZ2VyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIHZhciBlXzIsIF9hO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wTmV0d29ya0NoYW5uZWxzLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV0d29ya0NoYW5uZWwgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgbmV0d29ya0NoYW5uZWwudXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8yXzEpIHsgZV8yID0geyBlcnJvcjogZV8yXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMikgdGhyb3cgZV8yLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIE5ldHdvcmtNYW5hZ2VyLnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBlXzMsIF9hO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wTmV0d29ya0NoYW5uZWxzLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV0d29ya0NoYW5uZWwgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgbmV0d29ya0NoYW5uZWwuc2h1dGRvd24oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8zXzEpIHsgZV8zID0geyBlcnJvcjogZV8zXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMykgdGhyb3cgZV8zLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcE5ldHdvcmtDaGFubmVscy5jbGVhcigpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gTmV0d29ya01hbmFnZXI7XG4gICAgfShCYXNlXzEuRnJhbWV3b3JrTW9kdWxlKSk7IC8vIGNsYXNzIE5ldHdvcmtNYW5hZ2VyXG4gICAgZXhwb3J0cy5OZXR3b3JrTWFuYWdlciA9IE5ldHdvcmtNYW5hZ2VyO1xufSk7XG4iLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbnZhciBfX3ZhbHVlcyA9ICh0aGlzICYmIHRoaXMuX192YWx1ZXMpIHx8IGZ1bmN0aW9uKG8pIHtcbiAgICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xufTtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICB2YXIgRGVmYXVsdENhcGFjaXR5ID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG4gICAgdmFyIERlZmF1bHRFeHBpcmVUaW1lID0gTnVtYmVyLk1BWF9WQUxVRTtcbiAgICB2YXIgRGVmYXVsdFByaW9yaXR5ID0gMDtcbiAgICB2YXIgRGF0ZVRpbWVNaW5UaW1lc3RhbXAgPSA5NzgyNzg0MDAwMDA7XG4gICAgdmFyIERhdGVUaW1lTWF4VGltZXN0YW1wID0gMjUzNDAyMjcxOTk5MDAwO1xuICAgIHZhciBPYmplY3RQb29sQmFzZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gT2JqZWN0UG9vbEJhc2UobmFtZSkge1xuICAgICAgICAgICAgdGhpcy5tX3NOYW1lID0gbmFtZSB8fCAnJztcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0UG9vbEJhc2UucHJvdG90eXBlLCBcIm5hbWVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fc05hbWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gT2JqZWN0UG9vbEJhc2U7XG4gICAgfSgpKTsgLy8gY2xhc3MgT2JqZWN0UG9vbEJhc2VcbiAgICBleHBvcnRzLk9iamVjdFBvb2xCYXNlID0gT2JqZWN0UG9vbEJhc2U7XG4gICAgdmFyIE9iamVjdFBvb2wgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhPYmplY3RQb29sLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBPYmplY3RQb29sKG5hbWUsIGFsbG93TXVsdGlTcGF3biwgYXV0b1JlbGVhc2VJbnRlcnZhbCwgY2FwYWNpdHksIGV4cGlyZVRpbWUsIHByaW9yaXR5KSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBuYW1lKSB8fCB0aGlzO1xuICAgICAgICAgICAgX3RoaXMubV9wT2JqZWN0cyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcE9iamVjdE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcENhY2hlQ2FuUmVsZWFzZU9iamV0cyA9IFtdO1xuICAgICAgICAgICAgX3RoaXMubV9wQ2FjaGVUb1JlbGVhc2VPYmplY3RzID0gW107XG4gICAgICAgICAgICBfdGhpcy5tX2JBbGxvd011bHRpU3Bhd24gPSBhbGxvd011bHRpU3Bhd247XG4gICAgICAgICAgICBfdGhpcy5tX2ZBdXRvUmVsZWFzZUludGVydmFsID0gYXV0b1JlbGVhc2VJbnRlcnZhbDtcbiAgICAgICAgICAgIF90aGlzLm1faUNhcGFjaXR5ID0gY2FwYWNpdHk7XG4gICAgICAgICAgICBfdGhpcy5tX2ZFeHBpcmVUaW1lID0gZXhwaXJlVGltZTtcbiAgICAgICAgICAgIF90aGlzLm1faVByaW9yaXR5ID0gcHJpb3JpdHk7XG4gICAgICAgICAgICBfdGhpcy5tX2ZBdXRvUmVsZWFzZVRpbWUgPSAwO1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPYmplY3RQb29sLnByb3RvdHlwZSwgXCJjb3VudFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wT2JqZWN0TWFwLnNpemU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0UG9vbC5wcm90b3R5cGUsIFwiY2FuUmVsZWFzZUNvdW50XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0Q2FuUmVsZWFzZU9iamVjdHModGhpcy5tX3BDYWNoZUNhblJlbGVhc2VPYmpldHMpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcENhY2hlQ2FuUmVsZWFzZU9iamV0cy5sZW5ndGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE9iamVjdFBvb2wucHJvdG90eXBlLCBcImFsbG93TXVsdGlTcGF3blwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9iQWxsb3dNdWx0aVNwYXduOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE9iamVjdFBvb2wucHJvdG90eXBlLCBcImF1dG9SZWxlYXNlSW50ZXJ2YWxcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fZkF1dG9SZWxlYXNlSW50ZXJ2YWw7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1fZkF1dG9SZWxlYXNlSW50ZXJ2YWwgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPYmplY3RQb29sLnByb3RvdHlwZSwgXCJjYXBhY2l0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9pQ2FwYWNpdHk7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA8IDApXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2FwYWNpdHkgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tX2lDYXBhY2l0eSA9PSB2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRoaXMubV9pQ2FwYWNpdHkgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbGVhc2UoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0UG9vbC5wcm90b3R5cGUsIFwiZXhwaXJlVGltZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9mRXhwaXJlVGltZTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIDwgMClcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHBpcmVUaW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubV9mRXhwaXJlVGltZSA9PSB2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRoaXMubV9mRXhwaXJlVGltZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMucmVsZWFzZSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPYmplY3RQb29sLnByb3RvdHlwZSwgXCJwcmlvcml0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9pUHJpb3JpdHk7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1faVByaW9yaXR5ID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3RQb29sLnByb3RvdHlwZS5yZWdpc3RlciA9IGZ1bmN0aW9uIChvYmosIHNwYXduZWQpIHtcbiAgICAgICAgICAgIGlmICghb2JqKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignb2JqZWN0IGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB2YXIgdl9wT2JqZWN0cyA9IHRoaXMuZ2V0T2JqZWN0cyhvYmoubmFtZSk7XG4gICAgICAgICAgICBpZiAoIXZfcE9iamVjdHMpIHtcbiAgICAgICAgICAgICAgICB2X3BPYmplY3RzID0gW107XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BPYmplY3RzLnNldChvYmoubmFtZSwgdl9wT2JqZWN0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdl9wSW50ZXJuYWxPYmplY3QgPSBSZWZPYmplY3QuY3JlYXRlKG9iaiwgc3Bhd25lZCk7XG4gICAgICAgICAgICB2X3BPYmplY3RzLnB1c2godl9wSW50ZXJuYWxPYmplY3QpO1xuICAgICAgICAgICAgdGhpcy5tX3BPYmplY3RNYXAuc2V0KG9iai50YXJnZXQsIHZfcEludGVybmFsT2JqZWN0KTtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvdW50ID4gdGhpcy5tX2lDYXBhY2l0eSlcbiAgICAgICAgICAgICAgICB0aGlzLnJlbGVhc2UoKTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbC5wcm90b3R5cGUuY2FuU3Bhd24gPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgdmFyIGVfMSwgX2E7XG4gICAgICAgICAgICBuYW1lID0gbmFtZSB8fCAnJztcbiAgICAgICAgICAgIHZhciB2X3BPYmplY3RzID0gdGhpcy5nZXRPYmplY3RzKG5hbWUpO1xuICAgICAgICAgICAgaWYgKHZfcE9iamVjdHMpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciB2X3BPYmplY3RzXzEgPSBfX3ZhbHVlcyh2X3BPYmplY3RzKSwgdl9wT2JqZWN0c18xXzEgPSB2X3BPYmplY3RzXzEubmV4dCgpOyAhdl9wT2JqZWN0c18xXzEuZG9uZTsgdl9wT2JqZWN0c18xXzEgPSB2X3BPYmplY3RzXzEubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW50ZXJuYWxPYmplY3QgPSB2X3BPYmplY3RzXzFfMS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fYkFsbG93TXVsdGlTcGF3biB8fCAhaW50ZXJuYWxPYmplY3QuaXNJblVzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzFfMSkgeyBlXzEgPSB7IGVycm9yOiBlXzFfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodl9wT2JqZWN0c18xXzEgJiYgIXZfcE9iamVjdHNfMV8xLmRvbmUgJiYgKF9hID0gdl9wT2JqZWN0c18xLnJldHVybikpIF9hLmNhbGwodl9wT2JqZWN0c18xKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBPYmplY3RQb29sLnByb3RvdHlwZS5zcGF3biA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICB2YXIgZV8yLCBfYTtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lIHx8ICcnO1xuICAgICAgICAgICAgdmFyIHZfcE9iamVjdHMgPSB0aGlzLmdldE9iamVjdHMobmFtZSk7XG4gICAgICAgICAgICBpZiAodl9wT2JqZWN0cykge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHZfcE9iamVjdHNfMiA9IF9fdmFsdWVzKHZfcE9iamVjdHMpLCB2X3BPYmplY3RzXzJfMSA9IHZfcE9iamVjdHNfMi5uZXh0KCk7ICF2X3BPYmplY3RzXzJfMS5kb25lOyB2X3BPYmplY3RzXzJfMSA9IHZfcE9iamVjdHNfMi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbnRlcm5hbE9iamVjdCA9IHZfcE9iamVjdHNfMl8xLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubV9iQWxsb3dNdWx0aVNwYXduIHx8ICFpbnRlcm5hbE9iamVjdC5pc0luVXNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGludGVybmFsT2JqZWN0LnNwYXduKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVfMl8xKSB7IGVfMiA9IHsgZXJyb3I6IGVfMl8xIH07IH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2X3BPYmplY3RzXzJfMSAmJiAhdl9wT2JqZWN0c18yXzEuZG9uZSAmJiAoX2EgPSB2X3BPYmplY3RzXzIucmV0dXJuKSkgX2EuY2FsbCh2X3BPYmplY3RzXzIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8yKSB0aHJvdyBlXzIuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbC5wcm90b3R5cGUudW5zcGF3biA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIGlmICghb2JqKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignT2JqZWN0IGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB0aGlzLnVuc3Bhd25CeVRhcmdldChvYmoudGFyZ2V0KTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbC5wcm90b3R5cGUudW5zcGF3bkJ5VGFyZ2V0ID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICAgICAgaWYgKCF0YXJnZXQpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUYXJnZXQgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHZhciB2X3BJbnRlcm5hbE9iamVjdCA9IHRoaXMuZ2V0T2JqZWN0QnlUYXJnZXQodGFyZ2V0KTtcbiAgICAgICAgICAgIGlmICh2X3BJbnRlcm5hbE9iamVjdCkge1xuICAgICAgICAgICAgICAgIHZfcEludGVybmFsT2JqZWN0LnVuc3Bhd24oKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb3VudCA+IHRoaXMubV9pQ2FwYWNpdHkgJiYgdl9wSW50ZXJuYWxPYmplY3Quc3Bhd25Db3VudCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVsZWFzZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgZmluZCB0YXJnZXQgaW4gb2JqZWN0IHBvb2wgJ1wiICsgdGhpcy5uYW1lICsgXCInLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbC5wcm90b3R5cGUuc2V0TG9ja2VkID0gZnVuY3Rpb24gKG9iaiwgbG9ja2VkKSB7XG4gICAgICAgICAgICBpZiAoIW9iailcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09iamVjdCBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdGhpcy5zZXRMb2NrZWRCeVRhcmdldChvYmoudGFyZ2V0LCBsb2NrZWQpO1xuICAgICAgICB9O1xuICAgICAgICBPYmplY3RQb29sLnByb3RvdHlwZS5zZXRMb2NrZWRCeVRhcmdldCA9IGZ1bmN0aW9uICh0YXJnZXQsIGxvY2tlZCkge1xuICAgICAgICAgICAgaWYgKCF0YXJnZXQpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUYXJnZXQgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHZhciB2X3BJbnRlcm5hbE9iamVjdCA9IHRoaXMuZ2V0T2JqZWN0QnlUYXJnZXQodGFyZ2V0KTtcbiAgICAgICAgICAgIGlmICh2X3BJbnRlcm5hbE9iamVjdCkge1xuICAgICAgICAgICAgICAgIHZfcEludGVybmFsT2JqZWN0LmxvY2tlZCA9IGxvY2tlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgZmluZCB0YXJnZXQgaW4gb2JqZWN0IHBvb2wgJ1wiICsgdGhpcy5uYW1lICsgXCInLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbC5wcm90b3R5cGUuc2V0UHJpb3JpdHkgPSBmdW5jdGlvbiAob2JqLCBwcmlvcml0eSkge1xuICAgICAgICAgICAgaWYgKCFvYmopXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPYmplY3QgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHRoaXMuc2V0UHJpb3JpdHlCeVRhcmdldChvYmoudGFyZ2V0LCBwcmlvcml0eSk7XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdFBvb2wucHJvdG90eXBlLnNldFByaW9yaXR5QnlUYXJnZXQgPSBmdW5jdGlvbiAodGFyZ2V0LCBwcmlvcml0eSkge1xuICAgICAgICAgICAgaWYgKCF0YXJnZXQpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUYXJnZXQgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHZhciB2X3BJbnRlcm5hbE9iamVjdCA9IHRoaXMuZ2V0T2JqZWN0QnlUYXJnZXQodGFyZ2V0KTtcbiAgICAgICAgICAgIGlmICh2X3BJbnRlcm5hbE9iamVjdCkge1xuICAgICAgICAgICAgICAgIHZfcEludGVybmFsT2JqZWN0LnByaW9yaXR5ID0gcHJpb3JpdHk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGZpbmQgdGFyZ2V0IGluIG9iamVjdCBwb29sICdcIiArIHRoaXMubmFtZSArIFwiJy5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdFBvb2wucHJvdG90eXBlLnJlbGVhc2UgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgdmFyIGVfMywgX2E7XG4gICAgICAgICAgICB2YXIgdG9SZWxlYXNlQ291bnQgPSB0aGlzLmNvdW50IC0gdGhpcy5tX2lDYXBhY2l0eTtcbiAgICAgICAgICAgIHZhciBmaWx0ZXIgPSB0aGlzLmRlZmF1bHRSZWxlYXNlT2JqZWN0RmlsdGVyQ2FsbGJhY2suYmluZCh0aGlzKTtcbiAgICAgICAgICAgIGlmICh1bmRlZmluZWQgIT09IGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoJ251bWJlcicgPT09IHR5cGVvZiBhKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvUmVsZWFzZUNvdW50ID0gYTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlciA9IGE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh1bmRlZmluZWQgIT09IGIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2YgYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9SZWxlYXNlQ291bnQgPSBiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyID0gYjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghZmlsdGVyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZWxlYXNlIG9iamVjdCBmaWx0ZXIgY2FsbGJhY2sgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0b1JlbGVhc2VDb3VudCA8IDApXG4gICAgICAgICAgICAgICAgdG9SZWxlYXNlQ291bnQgPSAwO1xuICAgICAgICAgICAgdmFyIHZfZkV4cGlyZVRpbWUgPSBEYXRlVGltZU1pblRpbWVzdGFtcDtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fZkV4cGlyZVRpbWUgPCBOdW1iZXIuTUFYX1ZBTFVFKVxuICAgICAgICAgICAgICAgIHZfZkV4cGlyZVRpbWUgPSBuZXcgRGF0ZSgpLnZhbHVlT2YoKSAtIHRoaXMubV9mRXhwaXJlVGltZTtcbiAgICAgICAgICAgIHRoaXMubV9mQXV0b1JlbGVhc2VUaW1lID0gMDtcbiAgICAgICAgICAgIHRoaXMuZ2V0Q2FuUmVsZWFzZU9iamVjdHModGhpcy5tX3BDYWNoZUNhblJlbGVhc2VPYmpldHMpO1xuICAgICAgICAgICAgdmFyIHZfcFRvUmVsZWFzZU9iamVjdHMgPSBmaWx0ZXIodGhpcy5tX3BDYWNoZUNhblJlbGVhc2VPYmpldHMsIHRvUmVsZWFzZUNvdW50LCB2X2ZFeHBpcmVUaW1lKTtcbiAgICAgICAgICAgIGlmICghdl9wVG9SZWxlYXNlT2JqZWN0cyB8fCB2X3BUb1JlbGVhc2VPYmplY3RzLmxlbmd0aCA8PSAwKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgdl9wVG9SZWxlYXNlT2JqZWN0c18xID0gX192YWx1ZXModl9wVG9SZWxlYXNlT2JqZWN0cyksIHZfcFRvUmVsZWFzZU9iamVjdHNfMV8xID0gdl9wVG9SZWxlYXNlT2JqZWN0c18xLm5leHQoKTsgIXZfcFRvUmVsZWFzZU9iamVjdHNfMV8xLmRvbmU7IHZfcFRvUmVsZWFzZU9iamVjdHNfMV8xID0gdl9wVG9SZWxlYXNlT2JqZWN0c18xLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdG9SZWxlYXNlT2JqZWN0ID0gdl9wVG9SZWxlYXNlT2JqZWN0c18xXzEudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVsZWFzZU9iamVjdCh0b1JlbGVhc2VPYmplY3QpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzNfMSkgeyBlXzMgPSB7IGVycm9yOiBlXzNfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodl9wVG9SZWxlYXNlT2JqZWN0c18xXzEgJiYgIXZfcFRvUmVsZWFzZU9iamVjdHNfMV8xLmRvbmUgJiYgKF9hID0gdl9wVG9SZWxlYXNlT2JqZWN0c18xLnJldHVybikpIF9hLmNhbGwodl9wVG9SZWxlYXNlT2JqZWN0c18xKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzMpIHRocm93IGVfMy5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBPYmplY3RQb29sLnByb3RvdHlwZS5yZWxlYXNlQWxsVW51c2VkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfNCwgX2E7XG4gICAgICAgICAgICB0aGlzLm1fZkF1dG9SZWxlYXNlVGltZSA9IDA7XG4gICAgICAgICAgICB0aGlzLmdldENhblJlbGVhc2VPYmplY3RzKHRoaXMubV9wQ2FjaGVDYW5SZWxlYXNlT2JqZXRzKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcENhY2hlQ2FuUmVsZWFzZU9iamV0cyksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRvUmVsZWFzZU9iamVjdCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbGVhc2VPYmplY3QodG9SZWxlYXNlT2JqZWN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV80XzEpIHsgZV80ID0geyBlcnJvcjogZV80XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNCkgdGhyb3cgZV80LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdFBvb2wucHJvdG90eXBlLmdldEFsbE9iamVjdEluZm9zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfNSwgX2EsIGVfNiwgX2I7XG4gICAgICAgICAgICB2YXIgdl9wUmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYyA9IF9fdmFsdWVzKHRoaXMubV9wT2JqZWN0cy52YWx1ZXMoKSksIF9kID0gX2MubmV4dCgpOyAhX2QuZG9uZTsgX2QgPSBfYy5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9iamVjdHMgPSBfZC52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9lID0gKGVfNiA9IHZvaWQgMCwgX192YWx1ZXMob2JqZWN0cy52YWx1ZXMoKSkpLCBfZiA9IF9lLm5leHQoKTsgIV9mLmRvbmU7IF9mID0gX2UubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGludGVybmFsT2JqZWN0ID0gX2YudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdl9wUmVzdWx0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaW50ZXJuYWxPYmplY3QubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9ja2VkOiBpbnRlcm5hbE9iamVjdC5sb2NrZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbUNhblJlbGVhc2VGbGFnOiBpbnRlcm5hbE9iamVjdC5jdXN0b21DYW5SZWxlYXNlRmxhZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJpb3JpdHk6IGludGVybmFsT2JqZWN0LnByaW9yaXR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0VXNlVGltZTogaW50ZXJuYWxPYmplY3QubGFzdFVzZVRpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwYXduQ291bnQ6IGludGVybmFsT2JqZWN0LnNwYXduQ291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzSW5Vc2U6IGludGVybmFsT2JqZWN0LmlzSW5Vc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZV82XzEpIHsgZV82ID0geyBlcnJvcjogZV82XzEgfTsgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9mICYmICFfZi5kb25lICYmIChfYiA9IF9lLnJldHVybikpIF9iLmNhbGwoX2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzYpIHRocm93IGVfNi5lcnJvcjsgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfNV8xKSB7IGVfNSA9IHsgZXJyb3I6IGVfNV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfZCAmJiAhX2QuZG9uZSAmJiAoX2EgPSBfYy5yZXR1cm4pKSBfYS5jYWxsKF9jKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzUpIHRocm93IGVfNS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZfcFJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdFBvb2wucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgdGhpcy5tX2ZBdXRvUmVsZWFzZVRpbWUgKz0gcmVhbEVsYXBzZWQ7XG4gICAgICAgICAgICBpZiAodGhpcy5tX2ZBdXRvUmVsZWFzZVRpbWUgPCB0aGlzLm1fZkF1dG9SZWxlYXNlSW50ZXJ2YWwpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5yZWxlYXNlKCk7XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdFBvb2wucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfNywgX2E7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BPYmplY3RNYXAudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvYmplY3RJbk1hcCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBvYmplY3RJbk1hcC5yZWxlYXNlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAvLyBGSVhNRTogUmVmZXJlbmNlUG9vbC5yZWxlYXNlKG9iamVjdEluTWFwKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzdfMSkgeyBlXzcgPSB7IGVycm9yOiBlXzdfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV83KSB0aHJvdyBlXzcuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wT2JqZWN0cy5jbGVhcigpO1xuICAgICAgICAgICAgdGhpcy5tX3BPYmplY3RNYXAuY2xlYXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbC5wcm90b3R5cGUuZ2V0T2JqZWN0cyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcE9iamVjdHMuZ2V0KG5hbWUpIHx8IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdFBvb2wucHJvdG90eXBlLmdldE9iamVjdEJ5VGFyZ2V0ID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICAgICAgaWYgKCF0YXJnZXQpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUYXJnZXQgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcE9iamVjdE1hcC5nZXQodGFyZ2V0KSB8fCBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBPYmplY3RQb29sLnByb3RvdHlwZS5yZWxlYXNlT2JqZWN0ID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgaWYgKCFvYmopXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPYmplY3QgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHZhciB2X3BPYmplY3RzID0gdGhpcy5nZXRPYmplY3RzKG9iai5uYW1lKTtcbiAgICAgICAgICAgIHZhciB2X3BJbnRlcm5hbE9iamVjdCA9IHRoaXMuZ2V0T2JqZWN0QnlUYXJnZXQob2JqLnRhcmdldCk7XG4gICAgICAgICAgICBpZiAobnVsbCAhPSB2X3BPYmplY3RzICYmIG51bGwgIT0gdl9wSW50ZXJuYWxPYmplY3QpIHtcbiAgICAgICAgICAgICAgICB2YXIgaWR4ID0gdl9wT2JqZWN0cy5pbmRleE9mKHZfcEludGVybmFsT2JqZWN0KTtcbiAgICAgICAgICAgICAgICBpZiAoaWR4ID4gLTEpXG4gICAgICAgICAgICAgICAgICAgIHZfcE9iamVjdHMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BPYmplY3RNYXAuZGVsZXRlKG9iai50YXJnZXQpO1xuICAgICAgICAgICAgICAgIGlmICh2X3BPYmplY3RzLmxlbmd0aCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wT2JqZWN0cy5kZWxldGUob2JqLm5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2X3BJbnRlcm5hbE9iamVjdC5yZWxlYXNlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAvLyBGSVhNRTogUmVmZXJlbmNlUG9vbC5yZWxlYXNlKHZfcEludGVybmFsT2JqZWN0KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBub3QgcmVsZWFzZSBvYmplY3Qgd2hpY2ggaXMgbm90IGZvdW5kLicpO1xuICAgICAgICB9O1xuICAgICAgICBPYmplY3RQb29sLnByb3RvdHlwZS5nZXRDYW5SZWxlYXNlT2JqZWN0cyA9IGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgICAgICB2YXIgZV84LCBfYTtcbiAgICAgICAgICAgIGlmICghcmVzdWx0cylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Jlc3VsdHMgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHJlc3VsdHMuc3BsaWNlKDAsIHJlc3VsdHMubGVuZ3RoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcE9iamVjdE1hcC52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGludGVybmFsT2JqZWN0ID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnRlcm5hbE9iamVjdC5pc0luVXNlIHx8IGludGVybmFsT2JqZWN0LmxvY2tlZCB8fCAhaW50ZXJuYWxPYmplY3QuY3VzdG9tQ2FuUmVsZWFzZUZsYWcpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGludGVybmFsT2JqZWN0LnBlZWsoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfOF8xKSB7IGVfOCA9IHsgZXJyb3I6IGVfOF8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzgpIHRocm93IGVfOC5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBPYmplY3RQb29sLnByb3RvdHlwZS5kZWZhdWx0UmVsZWFzZU9iamVjdEZpbHRlckNhbGxiYWNrID0gZnVuY3Rpb24gKGNhbmRpZGF0ZU9iamVjdHMsIHRvUmVsZWFzZUNvdW50LCBleHBpcmVUaW1lKSB7XG4gICAgICAgICAgICB0aGlzLm1fcENhY2hlVG9SZWxlYXNlT2JqZWN0cy5zcGxpY2UoMCwgdGhpcy5tX3BDYWNoZVRvUmVsZWFzZU9iamVjdHMubGVuZ3RoKTtcbiAgICAgICAgICAgIGlmIChleHBpcmVUaW1lID4gRGF0ZVRpbWVNaW5UaW1lc3RhbXApIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gY2FuZGlkYXRlT2JqZWN0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2FuZGlkYXRlT2JqZWN0c1tpXS5sYXN0VXNlVGltZSA8PSBleHBpcmVUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcENhY2hlVG9SZWxlYXNlT2JqZWN0cy5wdXNoKGNhbmRpZGF0ZU9iamVjdHNbaV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FuZGlkYXRlT2JqZWN0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0b1JlbGVhc2VDb3VudCAtPSB0aGlzLm1fcENhY2hlVG9SZWxlYXNlT2JqZWN0cy5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgdG9SZWxlYXNlQ291bnQgPiAwICYmIGkgPCBjYW5kaWRhdGVPYmplY3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IGkgKyAxOyBqIDwgY2FuZGlkYXRlT2JqZWN0cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2FuZGlkYXRlT2JqZWN0c1tpXS5wcmlvcml0eSA+IGNhbmRpZGF0ZU9iamVjdHNbal0ucHJpb3JpdHkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbmRpZGF0ZU9iamVjdHNbaV0ucHJpb3JpdHkgPT0gY2FuZGlkYXRlT2JqZWN0c1tqXS5wcmlvcml0eSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbmRpZGF0ZU9iamVjdHNbaV0ubGFzdFVzZVRpbWUgPiBjYW5kaWRhdGVPYmplY3RzW2pdLmxhc3RVc2VUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdl9wVGVtcCA9IGNhbmRpZGF0ZU9iamVjdHNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBjYW5kaWRhdGVPYmplY3RzW2ldID0gY2FuZGlkYXRlT2JqZWN0c1tqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbmRpZGF0ZU9iamVjdHNbal0gPSB2X3BUZW1wO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMubV9wQ2FjaGVUb1JlbGVhc2VPYmplY3RzLnB1c2goY2FuZGlkYXRlT2JqZWN0c1tpXSk7XG4gICAgICAgICAgICAgICAgdG9SZWxlYXNlQ291bnQtLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcENhY2hlVG9SZWxlYXNlT2JqZWN0cztcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIE9iamVjdFBvb2w7XG4gICAgfShPYmplY3RQb29sQmFzZSkpOyAvLyBjbGFzcyBPYmplY3RQb29sXG4gICAgdmFyIFJlZk9iamVjdCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gUmVmT2JqZWN0KCkge1xuICAgICAgICAgICAgdGhpcy5tX3BPYmplY3QgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX2lTcGF3bkNvdW50ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUmVmT2JqZWN0LnByb3RvdHlwZSwgXCJuYW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BPYmplY3QubmFtZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZWZPYmplY3QucHJvdG90eXBlLCBcImxvY2tlZFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wT2JqZWN0LmxvY2tlZDsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9wT2JqZWN0LmxvY2tlZCA9IHZhbHVlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFJlZk9iamVjdC5wcm90b3R5cGUsIFwicHJpb3JpdHlcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcE9iamVjdC5wcmlvcml0eTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9wT2JqZWN0LnByaW9yaXR5ID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUmVmT2JqZWN0LnByb3RvdHlwZSwgXCJjdXN0b21DYW5SZWxlYXNlRmxhZ1wiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wT2JqZWN0LmN1c3RvbUNhblJlbGVhc2VGbGFnOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFJlZk9iamVjdC5wcm90b3R5cGUsIFwibGFzdFVzZVRpbWVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcE9iamVjdC5sYXN0VXNlVGltZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZWZPYmplY3QucHJvdG90eXBlLCBcImlzSW5Vc2VcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1faVNwYXduQ291bnQgPiAwOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFJlZk9iamVjdC5wcm90b3R5cGUsIFwic3Bhd25Db3VudFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9pU3Bhd25Db3VudDsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFJlZk9iamVjdC5jcmVhdGUgPSBmdW5jdGlvbiAob2JqLCBzcGF3bmVkKSB7XG4gICAgICAgICAgICBpZiAoIW9iailcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09iamVjdCBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgLy8gRklYTUU6IGxldCB2X3BJbnRlcm5hbE9iamVjdDogUmVmT2JqZWN0PFQ+ID0gUmVmZXJlbmNlUG9vbC5hY3F1aXJlPFJlZk9iamVjdDxUPj4oKTtcbiAgICAgICAgICAgIHZhciB2X3BJbnRlcm5hbE9iamVjdCA9IG5ldyBSZWZPYmplY3QoKTtcbiAgICAgICAgICAgIHZfcEludGVybmFsT2JqZWN0Lm1fcE9iamVjdCA9IG9iajtcbiAgICAgICAgICAgIHZfcEludGVybmFsT2JqZWN0Lm1faVNwYXduQ291bnQgPSBzcGF3bmVkID8gMSA6IDA7XG4gICAgICAgICAgICBpZiAoc3Bhd25lZClcbiAgICAgICAgICAgICAgICBvYmoub25TcGF3bigpO1xuICAgICAgICAgICAgcmV0dXJuIHZfcEludGVybmFsT2JqZWN0O1xuICAgICAgICB9O1xuICAgICAgICBSZWZPYmplY3QucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5tX3BPYmplY3QgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX2lTcGF3bkNvdW50ID0gMDtcbiAgICAgICAgfTtcbiAgICAgICAgUmVmT2JqZWN0LnByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wT2JqZWN0O1xuICAgICAgICB9O1xuICAgICAgICBSZWZPYmplY3QucHJvdG90eXBlLnNwYXduID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5tX2lTcGF3bkNvdW50Kys7XG4gICAgICAgICAgICB0aGlzLm1fcE9iamVjdC5sYXN0VXNlVGltZSA9IG5ldyBEYXRlKCkudmFsdWVPZigpO1xuICAgICAgICAgICAgdGhpcy5tX3BPYmplY3Qub25TcGF3bigpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wT2JqZWN0O1xuICAgICAgICB9O1xuICAgICAgICBSZWZPYmplY3QucHJvdG90eXBlLnVuc3Bhd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLm1fcE9iamVjdC5vblVuc3Bhd24oKTtcbiAgICAgICAgICAgIHRoaXMubV9wT2JqZWN0Lmxhc3RVc2VUaW1lID0gbmV3IERhdGUoKS52YWx1ZU9mKCk7XG4gICAgICAgICAgICB0aGlzLm1faVNwYXduQ291bnQtLTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1faVNwYXduQ291bnQgPCAwKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU3Bhd24gY291bnQgaXMgbGVzcyB0aGFuIDAuJyk7XG4gICAgICAgIH07XG4gICAgICAgIFJlZk9iamVjdC5wcm90b3R5cGUucmVsZWFzZSA9IGZ1bmN0aW9uIChpc1NodXRkb3duKSB7XG4gICAgICAgICAgICB0aGlzLm1fcE9iamVjdC5yZWxlYXNlKGlzU2h1dGRvd24pO1xuICAgICAgICAgICAgLy8gRklYTUU6IFJlZmVyZW5jZVBvb2wucmVsZWFzZSh0aGlzLm1fcE9iamVjdCBhcyBJUmVmZXJlbmNlKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFJlZk9iamVjdDtcbiAgICB9KCkpOyAvLyBjbGFzcyBSZWZPYmplY3RcbiAgICBmdW5jdGlvbiBjcmVhdGVPYmplY3RJbmZvKG5hbWUsIGxvY2tlZCwgY3VzdG9tQ2FuUmVsZWFzZUZsYWcsIHByaW9yaXR5LCBsYXN0VXNlVGltZSwgc3Bhd25Db3VudCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgIGxvY2tlZDogbG9ja2VkLFxuICAgICAgICAgICAgY3VzdG9tQ2FuUmVsZWFzZUZsYWc6IGN1c3RvbUNhblJlbGVhc2VGbGFnLFxuICAgICAgICAgICAgcHJpb3JpdHk6IHByaW9yaXR5LFxuICAgICAgICAgICAgbGFzdFVzZVRpbWU6IGxhc3RVc2VUaW1lLFxuICAgICAgICAgICAgaXNJblVzZTogZmFsc2UsXG4gICAgICAgICAgICBzcGF3bkNvdW50OiBzcGF3bkNvdW50XG4gICAgICAgIH07XG4gICAgfVxuICAgIHZhciBPYmplY3RCYXNlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBPYmplY3RCYXNlKCkge1xuICAgICAgICAgICAgdGhpcy5tX3NOYW1lID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9wVGFyZ2V0ID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9iTG9ja2VkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm1faVByaW9yaXR5ID0gMDtcbiAgICAgICAgICAgIHRoaXMubV91TGFzdFVzZVRpbWUgPSAwO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPYmplY3RCYXNlLnByb3RvdHlwZSwgXCJuYW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3NOYW1lOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE9iamVjdEJhc2UucHJvdG90eXBlLCBcInRhcmdldFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wVGFyZ2V0OyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE9iamVjdEJhc2UucHJvdG90eXBlLCBcImxvY2tlZFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9iTG9ja2VkOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX2JMb2NrZWQgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPYmplY3RCYXNlLnByb3RvdHlwZSwgXCJwcmlvcml0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9pUHJpb3JpdHk7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1faVByaW9yaXR5ID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0QmFzZS5wcm90b3R5cGUsIFwiY3VzdG9tQ2FuUmVsZWFzZUZsYWdcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0cnVlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE9iamVjdEJhc2UucHJvdG90eXBlLCBcImxhc3RVc2VUaW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3VMYXN0VXNlVGltZTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV91TGFzdFVzZVRpbWUgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdEJhc2UucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbiAobmFtZU9yVGFyZ2V0LCB0YXJnZXQsIGxvY2tlZCwgcHJpb3JpdHkpIHtcbiAgICAgICAgICAgIHZhciBuYW1lO1xuICAgICAgICAgICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgbmFtZU9yVGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWVPclRhcmdldDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhcmdldCA9IG5hbWVPclRhcmdldDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9zTmFtZSA9IG5hbWUgfHwgJyc7XG4gICAgICAgICAgICB0aGlzLm1fcFRhcmdldCA9IHRhcmdldCB8fCBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX2JMb2NrZWQgPSBsb2NrZWQgfHwgZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm1faVByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMDtcbiAgICAgICAgICAgIHRoaXMubV91TGFzdFVzZVRpbWUgPSBuZXcgRGF0ZSgpLnZhbHVlT2YoKTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0QmFzZS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLm1fc05hbWUgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX3BUYXJnZXQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX2JMb2NrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubV9pUHJpb3JpdHkgPSAwO1xuICAgICAgICAgICAgdGhpcy5tX3VMYXN0VXNlVGltZSA9IDA7XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdEJhc2UucHJvdG90eXBlLm9uU3Bhd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdEJhc2UucHJvdG90eXBlLm9uVW5zcGF3biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIE9iamVjdEJhc2U7XG4gICAgfSgpKTsgLy8gY2xhc3MgT2JqZWN0QmFzZVxuICAgIGV4cG9ydHMuT2JqZWN0QmFzZSA9IE9iamVjdEJhc2U7XG4gICAgdmFyIE9iamVjdFBvb2xNYW5hZ2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICBfX2V4dGVuZHMoT2JqZWN0UG9vbE1hbmFnZXIsIF9zdXBlcik7XG4gICAgICAgIGZ1bmN0aW9uIE9iamVjdFBvb2xNYW5hZ2VyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgICAgICAgICBfdGhpcy5tX3BPYmplY3RQb29scyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLCBcInByaW9yaXR5XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiA5MDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLCBcImNvdW50XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcE9iamVjdFBvb2xzLnNpemU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgdmFyIGVfOSwgX2E7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BPYmplY3RQb29scy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9iamVjdFBvb2wgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0UG9vbC51cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzlfMSkgeyBlXzkgPSB7IGVycm9yOiBlXzlfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV85KSB0aHJvdyBlXzkuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfMTAsIF9hO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wT2JqZWN0UG9vbHMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvYmplY3RQb29sID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIG9iamVjdFBvb2wuc2h1dGRvd24oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xMF8xKSB7IGVfMTAgPSB7IGVycm9yOiBlXzEwXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMTApIHRocm93IGVfMTAuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wT2JqZWN0UG9vbHMuY2xlYXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLmhhc09iamVjdFBvb2wgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgLy8gcHJvY2VzcyB3aXRoIG5hbWUganVzdCBvbmx5LlxuICAgICAgICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRnVsbCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wT2JqZWN0UG9vbHMuaGFzKG5hbWUpO1xuICAgICAgICB9O1xuICAgICAgICBPYmplY3RQb29sTWFuYWdlci5wcm90b3R5cGUuZ2V0T2JqZWN0UG9vbCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPYmplY3RQb29sQmFzZShuYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLmdldE9iamVjdFBvb2xCYXNlID0gZnVuY3Rpb24gKG5hbWVPclByZWRpY2F0ZSkge1xuICAgICAgICAgICAgdmFyIGVfMTEsIF9hO1xuICAgICAgICAgICAgdmFyIG5hbWU7XG4gICAgICAgICAgICB2YXIgcHJlZGljYXRlO1xuICAgICAgICAgICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgbmFtZU9yUHJlZGljYXRlKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWVPclByZWRpY2F0ZTtcbiAgICAgICAgICAgICAgICBpZiAoIW5hbWUpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZ1bGwgbmFtZSBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBuYW1lT3JQcmVkaWNhdGUpIHtcbiAgICAgICAgICAgICAgICBwcmVkaWNhdGUgPSBuYW1lT3JQcmVkaWNhdGU7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcE9iamVjdFBvb2xzLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9iaiA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByZWRpY2F0ZShvYmopKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVfMTFfMSkgeyBlXzExID0geyBlcnJvcjogZV8xMV8xIH07IH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMTEpIHRocm93IGVfMTEuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BPYmplY3RQb29scy5nZXQobmFtZSkgfHwgbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLmdldE9iamVjdFBvb2xzID0gZnVuY3Rpb24gKHByZWRpY2F0ZSwgcmVzdWx0cykge1xuICAgICAgICAgICAgdmFyIGVfMTIsIF9hO1xuICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMgfHwgW107XG4gICAgICAgICAgICByZXN1bHRzLnNwbGljZSgwLCByZXN1bHRzLmxlbmd0aCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BPYmplY3RQb29scy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9iaiA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJlZGljYXRlKG9iaikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChvYmopO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMTJfMSkgeyBlXzEyID0geyBlcnJvcjogZV8xMl8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEyKSB0aHJvdyBlXzEyLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLmdldEFsbE9iamVjdFBvb2xzID0gZnVuY3Rpb24gKHNvcnRPclJlc3VsdHMsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgIHZhciBlXzEzLCBfYTtcbiAgICAgICAgICAgIHZhciBzb3J0ID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAodW5kZWZpbmVkICE9PSB0eXBlb2Ygc29ydE9yUmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGlmICgnYm9vbGVhbicgPT09IHR5cGVvZiBzb3J0T3JSZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNvcnQgPSBzb3J0T3JSZXN1bHRzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IHNvcnRPclJlc3VsdHM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMgfHwgW107XG4gICAgICAgICAgICByZXN1bHRzLnNwbGljZSgwLCByZXN1bHRzLmxlbmd0aCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BPYmplY3RQb29scy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9iaiA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gob2JqKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xM18xKSB7IGVfMTMgPSB7IGVycm9yOiBlXzEzXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMTMpIHRocm93IGVfMTMuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzb3J0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYS5wcmlvcml0eSA+IGIucHJpb3JpdHkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoYS5wcmlvcml0eSA8IGIucHJpb3JpdHkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdFBvb2xNYW5hZ2VyLnByb3RvdHlwZS5jcmVhdGVTaW5nbGVTcGF3bk9iamVjdFBvb2wgPSBmdW5jdGlvbiAob3B0aW9uKSB7XG4gICAgICAgICAgICB2YXIgdl9zdFBhcmFtcyA9IG9wdGlvbiB8fCB7fTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmludGVybmFsQ3JlYXRlT2JqZWN0UG9vbCh2X3N0UGFyYW1zLm5hbWUgfHwgJycsIGZhbHNlLCB2X3N0UGFyYW1zLmV4cGlyZVRpbWUgfHwgRGVmYXVsdEV4cGlyZVRpbWUsIHZfc3RQYXJhbXMuY2FwYWNpdHkgfHwgRGVmYXVsdENhcGFjaXR5LCB2X3N0UGFyYW1zLmV4cGlyZVRpbWUgfHwgRGVmYXVsdEV4cGlyZVRpbWUsIHZfc3RQYXJhbXMucHJpb3JpdHkgfHwgRGVmYXVsdFByaW9yaXR5KTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLmNyZWF0ZU11dGxpU3Bhd25PYmplY3RQb29sID0gZnVuY3Rpb24gKG9wdGlvbikge1xuICAgICAgICAgICAgdmFyIHZfc3RQYXJhbXMgPSBvcHRpb24gfHwge307XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbENyZWF0ZU9iamVjdFBvb2wodl9zdFBhcmFtcy5uYW1lIHx8ICcnLCB2X3N0UGFyYW1zLmFsbG93TXVsdGlTcGF3biB8fCB0cnVlLCB2X3N0UGFyYW1zLmF1dG9SZWxlYXNlSW50ZXJ2YWwgfHwgRGVmYXVsdEV4cGlyZVRpbWUsIHZfc3RQYXJhbXMuY2FwYWNpdHkgfHwgRGVmYXVsdENhcGFjaXR5LCB2X3N0UGFyYW1zLmV4cGlyZVRpbWUgfHwgRGVmYXVsdEV4cGlyZVRpbWUsIHZfc3RQYXJhbXMucHJpb3JpdHkgfHwgRGVmYXVsdFByaW9yaXR5KTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLmRlc3Ryb3lPYmplY3RQb29sID0gZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHZhciBuYW1lID0gJyc7XG4gICAgICAgICAgICBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiBhKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IGE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh1bmRlZmluZWQgIT09IGEpIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gYS5uYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxEZXN0cm95T2JqZWN0UG9vbChuYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLnJlbGVhc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZV8xNCwgX2E7XG4gICAgICAgICAgICB2YXIgdl9wT2JqZWN0UG9vbHMgPSB0aGlzLmdldEFsbE9iamVjdFBvb2xzKHRydWUpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB2X3BPYmplY3RQb29sc18xID0gX192YWx1ZXModl9wT2JqZWN0UG9vbHMpLCB2X3BPYmplY3RQb29sc18xXzEgPSB2X3BPYmplY3RQb29sc18xLm5leHQoKTsgIXZfcE9iamVjdFBvb2xzXzFfMS5kb25lOyB2X3BPYmplY3RQb29sc18xXzEgPSB2X3BPYmplY3RQb29sc18xLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgb2JqZWN0UG9vbCA9IHZfcE9iamVjdFBvb2xzXzFfMS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0UG9vbC5yZWxlYXNlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMTRfMSkgeyBlXzE0ID0geyBlcnJvcjogZV8xNF8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2X3BPYmplY3RQb29sc18xXzEgJiYgIXZfcE9iamVjdFBvb2xzXzFfMS5kb25lICYmIChfYSA9IHZfcE9iamVjdFBvb2xzXzEucmV0dXJuKSkgX2EuY2FsbCh2X3BPYmplY3RQb29sc18xKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzE0KSB0aHJvdyBlXzE0LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdFBvb2xNYW5hZ2VyLnByb3RvdHlwZS5yZWxlYXNlQWxsVW51c2VkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfMTUsIF9hO1xuICAgICAgICAgICAgdmFyIHZfcE9iamVjdFBvb2xzID0gdGhpcy5nZXRBbGxPYmplY3RQb29scyh0cnVlKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgdl9wT2JqZWN0UG9vbHNfMiA9IF9fdmFsdWVzKHZfcE9iamVjdFBvb2xzKSwgdl9wT2JqZWN0UG9vbHNfMl8xID0gdl9wT2JqZWN0UG9vbHNfMi5uZXh0KCk7ICF2X3BPYmplY3RQb29sc18yXzEuZG9uZTsgdl9wT2JqZWN0UG9vbHNfMl8xID0gdl9wT2JqZWN0UG9vbHNfMi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9iamVjdFBvb2wgPSB2X3BPYmplY3RQb29sc18yXzEudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIG9iamVjdFBvb2wucmVsZWFzZUFsbFVudXNlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzE1XzEpIHsgZV8xNSA9IHsgZXJyb3I6IGVfMTVfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodl9wT2JqZWN0UG9vbHNfMl8xICYmICF2X3BPYmplY3RQb29sc18yXzEuZG9uZSAmJiAoX2EgPSB2X3BPYmplY3RQb29sc18yLnJldHVybikpIF9hLmNhbGwodl9wT2JqZWN0UG9vbHNfMik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xNSkgdGhyb3cgZV8xNS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBPYmplY3RQb29sTWFuYWdlci5wcm90b3R5cGUuaW50ZXJuYWxDcmVhdGVPYmplY3RQb29sID0gZnVuY3Rpb24gKG5hbWUsIGFsbG93TXVsdGlTcGF3biwgYXV0b1JlbGVhc2VJbnRlcnZhbCwgY2FwYWNpdHksIGV4cGlyZVRpbWUsIHByaW9yaXR5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5oYXNPYmplY3RQb29sKG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQWxyZWFkeSBleGlzdCBvYmplY3QgcG9vbCAnXCIgKyBuYW1lICsgXCInLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2X3BPYmplY3RQb29sID0gbmV3IE9iamVjdFBvb2wobmFtZSwgYWxsb3dNdWx0aVNwYXduLCBhdXRvUmVsZWFzZUludGVydmFsLCBjYXBhY2l0eSwgZXhwaXJlVGltZSwgcHJpb3JpdHkpO1xuICAgICAgICAgICAgdGhpcy5tX3BPYmplY3RQb29scy5zZXQobmFtZSwgdl9wT2JqZWN0UG9vbCk7XG4gICAgICAgICAgICByZXR1cm4gdl9wT2JqZWN0UG9vbDtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0UG9vbE1hbmFnZXIucHJvdG90eXBlLmludGVybmFsRGVzdHJveU9iamVjdFBvb2wgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgdmFyIHZfcE9iamVjdFBvb2wgPSB0aGlzLm1fcE9iamVjdFBvb2xzLmdldChuYW1lKTtcbiAgICAgICAgICAgIGlmICh2X3BPYmplY3RQb29sKSB7XG4gICAgICAgICAgICAgICAgdl9wT2JqZWN0UG9vbC5zaHV0ZG93bigpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcE9iamVjdFBvb2xzLmRlbGV0ZShuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIE9iamVjdFBvb2xNYW5hZ2VyO1xuICAgIH0oQmFzZV8xLkZyYW1ld29ya01vZHVsZSkpOyAvLyBjbGFzcyBPYmplY3RQb29sTWFuYWdlclxuICAgIGV4cG9ydHMuT2JqZWN0UG9vbE1hbmFnZXIgPSBPYmplY3RQb29sTWFuYWdlcjtcbn0pO1xuIiwidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiLCBcIi4vRnNtXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICB2YXIgRnNtXzEgPSByZXF1aXJlKFwiLi9Gc21cIik7XG4gICAgdmFyIFByb2NlZHVyZUJhc2UgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhQcm9jZWR1cmVCYXNlLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBQcm9jZWR1cmVCYXNlKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBQcm9jZWR1cmVCYXNlO1xuICAgIH0oRnNtXzEuRnNtU3RhdGUpKTsgLy8gY2xhc3MgUHJvY2VkdXJlQmFzZVxuICAgIGV4cG9ydHMuUHJvY2VkdXJlQmFzZSA9IFByb2NlZHVyZUJhc2U7XG4gICAgdmFyIFByb2NlZHVyZU1hbmFnZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhQcm9jZWR1cmVNYW5hZ2VyLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBQcm9jZWR1cmVNYW5hZ2VyKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShQcm9jZWR1cmVNYW5hZ2VyLnByb3RvdHlwZSwgXCJwcmlvcml0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIC0xMDsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShQcm9jZWR1cmVNYW5hZ2VyLnByb3RvdHlwZSwgXCJjdXJyZW50UHJvY2VkdXJlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFByb2NlZHVyZUZzbS5jdXJyZW50U3RhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgUHJvY2VkdXJlTWFuYWdlci5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIChmc21NYW5hZ2VyLCBwcm9jZWR1cmVzKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSBmc21NYW5hZ2VyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRlNNIG1hbmFnZXIgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHRoaXMubV9wRnNtTWFuYWdlciA9IGZzbU1hbmFnZXI7XG4gICAgICAgICAgICB0aGlzLm1fcFByb2NlZHVyZUZzbSA9IGZzbU1hbmFnZXIuY3JlYXRlRnNtKCcnLCB0aGlzLCBwcm9jZWR1cmVzKTtcbiAgICAgICAgfTtcbiAgICAgICAgUHJvY2VkdXJlTWFuYWdlci5wcm90b3R5cGUuc3RhcnRQcm9jZWR1cmUgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLm1fcFByb2NlZHVyZUZzbSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBtdXN0IGluaXRpYWxpemUgcHJvY2VkdXJlIGZpcnN0LicpO1xuICAgICAgICAgICAgdGhpcy5tX3BQcm9jZWR1cmVGc20uc3RhcnQob2JqLmNvbnN0cnVjdG9yKTtcbiAgICAgICAgfTtcbiAgICAgICAgUHJvY2VkdXJlTWFuYWdlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICAvLyBOb29wLlxuICAgICAgICB9O1xuICAgICAgICBQcm9jZWR1cmVNYW5hZ2VyLnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChudWxsICE9IHRoaXMubV9wRnNtTWFuYWdlcikge1xuICAgICAgICAgICAgICAgIGlmIChudWxsICE9IHRoaXMubV9wUHJvY2VkdXJlRnNtKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wRnNtTWFuYWdlci5kZXN0cm95RnNtKHRoaXMubV9wUHJvY2VkdXJlRnNtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFByb2NlZHVyZU1hbmFnZXIucHJvdG90eXBlLmhhc1Byb2NlZHVyZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLm1fcFByb2NlZHVyZUZzbSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBtdXN0IGluaXRpYWxpemUgcHJvY2VkdXJlIGZpcnN0LicpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUHJvY2VkdXJlRnNtLmhhc1N0YXRlKHR5cGUpO1xuICAgICAgICB9O1xuICAgICAgICBQcm9jZWR1cmVNYW5hZ2VyLnByb3RvdHlwZS5nZXRQcm9jZWR1cmUgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BQcm9jZWR1cmVGc20pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgbXVzdCBpbml0aWFsaXplIHByb2NlZHVyZSBmaXJzdC4nKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFByb2NlZHVyZUZzbS5nZXRTdGF0ZSh0eXBlKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFByb2NlZHVyZU1hbmFnZXI7XG4gICAgfShCYXNlXzEuRnJhbWV3b3JrTW9kdWxlKSk7IC8vIGNsYXNzIFByb2NlZHVyZU1hbmFnZXJcbiAgICBleHBvcnRzLlByb2NlZHVyZU1hbmFnZXIgPSBQcm9jZWR1cmVNYW5hZ2VyO1xufSk7XG4iLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICB2YXIgUmVzb3VyY2VNb2RlO1xuICAgIChmdW5jdGlvbiAoUmVzb3VyY2VNb2RlKSB7XG4gICAgICAgIFJlc291cmNlTW9kZVtSZXNvdXJjZU1vZGVbXCJVbnNwZWNpZmllZFwiXSA9IDBdID0gXCJVbnNwZWNpZmllZFwiO1xuICAgICAgICBSZXNvdXJjZU1vZGVbUmVzb3VyY2VNb2RlW1wiUGFja2FnZVwiXSA9IDFdID0gXCJQYWNrYWdlXCI7XG4gICAgICAgIFJlc291cmNlTW9kZVtSZXNvdXJjZU1vZGVbXCJVcGRhdGFibGVcIl0gPSAyXSA9IFwiVXBkYXRhYmxlXCI7XG4gICAgfSkoUmVzb3VyY2VNb2RlID0gZXhwb3J0cy5SZXNvdXJjZU1vZGUgfHwgKGV4cG9ydHMuUmVzb3VyY2VNb2RlID0ge30pKTsgLy8gZW51bSBSZXNvdXJjZU1vZGVcbiAgICB2YXIgTG9hZFJlc291cmNlU3RhdHVzO1xuICAgIChmdW5jdGlvbiAoTG9hZFJlc291cmNlU3RhdHVzKSB7XG4gICAgICAgIExvYWRSZXNvdXJjZVN0YXR1c1tMb2FkUmVzb3VyY2VTdGF0dXNbXCJTdWNjZXNzXCJdID0gMF0gPSBcIlN1Y2Nlc3NcIjtcbiAgICAgICAgTG9hZFJlc291cmNlU3RhdHVzW0xvYWRSZXNvdXJjZVN0YXR1c1tcIk5vdFJlYWR5XCJdID0gMV0gPSBcIk5vdFJlYWR5XCI7XG4gICAgICAgIExvYWRSZXNvdXJjZVN0YXR1c1tMb2FkUmVzb3VyY2VTdGF0dXNbXCJOb3RFeGlzdFwiXSA9IDJdID0gXCJOb3RFeGlzdFwiO1xuICAgICAgICBMb2FkUmVzb3VyY2VTdGF0dXNbTG9hZFJlc291cmNlU3RhdHVzW1wiRGVwZW5kZW5jeUVycm9yXCJdID0gM10gPSBcIkRlcGVuZGVuY3lFcnJvclwiO1xuICAgICAgICBMb2FkUmVzb3VyY2VTdGF0dXNbTG9hZFJlc291cmNlU3RhdHVzW1wiVHlwZUVycm9yXCJdID0gNF0gPSBcIlR5cGVFcnJvclwiO1xuICAgICAgICBMb2FkUmVzb3VyY2VTdGF0dXNbTG9hZFJlc291cmNlU3RhdHVzW1wiQXNzZXRFcnJvclwiXSA9IDVdID0gXCJBc3NldEVycm9yXCI7XG4gICAgfSkoTG9hZFJlc291cmNlU3RhdHVzID0gZXhwb3J0cy5Mb2FkUmVzb3VyY2VTdGF0dXMgfHwgKGV4cG9ydHMuTG9hZFJlc291cmNlU3RhdHVzID0ge30pKTsgLy8gZW51bSBMb2FkUmVzb3VyY2VTdGF0dXNcbiAgICAvKipcbiAgICAgKiBBIHJlc291cmNlIG1hbmFnZXIgbW9kdWxhciBiYXNlIG9uIGBGcmFtZXdvcmtNb2R1bGVgLlxuICAgICAqXG4gICAgICogVE9ETzogQSBnZW5lcmFsIHJlc291cmNlIG1hbmFnZW1lbnQgd2FzIG5vdCB5ZXQgaW1wbGVtZW50ZWQuXG4gICAgICpcbiAgICAgKiBAYXV0aG9yIEplcmVteSBDaGVuIChrZXlob20uY0BnbWFpbC5jb20pXG4gICAgICovXG4gICAgdmFyIFJlc291cmNlTWFuYWdlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgX19leHRlbmRzKFJlc291cmNlTWFuYWdlciwgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gUmVzb3VyY2VNYW5hZ2VyKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZXNvdXJjZU1hbmFnZXIucHJvdG90eXBlLCBcInJlc291cmNlR3JvdXBcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFJlc291cmNlR3JvdXA7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUmVzb3VyY2VNYW5hZ2VyLnByb3RvdHlwZSwgXCJyZXNvdXJjZUxvYWRlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wUmVzb3VyY2VMb2FkZXI7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChudWxsID09IHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZXR0aW5nIHJlc291cmNlIGxvYWRlciBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTG9hZGVyID0gdmFsdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFJlc291cmNlTWFuYWdlci5wcm90b3R5cGUsIFwicHJpb3JpdHlcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDcwO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFJlc291cmNlTWFuYWdlci5wcm90b3R5cGUuaGFzQXNzZXQgPSBmdW5jdGlvbiAoYXNzZXROYW1lKSB7XG4gICAgICAgICAgICBpZiAoIWFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUmVzb3VyY2VMb2FkZXIuaGFzQXNzZXQoYXNzZXROYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnByb3RvdHlwZS5sb2FkQXNzZXQgPSBmdW5jdGlvbiAoYXNzZXROYW1lLCBhc3NldFR5cGUsIHByaW9yaXR5LCBsb2FkQXNzZXRDYWxsYmFja3MsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoIWFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCFsb2FkQXNzZXRDYWxsYmFja3MpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTG9hZCBhc3NldCBjYWxsYmFja3MgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTG9hZGVyLmxvYWRBc3NldChhc3NldE5hbWUsIGFzc2V0VHlwZSwgcHJpb3JpdHksIGxvYWRBc3NldENhbGxiYWNrcywgdXNlckRhdGEpO1xuICAgICAgICB9O1xuICAgICAgICBSZXNvdXJjZU1hbmFnZXIucHJvdG90eXBlLnVubG9hZEFzc2V0ID0gZnVuY3Rpb24gKGFzc2V0KSB7XG4gICAgICAgICAgICBpZiAoIWFzc2V0KVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzc2V0IGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BSZXNvdXJjZUxvYWRlcilcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTG9hZGVyLnVubG9hZEFzc2V0KGFzc2V0KTtcbiAgICAgICAgfTtcbiAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnByb3RvdHlwZS5sb2FkU2NlbmUgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUsIHByaW9yaXR5LCBsb2FkU2NlbmVDYWxsYmFja3MsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoIXNjZW5lQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjZW5lIGFzc2V0IG5hbWUgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAoIWxvYWRTY2VuZUNhbGxiYWNrcylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2FkIHNjZW5lIGFzc2V0IGNhbGxiYWNrcyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VMb2FkZXIubG9hZFNjZW5lKHNjZW5lQXNzZXROYW1lLCBwcmlvcml0eSwgbG9hZFNjZW5lQ2FsbGJhY2tzLCB1c2VyRGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIFJlc291cmNlTWFuYWdlci5wcm90b3R5cGUudW5sb2FkU2NlbmUgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUsIHVubG9hZFNjZW5lQ2FsbGJhY2tzLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKCFzY2VuZUFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCF1bmxvYWRTY2VuZUNhbGxiYWNrcylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmxvYWQgc2NlbmUgY2FsbGJhY2tzIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZUxvYWRlci51bmxvYWRTY2VuZShzY2VuZUFzc2V0TmFtZSwgdW5sb2FkU2NlbmVDYWxsYmFja3MsIHVzZXJEYXRhKTtcbiAgICAgICAgfTtcbiAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnByb3RvdHlwZS5oYXNSZXNvdXJjZUdyb3VwID0gZnVuY3Rpb24gKHJlc291cmNlR3JvdXBOYW1lKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcFJlc291cmNlTG9hZGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZUxvYWRlci51cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBSZXNvdXJjZU1hbmFnZXIucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wUmVzb3VyY2VMb2FkZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTG9hZGVyLnNodXRkb3duKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBSZXNvdXJjZU1hbmFnZXI7XG4gICAgfShCYXNlXzEuRnJhbWV3b3JrTW9kdWxlKSk7IC8vIGNsYXNzIFJlc291cmNlTWFuYWdlclxuICAgIGV4cG9ydHMuUmVzb3VyY2VNYW5hZ2VyID0gUmVzb3VyY2VNYW5hZ2VyO1xufSk7XG4iLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbnZhciBfX3ZhbHVlcyA9ICh0aGlzICYmIHRoaXMuX192YWx1ZXMpIHx8IGZ1bmN0aW9uKG8pIHtcbiAgICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xufTtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICB2YXIgU2NlbmVNYW5hZ2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICBfX2V4dGVuZHMoU2NlbmVNYW5hZ2VyLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBTY2VuZU1hbmFnZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRlZFNjZW5lQXNzZXROYW1lcyA9IFtdO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZGluZ1NjZW5lQXNzZXROYW1lcyA9IFtdO1xuICAgICAgICAgICAgX3RoaXMubV9wVW5sb2FkaW5nU2NlbmVBc3NldE5hbWVzID0gW107XG4gICAgICAgICAgICBfdGhpcy5tX3BMb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZFNjZW5lRmFpbHVyZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRTY2VuZVVwZGF0ZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRTY2VuZURlcGVuZGVuY3lBc3NldERlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcFVubG9hZFNjZW5lU3VjY2Vzc0RlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcFVubG9hZFNjZW5lRmFpbHVyZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRTY2VuZUNhbGxiYWNrcyA9IHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBfdGhpcy5vbkxvYWRTY2VuZVN1Y2Nlc3MuYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgZmFpbHVyZTogX3RoaXMub25Mb2FkU2NlbmVGYWlsdXJlLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIHVwZGF0ZTogX3RoaXMub25Mb2FkU2NlbmVVcGRhdGUuYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgZGVwZW5kZW5jeTogX3RoaXMub25Mb2FkU2NlbmVEZXBlbmRlbmN5QXNzZXQuYmluZChfdGhpcylcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBfdGhpcy5tX3BVbmxvYWRTY2VuZUNhbGxiYWNrcyA9IHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBfdGhpcy5vblVubG9hZFNjZW5lU3VjY2Vzcy5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICBmYWlsdXJlOiBfdGhpcy5vblVubG9hZFNjZW5lRmFpbHVyZS5iaW5kKF90aGlzKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU2NlbmVNYW5hZ2VyLnByb3RvdHlwZSwgXCJwcmlvcml0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gNjA7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNjZW5lTWFuYWdlci5wcm90b3R5cGUsIFwibG9hZFNjZW5lU3VjY2Vzc1wiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BMb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNjZW5lTWFuYWdlci5wcm90b3R5cGUsIFwibG9hZFNjZW5lRmFpbHVyZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BMb2FkU2NlbmVGYWlsdXJlRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNjZW5lTWFuYWdlci5wcm90b3R5cGUsIFwibG9hZFNjZW5lVXBkYXRlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcExvYWRTY2VuZVVwZGF0ZURlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTY2VuZU1hbmFnZXIucHJvdG90eXBlLCBcImxvYWRTY2VuZURlcGVuZGVuY3lBc3NldFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BMb2FkU2NlbmVEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU2NlbmVNYW5hZ2VyLnByb3RvdHlwZSwgXCJ1bmxvYWRTY2VuZVN1Y2Nlc3NcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wVW5sb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNjZW5lTWFuYWdlci5wcm90b3R5cGUsIFwidW5sb2FkU2NlbmVGYWlsdXJlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFVubG9hZFNjZW5lRmFpbHVyZURlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTY2VuZU1hbmFnZXIucHJvdG90eXBlLCBcInJlc291cmNlTWFuYWdlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlciA9IHZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUuc2NlbmVJc0xvYWRpbmcgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUpIHtcbiAgICAgICAgICAgIGlmICghc2NlbmVBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgbmFtZSBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHJldHVybiBzY2VuZUFzc2V0TmFtZSBpbiB0aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXM7XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUuc2NlbmVJc0xvYWRlZCA9IGZ1bmN0aW9uIChzY2VuZUFzc2V0TmFtZSkge1xuICAgICAgICAgICAgaWYgKCFzY2VuZUFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHNjZW5lQXNzZXROYW1lIGluIHRoaXMubV9wTG9hZGVkU2NlbmVBc3NldE5hbWVzO1xuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLnNjZW5lSXNVbmxvYWRpbmcgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUpIHtcbiAgICAgICAgICAgIGlmICghc2NlbmVBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgbmFtZSBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHJldHVybiBzY2VuZUFzc2V0TmFtZSBpbiB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcztcbiAgICAgICAgfTtcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnByb3RvdHlwZS5nZXRMb2FkZWRTY2VuZUFzc2V0TmFtZXMgPSBmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMgfHwgW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubV9wTG9hZGVkU2NlbmVBc3NldE5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMubV9wTG9hZGVkU2NlbmVBc3NldE5hbWVzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLmdldExvYWRpbmdTY2VuZUFzc2V0TmFtZXMgPSBmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMgfHwgW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubV9wTG9hZGluZ1NjZW5lQXNzZXROYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUuZ2V0VW5sb2FkaW5nU2NlbmVBc3NldE5hbWVzID0gZnVuY3Rpb24gKHJlc3VsdHMpIHtcbiAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzIHx8IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfTtcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnByb3RvdHlwZS5sb2FkU2NlbmUgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUsIHByaW9yaXR5LCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKCFzY2VuZUFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1fcFJlc291cmNlTWFuYWdlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgcmVzb3VyY2UgbWFuYWdlciBmaXJzdC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5zY2VuZUlzVW5sb2FkaW5nKHNjZW5lQXNzZXROYW1lKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCAnXCIgKyBzY2VuZUFzc2V0TmFtZSArIFwiJyBpcyBiZWluZyB1bmxvYWRlZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5zY2VuZUlzTG9hZGluZyhzY2VuZUFzc2V0TmFtZSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgJ1wiICsgc2NlbmVBc3NldE5hbWUgKyBcIicgaXMgYmVpbmcgbG9hZGVkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnNjZW5lSXNMb2FkZWQoc2NlbmVBc3NldE5hbWUpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjZW5lIGFzc2V0ICdcIiArIHNjZW5lQXNzZXROYW1lICsgXCInIGlzIGFscmVhZHkgbG9hZGVkLlwiKTtcbiAgICAgICAgICAgIHRoaXMubV9wTG9hZGluZ1NjZW5lQXNzZXROYW1lcy5wdXNoKHNjZW5lQXNzZXROYW1lKTtcbiAgICAgICAgICAgIHZhciB2X2lQcmlvcml0eSA9IDA7XG4gICAgICAgICAgICB2YXIgdl9wVXNlckRhdGE7XG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAyKSB7XG4gICAgICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2YgcHJpb3JpdHkpXG4gICAgICAgICAgICAgICAgICAgIHZfaVByaW9yaXR5ID0gcHJpb3JpdHk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB2X3BVc2VyRGF0YSA9IHByaW9yaXR5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAzKSB7XG4gICAgICAgICAgICAgICAgdl9pUHJpb3JpdHkgPSBwcmlvcml0eTtcbiAgICAgICAgICAgICAgICB2X3BVc2VyRGF0YSA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIubG9hZFNjZW5lKHNjZW5lQXNzZXROYW1lLCB2X2lQcmlvcml0eSwgdGhpcy5tX3BMb2FkU2NlbmVDYWxsYmFja3MsIHZfcFVzZXJEYXRhKTtcbiAgICAgICAgfTtcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnByb3RvdHlwZS51bmxvYWRTY2VuZSA9IGZ1bmN0aW9uIChzY2VuZUFzc2V0TmFtZSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGlmICghc2NlbmVBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgbmFtZSBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IHJlc291cmNlIG1hbmFnZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2NlbmVJc1VubG9hZGluZyhzY2VuZUFzc2V0TmFtZSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgJ1wiICsgc2NlbmVBc3NldE5hbWUgKyBcIicgaXMgYmVpbmcgdW5sb2FkZWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2NlbmVJc0xvYWRpbmcoc2NlbmVBc3NldE5hbWUpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjZW5lIGFzc2V0ICdcIiArIHNjZW5lQXNzZXROYW1lICsgXCInIGlzIGJlaW5nIGxvYWRlZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5zY2VuZUlzTG9hZGVkKHNjZW5lQXNzZXROYW1lKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCAnXCIgKyBzY2VuZUFzc2V0TmFtZSArIFwiJyBpcyBhbHJlYWR5IGxvYWRlZC5cIik7XG4gICAgICAgICAgICB1c2VyRGF0YSA9IHVzZXJEYXRhIHx8IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcy5wdXNoKHNjZW5lQXNzZXROYW1lKTtcbiAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyLnVubG9hZFNjZW5lKHNjZW5lQXNzZXROYW1lLCB0aGlzLm1fcFVubG9hZFNjZW5lQ2FsbGJhY2tzLCB1c2VyRGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICAvLyBOT09QLlxuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfMSwgX2E7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BMb2FkZWRTY2VuZUFzc2V0TmFtZXMpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzTmFtZSA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zY2VuZUlzVW5sb2FkaW5nKHNOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy51bmxvYWRTY2VuZShzTmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMV8xKSB7IGVfMSA9IHsgZXJyb3I6IGVfMV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3BMb2FkZWRTY2VuZUFzc2V0TmFtZXMuc3BsaWNlKDAsIHRoaXMubV9wTG9hZGVkU2NlbmVBc3NldE5hbWVzLmxlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXMuc3BsaWNlKDAsIHRoaXMubV9wTG9hZGluZ1NjZW5lQXNzZXROYW1lcy5sZW5ndGgpO1xuICAgICAgICAgICAgdGhpcy5tX3BVbmxvYWRpbmdTY2VuZUFzc2V0TmFtZXMuc3BsaWNlKDAsIHRoaXMubV9wVW5sb2FkaW5nU2NlbmVBc3NldE5hbWVzLmxlbmd0aCk7XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUub25Mb2FkU2NlbmVTdWNjZXNzID0gZnVuY3Rpb24gKHNjZW5lQXNzZXROYW1lLCBkdXJhdGlvbiwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X0lkeDtcbiAgICAgICAgICAgIGlmICgodl9JZHggPSB0aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXMuaW5kZXhPZihzY2VuZUFzc2V0TmFtZSkpID49IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXMuc3BsaWNlKHZfSWR4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgodl9JZHggPSB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcy5pbmRleE9mKHNjZW5lQXNzZXROYW1lKSkgPj0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wVW5sb2FkaW5nU2NlbmVBc3NldE5hbWVzLnNwbGljZSh2X0lkeCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcExvYWRlZFNjZW5lQXNzZXROYW1lcy5wdXNoKHNjZW5lQXNzZXROYW1lKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWRTY2VuZVN1Y2Nlc3NEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHNjZW5lQXNzZXROYW1lLCBkdXJhdGlvbiwgdXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLm9uTG9hZFNjZW5lRmFpbHVyZSA9IGZ1bmN0aW9uIChzY2VuZUFzc2V0TmFtZSwgc3RhdHVzLCBlcnJvck1lc3NhZ2UsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9JZHg7XG4gICAgICAgICAgICBpZiAoKHZfSWR4ID0gdGhpcy5tX3BMb2FkaW5nU2NlbmVBc3NldE5hbWVzLmluZGV4T2Yoc2NlbmVBc3NldE5hbWUpKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkaW5nU2NlbmVBc3NldE5hbWVzLnNwbGljZSh2X0lkeCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkU2NlbmVGYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZFNjZW5lRmFpbHVyZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihzY2VuZUFzc2V0TmFtZSwgZXJyb3JNZXNzYWdlLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUub25Mb2FkU2NlbmVVcGRhdGUgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUsIHByb2dyZXNzLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wTG9hZFNjZW5lVXBkYXRlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZFNjZW5lVXBkYXRlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHNjZW5lQXNzZXROYW1lLCBwcm9ncmVzcywgdXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLm9uTG9hZFNjZW5lRGVwZW5kZW5jeUFzc2V0ID0gZnVuY3Rpb24gKHNjZW5lQXNzZXROYW1lLCBkZXBlbmRlbmN5QXNzZXROYW1lLCBsb2FkZWRDb3VudCwgdG90YWxDb3VudCwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWRTY2VuZURlcGVuZGVuY3lBc3NldERlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRTY2VuZURlcGVuZGVuY3lBc3NldERlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihzY2VuZUFzc2V0TmFtZSwgZGVwZW5kZW5jeUFzc2V0TmFtZSwgbG9hZGVkQ291bnQsIHRvdGFsQ291bnQsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnByb3RvdHlwZS5vblVubG9hZFNjZW5lU3VjY2VzcyA9IGZ1bmN0aW9uIChzY2VuZUFzc2V0TmFtZSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X0lkeDtcbiAgICAgICAgICAgIGlmICgodl9JZHggPSB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcy5pbmRleE9mKHNjZW5lQXNzZXROYW1lKSkgPj0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wVW5sb2FkaW5nU2NlbmVBc3NldE5hbWVzLnNwbGljZSh2X0lkeCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoKHZfSWR4ID0gdGhpcy5tX3BMb2FkZWRTY2VuZUFzc2V0TmFtZXMuaW5kZXhPZihzY2VuZUFzc2V0TmFtZSkpID49IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRlZFNjZW5lQXNzZXROYW1lcy5zcGxpY2Uodl9JZHgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubV9wVW5sb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wVW5sb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHNjZW5lQXNzZXROYW1lLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUub25VbmxvYWRTY2VuZUZhaWx1cmUgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9JZHg7XG4gICAgICAgICAgICBpZiAoKHZfSWR4ID0gdGhpcy5tX3BVbmxvYWRpbmdTY2VuZUFzc2V0TmFtZXMuaW5kZXhPZihzY2VuZUFzc2V0TmFtZSkpID49IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcy5zcGxpY2Uodl9JZHgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubV9wVW5sb2FkU2NlbmVGYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wVW5sb2FkU2NlbmVGYWlsdXJlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHNjZW5lQXNzZXROYW1lLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBTY2VuZU1hbmFnZXI7XG4gICAgfShCYXNlXzEuRnJhbWV3b3JrTW9kdWxlKSk7IC8vIGNsYXNzIFNjZW5lTWFuYWdlclxuICAgIGV4cG9ydHMuU2NlbmVNYW5hZ2VyID0gU2NlbmVNYW5hZ2VyO1xufSk7XG4iLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICAvKipcbiAgICAgKiBTZXR0aW5nIGNvbmZpZ3VyZWQgbWFuYWdlbWVudC5cbiAgICAgKi9cbiAgICB2YXIgU2V0dGluZ01hbmFnZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhTZXR0aW5nTWFuYWdlciwgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gU2V0dGluZ01hbmFnZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgICAgICAgICAgIF90aGlzLm1fcFNldHRpbmdIZWxwZXIgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTZXR0aW5nTWFuYWdlci5wcm90b3R5cGUsIFwic2V0dGluZ0hlbHBlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU2V0dGluZ0hlbHBlcjsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG51bGwgPT0gdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU2V0dGluZyBoZWxwZXIgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFNldHRpbmdIZWxwZXIgPSB2YWx1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBTZXR0aW5nTWFuYWdlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldHRpbmdIZWxwZXIubG9hZCgpO1xuICAgICAgICB9O1xuICAgICAgICBTZXR0aW5nTWFuYWdlci5wcm90b3R5cGUuc2F2ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldHRpbmdIZWxwZXIuc2F2ZSgpO1xuICAgICAgICB9O1xuICAgICAgICBTZXR0aW5nTWFuYWdlci5wcm90b3R5cGUuaGFzU2V0dGluZyA9IGZ1bmN0aW9uIChzZXR0aW5nTmFtZSkge1xuICAgICAgICAgICAgaWYgKCFzZXR0aW5nTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NldHRpbmcgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0dGluZ0hlbHBlci5oYXNTZXR0aW5nKHNldHRpbmdOYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgU2V0dGluZ01hbmFnZXIucHJvdG90eXBlLnJlbW92ZVNldHRpbmcgPSBmdW5jdGlvbiAoc2V0dGluZ05hbWUpIHtcbiAgICAgICAgICAgIGlmICghc2V0dGluZ05hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXR0aW5nIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldHRpbmdIZWxwZXIucmVtb3ZlU2V0dGluZyhzZXR0aW5nTmFtZSk7XG4gICAgICAgIH07XG4gICAgICAgIFNldHRpbmdNYW5hZ2VyLnByb3RvdHlwZS5yZW1vdmVBbGxTZXR0aW5ncyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ0hlbHBlci5yZW1vdmVBbGxTZXR0aW5ncygpO1xuICAgICAgICB9O1xuICAgICAgICBTZXR0aW5nTWFuYWdlci5wcm90b3R5cGUuZ2V0Qm9vbGVhbiA9IGZ1bmN0aW9uIChzZXR0aW5nTmFtZSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIXNldHRpbmdOYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU2V0dGluZyBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBkZWZhdWx0VmFsdWUgPSBkZWZhdWx0VmFsdWUgfHwgZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXR0aW5nSGVscGVyLmdldEJvb2xlYW4oc2V0dGluZ05hbWUsIGRlZmF1bHRWYWx1ZSk7XG4gICAgICAgIH07XG4gICAgICAgIFNldHRpbmdNYW5hZ2VyLnByb3RvdHlwZS5zZXRCb29sZWFuID0gZnVuY3Rpb24gKHNldHRpbmdOYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKCFzZXR0aW5nTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NldHRpbmcgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdGhpcy5zZXR0aW5nSGVscGVyLnNldEJvb2xlYW4oc2V0dGluZ05hbWUsIHZhbHVlKTtcbiAgICAgICAgfTtcbiAgICAgICAgU2V0dGluZ01hbmFnZXIucHJvdG90eXBlLmdldEludGVnZXIgPSBmdW5jdGlvbiAoc2V0dGluZ05hbWUsIGRlZmF1bHRWYWx1ZSkge1xuICAgICAgICAgICAgaWYgKCFzZXR0aW5nTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NldHRpbmcgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgZGVmYXVsdFZhbHVlID0gZGVmYXVsdFZhbHVlIHx8IDA7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXR0aW5nSGVscGVyLmdldEludGVnZXIoc2V0dGluZ05hbWUsIGRlZmF1bHRWYWx1ZSk7XG4gICAgICAgIH07XG4gICAgICAgIFNldHRpbmdNYW5hZ2VyLnByb3RvdHlwZS5zZXRJbnRlZ2VyID0gZnVuY3Rpb24gKHNldHRpbmdOYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKCFzZXR0aW5nTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NldHRpbmcgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdGhpcy5zZXR0aW5nSGVscGVyLnNldEludGVnZXIoc2V0dGluZ05hbWUsIHZhbHVlKTtcbiAgICAgICAgfTtcbiAgICAgICAgU2V0dGluZ01hbmFnZXIucHJvdG90eXBlLmdldEZsb2F0ID0gZnVuY3Rpb24gKHNldHRpbmdOYW1lLCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghc2V0dGluZ05hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXR0aW5nIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZSA9IGRlZmF1bHRWYWx1ZSB8fCBOdW1iZXIuTmFOO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0dGluZ0hlbHBlci5nZXRGbG9hdChzZXR0aW5nTmFtZSwgZGVmYXVsdFZhbHVlKTtcbiAgICAgICAgfTtcbiAgICAgICAgU2V0dGluZ01hbmFnZXIucHJvdG90eXBlLnNldEZsb2F0ID0gZnVuY3Rpb24gKHNldHRpbmdOYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKCFzZXR0aW5nTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NldHRpbmcgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdGhpcy5zZXR0aW5nSGVscGVyLnNldEZsb2F0KHNldHRpbmdOYW1lLCB2YWx1ZSk7XG4gICAgICAgIH07XG4gICAgICAgIFNldHRpbmdNYW5hZ2VyLnByb3RvdHlwZS5nZXRTdHJpbmcgPSBmdW5jdGlvbiAoc2V0dGluZ05hbWUsIGRlZmF1bHRWYWx1ZSkge1xuICAgICAgICAgICAgaWYgKCFzZXR0aW5nTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NldHRpbmcgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0dGluZ0hlbHBlci5nZXRTdHJpbmcoc2V0dGluZ05hbWUsIGRlZmF1bHRWYWx1ZSk7XG4gICAgICAgIH07XG4gICAgICAgIFNldHRpbmdNYW5hZ2VyLnByb3RvdHlwZS5zZXRTdHJpbmcgPSBmdW5jdGlvbiAoc2V0dGluZ05hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIXNldHRpbmdOYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU2V0dGluZyBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB0aGlzLnNldHRpbmdIZWxwZXIuc2V0U3RyaW5nKHNldHRpbmdOYW1lLCB2YWx1ZSk7XG4gICAgICAgIH07XG4gICAgICAgIFNldHRpbmdNYW5hZ2VyLnByb3RvdHlwZS5nZXRPYmplY3QgPSBmdW5jdGlvbiAodHlwZSwgc2V0dGluZ05hbWUsIGRlZmF1bHRWYWx1ZSkge1xuICAgICAgICAgICAgaWYgKCF0eXBlKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignT2JqZWN0IHR5cGUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGlmICghc2V0dGluZ05hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXR0aW5nIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldHRpbmdIZWxwZXIuZ2V0T2JqZWN0KHR5cGUsIHNldHRpbmdOYW1lLCBkZWZhdWx0VmFsdWUgfHwgbnVsbCk7XG4gICAgICAgIH07XG4gICAgICAgIFNldHRpbmdNYW5hZ2VyLnByb3RvdHlwZS5zZXRPYmplY3QgPSBmdW5jdGlvbiAoc2V0dGluZ05hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIXNldHRpbmdOYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU2V0dGluZyBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB0aGlzLnNldHRpbmdIZWxwZXIuc2V0T2JqZWN0KHNldHRpbmdOYW1lLCB2YWx1ZSk7XG4gICAgICAgIH07XG4gICAgICAgIFNldHRpbmdNYW5hZ2VyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIC8vIE5PT1AuXG4gICAgICAgIH07XG4gICAgICAgIFNldHRpbmdNYW5hZ2VyLnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIE5PT1AuXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBTZXR0aW5nTWFuYWdlcjtcbiAgICB9KEJhc2VfMS5GcmFtZXdvcmtNb2R1bGUpKTsgLy8gY2xhc3MgU2V0dGluZ01hbmFnZXJcbiAgICBleHBvcnRzLlNldHRpbmdNYW5hZ2VyID0gU2V0dGluZ01hbmFnZXI7XG59KTtcbiIsInZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgICAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xudmFyIF9fdmFsdWVzID0gKHRoaXMgJiYgdGhpcy5fX3ZhbHVlcykgfHwgZnVuY3Rpb24obykge1xuICAgIHZhciBzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciwgbSA9IHMgJiYgb1tzXSwgaSA9IDA7XG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xuICAgICAgICB9XG4gICAgfTtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XG59O1xuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIiwgXCIuL0Jhc2VcIl0sIGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIHZhciBCYXNlXzEgPSByZXF1aXJlKFwiLi9CYXNlXCIpO1xuICAgIHZhciBDb25zdGFudDtcbiAgICAoZnVuY3Rpb24gKENvbnN0YW50KSB7XG4gICAgICAgIENvbnN0YW50LkRlZmF1bHRUaW1lID0gMDtcbiAgICAgICAgQ29uc3RhbnQuRGVmYXVsdE11dGUgPSBmYWxzZTtcbiAgICAgICAgQ29uc3RhbnQuRGVmYXVsdExvb3AgPSBmYWxzZTtcbiAgICAgICAgQ29uc3RhbnQuRGVmYXVsdFByaW9yaXR5ID0gMDtcbiAgICAgICAgQ29uc3RhbnQuRGVmYXVsdFZvbHVtZSA9IDE7XG4gICAgICAgIENvbnN0YW50LkRlZmF1bHRGYWRlSW5TZWNvbmRzID0gMDtcbiAgICAgICAgQ29uc3RhbnQuRGVmYXVsdEZhZGVPdXRTZWNvbmRzID0gMDtcbiAgICAgICAgQ29uc3RhbnQuRGVmYXVsdFBpdGNoID0gMTtcbiAgICAgICAgQ29uc3RhbnQuRGVmYXVsdFBhblN0ZXJlbyA9IDA7XG4gICAgICAgIENvbnN0YW50LkRlZmF1bHRTcGF0aWFsQmxlbmQgPSAwO1xuICAgICAgICBDb25zdGFudC5EZWZhdWx0TWF4RGlzdGFuY2UgPSAxMDA7XG4gICAgICAgIENvbnN0YW50LkRlZmF1bHREb3BwbGVyTGV2ZWwgPSAxO1xuICAgIH0pKENvbnN0YW50ID0gZXhwb3J0cy5Db25zdGFudCB8fCAoZXhwb3J0cy5Db25zdGFudCA9IHt9KSk7IC8vIG5hbWVzcGFjZSBDb25zdGFudFxuICAgIHZhciBTb3VuZEFnZW50ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBTb3VuZEFnZW50KHNvdW5kR3JvdXAsIHNvdW5kSGVscGVyLCBzb3VuZEFnZW50SGVscGVyKSB7XG4gICAgICAgICAgICBpZiAoIXNvdW5kR3JvdXApXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU291bmQgZ3JvdXAgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAoIXNvdW5kSGVscGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNvdW5kIGhlbHBlciBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICghc291bmRBZ2VudEhlbHBlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTb3VuZCBhZ2VudCBoZWxwZXIgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kR3JvdXAgPSBzb3VuZEdyb3VwO1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEhlbHBlciA9IHNvdW5kSGVscGVyO1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyID0gc291bmRBZ2VudEhlbHBlcjtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5yZXNldFNvdW5kQWdlbnQuYWRkKHRoaXMub25SZXNldFNvdW5kQWdlbnQsIHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5tX2lTZXJpYWxJZCA9IDA7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kQXNzZXQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJzb3VuZEdyb3VwXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEdyb3VwOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kQWdlbnQucHJvdG90eXBlLCBcInNlcmlhbElkXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX2lTZXJpYWxJZDsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9pU2VyaWFsSWQgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJpc1BsYXlpbmdcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIuaXNQbGF5aW5nOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kQWdlbnQucHJvdG90eXBlLCBcImxlbmd0aFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5sZW5ndGg7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwidGltZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci50aW1lOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnRpbWUgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJtdXRlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLm11dGU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwibXV0ZUluU291bmRHcm91cFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9iTXV0ZUluU291bmRHcm91cDsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX2JNdXRlSW5Tb3VuZEdyb3VwID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoTXV0ZSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJsb29wXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLmxvb3A7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIubG9vcCA9IHZhbHVlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kQWdlbnQucHJvdG90eXBlLCBcInByaW9yaXR5XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnByaW9yaXR5OyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnByaW9yaXR5ID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwidm9sdW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnZvbHVtZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJ2b2x1bWVJblNvdW5kR3JvdXBcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fZlZvbHVtZUluU291bmRHcm91cDsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX2ZWb2x1bWVJblNvdW5kR3JvdXAgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2hWb2x1bWUoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwicGl0Y2hcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIucGl0Y2g7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIucGl0Y2ggPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJwYW5TdGVyZW9cIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIucGFuU3RlcmVvOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnBhblN0ZXJlbyA9IHZhbHVlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kQWdlbnQucHJvdG90eXBlLCBcInNwYXRpYWxCbGVuZFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5zcGF0aWFsQmxlbmQ7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIuc3BhdGlhbEJsZW5kID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwibWF4RGlzdGFuY2VcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIubWF4RGlzdGFuY2U7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIubWF4RGlzdGFuY2UgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJkb3BwbGVyTGV2ZWxcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIuZG9wcGxlckxldmVsOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLmRvcHBsZXJMZXZlbCA9IHZhbHVlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kQWdlbnQucHJvdG90eXBlLCBcImhlbHBlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU291bmRBZ2VudEhlbHBlcjsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJzZXRTb3VuZEFzc2V0VGltZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9mU2V0U291bmRBc3NldFRpbWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBTb3VuZEFnZW50LnByb3RvdHlwZS5wbGF5ID0gZnVuY3Rpb24gKGZhZGVJblNlY29uZHMpIHtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5wbGF5KGZhZGVJblNlY29uZHMgfHwgQ29uc3RhbnQuRGVmYXVsdEZhZGVJblNlY29uZHMpO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZEFnZW50LnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gKGZhZGVPdXRTZWNvbmRzKSB7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIuc3RvcChmYWRlT3V0U2Vjb25kcyB8fCBDb25zdGFudC5EZWZhdWx0RmFkZU91dFNlY29uZHMpO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZEFnZW50LnByb3RvdHlwZS5wYXVzZSA9IGZ1bmN0aW9uIChmYWRlT3V0U2Vjb25kcykge1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnBhdXNlKGZhZGVPdXRTZWNvbmRzIHx8IENvbnN0YW50LkRlZmF1bHRGYWRlT3V0U2Vjb25kcyk7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kQWdlbnQucHJvdG90eXBlLnJlc3VtZSA9IGZ1bmN0aW9uIChmYWRlSW5TZWNvbmRzKSB7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIucmVzdW1lKGZhZGVJblNlY29uZHMgfHwgQ29uc3RhbnQuRGVmYXVsdEZhZGVJblNlY29uZHMpO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZEFnZW50LnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcFNvdW5kQXNzZXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFNvdW5kSGVscGVyLnJlbGVhc2VTb3VuZEFzc2V0KHRoaXMubV9wU291bmRBc3NldCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEFzc2V0ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9mU2V0U291bmRBc3NldFRpbWUgPSBOYU47XG4gICAgICAgICAgICB0aGlzLnRpbWUgPSBDb25zdGFudC5EZWZhdWx0VGltZTtcbiAgICAgICAgICAgIHRoaXMubXV0ZUluU291bmRHcm91cCA9IENvbnN0YW50LkRlZmF1bHRNdXRlO1xuICAgICAgICAgICAgdGhpcy5sb29wID0gQ29uc3RhbnQuRGVmYXVsdExvb3A7XG4gICAgICAgICAgICB0aGlzLnByaW9yaXR5ID0gQ29uc3RhbnQuRGVmYXVsdFByaW9yaXR5O1xuICAgICAgICAgICAgdGhpcy52b2x1bWVJblNvdW5kR3JvdXAgPSBDb25zdGFudC5EZWZhdWx0Vm9sdW1lO1xuICAgICAgICAgICAgdGhpcy5waXRjaCA9IENvbnN0YW50LkRlZmF1bHRQaXRjaDtcbiAgICAgICAgICAgIHRoaXMucGFuU3RlcmVvID0gQ29uc3RhbnQuRGVmYXVsdFBhblN0ZXJlbztcbiAgICAgICAgICAgIHRoaXMuc3BhdGlhbEJsZW5kID0gQ29uc3RhbnQuRGVmYXVsdFNwYXRpYWxCbGVuZDtcbiAgICAgICAgICAgIHRoaXMubWF4RGlzdGFuY2UgPSBDb25zdGFudC5EZWZhdWx0TWF4RGlzdGFuY2U7XG4gICAgICAgICAgICB0aGlzLmRvcHBsZXJMZXZlbCA9IENvbnN0YW50LkRlZmF1bHREb3BwbGVyTGV2ZWw7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIucmVzZXQoKTtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRBZ2VudC5wcm90b3R5cGUuc2V0U291bmRBc3NldCA9IGZ1bmN0aW9uIChzb3VuZEFzc2V0KSB7XG4gICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kQXNzZXQgPSBzb3VuZEFzc2V0O1xuICAgICAgICAgICAgdGhpcy5tX2ZTZXRTb3VuZEFzc2V0VGltZSA9IG5ldyBEYXRlKCkudmFsdWVPZigpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5zZXRTb3VuZEFzc2V0KHNvdW5kQXNzZXQpO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZEFnZW50LnByb3RvdHlwZS5yZWZyZXNoTXV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5tdXRlID0gdGhpcy5tX3BTb3VuZEdyb3VwLm11dGUgfHwgdGhpcy5tX2JNdXRlSW5Tb3VuZEdyb3VwO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZEFnZW50LnByb3RvdHlwZS5yZWZyZXNoVm9sdW1lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnZvbHVtZSA9IHRoaXMubV9wU291bmRHcm91cC52b2x1bWUgfHwgdGhpcy5tX2ZWb2x1bWVJblNvdW5kR3JvdXA7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kQWdlbnQucHJvdG90eXBlLm9uUmVzZXRTb3VuZEFnZW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gU291bmRBZ2VudDtcbiAgICB9KCkpOyAvLyBjbGFzcyBTb3VuZEFnZW50XG4gICAgZXhwb3J0cy5Tb3VuZEFnZW50ID0gU291bmRBZ2VudDtcbiAgICB2YXIgUGxheVNvdW5kRXJyb3JDb2RlO1xuICAgIChmdW5jdGlvbiAoUGxheVNvdW5kRXJyb3JDb2RlKSB7XG4gICAgICAgIFBsYXlTb3VuZEVycm9yQ29kZVtQbGF5U291bmRFcnJvckNvZGVbXCJVbmtub3duXCJdID0gMF0gPSBcIlVua25vd25cIjtcbiAgICAgICAgUGxheVNvdW5kRXJyb3JDb2RlW1BsYXlTb3VuZEVycm9yQ29kZVtcIlNvdW5kR3JvdXBOb3RFeGlzdFwiXSA9IDFdID0gXCJTb3VuZEdyb3VwTm90RXhpc3RcIjtcbiAgICAgICAgUGxheVNvdW5kRXJyb3JDb2RlW1BsYXlTb3VuZEVycm9yQ29kZVtcIlNvdW5kR3JvdXBIYXNOb0FnZW50XCJdID0gMl0gPSBcIlNvdW5kR3JvdXBIYXNOb0FnZW50XCI7XG4gICAgICAgIFBsYXlTb3VuZEVycm9yQ29kZVtQbGF5U291bmRFcnJvckNvZGVbXCJMb2FkQXNzZXRGYWlsdXJlXCJdID0gM10gPSBcIkxvYWRBc3NldEZhaWx1cmVcIjtcbiAgICAgICAgUGxheVNvdW5kRXJyb3JDb2RlW1BsYXlTb3VuZEVycm9yQ29kZVtcIklnbm9yZUR1ZVRvTG93UHJpb3JpdHlcIl0gPSA0XSA9IFwiSWdub3JlRHVlVG9Mb3dQcmlvcml0eVwiO1xuICAgICAgICBQbGF5U291bmRFcnJvckNvZGVbUGxheVNvdW5kRXJyb3JDb2RlW1wiU2V0U291bmRBc3NldEZhaWx1cmVcIl0gPSA1XSA9IFwiU2V0U291bmRBc3NldEZhaWx1cmVcIjtcbiAgICB9KShQbGF5U291bmRFcnJvckNvZGUgPSBleHBvcnRzLlBsYXlTb3VuZEVycm9yQ29kZSB8fCAoZXhwb3J0cy5QbGF5U291bmRFcnJvckNvZGUgPSB7fSkpOyAvLyBlbnVtIFBsYXlTb3VuZEVycm9yQ29kZVxuICAgIGV4cG9ydHMuRGVmYXVsdFBsYXlTb3VuZFBhcmFtcyA9IHtcbiAgICAgICAgdGltZTogMCxcbiAgICAgICAgbXV0ZUluU291bmRHcm91cDogZmFsc2UsXG4gICAgICAgIGxvb3A6IGZhbHNlLFxuICAgICAgICBwcmlvcml0eTogMCxcbiAgICAgICAgdm9sdW1lSW5Tb3VuZEdyb3VwOiAxLFxuICAgICAgICBmYWRlSW5TZWNvbmRzOiAwLFxuICAgICAgICBwaXRjaDogMCxcbiAgICAgICAgcGFuU3RlcmVvOiAwLFxuICAgICAgICBzcGF0aWFsQmxlbmQ6IDAsXG4gICAgICAgIG1heERpc3RhbmNlOiAwLFxuICAgICAgICBkb3BwbGVyTGV2ZWw6IDAsXG4gICAgICAgIHJlZmVyZW5jZWQ6IGZhbHNlXG4gICAgfTsgLy8gRGVmYXVsdFBsYXlTb3VuZFBhcmFtc1xuICAgIHZhciBTb3VuZEdyb3VwID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBTb3VuZEdyb3VwKG5hbWUsIHNvdW5kR3JvdXBIZWxwZXIpIHtcbiAgICAgICAgICAgIHRoaXMubV9iQXZvaWRCZWluZ1JlcGxhY2VkQnlTYW1lUHJpb3JpdHkgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubV9iTXV0ZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5tX2ZWb2x1bWUgPSAxO1xuICAgICAgICAgICAgaWYgKCFuYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNvdW5kIGdyb3VwIG5hbWUgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAoIXNvdW5kR3JvdXBIZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU291bmQgZ3JvdXAgaGVscGVyIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgdGhpcy5tX3NOYW1lID0gbmFtZTtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRHcm91cEhlbHBlciA9IHNvdW5kR3JvdXBIZWxwZXI7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kQWdlbnRzID0gW107XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kR3JvdXAucHJvdG90eXBlLCBcIm5hbWVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fc05hbWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRHcm91cC5wcm90b3R5cGUsIFwic291bmRBZ2VudENvdW50XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFNvdW5kQWdlbnRzLmxlbmd0aDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRHcm91cC5wcm90b3R5cGUsIFwiYXZvaWRCZWluZ1JlcGxhY2VkQnlTYW1lUHJpb3JpdHlcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fYkF2b2lkQmVpbmdSZXBsYWNlZEJ5U2FtZVByaW9yaXR5OyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fYkF2b2lkQmVpbmdSZXBsYWNlZEJ5U2FtZVByaW9yaXR5ID0gdmFsdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kR3JvdXAucHJvdG90eXBlLCBcIm11dGVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fYk11dGU7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhciBlXzEsIF9hO1xuICAgICAgICAgICAgICAgIHRoaXMubV9iTXV0ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BTb3VuZEFnZW50cyksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhZ2VudCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWdlbnQucmVmcmVzaE11dGUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV8xXzEpIHsgZV8xID0geyBlcnJvcjogZV8xXzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kR3JvdXAucHJvdG90eXBlLCBcInZvbHVtZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9mVm9sdW1lOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZV8yLCBfYTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fZlZvbHVtZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BTb3VuZEFnZW50cyksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhZ2VudCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWdlbnQucmVmcmVzaFZvbHVtZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzJfMSkgeyBlXzIgPSB7IGVycm9yOiBlXzJfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzIpIHRocm93IGVfMi5lcnJvcjsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRHcm91cC5wcm90b3R5cGUsIFwiaGVscGVyXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEdyb3VwSGVscGVyOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgU291bmRHcm91cC5wcm90b3R5cGUuYWRkU291bmRBZ2VudEhlbHBlciA9IGZ1bmN0aW9uIChzb3VuZEhlbHBlciwgc291bmRBZ2VudEhlbHBlcikge1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEFnZW50cy5wdXNoKG5ldyBTb3VuZEFnZW50KHRoaXMsIHNvdW5kSGVscGVyLCBzb3VuZEFnZW50SGVscGVyKSk7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kR3JvdXAucHJvdG90eXBlLnBsYXlTb3VuZCA9IGZ1bmN0aW9uIChzZXJpYWxJZCwgc291bmRBc3NldCwgcGxheVNvdW5kUGFyYW1zLCBlcnJvckNvZGUpIHtcbiAgICAgICAgICAgIHZhciBlXzMsIF9hO1xuICAgICAgICAgICAgZXJyb3JDb2RlID0gZXJyb3JDb2RlIHx8IHsgY29kZTogMCB9O1xuICAgICAgICAgICAgdmFyIHZfcENhbmRpZGF0ZUFnZW50O1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRBZ2VudHMpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3VuZEFnZW50ID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc291bmRBZ2VudC5pc1BsYXlpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50ID0gc291bmRBZ2VudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VuZEFnZW50LnByaW9yaXR5IDwgcGxheVNvdW5kUGFyYW1zLnByaW9yaXR5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXZfcENhbmRpZGF0ZUFnZW50IHx8IHNvdW5kQWdlbnQucHJpb3JpdHkgPCB2X3BDYW5kaWRhdGVBZ2VudC5wcmlvcml0eSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50ID0gc291bmRBZ2VudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICghdGhpcy5tX2JBdm9pZEJlaW5nUmVwbGFjZWRCeVNhbWVQcmlvcml0eSAmJiBzb3VuZEFnZW50LnByaW9yaXR5ID09IHBsYXlTb3VuZFBhcmFtcy5wcmlvcml0eSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF2X3BDYW5kaWRhdGVBZ2VudCB8fCBzb3VuZEFnZW50LnNldFNvdW5kQXNzZXRUaW1lIDwgdl9wQ2FuZGlkYXRlQWdlbnQuc2V0U291bmRBc3NldFRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudCA9IHNvdW5kQWdlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8zXzEpIHsgZV8zID0geyBlcnJvcjogZV8zXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMykgdGhyb3cgZV8zLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXZfcENhbmRpZGF0ZUFnZW50KSB7XG4gICAgICAgICAgICAgICAgZXJyb3JDb2RlLmNvZGUgPSBQbGF5U291bmRFcnJvckNvZGUuSWdub3JlRHVlVG9Mb3dQcmlvcml0eTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdl9wQ2FuZGlkYXRlQWdlbnQuc2V0U291bmRBc3NldChzb3VuZEFzc2V0KSkge1xuICAgICAgICAgICAgICAgIGVycm9yQ29kZS5jb2RlID0gUGxheVNvdW5kRXJyb3JDb2RlLlNldFNvdW5kQXNzZXRGYWlsdXJlO1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdl9wQ2FuZGlkYXRlQWdlbnQuc2VyaWFsSWQgPSBzZXJpYWxJZDtcbiAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50LnRpbWUgPSBwbGF5U291bmRQYXJhbXMudGltZTtcbiAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50Lm11dGVJblNvdW5kR3JvdXAgPSBwbGF5U291bmRQYXJhbXMubXV0ZUluU291bmRHcm91cDtcbiAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50Lmxvb3AgPSBwbGF5U291bmRQYXJhbXMubG9vcDtcbiAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50LnByaW9yaXR5ID0gcGxheVNvdW5kUGFyYW1zLnByaW9yaXR5O1xuICAgICAgICAgICAgdl9wQ2FuZGlkYXRlQWdlbnQudm9sdW1lSW5Tb3VuZEdyb3VwID0gcGxheVNvdW5kUGFyYW1zLnZvbHVtZUluU291bmRHcm91cDtcbiAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50LnBpdGNoID0gcGxheVNvdW5kUGFyYW1zLnBpdGNoO1xuICAgICAgICAgICAgdl9wQ2FuZGlkYXRlQWdlbnQucGFuU3RlcmVvID0gcGxheVNvdW5kUGFyYW1zLnBhblN0ZXJlbztcbiAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50LnNwYXRpYWxCbGVuZCA9IHBsYXlTb3VuZFBhcmFtcy5zcGF0aWFsQmxlbmQ7XG4gICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudC5tYXhEaXN0YW5jZSA9IHBsYXlTb3VuZFBhcmFtcy5tYXhEaXN0YW5jZTtcbiAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50LmRvcHBsZXJMZXZlbCA9IHBsYXlTb3VuZFBhcmFtcy5kb3BwbGVyTGV2ZWw7XG4gICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudC5wbGF5KHBsYXlTb3VuZFBhcmFtcy5mYWRlSW5TZWNvbmRzKTtcbiAgICAgICAgICAgIHJldHVybiB2X3BDYW5kaWRhdGVBZ2VudDtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRHcm91cC5wcm90b3R5cGUuc3RvcFNvdW5kID0gZnVuY3Rpb24gKHNlcmlhbElkLCBmYWRlT3V0U2Vjb25kcykge1xuICAgICAgICAgICAgdmFyIGVfNCwgX2E7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BTb3VuZEFnZW50cyksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNvdW5kQWdlbnQgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNvdW5kQWdlbnQuc2VyaWFsSWQgIT0gc2VyaWFsSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNvdW5kQWdlbnQuc3RvcChmYWRlT3V0U2Vjb25kcyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzRfMSkgeyBlXzQgPSB7IGVycm9yOiBlXzRfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV80KSB0aHJvdyBlXzQuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRHcm91cC5wcm90b3R5cGUucGF1c2VTb3VuZCA9IGZ1bmN0aW9uIChzZXJpYWxJZCwgZmFkZU91dFNlY29uZHMpIHtcbiAgICAgICAgICAgIHZhciBlXzUsIF9hO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRBZ2VudHMpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3VuZEFnZW50ID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VuZEFnZW50LnNlcmlhbElkICE9IHNlcmlhbElkKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIHNvdW5kQWdlbnQucGF1c2UoZmFkZU91dFNlY29uZHMpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV81XzEpIHsgZV81ID0geyBlcnJvcjogZV81XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNSkgdGhyb3cgZV81LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kR3JvdXAucHJvdG90eXBlLnJlc3VtZVNvdW5kID0gZnVuY3Rpb24gKHNlcmlhbElkLCBmYWRlSW5TZWNvbmRzKSB7XG4gICAgICAgICAgICB2YXIgZV82LCBfYTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFNvdW5kQWdlbnRzKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc291bmRBZ2VudCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc291bmRBZ2VudC5zZXJpYWxJZCAhPSBzZXJpYWxJZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICBzb3VuZEFnZW50LnJlc3VtZShmYWRlSW5TZWNvbmRzKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfNl8xKSB7IGVfNiA9IHsgZXJyb3I6IGVfNl8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzYpIHRocm93IGVfNi5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZEdyb3VwLnByb3RvdHlwZS5zdG9wQWxsTG9hZGVkU291bmRzID0gZnVuY3Rpb24gKGZhZGVPdXRTZWNvbmRzKSB7XG4gICAgICAgICAgICB2YXIgZV83LCBfYTtcbiAgICAgICAgICAgIGZhZGVPdXRTZWNvbmRzID0gZmFkZU91dFNlY29uZHMgfHwgQ29uc3RhbnQuRGVmYXVsdEZhZGVPdXRTZWNvbmRzO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRBZ2VudHMpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3VuZEFnZW50ID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VuZEFnZW50LmlzUGxheWluZylcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdW5kQWdlbnQuc3RvcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzdfMSkgeyBlXzcgPSB7IGVycm9yOiBlXzdfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV83KSB0aHJvdyBlXzcuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFNvdW5kR3JvdXA7XG4gICAgfSgpKTsgLy8gY2xhc3MgU291bmRHcm91cFxuICAgIGV4cG9ydHMuU291bmRHcm91cCA9IFNvdW5kR3JvdXA7XG4gICAgdmFyIFNvdW5kTWFuYWdlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgX19leHRlbmRzKFNvdW5kTWFuYWdlciwgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gU291bmRNYW5hZ2VyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgICAgICAgICBfdGhpcy5tX3BTb3VuZEdyb3VwcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcFNvdW5kc0JlaW5nTG9hZGVkID0gbmV3IFNldCgpO1xuICAgICAgICAgICAgX3RoaXMubV9wU291bmRzVG9SZWxlYXNlT25Mb2FkID0gbmV3IFNldCgpO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZEFzc2V0Q2FsbGJhY2tzID0ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IF90aGlzLm9uTG9hZFNvdW5kU3VjY2Vzc0NhbGxiYWNrLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIGZhaWx1cmU6IF90aGlzLm9uTG9hZFNvdW5kRmFpbHVyZUNhbGxiYWNrLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIHVwZGF0ZTogX3RoaXMub25Mb2FkU291bmRVcGRhdGVDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICBkZXBlbmRlbmN5OiBfdGhpcy5vbkxvYWRTb3VuZERlcGVuZGVuY3lBc3NldENhbGxiYWNrLmJpbmQoX3RoaXMpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgX3RoaXMubV9pU2VyaWFsID0gMDtcbiAgICAgICAgICAgIF90aGlzLm1fcFBsYXlTb3VuZFN1Y2Nlc3NEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BQbGF5U291bmRGYWlsdXJlRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wUGxheVNvdW5kVXBkYXRlRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wUGxheVNvdW5kRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZE1hbmFnZXIucHJvdG90eXBlLCBcInNvdW5kR3JvdXBDb3VudFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BTb3VuZEdyb3Vwcy5zaXplO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZE1hbmFnZXIucHJvdG90eXBlLCBcInBsYXlTb3VuZFN1Y2Nlc3NcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUGxheVNvdW5kU3VjY2Vzc0RlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZE1hbmFnZXIucHJvdG90eXBlLCBcInBsYXlTb3VuZEZhaWx1cmVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUGxheVNvdW5kRmFpbHVyZURlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZE1hbmFnZXIucHJvdG90eXBlLCBcInBsYXlTb3VuZFVwZGF0ZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BQbGF5U291bmRVcGRhdGVEZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRNYW5hZ2VyLnByb3RvdHlwZSwgXCJwbGF5U291bmREZXBlbmRlbmN5QXNzZXRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUGxheVNvdW5kRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgU291bmRNYW5hZ2VyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIC8vIE5PT1AuXG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUuc2h1dGRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3BBbGxMb2FkZWRTb3VuZHMoKTtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRHcm91cHMuY2xlYXIoKTtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRzQmVpbmdMb2FkZWQuY2xlYXIoKTtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRzVG9SZWxlYXNlT25Mb2FkLmNsZWFyKCk7XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZE1hbmFnZXIucHJvdG90eXBlLCBcInJlc291cmNlTWFuYWdlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZE1hbmFnZXIucHJvdG90eXBlLCBcInNvdW5kSGVscGVyXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEhlbHBlcjsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9wU291bmRIZWxwZXIgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUuaGFzU291bmRHcm91cCA9IGZ1bmN0aW9uIChzb3VuZEdyb3VwTmFtZSkge1xuICAgICAgICAgICAgaWYgKCFzb3VuZEdyb3VwTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTb3VuZCBncm91cCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wU291bmRHcm91cHMuaGFzKHNvdW5kR3JvdXBOYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRNYW5hZ2VyLnByb3RvdHlwZS5nZXRTb3VuZEdyb3VwID0gZnVuY3Rpb24gKHNvdW5kR3JvdXBOYW1lKSB7XG4gICAgICAgICAgICBpZiAoIXNvdW5kR3JvdXBOYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNvdW5kIGdyb3VwIG5hbWUgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BTb3VuZEdyb3Vwcy5nZXQoc291bmRHcm91cE5hbWUpIHx8IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUuZ2V0QWxsU291bmRHcm91cHMgPSBmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgICAgICAgdmFyIGVfOCwgX2E7XG4gICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cyB8fCBbXTtcbiAgICAgICAgICAgIGlmIChyZXN1bHRzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5zcGxpY2UoMCwgcmVzdWx0cy5sZW5ndGgpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRHcm91cHMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3VuZEdyb3VwID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChzb3VuZEdyb3VwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV84XzEpIHsgZV84ID0geyBlcnJvcjogZV84XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfOCkgdGhyb3cgZV84LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRNYW5hZ2VyLnByb3RvdHlwZS5hZGRTb3VuZEdyb3VwID0gZnVuY3Rpb24gKHNvdW5kR3JvdXBOYW1lLCBhbnlBcmcsIHNvdW5kR3JvdXBNdXRlLCBzb3VuZEdyb3VwVm9sdW1lLCBzb3VuZEdyb3VwSGVscGVyKSB7XG4gICAgICAgICAgICBpZiAoIXNvdW5kR3JvdXBOYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNvdW5kIGdyb3VwIG5hbWUgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB2YXIgc291bmRHcm91cEF2b2lkQmVpbmdSZXBsYWNlZEJ5U2FtZVByaW9yaXR5ID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoJ2Jvb2xlYW4nID09PSB0eXBlb2YgYW55QXJnKSB7XG4gICAgICAgICAgICAgICAgc291bmRHcm91cEF2b2lkQmVpbmdSZXBsYWNlZEJ5U2FtZVByaW9yaXR5ID0gYW55QXJnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc291bmRHcm91cEhlbHBlciA9IGFueUFyZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNvdW5kR3JvdXBNdXRlID0gc291bmRHcm91cE11dGUgfHwgQ29uc3RhbnQuRGVmYXVsdE11dGU7XG4gICAgICAgICAgICBzb3VuZEdyb3VwVm9sdW1lID0gc291bmRHcm91cFZvbHVtZSB8fCBDb25zdGFudC5EZWZhdWx0Vm9sdW1lO1xuICAgICAgICAgICAgaWYgKCFzb3VuZEdyb3VwSGVscGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNvdW5kIGdyb3VwIGhlbHBlciBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc1NvdW5kR3JvdXAoc291bmRHcm91cE5hbWUpKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIHZhciB2X3BTb3VuZEdyb3VwID0gbmV3IFNvdW5kR3JvdXAoc291bmRHcm91cE5hbWUsIHNvdW5kR3JvdXBIZWxwZXIpO1xuICAgICAgICAgICAgdl9wU291bmRHcm91cC5hdm9pZEJlaW5nUmVwbGFjZWRCeVNhbWVQcmlvcml0eSA9IHNvdW5kR3JvdXBBdm9pZEJlaW5nUmVwbGFjZWRCeVNhbWVQcmlvcml0eTtcbiAgICAgICAgICAgIHZfcFNvdW5kR3JvdXAubXV0ZSA9IHNvdW5kR3JvdXBNdXRlO1xuICAgICAgICAgICAgdl9wU291bmRHcm91cC52b2x1bWUgPSBzb3VuZEdyb3VwVm9sdW1lO1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEdyb3Vwcy5zZXQoc291bmRHcm91cE5hbWUsIHZfcFNvdW5kR3JvdXApO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUuYWRkU291bmRBZ2VudEhlbHBlciA9IGZ1bmN0aW9uIChzb3VuZEdyb3VwTmFtZSwgc291bmRBZ2VudEhlbHBlcikge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1fcFNvdW5kSGVscGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IHNldCBzb3VuZCBoZWxwZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgdmFyIHZfcFNvdW5kR3JvdXAgPSB0aGlzLmdldFNvdW5kR3JvdXAoc291bmRHcm91cE5hbWUpO1xuICAgICAgICAgICAgaWYgKCF2X3BTb3VuZEdyb3VwKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNvdW5kIGdyb3VwICdcIiArIHNvdW5kR3JvdXBOYW1lICsgXCInIGlzIG5vdCBleGlzdC5cIik7XG4gICAgICAgICAgICB2X3BTb3VuZEdyb3VwLmFkZFNvdW5kQWdlbnRIZWxwZXIodGhpcy5tX3BTb3VuZEhlbHBlciwgc291bmRBZ2VudEhlbHBlcik7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUuZ2V0QWxsTG9hZGluZ1NvdW5kU2VyaWFsSWRzID0gZnVuY3Rpb24gKHJlc3VsdHMpIHtcbiAgICAgICAgICAgIHZhciB2X3BSZXQgPSByZXN1bHRzIHx8IFtdO1xuICAgICAgICAgICAgdl9wUmV0LnNwbGljZSgwLCB2X3BSZXQubGVuZ3RoKTtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRzQmVpbmdMb2FkZWQuZm9yRWFjaChmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgIHZfcFJldC5wdXNoKHYpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdl9wUmV0O1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLmlzTG9hZGluZ1NvdW5kID0gZnVuY3Rpb24gKHNlcmlhbElkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BTb3VuZHNCZWluZ0xvYWRlZC5oYXMoc2VyaWFsSWQpO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLnBsYXlTb3VuZCA9IGZ1bmN0aW9uIChzb3VuZEFzc2V0TmFtZSwgc291bmRHcm91cE5hbWUsIGFueUFyZzEsIGFueUFyZzIsIGFueUFyZzMpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IHJlc291cmNlIG1hbmFnZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1fcFNvdW5kSGVscGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IHNldCBzb3VuZCBoZWxwZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgdmFyIHByaW9yaXR5ID0gQ29uc3RhbnQuRGVmYXVsdFByaW9yaXR5O1xuICAgICAgICAgICAgdmFyIHBsYXlTb3VuZFBhcmFtcyA9IG51bGw7XG4gICAgICAgICAgICB2YXIgdXNlckRhdGEgPSBudWxsO1xuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2YgYW55QXJnMSkge1xuICAgICAgICAgICAgICAgICAgICBwcmlvcml0eSA9IGFueUFyZzE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHVuZGVmaW5lZCAhPSBhbnlBcmcxKSB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXlTb3VuZFBhcmFtcyA9IGFueUFyZzE7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJEYXRhID0gYW55QXJnMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gNCkge1xuICAgICAgICAgICAgICAgICAgICBwbGF5U291bmRQYXJhbXMgPSBhbnlBcmcyO1xuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YSA9IGFueUFyZzI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gNSkge1xuICAgICAgICAgICAgICAgICAgICBwbGF5U291bmRQYXJhbXMgPSBhbnlBcmcyO1xuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YSA9IGFueUFyZzM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZfaVNlcmlhbElkID0gdGhpcy5tX2lTZXJpYWwrKztcbiAgICAgICAgICAgIHZhciB2X3BFcnJvckNvZGU7XG4gICAgICAgICAgICB2YXIgdl9zRXJyb3JNZXNzYWdlO1xuICAgICAgICAgICAgdmFyIHZfcFNvdW5kR3JvdXAgPSB0aGlzLmdldFNvdW5kR3JvdXAoc291bmRHcm91cE5hbWUpO1xuICAgICAgICAgICAgaWYgKCF2X3BTb3VuZEdyb3VwKSB7XG4gICAgICAgICAgICAgICAgdl9wRXJyb3JDb2RlID0gUGxheVNvdW5kRXJyb3JDb2RlLlNvdW5kR3JvdXBOb3RFeGlzdDtcbiAgICAgICAgICAgICAgICB2X3NFcnJvck1lc3NhZ2UgPSBcIlNvdW5kIGdyb3VwICdcIiArIHNvdW5kR3JvdXBOYW1lICsgXCInIGlzIG5vdCBleGlzdC5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHZfcFNvdW5kR3JvdXAuc291bmRBZ2VudENvdW50IDw9IDApIHtcbiAgICAgICAgICAgICAgICB2X3BFcnJvckNvZGUgPSBQbGF5U291bmRFcnJvckNvZGUuU291bmRHcm91cEhhc05vQWdlbnQ7XG4gICAgICAgICAgICAgICAgdl9zRXJyb3JNZXNzYWdlID0gXCJTb3VuZCBncm91cCAnXCIgKyBzb3VuZEdyb3VwTmFtZSArIFwiJyBpcyBoYXZlIG5vIHNvdW5kIGFnZW50LlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHZfcEVycm9yQ29kZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fcFBsYXlTb3VuZEZhaWx1cmVEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wUGxheVNvdW5kRmFpbHVyZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4odl9pU2VyaWFsSWQsIHNvdW5kQXNzZXROYW1lLCBzb3VuZEdyb3VwTmFtZSwgcGxheVNvdW5kUGFyYW1zLCB2X3BFcnJvckNvZGUsIHZfc0Vycm9yTWVzc2FnZSwgdXNlckRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZfaVNlcmlhbElkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Iodl9zRXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wU291bmRzQmVpbmdMb2FkZWQuYWRkKHZfaVNlcmlhbElkKTtcbiAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyLmxvYWRBc3NldChzb3VuZEFzc2V0TmFtZSwgcHJpb3JpdHksIHRoaXMubV9wTG9hZEFzc2V0Q2FsbGJhY2tzLCB7XG4gICAgICAgICAgICAgICAgc2VyaWFsSWQ6IHZfaVNlcmlhbElkLFxuICAgICAgICAgICAgICAgIHNvdW5kR3JvdXA6IHZfcFNvdW5kR3JvdXAsXG4gICAgICAgICAgICAgICAgcGxheVNvdW5kUGFyYW1zOiBwbGF5U291bmRQYXJhbXMsXG4gICAgICAgICAgICAgICAgdXNlckRhdGE6IHVzZXJEYXRhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB2X2lTZXJpYWxJZDtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRNYW5hZ2VyLnByb3RvdHlwZS5zdG9wU291bmQgPSBmdW5jdGlvbiAoc2VyaWFsSWQsIGZhZGVPdXRTZWNvbmRzKSB7XG4gICAgICAgICAgICB2YXIgZV85LCBfYTtcbiAgICAgICAgICAgIGZhZGVPdXRTZWNvbmRzID0gZmFkZU91dFNlY29uZHMgfHwgQ29uc3RhbnQuRGVmYXVsdEZhZGVPdXRTZWNvbmRzO1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nU291bmQoc2VyaWFsSWQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BTb3VuZHNUb1JlbGVhc2VPbkxvYWQuYWRkKHNlcmlhbElkKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFNvdW5kc0JlaW5nTG9hZGVkLmRlbGV0ZShzZXJpYWxJZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BTb3VuZEdyb3Vwcy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNvdW5kR3JvdXAgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNvdW5kR3JvdXAuc3RvcFNvdW5kKHNlcmlhbElkLCBmYWRlT3V0U2Vjb25kcykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfOV8xKSB7IGVfOSA9IHsgZXJyb3I6IGVfOV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzkpIHRocm93IGVfOS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLnN0b3BBbGxMb2FkZWRTb3VuZHMgPSBmdW5jdGlvbiAoZmFkZU91dFNlY29uZHMpIHtcbiAgICAgICAgICAgIHZhciBlXzEwLCBfYTtcbiAgICAgICAgICAgIGZhZGVPdXRTZWNvbmRzID0gZmFkZU91dFNlY29uZHMgfHwgQ29uc3RhbnQuRGVmYXVsdEZhZGVPdXRTZWNvbmRzO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRHcm91cHMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3VuZEdyb3VwID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHNvdW5kR3JvdXAuc3RvcEFsbExvYWRlZFNvdW5kcyhmYWRlT3V0U2Vjb25kcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMTBfMSkgeyBlXzEwID0geyBlcnJvcjogZV8xMF8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEwKSB0aHJvdyBlXzEwLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUuc3RvcEFsbExvYWRpbmdTb3VuZHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZV8xMSwgX2E7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BTb3VuZHNCZWluZ0xvYWRlZC52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlcmlhbElkID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wU291bmRzVG9SZWxlYXNlT25Mb2FkLmFkZChzZXJpYWxJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMTFfMSkgeyBlXzExID0geyBlcnJvcjogZV8xMV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzExKSB0aHJvdyBlXzExLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUucGF1c2VTb3VuZCA9IGZ1bmN0aW9uIChzZXJpYWxJZCwgZmFkZU91dFNlY29uZHMpIHtcbiAgICAgICAgICAgIHZhciBlXzEyLCBfYTtcbiAgICAgICAgICAgIGZhZGVPdXRTZWNvbmRzID0gZmFkZU91dFNlY29uZHMgfHwgQ29uc3RhbnQuRGVmYXVsdEZhZGVPdXRTZWNvbmRzO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRHcm91cHMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3VuZEdyb3VwID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VuZEdyb3VwLnBhdXNlU291bmQoc2VyaWFsSWQsIGZhZGVPdXRTZWNvbmRzKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xMl8xKSB7IGVfMTIgPSB7IGVycm9yOiBlXzEyXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMTIpIHRocm93IGVfMTIuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgZmluZCBzb3VuZCAnXCIgKyBzZXJpYWxJZCArIFwiJy5cIik7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUucmVzdW1lU291bmQgPSBmdW5jdGlvbiAoc2VyaWFsSWQsIGZhZGVJblNlY29uZHMpIHtcbiAgICAgICAgICAgIHZhciBlXzEzLCBfYTtcbiAgICAgICAgICAgIGZhZGVJblNlY29uZHMgPSBmYWRlSW5TZWNvbmRzIHx8IENvbnN0YW50LkRlZmF1bHRGYWRlSW5TZWNvbmRzO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRHcm91cHMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3VuZEdyb3VwID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VuZEdyb3VwLnJlc3VtZVNvdW5kKHNlcmlhbElkLCBmYWRlSW5TZWNvbmRzKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xM18xKSB7IGVfMTMgPSB7IGVycm9yOiBlXzEzXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMTMpIHRocm93IGVfMTMuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgZmluZCBzb3VuZCAnXCIgKyBzZXJpYWxJZCArIFwiJy5cIik7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUub25Mb2FkU291bmRTdWNjZXNzQ2FsbGJhY2sgPSBmdW5jdGlvbiAoc291bmRBc3NldE5hbWUsIHNvdW5kQXNzZXQsIGR1cmF0aW9uLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmICghdl9wSW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQbGF5IHNvdW5kIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BTb3VuZHNUb1JlbGVhc2VPbkxvYWQuaGFzKHZfcEluZm8uc2VyaWFsSWQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BTb3VuZHNUb1JlbGVhc2VPbkxvYWQuZGVsZXRlKHZfcEluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wU291bmRzQmVpbmdMb2FkZWQuZGVsZXRlKHZfcEluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgdmFyIHZfcEVycm9yQ29kZU91dCA9IHsgY29kZTogMCB9O1xuICAgICAgICAgICAgdmFyIHZfcFNvdW5kQWdlbnQgPSB2X3BJbmZvLnNvdW5kR3JvdXAucGxheVNvdW5kKHZfcEluZm8uc2VyaWFsSWQsIHNvdW5kQXNzZXQsIHZfcEluZm8ucGxheVNvdW5kUGFyYW1zLCB2X3BFcnJvckNvZGVPdXQpO1xuICAgICAgICAgICAgaWYgKHZfcFNvdW5kQWdlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tX3BQbGF5U291bmRTdWNjZXNzRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcFBsYXlTb3VuZFN1Y2Nlc3NEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodl9wSW5mbylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHZfcEluZm8uc2VyaWFsSWQsIHNvdW5kQXNzZXROYW1lLCB2X3BTb3VuZEFnZW50LCBkdXJhdGlvbiwgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kc1RvUmVsZWFzZU9uTG9hZC5kZWxldGUodl9wSW5mby5zZXJpYWxJZCk7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kSGVscGVyLnJlbGVhc2VTb3VuZEFzc2V0KHNvdW5kQXNzZXQpO1xuICAgICAgICAgICAgdmFyIHZfc0Vycm9yTWVzc2FnZSA9IFwiU291bmQgZ3JvdXAgJ1wiICsgdl9wSW5mby5zb3VuZEdyb3VwLm5hbWUgKyBcIicgcGxheSBzb3VuZCAnXCIgKyBzb3VuZEFzc2V0TmFtZSArIFwiJyBmYWlsdXJlLlwiO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wUGxheVNvdW5kRmFpbHVyZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFBsYXlTb3VuZEZhaWx1cmVEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2X3BJbmZvKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbih2X3BJbmZvLnNlcmlhbElkLCBzb3VuZEFzc2V0TmFtZSwgdl9wSW5mby5zb3VuZEdyb3VwLm5hbWUsIHZfcEluZm8ucGxheVNvdW5kUGFyYW1zLCB2X3BFcnJvckNvZGVPdXQuY29kZSwgdl9zRXJyb3JNZXNzYWdlLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih2X3NFcnJvck1lc3NhZ2UpO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLm9uTG9hZFNvdW5kRmFpbHVyZUNhbGxiYWNrID0gZnVuY3Rpb24gKHNvdW5kQXNzZXROYW1lLCBzdGF0dXMsIGVycm9yTWVzc2FnZSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAoIXZfcEluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGxheSBzb3VuZCBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wU291bmRzVG9SZWxlYXNlT25Mb2FkLmhhcyh2X3BJbmZvLnNlcmlhbElkKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wU291bmRzVG9SZWxlYXNlT25Mb2FkLmRlbGV0ZSh2X3BJbmZvLnNlcmlhbElkKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kc0JlaW5nTG9hZGVkLmRlbGV0ZSh2X3BJbmZvLnNlcmlhbElkKTtcbiAgICAgICAgICAgIHZhciB2X3NFcnJvck1lc3NhZ2UgPSBcIkxvYWQgc291bmQgZmFpbHVyZSwgYXNzZXQgbmFtZSAnXCIgKyBzb3VuZEFzc2V0TmFtZSArIFwiJywgc3RhdHVzICdcIiArIHN0YXR1cyArIFwiJywgZXJyb3IgbWVzc2FnZSAnXCIgKyBlcnJvck1lc3NhZ2UgKyBcIidcIjtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcFBsYXlTb3VuZEZhaWx1cmVEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BQbGF5U291bmRGYWlsdXJlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAodl9wSW5mbylcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4odl9wSW5mby5zZXJpYWxJZCwgc291bmRBc3NldE5hbWUsIHZfcEluZm8uc291bmRHcm91cC5uYW1lLCB2X3BJbmZvLnBsYXlTb3VuZFBhcmFtcywgUGxheVNvdW5kRXJyb3JDb2RlLkxvYWRBc3NldEZhaWx1cmUsIHZfc0Vycm9yTWVzc2FnZSwgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHZfc0Vycm9yTWVzc2FnZSk7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUub25Mb2FkU291bmRVcGRhdGVDYWxsYmFjayA9IGZ1bmN0aW9uIChzb3VuZEFzc2V0TmFtZSwgcHJvZ3Jlc3MsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKCF2X3BJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBsYXkgc291bmQgaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcFBsYXlTb3VuZFVwZGF0ZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFBsYXlTb3VuZFVwZGF0ZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEluZm8pXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHZfcEluZm8uc2VyaWFsSWQsIHNvdW5kQXNzZXROYW1lLCB2X3BJbmZvLnNvdW5kR3JvdXAubmFtZSwgdl9wSW5mby5wbGF5U291bmRQYXJhbXMsIHByb2dyZXNzLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgU291bmRNYW5hZ2VyLnByb3RvdHlwZS5vbkxvYWRTb3VuZERlcGVuZGVuY3lBc3NldENhbGxiYWNrID0gZnVuY3Rpb24gKHNvdW5kQXNzZXROYW1lLCBkZXBlbmRlbmN5QXNzZXROYW1lLCBsb2FkZWRDb3VudCwgdG90YWxDb3VudCwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAoIXZfcEluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGxheSBzb3VuZCBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wUGxheVNvdW5kRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wUGxheVNvdW5kRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAodl9wSW5mbylcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4odl9wSW5mby5zZXJpYWxJZCwgc291bmRBc3NldE5hbWUsIHZfcEluZm8uc291bmRHcm91cC5uYW1lLCB2X3BJbmZvLnBsYXlTb3VuZFBhcmFtcywgZGVwZW5kZW5jeUFzc2V0TmFtZSwgbG9hZGVkQ291bnQsIHRvdGFsQ291bnQsIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gU291bmRNYW5hZ2VyO1xuICAgIH0oQmFzZV8xLkZyYW1ld29ya01vZHVsZSkpOyAvLyBjbGFzcyBTb3VuZE1hbmFnZXJcbiAgICBleHBvcnRzLlNvdW5kTWFuYWdlciA9IFNvdW5kTWFuYWdlcjtcbn0pO1xuIiwidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG52YXIgX192YWx1ZXMgPSAodGhpcyAmJiB0aGlzLl9fdmFsdWVzKSB8fCBmdW5jdGlvbihvKSB7XG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcbiAgICBpZiAobyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHJldHVybiB7XG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IocyA/IFwiT2JqZWN0IGlzIG5vdCBpdGVyYWJsZS5cIiA6IFwiU3ltYm9sLml0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcbn07XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiLCBcIi4vT2JqZWN0UG9vbFwiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgdmFyIEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XG4gICAgdmFyIE9iamVjdFBvb2xfMSA9IHJlcXVpcmUoXCIuL09iamVjdFBvb2xcIik7XG4gICAgdmFyIFVJTWFuYWdlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgX19leHRlbmRzKFVJTWFuYWdlciwgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gVUlNYW5hZ2VyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgICAgICAgICBfdGhpcy5tX3JVSUdyb3VwcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIF90aGlzLm1faVNlcmlhbElkID0gMDtcbiAgICAgICAgICAgIF90aGlzLm1fYklzU2h1dGRvd24gPSBmYWxzZTtcbiAgICAgICAgICAgIF90aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIF90aGlzLm1fclVJRm9ybXNUb1JlbGVhc2VPbkxvYWQgPSBuZXcgU2V0KCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BSZWN5Y2xlUXVldWUgPSBbXTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRBc3NldENhbGxiYWNrcyA9IHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBfdGhpcy5sb2FkVUlGb3JtU3VjY2Vzc0NhbGxiYWNrLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIGZhaWx1cmU6IF90aGlzLmxvYWRVSUZvcm1GYWlsdXJlQ2FsbGJhY2suYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgdXBkYXRlOiBfdGhpcy5sb2FkVUlGb3JtVXBkYXRlQ2FsbGJhY2suYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgZGVwZW5kZW5jeTogX3RoaXMubG9hZFVJRm9ybURlcGVuZGVuY3lBc3NldENhbGxiYWNrLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIF90aGlzLm1fcE9wZW5VSUZvcm1TdWNjZXNzRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wT3BlblVJRm9ybUZhaWx1cmVEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BPcGVuVUlGb3JtVXBkYXRlRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wT3BlblVJRm9ybURlcGVuZGVuY3lBc3NldERlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcENsb3NlVUlGb3JtQ29tcGxldGVEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX2ZJbnN0YW5jZUF1dG9SZWxlYXNlSW50ZXJ2YWwgPSAwO1xuICAgICAgICAgICAgX3RoaXMubV91SW5zdGFuY2VDYXBhY2l0eSA9IDA7XG4gICAgICAgICAgICBfdGhpcy5tX2ZJbnN0YW5jZUV4cGlyZVRpbWUgPSAwO1xuICAgICAgICAgICAgX3RoaXMubV9pSW5zdGFuY2VQcmlvcml0eSA9IDA7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgICAgICAgICAvLyBwcml2YXRlIGZpcmVPcGVuVUlGb3JtQ29tcGxldGUoZXJyb3I6IEVycm9yLCB1aUZvcm1Bc3NldE5hbWU6IHN0cmluZywgdWlGb3JtQXNzZXQ6IG9iamVjdCwgZHVyYXRpb246IG51bWJlciwgaW5mbzogT3BlblVJRm9ybUluZm8pOiB2b2lkIHtcbiAgICAgICAgICAgIC8vIHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkLmRlbGV0ZShpbmZvLnNlcmlhbElkKTtcbiAgICAgICAgICAgIC8vIGlmICh0aGlzLm1fclVJRm9ybXNUb1JlbGVhc2VPbkxvYWQuaGFzKGluZm8uc2VyaWFsSWQpKSB7XG4gICAgICAgICAgICAvLyB0aGlzLm1fclVJRm9ybXNUb1JlbGVhc2VPbkxvYWQuZGVsZXRlKGluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgLy8gaWYgKCFlcnJvcilcbiAgICAgICAgICAgIC8vIHRoaXMubV9wVUlGb3JtSGVscGVyLnJlbGVhc2VVSUZvcm0odWlGb3JtQXNzZXQgYXMgb2JqZWN0LCBudWxsKTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIC8vIGxldCB1aUZvcm06IElVSUZvcm0gPSBudWxsO1xuICAgICAgICAgICAgLy8gaWYgKCFlcnJvcikge1xuICAgICAgICAgICAgLy8gbGV0IHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0OiBVSUZvcm1JbnN0YW5jZU9iamVjdCA9IFVJRm9ybUluc3RhbmNlT2JqZWN0LmNyZWF0ZSh1aUZvcm1Bc3NldE5hbWUsIHVpRm9ybUFzc2V0LCB0aGlzLm1fcFVJRm9ybUhlbHBlci5pbnN0YW50aWF0ZVVJRm9ybSh1aUZvcm1Bc3NldCBhcyBvYmplY3QpLCB0aGlzLm1fcFVJRm9ybUhlbHBlcik7XG4gICAgICAgICAgICAvLyAvLyBSZWdpc3RlciB0byBwb29sIGFuZCBtYXJrIHNwYXduIGZsYWcuXG4gICAgICAgICAgICAvLyBpZiAoIXRoaXMubV9wSW5zdGFuY2VQb29sLmhhcyh1aUZvcm1Bc3NldE5hbWUpKSB7XG4gICAgICAgICAgICAvLyB0aGlzLm1fcEluc3RhbmNlUG9vbC5zZXQodWlGb3JtQXNzZXROYW1lLCBbXSk7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvLyBsZXQgdl9wSW5zdGFuY2VPYmplY3RzOiBVSUZvcm1JbnN0YW5jZU9iamVjdFtdID0gdGhpcy5tX3BJbnN0YW5jZVBvb2wuZ2V0KHVpRm9ybUFzc2V0TmFtZSk7XG4gICAgICAgICAgICAvLyBpZiAodl9wSW5zdGFuY2VPYmplY3RzLmxlbmd0aCA8IHRoaXMubV91SW5zdGFuY2VDYXBhY2l0eSkge1xuICAgICAgICAgICAgLy8gdl9wVWlGb3JtSW5zdGFuY2VPYmplY3Quc3Bhd24gPSB0cnVlO1xuICAgICAgICAgICAgLy8gdl9wSW5zdGFuY2VPYmplY3RzLnB1c2godl9wVWlGb3JtSW5zdGFuY2VPYmplY3QpO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gdGhpcy5vcGVuVUlGb3JtSW50ZXJuYWwoaW5mby5zZXJpYWxJZCwgdWlGb3JtQXNzZXROYW1lLCBpbmZvLnVpR3JvdXAgYXMgVUlHcm91cCwgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QudGFyZ2V0LCBpbmZvLnBhdXNlQ292ZXJlZFVJRm9ybSwgdHJ1ZSwgZHVyYXRpb24sIGluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgLy8gfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGxldCBldmVudEFyZ3M6IE9wZW5VSUZvcm1GYWlsdXJlRXZlbnRBcmdzID0ge1xuICAgICAgICAgICAgLy8gZXJyb3JNZXNzYWdlOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICAgICAgLy8gc2VyaWFsSWQ6IGluZm8uc2VyaWFsSWQsXG4gICAgICAgICAgICAvLyBwYXVzZUNvdmVyZWRVSUZvcm06IGluZm8ucGF1c2VDb3ZlcmVkVUlGb3JtLFxuICAgICAgICAgICAgLy8gdWlHcm91cE5hbWU6IGluZm8udWlHcm91cC5uYW1lLFxuICAgICAgICAgICAgLy8gdWlGb3JtQXNzZXROYW1lOiB1aUZvcm1Bc3NldE5hbWUsXG4gICAgICAgICAgICAvLyB1c2VyRGF0YTogaW5mby51c2VyRGF0YVxuICAgICAgICAgICAgLy8gfTtcbiAgICAgICAgICAgIC8vIHRoaXMubV9wT3BlblVJRm9ybUZhaWx1cmVEZWxlZ2F0ZS5pdGVyKChjYWxsYmFja0ZuOiBPcGVuVUlGb3JtRmFpbHVyZUV2ZW50SGFuZGxlcikgPT4ge1xuICAgICAgICAgICAgLy8gY2FsbGJhY2tGbihldmVudEFyZ3MpO1xuICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvLyBwcml2YXRlIGZpcmVPcGVuVUlGb3JtUHJvZ3Jlc3ModWlGb3JtQXNzZXROYW1lOiBzdHJpbmcsIHByb2dyZXNzOiBudW1iZXIsIGluZm86IE9wZW5VSUZvcm1JbmZvKTogdm9pZCB7XG4gICAgICAgICAgICAvLyBsZXQgZXZlbnRBcmdzOiBPcGVuVUlGb3JtVXBkYXRlRXZlbnRBcmdzID0ge1xuICAgICAgICAgICAgLy8gc2VyaWFsSWQ6IGluZm8uc2VyaWFsSWQsXG4gICAgICAgICAgICAvLyBwYXVzZUNvdmVyZWRVSUZvcm06IGluZm8ucGF1c2VDb3ZlcmVkVUlGb3JtLFxuICAgICAgICAgICAgLy8gcHJvZ3Jlc3M6IHByb2dyZXNzLFxuICAgICAgICAgICAgLy8gdWlGb3JtQXNzZXROYW1lOiB1aUZvcm1Bc3NldE5hbWUsXG4gICAgICAgICAgICAvLyB1aUdyb3VwTmFtZTogaW5mby51aUdyb3VwLm5hbWUsXG4gICAgICAgICAgICAvLyB1c2VyRGF0YTogaW5mby51c2VyRGF0YVxuICAgICAgICAgICAgLy8gfTtcbiAgICAgICAgICAgIC8vIHRoaXMubV9wT3BlblVJRm9ybVVwZGF0ZURlbGVnYXRlLml0ZXIoKGNhbGxiYWNrRm46IE9wZW5VSUZvcm1VcGRhdGVFdmVudEhhbmRsZXIpID0+IHtcbiAgICAgICAgICAgIC8vIGNhbGxiYWNrRm4oZXZlbnRBcmdzKTtcbiAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSU1hbmFnZXIucHJvdG90eXBlLCBcInVpRm9ybUhlbHBlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wVUlGb3JtSGVscGVyOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGZvcm0gaGVscGVyIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1IZWxwZXIgPSB2YWx1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlNYW5hZ2VyLnByb3RvdHlwZSwgXCJyZXNvdXJjZU1hbmFnZXJcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG51bGwgPT0gdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJlc291cmNlIG1hbmFnZXIgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIgPSB2YWx1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlNYW5hZ2VyLnByb3RvdHlwZSwgXCJvYmplY3RQb29sTWFuYWdlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BPYmplY3RQb29sTWFuYWdlcjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChudWxsID09IHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09iamVjdFBvb2wgbWFuYWdlciBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wT2JqZWN0UG9vbE1hbmFnZXIgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEluc3RhbmNlUG9vbCA9IHRoaXMubV9wT2JqZWN0UG9vbE1hbmFnZXIuY3JlYXRlU2luZ2xlU3Bhd25PYmplY3RQb29sKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJVSSBJbnN0YW5jZSBQb29sXCJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlNYW5hZ2VyLnByb3RvdHlwZSwgXCJ1aUdyb3VwQ291bnRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9yVUlHcm91cHMuc2l6ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlNYW5hZ2VyLnByb3RvdHlwZSwgXCJvcGVuVUlGb3JtU3VjY2Vzc1wiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wT3BlblVJRm9ybVN1Y2Nlc3NEZWxlZ2F0ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSU1hbmFnZXIucHJvdG90eXBlLCBcIm9wZW5VSUZvcm1GYWlsdXJlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BPcGVuVUlGb3JtRmFpbHVyZURlbGVnYXRlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJTWFuYWdlci5wcm90b3R5cGUsIFwib3BlblVJRm9ybVVwZGF0ZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wT3BlblVJRm9ybVVwZGF0ZURlbGVnYXRlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJTWFuYWdlci5wcm90b3R5cGUsIFwib3BlblVJRm9ybURlcGVuZGVuY3lBc3NldFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wT3BlblVJRm9ybURlcGVuZGVuY3lBc3NldERlbGVnYXRlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJTWFuYWdlci5wcm90b3R5cGUsIFwiY2xvc2VVSUZvcm1Db21wbGV0ZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wQ2xvc2VVSUZvcm1Db21wbGV0ZURlbGVnYXRlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJTWFuYWdlci5wcm90b3R5cGUsIFwiaW5zdGFuY2VBdXRvUmVsZWFzZUludGVydmFsXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX2ZJbnN0YW5jZUF1dG9SZWxlYXNlSW50ZXJ2YWw7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1fZkluc3RhbmNlQXV0b1JlbGVhc2VJbnRlcnZhbCA9IHZhbHVlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJTWFuYWdlci5wcm90b3R5cGUsIFwiaW5zdGFuY2VDYXBhY2l0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV91SW5zdGFuY2VDYXBhY2l0eTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV91SW5zdGFuY2VDYXBhY2l0eSA9IHZhbHVlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJTWFuYWdlci5wcm90b3R5cGUsIFwiaW5zdGFuY2VFeHBpcmVUaW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX2ZJbnN0YW5jZUV4cGlyZVRpbWU7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1fZkluc3RhbmNlRXhwaXJlVGltZSA9IHZhbHVlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJTWFuYWdlci5wcm90b3R5cGUsIFwiaW5zdGFuY2VQcmlvcml0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9pSW5zdGFuY2VQcmlvcml0eTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9pSW5zdGFuY2VQcmlvcml0eSA9IHZhbHVlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIHZhciBlXzEsIF9hO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wUmVjeWNsZVF1ZXVlKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdWlGb3JtID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHVpRm9ybS5vblJlY3ljbGUoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BJbnN0YW5jZVBvb2wudW5zcGF3bkJ5VGFyZ2V0KHVpRm9ybS5oYW5kbGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzFfMSkgeyBlXzEgPSB7IGVycm9yOiBlXzFfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm1fcFJlY3ljbGVRdWV1ZS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdGhpcy5tX3BSZWN5Y2xlUXVldWUuc3BsaWNlKDAsIHRoaXMubV9wUmVjeWNsZVF1ZXVlLmxlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLm1fclVJR3JvdXBzLmZvckVhY2goZnVuY3Rpb24gKHVpR3JvdXAsIGtleSkge1xuICAgICAgICAgICAgICAgIHZhciB2X3BVaUdyb3VwID0gdWlHcm91cDtcbiAgICAgICAgICAgICAgICB2X3BVaUdyb3VwLnVwZGF0ZShlbGFwc2VkLCByZWFsRWxhcHNlZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMubV9iSXNTaHV0ZG93biA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmNsb3NlQWxsTG9hZGVkVUlGb3JtcygpO1xuICAgICAgICAgICAgdGhpcy5tX3JVSUdyb3Vwcy5jbGVhcigpO1xuICAgICAgICAgICAgdGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQuY2xlYXIoKTtcbiAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZC5jbGVhcigpO1xuICAgICAgICAgICAgdGhpcy5tX3BSZWN5Y2xlUXVldWUuc3BsaWNlKDAsIHRoaXMubV9wUmVjeWNsZVF1ZXVlLmxlbmd0aCk7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUub3BlblVJRm9ybSA9IGZ1bmN0aW9uICh1aUZvcm1Bc3NldE5hbWUsIHVpR3JvdXBOYW1lLCBwcmlvcml0eSwgcGF1c2VDb3ZlcmVkVUlGb3JtLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgLy8gY2MubG9nKGBbVUlNYW5hZ2VyXSBSZXFldXN0IE9wZW4gVUlGb3JtIGFzc2V0ICcke3VpRm9ybUFzc2V0TmFtZX0nIHdpdGggZ3JvdXAgJyR7dWlHcm91cE5hbWV9JyBvbiBwcmlvcml0eSAnJHtwcmlvcml0eX0nLCBwYXVzZUNvdmVyZWRVSUZvcm06ICR7cGF1c2VDb3ZlcmVkVUlGb3JtfSwgdXNlckRhdGE6ICR7dXNlckRhdGF9YCk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLm1fcFJlc291cmNlTWFuYWdlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgcmVzb3VyY2UgbWFuYWdlciBmaXJzdC5cIik7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLm1fcFVJRm9ybUhlbHBlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgVUkgZm9ybSBoZWxwZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgaWYgKCF1aUZvcm1Bc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGFzc2V0IG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGlmICghdWlHcm91cE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBncm91cCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB2YXIgdl9yVUlHcm91cCA9IHRoaXMuZ2V0VUlHcm91cCh1aUdyb3VwTmFtZSk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3JVSUdyb3VwKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVUkgZ3JvdXAgJ1wiICsgdWlHcm91cE5hbWUgKyBcIicgaXMgbm90IGV4aXN0LlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2X2lTZXJpYWxJZCA9ICsrdGhpcy5tX2lTZXJpYWxJZDtcbiAgICAgICAgICAgIHZhciB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdCA9IHRoaXMubV9wSW5zdGFuY2VQb29sLnNwYXduKHVpRm9ybUFzc2V0TmFtZSk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZC5oYXModl9pU2VyaWFsSWQpKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJLZXkgZHVwbGljYXRlZCB3aXRoOiBcIiArIHZfaVNlcmlhbElkKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZC5zZXQodl9pU2VyaWFsSWQsIHVpRm9ybUFzc2V0TmFtZSk7XG4gICAgICAgICAgICAgICAgdmFyIHZfck9wZW5VaUZvcm1JbmZvID0ge1xuICAgICAgICAgICAgICAgICAgICBzZXJpYWxJZDogdl9pU2VyaWFsSWQsXG4gICAgICAgICAgICAgICAgICAgIHVpR3JvdXA6IHZfclVJR3JvdXAsXG4gICAgICAgICAgICAgICAgICAgIHBhdXNlQ292ZXJlZFVJRm9ybTogcGF1c2VDb3ZlcmVkVUlGb3JtLFxuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YTogdXNlckRhdGFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyLmxvYWRBc3NldCh1aUZvcm1Bc3NldE5hbWUsIHByaW9yaXR5LCB0aGlzLm1fcExvYWRBc3NldENhbGxiYWNrcywgdl9yT3BlblVpRm9ybUluZm8pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuVUlGb3JtSW50ZXJuYWwodl9pU2VyaWFsSWQsIHVpRm9ybUFzc2V0TmFtZSwgdl9yVUlHcm91cCwgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QudGFyZ2V0LCBwYXVzZUNvdmVyZWRVSUZvcm0sIGZhbHNlLCAwLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdl9pU2VyaWFsSWQ7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUuaXNMb2FkaW5nVUlGb3JtID0gZnVuY3Rpb24gKHNlcmlhbElkT3JBc3NldE5hbWUpIHtcbiAgICAgICAgICAgIHZhciBlXzIsIF9hO1xuICAgICAgICAgICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2Ygc2VyaWFsSWRPckFzc2V0TmFtZSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdWlGb3JtQXNzZXROYW1lID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodWlGb3JtQXNzZXROYW1lID09PSBzZXJpYWxJZE9yQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzJfMSkgeyBlXzIgPSB7IGVycm9yOiBlXzJfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzIpIHRocm93IGVfMi5lcnJvcjsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQuaGFzKHNlcmlhbElkT3JBc3NldE5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmdldFVJRm9ybXMgPSBmdW5jdGlvbiAodWlGb3JtQXNzZXROYW1lKSB7XG4gICAgICAgICAgICB2YXIgZV8zLCBfYTtcbiAgICAgICAgICAgIHZhciB2X3JSZXQgPSBbXTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fclVJR3JvdXBzLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdWlHcm91cCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAobnVsbCAhPSB1aUdyb3VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdl9wRm9ybXMgPSB1aUdyb3VwLmdldFVJRm9ybXModWlGb3JtQXNzZXROYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZfclJldCA9IHZfclJldC5jb25jYXQodl9wRm9ybXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfM18xKSB7IGVfMyA9IHsgZXJyb3I6IGVfM18xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzMpIHRocm93IGVfMy5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZfclJldDtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5nZXRVSUZvcm0gPSBmdW5jdGlvbiAoc2VyaWFsSWRPckFzc2V0TmFtZSkge1xuICAgICAgICAgICAgdmFyIGVfNCwgX2E7XG4gICAgICAgICAgICBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiBzZXJpYWxJZE9yQXNzZXROYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzZXJpYWxJZE9yQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGZvcm0gYXNzZXQgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHVpRm9ybTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fclVJR3JvdXBzLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdWlHcm91cCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoKHVpRm9ybSA9IHVpR3JvdXAuZ2V0VUlGb3JtKHNlcmlhbElkT3JBc3NldE5hbWUpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVpRm9ybTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzRfMSkgeyBlXzQgPSB7IGVycm9yOiBlXzRfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV80KSB0aHJvdyBlXzQuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmhhc1VJRm9ybSA9IGZ1bmN0aW9uIChzZXJpYWxJZE9yQXNzZXROYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbCAhPSB0aGlzLmdldFVJRm9ybShzZXJpYWxJZE9yQXNzZXROYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5jbG9zZVVJRm9ybSA9IGZ1bmN0aW9uIChzZXJpYWxJZE9yVWlGb3JtLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHVpRm9ybSA9IHNlcmlhbElkT3JVaUZvcm07XG4gICAgICAgICAgICBpZiAoJ251bWJlcicgPT09IHR5cGVvZiBzZXJpYWxJZE9yVWlGb3JtKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nVUlGb3JtKHNlcmlhbElkT3JVaUZvcm0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZC5hZGQoc2VyaWFsSWRPclVpRm9ybSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkLmRlbGV0ZShzZXJpYWxJZE9yVWlGb3JtKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB1aUZvcm0gPSB0aGlzLmdldFVJRm9ybShzZXJpYWxJZE9yVWlGb3JtKTtcbiAgICAgICAgICAgICAgICBpZiAobnVsbCA9PSB1aUZvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuIG5vdCBmaW5kIFVJIGZvcm0gJ1wiICsgc2VyaWFsSWRPclVpRm9ybSArIFwiJ1wiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXVpRm9ybSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGZvcm0gaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHZhciB1aUdyb3VwID0gdWlGb3JtLnVpR3JvdXA7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB1aUdyb3VwKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZ3JvdXAgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHVzZXJEYXRhID0gdXNlckRhdGEgfHwgbnVsbDtcbiAgICAgICAgICAgIHVpR3JvdXAucmVtb3ZlVUlGb3JtKHVpRm9ybSk7XG4gICAgICAgICAgICB1aUZvcm0ub25DbG9zZSh0aGlzLm1fYklzU2h1dGRvd24sIHVzZXJEYXRhKTtcbiAgICAgICAgICAgIHVpR3JvdXAucmVmcmVzaCgpO1xuICAgICAgICAgICAgdmFyIGV2ZW50QXJncyA9IHtcbiAgICAgICAgICAgICAgICBzZXJpYWxJZDogdWlGb3JtLnNlcmlhbElkLFxuICAgICAgICAgICAgICAgIHVpR3JvdXA6IHVpR3JvdXAsXG4gICAgICAgICAgICAgICAgdWlGb3JtQXNzZXROYW1lOiB1aUZvcm0udWlGb3JtQXNzZXROYW1lLFxuICAgICAgICAgICAgICAgIHVzZXJEYXRhOiB1c2VyRGF0YVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMubV9wQ2xvc2VVSUZvcm1Db21wbGV0ZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGV2ZW50QXJncyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubV9wUmVjeWNsZVF1ZXVlLnB1c2godWlGb3JtKTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5nZXRBbGxMb2FkZWRVSUZvcm1zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfNSwgX2E7XG4gICAgICAgICAgICB2YXIgdl9wUmV0ID0gW107XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3JVSUdyb3Vwcy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHVpR3JvdXAgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdl9wUmV0LmNvbmNhdCh1aUdyb3VwLmdldEFsbFVJRm9ybXMoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfNV8xKSB7IGVfNSA9IHsgZXJyb3I6IGVfNV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzUpIHRocm93IGVfNS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZfcFJldDtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5jbG9zZUFsbExvYWRlZFVJRm9ybXMgPSBmdW5jdGlvbiAodXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciBlXzYsIF9hO1xuICAgICAgICAgICAgdmFyIHZfcFVJRm9ybXMgPSB0aGlzLmdldEFsbExvYWRlZFVJRm9ybXMoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgdl9wVUlGb3Jtc18xID0gX192YWx1ZXModl9wVUlGb3JtcyksIHZfcFVJRm9ybXNfMV8xID0gdl9wVUlGb3Jtc18xLm5leHQoKTsgIXZfcFVJRm9ybXNfMV8xLmRvbmU7IHZfcFVJRm9ybXNfMV8xID0gdl9wVUlGb3Jtc18xLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdWlGb3JtID0gdl9wVUlGb3Jtc18xXzEudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5oYXNVSUZvcm0odWlGb3JtLnNlcmlhbElkKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsb3NlVUlGb3JtKHVpRm9ybSwgdXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzZfMSkgeyBlXzYgPSB7IGVycm9yOiBlXzZfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodl9wVUlGb3Jtc18xXzEgJiYgIXZfcFVJRm9ybXNfMV8xLmRvbmUgJiYgKF9hID0gdl9wVUlGb3Jtc18xLnJldHVybikpIF9hLmNhbGwodl9wVUlGb3Jtc18xKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzYpIHRocm93IGVfNi5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmNsb3NlQWxsTG9hZGluZ1VJRm9ybXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZV83LCBfYTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZC5rZXlzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZXJpYWxJZCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNUb1JlbGVhc2VPbkxvYWQuYWRkKHNlcmlhbElkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV83XzEpIHsgZV83ID0geyBlcnJvcjogZV83XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNykgdGhyb3cgZV83LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZC5jbGVhcigpO1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLnJlZm9jdXNVSUZvcm0gPSBmdW5jdGlvbiAodWlGb3JtLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdWlGb3JtKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdmFyIHVpR3JvdXAgPSB1aUZvcm0udWlHcm91cDtcbiAgICAgICAgICAgIGlmIChudWxsID09IHVpR3JvdXApXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBncm91cCBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdXNlckRhdGEgPSB1c2VyRGF0YSB8fCBudWxsO1xuICAgICAgICAgICAgdWlHcm91cC5yZWZvY3VzVUlGb3JtKHVpRm9ybSwgdXNlckRhdGEpO1xuICAgICAgICAgICAgdWlHcm91cC5yZWZyZXNoKCk7XG4gICAgICAgICAgICB1aUZvcm0ub25SZWZvY3VzKHVzZXJEYXRhKTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5oYXNVSUdyb3VwID0gZnVuY3Rpb24gKHVpR3JvdXBOYW1lKSB7XG4gICAgICAgICAgICBpZiAoIXVpR3JvdXBOYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZ3JvdXAgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9yVUlHcm91cHMuaGFzKHVpR3JvdXBOYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5nZXRVSUdyb3VwID0gZnVuY3Rpb24gKHVpR3JvdXBOYW1lKSB7XG4gICAgICAgICAgICBpZiAoIXVpR3JvdXBOYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZ3JvdXAgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9yVUlHcm91cHMuZ2V0KHVpR3JvdXBOYW1lKSB8fCBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmFkZFVJR3JvdXAgPSBmdW5jdGlvbiAodWlHcm91cE5hbWUsIGFyZzEsIGFyZzIpIHtcbiAgICAgICAgICAgIGlmICghdWlHcm91cE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBncm91cCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB2YXIgdWlHcm91cERlcHRoID0gMDtcbiAgICAgICAgICAgIHZhciB1aUdyb3VwSGVscGVyO1xuICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2YgYXJnMSkge1xuICAgICAgICAgICAgICAgIHVpR3JvdXBEZXB0aCA9IGFyZzE7XG4gICAgICAgICAgICAgICAgaWYgKHVuZGVmaW5lZCAhPSBhcmcyKSB7XG4gICAgICAgICAgICAgICAgICAgIHVpR3JvdXBIZWxwZXIgPSBhcmcyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHVpR3JvdXBIZWxwZXIgPSBhcmcxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF1aUdyb3VwSGVscGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZ3JvdXAgaGVscGVyIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBpZiAodGhpcy5oYXNVSUdyb3VwKHVpR3JvdXBOYW1lKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm1fclVJR3JvdXBzLnNldCh1aUdyb3VwTmFtZSwgbmV3IFVJR3JvdXAodWlHcm91cE5hbWUsIHVpR3JvdXBEZXB0aCwgdWlHcm91cEhlbHBlcikpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUub3BlblVJRm9ybUludGVybmFsID0gZnVuY3Rpb24gKHNlcmlhbElkLCB1aUZvcm1Bc3NldE5hbWUsIHVpR3JvdXAsIHVpRm9ybUluc3RhbmNlLCBwYXVzZUNvdmVyZWRVSUZvcm0sIGlzTmV3SW5zdGFuY2UsIGR1cmF0aW9uLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHVpRm9ybSA9IHRoaXMubV9wVUlGb3JtSGVscGVyLmNyZWF0ZVVJRm9ybSh1aUZvcm1JbnN0YW5jZSwgdWlHcm91cCwgdXNlckRhdGEpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdWlGb3JtKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG5vdCBjcmVhdGUgVUkgZm9ybSBpbiBoZWxwZXIuJyk7XG4gICAgICAgICAgICB1aUZvcm0ub25Jbml0KHNlcmlhbElkLCB1aUZvcm1Bc3NldE5hbWUsIHVpR3JvdXAsIHBhdXNlQ292ZXJlZFVJRm9ybSwgaXNOZXdJbnN0YW5jZSwgdXNlckRhdGEpO1xuICAgICAgICAgICAgdWlHcm91cC5hZGRVSUZvcm0odWlGb3JtKTtcbiAgICAgICAgICAgIHVpRm9ybS5vbk9wZW4odXNlckRhdGEpO1xuICAgICAgICAgICAgdWlHcm91cC5yZWZyZXNoKCk7XG4gICAgICAgICAgICB2YXIgZXZlbnRBcmdzID0ge1xuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbixcbiAgICAgICAgICAgICAgICB1aUZvcm06IHVpRm9ybSxcbiAgICAgICAgICAgICAgICB1c2VyRGF0YTogdXNlckRhdGFcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLm1fcE9wZW5VSUZvcm1TdWNjZXNzRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oZXZlbnRBcmdzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmxvYWRVSUZvcm1TdWNjZXNzQ2FsbGJhY2sgPSBmdW5jdGlvbiAodWlGb3JtQXNzZXROYW1lLCB1aUZvcm1Bc3NldCwgZHVyYXRpb24sIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wSW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJPcGVuIFVJIGZvcm0gaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fclVJRm9ybXNUb1JlbGVhc2VPbkxvYWQuaGFzKHZfcEluZm8uc2VyaWFsSWQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3JVSUZvcm1zVG9SZWxlYXNlT25Mb2FkLmRlbGV0ZSh2X3BJbmZvLnNlcmlhbElkKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUhlbHBlci5yZWxlYXNlVUlGb3JtKHVpRm9ybUFzc2V0LCBudWxsKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZC5kZWxldGUodl9wSW5mby5zZXJpYWxJZCk7XG4gICAgICAgICAgICB2YXIgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QgPSBVSUZvcm1JbnN0YW5jZU9iamVjdC5jcmVhdGUodWlGb3JtQXNzZXROYW1lLCB1aUZvcm1Bc3NldCwgdGhpcy5tX3BVSUZvcm1IZWxwZXIuaW5zdGFudGlhdGVVSUZvcm0odWlGb3JtQXNzZXQpLCB0aGlzLm1fcFVJRm9ybUhlbHBlcik7XG4gICAgICAgICAgICB0aGlzLm1fcEluc3RhbmNlUG9vbC5yZWdpc3Rlcih2X3BVaUZvcm1JbnN0YW5jZU9iamVjdCwgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLm9wZW5VSUZvcm1JbnRlcm5hbCh2X3BJbmZvLnNlcmlhbElkLCB1aUZvcm1Bc3NldE5hbWUsIHZfcEluZm8udWlHcm91cCwgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QudGFyZ2V0LCB2X3BJbmZvLnBhdXNlQ292ZXJlZFVJRm9ybSwgdHJ1ZSwgZHVyYXRpb24sIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmxvYWRVSUZvcm1GYWlsdXJlQ2FsbGJhY2sgPSBmdW5jdGlvbiAodWlGb3JtQXNzZXROYW1lLCBzdGF0dXMsIGVycm9yTWVzc2FnZSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk9wZW4gVUkgZm9ybSBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZC5oYXModl9wSW5mby5zZXJpYWxJZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNUb1JlbGVhc2VPbkxvYWQuZGVsZXRlKHZfcEluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkLmRlbGV0ZSh2X3BJbmZvLnNlcmlhbElkKTtcbiAgICAgICAgICAgIHZhciBhcHBlbmRFcnJvck1lc3NhZ2UgPSBcIkxvYWQgVUkgZm9ybSBmYWlsdXJlLCBhc3NldCBuYW1lICdcIiArIHVpRm9ybUFzc2V0TmFtZSArIFwiJywgc3RhdHVzICdcIiArIHN0YXR1cy50b1N0cmluZygpICsgXCInLCBlcnJvciBtZXNzYWdlICdcIiArIGVycm9yTWVzc2FnZSArIFwiJy5cIjtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcE9wZW5VSUZvcm1GYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHZhciBldmVudEFyZ3NfMSA9IHtcbiAgICAgICAgICAgICAgICAgICAgc2VyaWFsSWQ6IHZfcEluZm8uc2VyaWFsSWQsXG4gICAgICAgICAgICAgICAgICAgIHVpRm9ybUFzc2V0TmFtZTogdWlGb3JtQXNzZXROYW1lLFxuICAgICAgICAgICAgICAgICAgICB1aUdyb3VwTmFtZTogdl9wSW5mby51aUdyb3VwLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYXBwZW5kRXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBwYXVzZUNvdmVyZWRVSUZvcm06IHZfcEluZm8ucGF1c2VDb3ZlcmVkVUlGb3JtLFxuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YTogdl9wSW5mby51c2VyRGF0YVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BPcGVuVUlGb3JtRmFpbHVyZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihldmVudEFyZ3NfMSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGFwcGVuZEVycm9yTWVzc2FnZSk7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUubG9hZFVJRm9ybVVwZGF0ZUNhbGxiYWNrID0gZnVuY3Rpb24gKHVpRm9ybUFzc2V0TmFtZSwgcHJvZ3Jlc3MsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wSW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJPcGVuIFVJIGZvcm0gaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcE9wZW5VSUZvcm1VcGRhdGVEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50QXJnc18yID0ge1xuICAgICAgICAgICAgICAgICAgICBzZXJpYWxJZDogdl9wSW5mby5zZXJpYWxJZCxcbiAgICAgICAgICAgICAgICAgICAgdWlGb3JtQXNzZXROYW1lOiB1aUZvcm1Bc3NldE5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHVpR3JvdXBOYW1lOiB2X3BJbmZvLnVpR3JvdXAubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IHByb2dyZXNzLFxuICAgICAgICAgICAgICAgICAgICBwYXVzZUNvdmVyZWRVSUZvcm06IHZfcEluZm8ucGF1c2VDb3ZlcmVkVUlGb3JtLFxuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YTogdl9wSW5mby51c2VyRGF0YVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BPcGVuVUlGb3JtVXBkYXRlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGV2ZW50QXJnc18yKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5sb2FkVUlGb3JtRGVwZW5kZW5jeUFzc2V0Q2FsbGJhY2sgPSBmdW5jdGlvbiAodWlGb3JtQXNzZXROYW1lLCBkZXBlbmRlbmN5QXNzZXROYW1lLCBsb2FkZWRDb3VudCwgdG90YWxDb3VudCwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk9wZW4gVUkgZm9ybSBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wT3BlblVJRm9ybURlcGVuZGVuY3lBc3NldERlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnRBcmdzXzMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHNlcmlhbElkOiB2X3BJbmZvLnNlcmlhbElkLFxuICAgICAgICAgICAgICAgICAgICB1aUZvcm1Bc3NldE5hbWU6IHVpRm9ybUFzc2V0TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdWlHcm91cE5hbWU6IHZfcEluZm8udWlHcm91cC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBkZXBlbmRlbmN5QXNzZXROYW1lOiBkZXBlbmRlbmN5QXNzZXROYW1lLFxuICAgICAgICAgICAgICAgICAgICBsb2FkZWRDb3VudDogbG9hZGVkQ291bnQsXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsQ291bnQ6IHRvdGFsQ291bnQsXG4gICAgICAgICAgICAgICAgICAgIHBhdXNlQ292ZXJlZFVJRm9ybTogdl9wSW5mby5wYXVzZUNvdmVyZWRVSUZvcm0sXG4gICAgICAgICAgICAgICAgICAgIHVzZXJEYXRhOiB2X3BJbmZvLnVzZXJEYXRhXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcE9wZW5VSUZvcm1EZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oZXZlbnRBcmdzXzMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gVUlNYW5hZ2VyO1xuICAgIH0oQmFzZV8xLkZyYW1ld29ya01vZHVsZSkpOyAvLyBjbGFzcyBVSU1hbmFnZXJcbiAgICBleHBvcnRzLlVJTWFuYWdlciA9IFVJTWFuYWdlcjtcbiAgICB2YXIgVUlGb3JtSW5zdGFuY2VPYmplY3QgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhVSUZvcm1JbnN0YW5jZU9iamVjdCwgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gVUlGb3JtSW5zdGFuY2VPYmplY3QoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgICAgICAgICAgIF90aGlzLm1fcFVJRm9ybUFzc2V0ID0gbnVsbDtcbiAgICAgICAgICAgIF90aGlzLm1fcFVJRm9ybUhlbHBlciA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgICAgIH1cbiAgICAgICAgVUlGb3JtSW5zdGFuY2VPYmplY3QuY3JlYXRlID0gZnVuY3Rpb24gKG5hbWUsIHVpRm9ybUFzc2V0LCB1aUZvcm1JbnN0YW5jZSwgdWlGb3JtSGVscGVyKSB7XG4gICAgICAgICAgICBpZiAoIXVpRm9ybUFzc2V0KVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBhc3NldCBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgaWYgKCF1aUZvcm1IZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGhlbHBlciBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdmFyIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0ID0gbmV3IFVJRm9ybUluc3RhbmNlT2JqZWN0KCk7XG4gICAgICAgICAgICB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC5pbml0aWFsaXplKG5hbWUsIHVpRm9ybUluc3RhbmNlKTtcbiAgICAgICAgICAgIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0Lm1fcFVJRm9ybUFzc2V0ID0gdWlGb3JtQXNzZXQ7XG4gICAgICAgICAgICB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC5tX3BVSUZvcm1IZWxwZXIgPSB1aUZvcm1IZWxwZXI7XG4gICAgICAgICAgICByZXR1cm4gdl9wVWlGb3JtSW5zdGFuY2VPYmplY3Q7XG4gICAgICAgIH07XG4gICAgICAgIFVJRm9ybUluc3RhbmNlT2JqZWN0LnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF9zdXBlci5wcm90b3R5cGUuY2xlYXIuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMubV9wVUlGb3JtQXNzZXQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1IZWxwZXIgPSBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBVSUZvcm1JbnN0YW5jZU9iamVjdC5wcm90b3R5cGUucmVsZWFzZSA9IGZ1bmN0aW9uIChzaHV0ZG93bikge1xuICAgICAgICAgICAgc2h1dGRvd24gPSBzaHV0ZG93biB8fCBmYWxzZTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcFVJRm9ybUhlbHBlcilcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUhlbHBlci5yZWxlYXNlVUlGb3JtKHRoaXMubV9wVUlGb3JtQXNzZXQsIHRoaXMudGFyZ2V0KTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFVJRm9ybUluc3RhbmNlT2JqZWN0O1xuICAgIH0oT2JqZWN0UG9vbF8xLk9iamVjdEJhc2UpKTsgLy8gY2xhc3MgVUlGb3JtSW5zdGFuY2VPYmplY3RcbiAgICB2YXIgVUlHcm91cCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gVUlHcm91cChuYW1lLCBkZXB0aCwgaGVscGVyKSB7XG4gICAgICAgICAgICB0aGlzLm1faURlcHRoID0gMDtcbiAgICAgICAgICAgIHRoaXMubV9iUGF1c2UgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubV9wVUlGb3JtSW5mb3MgPSBbXTtcbiAgICAgICAgICAgIGlmICghbmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGdyb3VwIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGlmICghaGVscGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZ3JvdXAgaGVscGVyIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB0aGlzLm1fc05hbWUgPSBuYW1lO1xuICAgICAgICAgICAgdGhpcy5tX2JQYXVzZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5oZWxwZXIgPSBoZWxwZXI7XG4gICAgICAgICAgICB0aGlzLmRlcHRoID0gZGVwdGg7XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJR3JvdXAucHJvdG90eXBlLCBcIm5hbWVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fc05hbWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlHcm91cC5wcm90b3R5cGUsIFwiZGVwdGhcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1faURlcHRoOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gdGhpcy5tX2lEZXB0aClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRoaXMubV9pRGVwdGggPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmhlbHBlci5zZXREZXB0aCh0aGlzLm1faURlcHRoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlHcm91cC5wcm90b3R5cGUsIFwicGF1c2VcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fYlBhdXNlOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tX2JQYXVzZSA9PSB2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRoaXMubV9iUGF1c2UgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlHcm91cC5wcm90b3R5cGUsIFwidWlGb3JtQ291bnRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wVUlGb3JtSW5mb3MubGVuZ3RoO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSUdyb3VwLnByb3RvdHlwZSwgXCJjdXJyZW50VUlGb3JtXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFVJRm9ybUluZm9zLmxlbmd0aCA+IDAgPyB0aGlzLm1fcFVJRm9ybUluZm9zWzBdLnVpRm9ybSA6IG51bGw7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgVUlHcm91cC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICB2YXIgZV84LCBfYTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFVJRm9ybUluZm9zKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5mbyA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5mby5wYXVzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGluZm8udWlGb3JtLm9uVXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV84XzEpIHsgZV84ID0geyBlcnJvcjogZV84XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfOCkgdGhyb3cgZV84LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFVJR3JvdXAucHJvdG90eXBlLmFkZFVJRm9ybSA9IGZ1bmN0aW9uICh1aUZvcm0pIHtcbiAgICAgICAgICAgIHRoaXMubV9wVUlGb3JtSW5mb3MudW5zaGlmdCh7XG4gICAgICAgICAgICAgICAgdWlGb3JtOiB1aUZvcm0sXG4gICAgICAgICAgICAgICAgY292ZXJlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwYXVzZWQ6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBVSUdyb3VwLnByb3RvdHlwZS5yZW1vdmVVSUZvcm0gPSBmdW5jdGlvbiAodWlGb3JtKSB7XG4gICAgICAgICAgICB2YXIgdl91SWR4ID0gLTE7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubV9wVUlGb3JtSW5mb3MubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tX3BVSUZvcm1JbmZvc1tpXS51aUZvcm0gPT0gdWlGb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgIHZfdUlkeCA9IGk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh2X3VJZHggPT0gLTEpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuIG5vdCBmaW5kIFVJIGZvcm0gaW5mbyBmb3Igc2VyaWFsIGlkICdcIiArIHVpRm9ybS5zZXJpYWxJZCArIFwiJywgVUkgZm9ybSBhc3NldCBuYW1lIGlzICdcIiArIHVpRm9ybS51aUZvcm1Bc3NldE5hbWUgKyBcIicuXCIpO1xuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB0aGlzLm1fcFVJRm9ybUluZm9zW3ZfdUlkeF07XG4gICAgICAgICAgICBpZiAoIXZfcEluZm8uY292ZXJlZCkge1xuICAgICAgICAgICAgICAgIHZfcEluZm8uY292ZXJlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdWlGb3JtLm9uQ292ZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdl9wSW5mby5wYXVzZWQpIHtcbiAgICAgICAgICAgICAgICB2X3BJbmZvLnBhdXNlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdWlGb3JtLm9uUGF1c2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wVUlGb3JtSW5mb3Muc3BsaWNlKHZfdUlkeCwgMSk7XG4gICAgICAgIH07XG4gICAgICAgIFVJR3JvdXAucHJvdG90eXBlLmhhc1VJRm9ybSA9IGZ1bmN0aW9uIChpZE9yQXNzZXROYW1lKSB7XG4gICAgICAgICAgICB2YXIgZV85LCBfYTtcbiAgICAgICAgICAgIHZhciBzdWJQcm9wTmFtZSA9ICdzZXJpYWxJZCc7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGlkT3JBc3NldE5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpZE9yQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGZvcm0gYXNzZXQgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgICAgIHN1YlByb3BOYW1lID0gJ3VpRm9ybUFzc2V0TmFtZSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BVSUZvcm1JbmZvcyksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZm8gPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZm8udWlGb3JtW3N1YlByb3BOYW1lXSA9PT0gaWRPckFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzlfMSkgeyBlXzkgPSB7IGVycm9yOiBlXzlfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV85KSB0aHJvdyBlXzkuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlHcm91cC5wcm90b3R5cGUuZ2V0VUlGb3JtID0gZnVuY3Rpb24gKGlkT3JBc3NldE5hbWUpIHtcbiAgICAgICAgICAgIHZhciBlXzEwLCBfYTtcbiAgICAgICAgICAgIHZhciBzdWJQcm9wTmFtZSA9ICdzZXJpYWxJZCc7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGlkT3JBc3NldE5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpZE9yQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGZvcm0gYXNzZXQgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgICAgIHN1YlByb3BOYW1lID0gJ3VpRm9ybUFzc2V0TmFtZSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BVSUZvcm1JbmZvcyksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZm8gPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZm8udWlGb3JtW3N1YlByb3BOYW1lXSA9PT0gaWRPckFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpbmZvLnVpRm9ybTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xMF8xKSB7IGVfMTAgPSB7IGVycm9yOiBlXzEwXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMTApIHRocm93IGVfMTAuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBVSUdyb3VwLnByb3RvdHlwZS5nZXRVSUZvcm1zID0gZnVuY3Rpb24gKGFzc2V0TmFtZSkge1xuICAgICAgICAgICAgdmFyIGVfMTEsIF9hO1xuICAgICAgICAgICAgaWYgKCFhc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGFzc2V0IG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHZhciB2X3BSZXQgPSBbXTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFVJRm9ybUluZm9zLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLnVpRm9ybS51aUZvcm1Bc3NldE5hbWUgPT09IGFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHZfcFJldC5wdXNoKHZhbHVlLnVpRm9ybSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMTFfMSkgeyBlXzExID0geyBlcnJvcjogZV8xMV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzExKSB0aHJvdyBlXzExLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdl9wUmV0O1xuICAgICAgICB9O1xuICAgICAgICBVSUdyb3VwLnByb3RvdHlwZS5nZXRBbGxVSUZvcm1zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wVUlGb3JtSW5mb3MubWFwKGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluZm8udWlGb3JtO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIFVJR3JvdXAucHJvdG90eXBlLnJlZm9jdXNVSUZvcm0gPSBmdW5jdGlvbiAodWlGb3JtLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfdUlkeCA9IC0xO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1fcFVJRm9ybUluZm9zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubV9wVUlGb3JtSW5mb3NbaV0udWlGb3JtID09IHVpRm9ybSkge1xuICAgICAgICAgICAgICAgICAgICB2X3VJZHggPSBpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodl91SWR4ID09IC0xKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgZmluZCBVSSBmb3JtIGluZm8gZm9yIHNlcmlhbCBpZCAnXCIgKyB1aUZvcm0uc2VyaWFsSWQgKyBcIicsIFVJIGZvcm0gYXNzZXQgbmFtZSBpcyAnXCIgKyB1aUZvcm0udWlGb3JtQXNzZXROYW1lICsgXCInLlwiKTtcbiAgICAgICAgICAgIGlmICh2X3VJZHggPj0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wVUlGb3JtSW5mb3Muc3BsaWNlKHZfdUlkeCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHRoaXMubV9wVUlGb3JtSW5mb3Nbdl91SWR4XTtcbiAgICAgICAgICAgIHRoaXMubV9wVUlGb3JtSW5mb3MudW5zaGlmdCh2X3BJbmZvKTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlHcm91cC5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBlXzEyLCBfYTtcbiAgICAgICAgICAgIHZhciB2X2JQYXVzZSA9IHRoaXMucGF1c2U7XG4gICAgICAgICAgICB2YXIgdl9iQ292ZXIgPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciB2X2lEZXB0aCA9IHRoaXMudWlGb3JtQ291bnQ7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BVSUZvcm1JbmZvcyksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZm8gPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG51bGwgPT0gaW5mbylcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZfYlBhdXNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWluZm8uY292ZXJlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8uY292ZXJlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby51aUZvcm0ub25Db3ZlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpbmZvLnBhdXNlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8ucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLnVpRm9ybS5vblBhdXNlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5mby5wYXVzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8udWlGb3JtLm9uUmVzdW1lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5mby51aUZvcm0ucGF1c2VDb3ZlcmVkVUlGb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdl9iUGF1c2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZfYkNvdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpbmZvLmNvdmVyZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5jb3ZlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby51aUZvcm0ub25Db3ZlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmZvLmNvdmVyZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5jb3ZlcmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8udWlGb3JtLm9uUmV2ZWFsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZfYkNvdmVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzEyXzEpIHsgZV8xMiA9IHsgZXJyb3I6IGVfMTJfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xMikgdGhyb3cgZV8xMi5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gVUlHcm91cDtcbiAgICB9KCkpOyAvLyBjbGFzcyBVSUdyb3VwXG4gICAgZXhwb3J0cy5VSUdyb3VwID0gVUlHcm91cDtcbn0pO1xuIiwiKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIl0sIGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIHZhciBnbG9iYWwgPSBnbG9iYWwgfHwge307XG4gICAgdmFyIHZfcEdsb2JhbCA9ICd1bmRlZmluZWQnID09IHR5cGVvZiB3aW5kb3cgPyBnbG9iYWwgOiB3aW5kb3c7XG4gICAgdmFyIGF0c2ZyYW1ld29yayA9IHZfcEdsb2JhbC5hdHNmcmFtZXdvcmsgfHwge307XG4gICAgZnVuY3Rpb24gZXhwb3NlKG0pIHtcbiAgICAgICAgZm9yICh2YXIgayBpbiBtKSB7XG4gICAgICAgICAgICBhdHNmcmFtZXdvcmtba10gPSBtW2tdO1xuICAgICAgICB9XG4gICAgfVxuICAgIGV4cG9zZShyZXF1aXJlKCcuL0Jhc2UnKSk7XG4gICAgZXhwb3NlKHJlcXVpcmUoXCIuL0NvbmZpZ1wiKSk7XG4gICAgZXhwb3NlKHJlcXVpcmUoXCIuL0RhdGFOb2RlXCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vRGF0YVRhYmxlXCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vRnNtXCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vUmVzb3VyY2VcIikpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9FbnRpdHlcIikpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9FdmVudFwiKSk7XG4gICAgZXhwb3NlKHJlcXVpcmUoXCIuL05ldHdvcmtcIikpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9PYmplY3RQb29sXCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vUHJvY2VkdXJlXCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vU291bmRcIikpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9TY2VuZVwiKSk7XG4gICAgZXhwb3NlKHJlcXVpcmUoXCIuL1NldHRpbmdcIikpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9VSVwiKSk7XG4gICAgdl9wR2xvYmFsLmF0c2ZyYW1ld29yayA9IGF0c2ZyYW1ld29yaztcbiAgICBleHBvcnRzLmRlZmF1bHQgPSBhdHNmcmFtZXdvcms7XG59KTtcbiJdfQ==
