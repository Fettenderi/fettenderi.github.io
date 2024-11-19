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


After working on a few small projects in VR, I wanted to create an actual game using my acquired knowledge. So [UnconsciousMotifs](https://unconscious-motifs.itch.io), [BatFerro](https://itch.io/profile/andrea-ferretti) and I were full of energy to start working on this project.

# The idea
The game was developed for the [1-BIT JAM #4](https://itch.io/jam/1-bit-jam-4) and the main theme was Tower, so the first thing that came to mind was a tower defense. To fully embrace the theme, we decided to have the tower's height upgradable, this led us to the idea of the Tower of Babel, and from there, biblically accurate angels became an obvious choice.

# Aesthetics
To quickly create models while also achieving a unique art style, I worked on a dithering shader, heavily inspired by Return of the Obra Dinn, though not quite at the same level. I implemented two GLSL shaders using the new CompositorEffect feature of Godot 4.3.

<div class = "gallery">
{{ solo_image(path="static/images/babel_ascent/aesthetics.png", width=1000, height=1000, op="fill")}}
</div>

The first shader was needed for the dithering and edge detection.

``` comp, linenos
#[compute]
#version 450

layout(local_size_x = 16, local_size_y = 16, local_size_z = 1) in;

layout(rgba16f, binding = 0, set = 0) uniform image2D screen_texture;
layout(binding = 0, set = 1) uniform sampler2D depth_texture;

layout(push_constant, std430) uniform Params {
    vec2 screen_size;
    float inv_proj_2w;
    float inv_proj_3w;
} p;

const float pattern2[4] = float[](
    0.0 / 4.0, 2.0 / 4.0,
    3.0 / 4.0, 1.0 / 4.0
);

vec4 effect(vec4 color, ivec2 pixel_position, vec2 uv);

float get_bayer2_value(ivec2 pixel_coord);
float get_border(float thickness, vec2 uv);

float get_depth(vec2 uv);

void main() {
    ivec2 pixel = ivec2(gl_GlobalInvocationID.xy);
    vec2 size = p.screen_size;
    int down_scaling_factor = 2;

    vec2 uv = pixel * down_scaling_factor / size;

    if (pixel.x >= size.x || pixel.y >= size.y) return;
		
    vec4 color = imageLoad(screen_texture, pixel * down_scaling_factor);
	
    color = effect(color, pixel, uv);
	
    for (int i = 0; i < down_scaling_factor; i++) {
        for (int j = 0; j < down_scaling_factor; j++) {
            imageStore(screen_texture, pixel * down_scaling_factor + ivec2(i, j), color);
        }
    }
}

vec4 effect(vec4 color, ivec2 pixel_position, vec2 uv) {
    float gray = color.r * 0.2125 + color.g * 0.7154 + color.b * 0.0721;
    gray = clamp(get_border(0.002, uv) + gray, 0.0, 1.0);
	
    float dither_value = get_bayer2_value(pixel_position);
	
    if (gray > dither_value + 0.3) {
        color = vec4(vec3(1.0), 1.0);
    } else {
        color = vec4(vec3(0.0), 1.0);
    }
	
    return color;
}

float get_bayer2_value(ivec2 pixel_coord) {
    int index = (pixel_coord.y % 2) * 2 + (pixel_coord.x % 2);
    return pattern2[index];
}

float get_border(float thickness, vec2 uv) {
    return get_depth(uv + vec2(thickness, 0.0)) +
      get_depth(uv - vec2(thickness, 0.0)) +
      get_depth(uv + vec2(0.0, thickness)) +
      get_depth(uv - vec2(0.0, thickness)) -
      4.0 * get_depth(uv + vec2(0.0, 0.0));
}

float get_depth(vec2 uv) {
    float depth = texture(depth_texture, uv).r;
    float linear_depth = 1.0 / (depth * p.inv_proj_2w + p.inv_proj_3w);
    return clamp(linear_depth / 100.0, 0.0, 1.0);
}
```

The second one was for selecting color palettes on the fly, at first I had in mind of chaning the palette every once in a while to spice up the mood and aesthetics.

``` comp, linenos
#[compute]
#version 450

layout(local_size_x = 16, local_size_y = 16, local_size_z = 1) in;

layout(rgba16f, set = 0, binding = 0) uniform image2D color_image;

layout(push_constant, std430) uniform Params {
	vec4 black_color;
	vec4 white_color;
	vec2 raster_size;
} params;

void main() {
	ivec2 uv = ivec2(gl_GlobalInvocationID.xy);
	ivec2 size = ivec2(params.raster_size);

	if (uv.x >= size.x || uv.y >= size.y) {
		return;
	}

	vec4 color = imageLoad(color_image, uv);

	if (color.r > 0.5) {
		color = params.white_color;
	} else {
		color = params.black_color;
	}
	
	imageStore(color_image, uv, color);
}
```

# Gameplay

Initially, we had the cannon and the crossbow in mind as weapons, and the player could unlock or buy them in between of the phases.

The cannon deals a huge amount of damage, but charging it is time-consuming. The crossbow is easy to use for long-range attacks but deals low damage. While working on that, I came up with the idea of the harp, a fun and unique weapon. When all strings are touched in the correct order a note is shot. It's a short-range weapon that deals decent damage.

<div class = "gallery">
{{ gallery_image(path="static/images/babel_ascent/0_94.jpg", width=1000, height=1000, op="fill")}}
{{ gallery_image(path="static/images/babel_ascent/0_97.jpg", width=1000, height=1000, op="fill")}}
{{ gallery_image(path="static/images/babel_ascent/0_93.jpg", width=1000, height=1000, op="fill")}}
</div>

After some time spent fixing bugs and other mechanics, we introduced close-range weapons, such as the brick, which can be thrown and deals low damage, and the hammer, which is also throwable and can be used for long-range attacks. However, aiming is a bit difficult in a VR game, so to reward the player when thay hit an enemy with it we created an upgraded version of the hammer. When an enemy is hit, all enemies within a certain distance from it get stunned for a short time.

<div class = "gallery">
{{ solo_image(path="static/images/babel_ascent/0_92.jpg", width=1000, height=1000, op="fill")}}
</div>

# The Lurking Merchant

We wanted a mysterious-looking figure to sell you all the weapons and upgrades, to reinforce the theme of a corrupted ascent. He comes in between fights and will offer the player different items that can be purchased using orbs of light dropped by the enemies. 

<div class = "gallery">
{{ solo_image(path="static/images/babel_ascent/0_98.jpg", width=1000, height=1000, op="fill")}}
</div>

When an item is chosen, light will be removed from the scale and the merchant will let you know he's ready to seal the deal through a handshake.

<div class = "gallery">
{{ solo_image(path="static/images/babel_ascent/0_99.jpg", width=1000, height=1000, op="fill")}}
</div>

If you have a VR headset and at least a GeForce GTX 1660 Ti you can run it!

<div class="button-container">
{{ add_button(path="https://fettenderi.itch.io/babel-ascent", text="Try it!") }}
{{ add_button(path="https://github.com/Fettenderi/Babel-Ascent", text="Source Code") }}
</div>