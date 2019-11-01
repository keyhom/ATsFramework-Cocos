import EntityLogic from "./EntityLogic";

type IEntity = atsframework.IEntity;
type IEntityGroup = atsframework.IEntityGroup;

const { ccclass, property } = cc._decorator;

export type ShowEntityInfo = {
	readonly entityLogicType: new () => EntityLogic,
	readonly userData: atsframework.UserData
} // type ShowEntityInfo

@ccclass
export default class Entity extends cc.Component implements IEntity {

	private m_iEntityId!: number;
	private m_sEntityAssetName!: string;
	private m_pEntityGroup!: IEntityGroup;
	private m_pEntityLogic!: EntityLogic;

	get id(): number {
		return this.m_iEntityId;
	}

	get entityAssetName(): string {
		return this.m_sEntityAssetName;
	}

	get handle(): object {
		return this.node;
	}

	get logic(): EntityLogic {
		return this.m_pEntityLogic;
	}

	get entityGroup(): atsframework.IEntityGroup {
		return this.m_pEntityGroup;
	}

	onInit(entityId: number, entityAssetName: string, entityGroup: atsframework.IEntityGroup, isNewInstance: boolean, userData: atsframework.UserData): void {
		this.m_iEntityId = entityId;
		this.m_sEntityAssetName = entityAssetName;
		if (isNewInstance) {
			this.m_pEntityGroup = entityGroup;
		} else if (this.m_pEntityGroup != entityGroup) {
			throw new Error('Entity group is inconsistent for non-new-instance entity');
		}

		let v_pInfo: ShowEntityInfo = userData as ShowEntityInfo;
		let v_pEntityLogicType: new () => EntityLogic = v_pInfo.entityLogicType;
		if (!v_pEntityLogicType) {
			throw new Error('Entity logic type is invalid.');
		}

		if (this.m_pEntityLogic) {
			if (this.m_pEntityLogic instanceof v_pEntityLogicType) {
				this.m_pEntityLogic.enabled = true;
				return;
			}

			(this.m_pEntityLogic as cc.Component).destroy();
			this.m_pEntityLogic = null;
		}

		this.m_pEntityLogic = this.getComponent(v_pEntityLogicType) || this.addComponent(v_pEntityLogicType);
		if (!this.m_pEntityLogic) {
			throw new Error(`Entity '${entityAssetName}' can not add entity logic.`);
		}

		(this.m_pEntityLogic as any).onInit(v_pInfo.userData);
	}

	onRecycle(): void {
		this.m_iEntityId = 0;
		this.m_pEntityLogic.enabled = false;
	}

	onShow(userData: atsframework.UserData): void {
		let v_pInfo: ShowEntityInfo = userData as ShowEntityInfo;
		(this.m_pEntityLogic as any).onShow(v_pInfo.userData);
	}

	onHide(userData: atsframework.UserData): void {
		(this.m_pEntityLogic as any).onHide(userData);
	}

	onAttached(childEntity: atsframework.IEntity, userData: atsframework.UserData): void {
		// XXX: attach has a AttachEntityInfo ?
		(this.m_pEntityLogic as any).onAttached((childEntity as Entity).logic, userData);
	}

	onDetached(childEntity: atsframework.IEntity, userData: atsframework.UserData): void {
		(this.m_pEntityLogic as any).onDetached((childEntity as Entity).logic, userData);
	}

	onAttachTo(parentEntity: atsframework.IEntity, userData: atsframework.UserData): void {
		// XXX: attach has a AttachEntityInfo ?
		(this.m_pEntityLogic as any).onAttachTo((parentEntity as Entity).logic, userData);
	}

	onDetachFrom(parentEntity: atsframework.IEntity, userData: atsframework.UserData): void {
		(this.m_pEntityLogic as any).onDetachFrom((parentEntity as Entity).logic, userData);
	}

	onUpdate(elapsed: number, readElapsed: number): void {
		if (!this.m_pEntityLogic)
			throw new Error('Invalid entity logic.');

		(this.m_pEntityLogic as any).onUpdate(elapsed, readElapsed);
	}

} // class Entity
