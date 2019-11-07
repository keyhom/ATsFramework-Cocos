import FrameworkComponent from "../Base/FrameworkComponent";
import EventComponent from "../Event/EventComponent";
import DataTableHelperBase from "./DataTableHelperBase";
import Helper from "../Utility/Helper";
import DataRowBase from "./DataRowBase";

const { ccclass, property, menu, disallowMultiple, inspector } = cc._decorator;

type FrameworkModule = atsframework.FrameworkModule;
const FrameworkModule = atsframework.FrameworkModule;

type DataTableManager = atsframework.DataTableManager;
const DataTableManager = atsframework.DataTableManager;

type IDataRow = atsframework.IDataRow;
type IDataTable<T> = atsframework.IDataTable<T>;
type DataTableBase = atsframework.DataTableBase;
type DataTableRawContentType = atsframework.DataTableRawContentType;
type DataTableSegment = atsframework.FrameworkSegment<DataTableRawContentType>;

type LoadType = atsframework.LoadType;
type UserData = atsframework.UserData;

export type LoadDataTableInfo = {
    dataRowType: new () => IDataRow,
    dataTableName: string,
    dataTableNameInType: string,
    userData: UserData
} // type LoadDataTableInfo

export const LoadDataTableSuccessEventId = "loadDataTableSuccess";
export const LoadDataTableFailureEventId = "loadDataTableFailure";
export const LoadDataTableUpdateEventId = "loadDataTableUpdate";
export const LoadDataTableDependencyAssetEventId = "loadDataTableDependencyAsset";

export type LoadDataTableSuccessEventArgs = {
    dataTableName: string,
    dataTableAssetName: string,
    loadType: LoadType,
    duration: number,
    userData: UserData
} // LoadDataTableSuccessEventArgs

export type LoadDataTableFailureEventArgs = {
    dataTableName: string,
    dataTableAssetName: string,
    loadType: LoadType,
    errorMessage: string,
    userData: UserData
} // LoadDataTableFailureEventArgs

export type LoadDataTableUpdateEventArgs = {
    dataTableName: string,
    dataTableAssetName: string,
    loadType: LoadType,
    progress: number,
    userData: UserData
} // LoadDataTableUpdateEventArgs

export type LoadDataTableDependencyAssetEventArgs = {
    dataTableName: string,
    dataTableAssetName: string,
    dependencyAssetName: string,
    loadedCount: number,
    totalCount: number,
    userData: UserData
} // LoadDataTableDependencyAssetEventArgs

const DefaultPriority: number = 0;

@ccclass
@disallowMultiple
@menu('ATsFramework Component/DataTable')
@inspector('packages://atsframework-cocos/inspector/datatable-inspector.js')
export default class DataTableComponent extends FrameworkComponent {

    @property({
        displayName: 'Enable Load Update Event',
        tooltip: 'Enable/Disable the update event during datatable load.'
    })
    private m_bEnableLoadDataTableUpdateEvent: boolean = false;

    @property({
        displayName: 'Enable Load DependencyAsset Event',
        tooltip: 'Enable/Disable the dependency asset event during datatable load.'
    })
    private m_bEnableLoadDataTableDependencyAssetEvent: boolean = false;

    @property({
        displayName: 'DataTable Helper',
        tooltip: 'A helper for parsing datatable format.'
    })
    private m_sDataTableHelperTypeName: string = "DefaultDataTableHelper";

    private m_pDataTableManager!: DataTableManager;
    private m_pEventComponent!: EventComponent;

    onLoad(): void {
        super.onLoad();

        this.m_pDataTableManager = FrameworkModule.getOrAddModule(DataTableManager);
        if (!this.m_pDataTableManager)
            throw new Error("Data table manager is invalid.");

        this.m_pDataTableManager.loadDataTableSuccess.add(this.onLoadDataTableSuccess, this);
        this.m_pDataTableManager.loadDataTableFailure.add(this.onLoadDataTableFailure, this);

        if (this.m_bEnableLoadDataTableUpdateEvent) {
            this.m_pDataTableManager.LoadDataTableUpdate.add(this.onLoadDataTableUpdate, this);
        }

        if (this.m_bEnableLoadDataTableDependencyAssetEvent) {
            this.m_pDataTableManager.loadDataTableDependencyAsset.add(this.onLoadDataTableDependencyAsset, this);
        }
    }

    start(): void {
        this.m_pEventComponent = FrameworkComponent.getComponent(EventComponent);
        if (!this.m_pEventComponent)
            throw new Error("Event component is invalid.");

        this.m_pDataTableManager.resourceManager = FrameworkModule.getModule(atsframework.ResourceManager);

        let v_pDataTableHelper: DataTableHelperBase = Helper.createHelper(this.m_sDataTableHelperTypeName, null);
        if (!v_pDataTableHelper)
            throw new Error("Can not create data table helper.");

        v_pDataTableHelper.node.name = "Data Table Helper";
        v_pDataTableHelper.node.parent = this.node;
        v_pDataTableHelper.node.setScale(cc.Vec3.ONE);

        this.m_pDataTableManager.dataTableHelper = v_pDataTableHelper;
    }

    get count(): number {
        return this.m_pDataTableManager.count;
    }

    loadDataTable<T extends IDataRow>(dataRowType: new () => T, dataTableName: string, dataTableNameInType: string, dataTableAssetName: string, loadType: LoadType): void;
    loadDataTable<T extends IDataRow>(dataRowType: new () => T, dataTableName: string, dataTableNameInType: string, dataTableAssetName: string, loadType: LoadType, priority: number): void;
    loadDataTable<T extends IDataRow>(dataRowType: new () => T, dataTableName: string, dataTableNameInType: string, dataTableAssetName: string, loadType: LoadType, userData: UserData): void;
    loadDataTable<T extends IDataRow>(dataRowType: new () => T, dataTableName: string, dataTableNameInType: string, dataTableAssetName: string, loadType: LoadType, priority: number, userData: UserData): void;
    loadDataTable<T extends IDataRow>(dataRowType: new () => T, dataTableName: string, dataTableNameInType: string, dataTableAssetName: string, loadType: LoadType, anyArg1?: any, anyArg2?: any): void {
        if (!dataTableName)
            throw new Error('Data table name is invalid.');

        if (!dataRowType)
            throw new Error('Data row type is invalid.');

        let priority: number = DefaultPriority;
        let userData: UserData = anyArg2;

        if ('number' === typeof anyArg1) {
            priority = anyArg1;
        } else if (undefined != anyArg1) {
            userData = anyArg1;
        }
        
        this.m_pDataTableManager.loadDataTable(dataTableAssetName, loadType, priority, {
            dataRowType: dataRowType,
            dataTableName: dataTableName,
            dataTableNameInType: dataTableNameInType,
            userData: userData
        } as LoadDataTableInfo);
    }

    hasDataTable<T extends IDataRow>(): boolean;
    hasDataTable<T extends IDataRow>(name: string): boolean;
    hasDataTable<T extends IDataRow>(name?: string): boolean {
        return this.m_pDataTableManager.hasDataTable(name);
    }

    getDataTable<T extends IDataRow>(): IDataTable<T> | null;
    getDataTable<T extends IDataRow>(name: string): IDataTable<T> | null;
    getDataTable<T extends IDataRow>(name?: string): IDataTable<T> | null {
        return this.m_pDataTableManager.getDataTable<T>(name);
    }

    getAllDataTables(): DataTableBase[];
    getAllDataTables(results: DataTableBase[]): DataTableBase[];
    getAllDataTables(results?: DataTableBase[]): DataTableBase[] {
        return this.m_pDataTableManager.getAllDataTables(results);
    }

    createDataTable<T>(rowType: new() => T, name: string, content: DataTableRawContentType): IDataTable<T> {
        return this.m_pDataTableManager.createDataTable<T>(rowType, name, content);
    }

    destroyDataTable<T>(name: string): boolean {
        return this.m_pDataTableManager.destroyDataTable(name);
    }

    private onLoadDataTableSuccess(dataTableAssetName: string, loadType: LoadType, duration: number, userData: UserData): void {
        let v_pInfo: LoadDataTableInfo = userData as LoadDataTableInfo;

        this.m_pEventComponent.emit(LoadDataTableSuccessEventId, {
            dataTableName: v_pInfo.dataTableName,
            dataTableAssetName: dataTableAssetName,
            loadType: loadType,
            duration: duration,
            userData: v_pInfo.userData
        } as LoadDataTableSuccessEventArgs);
    }

    private onLoadDataTableFailure(dataTableAssetName: string, loadType: LoadType, errorMessage: string, userData: UserData): void {
        cc.warn(`Load data table failure, asset name '${dataTableAssetName}', error message '${errorMessage}'`);

        let v_pInfo: LoadDataTableInfo = userData as LoadDataTableInfo;
        this.m_pEventComponent.emit(LoadDataTableFailureEventId, {
            dataTableName: v_pInfo.dataTableName,
            dataTableAssetName: dataTableAssetName,
            loadType: loadType,
            errorMessage: errorMessage,
            userData: v_pInfo.userData
        } as LoadDataTableFailureEventArgs);
    }

    private onLoadDataTableUpdate(dataTableAssetName: string, loadType: LoadType, progress: number, userData: UserData): void {
        let v_pInfo: LoadDataTableInfo = userData as LoadDataTableInfo;
        this.m_pEventComponent.emit(LoadDataTableUpdateEventId, {
            dataTableName: v_pInfo.dataTableName,
            dataTableAssetName: dataTableAssetName,
            loadType: loadType,
            progress: progress,
            userData: v_pInfo.userData
        } as LoadDataTableUpdateEventArgs);
    }

    private onLoadDataTableDependencyAsset(dataTableAssetName: string, dependencyAssetName: string, loadedCount: number, totalCount: number, userData: UserData): void {
        let v_pInfo: LoadDataTableInfo = userData as LoadDataTableInfo;
        this.m_pEventComponent.emit(LoadDataTableDependencyAssetEventId, {
            dataTableName: v_pInfo.dataTableName,
            dataTableAssetName: dataTableAssetName,
            dependencyAssetName: dependencyAssetName,
            loadedCount: loadedCount,
            totalCount: totalCount,
            userData: v_pInfo.userData
        } as LoadDataTableDependencyAssetEventArgs);
    }

} // class DataTableComponent