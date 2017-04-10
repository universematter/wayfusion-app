/*
 * WayFusion (www.wayfusion.com)
 *
 * Copyright (c) 2017, Sergio Khlopenkov. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ViewChild } from '@angular/core';

import { Events, Nav, Platform } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TranslateService } from '@ngx-translate/core';

import { AboutPage } from '../pages/about/about';
import { AccountPage } from '../pages/account/account';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { TabsPage } from '../pages/tabs/tabs';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { FeedPage } from '../pages/feed/feed';

import { UserData } from '../providers/user-data';

import { Observable } from "rxjs";

export interface PageInterface {
  title: string;
  name: string;
  component: any;
  icon: string;
  logsOut?: boolean;
  index?: number;
  tabName?: string;
  tabComponent?: any;
}

declare const window: any;
@Component({
  templateUrl: 'app.template.html'
})
export class WayFusionApp {
  // the root nav is a child of the root app component
  // @ViewChild(Nav) gets a reference to the app's root nav
  @ViewChild(Nav) nav: Nav;

  // { title: 'Map', name: 'Tabs', component: TabsPage, tabComponent: MapPage, index: 2, icon: 'map' },
  // { title: 'About', name: 'Tabs', component: TabsPage, tabComponent: AboutPage, index: 3, icon: 'information-circle' }
  loggedInPages: PageInterface[] = [
    {title: 'Feed', name: 'Tabs', component: TabsPage, tabComponent: FeedPage, index: 0, icon: 'calendar'},
    {title: 'About', name: 'About', component: AboutPage, icon: 'information-circle'},
    {title: 'Profile', name: 'Tabs', component: TabsPage, tabComponent: AccountPage, index: 1, icon: 'person'},
    {title: 'Logout', name: 'Login', component: LoginPage, icon: 'log-out', logsOut: true}
  ];
  loggedOutPages: PageInterface[] = [
    {title: 'Login', name: 'Login', component: LoginPage, icon: 'log-in'},
    {title: 'Signup', name: 'Signup', component: SignupPage, icon: 'person-add'}
  ];
  rootPage: any;

  constructor(public events: Events,
              public userData: UserData,
              public platform: Platform,
              public translate: TranslateService,
              public splashScreen: SplashScreen,
              public inAppBrowser: InAppBrowser) {

    let checkAuthentication = Observable.fromPromise(this.userData.hasLoggedIn());
    let startup = checkAuthentication
      .mergeMap((hasLoggedIn) => {
        if (hasLoggedIn) {
          return this.userData.refreshUserProfile()
            .mergeMap(() => {
              this.rootPage = TabsPage;
              return Observable.of(TabsPage);
            })
            .catch((err) => {
              this.rootPage = LoginPage;
              return Observable.of(err);
            });
        } else {
          this.rootPage = LoginPage;
          return Observable.of(LoginPage);
        }
      });

    startup.subscribe(() => {
      this.platformReady()
    });

    this.userData.updateMenu();

    this.listenToLoginEvents();

    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('en');

    this.splashScreen.show();
  }

  openPage(page: PageInterface) {
    console.log('open page', page);
    let params = {};
    if (page.index) {
      params = {tabIndex: page.index};
    }

    if (this.nav.getActiveChildNav() && page.index != undefined) {
      this.nav.getActiveChildNav().select(page.index);
    } else {
      this.nav.setRoot(page.name, params).catch((err: any) => {
        console.log(`Didn't set nav root: ${err}`);
      });
    }

    if (page.logsOut === true) {
      this.userData.logout();
    }
  }

  openTutorial() {
    this.nav.setRoot(TutorialPage);
  }

  listenToLoginEvents() {
    this.events.subscribe('user:login', () => {
      this.userData.enableMenu(true);
    });

    this.events.subscribe('user:signup', () => {
      // this.enableMenu(true);
    });

    this.events.subscribe('user:logout', () => {
      this.userData.enableMenu(false);
    });

    this.events.subscribe('auth:failure', () => {
      this.userData.enableMenu(false);
      this.goToLoginPage();
    });
  }

  platformReady() {
    // Init cordova plugins when ready
    this.platform.ready().then(() => {
      if (typeof window.cordova !== 'undefined') {
        this.splashScreen.hide();

        window.open = (url: string, target?: any, opts?: any) => this.inAppBrowser.create(url, target, opts);
      }
    });
  }

  isActive(page: PageInterface) {
    let childNav = this.nav.getActiveChildNav();

    // Tabs are a special case because they have their own navigation
    if (childNav) {
      if (childNav.getSelected() && childNav.getSelected().root === page.tabName) {
        return 'primary';
      }
      return;
    }

    if (this.nav.getActive() && this.nav.getActive().name === page.name) {
      return 'primary';
    }
    return;
  }

  goToLoginPage() {
    console.log('go to login');
    this.openPage(this.loggedOutPages[0]);
  }

}
