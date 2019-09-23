import ConfigHelperBase from "../ConfigHelperBase";
import { helper } from "../../Utility/Helper";
import ResourceComponent from "../../Resource/ResourceComponent";
import FrameworkComponent from "../../Base/FrameworkComponent";

type ConfigManager = atsframework.ConfigManager;
const ConfigManager = atsframework.ConfigManager;

type FrameworkModule = atsframework.FrameworkModule;
const FrameworkModule = atsframework.FrameworkModule;

@helper
export default class DefaultConfigHelper extends ConfigHelperBase {

    private m_pResourceComponent: ResourceComponent = null;
    private m_pConfigManager: ConfigManager = null;

    start(): void {
        this.m_pResourceComponent = FrameworkComponent.getComponent(ResourceComponent);
        if (null == this.m_pResourceComponent)
            throw new Error("Resource component is invalid.");

        this.m_pConfigManager = FrameworkModule.getModule(ConfigManager);
        if (null == this.m_pConfigManager)
            throw new Error("Config manager is invalid.");
    }

    protected onLoadConfig(configName: string, configAsset: object, loadType: atsframework.LoadType, userData: atsframework.UserData): boolean {
        let v_bIsText: boolean = false;
        const v_bValidAsset: boolean = ((v_bIsText = configAsset instanceof cc.TextAsset)) || configAsset instanceof cc.BufferAsset;

        if (!v_bValidAsset)
            return false;

        let v_sText: string = null;
        let v_pBuffer: any = null;

        if (v_bIsText) {
            v_sText = (configAsset as cc.TextAsset).text;
        } else {
            v_pBuffer = (configAsset as cc.BufferAsset);
            // FIXME: cc.BufferAsset no typing definition.
        }

        let v_bRetVal: boolean = false;
        switch (loadType) {
            case atsframework.LoadType.Text:
                v_bRetVal = this.m_pConfigManager.parseConfig(v_sText, userData);
                break;
            case atsframework.LoadType.Bytes:
                v_bRetVal = this.m_pConfigManager.parseConfig(v_pBuffer, userData);
                break;
            case atsframework.LoadType.Stream:
                // FIXME: Stream is not compatible with ts/js ?
                break;
            default:
                cc.warn('Unknown load type.');
                return false;
        }

        if (!v_bRetVal) {
            cc.warn(`Config asset '${configName}' parse failure.`);
        }

        return v_bRetVal;
    }

    addConfig(configName: string, value: atsframework.Value): boolean {
        return this.m_pConfigManager.addConfig(configName, value);
    }

    parseConfig(text: string, userData: atsframework.UserData): boolean;
    parseConfig(buffer: ArrayBuffer, userData: atsframework.UserData): boolean;
    parseConfig(buffer: any, userData: any): boolean {
        if ('string' === typeof buffer) {
            let v_sText:string = buffer;

            if (v_sText.charCodeAt(0) == 65279)
                v_sText = v_sText.slice(1);

            v_sText = v_sText.replace('\r\n', '\n');

            let v_pLines: string[] = v_sText.split('\n');

            try {
                for (let i: number = 0; i < v_pLines.length; i++) {
                    if (v_pLines[i].length <= 0 || v_pLines[i][0] == '#')
                        continue;

                    let v_pSplitLine: string[] = v_pLines[i].split(',');
                    if (v_pSplitLine.length != 4) {
                        cc.warn(`Can not parse config '${v_sText}'`);
                        return false;
                    }

                    let v_sConfigName: string = v_pSplitLine[1];
                    let v_sConifgValue: string = v_pSplitLine[3];
                    if (!this.addConfig(v_sConfigName, v_sConifgValue)) {
                        cc.warn(`Can not add raw string with config name '${v_sConfigName}' which may be invalid or duplicated.`);
                        return false;
                    }
                }
                return true;
            } catch (e) {
                cc.warn(`Can not parse config '${v_sText}' with exception '${e}'`);
                return false;
            }
        } else {
            throw new Error("FIXME: Method (DefaultConfigHelper::parseConfig) not implemented.");
        }
    }

    releaseConfigAsset(configAsset: object): void {
        this.m_pResourceComponent.unloadAsset(configAsset);
    }

} // class DefaultConfigHelper
