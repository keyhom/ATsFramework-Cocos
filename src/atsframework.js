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
                for (const fsm of this.m_pFsms.values()) {
                    if (null != fsm && fsm instanceof nameOrType) {
                        return true;
                    }
                }
            }
            else {
                return nameOrType.toString() in this.m_pFsms;
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
        // NOOP.
        constructor() {
            super();
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIkJhc2UuanMiLCJDb25maWcuanMiLCJEYXRhTm9kZS5qcyIsIkV2ZW50LmpzIiwiRnNtLmpzIiwiUHJvY2VkdXJlLmpzIiwiUmVzb3VyY2UuanMiLCJVSS5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6cEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIl0sIGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIC8qKlxuICAgICAqIExvYWQgdHlwZS5cbiAgICAgKi9cbiAgICB2YXIgTG9hZFR5cGU7XG4gICAgKGZ1bmN0aW9uIChMb2FkVHlwZSkge1xuICAgICAgICBMb2FkVHlwZVtMb2FkVHlwZVtcIlRleHRcIl0gPSAwXSA9IFwiVGV4dFwiO1xuICAgICAgICBMb2FkVHlwZVtMb2FkVHlwZVtcIkJ5dGVzXCJdID0gMV0gPSBcIkJ5dGVzXCI7XG4gICAgICAgIExvYWRUeXBlW0xvYWRUeXBlW1wiU3RyZWFtXCJdID0gMl0gPSBcIlN0cmVhbVwiO1xuICAgIH0pKExvYWRUeXBlID0gZXhwb3J0cy5Mb2FkVHlwZSB8fCAoZXhwb3J0cy5Mb2FkVHlwZSA9IHt9KSk7XG4gICAgO1xuICAgIGxldCBnX3BNb2R1bGVzID0gW107XG4gICAgLyoqXG4gICAgICogQW4gZXZlbnQgaGFuZGxlciBtYWtlIHNpbWlsYXIgd2l0aCBldmVudCBkZWxlZ2F0ZSBtb2RlLlxuICAgICAqL1xuICAgIGNsYXNzIEV2ZW50SGFuZGxlciB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgdGhpcy5tX3BIYW5kbGVycyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaGFzKGZuKSB7XG4gICAgICAgICAgICBpZiAobnVsbCAhPSB0aGlzLm1fcEhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BIYW5kbGVycy5oYXMoZm4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGFkZChmbikge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BIYW5kbGVycylcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEhhbmRsZXJzID0gbmV3IFNldCgpO1xuICAgICAgICAgICAgdGhpcy5tX3BIYW5kbGVycy5hZGQoZm4pO1xuICAgICAgICB9XG4gICAgICAgIHJlbW92ZShmbikge1xuICAgICAgICAgICAgdGhpcy5pc1ZhbGlkICYmIHRoaXMubV9wSGFuZGxlcnMuZGVsZXRlKGZuKTtcbiAgICAgICAgfVxuICAgICAgICBpdGVyKGZuKSB7XG4gICAgICAgICAgICB0aGlzLmlzVmFsaWQgJiYgdGhpcy5tX3BIYW5kbGVycy5mb3JFYWNoKGZuKTtcbiAgICAgICAgfVxuICAgICAgICBjbGVhcigpIHtcbiAgICAgICAgICAgIHRoaXMuaXNWYWxpZCAmJiB0aGlzLm1fcEhhbmRsZXJzLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IGlzVmFsaWQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BIYW5kbGVycyAmJiB0aGlzLm1fcEhhbmRsZXJzLnNpemUgPiAwO1xuICAgICAgICB9XG4gICAgICAgIGdldCBzaXplKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wSGFuZGxlcnMuc2l6ZTtcbiAgICAgICAgfVxuICAgIH0gLy8gY2xhc3MgRXZlbnRIYW5kbGVyXG4gICAgZXhwb3J0cy5FdmVudEhhbmRsZXIgPSBFdmVudEhhbmRsZXI7XG4gICAgY2xhc3MgRnJhbWV3b3JrTW9kdWxlIHtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICB0aGlzLm1faVByaW9yaXR5ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBzdGF0aWMgZ2V0TW9kdWxlKHR5cGUpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZ19wTW9kdWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG0gPSBnX3BNb2R1bGVzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChtIGluc3RhbmNlb2YgdHlwZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBzdGF0aWMgZ2V0T3JBZGRNb2R1bGUodHlwZSkge1xuICAgICAgICAgICAgbGV0IHZfcE1vZHVsZSA9IHRoaXMuZ2V0TW9kdWxlKHR5cGUpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wTW9kdWxlKSB7XG4gICAgICAgICAgICAgICAgdl9wTW9kdWxlID0gbmV3IHR5cGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZE1vZHVsZSh2X3BNb2R1bGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZfcE1vZHVsZTtcbiAgICAgICAgfVxuICAgICAgICBzdGF0aWMgYWRkTW9kdWxlKG1vZHVsZSkge1xuICAgICAgICAgICAgY29uc3QgbSA9IHRoaXMuZ2V0TW9kdWxlKG1vZHVsZS5jb25zdHJ1Y3Rvcik7XG4gICAgICAgICAgICBpZiAobSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYER1cGxpY2F0ZWQgYWRkaW5nIGZyYW1ld29yayBtb2R1bGU6ICR7dHlwZW9mIG1vZHVsZX1gKTsgLy8gRklYTUU6IERldGVjdGluZyBob3cgdG8gZ2V0IHRoZSBjbGFzcyBuYW1lLlxuICAgICAgICAgICAgZ19wTW9kdWxlcy5wdXNoKG1vZHVsZSk7XG4gICAgICAgICAgICBnX3BNb2R1bGVzID0gZ19wTW9kdWxlcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGEubV9pUHJpb3JpdHkgPiBiLm1faVByaW9yaXR5KVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoYS5tX2lQcmlvcml0eSA8IGIubV9pUHJpb3JpdHkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgc3RhdGljIHJlbW92ZU1vZHVsZSh0eXBlKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGdfcE1vZHVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2X3BNb2R1bGUgPSBnX3BNb2R1bGVzW2ldO1xuICAgICAgICAgICAgICAgIGlmICh2X3BNb2R1bGUgJiYgdl9wTW9kdWxlIGluc3RhbmNlb2YgdHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBnX3BNb2R1bGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZfcE1vZHVsZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBzdGF0aWMgdXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGdfcE1vZHVsZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2X3BNb2R1bGUgPSBnX3BNb2R1bGVzW2ldO1xuICAgICAgICAgICAgICAgIHZfcE1vZHVsZS51cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN0YXRpYyBzaHV0ZG93bigpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBnX3BNb2R1bGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgdl9wTW9kdWxlID0gZ19wTW9kdWxlc1tpXTtcbiAgICAgICAgICAgICAgICB2X3BNb2R1bGUuc2h1dGRvd24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBnZXQgcHJpb3JpdHkoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX2lQcmlvcml0eTtcbiAgICAgICAgfVxuICAgIH0gLy8gY2xhc3MgRnJhbWV3b3JrTW9kdWxlXG4gICAgZXhwb3J0cy5GcmFtZXdvcmtNb2R1bGUgPSBGcmFtZXdvcmtNb2R1bGU7XG59KTtcbiIsIihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICBjb25zdCBCYXNlXzEgPSByZXF1aXJlKFwiLi9CYXNlXCIpO1xuICAgIGNsYXNzIENvbmZpZ01hbmFnZXIgZXh0ZW5kcyBCYXNlXzEuRnJhbWV3b3JrTW9kdWxlIHtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICBzdXBlcigpO1xuICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX3BDb25maWdIZWxwZXIgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX3BDb25maWdEYXRhID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9wTG9hZEFzc2V0Q2FsbGJhY2tzID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9wQ29uZmlnRGF0YSA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMubV9wTG9hZEFzc2V0Q2FsbGJhY2tzID0ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRoaXMubG9hZENvbmZpZ1N1Y2Nlc3NDYWxsYmFjay5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgIGZhaWx1cmU6IHRoaXMubG9hZENvbmZpZ0ZhaWx1cmVDYWxsYmFjay5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgIHVwZGF0ZTogdGhpcy5sb2FkQ29uZmlnVXBkYXRlQ2FsbGJhY2suYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBkZXBlbmRlbmN5OiB0aGlzLmxvYWRDb25maWdEZXBlbmRlbmN5QXNzZXRDYWxsYmFjay5iaW5kKHRoaXMpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5tX3BMb2FkQ29uZmlnU3VjY2Vzc0RlbGVnYXRlID0gbmV3IEJhc2VfMS5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgIHRoaXMubV9wTG9hZENvbmZpZ0ZhaWx1cmVEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICB0aGlzLm1fcExvYWRDb25maWdVcGRhdGVEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICB0aGlzLm1fcExvYWRDb25maWdEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IHJlc291cmNlTWFuYWdlcigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFJlc291cmNlTWFuYWdlcjtcbiAgICAgICAgfVxuICAgICAgICBzZXQgcmVzb3VyY2VNYW5hZ2VyKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJlc291cmNlIG1hbmFnZXIgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlciA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGdldCBjb25maWdIZWxwZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BDb25maWdIZWxwZXI7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGNvbmZpZ0hlbHBlcih2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdmFsdWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29uZmlnIGhlbHBlciBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHRoaXMubV9wQ29uZmlnSGVscGVyID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IGNvbmZpZ0NvdW50KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wQ29uZmlnRGF0YS5zaXplO1xuICAgICAgICB9XG4gICAgICAgIGdldCBsb2FkQ29uZmlnU3VjY2VzcygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcExvYWRDb25maWdTdWNjZXNzRGVsZWdhdGU7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IGxvYWRDb25maWdGYWlsdXJlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wTG9hZENvbmZpZ0ZhaWx1cmVEZWxlZ2F0ZTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgbG9hZENvbmZpZ1VwZGF0ZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcExvYWRDb25maWdVcGRhdGVEZWxlZ2F0ZTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgbG9hZENvbmZpZ0RlcGVuZGVuY3lBc3NldCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcExvYWRDb25maWdEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZTtcbiAgICAgICAgfVxuICAgICAgICBsb2FkQ29uZmlnKGNvbmZpZ0Fzc2V0TmFtZSwgbG9hZFR5cGUsIGFueUFyZzEsIGFueUFyZzIpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IHJlc291cmNlIG1hbmFnZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BDb25maWdIZWxwZXIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzZXQgY29uZmlnIGhlbHBlciBmaXJzdC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgcHJpb3JpdHkgPSAwO1xuICAgICAgICAgICAgbGV0IHVzZXJEYXRhID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyLmxvYWRBc3NldChjb25maWdBc3NldE5hbWUsIHByaW9yaXR5LCB0aGlzLm1fcExvYWRBc3NldENhbGxiYWNrcywgeyBsb2FkVHlwZTogbG9hZFR5cGUsIHVzZXJEYXRhOiB1c2VyRGF0YSB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBOT1RFOiBBbnkgamF2YXNjcmlwdC90eXBlc2NyaXB0IHN0cmVhbSBpbXBsZW1lbnRhdGlvbj9cbiAgICAgICAgcGFyc2VDb25maWcodGV4dE9yQnVmZmVyLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKCF0ZXh0T3JCdWZmZXIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGNvbmZpZyBkYXRhIGRldGVjdGVkIVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMubV9wQ29uZmlnSGVscGVyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc2V0IGNvbmZpZyBoZWxwZXIgZmlyc3QuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BDb25maWdIZWxwZXIucGFyc2VDb25maWcodGV4dE9yQnVmZmVyLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaGFzQ29uZmlnKGNvbmZpZ05hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldENvbmZpZyhjb25maWdOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBhZGRDb25maWcoY29uZmlnTmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc0NvbmZpZyhjb25maWdOYW1lKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9wQ29uZmlnRGF0YS5zZXQoY29uZmlnTmFtZSwgdmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmVtb3ZlQ29uZmlnKGNvbmZpZ05hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcENvbmZpZ0RhdGEuZGVsZXRlKGNvbmZpZ05hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJlbW92ZUFsbENvbmZpZ3MoKSB7XG4gICAgICAgICAgICB0aGlzLm1fcENvbmZpZ0RhdGEuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgICAgICBnZXRDb25maWcoY29uZmlnTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wQ29uZmlnRGF0YS5nZXQoY29uZmlnTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICAvLyBOT09QLlxuICAgICAgICB9XG4gICAgICAgIHNodXRkb3duKCkge1xuICAgICAgICAgICAgLy8gTk9PUC5cbiAgICAgICAgfVxuICAgICAgICBsb2FkQ29uZmlnU3VjY2Vzc0NhbGxiYWNrKGNvbmZpZ0Fzc2V0TmFtZSwgY29uZmlnQXNzZXQsIGR1cmF0aW9uLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgbGV0IHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcEluZm8pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2FkIGNvbmZpZyBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubV9wQ29uZmlnSGVscGVyLmxvYWRDb25maWcoY29uZmlnQXNzZXQsIHZfcEluZm8ubG9hZFR5cGUsIHZfcEluZm8udXNlckRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTG9hZCBjb25maWcgZmFpbHVyZSBpbiBoZWxwZXIsIGFzc2V0IG5hbWUgJyR7Y29uZmlnQXNzZXROYW1lfSdgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubV9wTG9hZENvbmZpZ1N1Y2Nlc3NEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZENvbmZpZ1N1Y2Nlc3NEZWxlZ2F0ZS5pdGVyKChjYWxsYmFja0ZuKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGNvbmZpZ0Fzc2V0TmFtZSwgdl9wSW5mby5sb2FkVHlwZSwgZHVyYXRpb24sIHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkQ29uZmlnRmFpbHVyZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkQ29uZmlnRmFpbHVyZURlbGVnYXRlLml0ZXIoKGNhbGxiYWNrRm4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oY29uZmlnQXNzZXROYW1lLCB2X3BJbmZvLmxvYWRUeXBlLCBlLnRvU3RyaW5nKCksIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BDb25maWdIZWxwZXIucmVsZWFzZUNvbmZpZ0Fzc2V0KGNvbmZpZ0Fzc2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsb2FkQ29uZmlnRmFpbHVyZUNhbGxiYWNrKGNvbmZpZ0Fzc2V0TmFtZSwgc3RhdHVzLCBlcnJvck1lc3NhZ2UsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBsZXQgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wSW5mbykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgY29uZmlnIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgYXBwZW5kRXJyb3JNZXNzYWdlID0gYExvYWQgY29uZmlnIGZhaWx1cmUsIGFzc2V0IG5hbWUgJyR7Y29uZmlnQXNzZXROYW1lfScsIHN0YXR1cyAnJHtzdGF0dXN9JywgZXJyb3IgbWVzc2FnZSAnJHtlcnJvck1lc3NhZ2V9Jy5gO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wTG9hZENvbmZpZ0ZhaWx1cmVEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkQ29uZmlnRmFpbHVyZURlbGVnYXRlLml0ZXIoKGNhbGxiYWNrRm4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihjb25maWdBc3NldE5hbWUsIHZfcEluZm8ubG9hZFR5cGUsIGFwcGVuZEVycm9yTWVzc2FnZSwgdl9wSW5mby51c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGFwcGVuZEVycm9yTWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgICAgbG9hZENvbmZpZ1VwZGF0ZUNhbGxiYWNrKGNvbmZpZ0Fzc2V0TmFtZSwgcHJvZ3Jlc3MsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBsZXQgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wSW5mbykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvYWQgY29uZmlnIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BMb2FkQ29uZmlnVXBkYXRlRGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wTG9hZENvbmZpZ1VwZGF0ZURlbGVnYXRlLml0ZXIoKGNhbGxiYWNrRm4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihjb25maWdBc3NldE5hbWUsIHZfcEluZm8ubG9hZFR5cGUsIHByb2dyZXNzLCB2X3BJbmZvLnVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsb2FkQ29uZmlnRGVwZW5kZW5jeUFzc2V0Q2FsbGJhY2soY29uZmlnQXNzZXROYW1lLCBkZXBlbmRlbmN5QXNzZXROYW1lLCBsb2FkZWRDb3VudCwgdG90YWxDb3VudCwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGxldCB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BJbmZvKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTG9hZCBjb25maWcgaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm1fcExvYWRDb25maWdEZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BMb2FkQ29uZmlnRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGUuaXRlcigoY2FsbGJhY2tGbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGNvbmZpZ0Fzc2V0TmFtZSwgZGVwZW5kZW5jeUFzc2V0TmFtZSwgbG9hZGVkQ291bnQsIHRvdGFsQ291bnQsIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSAvLyBjbGFzcyBDb25maWdNYW5hZ2VyXG4gICAgZXhwb3J0cy5Db25maWdNYW5hZ2VyID0gQ29uZmlnTWFuYWdlcjtcbn0pO1xuIiwiKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIiwgXCIuL0Jhc2VcIl0sIGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIGNvbnN0IEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XG4gICAgY2xhc3MgRGF0YU5vZGVNYW5hZ2VyIGV4dGVuZHMgQmFzZV8xLkZyYW1ld29ya01vZHVsZSB7XG4gICAgICAgIHVwZGF0ZShlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgc2h1dGRvd24oKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcbiAgICAgICAgfVxuICAgIH0gLy8gY2xhc3MgRGF0YU5vZGVNYW5hZ2VyXG4gICAgZXhwb3J0cy5EYXRhTm9kZU1hbmFnZXIgPSBEYXRhTm9kZU1hbmFnZXI7XG59KTtcbiIsIihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7XG4gICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwiLi9CYXNlXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICBjb25zdCBCYXNlXzEgPSByZXF1aXJlKFwiLi9CYXNlXCIpO1xuICAgIC8qKlxuICAgICAqIEEgc2ltcGxlIGV2ZW50IG1hbmFnZXIgaW1wbGVtZW50YXRpb24uXG4gICAgICpcbiAgICAgKiBAYXV0aG9yIEplcmVteSBDaGVuIChrZXlob20uY0BnbWFpbC5jb20pXG4gICAgICovXG4gICAgY2xhc3MgRXZlbnRNYW5hZ2VyIGV4dGVuZHMgQmFzZV8xLkZyYW1ld29ya01vZHVsZSB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycyA9IG5ldyBNYXAoKTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgcHJpb3JpdHkoKSB7XG4gICAgICAgICAgICByZXR1cm4gMTAwO1xuICAgICAgICB9XG4gICAgICAgIGdldCBldmVudENvdW50KCkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgY291bnQoZXZlbnRJRCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wRXZlbnRIYW5kbGVycy5oYXMoZXZlbnRJRCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BFdmVudEhhbmRsZXJzLmdldChldmVudElEKS5zaXplO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgY2hlY2soZXZlbnRJZCwgaGFuZGxlcikge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wRXZlbnRIYW5kbGVycy5oYXMoZXZlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlciA/IHRoaXMubV9wRXZlbnRIYW5kbGVycy5nZXQoZXZlbnRJZCkuaGFzKGhhbmRsZXIpIDogdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBvbihldmVudElkLCBoYW5kbGVyKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMubV9wRXZlbnRIYW5kbGVycy5oYXMoZXZlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuc2V0KGV2ZW50SWQsIG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tX3BFdmVudEhhbmRsZXJzLmdldChldmVudElkKS5hZGQoaGFuZGxlcik7XG4gICAgICAgIH1cbiAgICAgICAgb2ZmKGV2ZW50SWQsIGhhbmRsZXIpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcEV2ZW50SGFuZGxlcnMuaGFzKGV2ZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BFdmVudEhhbmRsZXJzLmdldChldmVudElkKS5yZW1vdmUoaGFuZGxlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZW1pdChldmVudElkLCAuLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElkKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycy5nZXQoZXZlbnRJZCkuaXRlcigoY2FsbGJhY2tGbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZShlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgLy8gTk9PUC5cbiAgICAgICAgfVxuICAgICAgICBzaHV0ZG93bigpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcEV2ZW50SGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZm9yRWFjaCgoZWgsIGtleSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBlaC5jbGVhcigpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycy5jbGVhcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSAvLyBjbGFzcyBFdmVudE1hbmFnZXJcbiAgICBleHBvcnRzLkV2ZW50TWFuYWdlciA9IEV2ZW50TWFuYWdlcjtcbn0pO1xuIiwiKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIiwgXCIuL0Jhc2VcIl0sIGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIGNvbnN0IEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XG4gICAgY2xhc3MgRnNtU3RhdGUge1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycyA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fcEV2ZW50SGFuZGxlcnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3NOYW1lO1xuICAgICAgICB9XG4gICAgICAgIG9uSW5pdChmc20pIHtcbiAgICAgICAgICAgIC8vIE5PT1BcbiAgICAgICAgfVxuICAgICAgICBvbkVudGVyKGZzbSkge1xuICAgICAgICAgICAgLy8gTk9PUFxuICAgICAgICB9XG4gICAgICAgIG9uVXBkYXRlKGZzbSwgZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIC8vIE5PT1BcbiAgICAgICAgfVxuICAgICAgICBvbkxlYXZlKGZzbSwgc2h1dGRvd24pIHtcbiAgICAgICAgICAgIC8vIE5PT1BcbiAgICAgICAgfVxuICAgICAgICBjaGFuZ2VTdGF0ZShmc20sIHR5cGUpIHtcbiAgICAgICAgICAgIGlmICghZnNtKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGc20gaXMgaW52YWxpZDogJHtmc219YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmc20uY2hhbmdlU3RhdGUodHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgb24oZXZlbnRJZCwgZXZlbnRIYW5kbGVyKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSBldmVudEhhbmRsZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXZlbnQgaGFuZGxlciBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElkKSkge1xuICAgICAgICAgICAgICAgIGxldCBlaCA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BFdmVudEhhbmRsZXJzLnNldChldmVudElkLCBlaCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50SWQpLmFkZChldmVudEhhbmRsZXIpO1xuICAgICAgICB9XG4gICAgICAgIG9mZihldmVudElkLCBldmVudEhhbmRsZXIpIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IGV2ZW50SGFuZGxlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFdmVudCBoYW5kbGVyIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wRXZlbnRIYW5kbGVycy5oYXMoZXZlbnRJZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50SWQpLnJlbW92ZShldmVudEhhbmRsZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVtaXQoZnNtLCBzZW5kZXIsIGV2ZW50SWQsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BFdmVudEhhbmRsZXJzLmhhcyhldmVudElkKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wRXZlbnRIYW5kbGVycy5nZXQoZXZlbnRJZCkuaXRlcigoY2FsbGJhY2tGbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGZzbSwgc2VuZGVyLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IC8vIGNsYXNzIEZzbVN0YXRlPFQ+XG4gICAgZXhwb3J0cy5Gc21TdGF0ZSA9IEZzbVN0YXRlO1xuICAgIGNsYXNzIEZzbSB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgdGhpcy5tX3BTdGF0ZXMgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX3BEYXRhcyA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fc05hbWUgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX3BTdGF0ZXMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMubV9wRGF0YXMgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGUgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlVGltZSA9IDA7XG4gICAgICAgICAgICB0aGlzLl9pc0Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgc3RhdGljIGNyZWF0ZUZzbShuYW1lLCBvd25lciwgc3RhdGVzKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSBvd25lcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZTTSBvd25lciBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gc3RhdGVzIHx8IHN0YXRlcy5sZW5ndGggPCAxKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRlNNIHN0YXRlcyBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgbGV0IHZfcEZzbSA9IG5ldyBGc20oKTtcbiAgICAgICAgICAgIHZfcEZzbS5tX3NOYW1lID0gbmFtZTtcbiAgICAgICAgICAgIHZfcEZzbS5tX3BPd25lciA9IG93bmVyO1xuICAgICAgICAgICAgZm9yIChjb25zdCB2X3BTdGF0ZSBvZiBzdGF0ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BTdGF0ZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGU00gc3RhdGVzIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICAgICAgaWYgKHZfcEZzbS5oYXNTdGF0ZSh2X3BTdGF0ZS5jb25zdHJ1Y3RvcikpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRlNNICcke25hbWV9JyBzdGF0ZSAnJHt2X3BTdGF0ZX0nIGlzIGFscmVhZHkgZXhpc3QuYCk7XG4gICAgICAgICAgICAgICAgdl9wRnNtLm1fcFN0YXRlcy5wdXNoKHZfcFN0YXRlKTtcbiAgICAgICAgICAgICAgICB2X3BTdGF0ZS5vbkluaXQodl9wRnNtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZfcEZzbS5faXNEZXN0cm95ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiB2X3BGc207XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3NOYW1lO1xuICAgICAgICB9XG4gICAgICAgIGdldCBvd25lcigpIHsgcmV0dXJuIHRoaXMubV9wT3duZXI7IH1cbiAgICAgICAgZ2V0IGZzbVN0YXRlQ291bnQoKSB7IHJldHVybiB0aGlzLm1fcFN0YXRlcy5sZW5ndGg7IH1cbiAgICAgICAgZ2V0IGlzUnVubmluZygpIHsgcmV0dXJuIG51bGwgIT0gdGhpcy5fY3VycmVudFN0YXRlOyB9XG4gICAgICAgIGdldCBpc0Rlc3Ryb3llZCgpIHsgcmV0dXJuIHRoaXMuX2lzRGVzdHJveWVkOyB9XG4gICAgICAgIGdldCBjdXJyZW50U3RhdGUoKSB7IHJldHVybiB0aGlzLl9jdXJyZW50U3RhdGU7IH1cbiAgICAgICAgZ2V0IGN1cnJlbnRTdGF0ZU5hbWUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50U3RhdGUgPyB0aGlzLmN1cnJlbnRTdGF0ZS5uYW1lIDogbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBnZXQgY3VycmVudFN0YXRlVGltZSgpIHsgcmV0dXJuIHRoaXMuX2N1cnJlbnRTdGF0ZVRpbWU7IH1cbiAgICAgICAgc3RhcnQodHlwZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNSdW5uaW5nKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRlNNIGlzIHJ1bm5pbmcsIGNhbiBub3Qgc3RhcnQgYWdhaW4uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHN0YXRlID0gdGhpcy5nZXRTdGF0ZSh0eXBlKTtcbiAgICAgICAgICAgIGlmICghc3RhdGUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZTTSAnJHt0aGlzLm5hbWV9JyBjYW4gbm90IHN0YXJ0IHN0YXRlICcke3R5cGUubmFtZX0nIHdoaWNoIGlzIG5vdCBleGlzdHMuYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGVUaW1lID0gMDtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZSA9IHN0YXRlO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50U3RhdGUub25FbnRlcih0aGlzKTsgLy8gQ2FsbCBpbnRlcm5hbCBmdW5jdGlvbiB3aXRoIGFueSBjYXN0aW5nLlxuICAgICAgICB9XG4gICAgICAgIGhhc1N0YXRlKHR5cGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsICE9IHRoaXMuZ2V0U3RhdGUodHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0U3RhdGUodHlwZSkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm1fcFN0YXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZfcFN0YXRlID0gdGhpcy5tX3BTdGF0ZXNbaV07XG4gICAgICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wU3RhdGUpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGlmICh2X3BTdGF0ZSBpbnN0YW5jZW9mIHR5cGUpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2X3BTdGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGdldEFsbFN0YXRlcygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFN0YXRlcztcbiAgICAgICAgfVxuICAgICAgICBjaGFuZ2VTdGF0ZSh0eXBlKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2N1cnJlbnRTdGF0ZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0N1cnJlbnQgc3RhdGUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGxldCB2X3BTdGF0ZSA9IHRoaXMuZ2V0U3RhdGUodHlwZSk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BTdGF0ZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZzbSBjYW4gbm90IGNoYW5nZSBzdGF0ZSwgc3RhdGUgaXMgbm90IGV4aXN0OiAke3R5cGV9YCk7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGUub25MZWF2ZSh0aGlzLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGVUaW1lID0gMDtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZSA9IHZfcFN0YXRlO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlLm9uRW50ZXIodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0RGF0YShuYW1lKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BEYXRhcy5oYXMobmFtZSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wRGF0YXMuZ2V0KG5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgc2V0RGF0YShuYW1lLCBkYXRhKSB7XG4gICAgICAgICAgICBpZiAoIW5hbWUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXRhIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHRoaXMubV9wRGF0YXMuc2V0KG5hbWUsIGRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHJlbW92ZURhdGEobmFtZSkge1xuICAgICAgICAgICAgaWYgKCFuYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRGF0YSBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBsZXQgdl9iUmV0ID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAobmFtZSBpbiB0aGlzLm1fcERhdGFzKSB7XG4gICAgICAgICAgICAgICAgdl9iUmV0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcERhdGFzLmRlbGV0ZShuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2X2JSZXQ7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLl9jdXJyZW50U3RhdGUpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlVGltZSArPSBlbGFwc2VkO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlLm9uVXBkYXRlKHRoaXMsIGVsYXBzZWQsIHJlYWxFbGFwc2VkKTtcbiAgICAgICAgfVxuICAgICAgICBzaHV0ZG93bigpIHtcbiAgICAgICAgICAgIC8vIEZJWE1FOiBGaWd1ZSBvdXQgYSB3YXkgdG8gcmVsZWFzZSB0aGlzLlxuICAgICAgICB9XG4gICAgfSAvLyBjbGFzcyBGc208VD5cbiAgICBleHBvcnRzLkZzbSA9IEZzbTtcbiAgICBjbGFzcyBGc21NYW5hZ2VyIGV4dGVuZHMgQmFzZV8xLkZyYW1ld29ya01vZHVsZSB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHRoaXMubV9wRnNtcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgcHJpb3JpdHkoKSB7XG4gICAgICAgICAgICByZXR1cm4gNjA7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IGNvdW50KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wRnNtcy5zaXplO1xuICAgICAgICB9XG4gICAgICAgIGhhc0ZzbShuYW1lT3JUeXBlKSB7XG4gICAgICAgICAgICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIG5hbWVPclR5cGUgJiYgbmFtZU9yVHlwZS5wcm90b3R5cGUpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGZzbSBvZiB0aGlzLm1fcEZzbXMudmFsdWVzKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG51bGwgIT0gZnNtICYmIGZzbSBpbnN0YW5jZW9mIG5hbWVPclR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5hbWVPclR5cGUudG9TdHJpbmcoKSBpbiB0aGlzLm1fcEZzbXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0RnNtKG5hbWVPclR5cGUpIHtcbiAgICAgICAgICAgIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgbmFtZU9yVHlwZSAmJiBuYW1lT3JUeXBlLnByb3RvdHlwZSkge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZnNtIG9mIHRoaXMubV9wRnNtcy52YWx1ZXMoKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobnVsbCAhPSBmc20gJiYgZnNtIGluc3RhbmNlb2YgbmFtZU9yVHlwZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmc207XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wRnNtcy5nZXQobmFtZU9yVHlwZS50b1N0cmluZygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGdldEFsbEZzbXMoKSB7XG4gICAgICAgICAgICBjb25zdCB2X3BSZXQgPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZnNtIG9mIHRoaXMubV9wRnNtcy52YWx1ZXMoKSkge1xuICAgICAgICAgICAgICAgIHZfcFJldC5wdXNoKGZzbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdl9wUmV0O1xuICAgICAgICB9XG4gICAgICAgIGNyZWF0ZUZzbShuYW1lLCBvd25lciwgc3RhdGVzKSB7XG4gICAgICAgICAgICBuYW1lID0gbmFtZSB8fCAnJztcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc0ZzbShuYW1lKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQWxyZWFkeSBleGlzdCBGU00gJyR7bmFtZX0nLmApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZnNtID0gRnNtLmNyZWF0ZUZzbShuYW1lLCBvd25lciwgc3RhdGVzKTtcbiAgICAgICAgICAgIHRoaXMubV9wRnNtcy5zZXQobmFtZSwgZnNtKTtcbiAgICAgICAgICAgIHJldHVybiBmc207XG4gICAgICAgIH1cbiAgICAgICAgZGVzdHJveUZzbShhcmcpIHtcbiAgICAgICAgICAgIGxldCB2X3NOYW1lID0gbnVsbDtcbiAgICAgICAgICAgIGxldCB2X3BUeXBlID0gbnVsbDtcbiAgICAgICAgICAgIGxldCB2X3BJbnN0YW5jZSA9IG51bGw7XG4gICAgICAgICAgICBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiBhcmcpIHtcbiAgICAgICAgICAgICAgICB2X3NOYW1lID0gYXJnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGFyZykge1xuICAgICAgICAgICAgICAgIHZfcFR5cGUgPSBhcmc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICgnb2JqZWN0JyA9PT0gdHlwZW9mIGFyZyAmJiBhcmcuY29uc3RydWN0b3IpIHtcbiAgICAgICAgICAgICAgICB2X3BJbnN0YW5jZSA9IGFyZztcbiAgICAgICAgICAgICAgICB2X3BUeXBlID0gYXJnLmNvbnN0cnVjdG9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0aGlzLmhhc0ZzbSh2X3NOYW1lIHx8IHZfcFR5cGUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHZfcEluc3RhbmNlICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZih2X3BJbnN0YW5jZSkuaGFzT3duUHJvcGVydHkoJ3NodXRkb3duJykpIHtcbiAgICAgICAgICAgICAgICB2X3BJbnN0YW5jZS5zaHV0ZG93bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG51bGwgIT0gdl9wSW5zdGFuY2UpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiB0aGlzLm1fcEZzbXMua2V5cygpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZfcEZzbSA9IHRoaXMubV9wRnNtcy5nZXQoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEZzbSA9PSB2X3BJbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BGc21zLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChudWxsICE9IHZfc05hbWUpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiB0aGlzLm1fcEZzbXMua2V5cygpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZfcEZzbSA9IHRoaXMubV9wRnNtcy5nZXQoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEZzbS5uYW1lID09IHZfc05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubV9wRnNtcy5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobnVsbCAhPSB2X3BUeXBlKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgdGhpcy5tX3BGc21zLmtleXMoKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2X3BGc20gPSB0aGlzLm1fcEZzbXMuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2X3BGc20gaW5zdGFuY2VvZiB2X3BUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1fcEZzbXMuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZShlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gdGhpcy5tX3BGc21zKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgdl9Gc20gPSB0aGlzLm1fcEZzbXMuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKCF2X0ZzbSAmJiB2X0ZzbS5pc0Rlc3Ryb3llZClcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgdl9Gc20udXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzaHV0ZG93bigpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHRoaXMubV9wRnNtcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZfRnNtID0gdGhpcy5tX3BGc21zLmdldChrZXkpO1xuICAgICAgICAgICAgICAgIGlmICghdl9Gc20gJiYgdl9Gc20uaXNEZXN0cm95ZWQpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIHZfRnNtLnNodXRkb3duKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BGc21zLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSAvLyBjbGFzcyBGc21NYW5hZ2VyXG4gICAgZXhwb3J0cy5Gc21NYW5hZ2VyID0gRnNtTWFuYWdlcjtcbn0pO1xuIiwiKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIiwgXCIuL0Jhc2VcIiwgXCIuL0ZzbVwiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgY29uc3QgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICBjb25zdCBGc21fMSA9IHJlcXVpcmUoXCIuL0ZzbVwiKTtcbiAgICBjbGFzcyBQcm9jZWR1cmVCYXNlIGV4dGVuZHMgRnNtXzEuRnNtU3RhdGUge1xuICAgICAgICAvLyBOT09QLlxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgIH1cbiAgICB9IC8vIGNsYXNzIFByb2NlZHVyZUJhc2VcbiAgICBleHBvcnRzLlByb2NlZHVyZUJhc2UgPSBQcm9jZWR1cmVCYXNlO1xuICAgIGNsYXNzIFByb2NlZHVyZU1hbmFnZXIgZXh0ZW5kcyBCYXNlXzEuRnJhbWV3b3JrTW9kdWxlIHtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICAgICAgdGhpcy5tX3BGc21NYW5hZ2VyID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9wUHJvY2VkdXJlRnNtID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBnZXQgcHJpb3JpdHkoKSB7IHJldHVybiAtMTA7IH1cbiAgICAgICAgZ2V0IGN1cnJlbnRQcm9jZWR1cmUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tX3BQcm9jZWR1cmVGc20uY3VycmVudFN0YXRlO1xuICAgICAgICB9XG4gICAgICAgIGluaXRpYWxpemUoZnNtTWFuYWdlciwgcHJvY2VkdXJlcykge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gZnNtTWFuYWdlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZTTSBtYW5hZ2VyIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB0aGlzLm1fcEZzbU1hbmFnZXIgPSBmc21NYW5hZ2VyO1xuICAgICAgICAgICAgdGhpcy5tX3BQcm9jZWR1cmVGc20gPSBmc21NYW5hZ2VyLmNyZWF0ZUZzbShudWxsLCB0aGlzLCBwcm9jZWR1cmVzKTtcbiAgICAgICAgfVxuICAgICAgICBzdGFydFByb2NlZHVyZShvYmopIHtcbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMubV9wUHJvY2VkdXJlRnNtKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignWW91IG11c3QgaW5pdGlhbGl6ZSBwcm9jZWR1cmUgZmlyc3QuJyk7XG4gICAgICAgICAgICB0aGlzLm1fcFByb2NlZHVyZUZzbS5zdGFydChvYmouY29uc3RydWN0b3IpO1xuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZShlbGFwc2VkLCByZWFsRWxhcHNlZCkge1xuICAgICAgICAgICAgLy8gTm9vcC5cbiAgICAgICAgfVxuICAgICAgICBzaHV0ZG93bigpIHtcbiAgICAgICAgICAgIGlmIChudWxsICE9IHRoaXMubV9wRnNtTWFuYWdlcikge1xuICAgICAgICAgICAgICAgIGlmIChudWxsICE9IHRoaXMubV9wUHJvY2VkdXJlRnNtKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubV9wRnNtTWFuYWdlci5kZXN0cm95RnNtKHRoaXMubV9wUHJvY2VkdXJlRnNtKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tX3BQcm9jZWR1cmVGc20gPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLm1fcEZzbU1hbmFnZXIgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGhhc1Byb2NlZHVyZSh0eXBlKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLm1fcFByb2NlZHVyZUZzbSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBtdXN0IGluaXRpYWxpemUgcHJvY2VkdXJlIGZpcnN0LicpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUHJvY2VkdXJlRnNtLmhhc1N0YXRlKHR5cGUpO1xuICAgICAgICB9XG4gICAgICAgIGdldFByb2NlZHVyZSh0eXBlKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLm1fcFByb2NlZHVyZUZzbSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBtdXN0IGluaXRpYWxpemUgcHJvY2VkdXJlIGZpcnN0LicpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUHJvY2VkdXJlRnNtLmdldFN0YXRlKHR5cGUpO1xuICAgICAgICB9XG4gICAgfSAvLyBjbGFzcyBQcm9jZWR1cmVNYW5hZ2VyXG4gICAgZXhwb3J0cy5Qcm9jZWR1cmVNYW5hZ2VyID0gUHJvY2VkdXJlTWFuYWdlcjtcbn0pO1xuIiwiKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIiwgXCIuL0Jhc2VcIl0sIGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIGNvbnN0IEJhc2VfMSA9IHJlcXVpcmUoXCIuL0Jhc2VcIik7XG4gICAgdmFyIFJlc291cmNlTW9kZTtcbiAgICAoZnVuY3Rpb24gKFJlc291cmNlTW9kZSkge1xuICAgICAgICBSZXNvdXJjZU1vZGVbUmVzb3VyY2VNb2RlW1wiVW5zcGVjaWZpZWRcIl0gPSAwXSA9IFwiVW5zcGVjaWZpZWRcIjtcbiAgICAgICAgUmVzb3VyY2VNb2RlW1Jlc291cmNlTW9kZVtcIlBhY2thZ2VcIl0gPSAxXSA9IFwiUGFja2FnZVwiO1xuICAgICAgICBSZXNvdXJjZU1vZGVbUmVzb3VyY2VNb2RlW1wiVXBkYXRhYmxlXCJdID0gMl0gPSBcIlVwZGF0YWJsZVwiO1xuICAgIH0pKFJlc291cmNlTW9kZSA9IGV4cG9ydHMuUmVzb3VyY2VNb2RlIHx8IChleHBvcnRzLlJlc291cmNlTW9kZSA9IHt9KSk7IC8vIGVudW0gUmVzb3VyY2VNb2RlXG4gICAgdmFyIExvYWRSZXNvdXJjZVN0YXR1cztcbiAgICAoZnVuY3Rpb24gKExvYWRSZXNvdXJjZVN0YXR1cykge1xuICAgICAgICBMb2FkUmVzb3VyY2VTdGF0dXNbTG9hZFJlc291cmNlU3RhdHVzW1wiU3VjY2Vzc1wiXSA9IDBdID0gXCJTdWNjZXNzXCI7XG4gICAgICAgIExvYWRSZXNvdXJjZVN0YXR1c1tMb2FkUmVzb3VyY2VTdGF0dXNbXCJOb3RSZWFkeVwiXSA9IDFdID0gXCJOb3RSZWFkeVwiO1xuICAgICAgICBMb2FkUmVzb3VyY2VTdGF0dXNbTG9hZFJlc291cmNlU3RhdHVzW1wiTm90RXhpc3RcIl0gPSAyXSA9IFwiTm90RXhpc3RcIjtcbiAgICAgICAgTG9hZFJlc291cmNlU3RhdHVzW0xvYWRSZXNvdXJjZVN0YXR1c1tcIkRlcGVuZGVuY3lFcnJvclwiXSA9IDNdID0gXCJEZXBlbmRlbmN5RXJyb3JcIjtcbiAgICAgICAgTG9hZFJlc291cmNlU3RhdHVzW0xvYWRSZXNvdXJjZVN0YXR1c1tcIlR5cGVFcnJvclwiXSA9IDRdID0gXCJUeXBlRXJyb3JcIjtcbiAgICAgICAgTG9hZFJlc291cmNlU3RhdHVzW0xvYWRSZXNvdXJjZVN0YXR1c1tcIkFzc2V0RXJyb3JcIl0gPSA1XSA9IFwiQXNzZXRFcnJvclwiO1xuICAgIH0pKExvYWRSZXNvdXJjZVN0YXR1cyA9IGV4cG9ydHMuTG9hZFJlc291cmNlU3RhdHVzIHx8IChleHBvcnRzLkxvYWRSZXNvdXJjZVN0YXR1cyA9IHt9KSk7IC8vIGVudW0gTG9hZFJlc291cmNlU3RhdHVzXG4gICAgLyoqXG4gICAgICogQSByZXNvdXJjZSBtYW5hZ2VyIG1vZHVsYXIgYmFzZSBvbiBgRnJhbWV3b3JrTW9kdWxlYC5cbiAgICAgKlxuICAgICAqIFRPRE86IEEgZ2VuZXJhbCByZXNvdXJjZSBtYW5hZ2VtZW50IHdhcyBub3QgeWV0IGltcGxlbWVudGVkLlxuICAgICAqXG4gICAgICogQGF1dGhvciBKZXJlbXkgQ2hlbiAoa2V5aG9tLmNAZ21haWwuY29tKVxuICAgICAqL1xuICAgIGNsYXNzIFJlc291cmNlTWFuYWdlciBleHRlbmRzIEJhc2VfMS5GcmFtZXdvcmtNb2R1bGUge1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlR3JvdXAgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGdldCByZXNvdXJjZUdyb3VwKCkgeyByZXR1cm4gdGhpcy5tX3BSZXNvdXJjZUdyb3VwOyB9XG4gICAgICAgIGdldCByZXNvdXJjZUxvYWRlcigpIHsgcmV0dXJuIHRoaXMubV9wUmVzb3VyY2VMb2FkZXI7IH1cbiAgICAgICAgc2V0IHJlc291cmNlTG9hZGVyKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2YWx1ZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZXR0aW5nIHJlc291cmNlIGxvYWRlciBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VMb2FkZXIgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgcHJpb3JpdHkoKSB7XG4gICAgICAgICAgICByZXR1cm4gNzA7XG4gICAgICAgIH1cbiAgICAgICAgaGFzQXNzZXQoYXNzZXROYW1lKSB7XG4gICAgICAgICAgICBpZiAoIWFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9wUmVzb3VyY2VMb2FkZXIuaGFzQXNzZXQoYXNzZXROYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBsb2FkQXNzZXQoYXNzZXROYW1lLCBhc3NldFR5cGUsIHByaW9yaXR5LCBsb2FkQXNzZXRDYWxsYmFja3MsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoIWFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCFsb2FkQXNzZXRDYWxsYmFja3MpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTG9hZCBhc3NldCBjYWxsYmFja3MgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTG9hZGVyLmxvYWRBc3NldChhc3NldE5hbWUsIGFzc2V0VHlwZSwgcHJpb3JpdHksIGxvYWRBc3NldENhbGxiYWNrcywgdXNlckRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHVubG9hZEFzc2V0KGFzc2V0KSB7XG4gICAgICAgICAgICBpZiAoIWFzc2V0KVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzc2V0IGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5tX3BSZXNvdXJjZUxvYWRlcilcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTG9hZGVyLnVubG9hZEFzc2V0KGFzc2V0KTtcbiAgICAgICAgfVxuICAgICAgICBsb2FkU2NlbmUoc2NlbmVBc3NldE5hbWUsIHByaW9yaXR5LCBsb2FkU2NlbmVDYWxsYmFja3MsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoIXNjZW5lQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjZW5lIGFzc2V0IG5hbWUgaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAoIWxvYWRTY2VuZUNhbGxiYWNrcylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2FkIHNjZW5lIGFzc2V0IGNhbGxiYWNrcyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VMb2FkZXIubG9hZFNjZW5lKHNjZW5lQXNzZXROYW1lLCBwcmlvcml0eSwgbG9hZFNjZW5lQ2FsbGJhY2tzLCB1c2VyRGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgdW5sb2FkU2NlbmUoc2NlbmVBc3NldE5hbWUsIHVubG9hZFNjZW5lQ2FsbGJhY2tzLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKCFzY2VuZUFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBhc3NldCBuYW1lIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKCF1bmxvYWRTY2VuZUNhbGxiYWNrcylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmxvYWQgc2NlbmUgY2FsbGJhY2tzIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZUxvYWRlci51bmxvYWRTY2VuZShzY2VuZUFzc2V0TmFtZSwgdW5sb2FkU2NlbmVDYWxsYmFja3MsIHVzZXJEYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBoYXNSZXNvdXJjZUdyb3VwKHJlc291cmNlR3JvdXBOYW1lKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcFJlc291cmNlTG9hZGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZUxvYWRlci51cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNodXRkb3duKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wUmVzb3VyY2VMb2FkZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTG9hZGVyLnNodXRkb3duKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IC8vIGNsYXNzIFJlc291cmNlTWFuYWdlclxuICAgIGV4cG9ydHMuUmVzb3VyY2VNYW5hZ2VyID0gUmVzb3VyY2VNYW5hZ2VyO1xufSk7XG4iLCIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIHYgPSBmYWN0b3J5KHJlcXVpcmUsIGV4cG9ydHMpO1xuICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSBtb2R1bGUuZXhwb3J0cyA9IHY7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiLCBcIi4vQmFzZVwiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgY29uc3QgQmFzZV8xID0gcmVxdWlyZShcIi4vQmFzZVwiKTtcbiAgICBjbGFzcyBVSU1hbmFnZXIgZXh0ZW5kcyBCYXNlXzEuRnJhbWV3b3JrTW9kdWxlIHtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICAgICAgdGhpcy5tX3JVSUdyb3VwcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMubV9pU2VyaWFsSWQgPSAwO1xuICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1IZWxwZXIgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX2JJc1NodXRkb3duID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZCA9IG5ldyBTZXQoKTtcbiAgICAgICAgICAgIHRoaXMubV9wSW5zdGFuY2VQb29sID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgdGhpcy5tX3BSZWN5Y2xlUXVldWUgPSBbXTtcbiAgICAgICAgICAgIHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubV9wTG9hZEFzc2V0Q2FsbGJhY2tzID0ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRoaXMubG9hZFVJRm9ybVN1Y2Nlc3NDYWxsYmFjay5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgIGZhaWx1cmU6IHRoaXMubG9hZFVJRm9ybUZhaWx1cmVDYWxsYmFjay5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgIHVwZGF0ZTogdGhpcy5sb2FkVUlGb3JtVXBkYXRlQ2FsbGJhY2suYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBkZXBlbmRlbmN5OiB0aGlzLmxvYWRVSUZvcm1EZXBlbmRlbmN5QXNzZXRDYWxsYmFjay5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMubV9wT3BlblVJRm9ybVN1Y2Nlc3NEZWxlZ2F0ZSA9IG5ldyBCYXNlXzEuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICB0aGlzLm1fcE9wZW5VSUZvcm1GYWlsdXJlRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgdGhpcy5tX3BPcGVuVUlGb3JtVXBkYXRlRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgdGhpcy5tX3BPcGVuVUlGb3JtRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgdGhpcy5tX3BDbG9zZVVJRm9ybUNvbXBsZXRlRGVsZWdhdGUgPSBuZXcgQmFzZV8xLkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgdGhpcy5tX2ZJbnN0YW5jZUF1dG9SZWxlYXNlSW50ZXJ2YWwgPSAwO1xuICAgICAgICAgICAgdGhpcy5tX3VJbnN0YW5jZUNhcGFjaXR5ID0gMDtcbiAgICAgICAgICAgIHRoaXMubV9mSW5zdGFuY2VFeHBpcmVUaW1lID0gMDtcbiAgICAgICAgICAgIHRoaXMubV9pSW5zdGFuY2VQcmlvcml0eSA9IDA7XG4gICAgICAgICAgICAvLyBwcml2YXRlIGZpcmVPcGVuVUlGb3JtQ29tcGxldGUoZXJyb3I6IEVycm9yLCB1aUZvcm1Bc3NldE5hbWU6IHN0cmluZywgdWlGb3JtQXNzZXQ6IG9iamVjdCwgZHVyYXRpb246IG51bWJlciwgaW5mbzogT3BlblVJRm9ybUluZm8pOiB2b2lkIHtcbiAgICAgICAgICAgIC8vIHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkLmRlbGV0ZShpbmZvLnNlcmlhbElkKTtcbiAgICAgICAgICAgIC8vIGlmICh0aGlzLm1fclVJRm9ybXNUb1JlbGVhc2VPbkxvYWQuaGFzKGluZm8uc2VyaWFsSWQpKSB7XG4gICAgICAgICAgICAvLyB0aGlzLm1fclVJRm9ybXNUb1JlbGVhc2VPbkxvYWQuZGVsZXRlKGluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgLy8gaWYgKCFlcnJvcilcbiAgICAgICAgICAgIC8vIHRoaXMubV9wVUlGb3JtSGVscGVyLnJlbGVhc2VVSUZvcm0odWlGb3JtQXNzZXQgYXMgb2JqZWN0LCBudWxsKTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIC8vIGxldCB1aUZvcm06IElVSUZvcm0gPSBudWxsO1xuICAgICAgICAgICAgLy8gaWYgKCFlcnJvcikge1xuICAgICAgICAgICAgLy8gbGV0IHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0OiBVSUZvcm1JbnN0YW5jZU9iamVjdCA9IFVJRm9ybUluc3RhbmNlT2JqZWN0LmNyZWF0ZSh1aUZvcm1Bc3NldE5hbWUsIHVpRm9ybUFzc2V0LCB0aGlzLm1fcFVJRm9ybUhlbHBlci5pbnN0YW50aWF0ZVVJRm9ybSh1aUZvcm1Bc3NldCBhcyBvYmplY3QpLCB0aGlzLm1fcFVJRm9ybUhlbHBlcik7XG4gICAgICAgICAgICAvLyAvLyBSZWdpc3RlciB0byBwb29sIGFuZCBtYXJrIHNwYXduIGZsYWcuXG4gICAgICAgICAgICAvLyBpZiAoIXRoaXMubV9wSW5zdGFuY2VQb29sLmhhcyh1aUZvcm1Bc3NldE5hbWUpKSB7XG4gICAgICAgICAgICAvLyB0aGlzLm1fcEluc3RhbmNlUG9vbC5zZXQodWlGb3JtQXNzZXROYW1lLCBbXSk7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvLyBsZXQgdl9wSW5zdGFuY2VPYmplY3RzOiBVSUZvcm1JbnN0YW5jZU9iamVjdFtdID0gdGhpcy5tX3BJbnN0YW5jZVBvb2wuZ2V0KHVpRm9ybUFzc2V0TmFtZSk7XG4gICAgICAgICAgICAvLyBpZiAodl9wSW5zdGFuY2VPYmplY3RzLmxlbmd0aCA8IHRoaXMubV91SW5zdGFuY2VDYXBhY2l0eSkge1xuICAgICAgICAgICAgLy8gdl9wVWlGb3JtSW5zdGFuY2VPYmplY3Quc3Bhd24gPSB0cnVlO1xuICAgICAgICAgICAgLy8gdl9wSW5zdGFuY2VPYmplY3RzLnB1c2godl9wVWlGb3JtSW5zdGFuY2VPYmplY3QpO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gdGhpcy5vcGVuVUlGb3JtSW50ZXJuYWwoaW5mby5zZXJpYWxJZCwgdWlGb3JtQXNzZXROYW1lLCBpbmZvLnVpR3JvdXAgYXMgVUlHcm91cCwgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QudGFyZ2V0LCBpbmZvLnBhdXNlQ292ZXJlZFVJRm9ybSwgdHJ1ZSwgZHVyYXRpb24sIGluZm8udXNlckRhdGEpO1xuICAgICAgICAgICAgLy8gfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGxldCBldmVudEFyZ3M6IE9wZW5VSUZvcm1GYWlsdXJlRXZlbnRBcmdzID0ge1xuICAgICAgICAgICAgLy8gZXJyb3JNZXNzYWdlOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICAgICAgLy8gc2VyaWFsSWQ6IGluZm8uc2VyaWFsSWQsXG4gICAgICAgICAgICAvLyBwYXVzZUNvdmVyZWRVSUZvcm06IGluZm8ucGF1c2VDb3ZlcmVkVUlGb3JtLFxuICAgICAgICAgICAgLy8gdWlHcm91cE5hbWU6IGluZm8udWlHcm91cC5uYW1lLFxuICAgICAgICAgICAgLy8gdWlGb3JtQXNzZXROYW1lOiB1aUZvcm1Bc3NldE5hbWUsXG4gICAgICAgICAgICAvLyB1c2VyRGF0YTogaW5mby51c2VyRGF0YVxuICAgICAgICAgICAgLy8gfTtcbiAgICAgICAgICAgIC8vIHRoaXMubV9wT3BlblVJRm9ybUZhaWx1cmVEZWxlZ2F0ZS5pdGVyKChjYWxsYmFja0ZuOiBPcGVuVUlGb3JtRmFpbHVyZUV2ZW50SGFuZGxlcikgPT4ge1xuICAgICAgICAgICAgLy8gY2FsbGJhY2tGbihldmVudEFyZ3MpO1xuICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvLyBwcml2YXRlIGZpcmVPcGVuVUlGb3JtUHJvZ3Jlc3ModWlGb3JtQXNzZXROYW1lOiBzdHJpbmcsIHByb2dyZXNzOiBudW1iZXIsIGluZm86IE9wZW5VSUZvcm1JbmZvKTogdm9pZCB7XG4gICAgICAgICAgICAvLyBsZXQgZXZlbnRBcmdzOiBPcGVuVUlGb3JtVXBkYXRlRXZlbnRBcmdzID0ge1xuICAgICAgICAgICAgLy8gc2VyaWFsSWQ6IGluZm8uc2VyaWFsSWQsXG4gICAgICAgICAgICAvLyBwYXVzZUNvdmVyZWRVSUZvcm06IGluZm8ucGF1c2VDb3ZlcmVkVUlGb3JtLFxuICAgICAgICAgICAgLy8gcHJvZ3Jlc3M6IHByb2dyZXNzLFxuICAgICAgICAgICAgLy8gdWlGb3JtQXNzZXROYW1lOiB1aUZvcm1Bc3NldE5hbWUsXG4gICAgICAgICAgICAvLyB1aUdyb3VwTmFtZTogaW5mby51aUdyb3VwLm5hbWUsXG4gICAgICAgICAgICAvLyB1c2VyRGF0YTogaW5mby51c2VyRGF0YVxuICAgICAgICAgICAgLy8gfTtcbiAgICAgICAgICAgIC8vIHRoaXMubV9wT3BlblVJRm9ybVVwZGF0ZURlbGVnYXRlLml0ZXIoKGNhbGxiYWNrRm46IE9wZW5VSUZvcm1VcGRhdGVFdmVudEhhbmRsZXIpID0+IHtcbiAgICAgICAgICAgIC8vIGNhbGxiYWNrRm4oZXZlbnRBcmdzKTtcbiAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICB9XG4gICAgICAgIGdldCB1aUZvcm1IZWxwZXIoKSB7IHJldHVybiB0aGlzLm1fcFVJRm9ybUhlbHBlcjsgfVxuICAgICAgICBzZXQgdWlGb3JtSGVscGVyKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIXZhbHVlKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBoZWxwZXIgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIHRoaXMubV9wVUlGb3JtSGVscGVyID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IHJlc291cmNlTWFuYWdlcigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFJlc291cmNlTWFuYWdlcjtcbiAgICAgICAgfVxuICAgICAgICBzZXQgcmVzb3VyY2VNYW5hZ2VyKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2YWx1ZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSZXNvdXJjZSBtYW5hZ2VyIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgdGhpcy5tX3BSZXNvdXJjZU1hbmFnZXIgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgdWlHcm91cENvdW50KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9yVUlHcm91cHMuc2l6ZTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgb3BlblVJRm9ybVN1Y2Nlc3MoKSB7IHJldHVybiB0aGlzLm1fcE9wZW5VSUZvcm1TdWNjZXNzRGVsZWdhdGU7IH1cbiAgICAgICAgZ2V0IG9wZW5VSUZvcm1GYWlsdXJlKCkgeyByZXR1cm4gdGhpcy5tX3BPcGVuVUlGb3JtRmFpbHVyZURlbGVnYXRlOyB9XG4gICAgICAgIGdldCBvcGVuVUlGb3JtVXBkYXRlKCkgeyByZXR1cm4gdGhpcy5tX3BPcGVuVUlGb3JtVXBkYXRlRGVsZWdhdGU7IH1cbiAgICAgICAgZ2V0IG9wZW5VSUZvcm1EZXBlbmRlbmN5QXNzZXQoKSB7IHJldHVybiB0aGlzLm1fcE9wZW5VSUZvcm1EZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZTsgfVxuICAgICAgICBnZXQgY2xvc2VVSUZvcm1Db21wbGV0ZSgpIHsgcmV0dXJuIHRoaXMubV9wQ2xvc2VVSUZvcm1Db21wbGV0ZURlbGVnYXRlOyB9XG4gICAgICAgIGdldCBpbnN0YW5jZUF1dG9SZWxlYXNlSW50ZXJ2YWwoKSB7IHJldHVybiB0aGlzLm1fZkluc3RhbmNlQXV0b1JlbGVhc2VJbnRlcnZhbDsgfVxuICAgICAgICBzZXQgaW5zdGFuY2VBdXRvUmVsZWFzZUludGVydmFsKHZhbHVlKSB7IHRoaXMubV9mSW5zdGFuY2VBdXRvUmVsZWFzZUludGVydmFsID0gdmFsdWU7IH1cbiAgICAgICAgZ2V0IGluc3RhbmNlQ2FwYWNpdHkoKSB7IHJldHVybiB0aGlzLm1fdUluc3RhbmNlQ2FwYWNpdHk7IH1cbiAgICAgICAgc2V0IGluc3RhbmNlQ2FwYWNpdHkodmFsdWUpIHsgdGhpcy5tX3VJbnN0YW5jZUNhcGFjaXR5ID0gdmFsdWU7IH1cbiAgICAgICAgZ2V0IGluc3RhbmNlRXhwaXJlVGltZSgpIHsgcmV0dXJuIHRoaXMubV9mSW5zdGFuY2VFeHBpcmVUaW1lOyB9XG4gICAgICAgIHNldCBpbnN0YW5jZUV4cGlyZVRpbWUodmFsdWUpIHsgdGhpcy5tX2ZJbnN0YW5jZUV4cGlyZVRpbWUgPSB2YWx1ZTsgfVxuICAgICAgICBnZXQgaW5zdGFuY2VQcmlvcml0eSgpIHsgcmV0dXJuIHRoaXMubV9pSW5zdGFuY2VQcmlvcml0eTsgfVxuICAgICAgICBzZXQgaW5zdGFuY2VQcmlvcml0eSh2YWx1ZSkgeyB0aGlzLm1faUluc3RhbmNlUHJpb3JpdHkgPSB2YWx1ZTsgfVxuICAgICAgICB1cGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdWlGb3JtIG9mIHRoaXMubV9wUmVjeWNsZVF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubV9wSW5zdGFuY2VQb29sLmhhcyh1aUZvcm0udWlGb3JtQXNzZXROYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2X3BJbnN0YW5jZU9iamVjdHMgPSB0aGlzLm1fcEluc3RhbmNlUG9vbC5nZXQodWlGb3JtLnVpRm9ybUFzc2V0TmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2X3BJbnN0YW5jZU9iamVjdHMgJiYgdl9wSW5zdGFuY2VPYmplY3RzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3Qgb2Ygdl9wSW5zdGFuY2VPYmplY3RzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdWlGb3JtLm9uUmVjeWNsZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC5zcGF3biA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm1fcFJlY3ljbGVRdWV1ZS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdGhpcy5tX3BSZWN5Y2xlUXVldWUuc3BsaWNlKDAsIHRoaXMubV9wUmVjeWNsZVF1ZXVlLmxlbmd0aCk7XG4gICAgICAgICAgICAvLyBUT0RPOiBhdXRvIHJlbGVhc2UgcHJvY2Vzc2luZyBoZXJlLlxuICAgICAgICAgICAgdGhpcy5tX3JVSUdyb3Vwcy5mb3JFYWNoKCh1aUdyb3VwLCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2X3BVaUdyb3VwID0gdWlHcm91cDtcbiAgICAgICAgICAgICAgICB2X3BVaUdyb3VwLnVwZGF0ZShlbGFwc2VkLCByZWFsRWxhcHNlZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBzaHV0ZG93bigpIHtcbiAgICAgICAgICAgIHRoaXMubV9iSXNTaHV0ZG93biA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmNsb3NlQWxsTG9hZGVkVUlGb3JtcygpO1xuICAgICAgICAgICAgdGhpcy5tX3JVSUdyb3VwcyA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNUb1JlbGVhc2VPbkxvYWQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX3BSZWN5Y2xlUXVldWUuc3BsaWNlKDAsIHRoaXMubV9wUmVjeWNsZVF1ZXVlLmxlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLm1fcFJlY3ljbGVRdWV1ZSA9IG51bGw7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BJbnN0YW5jZVBvb2wpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEluc3RhbmNlUG9vbC5mb3JFYWNoKChpbnN0YW5jZU9iamVjdHMsIGtleSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2VPYmplY3RzICYmIGluc3RhbmNlT2JqZWN0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0IG9mIGluc3RhbmNlT2JqZWN0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LnJlbGVhc2UodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QuY2xlYXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC50YXJnZXQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VPYmplY3RzLnNwbGljZSgwLCBpbnN0YW5jZU9iamVjdHMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubV9wSW5zdGFuY2VQb29sLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3BJbnN0YW5jZVBvb2wuY2xlYXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBvcGVuVUlGb3JtKHVpRm9ybUFzc2V0TmFtZSwgdWlHcm91cE5hbWUsIHByaW9yaXR5LCBwYXVzZUNvdmVyZWRVSUZvcm0sIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICAvLyBjYy5sb2coYFtVSU1hbmFnZXJdIFJlcWV1c3QgT3BlbiBVSUZvcm0gYXNzZXQgJyR7dWlGb3JtQXNzZXROYW1lfScgd2l0aCBncm91cCAnJHt1aUdyb3VwTmFtZX0nIG9uIHByaW9yaXR5ICcke3ByaW9yaXR5fScsIHBhdXNlQ292ZXJlZFVJRm9ybTogJHtwYXVzZUNvdmVyZWRVSUZvcm19LCB1c2VyRGF0YTogJHt1c2VyRGF0YX1gKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMubV9wUmVzb3VyY2VNYW5hZ2VyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IHNldCByZXNvdXJjZSBtYW5hZ2VyIGZpcnN0LlwiKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHRoaXMubV9wVUlGb3JtSGVscGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IHNldCBVSSBmb3JtIGhlbHBlciBmaXJzdC5cIik7XG4gICAgICAgICAgICBpZiAoIXVpRm9ybUFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGZvcm0gYXNzZXQgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgaWYgKCF1aUdyb3VwTmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGdyb3VwIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGxldCB2X3JVSUdyb3VwID0gdGhpcy5nZXRVSUdyb3VwKHVpR3JvdXBOYW1lKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfclVJR3JvdXApIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVJIGdyb3VwICcke3VpR3JvdXBOYW1lfScgaXMgbm90IGV4aXN0LmApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHZfaVNlcmlhbElkID0gKyt0aGlzLm1faVNlcmlhbElkO1xuICAgICAgICAgICAgbGV0IHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0ID0gbnVsbDtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcEluc3RhbmNlUG9vbC5oYXModWlGb3JtQXNzZXROYW1lKSkge1xuICAgICAgICAgICAgICAgIC8vIEdldCBzcGF3bi5cbiAgICAgICAgICAgICAgICBsZXQgdl9wSW5zdGFuY2VPYmplY3RzID0gdGhpcy5tX3BJbnN0YW5jZVBvb2wuZ2V0KHVpRm9ybUFzc2V0TmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKHZfcEluc3RhbmNlT2JqZWN0cyAmJiB2X3BJbnN0YW5jZU9iamVjdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZfcEluc3RhbmNlT2JqZWN0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZfcEluc3RhbmNlT2JqZWN0c1tpXS5pc1ZhbGlkICYmICF2X3BJbnN0YW5jZU9iamVjdHNbaV0uc3Bhd24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdCA9IHZfcEluc3RhbmNlT2JqZWN0c1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC5zcGF3biA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZC5oYXModl9pU2VyaWFsSWQpKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEtleSBkdXBsaWNhdGVkIHdpdGg6ICR7dl9pU2VyaWFsSWR9YCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQuc2V0KHZfaVNlcmlhbElkLCB1aUZvcm1Bc3NldE5hbWUpO1xuICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBjYWxsIG9uIHJlc291cmNlIG1hbmFnZXIgdG8gbG9hZEFzc2V0LlxuICAgICAgICAgICAgICAgIGxldCB2X3JPcGVuVWlGb3JtSW5mbyA9IHtcbiAgICAgICAgICAgICAgICAgICAgc2VyaWFsSWQ6IHZfaVNlcmlhbElkLFxuICAgICAgICAgICAgICAgICAgICB1aUdyb3VwOiB2X3JVSUdyb3VwLFxuICAgICAgICAgICAgICAgICAgICBwYXVzZUNvdmVyZWRVSUZvcm06IHBhdXNlQ292ZXJlZFVJRm9ybSxcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGE6IHVzZXJEYXRhXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcFJlc291cmNlTWFuYWdlci5sb2FkQXNzZXQodWlGb3JtQXNzZXROYW1lLCBwcmlvcml0eSwgdGhpcy5tX3BMb2FkQXNzZXRDYWxsYmFja3MsIHZfck9wZW5VaUZvcm1JbmZvKTtcbiAgICAgICAgICAgICAgICAvLyBsZXQgdl9mVGltZVN0YXJ0OiBudW1iZXIgPSBuZXcgRGF0ZSgpLnZhbHVlT2YoKTtcbiAgICAgICAgICAgICAgICAvLyBjYy5sb2FkZXIubG9hZFJlcyh1aUZvcm1Bc3NldE5hbWUsIGNjLkFzc2V0LCAoY29tcGxldGVDb3VudDogbnVtYmVyLCB0b3RhbENvdW50OiBudW1iZXIsIGl0ZW06IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIC8vIFByb2dyZXNzIHByb2Nlc3NpbmcgdXBkYXRlLlxuICAgICAgICAgICAgICAgIC8vIC8vIGNjLndhcm4oYGxvYWRpbmcgcHJvZ3Jlc3M6ICR7Y29tcGxldGVDb3VudH0vJHt0b3RhbENvdW50fSwgaXRlbTogJHtpdGVtfWApO1xuICAgICAgICAgICAgICAgIC8vIHRoaXMuZmlyZU9wZW5VSUZvcm1Qcm9ncmVzcyh1aUZvcm1Bc3NldE5hbWUsIGNvbXBsZXRlQ291bnQgLyB0b3RhbENvdW50LCB2X3JPcGVuVWlGb3JtSW5mbyk7XG4gICAgICAgICAgICAgICAgLy8gfSwgKGVycm9yOiBFcnJvciwgcmVzb3VyY2U6IG9iamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIGNjLndhcm4oYGxvYWRSZXMgY29tcGxldGUgd2l0aCBpbmZvOiAke3Zfck9wZW5VaUZvcm1JbmZvLnNlcmlhbElkfSwgJHt2X3JPcGVuVWlGb3JtSW5mby51aUdyb3VwLm5hbWV9LCAke3VpRm9ybUFzc2V0TmFtZX1gKTtcbiAgICAgICAgICAgICAgICAvLyAvLyBsb2FkIGNvbXBsZXRlZC5cbiAgICAgICAgICAgICAgICAvLyB0aGlzLmZpcmVPcGVuVUlGb3JtQ29tcGxldGUoZXJyb3IsIHVpRm9ybUFzc2V0TmFtZSwgcmVzb3VyY2UsIG5ldyBEYXRlKCkudmFsdWVPZigpIC0gdl9mVGltZVN0YXJ0LCB2X3JPcGVuVWlGb3JtSW5mbyk7XG4gICAgICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW5VSUZvcm1JbnRlcm5hbCh2X2lTZXJpYWxJZCwgdWlGb3JtQXNzZXROYW1lLCB2X3JVSUdyb3VwLCB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC50YXJnZXQsIHBhdXNlQ292ZXJlZFVJRm9ybSwgZmFsc2UsIDAsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2X2lTZXJpYWxJZDtcbiAgICAgICAgfVxuICAgICAgICBpc0xvYWRpbmdVSUZvcm0oc2VyaWFsSWRPckFzc2V0TmFtZSkge1xuICAgICAgICAgICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2Ygc2VyaWFsSWRPckFzc2V0TmFtZSkge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdWlGb3JtQXNzZXROYW1lIG9mIHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkLnZhbHVlcygpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1aUZvcm1Bc3NldE5hbWUgPT09IHNlcmlhbElkT3JBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkLmhhcyhzZXJpYWxJZE9yQXNzZXROYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBnZXRVSUZvcm1zKHVpRm9ybUFzc2V0TmFtZSkge1xuICAgICAgICAgICAgbGV0IHZfclJldCA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCB1aUdyb3VwIG9mIHRoaXMubV9yVUlHcm91cHMudmFsdWVzKCkpIHtcbiAgICAgICAgICAgICAgICBpZiAobnVsbCAhPSB1aUdyb3VwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZfcEZvcm1zID0gdWlHcm91cC5nZXRVSUZvcm1zKHVpRm9ybUFzc2V0TmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIHZfclJldCA9IHZfclJldC5jb25jYXQodl9wRm9ybXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2X3JSZXQ7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0VUlGb3JtKHNlcmlhbElkT3JBc3NldE5hbWUpIHtcbiAgICAgICAgICAgIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIHNlcmlhbElkT3JBc3NldE5hbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXNlcmlhbElkT3JBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBhc3NldCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgdWlGb3JtID0gbnVsbDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdWlHcm91cCBvZiB0aGlzLm1fclVJR3JvdXBzLnZhbHVlcygpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCh1aUZvcm0gPSB1aUdyb3VwLmdldFVJRm9ybShzZXJpYWxJZE9yQXNzZXROYW1lKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVpRm9ybTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBoYXNVSUZvcm0oc2VyaWFsSWRPckFzc2V0TmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGwgIT0gdGhpcy5nZXRVSUZvcm0oc2VyaWFsSWRPckFzc2V0TmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgY2xvc2VVSUZvcm0oc2VyaWFsSWRPclVpRm9ybSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGxldCB1aUZvcm0gPSBzZXJpYWxJZE9yVWlGb3JtO1xuICAgICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2Ygc2VyaWFsSWRPclVpRm9ybSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzTG9hZGluZ1VJRm9ybShzZXJpYWxJZE9yVWlGb3JtKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNUb1JlbGVhc2VPbkxvYWQuYWRkKHNlcmlhbElkT3JVaUZvcm0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZC5kZWxldGUoc2VyaWFsSWRPclVpRm9ybSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdWlGb3JtID0gdGhpcy5nZXRVSUZvcm0oc2VyaWFsSWRPclVpRm9ybSk7XG4gICAgICAgICAgICAgICAgaWYgKG51bGwgPT0gdWlGb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuIG5vdCBmaW5kIFVJIGZvcm0gJyR7c2VyaWFsSWRPclVpRm9ybX0nYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF1aUZvcm0pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBsZXQgdWlHcm91cCA9IHVpRm9ybS51aUdyb3VwO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdWlHcm91cClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGdyb3VwIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB1aUdyb3VwLnJlbW92ZVVJRm9ybSh1aUZvcm0pO1xuICAgICAgICAgICAgdWlGb3JtLm9uQ2xvc2UodGhpcy5tX2JJc1NodXRkb3duLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICB1aUdyb3VwLnJlZnJlc2goKTtcbiAgICAgICAgICAgIGxldCBldmVudEFyZ3MgPSB7XG4gICAgICAgICAgICAgICAgc2VyaWFsSWQ6IHVpRm9ybS5zZXJpYWxJZCxcbiAgICAgICAgICAgICAgICB1aUdyb3VwOiB1aUdyb3VwLFxuICAgICAgICAgICAgICAgIHVpRm9ybUFzc2V0TmFtZTogdWlGb3JtLnVpRm9ybUFzc2V0TmFtZSxcbiAgICAgICAgICAgICAgICB1c2VyRGF0YTogdXNlckRhdGFcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLm1fcENsb3NlVUlGb3JtQ29tcGxldGVEZWxlZ2F0ZS5pdGVyKChjYWxsYmFja0ZuKSA9PiB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2tGbihldmVudEFyZ3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLm1fcFJlY3ljbGVRdWV1ZS5wdXNoKHVpRm9ybSk7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0QWxsTG9hZGVkVUlGb3JtcygpIHtcbiAgICAgICAgICAgIGxldCB2X3BSZXQgPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdWlHcm91cCBvZiB0aGlzLm1fclVJR3JvdXBzLnZhbHVlcygpKSB7XG4gICAgICAgICAgICAgICAgdl9wUmV0LmNvbmNhdCh1aUdyb3VwLmdldEFsbFVJRm9ybXMoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdl9wUmV0O1xuICAgICAgICB9XG4gICAgICAgIGNsb3NlQWxsTG9hZGVkVUlGb3Jtcyh1c2VyRGF0YSkge1xuICAgICAgICAgICAgbGV0IHZfcFVJRm9ybXMgPSB0aGlzLmdldEFsbExvYWRlZFVJRm9ybXMoKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdWlGb3JtIG9mIHZfcFVJRm9ybXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaGFzVUlGb3JtKHVpRm9ybS5zZXJpYWxJZCkpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VVSUZvcm0odWlGb3JtLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2xvc2VBbGxMb2FkaW5nVUlGb3JtcygpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc2VyaWFsSWQgb2YgdGhpcy5tX3JVSUZvcm1zQmVpbmdMb2FkZWQua2V5cygpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tX3JVSUZvcm1zVG9SZWxlYXNlT25Mb2FkLmFkZChzZXJpYWxJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNCZWluZ0xvYWRlZC5jbGVhcigpO1xuICAgICAgICB9XG4gICAgICAgIHJlZm9jdXNVSUZvcm0odWlGb3JtLCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdWlGb3JtKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgbGV0IHVpR3JvdXAgPSB1aUZvcm0udWlHcm91cDtcbiAgICAgICAgICAgIGlmIChudWxsID09IHVpR3JvdXApXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBncm91cCBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgdWlHcm91cC5yZWZvY3VzVUlGb3JtKHVpRm9ybSwgdXNlckRhdGEpO1xuICAgICAgICAgICAgdWlHcm91cC5yZWZyZXNoKCk7XG4gICAgICAgICAgICB1aUZvcm0ub25SZWZvY3VzKHVzZXJEYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBoYXNVSUdyb3VwKHVpR3JvdXBOYW1lKSB7XG4gICAgICAgICAgICBpZiAoIXVpR3JvdXBOYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZ3JvdXAgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9yVUlHcm91cHMuaGFzKHVpR3JvdXBOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBnZXRVSUdyb3VwKHVpR3JvdXBOYW1lKSB7XG4gICAgICAgICAgICBpZiAoIXVpR3JvdXBOYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZ3JvdXAgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubV9yVUlHcm91cHMuZ2V0KHVpR3JvdXBOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBhZGRVSUdyb3VwKHVpR3JvdXBOYW1lLCBhcmcxLCBhcmcyKSB7XG4gICAgICAgICAgICBpZiAoIXVpR3JvdXBOYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZ3JvdXAgbmFtZSBpcyBpbnZhbGlkLicpO1xuICAgICAgICAgICAgbGV0IHVpR3JvdXBEZXB0aCA9IDA7XG4gICAgICAgICAgICBsZXQgdWlHcm91cEhlbHBlciA9IG51bGw7XG4gICAgICAgICAgICBpZiAoJ251bWJlcicgPT09IHR5cGVvZiBhcmcxKSB7XG4gICAgICAgICAgICAgICAgdWlHcm91cERlcHRoID0gYXJnMTtcbiAgICAgICAgICAgICAgICBpZiAodW5kZWZpbmVkICE9IGFyZzIpIHtcbiAgICAgICAgICAgICAgICAgICAgdWlHcm91cEhlbHBlciA9IGFyZzI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdWlHcm91cEhlbHBlciA9IGFyZzE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXVpR3JvdXBIZWxwZXIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBncm91cCBoZWxwZXIgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc1VJR3JvdXAodWlHcm91cE5hbWUpKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubV9yVUlHcm91cHMuc2V0KHVpR3JvdXBOYW1lLCBuZXcgVUlHcm91cCh1aUdyb3VwTmFtZSwgdWlHcm91cERlcHRoLCB1aUdyb3VwSGVscGVyKSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBvcGVuVUlGb3JtSW50ZXJuYWwoc2VyaWFsSWQsIHVpRm9ybUFzc2V0TmFtZSwgdWlHcm91cCwgdWlGb3JtSW5zdGFuY2UsIHBhdXNlQ292ZXJlZFVJRm9ybSwgaXNOZXdJbnN0YW5jZSwgZHVyYXRpb24sIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBsZXQgdWlGb3JtID0gdGhpcy5tX3BVSUZvcm1IZWxwZXIuY3JlYXRlVUlGb3JtKHVpRm9ybUluc3RhbmNlLCB1aUdyb3VwLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB1aUZvcm0pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW4gbm90IGNyZWF0ZSBVSSBmb3JtIGluIGhlbHBlci4nKTtcbiAgICAgICAgICAgIHVpRm9ybS5vbkluaXQoc2VyaWFsSWQsIHVpRm9ybUFzc2V0TmFtZSwgdWlHcm91cCwgcGF1c2VDb3ZlcmVkVUlGb3JtLCBpc05ld0luc3RhbmNlLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICB1aUdyb3VwLmFkZFVJRm9ybSh1aUZvcm0pO1xuICAgICAgICAgICAgdWlGb3JtLm9uT3Blbih1c2VyRGF0YSk7XG4gICAgICAgICAgICB1aUdyb3VwLnJlZnJlc2goKTtcbiAgICAgICAgICAgIGxldCBldmVudEFyZ3MgPSB7XG4gICAgICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uLFxuICAgICAgICAgICAgICAgIHVpRm9ybTogdWlGb3JtLFxuICAgICAgICAgICAgICAgIHVzZXJEYXRhOiB1c2VyRGF0YVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMubV9wT3BlblVJRm9ybVN1Y2Nlc3NEZWxlZ2F0ZS5pdGVyKChjYWxsYmFja0ZuKSA9PiB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2tGbihldmVudEFyZ3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgbG9hZFVJRm9ybVN1Y2Nlc3NDYWxsYmFjayh1aUZvcm1Bc3NldE5hbWUsIHVpRm9ybUFzc2V0LCBkdXJhdGlvbiwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGxldCB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk9wZW4gVUkgZm9ybSBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZC5oYXModl9wSW5mby5zZXJpYWxJZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNUb1JlbGVhc2VPbkxvYWQuZGVsZXRlKHZfcEluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgICAgIHRoaXMubV9wVUlGb3JtSGVscGVyLnJlbGVhc2VVSUZvcm0odWlGb3JtQXNzZXQsIG51bGwpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkLmRlbGV0ZSh2X3BJbmZvLnNlcmlhbElkKTtcbiAgICAgICAgICAgIGxldCB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdCA9IFVJRm9ybUluc3RhbmNlT2JqZWN0LmNyZWF0ZSh1aUZvcm1Bc3NldE5hbWUsIHVpRm9ybUFzc2V0LCB0aGlzLm1fcFVJRm9ybUhlbHBlci5pbnN0YW50aWF0ZVVJRm9ybSh1aUZvcm1Bc3NldCksIHRoaXMubV9wVUlGb3JtSGVscGVyKTtcbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIHRvIHBvb2wgYW5kIG1hcmsgc3Bhd24gZmxhZy5cbiAgICAgICAgICAgIGlmICghdGhpcy5tX3BJbnN0YW5jZVBvb2wuaGFzKHVpRm9ybUFzc2V0TmFtZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcEluc3RhbmNlUG9vbC5zZXQodWlGb3JtQXNzZXROYW1lLCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgdl9wSW5zdGFuY2VPYmplY3RzID0gdGhpcy5tX3BJbnN0YW5jZVBvb2wuZ2V0KHVpRm9ybUFzc2V0TmFtZSk7XG4gICAgICAgICAgICBpZiAodl9wSW5zdGFuY2VPYmplY3RzLmxlbmd0aCA8IHRoaXMubV91SW5zdGFuY2VDYXBhY2l0eSkge1xuICAgICAgICAgICAgICAgIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0LnNwYXduID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB2X3BJbnN0YW5jZU9iamVjdHMucHVzaCh2X3BVaUZvcm1JbnN0YW5jZU9iamVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm9wZW5VSUZvcm1JbnRlcm5hbCh2X3BJbmZvLnNlcmlhbElkLCB1aUZvcm1Bc3NldE5hbWUsIHZfcEluZm8udWlHcm91cCwgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QudGFyZ2V0LCB2X3BJbmZvLnBhdXNlQ292ZXJlZFVJRm9ybSwgdHJ1ZSwgZHVyYXRpb24sIHZfcEluZm8udXNlckRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGxvYWRVSUZvcm1GYWlsdXJlQ2FsbGJhY2sodWlGb3JtQXNzZXROYW1lLCBzdGF0dXMsIGVycm9yTWVzc2FnZSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGxldCB2X3BJbmZvID0gdXNlckRhdGE7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2X3BJbmZvKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk9wZW4gVUkgZm9ybSBpbmZvIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9yVUlGb3Jtc1RvUmVsZWFzZU9uTG9hZC5oYXModl9wSW5mby5zZXJpYWxJZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1fclVJRm9ybXNUb1JlbGVhc2VPbkxvYWQuZGVsZXRlKHZfcEluZm8uc2VyaWFsSWQpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubV9yVUlGb3Jtc0JlaW5nTG9hZGVkLmRlbGV0ZSh2X3BJbmZvLnNlcmlhbElkKTtcbiAgICAgICAgICAgIGxldCBhcHBlbmRFcnJvck1lc3NhZ2UgPSBgTG9hZCBVSSBmb3JtIGZhaWx1cmUsIGFzc2V0IG5hbWUgJyR7dWlGb3JtQXNzZXROYW1lfScsIHN0YXR1cyAnJHtzdGF0dXMudG9TdHJpbmcoKX0nLCBlcnJvciBtZXNzYWdlICcke2Vycm9yTWVzc2FnZX0nLmA7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BPcGVuVUlGb3JtRmFpbHVyZURlbGVnYXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICBsZXQgZXZlbnRBcmdzID0ge1xuICAgICAgICAgICAgICAgICAgICBzZXJpYWxJZDogdl9wSW5mby5zZXJpYWxJZCxcbiAgICAgICAgICAgICAgICAgICAgdWlGb3JtQXNzZXROYW1lOiB1aUZvcm1Bc3NldE5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHVpR3JvdXBOYW1lOiB2X3BJbmZvLnVpR3JvdXAubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBhcHBlbmRFcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIHBhdXNlQ292ZXJlZFVJRm9ybTogdl9wSW5mby5wYXVzZUNvdmVyZWRVSUZvcm0sXG4gICAgICAgICAgICAgICAgICAgIHVzZXJEYXRhOiB2X3BJbmZvLnVzZXJEYXRhXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcE9wZW5VSUZvcm1GYWlsdXJlRGVsZWdhdGUuaXRlcigoY2FsbGJhY2tGbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGV2ZW50QXJncyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGFwcGVuZEVycm9yTWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgICAgbG9hZFVJRm9ybVVwZGF0ZUNhbGxiYWNrKHVpRm9ybUFzc2V0TmFtZSwgcHJvZ3Jlc3MsIHVzZXJEYXRhKSB7XG4gICAgICAgICAgICBsZXQgdl9wSW5mbyA9IHVzZXJEYXRhO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdl9wSW5mbylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJPcGVuIFVJIGZvcm0gaW5mbyBpcyBpbnZhbGlkLlwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fcE9wZW5VSUZvcm1VcGRhdGVEZWxlZ2F0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgbGV0IGV2ZW50QXJncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgc2VyaWFsSWQ6IHZfcEluZm8uc2VyaWFsSWQsXG4gICAgICAgICAgICAgICAgICAgIHVpRm9ybUFzc2V0TmFtZTogdWlGb3JtQXNzZXROYW1lLFxuICAgICAgICAgICAgICAgICAgICB1aUdyb3VwTmFtZTogdl9wSW5mby51aUdyb3VwLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzOiBwcm9ncmVzcyxcbiAgICAgICAgICAgICAgICAgICAgcGF1c2VDb3ZlcmVkVUlGb3JtOiB2X3BJbmZvLnBhdXNlQ292ZXJlZFVJRm9ybSxcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGE6IHZfcEluZm8udXNlckRhdGFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMubV9wT3BlblVJRm9ybVVwZGF0ZURlbGVnYXRlLml0ZXIoKGNhbGxiYWNrRm4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihldmVudEFyZ3MpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxvYWRVSUZvcm1EZXBlbmRlbmN5QXNzZXRDYWxsYmFjayh1aUZvcm1Bc3NldE5hbWUsIGRlcGVuZGVuY3lBc3NldE5hbWUsIGxvYWRlZENvdW50LCB0b3RhbENvdW50LCB1c2VyRGF0YSkge1xuICAgICAgICAgICAgbGV0IHZfcEluZm8gPSB1c2VyRGF0YTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZfcEluZm8pXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiT3BlbiBVSSBmb3JtIGluZm8gaXMgaW52YWxpZC5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5tX3BPcGVuVUlGb3JtRGVwZW5kZW5jeUFzc2V0RGVsZWdhdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIGxldCBldmVudEFyZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHNlcmlhbElkOiB2X3BJbmZvLnNlcmlhbElkLFxuICAgICAgICAgICAgICAgICAgICB1aUZvcm1Bc3NldE5hbWU6IHVpRm9ybUFzc2V0TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdWlHcm91cE5hbWU6IHZfcEluZm8udWlHcm91cC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBkZXBlbmRlbmN5QXNzZXROYW1lOiBkZXBlbmRlbmN5QXNzZXROYW1lLFxuICAgICAgICAgICAgICAgICAgICBsb2FkZWRDb3VudDogbG9hZGVkQ291bnQsXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsQ291bnQ6IHRvdGFsQ291bnQsXG4gICAgICAgICAgICAgICAgICAgIHBhdXNlQ292ZXJlZFVJRm9ybTogdl9wSW5mby5wYXVzZUNvdmVyZWRVSUZvcm0sXG4gICAgICAgICAgICAgICAgICAgIHVzZXJEYXRhOiB2X3BJbmZvLnVzZXJEYXRhXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLm1fcE9wZW5VSUZvcm1EZXBlbmRlbmN5QXNzZXREZWxlZ2F0ZS5pdGVyKChjYWxsYmFja0ZuKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrRm4oZXZlbnRBcmdzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gLy8gY2xhc3MgVUlNYW5hZ2VyXG4gICAgZXhwb3J0cy5VSU1hbmFnZXIgPSBVSU1hbmFnZXI7XG4gICAgY2xhc3MgVUlGb3JtSW5zdGFuY2VPYmplY3Qge1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIHRoaXMubV9wVUlGb3JtQXNzZXQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1IZWxwZXIgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5uYW1lID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0ID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuaXNWYWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5zcGF3biA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1Bc3NldCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUhlbHBlciA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmlzVmFsaWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5zcGF3biA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHN0YXRpYyBjcmVhdGUobmFtZSwgdWlGb3JtQXNzZXQsIHVpRm9ybUluc3RhbmNlLCB1aUZvcm1IZWxwZXIpIHtcbiAgICAgICAgICAgIGlmICghdWlGb3JtQXNzZXQpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGFzc2V0IGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBpZiAoIXVpRm9ybUhlbHBlcilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGZvcm0gaGVscGVyIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBsZXQgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QgPSBuZXcgVUlGb3JtSW5zdGFuY2VPYmplY3QoKTtcbiAgICAgICAgICAgIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0Lm5hbWUgPSBuYW1lO1xuICAgICAgICAgICAgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QudGFyZ2V0ID0gdWlGb3JtSW5zdGFuY2U7XG4gICAgICAgICAgICB2X3BVaUZvcm1JbnN0YW5jZU9iamVjdC5tX3BVSUZvcm1Bc3NldCA9IHVpRm9ybUFzc2V0O1xuICAgICAgICAgICAgdl9wVWlGb3JtSW5zdGFuY2VPYmplY3QubV9wVUlGb3JtSGVscGVyID0gdWlGb3JtSGVscGVyO1xuICAgICAgICAgICAgcmV0dXJuIHZfcFVpRm9ybUluc3RhbmNlT2JqZWN0O1xuICAgICAgICB9XG4gICAgICAgIGNsZWFyKCkge1xuICAgICAgICAgICAgdGhpcy5tX3BVSUZvcm1Bc3NldCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUhlbHBlciA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmVsZWFzZShzaHV0ZG93bikge1xuICAgICAgICAgICAgc2h1dGRvd24gPSBzaHV0ZG93biB8fCBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuaXNWYWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKHRoaXMubV9wVUlGb3JtSGVscGVyKVxuICAgICAgICAgICAgICAgIHRoaXMubV9wVUlGb3JtSGVscGVyLnJlbGVhc2VVSUZvcm0odGhpcy5tX3BVSUZvcm1Bc3NldCwgdGhpcy50YXJnZXQpO1xuICAgICAgICB9XG4gICAgfSAvLyBjbGFzcyBVSUZvcm1JbnN0YW5jZU9iamVjdFxuICAgIGNsYXNzIFVJR3JvdXAge1xuICAgICAgICBjb25zdHJ1Y3RvcihuYW1lLCBkZXB0aCwgaGVscGVyKSB7XG4gICAgICAgICAgICB0aGlzLm1faURlcHRoID0gMDtcbiAgICAgICAgICAgIHRoaXMubV9iUGF1c2UgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubV9wVUlGb3JtSW5mb3MgPSBbXTtcbiAgICAgICAgICAgIGlmICghbmFtZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJIGdyb3VwIG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgIGlmICghaGVscGVyKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZ3JvdXAgaGVscGVyIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICB0aGlzLm1fc05hbWUgPSBuYW1lO1xuICAgICAgICAgICAgdGhpcy5tX2JQYXVzZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5oZWxwZXIgPSBoZWxwZXI7XG4gICAgICAgICAgICB0aGlzLmRlcHRoID0gZGVwdGg7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IG5hbWUoKSB7IHJldHVybiB0aGlzLm1fc05hbWU7IH1cbiAgICAgICAgZ2V0IGRlcHRoKCkgeyByZXR1cm4gdGhpcy5tX2lEZXB0aDsgfVxuICAgICAgICBzZXQgZGVwdGgodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PSB0aGlzLm1faURlcHRoKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMubV9pRGVwdGggPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuaGVscGVyLnNldERlcHRoKHRoaXMubV9pRGVwdGgpO1xuICAgICAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IHBhdXNlKCkgeyByZXR1cm4gdGhpcy5tX2JQYXVzZTsgfVxuICAgICAgICBzZXQgcGF1c2UodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1fYlBhdXNlID09IHZhbHVlKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMubV9iUGF1c2UgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICB9XG4gICAgICAgIGdldCB1aUZvcm1Db3VudCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFVJRm9ybUluZm9zLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBnZXQgY3VycmVudFVJRm9ybSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFVJRm9ybUluZm9zLmxlbmd0aCA+IDAgPyB0aGlzLm1fcFVJRm9ybUluZm9zWzBdLnVpRm9ybSA6IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlKGVsYXBzZWQsIHJlYWxFbGFwc2VkKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGluZm8gb2YgdGhpcy5tX3BVSUZvcm1JbmZvcykge1xuICAgICAgICAgICAgICAgIGlmIChpbmZvLnBhdXNlZCkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaW5mby51aUZvcm0ub25VcGRhdGUoZWxhcHNlZCwgcmVhbEVsYXBzZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGFkZFVJRm9ybSh1aUZvcm0pIHtcbiAgICAgICAgICAgIHRoaXMubV9wVUlGb3JtSW5mb3MucHVzaCh7XG4gICAgICAgICAgICAgICAgdWlGb3JtOiB1aUZvcm0sXG4gICAgICAgICAgICAgICAgY292ZXJlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwYXVzZWQ6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJlbW92ZVVJRm9ybSh1aUZvcm0pIHtcbiAgICAgICAgICAgIGxldCB2X3VJZHggPSAtMTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5tX3BVSUZvcm1JbmZvcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fcFVJRm9ybUluZm9zW2ldLnVpRm9ybSA9PSB1aUZvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgdl91SWR4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHZfdUlkeCA9PSAtMSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgZmluZCBVSSBmb3JtIGluZm8gZm9yIHNlcmlhbCBpZCAnJHt1aUZvcm0uc2VyaWFsSWR9JywgVUkgZm9ybSBhc3NldCBuYW1lIGlzICcke3VpRm9ybS51aUZvcm1Bc3NldE5hbWV9Jy5gKTtcbiAgICAgICAgICAgIGxldCB2X3BJbmZvID0gdGhpcy5tX3BVSUZvcm1JbmZvc1t2X3VJZHhdO1xuICAgICAgICAgICAgaWYgKCF2X3BJbmZvLmNvdmVyZWQpIHtcbiAgICAgICAgICAgICAgICB2X3BJbmZvLmNvdmVyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHVpRm9ybS5vbkNvdmVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXZfcEluZm8ucGF1c2VkKSB7XG4gICAgICAgICAgICAgICAgdl9wSW5mby5wYXVzZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHVpRm9ybS5vblBhdXNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1fcFVJRm9ybUluZm9zLnNwbGljZSh2X3VJZHgsIDEpO1xuICAgICAgICB9XG4gICAgICAgIGhhc1VJRm9ybShpZE9yQXNzZXROYW1lKSB7XG4gICAgICAgICAgICBsZXQgc3ViUHJvcE5hbWUgPSAnc2VyaWFsSWQnO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpZE9yQXNzZXROYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGlmICghaWRPckFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVSSBmb3JtIGFzc2V0IG5hbWUgaXMgaW52YWxpZC4nKTtcbiAgICAgICAgICAgICAgICBzdWJQcm9wTmFtZSA9ICd1aUZvcm1Bc3NldE5hbWUnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChjb25zdCBpbmZvIG9mIHRoaXMubV9wVUlGb3JtSW5mb3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5mby51aUZvcm1bc3ViUHJvcE5hbWVdID09PSBpZE9yQXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBnZXRVSUZvcm0oaWRPckFzc2V0TmFtZSkge1xuICAgICAgICAgICAgbGV0IHN1YlByb3BOYW1lID0gJ3NlcmlhbElkJztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaWRPckFzc2V0TmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlkT3JBc3NldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBhc3NldCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICAgICAgc3ViUHJvcE5hbWUgPSAndWlGb3JtQXNzZXROYW1lJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoY29uc3QgaW5mbyBvZiB0aGlzLm1fcFVJRm9ybUluZm9zKSB7XG4gICAgICAgICAgICAgICAgaWYgKGluZm8udWlGb3JtW3N1YlByb3BOYW1lXSA9PT0gaWRPckFzc2V0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGluZm8udWlGb3JtO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0VUlGb3Jtcyhhc3NldE5hbWUpIHtcbiAgICAgICAgICAgIGlmICghYXNzZXROYW1lKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVUkgZm9ybSBhc3NldCBuYW1lIGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICBsZXQgdl9wUmV0ID0gdGhpcy5tX3BVSUZvcm1JbmZvcy5tYXAoaW5mbyA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGluZm8udWlGb3JtLnVpRm9ybUFzc2V0TmFtZSA9PT0gYXNzZXROYW1lKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW5mby51aUZvcm07XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB2X3BSZXQ7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0QWxsVUlGb3JtcygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1fcFVJRm9ybUluZm9zLm1hcChpbmZvID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5mby51aUZvcm07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZWZvY3VzVUlGb3JtKHVpRm9ybSwgdXNlckRhdGEpIHtcbiAgICAgICAgICAgIGxldCB2X3VJZHggPSAtMTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5tX3BVSUZvcm1JbmZvcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1fcFVJRm9ybUluZm9zW2ldLnVpRm9ybSA9PSB1aUZvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgdl91SWR4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHZfdUlkeCA9PSAtMSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgZmluZCBVSSBmb3JtIGluZm8gZm9yIHNlcmlhbCBpZCAnJHt1aUZvcm0uc2VyaWFsSWR9JywgVUkgZm9ybSBhc3NldCBuYW1lIGlzICcke3VpRm9ybS51aUZvcm1Bc3NldE5hbWV9Jy5gKTtcbiAgICAgICAgICAgIGlmICh2X3VJZHggPj0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubV9wVUlGb3JtSW5mb3Muc3BsaWNlKHZfdUlkeCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgdl9wSW5mbyA9IHRoaXMubV9wVUlGb3JtSW5mb3Nbdl91SWR4XTtcbiAgICAgICAgICAgIHRoaXMubV9wVUlGb3JtSW5mb3MudW5zaGlmdCh2X3BJbmZvKTtcbiAgICAgICAgfVxuICAgICAgICByZWZyZXNoKCkge1xuICAgICAgICAgICAgbGV0IHZfYlBhdXNlID0gdGhpcy5wYXVzZTtcbiAgICAgICAgICAgIGxldCB2X2JDb3ZlciA9IGZhbHNlO1xuICAgICAgICAgICAgbGV0IHZfaURlcHRoID0gdGhpcy51aUZvcm1Db3VudDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgaW5mbyBvZiB0aGlzLm1fcFVJRm9ybUluZm9zKSB7XG4gICAgICAgICAgICAgICAgaWYgKG51bGwgPT0gaW5mbylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGlmICh2X2JQYXVzZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWluZm8uY292ZXJlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5jb3ZlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm8udWlGb3JtLm9uQ292ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIWluZm8ucGF1c2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZvLnBhdXNlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZvLnVpRm9ybS5vblBhdXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmZvLnBhdXNlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm8udWlGb3JtLm9uUmVzdW1lKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZm8udWlGb3JtLnBhdXNlQ292ZXJlZFVJRm9ybSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdl9iUGF1c2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh2X2JDb3Zlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpbmZvLmNvdmVyZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLmNvdmVyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8udWlGb3JtLm9uQ292ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmZvLmNvdmVyZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLmNvdmVyZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLnVpRm9ybS5vblJldmVhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdl9iQ292ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSAvLyBjbGFzcyBVSUdyb3VwXG4gICAgZXhwb3J0cy5VSUdyb3VwID0gVUlHcm91cDtcbn0pO1xuIiwiKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTtcbiAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIl0sIGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIHZhciBnbG9iYWwgPSBnbG9iYWwgfHwge307XG4gICAgY29uc3Qgdl9wR2xvYmFsID0gJ3VuZGVmaW5lZCcgPT0gdHlwZW9mIHdpbmRvdyA/IGdsb2JhbCA6IHdpbmRvdztcbiAgICBjb25zdCBhdHNmcmFtZXdvcmsgPSB2X3BHbG9iYWwuYXRzZnJhbWV3b3JrIHx8IHt9O1xuICAgIGZ1bmN0aW9uIGV4cG9zZShtKSB7XG4gICAgICAgIGZvciAoY29uc3QgayBpbiBtKSB7XG4gICAgICAgICAgICBhdHNmcmFtZXdvcmtba10gPSBtW2tdO1xuICAgICAgICB9XG4gICAgfVxuICAgIGV4cG9zZShyZXF1aXJlKCcuL0Jhc2UnKSk7XG4gICAgZXhwb3NlKHJlcXVpcmUoXCIuL0NvbmZpZ1wiKSk7XG4gICAgZXhwb3NlKHJlcXVpcmUoXCIuL0RhdGFOb2RlXCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vRnNtXCIpKTtcbiAgICBleHBvc2UocmVxdWlyZShcIi4vUmVzb3VyY2VcIikpO1xuICAgIGV4cG9zZShyZXF1aXJlKFwiLi9FdmVudFwiKSk7XG4gICAgZXhwb3NlKHJlcXVpcmUoXCIuL1Byb2NlZHVyZVwiKSk7XG4gICAgZXhwb3NlKHJlcXVpcmUoXCIuL1VJXCIpKTtcbiAgICB2X3BHbG9iYWwuYXRzZnJhbWV3b3JrID0gYXRzZnJhbWV3b3JrO1xuICAgIGV4cG9ydHMuZGVmYXVsdCA9IGF0c2ZyYW1ld29yaztcbn0pO1xuIl19
