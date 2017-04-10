/*
 * WayFusion (www.wayfusion.com)
 *
 * Copyright (c) 2017, Sergio Khlopenkov. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from '@angular/core';

import { NavParams } from 'ionic-angular';


@Component({
  selector: 'page-feed-detail',
  templateUrl: 'feed-detail.html'
})
export class FeedDetailPage {
  item: any;

  constructor(public navParams: NavParams) {
    this.item = navParams.data.medium;
  }
}
