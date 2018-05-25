'use strict';

module.exports = function(dependencies, lib, router) {
  const authorizationMW = dependencies('authorizationMW');
  const helperMW = dependencies('helperMW');
  const controller = require('./controller')(dependencies, lib);
  const middleware = require('./middleware')(dependencies, lib);

  router.get('/attachments',
    authorizationMW.requiresAPILogin,
    controller.getAttachments);

  router.post('/attachments',
    authorizationMW.requiresAPILogin,
    helperMW.requireBody,
    middleware.validateAttachmentCreation,
    middleware.loadAttachmentIfExist,
    controller.createAttachment);

  router.post('/attachments/:attachmentId',
    authorizationMW.requiresAPILogin,
    helperMW.checkIdInParams('attachmentId', 'Attachment'),
    helperMW.requireBody,
    middleware.load,
    controller.updateAttachment);
};
