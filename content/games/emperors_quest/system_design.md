+++
title = "Emperor's Quest: System Design"
+++

# Crowd System:

## First Design:

The hordes system went through many different iterations.

The first concept was inspired by Dream Luigi of Mario & Luigi: Dream Team Bros. and by some Clank minigame of the Ratchet and Clank saga.

<div class = "gallery">
<img class = "gallery-gif" src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExcXk4Y2Z1c3IyeXl3ZnJrdXVyc3g4M2RmN2xjNHJqaGx4ZjJpajQ0dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/tgwsXavtMuzzd2OvBn/giphy.gif">
<img class = "gallery-gif" src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExanB2b2F6cThqZGtuc2Q2bzl2MnU0OWt4dzdpNzA2Zm41NnNvajE0ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PMon7BrVYAJdOLBs2Y/giphy-downsized-large.gif">
</div>

It was fairly simple, for each 10 new members a new form would be unlocked, as depicted in this diagram:

{{ resize_image(path="static/images/emperors_quest/hordes_diagram.png", width=1000, height=1000, op="fit") }}

Maybe with more development time I would have made the Giant Chicken Form the way I wanted but in the end I'm happy with what I've achieved.

## Final Design:

The final version of the Controller is based solely on the Leader-Follower Mode. It works through a Singleton, the HiveMind that is being controlled by the HiveController. The HiveMind than relays all its inputs to the available leaders and they do the same with their followers.

{{ resize_image(path="static/images/emperors_quest/hive_diagram.png", width=1000, height=1000, op="fit") }}

An HiveMember can change Behaviour at any time with any other Behaviour using common methods.

``` gd, linenos
class_name HiveBehaviour
extends Node2D

var is_active := false
var member : HiveMember

func start(_info := {}): pass

func update_orders(_direction : int, _wants_jump : bool, _wants_tower : bool) -> void: pass

func end(): queue_free()


func become_follower(_info := {}): pass

func become_leader(_info := {}): pass

func become_inactive(_info := {}): pass


func free_member(): pass
```

Probably this isn't the most effective way to do this but it works and solves many problems I had with other iterations of such system.

To describe the modes in which a Member can change Behaviour, I synthesized all possible cases in 4 events described by this diagram. This helped me tackle the code and implementation of such system.

{{ resize_image(path="static/images/emperors_quest/members_transformation_diagram.png", width=1000, height=1000, op="fit") }}

<div class = "gallery">
<img class = "gallery-gif" src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExeDhjYjdhdWlvNG1vOHA3Zmhib2d4YWF5ODBjdnFzamhyMm90bTVkMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/0sJYf4X0cfKwkOieIG/giphy.gif">
</div>

## Case Study: LeaderHiveBehaviour

{{ note(header="Very long code block!", body="The following section is a very long chunk of code, if you couldn't handle the first one don't go forwards. If you are into this, go for it, it's far from perfect but it may be interesting to look at idunno.") }}

``` gd, linenos, hl_lines = 48-52 57-61
class_name LeaderHiveBehaviour
extends HiveBehaviour

@export var leader_boost_factor := 1.0

var followers : Array[HiveMember] = []

func start(info := {}):
    # Reset member's movement variables

    member.leader_boost = leader_boost_factor
    if info.has("followers"):
        followers = info["followers"]
        for follower in followers:
            follower.behaviour.become_follower({"leader_member": member})

func end():
    member.leader_boost = 1
    member.z_index -= 1
    queue_free()

func update_orders(new_direction : int, new_wants_jump : bool, new_wants_tower : bool) -> void:
    if not is_active: return

    # If hijacked order stop movement to followers

    # If is able to tower and has requested:
    # Try to build tower if not building one
    # Stop building tower if already building

    member.wants_jump = new_wants_jump and can_jump
    member.direction = new_direction * (0.5 if building_tower else 1.0)

    for follower in followers:
        follower.behaviour.update_orders(new_direction, member.wants_jump, building_tower)

func _build_tower_started():
    # Calling each follower by index to maintain order.

    # This makes the followers all line up and start to do little jumps to get
    # on top of each other.
    for i in range(len(followers)):
        if followers[i].behaviour is FollowerHiveBehaviour:
            followers[i].behaviour._tower_jump()
            await followers[i].behaviour.finished_jumping
            if not building_tower: return

func become_follower(info := {}):
    if info.has("leader_member"):
        _release_followers(info["leader_member"])
        member.change_behaviour(HiveMind.available_hive_behaviours[HiveMind.HiveBehaviours.FOLLOWER], {"leader_member": info["leader_member"]})
        info["leader_member"].behaviour.followers.append(member)

func become_leader(_info := {}):
    pass

func become_inactive(_info := {}):
    for follower : HiveMember in followers:
        follower.change_behaviour(HiveMind.available_hive_behaviours[HiveMind.HiveBehaviours.INACTIVE])
    HiveMind.members_count -= 1
    member.change_behaviour(HiveMind.available_hive_behaviours[HiveMind.HiveBehaviours.INACTIVE])

func free_member():
    _release_followers()
    HiveMind.members_count -= 1
    is_active = false
    member.queue_free()


func _release_followers(to_member : HiveMember = null):
    HiveMind.leaders.erase(member)

    # If to_member != null assign the followers to him
    # otherwise pick the last follower and promote him to leader and assign the other followers to him

## Activated when another Leader or an Inactive member gets near
func _on_control_box_area_entered(area : Area2D) -> void:
    if is_active and not is_hijacked:
        var hive_behaviour : HiveBehaviour = area.get_parent()

        if hive_behaviour is HiveBehaviour:
            hive_behaviour.become_follower({"leader_member": member})
            _handle_new_follower()

## Activated when the player gets too far
func _on_lost_check_box_body_exited(body) -> void:
    if is_active and body is Player:
        become_inactive()

func _handle_new_follower() -> void:
    %CanFollowersJumpTimer.start()
    can_jump = false
    if len(followers) >= 10:
        can_tower = true
    else:
        can_tower = false
        building_tower = false
```