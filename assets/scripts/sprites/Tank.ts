import {
	_decorator,
	CCFloat,
	CCInteger,
	Component,
	EventKeyboard,
	Input,
	input,
	KeyCode,
	Rect,
	resources,
	Sprite,
	SpriteFrame,
	UITransform,
	Vec2,
	Vec3,
} from "cc";
const { ccclass, property } = _decorator;
import { Direction } from "../events/Direction";
import { Constants } from "../data/Constants";

@ccclass("Tank")
export class Tank extends Component {
	/** 生命值 */
	@property(CCInteger)
	life: number = 1;

	/** 速度 */
	@property(CCFloat)
	speed: number = 80;

	/** 能承受共计次数 */
	@property(CCInteger)
	numOfHitReceived: number = 1;

	/** 移动方向 */
	@property(Vec2)
	direction: Vec2 = Direction.UP;

	/** 精灵帧集合 */
	_spriteFrames: Map<String, SpriteFrame> = new Map<String, SpriteFrame>();

	/** 被按下的按键 */
	_keyPressed: Set<KeyCode> = new Set<KeyCode>();

	start() {
		this.loadSpriteFrames(); // 加载精灵帧
		input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
		input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
	}

	// 加载精灵帧
	private loadSpriteFrames() {
		// 从资源中加载精灵帧
		resources.load(
			"images/tank_all/spriteFrame",
			SpriteFrame,
			(err, spriteFrame) => {
				// 如果加载失败，则输出错误信息
				if (err) {
					console.error("Failed to load SpriteFrame:", err);
					return;
				}
				// 获取精灵帧的纹理
				var texture = spriteFrame.texture;
				// 遍历方向数组
				[Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT].forEach(
					(dir, index) => {
						// 根据纹理和索引创建精灵帧
						var spriteFrame = this._createSpriteFrameFromTexture({
							texture: texture,
							x: index * Constants.TileBigSize,
							y: 0,
						});
						// 将精灵帧存入精灵帧集合中
						this._spriteFrames.set(Direction.getDescription(dir), spriteFrame);
					}
				);
				// 设置节点的精灵帧为向上的精灵帧
				this.node.getComponent(Sprite).spriteFrame = this._spriteFrames.get(
					Direction.getDescription(Direction.UP)
				);
				this.node
					.getComponent(UITransform)
					.setContentSize(Constants.TileBigSize, Constants.TileBigSize);
				// 输出加载成功的精灵帧
				console.log("Loaded SpriteFrame:", texture);
			}
		);
	}

	update(deltaTime: number) {
		this.move(deltaTime, this.direction); // 移动人物
	}

	// 根据传入的时间间隔和方向，移动节点
	move(deltaTime: number, direction: Vec2) {
		// 如果按下了W、上箭头、S、下箭头、A、左箭头、D、右箭头中的任意一个键
		if (
			this._keyPressed.has(KeyCode.KEY_W) ||
			this._keyPressed.has(KeyCode.ARROW_UP) ||
			this._keyPressed.has(KeyCode.KEY_S) ||
			this._keyPressed.has(KeyCode.ARROW_DOWN) ||
			this._keyPressed.has(KeyCode.KEY_A) ||
			this._keyPressed.has(KeyCode.ARROW_LEFT) ||
			this._keyPressed.has(KeyCode.KEY_D) ||
			this._keyPressed.has(KeyCode.ARROW_RIGHT)
		) {
			// 将节点的位置加上速度乘以时间间隔乘以方向
			this.node.setPosition(
				new Vec3(
					this.node.position.x + this.speed * deltaTime * direction.x,
					this.node.position.y + this.speed * deltaTime * direction.y
				).clampf(
					new Vec3(
						-Constants.WarMapSize / 2 + Constants.TiledSize,
						-Constants.WarMapSize / 2 + Constants.TiledSize
					),
					new Vec3(
						Constants.WarMapSize / 2 - Constants.TiledSize,
						Constants.WarMapSize / 2 - Constants.TiledSize
					)
				)
			); // 将节点的位置限制在地图范围内
		}
	}

	// 当键盘按下时触发
	onKeyDown(event: EventKeyboard) {
		// 如果按下的键是W或向上箭头
		if (event.keyCode == KeyCode.KEY_W || event.keyCode == KeyCode.ARROW_UP) {
			// 设置方向为向上
			this.direction = Direction.UP;
			// 设置精灵帧为向上的精灵帧
			this.node.getComponent(Sprite).spriteFrame = this._spriteFrames.get(
				Direction.getDescription(Direction.UP)
			);
			// 如果按下的键是S或向下箭头
		} else if (
			event.keyCode == KeyCode.KEY_S ||
			event.keyCode == KeyCode.ARROW_DOWN
		) {
			// 设置方向为向下
			this.direction = Direction.DOWN;
			// 设置精灵帧为向下的精灵帧
			this.node.getComponent(Sprite).spriteFrame = this._spriteFrames.get(
				Direction.getDescription(Direction.DOWN)
			);
			// 如果按下的键是A或向左箭头
		} else if (
			event.keyCode == KeyCode.KEY_A ||
			event.keyCode == KeyCode.ARROW_LEFT
		) {
			// 设置方向为向左
			this.direction = Direction.LEFT;
			// 设置精灵帧为向左的精灵帧
			this.node.getComponent(Sprite).spriteFrame = this._spriteFrames.get(
				Direction.getDescription(Direction.LEFT)
			);
			// 如果按下的键是D或向右箭头
		} else if (
			event.keyCode == KeyCode.KEY_D ||
			event.keyCode == KeyCode.ARROW_RIGHT
		) {
			// 设置方向为向右
			this.direction = Direction.RIGHT;
			// 设置精灵帧为向右的精灵帧
			this.node.getComponent(Sprite).spriteFrame = this._spriteFrames.get(
				Direction.getDescription(Direction.RIGHT)
			);
		}
		this._keyPressed.add(event.keyCode); // 添加按键到集合中
	}

	// 当键盘按键松开时触发
	onKeyUp(event: EventKeyboard) {
		// 如果松开的按键是W、上箭头、S、下箭头、A、左箭头、D、右箭头
		if (
			event.keyCode == KeyCode.KEY_W ||
			event.keyCode == KeyCode.ARROW_UP ||
			event.keyCode == KeyCode.KEY_S ||
			event.keyCode == KeyCode.ARROW_DOWN ||
			event.keyCode == KeyCode.KEY_A ||
			event.keyCode == KeyCode.ARROW_LEFT ||
			event.keyCode == KeyCode.KEY_D ||
			event.keyCode == KeyCode.ARROW_RIGHT
		) {
			// 从按键按下集合中删除该按键
			this._keyPressed.delete(event.keyCode);
		}
	}

	// 根据纹理和裁剪位置创建精灵帧
	_createSpriteFrameFromTexture({
		texture,
		x,
		y,
	}: {
		texture: any;
		x: number;
		y: number;
	}): SpriteFrame {
		// 创建一个精灵帧
		var spriteFrame = new SpriteFrame();
		// 设置精灵帧的纹理
		spriteFrame.texture = texture;
		// 设置精灵帧的裁剪区域
		spriteFrame.rect = new Rect(
			x,
			y,
			Constants.TileBigSize,
			Constants.TileBigSize
		);
		// 返回精灵帧
		return spriteFrame;
	}
}
