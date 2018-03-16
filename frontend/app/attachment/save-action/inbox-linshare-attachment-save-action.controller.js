(function(angular) {
'use strict';

angular.module('linagora.esn.unifiedinbox.linshare')
  .controller('inboxLinshareAttachmentSaveActionController', inboxLinshareAttachmentSaveActionController);

function inboxLinshareAttachmentSaveActionController(
  $scope,
  asyncAction,
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
      progressing: 'Saving attachment to Linshare...',
      success: 'Saved attachment to Linshare',
      failure: 'Failed to save attachment to Linshare'
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
    } else {
      self.status = INBOX_LINSHARE_ATTACHMENT_MAPPING_STATUS.saving;

      return inboxLinshareAttachmentSaveActionService.watch(attachmentMapping, $scope).then(function() {
        self.status = INBOX_LINSHARE_ATTACHMENT_MAPPING_STATUS.saved;
      });
    }
  }
}
})(angular);
