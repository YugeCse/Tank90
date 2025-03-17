import { _decorator, Component, Graphics, math, Node, UITransform } from "cc";
import { Constants } from "../data/Constants";
const { ccclass, property } = _decorator;

@ccclass("Map")
export class Map extends Component {
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
	}

	update(deltaTime: number) {}
}
