(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox.linshare')
    .controller('inboxLinshareComposerSelectAttachmentController', inboxLinshareComposerSelectAttachmentController);

  function inboxLinshareComposerSelectAttachmentController(
    $modal,
    $scope,
    _,
    inboxLinshareHelper,
    INBOX_LINSHARE_ATTACHMENT_TYPE
  ) {
    var self = this;

    self.$onInit = $onInit;

    function $onInit() {
      self.email.attachments = self.email.attachments || [];
      self.openLinshareFilesBrowser = openLinshareFilesBrowser;
      self.linshareAttachmentsStatus = {};

      $scope.$watch(function() {
        return _.filter(self.email.attachments, { attachmentType: INBOX_LINSHARE_ATTACHMENT_TYPE }).length;
      }, function(newValue) {
        self.linshareAttachmentsStatus.number = newValue;
      });
      $scope.$watch(function() {
        return _.some(self.email.attachments, { status: 'uploading', attachmentType: INBOX_LINSHARE_ATTACHMENT_TYPE });
      }, function(newValue) {
        self.linshareAttachmentsStatus.uploading = newValue;
      });
      $scope.$watch(function() {
        return _.some(self.email.attachments, { status: 'error', attachmentType: INBOX_LINSHARE_ATTACHMENT_TYPE });
      }, function(newValue) {
        self.linshareAttachmentsStatus.error = newValue;
      });
    }

    function openLinshareFilesBrowser() {
      $modal({
        templateUrl: '/linagora.esn.unifiedinbox.linshare/app/files-inserter/inbox-linshare-files-inserter.html',
        placement: 'center',
        controllerAs: '$ctrl',
        controller: 'inboxLinshareFilesInserterController',
        locals: {
          onInsert: insertLinshareDocuments
        }
      });
    }

    function insertLinshareDocuments(documents) {
      documents.forEach(function(document) {
        var attachment = inboxLinshareHelper.documentToAttachment(document);

        self.email.attachments.push(attachment);
      });
    }
  }
})(angular);
