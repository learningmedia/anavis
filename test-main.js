var karma  = window.__karma__,
    tests  = Object.keys(karma.files).filter(function (file) { return /Specs\.js$/.test(file); });

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: "/base/app/scripts/",
  paths: {
  	'uuid': '../bower_components/node-uuid/uuid'
  }
});

require(tests, function () {
  karma.start();
});
