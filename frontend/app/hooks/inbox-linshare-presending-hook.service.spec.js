'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The inboxLinsharePresendingHook service', function() {
  var $q;
  var esnLinshareApiClient, emailSendingService, inboxLinsharePresendingHook;
  var linshareAttachment, jmapAttachment;

  beforeEach(module('linagora.esn.unifiedinbox.linshare'));

  beforeEach(inject(function(_$q_, _emailSendingService_, _esnLinshareApiClient_, _inboxLinsharePresendingHook_) {
    inboxLinsharePresendingHook = _inboxLinsharePresendingHook_;
    esnLinshareApiClient = _esnLinshareApiClient_;
    emailSendingService = _emailSendingService_;
    $q = _$q_;

    linshareAttachment = {
      uuid: '123',
      name: 'linshareAttachment',
      attachmentType: 'linshare'
    };
    jmapAttachment = {
      blobId: '456',
      name: 'jmapAttachment',
      attachmentType: 'jmap'
    };

    esnLinshareApiClient.shareDocuments = sinon.spy(function() {
      return $q.when();
    });
  }));

  it('should call the Linshare API with only linshare attachments', function() {
    var email = {
      attachments: [linshareAttachment, jmapAttachment]
    };

    emailSendingService.getAllRecipientsExceptSender = function() {
      return [{
        email: 'user1@open-paas.org'
      }];
    };

    inboxLinsharePresendingHook(email);
    expect(esnLinshareApiClient.shareDocuments).to.have.been.calledWith({
      documents: [linshareAttachment.uuid],
      recipients: [{ mail: 'user1@open-paas.org' }]
    });
  });

  it('should not call the Linshare API if there is no Linshare attachment', function() {
    var email = {
      attachments: [jmapAttachment]
    };

    emailSendingService.getAllRecipientsExceptSender = function() {
      return [{
        email: 'user1@open-paas.org'
      }];
    };

    inboxLinsharePresendingHook(email);
    expect(esnLinshareApiClient.shareDocuments).not.to.have.been.called;
  });

  it('should not call the Linshare API if there is no recipient', function() {
    var email = {
      attachments: [linshareAttachment, jmapAttachment]
    };

    emailSendingService.getAllRecipientsExceptSender = function() {
      return [];
    };

    inboxLinsharePresendingHook(email);
    expect(esnLinshareApiClient.shareDocuments).not.to.have.been.called;
  });

  it('should not call the Linshare API with attachments that do not have uuid', function() {
    var linshareAttachmentWithoutUuid = {
      name: 'attachmentWithoutUuid',
      attachmentType: 'linshare'
    };
    var email = {
      attachments: [linshareAttachmentWithoutUuid, linshareAttachment, jmapAttachment]
    };

    emailSendingService.getAllRecipientsExceptSender = function() {
      return [{
        email: 'user1@open-paas.org'
      }];
    };

    inboxLinsharePresendingHook(email);
    expect(esnLinshareApiClient.shareDocuments).to.have.been.calledWith({
      documents: [linshareAttachment.uuid],
      recipients: [{ mail: 'user1@open-paas.org' }]
    });
  });

  it('should remove all the attachment with type of linshare from input email ', function() {
    var email = {
      attachments: [linshareAttachment, jmapAttachment]
    };

    emailSendingService.getAllRecipientsExceptSender = function() {
      return [{
        email: 'user1@open-paas.org'
      }];
    };

    inboxLinsharePresendingHook(email);
    expect(email.attachments).to.deep.equal([jmapAttachment]);
  });
});
