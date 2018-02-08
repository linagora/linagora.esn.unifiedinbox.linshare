(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox.linshare')
    .run(run);

  function run(
    inboxAttachmentProviderRegistry,
    inboxLinshareAttachmentProvider,
    inboxLinsharePresendingHook,
    inboxEmailSendingHookService,
    dynamicDirectiveService
  ) {
    var ddDesktop = new dynamicDirectiveService.DynamicDirective(function() { return true; }, 'inbox-linshare-composer-select-attachment', {
      attributes: [{ name: 'email', value: 'email' }]
    });
    var ddMobile = new dynamicDirectiveService.DynamicDirective(function() { return true; }, 'inbox-linshare-composer-select-attachment', {
      attributes: [{ name: 'email', value: 'email' }, { name: 'is-mobile', value: 'true' }]
    });

    dynamicDirectiveService.addInjection('inboxComposerExtraButtons', ddDesktop);
    dynamicDirectiveService.addInjection('inboxMobileComposerExtraButtons', ddMobile);
    inboxAttachmentProviderRegistry.add(inboxLinshareAttachmentProvider);
    inboxEmailSendingHookService.registerPreSendingHook(inboxLinsharePresendingHook);
  }
})(angular);
