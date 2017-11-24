import { Component, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/observable/interval';

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
export class AppComponent implements AfterViewInit {

  readonly _MS_PER_SECOND = 1000;
  readonly _FUTURE_DATE = '2017-11-26 00:00:00';

  countDown$: Observable<CountDown>;

  ngAfterViewInit(): void {
    this.countDown$ = this.getCounDownObservable(new Date(), new Date(this._FUTURE_DATE));
  }

  private diffInSec = (now: Date, future: Date): number => {
    const diff = future.getTime() - now.getTime();
    return Math.floor(diff / this._MS_PER_SECOND);
  }

  private getCounDownObservable(now: Date, future: Date): Observable<CountDown> {
    return Observable
      .interval(1000)
      .map(elapse => this.diffInSec(now, future) - elapse)
      .takeWhile(gap => gap >= 0)
      .map(s => ({
        day: Math.floor(s / 3600 / 24),
        hour: Math.floor(s / 3600) % 24,
        minute: Math.floor(s / 60) % 60,
        second: s % 60
      }));
  }
}
