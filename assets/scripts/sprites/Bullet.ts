import {
	_decorator,
	Animation,
	AnimationClip,
	BoxCollider2D,
	CCFloat,
	CCString,
	Collider2D,
	Component,
	instantiate,
	math,
	Node,
	Prefab,
	RigidBody2D,
	Sprite,
	SpriteFrame,
	UITransform,
	Vec2,
	Vec3,
} from "cc";
import { SpriteFrameUtils } from "../utils/SpriteFrameUtils";
import { Constants } from "../data/Constants";
import { Direction } from "../data/Direction";
import { CollisionMask } from "../data/CollisionMask";
import { Tiled } from "./Tiled";
import { TiledType } from "../data/TiledType";
import { Tank } from "./Tank";
import { AudioManager } from "../manager/AudioManager";
import { Master } from "./Master";
const { ccclass, property } = _decorator;

@ccclass("Bullet")
export class Bullet extends Component {
	/** 默认速度 */
	public static readonly DEFAULT_SPEED = 5;

	@property({ type: SpriteFrame, displayName: "子弹爆炸图片" })
	bulletBombSpriteFrames: SpriteFrame = null;

	@property({ type: SpriteFrame, displayName: "子弹向上图片" })
	bulletUpSpriteFrames: SpriteFrame = null;

	@property({ type: SpriteFrame, displayName: "子弹向下图片" })
	bulletDownSpriteFrames: SpriteFrame = null;

	@property({ type: SpriteFrame, displayName: "子弹向左图片" })
	bulletLeftSpriteFrames: SpriteFrame = null;

	@property({ type: SpriteFrame, displayName: "子弹向右图片" })
	bulletRightSpriteFrames: SpriteFrame = null;

	@property({ type: CCString, displayName: "子弹方向(UP|DOWN|LEFT|RIGHT)" })
	direction: String = Direction.NONE;

	@property({ type: CCFloat, displayName: "子弹速度" })
	speed: number = Bullet.DEFAULT_SPEED;

	/** 子弹是否爆炸，如果爆炸了，就不能移动了 */
	private _isBomb: boolean = false;

	start() {
		if (this.direction == Direction.NONE) {
			this.scheduleOnce(this.removeFromParentNode);
			return;
		}
		this.loadBombSpriteFramesAnimtaion(); // 加载爆炸动画
		var dirs = Direction.ValuesWithoutNone;
		var index = dirs.indexOf(this.direction);
		console.log("子弹生成 Offset：", 5 * index, this.direction);
		var spriteFrame =
			this.direction == "UP"
				? this.bulletUpSpriteFrames
				: this.direction == "DOWN"
					? this.bulletDownSpriteFrames
					: this.direction == "LEFT"
						? this.bulletLeftSpriteFrames
						: this.bulletRightSpriteFrames;
		this.node
			.getComponent(UITransform)
			.setContentSize(spriteFrame.rect.width, spriteFrame.rect.height);
		this.node.getComponent(Sprite).spriteFrame = spriteFrame;
		const collider = this.node.getComponent(BoxCollider2D);
		collider.size = new math.Size(
			spriteFrame.rect.width,
			spriteFrame.rect.height
		);
		collider.on("begin-contact", this.onCollision, this);
		// 设置子弹运行的方向和速度
		var rigidBody = this.node.getComponent(RigidBody2D);
		var dirVec2 = this.direction.toDirectionVec2();
		rigidBody.linearVelocity = dirVec2.multiplyScalar(this.speed);
	}

	/** 加载爆炸动画 */
	private loadBombSpriteFramesAnimtaion() {
		var bombSprites: SpriteFrame[] = [];
		for (var i = 0; i < 4; i++) {
			bombSprites.push(
				SpriteFrameUtils.clip({
					texture: this.bulletBombSpriteFrames.texture,
					position: [i * Constants.TileBigSize, 0],
					clipSize: [Constants.TileBigSize, Constants.TileBigSize],
				})
			);
		}
		var animClip = AnimationClip.createWithSpriteFrames(
			bombSprites,
			bombSprites.length
		);
		animClip.duration = 0.2;
		animClip.name = "bullet_bomb_effect";
		animClip.wrapMode = AnimationClip.WrapMode.Normal;
		var animation = this.node.addComponent(Animation);
		animation.on(
			Animation.EventType.FINISHED,
			this.removeFromParentNode,
			this,
			true
		);
		animation.addClip(animClip, "bullet_bomb_effect");
	}

	onCollision(selfCollider: Collider2D, otherCollider: Collider2D) {
		if (otherCollider.group == CollisionMask.WorldBoundary) {
			selfCollider.enabled = false; // 碰撞到边界，就停止碰撞检测
			this.bombThenDestroy();
		} else if (
			otherCollider.group == CollisionMask.EnemyBullet ||
			otherCollider.group == CollisionMask.HeroBullet
		) {
			selfCollider.enabled = false;
			otherCollider.enabled = false;
			this.scheduleOnce(() => {
				if (this.node) this.bombThenDestroy();
				if (otherCollider.node)
					otherCollider.node.getComponent(Bullet).bombThenDestroy();
			});
		} else if (otherCollider.group == CollisionMask.EnemyTank) {
			this.handleCollisionWithEnemyTank(selfCollider, otherCollider);
		} else if (otherCollider.group == CollisionMask.HeroTank) {
			this.handleCollisionWithHeroTank(selfCollider, otherCollider);
		} else if (otherCollider.group == CollisionMask.Obstacle) {
			this.handleCollisionWithObstacles(selfCollider, otherCollider);
		} else if (otherCollider.group == CollisionMask.HeroMaster) {
			this.handleCollisionWithHeroMaster(selfCollider, otherCollider);
		}
	}

	/** 与敌方坦克发生碰撞 */
	private handleCollisionWithEnemyTank(
		selfCollider: Collider2D,
		otherCollider: Collider2D
	) {
		selfCollider.enabled = false;
		otherCollider.enabled = false;
		this.scheduleOnce(() => {
			if (this.node) this.bombThenDestroy();
		});
		otherCollider.node?.getComponent(Tank)?.hurt();
	}

	/** 与英雄坦克发生碰撞 */
	private handleCollisionWithHeroTank(
		selfCollider: Collider2D,
		otherCollider: Collider2D
	) {
		selfCollider.enabled = false;
		this.scheduleOnce(() => {
			if (this.node) this.bombThenDestroy();
		});
		otherCollider.node?.getComponent(Tank)?.hurt();
	}

	/** 处理与障碍物发生碰撞的逻辑 */
	private handleCollisionWithObstacles(
		selfCollider: Collider2D,
		otherCollider: Collider2D
	) {
		var otherNode = otherCollider.node;
		if (!otherNode) return; // 如果没有节点，就返回
		var tiledType = otherNode.getComponent(Tiled).tiledType;
		var canDestroy =
			tiledType != TiledType.GRID &&
			tiledType != TiledType.RIVER &&
			tiledType != TiledType.GRASS &&
			tiledType != TiledType.ICE;
		console.log("碰撞了墙  是否能被销毁：", canDestroy);
		if (tiledType != TiledType.RIVER && tiledType != TiledType.ICE)
			selfCollider.enabled = false;
		if (canDestroy) otherCollider.enabled = false;
		this.scheduleOnce(() => {
			if (canDestroy && otherNode) otherNode.destroy();
			if (this.node && tiledType != TiledType.RIVER)
				this.bombThenDestroy();
		});
	}

	/** 处理与英雄总部发生碰撞 */
	private handleCollisionWithHeroMaster(
		selfCollider: Collider2D,
		otherCollider: Collider2D
	) {
		selfCollider.enabled = false;
		otherCollider.enabled = false;
		this.scheduleOnce(() => {
			if (this.node) this.bombThenDestroy();
			otherCollider.node?.getComponent(Master)?.setToDestroyState();
		});
		AudioManager.Instance.playHeroTankCrackAudio(); // 播放英雄坦克被击中音效
	}

	update(deltaTime: number) {
		if (
			!this._isBomb &&
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
	private bombThenDestroy() {
		this._isBomb = true; // 标识子弹爆炸了
		AudioManager.Instance.playBulletCrackAudio(); // 播放子弹爆炸音效
		this.getComponent(UITransform).setContentSize(
			Constants.TileBigSize,
			Constants.TileBigSize
		);
		this.getComponent(RigidBody2D).linearVelocity = Vec2.ZERO;
		this.node.getComponent(Animation).play("bullet_bomb_effect");
	}

	/**
	 * 创建子弹组件
	 * @param options 初始化参数
	 */
	public static create(options: BulletCreationInitialOptions) {
		var rootNode = instantiate(options.prefab);
		var tank = options.tankAnchor.getComponent(Tank);
		if (tank.useAiMove) {
			rootNode.getComponent(RigidBody2D).group =
				CollisionMask.EnemyBullet;
			rootNode.getComponent(BoxCollider2D).group =
				CollisionMask.EnemyBullet;
		}
		var tankDirection = tank.direction;
		var directionVec2 = tankDirection.toDirectionVec2();
		var tankSize = tank.node.getComponent(UITransform).contentSize;
		var deltaPosition = new Vec3(
			(directionVec2.x * tankSize.width) / 2,
			(directionVec2.y * tankSize.height) / 2
		);
		rootNode.setPosition(tank.node.position.clone().add(deltaPosition));
		var bullet = rootNode.getComponent(Bullet);
		bullet.direction = tankDirection;
		bullet.speed = options.speed || Bullet.DEFAULT_SPEED; // 默认速度为5
		return rootNode;
	}

	/** 从父节点销毁这个节点 */
	private removeFromParentNode() {
		this.node.destroy();
	}
}

/** Bullet创建初始化参数 */
export interface BulletCreationInitialOptions {
	/** 预制体 */
	prefab: Prefab;
	/** 坦克锚点 */
	tankAnchor: Node;
	/** 子弹速度, 不传时为：@see {Bullet.DEFAULT_SPEED} */
	speed?: number;
}
