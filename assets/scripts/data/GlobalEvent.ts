/** 全局事件 */
export class GlobalEvent {

	/** 玩家坦克被销毁：携带参数 - int(TankType) */
	public static readonly HERO_TANK_DIE = "HERO_DIE";

	/** 敌方坦克被销毁：携带参数 - int(TankType)  */
	public static readonly ENEMY_TANK_DIE = "ENEMY_DIE";

	/** 英雄总部被毁坏 */
	public static readonly HERO_MASTER_DIE = "HERO_MASTER_DIE";
}
