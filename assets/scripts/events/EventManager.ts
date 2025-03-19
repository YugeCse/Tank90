import { EventTarget } from "cc";

/** 事件管理类 */
export default class EventManager {
	/** 内置静态对象 */
	private static _instance: EventManager;

	/** 事件目标对象 */
	private eventTarget: EventTarget;

	private constructor() {
		this.eventTarget = new EventTarget();
	}

	/** 获取实例对象 */
	instance(): EventManager {
		if (EventManager._instance == null) {
			EventManager._instance = new EventManager();
		}
		return EventManager._instance;
	}

	/**
	 * 发送事件
	 * @param event 事件名称
	 * @param args 参数
	 */
	postEvent(event: string, ...args: any[]) {
		this.eventTarget.emit(event, ...args);
	}

	/**
	 * 订阅事件
	 * @param event 事件名称
	 * @param target 订阅者
	 * @param callback 回调函数
	 */
	subscribe(event: string, target: any, callback: (...args: any[]) => void) {
		this.eventTarget.on(event, callback, target);
	}
}
