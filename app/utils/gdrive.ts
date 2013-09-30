import _ = require('underscore');
import $ = require('jquery');
import gapi = require('gapi');
import gclient = require('gclient');
import logger = require('utils/logger');

declare var google: any;

export = GoogleDrive;

module GoogleDrive {
  var clientId = '125417905454-r4b5nl32a5q34db5t7bc0hkugbd2j4ep.apps.googleusercontent.com';
  var scope = 'https://www.googleapis.com/auth/drive';
  var developerKey = 'AIzaSyB_RiKcUoPOfnAxYZF_PR8Iuzo-VkgbMhs';
  var appId = '125417905454';

  export function isAuthorized(): boolean {
    return ('auth' in gapi)
      && ('getToken' in gapi.auth)
      && !_.isNull(gapi.auth.getToken());
  }

  export function authorize(immediate: boolean = true): JQueryPromise<void> {
    var deferred = $.Deferred();
    gapi.auth.authorize({
      client_id: clientId, scope: [scope], immediate: immediate
    }, (authResult: GoogleApiOAuth2TokenObject) => {
      if (authResult && !authResult.error) {
        gapi.client.load('drive', 'v2', () => {
          logger.info('Google Drive Authorization Succes');
          deferred.resolve();
        });
      } else {
        logger.warn('ERROR: authorize')
        deferred.reject();
      }
    });
    return deferred.promise();
  }

  export interface PickResult {
    url: string;
    httpHeaders: {[key:string]:string;};
    mimeType: string;
  }
  export function pickFileURL(callback: (data: PickResult) => void): void {
    showPicker(callback);
  }

  var showPicker = (callback: (data: PickResult) => void) => {
    (<any>gapi).load('picker', {callback: () => {
      // var view = new google.picker.View(google.picker.ViewId.PDFS);
      // view.setMimeTypes('application/pdf');
      var picker = new google.picker.PickerBuilder()
        .enableFeature(google.picker.Feature.NAV_HIDDEN)
        .setOAuthToken(gapi.auth.getToken().access_token)
        .setDeveloperKey(developerKey)
        .setAppId(appId)
        .addView(google.picker.ViewId.FOLDERS)
        .addView(google.picker.ViewId.PDFS)
        .setCallback((data: any) => {
          if (data.action !== google.picker.Action.PICKED) { return; }
          var file = data.docs[0];
          var file_id = file.id;
          var request = (<any>gapi.client).drive.files.get({
            fileId: file_id
          });
          request.execute((resp: any) => {
            var downloadUrl = resp.downloadUrl;
            var httpHeaders = {
              'Authorization': 'Bearer ' + gapi.auth.getToken().access_token
            };
            logger.info('gdrive file download url: ' +
                        downloadUrl + '&access_token=' + gapi.auth.getToken().access_token);
            callback({url: downloadUrl, httpHeaders: httpHeaders, mimeType: file.mimeType});
          });
        })
        .build();
      picker.setVisible(true);
    }});
  };
}


