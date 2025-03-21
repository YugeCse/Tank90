import { _decorator, BoxCollider2D, Component, Node, RigidBody2D, Sprite, SpriteFrame } from 'cc';
import EventManager from '../manager/EventManager';
import { GlobalEvent } from '../data/GlobalEvent';
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
        this.node.getComponent(BoxCollider2D).enabled = false;
        this.node.getComponent(Sprite).spriteFrame = this.deadSpriteFrame;
        EventManager.instance.postEvent(GlobalEvent.HERO_MASTER_DIE); // 发送事件
    }

}

