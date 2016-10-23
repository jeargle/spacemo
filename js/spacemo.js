var bootState, loadState, titleState, playState, endState, score, game;

score = 0;


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
        game.load.image('exit', 'assets/square-blue.png');
        game.load.image('bullet', 'assets/bullet.png');
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

        this.keyboard = game.input.keyboard;

        this.player = game.add.sprite(16, 16, 'player');
        game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.direction = 'E';

        this.exit = game.add.sprite(256, 256, 'exit');
        game.physics.enable(this.exit, Phaser.Physics.ARCADE);
        
        this.bullet = game.add.sprite(0, 0, 'bullet');
        game.physics.enable(this.bullet, Phaser.Physics.ARCADE);

        this.bulletSpeed = 500;
    },
    update: function() {
        'use strict';

        game.physics.arcade.overlap(this.bullet, this.exit, this.end, null, this);

        if (this.keyboard.isDown(Phaser.Keyboard.A)) {
            this.player.body.velocity.x = -175;
            this.direction = 'W';
        }
        else if (this.keyboard.isDown(Phaser.Keyboard.D)) {
            this.player.body.velocity.x = 175;
            this.direction = 'E';
        }
        else {
            this.player.body.velocity.x = 0;
        }

        if (this.keyboard.isDown(Phaser.Keyboard.W)) {
            this.player.body.velocity.y = -175;
            this.direction = 'N';
        }
        else if (this.keyboard.isDown(Phaser.Keyboard.S)) {
            this.player.body.velocity.y = 175;
            this.direction = 'S';
        }
        else {
            this.player.body.velocity.y = 0;
        }

        if (this.keyboard.isDown(Phaser.Keyboard.J)) {
            this.fire();
        }
    },
    fire: function() {
        'use strict';

        // console.log('(' + this.player.body.position.x + ', ' + this.player.body.position.y + ')');
        
        this.bullet.body.position.x = this.player.body.position.x + 15;
        this.bullet.body.position.y = this.player.body.position.y + 15;
        
        this.bullet.body.velocity.x = 0;
        this.bullet.body.velocity.y = 0;
        if (this.direction === 'N') {
            this.bullet.body.velocity.y = -this.bulletSpeed;
        }
        else if (this.direction === 'E') {
            this.bullet.body.velocity.x = this.bulletSpeed;
        }
        else if (this.direction === 'S') {
            this.bullet.body.velocity.y = this.bulletSpeed;
        }
        else if (this.direction === 'W') {
            this.bullet.body.velocity.x = -this.bulletSpeed;
        }
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
