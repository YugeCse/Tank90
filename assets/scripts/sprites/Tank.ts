import {
	_decorator,
	Animation,
	AnimationClip,
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
	Node,
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
import { Direction, DirectionUtils } from "../data/Direction";
import { Constants } from "../data/Constants";
import { SpriteFrameUtils } from "../utils/SpriteFrameUtils";
import { Bullet } from "./Bullet";
import { CollisionMask } from "../data/CollisionMask";
import { AudioManager } from "../manager/AudioManager";
import EventManager from "../manager/EventManager";
import { GlobalEvent } from "../data/GlobalEvent";

/** 坦克精灵 */
@ccclass("Tank")
export class Tank extends Component {
	/** 默认速度 */
	public static readonly DEFAULT_SPEED = 3;

	/** 英雄坦克 */
	public static readonly TYPE_HERO_TANK = 0;

	/** 敌方坦克-样式1 */
	public static readonly TYPE_ENEMY1_TANK = 1;

	/** 敌方坦克-样式2 */
	public static readonly TYPE_ENEMY2_TANK = 2;

	/** 敌方坦克-样式3 */
	public static readonly TYPE_ENEMY3_TANK = 3;

	@property({ type: SpriteFrame, displayName: "关联图片" })
	reliantSpriteFrame: SpriteFrame = null;

	/** 子弹预制体 */
	@property({ type: Prefab, displayName: "子弹预制体" })
	bulletPrefab: Prefab = null;

	/** 坦克类型 */
	@property({ type: CCInteger, displayName: "类型" })
	tankType: number = 0;

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

	/** 是否是出生状态 */
	private _isBornState: boolean = true;

	/** 上次开火的时间 */
	private _lastFireTimeMillis: number = 0;

	/** 被按下的按键 */
	private _keyPressed: Set<KeyCode> = new Set<KeyCode>();

	/** 精灵帧集合 */
	private _spriteFrames: Map<Direction, SpriteFrame> = new Map();

	/** 初始化 */
	start() {
		const rigidBody = this.node.getComponent(RigidBody2D);
		const collider = this.node.getComponent(BoxCollider2D);
		rigidBody.enabled = false;
		collider.enabled = false;
		if (this.useAiMove) {
			this.direction = "DOWN";
			rigidBody.group = CollisionMask.EnemyTank;
			collider.group = CollisionMask.EnemyTank;
		}
		collider.on("begin-contact", this.onCollision, this);
		this.showBornEffect(); //显示出生效果视图
	}

	/** 初始化显示坦克，并配置一些事件 */
	private initShowTank() {
		this._isBornState = false; // 设置为非出生状态
		var imgStartPos = this.getTankSpriteStartPosition(this.tankType);
		this.loadSpriteFrames(imgStartPos.x, imgStartPos.y); // 加载精灵帧
		this.getComponent(Collider2D).enabled = true;
		this.getComponent(RigidBody2D).enabled = true; // 开启刚体和碰撞器
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

	/**
	 * 获取不同类型的坦克的Sprite起始位置
	 * @param tankType 坦克类型
	 * @returns 坦克精灵图片的起始位置
	 */
	private getTankSpriteStartPosition(tankType: number) {
		if (tankType == Tank.TYPE_HERO_TANK) {
			return new Vec2(0, 0);
		} else if (tankType == Tank.TYPE_ENEMY3_TANK) {
			return Constants.enemy3ImagePosition;
		} else if (tankType == Tank.TYPE_ENEMY2_TANK) {
			return Constants.enemy2ImagePosition;
		}
		return Constants.enemy1ImagePosition;
	}

	/** 加载精灵帧 */
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
		console.log("Message: Loaded SpriteFrame Successfully"); // 输出加载成功的精灵帧
	}

	update(deltaTime: number) {
		if (this._isBornState || !this.useAiMove) return;
		this.randomShoot(); // 随机射击
	}

	/** 随机射击、开火 */
	private randomShoot(timeSpan: number = 1000) {
		var curTimeMillis = Date.now();
		if (
			math.random() < 0.3 &&
			curTimeMillis - this._lastFireTimeMillis > timeSpan
		) {
			if (this.direction != "NONE") {
				this.shoot(this.direction);
			}
			this._lastFireTimeMillis = curTimeMillis;
		}
	}

	/**
	 * 开火、射击
	 * @param direction 射击方向
	 */
	private shoot(direction: Direction) {
		console.log("fire");
		if (this.bulletPrefab == null) {
			console.log("错误：子弹预制体为NULL");
			return;
		}
		if (direction == "NONE") return; // 如果方向为NONE，则不发射子弹
		var bullet = Bullet.create({
			prefab: this.bulletPrefab,
			tankAnchor: this.node,
		});
		this.node.parent.addChild(bullet); //子弹追加到界面中
		if (!this.useAiMove) AudioManager.Instance.playAttackAudio(); //播放攻击音效
	}

	/** 设置精灵的线性速度 */
	private setSpriteLinearVelocity(direction: Direction) {
		var rigidBody = this.getComponent(RigidBody2D);
		var dirVec2 = DirectionUtils.getNormailized(direction);
		rigidBody.linearVelocity =
			direction == "NONE" ? Vec2.ZERO : dirVec2.multiplyScalar(this.speed);
	}

	/** 智能移动 */
	private smartMove() {
		var futureDirection = DirectionUtils.generateRandomDirection();
		if (futureDirection != "NONE") {
			this.direction = futureDirection;
			this.setSpriteFrameByDirection(this.direction);
		}
		this.setSpriteLinearVelocity(this.direction);
	}

	/** 玩家移动 */
	private playerMove(direction: Direction) {
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
		if (this._isBornState) return;
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
		if (this.useAiMove) {
			console.log("敌方坦克销毁！！！");
			EventManager.Instance.postEvent(
				GlobalEvent.ENEMY_TANK_DIE,
				this.tankType
			);
			director.getScheduler().unschedule(this.smartMove, this);
		} else {
			EventManager.Instance.postEvent(GlobalEvent.HERO_TANK_DIE, this.tankType);
		}
	}

	/** 显示出生时的特效 */
	private showBornEffect() {
		var sprites = new Array<SpriteFrame>();
		var posX = Constants.tankBornEffectImagePosition.x;
		var posY = Constants.tankBornEffectImagePosition.y;
		for (var i = 0; i < 7; i++) {
			var sprite = SpriteFrameUtils.getSpriteFrame({
				texture: this.reliantSpriteFrame.texture,
				position: [posX + Constants.TileBigSize * i, posY],
				size: [Constants.TileBigSize, Constants.TileBigSize],
			});
			sprites.push(sprite); // 添加到数组中
		}
		const animClip = AnimationClip.createWithSpriteFrames(
			sprites,
			sprites.length
		);
		animClip.speed = 1.2;
		animClip.duration = 3;
		animClip.name = "tank_born_effect";
		animClip.wrapMode = AnimationClip.WrapMode.Normal; // 设置动画循环模式
		const animation = this.node.addComponent(Animation);
		animation.addClip(animClip);
		animation.on(Animation.EventType.FINISHED, this.initShowTank, this, true);
		animation.play("tank_born_effect"); // 播放动画
	}

	/**
	 * 创建坦克对象
	 * @param options 坦克创建选项
	 */
	public static create(options: TankCreationInitialOptions): Node {
		var tankNode = instantiate(options.prefab);
		var tank = tankNode.getComponent(Tank);
		tank.speed = options.speed || Tank.DEFAULT_SPEED; //设置坦克速度
		tank.useAiMove = options.useAiMove ?? false;
		tank.tankType = options.tankType ?? Tank.TYPE_HERO_TANK;
		tankNode.setPosition(options.bornPosition ?? new Vec3(0, 0, 0));
		return tankNode;
	}
}

/** 坦克创建选项 **/
export interface TankCreationInitialOptions {
	/** 预制体对象 */
	prefab: Prefab;
	/** 是否使用智能移动 */
	useAiMove?: boolean;
	/** 坦克类型，不传时为: @see {Tank.TYPE_HERO_TANK} */
	tankType?: number;
	/** 坦克速度，不传时为: @see {Tank.DEFAULT_SPEED} */
	speed?: number;
	/** 出生坐标点，不传时为：Vec2(0, 0) */
	bornPosition?: Vec3;
}
