import { _decorator, math, Vec2 } from "cc";

export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT" | "NONE";

/** 定义一个Direction类，用于表示方向 */
export namespace DirectionUtils {
  export function generateRandomDirection(): Direction {
    var value = math.randomRangeInt(0, 5);
    switch (value) {
      case 0:
        return "UP";
      case 1:
        return "DOWN";
      case 2:
        return "LEFT";
      case 3:
        return "RIGHT";
      default:
        return "NONE";
    }
  }

  export function getNormailized(direction: Direction) {
    switch (direction) {
      case "UP":
        return new Vec2(0, 1);
      case "DOWN":
        return new Vec2(0, -1);
      case "LEFT":
        return new Vec2(-1, 0);
      case "RIGHT":
        return new Vec2(1, 0);
      default:
        return new Vec2(0, 0);
    }
  }

  export function getValuesWithoutNone(): Array<Direction> {
    return ["UP", "DOWN", "LEFT", "RIGHT"];
  }
}
