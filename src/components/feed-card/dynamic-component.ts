/*
 * WayFusion (www.wayfusion.com)
 *
 * Copyright (c) 2017, Sergio Khlopenkov. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {TranslateService} from '@ngx-translate/core';
import {ToastController} from 'ionic-angular';
import {Clipboard} from '@ionic-native/clipboard';

export abstract class DynamicComponent {
  context: any;
  showDetail: boolean;

  linkCopySuccessString: string;
  linkCopyFailureString: string;

  constructor(public clipboard: Clipboard,
              public toastCtrl: ToastController,
              public translateService: TranslateService) {
    this.translateService.get('LINK_COPY_SUCCESS').subscribe((value) => {
      this.linkCopySuccessString = value;
    });

    this.translateService.get('LINK_COPY_FAILURE').subscribe((value) => {
      this.linkCopyFailureString = value;
    });
  }

  presentToast(message: string, duration: number = 2000) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: duration
    });
    toast.present();
  }

  clipboardCopy = (str: string) => {
    return ($event: Event) => {
      this.clipboard.copy(str).then(
        () => this.presentToast(this.linkCopySuccessString),
        () => this.presentToast(this.linkCopyFailureString)
      );
    };
  }

}
