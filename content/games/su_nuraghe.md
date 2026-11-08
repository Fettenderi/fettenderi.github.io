+++
title = "Su Nuraghe"
description = "An italian horror game about sardinian folklore"
date = "2025-02-28"
weight = 6

[extra]
local_image = "/games/su_nuraghe.png"
tags=["godot", "team", "lead-designer", "technical-design"]
+++

<div class = "gallery">
<iframe width="400" height="225" class ="gallery-video" src="https://www.youtube.com/watch?v=Jnuc8bxnYpQ" title="Su Nuraghe Trailer" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

We really put a lot of effort into this project, we had also a long timeframe to build it, roughtly less than a month due to personal commitments.

Let's start from the beginning, the team was composed by these people:
- [Andrea Ferretti (BatFerro)](https://itch.io/profile/andrea-ferretti): SFX Designer
- [Vittoria Vignolini (Vivi)](https://lacasadovevivi.itch.io): Illustrator Concept Artist
- [Achille Ferrari (coca.cola)](https://itch.io/profile/achillebus): 3D Modeller

and me as _programmer, general designer and lead_. I was already accustomed with many of the people in the team so it wasn't really difficult the collaboration part, all the asset creation, organizzation, delivery and implementation went pretty smoothly. However the weight of my three hats started to become a real issue.

# The idea
A first person horror game where you explore an alien nuraghe. The place is filled with mamuthones, tipical sardininan masks all wearing goat fur, huge bells on their back and a wood handcrafted mask.

We wanted to convey the _feeling of eariness_ of these creatures given by their famous dance with the bells. In the most important scene you will dress one of their costumes and _engage_ with their _dance_ without being caught by them.

<div class = "gallery">
{{ solo_image(path="static/images/su_nuraghe/illustration.png", width=1586, height=538, op="fit")}}
</div>

# Enemy design
To each mamuthones I gave a _Schedule_, a series of _Tasks_ pointing to different states in a state machine. These _Tasks_ can be divided in two categories: _Controlled tasks_, where each action may emit a signal and be also connected to other incoming asynchronous signals, and _Patrol tasks_, where the main goal is to follow a predetermined path while being on the look spotting tha player in their view cone. 

<div class = "gallery">
{{ solo_image(path="static/images/su_nuraghe/enemy-state-diagram.png", width=1770, height=1210, op="fit")}}
</div>

<div class="button-container">
{{ add_button(path="https://github.com/Fettenderi/SuNuraghe/tree/main/scenes/actors/creatures/movement_states", text="Read the code") }}
</div>

At the end of the development this design really began to be a pain to work with. I think the real issue was with the visualization and linking methods I created for the tool.

Next time I pick up a project of this size I will need to really think, ahead of time what kind of complexity a system needs to have, how can this overall complexity interface to the designer that will need to use the tool and how stable the infrastructure I will build will be.

{{ note(header="Lesson learned!", body="When dealing with complex AI systems a _State Machine_ will almost every time be unsustainable, I will prefer using state-of-the-art techniques such as _Behaviour Trees_ or _Goal-Based Agents_.") }}

# Level design

## First screen
In the span of the month I had a level in two parts, the first one serves as an introduction to basic enemy behaviour, getting accustomed to the player controller and overall onboarding on what is the player objective.

The first thing the player sees is the giant central bell and all its smaller counterparts, near it a circle of mamuthones, in my mind this was supposed to serve as the big final goal...

<div class = "gallery">
{{ solo_image(path="static/images/su_nuraghe/big_bell.png", width=1770, height=1210, op="fit")}}
</div>

...however during playtest many players ended up not looking so interested to the view and run straight to the next room.

{{ note(header="Lesson learned!", body="Players are not all naturally interested in landscapes especially if the meaning of the view is still really confusing and not clear.") }}

## First encounter
Following that, a series of rooms where the player needs to do some amount of stealth action, crawling through vents and hide behind barrels.

<div class = "gallery">
{{ solo_image(path="static/images/su_nuraghe/first_encounter.png", width=1770, height=1210, op="fit")}}
</div>

Looking back at it some ideas were good but the layout of it and the overall room layout feels frustrating to navigate through, in the end the player learns almost nothing about the enemy or its goals and the pacing it's too frenetic for no reason.

{{ note(header="Lesson learned!", body="_Intended path_ is _not_ so _obvious_ as the designer might think, you need to _clearly state the goal_ and what is happening, otherwise the player will only be confused.") }}

Maybe to fix some of the confusing things we could have added some voicelines that would suggest the intended way of thinking, but still the level design was terrible.

At the end of it the player deactivates one of the four main bells, this lowers all the lights in the game and makes the ambience noises more eerie.

## Scripted sequence
The player enters a new area, the sound traps are introduced, whenever they are triggered a nearby enemy will be notified and begin chasing the emitting source, to neutralize them the player can muffle the mechanism with the already collected wool.

<div class = "gallery">
{{ solo_image(path="static/images/su_nuraghe/dining_room.png", width=1770, height=1210, op="fit")}}
</div>

After some rooms the player discovers an unused mamuthones fur that can be used as a disguise, this will start a sequence where the player needs to lead some mamuthones to a room where after some time, they will all start to dance.

<div class = "gallery">
{{ solo_image(path="static/images/su_nuraghe/the_disguise.png", width=1770, height=1210, op="fit")}}
</div>

In this circumstance, the player will _need to mimic_ the mamuthones moves in a _short time frame_ for the whole duration of the corridor.

<div class = "gallery">
{{ solo_image(path="static/images/su_nuraghe/scripted_sequence.png", width=1770, height=1210, op="fit")}}
</div>

According to _playtester_ this was the _most interesting part_ of the experience, I agree with them, however some of them actually get bored or frustrated way before arriving to this section...

# Postmortem

I think the concept is still _very valid_, with a _rework on the level design_, a lot of bug fixes and by completing the story, it could be worthy of a Steam release.

<div class = "gallery">
{{ solo_image(path="static/images/su_nuraghe/ouside.png", width=1770, height=1210, op="fit")}}
</div>

<div class="button-container">
{{ add_button(path="https://fettenderi.itch.io/su-nuraghe", text="Try it!") }}
{{ add_button(path="https://github.com/Fettenderi/SuNuraghe", text="Source Code") }}
</div>

