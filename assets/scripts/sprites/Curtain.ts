import { _decorator, Animation, Component, Node } from "cc";
const { ccclass, property } = _decorator;

/** 关卡幕布控制类 */
@ccclass("Curtain")
export class Curtain extends Component {
	start() {
		this.scheduleOnce(this.openCurtains, 2); //等待2s后打开幕布
	}

	update(deltaTime: number) {}

    /** 打开幕布 */
	public openCurtains() {
		var topAnimation = this.node
			.getChildByName("Mask")
			.getChildByName("TopCurtain")
			.getComponent(Animation);
		var bottomAnimation = this.node
			.getChildByName("Mask")
			.getChildByName("BottomCurtain")
			.getComponent(Animation);
		bottomAnimation.on(
			Animation.EventType.FINISHED,
			this.onCurtainOpenFinished,
			this,
			true
		);
		topAnimation.play("curtain_top_open");
		bottomAnimation.play("curtain_bottom_open");
		this.node.getChildByName("Mask").getChildByName("TitleContainer").destroy();
	}

    /** 当幕布打开完成事件 */
	public onCurtainOpenFinished() {
		this.node.destroy(); //销毁这个节点
	}
}
