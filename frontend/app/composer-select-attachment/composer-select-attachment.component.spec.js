'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The inboxLinshareComposerSelectAttachment component', function() {
  var $modal, $rootScope, $compile;

  beforeEach(function() {
    $modal = sinon.spy();

    module('jadeTemplates');
    module('linagora.esn.unifiedinbox.linshare');
    module(function($provide) {
      $provide.value('$modal', $modal);
      $provide.value('maxPlusFilter', function(value) { return value; });
    });

    inject(function(_$compile_, _$rootScope_) {
      $rootScope = _$rootScope_;
      $compile = _$compile_;
    });
  });

  function initComponent(template, scope) {
    scope = scope || $rootScope.$new();

    var element = $compile(template)(scope);

    scope.$digest();

    return element;
  }

  it('should open Linshare files browser when user click on Linshare button', function() {
    var scope = $rootScope.$new();
    var email = {
      attachments: [{
        attachmentType: 'linshare',
        name: 'attachment1.jpg',
        size: 416331,
        type: 'image/jpeg'
      }]
    };

    scope.email = email;

    var element = initComponent('<inbox-linshare-composer-select-attachment email="email" />', scope);

    element.find('button')[0].click();
    expect($modal).to.have.been.called;
  });

  it('should update number of linshare attachment and display it on Linshare button', function() {
    var scope = $rootScope.$new();
    var attachment1 = {
      attachmentType: 'linshare',
      name: 'attachment1.jpg',
      size: 416331,
      type: 'image/jpeg'
    };
    var attachment2 = {
      attachmentType: 'linshare',
      name: 'attachment2.jpg',
      size: 416331,
      type: 'image/jpeg'
    };

    scope.email = {
      attachments: [attachment1]
    };

    var element = initComponent('<inbox-linshare-composer-select-attachment email="email" />', scope);

    expect(element.find('.composer-badge').text()).to.equal('1');
    scope.email.attachments.push(attachment2);
    scope.$digest();

    expect(element.find('.composer-badge').text()).to.equal('2');
  });

  it('should not display number of Linshare attachment if there is no Linshare attachment', function() {
    var scope = $rootScope.$new();

    scope.email = {
      attachments: []
    };
    var element = initComponent('<inbox-linshare-composer-select-attachment email="email" />', scope);

    expect(element.find('.composer-badge').hasClass('ng-hide')).to.be.true;
  });

  it('should flash when an Linshare attachment is uploading', function() {
    var scope = $rootScope.$new();

    scope.email = {
      attachments: [
        {
          attachmentType: 'linshare',
          name: 'attachment.jpg',
          size: 416331,
          type: 'image/jpeg',
          status: 'uploading'
        }
      ]
    };
    var element = initComponent('<inbox-linshare-composer-select-attachment email="email" />', scope);

    expect(element.find('.linshare-uploading').length).to.equal(1);
    scope.email.attachments[0].status = 'uploaded';
    scope.$digest();
    expect(element.find('.linshare-uploading').length).to.equal(0);
  });

  it('should notify user when upload Linshare attachment unsuccessfully', function() {
    var scope = $rootScope.$new();

    scope.email = {
      attachments: [
        {
          attachmentType: 'linshare',
          name: 'attachment.jpg',
          size: 416331,
          type: 'image/jpeg',
          status: 'error'
        }
      ]
    };
    var element = initComponent('<inbox-linshare-composer-select-attachment email="email" />', scope);

    expect(element.find('.error').length).to.equal(1);
  });
});
