describe('[watch]: ', () => {
    it("watch simple data item", function (done) {
        let MyComponent = defineComponent(() => {
            template('<a><span title="{{email}}">{{name}}</span></a>');

            watch('email', function (value, e) {
                expect(value).toBe(newValue);
                expect(e.oldValue).toBe(oldValue);
                expect(e.newValue).toBe(value);
                expect(this.data.get('email')).toBe(value);
                watchTriggerTimes++;
            });
        });

        let myComponent = new MyComponent();
        myComponent.data.set('email', 'errorrik@gmail.com');
        myComponent.data.set('name', 'errorrik');

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let watchTriggerTimes = 0;
        let oldValue = 'errorrik@gmail.com';
        let newValue = 'erik168@163.com';

        myComponent.data.set('email', newValue);
        myComponent.data.set('name', 'erik');
        expect(watchTriggerTimes).toBe(1);

        let span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('errorrik@gmail.com');

        san.nextTick(function () {
            expect(watchTriggerTimes).toBe(1);

            let span = wrap.getElementsByTagName('span')[0];
            expect(span.title).toBe(newValue);

            newValue = 'errorrik@gmail.com';
            oldValue = 'erik168@163.com';

            myComponent.data.set('email', newValue);
            myComponent.nextTick(function () {
                expect(watchTriggerTimes).toBe(2);

                let span = wrap.getElementsByTagName('span')[0];
                expect(span.title).toBe(newValue);

                myComponent.dispose();
                document.body.removeChild(wrap);
                done();
            });
        })

    });

    it("watch property accessor", function (done) {
        let testEmail = 'errorrik@gmail.com';
        let watchTriggerTimes = 0;
        let emailTriggerTimes = 0;

        let MyComponent = defineComponent(() => {
            template('<a><span title="{{projects[0].author.email}}">{{projects[0].author.email}}</span></a>');
            const projects = data({
                projects: [
                    {
                        name: 'etpl',
                        author: {
                            email: testEmail,
                            name: 'errorrik'
                        }
                    }
                ]
            });

            watch('projects[0].author', function (value, e) {
                expect(value.email).toBe('erik168@163.com');
                expect(e.oldValue.email).toBe(testEmail);
                expect(e.newValue).toBe(value);
                expect(projects.get('projects[0].author.email')).toBe(value.email);
                watchTriggerTimes++;
            });

            watch('projects[0].author.email', function (value, e) {
                expect(value).toBe('erik168@163.com');
                expect(e.oldValue).toBe(testEmail);
                expect(e.newValue).toBe(value);
                expect(projects.get('projects[0].author.email')).toBe(value);
                emailTriggerTimes++;
            });
        });

        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        myComponent.data.set('projects[0].author.email', 'erik168@163.com');
        // 这里要修改下 testEmail 变量，保证测试能通过
        testEmail = 'erik168@163.com';
        myComponent.data.set('projects[0].author.name', 'erik');
        expect(watchTriggerTimes).toBe(2);
        expect(emailTriggerTimes).toBe(1);

        let span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('errorrik@gmail.com');

        san.nextTick(function () {
            expect(watchTriggerTimes).toBe(2);
            expect(emailTriggerTimes).toBe(1);

            let span = wrap.getElementsByTagName('span')[0];
            expect(span.title).toBe('erik168@163.com');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        })
    });
});
