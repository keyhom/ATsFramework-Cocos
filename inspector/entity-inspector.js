`use strict`;

Vue.component('atsframework-entity-inspector', {
    template: `
        <cc-prop :target.sync="target.m_bEnableShowEntityUpdateEvent"></cc-prop>
        <cc-prop :target.sync="target.m_bEnableShowEntityDependencyAssetEvent"></cc-prop>
        <cc-prop :target.sync="target.m_pInstanceRoot"></cc-prop>
        <ui-prop :name="target.m_sEntityHelperTypeName.name"
                 :tooltip="target.m_sEntityHelperTypeName.attrs.tooltip">
            <ui-select :value="entityHelperIdx" @change='onEntityHelperChange'>
                <option v-for='(idx, item) in entityHelperOptions'
                    :label='item' :key='idx' :value='idx'>
                    {{item}}
                </option>
            </ui-select>
        </ui-prop>
        <ui-prop :name="target.m_sEntityGroupHelperTypeName.name"
                 :tooltip="target.m_sEntityGroupHelperTypeName.attrs.tooltip">
            <ui-select :value="entityGroupHelperIdx" @change='onEntityGroupHelperChange'>
                <option v-for='(idx, item) in entityGroupHelperOptions'
                    :label='item' :key='idx' :value='idx'>
                    {{item}}
                </option>
            </ui-select>
        </ui-prop>
        <cc-array-prop :target.sync="target.m_pEntityGroups"></cc-array-prop>
    `,
    props: {
        target: {
            twoWay: true,
            type: Object
        }
    },
    data: () => ({
        entityHelperIdx: 0,
        entityHelperOptions: [],
        entityGroupHelperIdx: 0,
        entityGroupHelperOptions: []
    }),
    watch: {
        entityHelperIdx(newIdx, oldIdx) {
            if (newIdx == oldIdx)
                return;
            var value = this.entityHelperOptions[newIdx];
            Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
                id: this.target.uuid.value,
                path: 'm_sEntityHelperTypeName',
                value: value,
                isSubProp: false
            });
        },
        entityGroupHelperIdx() {
            if (newIdx == oldIdx)
                return;
            var value = this.entityGroupHelperOptions[newIdx];
            Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
                id: this.target.uuid.value,
                path: 'm_sEntityGroupHelperTypeName',
                value: value,
                isSubProp: false
            });
        }
    },
    methods: {
        onEntityHelperChange(event) {
            this.entityHelperIdx = parseInt(event.detail.value);
        },
        onEntityGroupHelperChange(event) {
            this.entityGroupHelperIdx = parseInt(event.detail.value);
        },
    },
    created() {
        var helperType = cc.js.getClassByName('Helper');
        var functions = helperType.getAllHelpers();

        // entity helpers.
        var entityHelperBase = cc.js.getClassByName('EntityHelperBase');
        var entityHelpers = functions.filter((func) => {
            return cc.js.isChildClassOf(func, entityHelperBase);
        });

        this.entityHelperOptions = entityHelpers.map(a => cc.js.getClassName(a));

        // entity group helpers.
        var entityGroupHelperBase = cc.js.getClassByName('EntityGroupHelperBase');
        var entityGroupHelpers = functions.filter((func) => {
            return cc.js.isChildClassOf(func, entityGroupHelperBase);
        });

        this.entityGroupHelperOptions = entityGroupHelpers.map(a => cc.js.getClassName(a));
    }
});
