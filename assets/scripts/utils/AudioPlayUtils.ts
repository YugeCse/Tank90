import { AudioClip, AudioSource } from "cc";

export class AudioPlayUtils {
  private static _instance: AudioPlayUtils;
  public static get Instance(): AudioPlayUtils {
    if (this._instance == null) {
      this._instance = new AudioPlayUtils();
    }
    return this._instance;
  }
  private _audioSource: AudioSource;

  private _statrtGameAudio: AudioClip;

  private _attackAudio: AudioClip;

  private _moveAudio: AudioClip;

  private _bulletCrackAudio: AudioClip;

  private _heroTankCrackAudio: AudioClip;

  private _enemyTankCrackAudio: AudioClip;

  private _isPlay: boolean = true;

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

  public playStartGameAudio() {
    if (!this._isPlay) {
      return;
    }
    this._audioSource.playOneShot(this._statrtGameAudio, 1);
    this._isPlay = true;
  }

  public playAttackAudio() {
    if (!this._isPlay) {
      return;
    }
    this._audioSource.playOneShot(this._attackAudio, 1);
    this._isPlay = true;
  }

  public playMoveAudio() {
    if (!this._isPlay) {
      return;
    }
    this._audioSource.playOneShot(this._moveAudio, 1);
    this._isPlay = true;
  }

  public playBulletCrackAudio() {
    if (!this._isPlay) {
      return;
    }
    this._audioSource.playOneShot(this._bulletCrackAudio, 1);
    this._isPlay = true;
  }

  public playHeroTankCrackAudio() {
    if (!this._isPlay) {
      return;
    }
    this._audioSource.playOneShot(this._heroTankCrackAudio, 1);
    this._isPlay = true;
  }

  public playEnemyTankCrackAudio() {
    if (!this._isPlay) {
      return;
    }
    this._audioSource.playOneShot(this._enemyTankCrackAudio, 1);
    this._isPlay = true;
  }

}
