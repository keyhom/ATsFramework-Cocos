
@cc._decorator.ccclass
export default abstract class EntityHelperBase extends cc.Component implements atsframework.IEntityHelper {

    abstract instantiateEntity(entityAsset: object): object;

    abstract createEntity(entityInstance: object, entityGroup: atsframework.IEntityGroup, userData: atsframework.UserData): atsframework.IEntity;

    abstract releaseEntity(entityAsset: object, entityInstance: object | null): void;

} // class EntityHelperBase
