`use strict`;

Vue.component('atsframework-inspector', {
    template: `
        <ui-box-container class="shadow">
            <editor-label class="style-scope yellow">
                <i class="icon-lock style-scope"></i>
                Available during runtime only!
            </editor-label>
        </ui-box-container>
    `,
    props: {
        target: {
            twoWay: true,
            type: Object
        }
    }
});
