import { UserInputService } from './../user-input.service';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

@Component({
	selector: 'app-canvas',
	templateUrl: './canvas.component.html',
	styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {

	// private obj:any;
	@ViewChild('canvas') private canvas:ElementRef;

	constructor(private userInput: UserInputService) { }

	ngOnInit() {
		// this.userInput.canvas.subscribe((data:ElementRef) => {
		// 	this.canvas = data;
		// });
		// this.userInput.currentData.subscribe(data => {
		// 	this.obj = data;
		// });
		this.userInput.defineCanvas(this.canvas.nativeElement);
	}

	EmitPost({x, y}){
		this.userInput.EmitData({
			x,
			y
		});
	}

}
