`use strict`;

Vue.component('atsframework-sound-inspector', {
    template: `
        <cc-prop :target.sync='target.m_bEnablePlaySoundUpdateEvent'></cc-prop>
        <cc-prop :target.sync='target.m_bEnablePlaySoundDependencyAssetEvent'></cc-prop>
        <cc-prop :target.sync='target.m_pInstanceRoot'></cc-prop>
        <ui-prop :name='target.m_sSoundHelperTypeName.name'
                 :tooltip='target.m_sSoundHelperTypeName.attrs.tooltip'>
            <ui-select :value='soundHelperIdx' @change='onSoundHelperChange'>
                <option v-for='(idx, item) in soundHelperOptions'
                    :label='item'
                    :key='idx'
                    :value='idx'
                >
                    {{item}}
                </option>
            </ui-select>
        </ui-prop>
        <ui-prop :name='target.m_sSoundGroupHelperTypeName.name'
                 :tooltip='target.m_sSoundGroupHelperTypeName.attrs.tooltip'>
            <ui-select :value='soundGroupHelperIdx' @change='onSoundGroupHelperChange'>
                <option v-for='(idx, item) in soundGroupHelperOptions'
                    :label='item'
                    :key='idx'
                    :value='idx'
                >
                    {{item}}
                </option>
            </ui-select>
        </ui-prop>
        <ui-prop :name='target.m_sSoundAgentHelperTypeName.name'
                 :tooltip='target.m_sSoundAgentHelperTypeName.attrs.tooltip'>
            <ui-select :value='soundAgentHelperIdx' @change='onSoundAgentHelperChange'>
                <option v-for='(idx, item) in soundAgentHelperOptions'
                    :label='item'
                    :key='idx'
                    :value='idx'
                >
                    {{item}}
                </option>
            </ui-select>
        </ui-prop>
        <cc-array-prop :target.sync='target.m_pSoundGroupInfos'></cc-array-prop>
    `,
    props: {
        target: {
            twoWay: true,
            type: Object
        }
    },
    data: () => ({
        soundHelperIdx: 0,
        soundHelperOptions: [],
        soundGroupHelperIdx: 0,
        soundGroupHelperOptions: [],
        soundAgentHelperIdx: 0,
        soundAgentHelperOptions: []
    }),
    watch: {
        soundHelperIdx(newIdx, oldIdx) {
            if (newIdx == oldIdx)
                return;

            var v_sSoundHelperName = this.soundHelperOptions[newIdx];
            Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
                id: this.target.uuid.value,
                path: 'm_sSoundHelperTypeName',
                value: v_sSoundHelperName,
                isSubProp: false
            });
        },
        soundGroupHelperIdx(newIdx, oldIdx) {
            if (newIdx == oldIdx)
                return;

            var v_sHelperName = this.soundGroupHelperOptions[newIdx];
            Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
                id: this.target.uuid.value,
                path: 'm_sSoundGroupHelperTypeName',
                value: v_sHelperName,
                isSubProp: false
            });
        },
        soundAgentHelperIdx(newIdx, oldIdx) {
            if (newIdx == oldIdx)
                return;

            var v_sHelperName = this.soundAgentHelperOptions[newIdx];
            Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
                id: this.target.uuid.value,
                path: 'm_sSoundAgentHelperTypeName',
                value: v_sHelperName,
                isSubProp: false
            });
        }
    },
    created() {
        var helperType = cc.js.getClassByName('Helper');
        var helpers = helperType.getAllHelpers();

        var helperBase = cc.js.getClassByName('SoundHelperBase');
        var filterredHelpers = helpers.filter((func) => {
            return cc.js.isChildClassOf(func, helperBase);
        });

        this.soundHelperOptions = filterredHelpers.map(h => cc.js.getClassName(h));

        var groupHelperBase = cc.js.getClassByName('SoundGroupHelperBase');
        filterredHelpers = helpers.filter((func) => {
            return cc.js.isChildClassOf(func, groupHelperBase);
        });

        this.soundGroupHelperOptions = filterredHelpers.map(h => cc.js.getClassName(h));

        var agentHelperBase = cc.js.getClassByName('SoundAgentHelperBase');
        filterredHelpers = helpers.filter((func) => {
            return cc.js.isChildClassOf(func, agentHelperBase);
        });

        this.soundAgentHelperOptions = filterredHelpers.map(h => cc.js.getClassName(h));

        this.soundHelperIdx = this.target.m_sSoundHelperTypeName.value ? this.soundHelperOptions.indexOf(this.target.m_sSoundHelperTypeName.value) : 0;
        this.soundGroupHelperIdx = this.target.m_sSoundGroupHelperTypeName.value ? this.soundGroupHelperOptions.indexOf(this.target.m_sSoundGroupHelperTypeName.value) : 0;
        this.soundAgentHelperIdx = this.target.m_sSoundAgentHelperTypeName.value ? this.soundAgentHelperOptions.indexOf(this.target.m_sSoundAgentHelperTypeName.value) : 0;
    },
    methods: {
        onSoundHelperChange(event) {
            this.soundHelperIdx = parseInt(event.detail.value);
        },
        onSoundGroupHelperChange(event) {
            this.soundGroupHelperIdx = parseInt(event.detail.value);
        },
        onSoundAgentHelperChange(event) {
            this.soundAgentHelperIdx = parseInt(event.detail.value);
        }
    }
});

