let score, highscore, level, playerState, game


highscore = 0


class BootScene extends Phaser.Scene {
    constructor() {
        super('boot')
    }

    create() {
        console.log('[BOOT] create')

        game.scene.start('load')
        game.scene.remove('boot')
    }
}


class LoadScene extends Phaser.Scene {
    constructor() {
        super('load')
    }

    preload() {
        let loadLbl

        console.log('[LOAD] preload')

        loadLbl = this.add.text(40, 160, 'loading...',
                                {font: '30px Courier',
                                 fill: '#ffffff'})

        // Load images
        this.load.image('player', 'assets/ship-red.png')
        this.load.image('enemy', 'assets/ray-blue.png')
        this.load.image('bullet', 'assets/bullet.png')
        this.load.image('background', 'assets/space-background.png')

        // Load animations
        this.load.spritesheet(
            'pup-speed',
            'assets/pup-green-ani.png',
            { frameWidth: 16, frameHeight: 16 }
        )
        this.load.spritesheet(
            'pup-bullet',
            'assets/pup-red-ani.png',
            { frameWidth: 16, frameHeight: 16 }
        )
        this.load.spritesheet(
            'pup-weapon',
            'assets/pup-blue-ani.png',
            { frameWidth: 16, frameHeight: 16 }
        )

        // Load sound effects
        this.load.audio('explosion', 'assets/explosion.wav')
        this.load.audio('grabpowerup', 'assets/powerup.wav')
        this.load.audio('fire1', 'assets/fire1.wav')
        this.load.audio('fire2', 'assets/fire2.wav')
    }

    create() {
        console.log('[LOAD] create')

        game.scene.start('title')
        game.scene.remove('load')
    }
}


class TitleScene extends Phaser.Scene {
    constructor() {
        super('title')
    }

    create() {
        let nameLbl, startLbl, wKey

        console.log('[TITLE] create')

        nameLbl = this.add.text(40, 160, 'SPACEMO',
                                {font: '50px Courier',
                                 fill: '#ffffff'})
        startLbl = this.add.text(40, 240, 'press "W" to start',
                                 {font: '30px Courier',
                                  fill: '#ffffff'})

        this.input.keyboard.on('keydown-W', this.start, this)
    }

    start() {
        console.log('[TITLE] start')

        // Reset game state
        score = 0
        level = 1
        playerState = {
            speed: 200,
            bulletTimeOffset: 300,
            gun: 1      // which gun is currently active
        }

        game.scene.switch('title', 'play')
    }
}


class PlayScene extends Phaser.Scene {
    constructor() {
        super('play')
    }

    create() {
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
        this.enemies.children.iterate(function(enemy) {
            that.enemies.killAndHide(enemy)
            enemy.body.onWorldBounds = true
        })

        this.enemiesKilled = 0
        this.enemyTime = 0
        this.enemyTimeOffset = 900 - (level*100)
        this.enemySpeed = 90 + (level*10)
        this.sound.add('explosion')

        // Powerups
        this.sound.add('grabpowerup')

        this.speedPowerups = this.physics.add.group({
            key: 'pup-speed',
            active: false,
            repeat: 5,
            setXY: { x: 0, y: -300},
        })
        this.speedPowerups.children.iterate(function(sp) {
            that.speedPowerups.killAndHide(sp)
            sp.body.onWorldBounds = true
        })
        this.anims.create({
            key: 'pup-speed-ani',
            frames: this.anims.generateFrameNumbers('pup-speed', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        })

        this.bulletPowerups = this.physics.add.group({
            key: 'pup-bullet',
            active: false,
            repeat: 5,
            setXY: { x: 50, y: -300},
        })
        this.bulletPowerups.children.iterate(function(bp) {
            that.bulletPowerups.killAndHide(bp)
            bp.body.onWorldBounds = true
        })
        this.anims.create({
            key: 'pup-bullet-ani',
            frames: this.anims.generateFrameNumbers('pup-bullet', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        })

        this.weaponPowerups = this.physics.add.group({
            key: 'pup-weapon',
            active: false,
            repeat: 5,
            setXY: { x: 50, y: -300},
        })
        this.weaponPowerups.children.iterate(function(wp) {
            that.weaponPowerups.killAndHide(wp)
            wp.body.onWorldBounds = true
        })
        this.anims.create({
            key: 'pup-weapon-ani',
            frames: this.anims.generateFrameNumbers('pup-weapon', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        })

        // Bullets
        this.bullets = this.physics.add.group({
            key: 'bullet',
            active: false,
            repeat: 30,
            setXY: { x: 0, y: -200},
        })
        this.bullets.children.iterate(function(bullet) {
            that.bullets.killAndHide(bullet)
            bullet.body.onWorldBounds = true
        })

        this.bulletTime = 0
        this.bulletSpeed = 500
        this.sound.add('fire1')
        this.sound.add('fire2')

        // Score
        this.scoreText = this.add.text(400, 10, 'Score: ' + score,
                                       {font: '30px Courier',
                                        fill: '#ffffff'})

        // Controls
        this.cursors = this.input.keyboard.addKeys({
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
            'fire': Phaser.Input.Keyboard.KeyCodes.SPACE,
        })

        this.physics.add.overlap(this.player, this.enemies,
                                 this.end, null, this)
        this.physics.add.collider(this.bullets, this.enemies,
                                 this.killEnemy, null, this)
        this.physics.add.overlap(this.player, this.speedPowerups,
                                 this.addSpeed, null, this)
        this.physics.add.overlap(this.player, this.bulletPowerups,
                                 this.addBullet, null, this)
        this.physics.add.overlap(this.player, this.weaponPowerups,
                                 this.addWeapon, null, this)
        this.physics.world.on('worldbounds', function(body, up, down, left, right) {
            console.log('WORLD BOUNDS')
            // console.log(body)
            // console.log(up)
            // console.log(down)
            // console.log(left)
            // console.log(right)
            if (that.bullets.contains(body.gameObject)) {
                console.log('  BULLET')
                that.removeBullet(body.gameObject)
            } else if (that.enemies.contains(body.gameObject)) {
                console.log('  ENEMY')
                console.log(`  ${up} ${down} ${left} ${right}`)
                that.removeEnemy(body.gameObject)
            } else if (that.speedPowerups.contains(body.gameObject) ||
                       that.bulletPowerups.contains(body.gameObject) ||
                       that.weaponPowerups.contains(body.gameObject)) {
                console.log('  POWERUP')
                console.log(`  ${up} ${down} ${left} ${right}`)
                that.removePowerup(body.gameObject)
            }
        })
    }

    update() {
        // console.log('[PLAY] update')

        if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(playerState.speed)
        } else if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-playerState.speed)
        } else {
            this.player.body.setVelocityX(0)
        }

        if (this.cursors.fire.isDown) {
            this.fire()
        }

        if (this.time.now > this.enemyTime) {
            this.dispatchEnemy()
        }

        this.background.tilePositionY -= this.backgroundSpeed

        this.scoreText.text = 'Score: ' + score
    }

    /**
     * Fire player's weapon.
     */
    fire() {
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
                    this.sound.play('fire1')
                    bullet1.setPosition(this.player.x, this.player.y - 14)
                    bullet1.body.velocity.y = -this.bulletSpeed
                }
            } else if (playerState.gun === 2) {
                this.bulletTime = this.time.now + playerState.bulletTimeOffset
                this.sound.play('fire2')

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
        let enemy, tween, xPos

        enemy = this.enemies.getFirstDead(false)

        if (enemy) {
            enemy.active = true
            enemy.visible = true
            xPos = Phaser.Math.Between(0, 5)*100 + 25
            // enemy.setPosition(xPos, -30)
            enemy.setPosition(xPos, 16)
            enemy.body.velocity.x = 0
            enemy.body.velocity.y = this.enemySpeed
            enemy.setCollideWorldBounds(true)
            this.enemyTime = this.time.now +
                this.enemyTimeOffset +
                Phaser.Math.Between(0, 8)*200
            tween = this.tweens.add({
                targets: enemy,
                x: xPos + 50,         // '+=100'
                ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                duration: 1000,
                repeat: -1,           // -1: infinity
                yoyo: true
            })
        } else {
            console.log('No enemy found!!!')
        }
    }

    /**
     * Kill an enemy.  Remove enemy and bullet and play death sound.
     * @param bullet
     * @param enemy
     */
    killEnemy(bullet, enemy) {
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

        // console.log('bullets active: ' + this.bullets.countActive())
        console.log('  ' + this.enemiesKilled)

        // Advance to next level.
        if (this.enemiesKilled === 5) {
            this.registry.destroy()
            this.events.off()
            game.scene.switch('play', 'level')
            this.cursors.right.isDown = false
            this.cursors.left.isDown = false
            console.log('[PLAY] CURSORS OFF')
            this.scene.stop()
        }

        // Create new powerup.
        if (Phaser.Math.Between(1,3) === 3) {
            this.createPowerup(xPos, yPos)
        }
    }

    /**
     * Remove an enemy from the view.
     * @param enemy
     */
    removeEnemy(enemy) {
        enemy.body.collideWorldBounds = false
        enemy.setActive(false)
        enemy.setVisible(false)
        this.tweens.killTweensOf(enemy)
        enemy.setVelocity(0, 0)
        enemy.setPosition(0, -100)
    }

    /**
     * Remove a bullet from the view.
     * @param bullet
     */
    removeBullet(bullet) {
        bullet.body.collideWorldBounds = false
        bullet.setActive(false)
        bullet.setVisible(false)
        bullet.setVelocity(0, 0)
        bullet.setPosition(0, -200)
    }

    /**
     * Remove a powerup from the view.
     * @param powerup
     */
    removePowerup(powerup) {
        powerup.body.collideWorldBounds = false
        powerup.setActive(false)
        powerup.setVisible(false)
        powerup.setVelocity(0, 0)
        powerup.setPosition(0, -300)
    }

    /**
     * Make a new powerup at the given position.
     * @param xPos - x position
     * @param yPos - y position
     */
    createPowerup(xPos, yPos) {
        let powerup, rng, rngMax, animation

        console.log('POWERUP')

        if (playerState.gun === 1) {
            rngMax = 7
        } else {
            rngMax = 6
        }
        rng = Phaser.Math.Between(1, rngMax)
        console.log(`  rng: ${rng}`)

        if (rng <= 3) {
            console.log('  SPEED')
            powerup = this.speedPowerups.getFirstDead(false)
            animation = 'pup-speed-ani'
        } else if (rng > 3 && rng <= 6) {
            console.log('  BULLET')
            powerup = this.bulletPowerups.getFirstDead(false)
            animation = 'pup-bullet-ani'
        } else {
            console.log('  WEAPON')
            powerup = this.weaponPowerups.getFirstDead(false)
            animation = 'pup-weapon-ani'
        }

        if (powerup) {
            powerup.play(animation)
            powerup.active = true
            powerup.visible = true
            powerup.setPosition(xPos, yPos)
            powerup.body.velocity.y = this.enemySpeed
            powerup.setCollideWorldBounds(true)
        }
    }

    /**
     * Increase player's movement speed.
     * @param player
     * @param powerup
     */
    addSpeed(player, powerup) {
        this.removePowerup(powerup)
        this.sound.play('grabpowerup')
        score += 15
        playerState.speed += 20
    }

    /**
     * Increase player's firing rate.
     * @param player
     * @param powerup
     */
    addBullet(player, powerup) {
        this.removePowerup(powerup)
        this.sound.play('grabpowerup')
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
        this.removePowerup(powerup)
        this.sound.play('grabpowerup')
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
        console.log('[PLAY] end')

        this.sound.play('explosion')
        this.registry.destroy()
        this.events.off()
        game.scene.switch('play', 'end')
        this.cursors.right.isDown = false
        this.cursors.left.isDown = false

        console.log('[PLAY] CURSORS OFF')
        this.scene.stop()
    }
}


class LevelScene extends Phaser.Scene {
    constructor() {
        super('level')
    }

    create() {
        let that, startLbl

        console.log('[LEVEL] create')

        that = this
        this.nameLbl = this.add.text(40, 160, 'LEVEL ' + level + ' COMPLETE',
                                     {font: '50px Courier',
                                      fill: '#ffffff'})
        startLbl = this.add.text(40, 240, 'press "W" to start next level',
                                 {font: '30px Courier',
                                  fill: '#ffffff'})

        this.input.keyboard.on('keydown-W', this.start, this)

        this.events.on('wake', function() {
            that.nameLbl.text = 'LEVEL ' + level + ' COMPLETE'
        })
    }

    start() {
        level += 1
        game.scene.switch('level', 'play')
    }
}


class EndScene extends Phaser.Scene {
    constructor() {
        super('end')
    }

    create() {
        let scoreLbl, nameLbl, startLbl, highscoreLbl, wKey

        console.log('[END] create')

        scoreLbl = this.add.text(400, 10, 'Score: ' + score,
                                 {font: '30px Courier',
                                  fill: '#ffffff'})
        nameLbl = this.add.text(40, 160, 'YOU DIED',
                                {font: '50px Courier',
                                 fill: '#ffffff'})
        startLbl = this.add.text(40, 240, 'press "W" to restart',
                                 {font: '30px Courier',
                                  fill: '#ffffff'})

        if (score <= highscore) {
            highscoreLbl = this.add.text(310, 50, 'High Score: ' + highscore,
                                         {font: '30px Courier',
                                          fill: '#ffffff'})
        } else {
            highscoreLbl = this.add.text(300, 50, 'New High Score!',
                                         {font: '30px Courier',
                                          fill: '#ffffff'})
            highscore = score
        }

        this.input.keyboard.on('keydown-W', this.restart, this)
    }

    /**
     * Go back to title screen.
     */
    restart() {
        console.log('[END] restart')
        game.scene.switch('end', 'title')
    }
}


const gameConfig = {
    type: Phaser.CANVAS,
    parent: 'game-div',
    width: 600,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            width: 600,
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
