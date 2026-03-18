const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: { preload: preload, create: create, update: update }
};

const game = new Phaser.Game(config);

// State & Stats
let gameState = 'START'; 
let score = 0, level = 1, bulletsFired = 0;
let startTime, alienDirection = 1;

// Objects & UI
let player, cursors, fireButton, bullets, aliens, alienMoveTimer;
let scoreText, timerText, accuracyText, bulletText, startText;

const alienSpeed = 20;
const alienDropDistance = 30;

function preload() {
    this.load.image('ship', 'https://labs.phaser.io/assets/sprites/shmup-ship.png');
    this.load.image('bullet', 'https://labs.phaser.io/assets/sprites/bullet.png');
    this.load.image('alien', 'https://labs.phaser.io/assets/sprites/space-baddie.png');
}

function create() {
    // 1. Setup Groups & Player
    player = this.physics.add.sprite(400, 550, 'ship').setCollideWorldBounds(true);
    aliens = this.physics.add.group();
    bullets = this.physics.add.group({ defaultKey: 'bullet', maxSize: 10 });

    spawnAlienGrid();

    // 2. Setup Movement Timer
    alienMoveTimer = this.time.addEvent({
        delay: 500,
        callback: moveAliens,
        callbackScope: this,
        loop: true
    });

    // 3. Input & Collisions
    cursors = this.input.keyboard.createCursorKeys();
    fireButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.physics.add.overlap(bullets, aliens, (bullet, alien) => {
        bullet.destroy();
        alien.destroy();
        if (gameState === 'PLAYING') {
            score += 10;
            scoreText.setText('SCORE: ' + score);
            updateAccuracy();
            checkLevelComplete(this);
        }
    });

    // 4. Global World Event (Handles bullet cleanup efficiently)
    this.physics.world.on('worldbounds', (body) => {
        if (body.gameObject.texture.key === 'bullet') body.gameObject.destroy();
    });

    // 5. UI Initialization
    scoreText = this.add.text(16, 16, 'SCORE: 0', { fontSize: '20px', fill: '#0F0', fontFamily: 'Courier' });
    timerText = this.add.text(784, 16, 'TIME: 0s', { fontSize: '20px', fill: '#0F0', fontFamily: 'Courier' }).setOrigin(1, 0);
    bulletText = this.add.text(784, 45, 'SHOTS: 0', { fontSize: '16px', fill: '#0F0', fontFamily: 'Courier' }).setOrigin(1, 0);
    accuracyText = this.add.text(784, 65, 'ACC: 0%', { fontSize: '16px', fill: '#0F0', fontFamily: 'Courier' }).setOrigin(1, 0);
    startText = this.add.text(400, 300, 'PRESS SPACE TO START', { fontSize: '40px', fill: '#0F0', fontFamily: 'Courier' }).setOrigin(0.5);
    
    startTime = this.time.now;
}

function spawnAlienGrid() {
    aliens.clear(true, true); // Safety clear
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 10; x++) {
            aliens.create(100 + x * 50, 50 + y * 50, 'alien');
        }
    }
}

function update() {
    if (gameState !== 'PLAYING') {
        // --- AUTO-PLAY ---
        let target = aliens.getFirstAlive();
        if (target) {
            let dist = target.x - player.x;
            if (Math.abs(dist) > 5) player.setVelocityX(dist > 0 ? 150 : -150);
            else player.setVelocityX(0);
            if (Phaser.Math.Between(0, 100) > 95) fireBullet(this);
        }
        if (Phaser.Input.Keyboard.JustDown(fireButton)) startGame();
    } else {
        // --- PLAYING ---
        let elapsed = Math.floor((this.time.now - startTime) / 1000);
        timerText.setText('TIME: ' + elapsed + 's');

        if (cursors.left.isDown) player.setVelocityX(-300);
        else if (cursors.right.isDown) player.setVelocityX(300);
        else player.setVelocityX(0);

        if (Phaser.Input.Keyboard.JustDown(fireButton)) fireBullet(this);
    }
}

function fireBullet(scene) {
    let bullet = bullets.get(player.x, player.y - 20);
    if (bullet) {
        bullet.setActive(true).setVisible(true);
        bullet.body.velocity.y = -400;
        bullet.setCollideWorldBounds(true);
        bullet.body.onWorldBounds = true; // Triggers the global listener in create()

        if (gameState === 'PLAYING') {
            bulletsFired++;
            bulletText.setText('SHOTS: ' + bulletsFired);
            updateAccuracy();
        }
    }
}

function moveAliens() {
    let hitEdge = false;
    let children = aliens.getChildren();

    children.forEach(alien => {
        if ((alien.x >= 780 && alienDirection === 1) || (alien.x <= 20 && alienDirection === -1)) hitEdge = true;
    });

    if (hitEdge) {
        alienDirection *= -1;
        children.forEach(alien => { alien.y += alienDropDistance; });
    } else {
        children.forEach(alien => { alien.x += (alienSpeed * alienDirection); });
    }

    // Game Over Check
    children.forEach(alien => {
        if (alien.y >= player.y && gameState === 'PLAYING') triggerGameOver();
    });
}

function startGame() {
    gameState = 'PLAYING';
    startText.setVisible(false);
    resetStats();
    spawnAlienGrid();
}

function triggerGameOver() {
    gameState = 'GAMEOVER';
    startText.setText('GAME OVER\nPRESS SPACE TO RESTART').setVisible(true);
    player.setVelocityX(0);
}

function resetStats() {
    score = 0;
    level = 1;
    bulletsFired = 0;
    startTime = game.scene.scenes[0].time.now;
    scoreText.setText('SCORE: 0');
    bulletText.setText('SHOTS: 0');
    accuracyText.setText('ACC: 0%');
}

function updateAccuracy() {
    if (bulletsFired === 0) return;
    let accuracy = Math.min(Math.floor(((score / 10) / bulletsFired) * 100), 100);
    accuracyText.setText('ACC: ' + accuracy + '%');
}

function checkLevelComplete(scene) {
    if (aliens.countActive() === 0) {
        level++;
        spawnAlienGrid();
        let newDelay = Math.max(100, 500 - (level * 50));
        alienMoveTimer.reset({ delay: newDelay, callback: moveAliens, callbackScope: scene, loop: true });
        
        let txt = scene.add.text(400, 300, `LEVEL ${level}`, { fontSize: '64px', fill: '#0F0' }).setOrigin(0.5);
        scene.time.delayedCall(2000, () => txt.destroy());
    }
}