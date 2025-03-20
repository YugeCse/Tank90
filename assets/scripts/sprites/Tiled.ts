import {
	_decorator,
	CCInteger,
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
import { TiledType } from "../data/TiledType";
import { SpriteFrameUtils } from "../utils/SpriteFrameUtils";
import { Constants } from "../data/Constants";
import { CollisionMask } from "../data/CollisionMask";
const { ccclass, property } = _decorator;

@ccclass("Tiled")
export class Tiled extends Component {
	@property({ type: SpriteFrame, displayName: "关联图片" })
	reliantSpriteFrame: SpriteFrame = null;

	/** 地砖类型 */
	@property({ type: CCInteger, min: 0, max: 5, displayName: "地砖类型" })
	tiledType: number = TiledType.UNKNOWN;

	/**
	 * 设置地砖类型
	 * @param type 地砖类型
	 */
	setTiledType(type: number) {
		this.tiledType = type;
		console.log(`设置地砖类型：${type}, ${TiledType.getDescription(type)}`);
	}

	start() {
		this.loadSpriteFrame(this.tiledType); //加载地砖精灵帧
	}

	/**
	 * 加载地砖精灵帧
	 * @param type 地砖类型
	 * @returns 获取到的地砖的精灵帧
	 */
	private loadSpriteFrame(type: number = this.tiledType) {
		if (TiledType.ALL.every((item) => item !== type)) {
			this.node.getComponent(RigidBody2D).enabledContactListener = false;
			return; // 默认类型不加载且不启用碰撞模式
		}
		this.node.getComponent(Sprite).spriteFrame = SpriteFrameUtils.clip({
			texture: this.reliantSpriteFrame.texture,
			position: [
				(type - 1) * Constants.TiledSize,
				Constants.WarMapTiledImagePosition.y,
			],
			clipSize: [Constants.TiledSize, Constants.TiledSize],
		});
		console.log(`地图地砖(${type}帧)加载成功`); //加载地砖成功
	}

	update(deltaTime: number) {}

	/**
	 * 创建地砖节点
	 * @param options 地砖创建初始参数
	 */
	public static create(options: TiledCreationInitialOptions): Node {
		var prefabNode = instantiate(options.prefab);
		const tiledNode = prefabNode.getComponent(Tiled);
		var collider = tiledNode.node.getComponent(Collider2D);
		var rigidBody = tiledNode.node.getComponent(RigidBody2D);
		if (options.tiledType == TiledType.GRASS) {
			collider.enabled = false;
			rigidBody.enabled = false;
		} else if (options.tiledType == TiledType.RIVER) {
			collider.group = CollisionMask.ObstacleRiver;
			rigidBody.group = CollisionMask.ObstacleRiver;
		} else if (options.tiledType == TiledType.ICE) {
			collider.group = CollisionMask.ObstacleIce;
			rigidBody.group = CollisionMask.ObstacleIce;
		}
		tiledNode.setTiledType(options.tiledType); //赋值地砖类型
		tiledNode.node.setPosition(options.position);
		tiledNode.node
			.getComponent(UITransform)
			.setContentSize(
				new math.Size(Constants.TiledSize, Constants.TiledSize)
			);
		return prefabNode;
	}
}

/** 地砖创建初始参数声明 */
export interface TiledCreationInitialOptions {
	/** 预制体 */
	prefab: Prefab;
	/** 坐标位置 */
	position: Vec3;
	/** 地砖类型 **/
	tiledType: number;
}
