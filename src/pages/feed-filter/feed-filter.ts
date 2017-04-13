/*
 * WayFusion (www.wayfusion.com)
 *
 * Copyright (c) 2017, Sergio Khlopenkov. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from '@angular/core';

import { NavParams, ViewController } from 'ionic-angular';

import { FeedData } from '../../providers/feed-data';


@Component({
  selector: 'page-feed-filter',
  templateUrl: 'feed-filter.html'
})
export class FeedFilterPage {
  providers: Array<{name: string, isChecked: boolean}> = [];

  constructor(
    public feedData: FeedData,
    public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
    let excludedProviderNames = this.navParams.data;

    this.feedData.getProviders().subscribe((names: string[]) => {

      names.forEach(name => {
        this.providers.push({
          name: name,
          isChecked: (excludedProviderNames.indexOf(name) === -1)
        });
      });

    });
  }

  resetFilters() {
    this.providers.forEach(provider => {
      provider.isChecked = true;
    });
  }

  applyFilters() {
    let excludedProviderNames = this.providers.filter(c => !c.isChecked).map(c => c.name);
    this.viewCtrl.dismiss(excludedProviderNames);
  }

}
