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
  tracks: Array<{name: string, isChecked: boolean}> = [];

  constructor(
    public feedData: FeedData,
    public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
    // passed in array of track names that should be excluded (unchecked)
    // let excludedTrackNames = this.navParams.data;

    // this.feedData.getTracks().subscribe((trackNames: string[]) => {
    //
    //   trackNames.forEach(trackName => {
    //     this.tracks.push({
    //       name: trackName,
    //       isChecked: (excludedTrackNames.indexOf(trackName) === -1)
    //     });
    //   });
    //
    // });
  }

  resetFilters() {
    // reset all of the toggles to be checked
    this.tracks.forEach(track => {
      track.isChecked = true;
    });
  }

  applyFilters() {
    // Pass back a new array of track names to exclude
    let excludedTrackNames = this.tracks.filter(c => !c.isChecked).map(c => c.name);
    this.dismiss(excludedTrackNames);
  }

  dismiss(data?: any) {
    // using the injected ViewController this page
    // can "dismiss" itself and pass back data
    this.viewCtrl.dismiss(data);
  }
}
