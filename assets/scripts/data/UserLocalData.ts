/** 用户本地数据类 */
class UserLocalData {

    /** 静态实例 */
	private static _instance: UserLocalData;

    /** 获取单例对象 */
	public static get instance(): UserLocalData {
		if (!this._instance) {
			this._instance = new UserLocalData();
		}
		return this._instance;
	}

	private constructor() {}

    /** 设置关卡值 */
    public set stageLevel(value: number) {
		localStorage.setItem("stageLevel", value.toString());
    }

    /** 获取关卡值 */
    public get stageLevel(): number {
		return parseInt(localStorage.getItem("stageLevel") || "0");
    }

	/** 设置最高分 */
	public set highScore(value: number) {
		localStorage.setItem("highScore", value.toString());
	}

	/** 获取最高分 */
	public get highScore(): number {
		return parseInt(localStorage.getItem("highScore") || "0");
	}
}
