(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox.linshare')

    .component('inboxLinshareComposerSelectAttachment', {
      templateUrl: '/linagora.esn.unifiedinbox.linshare/app/composer-select-attachment/composer-select-attachment.html',
      controller: 'inboxLinshareComposerSelectAttachmentController',
      bindings: {
        email: '<',
        isMobile: '<'
      }
    });
})(angular);
