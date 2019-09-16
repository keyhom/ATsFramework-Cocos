import UIFormHelperBase from "../UIFormHelperBase";
import UIForm from "../UIForm";
import { helper } from "../../Utility/Helper";

const { ccclass, property, menu, inspector, disallowMultiple } = cc._decorator;

type IUIGroup = atsframework.IUIGroup;
type IUIForm = atsframework.IUIForm;
type UserData = atsframework.UserData;

@helper
@ccclass
export class DefaultUIFormHelper extends UIFormHelperBase {

    instantiateUIForm<T extends object>(uiFormAsset: T): T {
        return cc.instantiate(uiFormAsset);
    }

    createUIForm(uiFormInstance: object, uiGroup: IUIGroup, userData: UserData): IUIForm {
        let v_pNodeRef: cc.Node = uiFormInstance as cc.Node;

        if (null == v_pNodeRef) {
            cc.error('UI form instance is invalid.');
            return;
        }

        v_pNodeRef.setParent((<any>uiGroup.helper).node);
        v_pNodeRef.setScale(cc.Vec3.ONE);

        let v_pUiForm = v_pNodeRef.getComponent(UIForm);
        if (null == v_pUiForm) {
            v_pUiForm = v_pNodeRef.addComponent(UIForm);
        }
        return v_pUiForm;
    }

    releaseUIForm<T extends object>(uiFormAsset: T, uiFormInstance: object): void {
        // FIXME: Unload Asset via resource module.
        // TODO: figure out a destory way for cc.Node.
        let v_pNodeRef: cc.Node = uiFormInstance as cc.Node;
        if (null != v_pNodeRef) {
            v_pNodeRef.destroy();
        }
    }

} // class DefaultUIFormHelper


