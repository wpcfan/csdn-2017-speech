import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  @ViewChild('increment', {read: ElementRef}) increment: ElementRef;
  @ViewChild('decrement', {read: ElementRef}) decrement: ElementRef;

  click$: Observable<number>;

  ngAfterViewInit(): void {
    this.click$ = this.getCounterObservable();
  }

  private getCounterObservable(): Observable<number> {
    const increment$ = Observable
      .fromEvent(this.increment.nativeElement, 'click')
      .do(_ => console.log('increment'))
      .mapTo(1);
    const decrement$ = Observable
      .fromEvent(this.decrement.nativeElement, 'click')
      .debounceTime(300)
      .do(_ => console.log('decrement'))
      .mapTo(-1);
    return Observable.merge(increment$, decrement$)
      .scan((acc, curr) => acc + curr)
      .startWith(0);
  }
}
