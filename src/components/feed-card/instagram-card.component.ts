/*
 * WayFusion (www.wayfusion.com)
 *
 * Copyright (c) 2017, Sergio Khlopenkov. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Component} from '@angular/core';
import {DynamicComponent} from './dynamic-component';
import {ActionSheet, ActionSheetController, ToastController} from 'ionic-angular';
import {Clipboard} from '@ionic-native/clipboard';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'instagram-card',
  templateUrl: 'instagram-card.component.html'
})
export class InstagramCardComponent extends DynamicComponent {

  actionSheet: ActionSheet;

  constructor(public actionSheetCtrl: ActionSheetController,
              public clipboard: Clipboard,
              public toastCtrl: ToastController,
              public translateService: TranslateService) {
    super(clipboard, toastCtrl, translateService);

  }

  onShare(medium: any) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Share photo link',
      buttons: [
        {
          text: 'Copy Link',
          handler: this.clipboardCopy(medium.webLink)
        },
        {
          text: 'Share via ...'
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });

    actionSheet.present();
  }

  openWebLink() {
    window.open(this.context.webLink, '_blank');
  }

}
