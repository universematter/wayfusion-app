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
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import "rxjs/add/observable/fromPromise";
import "rxjs/add/operator/mergeMap";

import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { API_URL, DEFAULT_TOKEN_NAME, CLIENT_SECRET, CLIENT_ID } from './config';

export interface IToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires: number;
}

const storage = new Storage({name: '_ionicstorage'});

export const AuthConfigDefaults = {
  tokenGetter: () => {
    return storage.get(DEFAULT_TOKEN_NAME)
  },
  tokenSetter: (token: IToken) => {
    console.log('setting token', token);
    if (token && token.expires_in) {
      token.expires = Date.now() + token.expires_in * 1000;
    }
    return storage.set(DEFAULT_TOKEN_NAME, token);
  },
};

@Injectable()
export class Token {
  protected isRefreshing = false;
  protected refresherStream: Subject<boolean> = new Subject<boolean>();

  constructor(public http: Http,
              public events: Events) {
  }

  public onAuthFailure() {
    return Observable.fromPromise(AuthConfigDefaults.tokenSetter(null)).mergeMap(() => {
      this.events.publish('auth:failure');
      return Observable.throw('Auth Failure');
    });
  }

  public getToken(): Observable<IToken> {
    return this._getToken().mergeMap((token) => {
      return this._checkToken(token);
    })
  }

  private _getToken(): Observable<IToken> {
    let token: IToken | Promise<IToken> = AuthConfigDefaults.tokenGetter();
    if (token instanceof Promise) {
      return Observable.fromPromise(token);
    } else {
      return Observable.of(token);
    }
  }

  private _checkToken(token: IToken) {
    if (!token) {
      return Observable.of(null);
    }

    if (this.isTokenExpired(token)) {
      if (this.isRefreshing) {
        const waitForTokenRefresh = Observable.create((observer: Observer<IToken>) => {
          this.refresherStream
            .subscribe((value) => {
              if (!value) {
                observer.next(null);
                observer.complete();
              }
            });
        });
        return waitForTokenRefresh.mergeMap(() => {
          return this._getToken();
        });
      } else {
        return this._authRefreshToken(token);
      }
    } else {
      return Observable.of(token);
    }

  }

  private _authRefreshToken(token: IToken) {
    this.setRefreshing(true);

    let body = {
      grant_type: 'refresh_token',
      refresh_token: token.refresh_token,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    };

    return this.http.post(API_URL + '/oauth/token', body)
      .mergeMap((resp: any) => {
        resp = resp.json();
        return Observable.fromPromise(AuthConfigDefaults.tokenSetter(resp)).mergeMap(() => {
          this.setRefreshing(false);

          return Observable.of(resp);
        });
      }).catch((err) => {
        this.setRefreshing(false);
        return this.onAuthFailure();
      });
  }

  public isTokenExpired(token: IToken): boolean {
    // Token expired?
    return Date.now() > token.expires;
  }

  private setRefreshing(value: boolean) {
    this.isRefreshing = value;
    this.refresherStream.next(this.isRefreshing);
  }

}
