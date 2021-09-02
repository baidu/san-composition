describe('filters', () => {
    it("filters as static property", function () {
        var MyComponent = defineComponent(() => {
            template('<span title="{{color|up}}">{{color|up}}</span>');
            filters({
                up(source) {
                    return source.toUpperCase();
                }
            });
        });

        var myComponent = new MyComponent({data: {color: 'red'}});

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('RED');

        myComponent.dispose();
        document.body.removeChild(wrap);
    });
});
