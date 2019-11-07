@cc._decorator.ccclass
export default abstract class SoundHelperBase extends cc.Component implements atsframework.ISoundHelper {

    abstract releaseSoundAsset(soundAsset: object): void;

}