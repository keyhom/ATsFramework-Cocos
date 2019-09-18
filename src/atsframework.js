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
        get size() {
            return this.m_pHandlers.size;
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
        get eventCount() {
            return 0;
        }
        count(eventID) {
            if (this.m_pEventHandlers.has(eventID)) {
                return this.m_pEventHandlers.get(eventID).size;
            }
            return 0;
        }
        check(eventId, handler) {
            if (this.m_pEventHandlers.has(eventId)) {
                return handler ? this.m_pEventHandlers.get(eventId).has(handler) : true;
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
            if (this.m_pDatas.has(name)) {
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
                for (const fsm of this.m_pFsms.values()) {
                    if (null != fsm && fsm instanceof nameOrType) {
                        return true;
                    }
                }
            }
            else {
                this.m_pFsms.has(nameOrType.toString());
            }
            return false;
        }
        getFsm(nameOrType) {
            if ('function' === typeof nameOrType && nameOrType.prototype) {
                for (const fsm of this.m_pFsms.values()) {
                    if (null != fsm && fsm instanceof nameOrType)
                        return fsm;
                }
            }
            else {
                return this.m_pFsms.get(nameOrType.toString());
            }
            return null;
        }
        getAllFsms() {
            const v_pRet = [];
            for (const fsm of this.m_pFsms.values()) {
                v_pRet.push(fsm);
            }
            return v_pRet;
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
        destroyFsm(arg) {
            let v_sName = null;
            let v_pType = null;
            let v_pInstance = null;
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
                for (const key of this.m_pFsms.keys()) {
                    const v_pFsm = this.m_pFsms.get(key);
                    if (v_pFsm == v_pInstance) {
                        this.m_pFsms.delete(key);
                        break;
                    }
                }
            }
            else if (null != v_sName) {
                for (const key of this.m_pFsms.keys()) {
                    const v_pFsm = this.m_pFsms.get(key);
                    if (v_pFsm.name == v_sName) {
                        this.m_pFsms.delete(key);
                        break;
                    }
                }
            }
            else if (null != v_pType) {
                for (const key of this.m_pFsms.keys()) {
                    const v_pFsm = this.m_pFsms.get(key);
                    if (v_pFsm instanceof v_pType) {
                        this.m_pFsms.delete(key);
                        break;
                    }
                }
            }
            return true;
        }
        update(elapsed, realElapsed) {
            for (const fsm of this.m_pFsms.values()) {
                if (!fsm && fsm.isDestroyed)
                    continue;
                fsm.update(elapsed, realElapsed);
            }
        }
        shutdown() {
            for (const key of this.m_pFsms.keys()) {
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
        define(["require", "exports", "./Base"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Base_1 = require("./Base");
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
    class ResourceManager extends Base_1.FrameworkModule {
        constructor() {
            super(...arguments);
            this.m_pResourceGroup = null;
        }
        get resourceGroup() { return this.m_pResourceGroup; }
        get resourceLoader() { return this.m_pResourceLoader; }
        set resourceLoader(value) {
            if (null == value)
                throw new Error("Setting resource loader is invalid.");
            this.m_pResourceLoader = value;
        }
        get priority() {
            return 70;
        }
        hasAsset(assetName) {
            if (!assetName)
                throw new Error("Asset name is invalid.");
            return this.m_pResourceLoader.hasAsset(assetName);
        }
        loadAsset(assetName, assetType, priority, loadAssetCallbacks, userData) {
            if (!assetName)
                throw new Error("Asset name is invalid.");
            if (!loadAssetCallbacks)
                throw new Error("Load asset callbacks is invalid.");
            this.m_pResourceLoader.loadAsset(assetName, assetType, priority, loadAssetCallbacks, userData);
        }
        unloadAsset(asset) {
            if (!asset)
                throw new Error("Asset is invalid.");
            if (null == this.m_pResourceLoader)
                return;
            this.m_pResourceLoader.unloadAsset(asset);
        }
        loadScene(sceneAssetName, priority, loadSceneCallbacks, userData) {
            if (!sceneAssetName)
                throw new Error("Scene asset name is invalid.");
            if (!loadSceneCallbacks)
                throw new Error("Load scene asset callbacks is invalid.");
            this.m_pResourceLoader.loadScene(sceneAssetName, priority, loadSceneCallbacks, userData);
        }
        unloadScene(sceneAssetName, unloadSceneCallbacks, userData) {
            if (!sceneAssetName)
                throw new Error("Scene asset name is invalid.");
            if (!unloadSceneCallbacks)
                throw new Error("Unload scene callbacks is invalid.");
            this.m_pResourceLoader.unloadScene(sceneAssetName, unloadSceneCallbacks, userData);
        }
        hasResourceGroup(resourceGroupName) {
            throw new Error("Method not implemented.");
        }
        update(elapsed, realElapsed) {
            if (this.m_pResourceLoader) {
                this.m_pResourceLoader.update(elapsed, realElapsed);
            }
        }
        shutdown() {
            if (this.m_pResourceLoader) {
                this.m_pResourceLoader.shutdown();
            }
        }
    } // class ResourceManager
    exports.ResourceManager = ResourceManager;
});

},{"./Base":1}],8:[function(require,module,exports){
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
    class UIManager extends Base_1.FrameworkModule {
        constructor() {
            super(...arguments);
            this.m_rUIGroups = new Map();
            this.m_iSerialId = 0;
            this.m_pUIFormHelper = null;
            this.m_bIsShutdown = false;
            this.m_rUIFormsBeingLoaded = new Map();
            this.m_rUIFormsToReleaseOnLoad = new Set();
            this.m_pInstancePool = new Map();
            this.m_pRecycleQueue = [];
            this.m_pResourceManager = null;
            this.m_pLoadAssetCallbacks = {
                success: this.loadUIFormSuccessCallback.bind(this),
                failure: this.loadUIFormFailureCallback.bind(this),
                update: this.loadUIFormUpdateCallback.bind(this),
                dependency: this.loadUIFormDependencyAssetCallback.bind(this),
            };
            this.m_pOpenUIFormSuccessDelegate = new Base_1.EventHandler();
            this.m_pOpenUIFormFailureDelegate = new Base_1.EventHandler();
            this.m_pOpenUIFormUpdateDelegate = new Base_1.EventHandler();
            this.m_pOpenUIFormDependencyAssetDelegate = new Base_1.EventHandler();
            this.m_pCloseUIFormCompleteDelegate = new Base_1.EventHandler();
            this.m_fInstanceAutoReleaseInterval = 0;
            this.m_uInstanceCapacity = 0;
            this.m_fInstanceExpireTime = 0;
            this.m_iInstancePriority = 0;
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
        get uiFormHelper() { return this.m_pUIFormHelper; }
        set uiFormHelper(value) {
            if (!value)
                throw new Error('UI form helper is invalid.');
            this.m_pUIFormHelper = value;
        }
        get resourceManager() {
            return this.m_pResourceManager;
        }
        set resourceManager(value) {
            if (null == value)
                throw new Error("Resource manager is invalid.");
            this.m_pResourceManager = value;
        }
        get uiGroupCount() {
            return this.m_rUIGroups.size;
        }
        get openUIFormSuccess() { return this.m_pOpenUIFormSuccessDelegate; }
        get openUIFormFailure() { return this.m_pOpenUIFormFailureDelegate; }
        get openUIFormUpdate() { return this.m_pOpenUIFormUpdateDelegate; }
        get openUIFormDependencyAsset() { return this.m_pOpenUIFormDependencyAssetDelegate; }
        get closeUIFormComplete() { return this.m_pCloseUIFormCompleteDelegate; }
        get instanceAutoReleaseInterval() { return this.m_fInstanceAutoReleaseInterval; }
        set instanceAutoReleaseInterval(value) { this.m_fInstanceAutoReleaseInterval = value; }
        get instanceCapacity() { return this.m_uInstanceCapacity; }
        set instanceCapacity(value) { this.m_uInstanceCapacity = value; }
        get instanceExpireTime() { return this.m_fInstanceExpireTime; }
        set instanceExpireTime(value) { this.m_fInstanceExpireTime = value; }
        get instancePriority() { return this.m_iInstancePriority; }
        set instancePriority(value) { this.m_iInstancePriority = value; }
        update(elapsed, realElapsed) {
            for (const uiForm of this.m_pRecycleQueue) {
                if (this.m_pInstancePool.has(uiForm.uiFormAssetName)) {
                    const v_pInstanceObjects = this.m_pInstancePool.get(uiForm.uiFormAssetName);
                    if (v_pInstanceObjects && v_pInstanceObjects.length > 0) {
                        for (const v_pUiFormInstanceObject of v_pInstanceObjects) {
                            if (v_pUiFormInstanceObject.isValid) {
                                uiForm.onRecycle();
                                v_pUiFormInstanceObject.spawn = false;
                            }
                        }
                    }
                }
            }
            if (this.m_pRecycleQueue.length)
                this.m_pRecycleQueue.splice(0, this.m_pRecycleQueue.length);
            // TODO: auto release processing here.
            this.m_rUIGroups.forEach((uiGroup, key) => {
                const v_pUiGroup = uiGroup;
                v_pUiGroup.update(elapsed, realElapsed);
            });
        }
        shutdown() {
            this.m_bIsShutdown = true;
            this.closeAllLoadedUIForms();
            this.m_rUIGroups = null;
            this.m_rUIFormsBeingLoaded = null;
            this.m_rUIFormsToReleaseOnLoad = null;
            this.m_pRecycleQueue.splice(0, this.m_pRecycleQueue.length);
            this.m_pRecycleQueue = null;
            if (this.m_pInstancePool) {
                this.m_pInstancePool.forEach((instanceObjects, key) => {
                    if (instanceObjects && instanceObjects.length > 0) {
                        for (const v_pUiFormInstanceObject of instanceObjects) {
                            v_pUiFormInstanceObject.release(true);
                            v_pUiFormInstanceObject.clear();
                            v_pUiFormInstanceObject.target = null;
                        }
                        instanceObjects.splice(0, instanceObjects.length);
                        this.m_pInstancePool.delete(key);
                    }
                });
                this.m_pInstancePool.clear();
            }
        }
        openUIForm(uiFormAssetName, uiGroupName, priority, pauseCoveredUIForm, userData) {
            // cc.log(`[UIManager] Reqeust Open UIForm asset '${uiFormAssetName}' with group '${uiGroupName}' on priority '${priority}', pauseCoveredUIForm: ${pauseCoveredUIForm}, userData: ${userData}`);
            if (null == this.m_pResourceManager)
                throw new Error("You must set resource manager first.");
            if (null == this.m_pUIFormHelper)
                throw new Error("You must set UI form helper first.");
            if (!uiFormAssetName)
                throw new Error('UI form asset name is invalid.');
            if (!uiGroupName)
                throw new Error('UI group name is invalid.');
            let v_rUIGroup = this.getUIGroup(uiGroupName);
            if (null == v_rUIGroup) {
                throw new Error(`UI group '${uiGroupName}' is not exist.`);
            }
            let v_iSerialId = ++this.m_iSerialId;
            let v_pUiFormInstanceObject = null;
            if (this.m_pInstancePool.has(uiFormAssetName)) {
                // Get spawn.
                let v_pInstanceObjects = this.m_pInstancePool.get(uiFormAssetName);
                if (v_pInstanceObjects && v_pInstanceObjects.length > 0) {
                    for (let i = 0; i < v_pInstanceObjects.length; i++) {
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
                    throw new Error(`Key duplicated with: ${v_iSerialId}`);
                this.m_rUIFormsBeingLoaded.set(v_iSerialId, uiFormAssetName);
                // FIXME: call on resource manager to loadAsset.
                let v_rOpenUiFormInfo = {
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
        }
        isLoadingUIForm(serialIdOrAssetName) {
            if ('string' === typeof serialIdOrAssetName) {
                for (const uiFormAssetName of this.m_rUIFormsBeingLoaded.values()) {
                    if (uiFormAssetName === serialIdOrAssetName)
                        return true;
                }
                return false;
            }
            else {
                return this.m_rUIFormsBeingLoaded.has(serialIdOrAssetName);
            }
        }
        getUIForms(uiFormAssetName) {
            let v_rRet = [];
            for (const uiGroup of this.m_rUIGroups.values()) {
                if (null != uiGroup) {
                    const v_pForms = uiGroup.getUIForms(uiFormAssetName);
                    v_rRet = v_rRet.concat(v_pForms);
                }
            }
            return v_rRet;
        }
        getUIForm(serialIdOrAssetName) {
            if ('string' === typeof serialIdOrAssetName) {
                if (!serialIdOrAssetName)
                    throw new Error('UI form asset name is invalid.');
            }
            let uiForm = null;
            for (const uiGroup of this.m_rUIGroups.values()) {
                if ((uiForm = uiGroup.getUIForm(serialIdOrAssetName))) {
                    return uiForm;
                }
            }
            return null;
        }
        hasUIForm(serialIdOrAssetName) {
            return null != this.getUIForm(serialIdOrAssetName);
        }
        closeUIForm(serialIdOrUiForm, userData) {
            let uiForm = serialIdOrUiForm;
            if ('number' === typeof serialIdOrUiForm) {
                if (this.isLoadingUIForm(serialIdOrUiForm)) {
                    this.m_rUIFormsToReleaseOnLoad.add(serialIdOrUiForm);
                    this.m_rUIFormsBeingLoaded.delete(serialIdOrUiForm);
                    return;
                }
                uiForm = this.getUIForm(serialIdOrUiForm);
                if (null == uiForm) {
                    throw new Error(`Can not find UI form '${serialIdOrUiForm}'`);
                }
            }
            if (!uiForm)
                throw new Error('UI form is invalid.');
            let uiGroup = uiForm.uiGroup;
            if (null == uiGroup)
                throw new Error('UI group is invalid.');
            uiGroup.removeUIForm(uiForm);
            uiForm.onClose(this.m_bIsShutdown, userData);
            uiGroup.refresh();
            let eventArgs = {
                serialId: uiForm.serialId,
                uiGroup: uiGroup,
                uiFormAssetName: uiForm.uiFormAssetName,
                userData: userData
            };
            this.m_pCloseUIFormCompleteDelegate.iter((callbackFn) => {
                callbackFn(eventArgs);
            });
            this.m_pRecycleQueue.push(uiForm);
        }
        getAllLoadedUIForms() {
            let v_pRet = [];
            for (const uiGroup of this.m_rUIGroups.values()) {
                v_pRet.concat(uiGroup.getAllUIForms());
            }
            return v_pRet;
        }
        closeAllLoadedUIForms(userData) {
            let v_pUIForms = this.getAllLoadedUIForms();
            for (const uiForm of v_pUIForms) {
                if (!this.hasUIForm(uiForm.serialId))
                    continue;
                this.closeUIForm(uiForm, userData);
            }
        }
        closeAllLoadingUIForms() {
            for (const serialId of this.m_rUIFormsBeingLoaded.keys()) {
                this.m_rUIFormsToReleaseOnLoad.add(serialId);
            }
            this.m_rUIFormsBeingLoaded.clear();
        }
        refocusUIForm(uiForm, userData) {
            if (null == uiForm)
                throw new Error('UI form is invalid.');
            let uiGroup = uiForm.uiGroup;
            if (null == uiGroup)
                throw new Error('UI group is invalid.');
            uiGroup.refocusUIForm(uiForm, userData);
            uiGroup.refresh();
            uiForm.onRefocus(userData);
        }
        hasUIGroup(uiGroupName) {
            if (!uiGroupName)
                throw new Error('UI group name is invalid.');
            return this.m_rUIGroups.has(uiGroupName);
        }
        getUIGroup(uiGroupName) {
            if (!uiGroupName)
                throw new Error('UI group name is invalid.');
            return this.m_rUIGroups.get(uiGroupName);
        }
        addUIGroup(uiGroupName, arg1, arg2) {
            if (!uiGroupName)
                throw new Error('UI group name is invalid.');
            let uiGroupDepth = 0;
            let uiGroupHelper = null;
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
        }
        openUIFormInternal(serialId, uiFormAssetName, uiGroup, uiFormInstance, pauseCoveredUIForm, isNewInstance, duration, userData) {
            let uiForm = this.m_pUIFormHelper.createUIForm(uiFormInstance, uiGroup, userData);
            if (null == uiForm)
                throw new Error('Can not create UI form in helper.');
            uiForm.onInit(serialId, uiFormAssetName, uiGroup, pauseCoveredUIForm, isNewInstance, userData);
            uiGroup.addUIForm(uiForm);
            uiForm.onOpen(userData);
            uiGroup.refresh();
            let eventArgs = {
                duration: duration,
                uiForm: uiForm,
                userData: userData
            };
            this.m_pOpenUIFormSuccessDelegate.iter((callbackFn) => {
                callbackFn(eventArgs);
            });
        }
        loadUIFormSuccessCallback(uiFormAssetName, uiFormAsset, duration, userData) {
            let v_pInfo = userData;
            if (null == v_pInfo)
                throw new Error("Open UI form info is invalid.");
            if (this.m_rUIFormsToReleaseOnLoad.has(v_pInfo.serialId)) {
                this.m_rUIFormsToReleaseOnLoad.delete(v_pInfo.serialId);
                this.m_pUIFormHelper.releaseUIForm(uiFormAsset, null);
                return;
            }
            this.m_rUIFormsBeingLoaded.delete(v_pInfo.serialId);
            let v_pUiFormInstanceObject = UIFormInstanceObject.create(uiFormAssetName, uiFormAsset, this.m_pUIFormHelper.instantiateUIForm(uiFormAsset), this.m_pUIFormHelper);
            // Register to pool and mark spawn flag.
            if (!this.m_pInstancePool.has(uiFormAssetName)) {
                this.m_pInstancePool.set(uiFormAssetName, []);
            }
            let v_pInstanceObjects = this.m_pInstancePool.get(uiFormAssetName);
            if (v_pInstanceObjects.length < this.m_uInstanceCapacity) {
                v_pUiFormInstanceObject.spawn = true;
                v_pInstanceObjects.push(v_pUiFormInstanceObject);
            }
            this.openUIFormInternal(v_pInfo.serialId, uiFormAssetName, v_pInfo.uiGroup, v_pUiFormInstanceObject.target, v_pInfo.pauseCoveredUIForm, true, duration, v_pInfo.userData);
        }
        loadUIFormFailureCallback(uiFormAssetName, status, errorMessage, userData) {
            let v_pInfo = userData;
            if (null == v_pInfo)
                throw new Error("Open UI form info is invalid.");
            if (this.m_rUIFormsToReleaseOnLoad.has(v_pInfo.serialId)) {
                this.m_rUIFormsToReleaseOnLoad.delete(v_pInfo.serialId);
                return;
            }
            this.m_rUIFormsBeingLoaded.delete(v_pInfo.serialId);
            let appendErrorMessage = `Load UI form failure, asset name '${uiFormAssetName}', status '${status.toString()}', error message '${errorMessage}'.`;
            if (this.m_pOpenUIFormFailureDelegate.isValid) {
                let eventArgs = {
                    serialId: v_pInfo.serialId,
                    uiFormAssetName: uiFormAssetName,
                    uiGroupName: v_pInfo.uiGroup.name,
                    errorMessage: appendErrorMessage,
                    pauseCoveredUIForm: v_pInfo.pauseCoveredUIForm,
                    userData: v_pInfo.userData
                };
                this.m_pOpenUIFormFailureDelegate.iter((callbackFn) => {
                    callbackFn(eventArgs);
                });
                return;
            }
            throw new Error(appendErrorMessage);
        }
        loadUIFormUpdateCallback(uiFormAssetName, progress, userData) {
            let v_pInfo = userData;
            if (null == v_pInfo)
                throw new Error("Open UI form info is invalid.");
            if (this.m_pOpenUIFormUpdateDelegate.isValid) {
                let eventArgs = {
                    serialId: v_pInfo.serialId,
                    uiFormAssetName: uiFormAssetName,
                    uiGroupName: v_pInfo.uiGroup.name,
                    progress: progress,
                    pauseCoveredUIForm: v_pInfo.pauseCoveredUIForm,
                    userData: v_pInfo.userData
                };
                this.m_pOpenUIFormUpdateDelegate.iter((callbackFn) => {
                    callbackFn(eventArgs);
                });
            }
        }
        loadUIFormDependencyAssetCallback(uiFormAssetName, dependencyAssetName, loadedCount, totalCount, userData) {
            let v_pInfo = userData;
            if (null == v_pInfo)
                throw new Error("Open UI form info is invalid.");
            if (this.m_pOpenUIFormDependencyAssetDelegate.isValid) {
                let eventArgs = {
                    serialId: v_pInfo.serialId,
                    uiFormAssetName: uiFormAssetName,
                    uiGroupName: v_pInfo.uiGroup.name,
                    dependencyAssetName: dependencyAssetName,
                    loadedCount: loadedCount,
                    totalCount: totalCount,
                    pauseCoveredUIForm: v_pInfo.pauseCoveredUIForm,
                    userData: v_pInfo.userData
                };
                this.m_pOpenUIFormDependencyAssetDelegate.iter((callbackFn) => {
                    callbackFn(eventArgs);
                });
            }
        }
    } // class UIManager
    exports.UIManager = UIManager;
    class UIFormInstanceObject {
        constructor() {
            this.m_pUIFormAsset = null;
            this.m_pUIFormHelper = null;
            this.name = null;
            this.target = null;
            this.isValid = false;
            this.spawn = false;
            this.m_pUIFormAsset = null;
            this.m_pUIFormHelper = null;
            this.isValid = true;
            this.spawn = false;
        }
        static create(name, uiFormAsset, uiFormInstance, uiFormHelper) {
            if (!uiFormAsset)
                throw new Error('UI form asset is invalid.');
            if (!uiFormHelper)
                throw new Error('UI form helper is invalid.');
            let v_pUiFormInstanceObject = new UIFormInstanceObject();
            v_pUiFormInstanceObject.name = name;
            v_pUiFormInstanceObject.target = uiFormInstance;
            v_pUiFormInstanceObject.m_pUIFormAsset = uiFormAsset;
            v_pUiFormInstanceObject.m_pUIFormHelper = uiFormHelper;
            return v_pUiFormInstanceObject;
        }
        clear() {
            this.m_pUIFormAsset = null;
            this.m_pUIFormHelper = null;
        }
        release(shutdown) {
            shutdown = shutdown || false;
            this.isValid = false;
            if (this.m_pUIFormHelper)
                this.m_pUIFormHelper.releaseUIForm(this.m_pUIFormAsset, this.target);
        }
    } // class UIFormInstanceObject
    class UIGroup {
        constructor(name, depth, helper) {
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
        get name() { return this.m_sName; }
        get depth() { return this.m_iDepth; }
        set depth(value) {
            if (value == this.m_iDepth)
                return;
            this.m_iDepth = value;
            this.helper.setDepth(this.m_iDepth);
            this.refresh();
        }
        get pause() { return this.m_bPause; }
        set pause(value) {
            if (this.m_bPause == value)
                return;
            this.m_bPause = value;
            this.refresh();
        }
        get uiFormCount() {
            return this.m_pUIFormInfos.length;
        }
        get currentUIForm() {
            return this.m_pUIFormInfos.length > 0 ? this.m_pUIFormInfos[0].uiForm : null;
        }
        update(elapsed, realElapsed) {
            for (const info of this.m_pUIFormInfos) {
                if (info.paused) {
                    break;
                }
                info.uiForm.onUpdate(elapsed, realElapsed);
            }
        }
        addUIForm(uiForm) {
            this.m_pUIFormInfos.push({
                uiForm: uiForm,
                covered: true,
                paused: true
            });
        }
        removeUIForm(uiForm) {
            let v_uIdx = -1;
            for (let i = 0; i < this.m_pUIFormInfos.length; ++i) {
                if (this.m_pUIFormInfos[i].uiForm == uiForm) {
                    v_uIdx = i;
                    break;
                }
            }
            if (v_uIdx == -1)
                throw new Error(`Can not find UI form info for serial id '${uiForm.serialId}', UI form asset name is '${uiForm.uiFormAssetName}'.`);
            let v_pInfo = this.m_pUIFormInfos[v_uIdx];
            if (!v_pInfo.covered) {
                v_pInfo.covered = true;
                uiForm.onCover();
            }
            if (!v_pInfo.paused) {
                v_pInfo.paused = true;
                uiForm.onPause();
            }
            this.m_pUIFormInfos.splice(v_uIdx, 1);
        }
        hasUIForm(idOrAssetName) {
            let subPropName = 'serialId';
            if (typeof idOrAssetName === 'string') {
                if (!idOrAssetName)
                    throw new Error('UI form asset name is invalid.');
                subPropName = 'uiFormAssetName';
            }
            for (const info of this.m_pUIFormInfos) {
                if (info.uiForm[subPropName] === idOrAssetName)
                    return true;
            }
            return false;
        }
        getUIForm(idOrAssetName) {
            let subPropName = 'serialId';
            if (typeof idOrAssetName === 'string') {
                if (!idOrAssetName)
                    throw new Error('UI form asset name is invalid.');
                subPropName = 'uiFormAssetName';
            }
            for (const info of this.m_pUIFormInfos) {
                if (info.uiForm[subPropName] === idOrAssetName)
                    return info.uiForm;
            }
            return null;
        }
        getUIForms(assetName) {
            if (!assetName)
                throw new Error('UI form asset name is invalid.');
            let v_pRet = this.m_pUIFormInfos.map(info => {
                if (info.uiForm.uiFormAssetName === assetName)
                    return info.uiForm;
                return null;
            });
            return v_pRet;
        }
        getAllUIForms() {
            return this.m_pUIFormInfos.map(info => {
                return info.uiForm;
            });
        }
        refocusUIForm(uiForm, userData) {
            let v_uIdx = -1;
            for (let i = 0; i < this.m_pUIFormInfos.length; ++i) {
                if (this.m_pUIFormInfos[i].uiForm == uiForm) {
                    v_uIdx = i;
                    break;
                }
            }
            if (v_uIdx == -1)
                throw new Error(`Can not find UI form info for serial id '${uiForm.serialId}', UI form asset name is '${uiForm.uiFormAssetName}'.`);
            if (v_uIdx >= 0) {
                this.m_pUIFormInfos.splice(v_uIdx, 1);
            }
            let v_pInfo = this.m_pUIFormInfos[v_uIdx];
            this.m_pUIFormInfos.unshift(v_pInfo);
        }
        refresh() {
            let v_bPause = this.pause;
            let v_bCover = false;
            let v_iDepth = this.uiFormCount;
            for (const info of this.m_pUIFormInfos) {
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
    } // class UIGroup
    exports.UIGroup = UIGroup;
});

},{"./Base":1}],9:[function(require,module,exports){
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
    expose(require("./UI"));
    v_pGlobal.atsframework = atsframework;
    exports.default = atsframework;
});

},{"./Base":1,"./Config":2,"./DataNode":3,"./Event":4,"./Fsm":5,"./Procedure":6,"./Resource":7,"./UI":8}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIkJhc2UuanMiLCJDb25maWcuanMiLCJEYXRhTm9kZS5qcyIsIkV2ZW50LmpzIiwiRnNtLmpzIiwiUHJvY2VkdXJlLmpzIiwiUmVzb3VyY2UuanMiLCJVSS5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgLyoqXG4gICAgICogTG9hZCB0eXBlLlxuICAgICAqL1xuICAgIHZhciBMb2FkVHlwZTtcbiAgICAoZnVuY3Rpb24gKExvYWRUeXBlKSB7XG4gICAgICAgIExvYWRUeXBlW0xvYWRUeXBlW1wiVGV4dFwiXSA9IDBdID0gXCJUZXh0XCI7XG4gICAgICAgIExvYWRUeXBlW0xvYWRUeXBlW1wiQnl0ZXNcIl0gPSAxXSA9IFwiQnl0ZXNcIjtcbiAgICAgICAgTG9hZFR5cGVbTG9hZFR5cGVbXCJTdHJlYW1cIl0gPSAyXSA9IFwiU3RyZWFtXCI7XG4gICAgfSkoTG9hZFR5cGUgPSBleHBvcnRzLkxvYWRUeXBlIHx8IChleHBvcnRzLkxvYWRUeXBlID0ge30pKTtcbiAgICA7XG4gICAgbGV0IGdfcE1vZHVsZXMgPSBbXTtcbiAgICAvKipcbiAgICAgKiBBbiBldmVudCBoYW5kbGVyIG1ha2Ugc2ltaWxhciB3aXRoIGV2ZW50IGRlbGVnYXRlIG1vZGUuXG4gICAgICovXG4gICAgY2xhc3MgRXZlbnRIYW5kbGVyIHtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICB0aGlzLm1fcEhhbmRsZXJzID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBoYXMoZm4pIHtcbiAgICAgICAgICAgIGlmIChudWxsICE9IHRoaXMubV9wSGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEhhbmRsZXJzLmhhcyhmbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgYWRkKGZuKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLm1fcEhhbmRsZXJzKVxuICAgICAgICAgICAgICAgIHRoaXMubV9wSGFuZGxlcnMgPSBuZXcgU2V0KCk7XG4gICAgICAgICAgICB0aGlzLm1fcEhhbmRsZXJzLmFkZChmbik7XG4gICAgICAgIH1cbiAgICAgICAgcmVtb3ZlKGZuKSB7XG4gICAgICAgICAgICB0aGlzLmlzVmFsaWQgJiYgdGhpcy5tX3BIYW5kbGVycy5kZWxldGUoZm4pO1xuICAgICAgICB9XG4gICAgICAgIGl0ZXIoZm4pIHtcbiAgICAgICAgICAgIHRoaXMuaXNWYWxpZCAmJiB0aGlzLm1fcEhhbmRsZXJzLmZvckVhY2goZm4pO1xuICAgICAgICB9XG4gICAgICAgIGNsZWFyKCkge1xuICAgICAgICAgICAgdGhpcy5pc1ZhbGlkICYmIHRoaXMubV9wSGFuZGxlcnMuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgaXNWYWxpZCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcEhhbmRsZXJzICYmIHRoaXMubV9wSGFuZGxlcnMuc2l6ZSA+IDA7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IHNpemUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BIYW5kbGVycy5zaXplO1xuICAgICAgICB9XG4gICAgfSAvLyBjbGFzcyBFdmVudEhhbmRsZXJcbiAgICBleHBvcnRzLkV2ZW50SGFuZGxlciA9IEV2ZW50SGFuZGxlcjtcbiAgICBjbGFzcyBGcmFtZXdvcmtNb2R1bGUge1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIHRoaXMubV9pUHJpb3JpdHkgPSAwO1xuICAgICAgICB9XG4gICAgICAgIHN0YXRpYyBnZXRNb2R1bGUodHlwZSkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBnX3BNb2R1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbSA9IGdfcE1vZHVsZXNbaV07XG4gICAgICAgICAgICAgICAgaWYgKG0gaW5zdGFuY2VvZiB0eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHN0YXRpYyBnZXRPckFkZE1vZHVsZSh0eXBlKSB7XG4gICAgICAgICAgICBsZXQgdl9wTW9kdWxlID0gdGhpcy5nZXRNb2R1bGUodHlwZSk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BNb2R1bGUpIHtcbiAgICAgICAgICAgICAgICB2X3BNb2R1bGUgPSBuZXcgdHlwZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkTW9kdWxlKHZfcE1vZHVsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdl9wTW9kdWxlO1xuICAgICAgICB9XG4gICAgICAgIHN0YXRpYyBhZGRNb2R1bGUobW9kdWxlKSB7XG4gICAgICAgICAgICBjb25zdCBtID0gdGhpcy5nZXRNb2R1bGUobW9kdWxlLmNvbnN0cnVjdG9yKTtcbiAgICAgICAgICAgIGlmIChtKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRHVwbGljYXRlZCBhZGRpbmcgZnJhbWV3b3JrIG1vZHVsZTogJHt0eXBlb2YgbW9kdWxlfWApOyAvLyBGSVhNRTogRGV0ZWN0aW5nIGhvdyB0byBnZXQgdGhlIGNsYXNzIG5hbWUuXG4gICAgICAgICAgICBnX3BNb2R1bGVzLnB1c2gobW9kdWxlKTtcbiAgICAgICAgICAgIGdfcE1vZHVsZXMgPSBnX3BNb2R1bGVzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoYS5tX2lQcmlvcml0eSA+IGIubV9pUHJpb3JpdHkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChhLm1faVByaW9yaXR5IDwgYi5tX2lQcmlvcml0eSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBzdGF0aWMgcmVtb3ZlTW9kdWxlKHR5cGUpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZ19wTW9kdWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZfcE1vZHVsZSA9IGdfcE1vZHVsZXNbaV07XG4gICAgICAgICAgICAgICAgaWYgKHZfcE1vZHVsZSAmJiB2X3BNb2R1bGUgaW5zdGFuY2VvZiB0eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGdfcE1vZHVsZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdl9wTW9kdWxlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHN0YXRpYyB1cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZ19wTW9kdWxlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZfcE1vZHVsZSA9IGdfcE1vZHVsZXNbaV07XG4gICAgICAgICAgICAgICAgdl9wTW9kdWxlLnVwZGF0ZShlbGFwc2VkLCByZWFsRWxhcHNlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3RhdGljIHNodXRkb3duKCkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGdfcE1vZHVsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2X3BNb2R1bGUgPSBnX3BNb2R1bGVzW2ldO1xuICAgICAgICAgICAgICAgIHZfcE1vZHVsZS5zaHV0ZG93bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGdldCBwcmlvcml0eSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1faVByaW9yaXR5O1xuICAgICAgICB9XG4gICAgfSAvLyBjbGFzcyBGcmFtZXdvcmtNb2R1bGVcbiAgICBleHBvcnRzLkZyYW1ld29ya01vZHVsZSA9IEZyYW1ld29ya01vZHVsZTtcbn0pO1xuIiwiKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIiwgXCIuL0Jhc2VcIl0sIGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIGNvbnN0IEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XG4gICAgY2xhc3MgQ29uZmlnTWFuYWdlciBleHRlbmRzIEJhc2VfMS5GcmFtZXdvcmtNb2R1bGUge1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlciA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fcENvbmZpZ0hlbHBlciA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fcENvbmZpZ0RhdGEgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX3BMb2FkQXNzZXRDYWxsYmFja3MgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX3BDb25maWdEYXRhID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgdGhpcy5tX3BMb2FkQXNzZXRDYWxsYmFja3MgPSB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogdGhpcy5sb2FkQ29uZmlnU3VjY2Vzc0NhbGxiYWNrLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgZmFpbHVyZTogdGhpcy5sb2FkQ29uZmlnRmFpbHVyZUNhbGxiYWNrLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgdXBkYXRlOiB0aGlzLmxvYWRDb25maWdVcGRhdGVDYWxsYmFjay5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgIGRlcGVuZGVuY3k6IHRoaXMubG9hZENvbmZpZ0RlcGVuZGVuY3lBc3NldENhbGxiYWNrLmJpbmQodGhpcylcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLm1fcExvYWRDb25maWdTdWNjZXNzRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgdGhpcy5tX3BMb2FkQ29uZmlnRmFpbHVyZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIHRoaXMubV9wTG9hZENvbmZpZ1VwZGF0ZURlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIHRoaXMubV9wTG9hZENvbmZpZ0RlcGVuZGVuY3lBc3NldERlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgcmVzb3VyY2VNYW5hZ2VyKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyO1xuICAgICAgICB9XG4gICAgICAgIHNldCByZXNvdXJjZU1hbmFnZXIodmFsdWUpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUmVzb3VyY2UgbWFuYWdlciBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IGNvbmZpZ0hlbHBlcigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcENvbmZpZ0hlbHBlcjtcbiAgICAgICAgfVxuICAgICAgICBzZXQgY29uZmlnSGVscGVyKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2YWx1ZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb25maWcgaGVscGVyIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgdGhpcy5tX3BDb25maWdIZWxwZXIgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgY29uZmlnQ291bnQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BDb25maWdEYXRhLnNpemU7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IGxvYWRDb25maWdTdWNjZXNzKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wTG9hZENvbmZpZ1N1Y2Nlc3NEZWxlZ2F0ZTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgbG9hZENvbmZpZ0ZhaWx1cmUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BMb2FkQ29uZmlnRmFpbHVyZURlbGVnYXRlO1xuICAgICAgICB9XG4gICAgICAgIGdldCBsb2FkQ29uZmlnVXBkYXRlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wTG9hZENvbmZpZ1VwZGF0ZURlbGVnYXRlO1xuICAgICAgICB9XG4gICAgICAgIGdldCBsb2FkQ29uZmlnRGVwZW5kZW5jeUFzc2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wTG9hZENvbmZpZ0RlcGVuZGVuY3lBc3NldERlbGVnYXRlO1xuICAgICAgICB9XG4gICAgICAgIGxvYWRDb25maWcoY29uZmlnQXNzZXROYW1lLCBsb2FkVHlwZSwgYW55QXJnMSwgYW55QXJnMikge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgcmVzb3VyY2UgbWFuYWdlciBmaXJzdC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLm1fcENvbmZpZ0hlbHBlcikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IHNldCBjb25maWcgaGVscGVyIGZpcnN0LlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBwcmlvcml0eSA9IDA7XG4gICAgICAgICAgICBsZXQgdXNlckRhdGEgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIubG9hZEFzc2V0KGNvbmZpZ0Fzc2V0TmFtZSwgcHJpb3JpdHksIHRoaXMubV9wTG9hZEFzc2V0Q2FsbGJhY2tzLCB7IGxvYWRUeXBlOiBsb2FkVHlwZSwgdXNlckRhdGE6IHVzZXJEYXRhIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIE5PVEU6IEFueSBqYXZhc2NyaXB0L3R5cGVzY3JpcHQgc3RyZWFtIGltcGxlbWVudGF0aW9uP1xuICAgICAgICBwYXJzZUNvbmZpZyh0ZXh0T3JCdWZmZXIsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoIXRleHRPckJ1ZmZlcikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgY29uZmlnIGRhdGEgZGV0ZWN0ZWQhXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BDb25maWdIZWxwZXIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgY29uZmlnIGhlbHBlciBmaXJzdC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcENvbmZpZ0hlbHBlci5wYXJzZUNvbmZpZyh0ZXh0T3JCdWZmZXIsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBoYXNDb25maWcoY29uZmlnTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q29uZmlnKGNvbmZpZ05hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGFkZENvbmZpZyhjb25maWdOYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaGFzQ29uZmlnKGNvbmZpZ05hbWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3BDb25maWdEYXRhLnNldChjb25maWdOYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZW1vdmVDb25maWcoY29uZmlnTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wQ29uZmlnRGF0YS5kZWxldGUoY29uZmlnTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVtb3ZlQWxsQ29uZmlncygpIHtcbiAgICAgICAgICAgIHRoaXMubV9wQ29uZmlnRGF0YS5jbGVhcigpO1xuICAgICAgICB9XG4gICAgICAgIGdldENvbmZpZyhjb25maWdOYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BDb25maWdEYXRhLmdldChjb25maWdOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIC8vIE5PT1AuXG4gICAgICAgIH1cbiAgICAgICAgc2h1dGRvd24oKSB7XG4gICAgICAgICAgICAvLyBOT09QLlxuICAgICAgICB9XG4gICAgICAgIGxvYWRDb25maWdTdWNjZXNzQ2FsbGJhY2soY29uZmlnQXNzZXROYW1lLCBjb25maWdBc3NldCwgZHVyYXRpb24sIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBsZXQgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wSW5mbykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgY29uZmlnIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5tX3BDb25maWdIZWxwZXIubG9hZENvbmZpZyhjb25maWdBc3NldCwgdl9wSW5mby5sb2FkVHlwZSwgdl9wSW5mby51c2VyRGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBMb2FkIGNvbmZpZyBmYWlsdXJlIGluIGhlbHBlciwgYXNzZXQgbmFtZSAnJHtjb25maWdBc3NldE5hbWV9J2ApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkQ29uZmlnU3VjY2Vzc0RlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkQ29uZmlnU3VjY2Vzc0RlbGVnYXRlLml0ZXIoKGNhbGxiYWNrRm4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oY29uZmlnQXNzZXROYW1lLCB2X3BJbmZvLmxvYWRUeXBlLCBkdXJhdGlvbiwgdXNlckRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWRDb25maWdGYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRDb25maWdGYWlsdXJlRGVsZWdhdGUuaXRlcigoY2FsbGJhY2tGbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihjb25maWdBc3NldE5hbWUsIHZfcEluZm8ubG9hZFR5cGUsIGUudG9TdHJpbmcoKSwgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcENvbmZpZ0hlbHBlci5yZWxlYXNlQ29uZmlnQXNzZXQoY29uZmlnQXNzZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxvYWRDb25maWdGYWlsdXJlQ2FsbGJhY2soY29uZmlnQXNzZXROYW1lLCBzdGF0dXMsIGVycm9yTWVzc2FnZSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGxldCB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BJbmZvKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTG9hZCBjb25maWcgaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBhcHBlbmRFcnJvck1lc3NhZ2UgPSBgTG9hZCBjb25maWcgZmFpbHVyZSwgYXNzZXQgbmFtZSAnJHtjb25maWdBc3NldE5hbWV9Jywgc3RhdHVzICcke3N0YXR1c30nLCBlcnJvciBtZXNzYWdlICcke2Vycm9yTWVzc2FnZX0nLmA7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkQ29uZmlnRmFpbHVyZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRDb25maWdGYWlsdXJlRGVsZWdhdGUuaXRlcigoY2FsbGJhY2tGbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGNvbmZpZ0Fzc2V0TmFtZSwgdl9wSW5mby5sb2FkVHlwZSwgYXBwZW5kRXJyb3JNZXNzYWdlLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYXBwZW5kRXJyb3JNZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICBsb2FkQ29uZmlnVXBkYXRlQ2FsbGJhY2soY29uZmlnQXNzZXROYW1lLCBwcm9ncmVzcywgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGxldCB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BJbmZvKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTG9hZCBjb25maWcgaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWRDb25maWdVcGRhdGVEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkQ29uZmlnVXBkYXRlRGVsZWdhdGUuaXRlcigoY2FsbGJhY2tGbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGNvbmZpZ0Fzc2V0TmFtZSwgdl9wSW5mby5sb2FkVHlwZSwgcHJvZ3Jlc3MsIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxvYWRDb25maWdEZXBlbmRlbmN5QXNzZXRDYWxsYmFjayhjb25maWdBc3NldE5hbWUsIGRlcGVuZGVuY3lBc3NldE5hbWUsIGxvYWRlZENvdW50LCB0b3RhbENvdW50LCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgbGV0IHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcEluZm8pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2FkIGNvbmZpZyBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubV9wTG9hZENvbmZpZ0RlcGVuZGVuY3lBc3NldERlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcExvYWRDb25maWdEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZS5pdGVyKChjYWxsYmFja0ZuKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oY29uZmlnQXNzZXROYW1lLCBkZXBlbmRlbmN5QXNzZXROYW1lLCBsb2FkZWRDb3VudCwgdG90YWxDb3VudCwgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IC8vIGNsYXNzIENvbmZpZ01hbmFnZXJcbiAgICBleHBvcnRzLkNvbmZpZ01hbmFnZXIgPSBDb25maWdNYW5hZ2VyO1xufSk7XG4iLCIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgY29uc3QgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICBjbGFzcyBEYXRhTm9kZU1hbmFnZXIgZXh0ZW5kcyBCYXNlXzEuRnJhbWV3b3JrTW9kdWxlIHtcbiAgICAgICAgdXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcbiAgICAgICAgfVxuICAgICAgICBzaHV0ZG93bigpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBub3QgaW1wbGVtZW50ZWQuXCIpO1xuICAgICAgICB9XG4gICAgfSAvLyBjbGFzcyBEYXRhTm9kZU1hbmFnZXJcbiAgICBleHBvcnRzLkRhdGFOb2RlTWFuYWdlciA9IERhdGFOb2RlTWFuYWdlcjtcbn0pO1xuIiwiKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIiwgXCIuL0Jhc2VcIl0sIGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIGNvbnN0IEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XG4gICAgLyoqXG4gICAgICogQSBzaW1wbGUgZXZlbnQgbWFuYWdlciBpbXBsZW1lbnRhdGlvbi5cbiAgICAgKlxuICAgICAqIEBhdXRob3IgSmVyZW15IENoZW4gKGtleWhvbS5jQGdtYWlsLmNvbSlcbiAgICAgKi9cbiAgICBjbGFzcyBFdmVudE1hbmFnZXIgZXh0ZW5kcyBCYXNlXzEuRnJhbWV3b3JrTW9kdWxlIHtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICAgICAgdGhpcy5tX3BFdmVudEhhbmRsZXJzID0gbmV3IE1hcCgpO1xuICAgICAgICB9XG4gICAgICAgIGdldCBwcmlvcml0eSgpIHtcbiAgICAgICAgICAgIHJldHVybiAxMDA7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IGV2ZW50Q291bnQoKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICBjb3VudChldmVudElEKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElEKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50SUQpLnNpemU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICBjaGVjayhldmVudElkLCBoYW5kbGVyKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElkKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGVyID8gdGhpcy5tX3BFdmVudEhhbmRsZXJzLmdldChldmVudElkKS5oYXMoaGFuZGxlcikgOiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIG9uKGV2ZW50SWQsIGhhbmRsZXIpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElkKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycy5zZXQoZXZlbnRJZCwgbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50SWQpLmFkZChoYW5kbGVyKTtcbiAgICAgICAgfVxuICAgICAgICBvZmYoZXZlbnRJZCwgaGFuZGxlcikge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wRXZlbnRIYW5kbGVycy5oYXMoZXZlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50SWQpLnJlbW92ZShoYW5kbGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbWl0KGV2ZW50SWQsIC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcEV2ZW50SGFuZGxlcnMuaGFzKGV2ZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BFdmVudEhhbmRsZXJzLmdldChldmVudElkKS5pdGVyKChjYWxsYmFja0ZuKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICAvLyBOT09QLlxuICAgICAgICB9XG4gICAgICAgIHNodXRkb3duKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wRXZlbnRIYW5kbGVycykge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycy5mb3JFYWNoKChlaCwga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGVoLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BFdmVudEhhbmRsZXJzLmNsZWFyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IC8vIGNsYXNzIEV2ZW50TWFuYWdlclxuICAgIGV4cG9ydHMuRXZlbnRNYW5hZ2VyID0gRXZlbnRNYW5hZ2VyO1xufSk7XG4iLCIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgY29uc3QgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICBjbGFzcyBGc21TdGF0ZSB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgdGhpcy5tX3BFdmVudEhhbmRsZXJzID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycyA9IG5ldyBNYXAoKTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fc05hbWU7XG4gICAgICAgIH1cbiAgICAgICAgb25Jbml0KGZzbSkge1xuICAgICAgICAgICAgLy8gTk9PUFxuICAgICAgICB9XG4gICAgICAgIG9uRW50ZXIoZnNtKSB7XG4gICAgICAgICAgICAvLyBOT09QXG4gICAgICAgIH1cbiAgICAgICAgb25VcGRhdGUoZnNtLCBlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgLy8gTk9PUFxuICAgICAgICB9XG4gICAgICAgIG9uTGVhdmUoZnNtLCBzaHV0ZG93bikge1xuICAgICAgICAgICAgLy8gTk9PUFxuICAgICAgICB9XG4gICAgICAgIGNoYW5nZVN0YXRlKGZzbSwgdHlwZSkge1xuICAgICAgICAgICAgaWYgKCFmc20pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZzbSBpcyBpbnZhbGlkOiAke2ZzbX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZzbS5jaGFuZ2VTdGF0ZSh0eXBlKTtcbiAgICAgICAgfVxuICAgICAgICBvbihldmVudElkLCBldmVudEhhbmRsZXIpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IGV2ZW50SGFuZGxlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFdmVudCBoYW5kbGVyIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1fcEV2ZW50SGFuZGxlcnMuaGFzKGV2ZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgbGV0IGVoID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuc2V0KGV2ZW50SWQsIGVoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycy5nZXQoZXZlbnRJZCkuYWRkKGV2ZW50SGFuZGxlcik7XG4gICAgICAgIH1cbiAgICAgICAgb2ZmKGV2ZW50SWQsIGV2ZW50SGFuZGxlcikge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gZXZlbnRIYW5kbGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkV2ZW50IGhhbmRsZXIgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElkKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycy5nZXQoZXZlbnRJZCkucmVtb3ZlKGV2ZW50SGFuZGxlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZW1pdChmc20sIHNlbmRlciwgZXZlbnRJZCwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcEV2ZW50SGFuZGxlcnMuaGFzKGV2ZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BFdmVudEhhbmRsZXJzLmdldChldmVudElkKS5pdGVyKChjYWxsYmFja0ZuKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oZnNtLCBzZW5kZXIsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gLy8gY2xhc3MgRnNtU3RhdGU8VD5cbiAgICBleHBvcnRzLkZzbVN0YXRlID0gRnNtU3RhdGU7XG4gICAgY2xhc3MgRnNtIHtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICB0aGlzLm1fcFN0YXRlcyA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fcERhdGFzID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9zTmFtZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fcFN0YXRlcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5tX3BEYXRhcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGVUaW1lID0gMDtcbiAgICAgICAgICAgIHRoaXMuX2lzRGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBzdGF0aWMgY3JlYXRlRnNtKG5hbWUsIG93bmVyLCBzdGF0ZXMpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IG93bmVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRlNNIG93bmVyIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSBzdGF0ZXMgfHwgc3RhdGVzLmxlbmd0aCA8IDEpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGU00gc3RhdGVzIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBsZXQgdl9wRnNtID0gbmV3IEZzbSgpO1xuICAgICAgICAgICAgdl9wRnNtLm1fc05hbWUgPSBuYW1lO1xuICAgICAgICAgICAgdl9wRnNtLm1fcE93bmVyID0gb3duZXI7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHZfcFN0YXRlIG9mIHN0YXRlcykge1xuICAgICAgICAgICAgICAgIGlmIChudWxsID09IHZfcFN0YXRlKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZTTSBzdGF0ZXMgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgICAgICBpZiAodl9wRnNtLmhhc1N0YXRlKHZfcFN0YXRlLmNvbnN0cnVjdG9yKSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGU00gJyR7bmFtZX0nIHN0YXRlICcke3ZfcFN0YXRlfScgaXMgYWxyZWFkeSBleGlzdC5gKTtcbiAgICAgICAgICAgICAgICB2X3BGc20ubV9wU3RhdGVzLnB1c2godl9wU3RhdGUpO1xuICAgICAgICAgICAgICAgIHZfcFN0YXRlLm9uSW5pdCh2X3BGc20pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdl9wRnNtLl9pc0Rlc3Ryb3llZCA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHZfcEZzbTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fc05hbWU7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IG93bmVyKCkgeyByZXR1cm4gdGhpcy5tX3BPd25lcjsgfVxuICAgICAgICBnZXQgZnNtU3RhdGVDb3VudCgpIHsgcmV0dXJuIHRoaXMubV9wU3RhdGVzLmxlbmd0aDsgfVxuICAgICAgICBnZXQgaXNSdW5uaW5nKCkgeyByZXR1cm4gbnVsbCAhPSB0aGlzLl9jdXJyZW50U3RhdGU7IH1cbiAgICAgICAgZ2V0IGlzRGVzdHJveWVkKCkgeyByZXR1cm4gdGhpcy5faXNEZXN0cm95ZWQ7IH1cbiAgICAgICAgZ2V0IGN1cnJlbnRTdGF0ZSgpIHsgcmV0dXJuIHRoaXMuX2N1cnJlbnRTdGF0ZTsgfVxuICAgICAgICBnZXQgY3VycmVudFN0YXRlTmFtZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTdGF0ZSA/IHRoaXMuY3VycmVudFN0YXRlLm5hbWUgOiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGdldCBjdXJyZW50U3RhdGVUaW1lKCkgeyByZXR1cm4gdGhpcy5fY3VycmVudFN0YXRlVGltZTsgfVxuICAgICAgICBzdGFydCh0eXBlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pc1J1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGU00gaXMgcnVubmluZywgY2FuIG5vdCBzdGFydCBhZ2Fpbi5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgc3RhdGUgPSB0aGlzLmdldFN0YXRlKHR5cGUpO1xuICAgICAgICAgICAgaWYgKCFzdGF0ZSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRlNNICcke3RoaXMubmFtZX0nIGNhbiBub3Qgc3RhcnQgc3RhdGUgJyR7dHlwZS5uYW1lfScgd2hpY2ggaXMgbm90IGV4aXN0cy5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZVRpbWUgPSAwO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlID0gc3RhdGU7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGF0ZS5vbkVudGVyKHRoaXMpOyAvLyBDYWxsIGludGVybmFsIGZ1bmN0aW9uIHdpdGggYW55IGNhc3RpbmcuXG4gICAgICAgIH1cbiAgICAgICAgaGFzU3RhdGUodHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGwgIT0gdGhpcy5nZXRTdGF0ZSh0eXBlKTtcbiAgICAgICAgfVxuICAgICAgICBnZXRTdGF0ZSh0eXBlKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubV9wU3RhdGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgdl9wU3RhdGUgPSB0aGlzLm1fcFN0YXRlc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BTdGF0ZSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgaWYgKHZfcFN0YXRlIGluc3RhbmNlb2YgdHlwZSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZfcFN0YXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0QWxsU3RhdGVzKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wU3RhdGVzO1xuICAgICAgICB9XG4gICAgICAgIGNoYW5nZVN0YXRlKHR5cGUpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fY3VycmVudFN0YXRlKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ3VycmVudCBzdGF0ZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgbGV0IHZfcFN0YXRlID0gdGhpcy5nZXRTdGF0ZSh0eXBlKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcFN0YXRlKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRnNtIGNhbiBub3QgY2hhbmdlIHN0YXRlLCBzdGF0ZSBpcyBub3QgZXhpc3Q6ICR7dHlwZX1gKTtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZS5vbkxlYXZlKHRoaXMsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZVRpbWUgPSAwO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlID0gdl9wU3RhdGU7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGUub25FbnRlcih0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBnZXREYXRhKG5hbWUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcERhdGFzLmhhcyhuYW1lKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BEYXRhcy5nZXQobmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBzZXREYXRhKG5hbWUsIGRhdGEpIHtcbiAgICAgICAgICAgIGlmICghbmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RhdGEgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdGhpcy5tX3BEYXRhcy5zZXQobmFtZSwgZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVtb3ZlRGF0YShuYW1lKSB7XG4gICAgICAgICAgICBpZiAoIW5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXRhIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGxldCB2X2JSZXQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcERhdGFzLmhhcyhuYW1lKSkge1xuICAgICAgICAgICAgICAgIHZfYlJldCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BEYXRhcy5kZWxldGUobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdl9iUmV0O1xuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZShlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5fY3VycmVudFN0YXRlKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZVRpbWUgKz0gZWxhcHNlZDtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZS5vblVwZGF0ZSh0aGlzLCBlbGFwc2VkLCByZWFsRWxhcHNlZCk7XG4gICAgICAgIH1cbiAgICAgICAgc2h1dGRvd24oKSB7XG4gICAgICAgICAgICAvLyBGSVhNRTogRmlndWUgb3V0IGEgd2F5IHRvIHJlbGVhc2UgdGhpcy5cbiAgICAgICAgfVxuICAgIH0gLy8gY2xhc3MgRnNtPFQ+XG4gICAgZXhwb3J0cy5Gc20gPSBGc207XG4gICAgY2xhc3MgRnNtTWFuYWdlciBleHRlbmRzIEJhc2VfMS5GcmFtZXdvcmtNb2R1bGUge1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgICAgICB0aGlzLm1fcEZzbXMgPSBuZXcgTWFwKCk7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IHByaW9yaXR5KCkge1xuICAgICAgICAgICAgcmV0dXJuIDYwO1xuICAgICAgICB9XG4gICAgICAgIGdldCBjb3VudCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcEZzbXMuc2l6ZTtcbiAgICAgICAgfVxuICAgICAgICBoYXNGc20obmFtZU9yVHlwZSkge1xuICAgICAgICAgICAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBuYW1lT3JUeXBlICYmIG5hbWVPclR5cGUucHJvdG90eXBlKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBmc20gb2YgdGhpcy5tX3BGc21zLnZhbHVlcygpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChudWxsICE9IGZzbSAmJiBmc20gaW5zdGFuY2VvZiBuYW1lT3JUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRnNtcy5oYXMobmFtZU9yVHlwZS50b1N0cmluZygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBnZXRGc20obmFtZU9yVHlwZSkge1xuICAgICAgICAgICAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBuYW1lT3JUeXBlICYmIG5hbWVPclR5cGUucHJvdG90eXBlKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBmc20gb2YgdGhpcy5tX3BGc21zLnZhbHVlcygpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChudWxsICE9IGZzbSAmJiBmc20gaW5zdGFuY2VvZiBuYW1lT3JUeXBlKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZzbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BGc21zLmdldChuYW1lT3JUeXBlLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0QWxsRnNtcygpIHtcbiAgICAgICAgICAgIGNvbnN0IHZfcFJldCA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBmc20gb2YgdGhpcy5tX3BGc21zLnZhbHVlcygpKSB7XG4gICAgICAgICAgICAgICAgdl9wUmV0LnB1c2goZnNtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2X3BSZXQ7XG4gICAgICAgIH1cbiAgICAgICAgY3JlYXRlRnNtKG5hbWUsIG93bmVyLCBzdGF0ZXMpIHtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lIHx8ICcnO1xuICAgICAgICAgICAgaWYgKHRoaXMuaGFzRnNtKG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBbHJlYWR5IGV4aXN0IEZTTSAnJHtuYW1lfScuYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBmc20gPSBGc20uY3JlYXRlRnNtKG5hbWUsIG93bmVyLCBzdGF0ZXMpO1xuICAgICAgICAgICAgdGhpcy5tX3BGc21zLnNldChuYW1lLCBmc20pO1xuICAgICAgICAgICAgcmV0dXJuIGZzbTtcbiAgICAgICAgfVxuICAgICAgICBkZXN0cm95RnNtKGFyZykge1xuICAgICAgICAgICAgbGV0IHZfc05hbWUgPSBudWxsO1xuICAgICAgICAgICAgbGV0IHZfcFR5cGUgPSBudWxsO1xuICAgICAgICAgICAgbGV0IHZfcEluc3RhbmNlID0gbnVsbDtcbiAgICAgICAgICAgIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIGFyZykge1xuICAgICAgICAgICAgICAgIHZfc05hbWUgPSBhcmc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgYXJnKSB7XG4gICAgICAgICAgICAgICAgdl9wVHlwZSA9IGFyZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCdvYmplY3QnID09PSB0eXBlb2YgYXJnICYmIGFyZy5jb25zdHJ1Y3Rvcikge1xuICAgICAgICAgICAgICAgIHZfcEluc3RhbmNlID0gYXJnO1xuICAgICAgICAgICAgICAgIHZfcFR5cGUgPSBhcmcuY29uc3RydWN0b3I7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRoaXMuaGFzRnNtKHZfc05hbWUgfHwgdl9wVHlwZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodl9wSW5zdGFuY2UgJiYgT2JqZWN0LmdldFByb3RvdHlwZU9mKHZfcEluc3RhbmNlKS5oYXNPd25Qcm9wZXJ0eSgnc2h1dGRvd24nKSkge1xuICAgICAgICAgICAgICAgIHZfcEluc3RhbmNlLnNodXRkb3duKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobnVsbCAhPSB2X3BJbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHRoaXMubV9wRnNtcy5rZXlzKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgdl9wRnNtID0gdGhpcy5tX3BGc21zLmdldChrZXkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodl9wRnNtID09IHZfcEluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcEZzbXMuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG51bGwgIT0gdl9zTmFtZSkge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHRoaXMubV9wRnNtcy5rZXlzKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgdl9wRnNtID0gdGhpcy5tX3BGc21zLmdldChrZXkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodl9wRnNtLm5hbWUgPT0gdl9zTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BGc21zLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChudWxsICE9IHZfcFR5cGUpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiB0aGlzLm1fcEZzbXMua2V5cygpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZfcEZzbSA9IHRoaXMubV9wRnNtcy5nZXQoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEZzbSBpbnN0YW5jZW9mIHZfcFR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubV9wRnNtcy5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGZzbSBvZiB0aGlzLm1fcEZzbXMudmFsdWVzKCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWZzbSAmJiBmc20uaXNEZXN0cm95ZWQpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGZzbS51cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNodXRkb3duKCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgdGhpcy5tX3BGc21zLmtleXMoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZfRnNtID0gdGhpcy5tX3BGc21zLmdldChrZXkpO1xuICAgICAgICAgICAgICAgIGlmICghdl9Gc20gJiYgdl9Gc20uaXNEZXN0cm95ZWQpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIHZfRnNtLnNodXRkb3duKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BGc21zLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSAvLyBjbGFzcyBGc21NYW5hZ2VyXG4gICAgZXhwb3J0cy5Gc21NYW5hZ2VyID0gRnNtTWFuYWdlcjtcbn0pO1xuIiwiKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIiwgXCIuL0Jhc2VcIiwgXCIuL0ZzbVwiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgY29uc3QgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICBjb25zdCBGc21fMSA9IHJlcXVpcmUoXCIuL0ZzbVwiKTtcbiAgICBjbGFzcyBQcm9jZWR1cmVCYXNlIGV4dGVuZHMgRnNtXzEuRnNtU3RhdGUge1xuICAgIH0gLy8gY2xhc3MgUHJvY2VkdXJlQmFzZVxuICAgIGV4cG9ydHMuUHJvY2VkdXJlQmFzZSA9IFByb2NlZHVyZUJhc2U7XG4gICAgY2xhc3MgUHJvY2VkdXJlTWFuYWdlciBleHRlbmRzIEJhc2VfMS5GcmFtZXdvcmtNb2R1bGUge1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgICAgICB0aGlzLm1fcEZzbU1hbmFnZXIgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX3BQcm9jZWR1cmVGc20gPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGdldCBwcmlvcml0eSgpIHsgcmV0dXJuIC0xMDsgfVxuICAgICAgICBnZXQgY3VycmVudFByb2NlZHVyZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFByb2NlZHVyZUZzbS5jdXJyZW50U3RhdGU7XG4gICAgICAgIH1cbiAgICAgICAgaW5pdGlhbGl6ZShmc21NYW5hZ2VyLCBwcm9jZWR1cmVzKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSBmc21NYW5hZ2VyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRlNNIG1hbmFnZXIgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHRoaXMubV9wRnNtTWFuYWdlciA9IGZzbU1hbmFnZXI7XG4gICAgICAgICAgICB0aGlzLm1fcFByb2NlZHVyZUZzbSA9IGZzbU1hbmFnZXIuY3JlYXRlRnNtKG51bGwsIHRoaXMsIHByb2NlZHVyZXMpO1xuICAgICAgICB9XG4gICAgICAgIHN0YXJ0UHJvY2VkdXJlKG9iaikge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BQcm9jZWR1cmVGc20pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgbXVzdCBpbml0aWFsaXplIHByb2NlZHVyZSBmaXJzdC4nKTtcbiAgICAgICAgICAgIHRoaXMubV9wUHJvY2VkdXJlRnNtLnN0YXJ0KG9iai5jb25zdHJ1Y3Rvcik7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICAvLyBOb29wLlxuICAgICAgICB9XG4gICAgICAgIHNodXRkb3duKCkge1xuICAgICAgICAgICAgaWYgKG51bGwgIT0gdGhpcy5tX3BGc21NYW5hZ2VyKSB7XG4gICAgICAgICAgICAgICAgaWYgKG51bGwgIT0gdGhpcy5tX3BQcm9jZWR1cmVGc20pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BGc21NYW5hZ2VyLmRlc3Ryb3lGc20odGhpcy5tX3BQcm9jZWR1cmVGc20pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcFByb2NlZHVyZUZzbSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMubV9wRnNtTWFuYWdlciA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaGFzUHJvY2VkdXJlKHR5cGUpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMubV9wUHJvY2VkdXJlRnNtKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignWW91IG11c3QgaW5pdGlhbGl6ZSBwcm9jZWR1cmUgZmlyc3QuJyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BQcm9jZWR1cmVGc20uaGFzU3RhdGUodHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0UHJvY2VkdXJlKHR5cGUpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMubV9wUHJvY2VkdXJlRnNtKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignWW91IG11c3QgaW5pdGlhbGl6ZSBwcm9jZWR1cmUgZmlyc3QuJyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BQcm9jZWR1cmVGc20uZ2V0U3RhdGUodHlwZSk7XG4gICAgICAgIH1cbiAgICB9IC8vIGNsYXNzIFByb2NlZHVyZU1hbmFnZXJcbiAgICBleHBvcnRzLlByb2NlZHVyZU1hbmFnZXIgPSBQcm9jZWR1cmVNYW5hZ2VyO1xufSk7XG4iLCIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgY29uc3QgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICB2YXIgUmVzb3VyY2VNb2RlO1xuICAgIChmdW5jdGlvbiAoUmVzb3VyY2VNb2RlKSB7XG4gICAgICAgIFJlc291cmNlTW9kZVtSZXNvdXJjZU1vZGVbXCJVbnNwZWNpZmllZFwiXSA9IDBdID0gXCJVbnNwZWNpZmllZFwiO1xuICAgICAgICBSZXNvdXJjZU1vZGVbUmVzb3VyY2VNb2RlW1wiUGFja2FnZVwiXSA9IDFdID0gXCJQYWNrYWdlXCI7XG4gICAgICAgIFJlc291cmNlTW9kZVtSZXNvdXJjZU1vZGVbXCJVcGRhdGFibGVcIl0gPSAyXSA9IFwiVXBkYXRhYmxlXCI7XG4gICAgfSkoUmVzb3VyY2VNb2RlID0gZXhwb3J0cy5SZXNvdXJjZU1vZGUgfHwgKGV4cG9ydHMuUmVzb3VyY2VNb2RlID0ge30pKTsgLy8gZW51bSBSZXNvdXJjZU1vZGVcbiAgICB2YXIgTG9hZFJlc291cmNlU3RhdHVzO1xuICAgIChmdW5jdGlvbiAoTG9hZFJlc291cmNlU3RhdHVzKSB7XG4gICAgICAgIExvYWRSZXNvdXJjZVN0YXR1c1tMb2FkUmVzb3VyY2VTdGF0dXNbXCJTdWNjZXNzXCJdID0gMF0gPSBcIlN1Y2Nlc3NcIjtcbiAgICAgICAgTG9hZFJlc291cmNlU3RhdHVzW0xvYWRSZXNvdXJjZVN0YXR1c1tcIk5vdFJlYWR5XCJdID0gMV0gPSBcIk5vdFJlYWR5XCI7XG4gICAgICAgIExvYWRSZXNvdXJjZVN0YXR1c1tMb2FkUmVzb3VyY2VTdGF0dXNbXCJOb3RFeGlzdFwiXSA9IDJdID0gXCJOb3RFeGlzdFwiO1xuICAgICAgICBMb2FkUmVzb3VyY2VTdGF0dXNbTG9hZFJlc291cmNlU3RhdHVzW1wiRGVwZW5kZW5jeUVycm9yXCJdID0gM10gPSBcIkRlcGVuZGVuY3lFcnJvclwiO1xuICAgICAgICBMb2FkUmVzb3VyY2VTdGF0dXNbTG9hZFJlc291cmNlU3RhdHVzW1wiVHlwZUVycm9yXCJdID0gNF0gPSBcIlR5cGVFcnJvclwiO1xuICAgICAgICBMb2FkUmVzb3VyY2VTdGF0dXNbTG9hZFJlc291cmNlU3RhdHVzW1wiQXNzZXRFcnJvclwiXSA9IDVdID0gXCJBc3NldEVycm9yXCI7XG4gICAgfSkoTG9hZFJlc291cmNlU3RhdHVzID0gZXhwb3J0cy5Mb2FkUmVzb3VyY2VTdGF0dXMgfHwgKGV4cG9ydHMuTG9hZFJlc291cmNlU3RhdHVzID0ge30pKTsgLy8gZW51bSBMb2FkUmVzb3VyY2VTdGF0dXNcbiAgICAvKipcbiAgICAgKiBBIHJlc291cmNlIG1hbmFnZXIgbW9kdWxhciBiYXNlIG9uIGBGcmFtZXdvcmtNb2R1bGVgLlxuICAgICAqXG4gICAgICogVE9ETzogQSBnZW5lcmFsIHJlc291cmNlIG1hbmFnZW1lbnQgd2FzIG5vdCB5ZXQgaW1wbGVtZW50ZWQuXG4gICAgICpcbiAgICAgKiBAYXV0aG9yIEplcmVteSBDaGVuIChrZXlob20uY0BnbWFpbC5jb20pXG4gICAgICovXG4gICAgY2xhc3MgUmVzb3VyY2VNYW5hZ2VyIGV4dGVuZHMgQmFzZV8xLkZyYW1ld29ya01vZHVsZSB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VHcm91cCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IHJlc291cmNlR3JvdXAoKSB7IHJldHVybiB0aGlzLm1fcFJlc291cmNlR3JvdXA7IH1cbiAgICAgICAgZ2V0IHJlc291cmNlTG9hZGVyKCkgeyByZXR1cm4gdGhpcy5tX3BSZXNvdXJjZUxvYWRlcjsgfVxuICAgICAgICBzZXQgcmVzb3VyY2VMb2FkZXIodmFsdWUpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZhbHVlKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNldHRpbmcgcmVzb3VyY2UgbG9hZGVyIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZUxvYWRlciA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGdldCBwcmlvcml0eSgpIHtcbiAgICAgICAgICAgIHJldHVybiA3MDtcbiAgICAgICAgfVxuICAgICAgICBoYXNBc3NldChhc3NldE5hbWUpIHtcbiAgICAgICAgICAgIGlmICghYXNzZXROYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzc2V0IG5hbWUgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BSZXNvdXJjZUxvYWRlci5oYXNBc3NldChhc3NldE5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGxvYWRBc3NldChhc3NldE5hbWUsIGFzc2V0VHlwZSwgcHJpb3JpdHksIGxvYWRBc3NldENhbGxiYWNrcywgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGlmICghYXNzZXROYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzc2V0IG5hbWUgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAoIWxvYWRBc3NldENhbGxiYWNrcylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2FkIGFzc2V0IGNhbGxiYWNrcyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VMb2FkZXIubG9hZEFzc2V0KGFzc2V0TmFtZSwgYXNzZXRUeXBlLCBwcmlvcml0eSwgbG9hZEFzc2V0Q2FsbGJhY2tzLCB1c2VyRGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgdW5sb2FkQXNzZXQoYXNzZXQpIHtcbiAgICAgICAgICAgIGlmICghYXNzZXQpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXNzZXQgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLm1fcFJlc291cmNlTG9hZGVyKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VMb2FkZXIudW5sb2FkQXNzZXQoYXNzZXQpO1xuICAgICAgICB9XG4gICAgICAgIGxvYWRTY2VuZShzY2VuZUFzc2V0TmFtZSwgcHJpb3JpdHksIGxvYWRTY2VuZUNhbGxiYWNrcywgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGlmICghc2NlbmVBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgYXNzZXQgbmFtZSBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICghbG9hZFNjZW5lQ2FsbGJhY2tzKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgc2NlbmUgYXNzZXQgY2FsbGJhY2tzIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZUxvYWRlci5sb2FkU2NlbmUoc2NlbmVBc3NldE5hbWUsIHByaW9yaXR5LCBsb2FkU2NlbmVDYWxsYmFja3MsIHVzZXJEYXRhKTtcbiAgICAgICAgfVxuICAgICAgICB1bmxvYWRTY2VuZShzY2VuZUFzc2V0TmFtZSwgdW5sb2FkU2NlbmVDYWxsYmFja3MsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoIXNjZW5lQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjZW5lIGFzc2V0IG5hbWUgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAoIXVubG9hZFNjZW5lQ2FsbGJhY2tzKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVubG9hZCBzY2VuZSBjYWxsYmFja3MgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTG9hZGVyLnVubG9hZFNjZW5lKHNjZW5lQXNzZXROYW1lLCB1bmxvYWRTY2VuZUNhbGxiYWNrcywgdXNlckRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGhhc1Jlc291cmNlR3JvdXAocmVzb3VyY2VHcm91cE5hbWUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBub3QgaW1wbGVtZW50ZWQuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZShlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wUmVzb3VyY2VMb2FkZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTG9hZGVyLnVwZGF0ZShlbGFwc2VkLCByZWFsRWxhcHNlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc2h1dGRvd24oKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BSZXNvdXJjZUxvYWRlcikge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VMb2FkZXIuc2h1dGRvd24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gLy8gY2xhc3MgUmVzb3VyY2VNYW5hZ2VyXG4gICAgZXhwb3J0cy5SZXNvdXJjZU1hbmFnZXIgPSBSZXNvdXJjZU1hbmFnZXI7XG59KTtcbiIsIihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICBjb25zdCBCYXNlXzEgPSByZXF1aXJlKFwiLi9CYXNlXCIpO1xuICAgIGNsYXNzIFVJTWFuYWdlciBleHRlbmRzIEJhc2VfMS5GcmFtZXdvcmtNb2R1bGUge1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgICAgICB0aGlzLm1fclVJR3JvdXBzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgdGhpcy5tX2lTZXJpYWxJZCA9IDA7XG4gICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUhlbHBlciA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fYklzU2h1dGRvd24gPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgdGhpcy5tX3JVSUZvcm1zVG9SZWxlYXNlT25Mb2FkID0gbmV3IFNldCgpO1xuICAgICAgICAgICAgdGhpcy5tX3BJbnN0YW5jZVBvb2wgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICB0aGlzLm1fcFJlY3ljbGVRdWV1ZSA9IFtdO1xuICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX3BMb2FkQXNzZXRDYWxsYmFja3MgPSB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogdGhpcy5sb2FkVUlGb3JtU3VjY2Vzc0NhbGxiYWNrLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgZmFpbHVyZTogdGhpcy5sb2FkVUlGb3JtRmFpbHVyZUNhbGxiYWNrLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgdXBkYXRlOiB0aGlzLmxvYWRVSUZvcm1VcGRhdGVDYWxsYmFjay5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgIGRlcGVuZGVuY3k6IHRoaXMubG9hZFVJRm9ybURlcGVuZGVuY3lBc3NldENhbGxiYWNrLmJpbmQodGhpcyksXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5tX3BPcGVuVUlGb3JtU3VjY2Vzc0RlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIHRoaXMubV9wT3BlblVJRm9ybUZhaWx1cmVEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICB0aGlzLm1fcE9wZW5VSUZvcm1VcGRhdGVEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICB0aGlzLm1fcE9wZW5VSUZvcm1EZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICB0aGlzLm1fcENsb3NlVUlGb3JtQ29tcGxldGVEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICB0aGlzLm1fZkluc3RhbmNlQXV0b1JlbGVhc2VJbnRlcnZhbCA9IDA7XG4gICAgICAgICAgICB0aGlzLm1fdUluc3RhbmNlQ2FwYWNpdHkgPSAwO1xuICAgICAgICAgICAgdGhpcy5tX2ZJbnN0YW5jZUV4cGlyZVRpbWUgPSAwO1xuICAgICAgICAgICAgdGhpcy5tX2lJbnN0YW5jZVByaW9yaXR5ID0gMDtcbiAgICAgICAgICAgIC8vIHByaXZhdGUgZmlyZU9wZW5VSUZvcm1Db21wbGV0ZShlcnJvcjogRXJyb3IsIHVpRm9ybUFzc2V0TmFtZTogc3RyaW5nLCB1aUZvcm1Bc3NldDogb2JqZWN0LCBkdXJhdGlvbjogbnVtYmVyLCBpbmZvOiBPcGVuVUlGb3JtSW5mbyk6IHZvaWQge1xuICAgICAgICAgICAgLy8gdGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQuZGVsZXRlKGluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgLy8gaWYgKHRoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZC5oYXMoaW5mby5zZXJpYWxJZCkpIHtcbiAgICAgICAgICAgIC8vIHRoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZC5kZWxldGUoaW5mby5zZXJpYWxJZCk7XG4gICAgICAgICAgICAvLyBpZiAoIWVycm9yKVxuICAgICAgICAgICAgLy8gdGhpcy5tX3BVSUZvcm1IZWxwZXIucmVsZWFzZVVJRm9ybSh1aUZvcm1Bc3NldCBhcyBvYmplY3QsIG51bGwpO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gbGV0IHVpRm9ybTogSVVJRm9ybSA9IG51bGw7XG4gICAgICAgICAgICAvLyBpZiAoIWVycm9yKSB7XG4gICAgICAgICAgICAvLyBsZXQgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3Q6IFVJRm9ybUluc3RhbmNlT2JqZWN0ID0gVUlGb3JtSW5zdGFuY2VPYmplY3QuY3JlYXRlKHVpRm9ybUFzc2V0TmFtZSwgdWlGb3JtQXNzZXQsIHRoaXMubV9wVUlGb3JtSGVscGVyLmluc3RhbnRpYXRlVUlGb3JtKHVpRm9ybUFzc2V0IGFzIG9iamVjdCksIHRoaXMubV9wVUlGb3JtSGVscGVyKTtcbiAgICAgICAgICAgIC8vIC8vIFJlZ2lzdGVyIHRvIHBvb2wgYW5kIG1hcmsgc3Bhd24gZmxhZy5cbiAgICAgICAgICAgIC8vIGlmICghdGhpcy5tX3BJbnN0YW5jZVBvb2wuaGFzKHVpRm9ybUFzc2V0TmFtZSkpIHtcbiAgICAgICAgICAgIC8vIHRoaXMubV9wSW5zdGFuY2VQb29sLnNldCh1aUZvcm1Bc3NldE5hbWUsIFtdKTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIC8vIGxldCB2X3BJbnN0YW5jZU9iamVjdHM6IFVJRm9ybUluc3RhbmNlT2JqZWN0W10gPSB0aGlzLm1fcEluc3RhbmNlUG9vbC5nZXQodWlGb3JtQXNzZXROYW1lKTtcbiAgICAgICAgICAgIC8vIGlmICh2X3BJbnN0YW5jZU9iamVjdHMubGVuZ3RoIDwgdGhpcy5tX3VJbnN0YW5jZUNhcGFjaXR5KSB7XG4gICAgICAgICAgICAvLyB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC5zcGF3biA9IHRydWU7XG4gICAgICAgICAgICAvLyB2X3BJbnN0YW5jZU9iamVjdHMucHVzaCh2X3BVaUZvcm1JbnN0YW5jZU9iamVjdCk7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvLyB0aGlzLm9wZW5VSUZvcm1JbnRlcm5hbChpbmZvLnNlcmlhbElkLCB1aUZvcm1Bc3NldE5hbWUsIGluZm8udWlHcm91cCBhcyBVSUdyb3VwLCB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC50YXJnZXQsIGluZm8ucGF1c2VDb3ZlcmVkVUlGb3JtLCB0cnVlLCBkdXJhdGlvbiwgaW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAvLyB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gbGV0IGV2ZW50QXJnczogT3BlblVJRm9ybUZhaWx1cmVFdmVudEFyZ3MgPSB7XG4gICAgICAgICAgICAvLyBlcnJvck1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgICAvLyBzZXJpYWxJZDogaW5mby5zZXJpYWxJZCxcbiAgICAgICAgICAgIC8vIHBhdXNlQ292ZXJlZFVJRm9ybTogaW5mby5wYXVzZUNvdmVyZWRVSUZvcm0sXG4gICAgICAgICAgICAvLyB1aUdyb3VwTmFtZTogaW5mby51aUdyb3VwLm5hbWUsXG4gICAgICAgICAgICAvLyB1aUZvcm1Bc3NldE5hbWU6IHVpRm9ybUFzc2V0TmFtZSxcbiAgICAgICAgICAgIC8vIHVzZXJEYXRhOiBpbmZvLnVzZXJEYXRhXG4gICAgICAgICAgICAvLyB9O1xuICAgICAgICAgICAgLy8gdGhpcy5tX3BPcGVuVUlGb3JtRmFpbHVyZURlbGVnYXRlLml0ZXIoKGNhbGxiYWNrRm46IE9wZW5VSUZvcm1GYWlsdXJlRXZlbnRIYW5kbGVyKSA9PiB7XG4gICAgICAgICAgICAvLyBjYWxsYmFja0ZuKGV2ZW50QXJncyk7XG4gICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIC8vIHByaXZhdGUgZmlyZU9wZW5VSUZvcm1Qcm9ncmVzcyh1aUZvcm1Bc3NldE5hbWU6IHN0cmluZywgcHJvZ3Jlc3M6IG51bWJlciwgaW5mbzogT3BlblVJRm9ybUluZm8pOiB2b2lkIHtcbiAgICAgICAgICAgIC8vIGxldCBldmVudEFyZ3M6IE9wZW5VSUZvcm1VcGRhdGVFdmVudEFyZ3MgPSB7XG4gICAgICAgICAgICAvLyBzZXJpYWxJZDogaW5mby5zZXJpYWxJZCxcbiAgICAgICAgICAgIC8vIHBhdXNlQ292ZXJlZFVJRm9ybTogaW5mby5wYXVzZUNvdmVyZWRVSUZvcm0sXG4gICAgICAgICAgICAvLyBwcm9ncmVzczogcHJvZ3Jlc3MsXG4gICAgICAgICAgICAvLyB1aUZvcm1Bc3NldE5hbWU6IHVpRm9ybUFzc2V0TmFtZSxcbiAgICAgICAgICAgIC8vIHVpR3JvdXBOYW1lOiBpbmZvLnVpR3JvdXAubmFtZSxcbiAgICAgICAgICAgIC8vIHVzZXJEYXRhOiBpbmZvLnVzZXJEYXRhXG4gICAgICAgICAgICAvLyB9O1xuICAgICAgICAgICAgLy8gdGhpcy5tX3BPcGVuVUlGb3JtVXBkYXRlRGVsZWdhdGUuaXRlcigoY2FsbGJhY2tGbjogT3BlblVJRm9ybVVwZGF0ZUV2ZW50SGFuZGxlcikgPT4ge1xuICAgICAgICAgICAgLy8gY2FsbGJhY2tGbihldmVudEFyZ3MpO1xuICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IHVpRm9ybUhlbHBlcigpIHsgcmV0dXJuIHRoaXMubV9wVUlGb3JtSGVscGVyOyB9XG4gICAgICAgIHNldCB1aUZvcm1IZWxwZXIodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghdmFsdWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGhlbHBlciBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1IZWxwZXIgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgcmVzb3VyY2VNYW5hZ2VyKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyO1xuICAgICAgICB9XG4gICAgICAgIHNldCByZXNvdXJjZU1hbmFnZXIodmFsdWUpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZhbHVlKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJlc291cmNlIG1hbmFnZXIgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlciA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGdldCB1aUdyb3VwQ291bnQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3JVSUdyb3Vwcy5zaXplO1xuICAgICAgICB9XG4gICAgICAgIGdldCBvcGVuVUlGb3JtU3VjY2VzcygpIHsgcmV0dXJuIHRoaXMubV9wT3BlblVJRm9ybVN1Y2Nlc3NEZWxlZ2F0ZTsgfVxuICAgICAgICBnZXQgb3BlblVJRm9ybUZhaWx1cmUoKSB7IHJldHVybiB0aGlzLm1fcE9wZW5VSUZvcm1GYWlsdXJlRGVsZWdhdGU7IH1cbiAgICAgICAgZ2V0IG9wZW5VSUZvcm1VcGRhdGUoKSB7IHJldHVybiB0aGlzLm1fcE9wZW5VSUZvcm1VcGRhdGVEZWxlZ2F0ZTsgfVxuICAgICAgICBnZXQgb3BlblVJRm9ybURlcGVuZGVuY3lBc3NldCgpIHsgcmV0dXJuIHRoaXMubV9wT3BlblVJRm9ybURlcGVuZGVuY3lBc3NldERlbGVnYXRlOyB9XG4gICAgICAgIGdldCBjbG9zZVVJRm9ybUNvbXBsZXRlKCkgeyByZXR1cm4gdGhpcy5tX3BDbG9zZVVJRm9ybUNvbXBsZXRlRGVsZWdhdGU7IH1cbiAgICAgICAgZ2V0IGluc3RhbmNlQXV0b1JlbGVhc2VJbnRlcnZhbCgpIHsgcmV0dXJuIHRoaXMubV9mSW5zdGFuY2VBdXRvUmVsZWFzZUludGVydmFsOyB9XG4gICAgICAgIHNldCBpbnN0YW5jZUF1dG9SZWxlYXNlSW50ZXJ2YWwodmFsdWUpIHsgdGhpcy5tX2ZJbnN0YW5jZUF1dG9SZWxlYXNlSW50ZXJ2YWwgPSB2YWx1ZTsgfVxuICAgICAgICBnZXQgaW5zdGFuY2VDYXBhY2l0eSgpIHsgcmV0dXJuIHRoaXMubV91SW5zdGFuY2VDYXBhY2l0eTsgfVxuICAgICAgICBzZXQgaW5zdGFuY2VDYXBhY2l0eSh2YWx1ZSkgeyB0aGlzLm1fdUluc3RhbmNlQ2FwYWNpdHkgPSB2YWx1ZTsgfVxuICAgICAgICBnZXQgaW5zdGFuY2VFeHBpcmVUaW1lKCkgeyByZXR1cm4gdGhpcy5tX2ZJbnN0YW5jZUV4cGlyZVRpbWU7IH1cbiAgICAgICAgc2V0IGluc3RhbmNlRXhwaXJlVGltZSh2YWx1ZSkgeyB0aGlzLm1fZkluc3RhbmNlRXhwaXJlVGltZSA9IHZhbHVlOyB9XG4gICAgICAgIGdldCBpbnN0YW5jZVByaW9yaXR5KCkgeyByZXR1cm4gdGhpcy5tX2lJbnN0YW5jZVByaW9yaXR5OyB9XG4gICAgICAgIHNldCBpbnN0YW5jZVByaW9yaXR5KHZhbHVlKSB7IHRoaXMubV9pSW5zdGFuY2VQcmlvcml0eSA9IHZhbHVlOyB9XG4gICAgICAgIHVwZGF0ZShlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCB1aUZvcm0gb2YgdGhpcy5tX3BSZWN5Y2xlUXVldWUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tX3BJbnN0YW5jZVBvb2wuaGFzKHVpRm9ybS51aUZvcm1Bc3NldE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZfcEluc3RhbmNlT2JqZWN0cyA9IHRoaXMubV9wSW5zdGFuY2VQb29sLmdldCh1aUZvcm0udWlGb3JtQXNzZXROYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEluc3RhbmNlT2JqZWN0cyAmJiB2X3BJbnN0YW5jZU9iamVjdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdCBvZiB2X3BJbnN0YW5jZU9iamVjdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodl9wVWlGb3JtSW5zdGFuY2VPYmplY3QuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1aUZvcm0ub25SZWN5Y2xlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LnNwYXduID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubV9wUmVjeWNsZVF1ZXVlLmxlbmd0aClcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlY3ljbGVRdWV1ZS5zcGxpY2UoMCwgdGhpcy5tX3BSZWN5Y2xlUXVldWUubGVuZ3RoKTtcbiAgICAgICAgICAgIC8vIFRPRE86IGF1dG8gcmVsZWFzZSBwcm9jZXNzaW5nIGhlcmUuXG4gICAgICAgICAgICB0aGlzLm1fclVJR3JvdXBzLmZvckVhY2goKHVpR3JvdXAsIGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZfcFVpR3JvdXAgPSB1aUdyb3VwO1xuICAgICAgICAgICAgICAgIHZfcFVpR3JvdXAudXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHNodXRkb3duKCkge1xuICAgICAgICAgICAgdGhpcy5tX2JJc1NodXRkb3duID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuY2xvc2VBbGxMb2FkZWRVSUZvcm1zKCk7XG4gICAgICAgICAgICB0aGlzLm1fclVJR3JvdXBzID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fcFJlY3ljbGVRdWV1ZS5zcGxpY2UoMCwgdGhpcy5tX3BSZWN5Y2xlUXVldWUubGVuZ3RoKTtcbiAgICAgICAgICAgIHRoaXMubV9wUmVjeWNsZVF1ZXVlID0gbnVsbDtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcEluc3RhbmNlUG9vbCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wSW5zdGFuY2VQb29sLmZvckVhY2goKGluc3RhbmNlT2JqZWN0cywga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZU9iamVjdHMgJiYgaW5zdGFuY2VPYmplY3RzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3Qgb2YgaW5zdGFuY2VPYmplY3RzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QucmVsZWFzZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC5jbGVhcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LnRhcmdldCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZU9iamVjdHMuc3BsaWNlKDAsIGluc3RhbmNlT2JqZWN0cy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BJbnN0YW5jZVBvb2wuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEluc3RhbmNlUG9vbC5jbGVhcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG9wZW5VSUZvcm0odWlGb3JtQXNzZXROYW1lLCB1aUdyb3VwTmFtZSwgcHJpb3JpdHksIHBhdXNlQ292ZXJlZFVJRm9ybSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIC8vIGNjLmxvZyhgW1VJTWFuYWdlcl0gUmVxZXVzdCBPcGVuIFVJRm9ybSBhc3NldCAnJHt1aUZvcm1Bc3NldE5hbWV9JyB3aXRoIGdyb3VwICcke3VpR3JvdXBOYW1lfScgb24gcHJpb3JpdHkgJyR7cHJpb3JpdHl9JywgcGF1c2VDb3ZlcmVkVUlGb3JtOiAke3BhdXNlQ292ZXJlZFVJRm9ybX0sIHVzZXJEYXRhOiAke3VzZXJEYXRhfWApO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IHJlc291cmNlIG1hbmFnZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BVSUZvcm1IZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IFVJIGZvcm0gaGVscGVyIGZpcnN0LlwiKTtcbiAgICAgICAgICAgIGlmICghdWlGb3JtQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBhc3NldCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBpZiAoIXVpR3JvdXBOYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZ3JvdXAgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgbGV0IHZfclVJR3JvdXAgPSB0aGlzLmdldFVJR3JvdXAodWlHcm91cE5hbWUpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9yVUlHcm91cCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVUkgZ3JvdXAgJyR7dWlHcm91cE5hbWV9JyBpcyBub3QgZXhpc3QuYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgdl9pU2VyaWFsSWQgPSArK3RoaXMubV9pU2VyaWFsSWQ7XG4gICAgICAgICAgICBsZXQgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wSW5zdGFuY2VQb29sLmhhcyh1aUZvcm1Bc3NldE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgLy8gR2V0IHNwYXduLlxuICAgICAgICAgICAgICAgIGxldCB2X3BJbnN0YW5jZU9iamVjdHMgPSB0aGlzLm1fcEluc3RhbmNlUG9vbC5nZXQodWlGb3JtQXNzZXROYW1lKTtcbiAgICAgICAgICAgICAgICBpZiAodl9wSW5zdGFuY2VPYmplY3RzICYmIHZfcEluc3RhbmNlT2JqZWN0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdl9wSW5zdGFuY2VPYmplY3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodl9wSW5zdGFuY2VPYmplY3RzW2ldLmlzVmFsaWQgJiYgIXZfcEluc3RhbmNlT2JqZWN0c1tpXS5zcGF3bikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0ID0gdl9wSW5zdGFuY2VPYmplY3RzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LnNwYXduID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkLmhhcyh2X2lTZXJpYWxJZCkpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgS2V5IGR1cGxpY2F0ZWQgd2l0aDogJHt2X2lTZXJpYWxJZH1gKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZC5zZXQodl9pU2VyaWFsSWQsIHVpRm9ybUFzc2V0TmFtZSk7XG4gICAgICAgICAgICAgICAgLy8gRklYTUU6IGNhbGwgb24gcmVzb3VyY2UgbWFuYWdlciB0byBsb2FkQXNzZXQuXG4gICAgICAgICAgICAgICAgbGV0IHZfck9wZW5VaUZvcm1JbmZvID0ge1xuICAgICAgICAgICAgICAgICAgICBzZXJpYWxJZDogdl9pU2VyaWFsSWQsXG4gICAgICAgICAgICAgICAgICAgIHVpR3JvdXA6IHZfclVJR3JvdXAsXG4gICAgICAgICAgICAgICAgICAgIHBhdXNlQ292ZXJlZFVJRm9ybTogcGF1c2VDb3ZlcmVkVUlGb3JtLFxuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YTogdXNlckRhdGFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyLmxvYWRBc3NldCh1aUZvcm1Bc3NldE5hbWUsIHByaW9yaXR5LCB0aGlzLm1fcExvYWRBc3NldENhbGxiYWNrcywgdl9yT3BlblVpRm9ybUluZm8pO1xuICAgICAgICAgICAgICAgIC8vIGxldCB2X2ZUaW1lU3RhcnQ6IG51bWJlciA9IG5ldyBEYXRlKCkudmFsdWVPZigpO1xuICAgICAgICAgICAgICAgIC8vIGNjLmxvYWRlci5sb2FkUmVzKHVpRm9ybUFzc2V0TmFtZSwgY2MuQXNzZXQsIChjb21wbGV0ZUNvdW50OiBudW1iZXIsIHRvdGFsQ291bnQ6IG51bWJlciwgaXRlbTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gLy8gUHJvZ3Jlc3MgcHJvY2Vzc2luZyB1cGRhdGUuXG4gICAgICAgICAgICAgICAgLy8gLy8gY2Mud2FybihgbG9hZGluZyBwcm9ncmVzczogJHtjb21wbGV0ZUNvdW50fS8ke3RvdGFsQ291bnR9LCBpdGVtOiAke2l0ZW19YCk7XG4gICAgICAgICAgICAgICAgLy8gdGhpcy5maXJlT3BlblVJRm9ybVByb2dyZXNzKHVpRm9ybUFzc2V0TmFtZSwgY29tcGxldGVDb3VudCAvIHRvdGFsQ291bnQsIHZfck9wZW5VaUZvcm1JbmZvKTtcbiAgICAgICAgICAgICAgICAvLyB9LCAoZXJyb3I6IEVycm9yLCByZXNvdXJjZTogb2JqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gY2Mud2FybihgbG9hZFJlcyBjb21wbGV0ZSB3aXRoIGluZm86ICR7dl9yT3BlblVpRm9ybUluZm8uc2VyaWFsSWR9LCAke3Zfck9wZW5VaUZvcm1JbmZvLnVpR3JvdXAubmFtZX0sICR7dWlGb3JtQXNzZXROYW1lfWApO1xuICAgICAgICAgICAgICAgIC8vIC8vIGxvYWQgY29tcGxldGVkLlxuICAgICAgICAgICAgICAgIC8vIHRoaXMuZmlyZU9wZW5VSUZvcm1Db21wbGV0ZShlcnJvciwgdWlGb3JtQXNzZXROYW1lLCByZXNvdXJjZSwgbmV3IERhdGUoKS52YWx1ZU9mKCkgLSB2X2ZUaW1lU3RhcnQsIHZfck9wZW5VaUZvcm1JbmZvKTtcbiAgICAgICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMub3BlblVJRm9ybUludGVybmFsKHZfaVNlcmlhbElkLCB1aUZvcm1Bc3NldE5hbWUsIHZfclVJR3JvdXAsIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LnRhcmdldCwgcGF1c2VDb3ZlcmVkVUlGb3JtLCBmYWxzZSwgMCwgdXNlckRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZfaVNlcmlhbElkO1xuICAgICAgICB9XG4gICAgICAgIGlzTG9hZGluZ1VJRm9ybShzZXJpYWxJZE9yQXNzZXROYW1lKSB7XG4gICAgICAgICAgICBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiBzZXJpYWxJZE9yQXNzZXROYW1lKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB1aUZvcm1Bc3NldE5hbWUgb2YgdGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQudmFsdWVzKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVpRm9ybUFzc2V0TmFtZSA9PT0gc2VyaWFsSWRPckFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQuaGFzKHNlcmlhbElkT3JBc3NldE5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGdldFVJRm9ybXModWlGb3JtQXNzZXROYW1lKSB7XG4gICAgICAgICAgICBsZXQgdl9yUmV0ID0gW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHVpR3JvdXAgb2YgdGhpcy5tX3JVSUdyb3Vwcy52YWx1ZXMoKSkge1xuICAgICAgICAgICAgICAgIGlmIChudWxsICE9IHVpR3JvdXApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgdl9wRm9ybXMgPSB1aUdyb3VwLmdldFVJRm9ybXModWlGb3JtQXNzZXROYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgdl9yUmV0ID0gdl9yUmV0LmNvbmNhdCh2X3BGb3Jtcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZfclJldDtcbiAgICAgICAgfVxuICAgICAgICBnZXRVSUZvcm0oc2VyaWFsSWRPckFzc2V0TmFtZSkge1xuICAgICAgICAgICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2Ygc2VyaWFsSWRPckFzc2V0TmFtZSkge1xuICAgICAgICAgICAgICAgIGlmICghc2VyaWFsSWRPckFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGFzc2V0IG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB1aUZvcm0gPSBudWxsO1xuICAgICAgICAgICAgZm9yIChjb25zdCB1aUdyb3VwIG9mIHRoaXMubV9yVUlHcm91cHMudmFsdWVzKCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoKHVpRm9ybSA9IHVpR3JvdXAuZ2V0VUlGb3JtKHNlcmlhbElkT3JBc3NldE5hbWUpKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdWlGb3JtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGhhc1VJRm9ybShzZXJpYWxJZE9yQXNzZXROYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbCAhPSB0aGlzLmdldFVJRm9ybShzZXJpYWxJZE9yQXNzZXROYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBjbG9zZVVJRm9ybShzZXJpYWxJZE9yVWlGb3JtLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgbGV0IHVpRm9ybSA9IHNlcmlhbElkT3JVaUZvcm07XG4gICAgICAgICAgICBpZiAoJ251bWJlcicgPT09IHR5cGVvZiBzZXJpYWxJZE9yVWlGb3JtKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nVUlGb3JtKHNlcmlhbElkT3JVaUZvcm0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZC5hZGQoc2VyaWFsSWRPclVpRm9ybSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkLmRlbGV0ZShzZXJpYWxJZE9yVWlGb3JtKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB1aUZvcm0gPSB0aGlzLmdldFVJRm9ybShzZXJpYWxJZE9yVWlGb3JtKTtcbiAgICAgICAgICAgICAgICBpZiAobnVsbCA9PSB1aUZvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IGZpbmQgVUkgZm9ybSAnJHtzZXJpYWxJZE9yVWlGb3JtfSdgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXVpRm9ybSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGZvcm0gaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGxldCB1aUdyb3VwID0gdWlGb3JtLnVpR3JvdXA7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB1aUdyb3VwKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZ3JvdXAgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHVpR3JvdXAucmVtb3ZlVUlGb3JtKHVpRm9ybSk7XG4gICAgICAgICAgICB1aUZvcm0ub25DbG9zZSh0aGlzLm1fYklzU2h1dGRvd24sIHVzZXJEYXRhKTtcbiAgICAgICAgICAgIHVpR3JvdXAucmVmcmVzaCgpO1xuICAgICAgICAgICAgbGV0IGV2ZW50QXJncyA9IHtcbiAgICAgICAgICAgICAgICBzZXJpYWxJZDogdWlGb3JtLnNlcmlhbElkLFxuICAgICAgICAgICAgICAgIHVpR3JvdXA6IHVpR3JvdXAsXG4gICAgICAgICAgICAgICAgdWlGb3JtQXNzZXROYW1lOiB1aUZvcm0udWlGb3JtQXNzZXROYW1lLFxuICAgICAgICAgICAgICAgIHVzZXJEYXRhOiB1c2VyRGF0YVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMubV9wQ2xvc2VVSUZvcm1Db21wbGV0ZURlbGVnYXRlLml0ZXIoKGNhbGxiYWNrRm4pID0+IHtcbiAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGV2ZW50QXJncyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubV9wUmVjeWNsZVF1ZXVlLnB1c2godWlGb3JtKTtcbiAgICAgICAgfVxuICAgICAgICBnZXRBbGxMb2FkZWRVSUZvcm1zKCkge1xuICAgICAgICAgICAgbGV0IHZfcFJldCA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCB1aUdyb3VwIG9mIHRoaXMubV9yVUlHcm91cHMudmFsdWVzKCkpIHtcbiAgICAgICAgICAgICAgICB2X3BSZXQuY29uY2F0KHVpR3JvdXAuZ2V0QWxsVUlGb3JtcygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2X3BSZXQ7XG4gICAgICAgIH1cbiAgICAgICAgY2xvc2VBbGxMb2FkZWRVSUZvcm1zKHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBsZXQgdl9wVUlGb3JtcyA9IHRoaXMuZ2V0QWxsTG9hZGVkVUlGb3JtcygpO1xuICAgICAgICAgICAgZm9yIChjb25zdCB1aUZvcm0gb2Ygdl9wVUlGb3Jtcykge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5oYXNVSUZvcm0odWlGb3JtLnNlcmlhbElkKSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZVVJRm9ybSh1aUZvcm0sIHVzZXJEYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjbG9zZUFsbExvYWRpbmdVSUZvcm1zKCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBzZXJpYWxJZCBvZiB0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZC5rZXlzKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNUb1JlbGVhc2VPbkxvYWQuYWRkKHNlcmlhbElkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmVmb2N1c1VJRm9ybSh1aUZvcm0sIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB1aUZvcm0pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBsZXQgdWlHcm91cCA9IHVpRm9ybS51aUdyb3VwO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdWlHcm91cClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGdyb3VwIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB1aUdyb3VwLnJlZm9jdXNVSUZvcm0odWlGb3JtLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICB1aUdyb3VwLnJlZnJlc2goKTtcbiAgICAgICAgICAgIHVpRm9ybS5vblJlZm9jdXModXNlckRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGhhc1VJR3JvdXAodWlHcm91cE5hbWUpIHtcbiAgICAgICAgICAgIGlmICghdWlHcm91cE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBncm91cCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3JVSUdyb3Vwcy5oYXModWlHcm91cE5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGdldFVJR3JvdXAodWlHcm91cE5hbWUpIHtcbiAgICAgICAgICAgIGlmICghdWlHcm91cE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBncm91cCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3JVSUdyb3Vwcy5nZXQodWlHcm91cE5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGFkZFVJR3JvdXAodWlHcm91cE5hbWUsIGFyZzEsIGFyZzIpIHtcbiAgICAgICAgICAgIGlmICghdWlHcm91cE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBncm91cCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBsZXQgdWlHcm91cERlcHRoID0gMDtcbiAgICAgICAgICAgIGxldCB1aUdyb3VwSGVscGVyID0gbnVsbDtcbiAgICAgICAgICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIGFyZzEpIHtcbiAgICAgICAgICAgICAgICB1aUdyb3VwRGVwdGggPSBhcmcxO1xuICAgICAgICAgICAgICAgIGlmICh1bmRlZmluZWQgIT0gYXJnMikge1xuICAgICAgICAgICAgICAgICAgICB1aUdyb3VwSGVscGVyID0gYXJnMjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB1aUdyb3VwSGVscGVyID0gYXJnMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdWlHcm91cEhlbHBlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGdyb3VwIGhlbHBlciBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgaWYgKHRoaXMuaGFzVUlHcm91cCh1aUdyb3VwTmFtZSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5tX3JVSUdyb3Vwcy5zZXQodWlHcm91cE5hbWUsIG5ldyBVSUdyb3VwKHVpR3JvdXBOYW1lLCB1aUdyb3VwRGVwdGgsIHVpR3JvdXBIZWxwZXIpKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIG9wZW5VSUZvcm1JbnRlcm5hbChzZXJpYWxJZCwgdWlGb3JtQXNzZXROYW1lLCB1aUdyb3VwLCB1aUZvcm1JbnN0YW5jZSwgcGF1c2VDb3ZlcmVkVUlGb3JtLCBpc05ld0luc3RhbmNlLCBkdXJhdGlvbiwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGxldCB1aUZvcm0gPSB0aGlzLm1fcFVJRm9ybUhlbHBlci5jcmVhdGVVSUZvcm0odWlGb3JtSW5zdGFuY2UsIHVpR3JvdXAsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHVpRm9ybSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBub3QgY3JlYXRlIFVJIGZvcm0gaW4gaGVscGVyLicpO1xuICAgICAgICAgICAgdWlGb3JtLm9uSW5pdChzZXJpYWxJZCwgdWlGb3JtQXNzZXROYW1lLCB1aUdyb3VwLCBwYXVzZUNvdmVyZWRVSUZvcm0sIGlzTmV3SW5zdGFuY2UsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgIHVpR3JvdXAuYWRkVUlGb3JtKHVpRm9ybSk7XG4gICAgICAgICAgICB1aUZvcm0ub25PcGVuKHVzZXJEYXRhKTtcbiAgICAgICAgICAgIHVpR3JvdXAucmVmcmVzaCgpO1xuICAgICAgICAgICAgbGV0IGV2ZW50QXJncyA9IHtcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24sXG4gICAgICAgICAgICAgICAgdWlGb3JtOiB1aUZvcm0sXG4gICAgICAgICAgICAgICAgdXNlckRhdGE6IHVzZXJEYXRhXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5tX3BPcGVuVUlGb3JtU3VjY2Vzc0RlbGVnYXRlLml0ZXIoKGNhbGxiYWNrRm4pID0+IHtcbiAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGV2ZW50QXJncyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBsb2FkVUlGb3JtU3VjY2Vzc0NhbGxiYWNrKHVpRm9ybUFzc2V0TmFtZSwgdWlGb3JtQXNzZXQsIGR1cmF0aW9uLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgbGV0IHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcEluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiT3BlbiBVSSBmb3JtIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3JVSUZvcm1zVG9SZWxlYXNlT25Mb2FkLmhhcyh2X3BJbmZvLnNlcmlhbElkKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZC5kZWxldGUodl9wSW5mby5zZXJpYWxJZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1IZWxwZXIucmVsZWFzZVVJRm9ybSh1aUZvcm1Bc3NldCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQuZGVsZXRlKHZfcEluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgbGV0IHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0ID0gVUlGb3JtSW5zdGFuY2VPYmplY3QuY3JlYXRlKHVpRm9ybUFzc2V0TmFtZSwgdWlGb3JtQXNzZXQsIHRoaXMubV9wVUlGb3JtSGVscGVyLmluc3RhbnRpYXRlVUlGb3JtKHVpRm9ybUFzc2V0KSwgdGhpcy5tX3BVSUZvcm1IZWxwZXIpO1xuICAgICAgICAgICAgLy8gUmVnaXN0ZXIgdG8gcG9vbCBhbmQgbWFyayBzcGF3biBmbGFnLlxuICAgICAgICAgICAgaWYgKCF0aGlzLm1fcEluc3RhbmNlUG9vbC5oYXModWlGb3JtQXNzZXROYW1lKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wSW5zdGFuY2VQb29sLnNldCh1aUZvcm1Bc3NldE5hbWUsIFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB2X3BJbnN0YW5jZU9iamVjdHMgPSB0aGlzLm1fcEluc3RhbmNlUG9vbC5nZXQodWlGb3JtQXNzZXROYW1lKTtcbiAgICAgICAgICAgIGlmICh2X3BJbnN0YW5jZU9iamVjdHMubGVuZ3RoIDwgdGhpcy5tX3VJbnN0YW5jZUNhcGFjaXR5KSB7XG4gICAgICAgICAgICAgICAgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3Quc3Bhd24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIHZfcEluc3RhbmNlT2JqZWN0cy5wdXNoKHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMub3BlblVJRm9ybUludGVybmFsKHZfcEluZm8uc2VyaWFsSWQsIHVpRm9ybUFzc2V0TmFtZSwgdl9wSW5mby51aUdyb3VwLCB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC50YXJnZXQsIHZfcEluZm8ucGF1c2VDb3ZlcmVkVUlGb3JtLCB0cnVlLCBkdXJhdGlvbiwgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgbG9hZFVJRm9ybUZhaWx1cmVDYWxsYmFjayh1aUZvcm1Bc3NldE5hbWUsIHN0YXR1cywgZXJyb3JNZXNzYWdlLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgbGV0IHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcEluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiT3BlbiBVSSBmb3JtIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3JVSUZvcm1zVG9SZWxlYXNlT25Mb2FkLmhhcyh2X3BJbmZvLnNlcmlhbElkKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZC5kZWxldGUodl9wSW5mby5zZXJpYWxJZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQuZGVsZXRlKHZfcEluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgbGV0IGFwcGVuZEVycm9yTWVzc2FnZSA9IGBMb2FkIFVJIGZvcm0gZmFpbHVyZSwgYXNzZXQgbmFtZSAnJHt1aUZvcm1Bc3NldE5hbWV9Jywgc3RhdHVzICcke3N0YXR1cy50b1N0cmluZygpfScsIGVycm9yIG1lc3NhZ2UgJyR7ZXJyb3JNZXNzYWdlfScuYDtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcE9wZW5VSUZvcm1GYWlsdXJlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIGxldCBldmVudEFyZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHNlcmlhbElkOiB2X3BJbmZvLnNlcmlhbElkLFxuICAgICAgICAgICAgICAgICAgICB1aUZvcm1Bc3NldE5hbWU6IHVpRm9ybUFzc2V0TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdWlHcm91cE5hbWU6IHZfcEluZm8udWlHcm91cC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGFwcGVuZEVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgcGF1c2VDb3ZlcmVkVUlGb3JtOiB2X3BJbmZvLnBhdXNlQ292ZXJlZFVJRm9ybSxcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGE6IHZfcEluZm8udXNlckRhdGFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMubV9wT3BlblVJRm9ybUZhaWx1cmVEZWxlZ2F0ZS5pdGVyKChjYWxsYmFja0ZuKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oZXZlbnRBcmdzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYXBwZW5kRXJyb3JNZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICBsb2FkVUlGb3JtVXBkYXRlQ2FsbGJhY2sodWlGb3JtQXNzZXROYW1lLCBwcm9ncmVzcywgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGxldCB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk9wZW4gVUkgZm9ybSBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wT3BlblVJRm9ybVVwZGF0ZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICBsZXQgZXZlbnRBcmdzID0ge1xuICAgICAgICAgICAgICAgICAgICBzZXJpYWxJZDogdl9wSW5mby5zZXJpYWxJZCxcbiAgICAgICAgICAgICAgICAgICAgdWlGb3JtQXNzZXROYW1lOiB1aUZvcm1Bc3NldE5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHVpR3JvdXBOYW1lOiB2X3BJbmZvLnVpR3JvdXAubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IHByb2dyZXNzLFxuICAgICAgICAgICAgICAgICAgICBwYXVzZUNvdmVyZWRVSUZvcm06IHZfcEluZm8ucGF1c2VDb3ZlcmVkVUlGb3JtLFxuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YTogdl9wSW5mby51c2VyRGF0YVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BPcGVuVUlGb3JtVXBkYXRlRGVsZWdhdGUuaXRlcigoY2FsbGJhY2tGbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGV2ZW50QXJncyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbG9hZFVJRm9ybURlcGVuZGVuY3lBc3NldENhbGxiYWNrKHVpRm9ybUFzc2V0TmFtZSwgZGVwZW5kZW5jeUFzc2V0TmFtZSwgbG9hZGVkQ291bnQsIHRvdGFsQ291bnQsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBsZXQgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wSW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJPcGVuIFVJIGZvcm0gaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcE9wZW5VSUZvcm1EZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgbGV0IGV2ZW50QXJncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgc2VyaWFsSWQ6IHZfcEluZm8uc2VyaWFsSWQsXG4gICAgICAgICAgICAgICAgICAgIHVpRm9ybUFzc2V0TmFtZTogdWlGb3JtQXNzZXROYW1lLFxuICAgICAgICAgICAgICAgICAgICB1aUdyb3VwTmFtZTogdl9wSW5mby51aUdyb3VwLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGRlcGVuZGVuY3lBc3NldE5hbWU6IGRlcGVuZGVuY3lBc3NldE5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGxvYWRlZENvdW50OiBsb2FkZWRDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxDb3VudDogdG90YWxDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgcGF1c2VDb3ZlcmVkVUlGb3JtOiB2X3BJbmZvLnBhdXNlQ292ZXJlZFVJRm9ybSxcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGE6IHZfcEluZm8udXNlckRhdGFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMubV9wT3BlblVJRm9ybURlcGVuZGVuY3lBc3NldERlbGVnYXRlLml0ZXIoKGNhbGxiYWNrRm4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihldmVudEFyZ3MpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSAvLyBjbGFzcyBVSU1hbmFnZXJcbiAgICBleHBvcnRzLlVJTWFuYWdlciA9IFVJTWFuYWdlcjtcbiAgICBjbGFzcyBVSUZvcm1JbnN0YW5jZU9iamVjdCB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1Bc3NldCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUhlbHBlciA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm5hbWUgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy50YXJnZXQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5pc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnNwYXduID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUFzc2V0ID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9wVUlGb3JtSGVscGVyID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuaXNWYWxpZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnNwYXduID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgc3RhdGljIGNyZWF0ZShuYW1lLCB1aUZvcm1Bc3NldCwgdWlGb3JtSW5zdGFuY2UsIHVpRm9ybUhlbHBlcikge1xuICAgICAgICAgICAgaWYgKCF1aUZvcm1Bc3NldClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGZvcm0gYXNzZXQgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGlmICghdWlGb3JtSGVscGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBoZWxwZXIgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGxldCB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdCA9IG5ldyBVSUZvcm1JbnN0YW5jZU9iamVjdCgpO1xuICAgICAgICAgICAgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QubmFtZSA9IG5hbWU7XG4gICAgICAgICAgICB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC50YXJnZXQgPSB1aUZvcm1JbnN0YW5jZTtcbiAgICAgICAgICAgIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0Lm1fcFVJRm9ybUFzc2V0ID0gdWlGb3JtQXNzZXQ7XG4gICAgICAgICAgICB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC5tX3BVSUZvcm1IZWxwZXIgPSB1aUZvcm1IZWxwZXI7XG4gICAgICAgICAgICByZXR1cm4gdl9wVWlGb3JtSW5zdGFuY2VPYmplY3Q7XG4gICAgICAgIH1cbiAgICAgICAgY2xlYXIoKSB7XG4gICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUFzc2V0ID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9wVUlGb3JtSGVscGVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZWxlYXNlKHNodXRkb3duKSB7XG4gICAgICAgICAgICBzaHV0ZG93biA9IHNodXRkb3duIHx8IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5pc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BVSUZvcm1IZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1IZWxwZXIucmVsZWFzZVVJRm9ybSh0aGlzLm1fcFVJRm9ybUFzc2V0LCB0aGlzLnRhcmdldCk7XG4gICAgICAgIH1cbiAgICB9IC8vIGNsYXNzIFVJRm9ybUluc3RhbmNlT2JqZWN0XG4gICAgY2xhc3MgVUlHcm91cCB7XG4gICAgICAgIGNvbnN0cnVjdG9yKG5hbWUsIGRlcHRoLCBoZWxwZXIpIHtcbiAgICAgICAgICAgIHRoaXMubV9pRGVwdGggPSAwO1xuICAgICAgICAgICAgdGhpcy5tX2JQYXVzZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1JbmZvcyA9IFtdO1xuICAgICAgICAgICAgaWYgKCFuYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZ3JvdXAgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgaWYgKCFoZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBncm91cCBoZWxwZXIgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHRoaXMubV9zTmFtZSA9IG5hbWU7XG4gICAgICAgICAgICB0aGlzLm1fYlBhdXNlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmhlbHBlciA9IGhlbHBlcjtcbiAgICAgICAgICAgIHRoaXMuZGVwdGggPSBkZXB0aDtcbiAgICAgICAgfVxuICAgICAgICBnZXQgbmFtZSgpIHsgcmV0dXJuIHRoaXMubV9zTmFtZTsgfVxuICAgICAgICBnZXQgZGVwdGgoKSB7IHJldHVybiB0aGlzLm1faURlcHRoOyB9XG4gICAgICAgIHNldCBkZXB0aCh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlID09IHRoaXMubV9pRGVwdGgpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5tX2lEZXB0aCA9IHZhbHVlO1xuICAgICAgICAgICAgdGhpcy5oZWxwZXIuc2V0RGVwdGgodGhpcy5tX2lEZXB0aCk7XG4gICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgcGF1c2UoKSB7IHJldHVybiB0aGlzLm1fYlBhdXNlOyB9XG4gICAgICAgIHNldCBwYXVzZSh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9iUGF1c2UgPT0gdmFsdWUpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5tX2JQYXVzZSA9IHZhbHVlO1xuICAgICAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IHVpRm9ybUNvdW50KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wVUlGb3JtSW5mb3MubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGdldCBjdXJyZW50VUlGb3JtKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wVUlGb3JtSW5mb3MubGVuZ3RoID4gMCA/IHRoaXMubV9wVUlGb3JtSW5mb3NbMF0udWlGb3JtIDogbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgaW5mbyBvZiB0aGlzLm1fcFVJRm9ybUluZm9zKSB7XG4gICAgICAgICAgICAgICAgaWYgKGluZm8ucGF1c2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbmZvLnVpRm9ybS5vblVwZGF0ZShlbGFwc2VkLCByZWFsRWxhcHNlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYWRkVUlGb3JtKHVpRm9ybSkge1xuICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1JbmZvcy5wdXNoKHtcbiAgICAgICAgICAgICAgICB1aUZvcm06IHVpRm9ybSxcbiAgICAgICAgICAgICAgICBjb3ZlcmVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIHBhdXNlZDogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVtb3ZlVUlGb3JtKHVpRm9ybSkge1xuICAgICAgICAgICAgbGV0IHZfdUlkeCA9IC0xO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm1fcFVJRm9ybUluZm9zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubV9wVUlGb3JtSW5mb3NbaV0udWlGb3JtID09IHVpRm9ybSkge1xuICAgICAgICAgICAgICAgICAgICB2X3VJZHggPSBpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodl91SWR4ID09IC0xKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuIG5vdCBmaW5kIFVJIGZvcm0gaW5mbyBmb3Igc2VyaWFsIGlkICcke3VpRm9ybS5zZXJpYWxJZH0nLCBVSSBmb3JtIGFzc2V0IG5hbWUgaXMgJyR7dWlGb3JtLnVpRm9ybUFzc2V0TmFtZX0nLmApO1xuICAgICAgICAgICAgbGV0IHZfcEluZm8gPSB0aGlzLm1fcFVJRm9ybUluZm9zW3ZfdUlkeF07XG4gICAgICAgICAgICBpZiAoIXZfcEluZm8uY292ZXJlZCkge1xuICAgICAgICAgICAgICAgIHZfcEluZm8uY292ZXJlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdWlGb3JtLm9uQ292ZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdl9wSW5mby5wYXVzZWQpIHtcbiAgICAgICAgICAgICAgICB2X3BJbmZvLnBhdXNlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdWlGb3JtLm9uUGF1c2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wVUlGb3JtSW5mb3Muc3BsaWNlKHZfdUlkeCwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgaGFzVUlGb3JtKGlkT3JBc3NldE5hbWUpIHtcbiAgICAgICAgICAgIGxldCBzdWJQcm9wTmFtZSA9ICdzZXJpYWxJZCc7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGlkT3JBc3NldE5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpZE9yQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGZvcm0gYXNzZXQgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgICAgIHN1YlByb3BOYW1lID0gJ3VpRm9ybUFzc2V0TmFtZSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGluZm8gb2YgdGhpcy5tX3BVSUZvcm1JbmZvcykge1xuICAgICAgICAgICAgICAgIGlmIChpbmZvLnVpRm9ybVtzdWJQcm9wTmFtZV0gPT09IGlkT3JBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGdldFVJRm9ybShpZE9yQXNzZXROYW1lKSB7XG4gICAgICAgICAgICBsZXQgc3ViUHJvcE5hbWUgPSAnc2VyaWFsSWQnO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpZE9yQXNzZXROYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGlmICghaWRPckFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGFzc2V0IG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgICAgICBzdWJQcm9wTmFtZSA9ICd1aUZvcm1Bc3NldE5hbWUnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChjb25zdCBpbmZvIG9mIHRoaXMubV9wVUlGb3JtSW5mb3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5mby51aUZvcm1bc3ViUHJvcE5hbWVdID09PSBpZE9yQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW5mby51aUZvcm07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBnZXRVSUZvcm1zKGFzc2V0TmFtZSkge1xuICAgICAgICAgICAgaWYgKCFhc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGFzc2V0IG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGxldCB2X3BSZXQgPSB0aGlzLm1fcFVJRm9ybUluZm9zLm1hcChpbmZvID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaW5mby51aUZvcm0udWlGb3JtQXNzZXROYW1lID09PSBhc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpbmZvLnVpRm9ybTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHZfcFJldDtcbiAgICAgICAgfVxuICAgICAgICBnZXRBbGxVSUZvcm1zKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wVUlGb3JtSW5mb3MubWFwKGluZm8gPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBpbmZvLnVpRm9ybTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJlZm9jdXNVSUZvcm0odWlGb3JtLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgbGV0IHZfdUlkeCA9IC0xO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm1fcFVJRm9ybUluZm9zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubV9wVUlGb3JtSW5mb3NbaV0udWlGb3JtID09IHVpRm9ybSkge1xuICAgICAgICAgICAgICAgICAgICB2X3VJZHggPSBpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodl91SWR4ID09IC0xKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuIG5vdCBmaW5kIFVJIGZvcm0gaW5mbyBmb3Igc2VyaWFsIGlkICcke3VpRm9ybS5zZXJpYWxJZH0nLCBVSSBmb3JtIGFzc2V0IG5hbWUgaXMgJyR7dWlGb3JtLnVpRm9ybUFzc2V0TmFtZX0nLmApO1xuICAgICAgICAgICAgaWYgKHZfdUlkeCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1JbmZvcy5zcGxpY2Uodl91SWR4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB2X3BJbmZvID0gdGhpcy5tX3BVSUZvcm1JbmZvc1t2X3VJZHhdO1xuICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1JbmZvcy51bnNoaWZ0KHZfcEluZm8pO1xuICAgICAgICB9XG4gICAgICAgIHJlZnJlc2goKSB7XG4gICAgICAgICAgICBsZXQgdl9iUGF1c2UgPSB0aGlzLnBhdXNlO1xuICAgICAgICAgICAgbGV0IHZfYkNvdmVyID0gZmFsc2U7XG4gICAgICAgICAgICBsZXQgdl9pRGVwdGggPSB0aGlzLnVpRm9ybUNvdW50O1xuICAgICAgICAgICAgZm9yIChjb25zdCBpbmZvIG9mIHRoaXMubV9wVUlGb3JtSW5mb3MpIHtcbiAgICAgICAgICAgICAgICBpZiAobnVsbCA9PSBpbmZvKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgaWYgKHZfYlBhdXNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaW5mby5jb3ZlcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZvLmNvdmVyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5mby51aUZvcm0ub25Db3ZlcigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghaW5mby5wYXVzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm8ucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm8udWlGb3JtLm9uUGF1c2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZm8ucGF1c2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZvLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5mby51aUZvcm0ub25SZXN1bWUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5mby51aUZvcm0ucGF1c2VDb3ZlcmVkVUlGb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2X2JQYXVzZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHZfYkNvdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWluZm8uY292ZXJlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8uY292ZXJlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby51aUZvcm0ub25Db3ZlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZm8uY292ZXJlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8uY292ZXJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8udWlGb3JtLm9uUmV2ZWFsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB2X2JDb3ZlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IC8vIGNsYXNzIFVJR3JvdXBcbiAgICBleHBvcnRzLlVJR3JvdXAgPSBVSUdyb3VwO1xufSk7XG4iLCIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgdmFyIGdsb2JhbCA9IGdsb2JhbCB8fCB7fTtcbiAgICBjb25zdCB2X3BHbG9iYWwgPSAndW5kZWZpbmVkJyA9PSB0eXBlb2Ygd2luZG93ID8gZ2xvYmFsIDogd2luZG93O1xuICAgIGNvbnN0IGF0c2ZyYW1ld29yayA9IHZfcEdsb2JhbC5hdHNmcmFtZXdvcmsgfHwge307XG4gICAgZnVuY3Rpb24gZXhwb3NlKG0pIHtcbiAgICAgICAgZm9yIChjb25zdCBrIGluIG0pIHtcbiAgICAgICAgICAgIGF0c2ZyYW1ld29ya1trXSA9IG1ba107XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXhwb3NlKHJlcXVpcmUoJy4vQmFzZScpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vQ29uZmlnXCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vRGF0YU5vZGVcIikpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9Gc21cIikpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9SZXNvdXJjZVwiKSk7XG4gICAgZXhwb3NlKHJlcXVpcmUoXCIuL0V2ZW50XCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vUHJvY2VkdXJlXCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vVUlcIikpO1xuICAgIHZfcEdsb2JhbC5hdHNmcmFtZXdvcmsgPSBhdHNmcmFtZXdvcms7XG4gICAgZXhwb3J0cy5kZWZhdWx0ID0gYXRzZnJhbWV3b3JrO1xufSk7XG4iXX0=
