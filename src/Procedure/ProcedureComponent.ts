import FrameworkComponent from "../Base/FrameworkComponent";

const ProcedureBase = atsframework.ProcedureBase;
type ProcedureBase = atsframework.ProcedureBase;

const FrameworkModule = atsframework.FrameworkModule;
type FrameworkModule = atsframework.FrameworkModule;

const ProcedureManager = atsframework.ProcedureManager;
type ProcedureManager = atsframework.ProcedureManager;

const FsmManager = atsframework.FsmManager;
type FsmManager = atsframework.FsmManager;

type ProcedureType = new () => ProcedureBase;

const { ccclass, property, disallowMultiple, menu, inspector } = cc._decorator;

const g_pRegisterProcedures: ProcedureType[] = [];

function getProcedureType(className: string): ProcedureType {
    for (const procedure of g_pRegisterProcedures) {
        if (cc.js.getClassName(procedure) === className) {
            return procedure;
        }
    }
    return null;
}

export function procedure(constructor: new () => ProcedureBase) {
    let v_bIsProcedure: boolean = cc.js.isChildClassOf(constructor, ProcedureBase);
    if (v_bIsProcedure) {
        // cc.log(`Register Procedure Class: ${cc.js.getClassName(constructor)}`);
        g_pRegisterProcedures.push(constructor);
    }
}

@ccclass
@disallowMultiple
@menu('ATsFramework Component/Procedure')
@inspector('packages://atsframework-cocos/inspector/procedure-inspector.js')
export default class ProcedureComponent extends FrameworkComponent {

    private static getAllProcedureNames<T extends ProcedureBase>(): string[] {
        return g_pRegisterProcedures.map((value: ProcedureType) => {
            // return (<any>value).name;
            return cc.js.getClassName(value);
        });
    }

    @property({
        tooltip: "The procedures available in build."
    })
    private m_pAvailableProcedureNames: string[] = [];

    @property
    get availableProcedureNames() { return this.m_pAvailableProcedureNames; }
    set availableProcedureNames(value) {
        this.m_pAvailableProcedureNames = value;
    }

    @property({
        tooltip: "The first running procedure at start."
    })
    entranceProcedureName: string = null;

    private m_pEntranceProcedure: ProcedureBase = null;
    private m_pProcedureManager: ProcedureManager = null;

    get currentProcedure(): ProcedureBase {
        return this.m_pProcedureManager.currentProcedure;
    }

    onLoad() {
        super.onLoad();

        if (CC_DEBUG) {
            cc.log(`The available procedures: ${this.m_pAvailableProcedureNames.join(', ')}`);
            cc.log(`The entrance procedure: ${this.entranceProcedureName}`);
        }

        this.m_pProcedureManager = FrameworkModule.getOrAddModule(ProcedureManager);
        if (null == this.m_pProcedureManager) {
            throw new Error("Procedure manager is invalid.");
        }
    }

    start() {
        let v_rProcedures: Array<ProcedureBase> = new Array<ProcedureBase>(this.m_pAvailableProcedureNames.length);
        for (let i = 0; i < v_rProcedures.length; i++) {
            let name: string = this.m_pAvailableProcedureNames[i];
            let v_rProcedureType: ProcedureType = getProcedureType(name);

            if (null == v_rProcedureType) {
                cc.error(`Can not find procedure type: '${name}'`);
                break;
            }

            v_rProcedures[i] = new v_rProcedureType();
            // Object.create(v_rProcedureType.prototype);
            if (null == v_rProcedures[i]) {
                cc.error(`Can not create procedure instance: '${name}'`);
            }

            if (this.entranceProcedureName === name) {
                this.m_pEntranceProcedure = v_rProcedures[i];
            }
        }

        if (null == this.m_pEntranceProcedure) {
            cc.error('Entrance procedure is invalid.');
            return;
        }

        const v_pFsmModule: FsmManager = FrameworkModule.getOrAddModule(FsmManager);

        this.m_pProcedureManager.initialize(v_pFsmModule, v_rProcedures);

        cc.director.once(cc.Director.EVENT_AFTER_DRAW, this.doProcedureStart.bind(this));
    }

    private doProcedureStart(): void {
        this.m_pProcedureManager.startProcedure(this.m_pEntranceProcedure);
    }

    hasProcedure<T extends ProcedureBase>(type: new () => T): boolean {
        return this.m_pProcedureManager.hasProcedure(type);
    }

    getProcedure<T extends ProcedureBase>(type: new () => T): T {
        return this.m_pProcedureManager.getProcedure(type);
    }

} // class ProcedureComponent
