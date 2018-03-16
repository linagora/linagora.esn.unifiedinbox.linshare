'use strict';

/* global _: false */

angular.module('esn.file', [])
  .constant('DEFAULT_FILE_TYPE', 'text')
  .factory('fileUploadService', function() {
    return {};
  });
angular.module('linagora.esn.unifiedinbox', [])
  .factory('emailSendingService', function() {
    return {};
  });
angular.module('linagora.esn.linshare', [])
  .factory('esnLinshareApiClient', function() {
    return {};
  })
  .factory('linshareFileUpload', function() {
    return {};
  });
angular.module('esn.core', []);
angular.module('esn.lodash-wrapper', [])
  .constant('_', _);
angular.module('esn.i18n', [])
  .factory('esnI18nService', function() {
    return {
      translate: function(input) {
        return {
          toString: function() { return input; }
        };
      }
    };
  });
