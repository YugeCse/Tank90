import {
	_decorator,
	Canvas,
	Component,
	director,
	macro,
	Node,
	Scheduler,
} from "cc";
import EventManager from "../events/EventManager";
import { Map } from "../sprites/Map";
import { GlobalEvent } from "../events/GlobalEvent";
const { ccclass, property } = _decorator;

@ccclass("MainScene")
export class MainScene extends Component {
	@property({ displayName: "Enemy Count" })
	enemyTankCount: number = 20;

	@property({ displayName: "Enemy Max Shown Count" })
	enemyTankMaxShownCount: number = 5;

	@property({ displayName: "Hero Life" })
	heroTankLife: number = 3;

	start() {
		EventManager.instance()
			.subscribe(GlobalEvent.HERO_TANK_DIE, this, this.onHeroTankDie)
			.subscribe(GlobalEvent.ENEMY_TANK_DIE, this, this.onEnemTankyDie);
		this.node.getComponent(Canvas).getComponent(Map).stage = 0; //设置关卡
		// Scheduler.enableForTarget(this);
		// director
		// 	.getScheduler()
		// 	.schedule(this.checkEnemyTanks, this, 2, macro.REPEAT_FOREVER, 0, false);
	}

	update(deltaTime: number) {}

	// protected onDestroy(): void {
	// 	director.getScheduler().unschedule(this.checkEnemyTanks, this);
	// }

	/** 英雄坦克死亡 */
	private onHeroTankDie() {
		this.heroTankLife--;
		if (this.heroTankLife <= 0) {
			director.loadScene("GameOver");
		}
	}

	/** 敌方坦克死亡  */
	private onEnemTankyDie() {
		this.enemyTankCount--;
		if (this.enemyTankCount <= 0) {
			director.loadScene("Win");
		}
	}
}
