import FrameworkComponent from "../Base/FrameworkComponent";
import EventComponent from "../Event/EventComponent";

const { ccclass, property, disallowMultiple, menu, inspector } = cc._decorator;

type UserData = atsframework.UserData;

const SceneManager = atsframework.SceneManager;
type SceneManager = atsframework.SceneManager;

const ResourceManager = atsframework.ResourceManager;
type ResourceManager = atsframework.ResourceManager;

const FrameworkModule = atsframework.FrameworkModule;
type FrameworkModule = atsframework.FrameworkModule;

export type LoadSceneSuccessEventArgs = {
    sceneAssetName: string,
    duration: number,
    userData: UserData
};

export type LoadSceneFailureEventArgs = {
    sceneAssetName: string,
    errorMessage: string,
    userData: UserData
};

export type LoadSceneUpdateEventArgs = {
    sceneAssetName: string,
    progress: number,
    userData: UserData
};

export type LoadSceneDependencyAssetEventArgs = {
    sceneAssetName: string,
    dependencyAssetName: string,
    loadedCount: number,
    totalCount: number,
    userData: UserData
};

export type UnloadSceneSuccessEventArgs = {
    sceneAssetName: string,
    userData: UserData
};

export type UnloadSceneFailureEventArgs = {
    sceneAssetName: string,
    userData: UserData
};

export const LoadSceneSuccessEventId: string = "loadSceneSuccess";
export const LoadSceneFailureEventId: string = "loadSceneFailure";
export const LoadSceneUPdateEventId: string = "loadSceneUpdate";
export const LoadSceneDependencyAssetEventId: string = "loadSceneDependencyAsset";
export const UnloadSceneSuccessEventId: string = "unloadSceneSuccess";
export const UnloadSceneFailureEventId: string = "unloadSceneFailure";

@ccclass
@disallowMultiple
@menu('ATsFramework Component/Scene')
@inspector('packages://atsframework-cocos/inspector/scene-inspector.js')
export default class SceneComponent extends FrameworkComponent {

    private m_pEventComponent!: EventComponent;
    private m_pSceneManager!: SceneManager;

    @property({
        displayName: "Enable Update Event",
        tooltip: 'Enable/Disable the update event dispatch'
    })
    private m_bEnableLoadSceneUpdateEvent: boolean = false;

    @property({
        displayName: "Enable Dependency Asset Event",
        tooltip: 'Enable/Disable the dependency asset event dispatch'
    })
    private m_bEnableLoadSceneDependencyAssetEvent: boolean = false;

    private m_pMainCamera!: cc.Camera;
    get mainCamera(): cc.Camera { return this.m_pMainCamera; }

    onLoad(): void {
        super.onLoad();

        this.m_pSceneManager = FrameworkModule.getOrAddModule(SceneManager);
        if (null == this.m_pSceneManager) {
            throw new Error("Scene manager is invalid.");
        }

        this.m_pSceneManager.resourceManager = FrameworkModule.getModule(ResourceManager);

        this.m_pSceneManager.loadSceneSuccess.add(this.onLoadSceneSuccess, this);
        this.m_pSceneManager.loadSceneFailure.add(this.onLoadSceneFailure, this);

        if (this.m_bEnableLoadSceneUpdateEvent) {
            this.m_pSceneManager.loadSceneUpdate.add(this.onLoadSceneUpdate, this);
        }

        if (this.m_bEnableLoadSceneDependencyAssetEvent) {
            this.m_pSceneManager.loadSceneDependencyAsset.add(this.onLoadSceneDependencyAsset, this);
        }

        this.m_pSceneManager.unloadSceneSuccess.add(this.onUnloadSceneSuccess, this);
        this.m_pSceneManager.unloadSceneFailure.add(this.onUnloadSceneFailure, this);
    }

    start(): void {
        this.m_pEventComponent = FrameworkComponent.getComponent(EventComponent);
        if (null == this.m_pEventComponent) {
            throw new Error("Event component is invalid.");
        }
    }

    sceneIsLoaded(sceneAssetName: string): boolean {
        return this.m_pSceneManager.sceneIsLoaded(sceneAssetName);
    }

    getLoadedSceneAssetNames(results?: string[]): string[] {
        return this.m_pSceneManager.getLoadedSceneAssetNames(results);
    }

    sceneIsLoading(sceneAssetName: string): boolean {
        return this.m_pSceneManager.sceneIsLoading(sceneAssetName);
    }

    getLoadingSceneAssetNames(results?: string[]): string[] {
        return this.m_pSceneManager.getLoadingSceneAssetNames(results);
    }

    sceneIsUnloading(sceneAssetName: string): boolean {
        return this.m_pSceneManager.sceneIsUnloading(sceneAssetName);
    }

    getUnloadingSceneAssetNames(results?: string[]): string[] {
        return this.m_pSceneManager.getUnloadingSceneAssetNames(results);
    }

    loadScene(sceneAssetName: string): void;
    loadScene(sceneAssetName: string, priority: number): void;
    loadScene(sceneAssetName: string, userData: atsframework.UserData): void;
    loadScene(sceneAssetName: string, priority: number, userData: atsframework.UserData): void;
    loadScene(sceneAssetName: string, anyArg1?: any, anyArg2?: any): void {
        return this.m_pSceneManager.loadScene(sceneAssetName, anyArg1, anyArg2);
    }

    unloadScene(sceneAssetName: string): void;
    unloadScene(sceneAssetName: string, userData: atsframework.UserData): void;
    unloadScene(sceneAssetName: string, userData?: atsframework.UserData): void {
        this.m_pSceneManager.unloadScene(sceneAssetName, userData);
    }

    static getSceneName(sceneAssetName: string): string {
        if (!sceneAssetName) {
            cc.error("Scene asset name is invalid.");
            return null;
        }

        let v_idx: number = sceneAssetName.lastIndexOf('/');
        if (v_idx + 1 >= sceneAssetName.length) {
            cc.error(`Scene asset name '${sceneAssetName}' is invalid.`);
            return null;
        }

        let v_sSceneName: string = sceneAssetName.substring(v_idx + 1);
        v_idx = v_sSceneName.lastIndexOf('.scene');
        if (v_idx > 0) {
            v_sSceneName = v_sSceneName.substring(0, v_idx);
        }

        return v_sSceneName;
    }

    private onLoadSceneSuccess(sceneAssetName: string, duration: number, userData: atsframework.UserData): void {
        cc.log(`Load scene '${sceneAssetName}' success.`);

        this.m_pMainCamera = cc.Camera.main;

        this.m_pEventComponent.emit(LoadSceneSuccessEventId, {
            sceneAssetName: sceneAssetName,
            duration: duration,
            userData: userData
        } as LoadSceneSuccessEventArgs);
    }

    private onLoadSceneFailure(sceneAssetName: string, errorMessage: string, userData: atsframework.UserData): void {
        cc.error(`Load scene '${sceneAssetName}' failure.`);

        this.m_pEventComponent.emit(LoadSceneFailureEventId, {
            sceneAssetName: sceneAssetName,
            errorMessage: errorMessage,
            userData: userData
        } as LoadSceneFailureEventArgs);
    }

    private onLoadSceneUpdate(sceneAssetName: string, progress: number, userData: atsframework.UserData): void {
        this.m_pEventComponent.emit(LoadSceneUPdateEventId, {
            sceneAssetName: sceneAssetName,
            progress: progress,
            userData: userData
        } as LoadSceneUpdateEventArgs);
    }

    private onLoadSceneDependencyAsset(sceneAssetName: string, dependencyAssetName: string, loadedCount: number, totalCount: number, userData: atsframework.UserData): void {
        this.m_pEventComponent.emit(LoadSceneDependencyAssetEventId, {
            sceneAssetName: sceneAssetName,
            dependencyAssetName: dependencyAssetName,
            loadedCount: loadedCount,
            totalCount: totalCount,
            userData: userData
        } as LoadSceneDependencyAssetEventArgs);
    }

    private onUnloadSceneSuccess(sceneAssetName: string, userData: atsframework.UserData): void {
        this.m_pEventComponent.emit(UnloadSceneSuccessEventId, {
            sceneAssetName: sceneAssetName,
            userData: userData
        } as UnloadSceneSuccessEventArgs);
    }

    private onUnloadSceneFailure(sceneAssetName: string, userData: atsframework.UserData): void {
        this.m_pEventComponent.emit(UnloadSceneFailureEventId, {
            sceneAssetName: sceneAssetName,
            userData: userData
        } as UnloadSceneFailureEventArgs);
    }

} // class SceneComponent
