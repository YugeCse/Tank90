import {
	_decorator,
	CCInteger,
	Component,
	instantiate,
	math,
	Node,
	Prefab,
	Sprite,
	SpriteFrame,
	UITransform,
	Vec3,
} from "cc";
import { SpriteFrameUtils } from "../utils/SpriteFrameUtils";
const { ccclass, property } = _decorator;

/** 道具类 */
@ccclass("Prop")
export class Prop extends Component {
	@property({ type: SpriteFrame, displayName: "关联图片" })
	reliantSpriteFrame: SpriteFrame = null;

	@property({ type: CCInteger, displayName: "道具类型" })
	propType: number = PropType.AAA;

	start() {
		this.loadPropSpriteFrame(this.propType);
	}

	/**
	 * 加载道具的图片帧
	 * @param propType 道具类型
	 */
	private loadPropSpriteFrame(propType: number) {
        /// TODO: 根据道具类型加载对应的图片帧
		this.node.getComponent(Sprite).spriteFrame =
			SpriteFrameUtils.getSpriteFrame({
				size: [0, 0],
				position: [0, 0],
				texture: this.reliantSpriteFrame.texture,
			});
		this.node.getComponent(UITransform).setContentSize(new math.Size());
	}

	update(deltaTime: number) {}

	/**
	 * 创建道具对象节点
	 * @param params 道具创建参数
	 */
	public static create(params: PropCreationParams): Node {
		var node = instantiate(params.prefab);
		node.setPosition(params.displayPosition);
		return node;
		// node.getComponent(UITransform).setContentSize(new math.Size(100, 100));
	}
}

/** 道具创建参数 */
export interface PropCreationParams {
	/** 道具预制体 */
	prefab: Prefab;
	/** 类型 */
	propType: number;
	/** 展示位置 */
	displayPosition: Vec3;
}
