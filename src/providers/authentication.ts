/*
 * WayFusion (www.wayfusion.com)
 *
 * Copyright (c) 2017, Sergio Khlopenkov. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import "rxjs/add/observable/fromPromise";
import "rxjs/add/operator/mergeMap";

import { Events, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { Api } from './api';
import { Token, AuthConfigDefaults } from './token';
import { API_URL, HAS_LOGGED_IN, CLIENT_SECRET, CLIENT_ID, FACEBOOK_ID, TWITTER_KEY } from './config';

import { AppAvailability } from '@ionic-native/app-availability';
import { Facebook } from '@ionic-native/facebook';
import { TwitterConnect } from '@ionic-native/twitter-connect';

import * as hello from 'hellojs';

@Injectable()
export class Authentication {

  appPlatformProviderMap: any = {
    facebook: {
      ios: 'fb://',
      android: 'com.facebook.katana'
    },
    twitter: {
      ios: 'twitter://',
      android: 'com.twitter.android'
    },
    whatsapp: {
      ios: 'whatsapp://',
      android: 'com.whatsapp'
    }
  };

  constructor(public http: Http,
              public api: Api,
              public token: Token,
              public events: Events,
              public storage: Storage,
              private appAvailability: AppAvailability,
              private platform: Platform,
              private facebook: Facebook,
              private twitter: TwitterConnect) {
  }

  checkNativeAppAvailability(provider: string) {
    let app: string;

    if (this.platform.is('ios')) {
      app = this.appPlatformProviderMap[provider]['ios'];
    } else if (this.platform.is('android')) {
      app = this.appPlatformProviderMap[provider]['android'];
    }

    if (app) {
      return Observable.fromPromise(this.appAvailability.check(app));
    } else {
      return Observable.throw('Native app unavailable');
    }
  }

  authProvider(provider: string) {
    let nativeAppIsAvailable = this.checkNativeAppAvailability(provider);
    let authResult;
    switch (provider) {
      case 'facebook':
        authResult = nativeAppIsAvailable.mergeMap(() => this.authFacebookSDK());
        break;
      case 'twitter':
        authResult = nativeAppIsAvailable.mergeMap(() => this.authTwitterSDK());
        break;
    }

    return authResult.catch(() => {
      return this.authBrowser(provider);
    });
  }

  public authFacebookSDK() {
    // Login with Facebook SDK
    let facebookLoginPromise = this.facebook.login(['public_profile', 'email']);
    return Observable.fromPromise(facebookLoginPromise).mergeMap((userData) => {
      console.log("UserInfo: ", userData);
      // Get facebook access_token
      let facebookTokenPromise = this.facebook.getAccessToken();
      return Observable.fromPromise(facebookTokenPromise).mergeMap((facebookToken) => {
        return this.authFacebookToken(facebookToken);
      });
    });
  }

  private authFacebookToken(facebookToken: string) {
    // authorize on server with facebook access_token
    let seq = this.api.post('oauth/token/facebook', {
      access_token: facebookToken
    });
    return seq.mergeMap((token) => this.setToken(token));
  }

  public authTwitterSDK() {
    let promise = this.twitter.login();
    let twitterLogin = Observable.fromPromise(promise);
    return twitterLogin.mergeMap((result) => {
      return this.authTwitterToken(result);
    });
  }

  private authTwitterToken(twitterResponse: any) {
    let seq = this.api.post('oauth/token/twitter', {
      oauth_token: twitterResponse.token,
      oauth_token_secret: twitterResponse.secret,
      user_id: twitterResponse.userId
    });

    return seq.mergeMap((token) => this.setToken(token));
  }

  private setToken = (tokenData: any) => {
    tokenData = tokenData.json();
    this.storage.set(HAS_LOGGED_IN, true);
    tokenData.expires = Date.now() + tokenData.expires_in * 1000;
    console.log('expires', new Date(tokenData.expires));
    this.events.publish('user:login');
    return Observable.fromPromise(AuthConfigDefaults.tokenSetter(tokenData));
  };

  public authUserCredentials(data: any): Observable<any> {

    let body = {
      grant_type: 'password',
      username: data.email,
      password: data.password,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    };

    return this.http.post(API_URL + '/oauth/token', body)
      .mergeMap((resp: any) => {
        resp = resp.json();
        return Observable.fromPromise(AuthConfigDefaults.tokenSetter(resp));
      })
      .catch(() => {
        return this.token.onAuthFailure();
      });
  }

  public authBrowser(provider: string) {

    hello.init({
      facebook: FACEBOOK_ID,
      twitter: TWITTER_KEY
    }, {
      redirect_uri: window.location.origin,
      oauth_proxy: API_URL + '/oauthproxy'
    });

    let options = {
      response_type: 'code'
    };

    return Observable.fromPromise(hello.login(provider, options))
      .mergeMap((data) => {
        console.log(data);
        return this.authBrowserToken(data);
      })
      .catch((err) => {
        console.log(err);
        return Observable.throw(err);
      });
  }

  authBrowserToken({authResponse, network}: any) {
    let obs;
    switch (network) {
      case 'facebook':
        obs = this.authFacebookToken(authResponse.access_token);
        break;
      case 'twitter':
        let tokenData = {
          token: authResponse.oauth_token,
          secret: authResponse.oauth_token_secret,
          userId: authResponse.user_id
        };
        console.log(tokenData, authResponse);
        obs = this.authTwitterToken(tokenData);
        break;
    }

    return obs;
  }

  public signup(data: any): Observable<any> {
    return this.http.post(`${API_URL}/signup`, data);
  }

}
