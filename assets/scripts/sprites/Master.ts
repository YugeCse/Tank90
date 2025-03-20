import { _decorator, Component, Node, RigidBody2D, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Master')
export class Master extends Component {

    @property({ type: SpriteFrame, displayName: "AliveSpriteFrame" })
    aliveSpriteFrame: SpriteFrame = null;

    @property({ type: SpriteFrame, displayName: "DeadSpriteFrame" })
    deadSpriteFrame: SpriteFrame = null;

    start() {
        this.node.getComponent(Sprite).spriteFrame = this.aliveSpriteFrame;
    }

    update(deltaTime: number) {

    }

    setToDestroyState() {
        this.node.getComponent(RigidBody2D).enabled = false;
        this.node.getComponent(Sprite).spriteFrame = this.deadSpriteFrame;
    }

}

