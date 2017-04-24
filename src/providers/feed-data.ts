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

  getVenues(body: any) {
    return this.api.post('ls/foursquare', body).map((resp: any) => {
      let result = resp.json();
      if (!result.groups.length) {
        return [];
      }
      result = result.groups[0].items.map((venue: any) => {
        venue.metadata_model = 'foursquare';
        if (venue.tips && venue.tips[0]) {
          venue.metadata_created_at = new Date(venue.tips[0].createdAt * 1000);
          venue.id = venue.venue.id;
        }
        return venue;
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
        /*user.twitter && */providers.push('Twitter');
        /*user.foursquare && */providers.push('Foursquare');
        return Observable.of(providers);
      });
  }

  getAvailableProviders() {
    return Observable.forkJoin([this.getProviders(), this.getExcludedProviders()])
      .mergeMap((providers) => {
        let result: any[] = providers[0].filter((item: string) => providers[1].indexOf(item) === -1);
        return Observable.of(result);
      })
  }

  getExcludedProviders() {
    return Observable.fromPromise(this.storage.get(EXCLUDED_PROVIDERS))
      .mergeMap((value) => {
        value = value || [];
        return Observable.of(value);
      });
  }

  setExcludedProviders(value: any) {
    return Observable.fromPromise(this.storage.set(EXCLUDED_PROVIDERS, value));
  }

}
