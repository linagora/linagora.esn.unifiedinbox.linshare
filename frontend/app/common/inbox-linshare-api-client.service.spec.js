'use strict';

describe('The inboxLinshareApiClient service', function() {
  var $httpBackend;
  var inboxLinshareApiClient;

  beforeEach(module('linagora.esn.unifiedinbox.linshare'));

  beforeEach(inject(function(_$httpBackend_, _inboxLinshareApiClient_) {
    $httpBackend = _$httpBackend_;
    inboxLinshareApiClient = _inboxLinshareApiClient_;
  }));

  describe('The createAttachment fn', function() {
    it('should POST to right endpoint to create new attachment', function() {
      var attachment = { blobId: '12345' };

      $httpBackend.expectPOST('/linagora.esn.unifiedinbox.linshare/api/attachments', attachment).respond(201);

      inboxLinshareApiClient.createAttachment(attachment);
      $httpBackend.flush();
    });
  });

  describe('The getAttachments fn', function() {
    it('should GET to right endpoint to get attachments', function() {
      var options = {
        limit: 10,
        offset: 0
      };

      $httpBackend.expectGET('/linagora.esn.unifiedinbox.linshare/api/attachments?limit=' + options.limit + '&offset=' + options.offset).respond(200, []);

      inboxLinshareApiClient.getAttachments(options);

      $httpBackend.flush();
    });
  });

  describe('The updateAttachment fn', function() {
    it('should POST to right endpoint to update attachments', function() {
      var updateData = {
        documentId: '12345'
      };
      var attachmentId = '111';

      $httpBackend.expectPOST('/linagora.esn.unifiedinbox.linshare/api/attachments/' + attachmentId, updateData).respond(200, []);

      inboxLinshareApiClient.updateAttachment(attachmentId, updateData);

      $httpBackend.flush();
    });
  });

});
