describe('[method]: ', () => {
    let ColorPicker = defineComponent(context => {
        template('<div><b title="{{value}}">{{value}}</b>'
            + '<ul class="ui-colorpicker">'
            +    '<li '
            +        'san-for="item in datasource" '
            +        'style="background: {{item}}" '
            +        'class="{{item == value ? \'selected\' : \'\'}}" '
            +        'on-click="itemClick(item)"'
            +    '></li>'
            + '</ul></div>');

        const datasource = data('datasource', [
            'red', 'blue', 'yellow', 'green'
        ]);

        method({
            itemClick: function (item) {
                context.data.set('value', item);
            }
        });
    });
});
