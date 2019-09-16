declare namespace atsframework {

    export type UserData = string | number | boolean | object;
    export type Value = boolean | string | number;

    export enum LoadType {
        Text, Bytes, Stream
    }

    export type AssetType<T> = new () => T;
    export enum ResourceMode {
        Unspecified = 0,
        Package,
        Updatable
    }

    export enum LoadResourceStatus {
        Success = 0,
        NotReady,
        NotExist,
        DependencyError,
        TypeError,
        AssetError
    }

    export class EventHandler<T> {
        has(fn: T): boolean;
        add(fn: T): void;
        remove(fn: T): void;
        iter(fn: (item: T) => void): void;
        clear(): void;
        isValid: boolean;
        size: number;
    }

    export abstract class FrameworkModule {
        static getModule<T extends FrameworkModule>(type: new() => T): T;
        static getOrAddModule<T extends FrameworkModule>(type: new () => T): T;
        static removeModule<T extends FrameworkModule>(type: new () => T): T;

        static update(elapsed: number, realElapsed: number): void;
        static shutdown(): void;

        protected get priority(): number;
        protected abstract update(elapsed: number, realElapsed: number): void;
        protected abstract shutdown(): void;
    } // class FrameworkMdoule.

    export type LoadConfigSuccessEventHandler         = (configAssetName: string, loadType: LoadType, duration: number, userData: UserData) => void;
    export type LoadConfigFailureEventHandler         = (configAssetName: string, loadType: LoadType, errorMessage: string, userData: UserData) => void;
    export type LoadConfigUpdateEventHandler          = (configAssetName: string, loadType: LoadType, progress: number, userData: UserData) => void;
    export type LoadConfigDependencyAssetEventHandler = LoadAssetDependencyCallback;

    export interface IConfigHelper {
        loadConfig(configAssetName: string, loadType: LoadType, userData: UserData): boolean;

        parseConfig(text: string, userData: UserData): boolean;
        parseConfig(buffer: ArrayBuffer, userData: UserData): boolean;

        releaseConfigAsset(configAssetName: object): void;

    } // interface IConfigHelper

    export class ConfigManager extends FrameworkModule {

        resourceManager: IResourceManager;

        configHelper: IConfigHelper;

        configCount: number;

        loadConfigSuccess: EventHandler<LoadConfigSuccessEventHandler>;
        loadConfigFailure: EventHandler<LoadConfigFailureEventHandler>;
        loadConfigUpdate: EventHandler<LoadConfigUpdateEventHandler>;
        loadConfigDependencyAsset: EventHandler<LoadConfigDependencyAssetEventHandler>;

        loadConfig(configAssetName: string, loadType: LoadType): void;
        loadConfig(configAssetName: string, loadType: LoadType, priority: number): void;
        loadConfig(configAssetName: string, loadType: LoadType, userData: UserData): void;
        loadConfig(configAssetName: string, loadType: LoadType, priority: number, userData: UserData): void;

        parseConfig(text: string): boolean;
        parseConfig(text: string, userData: UserData): boolean;
        parseConfig(buffer: ArrayBuffer): boolean;
        parseConfig(buffer, ArrayBuffer, userData: UserData): boolean;

        hasConfig(configName: string): boolean;
        addConfig(configName: string, value: Value): boolean;
        removeConfig(configName: string): boolean;
        removeAllConfigs(): void;

        getConfig<T extends Value>(configName: string): T;

        protected update(elapsed: number, realElapsed: number): void;
        protected shutdown(): void;

    } // class ConfigManager

    export class DataNodeManager extends FrameworkModule {

        protected udpate(elapsed: number, realElapsed: number): void;
        protected shutdown(): void;

    } // class DataNodeManager

    export type EventID = number | string;

    export class EventManager extends FrameworkModule {

        readonly priority: number;

        count(eventId: EventID): number;
        check(eventId: EventID): boolean;
        check(eventId: EventID, handler: Function): boolean;
        on(eventId: EventID, handler: Function): void;
        off(eventId: EventID, handler: Function): void;
        emit(eventId, ... args: any[]): void;

        protected update(elapsed: number, realElapsed: number): void;
        protected shutdown(): void;

    } // class EventManager

    export interface FsmBase {
        readonly name: string;
        readonly fsmStateCount: number;
        readonly isRunning: boolean;
        readonly isDestroyed: boolean;
        readonly currentStateName: string;
        readonly currentStateTime: number;
    } // interface FasmBase

    export type FsmEventHandler<T> = (fsm: Fsm<T>, sender: object, userData: UserData) => T;

    export abstract class FsmState<T> {

        readonly name: string;
        protected onInit(fsm: Fsm<T>): void;
        protected onEnter(fsm: Fsm<T>): void;
        protected onUpdate(fsm: Fsm<T>, elapsed: number, realElapsed: number): void;
        protected onLeave(fsm: Fsm<T>): void;
        protected onLeave(fsm: Fsm<T>, shutdown: boolean): void;

        protected changeState<TState extends FsmState<T>>(fsm: Fsm<T>, type: new() => TSTate): void;
        protected on(eventId: EventID, eventHandler: FsmEventHandler<T>): void;
        protected off(eventId: EventID, eventHandler: FsmEventHandler<T>): void;
        protected emit(fsm: Fsm<T>, sender: object, eventId: EventID, userData: UserData): void;

    } // class FsmState<T>

    export class Fsm<T> implements FsmBase {
        static createFsm<T>(name: string, owner: T, states: FsmState<T>[]): Fsm<T>;

        readonly name: string;
        readonly owner: T;
        readonly fsmStateCount: number;
        readonly isRunning: boolean;
        readonly isDestroyed: boolean;
        readonly currentState: FsmState<T>;
        readonly currentStateName: string;

        start<TSTate extends FsmState<T>>(type: new() => TState): void;
        hasState<TState extends FsmState<T>>(type: new() => TState): boolean;
        getState<TState extends FsmState<T>>(type: new() => TSTate): TState;
        getAllStates(): FsmState<T>[];

        changeState<TSTate extends FsmState<T>>(type: new() => TState): void;

        getData<DT>(name: string): DT;
        setData<DT>(name: string, data: DT): void;
        removeData(name: string): boolean;

        protected update(elapsed: number, realElapsed: number): void;
        protected shutdown(): void;

    } // class Fsm<T>

    export class FsmManager extends FrameworkModule {
        readonly priority: number;

        readonly count: number;

        getAllFsms(): FsmBase[];
        getFsm<T>(nameOrType: string | (new () => T)): FsmBase;

        hasFsm<T>(ownerOrType: string | (new () => T)): boolean;
        createFsm<T>(name: string, owner: T, states: FsmState<T>[]): Fsm<T>;

        destroyFsm<T extends FsmBase>(name: string): boolean;
        destroyFsm<T extends FsmBase>(type: new () => T): boolean;
        destroyFsm<T extends FsmBase>(fsm: FsmBase): boolean;
        destroyFsm<T extends FsmBase>(instance: T): boolean;

        protected update(elapsed: number, realElapsed: number): void;
        protected shutdown(): void;

    } // class FsmManager

    export abstract class ProcedureBase extends FsmState<ProcedureManager> {
        // NOOP.
    } // class ProcedureBase

    export class ProcedureManager extends FrameworkModule {
        readonly priority: number;

        readonly currentProcedure: ProcedureBase;

        initialize(fsmManager: FsmManager, procedures: ProcedureBase[]): void;
        startProcedure<T extends ProcedureBase>(obj: T): void;
        hasProcedure<T extends ProcedureBase>(type: new() => T): boolean;
        getProcedure<T extends ProcedureBase>(type: new() => T): T;

        protected update(elapsed: number, realElapsed: number): void;
        protected shutdown(): void;

    } // class ProcedureManager

    export type LoadAssetSuccessCallback = (assetName: string, asset: object, duration: number, userData: UserData) => void;
    export type LoadAssetFailureCallback = (assetName: string, status: LoadResourceStatus, errorMessage: string, userData: UserData) => void;
    export type LoadAssetUpdateCallback = (assetName: string, progress: number, userData: UserData) => void;
    export type LoadAssetDependencyCallback = (assetName: string, dependencyAssetName: string, loadedCount: number, totalCount: number, userData: UserData) => void;

    export type LoadAssetCallbacks = {
        success?: LoadAssetSuccessCallback,
        failure?: LoadAssetFailureCallback,
        update?: LoadAssetUpdateCallback,
        dependency?: LoadAssetDependencyCallback
    };

    export type LoadSceneSuccessCallback = (sceneAssetName: string, duration: number, userData: UserData) => void;
    export type LoadSceneFailureCallback = (sceneAssetName: string, status: LoadResourceStatus, errorMessage: string, userData: UserData) => void;
    export type LoadSceneUpdateCallback = (sceneAssetName: string, progress: number, userData: UserData) => void;
    export type LoadSceneAssetDependencyCallback = (sceneAssetName: string, dependencyAssetName: string, loadedCount: number, totalCount: number, userData: UserData) => void;

    export type LoadSceneCallbacks = {
        success?: LoadSceneSuccessCallback,
        failure?: LoadSceneFailureCallback,
        update?: LoadSceneUpdateCallback,
        dependency?: LoadSceneAssetDependencyCallback
    };

    export type UnloadSceneSuccessCallback = (sceneAssetName: string, userData: UserData) => void;
    export type UnloadSceneFailureCallback = (sceneAssetName: string, userData: UserData) => void;

    export type UnloadSceneCallbacks = {
        success?: UnloadSceneSuccessCallback,
        failure?: UnloadSceneFailureCallback
    };

    export interface IResourceGroup {
        // TODO: interface IResourceGroup.
    } // interface IResourceGroup

    export interface IResourceLoader {
        hasAsset(assetName: string): boolean;

        loadAsset(assetName: string, loadAssetCallbacks: LoadAssetCallbacks): void;
        loadAsset(assetName: string, loadAssetCallbacks: LoadAssetCallbacks, userData: UserData): void;

        loadAsset<T>(assetName: string, assetType: AssetType<T>, loadAssetCallbacks: LoadAssetCallbacks): void;
        loadAsset<T>(assetName: string, assetType: AssetType<T>, loadAssetCallbacks: LoadAssetCallbacks, userData: UserData): void;

        loadAsset<T>(assetName: string, priority: number, loadAssetCallbacks: LoadAssetCallbacks): void;
        loadAsset<T>(assetName: string, priority: number, loadAssetCallbacks: LoadAssetCallbacks, userData: UserData): void;

        loadAsset<T>(assetName: string, assetType: AssetType<T>, priority: number, loadAssetCallbacks: LoadAssetCallbacks): void;
        loadAsset<T>(assetName: string, assetType: AssetType<T>, priority: number, loadAssetCallbacks: LoadAssetCallbacks, userData: UserData): void;

        unloadAsset<T>(asset: T): void;

        loadScene(sceneAssetName: string, loadSceneCallbacks: LoadSceneCallbacks): void;
        loadScene(sceneAssetName: string, loadSceneCallbacks: LoadSceneCallbacks, userData: UserData): void;

        loadScene(sceneAssetName: string, priority: number, loadSceneCallbacks: LoadSceneCallbacks): void;
        loadScene(sceneAssetName: string, priority: number, loadSceneCallbacks: LoadSceneCallbacks, userData: UserData): void;

        unloadScene(sceneAssetName: string, unloadSceneCallbacks: UnloadSceneCallbacks): void;
        unloadScene(sceneAssetName: string, unloadSceneCallbacks: UnloadSceneCallbacks, userData: UserData): void;

        update(elapsed: number, realElapsed: number): void;
        shutdown(): void;
    } // interface IResourceLoader

    export interface IResourceManager {
        resourceGroup: IResourceGroup;

        hasAsset(assetName: string): boolean;

        loadAsset(assetName: string, loadAssetCallbacks: LoadAssetCallbacks): void;
        loadAsset(assetName: string, loadAssetCallbacks: LoadAssetCallbacks, userData: UserData): void;

        loadAsset<T>(assetName: string, assetType: AssetType<T>, loadAssetCallbacks: LoadAssetCallbacks): void;
        loadAsset<T>(assetName: string, assetType: AssetType<T>, loadAssetCallbacks: LoadAssetCallbacks, userData: UserData): void;

        loadAsset<T>(assetName: string, priority: number, loadAssetCallbacks: LoadAssetCallbacks): void;
        loadAsset<T>(assetName: string, priority: number, loadAssetCallbacks: LoadAssetCallbacks, userData: UserData): void;

        loadAsset<T>(assetName: string, assetType: AssetType<T>, priority: number, loadAssetCallbacks: LoadAssetCallbacks): void;
        loadAsset<T>(assetName: string, assetType: AssetType<T>, priority: number, loadAssetCallbacks: LoadAssetCallbacks, userData: UserData): void;

        unloadAsset<T>(asset: T): void;

        loadScene(sceneAssetName: string, loadSceneCallbacks: LoadSceneCallbacks): void;
        loadScene(sceneAssetName: string, loadSceneCallbacks: LoadSceneCallbacks, userData: UserData): void;

        loadScene(sceneAssetName: string, priority: number, loadSceneCallbacks: LoadSceneCallbacks): void;
        loadScene(sceneAssetName: string, priority: number, loadSceneCallbacks: LoadSceneCallbacks, userData: UserData): void;

        unloadScene(sceneAssetName: string, unloadSceneCallbacks: UnloadSceneCallbacks): void;
        unloadScene(sceneAssetName: string, unloadSceneCallbacks: UnloadSceneCallbacks, userData: UserData): void;

        hasResourceGroup(resourceGroupName: string): boolean;
    } // interface IResourceManager.

    export interface IUIGroup {
        name: string;
        depth: number;
        pause: boolean;
        uiFormCount: number;
        currentUIForm: IUIForm;
        helper: IUIGroupHelper;

        hasUIForm(idOrAssetName: number | string): boolean;
        getUIForm(idOrAssetName: number | string): IUIForm;
        getUIForms(assetName: string): Array<IUIForm>;
        getAllUIForms(): Array<IUIForm>;
    } // interface IUIGroup

    export interface IUIForm {
        serialId: number;
        uiFormAssetName: string;
        handle: any;
        uiGroup: IUIGroup;
        depthInUIGroup: number;
        pauseCoveredUIForm: boolean;

        onInit(serialId: number, uiFormAssetName: string, uiGroup: IUIGroup, pauseCoveredUIForm: boolean, isNewInstance: boolean, userData: UserData): void;
        onRecycle(): void;
        onOpen(userData: UserData): void;
        onClose(shutdown: boolean, userData: UserData): void;
        onPause(): void;
        onResume(): void;
        onCover(): void;
        onReveal(): void;
        onRefocus(userData: UserData): void;
        onUpdate(elapsed: number, realElapsed: number): void;
        onDepthChanged(uiGroupDepth: number, depthInUIGroup: number): void;
    } // interface IUIForm

    export interface IUIFormHelper {
        instantiateUIForm<T extends object>(uiFormAsset: T): T;
        createUIForm(uiFormInstance: object, uiGroup: IUIGroup, userData: UserData): IUIForm;
        releaseUIForm<T extends object>(uiFormAsset: T, uiFormInstance: object): void;
    } // interface IUIFormHelper

    export interface IUIGroupHelper {
        setDepth(depth: number): void;
    } // interface IUIGroupHelper

    export type OpenUIFormSuccessEventArgs = {
        uiForm: IUIForm,
        duration: number,
        userData: UserData
    };

    export type OpenUIFormFailureEventArgs = {
        serialId: number,
        uiFormAssetName: string,
        uiGroupName: string,
        pauseCoveredUIForm: boolean,
        errorMessage: string,
        userData: UserData
    };

    export type OpenUIFormUpdateEventArgs = {
        serialId: number,
        uiFormAssetName: string,
        uiGroupName: string,
        pauseCoveredUIForm: boolean,
        progress: number,
        userData: UserData
    };

    export type OpenUIFormDependencyAssetEventArgs = {
        serialId: number,
        uiFormAssetName: string,
        uiGroupName: string,
        pauseCoveredUIForm: boolean,
        dependencyAssetName: string,
        loadedCount: number,
        totalCount: number,
        userData: UserData
    };

    export type CloseUIFormCompleteEventArgs = {
        serialId: number,
        uiFormAssetName: string,
        uiGroup: IUIGroup,
        userData: UserData
    };

    export type OpenUIFormSuccessEventHandler = (eventArgs: OpenUIFormSuccessEventArgs) => void;
    export type OpenUIFormFailureEventHandler = (eventArgs: OpenUIFormFailureEventArgs) => void;
    export type OpenUIFormUpdateEventHandler = (eventArgs: OpenUIFormUpdateEventArgs) => void;
    export type OpenUIFormDependencyAssetEventHandler = (eventArgs: OpenUIFormDependencyAssetEventArgs) => void;
    export type CloseUIFormCompleteEventHandler = (eventArgs: CloseUIFormCompleteEventArgs) => void;

    export class UIManager extends FrameworkModule {

        uiFormHelper: IUIFormHelper;

        resourceManager: IResourceManager;
        uiGroupCount: number;

        openUIFormSuccess: EventHandler<OpenUIFormSuccessEventHandler>;
        openUIFormFailure: EventHandler<OpenUIFormFailureEventHandler>;
        openUIFormUpdate: EventHandler<OpenUIFormUpdateEventHandler>;
        openUIFormDependencyAsset: EventHandler<OpenUIFormDependencyAssetEventHandler>;
        closeUIFormComplete: EventHandler<CloseUIFormCompleteEventHandler>;

        instanceAutoReleaseInterval: number;
        instanceCapacity: number;
        instanceExpireTime: number;
        instancePriority: number;

        protected update(elapsed: number, realElapsed: number): void;

        protected shutdown(): void;

        openUIForm(uiFormAssetName: string, uiGroupName: string, priority: number, pauseCoveredUIForm: boolean, userData: UserData): number;

        isLoadingUIForm(serialIdOrAssetName: number | string): boolean;

        getUIForms(uiFormAssetName: string): IUIForm[];

        getUIForm(serialIdOrAssetName: number | string): IUIForm;

        hasUIForm(serialIdOrAssetName: number | string): boolean;

        closeUIForm(serialIdOrUiForm: number | IUIForm, userData?: UserData): void;

        getAllLoadedUIForms(): IUIForm[];

        closeAllLoadedUIForms(userData?: UserData): void;
        closeAllLoadingUIForms(): void;

        refocusUIForm(uiForm: IUIForm, userData?: UserData): void;

        hasUIGroup(uiGroupName: string): boolean;

        getUIGroup(uiGroupName: string): IUIGroup;

        addUIGroup(uiGroupName: string, uiGroupHelper: IUIGroupHelper): boolean;
        addUIGroup(uiGroupName: string, uiGroupDepth: number, uiGroupHelper: IUIGroupHelper): boolean;

    } // class UIManager

    export class UIGroup implements IUIGroup {

        readonly name: string;
        depth: number;
        pause: boolean;

        readonly uiFormCount: number;
        readonly currentUIForm: IUIForm;
        readonly helper: IUIGroupHelper;

        update(elapsed: number, realElapsed: number): void;

        addUIForm(uiForm: IUIForm): void;

        removeUIForm(uiForm: IUIForm): void;

        hasUIForm(idOrAssetName: string | number): boolean;

        getUIForm(idOrAssetName: string | number): IUIForm;

        getUIForms(assetName: string): IUIForm[];

        getAllUIForms(): IUIForm[];

        refocusUIForm(uiForm: IUIForm, userData: UserData): void;

        refresh(): void;

    } // class UIGroup

} // namespace atsframework.
