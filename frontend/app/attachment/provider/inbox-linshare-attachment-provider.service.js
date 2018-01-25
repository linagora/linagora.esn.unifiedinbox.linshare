(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox.linshare')
    .factory('inboxLinshareAttachmentProvider', inboxLinshareAttachmentProvider);

  function inboxLinshareAttachmentProvider(
    $q,
    DEFAULT_FILE_TYPE,
    INBOX_LINSHARE_ATTACHMENT_TYPE
  ) {
    return {
      name: 'Linshare',
      type: INBOX_LINSHARE_ATTACHMENT_TYPE,
      icon: 'mdi mdi-cloud',
      upload: upload,
      fileToAttachment: fileToAttachment
    };

    function upload(attachment) {
      // TODO implement the Linshare uploader
      return {
        cancel: angular.noop,
        promise: $q.resolve()
      };
    }

    function fileToAttachment(file) {
      return {
        attachmentType: INBOX_LINSHARE_ATTACHMENT_TYPE,
        name: file.name,
        size: file.size,
        type: file.type || DEFAULT_FILE_TYPE,
        getFile: function() {
          return file;
        }
      };
    }
  }
})(angular);
