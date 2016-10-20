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

        // Load art assets
    },
    create: function() {
        'use strict';
        game.state.start('title');
    }
};

titleState = {
    create: function() {
        'use strict';
    },
    start: function() {
        'use strict';
        game.state.start('play');
    }
};

playState = {
    create: function() {
        'use strict';
    },
    update: function() {
        'use strict';
    },
    end: function() {
        'use strict';
        game.state.start('play');
    }
};

endState = {
    create: function() {
        'use strict';
    },
    restart: function() {
        'use strict';
        game.state.start('title');
    }
};


game = new Phaser.Game(800, 600, Phaser.AUTO, 'game-div');

game.state.add.('boot', bootState);
game.state.add.('load', loadState);
game.state.add.('title', titleState);
game.state.add.('play', playState);
game.state.add.('end', endState);
