import EntityHelperBase from "../EntityHelperBase";
import ResourceComponent from "../../Resource/ResourceComponent";
import { helper } from "../../Utility/Helper";
import Entity from "../Entity";
import FrameworkComponent from "../../Base/FrameworkComponent";

@helper
export default class DefaultEntityHelper extends EntityHelperBase {

    private m_pResourceComponent!: ResourceComponent;

    instantiateEntity(entityAsset: object): object {
        return cc.instantiate(entityAsset);
    }

    createEntity(entityInstance: object, entityGroup: atsframework.IEntityGroup, userData: atsframework.UserData): atsframework.IEntity {
        let v_pNode: cc.Node = entityInstance as cc.Node;
        if (!v_pNode) {
            cc.error('Entity instance is invalid.');
            return null;
        }
        v_pNode.parent = (entityGroup.helper as cc.Component).node;
        return v_pNode.getComponent(Entity) || v_pNode.addComponent(Entity);
    }

    releaseEntity(entityAsset: object, entityInstance: object): void {
        this.m_pResourceComponent.unloadAsset(entityAsset);
        (entityInstance as cc.Object).destroy();
    }

    start(): void {
        this.m_pResourceComponent = FrameworkComponent.getComponent(ResourceComponent);
        if (!this.m_pResourceComponent) {
            throw new Error('Resource component is invalid.');
        }
    }

} // class DefaultEntityHelper