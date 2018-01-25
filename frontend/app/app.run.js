(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox.linshare')
    .run(run);

  function run(
    inboxAttachmentRegistry,
    inboxLinshareAttachmentProvider
  ) {
    inboxAttachmentRegistry.add(inboxLinshareAttachmentProvider);
  }
})(angular);
