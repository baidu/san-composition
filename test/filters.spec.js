describe('[filters]: ', () => {
    it("filters as static property", function () {
        let MyComponent = defineComponent(() => {
            template('<span title="{{color|up}}">{{color|up}}</span>');
            filters({
                up(source) {
                    return source.toUpperCase();
                }
            });
        });

        let myComponent = new MyComponent({data: {color: 'red'}});

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('RED');

        myComponent.dispose();
        document.body.removeChild(wrap);
    });
});
