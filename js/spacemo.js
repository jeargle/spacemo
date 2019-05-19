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
        level = 1
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

        let that = this

        // Background
        this.background = this.add.tileSprite(400, 300, 800, 600, 'background')
        this.backgroundSpeed = 1

        // Player
        this.player = this.physics.add.sprite(400, 500, 'player')
        this.player.setCollideWorldBounds(true)

        // Enemies
        this.enemies = this.physics.add.group({
            key: 'enemy',
            active: false,
            repeat: 30,
            setXY: { x: 0, y: -100 },
        })
        let enemies = this.enemies
        enemies.children.iterate(function(enemy) {
            enemies.killAndHide(enemy)
            enemy.body.onWorldBounds = true
        })

        this.enemiesKilled = 0
        this.enemyTime = 0
        this.enemyTimeOffset = 900 - (level*100)
        this.enemySpeed = 90 + (level*10)
        this.explosion = this.sound.add('explosion')

        // Powerups
        this.grabPowerup = this.sound.add('grabpowerup')
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
            setXY: { x: 0, y: -200},
        })
        let bullets = this.bullets
        bullets.children.iterate(function(bullet) {
            bullets.killAndHide(bullet)
            bullet.body.onWorldBounds = true
        })

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

        this.fire1 = this.sound.add('fire1')
        this.fire2 = this.sound.add('fire2')

        this.physics.add.overlap(this.player, this.enemies,
                                 this.end, null, this)
        // this.physics.add.overlap(this.bullets, this.enemies,
        //                          this.killEnemy, null, this)
        this.physics.add.collider(this.bullets, this.enemies,
                                 this.killEnemy, null, this)
        this.physics.add.overlap(this.player, this.speedPowerups,
                                 this.addSpeed, null, this)
        this.physics.add.overlap(this.player, this.bulletPowerups,
                                 this.addBullet, null, this)
        this.physics.add.overlap(this.player, this.weaponPowerups,
                                 this.addWeapon, null, this)
        this.physics.world.on('worldbounds', function(body) {
            console.log('WORLD BOUNDS')
            // console.log(body)
            that.removeBullet(body.gameObject)
            // body.collideWorldBounds = false
            // gameObject.setActive(false)
            // gameObject.setVisible(false)
            // gameObject.setPosition(0, -200)
        })
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

        // console.log('FIRE')

        if (this.time.now > this.bulletTime) {
            if (playerState.gun === 1) {
                this.bulletTime = this.time.now + playerState.bulletTimeOffset
                bullet1 = this.bullets.getFirstDead(false)
                bullet1.active = true
                bullet1.visible = true
                bullet1.body.collideWorldBounds = true

                if (bullet1) {
                    this.fire1.play()
                    bullet1.setPosition(this.player.x, this.player.y - 14)
                    bullet1.body.velocity.y = -this.bulletSpeed
                }
            }
            else {
                this.bulletTime = this.time.now + playerState.bulletTimeOffset
                this.fire2.play()

                bullet1 = this.bullets.getFirstDead(false)
                bullet1.active = true
                bullet1.visible = true
                bullet1.body.collideWorldBounds = true
                bullet1.setPosition(this.player.x - 14, this.player.y - 14)
                bullet1.body.velocity.y = -this.bulletSpeed

                bullet2 = this.bullets.getFirstDead(false)
                bullet2.active = true
                bullet2.visible = true
                bullet2.body.collideWorldBounds = true
                bullet2.setPosition(this.player.x + 14, this.player.y - 14)
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

        enemy = this.enemies.getFirstDead(false)
        enemy.active = true
        enemy.visible = true

        if (enemy) {
            xPos = Phaser.Math.Between(1,6)*100
            enemy.setPosition(xPos, -30)
            enemy.body.velocity.x = 0
            enemy.body.velocity.y = this.enemySpeed
            this.enemyTime = this.time.now +
                this.enemyTimeOffset +
                Phaser.Math.Between(0,8)*200
            tween = this.tweens.add({
                targets: enemy,
                x: xPos + 50,              // '+=100'
                ease: 'Linear',          // 'Cubic', 'Elastic', 'Bounce', 'Back'
                duration: 1000,
                repeat: -1,              // -1: infinity
                yoyo: true
            })
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

        console.log('KILL')

        if (!enemy.active) {
            return
        }

        this.removeBullet(bullet)

        xPos = enemy.x
        yPos = enemy.y
        this.removeEnemy(enemy)

        this.sound.play('explosion')
        score += 10
        this.enemiesKilled++

        console.log('bullets active: ' + this.bullets.countActive())
        console.log('  ' + this.enemiesKilled)

        if (this.enemiesKilled === 5) {
            // game.scene.start('level')

        this.registry.destroy()
        this.events.off()
        game.scene.switch('play', 'level')
        this.cursors.right.isDown = false
        this.cursors.left.isDown = false
        // this.cursors.up.isDown = false
        // this.cursors.down.isDown = false
        console.log('[PLAY] CURSORS OFF')
        this.scene.stop()


        }

        if (Phaser.Math.Between(1,10) === 10) {
            this.createPowerup(xPos, yPos)
        }
    }

    removeEnemy(enemy) {
        'use strict'

        enemy.body.collideWorldBounds = false
        enemy.setActive(false)
        enemy.setVisible(false)
        this.tweens.killTweensOf(enemy)
        enemy.setPosition(0, -100)
    }

    removeBullet(bullet) {
        'use strict'

        // bullet.active = false
        // bullet.visible = false
        // enemy.active = false
        // enemy.visible = false
        // bullet.setActive(false)
        // bullet.setVisible(false)
        // bullet.setActive(false)
        // bullet.setVisible(false)
        bullet.body.collideWorldBounds = false
        bullet.setActive(false)
        bullet.setVisible(false)
        bullet.setPosition(0, -200)
    }

    /**
     * Make a new powerup at the given position.
     * @param xPos - x position
     * @param yPos - y position
     */
    createPowerup(xPos, yPos) {
        'use strict'
        let powerup, rng

        rng = Phaser.Math.Between(1,7)
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
        // game.scene.start('end')

        console.log('[PLAY] end')
        this.registry.destroy()
        this.events.off()
        game.scene.switch('play', 'end')
        this.cursors.right.isDown = false
        this.cursors.left.isDown = false
        // this.cursors.up.isDown = false
        // this.cursors.down.isDown = false
        console.log('[PLAY] CURSORS OFF')
        this.scene.stop()
    }
}


class LevelScene extends Phaser.Scene {
    constructor() {
        super('level')
    }

    create() {
        'use strict'
        let that, startLbl

        console.log('[LEVEL] create')

        that = this
        this.nameLbl = this.add.text(80, 160, 'LEVEL ' + level + ' COMPLETE',
                                     {font: '50px Courier',
                                      fill: '#ffffff'})
        startLbl = this.add.text(80, 240, 'press "W" to start next level',
                                 {font: '30px Courier',
                                  fill: '#ffffff'})

        this.input.keyboard.on('keydown_W', this.start, this)

        this.events.on('wake', function() {
            // console.log('[LEVEL] wake')
            that.nameLbl.text = 'LEVEL ' + level + ' COMPLETE'
        })
    }

    start() {
        'use strict'
        level += 1
        game.scene.switch('level', 'play')
    }
}

class EndScene extends Phaser.Scene {
    constructor() {
        super('end')
    }

    create() {
        'use strict'
        let scoreLbl, nameLbl, startLbl, highscoreLbl, wKey

        scoreLbl = this.add.text(600, 10, 'Score: ' + score,
                                 {font: '30px Courier',
                                  fill: '#ffffff'})
        nameLbl = this.add.text(80, 160, 'YOU DIED',
                                {font: '50px Courier',
                                 fill: '#ffffff'})
        startLbl = this.add.text(80, 240, 'press "W" to restart',
                                 {font: '30px Courier',
                                  fill: '#ffffff'})

        if (score <= highscore) {
            highscoreLbl = this.add.text(510, 50, 'High Score: ' + highscore,
                                         {font: '30px Courier',
                                          fill: '#ffffff'})
        }
        else {
            highscoreLbl = this.add.text(300, 50, 'New High Score!',
                                         {font: '30px Courier',
                                          fill: '#ffffff'})
            highscore = score
        }

        // wKey = game.input.keyboard.addKey(Phaser.Keyboard.W)
        // wKey.onDown.addOnce(this.restart, this)
        this.input.keyboard.on('keydown_W', this.restart, this)
    }

    /**
     * Go back to title screen.
     */
    restart() {
        'use strict'
        game.scene.start('title')
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
            debug: true,
            width: 800,
            height: 600,
        }
    },
    scene: [
        BootScene,
        LoadScene,
        TitleScene,
        PlayScene,
        LevelScene,
        EndScene
    ],
}

game = new Phaser.Game(gameConfig)
game.scene.start('boot', { someData: '...arbitrary data' })
