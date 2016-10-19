var jMain, score, game;

score = 0;


jMain = {
    preload: function() {
        'use strict';
    },
    create: function() {
        'use strict';
    },
    update: function() {
        'use strict';
    }
}


game = new Phaser.Game(
    800, 600,
    Phaser.AUTO, '',
    {preload: jMain.preload,
     create: jMain.create,
     update: jMain.update}
);
