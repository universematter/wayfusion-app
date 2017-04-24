/*
 * WayFusion (www.wayfusion.com)
 *
 * Copyright (c) 2017, Sergio Khlopenkov. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BrowserModule } from '@angular/platform-browser';
import { Http, HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';

import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';

import { WayFusionApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { PopoverPage } from '../pages/about-popover/about-popover';
import { AccountPage } from '../pages/account/account';
import { LoginPage } from '../pages/login/login';
import { MapPage } from '../pages/map/map';
import { FeedPage } from '../pages/feed/feed';
import { FeedFilterPage } from '../pages/feed-filter/feed-filter';
import { FeedDetailPage } from '../pages/feed-detail/feed-detail';
import { SignupPage } from '../pages/signup/signup';
import { TabsPage } from '../pages/tabs/tabs';
import { TutorialPage } from '../pages/tutorial/tutorial';

import { FeedCardComponent } from '../components/feed-card/feed-card.component';
import { TwitterCardComponent } from '../components/feed-card/twitter-card.component';
import { InstagramCardComponent } from '../components/feed-card/instagram-card.component';
import { FoursquareCardComponent } from '../components/feed-card/foursquare-card.component';

import { PressDirective } from '../directives/gestures/long-press.directive';

import { MomentLocaleInit } from '../config/moment';
import { Api } from '../providers/api';
import { Token } from '../providers/token';
import { Authentication } from '../providers/authentication';
import { FeedData } from '../providers/feed-data';
import { UserData } from '../providers/user-data';
//Ionic Native Cordova plugins
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AppAvailability } from '@ionic-native/app-availability';
import { Facebook } from '@ionic-native/facebook';
import { TwitterConnect } from '@ionic-native/twitter-connect';
import { Clipboard } from '@ionic-native/clipboard';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { LinkyModule } from 'angular-linky';

// The translate loader needs to know where to load i18n files
// in Ionic's static asset pipeline.
export function createTranslateLoader(http: Http) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    WayFusionApp,
    AboutPage,
    AccountPage,
    LoginPage,
    MapPage,
    PopoverPage,
    FeedPage,
    FeedFilterPage,
    FeedDetailPage,
    SignupPage,
    TabsPage,
    TutorialPage,
    FeedCardComponent,
    TwitterCardComponent,
    InstagramCardComponent,
    FoursquareCardComponent,
    PressDirective
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(WayFusionApp, {}, {
      links: [
        { component: TabsPage, name: 'Tabs', segment: 'tabs' },
        { component: FeedPage, name: 'Feed', segment: 'feed' },
        { component: FeedDetailPage, name: 'FeedDetail', segment: 'detail/:provider/:id' },
        { component: FeedFilterPage, name: 'FeedFilter', segment: 'filter' },
        { component: MapPage, name: 'Map', segment: 'map' },
        { component: AboutPage, name: 'About', segment: 'about' },
        { component: PopoverPage, name: 'AboutPopover', segment: 'about' },
        { component: TutorialPage, name: 'Tutorial', segment: 'tutorial' },
        { component: LoginPage, name: 'Login', segment: 'login' },
        { component: AccountPage, name: 'Account', segment: 'profile' },
        { component: SignupPage, name: 'Signup', segment: 'signup' }
      ]
    }),
    IonicStorageModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [Http]
      }
    }),
    LinkyModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    WayFusionApp,
    AboutPage,
    AccountPage,
    LoginPage,
    MapPage,
    PopoverPage,
    FeedPage,
    FeedFilterPage,
    FeedDetailPage,
    SignupPage,
    TabsPage,
    TutorialPage,
    TwitterCardComponent,
    InstagramCardComponent,
    FoursquareCardComponent
  ],
  providers: [
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    Api,
    Token,
    Authentication,
    FeedData,
    UserData,
    InAppBrowser,
    SplashScreen,
    AppAvailability,
    TwitterConnect,
    Facebook,
    Clipboard
  ]
})
export class AppModule {
  constructor() {
    MomentLocaleInit();
  }
}
