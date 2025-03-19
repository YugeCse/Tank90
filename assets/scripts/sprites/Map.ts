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
		const graphics = this.node.getComponent(Graphics);
		var worldPosX = -Constants.WarMapSize / 2;
		var worldPosY = -Constants.WarMapSize / 2;
		graphics.color = Constants.WarMapBackgroundColor;
		graphics.fillRect(
			worldPosX,
			worldPosY,
			Constants.WarMapSize,
			Constants.WarMapSize
		);
		this.node
			.getComponent(UITransform)
			.setContentSize(Constants.WarMapSize, Constants.WarMapSize);
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
				var location = new Vec3(
					x * Constants.TiledSize -
						Constants.WarMapSize / 2.0 +
						Constants.TiledSize / 2.0,
					Constants.WarMapSize / 2.0 -
						y * Constants.TiledSize -
						Constants.TiledSize / 2.0
				); //因为坐标系是笛卡尔坐标系，因为上下是反的，所以Y轴计算需要减去
				var tiledNode = Tiled.create({
					position: location,
					tiledType: tiledValue,
					prefab: this.tiledPrefab,
				});
				if (tiledValue != TiledType.grass) {
					this.node.addChild(tiledNode); // 地砖添加到地图节点下
				} else {
					grassNode.addChild(tiledNode); // 草地添加到草地节点下
				}
				console.log(`添加地砖：${x},${y}, value:${tiledValue}`);
			}
		}
	}

	update(deltaTime: number) {}

	/** 创建英雄坦克对象 */
	createHeroTank() {
		var tankNode = Tank.create({
			useAiMove: true,
			prefab: this.tankPrefab,
			tankType: Tank.TYPE_ENEMY3_TANK,
		});
		this.node.addChild(tankNode); // 地砖添加到地图节点下
	}
}
