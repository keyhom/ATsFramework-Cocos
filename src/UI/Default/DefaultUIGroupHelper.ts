import UIGroupHelperBase from "../UIGroupHelperBase";
import { helper } from "../../Utility/Helper";

const { ccclass, property, menu, inspector, disallowMultiple } = cc._decorator;

@helper
@ccclass
export class DefaultUIGroupHelper extends UIGroupHelperBase {

    setDepth(depth: number): void {
        // NOOP by default.
    }

} // class DefaultUIGroupHelper

