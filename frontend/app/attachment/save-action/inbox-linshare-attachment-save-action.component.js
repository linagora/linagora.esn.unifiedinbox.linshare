(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox.linshare')

    .component('inboxLinshareAttachmentSaveAction', {
      templateUrl: '/linagora.esn.unifiedinbox.linshare/app/attachment/save-action/inbox-linshare-attachment-save-action.html',
      controller: 'inboxLinshareAttachmentSaveActionController',
      bindings: {
        attachment: '<'
      }
    });
})(angular);
