import { _decorator, math, Vec2, Vec3 } from "cc";

declare global {
  interface String {
    toDirectionVec2(): Vec2;
  }
}

String.prototype.toDirectionVec2 = function () {
  return Direction.getNormailized(this);
};

/** 方向类声明 */
export class Direction {
  private constructor() {}

  public static readonly NONE = "NONE";

  public static readonly UP = "UP";

  public static readonly DOWN = "DOWN";

  public static readonly LEFT = "LEFT";

  public static readonly RIGHT = "RIGHT";

  /** 获取方向对应的向量值 */
  public static getNormailized(direction: String): Vec2 {
    switch (direction) {
      case Direction.UP:
        return new Vec2(0, 1);
      case Direction.DOWN:
        return new Vec2(0, -1);
      case Direction.LEFT:
        return new Vec2(-1, 0);
      case Direction.RIGHT:
        return new Vec2(1, 0);
      default:
        return new Vec2(0, 0);
    }
  }

  /** 生成随机方向 */
  public static generateRandomDirection(): String {
    return Direction.Values[math.randomRangeInt(0, 5)];
  }

  /** 获取方向值数组 */
  public static get Values(): Array<String> {
    return [
      Direction.UP,
      Direction.DOWN,
      Direction.LEFT,
      Direction.RIGHT,
      Direction.NONE,
    ];
  }

  /** 获取不带None的方向值数组 */
  public static get ValuesWithoutNone(): Array<String> {
    return [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
  }
}
