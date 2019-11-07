/**
 *
 */
@cc._decorator.ccclass
export default abstract class ConfigHelperBase extends cc.Component implements atsframework.IConfigHelper {

    loadConfig(configAsset: object, loadType: atsframework.LoadType, userData: atsframework.UserData): boolean {
        let v_pLoadConfigInfo: LoadConfigInfo = userData as LoadConfigInfo;
        return this.onLoadConfig(v_pLoadConfigInfo.configName, configAsset, loadType, v_pLoadConfigInfo.userData);
    }

    protected abstract onLoadConfig(configName: string, configAsset: object, laodType: atsframework.LoadType, userData: atsframework.UserData): boolean;

    abstract parseConfig(text: string, userData: atsframework.UserData): boolean;
    abstract parseConfig(buffer: ArrayBuffer, userData: atsframework.UserData): boolean;

    abstract releaseConfigAsset(configAssetName: object): void;

} // class ConfigHelperBase

export class LoadConfigInfo {

    static create(configName: string, userData: atsframework.UserData): LoadConfigInfo {
        let v_pLoadConfigInfo: LoadConfigInfo = Object.create(LoadConfigInfo.prototype);
        v_pLoadConfigInfo.configName = configName;
        v_pLoadConfigInfo.userData = userData;
        return v_pLoadConfigInfo;
    }

    configName: string;
    userData: atsframework.UserData;

    clear(): void {
        this.configName = null;
        this.userData = null;
    }

} // class LoadConfigInfo
