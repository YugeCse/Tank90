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
	static getSpriteFrame({
		texture,
		position = [0, 0],
		size = [Constants.TileBigSize, Constants.TileBigSize],
	}: {
		texture: any;
		position: Array<number>;
		size: Array<number>;
	}): SpriteFrame {
		// 创建一个精灵帧
		var spriteFrame = new SpriteFrame();
		// 设置精灵帧的纹理
		spriteFrame.texture = texture;
		// 设置精灵帧的裁剪区域
		spriteFrame.rect = new Rect(position[0], position[1], size[0], size[1]);
		// 返回精灵帧
		return spriteFrame;
	}
}
