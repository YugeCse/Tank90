import {
	_decorator,
	Animation,
	AnimationClip,
	BoxCollider2D,
	CCFloat,
	CCInteger,
	CCString,
	Collider2D,
	Color,
	Component,
	director,
	ERaycast2DType,
	EventKeyboard,
	Input,
	input,
	InstanceMaterialType,
	instantiate,
	KeyCode,
	macro,
	math,
	Node,
	PhysicMaterial,
	PhysicsMaterial,
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
import { Direction } from "../data/Direction";
import { Constants } from "../data/Constants";
import { SpriteFrameUtils } from "../utils/SpriteFrameUtils";
import { Bullet } from "./Bullet";
import { CollisionMask } from "../data/CollisionMask";
import { AudioManager } from "../manager/AudioManager";
import EventManager from "../manager/EventManager";
import { GlobalEvent } from "../data/GlobalEvent";
import { TankState } from "../data/TankState";

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

	@property({ type: SpriteFrame, displayName: "坦克保护罩" })
	tankShieldSpriteFrame: SpriteFrame = null;

	@property({ type: SpriteFrame, displayName: "坦克出生图片" })
	tankBirthSpriteFrame: SpriteFrame = null;

	@property({ type: SpriteFrame, displayName: "坦克爆炸图片" })
	tankExplodeSpriteFrame: SpriteFrame = null;

	@property({ type: SpriteFrame, displayName: "英雄坦克1" })
	heroTank1SpriteFrame: SpriteFrame = null;

	@property({ type: SpriteFrame, displayName: "英雄坦克2" })
	heroTank2SpriteFrame: SpriteFrame = null;

	@property({ type: SpriteFrame, displayName: "敌方坦克1" })
	enemyTank1SpriteFrame: SpriteFrame = null;

	@property({ type: SpriteFrame, displayName: "敌方坦克2" })
	enemyTank2SpriteFrame: SpriteFrame = null;

	@property({ type: SpriteFrame, displayName: "敌方坦克3" })
	enemyTank3SpriteFrame: SpriteFrame = null;

	@property({ type: SpriteFrame, displayName: "敌方坦克3-1" })
	enemyTank3a1SpriteFrame: SpriteFrame = null;

	@property({ type: SpriteFrame, displayName: "敌方坦克3-2" })
	enemyTank3a2SpriteFrame: SpriteFrame = null;

	/** 子弹预制体 */
	@property({ type: Prefab, displayName: "子弹预制体" })
	bulletPrefab: Prefab = null;

	/** 坦克状态 */
	@property({ type: CCInteger, displayName: "坦克状态" })
	tankState: number = TankState.NONE;

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
	@property({ displayName: "移动方向(UP|DOWN|LEFT|RIGHT)" })
	direction: String = Direction.UP;

	/** 是否使用Ai自动移动 */
	@property({ displayName: "AI自动移动" })
	useAiMove: boolean = false;

	/** 上次开火的时间 */
	private _lastFireTimeMillis: number = 0;

	/** 被按下的按键 */
	private _keyPressed: Set<KeyCode> = new Set<KeyCode>();

	/** 精灵帧集合 */
	private _spriteFrames: Map<String, SpriteFrame> = new Map();

	/** 初始化 */
	start() {
		const rigidBody = this.node.getComponent(RigidBody2D);
		const collider = this.node.getComponent(BoxCollider2D);
		collider.enabled = false;
		rigidBody.enabled = false;
		collider.friction = 0;
		collider.restitution = 0;
		if (this.useAiMove) {
			this.direction = Direction.DOWN;
			collider.group = CollisionMask.EnemyTank;
			rigidBody.group = CollisionMask.EnemyTank;
		}
		collider.on("begin-contact", this.onCollision, this);
		this.showBornEffect(); //显示出生效果视图
	}

	/** 初始化显示坦克，并配置一些事件 */
	private initShowTank() {
		if (this.tankState != TankState.PROTECTED) {
			this.tankState = TankState.NORMAL;
		}
		this.loadSpriteFrames(this.tankType); // 加载精灵帧
		this.getComponent(Collider2D).enabled = true;
		this.getComponent(RigidBody2D).enabled = true; // 开启刚体和碰撞器
		if (this.useAiMove) {
			Scheduler.enableForTarget(this);
			director
				.getScheduler()
				.schedule(this.smartMove, this, 1.6, macro.REPEAT_FOREVER, 0, false);
		} else {
			input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
			input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
		}
	}

	onCollision(selfCollider: Collider2D, otherCollider: Collider2D) {
		if (otherCollider.group == CollisionMask.EnemyTank
			|| otherCollider.group == CollisionMask.HeroTank) {
			selfCollider.body.linearVelocity = Vec2.ZERO;
			otherCollider.body.linearVelocity = Vec2.ZERO;
		}
	}

	/** 加载精灵帧 */
	private loadSpriteFrames(tankType: number) {
		var dirs = Direction.ValuesWithoutNone;
		var texture;
		if (tankType == Tank.TYPE_HERO_TANK) {
			texture = this.heroTank1SpriteFrame.texture;
		} else if (tankType == Tank.TYPE_ENEMY1_TANK) {
			texture = this.enemyTank1SpriteFrame.texture;
		} else if (tankType == Tank.TYPE_ENEMY2_TANK) {
			texture = this.enemyTank2SpriteFrame.texture;
		} else if (tankType == Tank.TYPE_ENEMY3_TANK) {
			if (this.numOfHitReceived == 2) {
				texture = this.enemyTank3a1SpriteFrame.texture;
			} else if (this.numOfHitReceived == 3) {
				texture = this.enemyTank3a2SpriteFrame.texture;
			} else {
				texture = this.enemyTank3SpriteFrame.texture;
			}
		} else {
			throw new Error("未知坦克类型");
		}
		for (var index = 0; index < dirs.length; index++) {
			var dir = dirs[index];
			var spriteFrame = SpriteFrameUtils.clip({
				texture: texture,
				position: [index * Constants.TileBigSize, 0],
				clipSize: [Constants.TileBigSize, Constants.TileBigSize],
			});
			this._spriteFrames.set(dir, spriteFrame);
			console.log("Message: Loaded SpriteFrame ", index, dir); // 输出加载成功的精灵帧
		}
		this.setSpriteFrameByDirection(this.direction);
		this.node
			.getComponent(UITransform)
			.setContentSize(Constants.TileBigSize, Constants.TileBigSize);
		console.log("Message: Loaded SpriteFrame Successfully"); // 输出加载成功的精灵帧
	}

	update(deltaTime: number) {
		if (this.useAiMove && this.tankState == TankState.NORMAL) {
			this.randomShoot(); // 只有敌方坦克在正常状态下才可以随机射击
		}
	}

	/** 受伤 */
	hurt() {
		if (this.tankState == TankState.PROTECTED) {
			console.log("英雄保护状态，无法受伤");
			return;
		}
		if (--this.numOfHitReceived <= 0) {
			if (this.tankState == TankState.DEAD) {
				console.log("英雄已经死亡，无法受伤");
				return;
			}
			this.tankState = TankState.DEAD;
			this.node.getComponent(BoxCollider2D).enabled = false;
			this.node.getComponent(RigidBody2D).linearVelocity = Vec2.ZERO;
			this.scheduleOnce(this.bombThenDestroy, 0); // 爆炸并销毁
			return;
		}
		if (this.useAiMove) { // 敌方坦克受伤时，播放音效
			this.loadSpriteFrames(this.tankType); // 重新加载精灵帧
			this.getComponent(Sprite).spriteFrame = this._spriteFrames.get(this.direction); // 重新设置精灵帧
		}
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
	private shoot(direction: String) {
		console.log("fire");
		if (this.bulletPrefab == null) {
			console.log("错误：子弹预制体为NULL");
			return;
		}
		if (direction == Direction.NONE) return; // 如果方向为NONE，则不发射子弹
		var curTimeMillis = Date.now();
		if (curTimeMillis - this._lastFireTimeMillis < 800) return; // 限制射击频率
		this._lastFireTimeMillis = curTimeMillis;
		var bullet = Bullet.create({
			tankAnchor: this.node,
			prefab: this.bulletPrefab,
		});
		this.node.parent.addChild(bullet); //子弹追加到界面中
		if (!this.useAiMove) AudioManager.Instance.playAttackAudio(); //播放攻击音效
	}

	/** 设置精灵的线性速度 */
	private setSpriteLinearVelocity(direction: String) {
		var rigidBody = this.getComponent(RigidBody2D);
		var dirVec2 = direction.toDirectionVec2();
		rigidBody.linearVelocity =
			direction == Direction.NONE
				? Vec2.ZERO
				: dirVec2.multiplyScalar(this.speed);
	}

	/** 智能移动 */
	private smartMove() {
		if (this.tankState == TankState.DEAD) return;
		var futureDirection = Direction.generateRandomDirection();
		if (futureDirection != Direction.NONE) {
			this.direction = futureDirection;
			this.setSpriteFrameByDirection(this.direction);
		}
		this.setSpriteLinearVelocity(this.direction);
	}

	/** 玩家移动 */
	private playerMove(direction: String) {
		this.direction = direction;
		this.node.getComponent(Sprite).spriteFrame =
			this._spriteFrames.get(direction);
		this.setSpriteLinearVelocity(direction);
	}

	/** 根据方向修改要展示的图片帧 */
	private setSpriteFrameByDirection(direction: String) {
		let sprite = this.node.getComponent(Sprite);
		sprite.spriteFrame = this._spriteFrames.get(direction);
	}

	// findRouteByRaycast(target: Vec2): Boolean {
	// 	var raycastResult = PhysicsSystem2D.instance.raycast(
	// 		this.node.position,
	// 		target,
	// 		ERaycast2DType.Closest
	// 	);
	// 	return raycastResult.length > 0;
	// }

	/** 显示出生时的特效 */
	private showBornEffect() {
		this.tankState = TankState.BORN;
		var sprites = new Array<SpriteFrame>();
		for (var i = 0; i < 7; i++) {
			var sprite = SpriteFrameUtils.clip({
				texture: this.tankBirthSpriteFrame.texture,
				position: [Constants.TileBigSize * i, 0],
				clipSize: [Constants.TileBigSize, Constants.TileBigSize],
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
		if (!this.useAiMove) this.showStrongProtectEffect(); //显示无敌保护罩效果
	}

	/** 显示无敌保护罩效果 */
	showStrongProtectEffect() {
		this.tankState = TankState.PROTECTED;
		var spriteAnimation: Animation;
		var clothesSprite = this.node.getChildByName("ClothesSprite");
		if (!clothesSprite) {
			var sprites = new Array<SpriteFrame>();
			for (var i = 0; i < 2; i++) {
				sprites.push(
					SpriteFrameUtils.clip({
						texture: this.tankShieldSpriteFrame.texture,
						position: [0, Constants.TileBigSize * i],
						clipSize: [Constants.TileBigSize, Constants.TileBigSize],
					})
				);
			}
			var animClip = AnimationClip.createWithSpriteFrames(
				sprites,
				sprites.length
			);
			animClip.speed = 1.2;
			animClip.duration = 1;
			animClip.name = "strong_protect_effect";
			animClip.wrapMode = AnimationClip.WrapMode.Loop; // 设置动画循环模式
			var spriteNode = new Node("ClothesSprite");
			var sprite = spriteNode.addComponent(Sprite);
			spriteAnimation = sprite.addComponent(Animation);
			spriteAnimation.addClip(animClip);
			this.node.addChild(spriteNode);
		} else {
			spriteAnimation = clothesSprite.getComponent(Animation);
		}
		spriteAnimation.play("strong_protect_effect"); // 播放动画
		this.scheduleOnce(this.disposeStrongProtectEffect, 10); // 10秒后停止播放, 取消无敌模式
	}

	/** 取消无敌模式 */
	disposeStrongProtectEffect() {
		if (this.node.getChildByName("ClothesSprite")) {
			this.unschedule(this.disposeStrongProtectEffect); // 取消定时器
			var spriteAnimation = this.node
				.getChildByName("ClothesSprite")
				.getComponent(Animation);
			spriteAnimation.stop();
			spriteAnimation.node.removeFromParent();
		}
		this.tankState = TankState.NORMAL; // 取消无敌模式
	}

	/** 设置坦克状态 */
	setTankState(state: number) {
		this.tankState = state;
		if (state == TankState.DEAD) {
			if (this.useAiMove) {
				director.getScheduler().unschedule(this.smartMove, this);
			}
			this.node.getComponent(RigidBody2D).linearVelocity = Vec2.ZERO;
		} else if (state == TankState.PROTECTED) {
			this.disposeStrongProtectEffect(); // 取消之前的保护罩
			this.showStrongProtectEffect(); //显示新的无敌保护罩效果
		}
	}

	/** 爆炸，然后销毁 */
	bombThenDestroy() {
		this.direction = Direction.NONE;
		this.tankState = TankState.DEAD;
		this.node.getComponent(RigidBody2D).linearVelocity = Vec2.ZERO;
		var sprites = new Array<SpriteFrame>();
		for (var i = 0; i < 4; i++) {
			var sprite = SpriteFrameUtils.clip({
				clipSize: [67, 67],
				position: [67 * i, 0],
				texture: this.tankExplodeSpriteFrame.texture,
			});
			sprites.push(sprite); // 添加到数组中
		}
		this.node
			.getComponent(UITransform)
			.setContentSize(Constants.TileBigSize * 2, Constants.TileBigSize * 2);
		const animClip = AnimationClip.createWithSpriteFrames(
			sprites,
			sprites.length
		);
		animClip.speed = 1;
		animClip.duration = 1.0;
		animClip.name = "tank_bomb_effect";
		animClip.wrapMode = AnimationClip.WrapMode.Normal; // 设置动画循环模式
		const animation = this.node.addComponent(Animation);
		animation.addClip(animClip);
		animation.on(Animation.EventType.FINISHED, this.removeFromParent, this, true);
		animation.play("tank_bomb_effect"); // 播放动画
		if (!this.useAiMove)
			AudioManager.Instance.playHeroTankCrackAudio(); //播放坦克爆炸音效
		else AudioManager.Instance.playEnemyTankCrackAudio(); //播放坦克爆炸音效
	}

	/** 从父节点删除 */
	private removeFromParent() {
		if (!this.useAiMove) {
			EventManager.instance.postEvent(GlobalEvent.HERO_TANK_DIE, this.tankType);
		} else {
			console.log("敌方坦克销毁！！！");
			EventManager.instance.postEvent(
				GlobalEvent.ENEMY_TANK_DIE,
				this.tankType
			);
			director.getScheduler().unschedule(this.smartMove, this);
		}
		this.node.destroy();
		console.log("Tank destroyed");
	}

	// 当键盘按下时触发
	onKeyDown(event: EventKeyboard) {
		if (this.tankState == TankState.DEAD) {
			console.log("坦克已死亡，无法移动");
			return;
		}
		if (event.keyCode == KeyCode.KEY_W || event.keyCode == KeyCode.ARROW_UP) {
			this.playerMove(Direction.UP);
		} else if (
			event.keyCode == KeyCode.KEY_S ||
			event.keyCode == KeyCode.ARROW_DOWN
		) {
			this.playerMove(Direction.DOWN);
		} else if (
			event.keyCode == KeyCode.KEY_A ||
			event.keyCode == KeyCode.ARROW_LEFT
		) {
			this.playerMove(Direction.LEFT);
		} else if (
			event.keyCode == KeyCode.KEY_D ||
			event.keyCode == KeyCode.ARROW_RIGHT
		) {
			this.playerMove(Direction.RIGHT);
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
		if (
			this.useAiMove ||
			(!this.useAiMove &&
				this.tankState != TankState.PROTECTED &&
				this.tankState != TankState.NORMAL)
		)
			return;
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
			this.node.getComponent(RigidBody2D).linearVelocity = Vec2.ZERO;
		}
	}

	/** 注销键盘事件 */
	unregisterKeyboardEvents() {
		this.getComponent(RigidBody2D).enabled = false;
		this.getComponent(BoxCollider2D).enabled = false;
		input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
		input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
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
