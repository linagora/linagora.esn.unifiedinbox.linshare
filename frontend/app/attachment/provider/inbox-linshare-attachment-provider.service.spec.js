'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The inboxLinshareAttachmentProvider service', function() {
  var $rootScope, $q;
  var inboxLinshareAttachmentProvider;
  var INBOX_LINSHARE_ATTACHMENT_TYPE;

  beforeEach(module('linagora.esn.unifiedinbox.linshare'));

  beforeEach(inject(function(_$rootScope_, _$q_, _inboxLinshareAttachmentProvider_, _INBOX_LINSHARE_ATTACHMENT_TYPE_) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    inboxLinshareAttachmentProvider = _inboxLinshareAttachmentProvider_;
    INBOX_LINSHARE_ATTACHMENT_TYPE = _INBOX_LINSHARE_ATTACHMENT_TYPE_;
  }));

  describe('The upload fn', function() {
    var esnLinshareApiClient;

    beforeEach(inject(function(_esnLinshareApiClient_) {
      esnLinshareApiClient = _esnLinshareApiClient_;
    }));

    it('should call Linshare API to upload file', function() {
      var file = { name: 'Learn_JS_in_6_hours.pdf', size: 12345 };
      var attachment = {
        getFile: function() {
          return file;
        }
      };

      esnLinshareApiClient.createDocument = sinon.stub().returns($q.when({}));
      inboxLinshareAttachmentProvider.upload(attachment);
      $rootScope.$digest();

      expect(esnLinshareApiClient.createDocument).to.have.been.calledWith({
        file: file,
        fileSize: file.size
      }, sinon.match({
        onUploadProgress: sinon.match.func
      }));
    });

    it('should assign document UUID to the attachment object on success', function() {
      var file = { name: 'Learn_JS_in_6_hours.pdf', size: 12345 };
      var attachment = {
        getFile: function() {
          return file;
        }
      };
      var document = { uuid: '1212' };

      esnLinshareApiClient.createDocument = sinon.stub().returns($q.when(document));
      inboxLinshareAttachmentProvider.upload(attachment);
      $rootScope.$digest();

      expect(attachment.uuid).to.equal(document.uuid);
    });

    it('should return promise that resolve on success', function() {
      var file = { name: 'Learn_JS_in_6_hours.pdf', size: 12345 };
      var attachment = {
        getFile: function() {
          return file;
        }
      };
      var document = { uuid: '1212' };
      var successSpy = sinon.spy();

      esnLinshareApiClient.createDocument = sinon.stub().returns($q.when(document));

      var uploadTask = inboxLinshareAttachmentProvider.upload(attachment);

      uploadTask.promise.then(successSpy);
      $rootScope.$digest();

      expect(successSpy).to.have.been.calledWith();
    });

    it('should return promise that reject on failure', function() {
      var file = { name: 'Learn_JS_in_6_hours.pdf', size: 12345 };
      var attachment = {
        getFile: function() {
          return file;
        }
      };
      var catchSpy = sinon.spy();
      var error = new Error('an_error');

      esnLinshareApiClient.createDocument = sinon.stub().returns($q.reject(error));

      var uploadTask = inboxLinshareAttachmentProvider.upload(attachment);

      uploadTask.promise.catch(catchSpy);
      $rootScope.$digest();

      expect(catchSpy).to.have.been.calledWith(error);
    });

    it('should return promise to be notified the upload progress', function() {
      var file = { name: 'Learn_JS_in_6_hours.pdf', size: 12345 };
      var attachment = {
        getFile: function() {
          return file;
        }
      };
      var notifySpy = sinon.spy();
      var onUploadProgress;

      esnLinshareApiClient.createDocument = function(data, options) {
        onUploadProgress = options.onUploadProgress;

        return $q.defer().promise;
      };

      var uploadTask = inboxLinshareAttachmentProvider.upload(attachment);

      uploadTask.promise.then(null, null, notifySpy);

      onUploadProgress({ loaded: 7, total: 10 });
      $rootScope.$digest();
      expect(notifySpy).to.have.been.calledWith(70);

      onUploadProgress({ loaded: 8, total: 10 });
      $rootScope.$digest();
      expect(notifySpy).to.have.been.calledWith(80);
    });

    it('should return cancel function of the upload promise', function() {
      var file = { name: 'Learn_JS_in_6_hours.pdf', size: 12345 };
      var attachment = {
        getFile: function() {
          return file;
        }
      };
      var document = { uuid: '1212' };
      var promise = $q.when(document);

      promise.cancel = sinon.spy();
      esnLinshareApiClient.createDocument = sinon.stub().returns(promise);

      var uploadTask = inboxLinshareAttachmentProvider.upload(attachment);

      uploadTask.cancel();

      expect(promise.cancel).to.have.been.calledWith();
    });
  });

  describe('The fileToAttachment fn', function() {
    it('should return the Linshare virtual attachment', function() {
      var file = { name: 'Learn_JS_in_6_hours.pdf', size: 12345 };
      var attachment = inboxLinshareAttachmentProvider.fileToAttachment(file);

      expect(attachment).to.shallowDeepEqual({
        attachmentType: INBOX_LINSHARE_ATTACHMENT_TYPE,
        name: file.name,
        size: file.size
      });
      expect(attachment.getFile()).to.deep.equal(file);
    });
  });
});
