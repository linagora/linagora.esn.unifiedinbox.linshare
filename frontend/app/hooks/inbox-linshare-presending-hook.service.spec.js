'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The inboxLinsharePresendingHook service', function() {
  var $q, $rootScope;
  var esnLinshareApiClient, emailSendingService, inboxLinsharePresendingHook;
  var linshareAttachment, jmapAttachment;
  var INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES;

  beforeEach(module('linagora.esn.unifiedinbox.linshare'));

  beforeEach(inject(function(
    _$q_,
    _$rootScope_,
    _emailSendingService_,
    _esnLinshareApiClient_,
    _inboxLinsharePresendingHook_,
    _INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES_
  ) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    inboxLinsharePresendingHook = _inboxLinsharePresendingHook_;
    esnLinshareApiClient = _esnLinshareApiClient_;
    emailSendingService = _emailSendingService_;
    INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES = _INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES_;

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

  it('should append notify message if the email contains Linshare attachment', function() {
    var email = {
      attachments: [linshareAttachment, linshareAttachment],
      htmlBody: '<p>email content</p>',
      textBody: 'email content'
    };

    emailSendingService.getAllRecipientsExceptSender = function() {
      return [{
        email: 'user1@open-paas.org'
      }];
    };

    inboxLinsharePresendingHook(email);
    $rootScope.$digest();

    expect(email.htmlBody).to.contain(INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES.plural);
    expect(email.textBody).to.contain(INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES.plural);
  });

  it('should append notify message even email does not have body', function() {
    var email = {
      attachments: [linshareAttachment]
    };

    emailSendingService.getAllRecipientsExceptSender = function() {
      return [{
        email: 'user1@open-paas.org'
      }];
    };

    inboxLinsharePresendingHook(email);
    $rootScope.$digest();

    expect(email.htmlBody).to.equal('<br />' +
      '<p style="font-family: Roboto; font-size: 12px; color: rgba(0,0,0,0.65); text-align: center">' +
        '<i>' + INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES.singular + '</i>' +
      '</p>');
    expect(email.textBody).to.equal('\n\n-----------------------------------\n' +
      INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES.singular);
  });

  it('should not append notify message if the email does not contain Linshare attachment', function() {
    var email = {
      attachments: [jmapAttachment],
      htmlBody: '<p>email content</p>',
      textBody: 'email content'
    };

    emailSendingService.getAllRecipientsExceptSender = function() {
      return [{
        email: 'user1@open-paas.org'
      }];
    };

    inboxLinsharePresendingHook(email);
    $rootScope.$digest();

    expect(email.htmlBody).not.to.contain(INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES.plural);
    expect(email.textBody).not.to.contain(INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES.plural);
    expect(email.htmlBody).not.to.contain(INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES.singular);
    expect(email.textBody).not.to.contain(INBOX_LINSHARE_EMAIL_ADDITIONAL_MESSAGE_TEMPLATES.singular);
  });
});
