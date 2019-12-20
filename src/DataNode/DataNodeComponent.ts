import FrameworkComponent from "../Base/FrameworkComponent";

const { ccclass, property, disallowMultiple, menu, inspector } = cc._decorator;

const DataNodeManager = atsframework.DataNodeManager;
type DataNodeManager = atsframework.DataNodeManager;

const DataNode = atsframework.DataNode;
type DataNode = atsframework.DataNode;

const FrameworkModule = atsframework.FrameworkModule;

@ccclass
@disallowMultiple
@menu('ATsFramework Component/DataNode')
@inspector('packages://atsframework-cocos/inspector/default-inspector.js')
export default class DataNodeComponent extends FrameworkComponent {

	private m_pDataNodeManager!: DataNodeManager;

	onLoad(): void {
		super.onLoad();

		this.m_pDataNodeManager = FrameworkModule.getOrAddModule(DataNodeManager);
		if (null == this.m_pDataNodeManager) {
			throw new Error('Data node manager is invalid.');
		}
	}

	start(): void {
		// NOOP.
	}

	get root(): DataNode {
		return this.m_pDataNodeManager.root;
	}

	getData<T>(path: string): T;
	getData<T>(path: string, node: DataNode): T;
	getData<T>(path: string, node?: DataNode): T {
		return this.m_pDataNodeManager.getData(path, node);
	}

	setData<T>(path: string, data: T): void;
	setData<T>(path: string, data: T, node: DataNode): void;
	setData<T>(path: string, data: T, node?: DataNode): void {
		this.m_pDataNodeManager.setData<T>(path, data, node);
	}

	getNode(path: string): DataNode;
	getNode(path: string, node: DataNode): DataNode;
	getNode(path: string, node?: DataNode): DataNode {
		return this.m_pDataNodeManager.getNode(path, node);
	}

	getOrAddNode(path: string): DataNode;
	getOrAddNode(path: string, node: DataNode): DataNode;
	getOrAddNode(path: string, node?: DataNode): DataNode {
		return this.m_pDataNodeManager.getOrAddNode(path, node);
	}

	removeNode(path: string): void;
	removeNode(path: string, node: DataNode): void;
	removeNode(path: string, node?: DataNode): void {
		this.m_pDataNodeManager.removeNode(path, node);
	}

	clear(): void {
		this.m_pDataNodeManager.clear();
	}

} // class DataNodeComponent
