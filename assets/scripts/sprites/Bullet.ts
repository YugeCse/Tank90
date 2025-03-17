import {
  _decorator,
  BoxCollider2D,
  CCFloat,
  Collider2D,
  Component,
  Node,
  resources,
  RigidBody2D,
  Sprite,
  SpriteFrame,
  Vec2,
  Vec3,
  PhysicsSystem,
} from "cc";
import { SpriteFrameUtils } from "../utils/SpriteFrameUtils";
import { Constants } from "../data/Constants";
import { Direction } from "../events/Direction";
import { CollisionMask } from "../data/CollisionMask";
const { ccclass, property } = _decorator;

@ccclass("Bullet")
export class Bullet extends Component {
  @property({ type: Vec2, displayName: "子弹方向" })
  direction: Vec2 = new Vec2(0, 0);

  @property({ type: CCFloat, displayName: "子弹速度" })
  speed: number = 100;

  @property({ type: CCFloat, displayName: "子弹的尺寸" })
  originSize: number = 6;

  start() {
    resources.load(
      "images/tank_all/spriteFrame",
      SpriteFrame,
      (err, spriteFrame) => {
        if (err) {
          console.log("加载子弹图片失败: ", err);
          return;
        }
        var dirs = [
          Direction.UP,
          Direction.DOWN,
          Direction.LEFT,
          Direction.RIGHT,
        ];
        var index = dirs.indexOf(this.direction);
        SpriteFrameUtils.getSpriteFrame({
          texture: spriteFrame.texture,
          position: [
            Constants.WarBulletImagePosition.x + index * this.originSize,
            Constants.WarBulletImagePosition.y,
          ],
          size: [this.originSize, this.originSize],
        });
        this.node.getComponent(Sprite).spriteFrame = spriteFrame;
      }
    );
    const collider = this.node.getComponent(Collider2D);
    collider.on("begin-contact", this.onCollision, this);
  }

  onCollision(selfCollider: Collider2D, otherCollider: Collider2D) {
    if (otherCollider.group == CollisionMask.Obstacle) {
      console.log("碰撞了墙");
      this.scheduleOnce(() => {
        selfCollider.node.getComponent(RigidBody2D).enabledContactListener =
          false;
        otherCollider.node.getComponent(RigidBody2D).enabledContactListener =
          false;
        this.node.destroy();
        otherCollider.node.destroy();
      }, 0.1);
      return;
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
    this.node.setPosition(
      new Vec3(
        this.node.position.x + this.direction.x * this.speed * deltaTime,
        this.node.position.y + this.direction.y * this.speed * deltaTime
      )
    );
  }
}
