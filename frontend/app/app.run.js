(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox.linshare')
    .run(run)
    .run(injectAttachmentSaveAction);

  function run(
    inboxAttachmentProviderRegistry,
    inboxLinshareAttachmentProvider,
    inboxLinsharePresendingHook,
    inboxLinsharePrecomposingHook,
    inboxEmailSendingHookService,
    inboxEmailComposingHookService,
    dynamicDirectiveService,
    linshareConfigurationService
  ) {
    linshareConfigurationService.isConfigured().then(function(isConfigured) {
      if (!isConfigured) {
        return;
      }

      var ddDesktop = new dynamicDirectiveService.DynamicDirective(function() { return true; }, 'inbox-linshare-composer-select-attachment', {
        attributes: [{ name: 'email', value: '$ctrl.message' }]
      });

      var ddMobile = new dynamicDirectiveService.DynamicDirective(function() { return true; }, 'inbox-linshare-composer-select-attachment', {
        attributes: [{ name: 'email', value: '$ctrl.message' }, { name: 'is-mobile', value: 'true' }]
      });

      dynamicDirectiveService.addInjection('inboxComposerExtraButtons', ddDesktop);
      dynamicDirectiveService.addInjection('inboxMobileComposerExtraButtons', ddMobile);
      inboxAttachmentProviderRegistry.add(inboxLinshareAttachmentProvider);
      inboxEmailSendingHookService.registerPreSendingHook(inboxLinsharePresendingHook);
      inboxEmailComposingHookService.registerPreComposingHook(inboxLinsharePrecomposingHook);
    });
  }

  function injectAttachmentSaveAction(dynamicDirectiveService) {
    var saveAction = new dynamicDirectiveService.DynamicDirective(true, 'inbox-linshare-attachment-save-action', {
      attributes: [{ name: 'attachment', value: 'attachment' }],
      priority: -10
    });

    dynamicDirectiveService.addInjection('attachments-action-list', saveAction);
  }
})(angular);
