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

import { Observable } from "rxjs";


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

    Observable.forkJoin([this.feedData.getProviders(), this.feedData.getExcludedProviders()])
    .subscribe((providers: any[]) => {

      providers[0].forEach((provider: string) => {
        this.providers.push({
          name: provider,
          isChecked: (providers[1].indexOf(provider) === -1)
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
    this.feedData.setExcludedProviders(excludedProviderNames).subscribe(() => {
      this.dismiss(excludedProviderNames);
    });
  }

  dismiss(data?: any) {
    // using the injected ViewController this page
    // can "dismiss" itself and pass back data
    this.viewCtrl.dismiss(data);
  }

}
