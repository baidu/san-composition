describe('[templateOptions]: ', () => {
    const list = ['red', 'yellow', 'blue', 'green', 'pink', 'brown', 'purple', 'brown', 'white', 'black', 'orange'];
    const color = 'red';

    it('using default templateOptions', function () {
        const MyComponent = defineComponent(context => {
            template`
                <div>
                    <span title="{{color}}">{{color}}</span>
                    <div id="listWrap">
                        <div s-for="item in list">{{item}}</div>
                    </div>
                </div>
            `;
            onAttached(() => {
                expect(context.component.aNode.props.length).toBe(3);
            });
        }); 
        const myComponent = new MyComponent({data: {list, color}});
        const wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let listWrap = document.getElementById('listWrap').childNodes;
        expect(listWrap.length).toBe(list.length + 3);
        expect(listWrap[0].nodeType).toBe(3);

        myComponent.dispose();
        document.body.removeChild(wrap);
    });
    it('setting templateOptions.trimWhitespace to all', function () {
        let MyComponent = defineComponent(() => {
            template`
                <div id="listWrap">
                    <div s-for="item in list">{{item}}</div>
                </div>
            `;
            templateOptions({trimWhitespace: 'all'});
        });
        const myComponent = new MyComponent({data: {list}});
        const wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let listWrap = document.getElementById('listWrap').childNodes;
        expect(listWrap.length).toBe(list.length + 1);
        expect(listWrap[0].nodeType).toBe(1);

        myComponent.dispose();
        document.body.removeChild(wrap);
    });

    it('setting templateOptions.trimWhitespace to all', function () {
        let MyComponent = defineComponent(() => {
            template`<span title="{%color%}">{%color%}</span>`;
            templateOptions({delimiters: ['{%', '%}']});
        });
        const myComponent = new MyComponent({data: {color}});

        const wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('red');

        myComponent.dispose();
        document.body.removeChild(wrap);
    });

    it('setting templateOptions.autoFillStyleAndId to false', function () {
        let MyComponent = defineComponent(context => {
            template`
                <div>
                    <span title="{{color}}">{{color}}</span>
                    <div id="listWrap">
                        <div s-for="item in list">{{item}}</div>
                    </div>
                </div>
            `;
            templateOptions({autoFillStyleAndId: false});
            onAttached(() => {
                console.log(context.component.aNode.props)
                expect(context.component.aNode.props.length).toBe(0);
            });
        });
        
        const myComponent = new MyComponent({data: {list, color}});
        const wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        myComponent.dispose();
        document.body.removeChild(wrap);
    });
});
