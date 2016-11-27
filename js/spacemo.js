var score, bootState, loadState, titleState, playState, endState, game;

score = 0;
highscore = 0;

bootState = {
    create: function() {
        'use strict';

        // Load physics engine
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.state.start('load');
    }
};

loadState = {
    preload: function() {
        'use strict';
        var loadLbl;

        loadLbl = game.add.text(80, 160, 'loading...',
                                {font: '30px Courier',
                                 fill: '#ffffff'});
        
        // Load images
        game.load.image('player', 'assets/ship-red.png');
        game.load.image('enemy', 'assets/square-blue.png');
        game.load.image('pup-speed', 'assets/pup-green.png');
        game.load.image('pup-bullet', 'assets/pup-red.png');
        game.load.image('pup-weapon', 'assets/pup-blue.png');
        game.load.image('bullet', 'assets/bullet.png');
        game.load.image('background', 'assets/space-background.png');

        // Load sound effects
        game.load.audio('explosion', 'assets/explosion.wav');
        game.load.audio('grabpowerup', 'assets/powerup.wav');
        game.load.audio('fire1', 'assets/fire1.wav');
        game.load.audio('fire2', 'assets/fire2.wav');
    },
    create: function() {
        'use strict';
        game.state.start('title');
    }
};

titleState = {
    create: function() {
        'use strict';
        var nameLbl, startLbl, wKey;

        nameLbl = game.add.text(80, 160, 'SPACEMO',
                                {font: '50px Courier',
                                 fill: '#ffffff'});
        startLbl = game.add.text(80, 240, 'press "W" to start',
                                 {font: '30px Courier',
                                  fill: '#ffffff'});

        wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
        wKey.onDown.addOnce(this.start, this);
    },
    start: function() {
        'use strict';
        game.state.start('play');
    }
};

playState = {
    create: function() {
        'use strict';

        // Background
        this.background = game.add.tileSprite(0, 0, 800, 600, 'background');
        this.backgroundSpeed = 1;
        
        this.keyboard = game.input.keyboard;

        // Player
        this.player = game.add.sprite(game.world.centerX, 500, 'player');
        game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.playerSpeed = 200;

        // Enemies
        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        this.enemies.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemies.createMultiple(30, 'enemy');
        this.enemies.setAll('outOfBoundsKill', true);
        this.enemies.setAll('checkWorldBounds', true);
        // this.createEnemies();
        this.enemiesKilled = 0;
        this.enemyTime = 0;
        this.enemyTimeOffset = 800;
        this.enemySpeed = 100;
        this.explosion = game.add.audio('explosion');

        // Powerups
        this.grabPowerup = game.add.audio('grabpowerup');
        this.powerupSpeed = 100;
        
        this.speedPowerups = game.add.group();
        this.speedPowerups.enableBody = true;
        this.speedPowerups.physicsBodyType = Phaser.Physics.ARCADE;
        this.speedPowerups.createMultiple(5, 'pup-speed');
        this.speedPowerups.setAll('outOfBoundsKill', true);
        this.speedPowerups.setAll('checkWorldBounds', true);
        this.speedPowerupsKilled = 0;

        this.bulletPowerups = game.add.group();
        this.bulletPowerups.enableBody = true;
        this.bulletPowerups.physicsBodyType = Phaser.Physics.ARCADE;
        this.bulletPowerups.createMultiple(5, 'pup-bullet');
        this.bulletPowerups.setAll('outOfBoundsKill', true);
        this.bulletPowerups.setAll('checkWorldBounds', true);
        this.bulletPowerupsKilled = 0;

        this.weaponPowerups = game.add.group();
        this.weaponPowerups.enableBody = true;
        this.weaponPowerups.physicsBodyType = Phaser.Physics.ARCADE;
        this.weaponPowerups.createMultiple(5, 'pup-weapon');
        this.weaponPowerups.setAll('outOfBoundsKill', true);
        this.weaponPowerups.setAll('checkWorldBounds', true);
        this.weaponPowerupsKilled = 0;

        // Bullets
        this.bullets = game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple(30, 'bullet');
        this.bullets.setAll('anchor.x', 0.5);
        this.bullets.setAll('anchor.y', 1);
        this.bullets.setAll('outOfBoundsKill', true);
        this.bullets.setAll('checkWorldBounds', true);
        
        this.bulletTime = 0;
        this.bulletTimeOffset = 300;
        this.bulletSpeed = 500;

        this.fireButton = this.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.fire1 = game.add.audio('fire1');
        this.fire2 = game.add.audio('fire2');

        this.gun = 1;   // which gun is currently active

        // Score
        score = 0;
        this.scoreText = game.add.text(600, 10, 'Score: ' + this.score,
                                       {font: '30px Courier',
                                        fill: '#ffffff'});
    },
    update: function() {
        'use strict';

        game.physics.arcade.overlap(this.player, this.enemies,
                                    this.end, null, this);
        game.physics.arcade.overlap(this.bullets, this.enemies,
                                    this.killEnemy, null, this);
        game.physics.arcade.overlap(this.player, this.speedPowerups,
                                    this.addSpeed, null, this);
        game.physics.arcade.overlap(this.player, this.bulletPowerups,
                                    this.addBullet, null, this);
        game.physics.arcade.overlap(this.player, this.weaponPowerups,
                                    this.addWeapon, null, this);

        if (this.keyboard.isDown(Phaser.Keyboard.A)) {
            this.player.body.velocity.x = -this.playerSpeed;
        }
        else if (this.keyboard.isDown(Phaser.Keyboard.D)) {
            this.player.body.velocity.x = this.playerSpeed;
        }
        else {
            this.player.body.velocity.x = 0;
        }

        if (this.fireButton.isDown) {
            this.fire();
        }

        if (game.time.now > this.enemyTime) {
            this.dispatchEnemy();
        }
        
        this.background.tilePosition.y += this.backgroundSpeed;

        this.scoreText.text = 'Score: ' + score;
    },
    fire: function() {
        'use strict';
        var bullet1, bullet2;

        if (game.time.now > this.bulletTime) {
            if (this.gun === 1) {
                this.bulletTime = game.time.now + this.bulletTimeOffset;
                bullet1 = this.bullets.getFirstExists(false);

                if (bullet1) {
                    this.fire1.play();
                    bullet1.reset(this.player.x + 14, this.player.y);
                    bullet1.body.velocity.y = -this.bulletSpeed;
                }
            }
            else {
                this.bulletTime = game.time.now + this.bulletTimeOffset;
                this.fire2.play();

                bullet1 = this.bullets.getFirstExists(false);
                bullet1.reset(this.player.x + 2, this.player.y);
                bullet1.body.velocity.y = -this.bulletSpeed;

                bullet2 = this.bullets.getFirstExists(false);
                bullet2.reset(this.player.x + 30, this.player.y);
                bullet2.body.velocity.y = -this.bulletSpeed;
            }
        }
    },
    dispatchEnemy: function() {
        'use strict';
        var enemy, tween, xPos;
        
        enemy = this.enemies.getFirstExists(false);

        if (enemy) {
            xPos = game.rnd.integerInRange(1,6)*100;
            enemy.reset(xPos, -30);
            enemy.body.velocity.y = this.enemySpeed;
            this.enemyTime = game.time.now +
                this.enemyTimeOffset +
                game.rnd.integerInRange(0,8)*200;
            tween = game.add.tween(enemy)
                .to({x: xPos+50}, 1500,
                    Phaser.Easing.Linear.None,
                    true, 0, 1000, true);
        }
    },
    createEnemies: function() {
        'use strict';
        var i, j, enemy, tween;

        for (i=0; i<4; i++) {
            for (j=0; j<10; j++) {
                enemy = this.enemies.create(j*50, i*50, 'enemy');
                enemy.anchor.setTo(0.5, 0.5);
            }
        }

        this.enemies.x = 50;
        this.enemies.y = 100;

        tween = game.add.tween(this.enemies)
            .to({x: 300}, 4000,
                Phaser.Easing.Linear.None,
                true, 0, 1000, true);
        // tween.onLoop.add(this.descend, this);
        tween.onRepeat.add(this.descend, this);
    },
    descend: function() {
        'use strict';
        this.enemies.y += 15;
    },
    killEnemy: function(bullet, enemy) {
        'use strict';
        var xPos, yPos;

        xPos = enemy.position.x;
        yPos = enemy.position.y;
        bullet.kill();
        enemy.kill();
        this.explosion.play();
        score += 10;
        this.enemiesKilled++;
        if (game.rnd.integerInRange(1,10) === 10) {
            this.createPowerup(xPos, yPos);
        }
    },
    createPowerup: function(xPos, yPos) {
        'use strict';
        var powerup, rng;

        rng = game.rnd.integerInRange(1,7);
        if (rng <= 3) {
            powerup = this.speedPowerups.getFirstExists(false);
        }
        else if (rng >= 5) {
            powerup = this.bulletPowerups.getFirstExists(false);
        }
        else {
            powerup = this.weaponPowerups.getFirstExists(false);
        }

        if (powerup) {
            powerup.reset(xPos, yPos);
            powerup.body.velocity.y = this.powerupSpeed;
        }
    },
    addSpeed: function(player, powerup) {
        'use strict';
        powerup.kill();
        this.grabPowerup.play();
        score += 15;
        this.playerSpeed += 20;
    },
    addBullet: function(player, powerup) {
        'use strict';
        powerup.kill();
        this.grabPowerup.play();
        score += 15;
        if (this.bulletTimeOffset > 100) {
            this.bulletTimeOffset -= 20;
        }
    },
    addWeapon: function(player, powerup) {
        'use strict';
        powerup.kill();
        this.grabPowerup.play();
        score += 15;
        if (this.gun === 1) {
            this.gun++;
            this.bulletTimeOffset *= 2;
        }
    },
    end: function() {
        'use strict';
        this.explosion.play();
        game.state.start('end');
    }
};

endState = {
    create: function() {
        'use strict';
        var scoreLbl, nameLbl, startLbl, highscoreLbl, wKey;

        scoreLbl = game.add.text(600, 10, 'Score: ' + score,
                                 {font: '30px Courier',
                                  fill: '#ffffff'});
        nameLbl = game.add.text(80, 160, 'YOU DIED',
                                {font: '50px Courier',
                                 fill: '#ffffff'});
        startLbl = game.add.text(80, 240, 'press "W" to restart',
                                 {font: '30px Courier',
                                  fill: '#ffffff'});

        if (score <= highscore) {
            highscoreLbl = game.add.text(510, 50, 'High Score: ' + highscore,
                                         {font: '30px Courier',
                                          fill: '#ffffff'});
        }
        else {
            highscoreLbl = game.add.text(300, 50, 'New High Score!',
                                         {font: '30px Courier',
                                          fill: '#ffffff'});
            highscore = score;
        }
        
        wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
        wKey.onDown.addOnce(this.restart, this);
    },
    restart: function() {
        'use strict';
        game.state.start('title');
    }
};


game = new Phaser.Game(800, 600, Phaser.AUTO, 'game-div');

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('title', titleState);
game.state.add('play', playState);
game.state.add('end', endState);

game.state.start('boot');
