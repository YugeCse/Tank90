import {
  _decorator,
  Canvas,
  Component,
  director,
  macro,
  Node,
  Prefab,
  Scheduler,
  Vec3,
} from "cc";
import EventManager from "../events/EventManager";
import { Map } from "../sprites/Map";
import { GlobalEvent } from "../events/GlobalEvent";
import { Tank } from "../sprites/Tank";
import { Constants } from "../data/Constants";
const { ccclass, property } = _decorator;

@ccclass("MainScene")
export class MainScene extends Component {
  @property({ type: Prefab, displayName: "坦克预制体" })
  tankPrefab: Prefab = null;

  @property({ displayName: "Enemy Count" })
  enemyTankCount: number = 20;

  @property({ displayName: "Enemy Max Shown Count" })
  enemyTankMaxShownCount: number = 5;

  @property({ displayName: "Hero Life" })
  heroTankLife: number = 3;

  /** 创建英雄坦克对象 */
  private createHeroTank(): Node {
    return Tank.create({
      useAiMove: true,
      prefab: this.tankPrefab,
      tankType: Tank.TYPE_ENEMY3_TANK,
      bornPosition: new Vec3(
        Constants.TileBigSize / 2 - Constants.WarMapSize / 2,
        Constants.WarMapSize / 2 - Constants.TileBigSize / 2
      ),
    });
  }

  start() {
    EventManager.instance()
      .subscribe(GlobalEvent.HERO_TANK_DIE, this, this.onHeroTankDie)
      .subscribe(GlobalEvent.ENEMY_TANK_DIE, this, this.onEnemTankyDie);
    var tanksNode = this.node.getChildByName("Tanks");
    tanksNode.addChild(this.createHeroTank());
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
