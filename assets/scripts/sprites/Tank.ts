import {
  _decorator,
  BoxCollider2D,
  CCFloat,
  CCInteger,
  Collider2D,
  Component,
  ERaycast2DType,
  EventKeyboard,
  Input,
  input,
  instantiate,
  KeyCode,
  math,
  PhysicsSystem2D,
  Prefab,
  RigidBody2D,
  Sprite,
  SpriteFrame,
  UITransform,
  Vec2,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;
import { Direction } from "../events/Direction";
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
  speed: number = 80;

  /** 能承受共计次数 */
  @property({ type: CCInteger, displayName: "抗打次数" })
  numOfHitReceived: number = 1;

  /** 移动方向 */
  @property({ type: CCInteger, displayName: "移动方向" })
  direction: Vec2 = Direction.UP;

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
  private _spriteFrames: Map<String, SpriteFrame> = new Map();

  start() {
    this.loadSpriteFrames(0, 0); // 加载精灵帧
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    const collider = this.node.getComponent(BoxCollider2D);
    collider.on("begin-contact", this.onCollision, this);
    if (this.useAiMove) collider.group = CollisionMask.EnemyTank;
    const rigidBody = this.node.getComponent(RigidBody2D);
    if (this.useAiMove) rigidBody.group = CollisionMask.EnemyTank;
  }

  onCollision(selfCollider: Collider2D, otherCollider: Collider2D) {}

  // 加载精灵帧
  private loadSpriteFrames(imgPosX: number, imgPosY: number) {
    // 遍历方向数组
    var dirs = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
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
      console.log("Message: Loaded SpriteFrame ", index); // 输出加载成功的精灵帧
      // 将精灵帧存入精灵帧集合中
      this._spriteFrames.set(Direction.getDirectionDesc(dir), spriteFrame);
    }
    this.node
      .getComponent(UITransform)
      .setContentSize(Constants.TileBigSize, Constants.TileBigSize);
    console.log("Message: Loaded SpriteFrame Successfully"); // 输出加载成功的精灵帧
  }

  update(deltaTime: number) {
    if (!this.useAiMove) {
      this.move(deltaTime, this.direction); // 移动人物
    } else {
      var curTimeMillis = Date.now();
      if (curTimeMillis - this._lastAiChangeDirectionTimeMillis > 1000) {
        this.direction = Direction.generateRandomDirection();
        this._lastAiChangeDirectionTimeMillis = curTimeMillis;
      }
      if (
        this.direction != Direction.NONE &&
        curTimeMillis - this._lastFireTimeMillis > 1000 &&
        math.random() < 0.5
      ) {
        this.fire(this.direction.clone()); //50%的概率开火
        this._lastFireTimeMillis = curTimeMillis;
      }
      this.move(deltaTime, this.direction, true); // 移动人物
    }
  }

  /**
   * 开火
   * @param direction 开火方向
   */
  fire(direction: Vec2) {
    console.log("fire");
    if (this.bulletPrefab == null) {
      console.log("错误：子弹预制体为NULL");
      return;
    }
    var tankSize = this.node.getComponent(UITransform).contentSize;
    var rootNode = instantiate(this.bulletPrefab);
    var deltaPosition = new Vec3(
      (direction.x * tankSize.width) / 2,
      (direction.y * tankSize.height) / 2
    );
    rootNode.setPosition(this.node.position.clone().add(deltaPosition));
    var bulletNode = rootNode.children[0].getComponent(Bullet);
    bulletNode.direction = direction.clone();
    if (this.useAiMove) {
      rootNode.children[0].getComponent(BoxCollider2D).group =
        CollisionMask.EnemyBullet;
      rootNode.children[0].getComponent(RigidBody2D).group =
        CollisionMask.EnemyBullet;
    }
    this.node.parent.addChild(rootNode); //子弹追加到界面中
  }

  // 根据传入的时间间隔和方向，移动节点
  move(deltaTime: number, direction: Vec2, isAutoMove: boolean = false) {
    // 如果按下了W、上箭头、S、下箭头、A、左箭头、D、右箭头中的任意一个键
    if (
      isAutoMove ||
      (!isAutoMove &&
        (this._keyPressed.has(KeyCode.KEY_W) ||
          this._keyPressed.has(KeyCode.ARROW_UP) ||
          this._keyPressed.has(KeyCode.KEY_S) ||
          this._keyPressed.has(KeyCode.ARROW_DOWN) ||
          this._keyPressed.has(KeyCode.KEY_A) ||
          this._keyPressed.has(KeyCode.ARROW_LEFT) ||
          this._keyPressed.has(KeyCode.KEY_D) ||
          this._keyPressed.has(KeyCode.ARROW_RIGHT)))
    ) {
      if (isAutoMove && direction != Direction.NONE) {
        let sprite = this.node.getComponent(Sprite);
        let dirDesc = Direction.getDirectionDesc(direction);
        sprite.spriteFrame = this._spriteFrames.get(dirDesc);
      }
      // 将节点的位置加上速度乘以时间间隔乘以方向
      let targetPosX =
        this.node.position.x + this.speed * deltaTime * direction.x;
      let targetPosY =
        this.node.position.y + this.speed * deltaTime * direction.y;
      // var targetPos = new Vec2(targetPosX, targetPosY);
      // targetPos = this.findRouteByRaycast(direction, targetPos);
      this.node.setPosition(
        new Vec2(targetPosX, targetPosY)
          .toVec3()
          .clampf(
            new Vec3(
              -Constants.WarMapSize / 2 + Constants.TiledSize,
              -Constants.WarMapSize / 2 + Constants.TiledSize
            ),
            new Vec3(
              Constants.WarMapSize / 2 - Constants.TiledSize,
              Constants.WarMapSize / 2 - Constants.TiledSize
            )
          )
      ); // 将节点的位置限制在地图范围内
    }
  }

  findRouteByRaycast(direction: Vec2, target: Vec2): Vec2 {
    if (direction == Direction.NONE) return direction;
    var raycastResult = PhysicsSystem2D.instance.raycast(
      this.node.position,
      target,
      ERaycast2DType.All
    );
    if (raycastResult.length > 0) {
      for (let i = 0; i < raycastResult.length; i++) {
        if (raycastResult[i].point) {
          return this.node.position
            .clone()
            .add(raycastResult[i].point.toVec3())
            .toVec2();
        }
      }
    }
    return target;
  }

  // 当键盘按下时触发
  onKeyDown(event: EventKeyboard) {
    // 如果按下的键是W或向上箭头
    if (event.keyCode == KeyCode.KEY_W || event.keyCode == KeyCode.ARROW_UP) {
      // 设置方向为向上
      this.direction = Direction.UP;
      // 设置精灵帧为向上的精灵帧
      this.node.getComponent(Sprite).spriteFrame = this._spriteFrames.get(
        Direction.getDirectionDesc(Direction.UP)
      );
      // 如果按下的键是S或向下箭头
    } else if (
      event.keyCode == KeyCode.KEY_S ||
      event.keyCode == KeyCode.ARROW_DOWN
    ) {
      // 设置方向为向下
      this.direction = Direction.DOWN;
      // 设置精灵帧为向下的精灵帧
      this.node.getComponent(Sprite).spriteFrame = this._spriteFrames.get(
        Direction.getDirectionDesc(Direction.DOWN)
      );
      // 如果按下的键是A或向左箭头
    } else if (
      event.keyCode == KeyCode.KEY_A ||
      event.keyCode == KeyCode.ARROW_LEFT
    ) {
      // 设置方向为向左
      this.direction = Direction.LEFT;
      // 设置精灵帧为向左的精灵帧
      this.node.getComponent(Sprite).spriteFrame = this._spriteFrames.get(
        Direction.getDirectionDesc(Direction.LEFT)
      );
      // 如果按下的键是D或向右箭头
    } else if (
      event.keyCode == KeyCode.KEY_D ||
      event.keyCode == KeyCode.ARROW_RIGHT
    ) {
      // 设置方向为向右
      this.direction = Direction.RIGHT;
      // 设置精灵帧为向右的精灵帧
      this.node.getComponent(Sprite).spriteFrame = this._spriteFrames.get(
        Direction.getDirectionDesc(Direction.RIGHT)
      );
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
      // 从按键按下集合中删除该按键
      this._keyPressed.delete(event.keyCode);
    }
  }
}
