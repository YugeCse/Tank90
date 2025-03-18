import {
  _decorator,
  BoxCollider2D,
  CCInteger,
  Collider2D,
  Component,
  resources,
  RigidBody2D,
  Sprite,
  SpriteFrame,
} from "cc";
import { TiledType } from "../data/TiledType";
import { SpriteFrameUtils } from "../utils/SpriteFrameUtils";
import { Constants } from "../data/Constants";
const { ccclass, property } = _decorator;

@ccclass("Tiled")
export class Tiled extends Component {
  @property({ type: SpriteFrame, displayName: "关联图片" })
  reliantSpriteFrame: SpriteFrame = null;

  /** 地砖类型 */
  @property({ type: CCInteger, min: 0, max: 5, displayName: "地砖类型" })
  tiledType: number = TiledType.unknown;

  /**
   * 设置地砖类型
   * @param type 地砖类型
   */
  setTiledType(type: number) {
    this.tiledType = type;
    console.log(`设置地砖类型：${type}, ${TiledType.getDescription(type)}`);
  }

  start() {
    this.loadSpriteFrame(); // 加载精灵帧
  }

  // 加载精灵帧
  private loadSpriteFrame(type: number = this.tiledType) {
    if (TiledType.all.every((item) => item !== type)) {
      this.node.getComponent(RigidBody2D).enabledContactListener = false;
      return; // 默认类型不加载且不启用碰撞模式
    }
    this.node.getComponent(Sprite).spriteFrame =
      SpriteFrameUtils.getSpriteFrame({
        texture: this.reliantSpriteFrame.texture,
        position: [
          (type - 1) * Constants.TiledSize,
          Constants.WarMapTiledImagePosition.y,
        ],
        size: [Constants.TiledSize, Constants.TiledSize],
      });
    console.log(`加载地砖：${type} 成功！`); //加载地砖成功
  }

  update(deltaTime: number) {}
}
