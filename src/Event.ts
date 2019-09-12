import { FrameworkComponent } from './Core';

const { ccclass, property, menu, disallowMultiple } = cc._decorator;

@ccclass
@menu('ATsFramework Component/Event')
@disallowMultiple
export class EventComponent extends FrameworkComponent {

    on<T extends Function>(type: string, callback: T, target?: any, useCapture?: boolean): T {
        return this.node.on(type, callback, target, useCapture);
    }

    once<T extends Function>(type: string, callback: T, target?: any, useCapture?: boolean): T {
        return this.node.once(type, callback, target, useCapture);
    }

    off(type: string, callback?: Function, target?: any, useCapture?: boolean): void {
        this.node.off(type, callback, target, useCapture);
    }

    targetOff(target: any): void {
        this.node.targetOff(target);
    }

    hasEventListener(type: string): boolean {
        return this.node.hasEventListener(type);
    }

    emit(type: string, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): void {
        this.node.emit(type, arg1, arg2, arg3, arg4, arg5);
    }

    dispatchEvent(event: cc.Event): void {
        this.node.dispatchEvent(event);
    }

    pauseSystemEvents(recursive: boolean): void {
        this.node.pauseSystemEvents(recursive);
    }

    resumeSystemEvents(recursive: boolean): void {
        this.node.resumeSystemEvents(recursive);
    }

} // class EventComponent

