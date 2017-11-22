import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/concat';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/zip';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/range';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/merge';

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface CountDown {
  day: number;
  hour: number;
  minute: number;
  second: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit{

  title = 'app';
  readonly _MS_PER_SECOND = 1000;
  readonly _FUTURE_DATE = '2017-11-23';
  posts$: Observable<Post[]>;
  countDown$: Observable<CountDown>;
  @ViewChild('increment', {read: ElementRef}) increment: ElementRef;
  @ViewChild('decrement', {read: ElementRef}) decrement: ElementRef;
  click$: Observable<number>;

  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    this.posts$ = this.getPosts();
    this.countDown$ = this.getCounDownObservable(new Date(), new Date(this._FUTURE_DATE));
    const increment$ = Observable
      .fromEvent(this.increment.nativeElement, 'click')
      .do(_ => console.log('increment'))
      .mapTo(1);
    const decrement$ = Observable
      .fromEvent(this.decrement.nativeElement, 'click')
      .debounceTime(300)
      .do(_ => console.log('decrement'))
      .mapTo(-1);
    this.click$ = Observable.merge(increment$, decrement$)
      .scan((acc, curr) => acc + curr);
  }

  getPosts() : Observable<Post[]> {
    const uri = `http://jsonplaceholder.typicode.com/posts1`;
    return this.http
      .get<Post[]>(uri)
      .retryWhen(err => this.getRetryStrategyObservable(err))
  }

  private getRetryStrategyObservable(err: Observable<any>) {
    const retryCount$ = Observable.range(1, 5);
    const errWithRetry$ = Observable.zip(err, retryCount$, (e, i) => ({error: e, count: i}));
    return errWithRetry$
      .mergeMap(({error, count}) => {
        // not found or service unavailable
        if(error.status === 404 || error.status === 503) {
          // 失败后不是立即重新尝试，而是等待越来越长的时间重试
          return Observable.of(error.status).delay(Math.pow(2, count) * 1000);
        }
        return Observable.throw({error: '没有进行重试', count: count});
      })
      .concat(Observable.throw({error: '尝试 5 次后失败'}));
  }

  private diffInSec = (now: Date, future: Date): number => {
    const diff = future.getTime() - now.getTime();
    return Math.floor(diff / this._MS_PER_SECOND)
  }

  getCounDownObservable(now: Date, future: Date): Observable<CountDown> {
    return Observable
      .interval(1000)
      .map(elapse => this.diffInSec(now, future) - elapse)
      .takeWhile(gap => gap >= 0)
      .map(s => ({
        day: Math.floor(s/3600/24),
        hour: Math.floor(s/3600) % 24,
        minute: Math.floor(s/60) % 60,
        second: s % 60
      }));
  }
}
