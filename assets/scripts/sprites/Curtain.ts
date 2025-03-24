import { _decorator, Animation, CCInteger, Component, Node, Prefab, Vec3 } from "cc";
import { NumText } from "./NumText";
const { ccclass, property } = _decorator;

/** 关卡幕布控制类 */
@ccclass("Curtain")
export class Curtain extends Component {
  @property({ type: CCInteger, displayName: "关卡" })
  public stageNum: number = 1; //关卡

  start() {
    this.scheduleOnce(this.openCurtains, 2); //等待2s后打开幕布
  }

  update(deltaTime: number) { }

  /** 设置关卡展示 */
  public setStage(stageNum: number) {
    this.stageNum = stageNum;
    this.node.getChildByName("TitleContainer")
      .getChildByName("StageLevelText")
      .getComponent(NumText)
      .setNumber(this.stageNum);
  }

  /** 打开幕布 */
  public openCurtains() {
    var topAnimation = this.node
      .getChildByName("TopCurtain")
      .getComponent(Animation);
    var bottomAnimation = this.node
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
    this.node.getChildByName("TitleContainer").destroy();
  }

  /** 当幕布打开完成事件 */
  public onCurtainOpenFinished() {
    this.node.destroy(); //销毁这个节点
  }
}
