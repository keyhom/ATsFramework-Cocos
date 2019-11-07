const { ccclass, property, disallowMultiple, menu } = cc._decorator;

type IUIGroupHelper = atsframework.IUIGroupHelper;

@ccclass
export default abstract class UIGroupHelperBase extends cc.Component implements IUIGroupHelper {

    setDepth(depth: number): void {
        // NOOP.
    }

} // class UIGroupHelperBase



