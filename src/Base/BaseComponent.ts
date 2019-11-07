import FrameworkComponent from "./FrameworkComponent";

const { ccclass, property, disallowMultiple, menu, inspector } = cc._decorator;
const { FrameworkModule } = atsframework;

@ccclass
@menu('ATsFramework Component/Base')
@disallowMultiple
@inspector('packages://atsframework-cocos/inspector/base-inspector.js')
export default class BaseComponent extends FrameworkComponent {

    @property
    private _frameRate: number = 30;

    @property({
        displayName: 'FPS',
        tooltip: 'Frame rate per second'
    })
    get frameRate() { return this._frameRate; }
    set frameRate(value) {
        this._frameRate = value;
        cc.game.setFrameRate(value);
    }

    @property
    private _speedMultipiler: number = 1.0;

    @property({
        displayName: 'Speed Multipiler',
        tooltip: 'A global multipiler for ATsFramework update speed.'
    })
    get speedMultipiler() { return this._speedMultipiler; }
    set speedMultipiler(value) {
        this._speedMultipiler = value;
        cc.director.getScheduler().setTimeScale(value);
    }

    @property
    private _neverSleep: boolean = true;

    @property({
        displayName: 'Never Sleep'
    })
    get neverSleep() { return this._neverSleep; }
    set neverSleep(value) {
        this._neverSleep = value;
        // TODO: figer out a way to sleep the renderer.
    }

    private _speedMultipilerBeforePause: number = 0;

    get isPaused(): boolean {
        return cc.game.isPaused();
    }

    @property
    private m_bEnableDynamicAltasPacked: boolean = true;

    @property({ displayName: 'Dynamic Altas', tooltip: 'Enable/Disable cocos dynamic altas feature.' })
    get enableDynamicAltasPacked(): boolean { return this.m_bEnableDynamicAltasPacked; }
    set enableDynamicAltasPacked(value: boolean) {
        this.m_bEnableDynamicAltasPacked = value;
        cc.dynamicAtlasManager.enabled = false;
    }

    onLoad(): void {
        super.onLoad();
        cc.game.addPersistRootNode(this.node);
    }

    onEnable(): void {
        this.frameRate = this.frameRate;
        this.speedMultipiler = this.speedMultipiler;
        this.neverSleep = this.neverSleep;
        this.enableDynamicAltasPacked = this.enableDynamicAltasPacked;
    }

    update(dt: number) {
        FrameworkModule.update(dt, dt);
    }

    onDestroy() {
        FrameworkModule.shutdown();
        cc.game.removePersistRootNode(this.node);
    }

    pause() {
        if (this.isPaused)
            return;

        cc.game.pause();
        this._speedMultipilerBeforePause = this.speedMultipiler;
        this.speedMultipiler = 0;
    }

    resume() {
        if (this.isPaused)
            return;

        cc.game.resume();
        this.speedMultipiler = this._speedMultipilerBeforePause;
    }

} // class BaseComponent

