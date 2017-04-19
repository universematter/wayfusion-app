/*
 * WayFusion (www.wayfusion.com)
 *
 * Copyright (c) 2017, Sergio Khlopenkov. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as moment from 'moment';

export const MomentLocaleInit = () => {
  moment.updateLocale('en', {
    relativeTime: {
      future: 'in %s',
      past: '%s ago',
      s:  '1m',
      ss: '1m',
      m:  '1m',
      mm: '%dm',
      h:  '1h',
      hh: '%dh',
      d:  '1d',
      dd: '%dd',
      M:  '1M',
      MM: '%dM',
      y:  '1Y',
      yy: '%dY'
    }
  });
};
