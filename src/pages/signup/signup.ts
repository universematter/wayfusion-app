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

import { UserData } from '../../providers/user-data';

import { TabsPage } from '../tabs/tabs';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'page-user',
  templateUrl: 'signup.html'
})
export class SignupPage {
  signup: {email?: string, password?: string} = {};
  submitted = false;

  // Our translated text strings
  private signUpErrorString: string;
  constructor(public navCtrl: NavController,
              public userData: UserData,
              public toastCtrl: ToastController,
              public translateService: TranslateService) {

    this.translateService.get('SIGNUP_ERROR').subscribe((value) => {
      this.signUpErrorString = value;
    })
  }

  onSignup(form: NgForm) {
    this.submitted = true;

    if (form.valid) {
      this.userData.signup(this.signup).subscribe(() => {
        this.navCtrl.push(TabsPage);
      }, (err) => {
        // Unable to sign up
        let toast = this.toastCtrl.create({
          message: this.signUpErrorString,
          duration: 3000,
          position: 'top'
        });
        toast.present();
      });
    }
  }
}
