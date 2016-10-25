var bootState, loadState, titleState, playState, endState, game;

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
        
        // Load art assets
        game.load.image('player', 'assets/square-red.png');
        game.load.image('enemy', 'assets/square-blue.png');
        game.load.image('bullet', 'assets/bullet.png');
        game.load.image('background', 'assets/space-background.png');
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
        this.backgroundSpeed = 2;
        
        this.keyboard = game.input.keyboard;

        // Player
        this.player = game.add.sprite(game.world.centerX, 500, 'player');
        game.physics.enable(this.player, Phaser.Physics.ARCADE);

        // Enemies
        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        this.enemies.physicsBodyType = Phaser.Physics.ARCADE;
        this.createEnemies();

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
        this.bulletTimeOffset = 200;
        this.bulletSpeed = 500;

        this.fireButton = this.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        // Score
        this.score = 0;
        this.scoreText = game.add.text(600, 10, 'Score: ' + this.score,
                                       {font: '30px Courier',
                                        fill: '#ffffff'});
    },
    update: function() {
        'use strict';

        if (this.enemies.countLiving() === 0) {
            this.end();
        }
        
        game.physics.arcade.overlap(this.bullets, this.enemies,
                                    this.killEnemy, null, this);

        if (this.keyboard.isDown(Phaser.Keyboard.A)) {
            this.player.body.velocity.x = -175;
        }
        else if (this.keyboard.isDown(Phaser.Keyboard.D)) {
            this.player.body.velocity.x = 175;
        }
        else {
            this.player.body.velocity.x = 0;
        }

        if (this.fireButton.isDown) {
            this.fire();
        }

        this.background.tilePosition.y += this.backgroundSpeed;

        this.scoreText.text = 'Score: ' + this.score;
    },
    fire: function() {
        'use strict';
        var bullet;

        if (game.time.now > this.bulletTime) {
            bullet = this.bullets.getFirstExists(false);

            if (bullet) {
                bullet.reset(this.player.x + 14, this.player.y);
                bullet.body.velocity.y = -this.bulletSpeed;
                this.bulletTime = game.time.now + this.bulletTimeOffset;
            }
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
        bullet.kill();
        enemy.kill();
        this.score += 10;
    },
    end: function() {
        'use strict';
        game.state.start('end');
    }
};

endState = {
    create: function() {
        'use strict';
        var nameLbl, startLbl, wKey;

        nameLbl = game.add.text(80, 160, 'YOU WON',
                                {font: '50px Courier',
                                 fill: '#ffffff'});
        startLbl = game.add.text(80, 240, 'press "W" to restart',
                                 {font: '30px Courier',
                                  fill: '#ffffff'});

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
