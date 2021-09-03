describe('[watch]: ', () => {
    it("watch simple data item", function (done) {
        var MyComponent = defineComponent(() => {
            template('<a><span title="{{email}}">{{name}}</span></a>');

            watch('email', function (value, e) {
                expect(value).toBe(newValue);
                expect(e.oldValue).toBe(oldValue);
                expect(e.newValue).toBe(value);
                expect(this.data.get('email')).toBe(value);
                watchTriggerTimes++;
            });
        });

        var myComponent = new MyComponent();
        myComponent.data.set('email', 'errorrik@gmail.com');
        myComponent.data.set('name', 'errorrik');

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var watchTriggerTimes = 0;
        var oldValue = 'errorrik@gmail.com';
        var newValue = 'erik168@163.com';

        myComponent.data.set('email', newValue);
        myComponent.data.set('name', 'erik');
        expect(watchTriggerTimes).toBe(1);

        var span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('errorrik@gmail.com');

        san.nextTick(function () {
            expect(watchTriggerTimes).toBe(1);

            var span = wrap.getElementsByTagName('span')[0];
            expect(span.title).toBe(newValue);

            newValue = 'errorrik@gmail.com';
            oldValue = 'erik168@163.com';

            myComponent.data.set('email', newValue);
            myComponent.nextTick(function () {
                expect(watchTriggerTimes).toBe(2);

                var span = wrap.getElementsByTagName('span')[0];
                expect(span.title).toBe(newValue);

                myComponent.dispose();
                document.body.removeChild(wrap);
                done();
            });
        })

    });

    it("watch property accessor", function (done) {
        var MyComponent = defineComponent(() => {
            template('<a><span title="{{projects[0].author.email}}">{{projects[0].author.email}}</span></a>');
            const projects = data({
                projects: [
                    {
                        name: 'etpl',
                        author: {
                            email: 'errorrik@gmail.com',
                            name: 'errorrik'
                        }
                    }
                ]
            });

            var watchTriggerTimes = 0;
            var oldEmail = 'errorrik@gmail.com';
        

            var emailTriggerTimes = 0;

            watch('projects[0].author', function (value, e) {
                expect(value.email).toBe('erik168@163.com');
                expect(e.oldValue.email).toBe(oldEmail);
                expect(e.newValue).toBe(value);
                expect(projects.get('projects[0].author.email')).toBe(value.email);
                
                watchTriggerTimes++;
            });

            watch('projects[0].author.email', function (value, e) {
                expect(value).toBe('erik168@163.com');
                expect(e.oldValue).toBe(oldEmail);
                expect(e.newValue).toBe(value);
                expect(projects.get('projects[0].author.email')).toBe(value);
                emailTriggerTimes++;
            });
        });
    
        var myComponent = new MyComponent();

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        myComponent.data.set('projects[0].author.email', 'erik168@163.com');
        oldEmail = 'erik168@163.com';
        myComponent.data.set('projects[0].author.name', 'erik');
        expect(watchTriggerTimes).toBe(2);
        expect(emailTriggerTimes).toBe(1);

        var span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('errorrik@gmail.com');

        san.nextTick(function () {
            expect(watchTriggerTimes).toBe(2);
            expect(emailTriggerTimes).toBe(1);

            var span = wrap.getElementsByTagName('span')[0];
            expect(span.title).toBe('erik168@163.com');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        })
    });
});
