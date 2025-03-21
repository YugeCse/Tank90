import {
  _decorator,
  CCInteger,
  Component,
  instantiate,
  Layout,
  Node,
  Prefab,
  Sprite,
  SpriteFrame,
  UITransform,
  Vec3,
} from "cc";

const { ccclass, property } = _decorator;

/** 数字组件 */
@ccclass("Num")
export class Num extends Component {
  @property({ type: SpriteFrame, displayName: "数字0" })
  num0SpriteFrame: SpriteFrame = null;

  @property({ type: SpriteFrame, displayName: "数字1" })
  num1SpriteFrame: SpriteFrame = null;

  @property({ type: SpriteFrame, displayName: "数字2" })
  num2SpriteFrame: SpriteFrame = null;

  @property({ type: SpriteFrame, displayName: "数字3" })
  num3SpriteFrame: SpriteFrame = null;

  @property({ type: SpriteFrame, displayName: "数字4" })
  num4SpriteFrame: SpriteFrame = null;

  @property({ type: SpriteFrame, displayName: "数字5" })
  num5SpriteFrame: SpriteFrame = null;

  @property({ type: SpriteFrame, displayName: "数字6" })
  num6SpriteFrame: SpriteFrame = null;

  @property({ type: SpriteFrame, displayName: "数字7" })
  num7SpriteFrame: SpriteFrame = null;

  @property({ type: SpriteFrame, displayName: "数字8" })
  num8SpriteFrame: SpriteFrame = null;

  @property({ type: SpriteFrame, displayName: "数字9" })
  num9SpriteFrame: SpriteFrame = null;

  /** 数值0-9，不能包括两位数 */
  @property({ type: CCInteger, displayName: "数字(0-9)" })
  value: number = 0;

  /** 组件宽度 */
  private _width: number = 0;

  /** 组件宽度 */
  private _height: number = 0;

  start() {
    this.setNum(this.value); // 初始化数字
  }

  /**
   * 设置数字, 0-9之间
   * @param value 数字值，0-9之间
   */
  setNum(value: number) {
    if (value < 0 || value > 9) {
      throw new Error("数字值必须在0-9之间");
    }
    this.value = value;
    var spriteFrame = this[`num${value}SpriteFrame`] as SpriteFrame;
    this._width = spriteFrame.width;
    this._height = spriteFrame.height;
    this.node
      .getComponent(UITransform)
      .setContentSize(spriteFrame.width, spriteFrame.height);
    this.node.getComponent(Sprite).spriteFrame = spriteFrame;
  }

  /** 获取组件宽度 */
  get width() {
    return this._width;
  }

  /** 获取组件宽度 */
  get height() {
    return this._height;
  }

  /**
   * 创建一个数字组件
   * @param params 创建参数
   * @returns 创建的数字组件, 以及其宽高
   */
  public static create(params: NumCreationParams): {
    node: Node;
    width: number;
    height: number;
  } {
    const node = instantiate(params.prefab);
    const num = node.getComponent(Num);
    num.setNum(params.value);
    node.setPosition(params.position);
    return { node: node, width: num.width, height: num.height };
  }

  /**
   * 创建数字组组件
   * @param params 创建参数
   * @returns 数字组组件以及宽高
   */
  public static createGroup(params: NumCreationParams): {
    node: Node;
    width: number;
    height: number;
  } {
    var node = new Node();
    var requiredWidth = 0;
    var requiredHeight = 0;
    var uiTransform = node.addComponent(UITransform);
    var container = node.addComponent(Layout);
    container.type = Layout.Type.HORIZONTAL;
    container.alignVertical = true;
    container.resizeMode = Layout.ResizeMode.CONTAINER;
    container.horizontalDirection = Layout.HorizontalDirection.LEFT_TO_RIGHT;
    node.setPosition(params.position);
    var numTexts = params.value.toString().split(".")[0];
    for (var i = 0; i < numTexts.length; i++) {
      var numNode = Num.create({
        prefab: params.prefab,
        value: parseInt(numTexts[i]),
        position: new Vec3(requiredWidth, 0),
      });
      requiredWidth += numNode.width;
      if (numNode.height > requiredHeight) {
        requiredHeight = numNode.height;
      }
      node.addChild(numNode.node);
    }
    uiTransform.setContentSize(requiredWidth, requiredHeight);
    return { node: node, width: requiredWidth, height: requiredHeight };
  }
}

/** 数字组件的创建参数 **/
export interface NumCreationParams {
  /** 预制体 */
  prefab: Prefab;
  /** 数值 */
  value: number;
  /** 位置 */
  position: Vec3;
}
