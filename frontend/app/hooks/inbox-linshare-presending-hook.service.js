(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox.linshare')
    .factory('inboxLinsharePresendingHook', inboxLinsharePresendingHook);

  function inboxLinsharePresendingHook(
    $q,
    _,
    esnLinshareApiClient,
    emailSendingService,
    INBOX_LINSHARE_ATTACHMENT_TYPE,
    INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE
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
      var htmlMessage =
        '<br />' +
        '<p style="font-family: Roboto; font-size: 12px; color: rgba(0,0,0,0.65); text-align: center">' +
          '<i>' + INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE.replace(/%s/, documents.length) + '</i>' +
        '</p>';
      var textMessage = '\n\n-----------------------------------\n' + INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE.replace(/%s/, documents.length);

      if (!documents.length || !recipients.length) {
        return $q.when();
      }

      return esnLinshareApiClient.shareDocuments({
        documents: documents,
        recipients: recipients
      }).then(function() {
        if (email.htmlBody) {
          email.htmlBody += htmlMessage;
        }
        if (email.textBody) {
          email.textBody += textMessage;
        }
      });
    };
  }
})(angular);
