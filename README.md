Rendering  Flow:
First I clear the entire canvas
then I draw the rooms, enemies, coins, bullets respectively
then I make the radial cone then player then HUD

Game Loop:
My game loop is the animate() function 
I use requestAnimationFrame function at the end to call it again and again
In it I update the postion of the player, do bullet updates, then win/loss condition.

State Management Approach:
i use arrays for bullets, enemnies,rooms and walls
I use player object which holds its properties like health score etc.
I also use global variables like biome, keys etc.

Collision Detection Method:
Circle-Circle collision:- using the dist between its two centers and checking if its less than or equal addition of their radii
Circle-Rectangle collions:- AABB Axis-Aligned Bounding Box 
Ray-casting for line-of-sight check

Room Generation Logic:
I use nested for loops to create the rooms using i+=2 and j+=2 in init() function at a specific interval
Inside the Room constructor I take a random integer from 0 to 3 to decide which of the 4 doors the doow will cut through
