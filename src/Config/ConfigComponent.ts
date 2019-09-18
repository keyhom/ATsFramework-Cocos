import FrameworkComponent from "../Base/FrameworkComponent";
import Helper from "../Utility/Helper";
import ConfigHelperBase, { LoadConfigInfo } from "./ConfigHelperBase";
import EventComponent from "../Event/EventComponent";

const { ccclass, property, disallowMultiple, menu } = cc._decorator;

type ConfigManager = atsframework.ConfigManager;
const ConfigManager = atsframework.ConfigManager;

type FrameworkModule = atsframework.FrameworkModule;
const FrameworkModule = atsframework.FrameworkModule;

type ResourceManager = atsframework.ResourceManager;
const ResourceManager = atsframework.ResourceManager;

export type LoadConfigSuccessEventArgs = {
    configName: string,
    configAssetName: string,
    loadType: atsframework.LoadType,
    duration: number,
    userData: atsframework.UserData
};

@ccclass
@disallowMultiple
@menu('ATsFramework Component/Config')
export default class ConfigComponent extends FrameworkComponent {

    private m_pConfigManager: ConfigManager = null;
    private m_pEventComponent: EventComponent = null;

    @property
    private m_bEnableLoadConfigUpdateEvent: boolean = false;
    @property
    private m_bEnableLoadConfigDependencyAssetEvent: boolean = false;
    @property
    private m_sConfigHelperTypeName: string = "DefaultConfigHelper";

    get configCount(): number {
        return this.m_pConfigManager.configCount;
    }

    onLoad(): void {
        super.onLoad();

        this.m_pConfigManager = FrameworkModule.getOrAddModule(ConfigManager);
        if (null == this.m_pConfigManager) {
            throw new Error("Config manager is invalid.");
        }

        this.m_pConfigManager.loadConfigSuccess.add(this.onLoadConfigSuccess);
        this.m_pConfigManager.loadConfigFailure.add(this.onLoadConfigFailure);

        if (this.m_bEnableLoadConfigUpdateEvent) {
            this.m_pConfigManager.loadConfigUpdate.add(this.onLoadConfigUpdate);
        }

        if (this.m_bEnableLoadConfigDependencyAssetEvent) {
            this.m_pConfigManager.loadConfigDependencyAsset.add(this.onLoadConfigDependencyAsset);
        }
    }

    start(): void {
        this.m_pConfigManager.resourceManager = FrameworkModule.getModule(ResourceManager);

        let v_pConfigHelper: ConfigHelperBase = Helper.createHelper(this.m_sConfigHelperTypeName, null);
        if (null == v_pConfigHelper) {
            throw new Error("Can not create config helper.");
        }

        v_pConfigHelper.name = "Config Helper";
        v_pConfigHelper.node.parent = this.node;
        v_pConfigHelper.node.setScale(cc.Vec3.ONE);

        this.m_pConfigManager.configHelper = v_pConfigHelper;

        this.m_pEventComponent = FrameworkComponent.getComponent(EventComponent);
        if (null == this.m_pEventComponent) {
            throw new Error("Event component is invalid.");
        }
    }

    loadConfig(configName: string, configAssetName: string, loadType: atsframework.LoadType): void;
    loadConfig(configName: string, configAssetName: string, loadType: atsframework.LoadType, priority: number): void;
    loadConfig(configName: string, configAssetName: string, loadType: atsframework.LoadType, userData: atsframework.UserData): void;
    loadConfig(configName: string, configAssetName: string, loadType: atsframework.LoadType, priority: number, userData: atsframework.UserData): void;
    loadConfig(configName: string, configAssetName: string, loadType: atsframework.LoadType, priorityOrUserData?: number | atsframework.UserData, userData?: atsframework.UserData): void {
        if (!configName) {
            cc.error("Config name is invalid.");
            return;
        }

        let v_fPriority: number = 0;
        let v_pUserData: atsframework.UserData = null;

        if ('number' === typeof priorityOrUserData) {
            v_fPriority = priorityOrUserData;
        } else if ('undefined' !== typeof priorityOrUserData) {
            v_pUserData = priorityOrUserData;
        }

        if ('undefined' !== typeof userData) {
            v_pUserData = userData;
        }

        this.m_pConfigManager.loadConfig(configAssetName, loadType, v_fPriority, LoadConfigInfo.create(configName, v_pUserData));
    }

    parseConfig(text: string): boolean;
    parseConfig(text: string, userData: atsframework.UserData): boolean;
    parseConfig(buffer: ArrayBuffer): boolean;
    parseConfig(buffer: ArrayBuffer, userData: atsframework.UserData): boolean;
    parseConfig(textOrBuffer: any, userData?: atsframework.UserData): boolean {
        return this.m_pConfigManager.parseConfig(textOrBuffer, userData);
    }

    hasConfig(configName: string): boolean {
        return this.m_pConfigManager.hasConfig(configName);
    }

    removeConfig(configName: string): void {
        this.m_pConfigManager.removeConfig(configName);
    }

    removeAllConfigs(): void {
        this.m_pConfigManager.removeAllConfigs();
    }

    getConfig<T extends atsframework.Value>(configName: string): T;
    getConfig<T extends atsframework.Value>(configName: string, defaultValue: any): T;
    getConfig<T extends atsframework.Value>(configName: string, defaultValue?: any): T {
        if (undefined !== defaultValue) {
            if (!this.m_pConfigManager.hasConfig(configName))
                return defaultValue;
        }
        return this.m_pConfigManager.getConfig(configName);
    }

    private onLoadConfigSuccess(configAssetName: string, loadType: atsframework.LoadType, duration: number, userData: atsframework.UserData): void {
        const v_pInfo: LoadConfigInfo = userData as LoadConfigInfo;

        this.m_pEventComponent.emit("onLoadConfigSuccess", /*LoadConfigSuccessEventArgs*/ {
            configName: v_pInfo.configName,
            configAssetName: configAssetName,
            loadType: loadType,
            duration: duration,
            userData:v_pInfo.userData 
        });
    }

    private onLoadConfigFailure(configAssetName: string, loadType: atsframework.LoadType, errorMessage: string, userData: atsframework.UserData): void {
        const v_pInfo: LoadConfigInfo = userData as LoadConfigInfo;

        this.m_pEventComponent.emit("onLoadConfigFailure", {
            configName: v_pInfo.configName,
            configAssetName: configAssetName,
            loadType: loadType,
            errorMessage: errorMessage,
            userData: v_pInfo.userData
        });
    }

    private onLoadConfigUpdate(configAssetName: string, loadType: atsframework.LoadType, progress: number, userData: atsframework.UserData): void {
        const v_pInfo: LoadConfigInfo = userData as LoadConfigInfo;

        this.m_pEventComponent.emit("onLoadConfigUpdate", {
            configName: v_pInfo.configName,
            configAssetName: configAssetName,
            loadType: loadType,
            progress: progress,
            userData: v_pInfo.userData
        });
    }

    private onLoadConfigDependencyAsset(configAssetName: string, dependencyAssetName: string, loadedCount: number, totalCount: number, userData: atsframework.UserData): void {
        const v_pInfo: LoadConfigInfo = userData as LoadConfigInfo;

        this.m_pEventComponent.emit("onLoadConfigDependencyAsset", {
            configName: v_pInfo.configName,
            configAssetName: configAssetName,
            dependencyAssetName: dependencyAssetName,
            loadedCount: loadedCount,
            totalCount: totalCount,
            userData: v_pInfo.userData
        });
    }

} // class ConfigComponent

