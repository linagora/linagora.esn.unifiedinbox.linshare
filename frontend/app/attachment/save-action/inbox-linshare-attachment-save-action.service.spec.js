'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The inboxLinshareAttachmentSaveActionService service', function() {
  var $rootScope, $q;
  var esnLinshareApiClient, inboxLinshareApiClient, inboxLinshareAttachmentSaveActionService;

  beforeEach(module('linagora.esn.unifiedinbox.linshare'));

  beforeEach(inject(function(
    _$rootScope_,
    _$q_,
    _esnLinshareApiClient_,
    _inboxLinshareApiClient_,
    _inboxLinshareAttachmentSaveActionService_
  ) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    esnLinshareApiClient = _esnLinshareApiClient_;
    inboxLinshareApiClient = _inboxLinshareApiClient_;
    inboxLinshareAttachmentSaveActionService = _inboxLinshareAttachmentSaveActionService_;

    esnLinshareApiClient.ASYNC_TASK_STATUS = {
      PENDING: 'PENDING',
      FAILED: 'FAILED',
      SUCCESS: 'SUCCESS'
    };
  }));

  describe('The getAttachmentMapping fn', function() {
    it('should resolve the only one mapping filter by blobId', function(done) {
      var attachmentMappings = [{ blobId: 1 }];
      var attachment = { blobId: 1 };

      inboxLinshareApiClient.getAttachments = sinon.stub().returns($q.when(attachmentMappings));

      inboxLinshareAttachmentSaveActionService.getAttachmentMapping(attachment).then(function(mapping) {
        expect(mapping).to.deep.equal(attachmentMappings[0]);
        done();
      });

      $rootScope.$digest();
    });

    it('should resolve nothing when there is no mapping matched the blobId', function(done) {
      var attachmentMappings = [];
      var attachment = { blobId: 1 };

      inboxLinshareApiClient.getAttachments = sinon.stub().returns($q.when(attachmentMappings));

      inboxLinshareAttachmentSaveActionService.getAttachmentMapping(attachment).then(function(mapping) {
        expect(mapping).to.not.exist;
        done();
      });

      $rootScope.$digest();
    });
  });

  describe('The saveAttachmentToLinshare fn', function() {
    it('should create Linshare document by download URL of the attachment', function() {
      var downloadUrl = 'http://abc.com/download.pdf';
      var attachment = {
        name: 'my file.pdf',
        getSignedDownloadUrl: sinon.stub().returns($q.when(downloadUrl))
      };

      esnLinshareApiClient.createDocumentFromUrl = sinon.stub().returns($q.when({
        status: esnLinshareApiClient.ASYNC_TASK_STATUS.FAILED
      }));

      inboxLinshareAttachmentSaveActionService.saveAttachmentToLinshare(attachment);

      $rootScope.$digest();

      expect(esnLinshareApiClient.createDocumentFromUrl).to.have.been.calledWith({
        url: downloadUrl,
        fileName: attachment.name
      }, { async: true });
    });

    it('should reject when the async task is marked as failed', function(done) {
      var downloadUrl = 'http://abc.com/download.pdf';
      var attachment = {
        name: 'my file.pdf',
        getSignedDownloadUrl: sinon.stub().returns($q.when(downloadUrl))
      };

      esnLinshareApiClient.createDocumentFromUrl = sinon.stub().returns($q.when({
        status: esnLinshareApiClient.ASYNC_TASK_STATUS.FAILED
      }));

      inboxLinshareAttachmentSaveActionService.saveAttachmentToLinshare(attachment).catch(function(err) {
        expect(err.message).to.equal('Cannot save attachment to Linshare');
        done();
      });

      $rootScope.$digest();
    });

    it('should create attachment mapping to track the async task', function() {
      var downloadUrl = 'http://abc.com/download.pdf';
      var attachment = {
        name: 'my file.pdf',
        getSignedDownloadUrl: sinon.stub().returns($q.when(downloadUrl))
      };
      var asyncTask = {
        status: esnLinshareApiClient.ASYNC_TASK_STATUS.PENDING,
        async: { uuid: '123' }
      };

      esnLinshareApiClient.createDocumentFromUrl = sinon.stub().returns($q.when(asyncTask));
      inboxLinshareApiClient.createAttachment = sinon.spy();

      inboxLinshareAttachmentSaveActionService.saveAttachmentToLinshare(attachment);
      $rootScope.$digest();

      expect(inboxLinshareApiClient.createAttachment).to.have.been.calledWith({
        blobId: attachment.blobId,
        asyncTaskId: asyncTask.async.uuid
      });
    });

    it('should create attachment mapping with documentId when async task is marked as SUCCESS right after creation', function() {
      var downloadUrl = 'http://abc.com/download.pdf';
      var attachment = {
        name: 'my file.pdf',
        getSignedDownloadUrl: sinon.stub().returns($q.when(downloadUrl))
      };
      var asyncTask = {
        uuid: '468',
        status: esnLinshareApiClient.ASYNC_TASK_STATUS.SUCCESS,
        async: { uuid: '123' }
      };

      esnLinshareApiClient.createDocumentFromUrl = sinon.stub().returns($q.when(asyncTask));
      inboxLinshareApiClient.createAttachment = sinon.spy();

      inboxLinshareAttachmentSaveActionService.saveAttachmentToLinshare(attachment);
      $rootScope.$digest();

      expect(inboxLinshareApiClient.createAttachment).to.have.been.calledWith({
        documentId: asyncTask.uuid,
        blobId: attachment.blobId,
        asyncTaskId: asyncTask.async.uuid
      });
    });
  });

  describe('The watch fn', function() {
    var $interval;
    var INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL;

    beforeEach(inject(function(_$interval_, _INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL_) {
      $interval = _$interval_;
      INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL = _INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL_;
    }));

    it('should reject when async task is marked as FAILED', function(done) {
      var asyncTask = {
        status: esnLinshareApiClient.ASYNC_TASK_STATUS.FAILED
      };
      var attachmentMapping = {
        asyncTaskId: '123'
      };
      var scope = $rootScope.$new();

      esnLinshareApiClient.getDocumentAsyncTaskById = sinon.stub().returns($q.when(asyncTask));

      inboxLinshareAttachmentSaveActionService.watch(attachmentMapping, scope).catch(function(err) {
        expect(err.message).to.equal('Failed to save attachment to Linshare');
        done();
      });

      $interval.flush(INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL + 1);
    });

    it('should update attachment mapping when async task is marked as SUCCESS', function() {
      var asyncTask = {
        uuid: '456',
        status: esnLinshareApiClient.ASYNC_TASK_STATUS.SUCCESS
      };
      var attachmentMapping = {
        id: '789',
        asyncTaskId: '123'
      };
      var scope = $rootScope.$new();

      esnLinshareApiClient.getDocumentAsyncTaskById = sinon.stub().returns($q.when(asyncTask));
      inboxLinshareApiClient.updateAttachment = sinon.stub().returns($q.when());

      inboxLinshareAttachmentSaveActionService.watch(attachmentMapping, scope);
      $interval.flush(INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL + 1);

      expect(inboxLinshareApiClient.updateAttachment).to.have.been.calledWith(attachmentMapping.id, {
        documentId: asyncTask.uuid
      });
    });

    it('should skip interval when last step is not done', function() {
      var attachmentMapping = {
        id: '789',
        asyncTaskId: '123'
      };
      var scope = $rootScope.$new();

      esnLinshareApiClient.getDocumentAsyncTaskById = sinon.stub().returns($q.defer().promise);

      inboxLinshareAttachmentSaveActionService.watch(attachmentMapping, scope);
      $interval.flush(INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL + 1);
      $interval.flush(INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL + 1);

      expect(esnLinshareApiClient.getDocumentAsyncTaskById).to.have.been.calledOnce;
    });

    it('should try again when last step is done', function() {
      var attachmentMapping = {
        id: '789',
        asyncTaskId: '123'
      };
      var scope = $rootScope.$new();

      esnLinshareApiClient.getDocumentAsyncTaskById = sinon.stub().returns($q.when({}));

      inboxLinshareAttachmentSaveActionService.watch(attachmentMapping, scope);
      $interval.flush(INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL + 1);
      $interval.flush(INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL + 1);

      expect(esnLinshareApiClient.getDocumentAsyncTaskById).to.have.been.calledTwice;
    });

    it('should stop the poller when scope is destroyed', function() {
      var attachmentMapping = {
        id: '789',
        asyncTaskId: '123'
      };
      var scope = $rootScope.$new();

      esnLinshareApiClient.getDocumentAsyncTaskById = sinon.stub().returns($q.when({}));

      inboxLinshareAttachmentSaveActionService.watch(attachmentMapping, scope);
      $interval.flush(INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL + 1);

      scope.$destroy();

      $interval.flush(INBOX_LINSHARE_ATTACHMENT_POLLING_INTERVAL + 1);

      expect(esnLinshareApiClient.getDocumentAsyncTaskById).to.have.been.calledOnce;
    });
  });
});
