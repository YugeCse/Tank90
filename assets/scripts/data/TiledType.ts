import { _decorator } from "cc";
const { ccclass } = _decorator;

/** 地砖类型 */
@ccclass("TiledType")
export class TiledType {
	/** 泥墙 */
	static readonly WALL = 1;
	/** 钢墙 */
	static readonly GRID = 2;
	/** 草地 */
	static readonly GRASS = 3;
	/** 河流 */
	static readonly RIVER = 4;
	/** 冰地 */
	static readonly ICE = 5;
	/**	未知类型 */
	static readonly UNKNOWN = 0;

	/** 所有可用的类型 */
	static readonly ALL: Array<number> = [
		TiledType.WALL,
		TiledType.GRID,
		TiledType.GRASS,
		TiledType.RIVER,
		TiledType.ICE,
	];

	/**
	 * 根据传入的类型，返回对应的描述
	 * @param type 类型
	 */
	static getDescription(type: number) {
		switch (type) {
			case TiledType.WALL:
				return "泥墙";
			case TiledType.GRID:
				return "钢墙";
			case TiledType.GRASS:
				return "草地";
			case TiledType.RIVER:
				return "河流";
			case TiledType.ICE:
				return "冰地";
			default:
				return "未知类型";
		}
	}
}
