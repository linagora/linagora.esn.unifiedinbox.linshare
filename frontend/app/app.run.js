(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox.linshare')
    .run(run);

  function run(
    inboxAttachmentProviderRegistry,
    inboxLinshareAttachmentProvider,
    inboxLinshareSharingHook,
    inboxEmailSendingHookService
  ) {
    inboxAttachmentProviderRegistry.add(inboxLinshareAttachmentProvider);
    inboxEmailSendingHookService.registerPreSendingHook(inboxLinshareSharingHook);
  }
})(angular);
