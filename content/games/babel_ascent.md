+++
title = "Babel Ascent"
description = "A 1bit - VR game where you fight biblical angels to create the highest tower"
date = "2024-10-11"
weight = 6

[extra]
local_image = "/games/babel_ascent.png"
tags=["godot-engine", "team", "lead-designer", "technical-gameplay-designer", "vr", "shader", "github"]
babel = true
+++

<div class = "gallery">
<iframe width="400" height="225" class ="gallery-video" src="https://www.youtube.com/embed/gEMYtLm-8uY?si=rjLIaHoLB0D_y3Nd" title="Babel Ascent Trailer" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
<iframe width="400" height="225" class ="gallery-video" src="https://www.youtube.com/embed/StAaA7DYxMg?si=MtQHS2mt9SeBrxY8" title="Babel Ascent Playthrough" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

This is my third team project and the first one where I was the wearing the lead designer hat. However I was pretty confident on my ability to guide my teammates, the composer [UnconsciousMotifs](https://unconscious-motifs.itch.io) and SFX designer [BatFerro](https://itch.io/profile/andrea-ferretti), given the amount of synergy we already have acquired together.

As if that weren't enought it was also our first VR project. Needless to say, we learned a lot from it in terms of UX, VR development systems and complex object interactions. 

# The idea
You want to build a tower that can reach the heavens, but hordes of angels will try to stop you in your building progress. It is a reinterpretation of the story of the Tower of Babel, we got inspired by the theme of the [1-BIT JAM #4](https://itch.io/jam/1-bit-jam-4) "Tower".

# Gameplay
Can be easily explained like this:
- You use items and weapons at your disposal to survive from the hordes of angels that come and try to destroy the tower. 
- When you survive a set amount of enemies you are brought to a mysterious merchant where you can are able to buy new weapons and upgrade your tower.
- Repeat untill your tower is powerfull enough to withstand the final horde of angels. 

## The enemies
At each level of progression the hordes of enemies will be composed of different kinds angels. Each of them with a different movement pattern.

// Inserire immagine dei vari angeli e del pattern di movimento sovraimposto

To achieve these diverse movement patterns I created a modular system based on a few mathematical functions that I could use during the design to achieve my desired outcome. Some combinations were quite bizzare and behaved in funky ways but I'm still proud of this.

// Inserire immagine del sistema modulare per la creazione dei movement pattern

## The weapons
At each encounter with the merchant you could purchase one or more weapons and upgrades.

<div class = "gallery">
{{ solo_image(path="static/images/babel_ascent/0_100.webp", width=1700, height=1000, op="fit")}}
</div>

| Weapon | Type | Progress Needed | Retrospect notes |
|--------|------|-----------------|-------| 
| Bricks | Throwable | Starting weapon | Really annoying to use, you have to pick them up, one by one from the floor at the start, *bad UX* |
| Hammer | Melee / Throwable | 1st shop | The idea of a melee weapon is against the design of the enemies whenever they are near it's too late for melee, useless first item | 
| Crossbow | Long Range | 2nd shop | Really *good feeling weapon*, but annoying reloading mechanism, you have to physically grab the new arrow from the table and put it into the holder |
| Harp | Long Range | 2nd shop | This behaves similar to the crossbow, but you don't need to reload it, to shoot a note projectile you need to play 4 notes in sequence in rapid succession |
| Cannon | Long Range | 3rd shop | To reload it you need to open the barrel, chuck a bunch of cannon balls inside, close the barrel and press a button. It feels *really rewarding* but it has the *same issue as the 2 weapons above* |
| Electric Hammer | Melee / Throwable | 3rd shop | Just a *useless variant* of the hammer, it electrifies enemies in the range of the first hit, pointless at this point in the game |

These weapons all have problems, some clash with the enemy design, others involve very repetitive and exhausting tasks that in a VR experience can be really annoying to perform for long times. Fortunately the game doesn't last too long, just 20 minutes, but still a problem I will try to address in future projects. 

# Aesthetics
We were on a really strinct schedule, only 2 weeks, and in the team I was the only one with some sort of modelling and graphical skills, so we had really little time to create complex models and textures. We also had to stay within the rules of the jam, so we needed to only have 2 colors.

To solve that issue I worked on a posterization and dithering effect heavily inspired by Return of the Obra Dinn. This art style is achieved using two GLSL shaders:
- Layer 1: Downsampling, 1-bit posterization using luminescence, and ordered dithering.
- Layer 2: Paletteswapping

The original idea was to gradually change the two colors during gameplay to convey intensity whenever the enemy got nearer or the enemies were too much. The idea was left unimplemented for lack of time, but in some capacity the dynamic soundtrack already helps with that goal. 

<script type="module" src="/js/babel_ascent_shader_embed.js"></script>
<div class = "gallery" id = "shader">
{{ solo_image(path="static/images/babel_ascent/aesthetics_frame.png", width=1000, height=1000, op="fit")}}
</div>

If you have a VR headset and at least a GeForce GTX 1660 Ti you can run it!

<div class="button-container">
{{ add_button(path="https://fettenderi.itch.io/babel-ascent", text="Try it!") }}
{{ add_button(path="https://github.com/Fettenderi/Babel-Ascent", text="Source Code") }}
</div>