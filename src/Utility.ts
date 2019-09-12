export /* static */ class Helper {

    private static s_pHelpers: { [key: string]: Function } = {};

    static createHelper<T extends cc.Component>(helperClassName: string, customHelper: T): T;
    static createHelper<T extends cc.Component>(helperClassName: string, customHelper: T, index: number): T;
    static createHelper<T extends cc.Component>(helperClassName: string, customHelper: T, index?: number): T {
        index = index || 0; // undefined || 0 => 0
        let v_pHelper: T = null;
        if (helperClassName) {
            for (const k in this.s_pHelpers) {
                if (k === helperClassName) {
                    let v_pNode: cc.PrivateNode = new cc.PrivateNode();
                    let v_pClassType: Function = cc.js.getClassByName(helperClassName);
                    if (null == v_pClassType && helperClassName in this.s_pHelpers) {
                        v_pClassType = this.s_pHelpers[helperClassName];
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

