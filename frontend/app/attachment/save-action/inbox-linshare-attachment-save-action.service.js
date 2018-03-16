(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox.linshare')
    .factory('inboxLinshareAttachmentSaveActionService', inboxLinshareAttachmentSaveActionService);

  function inboxLinshareAttachmentSaveActionService(
    $q,
    $log,
    $interval,
    inBackground,
    esnLinshareApiClient,
    inboxLinshareApiClient,
    INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL
  ) {
    return {
      getAttachmentMapping: getAttachmentMapping,
      saveAttachmentToLinshare: saveAttachmentToLinshare,
      watch: watch
    };

    function getAttachmentMapping(attachment) {
      return inboxLinshareApiClient.getAttachments({ blobId: attachment.blobId, limit: 1 })
        .then(function(attachmentMappings) {
          if (Array.isArray(attachmentMappings) && attachmentMappings.length === 1) {
            return attachmentMappings[0];
          }
        });
    }

    function saveAttachmentToLinshare(attachment) {
      var promise = attachment.getSignedDownloadUrl()
        .then(function(url) {
          return esnLinshareApiClient.createDocumentFromUrl({
            url: url,
            fileName: attachment.name
          }, { async: true });
        })
        .then(function(asyncTask) {
          if (asyncTask.status === esnLinshareApiClient.ASYNC_TASK_STATUS.FAILED) {
            return $q.reject(new Error('Cannot save attachment to Linshare'));
          }

          var attachmentMapping = {
            blobId: attachment.blobId,
            asyncTaskId: asyncTask.async.uuid
          };

          if (asyncTask.status === esnLinshareApiClient.ASYNC_TASK_STATUS.SUCCESS) {
            attachmentMapping.documentId = asyncTask.uuid;
          }

          return inboxLinshareApiClient.createAttachment(attachmentMapping);
        });

      return inBackground(promise);
    }

    function watch(attachmentMapping, scope) {
      var deferred = $q.defer();
      var inProgress = false;
      var poller = $interval(check, INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL);

      scope.$on('$destroy', function() {
        $interval.cancel(poller);
      });

      return deferred.promise;

      function check() {
        if (inProgress) {
          return $log.debug('Polling is already in progress, skip this turn');
        }

        inProgress = true;

        esnLinshareApiClient.getDocumentAsyncTaskById(attachmentMapping.asyncTaskId)
          .then(function(asyncTask) {
            if (asyncTask.status === esnLinshareApiClient.ASYNC_TASK_STATUS.SUCCESS) {
              return inboxLinshareApiClient.updateAttachment(attachmentMapping.id, {
                  documentId: asyncTask.uuid
                })
                .then(function() {
                  done();
                });
            }

            if (asyncTask.status === esnLinshareApiClient.ASYNC_TASK_STATUS.FAILED) {
              done(new Error('Failed to save attachment to Linshare'));
            }
          })
          .catch(done)
          .finally(function() {
            inProgress = false;
          });
      }

      function done(err) {
        $interval.cancel(poller);

        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve();
        }
      }
    }
  }
})(angular);
