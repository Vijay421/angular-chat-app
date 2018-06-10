import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';

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
	private canvansPos:DOMRect;
	private ctx:any;
	@ViewChild('messageUl') private messageUl:ElementRef;

	constructor() {
		window['ws'] = this.websocket;
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
				this.createMessage(respons.data, respons.messenger);
			}
		};

		this.websocket.onclose = () => {
			console.log('socket closed');
		};
	}

	ngOnInit() {
		this.ctx = this.canvas.nativeElement.getContext('2d');
	}

	CreateNewGame({port}){
		console.log(`New game on port ${port}`);
		this.gameSocket = new WebSocket(`ws://localhost:${port}`);
		window['gameSocket'] = this.gameSocket;

		this.gameSocket.onmessage = ev => {
			const respons = JSON.parse(ev.data);
			this.color = respons.color;
			console.log(respons);
		};
	}

	EmitPost(event){
		try{
			this.gameSocket.send(JSON.stringify({
				x: event.x, 
				y: event.y,
				command: 'EmitMousePos'
			}));
		}catch(e){}
		const param = {x: event.x, y: event.y, color: this.color}; 
		this.draw(param);
	}

	draw({x, y, color}){
		this.canvansPos = this.canvas.nativeElement.getBoundingClientRect();
		this.ctx.beginPath();
		this.ctx.arc(x  - this.canvansPos.left, y - this.canvansPos.top, 10, 0, 2 * Math.PI, false);
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
