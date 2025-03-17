import {
  _decorator,
  CCInteger,
  Component,
  Graphics,
  instantiate,
  math,
  Prefab,
  resources,
  UITransform,
  Vec3,
} from "cc";
import { Constants } from "../data/Constants";
import { StageMaps } from "../data/StageMaps";
import { TiledType } from "../data/TiledType";
import { Tiled } from "./Tiled";
const { ccclass, property } = _decorator;

@ccclass("Map")
export class Map extends Component {
  /** 关卡数值 */
  @property({ type: CCInteger, displayName: "关卡数值" })
  stage: number = 0;

  /** 关卡数据 */
  private _stageData: Array<Array<number>> = [];

  start() {
    this.node
      .getComponent(UITransform)
      .setContentSize(Constants.WarMapSize, Constants.WarMapSize);
    const graphics = this.node.getComponent(Graphics);
    graphics.color = Constants.WarMapBackgroundColor;
    graphics.fillRect(
      -Constants.WarMapSize / 2,
      -Constants.WarMapSize / 2,
      Constants.WarMapSize,
      Constants.WarMapSize
    );
    this._stageData = StageMaps.all[this.stage];
    this.createStageTiledMap(this._stageData); //创建关卡地砖
  }

  /**
   * 创建关卡地砖
   * @param {Array<Array<number>>} stageData 关卡数据
   */
  private createStageTiledMap(stageData: Array<Array<number>>) {
    if (stageData.length === 0) return;
    resources.load(`prefabs/Tiled`, Prefab, (err, prefab: Prefab) => {
      if (err) {
        console.error(`Tiled 加载预制体错误：${err}`);
        return;
      }
      for (let y = 0; y < stageData.length; y++) {
        for (let x = 0; x < stageData[y].length; x++) {
          let tiledValue = stageData[y][x];
          if (TiledType.all.every((value) => value != tiledValue)) continue;
          var prefabNode = instantiate(prefab);
          const tiledNode = prefabNode.children[0].getComponent(Tiled);
          tiledNode.setTiledType(tiledValue); //赋值地砖类型
          tiledNode.node.setPosition(
            new Vec3(
              Constants.WarMapSize / 2 -
                x * Constants.TiledSize -
                Constants.TiledSize / 2,
              Constants.WarMapSize / 2 -
                y * Constants.TiledSize -
                Constants.TiledSize / 2
            )
          );
          tiledNode.node
            .getComponent(UITransform)
            .setContentSize(
              new math.Size(Constants.TiledSize, Constants.TiledSize)
            );
          this.node.addChild(tiledNode.node); // 地砖添加到地图节点下
          console.log(`添加地砖：${x},${y}, value:${tiledValue}`);
        }
      }
    });
  }

  update(deltaTime: number) {}
}
