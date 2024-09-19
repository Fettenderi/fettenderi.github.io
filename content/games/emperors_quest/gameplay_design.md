+++
title = "Emperor's Quest: Gameplay Design"
+++

While searching ideas for the combat system the first days of development, I was inspired by Minecraft 1.8 PVP. Its main feature was the usage of the sword, flint & steel and a fishing rod.

Following that idea I started sketching some of the uses for these items:

# Flint & steel:
Used to start fires, ignite TNTs, damage close up enemies and deactivate magnets. This elegantly encompasses a lot of features into a single item, making it a useful addition to your inventory. It also adds a risk reward-machanic, there is a damage boost if the enemy is hit using the flint & steel from up close.

# Fishing rod:
I wanted this item to be used as a grappling hook, used even to bring enemies closer, to let them hang high and then let them take fall damage.

But in the end I scrapped this idea to make space for a more elegant and original idea. This free movement mechanic took form into the Amulet and all the Supercharged Redstone mechanic.

# Bag of seeds:
This was the first iteration of the Magneto-Resonant Controller. Initially this item would only attract and control hordes of chickens, ending the final sequence with a giant chicken made out of chickens wrecking the villain's mansion door.

It was replaced with the Controller to make it more in line with the other items, also I didn't like the idea of a simple bag of seeds being this powerful. The giant chicken idea got scrapped too because during early prototypes it didn't look as I wanted it to be. The ins and outs of this mechanic will be discussed in the System Design part.

---

Another very important, but also very silent gameplay mechanic are all the redstone contraptions. They make possible all of the complex features such as: moving platforms, dispensers, TNTs and also the final bossfight.

Redstone is implemented in Engine using 2 kind of object:

# Sender
 which is capable of sending an activation signal to all its connected receivers.

# Receiver
 which receives signals to perform particular actions.


# [Sender-Receiver Inheritance]
{{ resize_image(path="content/games/emperors_quest/no_brake.png", width=300, height=300, op="fit") }}

 A receiver is also a sender with some other functionality attached to it. This makes it possible to chain actions together even with custom timings.