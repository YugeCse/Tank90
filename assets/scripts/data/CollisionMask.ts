/** 碰撞掩码声明 */
export class CollisionMask {
  /** 障碍物掩码值 */
  public static readonly Obstacle: number = 1 << 1;

  /** 坦克掩码值 */
  public static readonly Tank: number = 1 << 2;

  /** 子弹掩码值 */
  public static readonly Bullet: number = 1 << 3;

  /** 道具掩码值 */
  public static readonly Prop: number = 1 << 4;
}
