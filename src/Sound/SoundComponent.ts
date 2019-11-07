import FrameworkComponent from "../Base/FrameworkComponent";
import EventComponent from "../Event/EventComponent";
import Helper from "../Utility/Helper";
import SoundHelperBase from "./SoundHelperBase";
import SoundGroupHelperBase from "./SoundGroupHelperBase";
import SoundAgentHelperBase from "./SoundAgentHelperBase";

const { ccclass, property, disallowMultiple, menu, inspector } = cc._decorator;

type FrameworkModule = atsframework.FrameworkModule;
const FrameworkModule = atsframework.FrameworkModule;

type ResourceManager = atsframework.ResourceManager;
const ResourceManager = atsframework.ResourceManager;

type SoundManager = atsframework.SoundManager;
const SoundManager = atsframework.SoundManager;

type SoundGroup = atsframework.SoundGroup;
const SoundGroup = atsframework.SoundGroup;

type SceneManager = atsframework.SceneManager;
const SceneManager = atsframework.SceneManager;

type UserData = atsframework.UserData;
type PlaySoundParams = atsframework.PlaySoundParams;

export type PlaySoundSuccessEventArgs = {
    serialId: number,
    soundAssetName: string,
    soundAgent: atsframework.ISoundAgent,
    duration: number,
    bindingEntity: null,
    userData: atsframework.UserData
} // type PlaySoundSuccessEventArgs

export type PlaySoundFailureEventArgs = {
    serialId: number,
    soundAssetName: string,
    soundGroupName: string,
    playSoundParams: atsframework.PlaySoundParams,
    bindingEntity: null,
    errorCode: atsframework.PlaySoundErrorCode,
    errorMessage: string,
    userData: atsframework.UserData
} // type PlaySoundFailureEventArgs

export type PlaySoundUpdateEventArgs = {
    serialId: number,
    soundAssetName: string,
    soundGroupName: string,
    playSoundParams: atsframework.PlaySoundParams,
    progress: number,
    bindingEntity: null,
    userData: atsframework.UserData
} // type PlaySoundUpdateEventArgs

export type PlaySoundDependencyAssetEventArgs = {
    serialId: number,
    soundAssetName: string,
    soundGroupName: string,
    playSoundParams: atsframework.PlaySoundParams,
    dependencyAssetName: string,
    loadedCount: number,
    totalCount: number,
    bindingEntity: null,
    userData: atsframework.UserData
} // type PlaySoundDependencyAssetEventArgs

export type PlaySoundInfo = {
    bindingEntity: null,
    worldPosition: cc.Vec3,
    userData: atsframework.UserData
} // type PlaySoundInfo

@ccclass("SoundGroupInfo")
export class SoundGroupInfo {

    @property(cc.String)
    name: string = '';
    @property(cc.Boolean)
    avoidBeingReplacedBySamePriority: boolean = false;
    @property(cc.Boolean)
    mute: boolean = false;
    @property(cc.Float)
    volume: number = 1;
    @property(cc.Integer)
    soundAgentCount: number = 0;
    @property(cc.Boolean)
    autoRelease: boolean = false;

} // SoundGroupInfo

const DefaultPriority: number = 0;

@ccclass
@disallowMultiple
@menu('ATsFramework Component/Sound')
@inspector('packages://atsframework-cocos/inspector/sound-inspector.js')
export default class SoundComponent extends FrameworkComponent {

    private m_pSoundManager!: SoundManager;
    private m_pEventComponent!: EventComponent;

    @property({ displayName: "Enable PlaySound update event" })
    private m_bEnablePlaySoundUpdateEvent: boolean = false;

    @property({ displayName: "Enable PlaySound dependency asset event" })
    private m_bEnablePlaySoundDependencyAssetEvent: boolean = false;

    @property({ displayName: "Instance Root", type: cc.Node })
    private m_pInstanceRoot: cc.Node = null;

    @property({ displayName: "Sound Helper" })
    private m_sSoundHelperTypeName: string = "DefaultSoundHelper";

    @property({ displayName: "Sound Group Helper" })
    private m_sSoundGroupHelperTypeName: string = "DefaultSoundGroupHelper";

    @property({ displayName: "Sound Agent Helper" })
    private m_sSoundAgentHelperTypeName: string = "DefaultSoundAgentHelper";

    @property({ displayName: "Sound Group", type: [SoundGroupInfo] })
    private m_pSoundGroupInfos: SoundGroupInfo[] = [];

    get soundGroupCount(): number {
        return this.m_pSoundManager.soundGroupCount;
    }

    onLoad(): void {
        super.onLoad();

        this.m_pSoundManager = FrameworkModule.getOrAddModule(SoundManager);
        if (!this.m_pSoundManager) {
            throw new Error('Sound manager is invalid.');
        }

        this.m_pSoundManager.playSoundSuccess.add(this.onPlaySoundSuccess, this);
        this.m_pSoundManager.playSoundFailure.add(this.onPlaySoundFailure, this);

        if (this.m_bEnablePlaySoundUpdateEvent) {
            this.m_pSoundManager.playSoundUpdate.add(this.onPlaySoundUpdate, this);
        }

        if (this.m_bEnablePlaySoundDependencyAssetEvent) {
            this.m_pSoundManager.playSoundDependencyAsset.add(this.onPlaySoundDependencyAsset, this);
        }

        let v_pSceneManager: SceneManager = FrameworkModule.getModule(SceneManager);
        if (!v_pSceneManager) {
            throw new Error("Scene manager is invalid.");
        }

        // TODO: scene manager lifecycle via cocos ?
    }

    start(): void {
        this.m_pEventComponent = FrameworkComponent.getComponent(EventComponent);
        if (!this.m_pEventComponent)
            throw new Error("Event component is invalid.");

        this.m_pSoundManager.resourceManager = FrameworkModule.getModule(ResourceManager);

        let v_pSoundHelper: SoundHelperBase = Helper.createHelper(this.m_sSoundHelperTypeName, null);
        if (!v_pSoundHelper) {
            throw new Error("Can not create sound helper.");
        }

        v_pSoundHelper.node.name = "Sound Helper";
        v_pSoundHelper.node.parent = this.node;
        v_pSoundHelper.node.setScale(cc.Vec3.ONE);

        this.m_pSoundManager.soundHelper = v_pSoundHelper;

        if (!this.m_pInstanceRoot) {
            this.m_pInstanceRoot = (new cc.Node("Sound Instances"));
            this.m_pInstanceRoot.parent = this.node;
            this.m_pInstanceRoot.setScale(cc.Vec3.ONE);
        }

        if (this.m_pSoundGroupInfos) {
            for (let i: number = 0; i < this.m_pSoundGroupInfos.length; i++) {
                if (!this.addSoundGroup(
                    this.m_pSoundGroupInfos[i].name,
                    this.m_pSoundGroupInfos[i].avoidBeingReplacedBySamePriority,
                    this.m_pSoundGroupInfos[i].mute,
                    this.m_pSoundGroupInfos[i].volume,
                    this.m_pSoundGroupInfos[i].soundAgentCount)) {
                    cc.warn(`Add sound group '${this.m_pSoundGroupInfos[i].name}' failure.`);
                    continue;
                }
            }
        }
    }

    onDestroy(): void {
        // TODO: unregister listener via scene lifecycle manager in cocos.
    }

    hasSoundGroup(soundGroupName: string): boolean {
        return this.m_pSoundManager.hasSoundGroup(soundGroupName);
    }

    getSoundGroup(soundGroupName: string): SoundGroup {
        return this.m_pSoundManager.getSoundGroup(soundGroupName);
    }

    getAllSoundGroups(): SoundGroup[];
    getAllSoundGroups(results: SoundGroup[]): SoundGroup[];
    getAllSoundGroups(results?: SoundGroup[]): SoundGroup[] {
        return this.m_pSoundManager.getAllSoundGroups(results);
    }

    addSoundGroup(soundGroupName: string, soundAgentHelperCount: number): boolean;
    addSoundGroup(soundGroupName: string, soundGroupAvoidBeingReplacedBySamePriority: boolean, soundGroupMute: boolean, soundGroupVolume: number, soundAgentHelperCount: number): boolean;
    addSoundGroup(soundGroupName: string, anyArg1: boolean | number, soundGroupMute?: boolean, soundGroupVolume?: number, soundAgentHelperCount?: number): boolean {
        if (this.m_pSoundManager.hasSoundGroup(soundGroupName))
            return false;

        let v_pSoundGroupHelper: SoundGroupHelperBase = Helper.createHelper(this.m_sSoundGroupHelperTypeName, null, this.soundGroupCount);
        if (!v_pSoundGroupHelper) {
            throw new Error("Can not create sound group helper.");
        }

        v_pSoundGroupHelper.node.name = `Sound Group - ${soundGroupName}`;
        v_pSoundGroupHelper.node.parent = this.m_pInstanceRoot;
        v_pSoundGroupHelper.node.setScale(cc.Vec3.ONE);

        // TODO: handling audio mix group via cocos.

        let soundGroupAvoidBeingReplacedBySamePriority: boolean = false;

        if ('number' === typeof anyArg1) {
            soundAgentHelperCount = anyArg1;
        } else if ('boolean' === typeof anyArg1) {
            soundGroupAvoidBeingReplacedBySamePriority = anyArg1;
        }

        if (!this.m_pSoundManager.addSoundGroup(soundGroupName, soundGroupAvoidBeingReplacedBySamePriority, soundGroupMute, soundGroupVolume, v_pSoundGroupHelper))
            return false;

        for (let i: number = 0; i < soundAgentHelperCount; i++) {
            if (!this.addSoundAgentHelper(soundGroupName, v_pSoundGroupHelper, i))
                return false;
        }

        return true;
    }

    getAllLoadingSoundSerialIds(): number[];
    getAllLoadingSoundSerialIds(results: number[]): number[];
    getAllLoadingSoundSerialIds(results?: number[]): number[] {
        return this.m_pSoundManager.getAllLoadingSoundSerialIds(results);
    }

    isLoadingSound(serialId: number): boolean {
        return this.m_pSoundManager.isLoadingSound(serialId);
    }

    playSound(soundAssetName: string, soundGroupName: string): number;
    playSound(soundAssetName: string, soundGroupName: string, priority: number): number;
    playSound(soundAssetName: string, soundGroupName: string, playSoundParams: PlaySoundParams): number;
    // playSound(soundAssetName: string, soundGroupName: string, bindingEntity: Entity): number;
    playSound(soundAssetName: string, soundGroupName: string, worldPosition: cc.Vec3): number;
    playSound(soundAssetName: string, soundGroupName: string, userData: UserData): number;
    playSound(soundAssetName: string, soundGroupName: string, priority: number, playSoundParams: PlaySoundParams): number;
    playSound(soundAssetName: string, soundGroupName: string, priority: number, playSoundParams: PlaySoundParams, userData: UserData): number;
    // playSound(soundAssetName: string, soundGroupName: string, priority: number, playSoundParams: PlaySoundParams, bindingEntity: Entity): number;
    // playSound(soundAssetName: string, soundGroupName: string, priority: number, playSoundParams: PlaySoundParams, bindingEntity: Entity, userData: UserData): number;
    playSound(soundAssetName: string, soundGroupName: string, priority: number, playSoundParams: PlaySoundParams, worldPosition: cc.Vec3): number;
    playSound(soundAssetName: string, soundGroupName: string, priority: number, playSoundParams: PlaySoundParams, worldPosition: cc.Vec3, userData: UserData): number;
    playSound(soundAssetName: string, soundGroupName: string, anyArg1?: number | UserData | PlaySoundParams, anyArg2?: PlaySoundParams, anyArg3?: UserData | cc.Vec3, anyArg4?: UserData): number {

        let priority: number = DefaultPriority;
        let playSoundParams: PlaySoundParams = null;
        let userData: UserData = null;
        let worldPosition: cc.Vec3 = cc.Vec3.ZERO;

        if ('number' === typeof anyArg1) {
            priority = anyArg1;
        } else if (undefined != anyArg1) {
            userData = anyArg1 as UserData;
            playSoundParams = anyArg1 as PlaySoundParams;
        }

        if (undefined != anyArg2) {
            playSoundParams = anyArg2;
        }

        if (undefined != anyArg3) {
            worldPosition = anyArg3 as cc.Vec3;
            userData = anyArg3 as UserData;
        }

        if (undefined != anyArg4) {
            userData = anyArg4;
        }

        let v_pInfo: PlaySoundInfo = {
            bindingEntity: null,
            worldPosition: worldPosition,
            userData: userData
        } as PlaySoundInfo;

        return this.m_pSoundManager.playSound(soundAssetName, soundGroupName, priority, playSoundParams, v_pInfo);
    }

    stopSound(serialId: number): boolean;
    stopSound(serialId: number, fadeOutSeconds: number): boolean;
    stopSound(serialId: number, fadeOutSeconds?: number): boolean {
        return this.m_pSoundManager.stopSound(serialId, fadeOutSeconds);
    }

    stopAllLoadedSounds(): void;
    stopAllLoadedSounds(fadeOutSeconds: number): void;
    stopAllLoadedSounds(fadeOutSeconds?: number): void {
        this.m_pSoundManager.stopAllLoadedSounds(fadeOutSeconds);
    }

    stopAllLoadingSounds(): void {
        this.m_pSoundManager.stopAllLoadingSounds();
    }

    pauseSound(serialId: number): void;
    pauseSound(serialId: number, fadeOutSeconds: number): void;
    pauseSound(serialId: number, fadeOutSeconds?: number): void {
        this.m_pSoundManager.pauseSound(serialId, fadeOutSeconds);
    }

    resumeSound(serialId: number): void;
    resumeSound(serialId: number, fadeInSeconds: number): void;
    resumeSound(serialId: number, fadeInSeconds?: number): void {
        this.m_pSoundManager.resumeSound(serialId, fadeInSeconds);
    }

    private addSoundAgentHelper(soundGroupName: string, soundGroupHelper: SoundGroupHelperBase, index: number): boolean {
        let v_pSoundAgentHelper: SoundAgentHelperBase = Helper.createHelper(this.m_sSoundAgentHelperTypeName, null, index);
        if (!v_pSoundAgentHelper) {
            throw new Error("Can not create sound agent helper.");
        }

        v_pSoundAgentHelper.node.name = `Sound Agent Helper - ${soundGroupName} - ${index}`;
        v_pSoundAgentHelper.node.parent = soundGroupHelper.node;
        v_pSoundAgentHelper.node.setScale(cc.Vec3.ONE);

        // TODO: handling audio mix group via cocos.
        this.m_pSoundManager.addSoundAgentHelper(soundGroupName, v_pSoundAgentHelper);
        return true;
    }

    private onPlaySoundSuccess(serialId: number, soundAssetName: string, soundAgent: atsframework.ISoundAgent, duration: number, userData: atsframework.UserData): void {
        let v_pInfo: PlaySoundInfo = userData as PlaySoundInfo;
        if (v_pInfo) {
            let v_pSoundAgentHelper: SoundAgentHelperBase = soundAgent.helper as SoundAgentHelperBase;
            if (v_pInfo.bindingEntity != null) {
                // FIXME: v_pSoundAgentHelper.setBindingEntity(v_pSoundAgentHelper.v_pInfo);
            } else {
                v_pSoundAgentHelper.setWorldPosition(v_pInfo.worldPosition);
            }
        }

        let v_pSoundGroup: atsframework.ISoundGroup = soundAgent.soundGroup;
        for (const groupInfo of this.m_pSoundGroupInfos) {
            if (groupInfo.name == v_pSoundGroup.name) {
                cc.loader.setAutoRelease(soundAssetName, groupInfo.autoRelease);
            }
        }

        this.m_pEventComponent.emit('playSoundSuccess', {
            serialId: serialId,
            soundAssetName: soundAssetName,
            soundAgent: soundAgent,
            duration: duration,
            bindingEntity: null,
            userData: v_pInfo.userData,
        } as PlaySoundSuccessEventArgs);
    }

    private onPlaySoundFailure(serialId: number, soundAssetName: string, soundGroupName: string, playSoundParams: atsframework.PlaySoundParams, errorCode: atsframework.PlaySoundErrorCode, errorMessage: string, userData: atsframework.UserData): void {
        let v_sErrorMessage: string = `Play sound failure, asset name '${soundAssetName}', sound group name '${soundGroupName}', error code '${atsframework.PlaySoundErrorCode[errorCode]}', error message '${errorMessage}'.`;
        if (errorCode == atsframework.PlaySoundErrorCode.IgnoreDueToLowPriority) {
            cc.log(v_sErrorMessage);
        } else {
            cc.warn(v_sErrorMessage);
        }

        this.m_pEventComponent.emit('playSoundFailure', {
            bindingEntity: null,
            serialId: serialId,
            soundAssetName: soundAssetName,
            soundGroupName: soundGroupName,
            errorCode: errorCode,
            errorMessage: v_sErrorMessage,
            playSoundParams: playSoundParams,
            userData: userData
        } as PlaySoundFailureEventArgs);
    }

    private onPlaySoundUpdate(serialId: number, soundAssetName: string, soundGroupName: string, playSoundParams: atsframework.PlaySoundParams, progress: number, userData: atsframework.UserData): void {
        this.m_pEventComponent.emit('playSoundUpdate', {
            serialId: serialId,
            soundAssetName: soundAssetName,
            soundGroupName: soundGroupName,
            bindingEntity: null,
            playSoundParams: playSoundParams,
            progress: progress,
            userData: userData
        } as PlaySoundUpdateEventArgs);
    }

    private onPlaySoundDependencyAsset(serialId: number, soundAssetName: string, soundGroupName: string, playSoundParams: atsframework.PlaySoundParams, dependencyAssetName: string, loadedCount: number, totalCount: number, userData: atsframework.UserData): void {
        this.m_pEventComponent.emit('playSoundDependencyAsset', {
            serialId: serialId,
            soundAssetName: soundAssetName,
            soundGroupName: soundGroupName,
            bindingEntity: null,
            playSoundParams: playSoundParams,
            dependencyAssetName: dependencyAssetName,
            loadedCount: loadedCount,
            totalCount: totalCount,
            userData: userData
        } as PlaySoundDependencyAssetEventArgs);
    }

} // class SoundComponent
