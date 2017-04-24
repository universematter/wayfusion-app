/*
 * WayFusion (www.wayfusion.com)
 *
 * Copyright (c) 2017, Sergio Khlopenkov. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Component, Input, OnInit, OnDestroy,
  ViewChild, ViewContainerRef,
  ComponentFactoryResolver, ComponentRef
} from '@angular/core';

import { DynamicComponent } from './dynamic-component'
import { TwitterCardComponent } from './twitter-card.component';
import { InstagramCardComponent } from './instagram-card.component';
import { FoursquareCardComponent } from './foursquare-card.component';

@Component({
  selector: 'feed-card',
  templateUrl: 'feed-card.component.html'
})
export class FeedCardComponent implements OnInit, OnDestroy {

  @ViewChild('feedcard', {read: ViewContainerRef})
  container: ViewContainerRef;

  @Input()
  type: string;

  @Input()
  context: any;

  @Input()
  showDetail: boolean;

  private mappings: any = {
    'twitter': TwitterCardComponent,
    'instagram': InstagramCardComponent,
    'foursquare': FoursquareCardComponent
  };

  private componentRef: ComponentRef<{}>;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {
  }

  getComponentType(typeName: string) {
    let type = this.mappings[typeName];
    return type;
  }

  ngOnInit() {
    if (this.type) {
      let componentType = this.getComponentType(this.type);

      // note: componentType must be declared within module.entryComponents
      let factory = this.componentFactoryResolver.resolveComponentFactory(componentType);
      this.componentRef = this.container.createComponent(factory);

      // set component context
      let instance = <DynamicComponent> this.componentRef.instance;
      instance.context = this.context;
      instance.showDetail = this.showDetail;
    }
  }

  ngOnDestroy() {
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }

}
