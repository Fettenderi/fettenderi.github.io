+++
title = "Emperor's Quest: Engine Designing Tools"
+++

# Enemies:

To make all possible kinds of enemies that I can think of inspired by Minecraft, I used a custom Resource that describes: aspect, collisions, particles and stats. This resource is then fed to an enemy script, that can be of 4 types: melee, ranged, explosive or custom. Each class has a different attack associated:

## Melee class 
 is simple, when it sees the target it tries to approach it and when the target is within a certain distance from the enemy, if it has a special attack associated, it will use it. An example of melee enemy is the zombie, it has no special attack. The iron golem, on the other hand, has a heavy melee attack.

<div class = "gallery">
<img class = "gallery-gif" src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWE1eWZqZHFpMmphNGtxbnMwYnI0MnlleW96YWN5MHRjcmdva3k2ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/dtJloXj6kBGKVlHZVM/giphy.gif">
<img class = "gallery-gif" src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3J4ZXExY210b2F6c25oMm51ZjlyZGV3M3kxbGE5bHJteHh3bXN3bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/o3tuiSF9obNQVr3Hel/giphy.gif">
</div>

## Ranged class
 has many parameters that describe its behaviour. In Engine these parameters are visible as a sequence of concentric circles around the enemy, these describe: max throwing distance, max idle distance and min repulsion distance. The ranged attack module is used on the skeleton, but also on the warden and the arrow dispenser and tnt dispensers.

<div class = "gallery">
<img class = "gallery-gif" src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExa3p0cGo1NnhxZ2s0cjVoM3hmeW51NHZpcWJscTN6MnpjZHhqZTV4biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3UR1uy8fUd36Va6m84/giphy.gif">
</div>

## Explosive class
 works thanks to the explosive module, when the target is within the min explosion distance the enemy will stop and activate the explosive module. This will activate a state machine that counts down the time before explosion, if the player moves away the countdown increases again until it reaches the maximum explosion time.

<div class = "gallery">
<img class = "gallery-gif" src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3p6ZnIyZXpnbHM1eDZnOXVvb2NsdDJjbXdxbHEyNHd0ZDZvaTZsYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/rORqjqD0pD3nGVSS3X/giphy.gif">
</div>

To preview and design the different enemies I created a "mannequin" enemy, only capable, in Engine, to be dressed and have collisions placed according to the sprites.

``` gd,linenos
@tool
extends CharacterBody2D

@export var enemy_resource : EnemyResource
@export var is_magnetic := false

func _process(_delta):
    if Engine.is_editor_hint():
        %DeathParticles.set_deferred("process_material", enemy_resource.death_process_material)
        %Sprite.set_deferred("sprite_frames", enemy_resource.sprite_frames)
        %Shape.set_deferred("shape", enemy_resource.shape)
        %HitBox/CollisionShape.set_deferred("shape", enemy_resource.hitbox_shape)

        if enemy_resource.has_contact_damage:
            %HurtBox/CollisionShape.set_deferred("shape", enemy_resource.collision_shape)
        else:
            %HurtBox/CollisionShape.set_deferred("shape", Rect2(0,0,1,1))
        %HurtBox/CollisionShape.set_deferred("disabled", not enemy_resource.has_contact_damage)

        var step_sensor_shape := RectangleShape2D.new()
        step_sensor_shape.size.y = 0.3 * enemy_resource.shape.size.y
        step_sensor_shape.size.x = 1.5 * enemy_resource.shape.size.x

        %StepSensorBox/CollisionShape.set_deferred("shape", step_sensor_shape)
        %Sprite.position.y = enemy_resource.sprite_y_offset

        var shape_size_y : float = %Shape.shape.size.y / 2
        %StepSensorBox.position.y = shape_size_y - %StepSensorBox/CollisionShape.shape.size.y / 2
        %HurtBox.position.y = shape_size_y - %HurtBox/CollisionShape.shape.size.y / 2
        %HitBox.position.y = shape_size_y - %HitBox/CollisionShape.shape.size.y / 2

        scale.y = Math.change_direction(scale.y, -1 if is_magnetic else 1)
```

``` gd, hide_lines = 4-6 10-12, linenos
class_name Math
extends Object

static func explerp(from, to, delta):
	return lerp(from, to, 1 - exp(-delta))

static func change_direction(current, direction):
    if direction == 0: return current
    return abs(current) * direction

static func calculate_volume(volume : float) -> float:
	return 20 * log(remap(volume, 0, 10, 0, 0.5)) / log(10)
```

# Projectiles:

Projectiles use a similar modular system as the enemies. I have a custom Resource that describes the aspect and properties of the projectile, it then is attached to a specific projectile class, that can be a weighted projectile or an unweighted one.

# Case study: The Warden

<div class = "gallery">
{{ resize_image(path="static/images/emperors_quest/warden_resources.png", width=550, height=550, op="fit") }}
{{ resize_image(path="static/images/emperors_quest/warden_enemy_n_projectile.png", width=550, height=550, op="fit") }}
</div>


# Receivers and Miscellaneous:

To display and design complex features with many parameters I had to create in Engine tooltips for each object of the game.

## TNT:

In the simplest case I only had to display explosiveness of TNT, represented as a circle to visualize the AoE of the explosion.

{{ resize_image(path="static/images/emperors_quest/tnt_tooltip.png", width=250, height=250, op="fit") }}

## Platform Manager:

In other cases I had to build custom tooltip, such as this for the Platform Manager, here I had 4 main parameters:
- Speed of the platforms, not represented visually
- Direction in degrees, translated into an arrow vector
- Length of the path represented by the start and end placeholder platforms
- Amount of platforms visualized as small equidistant dots through the direction arrow

{{ resize_image(path="static/images/emperors_quest/platforms_tooltip.png", width=550, height=550, op="fit") }}

``` rust
Direction: 0°                                   Direction: 90°     
Length: 20                                      Length: 15   
Amount: 5                                       Amount: 2   
```

``` gd, linenos
@tool
class_name PlatformManager
extends Receiver

@export var speed := 2.0

@export_range(0, 270, 90, "degrees") var direction : float
@export var lenght := 1.0
@export_range(1, 100, 1) var amount := 1

@export var is_active := true

@export var platform_scene : PackedScene
@export var restart_box_scene : PackedScene

# Local variables and other gameplay methods

func _physics_process(_delta) -> void:
    if not Engine.is_editor_hint(): return
    var rad_direction : float = deg_to_rad(direction)

    direction_vector = Vector2.RIGHT * cos(rad_direction) + Vector2.UP * sin(rad_direction)

    %MovementIndicator.target_position = direction_vector * lenght * 8
    %EndIndicator.position = direction_vector * lenght * 8

    queue_redraw()

func _draw():
    if not Engine.is_editor_hint(): return
    var circle_offset : Vector2 = direction_vector * platform_step

    platform_step = (lenght * 8) / amount
    for i in range(amount):
        draw_circle(%StartIndicator.position + circle_offset * i, 2, Color(Color.WHITE, 0.2))

```

## Magnetic Surfaces:

Magnetic Surfaces aren't actually surfaces but instead areas that are positioned and scaled near supercharged crystal's surfaces. They are composed of an area that tells the player the magnetic force to add, and another area that detects flint and steels. To tweak the magnetic force I use 3 parameters:
- Direction, visualized like the Platform Manager
- Flow power, shown as the speed of the particles
- Particles Density, this is purely aesthetical

{{ resize_image(path="static/images/emperors_quest/surfaces_tooltip1.png", width=550, height=350, op="fit") }}

{{ resize_image(path="static/images/emperors_quest/surfaces_tooltip2.png", width=550, height=350, op="fit") }}

``` rust
Direction: 27°                                   Direction: 209°     
Power: 300                                       Power: 310   
Density: 0.9                                     Density: 0.2   
```

## Camera Lerper:

To control camera movements and in general zoom and other properties I have a particular type of node for each one of them. In particular the CameraZoomLerper node is used to lerp the camera zoom from a starting zoom to an ending one based on the player's horizontal position within a certain area. This behaviour is described through 4 inputs:
- Length and Height of the box in which the node has effect, shown through the red box
- Starting zoom, the zoom factor at the left of the area, shown through the yellow box
- Ending zoom, the zoom factor at the right of the area, shown through the green box

{{ resize_image(path="static/images/emperors_quest/camera_tooltip1.png", width=450, height=350, op="fit") }}

{{ resize_image(path="static/images/emperors_quest/camera_tooltip2.png", width=450, height=350, op="fit") }}

``` rust
Zoom Start: 0.7                                   Zoom Start: 4.5     
Zoom End: 2.3                                     Zoom End: 0.2   
```

<div class = "gallery">
<img class = "gallery-gif" src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzV5OWIxNjBqOTI3YnBlejMxcGViZTU0dm5vaGhvc3lqcXhnMTA3dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/tOmGOKa0YUmpyERyAi/giphy-downsized-large.gif">
</div>
