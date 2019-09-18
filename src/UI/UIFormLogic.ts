import UIForm from "./UIForm";

const { ccclass, property, disallowMultiple, menu } = cc._decorator;

type UserData = atsframework.UserData;

export default abstract class UIFormLogic extends cc.Component {

    private m_bAvailable: boolean = false;
    private m_bVisible: boolean = false;
    private m_iOriginalLayer: number = 0;

    get uiForm(): UIForm {
        return this.getComponent(UIForm);
    }

    get name(): string { return this.node.name; }
    set name(value: string) { this.node.name = value; }

    get available(): boolean { return this.m_bAvailable; }

    get visible(): boolean { return this.m_bAvailable && this.m_bVisible }
    set visible(value:boolean) {
        if (!this.m_bAvailable) {
            cc.log(`UI form '${this.name}' is not available.`);
            return;
        }
        if (this.m_bVisible == value)
            return;

        this.m_bVisible = value;
        this.onSetVisible(value);
    }

    protected constructor() {
        super();
    }

    /**
     * Initialize the UI logic.
     *
     * @param userData a custom user data with any format.
     */
    protected onInit(userData?: UserData): void {
        this.m_iOriginalLayer = 0; // FIXME: figure out how process layer with cocos creator.
    }

    /**
     * When the UI form opening.
     *
     * @param userData a custom user data with any format.
     */
    protected onOpen(userData?: UserData): void {
        this.m_bAvailable = true;
        this.visible = true;
    }

    /**
     * When the UI form closing.
     *
     * @param shutdown whether triggered when closing
     * @param userData a custom user data with any format.
     */
    protected onClose(shutdown: boolean, userData?: UserData): void {
        // this.node.setLayerRecursively(this.m_iOriginalLayer); // FIXME: figure out how processing layer with cocos creator.
        this.visible = false;
        this.m_bAvailable = false;
    }

    protected onPause(): void {
        this.visible = false;
    }

    protected onResume(): void {
        this.visible = true;
    }

    protected onCover(): void {}

    protected onReveal(): void {}

    protected onRefocus(userData: UserData): void {}

    protected onUpdate(elapsed: number, realElapsed: number): void {}

    protected onDepthChanged(uiGroupDepth: number, depthInUIGroup: number): void {}

    protected onSetVisible(value: boolean): void {
        this.node.active = value;
    }

} // class UIFormLogic

