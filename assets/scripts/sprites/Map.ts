import {
	_decorator,
	CCInteger,
	Collider2D,
	Component,
	Graphics,
	instantiate,
	math,
	Prefab,
	UITransform,
	Vec3,
} from "cc";
import { Constants } from "../data/Constants";
import { StageMaps } from "../data/StageMaps";
import { TiledType } from "../data/TiledType";
import { Tiled } from "./Tiled";
import { Tank } from "./Tank";
const { ccclass, property } = _decorator;

@ccclass("Map")
export class Map extends Component {
	/** 地砖预制体 */
	@property({ type: Prefab, displayName: "地砖预制体" })
	tiledPrefab: Prefab = null;

	/** 坦克预制体 */
	@property({ type: Prefab, displayName: "坦克预制体" })
	tankPrefab: Prefab = null;

	/** 关卡数值 */
	@property({ type: CCInteger, displayName: "关卡数值" })
	stage: number = 0;

	/** 关卡数据 */
	private _stageData: Array<Array<number>> = [];

	start() {
		this.node
			.getComponent(UITransform)
			.setContentSize(Constants.WarMapSize, Constants.WarMapSize);
		const graphics = this.node.getComponent(Graphics);
		graphics.color = Constants.WarMapBackgroundColor;
		graphics.fillRect(
			-Constants.WarMapSize / 2,
			-Constants.WarMapSize / 2,
			Constants.WarMapSize,
			Constants.WarMapSize
		);
		this._stageData = StageMaps.all[this.stage];
		this.createStageTiledMap(this._stageData); //创建关卡地砖
		this.createHeroTank(); //创建英雄坦克
	}

	/**
	 * 创建关卡地砖
	 * @param {Array<Array<number>>} stageData 关卡数据
	 */
	private createStageTiledMap(stageData: Array<Array<number>>) {
		if (stageData.length === 0) return;
		const grassNode = this.node.parent.getChildByName("Grass"); //草地节点
		for (let y = 0; y < stageData.length; y++) {
			for (let x = 0; x < stageData[y].length; x++) {
				let tiledValue = stageData[y][x];
				if (TiledType.all.every((value) => value != tiledValue)) continue;
				var prefabNode = instantiate(this.tiledPrefab);
				const tiledNode = prefabNode.getComponent(Tiled);
				tiledNode.setTiledType(tiledValue); //赋值地砖类型
				if (tiledValue != TiledType.grass) {
					tiledNode.node.setSiblingIndex(0); //非草地的草地放在最底层
				} else {
					tiledNode.node.setSiblingIndex(2); //草地放在最上层
				}
				if (tiledValue == TiledType.ice || tiledValue == TiledType.grass) {
					tiledNode.node.getComponent(Collider2D).enabled = false; //冰块和草地不设置碰撞
				}
				tiledNode.node.setPosition(
					new Vec3(
						x * Constants.TiledSize -
							Constants.WarMapSize / 2.0 +
							Constants.TiledSize / 2.0,
						Constants.WarMapSize / 2.0 -
							y * Constants.TiledSize -
							Constants.TiledSize / 2.0
					)
				);
				tiledNode.node
					.getComponent(UITransform)
					.setContentSize(
						new math.Size(Constants.TiledSize, Constants.TiledSize)
					);
				if (tiledValue != TiledType.grass) {
					this.node.addChild(tiledNode.node); // 地砖添加到地图节点下
				} else {
					grassNode.addChild(tiledNode.node); // 草地添加到草地节点下
				}
				console.log(`添加地砖：${x},${y}, value:${tiledValue}`);
			}
		}
	}

	update(deltaTime: number) {}

	createHeroTank() {
		var tankNode = instantiate(this.tankPrefab);
		tankNode.setSiblingIndex(1); //英雄坦克放在最上层
		tankNode.setPosition(new Vec3(0, 0, 0));
		tankNode.getComponent(Tank).useAiMove = true;
		tankNode.getComponent(Tank).speed = 3; //设置坦克速度
		this.node.addChild(tankNode); // 地砖添加到地图节点下
	}
}
