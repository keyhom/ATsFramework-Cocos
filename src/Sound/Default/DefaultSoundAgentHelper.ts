import SoundAgentHelperBase from "../SoundAgentHelperBase";
import { helper } from "../../Utility/Helper";

@helper
export default class DefaultSoundAgentHelper extends SoundAgentHelperBase {

    private m_pAudioSource: cc.AudioSource = null;
    private m_fVolumeWhenPause: number = 0;

    private m_pResetSoundAgentEventHandler: atsframework.EventHandler<atsframework.ResetSoundAgentEventHandler> = new atsframework.EventHandler();

    get isPlaying(): boolean {
        return this.m_pAudioSource && this.m_pAudioSource.clip ? this.m_pAudioSource.isPlaying : false;
    }

    get length(): number {
        return this.m_pAudioSource.getDuration();
    }

    get time(): number { return this.m_pAudioSource.getCurrentTime(); }
    set time(value) { this.m_pAudioSource.setCurrentTime(value); }

    get mute(): boolean { return this.m_pAudioSource.mute; }
    set mute(value) { this.m_pAudioSource.mute = value; }

    get loop(): boolean { return this.m_pAudioSource.loop; }
    set loop(value) { this.m_pAudioSource.loop = value; }

    // TODO: priority
    get priority(): number { return 128; }
    set priority(value) {}

    get volume(): number { return this.m_pAudioSource.volume; }
    set volume(value) { this.m_pAudioSource.volume = value; }

    // TODO: pitch
    get pitch(): number { return 0; }
    set pitch(value) {}

    // TODO: panStereo
    get panStereo(): number { return 0; }
    set panStereo(value) {}

    // TODO: spatialBlend
    get spatialBlend(): number { return 0; }
    set spatialBlend(value) {}

    // TODO: maxDistance
    get maxDistance(): number { return 0; }
    set maxDistance(value) {}

    // TODO: dopplerLevel
    get dopplerLevel(): number { return 0; }
    set dopplerLevel(value) {}

    get resetSoundAgent(): atsframework.EventHandler<atsframework.ResetSoundAgentEventHandler> {
        return this.m_pResetSoundAgentEventHandler;
    }

    play(fadeInSeconds: number): void {
        this.unscheduleAllCallbacks();

        this.m_pAudioSource.play();
        if (fadeInSeconds > 0) {
            let v_fVolume: number = this.m_pAudioSource.volume;
            this.m_pAudioSource.volume = 0;
            let v_pFadeToVolume: cc.Tween = new cc.Tween();
            v_pFadeToVolume.target(this.m_pAudioSource);
            v_pFadeToVolume.set({
                volume: 0
            });
            v_pFadeToVolume.to(fadeInSeconds, { volume: v_fVolume }, null);
            v_pFadeToVolume.start();
        }
    }

    stop(fadeOutSeconds: number): void {
        this.unscheduleAllCallbacks();

        if (fadeOutSeconds > 0 && this.node.activeInHierarchy) {
            let v_pStopCo: cc.Tween = new cc.Tween();
            v_pStopCo.target(this.m_pAudioSource);
            v_pStopCo.to(fadeOutSeconds, { volume: 0 }, null);
            v_pStopCo.start();
        } else {
            this.m_pAudioSource.stop();
        }
    }

    pause(fadeOutSeconds: number): void {
        this.unscheduleAllCallbacks();

        this.m_fVolumeWhenPause = this.m_pAudioSource.volume;
        if (fadeOutSeconds > 0 && this.node.activeInHierarchy) {
            let v_pPauseCo: cc.Tween = new cc.Tween();
            v_pPauseCo.target(this.m_pAudioSource);
            v_pPauseCo.to(fadeOutSeconds, { volume: 0 }, null);
            v_pPauseCo.then(cc.callFunc(() => {
                this.m_pAudioSource.pause();
            }));
            v_pPauseCo.start();
        } else {
            this.m_pAudioSource.pause();
        }
    }

    resume(fadeInSeconds: number): void {
        this.unscheduleAllCallbacks();

        this.m_pAudioSource.resume();
        if (fadeInSeconds > 0) {
            let v_pFadeToVolume: cc.Tween = new cc.Tween();
            v_pFadeToVolume.target(this.m_pAudioSource);
            v_pFadeToVolume.to(fadeInSeconds, { volume: this.m_fVolumeWhenPause }, null);
            v_pFadeToVolume.start();
        } else {
            this.m_pAudioSource.volume = this.m_fVolumeWhenPause;
        }
    }

    reset(): void {
        this.m_pAudioSource.clip = null;
        this.m_fVolumeWhenPause = 0;
    }

    setSoundAsset(soundAsset: object): boolean {
        let v_pClip: cc.AudioClip = soundAsset as cc.AudioClip;
        if (!v_pClip)
            return false;

        this.m_pAudioSource.clip = v_pClip;
        return true;
    }

    setWorldPosition(worldPosition: cc.Vec3): void {
        // NOTE: should be used in 3D world.
    }

    onLoad(): void {
        // super.onLoad();

        this.m_pAudioSource = this.getComponent(cc.AudioSource) || this.addComponent(cc.AudioSource);
        this.m_pAudioSource.playOnLoad = false;
    }

    update(dt: number): void {
        if (!this.isPlaying && this.m_pAudioSource.clip && this.m_pResetSoundAgentEventHandler.isValid) {
            this.m_pResetSoundAgentEventHandler.iter((callbackFn: atsframework.ResetSoundAgentEventHandler) => {
                callbackFn(/*ResetSoundAgentEventArgs*/);
            });
        }

        // if (this.m_pBindingEntityLogic) {
        //     this.updateAgentPosition();
        // }
    }


} // class DefaultSoundAgentHelper