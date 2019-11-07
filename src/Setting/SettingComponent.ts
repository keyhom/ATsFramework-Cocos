import FrameworkComponent from "../Base/FrameworkComponent";
import Helper from "../Utility/Helper";
import SettingHelperBase from "./SettingHelperBase";

const { ccclass, property, menu, disallowMultiple, inspector } = cc._decorator;

type SettingManager = atsframework.SettingManager;
const SettingManager = atsframework.SettingManager;

@ccclass
@disallowMultiple
@menu('ATsFramework Component/Setting')
@inspector('packages://atsframework-cocos/inspector/setting-inspector.js')
export default class SettingComponent extends FrameworkComponent {

    private m_pSettingManager: SettingManager | null = null;

    @property({
        displayName: 'Setting Helper',
        tooltip: 'A helper for operating the setting function.'
    })
    private m_sSettingHelperTypeName: string = 'DefaultSettingHelper';

    onLoad(): void {
        super.onLoad();

        this.m_pSettingManager = atsframework.FrameworkModule.getOrAddModule(SettingManager);
        if (!this.m_pSettingManager) {
            throw new Error('Setting manager is invalid.');
        }

        let v_pSettingHelper: SettingHelperBase = Helper.createHelper(this.m_sSettingHelperTypeName, null);
        if (!v_pSettingHelper) {
            throw new Error('Can not create setting helper.');
        }

        v_pSettingHelper.node.name = 'Setting Helper';
        v_pSettingHelper.node.parent = this.node;
        v_pSettingHelper.node.setScale(cc.Vec3.ONE);

        this.m_pSettingManager.settingHelper = v_pSettingHelper;
    }

    start(): void {

    }

    save(): void {
        this.m_pSettingManager.save();
    }

    hasSetting(name: string): boolean {
        return this.m_pSettingManager.hasSetting(name);
    }

    removeSetting(name: string): void {
        return this.m_pSettingManager.removeSetting(name);
    }

    getBoolean(name: string): boolean;
    getBoolean(name: string, defaultValue: boolean): boolean;
    getBoolean(name: string, defaultValue?: boolean): boolean {
        return this.m_pSettingManager.getBoolean(name, defaultValue);
    }

    setBoolean(name: string, value: boolean): void {
        this.m_pSettingManager.setBoolean(name, value);
    }

    getInteger(name: string): number;
    getInteger(name: string, defaultValue: number): number;
    getInteger(name: string, defaultValue?: number): number {
        return this.m_pSettingManager.getInteger(name, defaultValue);
    }

    setInteger(name: string, value: number): void {
        this.m_pSettingManager.setInteger(name, value);
    }

    getFloat(name: string): number;
    getFloat(name: string, defaultValue: number): number;
    getFloat(name: string, defaultValue?: number): number {
        return this.m_pSettingManager.getFloat(name, defaultValue);
    }

    setFloat(name: string, value: number): void {
        this.m_pSettingManager.setFloat(name, value);
    }

    getString(name: string): string;
    getString(name: string, defaultValue: string): string;
    getString(name: string, defaultValue?: string): string{
        return this.m_pSettingManager.getString(name, defaultValue);
    }

    setString(name: string, value: string): void {
        this.m_pSettingManager.setString(name, value);
    }

    getObject<T>(type: new() => T, name: string): T;
    getObject<T>(type: new() => T, name: string, defaultValue: T): T;
    getObject<T>(type: new() => T, name: string, defaultValue?: T): T {
        return this.m_pSettingManager.getObject<T>(type, name, defaultValue);
    }

    setObject<T>(name: string, value: T): void {
        this.m_pSettingManager.setObject<T>(name, value);
    }

} // class SettingComponent