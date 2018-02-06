(function(angular) {
  'use strict';

  angular.module('linagora.esn.unifiedinbox.linshare')
    .controller('inboxLinshareFilesInserterController', inboxLinshareFilesInserterController);

  function inboxLinshareFilesInserterController(onInsert) {
    var self = this;

    self.insert = insert;

    function insert() {
      onInsert(self.selectedNodes);
    }
  }
})(angular);
