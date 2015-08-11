require('../GrammerFixer');
require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Speech.GrammerFixer', function() {
  var
    fixer,
    fixList;

  beforeEach(function() {
    fixList = {
        'kolloid': 'Consoloid',
        'konzol': 'Consoloid'
    };
    fixer = env.create('Consoloid.Speech.GrammerFixer', {
      fixList: fixList
    });
  });

  describe('#constructor', function() {
    it('should be a the default empty fixerList', function(){
      fixer = env.create('Consoloid.Speech.GrammerFixer', {});
      fixer.fixList.should.be.eql({});
    });

    it('should convert the fixList key:value structure to key: {regexp:regexp,target:value}', function() {
      fixer.fixList.should.be.eql({
        'kolloid': { regexp: /\bkolloid\b/gi, target:'Consoloid'},
        'konzol': { regexp: /\bkonzol\b/gi, target:'Consoloid'}
        });
    });
  });

  describe('#fix(text)', function() {
    it('should return the same text if the is nothing to change', function(){
      fixer.fix('Sample text').should.be.eql('Sample text');
    });

    it('should replace a match in the text', function(){
      fixer.fix('Sample kolloid text').should.be.eql('Sample Consoloid text');
    });

    it('should replace multiple match in multiple times', function(){
      fixer.fix('Sample kolloid text to be konzol or kolloid').should.be.eql('Sample Consoloid text to be Consoloid or Consoloid');
    });

    it('should replace incase-sensitive', function(){
      fixer.fix('Sample KollOiD text').should.be.eql('Sample Consoloid text');
    });

    it('should replace only whole text match', function(){
      fixer.fix('Sample kolloidation kolloid').should.be.eql('Sample kolloidation Consoloid');
      fixer.fix('Sample unkolloid kolloid').should.be.eql('Sample unkolloid Consoloid');
      fixer.fix('Kolloid unkolloidation kolloid').should.be.eql('Consoloid unkolloidation Consoloid');
    });
  });
 });
