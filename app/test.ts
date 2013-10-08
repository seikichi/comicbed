declare var mocha: any;
declare var testfiles: any;

require(['config'], () => {
  require(testfiles, () => {
    mocha.run();
  });
});
