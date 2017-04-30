const path = require('path');
const mockery = require('mockery');

mockery.registerSubstitute('electron', path.resolve(__dirname, './fake-electron.js'));
mockery.enable();
