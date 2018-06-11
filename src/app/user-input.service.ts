// import { BehaviorSubject } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class UserInputService {

	private dataSource = new BehaviorSubject<object>({
		x: 0,
		y: 0,
		canvas: undefined
	});
	canvasSource = new BehaviorSubject<object>({});
	canvas = this.canvasSource.asObservable();
	currentData = this.dataSource.asObservable();

	defineCanvas(obj:any){
		this.canvasSource.next(obj);
	}

	EmitData(obj:any){
		this.dataSource.next(obj);
	}

  constructor() { }
}
