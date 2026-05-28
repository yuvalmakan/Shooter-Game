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

// function randCol(colors){
//     return colors[Math.floor(Math.random()*colors.length)];
// }

function dist(x1,y1,x2,y2){
    return Math.sqrt((x1-x2)**2+(y1-y2)**2);
}

let keys = {};
let kill = false;
window.addEventListener('keydown',(e) => {
    keys[e.key] = true;
    if (keys['r']){
        delete keys['r'];
        player.x = window_width/45;
        player.y = window_height/2;
        if (enemyArr)
            kill = true; 
            if (player.health != 0){
                alert("Restarting");
                player.health = 5;
                player.score = 0;
            }
        if (player.health == 0){
            player.health = 5;
            player.score = 0;
            kill = false;
        }
        init();
        
    }
});

window.addEventListener('keyup',(e) => {
    delete keys[e.key];
});

function movePlayer(){
    let speed = player.speed;
    if (keys['w'] && keys['a'] || keys['w'] && keys['ArrowLeft'] || keys['ArrowUp'] && keys['a'] || keys['ArrowUp'] && keys['ArrowLeft'] || keys['w'] && keys['d'] || keys['w'] && keys['ArrowRight'] || keys['ArrowUp'] && keys['d'] || keys['ArrowUp'] && keys['ArrowRight']){
        speed = player.speed/Math.sqrt(2);
    }
    if(keys['s'] && keys['a'] || keys['s'] && keys['ArrowLeft'] || keys['ArrowDown'] && keys['a'] || keys['ArrowDown'] && keys['ArrowLeft'] || keys['s'] && keys['d'] || keys['s'] && keys['ArrowRight'] || keys['ArrowDown'] && keys['d'] || keys['ArrowDown'] && keys['ArrowRight']){
        speed = player.speed/Math.sqrt(2);
    }
    if ((keys['w'] || keys['ArrowUp']) && player.y-player.r-speed>0){
        player.y-=speed;
    }
    if ((keys['s'] || keys['ArrowDown']) && player.y+player.r+speed<window_height){
        player.y+=speed;
    }
    if ((keys['a'] || keys['ArrowLeft']) && player.x-player.r-speed>0){
        player.x-=speed;
    }
    if ((keys['d'] || keys['ArrowRight']) && player.x+player.r+speed<window_width){
        player.x+=speed;
    }
}

let roomArr = [];
let enemyArr = [];
let player;
let bulletArr = [];

function drawHUD(){
    let score = player.score;
    let health = player.health * 10;
    c.fillStyle = 'white';
    c.font = '50 px Arial';
    c.fillText(`Score: ${score}`,20,30);
    c.fillText(`Health: ${health}`,window_width-150,30);
}

function init(){
    // console.log("initializing");
    roomArr = [];
    enemyArr = [];
    bulletArr = []
    for (let i=1;i<17;i+=2){
        for (let j=1;j<9;j+=2){
            roomArr.push(new Room(i*len,j*len));
            let newx = Math.random()*(len - len2 - 2*border) + border;
            let newy = Math.random()*(len - len2 - 2*border) + border;
            enemyArr.push(new Enemy(i*len+newx+len2*0.35,j*len+newy+len2*0.35));
        }
    }
    
    animate();
}

function animate(){
    c.clearRect(0,0,window_width,window_height);
    
    for (let i=0;i<roomArr.length;i++){
        roomArr[i].draw();
    }   
    for (let i=0;i<enemyArr.length;i++){
        enemyArr[i].draw();
    }  
    bulletArr.forEach( (bullet) => {
        bullet.draw();
    })
    drawRadialVision();
    checkEnemyVisibility();
    MOVEPlayer();

    player.draw();
    
    drawHUD();
    if (player.health == 0){
        new Audio("player_death.wav").play();
        alert("You have lost, if you wanna restart then press r");
        return;
    }
    if (enemyArr == []){
        new Audio("winning.mp3").play();
        alert("You have cleared this floor!, if you would like to continue, press r");
        
        return;
    }
    if (kill){
        kill = false;
        return;
    }        
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
                    
                // console.log("Touched wall at " + wall.x + ", " + wall.y);
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
        console.log(dist(blob1.x,blob2.x,blob1.y,blob2.y));
        console.log(blob1.r + blob2.r);
        return true;
        }
    return false;
}

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
    let width = len2/5;
    c.fillRect(blob.x-width*blob.health/2,blob.y-2*blob.r,width*blob.health,blob.r/2);
}

class Player{
    constructor(x,y){
        this.score = 0;
        this.health = 5;
        this.x = x;
        this.y = y;
        this.r = len2*0.3;
        this.speed = 2;
        this.draw();
    }
    draw(){
        c.beginPath();
        c.arc(this.x,this.y,this.r,0,Math.PI*2);
        c.strokeStyle = 'black';
        c.lineWidth = 1;
        c.stroke();
        c.fillStyle = 'blue';
        c.fill();
        healthBar(this);
        // console.log(this.speed);
    }
}

class Enemy{
    constructor(x,y){
        this.health = 3;
        this.x = x;
        this.y = y;
        this.r = len2*0.3;
        this.alerted = false;
        this.cooldown = 0;
        this.draw();
    } 
    draw(){
        c.beginPath();
        c.arc(this.x,this.y,this.r,0,Math.PI*2);
        c.strokeStyle = 'black';
        c.lineWidth = 1;
        c.stroke();
        c.fillStyle = 'red';
        c.fill();
        healthBar(this);
        if (this.cooldown > 0) this.cooldown--;
        if (this.alerted && this.cooldown==0){
            this.shoot();
            this.cooldown = 60;
        }
    }
    shoot(){
        let tan = (player.y - this.y)/(this.x-player.x)*(-1);
        let up = 1;
        if (player.x < this.x)
            up=-1;
        bulletArr.push(new Bullet(this.x,this.y,this.r,tan,up))
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
        this.draw();
    }
    draw(){
        if (this.x>=innerWidth-this.r || this.x<=this.r)
        this.dx=-this.dx;

        if (this.y>=innerHeight-this.r || this.y<=this.r)
            this.dy=-this.dy;

        this.x+=this.dx;
        this.y+=this.dy;

        enemyArr.forEach( (enemy) => {
            if (this.range && checkCollision(this,enemy)){
                bulletArr = bulletArr.filter(bullet => bullet != this);
                enemy.health--;
                if (enemy.health == 0){
                    new Audio("dying_enemy.wav").play();
                    player.score += 10;
                    enemyArr = enemyArr.filter(Enemy => Enemy != enemy);
                }
            }
        })

        if (this.range && checkCollision(this,player)){
            bulletArr = bulletArr.filter(bullet => bullet != this);
            player.health--;  
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
        }
        this.x+=this.dx;
        this.y+=this.dy;
    }

}


window.addEventListener('click', (e) => {
    let tan = (player.y - e.y)/(e.x-player.x)*(-1);
    let up =1;
    if (player.x>e.x)
        up=-1;
    
    bulletArr.push(new Bullet(player.x,player.y,player.r,tan,up));
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

function drawRadialVision() {
    c.beginPath();
    c.rect(0, 0, window_width, window_height);
    
    c.moveTo(player.x, player.y);
    let playerAngle = Math.atan2(mouse.y - player.y, mouse.x - player.x); 
    
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
    c.fill("evenodd"); 
}

function getClosestIntersection(x, y, angle) {
    let closest = null;
    let minDistance = Infinity;

    for (let room of roomArr){
        let door = room.wallArr[4]; 

        for (let wall of room.wallArr) {
            if (wall == door) continue;

            let hit = castRay(x, y, angle, wall);
            
            if (hit) {
                // We add a tiny 1-pixel buffer to account for JavaScript floating-point math rounding.
                let hitIsInsideDoor = (
                    hit.x >= door.x && 
                    hit.x <= door.x + door.w &&
                    hit.y >= door.y && 
                    hit.y <= door.y + door.h
                );

                // 3. Only count the hit if it is NOT inside the door gap
                if (!hitIsInsideDoor && hit.dist < minDistance) {
                    minDistance = hit.dist;
                    closest = hit;
                }
            }
        }
    }
    return closest; 
}

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
    if (den === 0) return null;

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

function checkEnemyVisibility() {
    enemyArr.forEach(enemy => {
        // 1. Distance Check (Using your existing maxDist variable)
        let distanceToPlayer = dist(enemy.x, enemy.y, player.x, player.y);
        
        if (distanceToPlayer > maxDist) {
            enemy.alerted = false;
            return; // Too far away, move to next enemy
        }

        // 2. Line of Sight Check 
        // Cast a ray from the enemy to the player
        let angleToPlayer = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        let hit = getClosestIntersection(enemy.x, enemy.y, angleToPlayer);
        
        // If the ray hits nothing, OR it hits a wall that is further away than the player...
        if (hit == null || hit.dist > distanceToPlayer) {
            enemy.alerted = true; // Player is within 360 radius and unblocked!
        } else {
            enemy.alerted = false; // Player is hiding behind a wall
        }
    });
}


player = new Player(window_width/45,window_height/2);
init(); 