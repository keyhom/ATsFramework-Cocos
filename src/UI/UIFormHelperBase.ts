const { ccclass, property, disallowMultiple, menu } = cc._decorator;

type IUIFormHelper = atsframework.IUIFormHelper;
type IUIGroup = atsframework.IUIGroup;
type IUIForm = atsframework.IUIForm;
type UserData = atsframework.UserData;

@ccclass
export default abstract class UIFormHelperBase extends cc.Component implements IUIFormHelper {

    abstract instantiateUIForm<T extends object>(uiFormAsset: T): T;
    abstract createUIForm(uiFormInstance: object, uiGroup: IUIGroup, userData: UserData): IUIForm;
    abstract releaseUIForm<T extends object>(uiFormAsset: T, uiFormInstance: object): void;

} // class UIFormHelperBase


