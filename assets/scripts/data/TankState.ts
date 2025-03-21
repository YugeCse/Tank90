/** 坦克状态枚举 */
declare global {
  interface String {
    toTankState(): TankState;
  }
}

String.prototype.toTankState = function () {
  switch (this) {
    case "BORN":
      return TankState.BORN;
    case "PROTECTED":
      return TankState.PROTECTED;
    case "NORMAL":
      return TankState.NORMAL;
    case "DEAD":
      return TankState.DEAD;
    // case "NONE":
    //   return TankState.NONE;
    default:
      return TankState.NONE;
  }
};

/** 坦克类型声明 */
export class TankState {
  private constructor() { }

  /** 无状态 */
  public static readonly NONE: number = 0;

  /** 出生 */
  public static readonly BORN: number = 1;

  /** 受保护 */
  public static readonly PROTECTED: number = 2;

  /** 正常 */
  public static readonly NORMAL: number = 3;

  /** 死亡 */
  public static readonly DEAD: number = 4;
}
