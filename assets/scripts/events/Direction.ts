import { _decorator, Component, Node, Vec2 } from "cc";
const { ccclass, property } = _decorator;

// 定义一个Direction类，用于表示方向
export class Direction {
	// 向上方向
	static readonly UP = new Vec2(0, 1);

	// 向下方向
	static readonly DOWN = new Vec2(0, -1);

	// 向左方向
	static readonly LEFT = new Vec2(-1, 0);

	// 向右方向
	static readonly RIGHT = new Vec2(1, 0);

	// 无方向
	static readonly NONE = new Vec2(0, 0);

	// 方向数组
	static readonly VALUES = [
		Direction.UP,
		Direction.DOWN,
		Direction.LEFT,
		Direction.RIGHT,
		Direction.NONE,
	];

	// 生成一个随机方向
	static generateRandomDirection() {
		// 从Direction.VALUES数组中随机选择一个方向
		return Direction.VALUES[
			Math.floor(Math.random() * Direction.VALUES.length)
		];
	}

	// 根据传入的方向向量，返回对应的字符串描述
	static getDescription(direction: Vec2) {
		// 如果方向向量等于Direction.UP，则返回"UP"
		if (direction.equals(Direction.UP)) {
			return "UP";
			// 如果方向向量等于Direction.DOWN，则返回"DOWN"
		} else if (direction.equals(Direction.DOWN)) {
			return "DOWN";
			// 如果方向向量等于Direction.LEFT，则返回"LEFT"
		} else if (direction.equals(Direction.LEFT)) {
			return "LEFT";
			// 如果方向向量等于Direction.RIGHT，则返回"RIGHT"
		} else if (direction.equals(Direction.RIGHT)) {
			return "RIGHT";
			// 如果方向向量等于Direction.NONE，则返回"NONE"
		} else if (direction.equals(Direction.NONE)) {
			return "NONE";
			// 否则返回"UNKNOWN"
		} else {
			return "UNKNOWN";
		}
	}
}
