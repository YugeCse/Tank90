import { _decorator } from "cc";
const { ccclass } = _decorator;

/** 地砖类型 */
@ccclass("TiledType")
export class TiledType {
	/** 泥墙 */
	static readonly wall = 1;
	/** 钢墙 */
	static readonly grid = 2;
	/** 草地 */
	static readonly grass = 3;
	/** 河流 */
	static readonly river = 4;
	/** 冰地 */
	static readonly ice = 5;

	/**	未知类型 */
	static readonly unknown = 0;

	/** 所有可用的类型 */
	static readonly all: Array<number> = [
		TiledType.wall,
		TiledType.grid,
		TiledType.grass,
		TiledType.river,
		TiledType.ice,
	];

	/**
	 * 根据传入的类型，返回对应的描述
	 * @param type 类型
	 */
	static getDescription(type: number) {
		switch (type) {
			case TiledType.wall:
				return "泥墙";
			case TiledType.grid:
				return "钢墙";
			case TiledType.grass:
				return "草地";
			case TiledType.river:
				return "河流";
			case TiledType.ice:
				return "冰地";
			default:
				return "未知类型";
		}
	}
}
