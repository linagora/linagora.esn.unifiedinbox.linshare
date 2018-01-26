(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox.linshare')
    .factory('inboxLinshareSharingHook', inboxLinshareSharingHook);

  function inboxLinshareSharingHook(
    $q,
    esnLinshareApiClient,
    emailSendingService,
    INBOX_LINSHARE_ATTACHMENT_TYPE
  ) {
    return function(email) {
      var documents = (email.attachments || []).filter(function(attachment, index) {
        if (attachment.attachmentType === INBOX_LINSHARE_ATTACHMENT_TYPE) {
          email.attachments.splice(index, 1);

          return true;
        }
      }).map(function(attachment) {
        return attachment.uuid;
      });
      var recipients = emailSendingService.getAllRecipientsExceptSender(email).map(function(recipient) {
        return { mail: recipient.email };
      });

      if (!documents.length || !recipients.length) {
        return $q.when();
      }

      return esnLinshareApiClient.shareDocuments({
        documents: documents,
        recipients: recipients
      });
    };
  }
})(angular);
