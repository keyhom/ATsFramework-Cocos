@cc._decorator.ccclass
export default abstract class SettingHelperBase extends cc.Component implements atsframework.ISettingHelper {

    abstract load(): boolean;

    abstract save(): boolean;

    abstract hasSetting(name: string): boolean;

    abstract removeSetting(name: string): void;

    abstract removeAllSettings(): void;

    abstract getBoolean(name: string): boolean;
    abstract getBoolean(name: string, defaultValue: boolean): boolean;

    abstract setBoolean(name: string, value: boolean): void;

    abstract getInteger(name: string): number;
    abstract getInteger(name: string, defaultValue: number): number;

    abstract setInteger(name: string, value: number): void;

    abstract getFloat(name: string): number;
    abstract getFloat(name: string, defaultValue: number): number;

    abstract setFloat(name: string, value: number): void;

    abstract getString(name: string): string;
    abstract getString(name: string, defaultValue: string): string;

    abstract setString(name: string, value: string): void;

    abstract getObject<T>(type: new () => T, name: string): any;
    abstract getObject<T>(type: new () => T, name: string, defaultValue: any): any;

    abstract setObject(name: string, obj: any): void;

} // class SettingHelperBase