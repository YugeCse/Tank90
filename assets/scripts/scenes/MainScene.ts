import {
  _decorator,
  AudioClip,
  Color,
  Component,
  Graphics,
  Node,
  Prefab,
  random,
  Vec3,
} from "cc";
import EventManager from "../manager/EventManager";
import { GlobalEvent } from "../data/GlobalEvent";
import { Tank } from "../sprites/Tank";
import { Constants } from "../data/Constants";
import { AudioManager } from "../manager/AudioManager";
import { Map } from "../sprites/Map";
const { ccclass, property } = _decorator;

@ccclass("MainScene")
export class MainScene extends Component {
  @property({ type: Prefab, displayName: "坦克预制体" })
  tankPrefab: Prefab = null;

  @property({ displayName: "是否允许播放声音" })
  isPlayAudio: boolean = false;

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

  onLoad() {
    this.drawBackgroundBoundary(); //绘制背景边界
    this.node.getChildByName("Map").getComponent(Map).stage = 16;
  }

  /** 绘制背景边界 */
  private drawBackgroundBoundary() {
    var graphics = this.node
      .getChildByName("Background")
      .getComponent(Graphics) as Graphics;
    graphics.clear();
    graphics.fillColor = Color.BLACK;
    graphics.fill();
    graphics.fillColor = Color.GRAY;
    graphics.rect(-512 / 2, -448 / 2, 512, 448);
    graphics.fill();
    graphics.strokeColor = Color.BLACK;
    graphics.stroke();
    graphics.fill();
    graphics.fillColor = Color.BLACK;
    graphics.rect(
      -Constants.WarMapSize / 2 - 16,
      -Constants.WarMapSize / 2,
      Constants.WarMapSize,
      Constants.WarMapSize
    );
    graphics.color = Color.BLACK;
    graphics.fill();
  }

  start() {
    AudioManager.Instance.init(
      this.isPlayAudio,
      this.startGameAudio,
      this.attachAudio,
      this.tankMoveAudio,
      this.bulletBombAudio,
      this.heroTankBombAudio,
      this.enemyTankBombAudio
    );
    EventManager.instance
      .subscribe(GlobalEvent.HERO_TANK_DIE, this, this.onHeroTankDie)
      .subscribe(GlobalEvent.ENEMY_TANK_DIE, this, this.onEnemTankyDie);
    this.node.getChildByName("Tanks").addChild(this.createHeroTank()); //添加我方坦克
    this.generateEnemyTanks(); //检查敌方坦克数量，然后看是否需要创建
    AudioManager.Instance.playStartGameAudio(); //播放开始游戏音频
  }

  /** 创建英雄坦克对象，但不添加到节点中 */
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
      speed: tankType == Tank.TYPE_ENEMY2_TANK ? 5 : Tank.DEFAULT_SPEED,
    });
    this.node.getChildByName("Tanks").addChild(tank);
  }

  update(deltaTime: number) {}

  /** 英雄坦克死亡 */
  private onHeroTankDie() {
    console.log(`MainScene: 英雄坦克被销毁 ${this.heroTankLife}`);
    this.heroTankLife--;
    if (this.heroTankLife <= 0) {
      console.log(`Game Over`);
      ///TODO
      return;
    }
    this.node.getChildByName("Tanks").addChild(this.createHeroTank()); //生成新的英雄坦克
  }

  /** 敌方坦克死亡  */
  private onEnemTankyDie() {
    console.log(`MainScene: 敌方坦克被销毁`);
    this.enemyTankCount--;
    if (this.enemyTankCount <= 0) {
      console.log(`Game Win`);
      ///TODO 游戏胜利
      return;
    }
    this.generateEnemyTank(); //生成新的地方坦克
    console.log("MainScene: 敌方坦克被销毁");
  }
}
