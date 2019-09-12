import { FrameworkComponent } from "./Core";

const { ccclass, property, disallowMultiple, menu } = cc._decorator;

@ccclass
@disallowMultiple
@menu('ATsFramework Component/Fsm')
export default class FsmComponent extends FrameworkComponent {

}

