`use strict`;

Vue.component('atsframework-ui-inspector', {
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
        indent: 0,
    }),
    watch: {
        uiFormHelperIndex(newIdx, oldIdx) {
            if (newIdx == oldIdx)
                return;

            var value = this.uiFormHelperClassOptions[newIdx];
            Editor.Ipc.sendToPanel("scene", "scene:set-property", {
                id: this.target.uuid.value,
                path: 'm_sUIFormHelperClassName',
                value: v_sHelperName,
                isSubProp: false
            });
        },
        uiGroupHelperIndex(newIdx, oldIdx) {
            if (newIdx == oldIdx)
                return;

            var value = this.uiGroupHelperClassOptions[newIdx];
            Editor.Ipc.sendToPanel("scene", "scene:set-property", {
                id: this.target.uuid.value,
                path: 'm_sUIGroupHelperClassName',
                value: v_sHelperName,
                isSubProp: false
            });
        }
    },
    created() {
        var helperType = cc.js.getClassByName('Helper');
        var helpers = helperType.getAllHelpers();

        var uiFormHelperBase = cc.js.getClassByName('UIFormHelperBase');
        var filterredHelpers = helpers.filter((func) => {
            return cc.js.isChildClassOf(func, uiFormHelperBase);
        });

        this.uiFormHelperClassOptions = filterredHelpers.map(h => cc.js.getClassName(h));

        var uiGroupHelperBase = cc.js.getClassByName('UIGroupHelperBase');
        var filterredHelpers = helpers.filter((func) => {
            return cc.js.isChildClassOf(func, uiGroupHelperBase);
        });

        this.uiGroupHelperClassOptions = filterredHelpers.map(h => cc.js.getClassName(h));

        this.uiFormHelperIndex = this.target.m_sUIFormHelperClassName.value ? this.uiFormHelperClassOptions.indexOf(this.target.m_sUIFormHelperClassName.value) : 0;
        this.uiGroupHelperIndex = this.target.m_sUIGroupHelperClassName.value ? this.uiGroupHelperClassOptions.indexOf(this.target.m_sUIGroupHelperClassName.value) : 0;
    },
    methods: {
        onUIFormHelperClassNameChange(event) {
            let idx = parseInt(event.detail.value);
            this.uiFormHelperIndex = idx;
        },
        onUIGroupHelperClassNameChange(event) {
            let idx = parseInt(event.detail.value);
            this.uiGroupHelperIndex = idx;
        }
    },
    compiled() {
        console.log("The ui inspector compiled");
    },
    destroyed() {
        console.log("The ui inspector destroyed");
    }
});

