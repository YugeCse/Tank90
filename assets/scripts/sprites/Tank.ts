import {
  _decorator,
  BoxCollider2D,
  CCFloat,
  CCInteger,
  Collider2D,
  Component,
  director,
  ERaycast2DType,
  EventKeyboard,
  Input,
  input,
  instantiate,
  KeyCode,
  macro,
  math,
  PhysicsSystem2D,
  Prefab,
  RigidBody2D,
  Scheduler,
  Sprite,
  SpriteFrame,
  UITransform,
  Vec2,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;
import { Direction, DirectionUtils } from "../events/Direction";
import { Constants } from "../data/Constants";
import { SpriteFrameUtils } from "../utils/SpriteFrameUtils";
import { Bullet } from "./Bullet";
import { CollisionMask } from "../data/CollisionMask";

/** 坦克精灵 */
@ccclass("Tank")
export class Tank extends Component {
  @property({ type: SpriteFrame, displayName: "关联图片" })
  reliantSpriteFrame: SpriteFrame = null;

  /** 子弹预制体 */
  @property({ type: Prefab, displayName: "子弹预制体" })
  bulletPrefab: Prefab = null;

  /** 生命值 */
  @property({ type: CCInteger, displayName: "生命值" })
  life: number = 1;

  /** 速度 */
  @property({ type: CCFloat, displayName: "速度" })
  speed: number = 3;

  /** 能承受共计次数 */
  @property({ type: CCInteger, displayName: "抗打次数" })
  numOfHitReceived: number = 1;

  /** 移动方向 */
  @property({ displayName: "移动方向" })
  direction: Direction = "UP";

  /** 是否使用Ai自动移动 */
  @property({ displayName: "AI自动移动" })
  useAiMove: boolean = false;

  /** 上次开火的时间 */
  private _lastFireTimeMillis: number = 0;

  /** 上次改变方向的时间, 必须大于1000才能改变方向 */
  private _lastAiChangeDirectionTimeMillis: number = 0;

  /** 被按下的按键 */
  private _keyPressed: Set<KeyCode> = new Set<KeyCode>();

  /** 精灵帧集合 */
  private _spriteFrames: Map<Direction, SpriteFrame> = new Map();

  start() {
    this.loadSpriteFrames(0, 0); // 加载精灵帧
    const rigidBody = this.node.getComponent(RigidBody2D);
    const collider = this.node.getComponent(BoxCollider2D);
    if (this.useAiMove) {
      rigidBody.group = CollisionMask.EnemyTank;
      collider.group = CollisionMask.EnemyTank;
    }
    collider.on("begin-contact", this.onCollision, this);
    if (this.useAiMove) {
      Scheduler.enableForTarget(this);
      director
        .getScheduler()
        .schedule(this.smartMove, this, 1, macro.REPEAT_FOREVER, 0, false);
    } else {
      input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
      input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }
  }

  onCollision(selfCollider: Collider2D, otherCollider: Collider2D) {}

  // 加载精灵帧
  private loadSpriteFrames(imgPosX: number, imgPosY: number) {
    // 遍历方向数组
    var dirs = DirectionUtils.getValuesWithoutNone();
    // 获取精灵帧的纹理
    var texture = this.reliantSpriteFrame.texture;
    for (var index = 0; index < dirs.length; index++) {
      var dir = dirs[index];
      // 根据纹理和索引创建精灵帧
      var spriteFrame = SpriteFrameUtils.getSpriteFrame({
        texture: texture,
        size: [Constants.TileBigSize, Constants.TileBigSize],
        position: [imgPosX + index * Constants.TileBigSize, imgPosY],
      });
      if (index == 0) {
        this.node.getComponent(Sprite).spriteFrame = spriteFrame;
      }
      // 将精灵帧存入精灵帧集合中
      this._spriteFrames.set(dir, spriteFrame);
      console.log("Message: Loaded SpriteFrame ", index, dir); // 输出加载成功的精灵帧
    }
    this.node
      .getComponent(UITransform)
      .setContentSize(Constants.TileBigSize, Constants.TileBigSize);
    this.schedule(this.useAiMove, 1);
    console.log("Message: Loaded SpriteFrame Successfully"); // 输出加载成功的精灵帧
  }

  update(deltaTime: number) {}

  /**
   * 开火、射击
   * @param direction 射击方向
   */
  shoot(direction: Direction) {
    console.log("fire");
    if (this.bulletPrefab == null) {
      console.log("错误：子弹预制体为NULL");
      return;
    }
    var directionVec2 = DirectionUtils.getDirectionNormalize(direction);
    var tankSize = this.node.getComponent(UITransform).contentSize;
    var rootNode = instantiate(this.bulletPrefab);
    var deltaPosition = new Vec3(
      (directionVec2.x * tankSize.width) / 2,
      (directionVec2.y * tankSize.height) / 2
    );
    rootNode.setPosition(this.node.position.clone().add(deltaPosition));
    var bulletNode = rootNode.getComponent(Bullet);
    bulletNode.direction = direction;
    if (this.useAiMove) {
      rootNode.getComponent(BoxCollider2D).group = CollisionMask.EnemyBullet;
      rootNode.getComponent(RigidBody2D).group = CollisionMask.EnemyBullet;
    }
    this.node.parent.addChild(rootNode); //子弹追加到界面中
  }

  setSpriteLinearVelocity(direction: Direction) {
    var rigidBody = this.getComponent(RigidBody2D);
    var dirVec2 = DirectionUtils.getDirectionNormalize(direction);
    rigidBody.linearVelocity =
      direction == "NONE" ? Vec2.ZERO : dirVec2.multiplyScalar(this.speed);
  }

  smartMove() {
    var curTimeMillis = Date.now();
    if (
      this.direction != "NONE" &&
      math.random() < 0.3 &&
      curTimeMillis - this._lastFireTimeMillis > 1000
    ) {
      this.shoot(this.direction);
      this._lastFireTimeMillis = curTimeMillis;
    }
    var futureDirection = DirectionUtils.generateRandomDirection();
    if (futureDirection != "NONE") {
      this.direction = futureDirection;
      this.setSpriteFrameByDirection(this.direction);
    }
    this.setSpriteLinearVelocity(this.direction);
  }

  playerMove(direction: Direction) {
    this.direction = direction;
    this.node.getComponent(Sprite).spriteFrame =
      this._spriteFrames.get(direction);
    this.setSpriteLinearVelocity(direction);
  }

  /** 根据方向修改要展示的图片帧 */
  private setSpriteFrameByDirection(direction: Direction) {
    let sprite = this.node.getComponent(Sprite);
    sprite.spriteFrame = this._spriteFrames.get(direction);
  }

  findRouteByRaycast(target: Vec2): Boolean {
    var raycastResult = PhysicsSystem2D.instance.raycast(
      this.node.position,
      target,
      ERaycast2DType.Closest
    );
    return raycastResult.length > 0;
  }

  // 当键盘按下时触发
  onKeyDown(event: EventKeyboard) {
    if (event.keyCode == KeyCode.KEY_W || event.keyCode == KeyCode.ARROW_UP) {
      this.playerMove("UP");
    } else if (
      event.keyCode == KeyCode.KEY_S ||
      event.keyCode == KeyCode.ARROW_DOWN
    ) {
      this.playerMove("DOWN");
    } else if (
      event.keyCode == KeyCode.KEY_A ||
      event.keyCode == KeyCode.ARROW_LEFT
    ) {
      this.playerMove("LEFT");
    } else if (
      event.keyCode == KeyCode.KEY_D ||
      event.keyCode == KeyCode.ARROW_RIGHT
    ) {
      this.playerMove("RIGHT");
    }
    if (
      event.keyCode == KeyCode.SPACE ||
      event.keyCode == KeyCode.KEY_J ||
      event.keyCode == KeyCode.KEY_K
    ) {
      this.shoot(this.direction); // 发射子弹
    }
    this._keyPressed.add(event.keyCode); // 添加按键到集合中
  }

  // 当键盘按键松开时触发
  onKeyUp(event: EventKeyboard) {
    // 如果松开的按键是W、上箭头、S、下箭头、A、左箭头、D、右箭头
    if (
      event.keyCode == KeyCode.KEY_W ||
      event.keyCode == KeyCode.ARROW_UP ||
      event.keyCode == KeyCode.KEY_S ||
      event.keyCode == KeyCode.ARROW_DOWN ||
      event.keyCode == KeyCode.KEY_A ||
      event.keyCode == KeyCode.ARROW_LEFT ||
      event.keyCode == KeyCode.KEY_D ||
      event.keyCode == KeyCode.ARROW_RIGHT
    ) {
      this.node.getComponent(RigidBody2D).linearVelocity = Vec2.ZERO;
      // 从按键按下集合中删除该按键
      this._keyPressed.delete(event.keyCode);
    }
  }
  onDestroy() {
    if (!this.useAiMove) return;
    director.getScheduler().unschedule(this.smartMove, this);
  }
}
