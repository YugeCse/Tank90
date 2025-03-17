import { _decorator, Component, math, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Constants')
export class Constants {

    /** 地块大小：16x16 */
    public static readonly TiledSize = 16;

    /** 地块大尺寸：32x32 */
    public static readonly TileBigSize = 32;

    /** 战场地图地块数量：46x46 */
    public static readonly WarMapTiledCount = 46;

    /** 战场地图的大小: 46-16 X 46-16 */
    public static readonly WarMapSize = Constants.WarMapTiledCount * Constants.TiledSize;

    /** 战场地图背景颜色 */
    public static readonly WarMapBackgroundColor = math.Color.GRAY;

}

