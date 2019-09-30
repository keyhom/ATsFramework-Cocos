type IDataRow = atsframework.IDataRow;

export default abstract class DataRowBase implements IDataRow {

    id!: number;

    abstract dataSplitSeperators: string;

    parseDataRow(dataRowSegment: atsframework.FrameworkSegment<atsframework.DataTableRawContentType>): boolean {
        if ('string' === typeof dataRowSegment.source) {
            let v_pColumnText: string = dataRowSegment.source.substr(dataRowSegment.offset, dataRowSegment.length);
            if (v_pColumnText.charCodeAt(v_pColumnText.length - 1) == '\r'.charCodeAt(0)) {
                v_pColumnText = v_pColumnText.slice(0, v_pColumnText.length - 2);
            }

            let v_pColumnTexts: string[] = v_pColumnText.split(this.dataSplitSeperators);
            for (let i: number = 0; i < v_pColumnTexts.length; i++) {
                v_pColumnTexts[i] = v_pColumnTexts[i].trim();
            }

            return this.parseRowString(v_pColumnTexts);
        } else {
            // FIXME: ArrayBuffer/Blob binary parsing here.
        }
        return false;
    }

    abstract parseRowString(columns: string[]): boolean;

} // class DataRowBase