/** 碰撞掩码声明 */
export class CollisionMask {
  /** 地图边界掩码值 */
  public static readonly WorldBoundary: number = 1 << 0;

  /** 障碍物掩码值 */
  public static readonly Obstacle: number = 1 << 1;

  /** 玩家坦克掩码值 */
  public static readonly HeroTank: number = 1 << 2;

  /** 敌方坦克掩码值 */
  public static readonly EnemyTank: number = 1 << 3;

  /** 玩家子弹掩码值 */
  public static readonly HeroBullet: number = 1 << 4;

  /** 敌方坦克子弹掩码值 */
  public static readonly EnemyBullet: number = 1 << 5;

  /** 道具掩码值 */
  public static readonly Prop: number = 1 << 6;

  /** 障碍物掩码值 - ice */
  public static readonly ObstacleIce: number = 1 << 7;

  /** 障碍物掩码值 - river */
  public static readonly ObstacleRiver: number = 1 << 8;

  /** 玩家总部掩码值 */
  public static readonly HeroMaster: number = 1 << 9;

}
