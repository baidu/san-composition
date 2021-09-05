describe('[defineComponent]: ', () => {
    it("attach without parentEl, and dispose, got collect life cycle", function () {
        let MyComponent = defineComponent(() => {
            template('<div>hello san</div>');
        });

        let myComponent = new MyComponent();
    
        myComponent.attach();

        expect(!!myComponent.lifeCycle.is('attached')).toBeTruthy();

        myComponent.dispose();
        expect(!!myComponent.lifeCycle.is('disposed')).toBeTruthy();
    });
});
