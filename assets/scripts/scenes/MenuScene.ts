import {
	_decorator,
	Component,
	director,
	EventKeyboard,
	Input,
	input,
	KeyCode,
	Node,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("MenuScene")
export class MenuScene extends Component {
	start() {
		input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
	}

	update(deltaTime: number) {}

	onKeyDown(event: EventKeyboard) {
		if (event.keyCode === KeyCode.ENTER || event.keyCode === KeyCode.SPACE) {
			director.loadScene("MainScene"); // 加载主场景
		}
	}
    
}
