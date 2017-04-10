/*
 * WayFusion (www.wayfusion.com)
 *
 * Copyright (c) 2017, Sergio Khlopenkov. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Injectable } from '@angular/core';

import {Api} from './api';
import { Http } from '@angular/http';

import { UserData } from './user-data';

import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';


@Injectable()
export class FeedData {
  data: any;

  constructor(public api: Api,
              public http: Http,
              public user: UserData) { }

  getInstagram() {
    return this.api.post('ls/instagram').map(resp => {
      let media = resp.json();
      media = media.map((medium: any) => {
        medium.metadata_model = 'instagram';
        medium.metadata_created_at = new Date(medium.takenAt);
        return medium;
      });
      return media;
    });
  }

  getTweets() {
    return this.api.post('ls/twitter').map((resp: any) => {
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

}
