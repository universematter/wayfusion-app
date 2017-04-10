/*
 * WayFusion (www.wayfusion.com)
 *
 * Copyright (c) 2017, Sergio Khlopenkov. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

import { NavController, ToastController } from 'ionic-angular';

import { Storage } from '@ionic/storage';

import { UserData } from '../../providers/user-data';
import { HAS_SEEN_TUTORIAL } from '../../providers/config';

import { TabsPage } from '../tabs/tabs';
import { SignupPage } from '../signup/signup';
import { TutorialPage } from '../tutorial/tutorial';

import { TranslateService } from '@ngx-translate/core';

import { Observable } from "rxjs";

@Component({
  selector: 'page-user',
  templateUrl: 'login.html'
})
export class LoginPage {
  login: {email?: string, password?: string} = {};
  submitted = false;

  // Our translated text strings
  private loginErrorString: string;

  constructor(public navCtrl: NavController,
              public userData: UserData,
              public toastCtrl: ToastController,
              public storage: Storage,
              public translateService: TranslateService) {

    this.translateService.get('LOGIN_ERROR').subscribe((value) => {
      this.loginErrorString = value;
    });
  }

  onLogin(form: NgForm) {
    this.submitted = true;

    if (form.valid) {
      this.userData.login(this.login).subscribe((resp) => {
        let hasSeenTutorial = Observable.fromPromise(this.storage.get(HAS_SEEN_TUTORIAL));
        hasSeenTutorial.subscribe((value) => {
          let page = value ? TabsPage : TutorialPage;
          this.navCtrl.push(page);
        });
      }, (err) => {
        // this.navCtrl.push(TabsPage);
        // Unable to log in
        let toast = this.toastCtrl.create({
          message: this.loginErrorString,
          duration: 3000,
          position: 'top'
        });
        toast.present();
      });
    }
  }

  onSignup() {
    this.navCtrl.push(SignupPage);
  }

  onSignInWithProvider(provider: string) {
    this.userData.signInWithProvider(provider)
      .subscribe((resp) => {
        let hasSeenTutorial = Observable.fromPromise(this.storage.get(HAS_SEEN_TUTORIAL));
        hasSeenTutorial.subscribe((value) => {
          let page = value ? TabsPage : TutorialPage;
          this.navCtrl.push(page);
        });
      }, (err) => {
        // this.navCtrl.push(TabsPage);
        // Unable to log in
        let toast = this.toastCtrl.create({
          message: this.loginErrorString,
          duration: 3000,
          position: 'top'
        });
        toast.present();
      });
  }

  clearStorage() {
    this.userData.clearStorage();
  }
}
