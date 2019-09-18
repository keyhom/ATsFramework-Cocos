import UIFormLogic from "./UIFormLogic";

type IUIForm = atsframework.IUIForm;
type IUIGroup = atsframework.IUIGroup;
type UserData = atsframework.UserData;

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIForm extends cc.Component implements IUIForm {

    private m_iSerialId: number = 0;
    get serialId(): number { return this.m_iSerialId; }

    private m_sUiFormAssetName: string = null;
    get uiFormAssetName(): string { return this.m_sUiFormAssetName; }

    get handle(): any { return this.node; }

    private m_pUiGroup: IUIGroup = null;
    get uiGroup(): IUIGroup { return this.m_pUiGroup; }

    private m_iDepthInUIGroup: number = 0;
    get depthInUIGroup(): number { return this.m_iDepthInUIGroup; }

    private m_bPauseCoveredUIFrom: boolean = false;
    get pauseCoveredUIForm(): boolean { return this.m_bPauseCoveredUIFrom; }

    private m_rUIFormLogic: UIFormLogic;
    get logic(): UIFormLogic { return this.m_rUIFormLogic; }

    onInit(serialId: number, uiFormAssetName: string, uiGroup: IUIGroup, pauseCoveredUIForm: boolean, isNewInstance: boolean, userData: UserData): void {
        this.m_iSerialId = serialId;
        this.m_sUiFormAssetName = uiFormAssetName;
        if (isNewInstance) {
            this.m_pUiGroup = uiGroup;
        } else if (this.m_pUiGroup != uiGroup) {
            cc.error('UI group is inconsistent for non-new-instance UI form.');
            return;
        }

        this.m_iDepthInUIGroup = 0;
        this.m_bPauseCoveredUIFrom = pauseCoveredUIForm;

        if (!isNewInstance)
            return;

        this.m_rUIFormLogic = this.getComponent(UIFormLogic);
        if (null == this.m_rUIFormLogic) {
            cc.error(`UI form '${uiFormAssetName}' can not get UI form logic.`);
            return;
        }

        (<any>this.m_rUIFormLogic).onInit(userData);
    }

    onRecycle(): void {
        this.m_iSerialId = 0;
        this.m_iDepthInUIGroup = 0;
        this.m_bPauseCoveredUIFrom = true;
    }

    onOpen(userData?: UserData): void {
        (<any>this.m_rUIFormLogic).onOpen(userData);
    }

    onClose(shutdown: boolean, userData?: UserData): void {
        (<any>this.m_rUIFormLogic).onClose(shutdown, userData);
    }

    onPause(): void {
        (<any>this.m_rUIFormLogic).onPause();
    }

    onResume(): void {
        (<any>this.m_rUIFormLogic).onResume();
    }

    onCover(): void {
        (<any>this.m_rUIFormLogic).onCover();
    }

    onReveal(): void {
        (<any>this.m_rUIFormLogic).onReveal();
    }

    onRefocus(userData?: UserData): void {
        (<any>this.m_rUIFormLogic).onRefocus(userData);
    }

    onUpdate(elapsed: number, realElapsed: number): void {
        (<any>this.m_rUIFormLogic).onUpdate(elapsed, realElapsed);
    }

    onDepthChanged(uiGroupDepth: number, depthInUIGroup: number): void {
        this.m_iDepthInUIGroup = depthInUIGroup;
        (<any>this.m_rUIFormLogic).onDepthChanged(uiGroupDepth, depthInUIGroup);
    }

} // class UIForm

