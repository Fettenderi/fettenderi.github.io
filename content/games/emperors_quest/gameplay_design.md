+++
title = "Emperor's Quest: Gameplay Design"
+++

# Items:

While searching ideas for the combat system the first days of development, I was inspired by Minecraft 1.8 PVP. Its main feature being the usage of the sword and other tools to slow down or annoy the player, like the flint & steel or the fishing rod.

Following that idea I started sketching some of the uses for these items:

## Flint & steel:
{{ resize_image(path="static/images/emperors_quest/flint_n_steel.png", width=100, height=100, op="fit") }}

<p>Used to start fires, ignite TNTs, damage close up enemies and deactivate magnets. This elegantly encompasses a lot of features into a single item, making it a useful addition to your inventory. It also adds a risk reward-mechanic, there is a damage boost if the enemy is hit using the flint & steel from up close.</p>

<div class = "gallery" style = "display:inline-flex">
<img class = "gallery-gif" src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDlzY3I2NjIxdWw4YnduOTlod3M2eWpzazU3czd5MHVwZm9uZmgyaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MA4XkcSHj0yzIpeiqZ/giphy.gif">
<img class = "gallery-gif" src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHFibzd3YjJqNnNjbHphMWI5ZHZlN291bjA1MGN5eDM0cjhjaXV4ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/vJ5FpgdaRtlp04DZE8/giphy.gif">
<img class = "gallery-gif" src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExaTV0d2szbDFjenB3d3I4NzUwaXBpYWt5dGQxZGRpa2xkNTZkeDE5OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/YqohbhJRomqojk5GYW/giphy.gif">
<img class = "gallery-gif" src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGMwODVmMmRyMWU3YWQwbWg2cjY2bXh4Ynh5aTY5M2p4Y3pndTd4MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/iJLe59mnNzucBpDe3G/giphy.gif">
</div>


## Fishing rod:
{{ resize_image(path="static/images/emperors_quest/fishing_rod.png", width=100, height=100, op="fit") }}

<p>I wanted this item to be used as a grappling hook, used even to bring enemies closer, making them hang high and then let them take fall damage.

But in the end I scrapped this idea to make space for a more elegant and more appealing idea. This free movement mechanic took form into the Amulet and all the Supercharged Redstone mechanic.</p>

## Bag of seeds:
{{ resize_image(path="static/images/emperors_quest/bag_of_seeds.png", width=100, height=100, op="fit") }}

<p>This was the first iteration of the Magneto-Resonant Controller. Initially this item would only attract and control hordes of chickens, ending the final sequence with a giant chicken made out of chickens wrecking the villain's mansion door.

It was replaced with the Controller to make it more in line with the other items, also I didn't like the idea of a simple bag of seeds being this powerful. The giant chicken idea got scrapped too because during early prototypes it didn't look as I wanted it to be. The ins and outs of this mechanic will be discussed in the System Design part.</p>

# Redstone Contraptions:

Another very important, but also silent gameplay mechanic are all the redstone contraptions. They make possible all of the complex features such as: moving platforms, dispensers, TNTs and also the final bossfight.

Redstone is implemented in Engine using 2 kinds of object:

## Sender
{{ resize_image(path="static/images/emperors_quest/sender.png", width=100, height=100, op="fit") }}

<p> which is capable of sending an activation signal to all its connected receivers.</p>

``` gd, linenos, hide_lines=7-12 33-39, hl_lines=21-26
class_name Sender
extends Node2D

@export var receivers : Array[Receiver]
@export var signal_scene : PackedScene
@export var signal_cooldown_time := 2.0

var has_setup_signal_cooldown := false
var is_in_signaling_cooldown := false
var last_signaled_value := false

var signal_cooldown : Timer

## This method emits a signal to all connected receivers,
## it can be set only visible, only triggering or both at the same time.
## (I think this method is still a bit messy)
func send(triggering : bool = true, signal_type : bool = true, is_signal_visible : bool = true) -> void:
    if not has_setup_signal_cooldown:
        _setup_signal_cooldown()
        has_setup_signal_cooldown = true
    for receiver in receivers:
        if receiver != null:
        if triggering:
            receiver._sent()
        if is_signal_visible:
            _generate_signal(receiver, signal_type)


func _generate_signal(target : Receiver, signal_type : bool = false) -> void:
    if is_in_signaling_cooldown and last_signaled_value == signal_type: return

    # Spawning signal particles
    var signal_instance = signal_scene.instantiate()

    if signal_instance is RedstoneSignal:
        signal_instance.global_position = global_position
        signal_instance.target = target
        signal_instance.is_active = signal_type
        get_parent().call_deferred("add_child", signal_instance, true)

    signal_cooldown.start(signal_cooldown_time)
    last_signaled_value = signal_type
    is_in_signaling_cooldown = true

func _setup_signal_cooldown():
    signal_cooldown = Timer.new()
    signal_cooldown.wait_time = signal_cooldown_time
    signal_cooldown.one_shot = true
    signal_cooldown.timeout.connect(_on_signal_cooldown_timeout)
    add_child(signal_cooldown)

func _on_signal_cooldown_timeout():
    is_in_signaling_cooldown = false
```
## Receiver
{{ resize_image(path="static/images/emperors_quest/receiver.png", width=100, height=100, op="fit") }}

<p> which receives signals to perform particular actions.</p>

``` gd, linenos, hl_lines = 15-16 35-37
class_name Receiver
extends Sender

@export var activation_delay_time := 1.0
@export var deactivation_delay_time := 1.0

@export var relay_time := 0.0

@export var waiter_scene : PackedScene

var was_deactivated := true

## This is the method that gets overridden when
## a receiver detects a redstone signal
func triggered() -> void:
    pass

func _sent():
    if was_deactivated:
        if activation_delay_time > 0.0:
            await get_tree().create_timer(activation_delay_time).timeout
    else:
        if deactivation_delay_time > 0.0:
            await get_tree().create_timer(deactivation_delay_time).timeout
    was_deactivated = not was_deactivated
    _received()

func _received() -> void:
    triggered()
    if relay_time <= 0.0: return

    var waiter_instance := waiter_scene.instantiate()

    if waiter_instance is Waiter:
        waiter_instance.receivers = receivers
        get_parent().add_child(waiter_instance, true)
        waiter_instance.start(relay_time)
```

<br>
{{ resize_image(path="static/images/emperors_quest/sender_inheritance_tree.png", width=500, height=500, op="fit") }}

<p> A receiver is also a sender with some other functionality attached to it. This makes it possible to chain actions together even with custom timings.</p>

<div class = "gallery">
<img class = "gallery-gif" src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExemI0NXk3MjRtYm5rMGl4cXM4Ym0yOHI4MHU4dm9heG15dGswbnZsZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/nvjiCYEXcsmP9jU2GG/giphy.gif">
<img class = "gallery-gif" src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExaHZ6c2Z0bGx5anhzd2JqdGY2d2Y4NGpnZHFtaXB0YjZjaG5rMDZoZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/46GhVnSIl0XpRfv6zR/giphy.gif">
</div>
