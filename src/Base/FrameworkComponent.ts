type KeyOf<T> = keyof T;
type IsType<T> = (val: any) => val is T;
type Readonly<T> = { readonly [P in KeyOf<T>]: T[P]};
type Partial<T> = { [P in KeyOf<T>]?: T[P] };
type Extract<T, U> = T extends U ? T : never;
type Merge<T, U> = T & U;


type LinkLike<T> = {
    value: T,
    prev: LinkLike<T>,
    next: LinkLike<T>,
};

export default abstract class FrameworkComponent extends cc.Component {

    private static s_theFrameworkComponents : {
        first: LinkLike<FrameworkComponent>, last: LinkLike<FrameworkComponent>
    } = {
        first: { value: null, next: null, prev: null },
        last: { value: null, next: null, prev: null },
    };

    private static s_bInit: boolean = false;

    private static initStatic() {
        if (!this.s_bInit) {
            this.s_bInit = true;
            this.s_theFrameworkComponents.first.next = this.s_theFrameworkComponents.last;
            this.s_theFrameworkComponents.last.prev = this.s_theFrameworkComponents.first;
        }
    }

    private static addLast<T extends FrameworkComponent>(comp: T): void {
        this.initStatic();

        let current: LinkLike<FrameworkComponent> = this.s_theFrameworkComponents.last.prev;
        let entry: LinkLike<FrameworkComponent> = {
            value: comp,
            next: current.next,
            prev: current
        };

        current.next.prev = entry;
        current.next = entry;
    }

    static getComponent<T extends FrameworkComponent>(type: { prototype: T }): T {
        if (!type)
            return null;

        let current: LinkLike<FrameworkComponent> = this.s_theFrameworkComponents.first;
        while (current) {
            if (current.value && (<any>current.value).__cid__ == (<any>type.prototype).__cid__) {
                return current.value as T;
            }
            current = current.next;
        }

        return null;
    }

    static registerComponent<T extends FrameworkComponent>(comp: T): void {
        if (!comp) {
            cc.error('Framework component is invalid!');
            return;
        }

        this.initStatic();

        let cid = (<any>comp).__cid__;

        let current = this.s_theFrameworkComponents.first;
        while (current) {
            if (current.value && (<any>current.value).__cid__ === cid) {
                cc.error(`Framework component type ${comp.name} is already exists.`);
                return;
            }

            current = current.next;
        }

        this.addLast(comp);
    }

    onLoad() {
        FrameworkComponent.registerComponent(this);
    }

} // class FrameworkComponent


