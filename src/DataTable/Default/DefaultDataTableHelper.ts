import DataTableHelperBase from "../DataTableHelperBase";
import { helper } from "../../Utility/Helper";
import ResourceComponent from "../../Resource/ResourceComponent";
import FrameworkComponent from "../../Base/FrameworkComponent";
import DataTableComponent from "../DataTableComponent";

@helper
export default class DefaultDataTableHelper extends DataTableHelperBase {

    private m_pResourceComponent!: ResourceComponent;
    private m_pDataTableComponent!: DataTableComponent;

    doLoadDataTable(rowType: new () => atsframework.IDataRow, dataTableName: string, dataTableNameInType: string, dataTableAsset: object, loadType: atsframework.LoadType, userData: atsframework.UserData): boolean {
        let v_pTextAsset: cc.TextAsset = dataTableAsset as cc.TextAsset;
        if (!v_pTextAsset) {
            cc.warn(`Data table asset '${dataTableName}' is invalid.`);
            return false;
        }

        switch (loadType) {
            case atsframework.LoadType.Text:
            case atsframework.LoadType.Bytes:
            case atsframework.LoadType.Stream:
                this.m_pDataTableComponent.createDataTable(rowType, dataTableName, v_pTextAsset.text);
                break;
            default:
                cc.warn('Unknown load type.');
                return false;
        }

        return true;
    }

    getDataRowSegments(segment: atsframework.DataTableRawContentType): IterableIterator<atsframework.FrameworkSegment<atsframework.DataTableRawContentType>> {
        let v_pSegments: atsframework.FrameworkSegment<atsframework.DataTableRawContentType>[] = [];
        if ('string' === typeof segment) {
            let v_pSegment!: atsframework.FrameworkSegment<string>;
            let v_pPosition: [number] = [0];
            while ((v_pSegment = this.readLine(segment as string, v_pPosition))) {
                if (segment[v_pSegment.offset] == '#')
                    continue;

                v_pSegments.push(v_pSegment);
            }

            let v_idx: number = 0;
            let v_pIterator: IterableIterator<atsframework.FrameworkSegment<atsframework.DataTableRawContentType>> = {
                [Symbol.iterator]: () => {
                    return v_pIterator;
                },
                next(... args: any[]): any {
                    return {
                        done: v_idx == v_pSegments.length,
                        value: v_idx >= v_pSegments.length ? null : v_pSegments[v_idx++]
                    };
                },
                return(value?: atsframework.FrameworkSegment<atsframework.DataTableRawContentType>): any {
                    return value || {
                        done: v_idx == v_pSegments.length - 1,
                        value: v_pSegments[v_idx]
                    };
                },
                throw(e?: any): any {
                    return {
                        done: true,
                        value: v_pSegments[v_idx]
                    };
                }
            };

            return v_pIterator;
        }
        return null;
    }

    releaseDataTableAsset(dataTableAsset: object): void {
        this.m_pResourceComponent.unloadAsset(dataTableAsset);
    }

    private readLine(text: string, position: [number]): atsframework.FrameworkSegment<string> {
        let length: number = text.length;
        let offset: number = position[0];

        if (position[0] == 0 && text.charCodeAt(0) == 65279) {
            position[0] = 1;
        }

        while (offset < length) {
            let ch = text[offset];

            switch (ch) {
                case '\r':
                case '\n':
                    if (offset - position[0] > 0) {
                        let segment: atsframework.FrameworkSegment<string> = new atsframework.FrameworkSegment<string>(text, position[0], offset - position[0]);
                        position[0] = offset + 1;
                        if (((ch == '\r') && (position[0] < length)) && (text[position[0]] == '\n'))
                            position[0]++;
                        return segment;
                    }

                    offset++;
                    position[0]++;
                    break;

                default:
                    offset++;
                    break;
            }
        }

        if (offset > position[0]) {
            let segment: atsframework.FrameworkSegment<string> = new atsframework.FrameworkSegment<string>(text, position[0], offset - position[0]);
            position[0] = offset;
            return segment;
        }

        return null;
    }

    start(): void {
        this.m_pDataTableComponent = FrameworkComponent.getComponent(DataTableComponent);
        if (!this.m_pDataTableComponent)
            throw new Error("DataTable component is invalid.");

        this.m_pResourceComponent = FrameworkComponent.getComponent(ResourceComponent);
        if (!this.m_pResourceComponent)
            throw new Error("Resource component is invalid.");
    }

} // class DefaultDataTableHelper
