export class Effects {
  constructor() {
    this.sounds = {};
  }

  loadSounds(scene) {
    this.sounds.place = scene.sound.add('placeSound');
    this.sounds.clear = scene.sound.add('clearSound');
  }

  playPlaceSound() {
    this.sounds.place?.play({ volume: 0.5 });
  }

  playClearSound() {
    this.sounds.clear?.play({ volume: 0.7 });
  }

  createNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} animate__animated animate__bounceInDown`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.classList.remove('animate__bounceInDown');
      notification.classList.add('animate__bounceOutUp');
      setTimeout(() => notification.remove(), 800);
    }, 3000);
  }

  createDragTrail(scene, gameObject) {
    const trail = scene.add.graphics();
    trail.fillStyle(0xFFD700, 0.3);
    trail.fillCircle(gameObject.x, gameObject.y, 5);
    scene.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 300,
      onComplete: () => trail.destroy()
    });
  }

  createCompletionCelebration(scene) {
    const flash = scene.add.graphics();
    flash.fillStyle(0xffffff, 0.5);
    flash.fillRect(0, 0, scene.game.config.width, scene.game.config.height);
    flash.setDepth(100);
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy()
    });

    for (let i = 0; i < 20; i++) {
      const firework = scene.add.graphics();
      firework.fillStyle(Phaser.Display.Color.RandomRGB().color, 1);
      firework.fillCircle(0, 0, Phaser.Math.Between(4, 10));
      firework.x = scene.game.config.width / 2;
      firework.y = scene.game.config.height / 2;
      firework.setDepth(50);
      scene.tweens.add({
        targets: firework,
        x: Phaser.Math.Between(0, scene.game.config.width),
        y: Phaser.Math.Between(0, scene.game.config.height),
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        duration: Phaser.Math.Between(800, 1500),
        delay: i * 50,
        ease: 'Power2',
        onComplete: () => firework.destroy()
      });
    }
  }
}
