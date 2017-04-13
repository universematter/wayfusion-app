/*
 * WayFusion (www.wayfusion.com)
 *
 * Copyright (c) 2017, Sergio Khlopenkov. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ViewChild } from '@angular/core';

import { AlertController, ToastController, App, FabContainer, ItemSliding, List, ModalController, NavController, LoadingController } from 'ionic-angular';
import {Storage} from '@ionic/storage';

import moment from 'moment';

import { FeedData } from '../../providers/feed-data';
import { FeedFilterPage } from '../feed-filter/feed-filter';
import { FeedDetailPage } from '../feed-detail/feed-detail';
import { UserData } from '../../providers/user-data';
import { Observable } from "rxjs";


@Component({
  selector: 'page-feed',
  templateUrl: 'feed.html'
})
export class FeedPage {
  // the list is a child of the feed page
  // @ViewChild('feedList') gets a reference to the list
  // with the variable #feedList, `read: List` tells it to return
  // the List and not a reference to the element
  @ViewChild('feedList', { read: List }) feedList: List;

  queryText = '';
  excludedProviders: any;
  segment = 'all';
  media: any[] = [];
  favorites: any[] = [];
  loading: any;

  constructor(
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public app: App,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public feedData: FeedData,
    public userData: UserData,
    public storage: Storage
  ) {
    this.loading = this.loadingCtrl.create({
      content: 'Loading...',
      dismissOnPageChange: true
    });

    this.feedData.getExcludedProviders().subscribe((providers) => {
      this.excludedProviders = providers || [];
    });

  }

  presentLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Loading...',
      // dismissOnPageChange: true
    });
    this.loading.present();
  }

  ionViewDidLoad() {
    this.app.setTitle('Feed');
    this.updateFeed();
  }

  sortDesc(item1: any, item2: any) {
    if (item1.metadata_created_at > item2.metadata_created_at) return -1;
    if (item1.metadata_created_at < item2.metadata_created_at) return 1;
    return 0;
  }

  updateFeed(refresher?: any, nextPage?: boolean) {
    !refresher && this.presentLoading();
    this.feedData.getProviders().subscribe((providers) => {
      // Close any open sliding items when the feed updates
      this.feedList && this.feedList.closeSlidingItems();

      const observableBatch = this.getFeedBatch(providers, nextPage);
      if (observableBatch.length === 0) {
        return;
      }
      const observables = observableBatch.map(item => item.observable);
      Observable.forkJoin(...observables).subscribe((results: any[]) => {
        let newMedia = results.map((items, index) => {
          return observableBatch[index].handler.call(this, items);
        });

        //flatten
        newMedia = newMedia.reduce((prev, current) => prev.concat(current));

        newMedia.sort(this.sortDesc);

        newMedia.forEach((medium) => {
          medium.metadata_time_ago = moment(medium.metadata_created_at).fromNow(true);
        });

        this.favorites.sort(this.sortDesc);

        this.favorites.forEach((medium) => {
          medium.metadata_time_ago = moment(medium.metadata_created_at).fromNow(true);
        });

        this.media = nextPage ? this.media.concat(newMedia) : newMedia;
        console.log(newMedia, this.favorites);
        if (refresher) {
          refresher.complete();
        } else {
          this.loading.dismiss();
        }
      }, (err) => {
        console.log(err);
        if (refresher) {
          refresher.complete();
        } else {
          this.loading.dismiss();
        }
      });

    });

  }

  private getFeedBatch(providers: any, nextPage: boolean) {
    let observableBatch: any[] = [];

    observableBatch.push({
      observable: this.feedData.getFavorites(),
      handler: (items: any) => {
        items = items.map((item: any) => {
          let result = item.data;
          result._createdAt = item.createdAt;
          return result;
        });
        return items;
      }
    });

    if (this.segment === 'all') {
      const body = {
        nextPage: nextPage
      };
      const instagram = this.feedData.getInstagram(body);
      const tweets = this.feedData.getTweets(body);

      // if (providers.indexOf('Instagram') !== -1) {
      observableBatch.push({
        observable: instagram,
        handler: (items: any) => {
          items = items.filter((item: any) => {
            return item.likeCount > 20;
          });
          return items;
        }
      });
      // }

      if (providers.indexOf('Twitter') !== -1) {
        observableBatch.push({
          observable: tweets,
          handler: (items: any) => {
            items.statuses = items.statuses.filter((tweet: any) => {
              // return tweet.retweet_count > 1;
              return true;
            });
            console.log(items.statuses);
            return items.statuses;
          }
        })
      }
    }

    return observableBatch;
  }

  presentFilter() {
    let modal = this.modalCtrl.create(FeedFilterPage, this.excludedProviders);
    modal.present();

    modal.onWillDismiss((data: any[]) => {
      if (data) {
        this.excludedProviders = data;
        this.updateFeed();
      }
    });

  }

  goToMediaDetail(medium: any, event?: any) {
    this.navCtrl.push(FeedDetailPage, {
      medium: medium,
      provider: medium.metadata_model,
      id: medium.id
    });
  }

  addFavorite(slidingItem: ItemSliding, medium: any) {
    if (this.isInFavorites(medium)) {
      slidingItem.close();
      this.userData.removeFavorite(medium).subscribe((resp) => {
        let index = this.favorites.findIndex(m => m.id === medium.id && m.metadata_model === medium.metadata_model);
        if (index !== -1) {
          this.favorites.splice(index, 1);
        }

        let toast = this.toastCtrl.create({
          message: 'Favorite Removed',
          duration: 2000,
          position: 'top'
        });
        toast.present();
      });
    } else {
      slidingItem.close();
      this.userData.addFavorite(medium).subscribe((resp) => {
        let fav = resp.data;
        fav._createdAt = resp.createdAt;
        this.favorites.unshift(fav);

        let toast = this.toastCtrl.create({
          message: 'Favorite Added',
          duration: 2000,
          position: 'top'
        });
        toast.present();
      });
    }

  }

  openSocial(network: string, fab: FabContainer) {
    let loading = this.loadingCtrl.create({
      content: `Posting to ${network}`,
      duration: (Math.random() * 1000) + 500
    });
    loading.onWillDismiss(() => {
      fab.close();
    });
    loading.present();
  }

  isInFavorites(medium: any) {
    return this.favorites.findIndex(m => m.id === medium.id && m.metadata_model === medium.metadata_model) !== -1;
  }

  onLongPress(event:any) {
    console.log('long press event', event);
  }

}
