`use strict`;

Vue.component('atsframework-resource-inspector', {
    template: `
        <ui-prop :name='target.m_sResourceLoaderName.name'
                 :tooltip='target.m_sResourceLoaderName.attrs.tooltip'>
            <ui-select :value='resourceLoaderIdx' @change='onResourceLoaderChange'>
                <option v-for='(idx, item) in resourceLoaderOptions'
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
        resourceLoaderIdx: 0,
        resourceLoaderOptions: []
    }),
    watch: {
        resourceLoaderIdx(newIdx, oldIdx) {
            if (newIdx == oldIdx)
                return;

            var v_sResourceLoaderName = this.resourceLoaderOptions[newIdx];
            Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
                id: this.target.uuid.value,
                path: 'm_sResourceLoaderName',
                value: v_sResourceLoaderName,
                isSubProp: false
            });
        }
    },
    created() {
        var helperType = cc.js.getClassByName('Helper');
        var helpers = helperType.getAllHelpers();

        var helperBase = cc.js.getClassByName('ResourceLoaderBase');
        var filterredHelpers = helpers.filter((func) => {
            return cc.js.isChildClassOf(func, helperBase);
        });

        this.resourceLoaderOptions = filterredHelpers.map(h => cc.js.getClassName(h));

        this.resourceLoaderIdx = this.target.m_sResourceLoaderName.value ? this.resourceLoaderOptions.indexOf(this.target.m_sResourceLoaderName.value) : 0;

    },
    methods: {
        onResourceLoaderChange(event) {
            this.resourceLoaderIdx = parseInt(event.detail.value);
        }
    }
});


