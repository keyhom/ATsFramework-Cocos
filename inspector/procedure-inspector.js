`use strict`;

Vue.component('atsframework-procedure-inspector', {
    template: `
        <h4 :style="[cssWrapper, cssIndent1]" :class="cssFlexHorCenter">
            Available Procedures
        </h4>
        <ui-box-container class="shadow">
            <div :style="[cssWrapper, cssIndent2]" :class="cssFlexHorCenter"
                    v-for="item in allProcedureNames()"
                    :indent="indent+1">
                <ui-checkbox :checked="checkProcedureEnable(item)" @change="onProcedureStatusChange">{{item}}</ui-checkbox>
            </div>
        </ui-box-container>
        <ui-prop
            :name="target.entranceProcedureName.name"
            :tooltip="target.entranceProcedureName.attrs.tooltip"
            >
            <ui-select :value="entranceIndex" @change="onEntranceChange">
                <option
                    v-for="(idx, item) in allProcedureNames()"
                    :label="item"
                    :key="idx"
                    :value="idx"
                >{{item}}</option>
            </ui-select>
        </ui-prop>
    `,
    props: {
        target: {
            twoWay: true,
            type: Object
        }
    },
    data: () => ({
        cssFlexHorCenter: "flex-1 layout horizontal center",
        cssWrapper: {
            minHeight: "23px",
            maxHeight: "23px",
        },
        cssIndent1: {
            margin: 0,
            paddingLeft: "13px"
        },
        cssIndent2: {
            margin: 0,
            paddingLeft: "26px"
        },
        confirmText: 'Click',
        indent: 0,
        entranceIndex: -1,
        enableList: {},
        profile: null
    }),
    created() {
        let names = this.allProcedureNames();
        this.target.availableProcedureNames.value.forEach(p => {
            if (p)
                this.enableList[p.value] = true;
        });
        this.entranceIndex = names.indexOf(this.target.entranceProcedureName.value);
    },
    watch: {
        entranceIndex(newIdx, oldIdx) {
            if (newIdx == oldIdx)
                return;

            console.log("Target's entranceProcedureName.value: ", this.target.entranceProcedureName.value);
            if (newIdx == -1) {
                this.target.entranceProcedureName.value = null;
            } else {
                this.target.entranceProcedureName.value = this.allProcedureNames()[newIdx];
            }

            Editor.Ipc.sendToPanel("scene", "scene:set-property", {
                id: this.target.uuid.value,
                path: "entranceProcedureName",
                value: this.target.entranceProcedureName.value,
                isSubProp: false
            });
        }
    },
    methods: {
        allProcedureNames() {
            return cc.js.getClassByName("ProcedureComponent").getAllProcedureNames();
        },
        onEntranceChange(event) {
            let idx = parseInt(event.detail.value);
            this.entranceIndex = idx;
        },
        onProcedureStatusChange(event) {
            event.stopPropagation();
            let enabled = event.detail.value;
            let name = event.target.innerText;
            let entranceName = this.target.entranceProcedureName.value;
            if (name === entranceName && !enabled) {
                this.entranceIndex = -1;
            }

            let values = this.target.availableProcedureNames.value.map(o=>o.value);

            if (enabled) {
                values.push(name);
            } else {
                let idx = -1;
                do {
                    idx = values.indexOf(name);
                    values.splice(idx, 1);
                } while (idx > -1);
            }

            Editor.Ipc.sendToPanel("scene", "scene:set-property", {
                id: this.target.uuid.value,
                path: "availableProcedureNames",
                value: values,
                isSubProp: false
            });
        },
        checkProcedureEnable(item) {
            return item in this.enableList;
        }
    },
    compiled() {
        // console.log("The procedure inspector compiled");
    },
    destroyed() {
        // console.log("The procedure inspector destroyed");
    }
});
