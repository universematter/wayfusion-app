/*
 * WayFusion (www.wayfusion.com)
 *
 * Copyright (c) 2017, Sergio Khlopenkov. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Component} from '@angular/core';
import {DynamicComponent} from './dynamic-component'
import {ActionSheet, ActionSheetController, ToastController} from 'ionic-angular';
import {Clipboard} from '@ionic-native/clipboard';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'twitter-card',
  templateUrl: 'twitter-card.component.html'
})
export class TwitterCardComponent extends DynamicComponent {
  actionSheet: ActionSheet;

  constructor(public actionSheetCtrl: ActionSheetController,
              public clipboard: Clipboard,
              public toastCtrl: ToastController,
              public translateService: TranslateService) {
    super(clipboard, toastCtrl, translateService);

  }

  ngOnInit() {
    // console.log('show detail', this.showDetail);
  }

  onShare(tweet: any) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Share Tweet',
      buttons: [
        {
          text: 'Copy Link',
          handler: this.clipboardCopy('https://twitter.com/statuses/' + tweet.id_str)
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

  openWebLink(type?: string) {
    let link;
    console.log(this.context);
    switch (type) {
      case 'weblink':
        link = `https://twitter.com/${this.context.user.screen_name}/status/${this.context.id_str}`;
        break;
      case 'contentlink':
        link = this.context.entities.urls[0] ? `${this.context.entities.urls[0]}` : null;
        break;
    }

    !!link && window.open(link, '_blank');
  }

}
