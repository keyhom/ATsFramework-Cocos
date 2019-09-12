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
    let g_pModules = [];
    /**
     * An event handler make similar with event delegate mode.
     */
    class EventHandler {
        constructor() {
            this.m_pHandlers = null;
        }
        has(fn) {
            if (null != this.m_pHandlers) {
                this.m_pHandlers.has(fn);
            }
            return false;
        }
        add(fn) {
            if (null == this.m_pHandlers)
                this.m_pHandlers = new Set();
            this.m_pHandlers.add(fn);
        }
        remove(fn) {
            this.isValid && this.m_pHandlers.delete(fn);
        }
        iter(fn) {
            this.isValid && this.m_pHandlers.forEach(fn);
        }
        clear() {
            this.isValid && this.m_pHandlers.clear();
        }
        get isValid() {
            return this.m_pHandlers && this.m_pHandlers.size > 0;
        }
    } // class EventHandler
    exports.EventHandler = EventHandler;
    class FrameworkModule {
        constructor() {
            this.m_iPriority = 0;
        }
        static getModule(type) {
            for (let i = 0; i < g_pModules.length; i++) {
                const m = g_pModules[i];
                if (m instanceof type) {
                    return m;
                }
            }
            return null;
        }
        static getOrAddModule(type) {
            let v_pModule = this.getModule(type);
            if (null == v_pModule) {
                v_pModule = new type();
                this.addModule(v_pModule);
            }
            return v_pModule;
        }
        static addModule(module) {
            const m = this.getModule(module.constructor);
            if (m)
                throw new Error(`Duplicated adding framework module: ${typeof module}`); // FIXME: Detecting how to get the class name.
            g_pModules.push(module);
            g_pModules = g_pModules.sort((a, b) => {
                if (a.m_iPriority > b.m_iPriority)
                    return -1;
                else if (a.m_iPriority < b.m_iPriority)
                    return 1;
                return 0;
            });
        }
        static removeModule(type) {
            for (let i = 0; i < g_pModules.length; i++) {
                const v_pModule = g_pModules[i];
                if (v_pModule && v_pModule instanceof type) {
                    g_pModules.splice(i, 1);
                    return v_pModule;
                }
            }
            return null;
        }
        static update(elapsed, realElapsed) {
            for (let i = 0; i < g_pModules.length; ++i) {
                const v_pModule = g_pModules[i];
                v_pModule.update(elapsed, realElapsed);
            }
        }
        static shutdown() {
            for (let i = g_pModules.length - 1; i >= 0; --i) {
                const v_pModule = g_pModules[i];
                v_pModule.shutdown();
            }
        }
        get priority() {
            return this.m_iPriority;
        }
    } // class FrameworkModule
    exports.FrameworkModule = FrameworkModule;
});

},{}],2:[function(require,module,exports){
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
    const Base_1 = require("./Base");
    class ConfigManager extends Base_1.FrameworkModule {
        constructor() {
            super();
            this.m_pResourceManager = null;
            this.m_pConfigHelper = null;
            this.m_pConfigData = null;
            this.m_pLoadAssetCallbacks = null;
            this.m_pConfigData = new Map();
            this.m_pLoadAssetCallbacks = {
                success: this.loadConfigSuccessCallback.bind(this),
                failure: this.loadConfigFailureCallback.bind(this),
                update: this.loadConfigUpdateCallback.bind(this),
                dependency: this.loadConfigDependencyAssetCallback.bind(this)
            };
            this.m_pLoadConfigSuccessDelegate = new Base_1.EventHandler();
            this.m_pLoadConfigFailureDelegate = new Base_1.EventHandler();
            this.m_pLoadConfigUpdateDelegate = new Base_1.EventHandler();
            this.m_pLoadConfigDependencyAssetDelegate = new Base_1.EventHandler();
        }
        get resourceManager() {
            return this.m_pResourceManager;
        }
        set resourceManager(value) {
            if (null == value) {
                throw new Error("Resource manager is invalid.");
            }
            this.m_pResourceManager = value;
        }
        get configHelper() {
            return this.m_pConfigHelper;
        }
        set configHelper(value) {
            if (null == value)
                throw new Error("Config helper is invalid.");
            this.m_pConfigHelper = value;
        }
        get configCount() {
            return this.m_pConfigData.size;
        }
        get loadConfigSuccess() {
            return this.m_pLoadConfigSuccessDelegate;
        }
        get loadConfigFailure() {
            return this.m_pLoadConfigFailureDelegate;
        }
        get loadConfigUpdate() {
            return this.m_pLoadConfigUpdateDelegate;
        }
        get loadConfigDependencyAsset() {
            return this.m_pLoadConfigDependencyAssetDelegate;
        }
        loadConfig(configAssetName, loadType, anyArg1, anyArg2) {
            if (null == this.m_pResourceManager) {
                throw new Error("You must set resource manager first.");
            }
            if (null == this.m_pConfigHelper) {
                throw new Error("You must set config helper first.");
            }
            let priority = 0;
            let userData = null;
            this.m_pResourceManager.loadAsset(configAssetName, priority, this.m_pLoadAssetCallbacks, { loadType: loadType, userData: userData });
        }
        // NOTE: Any javascript/typescript stream implementation?
        parseConfig(textOrBuffer, userData) {
            if (!textOrBuffer) {
                throw new Error("Invalid config data detected!");
            }
            if (null == this.m_pConfigHelper) {
                throw new Error("You must set config helper first.");
            }
            try {
                return this.m_pConfigHelper.parseConfig(textOrBuffer, userData);
            }
            catch (e) {
                throw e;
            }
            return false;
        }
        hasConfig(configName) {
            return this.getConfig(configName);
        }
        addConfig(configName, value) {
            if (this.hasConfig(configName)) {
                return false;
            }
            this.m_pConfigData.set(configName, value);
            return true;
        }
        removeConfig(configName) {
            return this.m_pConfigData.delete(configName);
        }
        removeAllConfigs() {
            this.m_pConfigData.clear();
        }
        getConfig(configName) {
            return this.m_pConfigData.get(configName);
        }
        update(elapsed, realElapsed) {
            // NOOP.
        }
        shutdown() {
            // NOOP.
        }
        loadConfigSuccessCallback(configAssetName, configAsset, duration, userData) {
            let v_pInfo = userData;
            if (null == v_pInfo) {
                throw new Error("Load config info is invalid.");
            }
            try {
                if (!this.m_pConfigHelper.loadConfig(configAsset, v_pInfo.loadType, v_pInfo.userData)) {
                    throw new Error(`Load config failure in helper, asset name '${configAssetName}'`);
                }
                if (this.m_pLoadConfigSuccessDelegate.isValid) {
                    this.m_pLoadConfigSuccessDelegate.iter((callbackFn) => {
                        callbackFn(configAssetName, v_pInfo.loadType, duration, userData);
                    });
                }
            }
            catch (e) {
                if (this.m_pLoadConfigFailureDelegate.isValid) {
                    this.m_pLoadConfigFailureDelegate.iter((callbackFn) => {
                        callbackFn(configAssetName, v_pInfo.loadType, e.toString(), v_pInfo.userData);
                    });
                    return;
                }
                throw e;
            }
            finally {
                this.m_pConfigHelper.releaseConfigAsset(configAsset);
            }
        }
        loadConfigFailureCallback(configAssetName, status, errorMessage, userData) {
            let v_pInfo = userData;
            if (null == v_pInfo) {
                throw new Error("Load config info is invalid.");
            }
            let appendErrorMessage = `Load config failure, asset name '${configAssetName}', status '${status}', error message '${errorMessage}'.`;
            if (this.m_pLoadConfigFailureDelegate.isValid) {
                this.m_pLoadConfigFailureDelegate.iter((callbackFn) => {
                    callbackFn(configAssetName, v_pInfo.loadType, appendErrorMessage, v_pInfo.userData);
                });
                return;
            }
            throw new Error(appendErrorMessage);
        }
        loadConfigUpdateCallback(configAssetName, progress, userData) {
            let v_pInfo = userData;
            if (null == v_pInfo) {
                throw new Error("Load config info is invalid.");
            }
            if (this.m_pLoadConfigUpdateDelegate.isValid) {
                this.m_pLoadConfigUpdateDelegate.iter((callbackFn) => {
                    callbackFn(configAssetName, v_pInfo.loadType, progress, v_pInfo.userData);
                });
            }
        }
        loadConfigDependencyAssetCallback(configAssetName, dependencyAssetName, loadedCount, totalCount, userData) {
            let v_pInfo = userData;
            if (null == v_pInfo) {
                throw new Error("Load config info is invalid.");
            }
            if (this.m_pLoadConfigDependencyAssetDelegate.isValid) {
                this.m_pLoadConfigDependencyAssetDelegate.iter((callbackFn) => {
                    callbackFn(configAssetName, dependencyAssetName, loadedCount, totalCount, v_pInfo.userData);
                });
            }
        }
    } // class ConfigManager
    exports.ConfigManager = ConfigManager;
});

},{"./Base":1}],3:[function(require,module,exports){
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
    const Base_1 = require("./Base");
    class DataNodeManager extends Base_1.FrameworkModule {
        update(elapsed, realElapsed) {
            throw new Error("Method not implemented.");
        }
        shutdown() {
            throw new Error("Method not implemented.");
        }
    } // class DataNodeManager
    exports.DataNodeManager = DataNodeManager;
});

},{"./Base":1}],4:[function(require,module,exports){
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
    const Base_1 = require("./Base");
    /**
     * A simple event manager implementation.
     *
     * @author Jeremy Chen (keyhom.c@gmail.com)
     */
    class EventManager extends Base_1.FrameworkModule {
        constructor() {
            super(...arguments);
            this.m_pEventHandlers = new Map();
        }
        get priority() {
            return 100;
        }
        check(eventId, handler) {
            if (this.m_pEventHandlers.has(eventId)) {
                return this.m_pEventHandlers.get(eventId).has(handler);
            }
            return false;
        }
        on(eventId, handler) {
            if (!this.m_pEventHandlers.has(eventId)) {
                this.m_pEventHandlers.set(eventId, new Base_1.EventHandler());
            }
            this.m_pEventHandlers.get(eventId).add(handler);
        }
        off(eventId, handler) {
            if (this.m_pEventHandlers.has(eventId)) {
                this.m_pEventHandlers.get(eventId).remove(handler);
            }
        }
        emit(eventId, ...args) {
            if (this.m_pEventHandlers.has(eventId)) {
                this.m_pEventHandlers.get(eventId).iter((callbackFn) => {
                    callbackFn.apply(null, args);
                });
            }
        }
        update(elapsed, realElapsed) {
            // NOOP.
        }
        shutdown() {
            if (this.m_pEventHandlers) {
                this.m_pEventHandlers.forEach((eh, key) => {
                    eh.clear();
                });
                this.m_pEventHandlers.clear();
            }
        }
    } // class EventManager
    exports.EventManager = EventManager;
});

},{"./Base":1}],5:[function(require,module,exports){
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
    const Base_1 = require("./Base");
    class FsmState {
        constructor() {
            this.m_pEventHandlers = null;
            this.m_pEventHandlers = new Map();
        }
        get name() {
            return this.m_sName;
        }
        onInit(fsm) {
            // NOOP
        }
        onEnter(fsm) {
            // NOOP
        }
        onUpdate(fsm, elapsed, realElapsed) {
            // NOOP
        }
        onLeave(fsm, shutdown) {
            // NOOP
        }
        changeState(fsm, type) {
            if (!fsm) {
                throw new Error(`Fsm is invalid: ${fsm}`);
            }
            fsm.changeState(type);
        }
        on(eventId, eventHandler) {
            if (null == eventHandler)
                throw new Error("Event handler is invalid.");
            if (!this.m_pEventHandlers.has(eventId)) {
                let eh = new Base_1.EventHandler();
                this.m_pEventHandlers.set(eventId, eh);
            }
            this.m_pEventHandlers.get(eventId).add(eventHandler);
        }
        off(eventId, eventHandler) {
            if (null == eventHandler)
                throw new Error("Event handler is invalid.");
            if (this.m_pEventHandlers.has(eventId)) {
                this.m_pEventHandlers.get(eventId).remove(eventHandler);
            }
        }
        emit(fsm, sender, eventId, userData) {
            if (this.m_pEventHandlers.has(eventId)) {
                this.m_pEventHandlers.get(eventId).iter((callbackFn) => {
                    callbackFn(fsm, sender, userData);
                });
            }
        }
    } // class FsmState<T>
    exports.FsmState = FsmState;
    class Fsm {
        constructor() {
            this.m_pStates = null;
            this.m_pDatas = null;
            this.m_sName = null;
            this.m_pStates = [];
            this.m_pDatas = new Map();
            this._currentState = null;
            this._currentStateTime = 0;
            this._isDestroyed = true;
        }
        static createFsm(name, owner, states) {
            if (null == owner)
                throw new Error('FSM owner is invalid.');
            if (null == states || states.length < 1)
                throw new Error('FSM states is invalid.');
            let v_pFsm = new Fsm();
            v_pFsm.m_sName = name;
            v_pFsm.m_pOwner = owner;
            for (const v_pState of states) {
                if (null == v_pState)
                    throw new Error('FSM states is invalid.');
                if (v_pFsm.hasState(v_pState.constructor))
                    throw new Error(`FSM '${name}' state '${v_pState}' is already exist.`);
                v_pFsm.m_pStates.push(v_pState);
                v_pState.onInit(v_pFsm);
            }
            v_pFsm._isDestroyed = false;
            return v_pFsm;
        }
        get name() {
            return this.m_sName;
        }
        get owner() { return this.m_pOwner; }
        get fsmStateCount() { return this.m_pStates.length; }
        get isRunning() { return null != this._currentState; }
        get isDestroyed() { return this._isDestroyed; }
        get currentState() { return this._currentState; }
        get currentStateName() {
            return this.currentState ? this.currentState.name : null;
        }
        get currentStateTime() { return this._currentStateTime; }
        start(type) {
            if (this.isRunning) {
                throw new Error("FSM is running, can not start again.");
            }
            let state = this.getState(type);
            if (!state) {
                throw new Error(`FSM '${this.name}' can not start state '${type.name}' which is not exists.`);
            }
            this._currentStateTime = 0;
            this._currentState = state;
            this.currentState.onEnter(this); // Call internal function with any casting.
        }
        hasState(type) {
            return null != this.getState(type);
        }
        getState(type) {
            for (let i = 0; i < this.m_pStates.length; i++) {
                const v_pState = this.m_pStates[i];
                if (null == v_pState)
                    continue;
                if (v_pState instanceof type)
                    return v_pState;
            }
            return null;
        }
        getAllStates() {
            return this.m_pStates;
        }
        changeState(type) {
            if (!this._currentState)
                throw new Error('Current state is invalid.');
            let v_pState = this.getState(type);
            if (null == v_pState)
                throw new Error(`Fsm can not change state, state is not exist: ${type}`);
            this._currentState.onLeave(this, false);
            this._currentStateTime = 0;
            this._currentState = v_pState;
            this._currentState.onEnter(this);
        }
        getData(name) {
            if (this.m_pDatas.has(name))
                return this.m_pDatas.get(name);
            return null;
        }
        setData(name, data) {
            if (!name)
                throw new Error('Data name is invalid.');
            this.m_pDatas.set(name, data);
        }
        removeData(name) {
            if (!name)
                throw new Error('Data name is invalid.');
            let v_bRet = false;
            if (name in this.m_pDatas) {
                v_bRet = true;
                this.m_pDatas.delete(name);
            }
            return v_bRet;
        }
        update(elapsed, realElapsed) {
            if (null == this._currentState)
                return;
            this._currentStateTime += elapsed;
            this._currentState.onUpdate(this, elapsed, realElapsed);
        }
        shutdown() {
            // FIXME: Figue out a way to release this.
        }
    } // class Fsm<T>
    exports.Fsm = Fsm;
    class FsmManager extends Base_1.FrameworkModule {
        constructor() {
            super(...arguments);
            this.m_pFsms = new Map();
        }
        get priority() {
            return 60;
        }
        get count() {
            return this.m_pFsms.size;
        }
        hasFsm(nameOrType) {
            if ('function' === typeof nameOrType && nameOrType.prototype) {
                for (const key in this.m_pFsms) {
                    const v_pFsm = this.m_pFsms.get(key);
                    if (null != v_pFsm && v_pFsm instanceof nameOrType) {
                        return true;
                    }
                }
            }
            else {
                return nameOrType.toString() in this.m_pFsms;
            }
            return false;
        }
        createFsm(name, owner, states) {
            name = name || '';
            if (this.hasFsm(name)) {
                throw new Error(`Already exist FSM '${name}'.`);
            }
            const fsm = Fsm.createFsm(name, owner, states);
            this.m_pFsms.set(name, fsm);
            return fsm;
        }
        destroyFsm(instance) {
            let v_pFsm = null;
            if (!this.hasFsm(instance.constructor)) {
                return false;
            }
            if (Object.getPrototypeOf(instance).hasOwnProperty('shutdown')) {
                instance.shutdown();
            }
            for (const key in this.m_pFsms) {
                const v_pFsm = this.m_pFsms.get(key);
                if (v_pFsm == instance) {
                    this.m_pFsms.delete(key);
                    break;
                }
            }
            return true;
        }
        update(elapsed, realElapsed) {
            for (const key in this.m_pFsms) {
                const v_Fsm = this.m_pFsms.get(key);
                if (!v_Fsm && v_Fsm.isDestroyed)
                    continue;
                v_Fsm.update(elapsed, realElapsed);
            }
        }
        shutdown() {
            for (const key in this.m_pFsms) {
                const v_Fsm = this.m_pFsms.get(key);
                if (!v_Fsm && v_Fsm.isDestroyed)
                    continue;
                v_Fsm.shutdown();
                this.m_pFsms.delete(key);
            }
        }
    } // class FsmManager
    exports.FsmManager = FsmManager;
});

},{"./Base":1}],6:[function(require,module,exports){
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
    const Base_1 = require("./Base");
    const Fsm_1 = require("./Fsm");
    class ProcedureBase extends Fsm_1.FsmState {
    } // class ProcedureBase
    exports.ProcedureBase = ProcedureBase;
    class ProcedureManager extends Base_1.FrameworkModule {
        constructor() {
            super(...arguments);
            this.m_pFsmManager = null;
            this.m_pProcedureFsm = null;
        }
        get priority() { return -10; }
        get currentProcedure() {
            return this.m_pProcedureFsm.currentState;
        }
        initialize(fsmManager, procedures) {
            if (null == fsmManager)
                throw new Error('FSM manager is invalid.');
            this.m_pFsmManager = fsmManager;
            this.m_pProcedureFsm = fsmManager.createFsm(null, this, procedures);
        }
        startProcedure(obj) {
            if (null == this.m_pProcedureFsm)
                throw new Error('You must initialize procedure first.');
            this.m_pProcedureFsm.start(obj.constructor);
        }
        update(elapsed, realElapsed) {
            // Noop.
        }
        shutdown() {
            if (null != this.m_pFsmManager) {
                if (null != this.m_pProcedureFsm) {
                    this.m_pFsmManager.destroyFsm(this.m_pProcedureFsm);
                    this.m_pProcedureFsm = null;
                }
                this.m_pFsmManager = null;
            }
        }
        hasProcedure(type) {
            if (null == this.m_pProcedureFsm)
                throw new Error('You must initialize procedure first.');
            return this.m_pProcedureFsm.hasState(type);
        }
        getProcedure(type) {
            if (null == this.m_pProcedureFsm)
                throw new Error('You must initialize procedure first.');
            return this.m_pProcedureFsm.getState(type);
        }
    } // class ProcedureManager
    exports.ProcedureManager = ProcedureManager;
});

},{"./Base":1,"./Fsm":5}],7:[function(require,module,exports){
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
});

},{}],8:[function(require,module,exports){
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
    const v_pGlobal = 'undefined' == typeof window ? global : window;
    const atsframework = v_pGlobal.atsframework || {};
    function expose(m) {
        for (const k in m) {
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
    v_pGlobal.atsframework = atsframework;
    exports.default = atsframework;
});

},{"./Base":1,"./Config":2,"./DataNode":3,"./Event":4,"./Fsm":5,"./Procedure":6,"./Resource":7}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIkJhc2UuanMiLCJDb25maWcuanMiLCJEYXRhTm9kZS5qcyIsIkV2ZW50LmpzIiwiRnNtLmpzIiwiUHJvY2VkdXJlLmpzIiwiUmVzb3VyY2UuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICAvKipcbiAgICAgKiBMb2FkIHR5cGUuXG4gICAgICovXG4gICAgdmFyIExvYWRUeXBlO1xuICAgIChmdW5jdGlvbiAoTG9hZFR5cGUpIHtcbiAgICAgICAgTG9hZFR5cGVbTG9hZFR5cGVbXCJUZXh0XCJdID0gMF0gPSBcIlRleHRcIjtcbiAgICAgICAgTG9hZFR5cGVbTG9hZFR5cGVbXCJCeXRlc1wiXSA9IDFdID0gXCJCeXRlc1wiO1xuICAgICAgICBMb2FkVHlwZVtMb2FkVHlwZVtcIlN0cmVhbVwiXSA9IDJdID0gXCJTdHJlYW1cIjtcbiAgICB9KShMb2FkVHlwZSA9IGV4cG9ydHMuTG9hZFR5cGUgfHwgKGV4cG9ydHMuTG9hZFR5cGUgPSB7fSkpO1xuICAgIDtcbiAgICBsZXQgZ19wTW9kdWxlcyA9IFtdO1xuICAgIC8qKlxuICAgICAqIEFuIGV2ZW50IGhhbmRsZXIgbWFrZSBzaW1pbGFyIHdpdGggZXZlbnQgZGVsZWdhdGUgbW9kZS5cbiAgICAgKi9cbiAgICBjbGFzcyBFdmVudEhhbmRsZXIge1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIHRoaXMubV9wSGFuZGxlcnMgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGhhcyhmbikge1xuICAgICAgICAgICAgaWYgKG51bGwgIT0gdGhpcy5tX3BIYW5kbGVycykge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wSGFuZGxlcnMuaGFzKGZuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBhZGQoZm4pIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMubV9wSGFuZGxlcnMpXG4gICAgICAgICAgICAgICAgdGhpcy5tX3BIYW5kbGVycyA9IG5ldyBTZXQoKTtcbiAgICAgICAgICAgIHRoaXMubV9wSGFuZGxlcnMuYWRkKGZuKTtcbiAgICAgICAgfVxuICAgICAgICByZW1vdmUoZm4pIHtcbiAgICAgICAgICAgIHRoaXMuaXNWYWxpZCAmJiB0aGlzLm1fcEhhbmRsZXJzLmRlbGV0ZShmbik7XG4gICAgICAgIH1cbiAgICAgICAgaXRlcihmbikge1xuICAgICAgICAgICAgdGhpcy5pc1ZhbGlkICYmIHRoaXMubV9wSGFuZGxlcnMuZm9yRWFjaChmbik7XG4gICAgICAgIH1cbiAgICAgICAgY2xlYXIoKSB7XG4gICAgICAgICAgICB0aGlzLmlzVmFsaWQgJiYgdGhpcy5tX3BIYW5kbGVycy5jbGVhcigpO1xuICAgICAgICB9XG4gICAgICAgIGdldCBpc1ZhbGlkKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wSGFuZGxlcnMgJiYgdGhpcy5tX3BIYW5kbGVycy5zaXplID4gMDtcbiAgICAgICAgfVxuICAgIH0gLy8gY2xhc3MgRXZlbnRIYW5kbGVyXG4gICAgZXhwb3J0cy5FdmVudEhhbmRsZXIgPSBFdmVudEhhbmRsZXI7XG4gICAgY2xhc3MgRnJhbWV3b3JrTW9kdWxlIHtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICB0aGlzLm1faVByaW9yaXR5ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBzdGF0aWMgZ2V0TW9kdWxlKHR5cGUpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZ19wTW9kdWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG0gPSBnX3BNb2R1bGVzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChtIGluc3RhbmNlb2YgdHlwZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBzdGF0aWMgZ2V0T3JBZGRNb2R1bGUodHlwZSkge1xuICAgICAgICAgICAgbGV0IHZfcE1vZHVsZSA9IHRoaXMuZ2V0TW9kdWxlKHR5cGUpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wTW9kdWxlKSB7XG4gICAgICAgICAgICAgICAgdl9wTW9kdWxlID0gbmV3IHR5cGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZE1vZHVsZSh2X3BNb2R1bGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZfcE1vZHVsZTtcbiAgICAgICAgfVxuICAgICAgICBzdGF0aWMgYWRkTW9kdWxlKG1vZHVsZSkge1xuICAgICAgICAgICAgY29uc3QgbSA9IHRoaXMuZ2V0TW9kdWxlKG1vZHVsZS5jb25zdHJ1Y3Rvcik7XG4gICAgICAgICAgICBpZiAobSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYER1cGxpY2F0ZWQgYWRkaW5nIGZyYW1ld29yayBtb2R1bGU6ICR7dHlwZW9mIG1vZHVsZX1gKTsgLy8gRklYTUU6IERldGVjdGluZyBob3cgdG8gZ2V0IHRoZSBjbGFzcyBuYW1lLlxuICAgICAgICAgICAgZ19wTW9kdWxlcy5wdXNoKG1vZHVsZSk7XG4gICAgICAgICAgICBnX3BNb2R1bGVzID0gZ19wTW9kdWxlcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGEubV9pUHJpb3JpdHkgPiBiLm1faVByaW9yaXR5KVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoYS5tX2lQcmlvcml0eSA8IGIubV9pUHJpb3JpdHkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgc3RhdGljIHJlbW92ZU1vZHVsZSh0eXBlKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGdfcE1vZHVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2X3BNb2R1bGUgPSBnX3BNb2R1bGVzW2ldO1xuICAgICAgICAgICAgICAgIGlmICh2X3BNb2R1bGUgJiYgdl9wTW9kdWxlIGluc3RhbmNlb2YgdHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBnX3BNb2R1bGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZfcE1vZHVsZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBzdGF0aWMgdXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGdfcE1vZHVsZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2X3BNb2R1bGUgPSBnX3BNb2R1bGVzW2ldO1xuICAgICAgICAgICAgICAgIHZfcE1vZHVsZS51cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN0YXRpYyBzaHV0ZG93bigpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBnX3BNb2R1bGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgdl9wTW9kdWxlID0gZ19wTW9kdWxlc1tpXTtcbiAgICAgICAgICAgICAgICB2X3BNb2R1bGUuc2h1dGRvd24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBnZXQgcHJpb3JpdHkoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX2lQcmlvcml0eTtcbiAgICAgICAgfVxuICAgIH0gLy8gY2xhc3MgRnJhbWV3b3JrTW9kdWxlXG4gICAgZXhwb3J0cy5GcmFtZXdvcmtNb2R1bGUgPSBGcmFtZXdvcmtNb2R1bGU7XG59KTtcbiIsIihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICBjb25zdCBCYXNlXzEgPSByZXF1aXJlKFwiLi9CYXNlXCIpO1xuICAgIGNsYXNzIENvbmZpZ01hbmFnZXIgZXh0ZW5kcyBCYXNlXzEuRnJhbWV3b3JrTW9kdWxlIHtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICBzdXBlcigpO1xuICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX3BDb25maWdIZWxwZXIgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX3BDb25maWdEYXRhID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9wTG9hZEFzc2V0Q2FsbGJhY2tzID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9wQ29uZmlnRGF0YSA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMubV9wTG9hZEFzc2V0Q2FsbGJhY2tzID0ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRoaXMubG9hZENvbmZpZ1N1Y2Nlc3NDYWxsYmFjay5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgIGZhaWx1cmU6IHRoaXMubG9hZENvbmZpZ0ZhaWx1cmVDYWxsYmFjay5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgIHVwZGF0ZTogdGhpcy5sb2FkQ29uZmlnVXBkYXRlQ2FsbGJhY2suYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBkZXBlbmRlbmN5OiB0aGlzLmxvYWRDb25maWdEZXBlbmRlbmN5QXNzZXRDYWxsYmFjay5iaW5kKHRoaXMpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5tX3BMb2FkQ29uZmlnU3VjY2Vzc0RlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIHRoaXMubV9wTG9hZENvbmZpZ0ZhaWx1cmVEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICB0aGlzLm1fcExvYWRDb25maWdVcGRhdGVEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICB0aGlzLm1fcExvYWRDb25maWdEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IHJlc291cmNlTWFuYWdlcigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFJlc291cmNlTWFuYWdlcjtcbiAgICAgICAgfVxuICAgICAgICBzZXQgcmVzb3VyY2VNYW5hZ2VyKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJlc291cmNlIG1hbmFnZXIgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlciA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGdldCBjb25maWdIZWxwZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BDb25maWdIZWxwZXI7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGNvbmZpZ0hlbHBlcih2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdmFsdWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29uZmlnIGhlbHBlciBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHRoaXMubV9wQ29uZmlnSGVscGVyID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IGNvbmZpZ0NvdW50KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wQ29uZmlnRGF0YS5zaXplO1xuICAgICAgICB9XG4gICAgICAgIGdldCBsb2FkQ29uZmlnU3VjY2VzcygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcExvYWRDb25maWdTdWNjZXNzRGVsZWdhdGU7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IGxvYWRDb25maWdGYWlsdXJlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wTG9hZENvbmZpZ0ZhaWx1cmVEZWxlZ2F0ZTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgbG9hZENvbmZpZ1VwZGF0ZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcExvYWRDb25maWdVcGRhdGVEZWxlZ2F0ZTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgbG9hZENvbmZpZ0RlcGVuZGVuY3lBc3NldCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcExvYWRDb25maWdEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZTtcbiAgICAgICAgfVxuICAgICAgICBsb2FkQ29uZmlnKGNvbmZpZ0Fzc2V0TmFtZSwgbG9hZFR5cGUsIGFueUFyZzEsIGFueUFyZzIpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IHJlc291cmNlIG1hbmFnZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BDb25maWdIZWxwZXIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgY29uZmlnIGhlbHBlciBmaXJzdC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgcHJpb3JpdHkgPSAwO1xuICAgICAgICAgICAgbGV0IHVzZXJEYXRhID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyLmxvYWRBc3NldChjb25maWdBc3NldE5hbWUsIHByaW9yaXR5LCB0aGlzLm1fcExvYWRBc3NldENhbGxiYWNrcywgeyBsb2FkVHlwZTogbG9hZFR5cGUsIHVzZXJEYXRhOiB1c2VyRGF0YSB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBOT1RFOiBBbnkgamF2YXNjcmlwdC90eXBlc2NyaXB0IHN0cmVhbSBpbXBsZW1lbnRhdGlvbj9cbiAgICAgICAgcGFyc2VDb25maWcodGV4dE9yQnVmZmVyLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKCF0ZXh0T3JCdWZmZXIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGNvbmZpZyBkYXRhIGRldGVjdGVkIVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMubV9wQ29uZmlnSGVscGVyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IGNvbmZpZyBoZWxwZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BDb25maWdIZWxwZXIucGFyc2VDb25maWcodGV4dE9yQnVmZmVyLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaGFzQ29uZmlnKGNvbmZpZ05hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldENvbmZpZyhjb25maWdOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBhZGRDb25maWcoY29uZmlnTmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc0NvbmZpZyhjb25maWdOYW1lKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wQ29uZmlnRGF0YS5zZXQoY29uZmlnTmFtZSwgdmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmVtb3ZlQ29uZmlnKGNvbmZpZ05hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcENvbmZpZ0RhdGEuZGVsZXRlKGNvbmZpZ05hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJlbW92ZUFsbENvbmZpZ3MoKSB7XG4gICAgICAgICAgICB0aGlzLm1fcENvbmZpZ0RhdGEuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgICAgICBnZXRDb25maWcoY29uZmlnTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wQ29uZmlnRGF0YS5nZXQoY29uZmlnTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICAvLyBOT09QLlxuICAgICAgICB9XG4gICAgICAgIHNodXRkb3duKCkge1xuICAgICAgICAgICAgLy8gTk9PUC5cbiAgICAgICAgfVxuICAgICAgICBsb2FkQ29uZmlnU3VjY2Vzc0NhbGxiYWNrKGNvbmZpZ0Fzc2V0TmFtZSwgY29uZmlnQXNzZXQsIGR1cmF0aW9uLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgbGV0IHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcEluZm8pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2FkIGNvbmZpZyBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubV9wQ29uZmlnSGVscGVyLmxvYWRDb25maWcoY29uZmlnQXNzZXQsIHZfcEluZm8ubG9hZFR5cGUsIHZfcEluZm8udXNlckRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTG9hZCBjb25maWcgZmFpbHVyZSBpbiBoZWxwZXIsIGFzc2V0IG5hbWUgJyR7Y29uZmlnQXNzZXROYW1lfSdgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubV9wTG9hZENvbmZpZ1N1Y2Nlc3NEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZENvbmZpZ1N1Y2Nlc3NEZWxlZ2F0ZS5pdGVyKChjYWxsYmFja0ZuKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGNvbmZpZ0Fzc2V0TmFtZSwgdl9wSW5mby5sb2FkVHlwZSwgZHVyYXRpb24sIHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkQ29uZmlnRmFpbHVyZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkQ29uZmlnRmFpbHVyZURlbGVnYXRlLml0ZXIoKGNhbGxiYWNrRm4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oY29uZmlnQXNzZXROYW1lLCB2X3BJbmZvLmxvYWRUeXBlLCBlLnRvU3RyaW5nKCksIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BDb25maWdIZWxwZXIucmVsZWFzZUNvbmZpZ0Fzc2V0KGNvbmZpZ0Fzc2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsb2FkQ29uZmlnRmFpbHVyZUNhbGxiYWNrKGNvbmZpZ0Fzc2V0TmFtZSwgc3RhdHVzLCBlcnJvck1lc3NhZ2UsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBsZXQgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wSW5mbykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgY29uZmlnIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgYXBwZW5kRXJyb3JNZXNzYWdlID0gYExvYWQgY29uZmlnIGZhaWx1cmUsIGFzc2V0IG5hbWUgJyR7Y29uZmlnQXNzZXROYW1lfScsIHN0YXR1cyAnJHtzdGF0dXN9JywgZXJyb3IgbWVzc2FnZSAnJHtlcnJvck1lc3NhZ2V9Jy5gO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wTG9hZENvbmZpZ0ZhaWx1cmVEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkQ29uZmlnRmFpbHVyZURlbGVnYXRlLml0ZXIoKGNhbGxiYWNrRm4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihjb25maWdBc3NldE5hbWUsIHZfcEluZm8ubG9hZFR5cGUsIGFwcGVuZEVycm9yTWVzc2FnZSwgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGFwcGVuZEVycm9yTWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgICAgbG9hZENvbmZpZ1VwZGF0ZUNhbGxiYWNrKGNvbmZpZ0Fzc2V0TmFtZSwgcHJvZ3Jlc3MsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBsZXQgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wSW5mbykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgY29uZmlnIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkQ29uZmlnVXBkYXRlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZENvbmZpZ1VwZGF0ZURlbGVnYXRlLml0ZXIoKGNhbGxiYWNrRm4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihjb25maWdBc3NldE5hbWUsIHZfcEluZm8ubG9hZFR5cGUsIHByb2dyZXNzLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsb2FkQ29uZmlnRGVwZW5kZW5jeUFzc2V0Q2FsbGJhY2soY29uZmlnQXNzZXROYW1lLCBkZXBlbmRlbmN5QXNzZXROYW1lLCBsb2FkZWRDb3VudCwgdG90YWxDb3VudCwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGxldCB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BJbmZvKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTG9hZCBjb25maWcgaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWRDb25maWdEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkQ29uZmlnRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGUuaXRlcigoY2FsbGJhY2tGbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGNvbmZpZ0Fzc2V0TmFtZSwgZGVwZW5kZW5jeUFzc2V0TmFtZSwgbG9hZGVkQ291bnQsIHRvdGFsQ291bnQsIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSAvLyBjbGFzcyBDb25maWdNYW5hZ2VyXG4gICAgZXhwb3J0cy5Db25maWdNYW5hZ2VyID0gQ29uZmlnTWFuYWdlcjtcbn0pO1xuIiwiKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIiwgXCIuL0Jhc2VcIl0sIGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIGNvbnN0IEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XG4gICAgY2xhc3MgRGF0YU5vZGVNYW5hZ2VyIGV4dGVuZHMgQmFzZV8xLkZyYW1ld29ya01vZHVsZSB7XG4gICAgICAgIHVwZGF0ZShlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgc2h1dGRvd24oKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcbiAgICAgICAgfVxuICAgIH0gLy8gY2xhc3MgRGF0YU5vZGVNYW5hZ2VyXG4gICAgZXhwb3J0cy5EYXRhTm9kZU1hbmFnZXIgPSBEYXRhTm9kZU1hbmFnZXI7XG59KTtcbiIsIihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICBjb25zdCBCYXNlXzEgPSByZXF1aXJlKFwiLi9CYXNlXCIpO1xuICAgIC8qKlxuICAgICAqIEEgc2ltcGxlIGV2ZW50IG1hbmFnZXIgaW1wbGVtZW50YXRpb24uXG4gICAgICpcbiAgICAgKiBAYXV0aG9yIEplcmVteSBDaGVuIChrZXlob20uY0BnbWFpbC5jb20pXG4gICAgICovXG4gICAgY2xhc3MgRXZlbnRNYW5hZ2VyIGV4dGVuZHMgQmFzZV8xLkZyYW1ld29ya01vZHVsZSB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycyA9IG5ldyBNYXAoKTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgcHJpb3JpdHkoKSB7XG4gICAgICAgICAgICByZXR1cm4gMTAwO1xuICAgICAgICB9XG4gICAgICAgIGNoZWNrKGV2ZW50SWQsIGhhbmRsZXIpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcEV2ZW50SGFuZGxlcnMuaGFzKGV2ZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wRXZlbnRIYW5kbGVycy5nZXQoZXZlbnRJZCkuaGFzKGhhbmRsZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIG9uKGV2ZW50SWQsIGhhbmRsZXIpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElkKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycy5zZXQoZXZlbnRJZCwgbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50SWQpLmFkZChoYW5kbGVyKTtcbiAgICAgICAgfVxuICAgICAgICBvZmYoZXZlbnRJZCwgaGFuZGxlcikge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wRXZlbnRIYW5kbGVycy5oYXMoZXZlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50SWQpLnJlbW92ZShoYW5kbGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbWl0KGV2ZW50SWQsIC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcEV2ZW50SGFuZGxlcnMuaGFzKGV2ZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BFdmVudEhhbmRsZXJzLmdldChldmVudElkKS5pdGVyKChjYWxsYmFja0ZuKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICAvLyBOT09QLlxuICAgICAgICB9XG4gICAgICAgIHNodXRkb3duKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wRXZlbnRIYW5kbGVycykge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycy5mb3JFYWNoKChlaCwga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGVoLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BFdmVudEhhbmRsZXJzLmNsZWFyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IC8vIGNsYXNzIEV2ZW50TWFuYWdlclxuICAgIGV4cG9ydHMuRXZlbnRNYW5hZ2VyID0gRXZlbnRNYW5hZ2VyO1xufSk7XG4iLCIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgY29uc3QgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICBjbGFzcyBGc21TdGF0ZSB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgdGhpcy5tX3BFdmVudEhhbmRsZXJzID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycyA9IG5ldyBNYXAoKTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fc05hbWU7XG4gICAgICAgIH1cbiAgICAgICAgb25Jbml0KGZzbSkge1xuICAgICAgICAgICAgLy8gTk9PUFxuICAgICAgICB9XG4gICAgICAgIG9uRW50ZXIoZnNtKSB7XG4gICAgICAgICAgICAvLyBOT09QXG4gICAgICAgIH1cbiAgICAgICAgb25VcGRhdGUoZnNtLCBlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgLy8gTk9PUFxuICAgICAgICB9XG4gICAgICAgIG9uTGVhdmUoZnNtLCBzaHV0ZG93bikge1xuICAgICAgICAgICAgLy8gTk9PUFxuICAgICAgICB9XG4gICAgICAgIGNoYW5nZVN0YXRlKGZzbSwgdHlwZSkge1xuICAgICAgICAgICAgaWYgKCFmc20pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZzbSBpcyBpbnZhbGlkOiAke2ZzbX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZzbS5jaGFuZ2VTdGF0ZSh0eXBlKTtcbiAgICAgICAgfVxuICAgICAgICBvbihldmVudElkLCBldmVudEhhbmRsZXIpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IGV2ZW50SGFuZGxlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFdmVudCBoYW5kbGVyIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1fcEV2ZW50SGFuZGxlcnMuaGFzKGV2ZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgbGV0IGVoID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuc2V0KGV2ZW50SWQsIGVoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycy5nZXQoZXZlbnRJZCkuYWRkKGV2ZW50SGFuZGxlcik7XG4gICAgICAgIH1cbiAgICAgICAgb2ZmKGV2ZW50SWQsIGV2ZW50SGFuZGxlcikge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gZXZlbnRIYW5kbGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkV2ZW50IGhhbmRsZXIgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElkKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycy5nZXQoZXZlbnRJZCkucmVtb3ZlKGV2ZW50SGFuZGxlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZW1pdChmc20sIHNlbmRlciwgZXZlbnRJZCwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcEV2ZW50SGFuZGxlcnMuaGFzKGV2ZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BFdmVudEhhbmRsZXJzLmdldChldmVudElkKS5pdGVyKChjYWxsYmFja0ZuKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oZnNtLCBzZW5kZXIsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gLy8gY2xhc3MgRnNtU3RhdGU8VD5cbiAgICBleHBvcnRzLkZzbVN0YXRlID0gRnNtU3RhdGU7XG4gICAgY2xhc3MgRnNtIHtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICB0aGlzLm1fcFN0YXRlcyA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fcERhdGFzID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9zTmFtZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fcFN0YXRlcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5tX3BEYXRhcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGVUaW1lID0gMDtcbiAgICAgICAgICAgIHRoaXMuX2lzRGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBzdGF0aWMgY3JlYXRlRnNtKG5hbWUsIG93bmVyLCBzdGF0ZXMpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IG93bmVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRlNNIG93bmVyIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSBzdGF0ZXMgfHwgc3RhdGVzLmxlbmd0aCA8IDEpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGU00gc3RhdGVzIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBsZXQgdl9wRnNtID0gbmV3IEZzbSgpO1xuICAgICAgICAgICAgdl9wRnNtLm1fc05hbWUgPSBuYW1lO1xuICAgICAgICAgICAgdl9wRnNtLm1fcE93bmVyID0gb3duZXI7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHZfcFN0YXRlIG9mIHN0YXRlcykge1xuICAgICAgICAgICAgICAgIGlmIChudWxsID09IHZfcFN0YXRlKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZTTSBzdGF0ZXMgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgICAgICBpZiAodl9wRnNtLmhhc1N0YXRlKHZfcFN0YXRlLmNvbnN0cnVjdG9yKSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGU00gJyR7bmFtZX0nIHN0YXRlICcke3ZfcFN0YXRlfScgaXMgYWxyZWFkeSBleGlzdC5gKTtcbiAgICAgICAgICAgICAgICB2X3BGc20ubV9wU3RhdGVzLnB1c2godl9wU3RhdGUpO1xuICAgICAgICAgICAgICAgIHZfcFN0YXRlLm9uSW5pdCh2X3BGc20pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdl9wRnNtLl9pc0Rlc3Ryb3llZCA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHZfcEZzbTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fc05hbWU7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IG93bmVyKCkgeyByZXR1cm4gdGhpcy5tX3BPd25lcjsgfVxuICAgICAgICBnZXQgZnNtU3RhdGVDb3VudCgpIHsgcmV0dXJuIHRoaXMubV9wU3RhdGVzLmxlbmd0aDsgfVxuICAgICAgICBnZXQgaXNSdW5uaW5nKCkgeyByZXR1cm4gbnVsbCAhPSB0aGlzLl9jdXJyZW50U3RhdGU7IH1cbiAgICAgICAgZ2V0IGlzRGVzdHJveWVkKCkgeyByZXR1cm4gdGhpcy5faXNEZXN0cm95ZWQ7IH1cbiAgICAgICAgZ2V0IGN1cnJlbnRTdGF0ZSgpIHsgcmV0dXJuIHRoaXMuX2N1cnJlbnRTdGF0ZTsgfVxuICAgICAgICBnZXQgY3VycmVudFN0YXRlTmFtZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTdGF0ZSA/IHRoaXMuY3VycmVudFN0YXRlLm5hbWUgOiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGdldCBjdXJyZW50U3RhdGVUaW1lKCkgeyByZXR1cm4gdGhpcy5fY3VycmVudFN0YXRlVGltZTsgfVxuICAgICAgICBzdGFydCh0eXBlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pc1J1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGU00gaXMgcnVubmluZywgY2FuIG5vdCBzdGFydCBhZ2Fpbi5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgc3RhdGUgPSB0aGlzLmdldFN0YXRlKHR5cGUpO1xuICAgICAgICAgICAgaWYgKCFzdGF0ZSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRlNNICcke3RoaXMubmFtZX0nIGNhbiBub3Qgc3RhcnQgc3RhdGUgJyR7dHlwZS5uYW1lfScgd2hpY2ggaXMgbm90IGV4aXN0cy5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZVRpbWUgPSAwO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlID0gc3RhdGU7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGF0ZS5vbkVudGVyKHRoaXMpOyAvLyBDYWxsIGludGVybmFsIGZ1bmN0aW9uIHdpdGggYW55IGNhc3RpbmcuXG4gICAgICAgIH1cbiAgICAgICAgaGFzU3RhdGUodHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGwgIT0gdGhpcy5nZXRTdGF0ZSh0eXBlKTtcbiAgICAgICAgfVxuICAgICAgICBnZXRTdGF0ZSh0eXBlKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubV9wU3RhdGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgdl9wU3RhdGUgPSB0aGlzLm1fcFN0YXRlc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BTdGF0ZSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgaWYgKHZfcFN0YXRlIGluc3RhbmNlb2YgdHlwZSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZfcFN0YXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0QWxsU3RhdGVzKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wU3RhdGVzO1xuICAgICAgICB9XG4gICAgICAgIGNoYW5nZVN0YXRlKHR5cGUpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fY3VycmVudFN0YXRlKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ3VycmVudCBzdGF0ZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgbGV0IHZfcFN0YXRlID0gdGhpcy5nZXRTdGF0ZSh0eXBlKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcFN0YXRlKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRnNtIGNhbiBub3QgY2hhbmdlIHN0YXRlLCBzdGF0ZSBpcyBub3QgZXhpc3Q6ICR7dHlwZX1gKTtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZS5vbkxlYXZlKHRoaXMsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZVRpbWUgPSAwO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlID0gdl9wU3RhdGU7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGUub25FbnRlcih0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBnZXREYXRhKG5hbWUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcERhdGFzLmhhcyhuYW1lKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BEYXRhcy5nZXQobmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBzZXREYXRhKG5hbWUsIGRhdGEpIHtcbiAgICAgICAgICAgIGlmICghbmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RhdGEgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdGhpcy5tX3BEYXRhcy5zZXQobmFtZSwgZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVtb3ZlRGF0YShuYW1lKSB7XG4gICAgICAgICAgICBpZiAoIW5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXRhIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGxldCB2X2JSZXQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChuYW1lIGluIHRoaXMubV9wRGF0YXMpIHtcbiAgICAgICAgICAgICAgICB2X2JSZXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRGF0YXMuZGVsZXRlKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZfYlJldDtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMuX2N1cnJlbnRTdGF0ZSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGVUaW1lICs9IGVsYXBzZWQ7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGUub25VcGRhdGUodGhpcywgZWxhcHNlZCwgcmVhbEVsYXBzZWQpO1xuICAgICAgICB9XG4gICAgICAgIHNodXRkb3duKCkge1xuICAgICAgICAgICAgLy8gRklYTUU6IEZpZ3VlIG91dCBhIHdheSB0byByZWxlYXNlIHRoaXMuXG4gICAgICAgIH1cbiAgICB9IC8vIGNsYXNzIEZzbTxUPlxuICAgIGV4cG9ydHMuRnNtID0gRnNtO1xuICAgIGNsYXNzIEZzbU1hbmFnZXIgZXh0ZW5kcyBCYXNlXzEuRnJhbWV3b3JrTW9kdWxlIHtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICAgICAgdGhpcy5tX3BGc21zID0gbmV3IE1hcCgpO1xuICAgICAgICB9XG4gICAgICAgIGdldCBwcmlvcml0eSgpIHtcbiAgICAgICAgICAgIHJldHVybiA2MDtcbiAgICAgICAgfVxuICAgICAgICBnZXQgY291bnQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BGc21zLnNpemU7XG4gICAgICAgIH1cbiAgICAgICAgaGFzRnNtKG5hbWVPclR5cGUpIHtcbiAgICAgICAgICAgIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgbmFtZU9yVHlwZSAmJiBuYW1lT3JUeXBlLnByb3RvdHlwZSkge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHRoaXMubV9wRnNtcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2X3BGc20gPSB0aGlzLm1fcEZzbXMuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChudWxsICE9IHZfcEZzbSAmJiB2X3BGc20gaW5zdGFuY2VvZiBuYW1lT3JUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBuYW1lT3JUeXBlLnRvU3RyaW5nKCkgaW4gdGhpcy5tX3BGc21zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNyZWF0ZUZzbShuYW1lLCBvd25lciwgc3RhdGVzKSB7XG4gICAgICAgICAgICBuYW1lID0gbmFtZSB8fCAnJztcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc0ZzbShuYW1lKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQWxyZWFkeSBleGlzdCBGU00gJyR7bmFtZX0nLmApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZnNtID0gRnNtLmNyZWF0ZUZzbShuYW1lLCBvd25lciwgc3RhdGVzKTtcbiAgICAgICAgICAgIHRoaXMubV9wRnNtcy5zZXQobmFtZSwgZnNtKTtcbiAgICAgICAgICAgIHJldHVybiBmc207XG4gICAgICAgIH1cbiAgICAgICAgZGVzdHJveUZzbShpbnN0YW5jZSkge1xuICAgICAgICAgICAgbGV0IHZfcEZzbSA9IG51bGw7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaGFzRnNtKGluc3RhbmNlLmNvbnN0cnVjdG9yKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YoaW5zdGFuY2UpLmhhc093blByb3BlcnR5KCdzaHV0ZG93bicpKSB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2Uuc2h1dGRvd24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHRoaXMubV9wRnNtcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZfcEZzbSA9IHRoaXMubV9wRnNtcy5nZXQoa2V5KTtcbiAgICAgICAgICAgICAgICBpZiAodl9wRnNtID09IGluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wRnNtcy5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiB0aGlzLm1fcEZzbXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2X0ZzbSA9IHRoaXMubV9wRnNtcy5nZXQoa2V5KTtcbiAgICAgICAgICAgICAgICBpZiAoIXZfRnNtICYmIHZfRnNtLmlzRGVzdHJveWVkKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB2X0ZzbS51cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNodXRkb3duKCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gdGhpcy5tX3BGc21zKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgdl9Gc20gPSB0aGlzLm1fcEZzbXMuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKCF2X0ZzbSAmJiB2X0ZzbS5pc0Rlc3Ryb3llZClcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgdl9Gc20uc2h1dGRvd24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEZzbXMuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IC8vIGNsYXNzIEZzbU1hbmFnZXJcbiAgICBleHBvcnRzLkZzbU1hbmFnZXIgPSBGc21NYW5hZ2VyO1xufSk7XG4iLCIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiLCBcIi4vRnNtXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICBjb25zdCBCYXNlXzEgPSByZXF1aXJlKFwiLi9CYXNlXCIpO1xuICAgIGNvbnN0IEZzbV8xID0gcmVxdWlyZShcIi4vRnNtXCIpO1xuICAgIGNsYXNzIFByb2NlZHVyZUJhc2UgZXh0ZW5kcyBGc21fMS5Gc21TdGF0ZSB7XG4gICAgfSAvLyBjbGFzcyBQcm9jZWR1cmVCYXNlXG4gICAgZXhwb3J0cy5Qcm9jZWR1cmVCYXNlID0gUHJvY2VkdXJlQmFzZTtcbiAgICBjbGFzcyBQcm9jZWR1cmVNYW5hZ2VyIGV4dGVuZHMgQmFzZV8xLkZyYW1ld29ya01vZHVsZSB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHRoaXMubV9wRnNtTWFuYWdlciA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fcFByb2NlZHVyZUZzbSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IHByaW9yaXR5KCkgeyByZXR1cm4gLTEwOyB9XG4gICAgICAgIGdldCBjdXJyZW50UHJvY2VkdXJlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUHJvY2VkdXJlRnNtLmN1cnJlbnRTdGF0ZTtcbiAgICAgICAgfVxuICAgICAgICBpbml0aWFsaXplKGZzbU1hbmFnZXIsIHByb2NlZHVyZXMpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IGZzbU1hbmFnZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGU00gbWFuYWdlciBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdGhpcy5tX3BGc21NYW5hZ2VyID0gZnNtTWFuYWdlcjtcbiAgICAgICAgICAgIHRoaXMubV9wUHJvY2VkdXJlRnNtID0gZnNtTWFuYWdlci5jcmVhdGVGc20obnVsbCwgdGhpcywgcHJvY2VkdXJlcyk7XG4gICAgICAgIH1cbiAgICAgICAgc3RhcnRQcm9jZWR1cmUob2JqKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLm1fcFByb2NlZHVyZUZzbSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBtdXN0IGluaXRpYWxpemUgcHJvY2VkdXJlIGZpcnN0LicpO1xuICAgICAgICAgICAgdGhpcy5tX3BQcm9jZWR1cmVGc20uc3RhcnQob2JqLmNvbnN0cnVjdG9yKTtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIC8vIE5vb3AuXG4gICAgICAgIH1cbiAgICAgICAgc2h1dGRvd24oKSB7XG4gICAgICAgICAgICBpZiAobnVsbCAhPSB0aGlzLm1fcEZzbU1hbmFnZXIpIHtcbiAgICAgICAgICAgICAgICBpZiAobnVsbCAhPSB0aGlzLm1fcFByb2NlZHVyZUZzbSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcEZzbU1hbmFnZXIuZGVzdHJveUZzbSh0aGlzLm1fcFByb2NlZHVyZUZzbSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wUHJvY2VkdXJlRnNtID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BGc21NYW5hZ2VyID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBoYXNQcm9jZWR1cmUodHlwZSkge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BQcm9jZWR1cmVGc20pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgbXVzdCBpbml0aWFsaXplIHByb2NlZHVyZSBmaXJzdC4nKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFByb2NlZHVyZUZzbS5oYXNTdGF0ZSh0eXBlKTtcbiAgICAgICAgfVxuICAgICAgICBnZXRQcm9jZWR1cmUodHlwZSkge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BQcm9jZWR1cmVGc20pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgbXVzdCBpbml0aWFsaXplIHByb2NlZHVyZSBmaXJzdC4nKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFByb2NlZHVyZUZzbS5nZXRTdGF0ZSh0eXBlKTtcbiAgICAgICAgfVxuICAgIH0gLy8gY2xhc3MgUHJvY2VkdXJlTWFuYWdlclxuICAgIGV4cG9ydHMuUHJvY2VkdXJlTWFuYWdlciA9IFByb2NlZHVyZU1hbmFnZXI7XG59KTtcbiIsIihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICB2YXIgUmVzb3VyY2VNb2RlO1xuICAgIChmdW5jdGlvbiAoUmVzb3VyY2VNb2RlKSB7XG4gICAgICAgIFJlc291cmNlTW9kZVtSZXNvdXJjZU1vZGVbXCJVbnNwZWNpZmllZFwiXSA9IDBdID0gXCJVbnNwZWNpZmllZFwiO1xuICAgICAgICBSZXNvdXJjZU1vZGVbUmVzb3VyY2VNb2RlW1wiUGFja2FnZVwiXSA9IDFdID0gXCJQYWNrYWdlXCI7XG4gICAgICAgIFJlc291cmNlTW9kZVtSZXNvdXJjZU1vZGVbXCJVcGRhdGFibGVcIl0gPSAyXSA9IFwiVXBkYXRhYmxlXCI7XG4gICAgfSkoUmVzb3VyY2VNb2RlID0gZXhwb3J0cy5SZXNvdXJjZU1vZGUgfHwgKGV4cG9ydHMuUmVzb3VyY2VNb2RlID0ge30pKTsgLy8gZW51bSBSZXNvdXJjZU1vZGVcbiAgICB2YXIgTG9hZFJlc291cmNlU3RhdHVzO1xuICAgIChmdW5jdGlvbiAoTG9hZFJlc291cmNlU3RhdHVzKSB7XG4gICAgICAgIExvYWRSZXNvdXJjZVN0YXR1c1tMb2FkUmVzb3VyY2VTdGF0dXNbXCJTdWNjZXNzXCJdID0gMF0gPSBcIlN1Y2Nlc3NcIjtcbiAgICAgICAgTG9hZFJlc291cmNlU3RhdHVzW0xvYWRSZXNvdXJjZVN0YXR1c1tcIk5vdFJlYWR5XCJdID0gMV0gPSBcIk5vdFJlYWR5XCI7XG4gICAgICAgIExvYWRSZXNvdXJjZVN0YXR1c1tMb2FkUmVzb3VyY2VTdGF0dXNbXCJOb3RFeGlzdFwiXSA9IDJdID0gXCJOb3RFeGlzdFwiO1xuICAgICAgICBMb2FkUmVzb3VyY2VTdGF0dXNbTG9hZFJlc291cmNlU3RhdHVzW1wiRGVwZW5kZW5jeUVycm9yXCJdID0gM10gPSBcIkRlcGVuZGVuY3lFcnJvclwiO1xuICAgICAgICBMb2FkUmVzb3VyY2VTdGF0dXNbTG9hZFJlc291cmNlU3RhdHVzW1wiVHlwZUVycm9yXCJdID0gNF0gPSBcIlR5cGVFcnJvclwiO1xuICAgICAgICBMb2FkUmVzb3VyY2VTdGF0dXNbTG9hZFJlc291cmNlU3RhdHVzW1wiQXNzZXRFcnJvclwiXSA9IDVdID0gXCJBc3NldEVycm9yXCI7XG4gICAgfSkoTG9hZFJlc291cmNlU3RhdHVzID0gZXhwb3J0cy5Mb2FkUmVzb3VyY2VTdGF0dXMgfHwgKGV4cG9ydHMuTG9hZFJlc291cmNlU3RhdHVzID0ge30pKTsgLy8gZW51bSBMb2FkUmVzb3VyY2VTdGF0dXNcbn0pO1xuIiwiKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIl0sIGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIHZhciBnbG9iYWwgPSBnbG9iYWwgfHwge307XG4gICAgY29uc3Qgdl9wR2xvYmFsID0gJ3VuZGVmaW5lZCcgPT0gdHlwZW9mIHdpbmRvdyA/IGdsb2JhbCA6IHdpbmRvdztcbiAgICBjb25zdCBhdHNmcmFtZXdvcmsgPSB2X3BHbG9iYWwuYXRzZnJhbWV3b3JrIHx8IHt9O1xuICAgIGZ1bmN0aW9uIGV4cG9zZShtKSB7XG4gICAgICAgIGZvciAoY29uc3QgayBpbiBtKSB7XG4gICAgICAgICAgICBhdHNmcmFtZXdvcmtba10gPSBtW2tdO1xuICAgICAgICB9XG4gICAgfVxuICAgIGV4cG9zZShyZXF1aXJlKCcuL0Jhc2UnKSk7XG4gICAgZXhwb3NlKHJlcXVpcmUoXCIuL0NvbmZpZ1wiKSk7XG4gICAgZXhwb3NlKHJlcXVpcmUoXCIuL0RhdGFOb2RlXCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vRnNtXCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vUmVzb3VyY2VcIikpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9FdmVudFwiKSk7XG4gICAgZXhwb3NlKHJlcXVpcmUoXCIuL1Byb2NlZHVyZVwiKSk7XG4gICAgdl9wR2xvYmFsLmF0c2ZyYW1ld29yayA9IGF0c2ZyYW1ld29yaztcbiAgICBleHBvcnRzLmRlZmF1bHQgPSBhdHNmcmFtZXdvcms7XG59KTtcbiJdfQ==
