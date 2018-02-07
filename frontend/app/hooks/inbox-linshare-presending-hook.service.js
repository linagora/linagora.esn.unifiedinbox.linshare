(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox.linshare')
    .factory('inboxLinsharePresendingHook', inboxLinsharePresendingHook);

  function inboxLinsharePresendingHook(
    $q,
    _,
    esnLinshareApiClient,
    emailSendingService,
    INBOX_LINSHARE_ATTACHMENT_TYPE
  ) {
    return function(email) {
      var documents = _.remove(email.attachments, function(attachment) {
        return attachment.attachmentType === INBOX_LINSHARE_ATTACHMENT_TYPE;
      }).map(function(attachment) {
        return attachment.uuid;
      }).filter(Boolean);
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
