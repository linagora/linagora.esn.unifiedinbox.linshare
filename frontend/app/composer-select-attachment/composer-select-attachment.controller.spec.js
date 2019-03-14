'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The inboxLinshareComposerSelectAttachmentController', function() {
  var $rootScope, $scope, $controller;
  var $modalMock, onInsertMock;

  beforeEach(function() {
    module('linagora.esn.unifiedinbox.linshare');

    module(function($provide) {
      $modalMock = function(options) {
        onInsertMock = options.locals.onInsert;
      };

      $provide.value('$modal', $modalMock);
    });

    inject(function(_$rootScope_, _$controller_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
    });
  });

  function initController(scope) {
    $scope = scope || $rootScope.$new();

    var controller = $controller('inboxLinshareComposerSelectAttachmentController', { $scope: $scope }, { email: {} });

    $scope.$digest();

    controller.$onInit();

    return controller;
  }

  describe('The #insertLinshareDocuments function', function() {
    it('should update LinShareAttachmentsUUIDs list', function() {
      var controller = initController();
      var attachments = [{
        attachmentType: 'linshare',
        uuid: 'attachment1'
      }, {
        attachmentType: 'linshare',
        uuid: 'attachment2'
      }];

      controller.openLinshareFilesBrowser();

      onInsertMock(attachments);

      expect(controller.email).to.shallowDeepEqual({
        headers: {
          LinShareAttachmentUUIDs: 'attachment1,attachment2'
        },
        attachments: attachments
      });
    });
  });
});
