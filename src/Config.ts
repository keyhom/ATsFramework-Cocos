import { FrameworkComponent } from './Core';

const { ccclass, property, disallowMultiple, menu } = cc._decorator;

@ccclass
@disallowMultiple
@menu('ATsFramework Component/Config')
export class ConfigComponent extends FrameworkComponent {

}

