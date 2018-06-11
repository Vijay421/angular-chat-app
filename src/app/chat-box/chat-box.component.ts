import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';
import { UserInputService } from './../user-input.service';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css'],
  animations: [
	trigger('inputfieldState', [
		state('inactive', style({
			opacity: '1'
		})),
		state('active',   style({
			opacity: '0'
		})),
		transition('inactive => active', animate('300ms ease-out')),
		transition('active => inactive', animate('300ms ease-in'))
	  ]),
	trigger('chatboxState', [
	  state('inactive', style({
		width: '*'
	  })),
	  state('active',   style({
		width: '0',
		display: 'none'
	  })),
	  transition('inactive => active', animate('600ms ease-in')),
	  transition('active => inactive', animate('600ms ease-out'))
	]),
	trigger('textState', [
		// state('inactive', style({
		// 	'white-space': 'nowrap'
		// })),
		// transition('inactive => active', [
		// 	animate(0, keyframes([
		// 		style({'white-space': 'nowrap',  offset: 0})
		// 	]))
		//   ]),
		// transition('active => inactive', [
		// 	animate(600, keyframes([
		// 		style({'white-space': 'normal',  offset: 1.0})
		// 	]))
		//   ])
	  ]),
	trigger('flyIn', [
		// state('active', style({
		// 	background: 'green'
		// })),
		// transition('inactive => active', animate('1000ms ease-in')),
		transition('void => *', [
			style({
				transform: 'translateX(-100%)'
			}),
			animate('800ms ease-out')
		]),
	])
  ]
})
export class ChatBoxComponent implements OnInit {

	@Input() private inputText:string = '';
	private messages:any[] = [];
	private currentCommand:string = 'setName';
	private buttonText:string = 'SEND';
	private websocket:WebSocket = new WebSocket('ws://localhost:40510');
	private gameSocket:WebSocket;
	private commandButtons:any[] = [];
	private state:string = 'inactive';
	private color:string = 'grey';
	@ViewChild('canvas') private canvas:any;
	private canvansPos:any;
	private ctx:any;
	@ViewChild('messageUl') private messageUl:ElementRef;

	constructor(private userInput: UserInputService) {
		this.commandButtons.push({
			name: 'set name',
			command: 'setName'
		});
		this.commandButtons.push({
			name: 'canvas game',
			command: true
		});
		this.websocket.onopen = () => {
			console.log('websocket is connected ...')
		};
	
		this.websocket.onmessage = ev => {
			const respons = JSON.parse(ev.data);
			console.log(respons);
			if(!(respons.command === undefined)){
				this[respons.command](respons);
			}else{
				console.log(respons.data);
				this.createMessage(respons);
			}
		};

		this.websocket.onclose = () => {
			console.log('socket closed');
		};
	}

	ngOnInit() {
		this.userInput.canvas.subscribe(data => {
			try{
				this.canvas = data;
				this.ctx = this.canvas.getContext('2d');
				console.log(this.canvas);
			}catch(e){}
		});
		this.userInput.currentData.subscribe(data => {
			data['color'] = this. color;
			try{
				this.EmitPost(data);
			}catch(e){}
		});
	}

	CreateNewGame({port}){
		console.log(`New game on port ${port}`);
		this.gameSocket = new WebSocket(`ws://localhost:${port}`);

		this.gameSocket.onmessage = ev => {
			const respons = JSON.parse(ev.data);
			this.color = respons.color;
		};
	}

	EmitPost({x, y, color}:any){
		try{
			this.gameSocket.send(JSON.stringify({
				x,
				y,
				command: 'EmitMousePos'
			}));
		}catch(e){} 
		this.draw({x, y, color});
	}

	draw({x, y, color = this.color}){
		const canvansPos = this.canvas.getBoundingClientRect();
		this.ctx.beginPath();
		this.ctx.arc(x  - canvansPos.left, y - canvansPos.top, 10, 0, 2 * Math.PI, false);
		this.ctx.fillStyle = color;
		this.ctx.fill();
		this.ctx.lineWidth = 5;
		this.ctx.strokeStyle = color;
		this.ctx.stroke();
	}

	setCommand(command:any):void{
		//Todo make dynamic
		if(typeof command === 'string'){
			this.currentCommand = command;
			this.buttonText = this.currentCommand;
		}else{
			this.formatSend({
				command: 'joinGame',
				gameName: 'CanvasGame'
			});
		}
	}

	validateText():void{
		if(this.inputText){
			this.formatSend({
				data: this.inputText,
				command: this.currentCommand
			});
			this.inputText = '';
			this.clearCommand();
		}
	}

	formatSend(object:any):void{
		this.websocket.send(JSON.stringify(object));
	}

	createMessage({data, messenger}):void{
		console.log(data);
		this.messages.push({
			text: data,
			messenger
		});
		//Todo make the list scoll this.messageUl.nativeElement.lastElementChild.scrollIntoView();
	}

	clearCommand():void{
		this.currentCommand = 'sendTo';
		this.buttonText = 'SEND';
	}

	toggleState() {
		this.state = this.state === 'active' ? 'inactive' : 'active';
	}
}
