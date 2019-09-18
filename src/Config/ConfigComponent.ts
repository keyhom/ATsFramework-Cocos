import FrameworkComponent from "../Base/FrameworkComponent";

const { ccclass, property, disallowMultiple, menu } = cc._decorator;

@ccclass
@disallowMultiple
@menu('ATsFramework Component/Config')
export default class ConfigComponent extends FrameworkComponent {

}

