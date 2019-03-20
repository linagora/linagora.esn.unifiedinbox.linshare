'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The inboxLinsharePrecomposingHook service', function() {
  var $q, $rootScope;
  var linshareApiClient, inboxLinsharePrecomposingHook;
  var INBOX_LINSHARE_ATTACHMENT_TYPE;

  beforeEach(module('linagora.esn.unifiedinbox.linshare'));

  beforeEach(inject(function(
    _$q_,
    _$rootScope_,
    _emailSendingService_,
    _linshareApiClient_,
    _inboxLinsharePrecomposingHook_,
    _INBOX_LINSHARE_ATTACHMENT_TYPE_
  ) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    inboxLinsharePrecomposingHook = _inboxLinsharePrecomposingHook_;
    linshareApiClient = _linshareApiClient_;
    INBOX_LINSHARE_ATTACHMENT_TYPE = _INBOX_LINSHARE_ATTACHMENT_TYPE_;
  }));

  it('should do nothing if there is no email headers', function() {
    var email = {};

    inboxLinsharePrecomposingHook(email);

    $rootScope.$digest();

    expect(email).to.deep.equal({});
  });

  it('should do nothing if there is no LinShareAttachmentUUIDs in the email headers', function() {
    var email = {
      headers: {}
    };

    inboxLinsharePrecomposingHook(email);

    $rootScope.$digest();

    expect(email).to.deep.equal({
      headers: {}
    });
  });

  it('should do nothing if there is an empty LinShareAttachmentUUIDs list in the email headers', function() {
    var email = {
      headers: {
        LinShareAttachmentUUIDs: ''
      }
    };

    inboxLinsharePrecomposingHook(email);

    $rootScope.$digest();

    expect(email).to.deep.equal({
      headers: {
        LinShareAttachmentUUIDs: ''
      }
    });
  });

  describe('There is LinShare attachment uuids in the email headers', function() {
    it('should set the status of LinShare attachment in the email body to loading when loading the document', function() {
      var email = {
        headers: {
          LinShareAttachmentUUIDs: 'uuid1'
        },
        attachments: []
      };

      linshareApiClient.getDocument = function() {
        return $q.when();
      };

      inboxLinsharePrecomposingHook(email);

      expect(email.attachments).to.deep.equal([{
        attachmentType: INBOX_LINSHARE_ATTACHMENT_TYPE,
        uuid: 'uuid1',
        status: 'loading'
      }]);
    });

    it('should set the status of LinShare attachment in the email body to load-error if failed to load the document', function() {
      var email = {
        headers: {
          LinShareAttachmentUUIDs: 'uuid1'
        },
        attachments: []
      };

      linshareApiClient.getDocument = sinon.stub().returns($q.reject());

      inboxLinsharePrecomposingHook(email);

      $rootScope.$digest();

      expect(linshareApiClient.getDocument).to.have.been.calledWith('uuid1');
      expect(email.attachments).to.deep.equal([{
        attachmentType: INBOX_LINSHARE_ATTACHMENT_TYPE,
        uuid: 'uuid1',
        status: 'load-error'
      }]);
    });

    it('should update the LinShare attachment information in the email body if success to load the document', function() {
      var email = {
        headers: {
          LinShareAttachmentUUIDs: 'uuid1,uuid2'
        },
        attachments: []
      };

      linshareApiClient.getDocument = sinon.spy(function(uuid) {
        return $q.when({
          uuid: uuid,
          name: uuid
        });
      });

      inboxLinsharePrecomposingHook(email);

      $rootScope.$digest();

      expect(linshareApiClient.getDocument).to.have.been.calledTwice;
      expect(linshareApiClient.getDocument.firstCall.calledWith('uuid1')).to.be.true;
      expect(linshareApiClient.getDocument.secondCall.calledWith('uuid2')).to.be.true;
      expect(email.attachments).to.shallowDeepEqual([{
        attachmentType: INBOX_LINSHARE_ATTACHMENT_TYPE,
        uuid: 'uuid1',
        name: 'uuid1'
      }, {
        attachmentType: INBOX_LINSHARE_ATTACHMENT_TYPE,
        uuid: 'uuid2',
        name: 'uuid2'
      }]);
    });
  });
});
