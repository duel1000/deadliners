require('consoloid-framework/Consoloid/Test/UnitTest');
require('./ConsoleEnvironment');
global.describeConsoleUnitTest = function(name, fn) {
  describeUnitTest(name, fn, Consoloid.Test.ConsoleEnvironment);
};