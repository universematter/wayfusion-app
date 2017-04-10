/*
 * WayFusion (www.wayfusion.com)
 *
 * Copyright (c) 2017, Sergio Khlopenkov. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Directive, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { Gesture } from 'ionic-angular/gestures/gesture';
declare let Hammer: any;

@Directive({
  selector: '[doubletap]'
})
export class PressDirective implements OnInit, OnDestroy {
  el: HTMLElement;
  pressGesture: Gesture;
  //
  // @Output()
  // longPress: EventEmitter<any> = new EventEmitter();

  constructor(el: ElementRef) {
    this.el = el.nativeElement;
  }

  ngOnInit() {
    this.pressGesture = new Gesture(this.el, {
      recognizers: [
        [Hammer.Tap, {taps: 2}]
      ]
    });
    this.pressGesture.listen();
    this.pressGesture.on('tap', (e: any) => {
      // this.longPress.emit(e);
      console.log('tap', e);
    })
  }

  ngOnDestroy() {
    this.pressGesture.destroy();
  }
}
