`use strict`;

Vue.component('atsframework-default-inspector', {
    template: `
        <ui-box-container class="shadow">
            <div class="style-scope yellow">
                <i class="icon-lock style-scope"></i>
                Available during runtime only!
            </div>
        </ui-box-container>
    `,
    props: {
        target: {
            twoWay: true,
            type: Object
        }
    }
});
