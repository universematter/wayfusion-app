/*
 * WayFusion (www.wayfusion.com)
 *
 * Copyright (c) 2017, Sergio Khlopenkov. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ViewChild } from '@angular/core';

import { MenuController, NavController, Slides } from 'ionic-angular';

import { Storage } from '@ionic/storage';

import { UserData } from '../../providers/user-data';
import { HAS_SEEN_TUTORIAL } from '../../providers/config';

import { TabsPage } from '../tabs/tabs';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html'
})

export class TutorialPage {
  showSkip = true;

	@ViewChild('slides') slides: Slides;

  constructor(
    public navCtrl: NavController,
    public menu: MenuController,
    public storage: Storage,
    public userData: UserData
  ) { }

  startApp() {
    this.userData.hasLoggedIn().then((value) => {
      let page = value ? TabsPage : LoginPage;
      this.navCtrl.push(page).then(() => {
        this.storage.set(HAS_SEEN_TUTORIAL, true);
      })
    });

  }

  onSlideChangeStart(slider: Slides) {
    this.showSkip = !slider.isEnd();
  }

	ionViewWillEnter() {
      this.slides.update();
      this.slides.resize();
	}

  ionViewDidEnter() {
    // the root left menu should be disabled on the tutorial page
    this.menu.enable(false);
  }

  ionViewDidLeave() {
    this.userData.updateMenu();
  }

}
