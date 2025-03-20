import {
	_decorator,
	Animation,
	Component,
	director,
	EventKeyboard,
	Input,
	input,
	KeyCode,
	Node,
	Sprite,
	SpriteFrame,
} from "cc";
import { SpriteFrameUtils } from "../utils/SpriteFrameUtils";
const { ccclass, property } = _decorator;

@ccclass("MenuScene")
export class MenuScene extends Component {

	@property({ type: SpriteFrame, displayName: "关联图片" })
	reliantSpriteFrame: SpriteFrame = null;

	start() {
		var animation = this.node.children
			.filter(child => child.name === "Menu")[0]
			.getComponent(Animation) as Animation;
		animation.on(Animation.EventType.FINISHED,
			this.onAnimationFinished, this, true);
		animation.play("welcome");
		input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
	}

	private onAnimationFinished() {
		console.log("Animation finished");
		var selectTank = this.node.children
			.filter(child => child.name === "SelectTank")[0]
			.getComponent(Sprite) as Sprite;
		selectTank.spriteFrame = SpriteFrameUtils.clip({
			clipSize: [27, 28],
			position: [128, 96],
			texture: this.reliantSpriteFrame.texture,
		});
	}

	update(deltaTime: number) { }

	onKeyDown(event: EventKeyboard) {
		if (event.keyCode === KeyCode.ENTER || event.keyCode === KeyCode.SPACE) {
			director.loadScene("MainScene"); // 加载主场景
		}
	}

}
