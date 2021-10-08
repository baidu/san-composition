describe("[DataProxy]: ", function () {
    it("update using data merge", function (done) {
        let MyComponent = defineComponent(()=> {
            template('<a><b>{{info.title}}</b><span>{{info.text}}</span></a>');
            const info = data('info', {
                title: 'President',
                text: 'Trump'
            });

            method('getNewPresident', ()=> {
                info.merge({
                    title: 'Next President',
                    text: 'Biden'
                })
            });
        });

        let myComponent = new MyComponent();

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let span = wrap.getElementsByTagName('span')[0];
        let b = wrap.getElementsByTagName('b')[0];
        expect(span.innerHTML).toBe('Trump');
        expect(b.innerHTML).toBe('President');
        
        myComponent.getNewPresident();

        san.nextTick(function () {
            let span = wrap.getElementsByTagName('span')[0];
            let b = wrap.getElementsByTagName('b')[0];
            expect(span.innerHTML).toBe('Biden');
            expect(b.innerHTML).toBe('Next President');
            expect(myComponent.data.get('info.text')).toBe('Biden');
            expect(myComponent.data.get('info.title')).toBe('Next President');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });


    });

    it("set inner with using apply", function (done) {
        let MyComponent = defineComponent(() => {
            template('<div><span title="{{p.org.name}}"></span></div>');
            const p = data('p', {
                name: 'erik',
                email: 'errorrik@gmail.com',
                org: {
                    name: 'efe',
                    company: 'baidu'
                }
            });
            onAttached(() => {
                p.apply('org', () => {
                    return {
                        name: 'ssg',
                        company: 'baidu'
                    };
                });
            });
        });

        let myComponent = new MyComponent();

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let span = wrap.firstChild.firstChild;
        expect(span.title).toBe('efe');

        san.nextTick(function () {
            expect(span.title).toBe('ssg');

            myComponent.dispose();
            document.body.removeChild(wrap);

            done();
        });
    });

    it("array literal with spread, in multi-line attr", function (done) {
        let List = defineComponent(() => {
            template('<ul><li s-for="item in list">{{item}}</li></ul>');
        });

        let MyComponent = defineComponent(() => {
            components({
                'x-l': List
            });
            template('<div><x-l list="{{[1, \n    true, \n    ...ext, \n    \'erik\', \n    ...ext2]}}"/></div>');

            const ext = data('ext', []);
            const ext2 = data('ext2', []);

            method('addTen', () => {
                ext.push(10);
            });

            onAttached(() => {
                ext.set([3, 4]);
                ext2.set([5, 6]);
            });
        });

        let myComponent = new MyComponent();

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let lis = wrap.getElementsByTagName('li');
        expect(lis.length).toBe(3);

        expect(lis[0].innerHTML).toBe('1');
        expect(lis[1].innerHTML).toBe('true');
        expect(lis[2].innerHTML).toBe('erik');
    

        san.nextTick(function () {
            let lis = wrap.getElementsByTagName('li');
            expect(lis.length).toBe(7);

            expect(lis[0].innerHTML).toBe('1');
            expect(lis[1].innerHTML).toBe('true');
            expect(lis[4].innerHTML).toBe('erik');
            expect(lis[2].innerHTML).toBe('3');
            expect(lis[3].innerHTML).toBe('4');

            expect(lis[5].innerHTML).toBe('5');
            expect(lis[6].innerHTML).toBe('6');

            myComponent.addTen();

            san.nextTick(function () {
                expect(lis[0].innerHTML).toBe('1');
                expect(lis[1].innerHTML).toBe('true');
                expect(lis[2].innerHTML).toBe('3');
                expect(lis[3].innerHTML).toBe('4');

                expect(lis[4].innerHTML).toBe('10');
                expect(lis[5].innerHTML).toBe('erik');
                expect(lis[6].innerHTML).toBe('5');
                expect(lis[7].innerHTML).toBe('6');

                myComponent.dispose();
                document.body.removeChild(wrap);

                done();
            })

        });
    });
});
