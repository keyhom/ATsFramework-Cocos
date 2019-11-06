import FrameworkComponent from "../Base/FrameworkComponent";

const { ccclass, property, disallowMultiple, menu, inspector } = cc._decorator;

@ccclass
@disallowMultiple
@menu('ATsFramework Component/DataNode')
@inspector('packages://atsframework-cocos/inspector/default-inspector.js')
export default class DataNodeComponent extends FrameworkComponent {

} // class DataNodeComponent