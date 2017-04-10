/*
 * WayFusion (www.wayfusion.com)
 *
 * Copyright (c) 2017, Sergio Khlopenkov. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Injectable } from '@angular/core';

import { Api } from './api';
import { Token } from './token';
import { Authentication } from './authentication';
import { HAS_LOGGED_IN, HAS_SEEN_TUTORIAL, USER_PROFILE, DEFAULT_TOKEN_NAME } from './config';
import { Http } from '@angular/http';

import { Events, MenuController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Observable } from "rxjs";

@Injectable()
export class UserData {

  constructor(public api: Api,
              public token: Token,
              public authentication: Authentication,
              public http: Http,
              public events: Events,
              public storage: Storage,
              public menu: MenuController) {
  }

  addFavorite(item: any) {
    let body = {
      resourceId: item.id,
      resourceName: item.metadata_model,
      data: item
    };
    return this.api.post('favorite', body).map(resp => resp.json());
  };

  removeFavorite(item: any) {
    let body = {
      resourceId: item.id,
      resourceName: item.metadata_model
    };
    return this.api.delete('favorite', body);
  };

  login(accountInfo: any) {
    return this.authentication.authUserCredentials(accountInfo)
      .mergeMap(() => {
        this.storage.set(HAS_LOGGED_IN, true);
        this.events.publish('user:login');
        return this.refreshUserProfile();
      })
      .catch((err: any) => {
        return Observable.throw(err);
      });
  };

  signup(data: any): Observable<any> {
    return this.authentication.signup(data).mergeMap((resp) => {
      this.events.publish('user:signup');
      return this.login(data);
    });
  };

  logout(): void {
    this.storage.remove(HAS_LOGGED_IN);
    this.storage.remove(USER_PROFILE);
    this.storage.remove(DEFAULT_TOKEN_NAME);
    this.events.publish('user:logout');
  };

  getUser(): Promise<any> {
    return this.storage.get(USER_PROFILE);
  };

  hasLoggedIn(): Promise<boolean> {
    return this.storage.get(HAS_LOGGED_IN);
  };

  checkHasSeenTutorial(): Promise<string> {
    return this.storage.get(HAS_SEEN_TUTORIAL).then((value) => {
      return value;
    });
  };

  signInWithProvider(provider: string) {
    return this.authentication.authProvider(provider).mergeMap(() => {
      return this.refreshUserProfile();
    });
  };

  refreshUserProfile() {
    return this.api.get('profile')
      .mergeMap((resp) => {
        resp = resp.json();
        console.log('refresh profile', resp);
        return Observable.fromPromise(this.storage.set(USER_PROFILE, resp));
      });
  }

  clearStorage() {
    return this.storage.clear();
  }

  updateMenu() {
    // decide which menu items should be hidden by current login status stored in local storage
    this.hasLoggedIn().then((hasLoggedIn) => {
      this.enableMenu(hasLoggedIn === true);
    });
  }

  enableMenu(loggedIn: boolean) {
    this.menu.enable(loggedIn, 'loggedInMenu');
    this.menu.enable(!loggedIn, 'loggedOutMenu');
  }

}
