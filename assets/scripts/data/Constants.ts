import { _decorator, Component, math, Node, Vec2 } from "cc";
const { ccclass, property } = _decorator;

/** 常量声明 */
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

	/** 战场子弹爆炸图片起始位置 */
	public static readonly WarBulletBombImagePosition = new Vec2(321, 0);

	/** 保护罩的图片坐标 */
	public static readonly protectedImagePosition = new Vec2(160, 96);

	/** 敌人坦克出生时的图片坐标 */
	public static readonly enemyBornImagePosition = new Vec2(256, 32);

	/** 敌人坦克1的图片坐标 */
	public static readonly enemy1ImagePosition = new Vec2(0, 32);

	/** 敌人坦克2的图片坐标 */
	public static readonly enemy2ImagePosition = new Vec2(128, 32);

	/** 敌人坦克3的图片坐标 */
	public static readonly enemy3ImagePosition = new Vec2(0, 64);

	/** 子弹的图片坐标 */
	public static readonly bulletImagePosition = new Vec2(80, 96);

	/** 坦克爆炸的图片坐标 */
	public static readonly tankBombImagePosition = new Vec2(0, 160);
}
