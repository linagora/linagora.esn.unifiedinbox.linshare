(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox.linshare')
    .factory('inboxLinshareHelper', inboxLinshareHelper);

  function inboxLinshareHelper(
    $q,
    INBOX_LINSHARE_ATTACHMENT_TYPE,
    DEFAULT_FILE_TYPE
  ) {
    return {
      documentToAttachment: documentToAttachment
    };

    function documentToAttachment(document) {
      return {
        attachmentType: INBOX_LINSHARE_ATTACHMENT_TYPE,
        name: document.name,
        size: document.size,
        type: document.type || DEFAULT_FILE_TYPE,
        upload: {
          promise: $q.when(),
          cancel: angular.noop
        },
        uuid: document.uuid,
        status: 'uploaded'
      };
    }
  }
})(angular);
