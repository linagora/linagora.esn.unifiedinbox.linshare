'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The inboxLinshareHelper service', function() {
  var $q;
  var inboxLinshareHelper;

  beforeEach(module('linagora.esn.unifiedinbox.linshare'));

  beforeEach(inject(function(_$q_, _inboxLinshareHelper_) {
    $q = _$q_;
    inboxLinshareHelper = _inboxLinshareHelper_;
  }));

  describe('The documentToAttachment function', function() {
    it('should convert Linshare document to legal Inbox attachment', function() {
      var linshareDocument = {
        name: 'linshareDocument',
        size: 1000,
        uuid: '123',
        type: 'image/png'
      };
      var attachment = inboxLinshareHelper.documentToAttachment(linshareDocument);

      expect(attachment).to.deep.equal({
        attachmentType: 'linshare',
        name: 'linshareDocument',
        size: 1000,
        type: 'image/png',
        upload: {
          promise: $q.when(),
          cancel: angular.noop
        },
        uuid: '123',
        status: 'uploaded'
      });
    });
  });
});
