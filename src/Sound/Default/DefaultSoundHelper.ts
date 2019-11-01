import SoundHelperBase from "../SoundHelperBase";
import ResourceComponent from "../../Resource/ResourceComponent";
import FrameworkComponent from "../../Base/FrameworkComponent";
import { helper } from "../../Utility/Helper";

@helper
export default class DefaultSoundHelper extends SoundHelperBase {

    private m_pResourceComponent!: ResourceComponent;

    start(): void {
        this.m_pResourceComponent = FrameworkComponent.getComponent(ResourceComponent);
        if (!this.m_pResourceComponent) {
            throw new Error("Resource component is invalid.");
        }
    }

    releaseSoundAsset(soundAsset: object): void {
        // cc.warn(`release sound asset: ${soundAsset}`);
        this.m_pResourceComponent.unloadAsset(soundAsset);
    }

} // class DefaultSoundHelper