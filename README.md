# Zen Knock To Expand

A [Sine](https://github.com/CosmoCreeper/Sine) mod for Zen Browser. In compact mode, the hidden sidebar and/or top toolbar open only on a **double knock** on their screen edge, instead of on every hover. This avoids accidental opens when reaching for page elements near the edge.

A knock is reaching the edge: entering the edge strip, or leaving the window through that edge. Two knocks open the element if they happen within the max time and the pointer moves at least the min distance away from the edge in between.

## Install

1. In Sine's settings, enable installing JS from unofficial sources (`sine.allow-unsafe-js`).
2. In Settings → Sine Mods, add `iannisimo/Zen-Knock-To-Expand`.
3. Restart Zen.

## Settings

| Setting | Pref | Default |
|---|---|---|
| Knock to expand: none / sidebar / top toolbar / both | `mod.knock-to-expand.targets` | `sidebar` |
| Max time between knocks (ms) | `mod.knock-to-expand.interval` | `400` |
| Min distance from the edge between knocks (px) | `mod.knock-to-expand.distance` | `30` |

Changes apply immediately. The top toolbar is only affected when compact mode hides it (`zen.view.compact.hide-toolbar`, without single toolbar).

## Notes

- Built against Zen 1.24b and Sine 2.3.3. It relies on Zen internals (`gZenCompactModeManager`, the `zen-has-hover` attribute), which may change between Zen releases.
- Dragging tabs to the edge still opens the sidebar on a single hover.
- Enabling or disabling the mod requires a restart.

## License

[MIT](LICENSE)
