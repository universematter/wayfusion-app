/*
 * WayFusion (www.wayfusion.com)
 *
 * Copyright (c) 2017, Sergio Khlopenkov. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from '@angular/core';

import { AlertController, NavController, LoadingController, ToastController } from 'ionic-angular';

import { UserData } from '../../providers/user-data';

import {TranslateService} from '@ngx-translate/core';


@Component({
  selector: 'page-account',
  templateUrl: 'account.html'
})
export class AccountPage {
  user: any;
  loader: any;
  loginErrorString: string;

  constructor(public alertCtrl: AlertController,
              public nav: NavController,
              public loadingCtrl: LoadingController,
              public userData: UserData,
              public toastCtrl: ToastController,
              public translateService: TranslateService) {

    this.translateService.get('LOGIN_ERROR').subscribe((value) => {
      this.loginErrorString = value;
    });
  }

  ionViewDidEnter() {
    this.getUser();
  }

  ngAfterViewInit() {
    // this.getUser();
  }

  updatePicture() {
    console.log('Clicked to update picture');
  }

  // Present an alert with the current username populated
  // clicking OK will update the username and display it
  // clicking Cancel will close the alert and do nothing
  changeUsername() {
    let alert = this.alertCtrl.create({
      title: 'Change Username',
      buttons: [
        'Cancel'
      ]
    });
    alert.addInput({
      name: 'username',
      value: this.user.profile.name,
      placeholder: 'username'
    });
    alert.addButton({
      text: 'Ok',
      handler: (data: any) => {
        this.userData.refreshUserProfile();
        this.getUser();
      }
    });

    alert.present();
  }

  getUser() {
    this.userData.getUser().then((user) => {
      this.user = user;
    });
  }

  changePassword() {
    console.log('Clicked to change password');
  }

  logout() {
    this.userData.logout();
    // this.nav.setRoot('LoginPage');
  }

  support() {
    this.nav.push('SupportPage');
  }

  onSignInWithProvider(provider: string) {
    this.userData.signInWithProvider(provider)
      .subscribe((resp) => {
        //
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
