`use strict`;

Vue.component('atsframework-setting-inspector', {
    template: `
        <ui-prop :name='target.m_sSettingHelperTypeName.name'
                 :tooltip='target.m_sSettingHelperTypeName.attrs.tooltip'>
            <ui-select :value='settingHelperIdx' @change='onSettingHelperChange'>
                <option v-for='(idx, item) in settingHelperOptions'
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
        settingHelperIdx: 0,
        settingHelperOptions: []
    }),
    watch: {
        settingHelperIdx(newIdx, oldIdx) {
            if (newIdx == oldIdx)
                return;

            var v_sSettingHelperName = this.settingHelperOptions[newIdx];
            Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
                id: this.target.uuid.value,
                path: 'm_sSettingHelperTypeName',
                value: v_sSettingHelperName,
                isSubProp: false
            });
        }
    },
    created() {
        var helperType = cc.js.getClassByName('Helper');
        var helpers = helperType.getAllHelpers();

        var helperBase = cc.js.getClassByName('SettingHelperBase');
        var filterredHelpers = helpers.filter((func) => {
            return cc.js.isChildClassOf(func, helperBase);
        });

        this.settingHelperOptions = filterredHelpers.map(h => cc.js.getClassName(h));

        this.settingHelperIdx = this.target.m_sSettingHelperTypeName.value ? this.settingHelperOptions.indexOf(this.target.m_sSettingHelperTypeName.value) : 0;

    },
    methods: {
        onSettingHelperChange(event) {
            this.settingHelperIdx = parseInt(event.detail.value);
        }
    }
});
