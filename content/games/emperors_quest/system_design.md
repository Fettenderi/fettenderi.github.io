+++
title = "Emperor's Quest: System Design"
+++

The hordes system went through many different iterations.

The first concept was inspired by Dream Luigi of Mario & Luigi: Dream Team Bros. and by some Clank minigame of the Ratchet and Clank saga. It was fairly simple, for each 10 new members a new form would be unlocked as explained by this diagram.

# [Hordes Diagram]

# [WaveForm]
# [GiantForm]

Maybe with more development time I would have made the Giant Chicken Form the way I wanted but in the end I'm happy with what I've achieved.

---


The final version of the Controller is based solely on the Leader-Follower Mode. It works through a Singleton, the HiveMind that is being controlled by the HiveController. The HiveMind than relays all its inputs to the available leaders and they do the same with their followers.

# [HiveMind Diagram]

Each HiveMember has a HiveBehaviour, this can be described by this diagram:

# [HiveBehaviour Diagram]

An HiveMember can change Behaviour at any time with any other Behaviour using a common method.

# [HiveBehaviour Class Code]

Probably this isn't the most effective way ot do this but it works and solves many problems I had with other iterations of such system.

To describe the modes in which a Member can change Behaviour, I synthesized all possible cases in 4 events described by this diagram. This helped me tackle the code and implementation of such system.

# [HiveBehaviour Transformations Diagram]
# [LeaderHiveBehaviour Transformations Code]