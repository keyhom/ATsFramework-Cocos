`use strict`;

Vue.component('atsframework-config-inspector', {
    template: `
        <cc-prop :target.sync="target.m_bEnableLoadConfigUpdateEvent"></cc-prop>
        <cc-prop :target.sync="target.m_bEnableLoadConfigDependencyAssetEvent"></cc-prop>
        <ui-prop :name='target.m_sConfigHelperTypeName.name'
                 :tooltip='target.m_sConfigHelperTypeName.attrs.tooltip'>
            <ui-select :value='configHelperIdx' @change='onConfigHelperChange'>
                <option v-for='(idx, item) in configHelperOptions'
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
        configHelperIdx: 0,
        configHelperOptions: []
    }),
    watch: {
        configHelperIdx(newIdx, oldIdx) {
            var v_sConfigHelperName = this.configHelperOptions[newIdx];
            Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
                id: this.target.uuid.value,
                path: 'm_sConfigHelperTypeName',
                value: v_sConfigHelperName,
                isSubProp: false
            });
        }
    },
    created() {
        var helperType = cc.js.getClassByName('Helper');
        var helpers = helperType.getAllHelpers();

        var configHelperBase = cc.js.getClassByName('ConfigHelperBase');
        var configHelpers = helpers.filter((func) => {
            return cc.js.isChildClassOf(func, configHelperBase);
        });

        this.configHelperOptions = configHelpers.map(h => cc.js.getClassName(h));

        this.configHelperIdx = this.target.m_sConfigHelperTypeName.value ? this.configHelperOptions.indexOf(this.target.m_sConfigHelperTypeName.value) : 0;

    },
    methods: {
        onConfigHelperChange(event) {
            this.configHelperIdx = parseInt(event.detail.value);
        }
    }
});
