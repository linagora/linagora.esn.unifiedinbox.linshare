(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox.linshare')
    .factory('inboxLinshareAttachmentProvider', inboxLinshareAttachmentProvider);

  function inboxLinshareAttachmentProvider(
    $q,
    esnLinshareApiClient,
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
      var deferred = $q.defer();
      var file = attachment.getFile();

      var uploadPromise = esnLinshareApiClient.createDocument({
        file: file,
        fileSize: file.size
      }, {
        onUploadProgress: function(progressEvent) {
          deferred.notify(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      });

      uploadPromise.then(function(resp) {
        attachment.uuid = resp.uuid;
        deferred.resolve();
      }, deferred.reject);

      return {
        cancel: uploadPromise.cancel,
        promise: deferred.promise
      };
    }

    function fileToAttachment(file) {
      return {
        attachmentType: INBOX_LINSHARE_ATTACHMENT_TYPE,
        name: file.name,
        size: file.size,
        type: file.type || DEFAULT_FILE_TYPE,
        isInline: false,
        getFile: function() {
          return file;
        }
      };
    }
  }
})(angular);
