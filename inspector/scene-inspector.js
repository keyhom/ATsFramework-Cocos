`use strict`;

Vue.component('atsframework-scene-inspector', {
    template: `
        <cc-prop :target.sync="target.m_bEnableLoadSceneUpdateEvent"></cc-prop>
        <cc-prop :target.sync="target.m_bEnableLoadSceneDependencyAssetEvent"></cc-prop>
    `,
    props: {
        target: {
            twoWay: true,
            type: Object
        }
    }
});

