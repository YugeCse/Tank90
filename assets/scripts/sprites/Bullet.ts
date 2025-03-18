import {
  _decorator,
  BoxCollider2D,
  CCFloat,
  Collider2D,
  Component,
  RigidBody2D,
  Sprite,
  SpriteFrame,
  UITransform,
  Vec2,
} from "cc";
import { SpriteFrameUtils } from "../utils/SpriteFrameUtils";
import { Constants } from "../data/Constants";
import { Direction, DirectionUtils } from "../events/Direction";
import { CollisionMask } from "../data/CollisionMask";
import { Tiled } from "./Tiled";
import { TiledType } from "../data/TiledType";
const { ccclass, property } = _decorator;

@ccclass("Bullet")
export class Bullet extends Component {
  @property({ type: SpriteFrame, displayName: "关联图片" })
  reliantSpriteFrame: SpriteFrame = null;

  @property({ displayName: "子弹方向" })
  direction: Direction = "NONE";

  @property({ type: CCFloat, displayName: "子弹速度" })
  speed: number = 5;

  @property({ type: CCFloat, displayName: "子弹原始尺寸" })
  originSize: number = 5.5;

  /** 子弹是否爆炸，如果爆炸了，就不能移动了 */
  isBomb: boolean = false;

  start() {
    var dirs = DirectionUtils.getValuesWithoutNone();
    var index = dirs.indexOf(this.direction);
    console.log("子弹Offset：", 5 * index, this.direction);
    var spriteFrame = SpriteFrameUtils.getSpriteFrame({
      texture: this.reliantSpriteFrame.texture,
      position: [
        Constants.WarBulletImagePosition.x +
          index * this.originSize +
          (index > 1 ? (index == 3 ? 1.5 : 1) : 0),
        Constants.WarBulletImagePosition.y,
      ],
      size: [this.originSize, this.originSize],
    });
    this.node
      .getComponent(UITransform)
      .setContentSize(
        this.originSize + (index > 1 ? (index == 3 ? 1.5 : 1) : 0),
        this.originSize + (index > 1 ? (index == 3 ? 1.5 : 1) : 0)
      );
    this.node.getComponent(Sprite).spriteFrame = spriteFrame;
    const collider = this.node.getComponent(Collider2D);
    collider.on("begin-contact", this.onCollision, this);
    // 设置子弹运行的方向和速度
    var rigidBody = this.node.getComponent(RigidBody2D);
    var dirVec2 = DirectionUtils.getDirectionNormalize(this.direction);
    rigidBody.linearVelocity = dirVec2.multiplyScalar(this.speed);
  }

  onCollision(selfCollider: Collider2D, otherCollider: Collider2D) {
    if (otherCollider.group == CollisionMask.WorldBoundary) {
      selfCollider.enabled = false; // 碰撞到边界，就停止碰撞检测
      this.bombThenDestroy();
    } else if (otherCollider.group == CollisionMask.Obstacle) {
      var otherNode = otherCollider.node;
      if (!otherNode) return;
      var tiledType = otherNode.getComponent(Tiled).tiledType;
      var canDestroy =
        tiledType != TiledType.grid &&
        tiledType != TiledType.river &&
        tiledType != TiledType.grass &&
        tiledType != TiledType.ice;
      console.log("碰撞了墙  是否能被销毁：", canDestroy);
      selfCollider.enabled = false;
      if (canDestroy) otherCollider.enabled = false;
      this.scheduleOnce(() => {
        if (this.node) this.bombThenDestroy();
        if (canDestroy && otherNode) otherNode.destroy();
      });
    }
    console.log(
      "子弹碰撞: ",
      selfCollider.node.getComponent(BoxCollider2D).group,
      otherCollider.node.getComponent(BoxCollider2D).group
    );
  }

  update(deltaTime: number) {
    if (
      !this.isBomb &&
      (this.node.position.x <= -Constants.WarMapSize / 2 ||
        this.node.position.x >= Constants.WarMapSize / 2 ||
        this.node.position.y <= -Constants.WarMapSize / 2 ||
        this.node.position.y >= Constants.WarMapSize / 2)
    ) {
      this.bombThenDestroy(); //爆炸并销毁
      return;
    }
  }

  /** 子弹爆炸，并销毁 */
  bombThenDestroy() {
    this.getComponent(RigidBody2D).linearVelocity = Vec2.ZERO;
    var spriteObj = this.node.getComponent(Sprite);
    spriteObj.spriteFrame = SpriteFrameUtils.getSpriteFrame({
      texture: this.reliantSpriteFrame.texture,
      position: [
        Constants.WarBulletBombImagePosition.x,
        Constants.WarBulletBombImagePosition.y,
      ],
      size: [Constants.TileBigSize, Constants.TileBigSize],
    });
    this.isBomb = true; // 标识子弹爆炸了
    this.scheduleOnce(() => {
      if (this.node) this.node.destroy(); //销毁子弹
    }, 0.15);
  }
}
