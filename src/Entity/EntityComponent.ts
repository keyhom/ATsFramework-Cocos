import FrameworkComponent from "../Base/FrameworkComponent";
import EventComponent from "../Event/EventComponent";
import Helper from "../Utility/Helper";
import Entity, { ShowEntityInfo } from "./Entity";
import EntityGroupHelperBase from "./EntityGroupHelperBase";
import EntityHelperBase from "./EntityHelperBase";
import EntityLogic from "./EntityLogic";

const { ccclass, property, menu, disallowMultiple, inspector } = cc._decorator;

type FrameworkModule = atsframework.FrameworkModule;
const FrameworkModule = atsframework.FrameworkModule;

type UserData = atsframework.UserData;

type EntityManager = atsframework.EntityManager;
const EntityManager = atsframework.EntityManager;

type IEntity = atsframework.IEntity;
type IEntityGroup = atsframework.IEntityGroup;

const DefaultPriority: number = 0;

export let ShowEntitySuccessEventId = 'showEntitySuccess';
export let ShowEntityFailureEventId = 'showEntityFailure';
export let ShowEntityUpdateEventId = 'showEntityUpdate';
export let ShowEntityDependencyAssetEventId = 'showEntityDependencyAsset';
export let HideEntityCompleteEventId = 'hideEntityComplete';

export type ShowEntitySuccessEventArgs = {
    entity: IEntity,
    entityLogicType: new () => EntityLogic,
    duration: number,
    userData: UserData
} // type ShowEntitySuccessEventArgs

export type ShowEntityFailureEventArgs = {
    entityId: number,
    entityLogicType: new () => EntityLogic,
    entityAssetName: string,
    entityGroupName: string,
    errorMessage: string,
    userData: UserData
} // type ShowEntityFailureEventArgs

export type ShowEntityUpdateEventArgs = {
    entityId: number,
    entityLogicType: new () => EntityLogic,
    entityAssetName: string,
    entityGroupName: string,
    progress: number,
    userData: UserData
} // type ShowEntityUpdateEventArgs

export type ShowEntityDependencyAssetEventArgs = {
    entityId: number,
    entityLogicType: new () => EntityLogic,
    entityAssetName: string,
    entityGroupName: string,
    dependencyAssetName: string,
    loadedCount: number,
    totalCount: number,
    userData: UserData
} // type ShowEntityDependencyAssetEventArgs

export type HideEntityCompleteEventArgs = {
    entityId: number,
    entityLogicType: new () => EntityLogic,
    entityAssetName: string,
    entityGroup: IEntityGroup,
    userData: UserData
} // type HideEntityCompleteEventArgs

@ccclass("EntityGroupInfo")
class EntityGroupInfo {

    @property('name')
    name: string = '';
    @property(cc.Float)
    instanceAutoReleaseInterval: number = 60;
    @property(cc.Integer)
    instanceCapacity: number = 16;
    @property(cc.Float)
    instanceExpireTime: number = 60;
    @property(cc.Integer)
    instancePriority: number = 0;

} // class EntityGroupInfo

@ccclass
@disallowMultiple
@menu('ATsFramework Component/Entity')
@inspector('packages://atsframework-cocos/inspector/entity-inspector.js')
export default class EntityComponent extends FrameworkComponent {

    private m_pEntityManager!: EntityManager;
    private m_pEventComponent!: EventComponent;

    private readonly m_pInternalEntityResultsCache: IEntity[] = [];

    @property({
        displayName: 'Show Entity Success Event',
    })
    private m_bEnableShowEntitySuccessEvent: boolean = true;

    @property({
        displayName: 'Show Entity Failure Event',
    })
    private m_bEnableShowEntityFailureEvent: boolean = true;

    @property({
        displayName: 'Show Entity Update Event',
    })
    private m_bEnableShowEntityUpdateEvent: boolean = false;

    @property({
        displayName: 'Show Entity Dependency Asset Event',
    })
    private m_bEnableShowEntityDependencyAssetEvent: boolean = false;

    @property({
        displayName: 'Hide Entity Complete Event',
    })
    private m_bEnableHideEntityComplete: boolean = true;

    @property({
        displayName: 'Instance Root',
        type: cc.Node
    })
    private m_pInstanceRoot: cc.Node = null;

    @property({
        displayName: 'Entity Helper'
    })
    private m_sEntityHelperTypeName: string = 'DefaultEntityHelper';

    @property({
        displayName: 'Entity Group Helper'
    })
    private m_sEntityGroupHelperTypeName: string = 'DefaultEntityGroupHelper';

    @property({
        displayName: 'Entity Group List',
        type: [EntityGroupInfo]
    })
    private m_pEntityGroups: EntityGroupInfo[] = [];

    get entityCount(): number {
        return this.m_pEntityManager.entityCount;
    }

    get entityGroupCount(): number {
        return this.m_pEntityManager.entityGroupCount;
    }

    onLoad(): void {
        super.onLoad();

        this.m_pEntityManager = FrameworkModule.getOrAddModule(EntityManager);
        if (!this.m_pEntityManager)
            throw new Error('Entity manager is invalid.');

        this.m_pEntityManager.showEntitySuccess.add(this.onShowEntitySuccess, this);
        this.m_pEntityManager.showEntityFailure.add(this.onShowEntityFailure, this);
        this.m_pEntityManager.showEntityUpdate.add(this.onShowEntityUpdate, this);
        this.m_pEntityManager.showEntityDependencyAsset.add(this.onShowEntityDependencyAsset, this);
        this.m_pEntityManager.hideEntityComplete.add(this.onHideEntityComplete, this);
    }

    start(): void {
        this.m_pEventComponent = FrameworkComponent.getComponent(EventComponent);
        if (!this.m_pEventComponent)
            throw new Error('Event component is invalid.');

        // Resource manager.
        this.m_pEntityManager.resourceManager = FrameworkModule.getModule(atsframework.ResourceManager);

        // ObjectPool manager.
        this.m_pEntityManager.objectPoolManager = FrameworkModule.getModule(atsframework.ObjectPoolManager);

        // Helper.
        let v_pEntityHelper: EntityHelperBase = Helper.createHelper(this.m_sEntityHelperTypeName, null);
        if (!v_pEntityHelper)
            throw new Error('Can not create entity helper.');

        v_pEntityHelper.node.name = 'Entity Helper';
        v_pEntityHelper.node.parent = this.node;
        v_pEntityHelper.node.setScale(cc.Vec3.ONE);

        this.m_pEntityManager.entityHelper = v_pEntityHelper;

        if (!this.m_pInstanceRoot) {
            this.m_pInstanceRoot = new cc.Node('Entity Instances');
            this.m_pInstanceRoot.parent = this.node;
            this.m_pInstanceRoot.setScale(cc.Vec3.ONE);
        }

        this.m_pEntityGroups = this.m_pEntityGroups || [];

        for (let i: number = 0; i < this.m_pEntityGroups.length; i++) {
            if (!this.addEntityGroup(
                this.m_pEntityGroups[i].name,
                this.m_pEntityGroups[i].instanceAutoReleaseInterval,
                this.m_pEntityGroups[i].instanceCapacity,
                this.m_pEntityGroups[i].instanceExpireTime,
                this.m_pEntityGroups[i].instancePriority
            )) {
                cc.warn(`Add entity group '${this.m_pEntityGroups[i].name}' failure`);
                continue;
            }
        }
    }

    hasEntityGroup(entityGroupName: string): boolean {
        return this.m_pEntityManager.hasEntityGroup(entityGroupName);
    }

    getEntityGroup(entityGroupName: string): IEntityGroup {
        return this.m_pEntityManager.getEntityGroup(entityGroupName);
    }

    getAllEntityGroups(): IEntityGroup[];
    getAllEntityGroups(results: IEntityGroup[]): IEntityGroup[];
    getAllEntityGroups(results?: IEntityGroup[]): IEntityGroup[] {
        return this.m_pEntityManager.getAllEntityGroup(results);
    }

    addEntityGroup(entityGroupName: string, instanceAutoReleaseInterval: number, instanceCapacity: number, instanceExpireTime: number, instancePriority: number): boolean {
        if (this.m_pEntityManager.hasEntityGroup(entityGroupName))
            return false;

        let v_pEntityGroupHelper: EntityGroupHelperBase = Helper.createHelper(this.m_sEntityGroupHelperTypeName, null, this.entityGroupCount);
        if (!v_pEntityGroupHelper) {
            cc.error('Can not create entity group helper.');
            return false;
        }

        v_pEntityGroupHelper.node.name = `Entity Group - ${entityGroupName}`;
        v_pEntityGroupHelper.node.parent = this.m_pInstanceRoot;
        v_pEntityGroupHelper.node.setScale(cc.Vec3.ONE);

        return this.m_pEntityManager.addEntityGroup(entityGroupName, instanceAutoReleaseInterval, instanceCapacity, instanceExpireTime, instancePriority, v_pEntityGroupHelper);
    }

    hasEntity(entityId: number): boolean;
    hasEntity(entityAssetName: string): boolean;
    hasEntity(entityIdOrAssetName: any): boolean {
        return this.m_pEntityManager.hasEntity(entityIdOrAssetName);
    }

    getEntity(entityId: number): Entity;
    getEntity(entityAssetName: string): Entity;
    getEntity(entityIdOrAssetName: any): Entity {
        return this.m_pEntityManager.getEntity(entityIdOrAssetName) as Entity;
    }

    getEntities(entityAssetName: string): Entity[];
    getEntities(entityAssetName: string, results: Entity[]): Entity[];
    getEntities(entityAssetName: string, results?: Entity[]): Entity[] {
        results = results || [];
        results.splice(0, results.length);

        this.m_pEntityManager.getEntities(entityAssetName, results);
        return results;
    }

    getAllLoadedEntities(): Entity[];
    getAllLoadedEntities(results: Entity[]): Entity[];
    getAllLoadedEntities(results?: Entity[]): Entity[] {
        results = results || [];
        results.splice(0, results.length);

        this.m_pEntityManager.getAllLoadedEntities(results);
        return results;
    }

    getAllLoadingEntityIds(): number[];
    getAllLoadingEntityIds(results: number[]): number[];
    getAllLoadingEntityIds(results?: number[]): number[] {
        results = results || [];
        results.splice(0, results.length);

        this.m_pEntityManager.getAllLoadingEntityIds(results);
        return results;
    }

    isLoadingEntity(entityId: number): boolean {
        return this.m_pEntityManager.isLoadingEntity(entityId);
    }

    isValidEntity(entity: Entity): boolean {
        return this.m_pEntityManager.isValidEntity(entity);
    }

    showEntity<T extends EntityLogic>(entityId: number, entityLogicType: new () => T, entityAssetName: string, entityGroupName: string): void;
    showEntity<T extends EntityLogic>(entityId: number, entityLogicType: new () => T, entityAssetName: string, entityGroupName: string, priority: number): void;
    showEntity<T extends EntityLogic>(entityId: number, entityLogicType: new () => T, entityAssetName: string, entityGroupName: string, userData: UserData): void;
    showEntity<T extends EntityLogic>(entityId: number, entityLogicType: new () => T, entityAssetName: string, entityGroupName: string, priority: number, userData: UserData): void;
    showEntity<T extends EntityLogic>(entityId: number, entityLogicType: new () => T, entityAssetName: string, entityGroupName: string, anyArg1?: number | UserData, userData?: UserData): void {
        if (undefined == entityLogicType || null == entityLogicType) {
            cc.error('Entity logic type is invalid.');
            return;
        }

        let priority: number = DefaultPriority;
        if ('number' === typeof anyArg1) {
            priority = anyArg1;
        } else if (undefined != anyArg1) {
            userData = anyArg1;
        }

        let v_pInfo: ShowEntityInfo = {
            entityLogicType: entityLogicType,
            userData: userData
        };

        this.m_pEntityManager.showEntity(entityId, entityAssetName, entityGroupName, priority, v_pInfo);
    }

    hideEntity(entityId: number): void;
    hideEntity(entityId: number, userData: UserData): void;
    hideEntity(entity: Entity): void;
    hideEntity(entity: Entity, userData: UserData): void;
    hideEntity(entityOrId: any, userData?: UserData): void {
        this.m_pEntityManager.hideEntity(entityOrId, userData);
    }

    hideAllLoadedEntities(): void;
    hideAllLoadedEntities(userData: UserData): void;
    hideAllLoadedEntities(userData?: UserData): void {
        this.m_pEntityManager.hideAllLoadedEntities(userData);
    }

    hideAllLoadingEntities(): void {
        this.m_pEntityManager.hideAllLoadingEntities();
    }

    getParentEntity(childEntityId: number): Entity;
    getParentEntity(childEntity: Entity): Entity;
    getParentEntity(childEntity: any): Entity {
        return this.m_pEntityManager.getParentEntity(childEntity) as Entity;
    }

    getChildEntities(parentEntityId: number): Entity[];
    getChildEntities(parentEntityId: number, results: Entity[]): Entity[];
    getChildEntities(parentEntity: Entity): Entity[];
    getChildEntities(parentEntity: Entity, results: Entity[]): Entity[];
    getChildEntities(parentEntityOrId: any, results?: Entity[]): Entity[] {
        results = results || [];
        results.splice(0, results.length);
        this.m_pEntityManager.getChildEntities(parentEntityOrId, results);
        return results;
    }

    attachEntity(childEntityId: number, parentEntityId: number): void;
    attachEntity(childEntityId: number, parentEntity: Entity): void;
    attachEntity(childEntity: Entity, parentEntityId: number): void;
    attachEntity(childEntity: Entity, parentEntity: Entity): void;
    attachEntity(childEntityOrId: any, parentEntityOrId: any): void {
        this.m_pEntityManager.attachEntity(childEntityOrId, parentEntityOrId);
    }

    detachEntity(childEntityId: number): void;
    detachEntity(childEntityId, userData: UserData): void;
    detachEntity(childEntity: Entity): void;
    detachEntity(childEntity: Entity, userData: UserData): void;
    detachEntity(childEntityOrId: any, userData?: UserData): void {
        this.m_pEntityManager.detachEntity(childEntityOrId, userData);
    }

    detachChildEntities(parentEntityId: number): void;
    detachChildEntities(parentEntityId: number, userData: UserData): void;
    detachChildEntities(parentEntity: Entity): void;
    detachChildEntities(parentEntity: Entity, userData: UserData): void;
    detachChildEntities(parentEntityOrId: any, userData?: UserData): void {
        this.m_pEntityManager.detachChildEntities(parentEntityOrId, userData);
    }

    private onShowEntitySuccess(entity: IEntity, duration: number, userData: UserData): void {
        if (this.m_bEnableShowEntitySuccessEvent) {
            let v_pInfo: ShowEntityInfo = userData as ShowEntityInfo;
            this.m_pEventComponent.emit(ShowEntitySuccessEventId, {
                entity: entity,
                entityLogicType: v_pInfo.entityLogicType,
                duration: duration,
                userData:v_pInfo.userData
            } as ShowEntitySuccessEventArgs);
        }
    }

    private onShowEntityFailure(entityId: number, entityAssetName: string, entityGroupName: string, errorMessage: string, userData: UserData): void {
        if (this.m_bEnableShowEntityFailureEvent) {
            let v_pInfo: ShowEntityInfo = userData as ShowEntityInfo;
            this.m_pEventComponent.emit(ShowEntityFailureEventId, {
                entityId: entityId,
                entityLogicType: v_pInfo.entityLogicType,
                entityAssetName: entityAssetName,
                entityGroupName: entityGroupName,
                errorMessage: errorMessage,
                userData: v_pInfo.userData
            } as ShowEntityFailureEventArgs);
        }
    }

    private onShowEntityUpdate(entityId: number, entityAssetName: string, entityGroupName: string, progress: number, userData: UserData): void {
        if (this.m_bEnableShowEntityUpdateEvent) {
            let v_pInfo: ShowEntityInfo = userData as ShowEntityInfo;
            this.m_pEventComponent.emit(ShowEntityUpdateEventId, {
                entityId: entityId,
                entityLogicType: v_pInfo.entityLogicType,
                entityAssetName: entityAssetName,
                entityGroupName: entityGroupName,
                progress: progress,
                userData: v_pInfo.userData
            } as ShowEntityUpdateEventArgs);
        }
    }

    private onShowEntityDependencyAsset(entityId: number, entityAssetName: string, entityGroupName: string, dependencyAssetName: string, loadedCount: number, totalCount: number, userData: UserData): void {
        if (this.m_bEnableShowEntityDependencyAssetEvent) {
            let v_pInfo: ShowEntityInfo = userData as ShowEntityInfo;
            this.m_pEventComponent.emit(ShowEntityDependencyAssetEventId, {
                entityId: entityId,
                entityLogicType: v_pInfo.entityLogicType,
                entityAssetName: entityAssetName,
                entityGroupName: entityGroupName,
                dependencyAssetName: dependencyAssetName,
                userData: v_pInfo.userData
            } as ShowEntityDependencyAssetEventArgs);
        }
    }

    private onHideEntityComplete(entityId: number, entityAssetName: string, entityGroup: IEntityGroup, userData: UserData): void {
        if (this.m_bEnableHideEntityComplete) {
            this.m_pEventComponent.emit(HideEntityCompleteEventId, {
                entityId: entityId,
                entityAssetName: entityAssetName,
                entityGroup: entityGroup,
                userData: userData
            } as HideEntityCompleteEventArgs);
        }
    }

} // class EntityComponent
