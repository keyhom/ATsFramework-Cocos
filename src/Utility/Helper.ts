const g_pHelpers: { [key: string]: Function } = {};

export function helper(constructor: Function): void {
	let className: string = cc.js.getClassName(constructor);
	g_pHelpers[className] = constructor;
} // function helper

@cc._decorator.ccclass('Helper')
export default /* static */ class Helper {

    static getAllHelpers(): Function[] {
        let constructors: Function[] = [];
        for (const className in g_pHelpers) {
            constructors.push(g_pHelpers[className]);
        }
        return constructors;
    }

    static createHelper<T extends cc.Component>(helperClassName: string, customHelper: T): T;
    static createHelper<T extends cc.Component>(helperClassName: string, customHelper: T, index: number): T;
    static createHelper<T extends cc.Component>(helperClassName: string, customHelper: T, index?: number): T {
        index = index || 0; // undefined || 0 => 0
        let v_pHelper: T = null;
        if (helperClassName) {
            for (const k in g_pHelpers) {
                if (k === helperClassName) {
                    let v_pNode: cc.PrivateNode = new cc.PrivateNode();
                    let v_pClassType: Function = cc.js.getClassByName(helperClassName);
                    if (null == v_pClassType && helperClassName in g_pHelpers) {
                        v_pClassType = g_pHelpers[helperClassName];
                    }
                    return v_pNode.addComponent(v_pClassType as new() => T) as T;
                }
            }
        } else if (null == customHelper) {
            cc.warn('Invalid custom helper.');
            return null;
        } else {
            v_pHelper = cc.instantiate(customHelper);
        }
        return v_pHelper;
    }

} // class Helper


