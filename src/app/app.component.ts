import { Component, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/concat';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/zip';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/range';

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  posts$: Observable<Post[]>;

  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    this.posts$ = this.getPosts();
  }

  getPosts(): Observable<Post[]> {
    const uri = `http://jsonplaceholder.typicode.com/posts1`;
    return this.http
      .get<Post[]>(uri)
      .retryWhen(err => this.getRetryStrategyObservable(err));
  }

  private getRetryStrategyObservable(err: Observable<any>) {
    const retryCount$ = Observable.range(1, 5);
    const errWithRetry$ = Observable.zip(err, retryCount$, (e, i) => ({error: e, count: i}));
    return errWithRetry$
      .mergeMap(({error, count}) => {
        // not found or service unavailable
        if (error.status === 404 || error.status === 503) {
          // 失败后不是立即重新尝试，而是等待越来越长的时间重试
          console.log(count);
          return count < 5 ?
            Observable.of(error.status).delay(Math.pow(2, count) * 1000) :
            Observable.of(error.status);
        }
        return Observable.throw({error: '没有进行重试', count: count});
      })
      .concat(Observable.throw({error: '尝试 5 次后失败'}));
  }
}
