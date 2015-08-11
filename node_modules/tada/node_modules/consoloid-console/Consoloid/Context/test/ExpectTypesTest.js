require("../ExpectTypes");

require('consoloid-framework/Consoloid/Test/UnitTest');
describeUnitTest('Consoloid.Context.ExpectTypes', function() {
  var
    context,
    restrictor;

    describe('#typesIsPresent()', function(){
      beforeEach(function(){
        restrictor = env.create('Consoloid.Context.ExpectTypes', {});
        context = {
          hasClass: sinon.stub()
        }

        env.addServiceMock('context', context);
      });

      it('should return false when any setted context object is missing from the context', function(){
        restrictor.setTypes(['foo', 'bar']);
        context.hasClass.withArgs('foo').returns(true);
        context.hasClass.withArgs('bar').returns(false);

        restrictor.typesIsPresent().should.be.false;
      });

      it('should return true when all context object type is in the context', function(){
        restrictor.setTypes(['foo', 'bar']);
        context.hasClass.returns(true);

        restrictor.typesIsPresent().should.be.true;
      });
    });
});
