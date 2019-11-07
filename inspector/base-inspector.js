`use strict`;

Vue.component('atsframework-base-inspector', {
    template: `
        <cc-prop :target.sync="target.frameRate"></cc-prop>
        <cc-prop :target.sync="target.speedMultipiler"></cc-prop>
        <cc-prop :target.sync="target.enableDynamicAltasPacked"></cc-prop>
    `,
    props: {
        target: {
            twoWay: true,
            type: Object
        }
    }
});

