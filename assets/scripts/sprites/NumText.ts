import { _decorator, CCInteger, Component, instantiate, Node, Prefab, Sprite, SpriteFrame, UITransform, Vec3 } from 'cc';
import { Num } from './Num';
const { ccclass, property } = _decorator;

@ccclass('NumText')
export class NumText extends Component {

    @property({ type: [SpriteFrame], displayName: '数字贴图集合' })
    numSpriteFrames: SpriteFrame[] = [];

    @property({ type: Node, displayName: "绑定数字的节点" })
    digitContainer: Node = null;

    @property({ displayName: '数字' })
    numValue: number = 0;

    @property({ type: CCInteger, displayName: '数字贴图大小' })
    numSpriteSize: number = 13;

    private _numNodeList: Node[] = [];

    start() {
        this.setNumber(this.numValue);
    }

    update(deltaTime: number) { }

    /** 清空所有数字节点 */
    clearDigits() {
        this.digitContainer.removeAllChildren();
        this._numNodeList = [];
    }

    setNumber(value: number) {
        this.clearDigits();
        var containerWidth = 0;
        var containerHeight = 0;
        console.log(`设置的数字是：${value}`);
        this.numValue = value;
        const digits = String(this.numValue).split('.')[0].split('');
        for (const digitStr of digits) {
            const digit = parseInt(digitStr);
            if (digit >= 0 && digit <= 9) {
                var { width, height } = this.addDigit(digit);
                if (height > containerHeight) {
                    containerHeight = height;
                }
                containerWidth += width;
                console.log(`数字是：${digit}，宽度是：${width}，高度是：${height}`)
            }
        }
        this.digitContainer.getComponent(UITransform)
            .setContentSize(containerWidth, containerHeight);
    }

    /** 添加单个数字 */
    addDigit(digit: number): { width: number, height: number } {
        const newNode = new Node();
        const sprite = newNode.addComponent(Sprite);
        sprite.spriteFrame = this.numSpriteFrames[digit];
        newNode.addComponent(UITransform)
            .setContentSize(this.numSpriteSize, this.numSpriteSize);
        this.digitContainer.addChild(newNode);
        this._numNodeList.push(newNode);
        return { width: this.numSpriteSize, height: this.numSpriteSize };
    }

}
