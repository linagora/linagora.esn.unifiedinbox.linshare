(function(angular) {
'use strict';

angular.module('linagora.esn.unifiedinbox.linshare')
  .controller('inboxLinshareAttachmentSaveActionController', inboxLinshareAttachmentSaveActionController);

function inboxLinshareAttachmentSaveActionController(
  $scope,
  asyncAction,
  esnConfig,
  inboxLinshareAttachmentSaveActionService,
  INBOX_LINSHARE_ATTACHMENT_MAPPING_STATUS
) {
  var self = this;

  self.$onInit = $onInit;
  self.onSaveBtnClick = onSaveBtnClick;

  function $onInit() {
    self.status = INBOX_LINSHARE_ATTACHMENT_MAPPING_STATUS.checking;

    inboxLinshareAttachmentSaveActionService.getAttachmentMapping(self.attachment)
      .then(checkMapping)
      .catch(function() {
        self.status = INBOX_LINSHARE_ATTACHMENT_MAPPING_STATUS.error;
      });
  }

  function onSaveBtnClick() {
    self.status = INBOX_LINSHARE_ATTACHMENT_MAPPING_STATUS.saving;

    asyncAction({
      progressing: 'Saving attachment to LinShare...',
      success: 'Saved attachment to LinShare',
      failure: 'Failed to save attachment to LinShare'
    }, function() {
      return inboxLinshareAttachmentSaveActionService.saveAttachmentToLinshare(self.attachment).then(checkMapping);
    })
    .catch(function() {
      self.status = INBOX_LINSHARE_ATTACHMENT_MAPPING_STATUS.error;
    });
  }

  function checkMapping(attachmentMapping) {
    if (!attachmentMapping) {
      self.status = INBOX_LINSHARE_ATTACHMENT_MAPPING_STATUS.not_saved;
    } else if (attachmentMapping.documentId) {
      self.status = INBOX_LINSHARE_ATTACHMENT_MAPPING_STATUS.saved;

      return _buildAttachmentUrl(attachmentMapping.documentId)
        .then(function(url) {
          self.attachment.url = url;
        });
    } else {
      self.status = INBOX_LINSHARE_ATTACHMENT_MAPPING_STATUS.saving;

      return inboxLinshareAttachmentSaveActionService.watch(attachmentMapping, $scope).then(function() {
        self.status = INBOX_LINSHARE_ATTACHMENT_MAPPING_STATUS.saved;
      });
    }
  }

  function _buildAttachmentUrl(attachmentId) {
    return esnConfig('linagora.esn.linshare.instanceURL')
      .then(function(linshareInstanceURL) {
        return linshareInstanceURL + '#/files/list?fileUuid=' + attachmentId;
      })
      .catch(function() {
        return;
      });
  }
}
})(angular);
