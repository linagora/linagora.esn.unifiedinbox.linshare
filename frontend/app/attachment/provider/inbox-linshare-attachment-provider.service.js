(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox.linshare')
    .factory('inboxLinshareAttachmentProvider', inboxLinshareAttachmentProvider);

  function inboxLinshareAttachmentProvider(
    $q,
    fileUploadService,
    linshareFileUpload,
    DEFAULT_FILE_TYPE,
    INBOX_LINSHARE_ATTACHMENT_TYPE
  ) {
    return {
      name: 'Linshare',
      type: INBOX_LINSHARE_ATTACHMENT_TYPE,
      icon: 'linshare-icon linshare-desktop-icon',
      upload: upload,
      fileToAttachment: fileToAttachment
    };

    function upload(attachment) {
      var deferred = $q.defer();
      var uploader = fileUploadService.get(linshareFileUpload);
      var uploadTask = uploader.addFile(attachment.getFile());

      uploadTask.defer.promise.then(function(task) {
        attachment.uuid = task.response.uuid;
        deferred.resolve();
      }, deferred.reject, function(uploadTask) {
        deferred.notify(uploadTask.progress);
      });

      uploader.start();

      return {
        cancel: uploadTask.cancel,
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
