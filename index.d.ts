declare namespace atsframework {

    export type UserData = string | number | boolean | object | null;
    export type Value = boolean | string | number | null;

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
        has(fn: T, target?: any): boolean;
        add(fn: T, target?: any): void;
        remove(fn: T, target?: any): void;
        iter(fn: (item: T) => void): void;
        clear(): void;
        isValid: boolean;
        size: number;
    } // class EventHandler

    export class FrameworkSegment<T> {

        constructor(source: T, offset: number, length: number);

        source: T;
        offset: number;
        length: number;

    } // class FrameworkSegment<T>

    export abstract class FrameworkModule {
        static getModule<T extends FrameworkModule>(type: new() => T): T | null;
        static getOrAddModule<T extends FrameworkModule>(type: new () => T): T;
        static removeModule<T extends FrameworkModule>(type: new () => T): T | null;

        static update(elapsed: number, realElapsed: number): void;
        static shutdown(): void;

        protected priority: number;
        protected abstract update(elapsed: number, realElapsed: number): void;
        protected abstract shutdown(): void;
    } // class FrameworkMdoule.

    export type LoadConfigSuccessEventHandler         = (configAssetName: string, loadType: LoadType, duration: number, userData: UserData) => void;
    export type LoadConfigFailureEventHandler         = (configAssetName: string, loadType: LoadType, errorMessage: string, userData: UserData) => void;
    export type LoadConfigUpdateEventHandler          = (configAssetName: string, loadType: LoadType, progress: number, userData: UserData) => void;
    export type LoadConfigDependencyAssetEventHandler = LoadAssetDependencyCallback;

    ////////////////////////////////////////////////////////////////////////////
    // ConfigManager
    ////////////////////////////////////////////////////////////////////////////

    export interface IConfigHelper {
        loadConfig(configAsset: object, loadType: LoadType, userData: UserData): boolean;

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
        parseConfig(buffer: ArrayBuffer, userData: UserData): boolean;

        hasConfig(configName: string): boolean;
        addConfig(configName: string, value: Value): boolean;
        removeConfig(configName: string): boolean;
        removeAllConfigs(): void;

        getConfig<T extends Value>(configName: string): T;

        protected update(elapsed: number, realElapsed: number): void;
        protected shutdown(): void;

    } // class ConfigManager

    ////////////////////////////////////////////////////////////////////////////
    // DataNodeManager
    ////////////////////////////////////////////////////////////////////////////

    export class DataNodeManager extends FrameworkModule {

        protected update(elapsed: number, realElapsed: number): void;
        protected shutdown(): void;

    } // class DataNodeManager

    ////////////////////////////////////////////////////////////////////////////
    // DataTableManager
    ////////////////////////////////////////////////////////////////////////////

    export type DataTableRawContentType = string | ArrayBuffer | Blob;
    export type LoadDataTableInfo = {
        loadType: LoadType,
        userData: UserData
    } // type LoadDataTableInfo

    export interface IDataTableHelper {

        loadDataTable(dataTableAsset: object, loadType: LoadType, userData: UserData): boolean;
        releaseDataTableAsset(dataTableAsset: object): void;

        getDataRowSegments(content: DataTableRawContentType): IterableIterator<FrameworkSegment<DataTableRawContentType>>;

    } // interface IDataTableHelper

    export interface IDataRow {
        id: number;
        parseDataRow(dataRowSegment: FrameworkSegment<DataTableRawContentType>): boolean;
    } // interface IDataRow

    export interface IDataTable<T> {

        name: string;
        count: number;
        minIdDataRow: T;
        maxIdDataRow: T;

        hasDataRow(id: number): boolean;
        hasDataRow(pred: (value: T, idx?: number, container?: T[]) => boolean): boolean;

        getDataRow(id: number): T | null;
        getDataRow(pred: (value: T, idx?: number, container?: T[]) => boolean): T | null;

        getDataRows(pred: (value: T, idx?: number, container?: T[]) => boolean): T[];
        getDataRows(pred: (value: T, idx?: number, container?: T[]) => boolean, results: T[]): T[];

        getAllDataRows(): T[];
        getAllDataRows(results: T[]): T[];

        shutdown(): void;

    } // interface IDataTable<T>

    export abstract class DataTableBase {
        constructor(name?: string);

        name: string;
        abstract count: number;
        abstract addDataRow(rowSegment: FrameworkSegment<DataTableRawContentType>): boolean;
        abstract shutdown(): void;

    } // class DataTableBase

    export type LoadDataTableSuccessEventHandler = (dataTableAssetName: string, loadType: LoadType, duration: number, userData: UserData) => void;
    export type LoadDataTableFailureEventHandler = (dataTableAssetName: string, loadType: LoadType, errorMessage: string, userData: UserData) => void;
    export type LoadDataTableUpdateEventHandler = (dataTableAssetName: string, loadType: LoadType, progress: number, userData: UserData) => void;
    export type LoadDataTableDependencyAssetEventHandler = (dataTableAssetName: string, dependencyAssetName: string, loadedCount: number, totalCount: number, userData: UserData) => void;

    export class DataTableManager extends FrameworkModule {

        resourceManager: IResourceManager;
        readonly loadDataTableSuccess: EventHandler<LoadDataTableSuccessEventHandler>;
        readonly loadDataTableFailure: EventHandler<LoadDataTableFailureEventHandler>;
        readonly LoadDataTableUpdate: EventHandler<LoadDataTableUpdateEventHandler>;
        readonly loadDataTableDependencyAsset: EventHandler<LoadDataTableDependencyAssetEventHandler>;

        readonly count: number;
        dataTableHelper: IDataTableHelper;

        loadDataTable(dataTableAssetName: string, loadType: LoadType): void;
        loadDataTable(dataTableAssetName: string, loadType: LoadType, priority: number): void;
        loadDataTable(dataTableAssetName: string, loadType: LoadType, userData: UserData): void;
        loadDataTable(dataTableAssetName: string, loadType: LoadType, priority: number, userData: UserData): void;

        hasDataTable(dataTableAssetName: string): boolean;

        getDataTable<T extends IDataRow>(): IDataTable<T> | null;
        getDataTable<T extends IDataRow>(dataTableAssetName: string): IDataTable<T> | null;

        getAllDataTables(): DataTableBase[];
        getAllDataTables(results: DataTableBase[]): DataTableBase[];

        createDataTable<T>(rowType: new () => T, content: DataTableRawContentType): IDataTable<T> & DataTableBase;
        createDataTable<T>(rowType: new () => T, name: string, content: DataTableRawContentType): IDataTable<T> & DataTableBase;

        destroyDataTable(): boolean;
        destroyDataTable(name: string): boolean;

        protected update(elapsed: number, realElapsed: number): void;
        protected shutdown(): void;

    } // class DataTableManager

    ////////////////////////////////////////////////////////////////////////////
    // EntityManager
    ////////////////////////////////////////////////////////////////////////////

    export interface IEntity {

        readonly id: number;
        readonly entityAssetName: string;
        readonly handle: object;
        readonly entityGroup: IEntityGroup;

        onInit(entityId: number, entityAssetName: string, entityGroup: IEntityGroup, isNewInstance: boolean, userData: UserData): void;
        onRecycle(): void;
        onShow(userData: UserData): void;
        onHide(userData: UserData): void;
        onAttached(childEntity: IEntity, userData: UserData): void;
        onDetached(childEntity: IEntity, userData: UserData): void;
        onAttachTo(parentEntity: IEntity, userData: UserData): void;
        onDetachFrom(parentEntity: IEntity, userData: UserData): void;
        onUpdate(elpased: number, readElapsed: number): void;

    } // interface IEntity

    export interface IEntityHelper {

        instantiateEntity(entityAsset: object): object;

        createEntity(entityInstance: object, entityGroup: IEntityGroup, userData: UserData): IEntity;

        releaseEntity(entityAsset: object, entityInstance: object | null): void;

    } // interface IEntityHelper

    export interface IEntityGroup {
        readonly name: string;
        readonly entityCount: number;
        instanceAutoReleaseInterval: number;
        instanceCapacity: number;
        instancePriority: number;
        helper: IEntityGroupHelper;

        hasEntity(entityId: number): boolean;
        hasEntity(entityAssetName: string): boolean;

        getEntity(entityId: number): IEntity | null;
        getEntity(entityAssetName: string): IEntity | null;

        getEntities(entityAssetName: string): IEntity[];
        getEntities(entityAssetName: string, results: IEntity[]): IEntity[];

        getAllEntities(): IEntity[];
        getAllEntities(results: IEntity[]): IEntity[];

        setEntityInstanceLocked(entityInstance: object, locked: boolean): void;
        setEntityInstancePriority(entityInstance: object, priority: number): void;

    } // interface IEntityGroup

    export interface IEntityGroupHelper { } // interface IEntityGroupHelper

    export type ShowEntitySuccessEventHandler = (entity: IEntity, duration: number, userData: UserData) => void;
    export type ShowEntityFailureEventHandler = (entityId: number, entityAssetName: string, entityGroupName: string, errorMessage: string, userData: UserData) => void;
    export type ShowEntityUpdateEventHandler = (entityId: number, entityAssetName: string, entityGroupName: string, progress: number, userData: UserData) => void;
    export type ShowEntityDependencyAssetEventHandler = (entityId: number, entityAssetName: string, entityGroupName: string, dependencyAssetName: string, loadedCount: number, totalCount: number, userData: UserData) => void;
    export type HideEntityCompleteEventHandler = (entityId: number, entityAssetName: string, entityGroup: IEntityGroup, userData: UserData) => void;

    export type ShowEntityInfo = {
        serialId: number,
        entityId: number,
        entityGroup: IEntityGroup,
        userData: UserData,
    } // type ShowEntityInfo

    /**
     * Entity management module.
     */
    export class EntityManager extends FrameworkModule {
        readonly entityCount: number;
        readonly entityGroupCount: number;

        readonly showEntitySuccess: EventHandler<ShowEntitySuccessEventHandler>;
        readonly showEntityFailure: EventHandler<ShowEntityFailureEventHandler>;
        readonly showEntityUpdate: EventHandler<ShowEntityUpdateEventHandler>;
        readonly showEntityDependencyAsset: EventHandler<ShowEntityDependencyAssetEventHandler>;
        readonly hideEntityComplete: EventHandler<HideEntityCompleteEventHandler>;

        resourceManager: IResourceManager;
        objectPoolManager: ObjectPoolManager;
        entityHelper: IEntityHelper;

        hasEntityGroup(entityGroupName: string): boolean;
        getEntityGroup(entityGroupName: string): IEntityGroup | null;

        getAllEntityGroup(): IEntityGroup[];
        getAllEntityGroup(results: IEntityGroup[]): IEntityGroup[];

        addEntityGroup(entityGroupName: string, instanceAutoReleaseInterval: number, instanceCapacity: number, instanceExpireTime: number, instancePriority: number, entityGroupHelper: IEntityGroupHelper): boolean;

        hasEntity(entityId: number): boolean;
        hasEntity(entityAssetName: string): boolean;

        getEntity(entityId: number): IEntity | null;
        getEntity(entityAssetName: string): IEntity | null;

        getEntities(entityAssetName: string): IEntity[];
        getEntities(entityAssetName: string, results: IEntity[]): IEntity[];

        getAllLoadedEntities(): IEntity[];
        getAllLoadedEntities(results: IEntity[]): IEntity[];

        getAllLoadingEntityIds(): number[];
        getAllLoadingEntityIds(results: number[]): number[];

        isLoadingEntity(entityId: number): boolean;
        isValidEntity(entity: IEntity): boolean;

        showEntity(entityId: number, entityAssetName: string, entityGroupName: string): void;
        showEntity(entityId: number, entityAssetName: string, entityGroupName: string, priority: number): void;
        showEntity(entityId: number, entityAssetName: string, entityGroupName: string, userData: UserData): void;
        showEntity(entityId: number, entityAssetName: string, entityGroupName: string, prioirty: number, userData: UserData): void;

        hideEntity(entityId: number): void;
        hideEntity(entityId: number, userData: UserData): void;
        hideEntity(entity: IEntity): void;
        hideEntity(entity: IEntity, userData: UserData): void;

        hideAllLoadedEntities(): void;
        hideAllLoadedEntities(userData: UserData): void;

        hideAllLoadingEntities(): void;

        getParentEntity(childEntity: IEntity): IEntity | null;
        getParentEntity(childEntityId: number): IEntity | null;

        getChildEntities(parentEntityId: number): IEntity[];
        getChildEntities(parentEntityId: number, results: IEntity[]): IEntity[];

        attachEntity(childEntityId: number, parentEntityId: number): void;
        attachEntity(childEntityId: number, parentEntityId: number, userData: UserData): void;
        attachEntity(childEntityId: number, parentEntity: IEntity): void;
        attachEntity(childEntityId: number, parentEntity: IEntity, userData: UserData): void;
        attachEntity(childEntity: IEntity, parentEntityId: number): void;
        attachEntity(childEntity: IEntity, parentEntityId: number, userData: UserData): void;
        attachEntity(childEntity: IEntity, parentEntity: IEntity): void;
        attachEntity(childEntity: IEntity, parentEntity: IEntity, userData: UserData): void;

        detachEntity(childEntityId: number): void;
        detachEntity(childEntityId: number, userData: UserData): void;
        detachEntity(childEntity: IEntity): void;
        detachEntity(childEntity: IEntity, userData: UserData): void;

        detachChildEntities(parentEntityId: number): void;
        detachChildEntities(parentEntityId: number, userData: UserData): void;
        detachChildEntities(parentEntity: IEntity): void;
        detachChildEntities(parentEntity: IEntity, userData: UserData): void;

        update(elapsed: number, realElapsed: number): void;
        shutdown(): void;

    } // EntityManager

    ////////////////////////////////////////////////////////////////////////////
    // EventManager
    ////////////////////////////////////////////////////////////////////////////

    export type EventID = number | string;

    export class EventManager extends FrameworkModule {

        readonly priority: number;

        count(eventId: EventID): number;

        check(eventId: EventID): boolean;
        check(eventId: EventID, handler: Function): boolean;
        check(eventId: EventID, handler: Function, target: any): boolean;

        on(eventId: EventID, handler: Function): void;
        on(eventId: EventID, handler: Function, target: any): void;

        off(eventId: EventID, handler: Function): void;
        off(eventId: EventID, handler: Function, target: any): void;

        emit(eventId: EventID, ... args: any[]): void;

        protected update(elapsed: number, realElapsed: number): void;
        protected shutdown(): void;

    } // class EventManager

    ////////////////////////////////////////////////////////////////////////////
    // FsmManager
    ////////////////////////////////////////////////////////////////////////////

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
        protected onDestroy(fsm: Fsm<T>): void;

        protected changeState<TState extends FsmState<T>>(fsm: Fsm<T>, type: new() => TState): void;
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
        readonly currentStateTime: number;

        start<TState extends FsmState<T>>(type: new() => TState): void;
        hasState<TState extends FsmState<T>>(type: new() => TState): boolean;
        getState<TState extends FsmState<T>>(type: new() => TState): TState | null;
        getAllStates(): FsmState<T>[];

        changeState<TState extends FsmState<T>>(type: new() => TState): void;

        getData<DT>(name: string): DT | null;
        setData<DT>(name: string, data: DT): void;
        removeData(name: string): boolean;

        protected update(elapsed: number, realElapsed: number): void;
        protected shutdown(): void;

    } // class Fsm<T>

    export class FsmManager extends FrameworkModule {
        readonly priority: number;

        readonly count: number;

        getAllFsms(): FsmBase[];
        getFsm<T>(nameOrType: string | (new () => T)): FsmBase | null;

        hasFsm<T>(ownerOrType: string | (new () => T)): boolean;
        createFsm<T>(name: string, owner: T, states: FsmState<T>[]): Fsm<T>;

        destroyFsm<T extends FsmBase>(name: string): boolean;
        destroyFsm<T extends FsmBase>(type: new () => T): boolean;
        destroyFsm<T extends FsmBase>(fsm: FsmBase): boolean;
        destroyFsm<T extends FsmBase>(instance: T): boolean;

        protected update(elapsed: number, realElapsed: number): void;
        protected shutdown(): void;

    } // class FsmManager

    //////////////////////////////////////////////////////////////////
    // ObjectPoolManager
    //////////////////////////////////////////////////////////////////

    export type CreateSingleSpawnObjectPoolOption = {
        name?: string,
        capacity?: number,
        expireTime?: number,
        priority?: number
    };

    export type CreateMultiSpawnObjectPoolOption = CreateSingleSpawnObjectPoolOption & {
        autoReleaseInterval?: number,
        allowMultiSpawn?: boolean
    };

    export type ObjectInfo = {
        name: string;
        locked: boolean;
        customCanReleaseFlag: boolean;
        priority: number;
        lastUseTime: number;
        isInUse: boolean;
        spawnCount: number;
    } // type ObjectInfo

    export abstract class ObjectBase {

        readonly name: string;
        readonly target: object;
        locked: boolean;
        priority: number;
        readonly customCanReleaseFlag: boolean;
        lastUseTime: number;

        protected initialize(target: object): void;
        protected initialize(name: string, target: object): void;
        protected initialize(name: string, target: object, locked: boolean): void;
        protected initialize(name: string, target: object, locked: boolean, priority: number): void;

        clear(): void;

        protected onSpawn(): void;

        protected onUnspawn(): void;

        protected abstract release(isShutdown: boolean): void;

    } // class ObjectBase

    export interface IObjectPool<T extends ObjectBase> {

        name: string;
        // fullName: string;
        // objectType: new () => object;
        count: number;
        canReleaseCount: number;
        allowMultiSpawn: boolean;
        autoReleaseInterval: number;
        capacity: number;
        expireTime: number;
        priority: number;

        register(obj: T, spawned: boolean): void;

        canSpawn(): boolean;
        canSpawn(name: string): boolean;

        spawn(): T | null;
        spawn(name: string): T | null;

        unspawn(obj: T): void;
        unspawnByTarget(target: object): void;

        setLocked(obj: T, locked: boolean): void;
        setLockedByTarget(target: object, locked: boolean): void;

        setPriority(obj: T, priority: number): void;
        setPriorityByTarget(target: object, priority: number): void;

        release(): void;
        release(toReleaseCount: number): void;
        release(filter: (candidateObjects: T[], toReleaseCount: number, expireTime: number) => T[]): void;
        release(toReleaseCount: number, filter: (candidateObjects: T[], toReleaseCount: number, expireTime: number) => T[]): void;

        releaseAllUnused(): void;

    } // interface IObjectPool

    export abstract class ObjectPoolBase {

        name: string;
        // get fullName(): string { return `${this.objectType}.${this.name}`; }

        // readonly abstract objectType: new () => object;
        readonly abstract count: number;
        readonly abstract canReleaseCount: number;
        readonly abstract allowMultiSpawn: boolean;
        readonly abstract autoReleaseInterval: number;
        abstract capacity: number;
        abstract expireTime: number;
        abstract priority: number;

        abstract release(): void;
        abstract release(toReleaseCount: number): void;

        abstract releaseAllUnused(): void;
        abstract getAllObjectInfos(): ObjectInfo[];

        abstract update(elapsed: number, realElapsed: number): void;
        abstract shutdown(): void;

    } // class ObjectPoolBase

    export class ObjectPoolManager extends FrameworkModule {

        priority: number;
        count: number;

        protected update(elapsed: number, realElapsed: number): void;
        protected shutdown(): void;

        hasObjectPool(name: string): boolean;

        getObjectPool<T extends ObjectBase>(name: string): IObjectPool<T> | null;

        getObjectPoolBase(name: string): ObjectPoolBase | null;
        getObjectPoolBase(predicate: (obj: ObjectPoolBase) => boolean): ObjectPoolBase | null;

        getObjectPools(predicate: (obj: ObjectPoolBase) => boolean): ObjectPoolBase[];
        getObjectPools(predicate: (obj: ObjectPoolBase) => boolean, results: ObjectPoolBase[]): ObjectPoolBase[];

        getAllObjectPools(): ObjectPoolBase[];
        getAllObjectPools(sort: boolean): ObjectPoolBase[];
        getAllObjectPools(results: ObjectPoolBase[]): ObjectPoolBase[];
        getAllObjectPools(sort: boolean, results: ObjectPoolBase[]): ObjectPoolBase[];

        createSingleSpawnObjectPool<T extends ObjectBase>(): IObjectPool<T>;
        createSingleSpawnObjectPool<T extends ObjectBase>(options: CreateSingleSpawnObjectPoolOption): IObjectPool<T>;

        createMutliSpawnObjectPool<T extends ObjectBase>(): IObjectPool<T>;
        createMutliSpawnObjectPool<T extends ObjectBase>(options: CreateMultiSpawnObjectPoolOption): IObjectPool<T>;

        destroyObjectPool<T extends ObjectBase>(): boolean;
        destroyObjectPool<T extends ObjectBase>(name: string): boolean;
        destroyObjectPool<T extends ObjectBase>(objectPool: IObjectPool<T>): boolean;

        release(): void;
        releaseAllUnused(): void;

    } // class ObjectPoolManager

    ////////////////////////////////////////////////////////////////////////////
    // ProcedureManager
    ////////////////////////////////////////////////////////////////////////////

    export abstract class ProcedureBase extends FsmState<ProcedureManager> {
        // NOOP.
    } // class ProcedureBase

    export class ProcedureManager extends FrameworkModule {
        readonly priority: number;

        readonly currentProcedure: ProcedureBase;

        initialize(fsmManager: FsmManager, procedures: ProcedureBase[]): void;
        startProcedure<T extends ProcedureBase>(obj: T): void;
        hasProcedure<T extends ProcedureBase>(type: new() => T): boolean;
        getProcedure<T extends ProcedureBase>(type: new() => T): T | null;

        protected update(elapsed: number, realElapsed: number): void;
        protected shutdown(): void;

    } // class ProcedureManager

    ////////////////////////////////////////////////////////////////////////////
    // ResourceManager
    ////////////////////////////////////////////////////////////////////////////

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

    export class ResourceManager extends FrameworkModule implements IResourceManager {
        resourceGroup: IResourceGroup;
        resourceLoader: IResourceLoader;
        readonly priority: number;

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

        protected update(elapsed: number, realElapsed: number): void;
        protected shutdown(): void;

    } // class ResourceManager

    ////////////////////////////////////////////////////////////////////////////
    // SceneManager
    ////////////////////////////////////////////////////////////////////////////

    export type LoadSceneSuccessEventHandler = LoadSceneSuccessCallback;
    export type LoadSceneFailureEventHandler = (sceneAssetName: string, errorMessage: string, userData: UserData) => void;
    export type LoadSceneUpdateEventHandler = LoadSceneUpdateCallback;
    export type LoadSceneDependencyAssetEventHandler = LoadSceneAssetDependencyCallback;
    export type UnloadSceneSuccessEventHandler = UnloadSceneSuccessCallback;
    export type UnloadSceneFailureEventHandler = UnloadSceneFailureCallback;

    export class SceneManager extends FrameworkModule {
        priority: number;
        loadSceneSuccess: EventHandler<LoadSceneSuccessEventHandler>;
        loadSceneFailure: EventHandler<LoadSceneFailureEventHandler>;
        loadSceneUpdate: EventHandler<LoadSceneUpdateEventHandler>;
        loadSceneDependencyAsset: EventHandler<LoadSceneDependencyAssetEventHandler>;
        unloadSceneSuccess: EventHandler<UnloadSceneSuccessEventHandler>;
        unloadSceneFailure: EventHandler<UnloadSceneFailureEventHandler>;

        resourceManager: IResourceManager;

        sceneIsLoading(sceneAssetName: string): boolean;
        sceneIsLoaded(sceneAssetName: string): boolean;
        sceneIsUnloading(sceneAssetName: string): boolean;

        getLoadedSceneAssetNames(): string[];
        getLoadedSceneAssetNames(results: string[]): string[];

        getLoadingSceneAssetNames(): string[];
        getLoadingSceneAssetNames(results: string[]): string[];

        getUnloadingSceneAssetNames(): string[];
        getUnloadingSceneAssetNames(results: string[]): string[];

        loadScene(sceneAssetName: string): void;
        loadScene(sceneAssetName: string, priority: number): void;
        loadScene(sceneAssetName: string, userData: UserData): void;
        loadScene(sceneAssetName: string, priority: number, userData: UserData): void;

        unloadScene(sceneAssetName: string): void;
        unloadScene(sceneAssetName: string, userData: UserData): void;

        protected update(elapsed: number, realElapsed: number): void;
        protected shutdown(): void;
    } // class SceneManager

    ////////////////////////////////////////////////////////////////////////////
    // SoundManager
    ////////////////////////////////////////////////////////////////////////////

    export namespace Constant {
        export const DefaultTime: number;
        export const DefaultMute: boolean;
        export const DefaultLoop: boolean;
        export const DefaultPriority: number;
        export const DefaultVolume: number;
        export const DefaultFadeInSeconds: number;
        export const DefaultFadeOutSeconds: number;
        export const DefaultPitch: number;
        export const DefaultPanStereo: number;
        export const DefaultSpatialBlend: number;
        export const DefaultMaxDistance: number;
        export const DefaultDopplerLevel: number;
    } // namespace Constant

    export interface ISoundGroup {
        readonly name: string;
        readonly soundAgentCount: number;
        avoidBeingReplacedBySamePriority: boolean;
        mute: boolean;
        volume: number;
        readonly helper: ISoundGroupHelper;
        stopAllLoadedSounds(): void;
        stopAllLoadedSounds(fadeOutSeconds: number): void;
    } // interface ISoundGroup

    export interface ISoundGroupHelper {
        // NOOP.
    } // interface ISoundGroupHelper

    export interface ISoundHelper {
        releaseSoundAsset(soundAsset: object): void;
    } // interface ISoundHelper

    export type ResetSoundAgentEventHandler = () => void;

    export interface ISoundAgent {
        readonly soundGroup: ISoundGroup;
        readonly serialId: number;
        readonly isPlaying: boolean;
        readonly length: number;
        time: number;
        readonly mute: boolean;
        muteInSoundGroup: boolean;
        loop: boolean;
        priority: number;
        readonly volume: number;
        volumeInSoundGroup: number;
        pitch: number;
        panStereo: number;
        spatialBlend: number;
        maxDistance: number;
        dopplerLevel: number;
        readonly helper: ISoundAgentHelper;

        play(): void;
        play(fadeInSeconds: number): void;

        stop(): void;
        stop(fadeOutSeconds: number): void;

        pause(): void;
        pause(fadeOutSeconds: number): void;

        resume(): void;
        resume(fadeInSeconds: number): void;

        reset(): void;
    } // interface ISoundAgent

    export interface ISoundAgentHelper {
        isPlaying: boolean;
        length: number;
        time: number;
        mute: boolean;
        loop: boolean;
        priority: number;
        volume: number;
        pitch: number;
        panStereo: number;
        spatialBlend: number;
        maxDistance: number;
        dopplerLevel: number;
        resetSoundAgent: EventHandler<ResetSoundAgentEventHandler>;
        play(fadeInSeconds: number): void;
        stop(fadeOutSeconds: number): void;
        pause(fadeOutSeconds: number): void;
        resume(fadeInSeconds: number): void;
        reset(): void;
        setSoundAsset(soundAsset: object): boolean;
    } // interface ISoundAgentHelper

    export class SoundAgent {
        readonly soundGroup: SoundGroup;
        serialId: number;
        readonly isPlaying: boolean;
        readonly length: number;
        time: number;
        readonly mute: boolean;
        muteInSoundGroup: boolean;
        loop: boolean;
        priority: number;
        readonly volume: number;
        volumeInSoundGroup: number;
        pitch: number;
        panStereo: number;
        spatialBlend: number;
        maxDistance: number;
        dopplerLevel: number;
        readonly helper: ISoundAgentHelper;
        readonly setSoundAssetTime: number;

        play(): void;
        play(fadeInSeconds: number): void;

        stop(): void;
        stop(fadeOutSeconds: number): void;

        pause(): void;
        pause(fadeOutSeconds: number): void;

        resume(): void;
        resume(fadeInSeconds: number): void;

        reset(): void;

        // setSoundAsset(soundAsset: object): void;
        // refreshMute(): void;
        // refreshVolume(): void;
    } // class SoundAgent

    export enum PlaySoundErrorCode {
        Unknown = 0,
        SoundGroupNotExist,
        SoundGroupHasNoAgent,
        LoadAssetFailure,
        IgnoreDueToLowPriority,
        SetSoundAssetFailure
    } // enum PlaySoundErrorCode

    export type PlaySoundErrorCodeOut = {
        code: PlaySoundErrorCode
    } // type PlaySoundErrorCodeOut

    export type PlaySoundParams = {
        time: number,
        muteInSoundGroup: boolean,
        loop: boolean,
        priority: number,
        volumeInSoundGroup: number,
        fadeInSeconds: number,
        pitch: number,
        panStereo: number,
        spatialBlend: number,
        maxDistance: number,
        dopplerLevel: number,
        referenced: boolean,
    } // type PlaySoundParams

    export let DefaultPlaySoundParams: PlaySoundParams;

    export class SoundGroup {

        readonly name: string;
        readonly soundAgentCount: number;
        avoidBeingReplacedBySamePriority: boolean;
        mute: boolean;
        volume: number;
        readonly helper: ISoundGroupHelper;

        addSoundAgentHelper(soundHelper: ISoundHelper, soundGroupHelper: ISoundGroupHelper): void;

        playSound(serialId: number, soundAsset: object, playSoundParams: PlaySoundParams, errorCode?: PlaySoundErrorCodeOut): ISoundAgent | null;

        stopSound(serialId: number, fadeOutSeconds: number): boolean;

        pauseSound(serialId: number, fadeOutSeconds: number): boolean;

        resumeSound(serialId: number, fadeInSeconds: number): boolean;

        stopAllLoadedSounds(): void;
        stopAllLoadedSounds(fadeOutSeconds: number): void;

    } // class SoundGroup

    export type PlaySoundSuccessEventHandler = (serialId: number, soundAssetName: string, soundAgent: ISoundAgent, duration: number, userData: UserData) => void;
    export type PlaySoundFailureEventHandler = (serialId: number, soundAssetName: string, soundGroupName: string, playSoundParams: PlaySoundParams, errorCode: PlaySoundErrorCode, errorMessage: string, userData: UserData) => void;
    export type PlaySoundUpdateEventHandler = (serialId: number, soundAssetName: string, soundGroupName: string, playSoundParams: PlaySoundParams, progress: number, userData: UserData) => void;
    export type PlaySoundDependencyAssetEventHandler = (serialId: number, soundAssetName: string, soundGroupName: string, playSoundParams: PlaySoundParams, dependencyAssetName: string, loadedCount: number, totalCount: number, userData: UserData) => void;

    export class SoundManager extends FrameworkModule {
        readonly soundGroupCount: number;
        readonly playSoundSuccess: EventHandler<PlaySoundSuccessEventHandler>;
        readonly playSoundFailure: EventHandler<PlaySoundFailureEventHandler>;
        readonly playSoundUpdate: EventHandler<PlaySoundUpdateEventHandler>;
        readonly playSoundDependencyAsset: EventHandler<PlaySoundDependencyAssetEventHandler>;

        protected update(elapsed: number, realElapsed: number): void;
        protected shutdown(): void;

        resourceManager: IResourceManager;
        soundHelper: ISoundHelper;

        hasSoundGroup(soundGroupName: string): boolean;
        getSoundGroup(soundGroupName: string): SoundGroup | null;
        getAllSoundGroups(): SoundGroup[];
        getAllSoundGroups(results: SoundGroup[]): SoundGroup[];

        addSoundGroup(soundGroupName: string, soundGroupHelper: ISoundGroupHelper): boolean;
        addSoundGroup(soundGroupName: string, soundGroupAvoidBeingReplacedBySamePriority: boolean, soundGroupMute: boolean, soundGroupVolume: number, soundGroupHelper: ISoundGroupHelper): boolean;

        addSoundAgentHelper(soundGroupName: string, soundAgentHelper: ISoundAgentHelper): void;

        getAllLoadingSoundSerialIds(): number[];
        getAllLoadingSoundSerialIds(results: number[]): number[];

        isLoadingSound(serialId: number): boolean;

        playSound(soundAssetName: string, soundGroupName: string): number;
        playSound(soundAssetName: string, soundGroupName: string, priority: number): number;
        playSound(soundAssetName: string, soundGroupName: string, playSoundParams: PlaySoundParams): number;
        playSound(soundAssetName: string, soundGroupName: string, userData: UserData): number;
        playSound(soundAssetName: string, soundGroupName: string, priority: number, playSoundParams: PlaySoundParams): number;
        playSound(soundAssetName: string, soundGroupName: string, priority: number, userData: UserData): number;
        playSound(soundAssetName: string, soundGroupName: string, playSoundParams: PlaySoundParams, userData: UserData): number;
        playSound(soundAssetName: string, soundGroupName: string, priority: number, playSoundParams: PlaySoundParams, userData: UserData): number;

        stopSound(serialId: number): boolean;
        stopSound(serialId: number, fadeOutSeconds: number): boolean;

        stopAllLoadedSounds(): void;
        stopAllLoadedSounds(fadeOutSeconds: number): void;

        stopAllLoadingSounds(): void;

        pauseSound(serialId: number): void;
        pauseSound(serialId: number, fadeOutSeconds: number): void;

        resumeSound(serialId: number): void;
        resumeSound(serialId: number, fadeInSeconds: number): void;

    } // class SoundManager

    ////////////////////////////////////////////////////////////////////////////
    // SettingManager
    ////////////////////////////////////////////////////////////////////////////

    export interface ISettingHelper {

        load(): boolean;

        save(): boolean;

        hasSetting(name: string): boolean;

        removeSetting(name: string): void;

        removeAllSettings(): void;

        getBoolean(name: string): boolean;
        getBoolean(name: string, defaultValue: boolean): boolean;
        setBoolean(name: string, value: boolean): void;

        getInteger(name: string): number;
        getInteger(name: string, defaultValue: number): number;
        setInteger(name: string, value: number): void;

        getFloat(name: string): number;
        getFloat(name: string, defaultValue: number): number;
        setFloat(name: string, value: number): void;

        getString(name: string): string;
        getString(name: string, defaultValue: string): string;
        setString(name: string, value: string): void;

        getObject<T>(type: new () => T, name: string): any;
        getObject<T>(type: new () => T, name: string, defaultValue: any): any;
        setObject(name: string, obj: any): void;

    } // interface ISettingHelper

    /**
     * Setting configured management.
     */
    export class SettingManager extends FrameworkModule {

        settingHelper: ISettingHelper;

        load(): boolean;

        save(): boolean;

        hasSetting(settingName: string): boolean;

        removeSetting(settingName: string): void;

        removeAllSettings(): void;

        getBoolean(settingName: string): boolean;
        getBoolean(settingName: string, defaultValue: boolean): boolean;

        setBoolean(settingName: string, value: boolean): void;

        getInteger(settingName: string): number;
        getInteger(settingName: string, defaultValue: number): number;

        setInteger(settingName: string, value: number): void;

        getFloat(settingName: string): number;
        getFloat(settingName: string, defaultValue: number): number;

        setFloat(settingName: string, value: number): void;

        getString(settingName: string): string;
        getString(settingName: string, defaultValue: string): string;

        setString(settingName: string, value: string): void;

        getObject<T>(type: new () => T, settingName: string): T;
        getObject<T>(type: new () => T, settingName: string, defaultValue: T | null): T;

        setObject<T>(settingName: string, value: T | null): void;

        protected update(elapsed: number, realElapsed: number): void {
            // NOOP.
        }

        protected shutdown(): void {
            // NOOP.
        }

    } // class SettingManager

    ////////////////////////////////////////////////////////////////////////////
    // UIManager
    ////////////////////////////////////////////////////////////////////////////

    export interface IUIGroup {
        name: string;
        depth: number;
        pause: boolean;
        uiFormCount: number;
        currentUIForm: IUIForm | null;
        helper: IUIGroupHelper;

        hasUIForm(idOrAssetName: number | string): boolean;
        getUIForm(idOrAssetName: number | string): IUIForm | null;
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
        releaseUIForm<T extends object>(uiFormAsset: T, uiFormInstance: object | null): void;
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

        objectPoolManager: ObjectPoolManager;
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

        getUIForm(serialIdOrAssetName: number | string): IUIForm | null;

        hasUIForm(serialIdOrAssetName: number | string): boolean;

        closeUIForm(serialIdOrUiForm: number | IUIForm, userData?: UserData): void;

        getAllLoadedUIForms(): IUIForm[];

        closeAllLoadedUIForms(userData?: UserData): void;
        closeAllLoadingUIForms(): void;

        refocusUIForm(uiForm: IUIForm, userData?: UserData): void;

        hasUIGroup(uiGroupName: string): boolean;

        getUIGroup(uiGroupName: string): IUIGroup | null;

        addUIGroup(uiGroupName: string, uiGroupHelper: IUIGroupHelper): boolean;
        addUIGroup(uiGroupName: string, uiGroupDepth: number, uiGroupHelper: IUIGroupHelper): boolean;

    } // class UIManager

    export class UIGroup implements IUIGroup {

        readonly name: string;
        depth: number;
        pause: boolean;

        readonly uiFormCount: number;
        readonly currentUIForm: IUIForm | null;
        readonly helper: IUIGroupHelper;

        update(elapsed: number, realElapsed: number): void;

        addUIForm(uiForm: IUIForm): void;

        removeUIForm(uiForm: IUIForm): void;

        hasUIForm(idOrAssetName: string | number): boolean;

        getUIForm(idOrAssetName: string | number): IUIForm | null;

        getUIForms(assetName: string): IUIForm[];

        getAllUIForms(): IUIForm[];

        refocusUIForm(uiForm: IUIForm, userData: UserData): void;

        refresh(): void;

    } // class UIGroup

} // namespace atsframework.
