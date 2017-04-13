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
import { Http } from '@angular/http';

import { Storage } from '@ionic/storage';

import { UserData } from './user-data';
import { EXCLUDED_PROVIDERS } from './config';

import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { Observable } from "rxjs";


@Injectable()
export class FeedData {
  data: any;

  constructor(public api: Api,
              public http: Http,
              public userData: UserData,
              public storage: Storage) {
  }

  getInstagram(body: any) {
    return this.api.post('ls/instagram', body).map(resp => {
      let media = resp.json();
      media = media.map((medium: any) => {
        medium.metadata_model = 'instagram';
        medium.metadata_created_at = new Date(medium.takenAt);
        return medium;
      });
      return media;
    });
  }

  getTweets(body: any) {
    return this.api.post('ls/twitter', body).map((resp: any) => {
      let result = resp.json();
      result.statuses = result.statuses.map((tweet: any) => {
        tweet.metadata_model = 'twitter';
        tweet.metadata_created_at = new Date(tweet.created_at);
        return tweet;
      });
      return result;
    });
  }

  getFavorites() {
    return this.api.get('favorite').map(resp => resp.json());
  }

  getProviders() {
    return Observable.fromPromise(this.userData.getUser())
      .mergeMap((user) => {
        let providers = [];
        providers.push('Instagram');
        user.twitter && providers.push('Twitter');
        return Observable.of(providers);
      });
  }

  getExcludedProviders() {
    return Observable.fromPromise(this.storage.get(EXCLUDED_PROVIDERS));
  }

}
