`use strict`;

Vue.component('ui-inspector', {
    template: `
        <cc-prop :target.sync='target.m_bEnableOpenUIFormSuccessEvent'></cc-prop>
        <cc-prop :target.sync='target.m_bEnableOpenUIFormFailureEvent'></cc-prop>
        <cc-prop :target.sync='target.m_bEnableOpenUIFormUpdateEvent'></cc-prop>
        <cc-prop :target.sync='target.m_bEnableCloseUIFormCompleteEvent'></cc-prop>
        <cc-prop :target.sync='target.m_pInstanceRoot'></cc-prop>
        <ui-prop :name='target.m_sUIFormHelperClassName.name'
                 :tooltip='target.m_sUIFormHelperClassName.attrs.tooltip'>
            <ui-select :value='uiFormHelperIndex' @change='onUIFormHelperClassNameChange'>
                <option v-for="(idx, item) in uiFormHelperClassOptions"
                    :label="item"
                    :key="idx"
                    :value="idx">
                    {{item}}
                </option>
            </ui-select>
        </ui-prop>

        <ui-prop :name='target.m_sUIGroupHelperClassName.name'
                 :tooltip='target.m_sUIGroupHelperClassName.attrs.tooltip'>
            <ui-select :value='uiGroupHelperIndex' @change='onUIGroupHelperClassNameChange'>
                <option v-for="(idx, item) in uiGroupHelperClassOptions"
                    :label="item"
                    :key="idx"
                    :value="idx">
                    {{item}}
                </option>
            </ui-select>
        </ui-prop>

        <!-- <ui-prop
            :name='target.uiGroups.name'
            :tooltip='target.uiGroups.attrs.tooltip'
            :indent='indent'
            foldable>
            <div class="child">
                <ui-prop :indent="indent+1" name="Size">
                    <ui-input :value="uiGroupCount" @change="onUIGroupCountChange"></ui-input>
                </ui-prop>
                <ui-prop
                    :name="item.groupName"
                    :indent="indent+2"
                    v-for="(idx, item) in uiGroups" foldable>
                    <div class="child">
                        <ui-prop name="Name" :indent="indent+3">
                            <ui-input :value="item.groupName" @change="onUIGroupNameChange($event, idx)"></ui-input>
                        </ui-prop>
                        <ui-prop name="Depth" :value="item.depth" :indent="indent+3">
                            <ui-input :value="item.depth" @change="onUIGroupDepthChange($event, idx)"></ui-input>
                        </ui-prop>
                    </div>
                </ui-prop>
            </div>
        </ui-prop> -->
        <cc-array-prop :target.sync="target.uiGroups">
        </cc-array-prop>
    `,
    props: {
        target: {
            twoWay: true,
            type: Object
        }
    },
    data: () => ({
        uiFormHelperIndex: 0,
        uiFormHelperClassOptions: [],
        uiGroupHelperIndex: 0,
        uiGroupHelperClassOptions: [],
        uiGroupCount: 0,
        uiGroups: [],
        indent: 0,
    }),
    watch: {
        uiFormHelperIndex() {

        },
        uiGroupHelperIndex() {

        },
        uiGroupCount() {
            if (this.uiGroupCount != this.uiGroups.length) {
                if (this.uiGroups.length > this.uiGroupCount) {
                    this.uiGroups.splice(this.uiGroupCount, this.uiGroups.length - this.uiGroupCount);
                } else if (this.uiGroups.length < this.uiGroupCount) {
                    let v_pUIGroupInfoType = cc.js.getClassByName('UIGroupInfo');
                    for (let i = this.uiGroups.length; i < this.uiGroupCount; i++) {
                        let obj = new v_pUIGroupInfoType();
                        this.uiGroups.push(obj);
                    }
                }
            }

            this.syncUIGroups();
        },
        uiGroups() {
            this.syncUIGroups();
        }
    },
    created() {
        if (this.target.m_sUIFormHelperClassName.attrs.default)
            this.uiFormHelperClassOptions.push(this.target.m_sUIFormHelperClassName.attrs.default);

        if (this.target.m_sUIFormHelperClassName.value != this.target.m_sUIFormHelperClassName.attrs.default)
            this.uiFormHelperClassOptions.push(this.target.m_sUIFormHelperClassName.value);

        if (this.target.m_sUIGroupHelperClassName.attrs.default)
            this.uiGroupHelperClassOptions.push(this.target.m_sUIGroupHelperClassName.attrs.default);

        if (this.target.m_sUIGroupHelperClassName.value != this.target.m_sUIGroupHelperClassName.attrs.default)
            this.uiGroupHelperClassOptions.push(this.target.m_sUIGroupHelperClassName.value);

        this.uiFormHelperIndex = this.target.m_sUIFormHelperClassName.value ? this.uiFormHelperClassOptions.indexOf(this.target.m_sUIFormHelperClassName.value) : 0;
        this.uiGroupHelperIndex = this.target.m_sUIGroupHelperClassName.value ? this.uiGroupHelperClassOptions.indexOf(this.target.m_sUIGroupHelperClassName.value) : 0;

        // Editor.Ipc.sendToPanel('scene', 'scene:query-nodes-by-comp-name', 'UIComponent', (error, dump) => {
        //     if (error)
        //         return Editor.error(error);
        //     for (let uuid of dump) {
        //         Editor.Ipc.sendToPanel('scene', 'scene:query-node', uuid, (_e, _d) => {
        //             if (_e)
        //                 return Editor.error(_e);
        //             Editor.log(_d);
        //         });
        //     }
        // });

        // Editor.Ipc.sendToPanel('scene', 'scene:query-node', this.target.node.value.uuid, (error, dump) => {
        //     if (error)
        //         return Editor.error(error);

        //     Editor.log(dump);
        // });

        return;

        let v_pDefaultUIGroups = this.target.m_pUIGroups.attrs.default;
        let v_pCustomUIGroups = this.target.uiGroups.value.map(g => {
            return g.value;
        }).filter(g=>{ return g; });

        if (v_pCustomUIGroups.length == 0)
            this.uiGroups = this.uiGroups.concat(v_pDefaultUIGroups);
        else
            this.uiGroups = v_pCustomUIGroups;

        this.uiGroupCount = this.uiGroups.length;
    },
    methods: {
        syncUIGroups() {
            Editor.Ipc.sendToPanel("scene", "scene:set-property", {
                id: this.target.uuid.value,
                path: "uiGroups",
                value: this.uiGroups,
                isSubProp: false
            });
        },
        onUIFormHelperClassNameChange(event) {
            let idx = event.detail.value;
            this.uiFormHelperIndex = idx;
        },
        onUIGroupHelperClassNameChange(event) {
            let idx = event.detail.value;
            this.uiGroupHelperIndex = idx;
        },
        onUIGroupCountChange(event) {
            let count = event.detail.value;
            this.uiGroupCount = parseInt(count);
        },
        onUIGroupNameChange(event, idx) {
            this.uiGroups[idx].groupName = event.detail.value;
            this.uiGroups.splice(this.uiGroups.length);
        },
        onUIGroupDepthChange(event, idx) {
            this.uiGroups[idx].depth = parseInt(event.detail.value);
            this.uiGroups.splice(this.uiGroups.length);
        }
    },
    compiled() {
        console.log("The ui inspector compiled");
    },
    destroyed() {
        console.log("The ui inspector destroyed");
    }
});

