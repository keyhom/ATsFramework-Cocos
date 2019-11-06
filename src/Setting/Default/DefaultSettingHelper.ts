import SettingHelperBase from "../SettingHelperBase";
import { helper } from "../../Utility/Helper";

@helper
class DefaultSettingHelper extends SettingHelperBase {

    load(): boolean {
        // NOOP.
        return true;
    }

    save(): boolean {
        // NOOP.
        return true;
    }

    hasSetting(name: string): boolean {
        return name in cc.sys.localStorage;
    }

    removeSetting(name: string): void {
        if (this.hasSetting(name))
            delete cc.sys.localStorage[name];
    }

    removeAllSettings(): void {
        for (const k in cc.sys.localStorage) {
            delete cc.sys.localStorage[k];
        }
    }

    private saveItem(name: string, str: string): void {
        if (!name)
            return;
        cc.sys.localStorage[name] = str;
    }

    getBoolean(name: string): boolean;
    getBoolean(name: string, defaultValue: boolean): boolean;
    getBoolean(name: any, defaultValue?: boolean): boolean {
        defaultValue = defaultValue || false;

        if (this.hasSetting(name))
            return this.getInteger(name) != 0;
        return defaultValue;
    }

    setBoolean(name: string, value: boolean): void {
        this.setInteger(name, value ? 1 : 0);
    }

    getInteger(name: string): number;
    getInteger(name: string, defaultValue: number): number;
    getInteger(name: any, defaultValue?: number): number {
        defaultValue = defaultValue || 0;
        if (this.hasSetting(name)) {
            try {
                return parseInt(cc.sys.localStorage[name]);
            } catch (e) {}
        }
        return defaultValue;
    }

    setInteger(name: string, value: number): void {
        this.saveItem(name, value.toPrecision(0));
    }

    getFloat(name: string): number;
    getFloat(name: string, defaultValue: number): number;
    getFloat(name: any, defaultValue?: number): number {
        defaultValue = defaultValue || Number.NaN;
        if (this.hasSetting(name)) {
            try {
                return parseFloat(cc.sys.localStorage[name]);
            } catch (e) {}
        }
        return defaultValue;
    }

    setFloat(name: string, value: number): void {
        this.saveItem(name, value.toString());
    }

    getString(name: string): string;
    getString(name: string, defaultValue: string): string;
    getString(name: any, defaultValue?: string): string {
        defaultValue = defaultValue || '';
        if (this.hasSetting(name)) {
            return cc.sys.localStorage[name];
        }
        return defaultValue;
    }

    setString(name: string, value: string): void {
        this.saveItem(name, value);
    }

    getObject<T>(type: new () => T, name: string): any;
    getObject<T>(type: new () => T, name: string, defaultValue: any): any;
    getObject(type: any, name: any, defaultValue?: any): any {
        defaultValue = defaultValue || null;
        if (this.hasSetting(name)) {
            try {
                return JSON.parse(this.getString(name));
            } catch (e) {}
        }
        return defaultValue;
    }

    setObject(name: string, obj: any): void {
        this.setString(name, JSON.stringify(obj));
    }

} // class DefaultSettingHelper
