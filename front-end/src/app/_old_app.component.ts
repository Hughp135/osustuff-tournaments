import { Component } from '@angular/core';
import * as Phaser from 'phaser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'front-end';
  game: any;
  player: any;
  cursors: any;
  minimap: any;

  constructor() {
    this.game = new Phaser.Game({
      width: window.innerWidth,
      height: window.innerHeight,
      scene: {
        preload: this.preload,
        create: this.create,
        update: this.update
      },
      backgroundColor: '#dcdcdc',
      physics: {
        default: 'arcade'
      }
    });
  }

  preload = function() {
    this.load.image('user', 'assets/user-icon.png', 128, 128);
    this.load.image('grid', 'assets/grid-test.png');
  };

  create = function() {
    const { width, height } = this.sys.game.canvas;
    const gameWidth = 2000;
    const gameHeight = 2000;

    const img = this.add.image(0, 0, 'grid').setOrigin(0);

    this.cameras.main.setBounds(0, 0, gameWidth, gameHeight);
    this.physics.world.setBounds(0, 0, gameWidth, gameHeight);
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0.1)');
    this.cursors = this.input.keyboard.createCursorKeys();
    const minimapScale = 0.1;
    this.minimap = this.cameras
      .add(width - 200, height - 200, 200, 200)
      .setZoom(minimapScale)
      .setName('mini');
    // this.minimap.setBackgroundColor('rgba(0,0,0,0.2)');
    this.minimap.scrollX = 900;
    this.minimap.scrollY = 900;

    this.player = this.physics.add.image(0, 0, 'user').setDisplaySize(128, 128);
    this.player.setCollideWorldBounds(true);

    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
  };

  update = function() {
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-500);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(500);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-500);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(500);
    }
  };
}
