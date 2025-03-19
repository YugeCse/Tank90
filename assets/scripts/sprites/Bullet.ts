import {
	_decorator,
	BoxCollider2D,
	CCFloat,
	Collider2D,
	Component,
	instantiate,
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
import { Direction, DirectionUtils } from "../data/Direction";
import { CollisionMask } from "../data/CollisionMask";
import { Tiled } from "./Tiled";
import { TiledType } from "../data/TiledType";
import { Tank } from "./Tank";
const { ccclass, property } = _decorator;

@ccclass("Bullet")
export class Bullet extends Component {
	/** 默认速度 */
	public static readonly DEFAULT_SPEED = 5;

	@property({ type: SpriteFrame, displayName: "关联图片" })
	reliantSpriteFrame: SpriteFrame = null;

	@property({ displayName: "子弹方向" })
	direction: Direction = "NONE";

	@property({ type: CCFloat, displayName: "子弹速度" })
	speed: number = Bullet.DEFAULT_SPEED;

	@property({ type: CCFloat, displayName: "子弹原始尺寸" })
	originSize: number = 5.5;

	/** 子弹是否爆炸，如果爆炸了，就不能移动了 */
	isBomb: boolean = false;

	start() {
		if (this.direction == "NONE") {
			this.scheduleOnce(() => this.node.destroy());
			return;
		}
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
		var dirVec2 = DirectionUtils.getNormailized(this.direction);
		rigidBody.linearVelocity = dirVec2.multiplyScalar(this.speed);
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
		}
	}

	/** 与敌方坦克发生碰撞 */
	private handleCollisionWithEnemyTank(
		selfCollider: Collider2D,
		otherCollider: Collider2D
	) {
		selfCollider.enabled = false;
		this.scheduleOnce(() => {
			if (this.node) this.bombThenDestroy();
		});
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

	/**
	 * 创建子弹组件
	 * @param options 初始化参数
	 */
	public static create(options: BulletCreationInitialOptions) {
		var rootNode = instantiate(options.prefab);
		var tank = options.tankAnchor.getComponent(Tank);
		if (tank.useAiMove) {
			rootNode.getComponent(BoxCollider2D).group = CollisionMask.EnemyBullet;
			rootNode.getComponent(RigidBody2D).group = CollisionMask.EnemyBullet;
		}
		var tankDirection = tank.direction;
		var directionVec2 = DirectionUtils.getNormailized(tankDirection);
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
