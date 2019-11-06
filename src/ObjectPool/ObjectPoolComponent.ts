import FrameworkComponent from "../Base/FrameworkComponent";

const { ccclass, property, menu, disallowMultiple, inspector } = cc._decorator;

type ObjectPoolManager = atsframework.ObjectPoolManager;
const ObjectPoolManager = atsframework.ObjectPoolManager;

type ObjectBase = atsframework.ObjectBase;
const ObjectBase = atsframework.ObjectBase;

type ObjectPoolBase = atsframework.ObjectPoolBase;
const ObjectPoolBase = atsframework.ObjectPoolBase;

type IObjectPool<T extends ObjectBase> = atsframework.IObjectPool<T>;

@ccclass
@disallowMultiple
@menu('ATsFramework Component/ObjectPool')
@inspector('packages://atsframework-cocos/inspector/default-inspector.js')
export default class ObjectPoolComponent extends FrameworkComponent {

    private m_pObjectPoolManager!: ObjectPoolManager;

    onLoad(): void {
        super.onLoad();

        this.m_pObjectPoolManager = atsframework.FrameworkModule.getOrAddModule(ObjectPoolManager);
        if (!this.m_pObjectPoolManager) {
            throw new Error('Object pool manager is invalid.');
        }
    }

    start(): void {
        // NOOP.
    }

    get count(): number {
        return this.m_pObjectPoolManager.count;
    }

    hasObjectPool<T extends ObjectBase>(): boolean;
    hasObjectPool<T extends ObjectBase>(name: string): boolean;
    hasObjectPool<T extends ObjectBase>(a?: any): boolean {
        a = a || '';
        return this.m_pObjectPoolManager.hasObjectPool(a);
    }

    getObjectPool<T extends ObjectBase>(): IObjectPool<T>;
    getObjectPool<T extends ObjectBase>(name: string): IObjectPool<T>;
    getObjectPool<T extends ObjectBase>(name?: string): IObjectPool<T> {
        name = name || '';
        return this.m_pObjectPoolManager.getObjectPool(name);
    }

    getObjectPoolBase(name: string): ObjectPoolBase;
    getObjectPoolBase(predicate: (objectPool: ObjectPoolBase) => boolean): ObjectPoolBase;
    getObjectPoolBase(nameOrPredicate: any): ObjectPoolBase {
        return this.m_pObjectPoolManager.getObjectPoolBase(nameOrPredicate);
    }

    getObjectPools(predicate: (objectPool: ObjectPoolBase) => boolean): ObjectPoolBase[];
    getObjectPools(predicate: (objectPool: ObjectPoolBase) => boolean, results: ObjectPoolBase[]): ObjectPoolBase[];
    getObjectPools(predicate: (objectPool: ObjectPoolBase) => boolean, results?: ObjectPoolBase[]): ObjectPoolBase[] {
        return this.m_pObjectPoolManager.getObjectPools(predicate, results);
    }

    getAllObjectPools(): ObjectPoolBase[];
    getAllObjectPools(results: ObjectPoolBase[]): ObjectPoolBase[];
    getAllObjectPools(sort: boolean): ObjectPoolBase[];
    getAllObjectPools(sort: boolean, results: ObjectPoolBase[]): ObjectPoolBase[];
    getAllObjectPools(a?: any, b?: any): ObjectPoolBase[] {
        return this.m_pObjectPoolManager.getAllObjectPools(a, b);
    }

    createSingleSpawnObjectPool<T extends ObjectBase>(options?: atsframework.CreateSingleSpawnObjectPoolOption): IObjectPool<T> {
        return this.m_pObjectPoolManager.createSingleSpawnObjectPool(options);
    }

    createMultiSpawnObjectPool<T extends ObjectBase>(options?: atsframework.CreateMultiSpawnObjectPoolOption): IObjectPool<T> {
        return this.m_pObjectPoolManager.createMutliSpawnObjectPool(options);
    }

    destroyObjectPool<T extends ObjectBase>(): boolean;
    destroyObjectPool<T extends ObjectBase>(name: string): boolean;
    destroyObjectPool<T extends ObjectBase>(objectPool: IObjectPool<T>): boolean;
    destroyObjectPool<T extends ObjectBase>(a?: any): boolean {
        return this.m_pObjectPoolManager.destroyObjectPool(a);
    }

    release(): void {
        cc.log('Object pool release ....');
        this.m_pObjectPoolManager.release();
    }

    releaseAllUnused(): void {
        cc.log('Object pool release all unused ...');
        this.m_pObjectPoolManager.releaseAllUnused();
    }

} // class ObjectPoolComponent