(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox.linshare')
    .run(run);

  function run(
    inboxAttachmentProviderRegistry,
    inboxLinshareAttachmentProvider,
    inboxLinsharePresendingHook,
    inboxEmailSendingHookService
  ) {
    inboxAttachmentProviderRegistry.add(inboxLinshareAttachmentProvider);
    inboxEmailSendingHookService.registerPreSendingHook(inboxLinsharePresendingHook);
  }
})(angular);
