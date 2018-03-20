'use strict';

module.exports = function(dependencies) {
  const InboxLinshareAttachment = require('./attachment')(dependencies);

  return {
    InboxLinshareAttachment
  };
};
