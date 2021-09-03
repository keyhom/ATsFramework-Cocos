import { LoadDataTableInfo } from "./DataTableComponent";

@cc._decorator.ccclass
export default abstract class DataTableHelperBase extends cc.Component implements atsframework.IDataTableHelper {

    loadDataTable(dataTableAsset: object, loadType: atsframework.LoadType, userData: atsframework.UserData): boolean {
        let v_pInfo: LoadDataTableInfo = userData as LoadDataTableInfo;
        return this.doLoadDataTable(v_pInfo.dataRowType, v_pInfo.dataTableName, v_pInfo.dataTableNameInType, dataTableAsset, loadType, v_pInfo.userData);
    }

    abstract doLoadDataTable(rowType: new () => atsframework.IDataRow, dataTableName: string, dataTableNameInType: string, dataTableAsset: object, loadType: atsframework.LoadType, userData: atsframework.UserData): boolean;

    abstract getDataRowSegments(segment: atsframework.DataTableRawContentType): IterableIterator<atsframework.FrameworkSegment<atsframework.DataTableRawContentType>>;

    abstract releaseDataTableAsset(dataTableAsset: object): void;

} // class DataTableHelperBase
