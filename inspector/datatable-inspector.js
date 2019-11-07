`use strict`;

Vue.component('atsframework-datatable-inspector', {
    template: `
        <cc-prop :target.sync="target.m_bEnableLoadDataTableUpdateEvent"></cc-prop>
        <cc-prop :target.sync="target.m_bEnableLoadDataTableDependencyAssetEvent"></cc-prop>
        <ui-prop :name='target.m_sDataTableHelperTypeName.name'
                 :tooltip='target.m_sDataTableHelperTypeName.attrs.tooltip'>
            <ui-select :value='dataTableHelperIdx' @change='onDataTableHelperChange'>
                <option v-for='(idx, item) in dataTableHelperOptions'
                    :label='item'
                    :key='idx'
                    :value='idx'
                >
                    {{item}}
                </option>
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
        dataTableHelperIdx: 0,
        dataTableHelperOptions: []
    }),
    watch: {
        dataTableHelperIdx(newIdx, oldIdx) {
            if (newIdx == oldIdx)
                return;

            var v_sDataTableHelperName = this.dataTableHelperOptions[newIdx];
            Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
                id: this.target.uuid.value,
                path: 'm_sDataTableHelperTypeName',
                value: v_sDataTableHelperName,
                isSubProp: false
            });
        }
    },
    created() {
        var helperType = cc.js.getClassByName('Helper');
        var helpers = helperType.getAllHelpers();

        var helperBase = cc.js.getClassByName('DataTableHelperBase');
        var filterredHelpers = helpers.filter((func) => {
            return cc.js.isChildClassOf(func, helperBase);
        });

        this.dataTableHelperOptions = filterredHelpers.map(h => cc.js.getClassName(h));

        this.dataTableHelperIdx = this.target.m_sDataTableHelperTypeName.value ? this.dataTableHelperOptions.indexOf(this.target.m_sDataTableHelperTypeName.value) : 0;

    },
    methods: {
        onDataTableHelperChange(event) {
            this.dataTableHelperIdx = parseInt(event.detail.value);
        }
    }
});

