import Entity from "./Entity";

type UserData = atsframework.UserData;

export default abstract class EntityLogic extends cc.Component {

    private m_bAvailable: boolean = false;
    private m_bVisible: boolean = false;
    private m_iOriginLayer: number = 0;

    get entity(): Entity {
        return this.getComponent(Entity);
    }

    get name(): string {
        return this.node.name;
    }

    set name(value) {
        this.node.name = value;
    }

    get available(): boolean {
        return this.m_bAvailable;
    }

    get visible(): boolean {
        return this.m_bAvailable && this.m_bVisible;
    }

    set visible(value) {
        if (!this.m_bAvailable) {
            cc.warn(`Entity '${this.name}' is not available.`);
            return;
        }

        if (this.m_bVisible == value) {
            return;
        }
        this.m_bVisible = value;
        this.internalSetVisible(value);
    }

    protected onInit(userData: UserData): void {
        this.m_iOriginLayer = this.node.zIndex;
    }

    protected onShow(userData: UserData): void {
        this.m_bAvailable = true;
        this.visible = true;
    }

    protected onHide(userData: UserData): void {
        // XXX: SetLayerRecursively.
        this.visible = false;
        this.m_bAvailable = false;
    }

    protected onAttached(childEntity: EntityLogic, userData: UserData): void {

    }

    protected onDetached(childEntity: EntityLogic, userData: UserData): void {

    }

    protected onAttachTo(parentEntity: EntityLogic, userData: UserData): void {
        // XXX: attach should be transform by a parent transform.
    }

    protected onDetachFrom(parentEntity: EntityLogic, userData: UserData): void {
        // XXX: detach should be transform by a origin transform.
    }

    protected onUpdate(elapsed: number, realElapsed: number): void {

    }

    protected internalSetVisible(visible: boolean): void {
        this.node.active = visible;
    }

} // class EntityLogic