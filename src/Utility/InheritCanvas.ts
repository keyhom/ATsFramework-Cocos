import FrameworkComponent from "../Base/FrameworkComponent";
import UIComponent from "../UI/UIComponent";

const { ccclass, property, menu, requireComponent } = cc._decorator;

@ccclass
@menu('ATsFramework Component/Inherit Canvas')
@requireComponent(cc.Widget)
export default class InheritCanvas extends cc.Component {

    private m_pWidget: cc.Widget;

    onLoad() {
        this.m_pWidget = this.getComponent(cc.Widget);
    }

    onDestroy() {
        this.m_pWidget = null;
    }

    start() {
        let v_pUIComp: UIComponent = FrameworkComponent.getComponent(UIComponent);
        if (null != v_pUIComp) {
            null == this.m_pWidget.target && (this.m_pWidget.target = v_pUIComp.node);
        } else {
            cc.warn("No UIComponent found!!");
        }
    }

} // class InheritCanvas
