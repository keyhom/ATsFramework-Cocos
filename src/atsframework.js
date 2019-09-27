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

},{"./Base":1}],11:[function(require,module,exports){
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
    expose(require("./Sound"));
    expose(require("./Scene"));
    v_pGlobal.atsframework = atsframework;
    exports.default = atsframework;
});

},{"./Base":1,"./Config":2,"./DataNode":3,"./Event":4,"./Fsm":5,"./Procedure":6,"./Resource":7,"./Scene":8,"./Sound":9,"./UI":10}]},{},[11])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIkJhc2UuanMiLCJDb25maWcuanMiLCJEYXRhTm9kZS5qcyIsIkV2ZW50LmpzIiwiRnNtLmpzIiwiUHJvY2VkdXJlLmpzIiwiUmVzb3VyY2UuanMiLCJTY2VuZS5qcyIsIlNvdW5kLmpzIiwiVUkuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcmRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3p6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdjRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgLyoqXG4gICAgICogTG9hZCB0eXBlLlxuICAgICAqL1xuICAgIHZhciBMb2FkVHlwZTtcbiAgICAoZnVuY3Rpb24gKExvYWRUeXBlKSB7XG4gICAgICAgIExvYWRUeXBlW0xvYWRUeXBlW1wiVGV4dFwiXSA9IDBdID0gXCJUZXh0XCI7XG4gICAgICAgIExvYWRUeXBlW0xvYWRUeXBlW1wiQnl0ZXNcIl0gPSAxXSA9IFwiQnl0ZXNcIjtcbiAgICAgICAgTG9hZFR5cGVbTG9hZFR5cGVbXCJTdHJlYW1cIl0gPSAyXSA9IFwiU3RyZWFtXCI7XG4gICAgfSkoTG9hZFR5cGUgPSBleHBvcnRzLkxvYWRUeXBlIHx8IChleHBvcnRzLkxvYWRUeXBlID0ge30pKTtcbiAgICA7XG4gICAgdmFyIGdfcE1vZHVsZXMgPSBbXTtcbiAgICAvKipcbiAgICAgKiBBbiBldmVudCBoYW5kbGVyIG1ha2Ugc2ltaWxhciB3aXRoIGV2ZW50IGRlbGVnYXRlIG1vZGUuXG4gICAgICovXG4gICAgdmFyIEV2ZW50SGFuZGxlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gRXZlbnRIYW5kbGVyKCkge1xuICAgICAgICB9XG4gICAgICAgIEV2ZW50SGFuZGxlci5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gKGZuLCB0YXJnZXQpIHtcbiAgICAgICAgICAgIGlmIChudWxsICE9IHRoaXMubV9wSGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BIYW5kbGVycy5zb21lKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdl9iUmV0ID0gdmFsdWVbMV0gPT0gZm47XG4gICAgICAgICAgICAgICAgICAgIGlmICh2X2JSZXQgJiYgdW5kZWZpbmVkICE9IHRhcmdldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdl9iUmV0ID0gdmFsdWVbMF0gPT0gdGFyZ2V0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2X2JSZXQ7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIEV2ZW50SGFuZGxlci5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKGZuLCB0YXJnZXQpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMubV9wSGFuZGxlcnMpXG4gICAgICAgICAgICAgICAgdGhpcy5tX3BIYW5kbGVycyA9IFtdO1xuICAgICAgICAgICAgaWYgKHRoaXMuaGFzKGZuLCB0YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRHVwbGljYXRlZCBhZGQgZXZlbnQgaGFuZGxlciAnXCIgKyBmbiArIFwiJ1wiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcEhhbmRsZXJzLnB1c2goW3RhcmdldCwgZm4sIGZhbHNlXSk7XG4gICAgICAgIH07XG4gICAgICAgIEV2ZW50SGFuZGxlci5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKGZuLCB0YXJnZXQpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pc1ZhbGlkKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tX3BIYW5kbGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciB2X3BUdXBsZSA9IHRoaXMubV9wSGFuZGxlcnNbaV07XG4gICAgICAgICAgICAgICAgaWYgKHVuZGVmaW5lZCA9PSB0YXJnZXQgJiYgdl9wVHVwbGVbMV0gPT0gZm4pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BIYW5kbGVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh1bmRlZmluZWQgIT0gdGFyZ2V0ICYmIHZfcFR1cGxlWzBdID09IHRhcmdldCAmJiB2X3BUdXBsZVsxXSA9PSBmbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcEhhbmRsZXJzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBFdmVudEhhbmRsZXIucHJvdG90eXBlLml0ZXIgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pc1ZhbGlkKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMubV9wSGFuZGxlcnMuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2FsbGJhY2tGbiA9IHZhbHVlWzFdO1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZVswXSAhPSB1bmRlZmluZWQgJiYgY2FsbGJhY2tGbiBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4gPSBjYWxsYmFja0ZuLmJpbmQodmFsdWVbMF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmbihjYWxsYmFja0ZuKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBFdmVudEhhbmRsZXIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5pc1ZhbGlkICYmIHRoaXMubV9wSGFuZGxlcnMuc3BsaWNlKDAsIHRoaXMubV9wSGFuZGxlcnMubGVuZ3RoKTtcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEV2ZW50SGFuZGxlci5wcm90b3R5cGUsIFwiaXNWYWxpZFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BIYW5kbGVycyAmJiB0aGlzLm1fcEhhbmRsZXJzLmxlbmd0aCA+IDA7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEV2ZW50SGFuZGxlci5wcm90b3R5cGUsIFwic2l6ZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BIYW5kbGVycy5sZW5ndGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIEV2ZW50SGFuZGxlcjtcbiAgICB9KCkpOyAvLyBjbGFzcyBFdmVudEhhbmRsZXJcbiAgICBleHBvcnRzLkV2ZW50SGFuZGxlciA9IEV2ZW50SGFuZGxlcjtcbiAgICB2YXIgRnJhbWV3b3JrTW9kdWxlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBGcmFtZXdvcmtNb2R1bGUoKSB7XG4gICAgICAgICAgICB0aGlzLm1faVByaW9yaXR5ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBGcmFtZXdvcmtNb2R1bGUuZ2V0TW9kdWxlID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ19wTW9kdWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBtID0gZ19wTW9kdWxlc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAobSBpbnN0YW5jZW9mIHR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIEZyYW1ld29ya01vZHVsZS5nZXRPckFkZE1vZHVsZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICB2YXIgdl9wTW9kdWxlID0gdGhpcy5nZXRNb2R1bGUodHlwZSk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BNb2R1bGUpIHtcbiAgICAgICAgICAgICAgICB2X3BNb2R1bGUgPSBuZXcgdHlwZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkTW9kdWxlKHZfcE1vZHVsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdl9wTW9kdWxlO1xuICAgICAgICB9O1xuICAgICAgICBGcmFtZXdvcmtNb2R1bGUuYWRkTW9kdWxlID0gZnVuY3Rpb24gKG1vZHVsZSkge1xuICAgICAgICAgICAgdmFyIG0gPSB0aGlzLmdldE1vZHVsZShtb2R1bGUuY29uc3RydWN0b3IpO1xuICAgICAgICAgICAgaWYgKG0pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRHVwbGljYXRlZCBhZGRpbmcgZnJhbWV3b3JrIG1vZHVsZTogXCIgKyB0eXBlb2YgbW9kdWxlKTsgLy8gRklYTUU6IERldGVjdGluZyBob3cgdG8gZ2V0IHRoZSBjbGFzcyBuYW1lLlxuICAgICAgICAgICAgZ19wTW9kdWxlcy5wdXNoKG1vZHVsZSk7XG4gICAgICAgICAgICBnX3BNb2R1bGVzID0gZ19wTW9kdWxlcy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGEubV9pUHJpb3JpdHkgPiBiLm1faVByaW9yaXR5KVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoYS5tX2lQcmlvcml0eSA8IGIubV9pUHJpb3JpdHkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIEZyYW1ld29ya01vZHVsZS5yZW1vdmVNb2R1bGUgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnX3BNb2R1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZfcE1vZHVsZSA9IGdfcE1vZHVsZXNbaV07XG4gICAgICAgICAgICAgICAgaWYgKHZfcE1vZHVsZSAmJiB2X3BNb2R1bGUgaW5zdGFuY2VvZiB0eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGdfcE1vZHVsZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdl9wTW9kdWxlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBGcmFtZXdvcmtNb2R1bGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdfcE1vZHVsZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wTW9kdWxlID0gZ19wTW9kdWxlc1tpXTtcbiAgICAgICAgICAgICAgICB2X3BNb2R1bGUudXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRnJhbWV3b3JrTW9kdWxlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IGdfcE1vZHVsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdl9wTW9kdWxlID0gZ19wTW9kdWxlc1tpXTtcbiAgICAgICAgICAgICAgICB2X3BNb2R1bGUuc2h1dGRvd24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZyYW1ld29ya01vZHVsZS5wcm90b3R5cGUsIFwicHJpb3JpdHlcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9pUHJpb3JpdHk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIEZyYW1ld29ya01vZHVsZTtcbiAgICB9KCkpOyAvLyBjbGFzcyBGcmFtZXdvcmtNb2R1bGVcbiAgICBleHBvcnRzLkZyYW1ld29ya01vZHVsZSA9IEZyYW1ld29ya01vZHVsZTtcbn0pO1xuIiwidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgdmFyIEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XG4gICAgdmFyIENvbmZpZ01hbmFnZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhDb25maWdNYW5hZ2VyLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBDb25maWdNYW5hZ2VyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcykgfHwgdGhpcztcbiAgICAgICAgICAgIF90aGlzLm1fcENvbmZpZ0RhdGEgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BMb2FkQXNzZXRDYWxsYmFja3MgPSB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogX3RoaXMubG9hZENvbmZpZ1N1Y2Nlc3NDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICBmYWlsdXJlOiBfdGhpcy5sb2FkQ29uZmlnRmFpbHVyZUNhbGxiYWNrLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIHVwZGF0ZTogX3RoaXMubG9hZENvbmZpZ1VwZGF0ZUNhbGxiYWNrLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIGRlcGVuZGVuY3k6IF90aGlzLmxvYWRDb25maWdEZXBlbmRlbmN5QXNzZXRDYWxsYmFjay5iaW5kKF90aGlzKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRDb25maWdTdWNjZXNzRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZENvbmZpZ0ZhaWx1cmVEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BMb2FkQ29uZmlnVXBkYXRlRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZENvbmZpZ0RlcGVuZGVuY3lBc3NldERlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ29uZmlnTWFuYWdlci5wcm90b3R5cGUsIFwicmVzb3VyY2VNYW5hZ2VyXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFJlc291cmNlTWFuYWdlcjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChudWxsID09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJlc291cmNlIG1hbmFnZXIgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyID0gdmFsdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbmZpZ01hbmFnZXIucHJvdG90eXBlLCBcImNvbmZpZ0hlbHBlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BDb25maWdIZWxwZXI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAobnVsbCA9PSB2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29uZmlnIGhlbHBlciBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcENvbmZpZ0hlbHBlciA9IHZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb25maWdNYW5hZ2VyLnByb3RvdHlwZSwgXCJjb25maWdDb3VudFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BDb25maWdEYXRhLnNpemU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbmZpZ01hbmFnZXIucHJvdG90eXBlLCBcImxvYWRDb25maWdTdWNjZXNzXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcExvYWRDb25maWdTdWNjZXNzRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbmZpZ01hbmFnZXIucHJvdG90eXBlLCBcImxvYWRDb25maWdGYWlsdXJlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcExvYWRDb25maWdGYWlsdXJlRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbmZpZ01hbmFnZXIucHJvdG90eXBlLCBcImxvYWRDb25maWdVcGRhdGVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wTG9hZENvbmZpZ1VwZGF0ZURlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb25maWdNYW5hZ2VyLnByb3RvdHlwZSwgXCJsb2FkQ29uZmlnRGVwZW5kZW5jeUFzc2V0XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcExvYWRDb25maWdEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBDb25maWdNYW5hZ2VyLnByb3RvdHlwZS5sb2FkQ29uZmlnID0gZnVuY3Rpb24gKGNvbmZpZ0Fzc2V0TmFtZSwgbG9hZFR5cGUsIGFueUFyZzEsIGFueUFyZzIpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IHJlc291cmNlIG1hbmFnZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BDb25maWdIZWxwZXIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgY29uZmlnIGhlbHBlciBmaXJzdC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcHJpb3JpdHkgPSAwO1xuICAgICAgICAgICAgdmFyIHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKHVuZGVmaW5lZCAhPT0gYW55QXJnMSkge1xuICAgICAgICAgICAgICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIGFueUFyZzEpXG4gICAgICAgICAgICAgICAgICAgIHByaW9yaXR5ID0gYW55QXJnMTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHVzZXJEYXRhID0gYW55QXJnMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh1bmRlZmluZWQgIT09IGFueUFyZzIgJiYgbnVsbCA9PSB1c2VyRGF0YSkge1xuICAgICAgICAgICAgICAgIHVzZXJEYXRhID0gYW55QXJnMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyLmxvYWRBc3NldChjb25maWdBc3NldE5hbWUsIHByaW9yaXR5LCB0aGlzLm1fcExvYWRBc3NldENhbGxiYWNrcywgeyBsb2FkVHlwZTogbG9hZFR5cGUsIHVzZXJEYXRhOiB1c2VyRGF0YSB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgLy8gTk9URTogQW55IGphdmFzY3JpcHQvdHlwZXNjcmlwdCBzdHJlYW0gaW1wbGVtZW50YXRpb24/XG4gICAgICAgIENvbmZpZ01hbmFnZXIucHJvdG90eXBlLnBhcnNlQ29uZmlnID0gZnVuY3Rpb24gKHRleHRPckJ1ZmZlciwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGlmICghdGV4dE9yQnVmZmVyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBjb25maWcgZGF0YSBkZXRlY3RlZCFcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLm1fcENvbmZpZ0hlbHBlcikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IHNldCBjb25maWcgaGVscGVyIGZpcnN0LlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVzZXJEYXRhID0gdXNlckRhdGEgfHwgbnVsbDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wQ29uZmlnSGVscGVyLnBhcnNlQ29uZmlnKHRleHRPckJ1ZmZlciwgdXNlckRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBDb25maWdNYW5hZ2VyLnByb3RvdHlwZS5oYXNDb25maWcgPSBmdW5jdGlvbiAoY29uZmlnTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q29uZmlnKGNvbmZpZ05hbWUpO1xuICAgICAgICB9O1xuICAgICAgICBDb25maWdNYW5hZ2VyLnByb3RvdHlwZS5hZGRDb25maWcgPSBmdW5jdGlvbiAoY29uZmlnTmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc0NvbmZpZyhjb25maWdOYW1lKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wQ29uZmlnRGF0YS5zZXQoY29uZmlnTmFtZSwgdmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG4gICAgICAgIENvbmZpZ01hbmFnZXIucHJvdG90eXBlLnJlbW92ZUNvbmZpZyA9IGZ1bmN0aW9uIChjb25maWdOYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BDb25maWdEYXRhLmRlbGV0ZShjb25maWdOYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5wcm90b3R5cGUucmVtb3ZlQWxsQ29uZmlncyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMubV9wQ29uZmlnRGF0YS5jbGVhcigpO1xuICAgICAgICB9O1xuICAgICAgICBDb25maWdNYW5hZ2VyLnByb3RvdHlwZS5nZXRDb25maWcgPSBmdW5jdGlvbiAoY29uZmlnTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wQ29uZmlnRGF0YS5nZXQoY29uZmlnTmFtZSk7XG4gICAgICAgIH07XG4gICAgICAgIENvbmZpZ01hbmFnZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgLy8gTk9PUC5cbiAgICAgICAgfTtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5wcm90b3R5cGUuc2h1dGRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBOT09QLlxuICAgICAgICB9O1xuICAgICAgICBDb25maWdNYW5hZ2VyLnByb3RvdHlwZS5sb2FkQ29uZmlnU3VjY2Vzc0NhbGxiYWNrID0gZnVuY3Rpb24gKGNvbmZpZ0Fzc2V0TmFtZSwgY29uZmlnQXNzZXQsIGR1cmF0aW9uLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcEluZm8pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2FkIGNvbmZpZyBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubV9wQ29uZmlnSGVscGVyLmxvYWRDb25maWcoY29uZmlnQXNzZXQsIHZfcEluZm8ubG9hZFR5cGUsIHZfcEluZm8udXNlckRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgY29uZmlnIGZhaWx1cmUgaW4gaGVscGVyLCBhc3NldCBuYW1lICdcIiArIGNvbmZpZ0Fzc2V0TmFtZSArIFwiJ1wiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubV9wTG9hZENvbmZpZ1N1Y2Nlc3NEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZENvbmZpZ1N1Y2Nlc3NEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGNvbmZpZ0Fzc2V0TmFtZSwgdl9wSW5mby5sb2FkVHlwZSwgZHVyYXRpb24sIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWRDb25maWdGYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRDb25maWdGYWlsdXJlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihjb25maWdBc3NldE5hbWUsIHZfcEluZm8ubG9hZFR5cGUsIGUudG9TdHJpbmcoKSwgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcENvbmZpZ0hlbHBlci5yZWxlYXNlQ29uZmlnQXNzZXQoY29uZmlnQXNzZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBDb25maWdNYW5hZ2VyLnByb3RvdHlwZS5sb2FkQ29uZmlnRmFpbHVyZUNhbGxiYWNrID0gZnVuY3Rpb24gKGNvbmZpZ0Fzc2V0TmFtZSwgc3RhdHVzLCBlcnJvck1lc3NhZ2UsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wSW5mbykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgY29uZmlnIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYXBwZW5kRXJyb3JNZXNzYWdlID0gXCJMb2FkIGNvbmZpZyBmYWlsdXJlLCBhc3NldCBuYW1lICdcIiArIGNvbmZpZ0Fzc2V0TmFtZSArIFwiJywgc3RhdHVzICdcIiArIHN0YXR1cyArIFwiJywgZXJyb3IgbWVzc2FnZSAnXCIgKyBlcnJvck1lc3NhZ2UgKyBcIicuXCI7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkQ29uZmlnRmFpbHVyZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRDb25maWdGYWlsdXJlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGNvbmZpZ0Fzc2V0TmFtZSwgdl9wSW5mby5sb2FkVHlwZSwgYXBwZW5kRXJyb3JNZXNzYWdlLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYXBwZW5kRXJyb3JNZXNzYWdlKTtcbiAgICAgICAgfTtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5wcm90b3R5cGUubG9hZENvbmZpZ1VwZGF0ZUNhbGxiYWNrID0gZnVuY3Rpb24gKGNvbmZpZ0Fzc2V0TmFtZSwgcHJvZ3Jlc3MsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wSW5mbykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgY29uZmlnIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkQ29uZmlnVXBkYXRlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZENvbmZpZ1VwZGF0ZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihjb25maWdBc3NldE5hbWUsIHZfcEluZm8ubG9hZFR5cGUsIHByb2dyZXNzLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgQ29uZmlnTWFuYWdlci5wcm90b3R5cGUubG9hZENvbmZpZ0RlcGVuZGVuY3lBc3NldENhbGxiYWNrID0gZnVuY3Rpb24gKGNvbmZpZ0Fzc2V0TmFtZSwgZGVwZW5kZW5jeUFzc2V0TmFtZSwgbG9hZGVkQ291bnQsIHRvdGFsQ291bnQsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wSW5mbykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgY29uZmlnIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkQ29uZmlnRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZENvbmZpZ0RlcGVuZGVuY3lBc3NldERlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihjb25maWdBc3NldE5hbWUsIGRlcGVuZGVuY3lBc3NldE5hbWUsIGxvYWRlZENvdW50LCB0b3RhbENvdW50LCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIENvbmZpZ01hbmFnZXI7XG4gICAgfShCYXNlXzEuRnJhbWV3b3JrTW9kdWxlKSk7IC8vIGNsYXNzIENvbmZpZ01hbmFnZXJcbiAgICBleHBvcnRzLkNvbmZpZ01hbmFnZXIgPSBDb25maWdNYW5hZ2VyO1xufSk7XG4iLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICB2YXIgRGF0YU5vZGVNYW5hZ2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICBfX2V4dGVuZHMoRGF0YU5vZGVNYW5hZ2VyLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBEYXRhTm9kZU1hbmFnZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgRGF0YU5vZGVNYW5hZ2VyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBub3QgaW1wbGVtZW50ZWQuXCIpO1xuICAgICAgICB9O1xuICAgICAgICBEYXRhTm9kZU1hbmFnZXIucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBEYXRhTm9kZU1hbmFnZXI7XG4gICAgfShCYXNlXzEuRnJhbWV3b3JrTW9kdWxlKSk7IC8vIGNsYXNzIERhdGFOb2RlTWFuYWdlclxuICAgIGV4cG9ydHMuRGF0YU5vZGVNYW5hZ2VyID0gRGF0YU5vZGVNYW5hZ2VyO1xufSk7XG4iLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICAvKipcbiAgICAgKiBBIHNpbXBsZSBldmVudCBtYW5hZ2VyIGltcGxlbWVudGF0aW9uLlxuICAgICAqXG4gICAgICogQGF1dGhvciBKZXJlbXkgQ2hlbiAoa2V5aG9tLmNAZ21haWwuY29tKVxuICAgICAqL1xuICAgIHZhciBFdmVudE1hbmFnZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhFdmVudE1hbmFnZXIsIF9zdXBlcik7XG4gICAgICAgIGZ1bmN0aW9uIEV2ZW50TWFuYWdlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICAgICAgX3RoaXMubV9wRXZlbnRIYW5kbGVycyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRXZlbnRNYW5hZ2VyLnByb3RvdHlwZSwgXCJwcmlvcml0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTAwO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFdmVudE1hbmFnZXIucHJvdG90eXBlLCBcImV2ZW50Q291bnRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgRXZlbnRNYW5hZ2VyLnByb3RvdHlwZS5jb3VudCA9IGZ1bmN0aW9uIChldmVudElkKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElkKSkge1xuICAgICAgICAgICAgICAgIHZhciB2X3BFdmVudEhhbmRsZXIgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgaWYgKCh2X3BFdmVudEhhbmRsZXIgPSB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50SWQpKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdl9wRXZlbnRIYW5kbGVyLnNpemU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH07XG4gICAgICAgIEV2ZW50TWFuYWdlci5wcm90b3R5cGUuY2hlY2sgPSBmdW5jdGlvbiAoZXZlbnRJZCwgaGFuZGxlciwgdGFyZ2V0KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElkKSkge1xuICAgICAgICAgICAgICAgIHZhciB2X3BFdmVudEhhbmRsZXIgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgaWYgKGhhbmRsZXIgJiYgKHZfcEV2ZW50SGFuZGxlciA9IHRoaXMubV9wRXZlbnRIYW5kbGVycy5nZXQoZXZlbnRJZCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2X3BFdmVudEhhbmRsZXIuaGFzKGhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgRXZlbnRNYW5hZ2VyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIChldmVudElkLCBoYW5kbGVyLCB0YXJnZXQpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElkKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycy5zZXQoZXZlbnRJZCwgbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdl9wRXZlbnRIYW5kbGVyO1xuICAgICAgICAgICAgaWYgKCh2X3BFdmVudEhhbmRsZXIgPSB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50SWQpKSkge1xuICAgICAgICAgICAgICAgIHZfcEV2ZW50SGFuZGxlci5hZGQoaGFuZGxlciwgdGFyZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRXZlbnRNYW5hZ2VyLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAoZXZlbnRJZCwgaGFuZGxlciwgdGFyZ2V0KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElkKSkge1xuICAgICAgICAgICAgICAgIHZhciB2X3BFdmVudEhhbmRsZXIgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgaWYgKCh2X3BFdmVudEhhbmRsZXIgPSB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50SWQpKSkge1xuICAgICAgICAgICAgICAgICAgICB2X3BFdmVudEhhbmRsZXIucmVtb3ZlKGhhbmRsZXIsIHRhcmdldCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBFdmVudE1hbmFnZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiAoZXZlbnRJZCkge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMTsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgYXJnc1tfaSAtIDFdID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm1fcEV2ZW50SGFuZGxlcnMuaGFzKGV2ZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZfcEV2ZW50SGFuZGxlciA9IHRoaXMubV9wRXZlbnRIYW5kbGVycy5nZXQoZXZlbnRJZCk7XG4gICAgICAgICAgICAgICAgaWYgKHZfcEV2ZW50SGFuZGxlcikge1xuICAgICAgICAgICAgICAgICAgICB2X3BFdmVudEhhbmRsZXIuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBFdmVudE1hbmFnZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgLy8gTk9PUC5cbiAgICAgICAgfTtcbiAgICAgICAgRXZlbnRNYW5hZ2VyLnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcEV2ZW50SGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZm9yRWFjaChmdW5jdGlvbiAoZWgsIGtleSkge1xuICAgICAgICAgICAgICAgICAgICBlaC5jbGVhcigpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycy5jbGVhcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gRXZlbnRNYW5hZ2VyO1xuICAgIH0oQmFzZV8xLkZyYW1ld29ya01vZHVsZSkpOyAvLyBjbGFzcyBFdmVudE1hbmFnZXJcbiAgICBleHBvcnRzLkV2ZW50TWFuYWdlciA9IEV2ZW50TWFuYWdlcjtcbn0pO1xuIiwidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG52YXIgX192YWx1ZXMgPSAodGhpcyAmJiB0aGlzLl9fdmFsdWVzKSB8fCBmdW5jdGlvbihvKSB7XG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcbiAgICBpZiAobyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHJldHVybiB7XG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IocyA/IFwiT2JqZWN0IGlzIG5vdCBpdGVyYWJsZS5cIiA6IFwiU3ltYm9sLml0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcbn07XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgdmFyIEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XG4gICAgdmFyIEZzbVN0YXRlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBGc21TdGF0ZSgpIHtcbiAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycyA9IG5ldyBNYXAoKTtcbiAgICAgICAgfVxuICAgICAgICBGc21TdGF0ZS5wcm90b3R5cGUub25Jbml0ID0gZnVuY3Rpb24gKGZzbSkge1xuICAgICAgICAgICAgLy8gTk9PUFxuICAgICAgICB9O1xuICAgICAgICBGc21TdGF0ZS5wcm90b3R5cGUub25FbnRlciA9IGZ1bmN0aW9uIChmc20pIHtcbiAgICAgICAgICAgIC8vIE5PT1BcbiAgICAgICAgfTtcbiAgICAgICAgRnNtU3RhdGUucHJvdG90eXBlLm9uVXBkYXRlID0gZnVuY3Rpb24gKGZzbSwgZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIC8vIE5PT1BcbiAgICAgICAgfTtcbiAgICAgICAgRnNtU3RhdGUucHJvdG90eXBlLm9uTGVhdmUgPSBmdW5jdGlvbiAoZnNtLCBzaHV0ZG93bikge1xuICAgICAgICAgICAgLy8gTk9PUFxuICAgICAgICB9O1xuICAgICAgICBGc21TdGF0ZS5wcm90b3R5cGUub25EZXN0cm95ID0gZnVuY3Rpb24gKGZzbSkge1xuICAgICAgICAgICAgdGhpcy5tX3BFdmVudEhhbmRsZXJzLmNsZWFyKCk7XG4gICAgICAgIH07XG4gICAgICAgIEZzbVN0YXRlLnByb3RvdHlwZS5jaGFuZ2VTdGF0ZSA9IGZ1bmN0aW9uIChmc20sIHR5cGUpIHtcbiAgICAgICAgICAgIGlmICghZnNtKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRnNtIGlzIGludmFsaWQ6IFwiICsgZnNtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZzbS5jaGFuZ2VTdGF0ZSh0eXBlKTtcbiAgICAgICAgfTtcbiAgICAgICAgRnNtU3RhdGUucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50SWQsIGV2ZW50SGFuZGxlcikge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gZXZlbnRIYW5kbGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkV2ZW50IGhhbmRsZXIgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAoIXRoaXMubV9wRXZlbnRIYW5kbGVycy5oYXMoZXZlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZWggPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycy5zZXQoZXZlbnRJZCwgZWgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZfcEhhbmRsZXJzID0gdGhpcy5tX3BFdmVudEhhbmRsZXJzLmdldChldmVudElkKTtcbiAgICAgICAgICAgIGlmICh2X3BIYW5kbGVycykge1xuICAgICAgICAgICAgICAgIHZfcEhhbmRsZXJzLmFkZChldmVudEhhbmRsZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBGc21TdGF0ZS5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gKGV2ZW50SWQsIGV2ZW50SGFuZGxlcikge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gZXZlbnRIYW5kbGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkV2ZW50IGhhbmRsZXIgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElkKSkge1xuICAgICAgICAgICAgICAgIHZhciB2X3BIYW5kbGVycyA9IHRoaXMubV9wRXZlbnRIYW5kbGVycy5nZXQoZXZlbnRJZCk7XG4gICAgICAgICAgICAgICAgaWYgKHZfcEhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZfcEhhbmRsZXJzLnJlbW92ZShldmVudEhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRnNtU3RhdGUucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiAoZnNtLCBzZW5kZXIsIGV2ZW50SWQsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElkKSkge1xuICAgICAgICAgICAgICAgIHZhciB2X3BIYW5kbGVycyA9IHRoaXMubV9wRXZlbnRIYW5kbGVycy5nZXQoZXZlbnRJZCk7XG4gICAgICAgICAgICAgICAgaWYgKHZfcEhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZfcEhhbmRsZXJzLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oZnNtLCBzZW5kZXIsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gRnNtU3RhdGU7XG4gICAgfSgpKTsgLy8gY2xhc3MgRnNtU3RhdGU8VD5cbiAgICBleHBvcnRzLkZzbVN0YXRlID0gRnNtU3RhdGU7XG4gICAgdmFyIEZzbSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gRnNtKCkge1xuICAgICAgICAgICAgdGhpcy5tX3BTdGF0ZXMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMubV9wRGF0YXMgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICB0aGlzLl9pc0Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGVUaW1lID0gMDtcbiAgICAgICAgfVxuICAgICAgICBGc20uY3JlYXRlRnNtID0gZnVuY3Rpb24gKG5hbWUsIG93bmVyLCBzdGF0ZXMpIHtcbiAgICAgICAgICAgIHZhciBlXzEsIF9hO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gb3duZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGU00gb3duZXIgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHN0YXRlcyB8fCBzdGF0ZXMubGVuZ3RoIDwgMSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZTTSBzdGF0ZXMgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHZhciB2X3BGc20gPSBuZXcgRnNtKCk7XG4gICAgICAgICAgICB2X3BGc20ubV9zTmFtZSA9IG5hbWU7XG4gICAgICAgICAgICB2X3BGc20ubV9wT3duZXIgPSBvd25lcjtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgc3RhdGVzXzEgPSBfX3ZhbHVlcyhzdGF0ZXMpLCBzdGF0ZXNfMV8xID0gc3RhdGVzXzEubmV4dCgpOyAhc3RhdGVzXzFfMS5kb25lOyBzdGF0ZXNfMV8xID0gc3RhdGVzXzEubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2X3BTdGF0ZSA9IHN0YXRlc18xXzEudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChudWxsID09IHZfcFN0YXRlKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGU00gc3RhdGVzIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2X3BGc20uaGFzU3RhdGUodl9wU3RhdGUuY29uc3RydWN0b3IpKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRlNNICdcIiArIG5hbWUgKyBcIicgc3RhdGUgJ1wiICsgdl9wU3RhdGUgKyBcIicgaXMgYWxyZWFkeSBleGlzdC5cIik7XG4gICAgICAgICAgICAgICAgICAgIHZfcEZzbS5tX3BTdGF0ZXMucHVzaCh2X3BTdGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgIHZfcFN0YXRlLm9uSW5pdCh2X3BGc20pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzFfMSkgeyBlXzEgPSB7IGVycm9yOiBlXzFfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdGVzXzFfMSAmJiAhc3RhdGVzXzFfMS5kb25lICYmIChfYSA9IHN0YXRlc18xLnJldHVybikpIF9hLmNhbGwoc3RhdGVzXzEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2X3BGc20uX2lzRGVzdHJveWVkID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gdl9wRnNtO1xuICAgICAgICB9O1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRnNtLnByb3RvdHlwZSwgXCJuYW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fc05hbWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZzbS5wcm90b3R5cGUsIFwib3duZXJcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcE93bmVyOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZzbS5wcm90b3R5cGUsIFwiZnNtU3RhdGVDb3VudFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU3RhdGVzLmxlbmd0aDsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGc20ucHJvdG90eXBlLCBcImlzUnVubmluZ1wiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIG51bGwgIT0gdGhpcy5fY3VycmVudFN0YXRlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZzbS5wcm90b3R5cGUsIFwiaXNEZXN0cm95ZWRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLl9pc0Rlc3Ryb3llZDsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGc20ucHJvdG90eXBlLCBcImN1cnJlbnRTdGF0ZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuX2N1cnJlbnRTdGF0ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGc20ucHJvdG90eXBlLCBcImN1cnJlbnRTdGF0ZU5hbWVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgLy8gRklYTUU6IEN1cnJlbnQgc3RhdGUgbmFtZSA/XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFN0YXRlLm5hbWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZzbS5wcm90b3R5cGUsIFwiY3VycmVudFN0YXRlVGltZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuX2N1cnJlbnRTdGF0ZVRpbWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBGc20ucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzUnVubmluZykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZTTSBpcyBydW5uaW5nLCBjYW4gbm90IHN0YXJ0IGFnYWluLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuZ2V0U3RhdGUodHlwZSk7XG4gICAgICAgICAgICBpZiAoIXN0YXRlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRlNNICdcIiArIHRoaXMubmFtZSArIFwiJyBjYW4gbm90IHN0YXJ0IHN0YXRlICdcIiArIHR5cGUubmFtZSArIFwiJyB3aGljaCBpcyBub3QgZXhpc3RzLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZVRpbWUgPSAwO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlID0gc3RhdGU7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGF0ZS5vbkVudGVyKHRoaXMpOyAvLyBDYWxsIGludGVybmFsIGZ1bmN0aW9uIHdpdGggYW55IGNhc3RpbmcuXG4gICAgICAgIH07XG4gICAgICAgIEZzbS5wcm90b3R5cGUuaGFzU3RhdGUgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGwgIT0gdGhpcy5nZXRTdGF0ZSh0eXBlKTtcbiAgICAgICAgfTtcbiAgICAgICAgRnNtLnByb3RvdHlwZS5nZXRTdGF0ZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubV9wU3RhdGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZfcFN0YXRlID0gdGhpcy5tX3BTdGF0ZXNbaV07XG4gICAgICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wU3RhdGUpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGlmICh2X3BTdGF0ZSBpbnN0YW5jZW9mIHR5cGUpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2X3BTdGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBGc20ucHJvdG90eXBlLmdldEFsbFN0YXRlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFN0YXRlcztcbiAgICAgICAgfTtcbiAgICAgICAgRnNtLnByb3RvdHlwZS5jaGFuZ2VTdGF0ZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2N1cnJlbnRTdGF0ZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0N1cnJlbnQgc3RhdGUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHZhciB2X3BTdGF0ZSA9IHRoaXMuZ2V0U3RhdGUodHlwZSk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BTdGF0ZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGc20gY2FuIG5vdCBjaGFuZ2Ugc3RhdGUsIHN0YXRlIGlzIG5vdCBleGlzdDogXCIgKyB0eXBlKTtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZS5vbkxlYXZlKHRoaXMsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZVRpbWUgPSAwO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlID0gdl9wU3RhdGU7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGUub25FbnRlcih0aGlzKTtcbiAgICAgICAgfTtcbiAgICAgICAgRnNtLnByb3RvdHlwZS5nZXREYXRhID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcERhdGFzLmhhcyhuYW1lKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BEYXRhcy5nZXQobmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgRnNtLnByb3RvdHlwZS5zZXREYXRhID0gZnVuY3Rpb24gKG5hbWUsIGRhdGEpIHtcbiAgICAgICAgICAgIGlmICghbmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RhdGEgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdGhpcy5tX3BEYXRhcy5zZXQobmFtZSwgZGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIEZzbS5wcm90b3R5cGUucmVtb3ZlRGF0YSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICBpZiAoIW5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXRhIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHZhciB2X2JSZXQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcERhdGFzLmhhcyhuYW1lKSkge1xuICAgICAgICAgICAgICAgIHZfYlJldCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BEYXRhcy5kZWxldGUobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdl9iUmV0O1xuICAgICAgICB9O1xuICAgICAgICBGc20ucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5fY3VycmVudFN0YXRlKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZVRpbWUgKz0gZWxhcHNlZDtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZS5vblVwZGF0ZSh0aGlzLCBlbGFwc2VkLCByZWFsRWxhcHNlZCk7XG4gICAgICAgIH07XG4gICAgICAgIEZzbS5wcm90b3R5cGUuc2h1dGRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBGSVhNRTogRmlndWUgb3V0IGEgd2F5IHRvIHJlbGVhc2UgdGhpcy5cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIEZzbTtcbiAgICB9KCkpOyAvLyBjbGFzcyBGc208VD5cbiAgICBleHBvcnRzLkZzbSA9IEZzbTtcbiAgICB2YXIgRnNtTWFuYWdlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgX19leHRlbmRzKEZzbU1hbmFnZXIsIF9zdXBlcik7XG4gICAgICAgIGZ1bmN0aW9uIEZzbU1hbmFnZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgICAgICAgICAgIF90aGlzLm1fcEZzbXMgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZzbU1hbmFnZXIucHJvdG90eXBlLCBcInByaW9yaXR5XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiA2MDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRnNtTWFuYWdlci5wcm90b3R5cGUsIFwiY291bnRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wRnNtcy5zaXplO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIEZzbU1hbmFnZXIucHJvdG90eXBlLmhhc0ZzbSA9IGZ1bmN0aW9uIChuYW1lT3JUeXBlKSB7XG4gICAgICAgICAgICB2YXIgZV8yLCBfYTtcbiAgICAgICAgICAgIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgbmFtZU9yVHlwZSAmJiBuYW1lT3JUeXBlLnByb3RvdHlwZSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BGc21zLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZzbSA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG51bGwgIT0gZnNtICYmIGZzbSBpbnN0YW5jZW9mIG5hbWVPclR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV8yXzEpIHsgZV8yID0geyBlcnJvcjogZV8yXzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8yKSB0aHJvdyBlXzIuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEZzbXMuaGFzKG5hbWVPclR5cGUudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIEZzbU1hbmFnZXIucHJvdG90eXBlLmdldEZzbSA9IGZ1bmN0aW9uIChuYW1lT3JUeXBlKSB7XG4gICAgICAgICAgICB2YXIgZV8zLCBfYTtcbiAgICAgICAgICAgIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgbmFtZU9yVHlwZSAmJiBuYW1lT3JUeXBlLnByb3RvdHlwZSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BGc21zLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZzbSA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG51bGwgIT0gZnNtICYmIGZzbSBpbnN0YW5jZW9mIG5hbWVPclR5cGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZzbTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV8zXzEpIHsgZV8zID0geyBlcnJvcjogZV8zXzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8zKSB0aHJvdyBlXzMuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BGc21zLmdldChuYW1lT3JUeXBlLnRvU3RyaW5nKCkpIHx8IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgRnNtTWFuYWdlci5wcm90b3R5cGUuZ2V0QWxsRnNtcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBlXzQsIF9hO1xuICAgICAgICAgICAgdmFyIHZfcFJldCA9IFtdO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRnNtcy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZzbSA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB2X3BSZXQucHVzaChmc20pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzRfMSkgeyBlXzQgPSB7IGVycm9yOiBlXzRfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV80KSB0aHJvdyBlXzQuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2X3BSZXQ7XG4gICAgICAgIH07XG4gICAgICAgIEZzbU1hbmFnZXIucHJvdG90eXBlLmNyZWF0ZUZzbSA9IGZ1bmN0aW9uIChuYW1lLCBvd25lciwgc3RhdGVzKSB7XG4gICAgICAgICAgICBuYW1lID0gbmFtZSB8fCAnJztcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc0ZzbShuYW1lKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFscmVhZHkgZXhpc3QgRlNNICdcIiArIG5hbWUgKyBcIicuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGZzbSA9IEZzbS5jcmVhdGVGc20obmFtZSwgb3duZXIsIHN0YXRlcyk7XG4gICAgICAgICAgICB0aGlzLm1fcEZzbXMuc2V0KG5hbWUsIGZzbSk7XG4gICAgICAgICAgICByZXR1cm4gZnNtO1xuICAgICAgICB9O1xuICAgICAgICBGc21NYW5hZ2VyLnByb3RvdHlwZS5kZXN0cm95RnNtID0gZnVuY3Rpb24gKGFyZykge1xuICAgICAgICAgICAgdmFyIGVfNSwgX2EsIGVfNiwgX2IsIGVfNywgX2M7XG4gICAgICAgICAgICB2YXIgdl9zTmFtZTtcbiAgICAgICAgICAgIHZhciB2X3BUeXBlO1xuICAgICAgICAgICAgdmFyIHZfcEluc3RhbmNlO1xuICAgICAgICAgICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgYXJnKSB7XG4gICAgICAgICAgICAgICAgdl9zTmFtZSA9IGFyZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBhcmcpIHtcbiAgICAgICAgICAgICAgICB2X3BUeXBlID0gYXJnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoJ29iamVjdCcgPT09IHR5cGVvZiBhcmcgJiYgYXJnLmNvbnN0cnVjdG9yKSB7XG4gICAgICAgICAgICAgICAgdl9wSW5zdGFuY2UgPSBhcmc7XG4gICAgICAgICAgICAgICAgdl9wVHlwZSA9IGFyZy5jb25zdHJ1Y3RvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdGhpcy5oYXNGc20odl9zTmFtZSB8fCB2X3BUeXBlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh2X3BJbnN0YW5jZSAmJiBPYmplY3QuZ2V0UHJvdG90eXBlT2Yodl9wSW5zdGFuY2UpLmhhc093blByb3BlcnR5KCdzaHV0ZG93bicpKSB7XG4gICAgICAgICAgICAgICAgdl9wSW5zdGFuY2Uuc2h1dGRvd24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChudWxsICE9IHZfcEluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2QgPSBfX3ZhbHVlcyh0aGlzLm1fcEZzbXMua2V5cygpKSwgX2UgPSBfZC5uZXh0KCk7ICFfZS5kb25lOyBfZSA9IF9kLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IF9lLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZfcEZzbSA9IHRoaXMubV9wRnNtcy5nZXQoa2V5KSB8fCBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEZzbSA9PSB2X3BJbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubV9wRnNtcy5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV81XzEpIHsgZV81ID0geyBlcnJvcjogZV81XzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9lICYmICFfZS5kb25lICYmIChfYSA9IF9kLnJldHVybikpIF9hLmNhbGwoX2QpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV81KSB0aHJvdyBlXzUuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChudWxsICE9IHZfc05hbWUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfZiA9IF9fdmFsdWVzKHRoaXMubV9wRnNtcy5rZXlzKCkpLCBfZyA9IF9mLm5leHQoKTsgIV9nLmRvbmU7IF9nID0gX2YubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gX2cudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdl9wRnNtID0gdGhpcy5tX3BGc21zLmdldChrZXkpIHx8IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXZfcEZzbSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2X3BGc20ubmFtZSA9PSB2X3NOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BGc21zLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzZfMSkgeyBlXzYgPSB7IGVycm9yOiBlXzZfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2cgJiYgIV9nLmRvbmUgJiYgKF9iID0gX2YucmV0dXJuKSkgX2IuY2FsbChfZik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzYpIHRocm93IGVfNi5lcnJvcjsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG51bGwgIT0gdl9wVHlwZSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9oID0gX192YWx1ZXModGhpcy5tX3BGc21zLmtleXMoKSksIF9qID0gX2gubmV4dCgpOyAhX2ouZG9uZTsgX2ogPSBfaC5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBfai52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2X3BGc20gPSB0aGlzLm1fcEZzbXMuZ2V0KGtleSkgfHwgbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2X3BGc20gaW5zdGFuY2VvZiB2X3BUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BGc21zLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzdfMSkgeyBlXzcgPSB7IGVycm9yOiBlXzdfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2ogJiYgIV9qLmRvbmUgJiYgKF9jID0gX2gucmV0dXJuKSkgX2MuY2FsbChfaCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzcpIHRocm93IGVfNy5lcnJvcjsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuICAgICAgICBGc21NYW5hZ2VyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIHZhciBlXzgsIF9hO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wRnNtcy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmc20gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFmc20gfHwgZnNtLmlzRGVzdHJveWVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIGZzbS51cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzhfMSkgeyBlXzggPSB7IGVycm9yOiBlXzhfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV84KSB0aHJvdyBlXzguZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRnNtTWFuYWdlci5wcm90b3R5cGUuc2h1dGRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZV85LCBfYTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcEZzbXMua2V5cygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2X0ZzbSA9IHRoaXMubV9wRnNtcy5nZXQoa2V5KSB8fCBudWxsO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXZfRnNtIHx8IHZfRnNtLmlzRGVzdHJveWVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIHZfRnNtLnNodXRkb3duKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wRnNtcy5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV85XzEpIHsgZV85ID0geyBlcnJvcjogZV85XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfOSkgdGhyb3cgZV85LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBGc21NYW5hZ2VyO1xuICAgIH0oQmFzZV8xLkZyYW1ld29ya01vZHVsZSkpOyAvLyBjbGFzcyBGc21NYW5hZ2VyXG4gICAgZXhwb3J0cy5Gc21NYW5hZ2VyID0gRnNtTWFuYWdlcjtcbn0pO1xuIiwidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiLCBcIi4vRnNtXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICB2YXIgRnNtXzEgPSByZXF1aXJlKFwiLi9Gc21cIik7XG4gICAgdmFyIFByb2NlZHVyZUJhc2UgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhQcm9jZWR1cmVCYXNlLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBQcm9jZWR1cmVCYXNlKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBQcm9jZWR1cmVCYXNlO1xuICAgIH0oRnNtXzEuRnNtU3RhdGUpKTsgLy8gY2xhc3MgUHJvY2VkdXJlQmFzZVxuICAgIGV4cG9ydHMuUHJvY2VkdXJlQmFzZSA9IFByb2NlZHVyZUJhc2U7XG4gICAgdmFyIFByb2NlZHVyZU1hbmFnZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhQcm9jZWR1cmVNYW5hZ2VyLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBQcm9jZWR1cmVNYW5hZ2VyKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShQcm9jZWR1cmVNYW5hZ2VyLnByb3RvdHlwZSwgXCJwcmlvcml0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIC0xMDsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShQcm9jZWR1cmVNYW5hZ2VyLnByb3RvdHlwZSwgXCJjdXJyZW50UHJvY2VkdXJlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFByb2NlZHVyZUZzbS5jdXJyZW50U3RhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgUHJvY2VkdXJlTWFuYWdlci5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIChmc21NYW5hZ2VyLCBwcm9jZWR1cmVzKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSBmc21NYW5hZ2VyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRlNNIG1hbmFnZXIgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHRoaXMubV9wRnNtTWFuYWdlciA9IGZzbU1hbmFnZXI7XG4gICAgICAgICAgICB0aGlzLm1fcFByb2NlZHVyZUZzbSA9IGZzbU1hbmFnZXIuY3JlYXRlRnNtKCcnLCB0aGlzLCBwcm9jZWR1cmVzKTtcbiAgICAgICAgfTtcbiAgICAgICAgUHJvY2VkdXJlTWFuYWdlci5wcm90b3R5cGUuc3RhcnRQcm9jZWR1cmUgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLm1fcFByb2NlZHVyZUZzbSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBtdXN0IGluaXRpYWxpemUgcHJvY2VkdXJlIGZpcnN0LicpO1xuICAgICAgICAgICAgdGhpcy5tX3BQcm9jZWR1cmVGc20uc3RhcnQob2JqLmNvbnN0cnVjdG9yKTtcbiAgICAgICAgfTtcbiAgICAgICAgUHJvY2VkdXJlTWFuYWdlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICAvLyBOb29wLlxuICAgICAgICB9O1xuICAgICAgICBQcm9jZWR1cmVNYW5hZ2VyLnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChudWxsICE9IHRoaXMubV9wRnNtTWFuYWdlcikge1xuICAgICAgICAgICAgICAgIGlmIChudWxsICE9IHRoaXMubV9wUHJvY2VkdXJlRnNtKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wRnNtTWFuYWdlci5kZXN0cm95RnNtKHRoaXMubV9wUHJvY2VkdXJlRnNtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFByb2NlZHVyZU1hbmFnZXIucHJvdG90eXBlLmhhc1Byb2NlZHVyZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLm1fcFByb2NlZHVyZUZzbSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBtdXN0IGluaXRpYWxpemUgcHJvY2VkdXJlIGZpcnN0LicpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUHJvY2VkdXJlRnNtLmhhc1N0YXRlKHR5cGUpO1xuICAgICAgICB9O1xuICAgICAgICBQcm9jZWR1cmVNYW5hZ2VyLnByb3RvdHlwZS5nZXRQcm9jZWR1cmUgPSBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BQcm9jZWR1cmVGc20pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgbXVzdCBpbml0aWFsaXplIHByb2NlZHVyZSBmaXJzdC4nKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFByb2NlZHVyZUZzbS5nZXRTdGF0ZSh0eXBlKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFByb2NlZHVyZU1hbmFnZXI7XG4gICAgfShCYXNlXzEuRnJhbWV3b3JrTW9kdWxlKSk7IC8vIGNsYXNzIFByb2NlZHVyZU1hbmFnZXJcbiAgICBleHBvcnRzLlByb2NlZHVyZU1hbmFnZXIgPSBQcm9jZWR1cmVNYW5hZ2VyO1xufSk7XG4iLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICB2YXIgUmVzb3VyY2VNb2RlO1xuICAgIChmdW5jdGlvbiAoUmVzb3VyY2VNb2RlKSB7XG4gICAgICAgIFJlc291cmNlTW9kZVtSZXNvdXJjZU1vZGVbXCJVbnNwZWNpZmllZFwiXSA9IDBdID0gXCJVbnNwZWNpZmllZFwiO1xuICAgICAgICBSZXNvdXJjZU1vZGVbUmVzb3VyY2VNb2RlW1wiUGFja2FnZVwiXSA9IDFdID0gXCJQYWNrYWdlXCI7XG4gICAgICAgIFJlc291cmNlTW9kZVtSZXNvdXJjZU1vZGVbXCJVcGRhdGFibGVcIl0gPSAyXSA9IFwiVXBkYXRhYmxlXCI7XG4gICAgfSkoUmVzb3VyY2VNb2RlID0gZXhwb3J0cy5SZXNvdXJjZU1vZGUgfHwgKGV4cG9ydHMuUmVzb3VyY2VNb2RlID0ge30pKTsgLy8gZW51bSBSZXNvdXJjZU1vZGVcbiAgICB2YXIgTG9hZFJlc291cmNlU3RhdHVzO1xuICAgIChmdW5jdGlvbiAoTG9hZFJlc291cmNlU3RhdHVzKSB7XG4gICAgICAgIExvYWRSZXNvdXJjZVN0YXR1c1tMb2FkUmVzb3VyY2VTdGF0dXNbXCJTdWNjZXNzXCJdID0gMF0gPSBcIlN1Y2Nlc3NcIjtcbiAgICAgICAgTG9hZFJlc291cmNlU3RhdHVzW0xvYWRSZXNvdXJjZVN0YXR1c1tcIk5vdFJlYWR5XCJdID0gMV0gPSBcIk5vdFJlYWR5XCI7XG4gICAgICAgIExvYWRSZXNvdXJjZVN0YXR1c1tMb2FkUmVzb3VyY2VTdGF0dXNbXCJOb3RFeGlzdFwiXSA9IDJdID0gXCJOb3RFeGlzdFwiO1xuICAgICAgICBMb2FkUmVzb3VyY2VTdGF0dXNbTG9hZFJlc291cmNlU3RhdHVzW1wiRGVwZW5kZW5jeUVycm9yXCJdID0gM10gPSBcIkRlcGVuZGVuY3lFcnJvclwiO1xuICAgICAgICBMb2FkUmVzb3VyY2VTdGF0dXNbTG9hZFJlc291cmNlU3RhdHVzW1wiVHlwZUVycm9yXCJdID0gNF0gPSBcIlR5cGVFcnJvclwiO1xuICAgICAgICBMb2FkUmVzb3VyY2VTdGF0dXNbTG9hZFJlc291cmNlU3RhdHVzW1wiQXNzZXRFcnJvclwiXSA9IDVdID0gXCJBc3NldEVycm9yXCI7XG4gICAgfSkoTG9hZFJlc291cmNlU3RhdHVzID0gZXhwb3J0cy5Mb2FkUmVzb3VyY2VTdGF0dXMgfHwgKGV4cG9ydHMuTG9hZFJlc291cmNlU3RhdHVzID0ge30pKTsgLy8gZW51bSBMb2FkUmVzb3VyY2VTdGF0dXNcbiAgICAvKipcbiAgICAgKiBBIHJlc291cmNlIG1hbmFnZXIgbW9kdWxhciBiYXNlIG9uIGBGcmFtZXdvcmtNb2R1bGVgLlxuICAgICAqXG4gICAgICogVE9ETzogQSBnZW5lcmFsIHJlc291cmNlIG1hbmFnZW1lbnQgd2FzIG5vdCB5ZXQgaW1wbGVtZW50ZWQuXG4gICAgICpcbiAgICAgKiBAYXV0aG9yIEplcmVteSBDaGVuIChrZXlob20uY0BnbWFpbC5jb20pXG4gICAgICovXG4gICAgdmFyIFJlc291cmNlTWFuYWdlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgX19leHRlbmRzKFJlc291cmNlTWFuYWdlciwgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gUmVzb3VyY2VNYW5hZ2VyKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZXNvdXJjZU1hbmFnZXIucHJvdG90eXBlLCBcInJlc291cmNlR3JvdXBcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFJlc291cmNlR3JvdXA7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUmVzb3VyY2VNYW5hZ2VyLnByb3RvdHlwZSwgXCJyZXNvdXJjZUxvYWRlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wUmVzb3VyY2VMb2FkZXI7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChudWxsID09IHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZXR0aW5nIHJlc291cmNlIGxvYWRlciBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTG9hZGVyID0gdmFsdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFJlc291cmNlTWFuYWdlci5wcm90b3R5cGUsIFwicHJpb3JpdHlcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDcwO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFJlc291cmNlTWFuYWdlci5wcm90b3R5cGUuaGFzQXNzZXQgPSBmdW5jdGlvbiAoYXNzZXROYW1lKSB7XG4gICAgICAgICAgICBpZiAoIWFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUmVzb3VyY2VMb2FkZXIuaGFzQXNzZXQoYXNzZXROYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnByb3RvdHlwZS5sb2FkQXNzZXQgPSBmdW5jdGlvbiAoYXNzZXROYW1lLCBhc3NldFR5cGUsIHByaW9yaXR5LCBsb2FkQXNzZXRDYWxsYmFja3MsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoIWFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCFsb2FkQXNzZXRDYWxsYmFja3MpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTG9hZCBhc3NldCBjYWxsYmFja3MgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTG9hZGVyLmxvYWRBc3NldChhc3NldE5hbWUsIGFzc2V0VHlwZSwgcHJpb3JpdHksIGxvYWRBc3NldENhbGxiYWNrcywgdXNlckRhdGEpO1xuICAgICAgICB9O1xuICAgICAgICBSZXNvdXJjZU1hbmFnZXIucHJvdG90eXBlLnVubG9hZEFzc2V0ID0gZnVuY3Rpb24gKGFzc2V0KSB7XG4gICAgICAgICAgICBpZiAoIWFzc2V0KVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzc2V0IGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BSZXNvdXJjZUxvYWRlcilcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTG9hZGVyLnVubG9hZEFzc2V0KGFzc2V0KTtcbiAgICAgICAgfTtcbiAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnByb3RvdHlwZS5sb2FkU2NlbmUgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUsIHByaW9yaXR5LCBsb2FkU2NlbmVDYWxsYmFja3MsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoIXNjZW5lQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjZW5lIGFzc2V0IG5hbWUgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAoIWxvYWRTY2VuZUNhbGxiYWNrcylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2FkIHNjZW5lIGFzc2V0IGNhbGxiYWNrcyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VMb2FkZXIubG9hZFNjZW5lKHNjZW5lQXNzZXROYW1lLCBwcmlvcml0eSwgbG9hZFNjZW5lQ2FsbGJhY2tzLCB1c2VyRGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIFJlc291cmNlTWFuYWdlci5wcm90b3R5cGUudW5sb2FkU2NlbmUgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUsIHVubG9hZFNjZW5lQ2FsbGJhY2tzLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKCFzY2VuZUFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCF1bmxvYWRTY2VuZUNhbGxiYWNrcylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmxvYWQgc2NlbmUgY2FsbGJhY2tzIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZUxvYWRlci51bmxvYWRTY2VuZShzY2VuZUFzc2V0TmFtZSwgdW5sb2FkU2NlbmVDYWxsYmFja3MsIHVzZXJEYXRhKTtcbiAgICAgICAgfTtcbiAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnByb3RvdHlwZS5oYXNSZXNvdXJjZUdyb3VwID0gZnVuY3Rpb24gKHJlc291cmNlR3JvdXBOYW1lKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcFJlc291cmNlTG9hZGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZUxvYWRlci51cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBSZXNvdXJjZU1hbmFnZXIucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wUmVzb3VyY2VMb2FkZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTG9hZGVyLnNodXRkb3duKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBSZXNvdXJjZU1hbmFnZXI7XG4gICAgfShCYXNlXzEuRnJhbWV3b3JrTW9kdWxlKSk7IC8vIGNsYXNzIFJlc291cmNlTWFuYWdlclxuICAgIGV4cG9ydHMuUmVzb3VyY2VNYW5hZ2VyID0gUmVzb3VyY2VNYW5hZ2VyO1xufSk7XG4iLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbnZhciBfX3ZhbHVlcyA9ICh0aGlzICYmIHRoaXMuX192YWx1ZXMpIHx8IGZ1bmN0aW9uKG8pIHtcbiAgICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xufTtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICB2YXIgU2NlbmVNYW5hZ2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICBfX2V4dGVuZHMoU2NlbmVNYW5hZ2VyLCBfc3VwZXIpO1xuICAgICAgICBmdW5jdGlvbiBTY2VuZU1hbmFnZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRlZFNjZW5lQXNzZXROYW1lcyA9IFtdO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZGluZ1NjZW5lQXNzZXROYW1lcyA9IFtdO1xuICAgICAgICAgICAgX3RoaXMubV9wVW5sb2FkaW5nU2NlbmVBc3NldE5hbWVzID0gW107XG4gICAgICAgICAgICBfdGhpcy5tX3BMb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZFNjZW5lRmFpbHVyZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRTY2VuZVVwZGF0ZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRTY2VuZURlcGVuZGVuY3lBc3NldERlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcFVubG9hZFNjZW5lU3VjY2Vzc0RlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcFVubG9hZFNjZW5lRmFpbHVyZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcExvYWRTY2VuZUNhbGxiYWNrcyA9IHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBfdGhpcy5vbkxvYWRTY2VuZVN1Y2Nlc3MuYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgZmFpbHVyZTogX3RoaXMub25Mb2FkU2NlbmVGYWlsdXJlLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIHVwZGF0ZTogX3RoaXMub25Mb2FkU2NlbmVVcGRhdGUuYmluZChfdGhpcyksXG4gICAgICAgICAgICAgICAgZGVwZW5kZW5jeTogX3RoaXMub25Mb2FkU2NlbmVEZXBlbmRlbmN5QXNzZXQuYmluZChfdGhpcylcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBfdGhpcy5tX3BVbmxvYWRTY2VuZUNhbGxiYWNrcyA9IHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBfdGhpcy5vblVubG9hZFNjZW5lU3VjY2Vzcy5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICBmYWlsdXJlOiBfdGhpcy5vblVubG9hZFNjZW5lRmFpbHVyZS5iaW5kKF90aGlzKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU2NlbmVNYW5hZ2VyLnByb3RvdHlwZSwgXCJwcmlvcml0eVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gNjA7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNjZW5lTWFuYWdlci5wcm90b3R5cGUsIFwibG9hZFNjZW5lU3VjY2Vzc1wiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BMb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNjZW5lTWFuYWdlci5wcm90b3R5cGUsIFwibG9hZFNjZW5lRmFpbHVyZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BMb2FkU2NlbmVGYWlsdXJlRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNjZW5lTWFuYWdlci5wcm90b3R5cGUsIFwibG9hZFNjZW5lVXBkYXRlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcExvYWRTY2VuZVVwZGF0ZURlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTY2VuZU1hbmFnZXIucHJvdG90eXBlLCBcImxvYWRTY2VuZURlcGVuZGVuY3lBc3NldFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BMb2FkU2NlbmVEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU2NlbmVNYW5hZ2VyLnByb3RvdHlwZSwgXCJ1bmxvYWRTY2VuZVN1Y2Nlc3NcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wVW5sb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNjZW5lTWFuYWdlci5wcm90b3R5cGUsIFwidW5sb2FkU2NlbmVGYWlsdXJlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFVubG9hZFNjZW5lRmFpbHVyZURlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTY2VuZU1hbmFnZXIucHJvdG90eXBlLCBcInJlc291cmNlTWFuYWdlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlciA9IHZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUuc2NlbmVJc0xvYWRpbmcgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUpIHtcbiAgICAgICAgICAgIGlmICghc2NlbmVBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgbmFtZSBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHJldHVybiBzY2VuZUFzc2V0TmFtZSBpbiB0aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXM7XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUuc2NlbmVJc0xvYWRlZCA9IGZ1bmN0aW9uIChzY2VuZUFzc2V0TmFtZSkge1xuICAgICAgICAgICAgaWYgKCFzY2VuZUFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHNjZW5lQXNzZXROYW1lIGluIHRoaXMubV9wTG9hZGVkU2NlbmVBc3NldE5hbWVzO1xuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLnNjZW5lSXNVbmxvYWRpbmcgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUpIHtcbiAgICAgICAgICAgIGlmICghc2NlbmVBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgbmFtZSBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHJldHVybiBzY2VuZUFzc2V0TmFtZSBpbiB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcztcbiAgICAgICAgfTtcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnByb3RvdHlwZS5nZXRMb2FkZWRTY2VuZUFzc2V0TmFtZXMgPSBmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMgfHwgW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubV9wTG9hZGVkU2NlbmVBc3NldE5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMubV9wTG9hZGVkU2NlbmVBc3NldE5hbWVzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLmdldExvYWRpbmdTY2VuZUFzc2V0TmFtZXMgPSBmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMgfHwgW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubV9wTG9hZGluZ1NjZW5lQXNzZXROYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUuZ2V0VW5sb2FkaW5nU2NlbmVBc3NldE5hbWVzID0gZnVuY3Rpb24gKHJlc3VsdHMpIHtcbiAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzIHx8IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfTtcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnByb3RvdHlwZS5sb2FkU2NlbmUgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUsIHByaW9yaXR5LCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKCFzY2VuZUFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1fcFJlc291cmNlTWFuYWdlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgcmVzb3VyY2UgbWFuYWdlciBmaXJzdC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5zY2VuZUlzVW5sb2FkaW5nKHNjZW5lQXNzZXROYW1lKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCAnXCIgKyBzY2VuZUFzc2V0TmFtZSArIFwiJyBpcyBiZWluZyB1bmxvYWRlZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5zY2VuZUlzTG9hZGluZyhzY2VuZUFzc2V0TmFtZSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgJ1wiICsgc2NlbmVBc3NldE5hbWUgKyBcIicgaXMgYmVpbmcgbG9hZGVkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnNjZW5lSXNMb2FkZWQoc2NlbmVBc3NldE5hbWUpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjZW5lIGFzc2V0ICdcIiArIHNjZW5lQXNzZXROYW1lICsgXCInIGlzIGFscmVhZHkgbG9hZGVkLlwiKTtcbiAgICAgICAgICAgIHRoaXMubV9wTG9hZGluZ1NjZW5lQXNzZXROYW1lcy5wdXNoKHNjZW5lQXNzZXROYW1lKTtcbiAgICAgICAgICAgIHZhciB2X2lQcmlvcml0eSA9IDA7XG4gICAgICAgICAgICB2YXIgdl9wVXNlckRhdGE7XG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAyKSB7XG4gICAgICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2YgcHJpb3JpdHkpXG4gICAgICAgICAgICAgICAgICAgIHZfaVByaW9yaXR5ID0gcHJpb3JpdHk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB2X3BVc2VyRGF0YSA9IHByaW9yaXR5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAzKSB7XG4gICAgICAgICAgICAgICAgdl9pUHJpb3JpdHkgPSBwcmlvcml0eTtcbiAgICAgICAgICAgICAgICB2X3BVc2VyRGF0YSA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIubG9hZFNjZW5lKHNjZW5lQXNzZXROYW1lLCB2X2lQcmlvcml0eSwgdGhpcy5tX3BMb2FkU2NlbmVDYWxsYmFja3MsIHZfcFVzZXJEYXRhKTtcbiAgICAgICAgfTtcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnByb3RvdHlwZS51bmxvYWRTY2VuZSA9IGZ1bmN0aW9uIChzY2VuZUFzc2V0TmFtZSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGlmICghc2NlbmVBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgbmFtZSBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IHJlc291cmNlIG1hbmFnZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2NlbmVJc1VubG9hZGluZyhzY2VuZUFzc2V0TmFtZSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgJ1wiICsgc2NlbmVBc3NldE5hbWUgKyBcIicgaXMgYmVpbmcgdW5sb2FkZWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2NlbmVJc0xvYWRpbmcoc2NlbmVBc3NldE5hbWUpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjZW5lIGFzc2V0ICdcIiArIHNjZW5lQXNzZXROYW1lICsgXCInIGlzIGJlaW5nIGxvYWRlZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5zY2VuZUlzTG9hZGVkKHNjZW5lQXNzZXROYW1lKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCAnXCIgKyBzY2VuZUFzc2V0TmFtZSArIFwiJyBpcyBhbHJlYWR5IGxvYWRlZC5cIik7XG4gICAgICAgICAgICB1c2VyRGF0YSA9IHVzZXJEYXRhIHx8IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcy5wdXNoKHNjZW5lQXNzZXROYW1lKTtcbiAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyLnVubG9hZFNjZW5lKHNjZW5lQXNzZXROYW1lLCB0aGlzLm1fcFVubG9hZFNjZW5lQ2FsbGJhY2tzLCB1c2VyRGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICAvLyBOT09QLlxuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfMSwgX2E7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BMb2FkZWRTY2VuZUFzc2V0TmFtZXMpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzTmFtZSA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zY2VuZUlzVW5sb2FkaW5nKHNOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy51bmxvYWRTY2VuZShzTmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMV8xKSB7IGVfMSA9IHsgZXJyb3I6IGVfMV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3BMb2FkZWRTY2VuZUFzc2V0TmFtZXMuc3BsaWNlKDAsIHRoaXMubV9wTG9hZGVkU2NlbmVBc3NldE5hbWVzLmxlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXMuc3BsaWNlKDAsIHRoaXMubV9wTG9hZGluZ1NjZW5lQXNzZXROYW1lcy5sZW5ndGgpO1xuICAgICAgICAgICAgdGhpcy5tX3BVbmxvYWRpbmdTY2VuZUFzc2V0TmFtZXMuc3BsaWNlKDAsIHRoaXMubV9wVW5sb2FkaW5nU2NlbmVBc3NldE5hbWVzLmxlbmd0aCk7XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUub25Mb2FkU2NlbmVTdWNjZXNzID0gZnVuY3Rpb24gKHNjZW5lQXNzZXROYW1lLCBkdXJhdGlvbiwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X0lkeDtcbiAgICAgICAgICAgIGlmICgodl9JZHggPSB0aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXMuaW5kZXhPZihzY2VuZUFzc2V0TmFtZSkpID49IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRpbmdTY2VuZUFzc2V0TmFtZXMuc3BsaWNlKHZfSWR4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgodl9JZHggPSB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcy5pbmRleE9mKHNjZW5lQXNzZXROYW1lKSkgPj0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wVW5sb2FkaW5nU2NlbmVBc3NldE5hbWVzLnNwbGljZSh2X0lkeCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcExvYWRlZFNjZW5lQXNzZXROYW1lcy5wdXNoKHNjZW5lQXNzZXROYW1lKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWRTY2VuZVN1Y2Nlc3NEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHNjZW5lQXNzZXROYW1lLCBkdXJhdGlvbiwgdXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLm9uTG9hZFNjZW5lRmFpbHVyZSA9IGZ1bmN0aW9uIChzY2VuZUFzc2V0TmFtZSwgc3RhdHVzLCBlcnJvck1lc3NhZ2UsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9JZHg7XG4gICAgICAgICAgICBpZiAoKHZfSWR4ID0gdGhpcy5tX3BMb2FkaW5nU2NlbmVBc3NldE5hbWVzLmluZGV4T2Yoc2NlbmVBc3NldE5hbWUpKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkaW5nU2NlbmVBc3NldE5hbWVzLnNwbGljZSh2X0lkeCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkU2NlbmVGYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZFNjZW5lRmFpbHVyZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihzY2VuZUFzc2V0TmFtZSwgZXJyb3JNZXNzYWdlLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUub25Mb2FkU2NlbmVVcGRhdGUgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUsIHByb2dyZXNzLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wTG9hZFNjZW5lVXBkYXRlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZFNjZW5lVXBkYXRlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHNjZW5lQXNzZXROYW1lLCBwcm9ncmVzcywgdXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBTY2VuZU1hbmFnZXIucHJvdG90eXBlLm9uTG9hZFNjZW5lRGVwZW5kZW5jeUFzc2V0ID0gZnVuY3Rpb24gKHNjZW5lQXNzZXROYW1lLCBkZXBlbmRlbmN5QXNzZXROYW1lLCBsb2FkZWRDb3VudCwgdG90YWxDb3VudCwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWRTY2VuZURlcGVuZGVuY3lBc3NldERlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRTY2VuZURlcGVuZGVuY3lBc3NldERlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihzY2VuZUFzc2V0TmFtZSwgZGVwZW5kZW5jeUFzc2V0TmFtZSwgbG9hZGVkQ291bnQsIHRvdGFsQ291bnQsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgU2NlbmVNYW5hZ2VyLnByb3RvdHlwZS5vblVubG9hZFNjZW5lU3VjY2VzcyA9IGZ1bmN0aW9uIChzY2VuZUFzc2V0TmFtZSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X0lkeDtcbiAgICAgICAgICAgIGlmICgodl9JZHggPSB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcy5pbmRleE9mKHNjZW5lQXNzZXROYW1lKSkgPj0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wVW5sb2FkaW5nU2NlbmVBc3NldE5hbWVzLnNwbGljZSh2X0lkeCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoKHZfSWR4ID0gdGhpcy5tX3BMb2FkZWRTY2VuZUFzc2V0TmFtZXMuaW5kZXhPZihzY2VuZUFzc2V0TmFtZSkpID49IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRlZFNjZW5lQXNzZXROYW1lcy5zcGxpY2Uodl9JZHgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubV9wVW5sb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wVW5sb2FkU2NlbmVTdWNjZXNzRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHNjZW5lQXNzZXROYW1lLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFNjZW5lTWFuYWdlci5wcm90b3R5cGUub25VbmxvYWRTY2VuZUZhaWx1cmUgPSBmdW5jdGlvbiAoc2NlbmVBc3NldE5hbWUsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9JZHg7XG4gICAgICAgICAgICBpZiAoKHZfSWR4ID0gdGhpcy5tX3BVbmxvYWRpbmdTY2VuZUFzc2V0TmFtZXMuaW5kZXhPZihzY2VuZUFzc2V0TmFtZSkpID49IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFVubG9hZGluZ1NjZW5lQXNzZXROYW1lcy5zcGxpY2Uodl9JZHgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubV9wVW5sb2FkU2NlbmVGYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wVW5sb2FkU2NlbmVGYWlsdXJlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHNjZW5lQXNzZXROYW1lLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBTY2VuZU1hbmFnZXI7XG4gICAgfShCYXNlXzEuRnJhbWV3b3JrTW9kdWxlKSk7IC8vIGNsYXNzIFNjZW5lTWFuYWdlclxuICAgIGV4cG9ydHMuU2NlbmVNYW5hZ2VyID0gU2NlbmVNYW5hZ2VyO1xufSk7XG4iLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbnZhciBfX3ZhbHVlcyA9ICh0aGlzICYmIHRoaXMuX192YWx1ZXMpIHx8IGZ1bmN0aW9uKG8pIHtcbiAgICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xufTtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICB2YXIgQ29uc3RhbnQ7XG4gICAgKGZ1bmN0aW9uIChDb25zdGFudCkge1xuICAgICAgICBDb25zdGFudC5EZWZhdWx0VGltZSA9IDA7XG4gICAgICAgIENvbnN0YW50LkRlZmF1bHRNdXRlID0gZmFsc2U7XG4gICAgICAgIENvbnN0YW50LkRlZmF1bHRMb29wID0gZmFsc2U7XG4gICAgICAgIENvbnN0YW50LkRlZmF1bHRQcmlvcml0eSA9IDA7XG4gICAgICAgIENvbnN0YW50LkRlZmF1bHRWb2x1bWUgPSAxO1xuICAgICAgICBDb25zdGFudC5EZWZhdWx0RmFkZUluU2Vjb25kcyA9IDA7XG4gICAgICAgIENvbnN0YW50LkRlZmF1bHRGYWRlT3V0U2Vjb25kcyA9IDA7XG4gICAgICAgIENvbnN0YW50LkRlZmF1bHRQaXRjaCA9IDE7XG4gICAgICAgIENvbnN0YW50LkRlZmF1bHRQYW5TdGVyZW8gPSAwO1xuICAgICAgICBDb25zdGFudC5EZWZhdWx0U3BhdGlhbEJsZW5kID0gMDtcbiAgICAgICAgQ29uc3RhbnQuRGVmYXVsdE1heERpc3RhbmNlID0gMTAwO1xuICAgICAgICBDb25zdGFudC5EZWZhdWx0RG9wcGxlckxldmVsID0gMTtcbiAgICB9KShDb25zdGFudCA9IGV4cG9ydHMuQ29uc3RhbnQgfHwgKGV4cG9ydHMuQ29uc3RhbnQgPSB7fSkpOyAvLyBuYW1lc3BhY2UgQ29uc3RhbnRcbiAgICB2YXIgU291bmRBZ2VudCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gU291bmRBZ2VudChzb3VuZEdyb3VwLCBzb3VuZEhlbHBlciwgc291bmRBZ2VudEhlbHBlcikge1xuICAgICAgICAgICAgaWYgKCFzb3VuZEdyb3VwKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNvdW5kIGdyb3VwIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCFzb3VuZEhlbHBlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTb3VuZCBoZWxwZXIgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAoIXNvdW5kQWdlbnRIZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU291bmQgYWdlbnQgaGVscGVyIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEdyb3VwID0gc291bmRHcm91cDtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRIZWxwZXIgPSBzb3VuZEhlbHBlcjtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRBZ2VudEhlbHBlciA9IHNvdW5kQWdlbnRIZWxwZXI7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIucmVzZXRTb3VuZEFnZW50LmFkZCh0aGlzLm9uUmVzZXRTb3VuZEFnZW50LCB0aGlzKTtcbiAgICAgICAgICAgIHRoaXMubV9pU2VyaWFsSWQgPSAwO1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEFzc2V0O1xuICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJzb3VuZEdyb3VwXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEdyb3VwOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kQWdlbnQucHJvdG90eXBlLCBcInNlcmlhbElkXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX2lTZXJpYWxJZDsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9pU2VyaWFsSWQgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJpc1BsYXlpbmdcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIuaXNQbGF5aW5nOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kQWdlbnQucHJvdG90eXBlLCBcImxlbmd0aFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5sZW5ndGg7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwidGltZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci50aW1lOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnRpbWUgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJtdXRlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLm11dGU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwibXV0ZUluU291bmRHcm91cFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9iTXV0ZUluU291bmRHcm91cDsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX2JNdXRlSW5Tb3VuZEdyb3VwID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoTXV0ZSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJsb29wXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLmxvb3A7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIubG9vcCA9IHZhbHVlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kQWdlbnQucHJvdG90eXBlLCBcInByaW9yaXR5XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnByaW9yaXR5OyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnByaW9yaXR5ID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwidm9sdW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnZvbHVtZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJ2b2x1bWVJblNvdW5kR3JvdXBcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fZlZvbHVtZUluU291bmRHcm91cDsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX2ZWb2x1bWVJblNvdW5kR3JvdXAgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2hWb2x1bWUoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwicGl0Y2hcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIucGl0Y2g7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIucGl0Y2ggPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJwYW5TdGVyZW9cIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIucGFuU3RlcmVvOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnBhblN0ZXJlbyA9IHZhbHVlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kQWdlbnQucHJvdG90eXBlLCBcInNwYXRpYWxCbGVuZFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5zcGF0aWFsQmxlbmQ7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIuc3BhdGlhbEJsZW5kID0gdmFsdWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRBZ2VudC5wcm90b3R5cGUsIFwibWF4RGlzdGFuY2VcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIubWF4RGlzdGFuY2U7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIubWF4RGlzdGFuY2UgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJkb3BwbGVyTGV2ZWxcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIuZG9wcGxlckxldmVsOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLmRvcHBsZXJMZXZlbCA9IHZhbHVlOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kQWdlbnQucHJvdG90eXBlLCBcImhlbHBlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wU291bmRBZ2VudEhlbHBlcjsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEFnZW50LnByb3RvdHlwZSwgXCJzZXRTb3VuZEFzc2V0VGltZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9mU2V0U291bmRBc3NldFRpbWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBTb3VuZEFnZW50LnByb3RvdHlwZS5wbGF5ID0gZnVuY3Rpb24gKGZhZGVJblNlY29uZHMpIHtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5wbGF5KGZhZGVJblNlY29uZHMgfHwgQ29uc3RhbnQuRGVmYXVsdEZhZGVJblNlY29uZHMpO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZEFnZW50LnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gKGZhZGVPdXRTZWNvbmRzKSB7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIuc3RvcChmYWRlT3V0U2Vjb25kcyB8fCBDb25zdGFudC5EZWZhdWx0RmFkZU91dFNlY29uZHMpO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZEFnZW50LnByb3RvdHlwZS5wYXVzZSA9IGZ1bmN0aW9uIChmYWRlT3V0U2Vjb25kcykge1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnBhdXNlKGZhZGVPdXRTZWNvbmRzIHx8IENvbnN0YW50LkRlZmF1bHRGYWRlT3V0U2Vjb25kcyk7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kQWdlbnQucHJvdG90eXBlLnJlc3VtZSA9IGZ1bmN0aW9uIChmYWRlSW5TZWNvbmRzKSB7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIucmVzdW1lKGZhZGVJblNlY29uZHMgfHwgQ29uc3RhbnQuRGVmYXVsdEZhZGVJblNlY29uZHMpO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZEFnZW50LnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcFNvdW5kQXNzZXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFNvdW5kSGVscGVyLnJlbGVhc2VTb3VuZEFzc2V0KHRoaXMubV9wU291bmRBc3NldCk7XG4gICAgICAgICAgICAgICAgLy8gdGhpcy5tX3BTb3VuZEFzc2V0ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9mU2V0U291bmRBc3NldFRpbWUgPSBOYU47XG4gICAgICAgICAgICB0aGlzLnRpbWUgPSBDb25zdGFudC5EZWZhdWx0VGltZTtcbiAgICAgICAgICAgIHRoaXMubXV0ZUluU291bmRHcm91cCA9IENvbnN0YW50LkRlZmF1bHRNdXRlO1xuICAgICAgICAgICAgdGhpcy5sb29wID0gQ29uc3RhbnQuRGVmYXVsdExvb3A7XG4gICAgICAgICAgICB0aGlzLnByaW9yaXR5ID0gQ29uc3RhbnQuRGVmYXVsdFByaW9yaXR5O1xuICAgICAgICAgICAgdGhpcy52b2x1bWVJblNvdW5kR3JvdXAgPSBDb25zdGFudC5EZWZhdWx0Vm9sdW1lO1xuICAgICAgICAgICAgdGhpcy5waXRjaCA9IENvbnN0YW50LkRlZmF1bHRQaXRjaDtcbiAgICAgICAgICAgIHRoaXMucGFuU3RlcmVvID0gQ29uc3RhbnQuRGVmYXVsdFBhblN0ZXJlbztcbiAgICAgICAgICAgIHRoaXMuc3BhdGlhbEJsZW5kID0gQ29uc3RhbnQuRGVmYXVsdFNwYXRpYWxCbGVuZDtcbiAgICAgICAgICAgIHRoaXMubWF4RGlzdGFuY2UgPSBDb25zdGFudC5EZWZhdWx0TWF4RGlzdGFuY2U7XG4gICAgICAgICAgICB0aGlzLmRvcHBsZXJMZXZlbCA9IENvbnN0YW50LkRlZmF1bHREb3BwbGVyTGV2ZWw7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kQWdlbnRIZWxwZXIucmVzZXQoKTtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRBZ2VudC5wcm90b3R5cGUuc2V0U291bmRBc3NldCA9IGZ1bmN0aW9uIChzb3VuZEFzc2V0KSB7XG4gICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kQXNzZXQgPSBzb3VuZEFzc2V0O1xuICAgICAgICAgICAgdGhpcy5tX2ZTZXRTb3VuZEFzc2V0VGltZSA9IG5ldyBEYXRlKCkudmFsdWVPZigpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5zZXRTb3VuZEFzc2V0KHNvdW5kQXNzZXQpO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZEFnZW50LnByb3RvdHlwZS5yZWZyZXNoTXV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRBZ2VudEhlbHBlci5tdXRlID0gdGhpcy5tX3BTb3VuZEdyb3VwLm11dGUgfHwgdGhpcy5tX2JNdXRlSW5Tb3VuZEdyb3VwO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZEFnZW50LnByb3RvdHlwZS5yZWZyZXNoVm9sdW1lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEFnZW50SGVscGVyLnZvbHVtZSA9IHRoaXMubV9wU291bmRHcm91cC52b2x1bWUgfHwgdGhpcy5tX2ZWb2x1bWVJblNvdW5kR3JvdXA7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kQWdlbnQucHJvdG90eXBlLm9uUmVzZXRTb3VuZEFnZW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gU291bmRBZ2VudDtcbiAgICB9KCkpOyAvLyBjbGFzcyBTb3VuZEFnZW50XG4gICAgZXhwb3J0cy5Tb3VuZEFnZW50ID0gU291bmRBZ2VudDtcbiAgICB2YXIgUGxheVNvdW5kRXJyb3JDb2RlO1xuICAgIChmdW5jdGlvbiAoUGxheVNvdW5kRXJyb3JDb2RlKSB7XG4gICAgICAgIFBsYXlTb3VuZEVycm9yQ29kZVtQbGF5U291bmRFcnJvckNvZGVbXCJVbmtub3duXCJdID0gMF0gPSBcIlVua25vd25cIjtcbiAgICAgICAgUGxheVNvdW5kRXJyb3JDb2RlW1BsYXlTb3VuZEVycm9yQ29kZVtcIlNvdW5kR3JvdXBOb3RFeGlzdFwiXSA9IDFdID0gXCJTb3VuZEdyb3VwTm90RXhpc3RcIjtcbiAgICAgICAgUGxheVNvdW5kRXJyb3JDb2RlW1BsYXlTb3VuZEVycm9yQ29kZVtcIlNvdW5kR3JvdXBIYXNOb0FnZW50XCJdID0gMl0gPSBcIlNvdW5kR3JvdXBIYXNOb0FnZW50XCI7XG4gICAgICAgIFBsYXlTb3VuZEVycm9yQ29kZVtQbGF5U291bmRFcnJvckNvZGVbXCJMb2FkQXNzZXRGYWlsdXJlXCJdID0gM10gPSBcIkxvYWRBc3NldEZhaWx1cmVcIjtcbiAgICAgICAgUGxheVNvdW5kRXJyb3JDb2RlW1BsYXlTb3VuZEVycm9yQ29kZVtcIklnbm9yZUR1ZVRvTG93UHJpb3JpdHlcIl0gPSA0XSA9IFwiSWdub3JlRHVlVG9Mb3dQcmlvcml0eVwiO1xuICAgICAgICBQbGF5U291bmRFcnJvckNvZGVbUGxheVNvdW5kRXJyb3JDb2RlW1wiU2V0U291bmRBc3NldEZhaWx1cmVcIl0gPSA1XSA9IFwiU2V0U291bmRBc3NldEZhaWx1cmVcIjtcbiAgICB9KShQbGF5U291bmRFcnJvckNvZGUgPSBleHBvcnRzLlBsYXlTb3VuZEVycm9yQ29kZSB8fCAoZXhwb3J0cy5QbGF5U291bmRFcnJvckNvZGUgPSB7fSkpOyAvLyBlbnVtIFBsYXlTb3VuZEVycm9yQ29kZVxuICAgIHZhciBTb3VuZEdyb3VwID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBTb3VuZEdyb3VwKG5hbWUsIHNvdW5kR3JvdXBIZWxwZXIpIHtcbiAgICAgICAgICAgIHRoaXMubV9iQXZvaWRCZWluZ1JlcGxhY2VkQnlTYW1lUHJpb3JpdHkgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubV9iTXV0ZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5tX2ZWb2x1bWUgPSAxO1xuICAgICAgICAgICAgaWYgKCFuYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNvdW5kIGdyb3VwIG5hbWUgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAoIXNvdW5kR3JvdXBIZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU291bmQgZ3JvdXAgaGVscGVyIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgdGhpcy5tX3NOYW1lID0gbmFtZTtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRHcm91cEhlbHBlciA9IHNvdW5kR3JvdXBIZWxwZXI7XG4gICAgICAgICAgICB0aGlzLm1fcFNvdW5kQWdlbnRzID0gW107XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kR3JvdXAucHJvdG90eXBlLCBcIm5hbWVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fc05hbWU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRHcm91cC5wcm90b3R5cGUsIFwic291bmRBZ2VudENvdW50XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFNvdW5kQWdlbnRzLmxlbmd0aDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRHcm91cC5wcm90b3R5cGUsIFwiYXZvaWRCZWluZ1JlcGxhY2VkQnlTYW1lUHJpb3JpdHlcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fYkF2b2lkQmVpbmdSZXBsYWNlZEJ5U2FtZVByaW9yaXR5OyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fYkF2b2lkQmVpbmdSZXBsYWNlZEJ5U2FtZVByaW9yaXR5ID0gdmFsdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kR3JvdXAucHJvdG90eXBlLCBcIm11dGVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fYk11dGU7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhciBlXzEsIF9hO1xuICAgICAgICAgICAgICAgIHRoaXMubV9iTXV0ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BTb3VuZEFnZW50cyksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhZ2VudCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWdlbnQucmVmcmVzaE11dGUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV8xXzEpIHsgZV8xID0geyBlcnJvcjogZV8xXzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kR3JvdXAucHJvdG90eXBlLCBcInZvbHVtZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9mVm9sdW1lOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZV8yLCBfYTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fZlZvbHVtZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BTb3VuZEFnZW50cyksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhZ2VudCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWdlbnQucmVmcmVzaFZvbHVtZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzJfMSkgeyBlXzIgPSB7IGVycm9yOiBlXzJfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzIpIHRocm93IGVfMi5lcnJvcjsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRHcm91cC5wcm90b3R5cGUsIFwiaGVscGVyXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEdyb3VwSGVscGVyOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgU291bmRHcm91cC5wcm90b3R5cGUuYWRkU291bmRBZ2VudEhlbHBlciA9IGZ1bmN0aW9uIChzb3VuZEhlbHBlciwgc291bmRBZ2VudEhlbHBlcikge1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEFnZW50cy5wdXNoKG5ldyBTb3VuZEFnZW50KHRoaXMsIHNvdW5kSGVscGVyLCBzb3VuZEFnZW50SGVscGVyKSk7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kR3JvdXAucHJvdG90eXBlLnBsYXlTb3VuZCA9IGZ1bmN0aW9uIChzZXJpYWxJZCwgc291bmRBc3NldCwgcGxheVNvdW5kUGFyYW1zLCBlcnJvckNvZGUpIHtcbiAgICAgICAgICAgIHZhciBlXzMsIF9hO1xuICAgICAgICAgICAgZXJyb3JDb2RlID0gZXJyb3JDb2RlIHx8IHsgY29kZTogMCB9O1xuICAgICAgICAgICAgdmFyIHZfcENhbmRpZGF0ZUFnZW50O1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRBZ2VudHMpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3VuZEFnZW50ID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc291bmRBZ2VudC5pc1BsYXlpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50ID0gc291bmRBZ2VudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VuZEFnZW50LnByaW9yaXR5IDwgcGxheVNvdW5kUGFyYW1zLnByaW9yaXR5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXZfcENhbmRpZGF0ZUFnZW50IHx8IHNvdW5kQWdlbnQucHJpb3JpdHkgPCB2X3BDYW5kaWRhdGVBZ2VudC5wcmlvcml0eSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50ID0gc291bmRBZ2VudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICghdGhpcy5tX2JBdm9pZEJlaW5nUmVwbGFjZWRCeVNhbWVQcmlvcml0eSAmJiBzb3VuZEFnZW50LnByaW9yaXR5ID09IHBsYXlTb3VuZFBhcmFtcy5wcmlvcml0eSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF2X3BDYW5kaWRhdGVBZ2VudCB8fCBzb3VuZEFnZW50LnNldFNvdW5kQXNzZXRUaW1lIDwgdl9wQ2FuZGlkYXRlQWdlbnQuc2V0U291bmRBc3NldFRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudCA9IHNvdW5kQWdlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8zXzEpIHsgZV8zID0geyBlcnJvcjogZV8zXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMykgdGhyb3cgZV8zLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXZfcENhbmRpZGF0ZUFnZW50KSB7XG4gICAgICAgICAgICAgICAgZXJyb3JDb2RlLmNvZGUgPSBQbGF5U291bmRFcnJvckNvZGUuSWdub3JlRHVlVG9Mb3dQcmlvcml0eTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdl9wQ2FuZGlkYXRlQWdlbnQuc2V0U291bmRBc3NldChzb3VuZEFzc2V0KSkge1xuICAgICAgICAgICAgICAgIGVycm9yQ29kZS5jb2RlID0gUGxheVNvdW5kRXJyb3JDb2RlLlNldFNvdW5kQXNzZXRGYWlsdXJlO1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdl9wQ2FuZGlkYXRlQWdlbnQuc2VyaWFsSWQgPSBzZXJpYWxJZDtcbiAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50LnRpbWUgPSBwbGF5U291bmRQYXJhbXMudGltZTtcbiAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50Lm11dGVJblNvdW5kR3JvdXAgPSBwbGF5U291bmRQYXJhbXMubXV0ZUluU291bmRHcm91cDtcbiAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50Lmxvb3AgPSBwbGF5U291bmRQYXJhbXMubG9vcDtcbiAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50LnByaW9yaXR5ID0gcGxheVNvdW5kUGFyYW1zLnByaW9yaXR5O1xuICAgICAgICAgICAgdl9wQ2FuZGlkYXRlQWdlbnQudm9sdW1lSW5Tb3VuZEdyb3VwID0gcGxheVNvdW5kUGFyYW1zLnZvbHVtZUluU291bmRHcm91cDtcbiAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50LnBpdGNoID0gcGxheVNvdW5kUGFyYW1zLnBpdGNoO1xuICAgICAgICAgICAgdl9wQ2FuZGlkYXRlQWdlbnQucGFuU3RlcmVvID0gcGxheVNvdW5kUGFyYW1zLnBhblN0ZXJlbztcbiAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50LnNwYXRpYWxCbGVuZCA9IHBsYXlTb3VuZFBhcmFtcy5zcGF0aWFsQmxlbmQ7XG4gICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudC5tYXhEaXN0YW5jZSA9IHBsYXlTb3VuZFBhcmFtcy5tYXhEaXN0YW5jZTtcbiAgICAgICAgICAgIHZfcENhbmRpZGF0ZUFnZW50LmRvcHBsZXJMZXZlbCA9IHBsYXlTb3VuZFBhcmFtcy5kb3BwbGVyTGV2ZWw7XG4gICAgICAgICAgICB2X3BDYW5kaWRhdGVBZ2VudC5wbGF5KHBsYXlTb3VuZFBhcmFtcy5mYWRlSW5TZWNvbmRzKTtcbiAgICAgICAgICAgIHJldHVybiB2X3BDYW5kaWRhdGVBZ2VudDtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRHcm91cC5wcm90b3R5cGUuc3RvcFNvdW5kID0gZnVuY3Rpb24gKHNlcmlhbElkLCBmYWRlT3V0U2Vjb25kcykge1xuICAgICAgICAgICAgdmFyIGVfNCwgX2E7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BTb3VuZEFnZW50cyksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNvdW5kQWdlbnQgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNvdW5kQWdlbnQuc2VyaWFsSWQgIT0gc2VyaWFsSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNvdW5kQWdlbnQuc3RvcChmYWRlT3V0U2Vjb25kcyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzRfMSkgeyBlXzQgPSB7IGVycm9yOiBlXzRfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV80KSB0aHJvdyBlXzQuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRHcm91cC5wcm90b3R5cGUucGF1c2VTb3VuZCA9IGZ1bmN0aW9uIChzZXJpYWxJZCwgZmFkZU91dFNlY29uZHMpIHtcbiAgICAgICAgICAgIHZhciBlXzUsIF9hO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRBZ2VudHMpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3VuZEFnZW50ID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VuZEFnZW50LnNlcmlhbElkICE9IHNlcmlhbElkKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIHNvdW5kQWdlbnQucGF1c2UoZmFkZU91dFNlY29uZHMpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV81XzEpIHsgZV81ID0geyBlcnJvcjogZV81XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNSkgdGhyb3cgZV81LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kR3JvdXAucHJvdG90eXBlLnJlc3VtZVNvdW5kID0gZnVuY3Rpb24gKHNlcmlhbElkLCBmYWRlSW5TZWNvbmRzKSB7XG4gICAgICAgICAgICB2YXIgZV82LCBfYTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFNvdW5kQWdlbnRzKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc291bmRBZ2VudCA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc291bmRBZ2VudC5zZXJpYWxJZCAhPSBzZXJpYWxJZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICBzb3VuZEFnZW50LnJlc3VtZShmYWRlSW5TZWNvbmRzKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfNl8xKSB7IGVfNiA9IHsgZXJyb3I6IGVfNl8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzYpIHRocm93IGVfNi5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZEdyb3VwLnByb3RvdHlwZS5zdG9wQWxsTG9hZGVkU291bmRzID0gZnVuY3Rpb24gKGZhZGVPdXRTZWNvbmRzKSB7XG4gICAgICAgICAgICB2YXIgZV83LCBfYTtcbiAgICAgICAgICAgIGZhZGVPdXRTZWNvbmRzID0gZmFkZU91dFNlY29uZHMgfHwgQ29uc3RhbnQuRGVmYXVsdEZhZGVPdXRTZWNvbmRzO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRBZ2VudHMpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3VuZEFnZW50ID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VuZEFnZW50LmlzUGxheWluZylcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdW5kQWdlbnQuc3RvcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzdfMSkgeyBlXzcgPSB7IGVycm9yOiBlXzdfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV83KSB0aHJvdyBlXzcuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFNvdW5kR3JvdXA7XG4gICAgfSgpKTsgLy8gY2xhc3MgU291bmRHcm91cFxuICAgIGV4cG9ydHMuU291bmRHcm91cCA9IFNvdW5kR3JvdXA7XG4gICAgdmFyIFNvdW5kTWFuYWdlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgX19leHRlbmRzKFNvdW5kTWFuYWdlciwgX3N1cGVyKTtcbiAgICAgICAgZnVuY3Rpb24gU291bmRNYW5hZ2VyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgICAgICAgICBfdGhpcy5tX3BTb3VuZEdyb3VwcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcFNvdW5kc0JlaW5nTG9hZGVkID0gbmV3IFNldCgpO1xuICAgICAgICAgICAgX3RoaXMubV9wU291bmRzVG9SZWxlYXNlT25Mb2FkID0gbmV3IFNldCgpO1xuICAgICAgICAgICAgX3RoaXMubV9wTG9hZEFzc2V0Q2FsbGJhY2tzID0ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IF90aGlzLm9uTG9hZFNvdW5kU3VjY2Vzc0NhbGxiYWNrLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIGZhaWx1cmU6IF90aGlzLm9uTG9hZFNvdW5kRmFpbHVyZUNhbGxiYWNrLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIHVwZGF0ZTogX3RoaXMub25Mb2FkU291bmRVcGRhdGVDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICBkZXBlbmRlbmN5OiBfdGhpcy5vbkxvYWRTb3VuZERlcGVuZGVuY3lBc3NldENhbGxiYWNrLmJpbmQoX3RoaXMpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgX3RoaXMubV9pU2VyaWFsID0gMDtcbiAgICAgICAgICAgIF90aGlzLm1fcFBsYXlTb3VuZFN1Y2Nlc3NEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BQbGF5U291bmRGYWlsdXJlRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wUGxheVNvdW5kVXBkYXRlRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wUGxheVNvdW5kRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZE1hbmFnZXIucHJvdG90eXBlLCBcInNvdW5kR3JvdXBDb3VudFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BTb3VuZEdyb3Vwcy5zaXplO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZE1hbmFnZXIucHJvdG90eXBlLCBcInBsYXlTb3VuZFN1Y2Nlc3NcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUGxheVNvdW5kU3VjY2Vzc0RlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZE1hbmFnZXIucHJvdG90eXBlLCBcInBsYXlTb3VuZEZhaWx1cmVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUGxheVNvdW5kRmFpbHVyZURlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZE1hbmFnZXIucHJvdG90eXBlLCBcInBsYXlTb3VuZFVwZGF0ZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BQbGF5U291bmRVcGRhdGVEZWxlZ2F0ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRNYW5hZ2VyLnByb3RvdHlwZSwgXCJwbGF5U291bmREZXBlbmRlbmN5QXNzZXRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUGxheVNvdW5kRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgU291bmRNYW5hZ2VyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIC8vIE5PT1AuXG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUuc2h1dGRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3BBbGxMb2FkZWRTb3VuZHMoKTtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRHcm91cHMuY2xlYXIoKTtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRzQmVpbmdMb2FkZWQuY2xlYXIoKTtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRzVG9SZWxlYXNlT25Mb2FkLmNsZWFyKCk7XG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZE1hbmFnZXIucHJvdG90eXBlLCBcInJlc291cmNlTWFuYWdlclwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZE1hbmFnZXIucHJvdG90eXBlLCBcInNvdW5kSGVscGVyXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3BTb3VuZEhlbHBlcjsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMubV9wU291bmRIZWxwZXIgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUuaGFzU291bmRHcm91cCA9IGZ1bmN0aW9uIChzb3VuZEdyb3VwTmFtZSkge1xuICAgICAgICAgICAgaWYgKCFzb3VuZEdyb3VwTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTb3VuZCBncm91cCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wU291bmRHcm91cHMuaGFzKHNvdW5kR3JvdXBOYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRNYW5hZ2VyLnByb3RvdHlwZS5nZXRTb3VuZEdyb3VwID0gZnVuY3Rpb24gKHNvdW5kR3JvdXBOYW1lKSB7XG4gICAgICAgICAgICBpZiAoIXNvdW5kR3JvdXBOYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNvdW5kIGdyb3VwIG5hbWUgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BTb3VuZEdyb3Vwcy5nZXQoc291bmRHcm91cE5hbWUpIHx8IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUuZ2V0QWxsU291bmRHcm91cHMgPSBmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgICAgICAgdmFyIGVfOCwgX2E7XG4gICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cyB8fCBbXTtcbiAgICAgICAgICAgIGlmIChyZXN1bHRzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5zcGxpY2UoMCwgcmVzdWx0cy5sZW5ndGgpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRHcm91cHMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3VuZEdyb3VwID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChzb3VuZEdyb3VwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV84XzEpIHsgZV84ID0geyBlcnJvcjogZV84XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfOCkgdGhyb3cgZV84LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRNYW5hZ2VyLnByb3RvdHlwZS5hZGRTb3VuZEdyb3VwID0gZnVuY3Rpb24gKHNvdW5kR3JvdXBOYW1lLCBhbnlBcmcsIHNvdW5kR3JvdXBNdXRlLCBzb3VuZEdyb3VwVm9sdW1lLCBzb3VuZEdyb3VwSGVscGVyKSB7XG4gICAgICAgICAgICBpZiAoIXNvdW5kR3JvdXBOYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNvdW5kIGdyb3VwIG5hbWUgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB2YXIgc291bmRHcm91cEF2b2lkQmVpbmdSZXBsYWNlZEJ5U2FtZVByaW9yaXR5ID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoJ2Jvb2xlYW4nID09PSB0eXBlb2YgYW55QXJnKSB7XG4gICAgICAgICAgICAgICAgc291bmRHcm91cEF2b2lkQmVpbmdSZXBsYWNlZEJ5U2FtZVByaW9yaXR5ID0gYW55QXJnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc291bmRHcm91cEhlbHBlciA9IGFueUFyZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNvdW5kR3JvdXBNdXRlID0gc291bmRHcm91cE11dGUgfHwgQ29uc3RhbnQuRGVmYXVsdE11dGU7XG4gICAgICAgICAgICBzb3VuZEdyb3VwVm9sdW1lID0gc291bmRHcm91cFZvbHVtZSB8fCBDb25zdGFudC5EZWZhdWx0Vm9sdW1lO1xuICAgICAgICAgICAgaWYgKCFzb3VuZEdyb3VwSGVscGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNvdW5kIGdyb3VwIGhlbHBlciBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc1NvdW5kR3JvdXAoc291bmRHcm91cE5hbWUpKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIHZhciB2X3BTb3VuZEdyb3VwID0gbmV3IFNvdW5kR3JvdXAoc291bmRHcm91cE5hbWUsIHNvdW5kR3JvdXBIZWxwZXIpO1xuICAgICAgICAgICAgdl9wU291bmRHcm91cC5hdm9pZEJlaW5nUmVwbGFjZWRCeVNhbWVQcmlvcml0eSA9IHNvdW5kR3JvdXBBdm9pZEJlaW5nUmVwbGFjZWRCeVNhbWVQcmlvcml0eTtcbiAgICAgICAgICAgIHZfcFNvdW5kR3JvdXAubXV0ZSA9IHNvdW5kR3JvdXBNdXRlO1xuICAgICAgICAgICAgdl9wU291bmRHcm91cC52b2x1bWUgPSBzb3VuZEdyb3VwVm9sdW1lO1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEdyb3Vwcy5zZXQoc291bmRHcm91cE5hbWUsIHZfcFNvdW5kR3JvdXApO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUuYWRkU291bmRBZ2VudEhlbHBlciA9IGZ1bmN0aW9uIChzb3VuZEdyb3VwTmFtZSwgc291bmRBZ2VudEhlbHBlcikge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1fcFNvdW5kSGVscGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IHNldCBzb3VuZCBoZWxwZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgdmFyIHZfcFNvdW5kR3JvdXAgPSB0aGlzLmdldFNvdW5kR3JvdXAoc291bmRHcm91cE5hbWUpO1xuICAgICAgICAgICAgaWYgKCF2X3BTb3VuZEdyb3VwKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNvdW5kIGdyb3VwICdcIiArIHNvdW5kR3JvdXBOYW1lICsgXCInIGlzIG5vdCBleGlzdC5cIik7XG4gICAgICAgICAgICB2X3BTb3VuZEdyb3VwLmFkZFNvdW5kQWdlbnRIZWxwZXIodGhpcy5tX3BTb3VuZEhlbHBlciwgc291bmRBZ2VudEhlbHBlcik7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUuZ2V0QWxsTG9hZGluZ1NvdW5kU2VyaWFsSWRzID0gZnVuY3Rpb24gKHJlc3VsdHMpIHtcbiAgICAgICAgICAgIHZhciB2X3BSZXQgPSByZXN1bHRzIHx8IFtdO1xuICAgICAgICAgICAgdl9wUmV0LnNwbGljZSgwLCB2X3BSZXQubGVuZ3RoKTtcbiAgICAgICAgICAgIHRoaXMubV9wU291bmRzQmVpbmdMb2FkZWQuZm9yRWFjaChmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgIHZfcFJldC5wdXNoKHYpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdl9wUmV0O1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLmlzTG9hZGluZ1NvdW5kID0gZnVuY3Rpb24gKHNlcmlhbElkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BTb3VuZHNCZWluZ0xvYWRlZC5oYXMoc2VyaWFsSWQpO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLnBsYXlTb3VuZCA9IGZ1bmN0aW9uIChzb3VuZEFzc2V0TmFtZSwgc291bmRHcm91cE5hbWUsIGFueUFyZzEsIGFueUFyZzIsIGFueUFyZzMpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IHJlc291cmNlIG1hbmFnZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1fcFNvdW5kSGVscGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IHNldCBzb3VuZCBoZWxwZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgdmFyIHByaW9yaXR5ID0gQ29uc3RhbnQuRGVmYXVsdFByaW9yaXR5O1xuICAgICAgICAgICAgdmFyIHBsYXlTb3VuZFBhcmFtcyA9IG51bGw7XG4gICAgICAgICAgICB2YXIgdXNlckRhdGEgPSBudWxsO1xuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2YgYW55QXJnMSkge1xuICAgICAgICAgICAgICAgICAgICBwcmlvcml0eSA9IGFueUFyZzE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHVuZGVmaW5lZCAhPSBhbnlBcmcxKSB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXlTb3VuZFBhcmFtcyA9IGFueUFyZzE7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJEYXRhID0gYW55QXJnMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gNCkge1xuICAgICAgICAgICAgICAgICAgICBwbGF5U291bmRQYXJhbXMgPSBhbnlBcmcyO1xuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YSA9IGFueUFyZzI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gNSkge1xuICAgICAgICAgICAgICAgICAgICBwbGF5U291bmRQYXJhbXMgPSBhbnlBcmcyO1xuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YSA9IGFueUFyZzM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZfaVNlcmlhbElkID0gdGhpcy5tX2lTZXJpYWwrKztcbiAgICAgICAgICAgIHZhciB2X3BFcnJvckNvZGU7XG4gICAgICAgICAgICB2YXIgdl9zRXJyb3JNZXNzYWdlO1xuICAgICAgICAgICAgdmFyIHZfcFNvdW5kR3JvdXAgPSB0aGlzLmdldFNvdW5kR3JvdXAoc291bmRHcm91cE5hbWUpO1xuICAgICAgICAgICAgaWYgKCF2X3BTb3VuZEdyb3VwKSB7XG4gICAgICAgICAgICAgICAgdl9wRXJyb3JDb2RlID0gUGxheVNvdW5kRXJyb3JDb2RlLlNvdW5kR3JvdXBOb3RFeGlzdDtcbiAgICAgICAgICAgICAgICB2X3NFcnJvck1lc3NhZ2UgPSBcIlNvdW5kIGdyb3VwICdcIiArIHNvdW5kR3JvdXBOYW1lICsgXCInIGlzIG5vdCBleGlzdC5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHZfcFNvdW5kR3JvdXAuc291bmRBZ2VudENvdW50IDw9IDApIHtcbiAgICAgICAgICAgICAgICB2X3BFcnJvckNvZGUgPSBQbGF5U291bmRFcnJvckNvZGUuU291bmRHcm91cEhhc05vQWdlbnQ7XG4gICAgICAgICAgICAgICAgdl9zRXJyb3JNZXNzYWdlID0gXCJTb3VuZCBncm91cCAnXCIgKyBzb3VuZEdyb3VwTmFtZSArIFwiJyBpcyBoYXZlIG5vIHNvdW5kIGFnZW50LlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHZfcEVycm9yQ29kZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fcFBsYXlTb3VuZEZhaWx1cmVEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wUGxheVNvdW5kRmFpbHVyZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4odl9pU2VyaWFsSWQsIHNvdW5kQXNzZXROYW1lLCBzb3VuZEdyb3VwTmFtZSwgcGxheVNvdW5kUGFyYW1zLCB2X3BFcnJvckNvZGUsIHZfc0Vycm9yTWVzc2FnZSwgdXNlckRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZfaVNlcmlhbElkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Iodl9zRXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wU291bmRzQmVpbmdMb2FkZWQuYWRkKHZfaVNlcmlhbElkKTtcbiAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyLmxvYWRBc3NldChzb3VuZEFzc2V0TmFtZSwgcHJpb3JpdHksIHRoaXMubV9wTG9hZEFzc2V0Q2FsbGJhY2tzLCB7XG4gICAgICAgICAgICAgICAgc2VyaWFsSWQ6IHZfaVNlcmlhbElkLFxuICAgICAgICAgICAgICAgIHNvdW5kR3JvdXA6IHZfcFNvdW5kR3JvdXAsXG4gICAgICAgICAgICAgICAgcGxheVNvdW5kUGFyYW1zOiBwbGF5U291bmRQYXJhbXMsXG4gICAgICAgICAgICAgICAgdXNlckRhdGE6IHVzZXJEYXRhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB2X2lTZXJpYWxJZDtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRNYW5hZ2VyLnByb3RvdHlwZS5zdG9wU291bmQgPSBmdW5jdGlvbiAoc2VyaWFsSWQsIGZhZGVPdXRTZWNvbmRzKSB7XG4gICAgICAgICAgICB2YXIgZV85LCBfYTtcbiAgICAgICAgICAgIGZhZGVPdXRTZWNvbmRzID0gZmFkZU91dFNlY29uZHMgfHwgQ29uc3RhbnQuRGVmYXVsdEZhZGVPdXRTZWNvbmRzO1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nU291bmQoc2VyaWFsSWQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BTb3VuZHNUb1JlbGVhc2VPbkxvYWQuYWRkKHNlcmlhbElkKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFNvdW5kc0JlaW5nTG9hZGVkLmRlbGV0ZShzZXJpYWxJZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BTb3VuZEdyb3Vwcy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNvdW5kR3JvdXAgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNvdW5kR3JvdXAuc3RvcFNvdW5kKHNlcmlhbElkLCBmYWRlT3V0U2Vjb25kcykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfOV8xKSB7IGVfOSA9IHsgZXJyb3I6IGVfOV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzkpIHRocm93IGVfOS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLnN0b3BBbGxMb2FkZWRTb3VuZHMgPSBmdW5jdGlvbiAoZmFkZU91dFNlY29uZHMpIHtcbiAgICAgICAgICAgIHZhciBlXzEwLCBfYTtcbiAgICAgICAgICAgIGZhZGVPdXRTZWNvbmRzID0gZmFkZU91dFNlY29uZHMgfHwgQ29uc3RhbnQuRGVmYXVsdEZhZGVPdXRTZWNvbmRzO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRHcm91cHMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3VuZEdyb3VwID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHNvdW5kR3JvdXAuc3RvcEFsbExvYWRlZFNvdW5kcyhmYWRlT3V0U2Vjb25kcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMTBfMSkgeyBlXzEwID0geyBlcnJvcjogZV8xMF8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEwKSB0aHJvdyBlXzEwLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUuc3RvcEFsbExvYWRpbmdTb3VuZHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZV8xMSwgX2E7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BTb3VuZHNCZWluZ0xvYWRlZC52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlcmlhbElkID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wU291bmRzVG9SZWxlYXNlT25Mb2FkLmFkZChzZXJpYWxJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMTFfMSkgeyBlXzExID0geyBlcnJvcjogZV8xMV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzExKSB0aHJvdyBlXzExLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUucGF1c2VTb3VuZCA9IGZ1bmN0aW9uIChzZXJpYWxJZCwgZmFkZU91dFNlY29uZHMpIHtcbiAgICAgICAgICAgIHZhciBlXzEyLCBfYTtcbiAgICAgICAgICAgIGZhZGVPdXRTZWNvbmRzID0gZmFkZU91dFNlY29uZHMgfHwgQ29uc3RhbnQuRGVmYXVsdEZhZGVPdXRTZWNvbmRzO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRHcm91cHMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3VuZEdyb3VwID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VuZEdyb3VwLnBhdXNlU291bmQoc2VyaWFsSWQsIGZhZGVPdXRTZWNvbmRzKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xMl8xKSB7IGVfMTIgPSB7IGVycm9yOiBlXzEyXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMTIpIHRocm93IGVfMTIuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgZmluZCBzb3VuZCAnXCIgKyBzZXJpYWxJZCArIFwiJy5cIik7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUucmVzdW1lU291bmQgPSBmdW5jdGlvbiAoc2VyaWFsSWQsIGZhZGVJblNlY29uZHMpIHtcbiAgICAgICAgICAgIHZhciBlXzEzLCBfYTtcbiAgICAgICAgICAgIGZhZGVJblNlY29uZHMgPSBmYWRlSW5TZWNvbmRzIHx8IENvbnN0YW50LkRlZmF1bHRGYWRlSW5TZWNvbmRzO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wU291bmRHcm91cHMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3VuZEdyb3VwID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VuZEdyb3VwLnJlc3VtZVNvdW5kKHNlcmlhbElkLCBmYWRlSW5TZWNvbmRzKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xM18xKSB7IGVfMTMgPSB7IGVycm9yOiBlXzEzXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMTMpIHRocm93IGVfMTMuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgZmluZCBzb3VuZCAnXCIgKyBzZXJpYWxJZCArIFwiJy5cIik7XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUub25Mb2FkU291bmRTdWNjZXNzQ2FsbGJhY2sgPSBmdW5jdGlvbiAoc291bmRBc3NldE5hbWUsIHNvdW5kQXNzZXQsIGR1cmF0aW9uLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmICghdl9wSW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQbGF5IHNvdW5kIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BTb3VuZHNUb1JlbGVhc2VPbkxvYWQuaGFzKHZfcEluZm8uc2VyaWFsSWQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BTb3VuZHNUb1JlbGVhc2VPbkxvYWQuZGVsZXRlKHZfcEluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wU291bmRzQmVpbmdMb2FkZWQuZGVsZXRlKHZfcEluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgdmFyIHZfcEVycm9yQ29kZU91dCA9IHsgY29kZTogMCB9O1xuICAgICAgICAgICAgdmFyIHZfcFNvdW5kQWdlbnQgPSB2X3BJbmZvLnNvdW5kR3JvdXAucGxheVNvdW5kKHZfcEluZm8uc2VyaWFsSWQsIHNvdW5kQXNzZXQsIHZfcEluZm8ucGxheVNvdW5kUGFyYW1zLCB2X3BFcnJvckNvZGVPdXQpO1xuICAgICAgICAgICAgaWYgKCF2X3BTb3VuZEFnZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubV9wUGxheVNvdW5kU3VjY2Vzc0RlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BQbGF5U291bmRTdWNjZXNzRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEluZm8pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbih2X3BJbmZvLnNlcmlhbElkLCBzb3VuZEFzc2V0TmFtZSwgdl9wU291bmRBZ2VudCwgZHVyYXRpb24sIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZHNUb1JlbGVhc2VPbkxvYWQuZGVsZXRlKHZfcEluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZEhlbHBlci5yZWxlYXNlU291bmRBc3NldChzb3VuZEFzc2V0KTtcbiAgICAgICAgICAgIHZhciB2X3NFcnJvck1lc3NhZ2UgPSBcIlNvdW5kIGdyb3VwICdcIiArIHZfcEluZm8uc291bmRHcm91cC5uYW1lICsgXCInIHBsYXkgc291bmQgJ1wiICsgc291bmRBc3NldE5hbWUgKyBcIicgZmFpbHVyZS5cIjtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcFBsYXlTb3VuZEZhaWx1cmVEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BQbGF5U291bmRGYWlsdXJlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAodl9wSW5mbylcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4odl9wSW5mby5zZXJpYWxJZCwgc291bmRBc3NldE5hbWUsIHZfcEluZm8uc291bmRHcm91cC5uYW1lLCB2X3BJbmZvLnBsYXlTb3VuZFBhcmFtcywgdl9wRXJyb3JDb2RlT3V0LmNvZGUsIHZfc0Vycm9yTWVzc2FnZSwgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Iodl9zRXJyb3JNZXNzYWdlKTtcbiAgICAgICAgfTtcbiAgICAgICAgU291bmRNYW5hZ2VyLnByb3RvdHlwZS5vbkxvYWRTb3VuZEZhaWx1cmVDYWxsYmFjayA9IGZ1bmN0aW9uIChzb3VuZEFzc2V0TmFtZSwgc3RhdHVzLCBlcnJvck1lc3NhZ2UsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKCF2X3BJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBsYXkgc291bmQgaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcFNvdW5kc1RvUmVsZWFzZU9uTG9hZC5oYXModl9wSW5mby5zZXJpYWxJZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFNvdW5kc1RvUmVsZWFzZU9uTG9hZC5kZWxldGUodl9wSW5mby5zZXJpYWxJZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3BTb3VuZHNCZWluZ0xvYWRlZC5kZWxldGUodl9wSW5mby5zZXJpYWxJZCk7XG4gICAgICAgICAgICB2YXIgdl9zRXJyb3JNZXNzYWdlID0gXCJMb2FkIHNvdW5kIGZhaWx1cmUsIGFzc2V0IG5hbWUgJ1wiICsgc291bmRBc3NldE5hbWUgKyBcIicsIHN0YXR1cyAnXCIgKyBzdGF0dXMgKyBcIicsIGVycm9yIG1lc3NhZ2UgJ1wiICsgZXJyb3JNZXNzYWdlICsgXCInXCI7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BQbGF5U291bmRGYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wUGxheVNvdW5kRmFpbHVyZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEluZm8pXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHZfcEluZm8uc2VyaWFsSWQsIHNvdW5kQXNzZXROYW1lLCB2X3BJbmZvLnNvdW5kR3JvdXAubmFtZSwgdl9wSW5mby5wbGF5U291bmRQYXJhbXMsIFBsYXlTb3VuZEVycm9yQ29kZS5Mb2FkQXNzZXRGYWlsdXJlLCB2X3NFcnJvck1lc3NhZ2UsIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih2X3NFcnJvck1lc3NhZ2UpO1xuICAgICAgICB9O1xuICAgICAgICBTb3VuZE1hbmFnZXIucHJvdG90eXBlLm9uTG9hZFNvdW5kVXBkYXRlQ2FsbGJhY2sgPSBmdW5jdGlvbiAoc291bmRBc3NldE5hbWUsIHByb2dyZXNzLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmICghdl9wSW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQbGF5IHNvdW5kIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BQbGF5U291bmRVcGRhdGVEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BQbGF5U291bmRVcGRhdGVEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2X3BJbmZvKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbih2X3BJbmZvLnNlcmlhbElkLCBzb3VuZEFzc2V0TmFtZSwgdl9wSW5mby5zb3VuZEdyb3VwLm5hbWUsIHZfcEluZm8ucGxheVNvdW5kUGFyYW1zLCBwcm9ncmVzcywgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFNvdW5kTWFuYWdlci5wcm90b3R5cGUub25Mb2FkU291bmREZXBlbmRlbmN5QXNzZXRDYWxsYmFjayA9IGZ1bmN0aW9uIChzb3VuZEFzc2V0TmFtZSwgZGVwZW5kZW5jeUFzc2V0TmFtZSwgbG9hZGVkQ291bnQsIHRvdGFsQ291bnQsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKCF2X3BJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBsYXkgc291bmQgaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcFBsYXlTb3VuZERlcGVuZGVuY3lBc3NldERlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFBsYXlTb3VuZERlcGVuZGVuY3lBc3NldERlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEluZm8pXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKHZfcEluZm8uc2VyaWFsSWQsIHNvdW5kQXNzZXROYW1lLCB2X3BJbmZvLnNvdW5kR3JvdXAubmFtZSwgdl9wSW5mby5wbGF5U291bmRQYXJhbXMsIGRlcGVuZGVuY3lBc3NldE5hbWUsIGxvYWRlZENvdW50LCB0b3RhbENvdW50LCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFNvdW5kTWFuYWdlcjtcbiAgICB9KEJhc2VfMS5GcmFtZXdvcmtNb2R1bGUpKTsgLy8gY2xhc3MgU291bmRNYW5hZ2VyXG4gICAgZXhwb3J0cy5Tb3VuZE1hbmFnZXIgPSBTb3VuZE1hbmFnZXI7XG59KTtcbiIsInZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgICAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xudmFyIF9fdmFsdWVzID0gKHRoaXMgJiYgdGhpcy5fX3ZhbHVlcykgfHwgZnVuY3Rpb24obykge1xuICAgIHZhciBzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciwgbSA9IHMgJiYgb1tzXSwgaSA9IDA7XG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xuICAgICAgICB9XG4gICAgfTtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XG59O1xuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIiwgXCIuL0Jhc2VcIl0sIGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIHZhciBCYXNlXzEgPSByZXF1aXJlKFwiLi9CYXNlXCIpO1xuICAgIHZhciBVSU1hbmFnZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgIF9fZXh0ZW5kcyhVSU1hbmFnZXIsIF9zdXBlcik7XG4gICAgICAgIGZ1bmN0aW9uIFVJTWFuYWdlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICAgICAgX3RoaXMubV9yVUlHcm91cHMgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBfdGhpcy5tX2lTZXJpYWxJZCA9IDA7XG4gICAgICAgICAgICBfdGhpcy5tX2JJc1NodXRkb3duID0gZmFsc2U7XG4gICAgICAgICAgICBfdGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3JVSUZvcm1zVG9SZWxlYXNlT25Mb2FkID0gbmV3IFNldCgpO1xuICAgICAgICAgICAgX3RoaXMubV9wSW5zdGFuY2VQb29sID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgX3RoaXMubV9wUmVjeWNsZVF1ZXVlID0gW107XG4gICAgICAgICAgICBfdGhpcy5tX3BMb2FkQXNzZXRDYWxsYmFja3MgPSB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogX3RoaXMubG9hZFVJRm9ybVN1Y2Nlc3NDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgICAgICBmYWlsdXJlOiBfdGhpcy5sb2FkVUlGb3JtRmFpbHVyZUNhbGxiYWNrLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIHVwZGF0ZTogX3RoaXMubG9hZFVJRm9ybVVwZGF0ZUNhbGxiYWNrLmJpbmQoX3RoaXMpLFxuICAgICAgICAgICAgICAgIGRlcGVuZGVuY3k6IF90aGlzLmxvYWRVSUZvcm1EZXBlbmRlbmN5QXNzZXRDYWxsYmFjay5iaW5kKF90aGlzKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBfdGhpcy5tX3BPcGVuVUlGb3JtU3VjY2Vzc0RlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcE9wZW5VSUZvcm1GYWlsdXJlRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9wT3BlblVJRm9ybVVwZGF0ZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIF90aGlzLm1fcE9wZW5VSUZvcm1EZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICBfdGhpcy5tX3BDbG9zZVVJRm9ybUNvbXBsZXRlRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgX3RoaXMubV9mSW5zdGFuY2VBdXRvUmVsZWFzZUludGVydmFsID0gMDtcbiAgICAgICAgICAgIF90aGlzLm1fdUluc3RhbmNlQ2FwYWNpdHkgPSAwO1xuICAgICAgICAgICAgX3RoaXMubV9mSW5zdGFuY2VFeHBpcmVUaW1lID0gMDtcbiAgICAgICAgICAgIF90aGlzLm1faUluc3RhbmNlUHJpb3JpdHkgPSAwO1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgICAgICAgICAgLy8gcHJpdmF0ZSBmaXJlT3BlblVJRm9ybUNvbXBsZXRlKGVycm9yOiBFcnJvciwgdWlGb3JtQXNzZXROYW1lOiBzdHJpbmcsIHVpRm9ybUFzc2V0OiBvYmplY3QsIGR1cmF0aW9uOiBudW1iZXIsIGluZm86IE9wZW5VSUZvcm1JbmZvKTogdm9pZCB7XG4gICAgICAgICAgICAvLyB0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZC5kZWxldGUoaW5mby5zZXJpYWxJZCk7XG4gICAgICAgICAgICAvLyBpZiAodGhpcy5tX3JVSUZvcm1zVG9SZWxlYXNlT25Mb2FkLmhhcyhpbmZvLnNlcmlhbElkKSkge1xuICAgICAgICAgICAgLy8gdGhpcy5tX3JVSUZvcm1zVG9SZWxlYXNlT25Mb2FkLmRlbGV0ZShpbmZvLnNlcmlhbElkKTtcbiAgICAgICAgICAgIC8vIGlmICghZXJyb3IpXG4gICAgICAgICAgICAvLyB0aGlzLm1fcFVJRm9ybUhlbHBlci5yZWxlYXNlVUlGb3JtKHVpRm9ybUFzc2V0IGFzIG9iamVjdCwgbnVsbCk7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvLyBsZXQgdWlGb3JtOiBJVUlGb3JtID0gbnVsbDtcbiAgICAgICAgICAgIC8vIGlmICghZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIGxldCB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdDogVUlGb3JtSW5zdGFuY2VPYmplY3QgPSBVSUZvcm1JbnN0YW5jZU9iamVjdC5jcmVhdGUodWlGb3JtQXNzZXROYW1lLCB1aUZvcm1Bc3NldCwgdGhpcy5tX3BVSUZvcm1IZWxwZXIuaW5zdGFudGlhdGVVSUZvcm0odWlGb3JtQXNzZXQgYXMgb2JqZWN0KSwgdGhpcy5tX3BVSUZvcm1IZWxwZXIpO1xuICAgICAgICAgICAgLy8gLy8gUmVnaXN0ZXIgdG8gcG9vbCBhbmQgbWFyayBzcGF3biBmbGFnLlxuICAgICAgICAgICAgLy8gaWYgKCF0aGlzLm1fcEluc3RhbmNlUG9vbC5oYXModWlGb3JtQXNzZXROYW1lKSkge1xuICAgICAgICAgICAgLy8gdGhpcy5tX3BJbnN0YW5jZVBvb2wuc2V0KHVpRm9ybUFzc2V0TmFtZSwgW10pO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gbGV0IHZfcEluc3RhbmNlT2JqZWN0czogVUlGb3JtSW5zdGFuY2VPYmplY3RbXSA9IHRoaXMubV9wSW5zdGFuY2VQb29sLmdldCh1aUZvcm1Bc3NldE5hbWUpO1xuICAgICAgICAgICAgLy8gaWYgKHZfcEluc3RhbmNlT2JqZWN0cy5sZW5ndGggPCB0aGlzLm1fdUluc3RhbmNlQ2FwYWNpdHkpIHtcbiAgICAgICAgICAgIC8vIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LnNwYXduID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIHZfcEluc3RhbmNlT2JqZWN0cy5wdXNoKHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0KTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIC8vIHRoaXMub3BlblVJRm9ybUludGVybmFsKGluZm8uc2VyaWFsSWQsIHVpRm9ybUFzc2V0TmFtZSwgaW5mby51aUdyb3VwIGFzIFVJR3JvdXAsIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LnRhcmdldCwgaW5mby5wYXVzZUNvdmVyZWRVSUZvcm0sIHRydWUsIGR1cmF0aW9uLCBpbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBsZXQgZXZlbnRBcmdzOiBPcGVuVUlGb3JtRmFpbHVyZUV2ZW50QXJncyA9IHtcbiAgICAgICAgICAgIC8vIGVycm9yTWVzc2FnZTogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgICAgIC8vIHNlcmlhbElkOiBpbmZvLnNlcmlhbElkLFxuICAgICAgICAgICAgLy8gcGF1c2VDb3ZlcmVkVUlGb3JtOiBpbmZvLnBhdXNlQ292ZXJlZFVJRm9ybSxcbiAgICAgICAgICAgIC8vIHVpR3JvdXBOYW1lOiBpbmZvLnVpR3JvdXAubmFtZSxcbiAgICAgICAgICAgIC8vIHVpRm9ybUFzc2V0TmFtZTogdWlGb3JtQXNzZXROYW1lLFxuICAgICAgICAgICAgLy8gdXNlckRhdGE6IGluZm8udXNlckRhdGFcbiAgICAgICAgICAgIC8vIH07XG4gICAgICAgICAgICAvLyB0aGlzLm1fcE9wZW5VSUZvcm1GYWlsdXJlRGVsZWdhdGUuaXRlcigoY2FsbGJhY2tGbjogT3BlblVJRm9ybUZhaWx1cmVFdmVudEhhbmRsZXIpID0+IHtcbiAgICAgICAgICAgIC8vIGNhbGxiYWNrRm4oZXZlbnRBcmdzKTtcbiAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gcHJpdmF0ZSBmaXJlT3BlblVJRm9ybVByb2dyZXNzKHVpRm9ybUFzc2V0TmFtZTogc3RyaW5nLCBwcm9ncmVzczogbnVtYmVyLCBpbmZvOiBPcGVuVUlGb3JtSW5mbyk6IHZvaWQge1xuICAgICAgICAgICAgLy8gbGV0IGV2ZW50QXJnczogT3BlblVJRm9ybVVwZGF0ZUV2ZW50QXJncyA9IHtcbiAgICAgICAgICAgIC8vIHNlcmlhbElkOiBpbmZvLnNlcmlhbElkLFxuICAgICAgICAgICAgLy8gcGF1c2VDb3ZlcmVkVUlGb3JtOiBpbmZvLnBhdXNlQ292ZXJlZFVJRm9ybSxcbiAgICAgICAgICAgIC8vIHByb2dyZXNzOiBwcm9ncmVzcyxcbiAgICAgICAgICAgIC8vIHVpRm9ybUFzc2V0TmFtZTogdWlGb3JtQXNzZXROYW1lLFxuICAgICAgICAgICAgLy8gdWlHcm91cE5hbWU6IGluZm8udWlHcm91cC5uYW1lLFxuICAgICAgICAgICAgLy8gdXNlckRhdGE6IGluZm8udXNlckRhdGFcbiAgICAgICAgICAgIC8vIH07XG4gICAgICAgICAgICAvLyB0aGlzLm1fcE9wZW5VSUZvcm1VcGRhdGVEZWxlZ2F0ZS5pdGVyKChjYWxsYmFja0ZuOiBPcGVuVUlGb3JtVXBkYXRlRXZlbnRIYW5kbGVyKSA9PiB7XG4gICAgICAgICAgICAvLyBjYWxsYmFja0ZuKGV2ZW50QXJncyk7XG4gICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlNYW5hZ2VyLnByb3RvdHlwZSwgXCJ1aUZvcm1IZWxwZXJcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcFVJRm9ybUhlbHBlcjsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGhlbHBlciBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wVUlGb3JtSGVscGVyID0gdmFsdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJTWFuYWdlci5wcm90b3R5cGUsIFwicmVzb3VyY2VNYW5hZ2VyXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFJlc291cmNlTWFuYWdlcjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChudWxsID09IHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSZXNvdXJjZSBtYW5hZ2VyIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyID0gdmFsdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJTWFuYWdlci5wcm90b3R5cGUsIFwidWlHcm91cENvdW50XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fclVJR3JvdXBzLnNpemU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJTWFuYWdlci5wcm90b3R5cGUsIFwib3BlblVJRm9ybVN1Y2Nlc3NcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcE9wZW5VSUZvcm1TdWNjZXNzRGVsZWdhdGU7IH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlNYW5hZ2VyLnByb3RvdHlwZSwgXCJvcGVuVUlGb3JtRmFpbHVyZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9wT3BlblVJRm9ybUZhaWx1cmVEZWxlZ2F0ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSU1hbmFnZXIucHJvdG90eXBlLCBcIm9wZW5VSUZvcm1VcGRhdGVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcE9wZW5VSUZvcm1VcGRhdGVEZWxlZ2F0ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSU1hbmFnZXIucHJvdG90eXBlLCBcIm9wZW5VSUZvcm1EZXBlbmRlbmN5QXNzZXRcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcE9wZW5VSUZvcm1EZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSU1hbmFnZXIucHJvdG90eXBlLCBcImNsb3NlVUlGb3JtQ29tcGxldGVcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fcENsb3NlVUlGb3JtQ29tcGxldGVEZWxlZ2F0ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSU1hbmFnZXIucHJvdG90eXBlLCBcImluc3RhbmNlQXV0b1JlbGVhc2VJbnRlcnZhbFwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9mSW5zdGFuY2VBdXRvUmVsZWFzZUludGVydmFsOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX2ZJbnN0YW5jZUF1dG9SZWxlYXNlSW50ZXJ2YWwgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSU1hbmFnZXIucHJvdG90eXBlLCBcImluc3RhbmNlQ2FwYWNpdHlcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1fdUluc3RhbmNlQ2FwYWNpdHk7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1fdUluc3RhbmNlQ2FwYWNpdHkgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSU1hbmFnZXIucHJvdG90eXBlLCBcImluc3RhbmNlRXhwaXJlVGltZVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubV9mSW5zdGFuY2VFeHBpcmVUaW1lOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5tX2ZJbnN0YW5jZUV4cGlyZVRpbWUgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSU1hbmFnZXIucHJvdG90eXBlLCBcImluc3RhbmNlUHJpb3JpdHlcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1faUluc3RhbmNlUHJpb3JpdHk7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLm1faUluc3RhbmNlUHJpb3JpdHkgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICB2YXIgZV8xLCBfYSwgZV8yLCBfYjtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2MgPSBfX3ZhbHVlcyh0aGlzLm1fcFJlY3ljbGVRdWV1ZSksIF9kID0gX2MubmV4dCgpOyAhX2QuZG9uZTsgX2QgPSBfYy5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHVpRm9ybSA9IF9kLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5tX3BJbnN0YW5jZVBvb2wuaGFzKHVpRm9ybS51aUZvcm1Bc3NldE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdl9wSW5zdGFuY2VPYmplY3RzID0gdGhpcy5tX3BJbnN0YW5jZVBvb2wuZ2V0KHVpRm9ybS51aUZvcm1Bc3NldE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEluc3RhbmNlT2JqZWN0cyAmJiB2X3BJbnN0YW5jZU9iamVjdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHZfcEluc3RhbmNlT2JqZWN0c18xID0gKGVfMiA9IHZvaWQgMCwgX192YWx1ZXModl9wSW5zdGFuY2VPYmplY3RzKSksIHZfcEluc3RhbmNlT2JqZWN0c18xXzEgPSB2X3BJbnN0YW5jZU9iamVjdHNfMS5uZXh0KCk7ICF2X3BJbnN0YW5jZU9iamVjdHNfMV8xLmRvbmU7IHZfcEluc3RhbmNlT2JqZWN0c18xXzEgPSB2X3BJbnN0YW5jZU9iamVjdHNfMS5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdCA9IHZfcEluc3RhbmNlT2JqZWN0c18xXzEudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodl9wVWlGb3JtSW5zdGFuY2VPYmplY3QuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVpRm9ybS5vblJlY3ljbGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC5zcGF3biA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChlXzJfMSkgeyBlXzIgPSB7IGVycm9yOiBlXzJfMSB9OyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodl9wSW5zdGFuY2VPYmplY3RzXzFfMSAmJiAhdl9wSW5zdGFuY2VPYmplY3RzXzFfMS5kb25lICYmIChfYiA9IHZfcEluc3RhbmNlT2JqZWN0c18xLnJldHVybikpIF9iLmNhbGwodl9wSW5zdGFuY2VPYmplY3RzXzEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8yKSB0aHJvdyBlXzIuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xXzEpIHsgZV8xID0geyBlcnJvcjogZV8xXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9kICYmICFfZC5kb25lICYmIChfYSA9IF9jLnJldHVybikpIF9hLmNhbGwoX2MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BSZWN5Y2xlUXVldWUubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHRoaXMubV9wUmVjeWNsZVF1ZXVlLnNwbGljZSgwLCB0aGlzLm1fcFJlY3ljbGVRdWV1ZS5sZW5ndGgpO1xuICAgICAgICAgICAgLy8gVE9ETzogYXV0byByZWxlYXNlIHByb2Nlc3NpbmcgaGVyZS5cbiAgICAgICAgICAgIHRoaXMubV9yVUlHcm91cHMuZm9yRWFjaChmdW5jdGlvbiAodWlHcm91cCwga2V5KSB7XG4gICAgICAgICAgICAgICAgdmFyIHZfcFVpR3JvdXAgPSB1aUdyb3VwO1xuICAgICAgICAgICAgICAgIHZfcFVpR3JvdXAudXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMubV9iSXNTaHV0ZG93biA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmNsb3NlQWxsTG9hZGVkVUlGb3JtcygpO1xuICAgICAgICAgICAgdGhpcy5tX3BSZWN5Y2xlUXVldWUuc3BsaWNlKDAsIHRoaXMubV9wUmVjeWNsZVF1ZXVlLmxlbmd0aCk7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BJbnN0YW5jZVBvb2wpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEluc3RhbmNlUG9vbC5mb3JFYWNoKGZ1bmN0aW9uIChpbnN0YW5jZU9iamVjdHMsIGtleSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZV8zLCBfYTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlT2JqZWN0cyAmJiBpbnN0YW5jZU9iamVjdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpbnN0YW5jZU9iamVjdHNfMSA9IF9fdmFsdWVzKGluc3RhbmNlT2JqZWN0cyksIGluc3RhbmNlT2JqZWN0c18xXzEgPSBpbnN0YW5jZU9iamVjdHNfMS5uZXh0KCk7ICFpbnN0YW5jZU9iamVjdHNfMV8xLmRvbmU7IGluc3RhbmNlT2JqZWN0c18xXzEgPSBpbnN0YW5jZU9iamVjdHNfMS5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0ID0gaW5zdGFuY2VPYmplY3RzXzFfMS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QucmVsZWFzZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QuY2xlYXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZV8zXzEpIHsgZV8zID0geyBlcnJvcjogZV8zXzEgfTsgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlT2JqZWN0c18xXzEgJiYgIWluc3RhbmNlT2JqZWN0c18xXzEuZG9uZSAmJiAoX2EgPSBpbnN0YW5jZU9iamVjdHNfMS5yZXR1cm4pKSBfYS5jYWxsKGluc3RhbmNlT2JqZWN0c18xKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzMpIHRocm93IGVfMy5lcnJvcjsgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VPYmplY3RzLnNwbGljZSgwLCBpbnN0YW5jZU9iamVjdHMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm1fcEluc3RhbmNlUG9vbC5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wSW5zdGFuY2VQb29sLmNsZWFyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUub3BlblVJRm9ybSA9IGZ1bmN0aW9uICh1aUZvcm1Bc3NldE5hbWUsIHVpR3JvdXBOYW1lLCBwcmlvcml0eSwgcGF1c2VDb3ZlcmVkVUlGb3JtLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgLy8gY2MubG9nKGBbVUlNYW5hZ2VyXSBSZXFldXN0IE9wZW4gVUlGb3JtIGFzc2V0ICcke3VpRm9ybUFzc2V0TmFtZX0nIHdpdGggZ3JvdXAgJyR7dWlHcm91cE5hbWV9JyBvbiBwcmlvcml0eSAnJHtwcmlvcml0eX0nLCBwYXVzZUNvdmVyZWRVSUZvcm06ICR7cGF1c2VDb3ZlcmVkVUlGb3JtfSwgdXNlckRhdGE6ICR7dXNlckRhdGF9YCk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLm1fcFJlc291cmNlTWFuYWdlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgcmVzb3VyY2UgbWFuYWdlciBmaXJzdC5cIik7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLm1fcFVJRm9ybUhlbHBlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgVUkgZm9ybSBoZWxwZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgaWYgKCF1aUZvcm1Bc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGFzc2V0IG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGlmICghdWlHcm91cE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBncm91cCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB2YXIgdl9yVUlHcm91cCA9IHRoaXMuZ2V0VUlHcm91cCh1aUdyb3VwTmFtZSk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3JVSUdyb3VwKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVUkgZ3JvdXAgJ1wiICsgdWlHcm91cE5hbWUgKyBcIicgaXMgbm90IGV4aXN0LlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2X2lTZXJpYWxJZCA9ICsrdGhpcy5tX2lTZXJpYWxJZDtcbiAgICAgICAgICAgIHZhciB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdDtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcEluc3RhbmNlUG9vbC5oYXModWlGb3JtQXNzZXROYW1lKSkge1xuICAgICAgICAgICAgICAgIC8vIEdldCBzcGF3bi5cbiAgICAgICAgICAgICAgICB2YXIgdl9wSW5zdGFuY2VPYmplY3RzID0gdGhpcy5tX3BJbnN0YW5jZVBvb2wuZ2V0KHVpRm9ybUFzc2V0TmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKHZfcEluc3RhbmNlT2JqZWN0cyAmJiB2X3BJbnN0YW5jZU9iamVjdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZfcEluc3RhbmNlT2JqZWN0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEluc3RhbmNlT2JqZWN0c1tpXS5pc1ZhbGlkICYmICF2X3BJbnN0YW5jZU9iamVjdHNbaV0uc3Bhd24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdCA9IHZfcEluc3RhbmNlT2JqZWN0c1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC5zcGF3biA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZC5oYXModl9pU2VyaWFsSWQpKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJLZXkgZHVwbGljYXRlZCB3aXRoOiBcIiArIHZfaVNlcmlhbElkKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZC5zZXQodl9pU2VyaWFsSWQsIHVpRm9ybUFzc2V0TmFtZSk7XG4gICAgICAgICAgICAgICAgLy8gRklYTUU6IGNhbGwgb24gcmVzb3VyY2UgbWFuYWdlciB0byBsb2FkQXNzZXQuXG4gICAgICAgICAgICAgICAgdmFyIHZfck9wZW5VaUZvcm1JbmZvID0ge1xuICAgICAgICAgICAgICAgICAgICBzZXJpYWxJZDogdl9pU2VyaWFsSWQsXG4gICAgICAgICAgICAgICAgICAgIHVpR3JvdXA6IHZfclVJR3JvdXAsXG4gICAgICAgICAgICAgICAgICAgIHBhdXNlQ292ZXJlZFVJRm9ybTogcGF1c2VDb3ZlcmVkVUlGb3JtLFxuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YTogdXNlckRhdGFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyLmxvYWRBc3NldCh1aUZvcm1Bc3NldE5hbWUsIHByaW9yaXR5LCB0aGlzLm1fcExvYWRBc3NldENhbGxiYWNrcywgdl9yT3BlblVpRm9ybUluZm8pO1xuICAgICAgICAgICAgICAgIC8vIGxldCB2X2ZUaW1lU3RhcnQ6IG51bWJlciA9IG5ldyBEYXRlKCkudmFsdWVPZigpO1xuICAgICAgICAgICAgICAgIC8vIGNjLmxvYWRlci5sb2FkUmVzKHVpRm9ybUFzc2V0TmFtZSwgY2MuQXNzZXQsIChjb21wbGV0ZUNvdW50OiBudW1iZXIsIHRvdGFsQ291bnQ6IG51bWJlciwgaXRlbTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gLy8gUHJvZ3Jlc3MgcHJvY2Vzc2luZyB1cGRhdGUuXG4gICAgICAgICAgICAgICAgLy8gLy8gY2Mud2FybihgbG9hZGluZyBwcm9ncmVzczogJHtjb21wbGV0ZUNvdW50fS8ke3RvdGFsQ291bnR9LCBpdGVtOiAke2l0ZW19YCk7XG4gICAgICAgICAgICAgICAgLy8gdGhpcy5maXJlT3BlblVJRm9ybVByb2dyZXNzKHVpRm9ybUFzc2V0TmFtZSwgY29tcGxldGVDb3VudCAvIHRvdGFsQ291bnQsIHZfck9wZW5VaUZvcm1JbmZvKTtcbiAgICAgICAgICAgICAgICAvLyB9LCAoZXJyb3I6IEVycm9yLCByZXNvdXJjZTogb2JqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gY2Mud2FybihgbG9hZFJlcyBjb21wbGV0ZSB3aXRoIGluZm86ICR7dl9yT3BlblVpRm9ybUluZm8uc2VyaWFsSWR9LCAke3Zfck9wZW5VaUZvcm1JbmZvLnVpR3JvdXAubmFtZX0sICR7dWlGb3JtQXNzZXROYW1lfWApO1xuICAgICAgICAgICAgICAgIC8vIC8vIGxvYWQgY29tcGxldGVkLlxuICAgICAgICAgICAgICAgIC8vIHRoaXMuZmlyZU9wZW5VSUZvcm1Db21wbGV0ZShlcnJvciwgdWlGb3JtQXNzZXROYW1lLCByZXNvdXJjZSwgbmV3IERhdGUoKS52YWx1ZU9mKCkgLSB2X2ZUaW1lU3RhcnQsIHZfck9wZW5VaUZvcm1JbmZvKTtcbiAgICAgICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMub3BlblVJRm9ybUludGVybmFsKHZfaVNlcmlhbElkLCB1aUZvcm1Bc3NldE5hbWUsIHZfclVJR3JvdXAsIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LnRhcmdldCwgcGF1c2VDb3ZlcmVkVUlGb3JtLCBmYWxzZSwgMCwgdXNlckRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZfaVNlcmlhbElkO1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmlzTG9hZGluZ1VJRm9ybSA9IGZ1bmN0aW9uIChzZXJpYWxJZE9yQXNzZXROYW1lKSB7XG4gICAgICAgICAgICB2YXIgZV80LCBfYTtcbiAgICAgICAgICAgIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIHNlcmlhbElkT3JBc3NldE5hbWUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkLnZhbHVlcygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHVpRm9ybUFzc2V0TmFtZSA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVpRm9ybUFzc2V0TmFtZSA9PT0gc2VyaWFsSWRPckFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV80XzEpIHsgZV80ID0geyBlcnJvcjogZV80XzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV80KSB0aHJvdyBlXzQuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkLmhhcyhzZXJpYWxJZE9yQXNzZXROYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5nZXRVSUZvcm1zID0gZnVuY3Rpb24gKHVpRm9ybUFzc2V0TmFtZSkge1xuICAgICAgICAgICAgdmFyIGVfNSwgX2E7XG4gICAgICAgICAgICB2YXIgdl9yUmV0ID0gW107XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3JVSUdyb3Vwcy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHVpR3JvdXAgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG51bGwgIT0gdWlHcm91cCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZfcEZvcm1zID0gdWlHcm91cC5nZXRVSUZvcm1zKHVpRm9ybUFzc2V0TmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2X3JSZXQgPSB2X3JSZXQuY29uY2F0KHZfcEZvcm1zKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzVfMSkgeyBlXzUgPSB7IGVycm9yOiBlXzVfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV81KSB0aHJvdyBlXzUuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2X3JSZXQ7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUuZ2V0VUlGb3JtID0gZnVuY3Rpb24gKHNlcmlhbElkT3JBc3NldE5hbWUpIHtcbiAgICAgICAgICAgIHZhciBlXzYsIF9hO1xuICAgICAgICAgICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2Ygc2VyaWFsSWRPckFzc2V0TmFtZSkge1xuICAgICAgICAgICAgICAgIGlmICghc2VyaWFsSWRPckFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGFzc2V0IG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB1aUZvcm07XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3JVSUdyb3Vwcy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHVpR3JvdXAgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCh1aUZvcm0gPSB1aUdyb3VwLmdldFVJRm9ybShzZXJpYWxJZE9yQXNzZXROYW1lKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB1aUZvcm07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV82XzEpIHsgZV82ID0geyBlcnJvcjogZV82XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfNikgdGhyb3cgZV82LmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5oYXNVSUZvcm0gPSBmdW5jdGlvbiAoc2VyaWFsSWRPckFzc2V0TmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGwgIT0gdGhpcy5nZXRVSUZvcm0oc2VyaWFsSWRPckFzc2V0TmFtZSk7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUuY2xvc2VVSUZvcm0gPSBmdW5jdGlvbiAoc2VyaWFsSWRPclVpRm9ybSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB1aUZvcm0gPSBzZXJpYWxJZE9yVWlGb3JtO1xuICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2Ygc2VyaWFsSWRPclVpRm9ybSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzTG9hZGluZ1VJRm9ybShzZXJpYWxJZE9yVWlGb3JtKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNUb1JlbGVhc2VPbkxvYWQuYWRkKHNlcmlhbElkT3JVaUZvcm0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZC5kZWxldGUoc2VyaWFsSWRPclVpRm9ybSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdWlGb3JtID0gdGhpcy5nZXRVSUZvcm0oc2VyaWFsSWRPclVpRm9ybSk7XG4gICAgICAgICAgICAgICAgaWYgKG51bGwgPT0gdWlGb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgZmluZCBVSSBmb3JtICdcIiArIHNlcmlhbElkT3JVaUZvcm0gKyBcIidcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF1aUZvcm0pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB2YXIgdWlHcm91cCA9IHVpRm9ybS51aUdyb3VwO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdWlHcm91cClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGdyb3VwIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB1c2VyRGF0YSA9IHVzZXJEYXRhIHx8IG51bGw7XG4gICAgICAgICAgICB1aUdyb3VwLnJlbW92ZVVJRm9ybSh1aUZvcm0pO1xuICAgICAgICAgICAgdWlGb3JtLm9uQ2xvc2UodGhpcy5tX2JJc1NodXRkb3duLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICB1aUdyb3VwLnJlZnJlc2goKTtcbiAgICAgICAgICAgIHZhciBldmVudEFyZ3MgPSB7XG4gICAgICAgICAgICAgICAgc2VyaWFsSWQ6IHVpRm9ybS5zZXJpYWxJZCxcbiAgICAgICAgICAgICAgICB1aUdyb3VwOiB1aUdyb3VwLFxuICAgICAgICAgICAgICAgIHVpRm9ybUFzc2V0TmFtZTogdWlGb3JtLnVpRm9ybUFzc2V0TmFtZSxcbiAgICAgICAgICAgICAgICB1c2VyRGF0YTogdXNlckRhdGFcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLm1fcENsb3NlVUlGb3JtQ29tcGxldGVEZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2tGbihldmVudEFyZ3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLm1fcFJlY3ljbGVRdWV1ZS5wdXNoKHVpRm9ybSk7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUuZ2V0QWxsTG9hZGVkVUlGb3JtcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBlXzcsIF9hO1xuICAgICAgICAgICAgdmFyIHZfcFJldCA9IFtdO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9yVUlHcm91cHMudmFsdWVzKCkpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB1aUdyb3VwID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHZfcFJldC5jb25jYXQodWlHcm91cC5nZXRBbGxVSUZvcm1zKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzdfMSkgeyBlXzcgPSB7IGVycm9yOiBlXzdfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV83KSB0aHJvdyBlXzcuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2X3BSZXQ7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUuY2xvc2VBbGxMb2FkZWRVSUZvcm1zID0gZnVuY3Rpb24gKHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgZV84LCBfYTtcbiAgICAgICAgICAgIHZhciB2X3BVSUZvcm1zID0gdGhpcy5nZXRBbGxMb2FkZWRVSUZvcm1zKCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHZfcFVJRm9ybXNfMSA9IF9fdmFsdWVzKHZfcFVJRm9ybXMpLCB2X3BVSUZvcm1zXzFfMSA9IHZfcFVJRm9ybXNfMS5uZXh0KCk7ICF2X3BVSUZvcm1zXzFfMS5kb25lOyB2X3BVSUZvcm1zXzFfMSA9IHZfcFVJRm9ybXNfMS5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHVpRm9ybSA9IHZfcFVJRm9ybXNfMV8xLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaGFzVUlGb3JtKHVpRm9ybS5zZXJpYWxJZCkpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZVVJRm9ybSh1aUZvcm0sIHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV84XzEpIHsgZV84ID0geyBlcnJvcjogZV84XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZfcFVJRm9ybXNfMV8xICYmICF2X3BVSUZvcm1zXzFfMS5kb25lICYmIChfYSA9IHZfcFVJRm9ybXNfMS5yZXR1cm4pKSBfYS5jYWxsKHZfcFVJRm9ybXNfMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV84KSB0aHJvdyBlXzguZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5jbG9zZUFsbExvYWRpbmdVSUZvcm1zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVfOSwgX2E7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQua2V5cygpKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2VyaWFsSWQgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3JVSUZvcm1zVG9SZWxlYXNlT25Mb2FkLmFkZChzZXJpYWxJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfOV8xKSB7IGVfOSA9IHsgZXJyb3I6IGVfOV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzkpIHRocm93IGVfOS5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQuY2xlYXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5yZWZvY3VzVUlGb3JtID0gZnVuY3Rpb24gKHVpRm9ybSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IHVpRm9ybSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGZvcm0gaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHZhciB1aUdyb3VwID0gdWlGb3JtLnVpR3JvdXA7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB1aUdyb3VwKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZ3JvdXAgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHVzZXJEYXRhID0gdXNlckRhdGEgfHwgbnVsbDtcbiAgICAgICAgICAgIHVpR3JvdXAucmVmb2N1c1VJRm9ybSh1aUZvcm0sIHVzZXJEYXRhKTtcbiAgICAgICAgICAgIHVpR3JvdXAucmVmcmVzaCgpO1xuICAgICAgICAgICAgdWlGb3JtLm9uUmVmb2N1cyh1c2VyRGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUuaGFzVUlHcm91cCA9IGZ1bmN0aW9uICh1aUdyb3VwTmFtZSkge1xuICAgICAgICAgICAgaWYgKCF1aUdyb3VwTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGdyb3VwIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fclVJR3JvdXBzLmhhcyh1aUdyb3VwTmFtZSk7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUuZ2V0VUlHcm91cCA9IGZ1bmN0aW9uICh1aUdyb3VwTmFtZSkge1xuICAgICAgICAgICAgaWYgKCF1aUdyb3VwTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGdyb3VwIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fclVJR3JvdXBzLmdldCh1aUdyb3VwTmFtZSkgfHwgbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5hZGRVSUdyb3VwID0gZnVuY3Rpb24gKHVpR3JvdXBOYW1lLCBhcmcxLCBhcmcyKSB7XG4gICAgICAgICAgICBpZiAoIXVpR3JvdXBOYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZ3JvdXAgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdmFyIHVpR3JvdXBEZXB0aCA9IDA7XG4gICAgICAgICAgICB2YXIgdWlHcm91cEhlbHBlcjtcbiAgICAgICAgICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIGFyZzEpIHtcbiAgICAgICAgICAgICAgICB1aUdyb3VwRGVwdGggPSBhcmcxO1xuICAgICAgICAgICAgICAgIGlmICh1bmRlZmluZWQgIT0gYXJnMikge1xuICAgICAgICAgICAgICAgICAgICB1aUdyb3VwSGVscGVyID0gYXJnMjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB1aUdyb3VwSGVscGVyID0gYXJnMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdWlHcm91cEhlbHBlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGdyb3VwIGhlbHBlciBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgaWYgKHRoaXMuaGFzVUlHcm91cCh1aUdyb3VwTmFtZSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5tX3JVSUdyb3Vwcy5zZXQodWlHcm91cE5hbWUsIG5ldyBVSUdyb3VwKHVpR3JvdXBOYW1lLCB1aUdyb3VwRGVwdGgsIHVpR3JvdXBIZWxwZXIpKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLm9wZW5VSUZvcm1JbnRlcm5hbCA9IGZ1bmN0aW9uIChzZXJpYWxJZCwgdWlGb3JtQXNzZXROYW1lLCB1aUdyb3VwLCB1aUZvcm1JbnN0YW5jZSwgcGF1c2VDb3ZlcmVkVUlGb3JtLCBpc05ld0luc3RhbmNlLCBkdXJhdGlvbiwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB1aUZvcm0gPSB0aGlzLm1fcFVJRm9ybUhlbHBlci5jcmVhdGVVSUZvcm0odWlGb3JtSW5zdGFuY2UsIHVpR3JvdXAsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHVpRm9ybSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBub3QgY3JlYXRlIFVJIGZvcm0gaW4gaGVscGVyLicpO1xuICAgICAgICAgICAgdWlGb3JtLm9uSW5pdChzZXJpYWxJZCwgdWlGb3JtQXNzZXROYW1lLCB1aUdyb3VwLCBwYXVzZUNvdmVyZWRVSUZvcm0sIGlzTmV3SW5zdGFuY2UsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgIHVpR3JvdXAuYWRkVUlGb3JtKHVpRm9ybSk7XG4gICAgICAgICAgICB1aUZvcm0ub25PcGVuKHVzZXJEYXRhKTtcbiAgICAgICAgICAgIHVpR3JvdXAucmVmcmVzaCgpO1xuICAgICAgICAgICAgdmFyIGV2ZW50QXJncyA9IHtcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24sXG4gICAgICAgICAgICAgICAgdWlGb3JtOiB1aUZvcm0sXG4gICAgICAgICAgICAgICAgdXNlckRhdGE6IHVzZXJEYXRhXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5tX3BPcGVuVUlGb3JtU3VjY2Vzc0RlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGV2ZW50QXJncyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5sb2FkVUlGb3JtU3VjY2Vzc0NhbGxiYWNrID0gZnVuY3Rpb24gKHVpRm9ybUFzc2V0TmFtZSwgdWlGb3JtQXNzZXQsIGR1cmF0aW9uLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcEluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiT3BlbiBVSSBmb3JtIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3JVSUZvcm1zVG9SZWxlYXNlT25Mb2FkLmhhcyh2X3BJbmZvLnNlcmlhbElkKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZC5kZWxldGUodl9wSW5mby5zZXJpYWxJZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1IZWxwZXIucmVsZWFzZVVJRm9ybSh1aUZvcm1Bc3NldCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQuZGVsZXRlKHZfcEluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgdmFyIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0ID0gVUlGb3JtSW5zdGFuY2VPYmplY3QuY3JlYXRlKHVpRm9ybUFzc2V0TmFtZSwgdWlGb3JtQXNzZXQsIHRoaXMubV9wVUlGb3JtSGVscGVyLmluc3RhbnRpYXRlVUlGb3JtKHVpRm9ybUFzc2V0KSwgdGhpcy5tX3BVSUZvcm1IZWxwZXIpO1xuICAgICAgICAgICAgLy8gUmVnaXN0ZXIgdG8gcG9vbCBhbmQgbWFyayBzcGF3biBmbGFnLlxuICAgICAgICAgICAgaWYgKCF0aGlzLm1fcEluc3RhbmNlUG9vbC5oYXModWlGb3JtQXNzZXROYW1lKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wSW5zdGFuY2VQb29sLnNldCh1aUZvcm1Bc3NldE5hbWUsIFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2X3BJbnN0YW5jZU9iamVjdHMgPSB0aGlzLm1fcEluc3RhbmNlUG9vbC5nZXQodWlGb3JtQXNzZXROYW1lKTtcbiAgICAgICAgICAgIGlmICh2X3BJbnN0YW5jZU9iamVjdHMgJiYgdl9wSW5zdGFuY2VPYmplY3RzLmxlbmd0aCA8IHRoaXMubV91SW5zdGFuY2VDYXBhY2l0eSkge1xuICAgICAgICAgICAgICAgIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LnNwYXduID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB2X3BJbnN0YW5jZU9iamVjdHMucHVzaCh2X3BVaUZvcm1JbnN0YW5jZU9iamVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm9wZW5VSUZvcm1JbnRlcm5hbCh2X3BJbmZvLnNlcmlhbElkLCB1aUZvcm1Bc3NldE5hbWUsIHZfcEluZm8udWlHcm91cCwgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QudGFyZ2V0LCB2X3BJbmZvLnBhdXNlQ292ZXJlZFVJRm9ybSwgdHJ1ZSwgZHVyYXRpb24sIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICB9O1xuICAgICAgICBVSU1hbmFnZXIucHJvdG90eXBlLmxvYWRVSUZvcm1GYWlsdXJlQ2FsbGJhY2sgPSBmdW5jdGlvbiAodWlGb3JtQXNzZXROYW1lLCBzdGF0dXMsIGVycm9yTWVzc2FnZSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk9wZW4gVUkgZm9ybSBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZC5oYXModl9wSW5mby5zZXJpYWxJZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNUb1JlbGVhc2VPbkxvYWQuZGVsZXRlKHZfcEluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkLmRlbGV0ZSh2X3BJbmZvLnNlcmlhbElkKTtcbiAgICAgICAgICAgIHZhciBhcHBlbmRFcnJvck1lc3NhZ2UgPSBcIkxvYWQgVUkgZm9ybSBmYWlsdXJlLCBhc3NldCBuYW1lICdcIiArIHVpRm9ybUFzc2V0TmFtZSArIFwiJywgc3RhdHVzICdcIiArIHN0YXR1cy50b1N0cmluZygpICsgXCInLCBlcnJvciBtZXNzYWdlICdcIiArIGVycm9yTWVzc2FnZSArIFwiJy5cIjtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcE9wZW5VSUZvcm1GYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHZhciBldmVudEFyZ3NfMSA9IHtcbiAgICAgICAgICAgICAgICAgICAgc2VyaWFsSWQ6IHZfcEluZm8uc2VyaWFsSWQsXG4gICAgICAgICAgICAgICAgICAgIHVpRm9ybUFzc2V0TmFtZTogdWlGb3JtQXNzZXROYW1lLFxuICAgICAgICAgICAgICAgICAgICB1aUdyb3VwTmFtZTogdl9wSW5mby51aUdyb3VwLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYXBwZW5kRXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBwYXVzZUNvdmVyZWRVSUZvcm06IHZfcEluZm8ucGF1c2VDb3ZlcmVkVUlGb3JtLFxuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YTogdl9wSW5mby51c2VyRGF0YVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BPcGVuVUlGb3JtRmFpbHVyZURlbGVnYXRlLml0ZXIoZnVuY3Rpb24gKGNhbGxiYWNrRm4pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihldmVudEFyZ3NfMSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGFwcGVuZEVycm9yTWVzc2FnZSk7XG4gICAgICAgIH07XG4gICAgICAgIFVJTWFuYWdlci5wcm90b3R5cGUubG9hZFVJRm9ybVVwZGF0ZUNhbGxiYWNrID0gZnVuY3Rpb24gKHVpRm9ybUFzc2V0TmFtZSwgcHJvZ3Jlc3MsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wSW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJPcGVuIFVJIGZvcm0gaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcE9wZW5VSUZvcm1VcGRhdGVEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50QXJnc18yID0ge1xuICAgICAgICAgICAgICAgICAgICBzZXJpYWxJZDogdl9wSW5mby5zZXJpYWxJZCxcbiAgICAgICAgICAgICAgICAgICAgdWlGb3JtQXNzZXROYW1lOiB1aUZvcm1Bc3NldE5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHVpR3JvdXBOYW1lOiB2X3BJbmZvLnVpR3JvdXAubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IHByb2dyZXNzLFxuICAgICAgICAgICAgICAgICAgICBwYXVzZUNvdmVyZWRVSUZvcm06IHZfcEluZm8ucGF1c2VDb3ZlcmVkVUlGb3JtLFxuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YTogdl9wSW5mby51c2VyRGF0YVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BPcGVuVUlGb3JtVXBkYXRlRGVsZWdhdGUuaXRlcihmdW5jdGlvbiAoY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGV2ZW50QXJnc18yKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgVUlNYW5hZ2VyLnByb3RvdHlwZS5sb2FkVUlGb3JtRGVwZW5kZW5jeUFzc2V0Q2FsbGJhY2sgPSBmdW5jdGlvbiAodWlGb3JtQXNzZXROYW1lLCBkZXBlbmRlbmN5QXNzZXROYW1lLCBsb2FkZWRDb3VudCwgdG90YWxDb3VudCwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk9wZW4gVUkgZm9ybSBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wT3BlblVJRm9ybURlcGVuZGVuY3lBc3NldERlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnRBcmdzXzMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHNlcmlhbElkOiB2X3BJbmZvLnNlcmlhbElkLFxuICAgICAgICAgICAgICAgICAgICB1aUZvcm1Bc3NldE5hbWU6IHVpRm9ybUFzc2V0TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdWlHcm91cE5hbWU6IHZfcEluZm8udWlHcm91cC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBkZXBlbmRlbmN5QXNzZXROYW1lOiBkZXBlbmRlbmN5QXNzZXROYW1lLFxuICAgICAgICAgICAgICAgICAgICBsb2FkZWRDb3VudDogbG9hZGVkQ291bnQsXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsQ291bnQ6IHRvdGFsQ291bnQsXG4gICAgICAgICAgICAgICAgICAgIHBhdXNlQ292ZXJlZFVJRm9ybTogdl9wSW5mby5wYXVzZUNvdmVyZWRVSUZvcm0sXG4gICAgICAgICAgICAgICAgICAgIHVzZXJEYXRhOiB2X3BJbmZvLnVzZXJEYXRhXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcE9wZW5VSUZvcm1EZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZS5pdGVyKGZ1bmN0aW9uIChjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oZXZlbnRBcmdzXzMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gVUlNYW5hZ2VyO1xuICAgIH0oQmFzZV8xLkZyYW1ld29ya01vZHVsZSkpOyAvLyBjbGFzcyBVSU1hbmFnZXJcbiAgICBleHBvcnRzLlVJTWFuYWdlciA9IFVJTWFuYWdlcjtcbiAgICB2YXIgVUlGb3JtSW5zdGFuY2VPYmplY3QgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZ1bmN0aW9uIFVJRm9ybUluc3RhbmNlT2JqZWN0KCkge1xuICAgICAgICAgICAgdGhpcy5pc1ZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuc3Bhd24gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBVSUZvcm1JbnN0YW5jZU9iamVjdC5jcmVhdGUgPSBmdW5jdGlvbiAobmFtZSwgdWlGb3JtQXNzZXQsIHVpRm9ybUluc3RhbmNlLCB1aUZvcm1IZWxwZXIpIHtcbiAgICAgICAgICAgIGlmICghdWlGb3JtQXNzZXQpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGFzc2V0IGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBpZiAoIXVpRm9ybUhlbHBlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGZvcm0gaGVscGVyIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB2YXIgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QgPSBuZXcgVUlGb3JtSW5zdGFuY2VPYmplY3QoKTtcbiAgICAgICAgICAgIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0Lm5hbWUgPSBuYW1lO1xuICAgICAgICAgICAgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QudGFyZ2V0ID0gdWlGb3JtSW5zdGFuY2U7XG4gICAgICAgICAgICB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC5tX3BVSUZvcm1Bc3NldCA9IHVpRm9ybUFzc2V0O1xuICAgICAgICAgICAgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QubV9wVUlGb3JtSGVscGVyID0gdWlGb3JtSGVscGVyO1xuICAgICAgICAgICAgcmV0dXJuIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0O1xuICAgICAgICB9O1xuICAgICAgICBVSUZvcm1JbnN0YW5jZU9iamVjdC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUFzc2V0ID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9wVUlGb3JtSGVscGVyID0gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgVUlGb3JtSW5zdGFuY2VPYmplY3QucHJvdG90eXBlLnJlbGVhc2UgPSBmdW5jdGlvbiAoc2h1dGRvd24pIHtcbiAgICAgICAgICAgIHNodXRkb3duID0gc2h1dGRvd24gfHwgZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmlzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcFVJRm9ybUhlbHBlcilcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUhlbHBlci5yZWxlYXNlVUlGb3JtKHRoaXMubV9wVUlGb3JtQXNzZXQsIHRoaXMudGFyZ2V0KTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFVJRm9ybUluc3RhbmNlT2JqZWN0O1xuICAgIH0oKSk7IC8vIGNsYXNzIFVJRm9ybUluc3RhbmNlT2JqZWN0XG4gICAgdmFyIFVJR3JvdXAgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZ1bmN0aW9uIFVJR3JvdXAobmFtZSwgZGVwdGgsIGhlbHBlcikge1xuICAgICAgICAgICAgdGhpcy5tX2lEZXB0aCA9IDA7XG4gICAgICAgICAgICB0aGlzLm1fYlBhdXNlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUluZm9zID0gW107XG4gICAgICAgICAgICBpZiAoIW5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBncm91cCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBpZiAoIWhlbHBlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGdyb3VwIGhlbHBlciBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdGhpcy5tX3NOYW1lID0gbmFtZTtcbiAgICAgICAgICAgIHRoaXMubV9iUGF1c2UgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuaGVscGVyID0gaGVscGVyO1xuICAgICAgICAgICAgdGhpcy5kZXB0aCA9IGRlcHRoO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShVSUdyb3VwLnByb3RvdHlwZSwgXCJuYW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX3NOYW1lOyB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJR3JvdXAucHJvdG90eXBlLCBcImRlcHRoXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX2lEZXB0aDsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IHRoaXMubV9pRGVwdGgpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB0aGlzLm1faURlcHRoID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5oZWxwZXIuc2V0RGVwdGgodGhpcy5tX2lEZXB0aCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJR3JvdXAucHJvdG90eXBlLCBcInBhdXNlXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5tX2JQYXVzZTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubV9iUGF1c2UgPT0gdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB0aGlzLm1fYlBhdXNlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFVJR3JvdXAucHJvdG90eXBlLCBcInVpRm9ybUNvdW50XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFVJRm9ybUluZm9zLmxlbmd0aDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVUlHcm91cC5wcm90b3R5cGUsIFwiY3VycmVudFVJRm9ybVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BVSUZvcm1JbmZvcy5sZW5ndGggPiAwID8gdGhpcy5tX3BVSUZvcm1JbmZvc1swXS51aUZvcm0gOiBudWxsO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFVJR3JvdXAucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgdmFyIGVfMTAsIF9hO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wVUlGb3JtSW5mb3MpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmZvID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmZvLnBhdXNlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaW5mby51aUZvcm0ub25VcGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzEwXzEpIHsgZV8xMCA9IHsgZXJyb3I6IGVfMTBfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xMCkgdGhyb3cgZV8xMC5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBVSUdyb3VwLnByb3RvdHlwZS5hZGRVSUZvcm0gPSBmdW5jdGlvbiAodWlGb3JtKSB7XG4gICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUluZm9zLnVuc2hpZnQoe1xuICAgICAgICAgICAgICAgIHVpRm9ybTogdWlGb3JtLFxuICAgICAgICAgICAgICAgIGNvdmVyZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgcGF1c2VkOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgVUlHcm91cC5wcm90b3R5cGUucmVtb3ZlVUlGb3JtID0gZnVuY3Rpb24gKHVpRm9ybSkge1xuICAgICAgICAgICAgdmFyIHZfdUlkeCA9IC0xO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1fcFVJRm9ybUluZm9zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubV9wVUlGb3JtSW5mb3NbaV0udWlGb3JtID09IHVpRm9ybSkge1xuICAgICAgICAgICAgICAgICAgICB2X3VJZHggPSBpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodl91SWR4ID09IC0xKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgZmluZCBVSSBmb3JtIGluZm8gZm9yIHNlcmlhbCBpZCAnXCIgKyB1aUZvcm0uc2VyaWFsSWQgKyBcIicsIFVJIGZvcm0gYXNzZXQgbmFtZSBpcyAnXCIgKyB1aUZvcm0udWlGb3JtQXNzZXROYW1lICsgXCInLlwiKTtcbiAgICAgICAgICAgIHZhciB2X3BJbmZvID0gdGhpcy5tX3BVSUZvcm1JbmZvc1t2X3VJZHhdO1xuICAgICAgICAgICAgaWYgKCF2X3BJbmZvLmNvdmVyZWQpIHtcbiAgICAgICAgICAgICAgICB2X3BJbmZvLmNvdmVyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHVpRm9ybS5vbkNvdmVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXZfcEluZm8ucGF1c2VkKSB7XG4gICAgICAgICAgICAgICAgdl9wSW5mby5wYXVzZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHVpRm9ybS5vblBhdXNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUluZm9zLnNwbGljZSh2X3VJZHgsIDEpO1xuICAgICAgICB9O1xuICAgICAgICBVSUdyb3VwLnByb3RvdHlwZS5oYXNVSUZvcm0gPSBmdW5jdGlvbiAoaWRPckFzc2V0TmFtZSkge1xuICAgICAgICAgICAgdmFyIGVfMTEsIF9hO1xuICAgICAgICAgICAgdmFyIHN1YlByb3BOYW1lID0gJ3NlcmlhbElkJztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaWRPckFzc2V0TmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlkT3JBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBhc3NldCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICAgICAgc3ViUHJvcE5hbWUgPSAndWlGb3JtQXNzZXROYW1lJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2IgPSBfX3ZhbHVlcyh0aGlzLm1fcFVJRm9ybUluZm9zKSwgX2MgPSBfYi5uZXh0KCk7ICFfYy5kb25lOyBfYyA9IF9iLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5mbyA9IF9jLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5mby51aUZvcm1bc3ViUHJvcE5hbWVdID09PSBpZE9yQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMTFfMSkgeyBlXzExID0geyBlcnJvcjogZV8xMV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzExKSB0aHJvdyBlXzExLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIFVJR3JvdXAucHJvdG90eXBlLmdldFVJRm9ybSA9IGZ1bmN0aW9uIChpZE9yQXNzZXROYW1lKSB7XG4gICAgICAgICAgICB2YXIgZV8xMiwgX2E7XG4gICAgICAgICAgICB2YXIgc3ViUHJvcE5hbWUgPSAnc2VyaWFsSWQnO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpZE9yQXNzZXROYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGlmICghaWRPckFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGFzc2V0IG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgICAgICBzdWJQcm9wTmFtZSA9ICd1aUZvcm1Bc3NldE5hbWUnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wVUlGb3JtSW5mb3MpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmZvID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmZvLnVpRm9ybVtzdWJQcm9wTmFtZV0gPT09IGlkT3JBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW5mby51aUZvcm07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMTJfMSkgeyBlXzEyID0geyBlcnJvcjogZV8xMl8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYyAmJiAhX2MuZG9uZSAmJiAoX2EgPSBfYi5yZXR1cm4pKSBfYS5jYWxsKF9iKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEyKSB0aHJvdyBlXzEyLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgVUlHcm91cC5wcm90b3R5cGUuZ2V0VUlGb3JtcyA9IGZ1bmN0aW9uIChhc3NldE5hbWUpIHtcbiAgICAgICAgICAgIHZhciBlXzEzLCBfYTtcbiAgICAgICAgICAgIGlmICghYXNzZXROYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBhc3NldCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB2YXIgdl9wUmV0ID0gW107XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gX192YWx1ZXModGhpcy5tX3BVSUZvcm1JbmZvcy52YWx1ZXMoKSksIF9jID0gX2IubmV4dCgpOyAhX2MuZG9uZTsgX2MgPSBfYi5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZS51aUZvcm0udWlGb3JtQXNzZXROYW1lID09PSBhc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICB2X3BSZXQucHVzaCh2YWx1ZS51aUZvcm0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzEzXzEpIHsgZV8xMyA9IHsgZXJyb3I6IGVfMTNfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xMykgdGhyb3cgZV8xMy5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZfcFJldDtcbiAgICAgICAgfTtcbiAgICAgICAgVUlHcm91cC5wcm90b3R5cGUuZ2V0QWxsVUlGb3JtcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFVJRm9ybUluZm9zLm1hcChmdW5jdGlvbiAoaW5mbykge1xuICAgICAgICAgICAgICAgIHJldHVybiBpbmZvLnVpRm9ybTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBVSUdyb3VwLnByb3RvdHlwZS5yZWZvY3VzVUlGb3JtID0gZnVuY3Rpb24gKHVpRm9ybSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIHZhciB2X3VJZHggPSAtMTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tX3BVSUZvcm1JbmZvcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fcFVJRm9ybUluZm9zW2ldLnVpRm9ybSA9PSB1aUZvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgdl91SWR4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHZfdUlkeCA9PSAtMSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGZpbmQgVUkgZm9ybSBpbmZvIGZvciBzZXJpYWwgaWQgJ1wiICsgdWlGb3JtLnNlcmlhbElkICsgXCInLCBVSSBmb3JtIGFzc2V0IG5hbWUgaXMgJ1wiICsgdWlGb3JtLnVpRm9ybUFzc2V0TmFtZSArIFwiJy5cIik7XG4gICAgICAgICAgICBpZiAodl91SWR4ID49IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUluZm9zLnNwbGljZSh2X3VJZHgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZfcEluZm8gPSB0aGlzLm1fcFVJRm9ybUluZm9zW3ZfdUlkeF07XG4gICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUluZm9zLnVuc2hpZnQodl9wSW5mbyk7XG4gICAgICAgIH07XG4gICAgICAgIFVJR3JvdXAucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZV8xNCwgX2E7XG4gICAgICAgICAgICB2YXIgdl9iUGF1c2UgPSB0aGlzLnBhdXNlO1xuICAgICAgICAgICAgdmFyIHZfYkNvdmVyID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgdl9pRGVwdGggPSB0aGlzLnVpRm9ybUNvdW50O1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKHRoaXMubV9wVUlGb3JtSW5mb3MpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmZvID0gX2MudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChudWxsID09IGluZm8pXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIGlmICh2X2JQYXVzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpbmZvLmNvdmVyZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLmNvdmVyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8udWlGb3JtLm9uQ292ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaW5mby5wYXVzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLnBhdXNlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby51aUZvcm0ub25QYXVzZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZm8ucGF1c2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLnVpRm9ybS5vblJlc3VtZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZm8udWlGb3JtLnBhdXNlQ292ZXJlZFVJRm9ybSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZfYlBhdXNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2X2JDb3Zlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaW5mby5jb3ZlcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8uY292ZXJlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8udWlGb3JtLm9uQ292ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5mby5jb3ZlcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8uY292ZXJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLnVpRm9ybS5vblJldmVhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2X2JDb3ZlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xNF8xKSB7IGVfMTQgPSB7IGVycm9yOiBlXzE0XzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9jICYmICFfYy5kb25lICYmIChfYSA9IF9iLnJldHVybikpIF9hLmNhbGwoX2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMTQpIHRocm93IGVfMTQuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFVJR3JvdXA7XG4gICAgfSgpKTsgLy8gY2xhc3MgVUlHcm91cFxuICAgIGV4cG9ydHMuVUlHcm91cCA9IFVJR3JvdXA7XG59KTtcbiIsIihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgZ2xvYmFsID0gZ2xvYmFsIHx8IHt9O1xuICAgIHZhciB2X3BHbG9iYWwgPSAndW5kZWZpbmVkJyA9PSB0eXBlb2Ygd2luZG93ID8gZ2xvYmFsIDogd2luZG93O1xuICAgIHZhciBhdHNmcmFtZXdvcmsgPSB2X3BHbG9iYWwuYXRzZnJhbWV3b3JrIHx8IHt9O1xuICAgIGZ1bmN0aW9uIGV4cG9zZShtKSB7XG4gICAgICAgIGZvciAodmFyIGsgaW4gbSkge1xuICAgICAgICAgICAgYXRzZnJhbWV3b3JrW2tdID0gbVtrXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBleHBvc2UocmVxdWlyZSgnLi9CYXNlJykpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9Db25maWdcIikpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9EYXRhTm9kZVwiKSk7XG4gICAgZXhwb3NlKHJlcXVpcmUoXCIuL0ZzbVwiKSk7XG4gICAgZXhwb3NlKHJlcXVpcmUoXCIuL1Jlc291cmNlXCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vRXZlbnRcIikpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9Qcm9jZWR1cmVcIikpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9VSVwiKSk7XG4gICAgZXhwb3NlKHJlcXVpcmUoXCIuL1NvdW5kXCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vU2NlbmVcIikpO1xuICAgIHZfcEdsb2JhbC5hdHNmcmFtZXdvcmsgPSBhdHNmcmFtZXdvcms7XG4gICAgZXhwb3J0cy5kZWZhdWx0ID0gYXRzZnJhbWV3b3JrO1xufSk7XG4iXX0=
