import FrameworkComponent from "../Base/FrameworkComponent";

const { ccclass, property, disallowMultiple, menu } = cc._decorator;

@ccclass
@disallowMultiple
@menu('ATsFramework Component/DataNode')
export default class DataNodeComponent extends FrameworkComponent {

} // class DataNodeComponent