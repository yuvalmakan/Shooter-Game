// Creating the canvas
let canvas = document.querySelector("#canvas");
console.dir(canvas);

let c = canvas.getContext("2d");
console.dir(c);

let window_height = window.innerHeight;
let window_width = window.innerWidth;

canvas.width = window_width;
canvas.height = window_height;


// Utility functions

function randInt(min,max){
    return Math.floor(Math.random() * (max-min+1) + min);
}

function dist(x1,y1,x2,y2){
    return Math.sqrt((x1-x2)**2+(y1-y2)**2);
}

let keys = {};
let kill = false; // This is used because we sometimes can't automatically exit the animate loop so we need this, lest we get double the frames, meaning double the speed of everything

// Adding event listener for movenement, restarting, potion
window.addEventListener('keydown',(e) => {
    keys[e.key] = true;
    if (keys['r']){
        delete keys['r'];
        player.scoreMult = 1;
        player.x = window_width/45;
        player.y = window_height/2;
        if (enemyArr.length){
            kill = true; 
            if (player.health > 0){
                alert("Restarting");
                player.health = 10;
                player.score = 0;
                player.money = 0;
                player.invisPotion = 0;
                player.invincPotion = 0;
            }
        }
        else if(player.health > 0){
            alert("Next room");
            market();
        }
        if (player.health <= 0){
            player.health = 10;
            player.score = 0;
            player.money = 0;
            player.invisPotion = 0;
            player.invincPotion = 0;
            kill = false;
        }
        keys = {};
        init();
        
    }
    if (keys['i']){
        delete keys['i'];
        invisibility();
    }
    if (keys['v']){
        delete keys['v'];
        invincibility();
    }
});

window.addEventListener('keyup',(e) => {
    delete keys[e.key];
});

function movePlayer(){
    let move = [0, 0];
    keys['w'] || keys['ArrowUp'] ? move[1] -= 1 : null;
    keys['s'] || keys['ArrowDown'] ? move[1] += 1 : null;
    keys['a'] || keys['ArrowLeft'] ? move[0] -= 1 : null;
    keys['d'] || keys['ArrowRight'] ? move[0] += 1 : null;

    magnitude = Math.sqrt(move[0]**2 + move[1]**2);

    if (magnitude !== 0){
        player.x += (move[0] / magnitude) * player.speed;
        player.y += (move[1] / magnitude) * player.speed;
    }

    player.x = Math.max(player.r, Math.min(window_width - player.r, player.x));
    player.y = Math.max(player.r, Math.min(window_height - player.r, player.y));
}

let roomArr = [];
let enemyArr = [];
let player;
let bulletArr = [];
let coinArr = [];

function drawHUD(){
    let score = player.score;
    let health = player.health * 10;
    let money = player.money;
    c.fillStyle = 'white';
    c.font = '12px Arial';
    c.fillText(`Score: ${score}`,20,30);
    c.fillText(`Health: ${health}`,window_width-150,30);
    c.fillText(`Money: ${money}`,window_width-150,60);
    c.fillText(`Invisibility Potions: ${player.invisPotion}`,120,30);
    c.fillText(`Invincibility Potions: ${player.invincPotion}`,250,30);
    c.fillText(`Current Biome: ${biome}`,window_width/2-50,30);
}

let biome;
let die;
// Generating one of the 6 biomes at random
function biomeGeneration(){
    player.speed = 2;
    player.maxDist = maxDist;
    let die = randInt(1,6);
    if (die == 1){
        biome = 'Smoke Filled';
        canvas.style.backgroundColor = 'rgb(120, 120, 120)';
        // Visibility reduced by 50%
        player.maxDist = maxDist/2;
    }
    else if (die == 2){
        biome = 'Drainage System';
        canvas.style.backgroundColor = 'rgb(49, 65, 156)';
        // Speed reduced by 0.5
        player.speed = 1.5;
    }
    else if (die == 3){
        biome = 'Gas Chamber';
        canvas.style.backgroundColor = 'rgb(184, 157, 140)';
        // Health reduced by 1 every two seconds until player finds the mask (which is dropped by tanks and snipers)
        player.poisoned = true;
         let poisonInterval = setInterval(() => {
            if (biome != 'Gas Chamber'){  
                player.poisoned = false;
                clearInterval(poisonInterval);
                return;
            }
            if (player.poisoned){
                player.health -= 0.1;
            }
            else{
                clearInterval(poisonInterval);
            }
        }, 2000);
    }
    else if (die == 4){
        biome = 'Ice';
        canvas.style.backgroundColor = 'rgb(200, 255, 255)';
        // Speed increased by 1.5
        player.speed = 3;
    }
    else if (die == 5){
        biome = 'Overgrown';
        canvas.style.backgroundColor = 'rgb(100, 255, 100)';
        // Enemies have 2 extra health but drop coins more often
    }
    else{
        biome = 'Cursed';
        canvas.style.backgroundColor = 'rgb(150, 0, 150)';
        // There are double the amount of snipers but no exploding enemies
    }
}

// Initializing the game

function init(){
    roomArr = [];
    enemyArr = [];
    bulletArr = [];
    coinArr = [];
    for (let i=1;i<17;i+=2){
        for (let j=1;j<9;j+=2){
            roomArr.push(new Room(i*len,j*len));
            let newx = Math.random()*(len - len2 - 2*border) + border;
            let newy = Math.random()*(len - len2 - 2*border) + border;
            enemyArr.push(Enemy.createRandomEnemy(i*len+newx+len2*0.35,j*len+newy+len2*0.35));
            enemyArr[enemyArr.length-1].health += 2*(biome == 'Overgrown');

            
        }
    }
    //generating the rooms and the enemies within
    biomeGeneration();
    animate();
}

function animate(){
    c.clearRect(0,0,window_width,window_height);
    
    for (let i=0;i<roomArr.length;i++){
        roomArr[i].draw();
    }   
    for (let i=0;i<enemyArr.length;i++){
        if (enemyArr[i].cloaked && dist(enemyArr[i].x, enemyArr[i].y, player.x, player.y) < enemyArr[i].maxDist/4){
            enemyArr[i].cloaked = false;
        }
        if (enemyArr[i].cloaked && !enemyArr[i].alerted)
            continue;
        enemyArr[i].draw();
    }  
    for (let i=0;i<coinArr.length;i++){
        coinArr[i].draw();
    }
    bulletArr.forEach( (bullet) => {
        bullet.draw();
    })
    drawRadialVision();
    checkEnemyVisibility();
    MOVEPlayer();

    player.draw();
    
    drawHUD();
    if (player.health <= 0){
        new Audio("player_death.wav").play();
        alert("You have lost, if you wanna restart then press r");
        return;
    }
    if (enemyArr.length == 0){
        new Audio("winning.mp3").play();
        alert("You have cleared this floor!, if you would like to continue, press r");
        return;
    }
    if (kill){
        kill = false;
        return;
    }  
    //These are the things that happen after game end/room cleared
    pickUpCoin();      
    
    requestAnimationFrame(animate);
}


let len = Math.min(window_width/17,window_height/9);
let len2 = len*0.4;
 
let border = 3;

class Room{
    constructor(x,y){
        this.x=x;
        this.y=y;
        this.rand = randInt(0,3);
        this.extra = Math.random()*(len-len2-2*border)+border;
        this.wallArr = [];
        
        this.wallArr.push({x: this.x, y: this.y, w: len, h: border});
        this.wallArr.push({x: this.x + len - border, y: this.y, w: border, h: len});
        this.wallArr.push({x: this.x, y: this.y + len - border, w: len, h: border});
        this.wallArr.push({x: this.x, y: this.y, w: border, h: len});
        
        if (this.rand % 2 == 0){
            this.X = this.x + this.extra;
            this.w = len2;
            this.h = border;
            if (this.rand == 0){
                this.Y = this.y;
            }
            else{
                this.Y = this.y + len - border;
            }
        }
        else{
            this.Y = this.y + this.extra;
            this.w = border;
            this.h = len2;
            if (this.rand == 3){
                this.X = this.x;
            }
            else{
                this.X = this.x + len - border;
            }
        }
        //Generating a random wall in the room and pushing it into the array
        this.wallArr.push({x: this.X, y: this.Y, w: this.w, h: this.h, rand: this.rand, extra: this.extra});

    }

    draw(){
        c.fillStyle = 'black';
        c.fillRect(this.x,this.y,len,len);
        c.clearRect(this.x+border,this.y+border,len-border*2,len-border*2);
        
        c.clearRect(this.X,this.Y,this.w,this.h);
        c.fillStyle = 'yellow';
        c.fillRect(this.X,this.Y,this.w,this.h);
    }
}

//AABB- Axis Aligned Bounding Box
function checkCollisionWall(blob){
    let Wall = false;
    roomArr.forEach((room) => {
        room.wallArr.forEach((wall) => {
            if (room.wallArr.indexOf(wall)==4){
                return;
            }
            if (blob.x+blob.r>wall.x && blob.x-blob.r<wall.x+wall.w && blob.y+blob.r>wall.y && blob.y-blob.r<wall.y+wall.h){
                Wall = wall;
                let door = room.wallArr[4];
                if (room.wallArr.indexOf(wall) != door.rand){
                    return Wall;
                }                
                    
                if ((door.rand%2==0 && blob.x-blob.r>door.x && blob.x+blob.r<door.x+door.w))
                    Wall = false;
                if ((door.rand%2!=0 && blob.y-blob.r>door.y && blob.y+blob.r<door.y+door.h))
                    Wall = false;
            }
        });
    });
    return Wall;
}

function checkCollision(blob1,blob2){
    if (dist(blob1.x,blob1.y,blob2.x,blob2.y) <= blob1.r + blob2.r){
        return true;
    }
    return false;
}

//Making sure the player doesn't go through the walls

function MOVEPlayer(){
    let Wall = checkCollisionWall(player);
    if (!Wall){
        movePlayer();
    }
    else{
        if (Wall.h>Wall.w){
            if (player.x>Wall.x){
                player.x+=player.speed;
            }
            else{
                player.x-=player.speed;
            }
        }
        else{
            if (player.y>Wall.y){
                player.y+=player.speed;
            }
            else{
                player.y-=player.speed;
            }
        }
    }
}

function healthBar(blob){
    c.fillStyle = 'green';
    let width = len2/7;
    c.fillRect(blob.x-width*blob.health/2,blob.y-2*blob.r,width*blob.health,blob.r/2);
}

class Player{
    constructor(x,y){
        this.score = 0;
        this.health = 10;
        this.money = 0;
        this.x = x;
        this.y = y;
        this.r = len2*0.3;
        this.speed = 2;
        this.damage = 1;
        this.shield = 0;
        this.visible = true;
        this.scoreMult = 1;
        this.invisPotion = 0;
        this.invincPotion = 0;
        this.border = 1;
        this.color = 'blue';
        this.poisoned = false;
        this.maxDist = maxDist;

        this.draw();
    }
    draw(){
        c.beginPath();
        c.arc(this.x,this.y,this.r,0,Math.PI*2);
        c.strokeStyle = 'black';
        c.lineWidth = this.border;
        c.stroke();
        c.fillStyle = this.color;
        c.fill();
        healthBar(this);
    }
}

class Enemy{
    constructor(x,y){
        this.health = 6;
        this.x = x;
        this.y = y;
        this.r = len2*0.3;
        this.maxDist = maxDist;
        this.alerted = false;
        this.cooldown = 0;
        this.amountSec = 60;
        this.damage = 1;
        this.sniper = false;
        this.exploding = false;
        this.cloaked = false;
        this.tank = false;
        this.fillStyle = 'red';
        
        this.draw();
    } 
    draw(){
        c.beginPath();
        c.arc(this.x,this.y,this.r,0,Math.PI*2);
        c.strokeStyle = 'black';
        c.lineWidth = 1;
        c.stroke();
        c.fillStyle = this.fillStyle;
        c.fill();
        healthBar(this);
        // alert enemies if player is in line of sight and within a particular radius, then shoot every second
        if (this.cooldown > 0) this.cooldown--;
        if (this.alerted && this.cooldown==0){
            this.shoot();
            this.cooldown = this.amountSec;
        }
    }
    shoot(){
        if (!player.visible || this.cloaked){
            return;  // If player either invisible or enemy is cloaked then don't shoot
        }
        let tan = (player.y - this.y)/(this.x-player.x)*(-1);
        let up = 1;
        if (player.x < this.x)
            up=-1;
        bulletArr.push(new Bullet(this.x,this.y,this.r,tan,up))
        bulletArr[bulletArr.length-1].blob = this;
    }

    static createRandomEnemy(x, y){
        // Generating one of the enemy types
        let dice = randInt(1,20);
        if (dice == 10 || (biome == 'Cursed' && dice == 20)){
            return new Sniper(x, y);
        }
        if (dice == 9 && biome != 'Cursed'){
            return new Bomber(x, y);
        }
        if (dice == 8){
            return new Ninja(x, y);
        }
        if (dice == 7){
            return new Tank(x, y);
        }
        return new Enemy(x, y);
    }
}

class Sniper extends Enemy{
    constructor(x,y){
        super(x,y);
        this.sniper = true;
        this.damage = 3;
        this.amountSec = 120;
        this.fillStyle = 'purple';
        this.maxDist = maxDist*2;
        //snipers shoot every 2 seconds but do 3 damage instead of 1. Also they have a better view
    }
}

class Bomber extends Enemy{
    constructor(x,y){
        super(x,y);
        this.health = 1;
        this.exploding = true;
        this.fillStyle = 'black';
        //exploding enemies have 1 health but when they die, they do a damage of 3 in a radius of 2*len2
    }
}

class Ninja extends Enemy{
    constructor(x,y){
        super(x,y);
        this.cloaked = true;
        this.fillStyle = 'white';
        //cloaked enemies are invisible until they shoot, and then they become visible for 3 seconds
    }
}

class Tank extends Enemy{
    constructor(x,y){
        super(x,y);
        this.tank = true;
        this.health = 9;
        this.amountSec = 90;
        this.fillStyle = 'orange';
        //tanks have 3 extra health but shoot every 1.5 seconds instead of every second
    }
}

class Bullet{
    constructor(x,y,r,tan,up){
        new Audio("bullet.wav").play();
        this.tan = tan;
        this.speed = 5;
        this.cos = Math.cos(Math.atan(this.tan));
        this.sin = Math.sin(Math.atan(this.tan));
        this.dx = this.cos*this.speed*up;
        this.dy = this.sin*this.speed*up;
        this.x = x+r*this.cos*up;
        this.y = y+r*this.sin*up;    //up is a value of 1 or -1 saying whether the mouse is to right or left of our player
        
        this.r = 5;
        this.range = false;
        this.blob = null;
        this.bounce = 4;
        this.draw();
    }
    draw(){
        // Bounicing mechanic of the bullet
        if (this.x>=innerWidth-this.r || this.x<=this.r){
            this.dx=-this.dx;
            this.bounce--;
        }

        if (this.y>=innerHeight-this.r || this.y<=this.r){
            this.dy=-this.dy;
            this.bounce--;
        }

        if (this.bounce<0){
            bulletArr = bulletArr.filter(bullet => bullet != this);
        } // Max 4 bounces allowed

        this.x+=this.dx;
        this.y+=this.dy;
        
        // Hitting mechanic of the bullet
        enemyArr.forEach( (enemy) => {
            if (this.range && checkCollision(this,enemy)){
                bulletArr = bulletArr.filter(bullet => bullet != this);

                enemy.health-= this.blob.damage;
                if (enemy.health <= 0){
                    
                    player.score += 10;
                    if (enemy.exploding){
                        new Audio("explosion.mp3").play();
                        enemyArr.forEach((otherEnemy) => {
                            if (otherEnemy != enemy && dist(enemy.x,enemy.y,otherEnemy.x,otherEnemy.y) <= 2*len2){
                                otherEnemy.health -= 3;
                                if (otherEnemy.health <= 0){
                                    new Audio("dying_enemy.m4a").play();
                                    player.score += 10;
                                    dropCoin(otherEnemy);
                                    enemyArr = enemyArr.filter(Enemy => Enemy != otherEnemy);
                                }
                            }
                        })
                        if (dist(enemy.x,enemy.y,player.x,player.y) <= 2*len2){
                            player.health -= 3*(1-player.shield);
                        }
                    }
                    else{
                        dropCoin(enemy);
                        new Audio("dying_enemy.m4a").play();
                    }
                    
                    enemyArr = enemyArr.filter(Enemy => Enemy != enemy);
                }
            }
        })

        if (this.range && checkCollision(this,player)){
            bulletArr = bulletArr.filter(bullet => bullet != this);
            player.health = player.health - this.blob.damage*(1-player.shield);  
        }
        c.beginPath();
        c.arc(this.x,this.y,this.r,0,Math.PI*2);
        c.strokeStyle = 'black';
        c.lineWidth = 1;
        c.stroke();
        c.fillStyle = 'white';
        c.fill();
        this.move();
        this.range = true;
    }
    move(){
        let Wall = checkCollisionWall(this);
        if (Wall){
            if (Wall.h>Wall.w){
                this.dx *= -1;
            }
            else{
                this.dy *= -1;
            }
            this.bounce--;
        }
        this.x+=this.dx;
        this.y+=this.dy;
    }

}

// shoots a bullet on clicking
window.addEventListener('click', (e) => {
    let tan = (player.y - e.y)/(e.x-player.x)*(-1);
    let up =1;
    if (player.x>e.x)
        up=-1;
    
    bulletArr.push(new Bullet(player.x,player.y,player.r,tan,up));
    bulletArr[bulletArr.length-1].blob = player;
})

// Making the radial visibility

let mouse = {
    x: window_width/2,
    y: window_height/2
}
window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
})

let FOV = Math.PI / 3;
let maxDist = 80;
let rayCount = 50;

// Raycasting for radial vision

function drawRadialVision() {
    c.beginPath();
    c.rect(0, 0, window_width, window_height);
    let maxDist = player.maxDist;
    
    c.moveTo(player.x, player.y);
    let playerAngle = Math.atan2(mouse.y - player.y, mouse.x - player.x); 
    
    // Drawing the rays upto a wall or maxDist
    for (let i = 0; i <= rayCount; i++) {
        let rayAngle = (playerAngle - FOV / 2) + (FOV * (i / rayCount));
        let hit = getClosestIntersection(player.x, player.y, rayAngle); 
        
        if (hit == null || hit.dist > maxDist) {
            c.lineTo(player.x + maxDist * Math.cos(rayAngle), player.y + maxDist * Math.sin(rayAngle));
        } else {
            c.lineTo(hit.x, hit.y);
        }
    }

    c.fillStyle = "rgba(0, 0, 0, 1)"; 
    c.fill("evenodd");   // Makes everything except us and the radial cone black
}

// checks whether a ray hit the wall or not or a door
function getClosestIntersection(x, y, angle) {
    let closest = null;
    let minDistance = Infinity;

    for (let room of roomArr){
        let door = room.wallArr[4]; 

        for (let wall of room.wallArr) {
            if (wall == door) continue;

            let hit = castRay(x, y, angle, wall);
            
            if (hit) {
                let hitIsInsideDoor = (
                    hit.x >= door.x && 
                    hit.x <= door.x + door.w &&
                    hit.y >= door.y && 
                    hit.y <= door.y + door.h
                );
                //hitting

                // hitting if it is not inside the door gap
                if (!hitIsInsideDoor && hit.dist < minDistance) {
                    minDistance = hit.dist;
                    closest = hit;
                }
            }
        }
    }
    return closest; 
}

// casts the ray the required x and y
function castRay(x, y, angle, wall) {
    let x1 = wall.x, y1 = wall.y;
    let x2=x1,y2=y1;
    if (wall.w>wall.h){
        x2 += wall.w;
    }
    else{
        y2 += wall.h;
    }
    let x3 = x;
    let y3 = y;
    let x4 = x + Math.cos(angle);
    let y4 = y + Math.sin(angle);

    let den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den == 0) return null;

    let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    let u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

    // If t is between 0 and 1, the intersection is on the segment
    // If u > 0, the intersection is in the direction of the ray
    if (t > 0 && t < 1 && u > 0) {
        return {
            x: x1 + t * (x2 - x1),
            y: y1 + t * (y2 - y1),
            dist: u
        };
    }
    return null;
}

// makes the radial visibility cone of enemy
function checkEnemyVisibility() {
    enemyArr.forEach(enemy => {
        // Distance Check
        let distanceToPlayer = dist(enemy.x, enemy.y, player.x, player.y);
        
        if (distanceToPlayer > enemy.maxDist) {
            enemy.alerted = false;
            return;
        }

        // Cast a ray from the enemy to the player
        let angleToPlayer = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        let hit = getClosestIntersection(enemy.x, enemy.y, angleToPlayer);
        
        // If the ray hits nothing, or it hits a wall that is further away than the player...
        if (hit == null || hit.dist > distanceToPlayer) {
            enemy.alerted = true; // Player is within specified radius and unblocked
        } else {
            enemy.alerted = false; // Player is hiding behind a wall
        }
    });
}

class Coin{
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.r = len2*0.2;
        this.fillStyle = 'gold';
        this.mask = false;
        this.draw();
    }
    draw(){
        c.beginPath();
        c.arc(this.x,this.y,this.r,0,Math.PI*2);
        c.strokeStyle = 'black';
        c.lineWidth = 1;
        c.stroke();
        c.fillStyle = this.fillStyle;
        c.fill();
    }
}

// randomly dropping a coin (or a mask if gas chamber biome and tank or sniper)
function dropCoin(enemy){
    let dice = randInt(1, 6);
    if (biome == 'Gas Chamber' && (enemy.tank||enemy.sniper) && player.poisoned){
        console.log("dropped mask");
        coinArr.push(new Coin(enemy.x,enemy.y));
        coinArr[coinArr.length-1].mask = true;
        coinArr[coinArr.length-1].fillStyle = 'gray';
        return;
    }

    if ((dice == 6 ||(biome == 'Overgrown' && dice >= 4)) && player.visible){
        coinArr.push(new Coin(enemy.x,enemy.y));
    }
}

// Picking up a coin (or mask)
function pickUpCoin(){
    for (let i = 0; i < coinArr.length; i++){
        if (biome == 'Gas Chamber' && coinArr[i].mask){
            if (checkCollision(player, coinArr[i])){
                player.poisoned = false;
                new Audio("mask.m4a").play();
                coinArr.splice(i, 1);
                i--;
            }
            continue;
        }
        if (checkCollision(player, coinArr[i])){
            player.money += 10;
            new Audio("money.mp3").play();
            coinArr.splice(i, 1);
            i--;
        }
    }
}

// The marketplace
function market(){
    let buy = prompt("Welcome to the market, you can buy:\n1. 2 points of Health (10 dollars)\n2. Temporary Shield (30 sec) (30 dollars)\n3. Invisibility Potion but no loot dropped (30 sec) (50 dollars) (Press i to activate)\n4. Invincibility potion (10 sec) (60 dollars) (press v to activate)\n5. Score Multiplier for this floor (70 dollars)\n6. Weapon Upgrade (100 dollars) (Can only be purchased twice)\nIf you would like to skip, press anything else");
    if (buy == '1' && player.money >= 10){
        player.health+=2;
        player.money -= 10;
    }
    else if (buy == '2' && player.money >= 30){
        player.shield = 0.5;
        player.border = 2;
        setTimeout(() => {
            player.shield = 0;
            player.border = 1;
        }, 30000);
        player.money -= 30;
    }
    else if (buy == '3' && player.money >= 50){
        player.invisPotion = 1;
        player.money -= 50;
    }
    else if (buy == '4' && player.money >= 60){
        player.invincPotion = 1;
        player.money -= 60;
    }
    else if (buy == '5' && player.money >= 70){
        player.scoreMult = 3;
        player.money -= 70;
    }
    else if (buy == '6' && player.money >= 100 && player.damageMult < 1.5){
        player.damageMult += 0.25;
        player.money -= 100;
    }
}

function invincibility(){
    if (player.invincPotion == 0){
        return;
    }
    player.invincPotion--;
    player.shield = 1;
    player.border = 3;
    player.color = 'rgb(24, 26, 122)';
    setTimeout(() => {
        player.shield = 0;
        player.border = 1;
        player.color = 'blue';
    }, 10000);
}

function invisibility(){
    if (player.invisPotion == 0){
        return;
    }
    player.invisPotion--;
    player.visible = false;
    player.border = 0;
    player.color = 'rgba(193, 230, 247, 0.52)';
    setTimeout(() => {
        player.visible = true;
        player.border = 1;
        player.color = 'blue';
    }, 30000);
}


player = new Player(window_width/45,window_height/2);
init(); 