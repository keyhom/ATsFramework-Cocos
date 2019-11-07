import FrameworkComponent from "../Base/FrameworkComponent";
import Helper from "../Utility/Helper";
import ResourceLoaderBase from "./ResourceLoaderBase";

type IResourceManager = atsframework.IResourceManager;

const { ccclass, property, menu, disallowMultiple, inspector } = cc._decorator;

@ccclass
@disallowMultiple
@menu("ATsFramework Component/Resource")
@inspector('packages://atsframework-cocos/inspector/resource-inspector.js')
export default class ResourceComponent extends FrameworkComponent {

    private m_pResourceManager: IResourceManager = null;

    @property({
        displayName: 'Resource Loader',
        tooltip: 'A resource loader implementation'
    })
    private m_sResourceLoaderName: string = 'DefaultResourceLoader';

    onLoad(): void {
        super.onLoad();

        const v_pResourceManager: atsframework.ResourceManager = atsframework.FrameworkModule.getOrAddModule(atsframework.ResourceManager);

        this.m_pResourceManager = v_pResourceManager;
        if (null == this.m_pResourceManager) {
            throw new Error("Resource manager is invalid.");
        }

        let v_pHelperLoader: ResourceLoaderBase = Helper.createHelper(this.m_sResourceLoaderName, null);
        if (!v_pHelperLoader) {
            cc.error('Invalid Resource loader helper!');
            return;
        }

        v_pHelperLoader.node.name = 'Resource Loader';
        v_pHelperLoader.node.parent = this.node;
        v_pHelperLoader.node.setScale(cc.Vec3.ONE);

        v_pResourceManager.resourceLoader = v_pHelperLoader;
    }

    start(): void {
        // NOOP.
    }

    unloadAsset(asset: object): void {
        this.m_pResourceManager.unloadAsset(asset);
    }

} // class ResourceComponent