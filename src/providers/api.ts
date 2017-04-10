/*
 * WayFusion (www.wayfusion.com)
 *
 * Copyright (c) 2017, Sergio Khlopenkov. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Injectable} from '@angular/core';
import {
  Http,
  Request,
  RequestMethod,
  RequestOptions,
  RequestOptionsArgs,
  Response,
} from '@angular/http';

import {Events} from 'ionic-angular';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import "rxjs/add/observable/fromPromise";
import "rxjs/add/observable/defer";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/take";

import {API_URL} from './config';
import {Token} from './token';

export interface IToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires: number;
}

export interface IAuthConfig {
  globalHeaders: Array<Object>;
  headerName: string;
  headerPrefix: string;
}

export class AuthConfigConsts {
  public static DEFAULT_HEADER_NAME = 'Authorization';
  public static HEADER_PREFIX_BEARER = 'Bearer ';
}

const AuthConfigDefaults: IAuthConfig = {
  headerName: AuthConfigConsts.DEFAULT_HEADER_NAME,
  headerPrefix: AuthConfigConsts.HEADER_PREFIX_BEARER,
  globalHeaders: [],
};

export class AuthHttpError extends Error {
}

/**
 * Api is a generic REST Api handler. Set your API url first.
 */
@Injectable()
export class Api {

  constructor(public http: Http,
              public token: Token,
              public events: Events) {
  }

  /*private mergeOptions(providedOpts: RequestOptionsArgs, defaultOpts?: RequestOptions) {
   let newOptions = defaultOpts || new RequestOptions();
   // if (this.config.globalHeaders) {
   //   this.setGlobalHeaders(this.config.globalHeaders, providedOpts);
   // }

   newOptions = newOptions.merge(new RequestOptions(providedOpts));

   return newOptions;
   }*/

  private requestHelper(requestArgs: RequestOptionsArgs, additionalOptions?: RequestOptionsArgs): Observable<Response> {
    let options = new RequestOptions(requestArgs);
    if (additionalOptions) {
      options = options.merge(additionalOptions);
    }
    // options = this.mergeOptions(options, this.defOpts);
    return this.request(new Request(options));
  }

  private requestWithToken(req: Request, token: IToken): Observable<Response> {
    if (token) {
      req.headers.set(AuthConfigDefaults.headerName, AuthConfigDefaults.headerPrefix + token.access_token);
    }
    const retryFn = (obs: Observable<any>) => {
      return obs
        .switchMap((resp) => {
          if (resp.status.toString().match(/(401|403)/)) {
            return this.token.onAuthFailure();
          }
          return Observable.of(resp);
        })
        .zip(Observable.range(1, 3), (_, i) => i)
        .mergeMap(i => {
          if (i === 3) {
            return Observable.throw('There is some problems');
          }
          console.log('delay retry by ' + i + ' second(s)');
          return Observable.timer(i * 1000);
        })
    };
    let source = this.http.request(req).retryWhen(retryFn);
    return source;
  }

  public request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    if (typeof url === 'string') {
      return this.get(url, options); // Recursion: transform url from String to Request
    }
    // else if ( ! url instanceof Request ) {
    //   throw new Error('First argument must be a url string or Request instance.');
    // }

    // from this point url is always an instance of Request;
    let req: Request = url as Request;

    // Create a cold observable and load the token just in time
    return Observable.defer(() => {
      return this.token.getToken().mergeMap((token) => {
        return this.requestWithToken(req, token);
      });
    });
  }

  public get(endpoint: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({body: '', method: RequestMethod.Get, url: API_URL + '/' + endpoint}, options);
  }

  public post(endpoint: string, body?: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({body: body, method: RequestMethod.Post, url: API_URL + '/' + endpoint}, options);
  }

  public put(endpoint: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({body: body, method: RequestMethod.Put, url: API_URL + '/' + endpoint}, options);
  }

  public delete(endpoint: string, body?: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({body: body, method: RequestMethod.Delete, url: API_URL + '/' + endpoint}, options);
  }

  public patch(endpoint: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({body: body, method: RequestMethod.Patch, url: API_URL + '/' + endpoint}, options);
  }

  public head(endpoint: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({body: '', method: RequestMethod.Head, url: API_URL + '/' + endpoint}, options);
  }

  public options(endpoint: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({body: '', method: RequestMethod.Options, url: API_URL + '/' + endpoint}, options);
  }

}
