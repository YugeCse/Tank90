import {
  _decorator,
  BoxCollider2D,
  CCFloat,
  Collider2D,
  Component,
  RigidBody2D,
  Sprite,
  SpriteFrame,
  Vec2,
  UITransform,
  Vec3,
} from "cc";
import { SpriteFrameUtils } from "../utils/SpriteFrameUtils";
import { Constants } from "../data/Constants";
import { Direction } from "../events/Direction";
import { CollisionMask } from "../data/CollisionMask";
import { Tiled } from "./Tiled";
import { TiledType } from "../data/TiledType";
const { ccclass, property } = _decorator;

@ccclass("Bullet")
export class Bullet extends Component {
  @property({ type: SpriteFrame, displayName: "关联图片" })
  reliantSpriteFrame: SpriteFrame = null;

  @property({ type: Vec2, displayName: "子弹方向" })
  direction: Vec2 = new Vec2(0, 0);

  @property({ type: CCFloat, displayName: "子弹速度" })
  speed: number = 100;

  @property({ type: CCFloat, displayName: "子弹的尺寸" })
  originSize: number = 6;

  start() {
    var dirs = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
    var index = dirs.indexOf(this.direction);
    var spriteFrame = SpriteFrameUtils.getSpriteFrame({
      texture: this.reliantSpriteFrame.texture,
      position: [
        Constants.WarBulletImagePosition.x + index * this.originSize,
        Constants.WarBulletImagePosition.y,
      ],
      size: [this.originSize, this.originSize],
    });
    this.node
      .getComponent(UITransform)
      .setContentSize(this.originSize, this.originSize);
    this.node.getComponent(Sprite).spriteFrame = spriteFrame;
    const collider = this.node.getComponent(Collider2D);
    collider.on("begin-contact", this.onCollision, this);
  }

  onCollision(selfCollider: Collider2D, otherCollider: Collider2D) {
    if (otherCollider.group == CollisionMask.Obstacle) {
      this.scheduleOnce(() => {
        // selfCollider.node.getComponent(RigidBody2D).enabledContactListener =
        //   false;
        // otherCollider.node.getComponent(RigidBody2D).enabledContactListener =
        //   false;
        var tiledType = otherCollider.node.getComponent(Tiled).tiledType;
        var canDestroy =
          tiledType != TiledType.grid &&
          tiledType != TiledType.river &&
          tiledType != TiledType.grass &&
          tiledType != TiledType.ice;
        console.log("碰撞了墙  是否能被销毁：", canDestroy);
        this.node.destroy();
        if (!canDestroy) return;
        otherCollider.node.destroy();
      }, 0.1);
    }
    console.log(
      "子弹碰撞: ",
      selfCollider.node.getComponent(BoxCollider2D).group,
      otherCollider.node.getComponent(BoxCollider2D).group
    );
  }

  update(deltaTime: number) {
    if (
      this.node.position.x <= -Constants.WarMapSize / 2 ||
      this.node.position.x >= Constants.WarMapSize / 2 ||
      this.node.position.y <= -Constants.WarMapSize / 2 ||
      this.node.position.y >= Constants.WarMapSize / 2
    ) {
      this.node.destroy();
      return;
    }
    // const rigidBody = this.node.getComponent(RigidBody2D);
    // rigidBody.linearVelocity = this.direction.multiplyScalar(
    //   this.speed * deltaTime
    // );
    this.node.setPosition(
      new Vec3(
        this.node.position.x + this.direction.x * this.speed * deltaTime,
        this.node.position.y + this.direction.y * this.speed * deltaTime
      )
    );
  }
}
