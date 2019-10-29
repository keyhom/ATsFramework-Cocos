import Helper from "../Utility/Helper";
import UIForm from "./UIForm";
import UIFormHelperBase from "./UIFormHelperBase";
import UIGroupHelperBase from "./UIGroupHelperBase";
import EventComponent from "../Event/EventComponent";
import FrameworkComponent from "../Base/FrameworkComponent";

const { ccclass, property, menu, inspector, disallowMultiple } = cc._decorator;

type IUIForm = atsframework.IUIForm;
type IUIGroup = atsframework.IUIGroup;
type IUIFormHelper = atsframework.IUIFormHelper;
type IUIGroupHelper = atsframework.IUIGroupHelper;
type UserData = atsframework.UserData;
type UIManager = atsframework.UIManager;
const UIManager = atsframework.UIManager;

type FrameworkModule = atsframework.FrameworkModule;
const FrameworkModule = atsframework.FrameworkModule;

export type OpenUIFormSuccessEventArgs = {
    uiForm: UIForm,
    duration: number,
    userData: UserData
};

export type OpenUIFormFailureEventArgs = atsframework.OpenUIFormFailureEventArgs;
export type OpenUIFormUpdateEventArgs = atsframework.OpenUIFormUpdateEventArgs;
export type OpenUIFormDependencyAssetEventArgs = atsframework.OpenUIFormDependencyAssetEventArgs;
export type CloseUIFormCompleteEventArgs = atsframework.CloseUIFormCompleteEventArgs;

export const OpenUIFormSuccessEventId: string = "openUIFormSuccess";
export const OpenUIFormFailureEventId: string = "openUIFormFailure";
export const OpenUIFormUpdateEventId: string = "openUIFormUpdate";
export const CloseUIFormCompleteEventId: string = "closeUIFormComplete";

@ccclass('UIGroupInfo')
export class UIGroupInfo {

    @property(cc.String)
    groupName: string = 'Default';
    @property(cc.Integer)
    depth: number = 0;

} // class UIGroupInfo

const defaultPriority: number = 0;

/**
 *
 * @author Jeremy Chen (keyhom.c@gmail.com)
 */
@ccclass
@disallowMultiple
@menu('ATsFramework Component/UI')
@inspector('packages://atsframework-cocos/inspector/ui-inspector.js')
export default class UIComponent extends FrameworkComponent {

    // UIManager.

    private m_rEventRef: EventComponent = null;
    private m_rUIManager: UIManager = null;

    @property({ displayName: 'Open Success Event' })
    private m_bEnableOpenUIFormSuccessEvent: boolean = true;

    @property({ displayName: 'Open Failure Event' })
    private m_bEnableOpenUIFormFailureEvent: boolean = true;

    @property({ displayName: 'Open Update Event' })
    private m_bEnableOpenUIFormUpdateEvent: boolean = false;

    @property({ displayName: 'Open Dependency Asset Event' })
    private m_bEnableOpenUIFormDependencyAssetEvent: boolean = false;

    @property({ displayName: 'Close Complete Event' })
    private m_bEnableCloseUIFormCompleteEvent: boolean = true;

    @property({ displayName: 'Instance Root', type: cc.Node })
    private m_pInstanceRoot: cc.Node = null;

    @property({ displayName: 'UIForm Helper' })
    private m_sUIFormHelperClassName: string = "DefaultUIFormHelper";

    @property({ displayName: 'Custom UIForm Helper' })
    private m_pCustomUIFormHelper: new () => UIFormHelperBase = null;

    @property({ displayName: 'UI Group Helper' })
    private m_sUIGroupHelperClassName: string = "DefaultUIGroupHelper";

    @property({ displayName: 'Custom UI Group Helper' })
    private m_pCustomUIGroupHelper: new () => UIGroupHelperBase = null;

    @property({ displayName: 'AutoRelase Interval', type: cc.Float })
    private m_fInstanceAutoReleaseInterval: number = 60.0;

    @property({ displayName: 'Capacity', type: cc.Integer })
    private m_uInstanceCapacity: number = 16;

    @property({ displayName: 'Expire Time', type: cc.Float })
    private m_fInstanceExpireTime: number = 60;

    @property({ displayName: 'Priority', type: cc.Integer })
    private m_iInstancePriority: number = 0;

    @property([UIGroupInfo])
    private m_pUIGroups: UIGroupInfo[] = [];

    @property({ displayName: 'UI Groups', type: [UIGroupInfo] })
    get uiGroups(): UIGroupInfo[] { return this.m_pUIGroups; }
    set uiGroups(value) {
        this.m_pUIGroups = value;
    }

    get uiGroupCount(): number {
        return this.m_rUIManager.uiGroupCount;
    }

    private m_pCanvas: cc.Canvas = null;

    onLoad(): void {
        super.onLoad();
        this.m_rUIManager = FrameworkModule.getOrAddModule(UIManager);

        if (null == this.m_rUIManager) {
            cc.error('UI manager is invalid.');
            return;
        }

        this.m_rUIManager.openUIFormSuccess.add(this.onOpenUIFormSuccess, this);
        this.m_rUIManager.openUIFormFailure.add(this.onOpenUIFormFailure, this);
        this.m_rUIManager.openUIFormUpdate.add(this.onOpenUIFormUpdate, this);
        this.m_rUIManager.closeUIFormComplete.add(this.onCloseUIFormComplete, this);
    }

    onDestroy(): void {
        this.m_rUIManager.openUIFormSuccess.remove(this.onOpenUIFormSuccess);
        this.m_rUIManager.openUIFormFailure.remove(this.onOpenUIFormFailure);
        this.m_rUIManager.openUIFormUpdate.remove(this.onOpenUIFormUpdate);
        this.m_rUIManager.closeUIFormComplete.remove(this.onCloseUIFormComplete);
    }

    start(): void {
        this.m_rEventRef = FrameworkComponent.getComponent(EventComponent);
        this.m_rUIManager.resourceManager = FrameworkModule.getModule(atsframework.ResourceManager);
        this.m_rUIManager.objectPoolManager = FrameworkModule.getModule(atsframework.ObjectPoolManager);

        // let v_pUiFormHelper: UIFormHelperBase = Helper.createHelper(this.m_sUIFormHelperClassName, this.m_pCustomUIFormHelper);
        let v_pUiFormHelper: UIFormHelperBase = Helper.createHelper(this.m_sUIFormHelperClassName, null);
        if (null == v_pUiFormHelper) {
            cc.error('Can not create UI form helper.');
            return;
        }

        v_pUiFormHelper.node.name = "UI Form Helper";
        v_pUiFormHelper.node.setParent(this.node);
        v_pUiFormHelper.node.setScale(cc.Vec3.ONE);

        this.m_rUIManager.instanceAutoReleaseInterval = this.m_fInstanceAutoReleaseInterval;
        this.m_rUIManager.instanceCapacity = this.m_uInstanceCapacity;
        this.m_rUIManager.instanceExpireTime = this.m_fInstanceExpireTime;
        this.m_rUIManager.instancePriority = this.m_iInstancePriority;

        this.m_rUIManager.uiFormHelper = v_pUiFormHelper;

        if (null == this.m_pInstanceRoot) {
            this.m_pInstanceRoot = new cc.Node('UI Form Instances');
            this.m_pInstanceRoot.setParent(this.node);
            this.m_pInstanceRoot.setScale(cc.Vec3.ONE);
        }

        // this.m_pInstanceRoot.layer = LayerMask.name2Layer['UI'];

        this.m_pUIGroups.forEach(g => {
            if (!this.addUIGroup(g.groupName, g.depth)) {
                cc.warn(`Add UI group '${g.groupName}' failure.`);
            }
        });


        let v_pCurrentScene: cc.Scene = cc.director.getScene();
        this.m_pCanvas = v_pCurrentScene.getComponentInChildren(cc.Canvas);

        cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, () => {
            let v_pCurrentScene: cc.Scene = cc.director.getScene();
            this.m_pCanvas = v_pCurrentScene.getComponentInChildren(cc.Canvas);
        });

        this._resize();
    }

    update(dt) {
        this._resize();
    }

    private _resize(): void {
        if (this.m_pCanvas) {
            let v_pTarget: cc.Node = this.m_pCanvas.node;
            if (v_pTarget) {
                this.node.position = v_pTarget.position;
                this.node.width = v_pTarget.width;
                this.node.height = v_pTarget.height;
            }
        }
    }

    getUIForm(serialId: number): UIForm;
    getUIForm(uiFormAssetName: string): UIForm;
    getUIForm(serialIdOrUiFormAssetName: number | string): UIForm {
        return this.m_rUIManager.getUIForm(serialIdOrUiFormAssetName) as UIForm;
    }

    getUIForms(uiFormAssetName: string): UIForm[] {
        const v_pForms: IUIForm[] = this.m_rUIManager.getUIForms(uiFormAssetName);
        const v_pRet: UIForm[] = [];

        v_pForms.forEach((value: IUIForm) => {
            v_pRet.push(value as UIForm);
        });

        return v_pRet;
    }

    openUIForm(uiFormAssetName: string, uiGroupName: string): number;
    openUIForm(uiFormAssetName: string, uiGroupName: string, priority: number): number;
    openUIForm(uiFormAssetName: string, uiGroupName: string, pauseCoveredUIForm: boolean): number;
    openUIForm(uiFormAssetName: string, uiGroupName: string, userData: UserData): number;
    openUIForm(uiFormAssetName: string, uiGroupName: string, priority: number, pauseCoveredUIForm: boolean): number;
    openUIForm(uiFormAssetName: string, uiGroupName: string, priority: number, userData: UserData): number;
    openUIForm(uiFormAssetName: string, uiGroupName: string, pauseCoveredUIForm: boolean, userData: UserData): number;
    openUIForm(uiFormAssetName: string, uiGroupName: string, priority: number, pauseCoveredUIForm: boolean, userData: UserData): number;

    openUIForm(uiFormAssetName: string, uiGroupName: string, arg1?: number | boolean | UserData, arg2?: UserData | boolean, arg3?: UserData): number {
        let priority: number = defaultPriority;
        let pauseCoveredUIForm: boolean = false;
        let userData: UserData = null;

        if (undefined != arg1 && 'number' === typeof arg1) {
            priority = arg1;
        }

        if (undefined != arg1 && 'boolean' === typeof arg1) {
            pauseCoveredUIForm = arg1;
        } else if (undefined != arg2 && 'boolean' === typeof arg2) {
            pauseCoveredUIForm = arg2;
        }

        if (undefined != arg1 && ('object' === typeof arg1 || 'function' === typeof arg1 || 'string' === typeof arg1)) {
            userData = arg1;
        } else if (undefined != arg2 && ('object' === typeof arg2 || 'function' === typeof arg2 || 'string' === typeof arg2)) {
            userData = arg2;
        } else if (undefined != arg3 && ('object' === typeof arg3 || 'function' === typeof arg3 || 'string' === typeof arg3)) {
            userData = arg3;
        }

        return this.m_rUIManager.openUIForm(uiFormAssetName, uiGroupName, priority, pauseCoveredUIForm, userData);
    }

    closeUIForm(serialId: number): void;
    closeUIForm(uiForm: UIForm): void;
    closeUIForm(serialId: number, userData: UserData): void;
    closeUIForm(uiForm: UIForm, userData: UserData): void;

    closeUIForm(arg1: any, userData?: UserData): void {
        this.m_rUIManager.closeUIForm(arg1, userData);
    }

    closeAllLoadedUIForms(userData?: object): void {
        this.m_rUIManager.closeAllLoadedUIForms(userData);
    }

    closeAllLoadingUIForms(): void {
        this.m_rUIManager.closeAllLoadingUIForms();
    }

    refocusUIForm(uiForm: UIForm, userData?: object): void {
        this.m_rUIManager.refocusUIForm(uiForm, userData);
    }

    addUIGroup(uiGroupName: string): boolean;
    addUIGroup(uiGroupName: string, depth: number): boolean;
    addUIGroup(uiGroupName: string, depth?: number): boolean {
        depth = depth || 0;
        if (this.m_rUIManager.hasUIGroup(uiGroupName))
            return false;

        // let uiGroupHelper = Helper.createHelper(this.m_sUIGroupHelperClassName, this.m_pCustomUIGroupHelper, this.uiGroupCount);
        let uiGroupHelper = Helper.createHelper(this.m_sUIGroupHelperClassName, null, this.uiGroupCount);
        if (null == uiGroupHelper) {
            cc.error('can not create UI group helper.');
            return false;
        }

        uiGroupHelper.node.name = `UI Group - ${uiGroupName}`;
        // uiGroupHelper.layer
        uiGroupHelper.node.setParent(this.m_pInstanceRoot);
        uiGroupHelper.node.setScale(cc.Vec3.ONE);

        return this.m_rUIManager.addUIGroup(uiGroupName, depth, uiGroupHelper);
    }

    private onOpenUIFormSuccess(eventArgs: OpenUIFormSuccessEventArgs): void {
        if (this.m_bEnableOpenUIFormSuccessEvent)
            this.m_rEventRef.emit(OpenUIFormSuccessEventId, eventArgs);
    }

    private onOpenUIFormFailure(eventArgs: OpenUIFormFailureEventArgs): void {
        cc.warn(`Open UI form failure, asset name '${eventArgs.uiFormAssetName}' , UI group name '${eventArgs.uiGroupName}' , pause covered UI form '${eventArgs.pauseCoveredUIForm}' , error message '${eventArgs.errorMessage}'`); 

        if (this.m_bEnableOpenUIFormFailureEvent)
            this.m_rEventRef.emit(OpenUIFormFailureEventId, eventArgs);
    }

    private onOpenUIFormUpdate(eventArgs: OpenUIFormUpdateEventArgs): void {
        if (this.m_bEnableOpenUIFormUpdateEvent)
            this.m_rEventRef.emit(OpenUIFormUpdateEventId, eventArgs);
    }

    private onCloseUIFormComplete(eventArgs: CloseUIFormCompleteEventArgs): void {
        if (this.m_bEnableCloseUIFormCompleteEvent)
            this.m_rEventRef.emit(CloseUIFormCompleteEventId, eventArgs);
    }

} // class UIComponent
