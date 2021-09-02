describe('defineComponent', () => {
    it("attach without parentEl, and dispose, got collect life cycle", function () {
        var MyComponent = defineComponent(() => {
            template('<div>hello san</div>');
        });

        var myComponent = new MyComponent();
    
        myComponent.attach();

        expect(!!myComponent.lifeCycle.is('attached')).toBeTruthy();

        myComponent.dispose();
        expect(!!myComponent.lifeCycle.is('disposed')).toBeTruthy();
    });
});
