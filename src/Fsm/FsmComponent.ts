import FrameworkComponent from "../Base/FrameworkComponent";

const { ccclass, property, disallowMultiple, menu, inspector } = cc._decorator;

@ccclass
@disallowMultiple
@menu('ATsFramework Component/Fsm')
@inspector('packages://atsframework-cocos/inspector/default-inspector.js')
export default class FsmComponent extends FrameworkComponent {

    private m_pFsmManager: atsframework.FsmManager;

    onLoad(): void {
        super.onLoad();
        this.m_pFsmManager = atsframework.FrameworkModule.getOrAddModule(atsframework.FsmManager);
        if (null == this.m_pFsmManager) {
            throw new Error("FSM manager is invalid.");
        }
    }

    start(): void {
        // NOOP.
    }

    get count(): number {
        return this.m_pFsmManager.count;
    }

    hasFsm<T>(name: string): boolean;
    hasFsm<T>(type: new () => T): boolean;
    hasFsm<T>(nameOrType: string | (new () => T)): boolean {
        return this.m_pFsmManager.hasFsm(nameOrType);
    }

    getFsm<T>(name: string): atsframework.FsmBase;
    getFsm<T>(type: new () => T): atsframework.FsmBase;
    getFsm<T>(nameOrType: string | (new () => T)): atsframework.FsmBase {
        return this.m_pFsmManager.getFsm(nameOrType);
    }

    getAllFsm(): atsframework.FsmBase[] {
        return this.m_pFsmManager.getAllFsms();
    }

    createFsm<T extends atsframework.FsmBase>(name: string, owner: T, ... states: atsframework.FsmState<T>[]): atsframework.Fsm<T> {
        return this.m_pFsmManager.createFsm(name, owner, states);
    }

    destroyFsm<T extends atsframework.FsmBase>(arg1: string | (new () => T) | T | atsframework.FsmBase): boolean {
        if (typeof arg1 === 'string')
            return this.m_pFsmManager.destroyFsm(arg1);
        else if (typeof arg1 === 'function')
            return this.m_pFsmManager.destroyFsm(arg1 as new () => T);
        else if (typeof arg1 === 'object')
            return this.m_pFsmManager.destroyFsm(arg1 as atsframework.FsmBase);
        return false;
    }

} // class FsmComponent.
