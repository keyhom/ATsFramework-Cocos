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

},{"./Base":1,"./Fsm":5}],7:[function(require,module,exports){
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

},{"./Base":1}],10:[function(require,module,exports){
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
    expose(require("./Fsm"));
    expose(require("./Resource"));
    expose(require("./Event"));
    expose(require("./Procedure"));
    expose(require("./UI"));
    expose(require("./Scene"));
    v_pGlobal.atsframework = atsframework;
    exports.default = atsframework;
});

},{"./Base":1,"./Config":2,"./DataNode":3,"./Event":4,"./Fsm":5,"./Procedure":6,"./Resource":7,"./Scene":8,"./UI":9}]},{},[10])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIkJhc2UuanMiLCJDb25maWcuanMiLCJEYXRhTm9kZS5qcyIsIkV2ZW50LmpzIiwiRnNtLmpzIiwiUHJvY2VkdXJlLmpzIiwiUmVzb3VyY2UuanMiLCJTY2VuZS5qcyIsIlVJLmpzIiwiaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25TQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2NEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgLyoqXG4gICAgICogTG9hZCB0eXBlLlxuICAgICAqL1xuICAgIHZhciBMb2FkVHlwZTtcbiAgICAoZnVuY3Rpb24gKExvYWRUeXBlKSB7XG4gICAgICAgIExvYWRUeXBlW0xvYWRUeXBlW1wiVGV4dFwiXSA9IDBdID0gXCJUZXh0XCI7XG4gICAgICAgIExvYWRUeXBlW0xvYWRUeXBlW1wiQnl0ZXNcIl0gPSAxXSA9IFwiQnl0ZXNcIjtcbiAgICAgICAgTG9hZFR5cGVbTG9hZFR5cGVbXCJTdHJlYW1cIl0gPSAyXSA9IFwiU3RyZWFtXCI7XG4gICAgfSkoTG9hZFR5cGUgPSBleHBvcnRzLkxvYWRUeXBlIHx8IChleHBvcnRzLkxvYWRUeXBlID0ge30pKTtcbiAgICA7XG4gICAgdmFyIGdfcE1vZHVsZXMgPSBbXTtcbiAgICAvKipcbiAgICAgKiBBbiBldmVudCBoYW5kbGVyIG1ha2Ugc2ltaWxhciB3aXRoIGV2ZW50IGRlbGVnYXRlIG1vZGUuXG4gICAgICovXG4gICAgdmFyIEV2ZW50SGFuZGxlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gRXZlbnRIYW5kbGVyKCkge1xuICAgICAgICB9XG4gICAgICAgIEV2ZW50SGFuZGxlci5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gKGZuLCB0YXJnZXQpIHtcbiAgICAgICAgICAgIGlmIChudWxsICE9IHRoaXMubV9wSGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BIYW5kbGVycy5zb21lKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdl9iUmV0ID0gdmFsdWVbMV0gPT0gZm47XG4gICAgICAgICAgICAgICAgICAgIGlmICh2X2JSZXQgJiYgdW5kZWZpbmVkICE9IHRhcmdldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdl9iUmV0ID0gdmFsdWVbMF0gPT0gdGFyZ2V0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2X2JSZXQ7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIEV2ZW50SGFuZGxlci5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKGZuLCB0YXJnZXQpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMubV9wSGFuZGxlcnMpXG4gICAgICAgICAgICAgICAgdGhpcy5tX3BIYW5kbGVycyA9IFtdO1xuICAgICAgICAgICAgaWYgKHRoaXMuaGFzKGZuLCB0YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRHVwbGljYXRlZCBhZGQgZXZlbnQgaGFuZGxlciAnXCIgKyBmbiArIFwiJ1wiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcEhhbmRsZXJzLnB1c2goW3RhcmdldCwgZm4sIGZhbHNlXSk7XG4gICAgICAgIH07XG4gICAgICAgIEV2ZW50SGFuZGxlci5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKGZuLCB0YXJnZXQpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pc1ZhbGlkKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tX3BIYW5kbGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciB2X3BUdXBsZSA9IHRoaXMubV9wSGFuZGxlcnNbaV07XG4gICAgICAgICAgICAgICAgaWYgKHVuZGVmaW5lZCA9PSB0YXJnZXQgJiYgdl9wVHVwbGVbMV0gPT0gZm4pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BIYW5kbGVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh1bmRlZmluZWQgIT0gdGFyZ2V0ICYmIHZfcFR1cGxlWzBdID09IHRhcmdldCAmJiB2X3BUdXBsZVsxXSA9PSBmbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcEhhbmRsZXJzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBFdmVudEhhbmRsZXIucHJvdG90eXBlLml0ZXIgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pc1ZhbGlkKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMubV9wSGFuZGxlcnMuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2FsbGJhY2tGbiA9IHZhbHVlWzFdO1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZVswXSAhPSB1bmRlZmluZWQgJiYgY2FsbGJhY2tGbiBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4gPSBjYWxsYmFja0ZuLmJpbmQodmFsdWVbMF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmbihjYWxsYmFja0ZuKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBFdmVudEhhbmRsZXIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5pc1ZhbGlkICYmIHRoaXMubV9wSGFuZGxlcnMuc3BsaWNlKDAsIHRoaXMubV9wSGFuZGxlcnMubGVuZ3RoKTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEV2ZW50SGFuZGxlci5wcm90b3R5cGUsIFwiaXNWYWxpZFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BIYW5kbGVycyAmJiB0aGlzLm1fcEhhbmRsZXJzLmxlbmd0aCA+IDA7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEV2ZW50SGFuZGxlci5wcm90b3R5cGUsIFwic2l6ZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BIYW5kbGVycy5sZW5ndGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIEV2ZW50SGFuZGxlcjtcbiAgICB9KCkpOyAvLyBjbGFzcyBFdmVudEhhbmRsZXJcbiAgICBleHBvcnRzLkV2ZW50SGFuZGxlciA9IEV2ZW50SGFuZGxlcjtcbiAgICB2YXIgRnJhbWV3b3JrTW9kdWxlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBGcmFtZXdvcmtNb2R1bGUoKSB7XG4gICAgICAgICAgICB0aGlzLm1faVByaW9yaXR5ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBGcmFtZXdvcmtNb2R1bGUuZ2V0TW9kdWxlID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ19wTW9kdWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBtID0gZ19wTW9kdWxlc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAobSBpbnN0YW5jZW9mIHR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIEZyYW1ld29ya01vZHVsZS5nZXRPckFkZE1vZHVsZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICB2YXIgdl9wTW9kdWxlID0gdGhpcy5nZXRNb2R1bGUodHlwZSk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BNb2R1bGUpIHtcbiAgICAgICAgICAgICAgICB2X3BNb2R1bGUgPSBuZXcgdHlwZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkTW9kdWxlKHZfcE1vZHVsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdl9wTW9kdWxlO1xuICAgICAgICB9O1xuICAgICAgICBGcmFtZXdvcmtNb2R1bGUuYWRkTW9kdWxlID0gZnVuY3Rpb24gKG1vZHVsZSkge1xuICAgICAgICAgICAgdmFyIG0gPSB0aGlzLmdldE1vZHVsZShtb2R1bGUuY29uc3RydWN0b3IpO1xuICAgICAgICAgICAgaWYgKG0pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRHVwbGljYXRlZCBhZGRpbmcgZnJhbWV3b3JrIG1vZHVsZTogXCIgKyB0eXBlb2YgbW9kdWxlKTsgLy8gRklYTUU6IERldGVjdGluZyBob3cgdG8gZ2V0IHRoZSBjbGFzcyBuYW1lLlxuICAgICAgICAgICAgZ19wTW9kdWxlcy5wdXNoKG1vZHVsZSk7XG4gICAgICAgICAgICBnX3BNb2R1bGVzID0gZ19wTW9kdWxlcy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGEubV9pUHJpb3JpdHkgPiBiLm1faVByaW9yaXR5KVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoYS5tX2lQcmlvcml0eSA8IGIubV9pUHJpb3JpdHkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIEZyYW1ld29ya01vZHVsZS5yZW1vdmVNb2R1bGUgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnX3BNb2R1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZfcE1vZHVsZSA9IGdfcE1vZHVsZXNbaV07XG4gICAgICAgICAgICAgICAgaWYgKHZfcE1vZHVsZSAmJiB2X3BNb2R1bGUgaW5zdGFuY2VvZiB0eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGdfcE1vZHVsZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdl9wTW9kdWxlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBGcmFtZXdvcmtNb2R1bGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdfcE1vZHVsZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wTW9kdWxlID0gZ19wTW9kdWxlc1tpXTtcbiAgICAgICAgICAgICAgICB2X3BNb2R1bGUudXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRnJhbWV3b3JrTW9kdWxlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IGdfcE1vZHVsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wTW9kdWxlID0gZ19wTW9kdWxlc1tpXTtcbiAgICAgICAgICAgICAgICB2X3BNb2R1bGUuc2h1dGRvd24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZyYW1ld29ya01vZHVsZS5wcm90b3R5cGUsIFwicHJpb3JpdHlcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9pUHJpb3JpdHk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIEZyYW1ld29ya01vZHVsZTtcbiAgICB9KCkpOyAvLyBjbGFzcyBGcmFtZXdvcmtNb2R1bGVcbiAgICBleHBvcnRzLkZyYW1ld29ya01vZHVsZSA9IEZyYW1ld29ya01vZHVsZTtcbn0pO1xuIiwidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgdmFyIEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XG4gICAgdmFyIENvbmZpZ01hbmFnZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhDb25maWdNYW5hZ2VyLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBDb25maWdNYW5hZ2VyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcykgfHwgdGhpcztcbiAgICAgICAgICAgIF90aGlzLm1fcENvbmZpZ0RhdGEgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BMb2FkQXNzZXRDYWxsYmFja3MgPSB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogX3RoaXMubG9hZENvbmZpZ1N1Y2Nlc3NDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICBmYWlsdXJlOiBfdGhpcy5sb2FkQ29uZmlnRmFpbHVyZUNhbGxiYWNrLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIHVwZGF0ZTogX3RoaXMubG9hZENvbmZpZ1VwZGF0ZUNhbGxiYWNrLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIGRlcGVuZGVuY3k6IF90aGlzLmxvYWRDb25maWdEZXBlbmRlbmN5QXNzZXRDYWxsYmFjay5iaW5kKF90aGlzKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRDb25maWdTdWNjZXNzRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZENvbmZpZ0ZhaWx1cmVEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BMb2FkQ29uZmlnVXBkYXRlRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZENvbmZpZ0RlcGVuZGVuY3lBc3NldERlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ29uZmlnTWFuYWdlci5wcm90b3R5cGUsIFwicmVzb3VyY2VNYW5hZ2VyXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFJlc291cmNlTWFuYWdlcjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChudWxsID09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJlc291cmNlIG1hbmFnZXIgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyID0gdmFsdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbmZpZ01hbmFnZXIucHJvdG90eXBlLCBcImNvbmZpZ0hlbHBlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BDb25maWdIZWxwZXI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAobnVsbCA9PSB2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29uZmlnIGhlbHBlciBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcENvbmZpZ0hlbHBlciA9IHZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb25maWdNYW5hZ2VyLnByb3RvdHlwZSwgXCJjb25maWdDb3VudFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BDb25maWdEYXRhLnNpemU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbmZpZ01hbmFnZXIucHJvdG90eXBlLCBcImxvYWRDb25maWdTdWNjZXNzXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcExvYWRDb25maWdTdWNjZXNzRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbmZpZ01hbmFnZXIucHJvdG90eXBlLCBcImxvYWRDb25maWdGYWlsdXJlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcExvYWRDb25maWdGYWlsdXJlRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbmZpZ01hbmFnZXIucHJvdG90eXBlLCBcImxvYWRDb25maWdVcGRhdGVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wTG9hZENvbmZpZ1VwZGF0ZURlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb25maWdNYW5hZ2VyLnByb3RvdHlwZSwgXCJsb2FkQ29uZmlnRGVwZW5kZW5jeUFzc2V0XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcExvYWRDb25maWdEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBDb25maWdNYW5hZ2VyLnByb3RvdHlwZS5sb2FkQ29uZmlnID0gZnVuY3Rpb24gKGNvbmZpZ0Fzc2V0TmFtZSwgbG9hZFR5cGUsIGFueUFyZzEsIGFueUFyZzIpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IHJlc291cmNlIG1hbmFnZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BDb25maWdIZWxwZXIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgY29uZmlnIGhlbHBlciBmaXJzdC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcHJpb3JpdHkgPSAwO1xuICAgICAgICAgICAgdmFyIHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKHVuZGVmaW5lZCAhPT0gYW55QXJnMSkge1xuICAgICAgICAgICAgICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIGFueUFyZzEpXG4gICAgICAgICAgICAgICAgICAgIHByaW9yaXR5ID0gYW55QXJnMTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHVzZXJEYXRhID0gYW55QXJnMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh1bmRlZmluZWQgIT09IGFueUFyZzIgJiYgbnVsbCA9PSB1c2VyRGF0YSkge1xuICAgICAgICAgICAgICAgIHVzZXJEYXRhID0gYW55QXJnMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyLmxvYWRBc3NldChjb25maWdBc3NldE5hbWUsIHByaW9yaXR5LCB0aGlzLm1fcExvYWRBc3NldENhbGxiYWNrcywgeyBsb2FkVHlwZTogbG9hZFR5cGUsIHVzZXJEYXRhOiB1c2VyRGF0YSB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgLy8gTk9URTogQW55IGphdmFzY3JpcHQvdHlwZXNjcmlwdCBzdHJlYW0gaW1wbGVtZW50YXRpb24/XG4gICAgICAgIENvbmZpZ01hbmFnZXIucHJvdG90eXBlLnBhcnNlQ29uZmlnID0gZnVuY3Rpb24gKHRleHRPckJ1ZmZlciwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGlmICghdGV4dE9yQnVmZmVyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBjb25maWcgZGF0YSBkZXRlY3RlZCFcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLm1fcENvbmZpZ0hlbHBlcikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IHNldCBjb25maWcgaGVscGVyIGZpcnN0LlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVzZXJEYXRhID0gdXNlckRhdGEgfHwgbnVsbDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wQ29uZmlnSGVscGVyLnBhcnNlQ29uZmlnKHRleHRPckJ1ZmZlciwgdXNlckRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBDb25maWdNYW5hZ2VyLnByb3RvdHlwZS5oYXNDb25maWcgPSBmdW5jdGlvbiAoY29uZmlnTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q29uZmlnKGNvbmZpZ05hbWUpO1xuICAgICAgICB9O1xuICAgICAgICBDb25maWdNYW5hZ2VyLnByb3RvdHlwZS5hZGRDb25maWcgPSBmdW5jdGlvbiAoY29uZmlnTmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc0NvbmZpZyhjb25maWdOYW1lKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wQ29uZmlnRGF0YS5zZXQoY29uZmlnTmFtZSwgdmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG4gICAgICAgIENvbmZpZ01hbmFnZXIucHJvdG90eXBlLnJlbW92ZUNvbmZpZyA9IGZ1bmN0aW9uIChjb25maWdOYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BDb25maWdEYXRhLmRlbGV0ZShjb25maWdOYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5wcm90b3R5cGUucmVtb3ZlQWxsQ29uZmlncyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMubV9wQ29uZmlnRGF0YS5jbGVhcigpO1xuICAgICAgICB9O1xuICAgICAgICBDb25maWdNYW5hZ2VyLnByb3RvdHlwZS5nZXRDb25maWcgPSBmdW5jdGlvbiAoY29uZmlnTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wQ29uZmlnRGF0YS5nZXQoY29uZmlnTmFtZSk7XG4gICAgICAgIH07XG4gICAgICAgIENvbmZpZ01hbmFnZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgLy8gTk9PUC5cbiAgICAgICAgfTtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5wcm90b3R5cGUuc2h1dGRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBOT09QLlxuICAgICAgICB9O1xuICAgICAgICBDb25maWdNYW5hZ2VyLnByb3RvdHlwZS5sb2FkQ29uZmlnU3VjY2Vzc0NhbGxiYWNrID0gZnVuY3Rpb24gKGNvbmZpZ0Fzc2V0TmFtZSwgY29uZmlnQXNzZXQsIGR1cmF0aW9uLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcEluZm8pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2FkIGNvbmZpZyBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubV9wQ29uZmlnSGVscGVyLmxvYWRDb25maWcoY29uZmlnQXNzZXQsIHZfcEluZm8ubG9hZFR5cGUsIHZfcEluZm8udXNlckRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgY29uZmlnIGZhaWx1cmUgaW4gaGVscGVyLCBhc3NldCBuYW1lICdcIiArIGNvbmZpZ0Fzc2V0TmFtZSArIFwiJ1wiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubV9wTG9hZENvbmZpZ1N1Y2Nlc3NEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZENvbmZpZ1N1Y2Nlc3NEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGNvbmZpZ0Fzc2V0TmFtZSwgdl9wSW5mby5sb2FkVHlwZSwgZHVyYXRpb24sIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWRDb25maWdGYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRDb25maWdGYWlsdXJlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihjb25maWdBc3NldE5hbWUsIHZfcEluZm8ubG9hZFR5cGUsIGUudG9TdHJpbmcoKSwgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcENvbmZpZ0hlbHBlci5yZWxlYXNlQ29uZmlnQXNzZXQoY29uZmlnQXNzZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBDb25maWdNYW5hZ2VyLnByb3RvdHlwZS5sb2FkQ29uZmlnRmFpbHVyZUNhbGxiYWNrID0gZnVuY3Rpb24gKGNvbmZpZ0Fzc2V0TmFtZSwgc3RhdHVzLCBlcnJvck1lc3NhZ2UsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wSW5mbykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgY29uZmlnIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYXBwZW5kRXJyb3JNZXNzYWdlID0gXCJMb2FkIGNvbmZpZyBmYWlsdXJlLCBhc3NldCBuYW1lICdcIiArIGNvbmZpZ0Fzc2V0TmFtZSArIFwiJywgc3RhdHVzICdcIiArIHN0YXR1cyArIFwiJywgZXJyb3IgbWVzc2FnZSAnXCIgKyBlcnJvck1lc3NhZ2UgKyBcIicuXCI7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkQ29uZmlnRmFpbHVyZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRDb25maWdGYWlsdXJlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGNvbmZpZ0Fzc2V0TmFtZSwgdl9wSW5mby5sb2FkVHlwZSwgYXBwZW5kRXJyb3JNZXNzYWdlLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYXBwZW5kRXJyb3JNZXNzYWdlKTtcbiAgICAgICAgfTtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5wcm90b3R5cGUubG9hZENvbmZpZ1VwZGF0ZUNhbGxiYWNrID0gZnVuY3Rpb24gKGNvbmZpZ0Fzc2V0TmFtZSwgcHJvZ3Jlc3MsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wSW5mbykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgY29uZmlnIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkQ29uZmlnVXBkYXRlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZENvbmZpZ1VwZGF0ZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihjb25maWdBc3NldE5hbWUsIHZfcEluZm8ubG9hZFR5cGUsIHByb2dyZXNzLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5wcm90b3R5cGUubG9hZENvbmZpZ0RlcGVuZGVuY3lBc3NldENhbGxiYWNrID0gZnVuY3Rpb24gKGNvbmZpZ0Fzc2V0TmFtZSwgZGVwZW5kZW5jeUFzc2V0TmFtZSwgbG9hZGVkQ291bnQsIHRvdGFsQ291bnQsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wSW5mbykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgY29uZmlnIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkQ29uZmlnRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZENvbmZpZ0RlcGVuZGVuY3lBc3NldERlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihjb25maWdBc3NldE5hbWUsIGRlcGVuZGVuY3lBc3NldE5hbWUsIGxvYWRlZENvdW50LCB0b3RhbENvdW50LCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIENvbmZpZ01hbmFnZXI7XG4gICAgfShCYXNlXzEuRnJhbWV3b3JrTW9kdWxlKSk7IC8vIGNsYXNzIENvbmZpZ01hbmFnZXJcbiAgICBleHBvcnRzLkNvbmZpZ01hbmFnZXIgPSBDb25maWdNYW5hZ2VyO1xufSk7XG4iLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICB2YXIgRGF0YU5vZGVNYW5hZ2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICBfX2V4dGVuZHMoRGF0YU5vZGVNYW5hZ2VyLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBEYXRhTm9kZU1hbmFnZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgRGF0YU5vZGVNYW5hZ2VyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBub3QgaW1wbGVtZW50ZWQuXCIpO1xuICAgICAgICB9O1xuICAgICAgICBEYXRhTm9kZU1hbmFnZXIucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBEYXRhTm9kZU1hbmFnZXI7XG4gICAgfShCYXNlXzEuRnJhbWV3b3JrTW9kdWxlKSk7IC8vIGNsYXNzIERhdGFOb2RlTWFuYWdlclxuICAgIGV4cG9ydHMuRGF0YU5vZGVNYW5hZ2VyID0gRGF0YU5vZGVNYW5hZ2VyO1xufSk7XG4iLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICAvKipcbiAgICAgKiBBIHNpbXBsZSBldmVudCBtYW5hZ2VyIGltcGxlbWVudGF0aW9uLlxuICAgICAqXG4gICAgICogQGF1dGhvciBKZXJlbXkgQ2hlbiAoa2V5aG9tLmNAZ21haWwuY29tKVxuICAgICAqL1xuICAgIHZhciBFdmVudE1hbmFnZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhFdmVudE1hbmFnZXIsIF9zdXBlcik7XG4gICAgICAgIGZ1bmN0aW9uIEV2ZW50TWFuYWdlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICAgICAgX3RoaXMubV9wRXZlbnRIYW5kbGVycyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRXZlbnRNYW5hZ2VyLnByb3RvdHlwZSwgXCJwcmlvcml0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTAwO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFdmVudE1hbmFnZXIucHJvdG90eXBlLCBcImV2ZW50Q291bnRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgRXZlbnRNYW5hZ2VyLnByb3RvdHlwZS5jb3VudCA9IGZ1bmN0aW9uIChldmVudElkKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElkKSkge1xuICAgICAgICAgICAgICAgIHZhciB2X3BFdmVudEhhbmRsZXIgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgaWYgKCh2X3BFdmVudEhhbmRsZXIgPSB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50SWQpKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdl9wRXZlbnRIYW5kbGVyLnNpemU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH07XG4gICAgICAgIEV2ZW50TWFuYWdlci5wcm90b3R5cGUuY2hlY2sgPSBmdW5jdGlvbiAoZXZlbnRJZCwgaGFuZGxlciwgdGFyZ2V0KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElkKSkge1xuICAgICAgICAgICAgICAgIHZhciB2X3BFdmVudEhhbmRsZXIgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgaWYgKGhhbmRsZXIgJiYgKHZfcEV2ZW50SGFuZGxlciA9IHRoaXMubV9wRXZlbnRIYW5kbGVycy5nZXQoZXZlbnRJZCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2X3BFdmVudEhhbmRsZXIuaGFzKGhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgRXZlbnRNYW5hZ2VyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIChldmVudElkLCBoYW5kbGVyLCB0YXJnZXQpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElkKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycy5zZXQoZXZlbnRJZCwgbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdl9wRXZlbnRIYW5kbGVyO1xuICAgICAgICAgICAgaWYgKCh2X3BFdmVudEhhbmRsZXIgPSB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50SWQpKSkge1xuICAgICAgICAgICAgICAgIHZfcEV2ZW50SGFuZGxlci5hZGQoaGFuZGxlciwgdGFyZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRXZlbnRNYW5hZ2VyLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAoZXZlbnRJZCwgaGFuZGxlciwgdGFyZ2V0KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElkKSkge1xuICAgICAgICAgICAgICAgIHZhciB2X3BFdmVudEhhbmRsZXIgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgaWYgKCh2X3BFdmVudEhhbmRsZXIgPSB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50SWQpKSkge1xuICAgICAgICAgICAgICAgICAgICB2X3BFdmVudEhhbmRsZXIucmVtb3ZlKGhhbmRsZXIsIHRhcmdldCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBFdmVudE1hbmFnZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiAoZXZlbnRJZCkge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMTsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgYXJnc1tfaSAtIDFdID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm1fcEV2ZW50SGFuZGxlcnMuaGFzKGV2ZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZfcEV2ZW50SGFuZGxlciA9IHRoaXMubV9wRXZlbnRIYW5kbGVycy5nZXQoZXZlbnRJZCk7XG4gICAgICAgICAgICAgICAgaWYgKHZfcEV2ZW50SGFuZGxlcikge1xuICAgICAgICAgICAgICAgICAgICB2X3BFdmVudEhhbmRsZXIuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBFdmVudE1hbmFnZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgLy8gTk9PUC5cbiAgICAgICAgfTtcbiAgICAgICAgRXZlbnRNYW5hZ2VyLnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcEV2ZW50SGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZm9yRWFjaChmdW5jdGlvbiAoZWgsIGtleSkge1xuICAgICAgICAgICAgICAgICAgICBlaC5jbGVhcigpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycy5jbGVhcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gRXZlbnRNYW5hZ2VyO1xuICAgIH0oQmFzZV8xLkZyYW1ld29ya01vZHVsZSkpOyAvLyBjbGFzcyBFdmVudE1hbmFnZXJcbiAgICBleHBvcnRzLkV2ZW50TWFuYWdlciA9IEV2ZW50TWFuYWdlcjtcbn0pO1xuIiwidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG52YXIgX192YWx1ZXMgPSAodGhpcyAmJiB0aGlzLl9fdmFsdWVzKSB8fCBmdW5jdGlvbihvKSB7XG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcbiAgICBpZiAobyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHJldHVybiB7XG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IocyA/IFwiT2JqZWN0IGlzIG5vdCBpdGVyYWJsZS5cIiA6IFwiU3ltYm9sLml0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcbn07XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgdmFyIEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XG4gICAgdmFyIEZzbVN0YXRlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBGc21TdGF0ZSgpIHtcbiAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycyA9IG5ldyBNYXAoKTtcbiAgICAgICAgfVxuICAgICAgICBGc21TdGF0ZS5wcm90b3R5cGUub25Jbml0ID0gZnVuY3Rpb24gKGZzbSkge1xuICAgICAgICAgICAgLy8gTk9PUFxuICAgICAgICB9O1xuICAgICAgICBGc21TdGF0ZS5wcm90b3R5cGUub25FbnRlciA9IGZ1bmN0aW9uIChmc20pIHtcbiAgICAgICAgICAgIC8vIE5PT1BcbiAgICAgICAgfTtcbiAgICAgICAgRnNtU3RhdGUucHJvdG90eXBlLm9uVXBkYXRlID0gZnVuY3Rpb24gKGZzbSwgZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIC8vIE5PT1BcbiAgICAgICAgfTtcbiAgICAgICAgRnNtU3RhdGUucHJvdG90eXBlLm9uTGVhdmUgPSBmdW5jdGlvbiAoZnNtLCBzaHV0ZG93bikge1xuICAgICAgICAgICAgLy8gTk9PUFxuICAgICAgICB9O1xuICAgICAgICBGc21TdGF0ZS5wcm90b3R5cGUub25EZXN0cm95ID0gZnVuY3Rpb24gKGZzbSkge1xuICAgICAgICAgICAgdGhpcy5tX3BFdmVudEhhbmRsZXJzLmNsZWFyKCk7XG4gICAgICAgIH07XG4gICAgICAgIEZzbVN0YXRlLnByb3RvdHlwZS5jaGFuZ2VTdGF0ZSA9IGZ1bmN0aW9uIChmc20sIHR5cGUpIHtcbiAgICAgICAgICAgIGlmICghZnNtKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRnNtIGlzIGludmFsaWQ6IFwiICsgZnNtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZzbS5jaGFuZ2VTdGF0ZSh0eXBlKTtcbiAgICAgICAgfTtcbiAgICAgICAgRnNtU3RhdGUucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50SWQsIGV2ZW50SGFuZGxlcikge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gZXZlbnRIYW5kbGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkV2ZW50IGhhbmRsZXIgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAoIXRoaXMubV9wRXZlbnRIYW5kbGVycy5oYXMoZXZlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZWggPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycy5zZXQoZXZlbnRJZCwgZWgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZfcEhhbmRsZXJzID0gdGhpcy5tX3BFdmVudEhhbmRsZXJzLmdldChldmVudElkKTtcbiAgICAgICAgICAgIGlmICh2X3BIYW5kbGVycykge1xuICAgICAgICAgICAgICAgIHZfcEhhbmRsZXJzLmFkZChldmVudEhhbmRsZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBGc21TdGF0ZS5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gKGV2ZW50SWQsIGV2ZW50SGFuZGxlcikge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gZXZlbnRIYW5kbGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkV2ZW50IGhhbmRsZXIgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElkKSkge1xuICAgICAgICAgICAgICAgIHZhciB2X3BIYW5kbGVycyA9IHRoaXMubV9wRXZlbnRIYW5kbGVycy5nZXQoZXZlbnRJZCk7XG4gICAgICAgICAgICAgICAgaWYgKHZfcEhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZfcEhhbmRsZXJzLnJlbW92ZShldmVudEhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRnNtU3RhdGUucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiAoZnNtLCBzZW5kZXIsIGV2ZW50SWQsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElkKSkge1xuICAgICAgICAgICAgICAgIHZhciB2X3BIYW5kbGVycyA9IHRoaXMubV9wRXZlbnRIYW5kbGVycy5nZXQoZXZlbnRJZCk7XG4gICAgICAgICAgICAgICAgaWYgKHZfcEhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZfcEhhbmRsZXJzLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oZnNtLCBzZW5kZXIsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gRnNtU3RhdGU7XG4gICAgfSgpKTsgLy8gY2xhc3MgRnNtU3RhdGU8VD5cbiAgICBleHBvcnRzLkZzbVN0YXRlID0gRnNtU3RhdGU7XG4gICAgdmFyIEZzbSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gRnNtKCkge1xuICAgICAgICAgICAgdGhpcy5tX3BTdGF0ZXMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMubV9wRGF0YXMgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICB0aGlzLl9pc0Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGVUaW1lID0gMDtcbiAgICAgICAgfVxuICAgICAgICBGc20uY3JlYXRlRnNtID0gZnVuY3Rpb24gKG5hbWUsIG93bmVyLCBzdGF0ZXMpIHtcbiAgICAgICAgICAgIHZhciBlXzEsIF9hO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gb3duZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGU00gb3duZXIgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHN0YXRlcyB8fCBzdGF0ZXMubGVuZ3RoIDwgMSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZTTSBzdGF0ZXMgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHZhciB2X3BGc20gPSBuZXcgRnNtKCk7XG4gICAgICAgICAgICB2X3BGc20ubV9zTmFtZSA9IG5hbWU7XG4gICAgICAgICAgICB2X3BGc20ubV9wT3duZXIgPSBvd25lcjtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgc3RhdGVzXzEgPSBfX3ZhbHVlcyhzdGF0ZXMpLCBzdGF0ZXNfMV8xID0gc3RhdGVzXzEubmV4dCgpOyAhc3RhdGVzXzFfMS5kb25lOyBzdGF0ZXNfMV8xID0gc3RhdGVzXzEubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2X3BTdGF0ZSA9IHN0YXRlc18xXzEudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChudWxsID09IHZfcFN0YXRlKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGU00gc3RhdGVzIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2X3BGc20uaGFzU3RhdGUodl9wU3RhdGUuY29uc3RydWN0b3IpKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRlNNICdcIiArIG5hbWUgKyBcIicgc3RhdGUgJ1wiICsgdl9wU3RhdGUgKyBcIicgaXMgYWxyZWFkeSBleGlzdC5cIik7XG4gICAgICAgICAgICAgICAgICAgIHZfcEZzbS5tX3BTdGF0ZXMucHVzaCh2X3BTdGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgIHZfcFN0YXRlLm9uSW5pdCh2X3BGc20pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzFfMSkgeyBlXzEgPSB7IGVycm9yOiBlXzFfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdGVzXzFfMSAmJiAhc3RhdGVzXzFfMS5kb25lICYmIChfYSA9IHN0YXRlc18xLnJldHVybikpIF9hLmNhbGwoc3RhdGVzXzEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2X3BGc20uX2lzRGVzdHJveWVkID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gdl9wRnNtO1xuICAgICAgICB9O1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRnNtLnByb3RvdHlwZSwgXCJuYW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fc05hbWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZzbS5wcm90b3R5cGUsIFwib3duZXJcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcE93bmVyOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZzbS5wcm90b3R5cGUsIFwiZnNtU3RhdGVDb3VudFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU3RhdGVzLmxlbmd0aDsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGc20ucHJvdG90eXBlLCBcImlzUnVubmluZ1wiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIG51bGwgIT0gdGhpcy5fY3VycmVudFN0YXRlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZzbS5wcm90b3R5cGUsIFwiaXNEZXN0cm95ZWRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLl9pc0Rlc3Ryb3llZDsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGc20ucHJvdG90eXBlLCBcImN1cnJlbnRTdGF0ZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuX2N1cnJlbnRTdGF0ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGc20ucHJvdG90eXBlLCBcImN1cnJlbnRTdGF0ZU5hbWVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgLy8gRklYTUU6IEN1cnJlbnQgc3RhdGUgbmFtZSA/XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFN0YXRlLm5hbWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZzbS5wcm90b3R5cGUsIFwiY3VycmVudFN0YXRlVGltZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuX2N1cnJlbnRTdGF0ZVRpbWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBGc20ucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzUnVubmluZykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZTTSBpcyBydW5uaW5nLCBjYW4gbm90IHN0YXJ0IGFnYWluLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuZ2V0U3RhdGUodHlwZSk7XG4gICAgICAgICAgICBpZiAoIXN0YXRlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRlNNICdcIiArIHRoaXMubmFtZSArIFwiJyBjYW4gbm90IHN0YXJ0IHN0YXRlICdcIiArIHR5cGUubmFtZSArIFwiJyB3aGljaCBpcyBub3QgZXhpc3RzLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZVRpbWUgPSAwO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlID0gc3RhdGU7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGF0ZS5vbkVudGVyKHRoaXMpOyAvLyBDYWxsIGludGVybmFsIGZ1bmN0aW9uIHdpdGggYW55IGNhc3RpbmcuXG4gICAgICAgIH07XG4gICAgICAgIEZzbS5wcm90b3R5cGUuaGFzU3RhdGUgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGwgIT0gdGhpcy5nZXRTdGF0ZSh0eXBlKTtcbiAgICAgICAgfTtcbiAgICAgICAgRnNtLnByb3RvdHlwZS5nZXRTdGF0ZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubV9wU3RhdGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZfcFN0YXRlID0gdGhpcy5tX3BTdGF0ZXNbaV07XG4gICAgICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wU3RhdGUpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGlmICh2X3BTdGF0ZSBpbnN0YW5jZW9mIHR5cGUpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2X3BTdGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBGc20ucHJvdG90eXBlLmdldEFsbFN0YXRlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFN0YXRlcztcbiAgICAgICAgfTtcbiAgICAgICAgRnNtLnByb3RvdHlwZS5jaGFuZ2VTdGF0ZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2N1cnJlbnRTdGF0ZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0N1cnJlbnQgc3RhdGUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHZhciB2X3BTdGF0ZSA9IHRoaXMuZ2V0U3RhdGUodHlwZSk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BTdGF0ZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGc20gY2FuIG5vdCBjaGFuZ2Ugc3RhdGUsIHN0YXRlIGlzIG5vdCBleGlzdDogXCIgKyB0eXBlKTtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZS5vbkxlYXZlKHRoaXMsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZVRpbWUgPSAwO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlID0gdl9wU3RhdGU7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGUub25FbnRlcih0aGlzKTtcbiAgICAgICAgfTtcbiAgICAgICAgRnNtLnByb3RvdHlwZS5nZXREYXRhID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcERhdGFzLmhhcyhuYW1lKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BEYXRhcy5nZXQobmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgRnNtLnByb3RvdHlwZS5zZXREYXRhID0gZnVuY3Rpb24gKG5hbWUsIGRhdGEpIHtcbiAgICAgICAgICAgIGlmICghbmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RhdGEgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdGhpcy5tX3BEYXRhcy5zZXQobmFtZSwgZGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIEZzbS5wcm90b3R5cGUucmVtb3ZlRGF0YSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICBpZiAoIW5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXRhIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHZhciB2X2JSZXQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcERhdGFzLmhhcyhuYW1lKSkge1xuICAgICAgICAgICAgICAgIHZfYlJldCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BEYXRhcy5kZWxldGUobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdl9iUmV0O1xuICAgICAgICB9O1xuICAgICAgICBGc20ucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5fY3VycmVudFN0YXRlKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZVRpbWUgKz0gZWxhcHNlZDtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZS5vblVwZGF0ZSh0aGlzLCBlbGFwc2VkLCByZWFsRWxhcHNlZCk7XG4gICAgICAgIH07XG4gICAgICAgIEZzbS5wcm90b3R5cGUuc2h1dGRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBGSVhNRTogRmlndWUgb3V0IGEgd2F5IHRvIHJlbGVhc2UgdGhpcy5cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIEZzbTtcbiAgICB9KCkpOyAvLyBjbGFzcyBGc208VD5cbiAgICBleHBvcnRzLkZzbSA9IEZzbTtcbiAgICB2YXIgRnNtTWFuYWdlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgX19leHRlbmRzKEZzbU1hbmFnZXIsIF9zdXBlcik7XG4gICAgICAgIGZ1bmN0aW9uIEZzbU1hbmFnZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgICAgICAgICAgIF90aGlzLm1fcEZzbXMgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZzbU1hbmFnZXIucHJvdG90eXBlLCBcInByaW9yaXR5XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiA2MDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRnNtTWFuYWdlci5wcm90b3R5cGUsIFwiY291bnRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wRnNtcy5zaXplO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIEZzbU1hbmFnZXIucHJvdG90eXBlLmhhc0ZzbSA9IGZ1bmN0aW9uIChuYW1lT3JUeXBlKSB7XG4gICAgICAgICAgICB2YXIgZV8yLCBfYTtcbiAgICAgICAgICAgIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgbmFtZU9yVHlwZSAmJiBuYW1lT3JUeXBlLnByb3RvdHlwZSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BGc21zLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZzbSA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG51bGwgIT0gZnNtICYmIGZzbSBpbnN0YW5jZW9mIG5hbWVPclR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV8yXzEpIHsgZV8yID0geyBlcnJvcjogZV8yXzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8yKSB0aHJvdyBlXzIuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEZzbXMuaGFzKG5hbWVPclR5cGUudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIEZzbU1hbmFnZXIucHJvdG90eXBlLmdldEZzbSA9IGZ1bmN0aW9uIChuYW1lT3JUeXBlKSB7XG4gICAgICAgICAgICB2YXIgZV8zLCBfYTtcbiAgICAgICAgICAgIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgbmFtZU9yVHlwZSAmJiBuYW1lT3JUeXBlLnByb3RvdHlwZSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BGc21zLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZzbSA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG51bGwgIT0gZnNtICYmIGZzbSBpbnN0YW5jZW9mIG5hbWVPclR5cGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZzbTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV8zXzEpIHsgZV8zID0geyBlcnJvcjogZV8zXzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8zKSB0aHJvdyBlXzMuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BGc21zLmdldChuYW1lT3JUeXBlLnRvU3RyaW5nKCkpIHx8IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgRnNtTWFuYWdlci5wcm90b3R5cGUuZ2V0QWxsRnNtcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBlXzQsIF9hO1xuICAgICAgICAgICAgdmFyIHZfcFJldCA9IFtdO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRnNtcy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZzbSA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB2X3BSZXQucHVzaChmc20pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzRfMSkgeyBlXzQgPSB7IGVycm9yOiBlXzRfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV80KSB0aHJvdyBlXzQuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2X3BSZXQ7XG4gICAgICAgIH07XG4gICAgICAgIEZzbU1hbmFnZXIucHJvdG90eXBlLmNyZWF0ZUZzbSA9IGZ1bmN0aW9uIChuYW1lLCBvd25lciwgc3RhdGVzKSB7XG4gICAgICAgICAgICBuYW1lID0gbmFtZSB8fCAnJztcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc0ZzbShuYW1lKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFscmVhZHkgZXhpc3QgRlNNICdcIiArIG5hbWUgKyBcIicuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGZzbSA9IEZzbS5jcmVhdGVGc20obmFtZSwgb3duZXIsIHN0YXRlcyk7XG4gICAgICAgICAgICB0aGlzLm1fcEZzbXMuc2V0KG5hbWUsIGZzbSk7XG4gICAgICAgICAgICByZXR1cm4gZnNtO1xuICAgICAgICB9O1xuICAgICAgICBGc21NYW5hZ2VyLnByb3RvdHlwZS5kZXN0cm95RnNtID0gZnVuY3Rpb24gKGFyZykge1xuICAgICAgICAgICAgdmFyIGVfNSwgX2EsIGVfNiwgX2IsIGVfNywgX2M7XG4gICAgICAgICAgICB2YXIgdl9zTmFtZTtcbiAgICAgICAgICAgIHZhciB2X3BUeXBlO1xuICAgICAgICAgICAgdmFyIHZfcEluc3RhbmNlO1xuICAgICAgICAgICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgYXJnKSB7XG4gICAgICAgICAgICAgICAgdl9zTmFtZSA9IGFyZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBhcmcpIHtcbiAgICAgICAgICAgICAgICB2X3BUeXBlID0gYXJnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoJ29iamVjdCcgPT09IHR5cGVvZiBhcmcgJiYgYXJnLmNvbnN0cnVjdG9yKSB7XG4gICAgICAgICAgICAgICAgdl9wSW5zdGFuY2UgPSBhcmc7XG4gICAgICAgICAgICAgICAgdl9wVHlwZSA9IGFyZy5jb25zdHJ1Y3RvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdGhpcy5oYXNGc20odl9zTmFtZSB8fCB2X3BUeXBlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh2X3BJbnN0YW5jZSAmJiBPYmplY3QuZ2V0UHJvdG90eXBlT2Yodl9wSW5zdGFuY2UpLmhhc093blByb3BlcnR5KCdzaHV0ZG93bicpKSB7XG4gICAgICAgICAgICAgICAgdl9wSW5zdGFuY2Uuc2h1dGRvd24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChudWxsICE9IHZfcEluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2QgPSBfX3ZhbHVlcyh0aGlzLm1fcEZzbXMua2V5cygpKSwgX2UgPSBfZC5uZXh0KCk7ICFfZS5kb25lOyBfZSA9IF9kLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IF9lLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZfcEZzbSA9IHRoaXMubV9wRnNtcy5nZXQoa2V5KSB8fCBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEZzbSA9PSB2X3BJbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubV9wRnNtcy5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV81XzEpIHsgZV81ID0geyBlcnJvcjogZV81XzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9lICYmICFfZS5kb25lICYmIChfYSA9IF9kLnJldHVybikpIF9hLmNhbGwoX2QpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV81KSB0aHJvdyBlXzUuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChudWxsICE9IHZfc05hbWUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfZiA9IF9fdmFsdWVzKHRoaXMubV9wRnNtcy5rZXlzKCkpLCBfZyA9IF9mLm5leHQoKTsgIV9nLmRvbmU7IF9nID0gX2YubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gX2cudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdl9wRnNtID0gdGhpcy5tX3BGc21zLmdldChrZXkpIHx8IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXZfcEZzbSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2X3BGc20ubmFtZSA9PSB2X3NOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BGc21zLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzZfMSkgeyBlXzYgPSB7IGVycm9yOiBlXzZfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2cgJiYgIV9nLmRvbmUgJiYgKF9iID0gX2YucmV0dXJuKSkgX2IuY2FsbChfZik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzYpIHRocm93IGVfNi5lcnJvcjsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG51bGwgIT0gdl9wVHlwZSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9oID0gX192YWx1ZXModGhpcy5tX3BGc21zLmtleXMoKSksIF9qID0gX2gubmV4dCgpOyAhX2ouZG9uZTsgX2ogPSBfaC5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBfai52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2X3BGc20gPSB0aGlzLm1fcEZzbXMuZ2V0KGtleSkgfHwgbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2X3BGc20gaW5zdGFuY2VvZiB2X3BUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BGc21zLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzdfMSkgeyBlXzcgPSB7IGVycm9yOiBlXzdfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2ogJiYgIV9qLmRvbmUgJiYgKF9jID0gX2gucmV0dXJuKSkgX2MuY2FsbChfaCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzcpIHRocm93IGVfNy5lcnJvcjsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuICAgICAgICBGc21NYW5hZ2VyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIHZhciBlXzgsIF9hO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRnNtcy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmc20gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFmc20gfHwgZnNtLmlzRGVzdHJveWVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIGZzbS51cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzhfMSkgeyBlXzggPSB7IGVycm9yOiBlXzhfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV84KSB0aHJvdyBlXzguZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRnNtTWFuYWdlci5wcm90b3R5cGUuc2h1dGRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZV85LCBfYTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcEZzbXMua2V5cygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2X0ZzbSA9IHRoaXMubV9wRnNtcy5nZXQoa2V5KSB8fCBudWxsO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXZfRnNtIHx8IHZfRnNtLmlzRGVzdHJveWVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIHZfRnNtLnNodXRkb3duKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wRnNtcy5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV85XzEpIHsgZV85ID0geyBlcnJvcjogZV85XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfOSkgdGhyb3cgZV85LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBGc21NYW5hZ2VyO1xuICAgIH0oQmFzZV8xLkZyYW1ld29ya01vZHVsZSkpOyAvLyBjbGFzcyBGc21NYW5hZ2VyXG4gICAgZXhwb3J0cy5Gc21NYW5hZ2VyID0gRnNtTWFuYWdlcjtcbn0pO1xuIiwidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiLCBcIi4vRnNtXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICB2YXIgRnNtXzEgPSByZXF1aXJlKFwiLi9Gc21cIik7XG4gICAgdmFyIFByb2NlZHVyZUJhc2UgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhQcm9jZWR1cmVCYXNlLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBQcm9jZWR1cmVCYXNlKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBQcm9jZWR1cmVCYXNlO1xuICAgIH0oRnNtXzEuRnNtU3RhdGUpKTsgLy8gY2xhc3MgUHJvY2VkdXJlQmFzZVxuICAgIGV4cG9ydHMuUHJvY2VkdXJlQmFzZSA9IFByb2NlZHVyZUJhc2U7XG4gICAgdmFyIFByb2NlZHVyZU1hbmFnZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhQcm9jZWR1cmVNYW5hZ2VyLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBQcm9jZWR1cmVNYW5hZ2VyKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShQcm9jZWR1cmVNYW5hZ2VyLnByb3RvdHlwZSwgXCJwcmlvcml0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIC0xMDsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShQcm9jZWR1cmVNYW5hZ2VyLnByb3RvdHlwZSwgXCJjdXJyZW50UHJvY2VkdXJlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFByb2NlZHVyZUZzbS5jdXJyZW50U3RhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgUHJvY2VkdXJlTWFuYWdlci5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIChmc21NYW5hZ2VyLCBwcm9jZWR1cmVzKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSBmc21NYW5hZ2VyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRlNNIG1hbmFnZXIgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHRoaXMubV9wRnNtTWFuYWdlciA9IGZzbU1hbmFnZXI7XG4gICAgICAgICAgICB0aGlzLm1fcFByb2NlZHVyZUZzbSA9IGZzbU1hbmFnZXIuY3JlYXRlRnNtKCcnLCB0aGlzLCBwcm9jZWR1cmVzKTtcbiAgICAgICAgfTtcbiAgICAgICAgUHJvY2VkdXJlTWFuYWdlci5wcm90b3R5cGUuc3RhcnRQcm9jZWR1cmUgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLm1fcFByb2NlZHVyZUZzbSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBtdXN0IGluaXRpYWxpemUgcHJvY2VkdXJlIGZpcnN0LicpO1xuICAgICAgICAgICAgdGhpcy5tX3BQcm9jZWR1cmVGc20uc3RhcnQob2JqLmNvbnN0cnVjdG9yKTtcbiAgICAgICAgfTtcbiAgICAgICAgUHJvY2VkdXJlTWFuYWdlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICAvLyBOb29wLlxuICAgICAgICB9O1xuICAgICAgICBQcm9jZWR1cmVNYW5hZ2VyLnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChudWxsICE9IHRoaXMubV9wRnNtTWFuYWdlcikge1xuICAgICAgICAgICAgICAgIGlmIChudWxsICE9IHRoaXMubV9wUHJvY2VkdXJlRnNtKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wRnNtTWFuYWdlci5kZXN0cm95RnNtKHRoaXMubV9wUHJvY2VkdXJlRnNtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFByb2NlZHVyZU1hbmFnZXIucHJvdG90eXBlLmhhc1Byb2NlZHVyZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLm1fcFByb2NlZHVyZUZzbSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBtdXN0IGluaXRpYWxpemUgcHJvY2VkdXJlIGZpcnN0LicpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUHJvY2VkdXJlRnNtLmhhc1N0YXRlKHR5cGUpO1xuICAgICAgICB9O1xuICAgICAgICBQcm9jZWR1cmVNYW5hZ2VyLnByb3RvdHlwZS5nZXRQcm9jZWR1cmUgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BQcm9jZWR1cmVGc20pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgbXVzdCBpbml0aWFsaXplIHByb2NlZHVyZSBmaXJzdC4nKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFByb2NlZHVyZUZzbS5nZXRTdGF0ZSh0eXBlKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFByb2NlZHVyZU1hbmFnZXI7XG4gICAgfShCYXNlXzEuRnJhbWV3b3JrTW9kdWxlKSk7IC8vIGNsYXNzIFByb2NlZHVyZU1hbmFnZXJcbiAgICBleHBvcnRzLlByb2NlZHVyZU1hbmFnZXIgPSBQcm9jZWR1cmVNYW5hZ2VyO1xufSk7XG4iLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICB2YXIgUmVzb3VyY2VNb2RlO1xuICAgIChmdW5jdGlvbiAoUmVzb3VyY2VNb2RlKSB7XG4gICAgICAgIFJlc291cmNlTW9kZVtSZXNvdXJjZU1vZGVbXCJVbnNwZWNpZmllZFwiXSA9IDBdID0gXCJVbnNwZWNpZmllZFwiO1xuICAgICAgICBSZXNvdXJjZU1vZGVbUmVzb3VyY2VNb2RlW1wiUGFja2FnZVwiXSA9IDFdID0gXCJQYWNrYWdlXCI7XG4gICAgICAgIFJlc291cmNlTW9kZVtSZXNvdXJjZU1vZGVbXCJVcGRhdGFibGVcIl0gPSAyXSA9IFwiVXBkYXRhYmxlXCI7XG4gICAgfSkoUmVzb3VyY2VNb2RlID0gZXhwb3J0cy5SZXNvdXJjZU1vZGUgfHwgKGV4cG9ydHMuUmVzb3VyY2VNb2RlID0ge30pKTsgLy8gZW51bSBSZXNvdXJjZU1vZGVcbiAgICB2YXIgTG9hZFJlc291cmNlU3RhdHVzO1xuICAgIChmdW5jdGlvbiAoTG9hZFJlc291cmNlU3RhdHVzKSB7XG4gICAgICAgIExvYWRSZXNvdXJjZVN0YXR1c1tMb2FkUmVzb3VyY2VTdGF0dXNbXCJTdWNjZXNzXCJdID0gMF0gPSBcIlN1Y2Nlc3NcIjtcbiAgICAgICAgTG9hZFJlc291cmNlU3RhdHVzW0xvYWRSZXNvdXJjZVN0YXR1c1tcIk5vdFJlYWR5XCJdID0gMV0gPSBcIk5vdFJlYWR5XCI7XG4gICAgICAgIExvYWRSZXNvdXJjZVN0YXR1c1tMb2FkUmVzb3VyY2VTdGF0dXNbXCJOb3RFeGlzdFwiXSA9IDJdID0gXCJOb3RFeGlzdFwiO1xuICAgICAgICBMb2FkUmVzb3VyY2VTdGF0dXNbTG9hZFJlc291cmNlU3RhdHVzW1wiRGVwZW5kZW5jeUVycm9yXCJdID0gM10gPSBcIkRlcGVuZGVuY3lFcnJvclwiO1xuICAgICAgICBMb2FkUmVzb3VyY2VTdGF0dXNbTG9hZFJlc291cmNlU3RhdHVzW1wiVHlwZUVycm9yXCJdID0gNF0gPSBcIlR5cGVFcnJvclwiO1xuICAgICAgICBMb2FkUmVzb3VyY2VTdGF0dXNbTG9hZFJlc291cmNlU3RhdHVzW1wiQXNzZXRFcnJvclwiXSA9IDVdID0gXCJBc3NldEVycm9yXCI7XG4gICAgfSkoTG9hZFJlc291cmNlU3RhdHVzID0gZXhwb3J0cy5Mb2FkUmVzb3VyY2VTdGF0dXMgfHwgKGV4cG9ydHMuTG9hZFJlc291cmNlU3RhdHVzID0ge30pKTsgLy8gZW51bSBMb2FkUmVzb3VyY2VTdGF0dXNcbiAgICAvKipcbiAgICAgKiBBIHJlc291cmNlIG1hbmFnZXIgbW9kdWxhciBiYXNlIG9uIGBGcmFtZXdvcmtNb2R1bGVgLlxuICAgICAqXG4gICAgICogVE9ETzogQSBnZW5lcmFsIHJlc291cmNlIG1hbmFnZW1lbnQgd2FzIG5vdCB5ZXQgaW1wbGVtZW50ZWQuXG4gICAgICpcbiAgICAgKiBAYXV0aG9yIEplcmVteSBDaGVuIChrZXlob20uY0BnbWFpbC5jb20pXG4gICAgICovXG4gICAgdmFyIFJlc291cmNlTWFuYWdlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgX19leHRlbmRzKFJlc291cmNlTWFuYWdlciwgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gUmVzb3VyY2VNYW5hZ2VyKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZXNvdXJjZU1hbmFnZXIucHJvdG90eXBlLCBcInJlc291cmNlR3JvdXBcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFJlc291cmNlR3JvdXA7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUmVzb3VyY2VNYW5hZ2VyLnByb3RvdHlwZSwgXCJyZXNvdXJjZUxvYWRlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wUmVzb3VyY2VMb2FkZXI7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChudWxsID09IHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZXR0aW5nIHJlc291cmNlIGxvYWRlciBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTG9hZGVyID0gdmFsdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFJlc291cmNlTWFuYWdlci5wcm90b3R5cGUsIFwicHJpb3JpdHlcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDcwO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFJlc291cmNlTWFuYWdlci5wcm90b3R5cGUuaGFzQXNzZXQgPSBmdW5jdGlvbiAoYXNzZXROYW1lKSB7XG4gICAgICAgICAgICBpZiAoIWFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUmVzb3VyY2VMb2FkZXIuaGFzQXNzZXQoYXNzZXROYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnByb3RvdHlwZS5sb2FkQXNzZXQgPSBmdW5jdGlvbiAoYXNzZXROYW1lLCBhc3NldFR5cGUsIHByaW9yaXR5LCBsb2FkQXNzZXRDYWxsYmFja3MsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoIWFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCFsb2FkQXNzZXRDYWxsYmFja3MpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTG9hZCBhc3NldCBjYWxsYmFja3MgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTG9hZGVyLmxvYWRBc3NldChhc3NldE5hbWUsIGFzc2V0VHlwZSwgcHJpb3JpdHksIGxvYWRBc3NldENhbGxiYWNrcywgdXNlckRhdGEpO1xuICAgICAgICB9O1xuICAgICAgICBSZXNvdXJjZU1hbmFnZXIucHJvdG90eXBlLnVubG9hZEFzc2V0ID0gZnVuY3Rpb24gKGFzc2V0KSB7XG4gICAgICAgICAgICBpZiAoIWFzc2V0KVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzc2V0IGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BSZXNvdXJjZUxvYWRlcilcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTG9hZGVyLnVubG9hZEFzc2V0KGFzc2V0KTtcbiAgICAgICAgfTtcbiAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnByb3RvdHlwZS5sb2FkU2NlbmUgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUsIHByaW9yaXR5LCBsb2FkU2NlbmVDYWxsYmFja3MsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoIXNjZW5lQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjZW5lIGFzc2V0IG5hbWUgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAoIWxvYWRTY2VuZUNhbGxiYWNrcylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2FkIHNjZW5lIGFzc2V0IGNhbGxiYWNrcyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VMb2FkZXIubG9hZFNjZW5lKHNjZW5lQXNzZXROYW1lLCBwcmlvcml0eSwgbG9hZFNjZW5lQ2FsbGJhY2tzLCB1c2VyRGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIFJlc291cmNlTWFuYWdlci5wcm90b3R5cGUudW5sb2FkU2NlbmUgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUsIHVubG9hZFNjZW5lQ2FsbGJhY2tzLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKCFzY2VuZUFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCF1bmxvYWRTY2VuZUNhbGxiYWNrcylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmxvYWQgc2NlbmUgY2FsbGJhY2tzIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZUxvYWRlci51bmxvYWRTY2VuZShzY2VuZUFzc2V0TmFtZSwgdW5sb2FkU2NlbmVDYWxsYmFja3MsIHVzZXJEYXRhKTtcbiAgICAgICAgfTtcbiAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnByb3RvdHlwZS5oYXNSZXNvdXJjZUdyb3VwID0gZnVuY3Rpb24gKHJlc291cmNlR3JvdXBOYW1lKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcFJlc291cmNlTG9hZGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZUxvYWRlci51cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBSZXNvdXJjZU1hbmFnZXIucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wUmVzb3VyY2VMb2FkZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTG9hZGVyLnNodXRkb3duKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBSZXNvdXJjZU1hbmFnZXI7XG4gICAgfShCYXNlXzEuRnJhbWV3b3JrTW9kdWxlKSk7IC8vIGNsYXNzIFJlc291cmNlTWFuYWdlclxuICAgIGV4cG9ydHMuUmVzb3VyY2VNYW5hZ2VyID0gUmVzb3VyY2VNYW5hZ2VyO1xufSk7XG4iLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbnZhciBfX3ZhbHVlcyA9ICh0aGlzICYmIHRoaXMuX192YWx1ZXMpIHx8IGZ1bmN0aW9uKG8pIHtcbiAgICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xufTtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICB2YXIgU2NlbmVNYW5hZ2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICBfX2V4dGVuZHMoU2NlbmVNYW5hZ2VyLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBTY2VuZU1hbmFnZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRlZFNjZW5lQXNzZXROYW1lcyA9IFtdO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZGluZ1NjZW5lQXNzZXROYW1lcyA9IFtdO1xuICAgICAgICAgICAgX3RoaXMubV9wVW5sb2FkaW5nU2NlbmVBc3NldE5hbWVzID0gW107XG4gICAgICAgICAgICBfdGhpcy5tX3BMb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZFNjZW5lRmFpbHVyZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRTY2VuZVVwZGF0ZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRTY2VuZURlcGVuZGVuY3lBc3NldERlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcFVubG9hZFNjZW5lU3VjY2Vzc0RlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcFVubG9hZFNjZW5lRmFpbHVyZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRTY2VuZUNhbGxiYWNrcyA9IHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBfdGhpcy5vbkxvYWRTY2VuZVN1Y2Nlc3MuYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgZmFpbHVyZTogX3RoaXMub25Mb2FkU2NlbmVGYWlsdXJlLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIHVwZGF0ZTogX3RoaXMub25Mb2FkU2NlbmVVcGRhdGUuYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgZGVwZW5kZW5jeTogX3RoaXMub25Mb2FkU2NlbmVEZXBlbmRlbmN5QXNzZXQuYmluZChfdGhpcylcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBfdGhpcy5tX3BVbmxvYWRTY2VuZUNhbGxiYWNrcyA9IHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBfdGhpcy5vblVubG9hZFNjZW5lU3VjY2Vzcy5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICBmYWlsdXJlOiBfdGhpcy5vblVubG9hZFNjZW5lRmFpbHVyZS5iaW5kKF90aGlzKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU2NlbmVNYW5hZ2VyLnByb3RvdHlwZSwgXCJwcmlvcml0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gNjA7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNjZW5lTWFuYWdlci5wcm90b3R5cGUsIFwibG9hZFNjZW5lU3VjY2Vzc1wiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BMb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNjZW5lTWFuYWdlci5wcm90b3R5cGUsIFwibG9hZFNjZW5lRmFpbHVyZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BMb2FkU2NlbmVGYWlsdXJlRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNjZW5lTWFuYWdlci5wcm90b3R5cGUsIFwibG9hZFNjZW5lVXBkYXRlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcExvYWRTY2VuZVVwZGF0ZURlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTY2VuZU1hbmFnZXIucHJvdG90eXBlLCBcImxvYWRTY2VuZURlcGVuZGVuY3lBc3NldFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BMb2FkU2NlbmVEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU2NlbmVNYW5hZ2VyLnByb3RvdHlwZSwgXCJ1bmxvYWRTY2VuZVN1Y2Nlc3NcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wVW5sb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNjZW5lTWFuYWdlci5wcm90b3R5cGUsIFwidW5sb2FkU2NlbmVGYWlsdXJlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFVubG9hZFNjZW5lRmFpbHVyZURlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTY2VuZU1hbmFnZXIucHJvdG90eXBlLCBcInJlc291cmNlTWFuYWdlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlciA9IHZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUuc2NlbmVJc0xvYWRpbmcgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUpIHtcbiAgICAgICAgICAgIGlmICghc2NlbmVBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgbmFtZSBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHJldHVybiBzY2VuZUFzc2V0TmFtZSBpbiB0aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXM7XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUuc2NlbmVJc0xvYWRlZCA9IGZ1bmN0aW9uIChzY2VuZUFzc2V0TmFtZSkge1xuICAgICAgICAgICAgaWYgKCFzY2VuZUFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHNjZW5lQXNzZXROYW1lIGluIHRoaXMubV9wTG9hZGVkU2NlbmVBc3NldE5hbWVzO1xuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLnNjZW5lSXNVbmxvYWRpbmcgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUpIHtcbiAgICAgICAgICAgIGlmICghc2NlbmVBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgbmFtZSBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHJldHVybiBzY2VuZUFzc2V0TmFtZSBpbiB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcztcbiAgICAgICAgfTtcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnByb3RvdHlwZS5nZXRMb2FkZWRTY2VuZUFzc2V0TmFtZXMgPSBmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMgfHwgW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubV9wTG9hZGVkU2NlbmVBc3NldE5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMubV9wTG9hZGVkU2NlbmVBc3NldE5hbWVzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLmdldExvYWRpbmdTY2VuZUFzc2V0TmFtZXMgPSBmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMgfHwgW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubV9wTG9hZGluZ1NjZW5lQXNzZXROYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUuZ2V0VW5sb2FkaW5nU2NlbmVBc3NldE5hbWVzID0gZnVuY3Rpb24gKHJlc3VsdHMpIHtcbiAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzIHx8IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfTtcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnByb3RvdHlwZS5sb2FkU2NlbmUgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUsIHByaW9yaXR5LCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKCFzY2VuZUFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1fcFJlc291cmNlTWFuYWdlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgcmVzb3VyY2UgbWFuYWdlciBmaXJzdC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5zY2VuZUlzVW5sb2FkaW5nKHNjZW5lQXNzZXROYW1lKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCAnXCIgKyBzY2VuZUFzc2V0TmFtZSArIFwiJyBpcyBiZWluZyB1bmxvYWRlZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5zY2VuZUlzTG9hZGluZyhzY2VuZUFzc2V0TmFtZSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgJ1wiICsgc2NlbmVBc3NldE5hbWUgKyBcIicgaXMgYmVpbmcgbG9hZGVkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnNjZW5lSXNMb2FkZWQoc2NlbmVBc3NldE5hbWUpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjZW5lIGFzc2V0ICdcIiArIHNjZW5lQXNzZXROYW1lICsgXCInIGlzIGFscmVhZHkgbG9hZGVkLlwiKTtcbiAgICAgICAgICAgIHRoaXMubV9wTG9hZGluZ1NjZW5lQXNzZXROYW1lcy5wdXNoKHNjZW5lQXNzZXROYW1lKTtcbiAgICAgICAgICAgIHZhciB2X2lQcmlvcml0eSA9IDA7XG4gICAgICAgICAgICB2YXIgdl9wVXNlckRhdGE7XG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAyKSB7XG4gICAgICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2YgcHJpb3JpdHkpXG4gICAgICAgICAgICAgICAgICAgIHZfaVByaW9yaXR5ID0gcHJpb3JpdHk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB2X3BVc2VyRGF0YSA9IHByaW9yaXR5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAzKSB7XG4gICAgICAgICAgICAgICAgdl9pUHJpb3JpdHkgPSBwcmlvcml0eTtcbiAgICAgICAgICAgICAgICB2X3BVc2VyRGF0YSA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIubG9hZFNjZW5lKHNjZW5lQXNzZXROYW1lLCB2X2lQcmlvcml0eSwgdGhpcy5tX3BMb2FkU2NlbmVDYWxsYmFja3MsIHZfcFVzZXJEYXRhKTtcbiAgICAgICAgfTtcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnByb3RvdHlwZS51bmxvYWRTY2VuZSA9IGZ1bmN0aW9uIChzY2VuZUFzc2V0TmFtZSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGlmICghc2NlbmVBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgbmFtZSBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IHJlc291cmNlIG1hbmFnZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2NlbmVJc1VubG9hZGluZyhzY2VuZUFzc2V0TmFtZSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgJ1wiICsgc2NlbmVBc3NldE5hbWUgKyBcIicgaXMgYmVpbmcgdW5sb2FkZWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2NlbmVJc0xvYWRpbmcoc2NlbmVBc3NldE5hbWUpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjZW5lIGFzc2V0ICdcIiArIHNjZW5lQXNzZXROYW1lICsgXCInIGlzIGJlaW5nIGxvYWRlZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5zY2VuZUlzTG9hZGVkKHNjZW5lQXNzZXROYW1lKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCAnXCIgKyBzY2VuZUFzc2V0TmFtZSArIFwiJyBpcyBhbHJlYWR5IGxvYWRlZC5cIik7XG4gICAgICAgICAgICB1c2VyRGF0YSA9IHVzZXJEYXRhIHx8IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcy5wdXNoKHNjZW5lQXNzZXROYW1lKTtcbiAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyLnVubG9hZFNjZW5lKHNjZW5lQXNzZXROYW1lLCB0aGlzLm1fcFVubG9hZFNjZW5lQ2FsbGJhY2tzLCB1c2VyRGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICAvLyBOT09QLlxuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfMSwgX2E7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BMb2FkZWRTY2VuZUFzc2V0TmFtZXMpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzTmFtZSA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zY2VuZUlzVW5sb2FkaW5nKHNOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy51bmxvYWRTY2VuZShzTmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMV8xKSB7IGVfMSA9IHsgZXJyb3I6IGVfMV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3BMb2FkZWRTY2VuZUFzc2V0TmFtZXMuc3BsaWNlKDAsIHRoaXMubV9wTG9hZGVkU2NlbmVBc3NldE5hbWVzLmxlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXMuc3BsaWNlKDAsIHRoaXMubV9wTG9hZGluZ1NjZW5lQXNzZXROYW1lcy5sZW5ndGgpO1xuICAgICAgICAgICAgdGhpcy5tX3BVbmxvYWRpbmdTY2VuZUFzc2V0TmFtZXMuc3BsaWNlKDAsIHRoaXMubV9wVW5sb2FkaW5nU2NlbmVBc3NldE5hbWVzLmxlbmd0aCk7XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUub25Mb2FkU2NlbmVTdWNjZXNzID0gZnVuY3Rpb24gKHNjZW5lQXNzZXROYW1lLCBkdXJhdGlvbiwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X0lkeDtcbiAgICAgICAgICAgIGlmICgodl9JZHggPSB0aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXMuaW5kZXhPZihzY2VuZUFzc2V0TmFtZSkpID49IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXMuc3BsaWNlKHZfSWR4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgodl9JZHggPSB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcy5pbmRleE9mKHNjZW5lQXNzZXROYW1lKSkgPj0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wVW5sb2FkaW5nU2NlbmVBc3NldE5hbWVzLnNwbGljZSh2X0lkeCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcExvYWRlZFNjZW5lQXNzZXROYW1lcy5wdXNoKHNjZW5lQXNzZXROYW1lKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWRTY2VuZVN1Y2Nlc3NEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHNjZW5lQXNzZXROYW1lLCBkdXJhdGlvbiwgdXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLm9uTG9hZFNjZW5lRmFpbHVyZSA9IGZ1bmN0aW9uIChzY2VuZUFzc2V0TmFtZSwgc3RhdHVzLCBlcnJvck1lc3NhZ2UsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9JZHg7XG4gICAgICAgICAgICBpZiAoKHZfSWR4ID0gdGhpcy5tX3BMb2FkaW5nU2NlbmVBc3NldE5hbWVzLmluZGV4T2Yoc2NlbmVBc3NldE5hbWUpKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkaW5nU2NlbmVBc3NldE5hbWVzLnNwbGljZSh2X0lkeCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkU2NlbmVGYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZFNjZW5lRmFpbHVyZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihzY2VuZUFzc2V0TmFtZSwgZXJyb3JNZXNzYWdlLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUub25Mb2FkU2NlbmVVcGRhdGUgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUsIHByb2dyZXNzLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wTG9hZFNjZW5lVXBkYXRlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZFNjZW5lVXBkYXRlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHNjZW5lQXNzZXROYW1lLCBwcm9ncmVzcywgdXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLm9uTG9hZFNjZW5lRGVwZW5kZW5jeUFzc2V0ID0gZnVuY3Rpb24gKHNjZW5lQXNzZXROYW1lLCBkZXBlbmRlbmN5QXNzZXROYW1lLCBsb2FkZWRDb3VudCwgdG90YWxDb3VudCwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWRTY2VuZURlcGVuZGVuY3lBc3NldERlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRTY2VuZURlcGVuZGVuY3lBc3NldERlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihzY2VuZUFzc2V0TmFtZSwgZGVwZW5kZW5jeUFzc2V0TmFtZSwgbG9hZGVkQ291bnQsIHRvdGFsQ291bnQsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnByb3RvdHlwZS5vblVubG9hZFNjZW5lU3VjY2VzcyA9IGZ1bmN0aW9uIChzY2VuZUFzc2V0TmFtZSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X0lkeDtcbiAgICAgICAgICAgIGlmICgodl9JZHggPSB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcy5pbmRleE9mKHNjZW5lQXNzZXROYW1lKSkgPj0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wVW5sb2FkaW5nU2NlbmVBc3NldE5hbWVzLnNwbGljZSh2X0lkeCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoKHZfSWR4ID0gdGhpcy5tX3BMb2FkZWRTY2VuZUFzc2V0TmFtZXMuaW5kZXhPZihzY2VuZUFzc2V0TmFtZSkpID49IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRlZFNjZW5lQXNzZXROYW1lcy5zcGxpY2Uodl9JZHgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubV9wVW5sb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wVW5sb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHNjZW5lQXNzZXROYW1lLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUub25VbmxvYWRTY2VuZUZhaWx1cmUgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9JZHg7XG4gICAgICAgICAgICBpZiAoKHZfSWR4ID0gdGhpcy5tX3BVbmxvYWRpbmdTY2VuZUFzc2V0TmFtZXMuaW5kZXhPZihzY2VuZUFzc2V0TmFtZSkpID49IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcy5zcGxpY2Uodl9JZHgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubV9wVW5sb2FkU2NlbmVGYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wVW5sb2FkU2NlbmVGYWlsdXJlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHNjZW5lQXNzZXROYW1lLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBTY2VuZU1hbmFnZXI7XG4gICAgfShCYXNlXzEuRnJhbWV3b3JrTW9kdWxlKSk7IC8vIGNsYXNzIFNjZW5lTWFuYWdlclxuICAgIGV4cG9ydHMuU2NlbmVNYW5hZ2VyID0gU2NlbmVNYW5hZ2VyO1xufSk7XG4iLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbnZhciBfX3ZhbHVlcyA9ICh0aGlzICYmIHRoaXMuX192YWx1ZXMpIHx8IGZ1bmN0aW9uKG8pIHtcbiAgICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xufTtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICB2YXIgVUlNYW5hZ2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICBfX2V4dGVuZHMoVUlNYW5hZ2VyLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBVSU1hbmFnZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgICAgICAgICAgIF90aGlzLm1fclVJR3JvdXBzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgX3RoaXMubV9pU2VyaWFsSWQgPSAwO1xuICAgICAgICAgICAgX3RoaXMubV9iSXNTaHV0ZG93biA9IGZhbHNlO1xuICAgICAgICAgICAgX3RoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgX3RoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZCA9IG5ldyBTZXQoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcEluc3RhbmNlUG9vbCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcFJlY3ljbGVRdWV1ZSA9IFtdO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZEFzc2V0Q2FsbGJhY2tzID0ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IF90aGlzLmxvYWRVSUZvcm1TdWNjZXNzQ2FsbGJhY2suYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgZmFpbHVyZTogX3RoaXMubG9hZFVJRm9ybUZhaWx1cmVDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICB1cGRhdGU6IF90aGlzLmxvYWRVSUZvcm1VcGRhdGVDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICBkZXBlbmRlbmN5OiBfdGhpcy5sb2FkVUlGb3JtRGVwZW5kZW5jeUFzc2V0Q2FsbGJhY2suYmluZChfdGhpcyksXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgX3RoaXMubV9wT3BlblVJRm9ybVN1Y2Nlc3NEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BPcGVuVUlGb3JtRmFpbHVyZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcE9wZW5VSUZvcm1VcGRhdGVEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BPcGVuVUlGb3JtRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wQ2xvc2VVSUZvcm1Db21wbGV0ZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fZkluc3RhbmNlQXV0b1JlbGVhc2VJbnRlcnZhbCA9IDA7XG4gICAgICAgICAgICBfdGhpcy5tX3VJbnN0YW5jZUNhcGFjaXR5ID0gMDtcbiAgICAgICAgICAgIF90aGlzLm1fZkluc3RhbmNlRXhwaXJlVGltZSA9IDA7XG4gICAgICAgICAgICBfdGhpcy5tX2lJbnN0YW5jZVByaW9yaXR5ID0gMDtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgICAgIC8vIHByaXZhdGUgZmlyZU9wZW5VSUZvcm1Db21wbGV0ZShlcnJvcjogRXJyb3IsIHVpRm9ybUFzc2V0TmFtZTogc3RyaW5nLCB1aUZvcm1Bc3NldDogb2JqZWN0LCBkdXJhdGlvbjogbnVtYmVyLCBpbmZvOiBPcGVuVUlGb3JtSW5mbyk6IHZvaWQge1xuICAgICAgICAgICAgLy8gdGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQuZGVsZXRlKGluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgLy8gaWYgKHRoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZC5oYXMoaW5mby5zZXJpYWxJZCkpIHtcbiAgICAgICAgICAgIC8vIHRoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZC5kZWxldGUoaW5mby5zZXJpYWxJZCk7XG4gICAgICAgICAgICAvLyBpZiAoIWVycm9yKVxuICAgICAgICAgICAgLy8gdGhpcy5tX3BVSUZvcm1IZWxwZXIucmVsZWFzZVVJRm9ybSh1aUZvcm1Bc3NldCBhcyBvYmplY3QsIG51bGwpO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gbGV0IHVpRm9ybTogSVVJRm9ybSA9IG51bGw7XG4gICAgICAgICAgICAvLyBpZiAoIWVycm9yKSB7XG4gICAgICAgICAgICAvLyBsZXQgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3Q6IFVJRm9ybUluc3RhbmNlT2JqZWN0ID0gVUlGb3JtSW5zdGFuY2VPYmplY3QuY3JlYXRlKHVpRm9ybUFzc2V0TmFtZSwgdWlGb3JtQXNzZXQsIHRoaXMubV9wVUlGb3JtSGVscGVyLmluc3RhbnRpYXRlVUlGb3JtKHVpRm9ybUFzc2V0IGFzIG9iamVjdCksIHRoaXMubV9wVUlGb3JtSGVscGVyKTtcbiAgICAgICAgICAgIC8vIC8vIFJlZ2lzdGVyIHRvIHBvb2wgYW5kIG1hcmsgc3Bhd24gZmxhZy5cbiAgICAgICAgICAgIC8vIGlmICghdGhpcy5tX3BJbnN0YW5jZVBvb2wuaGFzKHVpRm9ybUFzc2V0TmFtZSkpIHtcbiAgICAgICAgICAgIC8vIHRoaXMubV9wSW5zdGFuY2VQb29sLnNldCh1aUZvcm1Bc3NldE5hbWUsIFtdKTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIC8vIGxldCB2X3BJbnN0YW5jZU9iamVjdHM6IFVJRm9ybUluc3RhbmNlT2JqZWN0W10gPSB0aGlzLm1fcEluc3RhbmNlUG9vbC5nZXQodWlGb3JtQXNzZXROYW1lKTtcbiAgICAgICAgICAgIC8vIGlmICh2X3BJbnN0YW5jZU9iamVjdHMubGVuZ3RoIDwgdGhpcy5tX3VJbnN0YW5jZUNhcGFjaXR5KSB7XG4gICAgICAgICAgICAvLyB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC5zcGF3biA9IHRydWU7XG4gICAgICAgICAgICAvLyB2X3BJbnN0YW5jZU9iamVjdHMucHVzaCh2X3BVaUZvcm1JbnN0YW5jZU9iamVjdCk7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvLyB0aGlzLm9wZW5VSUZvcm1JbnRlcm5hbChpbmZvLnNlcmlhbElkLCB1aUZvcm1Bc3NldE5hbWUsIGluZm8udWlHcm91cCBhcyBVSUdyb3VwLCB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC50YXJnZXQsIGluZm8ucGF1c2VDb3ZlcmVkVUlGb3JtLCB0cnVlLCBkdXJhdGlvbiwgaW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAvLyB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gbGV0IGV2ZW50QXJnczogT3BlblVJRm9ybUZhaWx1cmVFdmVudEFyZ3MgPSB7XG4gICAgICAgICAgICAvLyBlcnJvck1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgICAvLyBzZXJpYWxJZDogaW5mby5zZXJpYWxJZCxcbiAgICAgICAgICAgIC8vIHBhdXNlQ292ZXJlZFVJRm9ybTogaW5mby5wYXVzZUNvdmVyZWRVSUZvcm0sXG4gICAgICAgICAgICAvLyB1aUdyb3VwTmFtZTogaW5mby51aUdyb3VwLm5hbWUsXG4gICAgICAgICAgICAvLyB1aUZvcm1Bc3NldE5hbWU6IHVpRm9ybUFzc2V0TmFtZSxcbiAgICAgICAgICAgIC8vIHVzZXJEYXRhOiBpbmZvLnVzZXJEYXRhXG4gICAgICAgICAgICAvLyB9O1xuICAgICAgICAgICAgLy8gdGhpcy5tX3BPcGVuVUlGb3JtRmFpbHVyZURlbGVnYXRlLml0ZXIoKGNhbGxiYWNrRm46IE9wZW5VSUZvcm1GYWlsdXJlRXZlbnRIYW5kbGVyKSA9PiB7XG4gICAgICAgICAgICAvLyBjYWxsYmFja0ZuKGV2ZW50QXJncyk7XG4gICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIC8vIHByaXZhdGUgZmlyZU9wZW5VSUZvcm1Qcm9ncmVzcyh1aUZvcm1Bc3NldE5hbWU6IHN0cmluZywgcHJvZ3Jlc3M6IG51bWJlciwgaW5mbzogT3BlblVJRm9ybUluZm8pOiB2b2lkIHtcbiAgICAgICAgICAgIC8vIGxldCBldmVudEFyZ3M6IE9wZW5VSUZvcm1VcGRhdGVFdmVudEFyZ3MgPSB7XG4gICAgICAgICAgICAvLyBzZXJpYWxJZDogaW5mby5zZXJpYWxJZCxcbiAgICAgICAgICAgIC8vIHBhdXNlQ292ZXJlZFVJRm9ybTogaW5mby5wYXVzZUNvdmVyZWRVSUZvcm0sXG4gICAgICAgICAgICAvLyBwcm9ncmVzczogcHJvZ3Jlc3MsXG4gICAgICAgICAgICAvLyB1aUZvcm1Bc3NldE5hbWU6IHVpRm9ybUFzc2V0TmFtZSxcbiAgICAgICAgICAgIC8vIHVpR3JvdXBOYW1lOiBpbmZvLnVpR3JvdXAubmFtZSxcbiAgICAgICAgICAgIC8vIHVzZXJEYXRhOiBpbmZvLnVzZXJEYXRhXG4gICAgICAgICAgICAvLyB9O1xuICAgICAgICAgICAgLy8gdGhpcy5tX3BPcGVuVUlGb3JtVXBkYXRlRGVsZWdhdGUuaXRlcigoY2FsbGJhY2tGbjogT3BlblVJRm9ybVVwZGF0ZUV2ZW50SGFuZGxlcikgPT4ge1xuICAgICAgICAgICAgLy8gY2FsbGJhY2tGbihldmVudEFyZ3MpO1xuICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJTWFuYWdlci5wcm90b3R5cGUsIFwidWlGb3JtSGVscGVyXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BVSUZvcm1IZWxwZXI7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICghdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBoZWxwZXIgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUhlbHBlciA9IHZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSU1hbmFnZXIucHJvdG90eXBlLCBcInJlc291cmNlTWFuYWdlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAobnVsbCA9PSB2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUmVzb3VyY2UgbWFuYWdlciBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlciA9IHZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSU1hbmFnZXIucHJvdG90eXBlLCBcInVpR3JvdXBDb3VudFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3JVSUdyb3Vwcy5zaXplO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSU1hbmFnZXIucHJvdG90eXBlLCBcIm9wZW5VSUZvcm1TdWNjZXNzXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BPcGVuVUlGb3JtU3VjY2Vzc0RlbGVnYXRlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJTWFuYWdlci5wcm90b3R5cGUsIFwib3BlblVJRm9ybUZhaWx1cmVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcE9wZW5VSUZvcm1GYWlsdXJlRGVsZWdhdGU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlNYW5hZ2VyLnByb3RvdHlwZSwgXCJvcGVuVUlGb3JtVXBkYXRlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BPcGVuVUlGb3JtVXBkYXRlRGVsZWdhdGU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlNYW5hZ2VyLnByb3RvdHlwZSwgXCJvcGVuVUlGb3JtRGVwZW5kZW5jeUFzc2V0XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BPcGVuVUlGb3JtRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlNYW5hZ2VyLnByb3RvdHlwZSwgXCJjbG9zZVVJRm9ybUNvbXBsZXRlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BDbG9zZVVJRm9ybUNvbXBsZXRlRGVsZWdhdGU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlNYW5hZ2VyLnByb3RvdHlwZSwgXCJpbnN0YW5jZUF1dG9SZWxlYXNlSW50ZXJ2YWxcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fZkluc3RhbmNlQXV0b1JlbGVhc2VJbnRlcnZhbDsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9mSW5zdGFuY2VBdXRvUmVsZWFzZUludGVydmFsID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlNYW5hZ2VyLnByb3RvdHlwZSwgXCJpbnN0YW5jZUNhcGFjaXR5XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3VJbnN0YW5jZUNhcGFjaXR5OyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX3VJbnN0YW5jZUNhcGFjaXR5ID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlNYW5hZ2VyLnByb3RvdHlwZSwgXCJpbnN0YW5jZUV4cGlyZVRpbWVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fZkluc3RhbmNlRXhwaXJlVGltZTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9mSW5zdGFuY2VFeHBpcmVUaW1lID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlNYW5hZ2VyLnByb3RvdHlwZSwgXCJpbnN0YW5jZVByaW9yaXR5XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX2lJbnN0YW5jZVByaW9yaXR5OyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX2lJbnN0YW5jZVByaW9yaXR5ID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgdmFyIGVfMSwgX2EsIGVfMiwgX2I7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9jID0gX192YWx1ZXModGhpcy5tX3BSZWN5Y2xlUXVldWUpLCBfZCA9IF9jLm5leHQoKTsgIV9kLmRvbmU7IF9kID0gX2MubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB1aUZvcm0gPSBfZC52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubV9wSW5zdGFuY2VQb29sLmhhcyh1aUZvcm0udWlGb3JtQXNzZXROYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZfcEluc3RhbmNlT2JqZWN0cyA9IHRoaXMubV9wSW5zdGFuY2VQb29sLmdldCh1aUZvcm0udWlGb3JtQXNzZXROYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2X3BJbnN0YW5jZU9iamVjdHMgJiYgdl9wSW5zdGFuY2VPYmplY3RzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciB2X3BJbnN0YW5jZU9iamVjdHNfMSA9IChlXzIgPSB2b2lkIDAsIF9fdmFsdWVzKHZfcEluc3RhbmNlT2JqZWN0cykpLCB2X3BJbnN0YW5jZU9iamVjdHNfMV8xID0gdl9wSW5zdGFuY2VPYmplY3RzXzEubmV4dCgpOyAhdl9wSW5zdGFuY2VPYmplY3RzXzFfMS5kb25lOyB2X3BJbnN0YW5jZU9iamVjdHNfMV8xID0gdl9wSW5zdGFuY2VPYmplY3RzXzEubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QgPSB2X3BJbnN0YW5jZU9iamVjdHNfMV8xLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1aUZvcm0ub25SZWN5Y2xlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3Quc3Bhd24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZV8yXzEpIHsgZV8yID0geyBlcnJvcjogZV8yXzEgfTsgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEluc3RhbmNlT2JqZWN0c18xXzEgJiYgIXZfcEluc3RhbmNlT2JqZWN0c18xXzEuZG9uZSAmJiAoX2IgPSB2X3BJbnN0YW5jZU9iamVjdHNfMS5yZXR1cm4pKSBfYi5jYWxsKHZfcEluc3RhbmNlT2JqZWN0c18xKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMikgdGhyb3cgZV8yLmVycm9yOyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMV8xKSB7IGVfMSA9IHsgZXJyb3I6IGVfMV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfZCAmJiAhX2QuZG9uZSAmJiAoX2EgPSBfYy5yZXR1cm4pKSBfYS5jYWxsKF9jKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubV9wUmVjeWNsZVF1ZXVlLmxlbmd0aClcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlY3ljbGVRdWV1ZS5zcGxpY2UoMCwgdGhpcy5tX3BSZWN5Y2xlUXVldWUubGVuZ3RoKTtcbiAgICAgICAgICAgIC8vIFRPRE86IGF1dG8gcmVsZWFzZSBwcm9jZXNzaW5nIGhlcmUuXG4gICAgICAgICAgICB0aGlzLm1fclVJR3JvdXBzLmZvckVhY2goZnVuY3Rpb24gKHVpR3JvdXAsIGtleSkge1xuICAgICAgICAgICAgICAgIHZhciB2X3BVaUdyb3VwID0gdWlHcm91cDtcbiAgICAgICAgICAgICAgICB2X3BVaUdyb3VwLnVwZGF0ZShlbGFwc2VkLCByZWFsRWxhcHNlZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLm1fYklzU2h1dGRvd24gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5jbG9zZUFsbExvYWRlZFVJRm9ybXMoKTtcbiAgICAgICAgICAgIHRoaXMubV9wUmVjeWNsZVF1ZXVlLnNwbGljZSgwLCB0aGlzLm1fcFJlY3ljbGVRdWV1ZS5sZW5ndGgpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wSW5zdGFuY2VQb29sKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BJbnN0YW5jZVBvb2wuZm9yRWFjaChmdW5jdGlvbiAoaW5zdGFuY2VPYmplY3RzLCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVfMywgX2E7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZU9iamVjdHMgJiYgaW5zdGFuY2VPYmplY3RzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaW5zdGFuY2VPYmplY3RzXzEgPSBfX3ZhbHVlcyhpbnN0YW5jZU9iamVjdHMpLCBpbnN0YW5jZU9iamVjdHNfMV8xID0gaW5zdGFuY2VPYmplY3RzXzEubmV4dCgpOyAhaW5zdGFuY2VPYmplY3RzXzFfMS5kb25lOyBpbnN0YW5jZU9iamVjdHNfMV8xID0gaW5zdGFuY2VPYmplY3RzXzEubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdCA9IGluc3RhbmNlT2JqZWN0c18xXzEudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LnJlbGVhc2UodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGVfM18xKSB7IGVfMyA9IHsgZXJyb3I6IGVfM18xIH07IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZU9iamVjdHNfMV8xICYmICFpbnN0YW5jZU9iamVjdHNfMV8xLmRvbmUgJiYgKF9hID0gaW5zdGFuY2VPYmplY3RzXzEucmV0dXJuKSkgX2EuY2FsbChpbnN0YW5jZU9iamVjdHNfMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8zKSB0aHJvdyBlXzMuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlT2JqZWN0cy5zcGxpY2UoMCwgaW5zdGFuY2VPYmplY3RzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5tX3BJbnN0YW5jZVBvb2wuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEluc3RhbmNlUG9vbC5jbGVhcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLm9wZW5VSUZvcm0gPSBmdW5jdGlvbiAodWlGb3JtQXNzZXROYW1lLCB1aUdyb3VwTmFtZSwgcHJpb3JpdHksIHBhdXNlQ292ZXJlZFVJRm9ybSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIC8vIGNjLmxvZyhgW1VJTWFuYWdlcl0gUmVxZXVzdCBPcGVuIFVJRm9ybSBhc3NldCAnJHt1aUZvcm1Bc3NldE5hbWV9JyB3aXRoIGdyb3VwICcke3VpR3JvdXBOYW1lfScgb24gcHJpb3JpdHkgJyR7cHJpb3JpdHl9JywgcGF1c2VDb3ZlcmVkVUlGb3JtOiAke3BhdXNlQ292ZXJlZFVJRm9ybX0sIHVzZXJEYXRhOiAke3VzZXJEYXRhfWApO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IHJlc291cmNlIG1hbmFnZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BVSUZvcm1IZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IFVJIGZvcm0gaGVscGVyIGZpcnN0LlwiKTtcbiAgICAgICAgICAgIGlmICghdWlGb3JtQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBhc3NldCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBpZiAoIXVpR3JvdXBOYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZ3JvdXAgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdmFyIHZfclVJR3JvdXAgPSB0aGlzLmdldFVJR3JvdXAodWlHcm91cE5hbWUpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9yVUlHcm91cCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVJIGdyb3VwICdcIiArIHVpR3JvdXBOYW1lICsgXCInIGlzIG5vdCBleGlzdC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdl9pU2VyaWFsSWQgPSArK3RoaXMubV9pU2VyaWFsSWQ7XG4gICAgICAgICAgICB2YXIgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3Q7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BJbnN0YW5jZVBvb2wuaGFzKHVpRm9ybUFzc2V0TmFtZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBHZXQgc3Bhd24uXG4gICAgICAgICAgICAgICAgdmFyIHZfcEluc3RhbmNlT2JqZWN0cyA9IHRoaXMubV9wSW5zdGFuY2VQb29sLmdldCh1aUZvcm1Bc3NldE5hbWUpO1xuICAgICAgICAgICAgICAgIGlmICh2X3BJbnN0YW5jZU9iamVjdHMgJiYgdl9wSW5zdGFuY2VPYmplY3RzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2X3BJbnN0YW5jZU9iamVjdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2X3BJbnN0YW5jZU9iamVjdHNbaV0uaXNWYWxpZCAmJiAhdl9wSW5zdGFuY2VPYmplY3RzW2ldLnNwYXduKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QgPSB2X3BJbnN0YW5jZU9iamVjdHNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3Quc3Bhd24gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQuaGFzKHZfaVNlcmlhbElkKSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiS2V5IGR1cGxpY2F0ZWQgd2l0aDogXCIgKyB2X2lTZXJpYWxJZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQuc2V0KHZfaVNlcmlhbElkLCB1aUZvcm1Bc3NldE5hbWUpO1xuICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBjYWxsIG9uIHJlc291cmNlIG1hbmFnZXIgdG8gbG9hZEFzc2V0LlxuICAgICAgICAgICAgICAgIHZhciB2X3JPcGVuVWlGb3JtSW5mbyA9IHtcbiAgICAgICAgICAgICAgICAgICAgc2VyaWFsSWQ6IHZfaVNlcmlhbElkLFxuICAgICAgICAgICAgICAgICAgICB1aUdyb3VwOiB2X3JVSUdyb3VwLFxuICAgICAgICAgICAgICAgICAgICBwYXVzZUNvdmVyZWRVSUZvcm06IHBhdXNlQ292ZXJlZFVJRm9ybSxcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGE6IHVzZXJEYXRhXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlci5sb2FkQXNzZXQodWlGb3JtQXNzZXROYW1lLCBwcmlvcml0eSwgdGhpcy5tX3BMb2FkQXNzZXRDYWxsYmFja3MsIHZfck9wZW5VaUZvcm1JbmZvKTtcbiAgICAgICAgICAgICAgICAvLyBsZXQgdl9mVGltZVN0YXJ0OiBudW1iZXIgPSBuZXcgRGF0ZSgpLnZhbHVlT2YoKTtcbiAgICAgICAgICAgICAgICAvLyBjYy5sb2FkZXIubG9hZFJlcyh1aUZvcm1Bc3NldE5hbWUsIGNjLkFzc2V0LCAoY29tcGxldGVDb3VudDogbnVtYmVyLCB0b3RhbENvdW50OiBudW1iZXIsIGl0ZW06IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIC8vIFByb2dyZXNzIHByb2Nlc3NpbmcgdXBkYXRlLlxuICAgICAgICAgICAgICAgIC8vIC8vIGNjLndhcm4oYGxvYWRpbmcgcHJvZ3Jlc3M6ICR7Y29tcGxldGVDb3VudH0vJHt0b3RhbENvdW50fSwgaXRlbTogJHtpdGVtfWApO1xuICAgICAgICAgICAgICAgIC8vIHRoaXMuZmlyZU9wZW5VSUZvcm1Qcm9ncmVzcyh1aUZvcm1Bc3NldE5hbWUsIGNvbXBsZXRlQ291bnQgLyB0b3RhbENvdW50LCB2X3JPcGVuVWlGb3JtSW5mbyk7XG4gICAgICAgICAgICAgICAgLy8gfSwgKGVycm9yOiBFcnJvciwgcmVzb3VyY2U6IG9iamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIGNjLndhcm4oYGxvYWRSZXMgY29tcGxldGUgd2l0aCBpbmZvOiAke3Zfck9wZW5VaUZvcm1JbmZvLnNlcmlhbElkfSwgJHt2X3JPcGVuVWlGb3JtSW5mby51aUdyb3VwLm5hbWV9LCAke3VpRm9ybUFzc2V0TmFtZX1gKTtcbiAgICAgICAgICAgICAgICAvLyAvLyBsb2FkIGNvbXBsZXRlZC5cbiAgICAgICAgICAgICAgICAvLyB0aGlzLmZpcmVPcGVuVUlGb3JtQ29tcGxldGUoZXJyb3IsIHVpRm9ybUFzc2V0TmFtZSwgcmVzb3VyY2UsIG5ldyBEYXRlKCkudmFsdWVPZigpIC0gdl9mVGltZVN0YXJ0LCB2X3JPcGVuVWlGb3JtSW5mbyk7XG4gICAgICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW5VSUZvcm1JbnRlcm5hbCh2X2lTZXJpYWxJZCwgdWlGb3JtQXNzZXROYW1lLCB2X3JVSUdyb3VwLCB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC50YXJnZXQsIHBhdXNlQ292ZXJlZFVJRm9ybSwgZmFsc2UsIDAsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2X2lTZXJpYWxJZDtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5pc0xvYWRpbmdVSUZvcm0gPSBmdW5jdGlvbiAoc2VyaWFsSWRPckFzc2V0TmFtZSkge1xuICAgICAgICAgICAgdmFyIGVfNCwgX2E7XG4gICAgICAgICAgICBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiBzZXJpYWxJZE9yQXNzZXROYW1lKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZC52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB1aUZvcm1Bc3NldE5hbWUgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1aUZvcm1Bc3NldE5hbWUgPT09IHNlcmlhbElkT3JBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVfNF8xKSB7IGVfNCA9IHsgZXJyb3I6IGVfNF8xIH07IH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNCkgdGhyb3cgZV80LmVycm9yOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZC5oYXMoc2VyaWFsSWRPckFzc2V0TmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUuZ2V0VUlGb3JtcyA9IGZ1bmN0aW9uICh1aUZvcm1Bc3NldE5hbWUpIHtcbiAgICAgICAgICAgIHZhciBlXzUsIF9hO1xuICAgICAgICAgICAgdmFyIHZfclJldCA9IFtdO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9yVUlHcm91cHMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB1aUdyb3VwID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChudWxsICE9IHVpR3JvdXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2X3BGb3JtcyA9IHVpR3JvdXAuZ2V0VUlGb3Jtcyh1aUZvcm1Bc3NldE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdl9yUmV0ID0gdl9yUmV0LmNvbmNhdCh2X3BGb3Jtcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV81XzEpIHsgZV81ID0geyBlcnJvcjogZV81XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNSkgdGhyb3cgZV81LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdl9yUmV0O1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmdldFVJRm9ybSA9IGZ1bmN0aW9uIChzZXJpYWxJZE9yQXNzZXROYW1lKSB7XG4gICAgICAgICAgICB2YXIgZV82LCBfYTtcbiAgICAgICAgICAgIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIHNlcmlhbElkT3JBc3NldE5hbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXNlcmlhbElkT3JBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBhc3NldCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdWlGb3JtO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9yVUlHcm91cHMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB1aUdyb3VwID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICgodWlGb3JtID0gdWlHcm91cC5nZXRVSUZvcm0oc2VyaWFsSWRPckFzc2V0TmFtZSkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdWlGb3JtO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfNl8xKSB7IGVfNiA9IHsgZXJyb3I6IGVfNl8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzYpIHRocm93IGVfNi5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUuaGFzVUlGb3JtID0gZnVuY3Rpb24gKHNlcmlhbElkT3JBc3NldE5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsICE9IHRoaXMuZ2V0VUlGb3JtKHNlcmlhbElkT3JBc3NldE5hbWUpO1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmNsb3NlVUlGb3JtID0gZnVuY3Rpb24gKHNlcmlhbElkT3JVaUZvcm0sIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdWlGb3JtID0gc2VyaWFsSWRPclVpRm9ybTtcbiAgICAgICAgICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIHNlcmlhbElkT3JVaUZvcm0pIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmdVSUZvcm0oc2VyaWFsSWRPclVpRm9ybSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3JVSUZvcm1zVG9SZWxlYXNlT25Mb2FkLmFkZChzZXJpYWxJZE9yVWlGb3JtKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQuZGVsZXRlKHNlcmlhbElkT3JVaUZvcm0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHVpRm9ybSA9IHRoaXMuZ2V0VUlGb3JtKHNlcmlhbElkT3JVaUZvcm0pO1xuICAgICAgICAgICAgICAgIGlmIChudWxsID09IHVpRm9ybSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGZpbmQgVUkgZm9ybSAnXCIgKyBzZXJpYWxJZE9yVWlGb3JtICsgXCInXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdWlGb3JtKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdmFyIHVpR3JvdXAgPSB1aUZvcm0udWlHcm91cDtcbiAgICAgICAgICAgIGlmIChudWxsID09IHVpR3JvdXApXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBncm91cCBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdXNlckRhdGEgPSB1c2VyRGF0YSB8fCBudWxsO1xuICAgICAgICAgICAgdWlHcm91cC5yZW1vdmVVSUZvcm0odWlGb3JtKTtcbiAgICAgICAgICAgIHVpRm9ybS5vbkNsb3NlKHRoaXMubV9iSXNTaHV0ZG93biwgdXNlckRhdGEpO1xuICAgICAgICAgICAgdWlHcm91cC5yZWZyZXNoKCk7XG4gICAgICAgICAgICB2YXIgZXZlbnRBcmdzID0ge1xuICAgICAgICAgICAgICAgIHNlcmlhbElkOiB1aUZvcm0uc2VyaWFsSWQsXG4gICAgICAgICAgICAgICAgdWlHcm91cDogdWlHcm91cCxcbiAgICAgICAgICAgICAgICB1aUZvcm1Bc3NldE5hbWU6IHVpRm9ybS51aUZvcm1Bc3NldE5hbWUsXG4gICAgICAgICAgICAgICAgdXNlckRhdGE6IHVzZXJEYXRhXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5tX3BDbG9zZVVJRm9ybUNvbXBsZXRlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oZXZlbnRBcmdzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5tX3BSZWN5Y2xlUXVldWUucHVzaCh1aUZvcm0pO1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmdldEFsbExvYWRlZFVJRm9ybXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZV83LCBfYTtcbiAgICAgICAgICAgIHZhciB2X3BSZXQgPSBbXTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fclVJR3JvdXBzLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdWlHcm91cCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB2X3BSZXQuY29uY2F0KHVpR3JvdXAuZ2V0QWxsVUlGb3JtcygpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV83XzEpIHsgZV83ID0geyBlcnJvcjogZV83XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNykgdGhyb3cgZV83LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdl9wUmV0O1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmNsb3NlQWxsTG9hZGVkVUlGb3JtcyA9IGZ1bmN0aW9uICh1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIGVfOCwgX2E7XG4gICAgICAgICAgICB2YXIgdl9wVUlGb3JtcyA9IHRoaXMuZ2V0QWxsTG9hZGVkVUlGb3JtcygpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB2X3BVSUZvcm1zXzEgPSBfX3ZhbHVlcyh2X3BVSUZvcm1zKSwgdl9wVUlGb3Jtc18xXzEgPSB2X3BVSUZvcm1zXzEubmV4dCgpOyAhdl9wVUlGb3Jtc18xXzEuZG9uZTsgdl9wVUlGb3Jtc18xXzEgPSB2X3BVSUZvcm1zXzEubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB1aUZvcm0gPSB2X3BVSUZvcm1zXzFfMS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmhhc1VJRm9ybSh1aUZvcm0uc2VyaWFsSWQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VVSUZvcm0odWlGb3JtLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfOF8xKSB7IGVfOCA9IHsgZXJyb3I6IGVfOF8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2X3BVSUZvcm1zXzFfMSAmJiAhdl9wVUlGb3Jtc18xXzEuZG9uZSAmJiAoX2EgPSB2X3BVSUZvcm1zXzEucmV0dXJuKSkgX2EuY2FsbCh2X3BVSUZvcm1zXzEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfOCkgdGhyb3cgZV84LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUuY2xvc2VBbGxMb2FkaW5nVUlGb3JtcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBlXzksIF9hO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkLmtleXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlcmlhbElkID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZC5hZGQoc2VyaWFsSWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzlfMSkgeyBlXzkgPSB7IGVycm9yOiBlXzlfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV85KSB0aHJvdyBlXzkuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkLmNsZWFyKCk7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUucmVmb2N1c1VJRm9ybSA9IGZ1bmN0aW9uICh1aUZvcm0sIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB1aUZvcm0pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB2YXIgdWlHcm91cCA9IHVpRm9ybS51aUdyb3VwO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdWlHcm91cClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGdyb3VwIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB1c2VyRGF0YSA9IHVzZXJEYXRhIHx8IG51bGw7XG4gICAgICAgICAgICB1aUdyb3VwLnJlZm9jdXNVSUZvcm0odWlGb3JtLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICB1aUdyb3VwLnJlZnJlc2goKTtcbiAgICAgICAgICAgIHVpRm9ybS5vblJlZm9jdXModXNlckRhdGEpO1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmhhc1VJR3JvdXAgPSBmdW5jdGlvbiAodWlHcm91cE5hbWUpIHtcbiAgICAgICAgICAgIGlmICghdWlHcm91cE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBncm91cCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3JVSUdyb3Vwcy5oYXModWlHcm91cE5hbWUpO1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmdldFVJR3JvdXAgPSBmdW5jdGlvbiAodWlHcm91cE5hbWUpIHtcbiAgICAgICAgICAgIGlmICghdWlHcm91cE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBncm91cCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3JVSUdyb3Vwcy5nZXQodWlHcm91cE5hbWUpIHx8IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUuYWRkVUlHcm91cCA9IGZ1bmN0aW9uICh1aUdyb3VwTmFtZSwgYXJnMSwgYXJnMikge1xuICAgICAgICAgICAgaWYgKCF1aUdyb3VwTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGdyb3VwIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHZhciB1aUdyb3VwRGVwdGggPSAwO1xuICAgICAgICAgICAgdmFyIHVpR3JvdXBIZWxwZXI7XG4gICAgICAgICAgICBpZiAoJ251bWJlcicgPT09IHR5cGVvZiBhcmcxKSB7XG4gICAgICAgICAgICAgICAgdWlHcm91cERlcHRoID0gYXJnMTtcbiAgICAgICAgICAgICAgICBpZiAodW5kZWZpbmVkICE9IGFyZzIpIHtcbiAgICAgICAgICAgICAgICAgICAgdWlHcm91cEhlbHBlciA9IGFyZzI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdWlHcm91cEhlbHBlciA9IGFyZzE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXVpR3JvdXBIZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBncm91cCBoZWxwZXIgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc1VJR3JvdXAodWlHcm91cE5hbWUpKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubV9yVUlHcm91cHMuc2V0KHVpR3JvdXBOYW1lLCBuZXcgVUlHcm91cCh1aUdyb3VwTmFtZSwgdWlHcm91cERlcHRoLCB1aUdyb3VwSGVscGVyKSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5vcGVuVUlGb3JtSW50ZXJuYWwgPSBmdW5jdGlvbiAoc2VyaWFsSWQsIHVpRm9ybUFzc2V0TmFtZSwgdWlHcm91cCwgdWlGb3JtSW5zdGFuY2UsIHBhdXNlQ292ZXJlZFVJRm9ybSwgaXNOZXdJbnN0YW5jZSwgZHVyYXRpb24sIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdWlGb3JtID0gdGhpcy5tX3BVSUZvcm1IZWxwZXIuY3JlYXRlVUlGb3JtKHVpRm9ybUluc3RhbmNlLCB1aUdyb3VwLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB1aUZvcm0pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW4gbm90IGNyZWF0ZSBVSSBmb3JtIGluIGhlbHBlci4nKTtcbiAgICAgICAgICAgIHVpRm9ybS5vbkluaXQoc2VyaWFsSWQsIHVpRm9ybUFzc2V0TmFtZSwgdWlHcm91cCwgcGF1c2VDb3ZlcmVkVUlGb3JtLCBpc05ld0luc3RhbmNlLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICB1aUdyb3VwLmFkZFVJRm9ybSh1aUZvcm0pO1xuICAgICAgICAgICAgdWlGb3JtLm9uT3Blbih1c2VyRGF0YSk7XG4gICAgICAgICAgICB1aUdyb3VwLnJlZnJlc2goKTtcbiAgICAgICAgICAgIHZhciBldmVudEFyZ3MgPSB7XG4gICAgICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uLFxuICAgICAgICAgICAgICAgIHVpRm9ybTogdWlGb3JtLFxuICAgICAgICAgICAgICAgIHVzZXJEYXRhOiB1c2VyRGF0YVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMubV9wT3BlblVJRm9ybVN1Y2Nlc3NEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2tGbihldmVudEFyZ3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUubG9hZFVJRm9ybVN1Y2Nlc3NDYWxsYmFjayA9IGZ1bmN0aW9uICh1aUZvcm1Bc3NldE5hbWUsIHVpRm9ybUFzc2V0LCBkdXJhdGlvbiwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk9wZW4gVUkgZm9ybSBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZC5oYXModl9wSW5mby5zZXJpYWxJZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNUb1JlbGVhc2VPbkxvYWQuZGVsZXRlKHZfcEluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wVUlGb3JtSGVscGVyLnJlbGVhc2VVSUZvcm0odWlGb3JtQXNzZXQsIG51bGwpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkLmRlbGV0ZSh2X3BJbmZvLnNlcmlhbElkKTtcbiAgICAgICAgICAgIHZhciB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdCA9IFVJRm9ybUluc3RhbmNlT2JqZWN0LmNyZWF0ZSh1aUZvcm1Bc3NldE5hbWUsIHVpRm9ybUFzc2V0LCB0aGlzLm1fcFVJRm9ybUhlbHBlci5pbnN0YW50aWF0ZVVJRm9ybSh1aUZvcm1Bc3NldCksIHRoaXMubV9wVUlGb3JtSGVscGVyKTtcbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIHRvIHBvb2wgYW5kIG1hcmsgc3Bhd24gZmxhZy5cbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BJbnN0YW5jZVBvb2wuaGFzKHVpRm9ybUFzc2V0TmFtZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEluc3RhbmNlUG9vbC5zZXQodWlGb3JtQXNzZXROYW1lLCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdl9wSW5zdGFuY2VPYmplY3RzID0gdGhpcy5tX3BJbnN0YW5jZVBvb2wuZ2V0KHVpRm9ybUFzc2V0TmFtZSk7XG4gICAgICAgICAgICBpZiAodl9wSW5zdGFuY2VPYmplY3RzICYmIHZfcEluc3RhbmNlT2JqZWN0cy5sZW5ndGggPCB0aGlzLm1fdUluc3RhbmNlQ2FwYWNpdHkpIHtcbiAgICAgICAgICAgICAgICB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC5zcGF3biA9IHRydWU7XG4gICAgICAgICAgICAgICAgdl9wSW5zdGFuY2VPYmplY3RzLnB1c2godl9wVWlGb3JtSW5zdGFuY2VPYmplY3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vcGVuVUlGb3JtSW50ZXJuYWwodl9wSW5mby5zZXJpYWxJZCwgdWlGb3JtQXNzZXROYW1lLCB2X3BJbmZvLnVpR3JvdXAsIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LnRhcmdldCwgdl9wSW5mby5wYXVzZUNvdmVyZWRVSUZvcm0sIHRydWUsIGR1cmF0aW9uLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5sb2FkVUlGb3JtRmFpbHVyZUNhbGxiYWNrID0gZnVuY3Rpb24gKHVpRm9ybUFzc2V0TmFtZSwgc3RhdHVzLCBlcnJvck1lc3NhZ2UsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wSW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJPcGVuIFVJIGZvcm0gaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fclVJRm9ybXNUb1JlbGVhc2VPbkxvYWQuaGFzKHZfcEluZm8uc2VyaWFsSWQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3JVSUZvcm1zVG9SZWxlYXNlT25Mb2FkLmRlbGV0ZSh2X3BJbmZvLnNlcmlhbElkKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZC5kZWxldGUodl9wSW5mby5zZXJpYWxJZCk7XG4gICAgICAgICAgICB2YXIgYXBwZW5kRXJyb3JNZXNzYWdlID0gXCJMb2FkIFVJIGZvcm0gZmFpbHVyZSwgYXNzZXQgbmFtZSAnXCIgKyB1aUZvcm1Bc3NldE5hbWUgKyBcIicsIHN0YXR1cyAnXCIgKyBzdGF0dXMudG9TdHJpbmcoKSArIFwiJywgZXJyb3IgbWVzc2FnZSAnXCIgKyBlcnJvck1lc3NhZ2UgKyBcIicuXCI7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BPcGVuVUlGb3JtRmFpbHVyZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnRBcmdzXzEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHNlcmlhbElkOiB2X3BJbmZvLnNlcmlhbElkLFxuICAgICAgICAgICAgICAgICAgICB1aUZvcm1Bc3NldE5hbWU6IHVpRm9ybUFzc2V0TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdWlHcm91cE5hbWU6IHZfcEluZm8udWlHcm91cC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGFwcGVuZEVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgcGF1c2VDb3ZlcmVkVUlGb3JtOiB2X3BJbmZvLnBhdXNlQ292ZXJlZFVJRm9ybSxcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGE6IHZfcEluZm8udXNlckRhdGFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMubV9wT3BlblVJRm9ybUZhaWx1cmVEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oZXZlbnRBcmdzXzEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihhcHBlbmRFcnJvck1lc3NhZ2UpO1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmxvYWRVSUZvcm1VcGRhdGVDYWxsYmFjayA9IGZ1bmN0aW9uICh1aUZvcm1Bc3NldE5hbWUsIHByb2dyZXNzLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcEluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiT3BlbiBVSSBmb3JtIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BPcGVuVUlGb3JtVXBkYXRlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHZhciBldmVudEFyZ3NfMiA9IHtcbiAgICAgICAgICAgICAgICAgICAgc2VyaWFsSWQ6IHZfcEluZm8uc2VyaWFsSWQsXG4gICAgICAgICAgICAgICAgICAgIHVpRm9ybUFzc2V0TmFtZTogdWlGb3JtQXNzZXROYW1lLFxuICAgICAgICAgICAgICAgICAgICB1aUdyb3VwTmFtZTogdl9wSW5mby51aUdyb3VwLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzOiBwcm9ncmVzcyxcbiAgICAgICAgICAgICAgICAgICAgcGF1c2VDb3ZlcmVkVUlGb3JtOiB2X3BJbmZvLnBhdXNlQ292ZXJlZFVJRm9ybSxcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGE6IHZfcEluZm8udXNlckRhdGFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMubV9wT3BlblVJRm9ybVVwZGF0ZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihldmVudEFyZ3NfMik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUubG9hZFVJRm9ybURlcGVuZGVuY3lBc3NldENhbGxiYWNrID0gZnVuY3Rpb24gKHVpRm9ybUFzc2V0TmFtZSwgZGVwZW5kZW5jeUFzc2V0TmFtZSwgbG9hZGVkQ291bnQsIHRvdGFsQ291bnQsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wSW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJPcGVuIFVJIGZvcm0gaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcE9wZW5VSUZvcm1EZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50QXJnc18zID0ge1xuICAgICAgICAgICAgICAgICAgICBzZXJpYWxJZDogdl9wSW5mby5zZXJpYWxJZCxcbiAgICAgICAgICAgICAgICAgICAgdWlGb3JtQXNzZXROYW1lOiB1aUZvcm1Bc3NldE5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHVpR3JvdXBOYW1lOiB2X3BJbmZvLnVpR3JvdXAubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgZGVwZW5kZW5jeUFzc2V0TmFtZTogZGVwZW5kZW5jeUFzc2V0TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVkQ291bnQ6IGxvYWRlZENvdW50LFxuICAgICAgICAgICAgICAgICAgICB0b3RhbENvdW50OiB0b3RhbENvdW50LFxuICAgICAgICAgICAgICAgICAgICBwYXVzZUNvdmVyZWRVSUZvcm06IHZfcEluZm8ucGF1c2VDb3ZlcmVkVUlGb3JtLFxuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YTogdl9wSW5mby51c2VyRGF0YVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BPcGVuVUlGb3JtRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGV2ZW50QXJnc18zKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFVJTWFuYWdlcjtcbiAgICB9KEJhc2VfMS5GcmFtZXdvcmtNb2R1bGUpKTsgLy8gY2xhc3MgVUlNYW5hZ2VyXG4gICAgZXhwb3J0cy5VSU1hbmFnZXIgPSBVSU1hbmFnZXI7XG4gICAgdmFyIFVJRm9ybUluc3RhbmNlT2JqZWN0ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBVSUZvcm1JbnN0YW5jZU9iamVjdCgpIHtcbiAgICAgICAgICAgIHRoaXMuaXNWYWxpZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnNwYXduID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgVUlGb3JtSW5zdGFuY2VPYmplY3QuY3JlYXRlID0gZnVuY3Rpb24gKG5hbWUsIHVpRm9ybUFzc2V0LCB1aUZvcm1JbnN0YW5jZSwgdWlGb3JtSGVscGVyKSB7XG4gICAgICAgICAgICBpZiAoIXVpRm9ybUFzc2V0KVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBhc3NldCBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgaWYgKCF1aUZvcm1IZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGhlbHBlciBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdmFyIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0ID0gbmV3IFVJRm9ybUluc3RhbmNlT2JqZWN0KCk7XG4gICAgICAgICAgICB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC5uYW1lID0gbmFtZTtcbiAgICAgICAgICAgIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LnRhcmdldCA9IHVpRm9ybUluc3RhbmNlO1xuICAgICAgICAgICAgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QubV9wVUlGb3JtQXNzZXQgPSB1aUZvcm1Bc3NldDtcbiAgICAgICAgICAgIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0Lm1fcFVJRm9ybUhlbHBlciA9IHVpRm9ybUhlbHBlcjtcbiAgICAgICAgICAgIHJldHVybiB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdDtcbiAgICAgICAgfTtcbiAgICAgICAgVUlGb3JtSW5zdGFuY2VPYmplY3QucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1Bc3NldCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUhlbHBlciA9IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIFVJRm9ybUluc3RhbmNlT2JqZWN0LnByb3RvdHlwZS5yZWxlYXNlID0gZnVuY3Rpb24gKHNodXRkb3duKSB7XG4gICAgICAgICAgICBzaHV0ZG93biA9IHNodXRkb3duIHx8IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5pc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BVSUZvcm1IZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1IZWxwZXIucmVsZWFzZVVJRm9ybSh0aGlzLm1fcFVJRm9ybUFzc2V0LCB0aGlzLnRhcmdldCk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBVSUZvcm1JbnN0YW5jZU9iamVjdDtcbiAgICB9KCkpOyAvLyBjbGFzcyBVSUZvcm1JbnN0YW5jZU9iamVjdFxuICAgIHZhciBVSUdyb3VwID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBVSUdyb3VwKG5hbWUsIGRlcHRoLCBoZWxwZXIpIHtcbiAgICAgICAgICAgIHRoaXMubV9pRGVwdGggPSAwO1xuICAgICAgICAgICAgdGhpcy5tX2JQYXVzZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1JbmZvcyA9IFtdO1xuICAgICAgICAgICAgaWYgKCFuYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZ3JvdXAgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgaWYgKCFoZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBncm91cCBoZWxwZXIgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHRoaXMubV9zTmFtZSA9IG5hbWU7XG4gICAgICAgICAgICB0aGlzLm1fYlBhdXNlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmhlbHBlciA9IGhlbHBlcjtcbiAgICAgICAgICAgIHRoaXMuZGVwdGggPSBkZXB0aDtcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlHcm91cC5wcm90b3R5cGUsIFwibmFtZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9zTmFtZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSUdyb3VwLnByb3RvdHlwZSwgXCJkZXB0aFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9pRGVwdGg7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSB0aGlzLm1faURlcHRoKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgdGhpcy5tX2lEZXB0aCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMuaGVscGVyLnNldERlcHRoKHRoaXMubV9pRGVwdGgpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSUdyb3VwLnByb3RvdHlwZSwgXCJwYXVzZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9iUGF1c2U7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fYlBhdXNlID09IHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgdGhpcy5tX2JQYXVzZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSUdyb3VwLnByb3RvdHlwZSwgXCJ1aUZvcm1Db3VudFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BVSUZvcm1JbmZvcy5sZW5ndGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJR3JvdXAucHJvdG90eXBlLCBcImN1cnJlbnRVSUZvcm1cIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wVUlGb3JtSW5mb3MubGVuZ3RoID4gMCA/IHRoaXMubV9wVUlGb3JtSW5mb3NbMF0udWlGb3JtIDogbnVsbDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBVSUdyb3VwLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIHZhciBlXzEwLCBfYTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFVJRm9ybUluZm9zKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5mbyA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5mby5wYXVzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGluZm8udWlGb3JtLm9uVXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xMF8xKSB7IGVfMTAgPSB7IGVycm9yOiBlXzEwXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMTApIHRocm93IGVfMTAuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgVUlHcm91cC5wcm90b3R5cGUuYWRkVUlGb3JtID0gZnVuY3Rpb24gKHVpRm9ybSkge1xuICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1JbmZvcy51bnNoaWZ0KHtcbiAgICAgICAgICAgICAgICB1aUZvcm06IHVpRm9ybSxcbiAgICAgICAgICAgICAgICBjb3ZlcmVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIHBhdXNlZDogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIFVJR3JvdXAucHJvdG90eXBlLnJlbW92ZVVJRm9ybSA9IGZ1bmN0aW9uICh1aUZvcm0pIHtcbiAgICAgICAgICAgIHZhciB2X3VJZHggPSAtMTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tX3BVSUZvcm1JbmZvcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fcFVJRm9ybUluZm9zW2ldLnVpRm9ybSA9PSB1aUZvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgdl91SWR4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHZfdUlkeCA9PSAtMSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGZpbmQgVUkgZm9ybSBpbmZvIGZvciBzZXJpYWwgaWQgJ1wiICsgdWlGb3JtLnNlcmlhbElkICsgXCInLCBVSSBmb3JtIGFzc2V0IG5hbWUgaXMgJ1wiICsgdWlGb3JtLnVpRm9ybUFzc2V0TmFtZSArIFwiJy5cIik7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHRoaXMubV9wVUlGb3JtSW5mb3Nbdl91SWR4XTtcbiAgICAgICAgICAgIGlmICghdl9wSW5mby5jb3ZlcmVkKSB7XG4gICAgICAgICAgICAgICAgdl9wSW5mby5jb3ZlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB1aUZvcm0ub25Db3ZlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF2X3BJbmZvLnBhdXNlZCkge1xuICAgICAgICAgICAgICAgIHZfcEluZm8ucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB1aUZvcm0ub25QYXVzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1JbmZvcy5zcGxpY2Uodl91SWR4LCAxKTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlHcm91cC5wcm90b3R5cGUuaGFzVUlGb3JtID0gZnVuY3Rpb24gKGlkT3JBc3NldE5hbWUpIHtcbiAgICAgICAgICAgIHZhciBlXzExLCBfYTtcbiAgICAgICAgICAgIHZhciBzdWJQcm9wTmFtZSA9ICdzZXJpYWxJZCc7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGlkT3JBc3NldE5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpZE9yQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGZvcm0gYXNzZXQgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgICAgIHN1YlByb3BOYW1lID0gJ3VpRm9ybUFzc2V0TmFtZSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BVSUZvcm1JbmZvcyksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZm8gPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZm8udWlGb3JtW3N1YlByb3BOYW1lXSA9PT0gaWRPckFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzExXzEpIHsgZV8xMSA9IHsgZXJyb3I6IGVfMTFfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xMSkgdGhyb3cgZV8xMS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBVSUdyb3VwLnByb3RvdHlwZS5nZXRVSUZvcm0gPSBmdW5jdGlvbiAoaWRPckFzc2V0TmFtZSkge1xuICAgICAgICAgICAgdmFyIGVfMTIsIF9hO1xuICAgICAgICAgICAgdmFyIHN1YlByb3BOYW1lID0gJ3NlcmlhbElkJztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaWRPckFzc2V0TmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlkT3JBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBhc3NldCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICAgICAgc3ViUHJvcE5hbWUgPSAndWlGb3JtQXNzZXROYW1lJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFVJRm9ybUluZm9zKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5mbyA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5mby51aUZvcm1bc3ViUHJvcE5hbWVdID09PSBpZE9yQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGluZm8udWlGb3JtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzEyXzEpIHsgZV8xMiA9IHsgZXJyb3I6IGVfMTJfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xMikgdGhyb3cgZV8xMi5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIFVJR3JvdXAucHJvdG90eXBlLmdldFVJRm9ybXMgPSBmdW5jdGlvbiAoYXNzZXROYW1lKSB7XG4gICAgICAgICAgICB2YXIgZV8xMywgX2E7XG4gICAgICAgICAgICBpZiAoIWFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGZvcm0gYXNzZXQgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdmFyIHZfcFJldCA9IFtdO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wVUlGb3JtSW5mb3MudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUudWlGb3JtLnVpRm9ybUFzc2V0TmFtZSA9PT0gYXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgdl9wUmV0LnB1c2godmFsdWUudWlGb3JtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xM18xKSB7IGVfMTMgPSB7IGVycm9yOiBlXzEzXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMTMpIHRocm93IGVfMTMuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2X3BSZXQ7XG4gICAgICAgIH07XG4gICAgICAgIFVJR3JvdXAucHJvdG90eXBlLmdldEFsbFVJRm9ybXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BVSUZvcm1JbmZvcy5tYXAoZnVuY3Rpb24gKGluZm8pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5mby51aUZvcm07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlHcm91cC5wcm90b3R5cGUucmVmb2N1c1VJRm9ybSA9IGZ1bmN0aW9uICh1aUZvcm0sIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl91SWR4ID0gLTE7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubV9wVUlGb3JtSW5mb3MubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tX3BVSUZvcm1JbmZvc1tpXS51aUZvcm0gPT0gdWlGb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgIHZfdUlkeCA9IGk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh2X3VJZHggPT0gLTEpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuIG5vdCBmaW5kIFVJIGZvcm0gaW5mbyBmb3Igc2VyaWFsIGlkICdcIiArIHVpRm9ybS5zZXJpYWxJZCArIFwiJywgVUkgZm9ybSBhc3NldCBuYW1lIGlzICdcIiArIHVpRm9ybS51aUZvcm1Bc3NldE5hbWUgKyBcIicuXCIpO1xuICAgICAgICAgICAgaWYgKHZfdUlkeCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1JbmZvcy5zcGxpY2Uodl91SWR4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdGhpcy5tX3BVSUZvcm1JbmZvc1t2X3VJZHhdO1xuICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1JbmZvcy51bnNoaWZ0KHZfcEluZm8pO1xuICAgICAgICB9O1xuICAgICAgICBVSUdyb3VwLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfMTQsIF9hO1xuICAgICAgICAgICAgdmFyIHZfYlBhdXNlID0gdGhpcy5wYXVzZTtcbiAgICAgICAgICAgIHZhciB2X2JDb3ZlciA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIHZfaURlcHRoID0gdGhpcy51aUZvcm1Db3VudDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFVJRm9ybUluZm9zKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5mbyA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAobnVsbCA9PSBpbmZvKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBpZiAodl9iUGF1c2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaW5mby5jb3ZlcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5jb3ZlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLnVpRm9ybS5vbkNvdmVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWluZm8ucGF1c2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5wYXVzZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8udWlGb3JtLm9uUGF1c2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmZvLnBhdXNlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8ucGF1c2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby51aUZvcm0ub25SZXN1bWUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmZvLnVpRm9ybS5wYXVzZUNvdmVyZWRVSUZvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2X2JQYXVzZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodl9iQ292ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWluZm8uY292ZXJlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLmNvdmVyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLnVpRm9ybS5vbkNvdmVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZm8uY292ZXJlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLmNvdmVyZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby51aUZvcm0ub25SZXZlYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdl9iQ292ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMTRfMSkgeyBlXzE0ID0geyBlcnJvcjogZV8xNF8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzE0KSB0aHJvdyBlXzE0LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBVSUdyb3VwO1xuICAgIH0oKSk7IC8vIGNsYXNzIFVJR3JvdXBcbiAgICBleHBvcnRzLlVJR3JvdXAgPSBVSUdyb3VwO1xufSk7XG4iLCIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgdmFyIGdsb2JhbCA9IGdsb2JhbCB8fCB7fTtcbiAgICB2YXIgdl9wR2xvYmFsID0gJ3VuZGVmaW5lZCcgPT0gdHlwZW9mIHdpbmRvdyA/IGdsb2JhbCA6IHdpbmRvdztcbiAgICB2YXIgYXRzZnJhbWV3b3JrID0gdl9wR2xvYmFsLmF0c2ZyYW1ld29yayB8fCB7fTtcbiAgICBmdW5jdGlvbiBleHBvc2UobSkge1xuICAgICAgICBmb3IgKHZhciBrIGluIG0pIHtcbiAgICAgICAgICAgIGF0c2ZyYW1ld29ya1trXSA9IG1ba107XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXhwb3NlKHJlcXVpcmUoJy4vQmFzZScpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vQ29uZmlnXCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vRGF0YU5vZGVcIikpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9Gc21cIikpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9SZXNvdXJjZVwiKSk7XG4gICAgZXhwb3NlKHJlcXVpcmUoXCIuL0V2ZW50XCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vUHJvY2VkdXJlXCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vVUlcIikpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9TY2VuZVwiKSk7XG4gICAgdl9wR2xvYmFsLmF0c2ZyYW1ld29yayA9IGF0c2ZyYW1ld29yaztcbiAgICBleHBvcnRzLmRlZmF1bHQgPSBhdHNmcmFtZXdvcms7XG59KTtcbiJdfQ==
