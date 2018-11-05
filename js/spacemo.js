var score, highscore, level, playerState, game;


highscore = 0;


// titleState = {
//     create: function() {
//         'use strict';
//         var nameLbl, startLbl, wKey;

//         nameLbl = game.add.text(80, 160, 'SPACEMO',
//                                 {font: '50px Courier',
//                                  fill: '#ffffff'});
//         startLbl = game.add.text(80, 240, 'press "W" to start',
//                                  {font: '30px Courier',
//                                   fill: '#ffffff'});

//         wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
//         wKey.onDown.addOnce(this.start, this);
//     },
//     start: function() {
//         'use strict';

//         // Reset game state
//         score = 0;
//         level = 0;
//         playerState = {
//             speed: 200,
//             bulletTimeOffset: 300,
//             gun: 1      // which gun is currently active
//         };

//         game.state.start('play');
//     }
// };

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

        // Enemies
        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        this.enemies.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemies.createMultiple(30, 'enemy');
        this.enemies.setAll('outOfBoundsKill', true);
        this.enemies.setAll('checkWorldBounds', true);
        this.enemiesKilled = 0;
        this.enemyTime = 0;
        this.enemyTimeOffset = 800 - (level*100);
        this.enemySpeed = 100 + (level*10);
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

        this.bulletPowerups = game.add.group();
        this.bulletPowerups.enableBody = true;
        this.bulletPowerups.physicsBodyType = Phaser.Physics.ARCADE;
        this.bulletPowerups.createMultiple(5, 'pup-bullet');
        this.bulletPowerups.setAll('outOfBoundsKill', true);
        this.bulletPowerups.setAll('checkWorldBounds', true);

        this.weaponPowerups = game.add.group();
        this.weaponPowerups.enableBody = true;
        this.weaponPowerups.physicsBodyType = Phaser.Physics.ARCADE;
        this.weaponPowerups.createMultiple(5, 'pup-weapon');
        this.weaponPowerups.setAll('outOfBoundsKill', true);
        this.weaponPowerups.setAll('checkWorldBounds', true);

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
        this.bulletSpeed = 500;

        this.fireButton = this.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.fire1 = game.add.audio('fire1');
        this.fire2 = game.add.audio('fire2');

        // Score
        this.scoreText = game.add.text(600, 10, 'Score: ' + score,
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
            this.player.body.velocity.x = -playerState.speed;
        }
        else if (this.keyboard.isDown(Phaser.Keyboard.D)) {
            this.player.body.velocity.x = playerState.speed;
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
    /**
     * Fire player's weapon.
     */
    fire: function() {
        'use strict';
        var bullet1, bullet2;

        if (game.time.now > this.bulletTime) {
            if (playerState.gun === 1) {
                this.bulletTime = game.time.now + playerState.bulletTimeOffset;
                bullet1 = this.bullets.getFirstExists(false);

                if (bullet1) {
                    this.fire1.play();
                    bullet1.reset(this.player.x + 14, this.player.y);
                    bullet1.body.velocity.y = -this.bulletSpeed;
                }
            }
            else {
                this.bulletTime = game.time.now + playerState.bulletTimeOffset;
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
    /**
     * Add a new enemy to the screen.
     */
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
    /**
     * Kill an enemy.  Remove enemy and bullet and play death sound.
     * @param bullet
     * @param enemy
     */
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

        if (this.enemiesKilled === 10) {
            game.state.start('level');
        }

        if (game.rnd.integerInRange(1,10) === 10) {
            this.createPowerup(xPos, yPos);
        }
    },
    /**
     * Make a new powerup at the given position.
     * @param xPos - x position
     * @param yPos - y position
     */
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
    /**
     * Increase player's movement speed.
     * @param player
     * @param powerup
     */
    addSpeed: function(player, powerup) {
        'use strict';
        powerup.kill();
        this.grabPowerup.play();
        score += 15;
        playerState.speed += 20;
    },
    /**
     * Increase player's firing rate.
     * @param player
     * @param powerup
     */
    addBullet: function(player, powerup) {
        'use strict';
        powerup.kill();
        this.grabPowerup.play();
        score += 15;
        if (playerState.bulletTimeOffset > 100) {
            playerState.bulletTimeOffset -= 20;
        }
    },
    /**
     * Add a second gun but halve the firing rate.
     * @param player
     * @param powerup
     */
    addWeapon: function(player, powerup) {
        'use strict';
        powerup.kill();
        this.grabPowerup.play();
        score += 15;
        if (playerState.gun === 1) {
            playerState.gun++;
            playerState.bulletTimeOffset *= 2;
        }
    },
    /**
     * Exit to game over screen.
     */
    end: function() {
        'use strict';
        this.explosion.play();
        game.state.start('end');
    }
};

levelState = {
    create: function() {
        'use strict';
        var nameLbl, startLbl, wKey;

        nameLbl = game.add.text(80, 160, 'LEVEL ' + (level+1) + ' COMPLETE',
                                {font: '50px Courier',
                                 fill: '#ffffff'});
        startLbl = game.add.text(80, 240, 'press "W" to start next level',
                                 {font: '30px Courier',
                                  fill: '#ffffff'});

        wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
        wKey.onDown.addOnce(this.start, this);
    },
    start: function() {
        'use strict';
        level += 1;
        game.state.start('play');
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
    /**
     * Go back to title screen.
     */
    restart: function() {
        'use strict';
        game.state.start('title');
    }
};



// game = new Phaser.Game(800, 600, Phaser.AUTO, 'game-div');




const bootScene = {
    key: 'boot',
    active: true,
    init: (config) => {
        console.log('[BOOT] init', config);
    },
    preload: () => {
        console.log('[BOOT] preload');
    },
    create: (config) => {
        console.log('[BOOT] create', config);

        game.scene.start('load');
        game.scene.remove('boot');
    },
    update: () => {
        console.log('[BOOT] update');
    }
};

const loadScene = {
    key: 'load',
    // active: true,
    renderToTexture: true,
    x: 64,
    y: 64,
    width: 320,
    height: 200,
    init: (config) => {
        console.log('[LOAD] init', config);
    },
    preload: function() {
        'use strict';
        console.log('[LOAD] preload');
        var loadLbl;

        loadLbl = this.add.text(80, 160, 'loading...',
                                {font: '30px Courier',
                                 fill: '#ffffff'});

        // Load images
        this.load.image('player', 'assets/ship-red.png');
        this.load.image('enemy', 'assets/ray-blue.png');
        this.load.image('pup-speed', 'assets/pup-green.png');
        this.load.image('pup-bullet', 'assets/pup-red.png');
        this.load.image('pup-weapon', 'assets/pup-blue.png');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('background', 'assets/space-background.png');

        // Load sound effects
        this.load.audio('explosion', 'assets/explosion.wav');
        this.load.audio('grabpowerup', 'assets/powerup.wav');
        this.load.audio('fire1', 'assets/fire1.wav');
        this.load.audio('fire2', 'assets/fire2.wav');
    },
    create: function(config) {
        'use strict';
        console.log('[LOAD] create', config);

        game.scene.start('title');
        game.scene.remove('load');
    },
    update: () => {
        console.log('[LOAD] update');
    }
};

const titleScene = {
    key: 'title',
    // active: true,
    init: (config) => {
        console.log('[TITLE] init', config);
    },
    preload: () => {
        console.log('[TITLE] preload');
    },
    update: () => {
        console.log('[TITLE] update');
    },
    create: function(config) {
        'use strict';
        console.log('[TITLE] create', config);
        var nameLbl, startLbl, wKey;

        nameLbl = this.add.text(80, 160, 'SPACEMO',
                                {font: '50px Courier',
                                 fill: '#ffffff'});
        startLbl = this.add.text(80, 240, 'press "W" to start',
                                 {font: '30px Courier',
                                  fill: '#ffffff'});

        this.input.keyboard.on('keydown_W', this.start, this);
    },
    extend: {
        start: function() {
            'use strict';

            console.log('start');

            // Reset game state
            score = 0;
            level = 0;
            playerState = {
                speed: 200,
                bulletTimeOffset: 300,
                gun: 1      // which gun is currently active
            };

            game.scene.start('play');
            game.scene.remove('title');
        }
    }
};

const playScene = {
    key: 'play',
    create: function(config) {
        'use strict';

        // Background
        this.background = this.add.tileSprite(0, 0, 800, 600, 'background');
        this.backgroundSpeed = 1;

        this.keyboard = this.input.keyboard;

        // Player
        // this.player = this.add.sprite(game.world.centerX, 500, 'player');
        this.player = this.physics.add.sprite(this.centerX, 500, 'player');
        // game.physics.enable(this.player, Phaser.Physics.ARCADE);

        // Enemies
        // this.enemies = game.add.group();
        this.enemies = this.physics.add.group();
        this.enemies.enableBody = true;
        // this.enemies.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemies.createMultiple(30, 'enemy');
        // this.enemies.setAll('outOfBoundsKill', true);
        // this.enemies.setAll('checkWorldBounds', true);
        this.enemiesKilled = 0;
        this.enemyTime = 0;
        this.enemyTimeOffset = 800 - (level*100);
        this.enemySpeed = 100 + (level*10);
        // this.explosion = this.add.audio('explosion');

        // Powerups
        // this.grabPowerup = this.add.audio('grabpowerup');
        this.powerupSpeed = 100;

        // this.speedPowerups = game.add.group();
        this.speedPowerups = this.physics.add.group();
        this.speedPowerups.enableBody = true;
        // this.speedPowerups.physicsBodyType = Phaser.Physics.ARCADE;
        this.speedPowerups.createMultiple(5, 'pup-speed');
        // this.speedPowerups.setAll('outOfBoundsKill', true);
        // this.speedPowerups.setAll('checkWorldBounds', true);

        // this.bulletPowerups = game.add.group();
        this.bulletPowerups = this.physics.add.group();
        this.bulletPowerups.enableBody = true;
        // this.bulletPowerups.physicsBodyType = Phaser.Physics.ARCADE;
        this.bulletPowerups.createMultiple(5, 'pup-bullet');
        // this.bulletPowerups.setAll('outOfBoundsKill', true);
        // this.bulletPowerups.setAll('checkWorldBounds', true);

        // this.weaponPowerups = game.add.group();
        this.weaponPowerups = this.physics.add.group();
        this.weaponPowerups.enableBody = true;
        // this.weaponPowerups.physicsBodyType = Phaser.Physics.ARCADE;
        this.weaponPowerups.createMultiple(5, 'pup-weapon');
        // this.weaponPowerups.setAll('outOfBoundsKill', true);
        // this.weaponPowerups.setAll('checkWorldBounds', true);

        // Bullets
        // this.bullets = game.add.group();
        this.bullets = this.physics.add.group();
        this.bullets.enableBody = true;
        // this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple(30, 'bullet');
        // this.bullets.setAll('anchor.x', 0.5);
        // this.bullets.setAll('anchor.y', 1);
        // this.bullets.setAll('outOfBoundsKill', true);
        // this.bullets.setAll('checkWorldBounds', true);

        this.bulletTime = 0;
        this.bulletSpeed = 500;

        // this.fireButton = this.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.fireButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACEBAR);
        // this.key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        // this.fire1 = this.add.audio('fire1');
        // this.fire2 = this.add.audio('fire2');

        // Score
        this.scoreText = this.add.text(600, 10, 'Score: ' + score,
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
            this.player.body.velocity.x = -playerState.speed;
        }
        else if (this.keyboard.isDown(Phaser.Keyboard.D)) {
            this.player.body.velocity.x = playerState.speed;
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
    extend: {
        /**
         * Fire player's weapon.
         */
        fire: function() {
            'use strict';
            var bullet1, bullet2;

            if (game.time.now > this.bulletTime) {
                if (playerState.gun === 1) {
                    this.bulletTime = game.time.now + playerState.bulletTimeOffset;
                    bullet1 = this.bullets.getFirstExists(false);

                    if (bullet1) {
                        // this.fire1.play();
                        this.sound.play('fire1');
                        bullet1.reset(this.player.x + 14, this.player.y);
                        bullet1.body.velocity.y = -this.bulletSpeed;
                    }
                }
                else {
                    this.bulletTime = game.time.now + playerState.bulletTimeOffset;
                    // this.fire2.play();
                    this.sound.play('fire2');

                    bullet1 = this.bullets.getFirstExists(false);
                    bullet1.reset(this.player.x + 2, this.player.y);
                    bullet1.body.velocity.y = -this.bulletSpeed;

                    bullet2 = this.bullets.getFirstExists(false);
                    bullet2.reset(this.player.x + 30, this.player.y);
                    bullet2.body.velocity.y = -this.bulletSpeed;
                }
            }
        },
        /**
         * Add a new enemy to the screen.
         */
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
        /**
         * Kill an enemy.  Remove enemy and bullet and play death sound.
         * @param bullet
         * @param enemy
         */
        killEnemy: function(bullet, enemy) {
            'use strict';
            var xPos, yPos;

            xPos = enemy.position.x;
            yPos = enemy.position.y;
            bullet.kill();
            enemy.kill();
            this.sound.play('explosion');
            score += 10;
            this.enemiesKilled++;

            if (this.enemiesKilled === 10) {
                game.state.start('level');
            }

            if (game.rnd.integerInRange(1,10) === 10) {
                this.createPowerup(xPos, yPos);
            }
        },
        /**
         * Make a new powerup at the given position.
         * @param xPos - x position
         * @param yPos - y position
         */
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
        /**
         * Increase player's movement speed.
         * @param player
         * @param powerup
         */
        addSpeed: function(player, powerup) {
            'use strict';
            powerup.kill();
            // this.grabPowerup.play();
            this.sound.play('grabPowerup');
            score += 15;
            playerState.speed += 20;
        },
        /**
         * Increase player's firing rate.
         * @param player
         * @param powerup
         */
        addBullet: function(player, powerup) {
            'use strict';
            powerup.kill();
            // this.grabPowerup.play();
            this.sound.play('grabPowerup');
            score += 15;
            if (playerState.bulletTimeOffset > 100) {
                playerState.bulletTimeOffset -= 20;
            }
        },
        /**
         * Add a second gun but halve the firing rate.
         * @param player
         * @param powerup
         */
        addWeapon: function(player, powerup) {
            'use strict';
            powerup.kill();
            // this.grabPowerup.play();
            this.sound.play('grabPowerup');
            score += 15;
            if (playerState.gun === 1) {
                playerState.gun++;
                playerState.bulletTimeOffset *= 2;
            }
        },
        /**
         * Exit to game over screen.
         */
        end: function() {
            'use strict';
            // this.explosion.play();
            this.sound.play('explosion');
            game.state.start('end');
        }
    }
};


const gameConfig = {
    type: Phaser.CANVAS,
    parent: 'game-div',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {
                y: 600
            },
            height: 775,
            width: 1600,
            x: 0,
            y: -200
        }
    },
    scene: [
        bootScene,
        loadScene,
        titleScene,
        playScene,
        // levelScene,
        // endScene
    ],
};

game = new Phaser.Game(gameConfig);
game.scene.start('boot', { someData: '...arbitrary data' });
