@cc._decorator.ccclass
export default abstract class SoundAgentHelperBase extends cc.Component implements atsframework.ISoundAgentHelper {

    abstract readonly isPlaying: boolean;
    abstract readonly length: number;
    abstract time: number;
    abstract mute: boolean;
    abstract loop: boolean;
    abstract priority: number;
    abstract volume: number;
    abstract pitch: number;
    abstract panStereo: number;
    abstract spatialBlend: number;
    abstract maxDistance: number;
    abstract dopplerLevel: number;
    abstract resetSoundAgent: atsframework.EventHandler<atsframework.ResetSoundAgentEventHandler>;

    abstract play(fadeInSeconds: number): void;
    abstract stop(fadeOutSeconds: number): void;
    abstract pause(fadeOutSeconds: number): void;
    abstract resume(fadeInSeconds: number): void;
    abstract reset(): void;
    abstract setSoundAsset(soundAsset: object): boolean;

    // TODO: abstract setBindingEntity(bindingEntity: Entity): void;
    abstract setWorldPosition(worldPosition: cc.Vec3): void;

} // class SoundAgentHelperBase