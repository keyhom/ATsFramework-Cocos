import FrameworkComponent from "../Base/FrameworkComponent";

const { ccclass, property, menu, disallowMultiple, inspector } = cc._decorator;

@ccclass
@disallowMultiple
@menu('ATsFramework Component/Event')
@inspector('packages://atsframework-cocos/inspector/default-inspector.js')
export default class EventComponent extends FrameworkComponent {

    private m_pEventManager: atsframework.EventManager = null;

    onLoad(): void {
        super.onLoad();

        this.m_pEventManager = atsframework.FrameworkModule.getOrAddModule(atsframework.EventManager);
        if (null == this.m_pEventManager) {
            throw new Error("Event manager is invalid.");
        }
    }

    start(): void {
        // NOOP.
    }

    count(eventId: atsframework.EventID): number {
        return this.m_pEventManager.count(eventId);
    }

    check<T extends Function>(eventId: atsframework.EventID): boolean;
    check<T extends Function>(eventId: atsframework.EventID, handler: T): boolean;
    check<T extends Function>(eventId: atsframework.EventID, handler?: T): boolean {
        return this.m_pEventManager.check(eventId, handler);
    }

    // on<T extends Function>(type: string, callback: T, target?: any, useCapture?: boolean): T {
    on<T extends Function>(type: atsframework.EventID, callback: T, target?: any): void {
        // return this.node.on(type, callback, target, useCapture);
        this.m_pEventManager.on(type, callback, target);
    }

    // once<T extends Function>(type: string, callback: T, target?: any, useCapture?: boolean): T {
    // once<T extends Function>(type: atsframework.EventID, callback: T): void {
        // return this.node.once(type, callback, target, useCapture);
        // this.m_pEventManager.once(type, callback);
    // }

    // off(type: string, callback?: Function, target?: any, useCapture?: boolean): void {
    off(type: atsframework.EventID, callback?: Function, target?: any): void {
        // this.node.off(type, callback, target, useCapture);
        this.m_pEventManager.off(type, callback, target);
    }

    // targetOff(target: any): void {
    //     this.node.targetOff(target);
    // }

    // hasEventListener(type: string): boolean {
    // hasEventListener(type: atsframework.EventID): boolean {
        // return this.node.hasEventListener(type);
        // return this.m_pEventManager.hasEventListener(type);
    // }

    // emit(type: string, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): void {
    emit(type: atsframework.EventID, ... args: any[]): void {
        // this.node.emit(type, arg1, arg2, arg3, arg4, arg5);
        args.unshift(type);
        this.m_pEventManager.emit.apply(this.m_pEventManager, args);
    }

    // dispatchEvent(event: cc.Event): void {
    //     this.node.dispatchEvent(event);
    // }

    // pauseSystemEvents(recursive: boolean): void {
    //     this.node.pauseSystemEvents(recursive);
    // }

    // resumeSystemEvents(recursive: boolean): void {
    //     this.node.resumeSystemEvents(recursive);
    // }

} // class EventComponent

