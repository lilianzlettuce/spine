### Functionality

The tool procedurally generates a composition of curve using a random seed and renders them in a hand-drawn style.

- Curves are generated and plotted using integrated curvature functions (defining turn rate as a function of arch length)
- The Autodraw mode generates a main parent curve then randomly adds child curves along it (maximum 3 layers of children)
  - The manual drawing mode substitutes this main parent curve with a line drawn onto the canvas by the user

Users can adjust

- Curve archetype (different presets that affect how many curves and the features of each curve)
  - e.g. tapering, bumpiness, end spiraling
- Render mode -> users can view and compare the base curves before/after added rendering
  - Lines: Minimal 1D lines
  - Vine: Hand-drawn rendering with 2D thickness and hatching/shading
    - Layered lines with added noise for wobbly smooth strokes
  - Bone: TBD
    - Add convincing 2D joint rendering connecting curve sections
    - Add stacked skeletal elements
      - Spine vertebrae along curves
      - Ribs along curves aligned with normal at each point
-

### Process

#### Inspiration

- Procedural drawing tools like [Fishdraw](<[https://github.com/LingDong-/fishdraw/blob/main/fishdraw.js#L1072](https://github.com/LingDong-/fishdraw/blob/main/fishdraw.js#L1072)>) and [Ian Cheng's 3FACE](<[https://kadist.org/work/3face-3412/](https://kadist.org/work/3face-3412/)>)
- [Fresh-water polyps](<https://en.wikipedia.org/wiki/Polyp_(zoology)>)
  - [Hydra Viridis](https://en.wikipedia.org/wiki/Hydra_viridissima)
  - [Hydra vulgaris](https://en.wikipedia.org/wiki/Hydra_vulgaris)
- My own sketches
- Weird hybrid skeletal structures (plant + human/mammal + machine)
- Angels from Neon Genesis Evangelion

Aesthetics

- Biomorphic, biopunk, biomech structures
- Hand-drawn style with shading
  - hand-drawn look: sketchy lines, pen texture ink strokes rather than perfect even digital lines
  - implement shading somehow

Some initial ideas:

- Something with more user interaction, possibly having multiple brushes of each "texture" (e.g. spine vertebrae, bony vine, etc.) that users draw with
  - For this I'd like to also have skeletal rigging (with joints that can be added to/connect different draw "body parts" together), but that might be a lot of work
  - If no skeletal rigging but still user drawing, maybe have it be more random (e.g. instead of being able to choose set brushes, it outputs a variety of body components when you draw that are automatically connected as you keep drawing)
- Some combination of both

User input:

- User draws 1 line, the "spine" of the drawing
- This defines the general direction/flow of the piece
  - Procedurally generate different spines/vines that branch off of this main one
- Output:
  - More abstract
    - Connected structure of branching vines, bony, join/tendon texture/rendering (with different variations, some more obviously "body"-based and others more abstract)
    - Components:
      - Joints (connects two different elements)
        - Round-ish, bony protrusion
      - Leaves (leaf nodes, terminal)
        - Doesn't have to be a literal leaf
        - Example:
          - More abstract curved line
          - Bone-like rigid "rib/horn/claw" extension
          - Plant-like soft extended leaf
      - Vines (smooth branching structure without joints)
      - Thorns (spiky branching structure without joints)
  - More bone-based
    - Using existing bone-based shape variations (e.g. spine vertebrae, skulls, appendages) that stack to create the illusion of a connected skeleton
    - Implement:
      - Spine sampling utility (points, normals, and tangents at evenly spaced distances) and the first generator (vertebrae

#### Implementation

I generated most of the code with Claude Sonnet 5.5 and modified it myself to get the style of output I wanted and add support for the interaction controls I wanted. I also used AI to assist in learning how procedural generation works and find resources explaining useful algorithms, techniques, architecture, equations, etc. Full Claude conversation: https://claude.ai/share/813561a8-2651-4453-b1c1-a4b066c71f50

I used Vite and a React.js + HTML canvas stack for the website instead of P5.js because I'm more familiar working with these for web dev and wanted to make life easier if I wanted to extend the UI later on.

#### Reflection & Outcomes

I initially wanted to make something that created output that was more obviously human-body related, as elaborated on in the previous inspiration section. However I've never made a procedural drawing tool before and greatly underestimated the difficulty, and I ended up spending most of my time researching and trying to understand how the math worked. I still really want the bone drawing tool I was envisioning though so I'll be working more on this in the near future to make that happen.

I am happy with the functionality of the tool but I would've liked to not rely on AI as much for generating the code. I started working on it way too late and ran out of time to do things properly myself. Although I also didn't have a great motivating direction for what kind of tool I should make until very recently so that also kind of contributed to this problem.
