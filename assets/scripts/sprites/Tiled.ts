import {
	_decorator,
	BoxCollider2D,
	CCInteger,
	Component,
	resources,
	Sprite,
	SpriteFrame,
} from "cc";
import { TiledType } from "../data/TiledType";
import { SpriteFrameUtils } from "../utils/SpriteFrameUtils";
import { Constants } from "../data/Constants";
const { ccclass, property } = _decorator;

@ccclass("Tiled")
export class Tiled extends Component {
	@property({ type: CCInteger, min: 0, max: 5, displayName: "地砖类型" })
	type: number = TiledType.unknown;

	/**
	 * 设置地砖类型
	 * @param type 地砖类型
	 */
	setTiledType(type: number) {
		this.type = type;
		console.log(`设置地砖类型：${type}, ${TiledType.getDescription(type)}`);
	}

	start() {
		this.loadSpriteFrame(); // 加载精灵帧
	}

	// 加载精灵帧
	private loadSpriteFrame(type: number = this.type) {
		if (TiledType.all.every((item) => item !== type)) {
			this.node.getComponent(BoxCollider2D).enabled = false;
			return; // 默认类型不加载且不启用碰撞模式
		}
		resources.load(
			`images/tank_all/spriteFrame`,
			SpriteFrame,
			(err, spriteFrame) => {
				if (err) {
					console.error(err);
					return;
				}
				this.node.getComponent(Sprite).spriteFrame =
					SpriteFrameUtils.getSpriteFrame({
						texture: spriteFrame.texture,
						position: [
							type * Constants.TiledSize,
							Constants.WarMapTiledImagePosition.y,
						],
						size: [Constants.TiledSize, Constants.TiledSize],
					});
				console.log(`加载地砖：${type} 成功！`); //加载地砖成功
			}
		);
	}

	update(deltaTime: number) {}
}
