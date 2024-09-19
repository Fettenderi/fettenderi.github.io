+++
title = "Emperor's Quest: Engine Designing Tools"
+++

# Enemies:

To make all possible kinds of enemies that I can think of inspired by Minecraft, I used a custom Resource that describes: aspect, collisions, particles and stats. This resource is than fed to an of enemy script, that can be of 4 classes: melee, ranged, explosive or custom. Each class has a different attack associated:

## Melee class 
 is simple, when it sees the target he tries to approach it and when the target is within a certain distance from the enemy, if it has a special attack associated it will use it. And example of melee enemy is the zombie, it has no special attack, but on the other hand the iron golem, also a melee enemy, has a heavy melee attack.

## Ranged class
 has a lot of parameters that describe its behaviour. In Engine these parameter are visible as a sequence of concentric circles around the enemy, these describe: max throwing distance, max idle distance and min repulsion distance. The ranged attack module is used on the skeleton, but also on the warden and the arrow dispenser and tnt dispensers.

## Explosive class
 works thanks to the explosive module, when the target is within the min explosion distance the enemy will stop and activate the explosive module. This will activate a state machine that counts down the time before explosion, if the player moves away the countdown stops and it goes up again until it reaches the maximum explosion time.

To preview and design the different enemies I created a "mannequin" enemy, only capable, in Engine, to be dressed and have collisions placed according to the sprites.

# Projectiles:

Projectiles use a similar modular system as the enemies. I have a custom Resource that describes the aspect and properties of the projectile, it than is attached to a specific projectile class, that can be a weighted projectile or an unweighted one.

# Case study: The Warden

[Warden Design Resources]


# Receivers and Miscellaneous:

To display and design complex features with many parameters I had to create in Engine tooltips for each object of the game.


In the simplest case I only had to display explosiveness of TNT, represented as a circle to visualize the AoE of the explosion.
## [TNT Tooltip]

In other cases I had to build custom tooltip, such as this for the Platform Manager, here I had 4 main parameters:
- Speed of the platforms, not represented visually
- Direction in degrees, translated into an arrow vector
- Lenght of the path represented by the start and end placeholder platforms
- Amount of platforms visualized as small equidistant dots through the direction arrow
## [HPlatform Tooltip] [Description]
## [VPlatform Tooltip] [Description]

For the Magnetic Surfaces I have 3 parameters:
- Direction, visualized like the Platform Manager
- Flow power, shown as the speed of the particles
- Particles Desnity, this is purely aesthetical
## [Magnetic1 Tooltip] [Description]
## [Magnetic2 Tooltip] [Description]

To control camera movements and in general zoom and other properties I have a particular type of node for each one of them. In particular the CameraZoomLerper node is used to lerp the camera zoom from a starting zoom to an ending one based on the player's horizontal position within a certain area. This behaviour is described through 4 inputs:
- Lenght and Height of the box in which the node has effect, shown through the red box
- Starting zoom, the zoom factor at the left of the area, shown through the yellow box
- Ending zoom, the zoom factor at the right of the area, shown through the green box
## [CameraLerper1 Tooltip] [Description]
## [CameraLerper2 Tooltip] [Description]