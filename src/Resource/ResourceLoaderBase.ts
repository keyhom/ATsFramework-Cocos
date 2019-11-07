const { ccclass } = cc._decorator;

@ccclass
export default abstract class ResourceLoaderBase extends cc.Component implements atsframework.IResourceLoader {

    abstract hasAsset(assetName: string): boolean;

    abstract loadAsset(assetName: string, loadAssetCallbacks: atsframework.LoadAssetCallbacks): void;
    abstract loadAsset(assetName: string, loadAssetCallbacks: atsframework.LoadAssetCallbacks, userData: atsframework.UserData): void;
    abstract loadAsset<T>(assetName: string, assetType: atsframework.AssetType<T>, loadAssetCallbacks: atsframework.LoadAssetCallbacks): void;
    abstract loadAsset<T>(assetName: string, assetType: atsframework.AssetType<T>, loadAssetCallbacks: atsframework.LoadAssetCallbacks, userData: atsframework.UserData): void;
    abstract loadAsset<T>(assetName: string, priority: number, loadAssetCallbacks: atsframework.LoadAssetCallbacks): void;
    abstract loadAsset<T>(assetName: string, priority: number, loadAssetCallbacks: atsframework.LoadAssetCallbacks, userData: atsframework.UserData): void;
    abstract loadAsset<T>(assetName: string, assetType: atsframework.AssetType<T>, priority: number, loadAssetCallbacks: atsframework.LoadAssetCallbacks): void;
    abstract loadAsset<T>(assetName: string, assetType: atsframework.AssetType<T>, priority: number, loadAssetCallbacks: atsframework.LoadAssetCallbacks, userData: atsframework.UserData): void;

    abstract unloadAsset<T>(asset: T): void;

    abstract loadScene(sceneAssetName: string, loadSceneCallbacks: atsframework.LoadSceneCallbacks): void;
    abstract loadScene(sceneAssetName: string, loadSceneCallbacks: atsframework.LoadSceneCallbacks, userData: atsframework.UserData): void;
    abstract loadScene(sceneAssetName: string, priority: number, loadSceneCallbacks: atsframework.LoadSceneCallbacks): void;
    abstract loadScene(sceneAssetName: string, priority: number, loadSceneCallbacks: atsframework.LoadSceneCallbacks, userData: atsframework.UserData): void;

    abstract unloadScene(sceneAssetName: string, unloadSceneCallbacks: atsframework.UnloadSceneCallbacks): void;
    abstract unloadScene(sceneAssetName: string, unloadSceneCallbacks: atsframework.UnloadSceneCallbacks, userData: atsframework.UserData): void;

    abstract update(elapsed: number): void;
    abstract update(elapsed: number, realElapsed: number): void;

    abstract shutdown(): void;


} // class ResourceLoaderBase