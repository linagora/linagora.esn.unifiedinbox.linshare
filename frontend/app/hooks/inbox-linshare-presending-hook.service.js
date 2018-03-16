(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox.linshare')
    .factory('inboxLinsharePresendingHook', inboxLinsharePresendingHook);

  function inboxLinsharePresendingHook(
    $q,
    _,
    esnI18nService,
    esnLinshareApiClient,
    emailSendingService,
    INBOX_LINSHARE_ATTACHMENT_TYPE,
    INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES
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

      var message = documents.length > 1 ?
        esnI18nService.translate(INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES.plural, documents.length).toString() :
        esnI18nService.translate(INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES.singular).toString();

      var htmlMessage =
        '<br />' +
        '<p style="font-family: Roboto; font-size: 12px; color: rgba(0,0,0,0.65); text-align: center">' +
          '<i>' + message + '</i>' +
        '</p>';
      var textMessage = '\n\n-----------------------------------\n' + message;

      return esnLinshareApiClient.shareDocuments({
        documents: documents,
        recipients: recipients
      }).then(function() {
        email.htmlBody = email.htmlBody ? email.htmlBody += htmlMessage : htmlMessage;
        email.textBody = email.textBody ? email.textBody += textMessage : textMessage;
      });
    };
  }
})(angular);
