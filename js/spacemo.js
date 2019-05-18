let score, highscore, level, playerState, game


highscore = 0


class BootScene extends Phaser.Scene {
    constructor() {
        super('boot')
    }

    init(config) {
        console.log('[BOOT] init', config)
    }

    preload() {
        console.log('[BOOT] preload')
    }

    create() {
        console.log('[BOOT] create')

        game.scene.start('load')
        game.scene.remove('boot')
    }

    update() {
        console.log('[BOOT] update')
    }
}

class LoadScene extends Phaser.Scene {
    constructor() {
        super('load')
    }

    init(config) {
        console.log('[LOAD] init', config)
    }

    preload() {
        'use strict'
        console.log('[LOAD] preload')
        let loadLbl

        loadLbl = this.add.text(80, 160, 'loading...',
                                {font: '30px Courier',
                                 fill: '#ffffff'})

        // Load images
        this.load.image('player', 'assets/ship-red.png')
        this.load.image('enemy', 'assets/ray-blue.png')
        this.load.image('pup-speed', 'assets/pup-green.png')
        this.load.image('pup-bullet', 'assets/pup-red.png')
        this.load.image('pup-weapon', 'assets/pup-blue.png')
        this.load.image('bullet', 'assets/bullet.png')
        this.load.image('background', 'assets/space-background.png')

        // Load sound effects
        this.load.audio('explosion', 'assets/explosion.wav')
        this.load.audio('grabpowerup', 'assets/powerup.wav')
        this.load.audio('fire1', 'assets/fire1.wav')
        this.load.audio('fire2', 'assets/fire2.wav')
    }

    create() {
        'use strict'

        console.log('[LOAD] create')

        game.scene.start('title')
        game.scene.remove('load')
    }

    update() {
        console.log('[LOAD] update')
    }
}

class TitleScene extends Phaser.Scene {
    constructor() {
        super('title')
    }

    init(config) {
        console.log('[TITLE] init', config)
    }

    preload() {
        console.log('[TITLE] preload')
    }

    update() {
        console.log('[TITLE] update')
    }

    create() {
        'use strict'
        let nameLbl, startLbl, wKey

        console.log('[TITLE] create')

        nameLbl = this.add.text(80, 160, 'SPACEMO',
                                {font: '50px Courier',
                                 fill: '#ffffff'})
        startLbl = this.add.text(80, 240, 'press "W" to start',
                                 {font: '30px Courier',
                                  fill: '#ffffff'})

        this.input.keyboard.on('keydown_W', this.start, this)
    }

    start() {
        'use strict'

        console.log('start')

        // Reset game state
        score = 0
        level = 0
        playerState = {
            speed: 200,
            bulletTimeOffset: 300,
            gun: 1      // which gun is currently active
        }

        game.scene.start('play')
        game.scene.remove('title')
    }
}

class PlayScene extends Phaser.Scene {
    constructor() {
        super('play')
    }

    create() {
        'use strict'

        // Background
        this.background = this.add.tileSprite(0, 0, 800, 600, 'background')
        this.backgroundSpeed = 1

        // Player
        // this.player = this.physics.add.sprite(this.centerX, 500, 'player')
        this.player = this.physics.add.sprite(400, 500, 'player')
        this.player.setCollideWorldBounds(true)

        // Enemies
        // this.enemies = game.add.group()
        this.enemies = this.physics.add.group()
        this.enemies.enableBody = true
        // this.enemies.physicsBodyType = Phaser.Physics.ARCADE
        this.enemies.createMultiple(30, 'enemy')
        // this.enemies.setAll('outOfBoundsKill', true)
        // this.enemies.setAll('checkWorldBounds', true)
        this.enemiesKilled = 0
        this.enemyTime = 0
        this.enemyTimeOffset = 800 - (level*100)
        this.enemySpeed = 100 + (level*10)
        // this.explosion = this.add.audio('explosion')

        // Powerups
        // this.grabPowerup = this.add.audio('grabpowerup')
        this.powerupSpeed = 100

        // this.speedPowerups = game.add.group()
        this.speedPowerups = this.physics.add.group()
        this.speedPowerups.enableBody = true
        // this.speedPowerups.physicsBodyType = Phaser.Physics.ARCADE
        this.speedPowerups.createMultiple(5, 'pup-speed')
        // this.speedPowerups.setAll('outOfBoundsKill', true)
        // this.speedPowerups.setAll('checkWorldBounds', true)

        // this.bulletPowerups = game.add.group()
        this.bulletPowerups = this.physics.add.group()
        this.bulletPowerups.enableBody = true
        // this.bulletPowerups.physicsBodyType = Phaser.Physics.ARCADE
        this.bulletPowerups.createMultiple(5, 'pup-bullet')
        // this.bulletPowerups.setAll('outOfBoundsKill', true)
        // this.bulletPowerups.setAll('checkWorldBounds', true)

        // this.weaponPowerups = game.add.group()
        this.weaponPowerups = this.physics.add.group()
        this.weaponPowerups.enableBody = true
        // this.weaponPowerups.physicsBodyType = Phaser.Physics.ARCADE
        this.weaponPowerups.createMultiple(5, 'pup-weapon')
        // this.weaponPowerups.setAll('outOfBoundsKill', true)
        // this.weaponPowerups.setAll('checkWorldBounds', true)

        // Bullets
        this.bullets = this.physics.add.group({
            key: 'bullet',
            active: false,
            repeat: 30,
            setXY: { x: 0, y: -50, stepX: 50 }
        })
        let bullets = this.bullets
        bullets.children.iterate(function(bullet) {
            bullets.killAndHide(bullet)
        })
        // this.bullets.setAll('anchor.x', 0.5)
        // this.bullets.setAll('anchor.y', 1)
        // this.bullets.setAll('outOfBoundsKill', true)
        // this.bullets.setAll('checkWorldBounds', true)

        this.bulletTime = 0
        this.bulletSpeed = 500

        // Score
        this.scoreText = this.add.text(600, 10, 'Score: ' + score,
                                       {font: '30px Courier',
                                        fill: '#ffffff'})

        // Controls
        this.cursors = this.input.keyboard.addKeys({
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
            'fire': Phaser.Input.Keyboard.KeyCodes.SPACE,
        })

        // this.fire1 = this.add.audio('fire1')
        // this.fire2 = this.add.audio('fire2')
        this.fire1 = this.sound.add('fire1')
        this.fire2 = this.sound.add('fire2')

        this.physics.add.overlap(this.player, this.enemies,
                                 this.end, null, this)
        this.physics.add.overlap(this.bullets, this.enemies,
                                 this.killEnemy, null, this)
        this.physics.add.overlap(this.player, this.speedPowerups,
                                 this.addSpeed, null, this)
        this.physics.add.overlap(this.player, this.bulletPowerups,
                                 this.addBullet, null, this)
        this.physics.add.overlap(this.player, this.weaponPowerups,
                                 this.addWeapon, null, this)

    }

    update() {
        'use strict'

        // console.log('[PLAY] update')

        if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(playerState.speed)
        }
        else if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-playerState.speed)
        }
        else {
            this.player.body.setVelocityX(0)
        }

        if (this.cursors.fire.isDown) {
            this.fire()
        }

        if (this.time.now > this.enemyTime) {
            this.dispatchEnemy()
        }

        this.background.tilePositionY -= this.backgroundSpeed
        // this.background.y += this.backgroundSpeed

        this.scoreText.text = 'Score: ' + score
    }

    /**
     * Fire player's weapon.
     */
    fire() {
        'use strict'
        let bullet1, bullet2

        console.log('FIRE')

        if (this.time.now > this.bulletTime) {
            if (playerState.gun === 1) {
                this.bulletTime = this.time.now + playerState.bulletTimeOffset
                bullet1 = this.bullets.getFirstDead(false)

                if (bullet1) {
                    this.fire1.play()
                    // this.sound.play('fire1')
                    // bullet1.reset(this.player.x + 14, this.player.y)
                    bullet1.setPosition(this.player.x, this.player.y - 14)
                    bullet1.body.velocity.y = -this.bulletSpeed
                }
            }
            else {
                this.bulletTime = this.time.now + playerState.bulletTimeOffset
                this.fire2.play()
                // this.sound.play('fire2')

                bullet1 = this.bullets.getFirstDead(false)
                bullet1.setPosition(this.player.x + 2, this.player.y)
                bullet1.body.velocity.y = -this.bulletSpeed

                bullet2 = this.bullets.getFirstDead(false)
                bullet2.setPosition(this.player.x + 30, this.player.y)
                bullet2.body.velocity.y = -this.bulletSpeed
            }
        }
    }

    /**
     * Add a new enemy to the screen.
     */
    dispatchEnemy() {
        'use strict'
        let enemy, tween, xPos

        // enemy = this.enemies.getFirstExists(false)
        // enemy = this.enemies.getFirstAlive(false)
        enemy = this.enemies.getFirstDead(false)

        if (enemy) {
            xPos = game.rnd.integerInRange(1,6)*100
            enemy.setPosition(xPos, -30)
            enemy.body.velocity.y = this.enemySpeed
            this.enemyTime = this.time.now +
                this.enemyTimeOffset +
                game.rnd.integerInRange(0,8)*200
            tween = game.add.tween(enemy)
                .to({x: xPos+50}, 1500,
                    Phaser.Easing.Linear.None,
                    true, 0, 1000, true)
        }
    }

    /**
     * Kill an enemy.  Remove enemy and bullet and play death sound.
     * @param bullet
     * @param enemy
     */
    killEnemy(bullet, enemy) {
        'use strict'
        let xPos, yPos

        xPos = enemy.position.x
        yPos = enemy.position.y
        bullet.kill()
        enemy.kill()
        this.sound.play('explosion')
        score += 10
        this.enemiesKilled++

        if (this.enemiesKilled === 10) {
            game.state.start('level')
        }

        if (game.rnd.integerInRange(1,10) === 10) {
            this.createPowerup(xPos, yPos)
        }
    }

    /**
     * Make a new powerup at the given position.
     * @param xPos - x position
     * @param yPos - y position
     */
    createPowerup(xPos, yPos) {
        'use strict'
        let powerup, rng

        rng = game.rnd.integerInRange(1,7)
        if (rng <= 3) {
            powerup = this.speedPowerups.getFirstDead(false)
        }
        else if (rng >= 5) {
            powerup = this.bulletPowerups.getFirstDead(false)
        }
        else {
            powerup = this.weaponPowerups.getFirstDead(false)
        }

        if (powerup) {
            powerup.setPosition(xPos, yPos)
            powerup.body.velocity.y = this.powerupSpeed
        }
    }

    /**
     * Increase player's movement speed.
     * @param player
     * @param powerup
     */
    addSpeed(player, powerup) {
        'use strict'
        powerup.kill()
        // this.grabPowerup.play()
        this.sound.play('grabPowerup')
        score += 15
        playerState.speed += 20
    }

    /**
     * Increase player's firing rate.
     * @param player
     * @param powerup
     */
    addBullet(player, powerup) {
        'use strict'
        powerup.kill()
        // this.grabPowerup.play()
        this.sound.play('grabPowerup')
        score += 15
        if (playerState.bulletTimeOffset > 100) {
            playerState.bulletTimeOffset -= 20
        }
    }

    /**
     * Add a second gun but halve the firing rate.
     * @param player
     * @param powerup
     */
    addWeapon(player, powerup) {
        'use strict'
        powerup.kill()
        // this.grabPowerup.play()
        this.sound.play('grabPowerup')
        score += 15
        if (playerState.gun === 1) {
            playerState.gun++
            playerState.bulletTimeOffset *= 2
        }
    }

    /**
     * Exit to game over screen.
     */
    end() {
        'use strict'
        // this.explosion.play()
        this.sound.play('explosion')
        game.state.start('end')
    }
}


const gameConfig = {
    type: Phaser.CANVAS,
    parent: 'game-div',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            // debug: true,
            // height: 775,
            // width: 1600,
            height: 600,
            width: 800,
            x: 0,
            y: -200
        }
    },
    scene: [
        BootScene,
        LoadScene,
        TitleScene,
        PlayScene,
        // levelScene,
        // endScene
    ],
}

game = new Phaser.Game(gameConfig)
game.scene.start('boot', { someData: '...arbitrary data' })
