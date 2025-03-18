import { _decorator, Component, math, Node, Vec2 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Constants")
export class Constants {
  /** 地块大小：16x16 */
  public static readonly TiledSize = 16;

  /** 地块大尺寸：32x32 */
  public static readonly TileBigSize = 32;

  /** 战场地图地块数量：26x26 */
  public static readonly WarMapTiledCount = 26;

  /** 战场地图的大小: 26-16 X 26-16 */
  public static readonly WarMapSize =
    Constants.WarMapTiledCount * Constants.TiledSize;

  /** 战场地图背景颜色 */
  public static readonly WarMapBackgroundColor = math.Color.GRAY;

  /** 战场地块图片起始位置： */
  public static readonly WarMapTiledImagePosition = new Vec2(0, 96);

  /** 战场子弹图片起始位置： */
  public static readonly WarBulletImagePosition = new Vec2(80.5, 96);
}
