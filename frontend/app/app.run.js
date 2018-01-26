(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox.linshare')
    .run(run);

  function run(
    inboxAttachmentRegistry,
    inboxLinshareAttachmentProvider,
    inboxLinshareSharingHook,
    inboxEmailSendingHookService
  ) {
    inboxAttachmentRegistry.add(inboxLinshareAttachmentProvider);
    inboxEmailSendingHookService.registerPreSendingHook(inboxLinshareSharingHook);
  }
})(angular);
