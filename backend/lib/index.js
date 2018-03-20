'use strict';

module.exports = function(dependencies) {
  const models = require('./models')(dependencies);
  const attachment = require('./attachment')(dependencies);

  return {
    attachment,
    models
  };
};
