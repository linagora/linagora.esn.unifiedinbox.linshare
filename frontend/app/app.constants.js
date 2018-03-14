(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox.linshare')
    .constant('INBOX_LINSHARE_ATTACHMENT_TYPE', 'linshare')
    .constant('INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES', {
      plural: 'This email contains %s LinShare attachments.',
      singular: 'This email contains a LinShare attachment.'
    });
})(angular);
