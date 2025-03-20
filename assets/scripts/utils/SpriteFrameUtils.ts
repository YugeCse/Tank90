import { Rect, SpriteFrame } from "cc";
import { Constants } from "../data/Constants";

/** SpriteFrame的辅助类 */
export class SpriteFrameUtils {
	/**
	 * 根据纹理和裁剪位置创建精灵帧
	 * @param texture Texture对象
	 * @param position 裁剪位置
	 * @param size 裁剪大小
	 * @returns SpriteFrame对象
	 */
	static clip({
		texture,
		position = [0, 0],
		clipSize = [Constants.TileBigSize, Constants.TileBigSize],
	}: {
		texture: any;
		position: Array<number>;
		clipSize: Array<number>;
	}): SpriteFrame {
		var spriteFrame = new SpriteFrame();
		spriteFrame.texture = texture;
		spriteFrame.rect = new Rect(
			position[0],
			position[1],
			clipSize[0],
			clipSize[1]
		);
		return spriteFrame;
	}
}
