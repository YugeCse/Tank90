import {
  _decorator,
  AudioClip,
  Component,
  director,
  macro,
  Node,
  Prefab,
  random,
  Scheduler,
  Vec3,
} from "cc";
import EventManager from "../events/EventManager";
import { GlobalEvent } from "../events/GlobalEvent";
import { Tank } from "../sprites/Tank";
import { Constants } from "../data/Constants";
import { AudioPlayUtils } from "../utils/AudioPlayUtils";
const { ccclass, property } = _decorator;

@ccclass("MainScene")
export class MainScene extends Component {
  @property({ type: Prefab, displayName: "坦克预制体" })
  tankPrefab: Prefab = null;

  @property({ type: AudioClip, displayName: "开始游戏的音频" })
  startGameAudio: AudioClip = null;

  @property({ type: AudioClip, displayName: "被打击的音频" })
  attachAudio: AudioClip = null;

  @property({ type: AudioClip, displayName: "坦克移动音频" })
  tankMoveAudio: AudioClip = null;

  @property({ type: AudioClip, displayName: "子弹爆炸音频" })
  bulletBombAudio: AudioClip = null;

  @property({ type: AudioClip, displayName: "英雄坦克爆炸音频" })
  heroTankBombAudio: AudioClip = null;

  @property({ type: AudioClip, displayName: "敌方坦克爆炸音频" })
  enemyTankBombAudio: AudioClip = null;

  @property({ displayName: "Enemy Count" })
  enemyTankCount: number = 20;

  @property({ displayName: "Enemy Max Shown Count" })
  enemyTankMaxShownCount: number = 5;

  @property({ displayName: "Hero Life" })
  heroTankLife: number = 3;

  start() {
    AudioPlayUtils.Instance.init(
      this.startGameAudio,
      this.attachAudio,
      this.tankMoveAudio,
      this.bulletBombAudio,
      this.heroTankBombAudio,
      this.enemyTankBombAudio
    );
    EventManager.instance()
      .subscribe(GlobalEvent.HERO_TANK_DIE, this, this.onHeroTankDie)
      .subscribe(GlobalEvent.ENEMY_TANK_DIE, this, this.onEnemTankyDie);
    var tanksNode = this.node.getChildByName("Tanks");
    tanksNode.addChild(this.createHeroTank());
    // Scheduler.enableForTarget(this);
    // director
    //   .getScheduler()
    //   .schedule(this.checkEnemyTanks, this, 2, macro.REPEAT_FOREVER, 0, false);
    this.generateEnemyTanks(); //检查敌方坦克数量，然后看是否需要创建
    AudioPlayUtils.Instance.playStartGameAudio(); //播放开始游戏音频
  }

  /** 创建英雄坦克对象 */
  private createHeroTank(): Node {
    return Tank.create({
      useAiMove: false,
      prefab: this.tankPrefab,
      tankType: Tank.TYPE_HERO_TANK,
      bornPosition: new Vec3(
        -2 * Constants.TileBigSize,
        Constants.TileBigSize / 2 - Constants.WarMapSize / 2
      ),
    });
  }

  /** 检查地方坦克数量，然后看是否需要创建 */
  private generateEnemyTanks() {
    for (var i = 0; i < 5; i++) {
      this.generateEnemyTank(); //随机生成一个敌方坦克
    }
    this.enemyTankCount -= 5; //敌方坦克数量减5
  }

  /** 随机生成一个敌方坦克 */
  private generateEnemyTank() {
    var tankTypes = [
      Tank.TYPE_ENEMY1_TANK,
      Tank.TYPE_ENEMY2_TANK,
      Tank.TYPE_ENEMY3_TANK,
    ];
    var tankType = tankTypes[Math.floor(Math.random() * tankTypes.length)];
    var bornPosX =
      random() > 0.5
        ? Constants.TileBigSize / 2 - Constants.WarMapSize / 2
        : Constants.WarMapSize / 2 - Constants.TileBigSize / 2;
    var bornPosY = -Constants.TileBigSize / 2 + Constants.WarMapSize / 2;
    var tank = Tank.create({
      prefab: this.tankPrefab,
      useAiMove: true,
      tankType: tankType,
      bornPosition: new Vec3(bornPosX, bornPosY),
    });
    this.node.getChildByName("Tanks").addChild(tank);
  }

  update(deltaTime: number) {}

  // protected onDestroy(): void {
  //   director.getScheduler().unschedule(this.checkEnemyTanks, this);
  // }

  /** 英雄坦克死亡 */
  private onHeroTankDie() {
    this.heroTankLife--;
    if (this.heroTankLife <= 0) {
      // director.loadScene("GameOver");
    }
  }

  /** 敌方坦克死亡  */
  private onEnemTankyDie() {
    this.enemyTankCount--;
    if (this.enemyTankCount <= 0) {
      // director.loadScene("Win");
      return;
    }
    this.generateEnemyTank();
    console.log("MainScene: 敌方坦克被销毁");
  }
}
