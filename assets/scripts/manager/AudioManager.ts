import { AudioClip, AudioSource } from "cc";

/** 音频管理类 */
export class AudioManager {
	/** 静态实例 */
	private static _instance: AudioManager;

	/** 单例对象 */
	public static get Instance(): AudioManager {
		if (this._instance == null) {
			this._instance = new AudioManager();
		}
		return this._instance;
	}

  /** 是否允许播放声音 */
	private _isPlay: boolean = true;

  /** 声音播放的对象 */
	private _audioSource: AudioSource;

  /** 开始游戏的声音源 */
	private _statrtGameAudio: AudioClip;

  /** 发射子弹的声音源 */
	private _attackAudio: AudioClip;

  /** 移动的声音源 */
	private _moveAudio: AudioClip;

  /** 子弹爆炸的声音源 */
	private _bulletCrackAudio: AudioClip;

  /** 英雄坦克爆炸的声音源 */
	private _heroTankCrackAudio: AudioClip;

  /** 敌方坦克爆炸的声音源 */
	private _enemyTankCrackAudio: AudioClip;

	/**
	 * 初始化
	 * @param allowPlay 是否允许播放
	 * @param startGameAudio
	 * @param attackAudio
	 * @param moveAudio
	 * @param bulletCrackAudio
	 * @param heroTankCrackAudio
	 * @param enemyTankCrackAudio
	 */
	public init(
		allowPlay: boolean,
		startGameAudio: AudioClip,
		attackAudio: AudioClip,
		moveAudio: AudioClip,
		bulletCrackAudio: AudioClip,
		heroTankCrackAudio: AudioClip,
		enemyTankCrackAudio: AudioClip
	) {
		this._isPlay = allowPlay;
		this._audioSource = new AudioSource();
		this._statrtGameAudio = startGameAudio;
		this._attackAudio = attackAudio;
		this._moveAudio = moveAudio;
		this._bulletCrackAudio = bulletCrackAudio;
		this._heroTankCrackAudio = heroTankCrackAudio;
		this._enemyTankCrackAudio = enemyTankCrackAudio;
	}

	/** 播放游戏开始声音 */
	public playStartGameAudio() {
		if (!this._isPlay) {
			return;
		}
		this._audioSource.playOneShot(this._statrtGameAudio, 1);
		this._isPlay = true;
	}

	/** 播放攻击声音 */
	public playAttackAudio() {
		if (!this._isPlay) {
			return;
		}
		this._audioSource.playOneShot(this._attackAudio, 1);
		this._isPlay = true;
	}

	/** 播放移动的声音 */
	public playMoveAudio() {
		if (!this._isPlay) {
			return;
		}
		this._audioSource.playOneShot(this._moveAudio, 1);
		this._isPlay = true;
	}

	/** 播放子弹爆炸的声音 */
	public playBulletCrackAudio() {
		if (!this._isPlay) {
			return;
		}
		this._audioSource.playOneShot(this._bulletCrackAudio, 1);
		this._isPlay = true;
	}

	/** 播放英雄坦克爆炸的声音 */
	public playHeroTankCrackAudio() {
		if (!this._isPlay) {
			return;
		}
		this._audioSource.playOneShot(this._heroTankCrackAudio, 1);
		this._isPlay = true;
	}

	/** 播放敌方坦克爆炸的声音 */
	public playEnemyTankCrackAudio() {
		if (!this._isPlay) {
			return;
		}
		this._audioSource.playOneShot(this._enemyTankCrackAudio, 1);
		this._isPlay = true;
	}
}
