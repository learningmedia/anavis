const os = require('os');
const path = require('path');

module.exports = {
  app: {
    getPath: () => path.join(os.tmpdir(), 'anavis-test')
  }
};
