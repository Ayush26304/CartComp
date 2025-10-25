import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private isChildComponentSubject = new BehaviorSubject<boolean>(false);
  public isChildComponent$ = this.isChildComponentSubject.asObservable();

  setChildComponent(isChild: boolean): void {
    this.isChildComponentSubject.next(isChild);
  }

  getIsChildComponent(): boolean {
    return this.isChildComponentSubject.value;
  }
}
