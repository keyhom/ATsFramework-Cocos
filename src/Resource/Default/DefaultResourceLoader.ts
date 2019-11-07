import ResourceLoaderBase from "../ResourceLoaderBase";
import { helper } from "../../Utility/Helper";

@helper
export default class DefaultResourceLoader extends ResourceLoaderBase implements atsframework.IResourceLoader {

    hasAsset(assetName: string): boolean {
        return cc.loader.getRes(assetName);
    }

    loadAsset(assetName: string, loadAssetCallbacks: atsframework.LoadAssetCallbacks): void;
    loadAsset(assetName: string, loadAssetCallbacks: atsframework.LoadAssetCallbacks, userData: atsframework.UserData): void;
    loadAsset<T>(assetName: string, assetType: atsframework.AssetType<T>, loadAssetCallbacks: atsframework.LoadAssetCallbacks): void;
    loadAsset<T>(assetName: string, assetType: atsframework.AssetType<T>, loadAssetCallbacks: atsframework.LoadAssetCallbacks, userData: atsframework.UserData): void;
    loadAsset<T>(assetName: string, priority: number, loadAssetCallbacks: atsframework.LoadAssetCallbacks): void;
    loadAsset<T>(assetName: string, priority: number, loadAssetCallbacks: atsframework.LoadAssetCallbacks, userData: atsframework.UserData): void;
    loadAsset<T>(assetName: string, assetType: atsframework.AssetType<T>, priority: number, loadAssetCallbacks: atsframework.LoadAssetCallbacks): void;
    loadAsset<T>(assetName: string, assetType: atsframework.AssetType<T>, priority: number, loadAssetCallbacks: atsframework.LoadAssetCallbacks, userData: atsframework.UserData): void;
    loadAsset<T>(assetName: string, arg1: any, arg2?: any, arg3?: any, arg4?: any) {
        let v_pAssetType: atsframework.AssetType<T> = null;
        let v_iPriority: number = 0;
        let v_pLoadAssetCallbacks: atsframework.LoadAssetCallbacks = null;
        let v_pUserData: atsframework.UserData = null;

        // if ('undefined' !== typeof arg4)
        //     v_pUserData = arg4;

        // if ('undefined' !== typeof arg3)
        //     v_pLoadAssetCallbacks = arg3;

        // if ('undefined' !== typeof arg2)
        //     v_iPriority = arg2;

        if ('number' === typeof arg1)
            v_iPriority = arg1;
        else if (undefined == v_pLoadAssetCallbacks)
            v_pLoadAssetCallbacks = arg1;
        else if (undefined == v_pAssetType)
            v_pAssetType = arg1;

        if (undefined !== arg2) {
            if (v_pAssetType && 'number' === typeof arg2)
                v_iPriority = arg2;
            else if (null == v_pLoadAssetCallbacks)
                v_pLoadAssetCallbacks = arg2;
            else if (v_pLoadAssetCallbacks && null == v_pUserData)
                v_pUserData = arg2;
        }

        if (undefined !== arg3) {
            if (null == v_pLoadAssetCallbacks) {
                v_pLoadAssetCallbacks = arg3;
            } else if (null == v_pUserData)
                v_pUserData = arg3;
        }

        if (undefined !== arg4) {
            v_pUserData = arg4;
        }

        // let v_fStartStamp: number = new Date().valueOf();
        // cc.loader.loadRes(assetName, (completedCount: number, totalCount: number, item: any) => {
        //     if (v_pLoadAssetCallbacks) {
        //         v_pLoadAssetCallbacks.update(assetName, 1.0 * completedCount / totalCount, v_pUserData);
        //     }
        // }, (error: Error, resource: any) => {
        //     if (!v_pLoadAssetCallbacks)
        //         return;

        //     if (error) {
        //         v_pLoadAssetCallbacks.failure(assetName, atsframework.LoadResourceStatus.AssetError, error.message, v_pUserData);
        //     } else {
        //         v_pLoadAssetCallbacks.success(assetName, resource, new Date().valueOf() - v_fStartStamp, v_pUserData);
        //     }
        // });
        this.loadAssetImpl<T>(assetName, v_pLoadAssetCallbacks, v_pUserData);
    }

    protected loadAssetImpl<T>(assetName: string, loadAssetCallbacks: atsframework.LoadAssetCallbacks, userData: atsframework.UserData): void {
        let v_pLoadAssetCallbacks: atsframework.LoadAssetCallbacks = loadAssetCallbacks;
        let v_pUserData: atsframework.UserData = userData;
        let v_fStartStamp: number = new Date().valueOf();
        cc.loader.loadRes(assetName, (completedCount: number, totalCount: number, item: any) => {
            if (v_pLoadAssetCallbacks) {
                v_pLoadAssetCallbacks.update(assetName, 1.0 * completedCount / totalCount, v_pUserData);
            }
        }, (error: Error, resource: any) => {
            if (!v_pLoadAssetCallbacks)
                return;

            if (error) {
                v_pLoadAssetCallbacks.failure(assetName, atsframework.LoadResourceStatus.AssetError, error.message, v_pUserData);
            } else {
                v_pLoadAssetCallbacks.success(assetName, resource, new Date().valueOf() - v_fStartStamp, v_pUserData);
            }
        });
    }

    unloadAsset<T>(asset: T): void {
        if (!(asset instanceof cc.Asset))
            return;

        let v_pAsset: cc.Asset = asset as cc.Asset;
        this.unloadAssetImpl(v_pAsset);
    }

    protected unloadAssetImpl(asset: cc.Asset): void {
        if (!asset.isValid)
            return;

        if (!cc.loader.isAutoRelease(asset))
            cc.loader.releaseAsset(asset);
        // else
        //     cc.warn(`Unload invalid asset: ${asset}`);
    }

    loadScene(sceneAssetName: string, loadSceneCallbacks: atsframework.LoadSceneCallbacks): void;
    loadScene(sceneAssetName: string, loadSceneCallbacks: atsframework.LoadSceneCallbacks, userData: atsframework.UserData): void;
    loadScene(sceneAssetName: string, priority: number, loadSceneCallbacks: atsframework.LoadSceneCallbacks): void;
    loadScene(sceneAssetName: string, priority: number, loadSceneCallbacks: atsframework.LoadSceneCallbacks, userData: atsframework.UserData): void;
    loadScene(sceneAssetName: string, arg1: any, arg2?: any, arg3?: any) {
        let v_iPriority: number = 0;
        let v_pLoadSceneCallbacks: atsframework.LoadSceneCallbacks = null;
        let v_pUserData: atsframework.UserData = null;

        if ('number' === typeof arg1)
            v_iPriority = arg1;
        else
            v_pLoadSceneCallbacks = arg1;

        if ('undefined' !== typeof arg2 && 'undefined' !== typeof arg3)
            v_pLoadSceneCallbacks = arg2;
        else if (null != v_pLoadSceneCallbacks)
            v_pUserData = arg2;

        if ('undefined' !== typeof arg3)
            v_pUserData = arg3;

        let v_fStartStamp: number = new Date().valueOf();

        // FIXME: figure out how fill the load scene events with cocos.
        cc.director.loadScene(sceneAssetName, () => {
            v_pLoadSceneCallbacks.success(sceneAssetName, new Date().valueOf() - v_fStartStamp, v_pUserData);
        });
    }

    unloadScene(sceneAssetName: string, unloadSceneCallbacks: atsframework.UnloadSceneCallbacks): void;
    unloadScene(sceneAssetName: string, unloadSceneCallbacks: atsframework.UnloadSceneCallbacks, userData: atsframework.UserData): void;
    unloadScene(sceneAssetName: string, unloadSceneCallbacks: atsframework.UnloadSceneCallbacks, userData?: any) {
        let v_pScene: cc.SceneAsset = cc.loader.getRes(sceneAssetName, cc.SceneAsset);
        try {
            this.unloadAsset(v_pScene);
            unloadSceneCallbacks.success(sceneAssetName, userData);
        } catch (e) {
            unloadSceneCallbacks.failure(sceneAssetName, userData);
        }
    }

    update(elapsed: number): void;
    update(elapsed: number, realElapsed: number): void;
    update(elapsed: number, realElapsed?: number): void {
        // NOOP.
    }

    shutdown(): void {
        cc.loader.releaseAll();
    }

} // class CocosResourceLoader
