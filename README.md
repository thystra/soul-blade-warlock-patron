# Soul Blade Patron

A local Foundry VTT module for Foundry v14 / dnd5e 5.3.3 containing a homebrew 2024-style Warlock subclass: **Soul Blade Patron**.

## Install

Use this link to install via Foundry web interface:
https://github.com/thystra/soul-blade-warlock-patron/releases/latest/download/module.json

Alternatively, download and extract the desired version and copy the `soul-blade-patron` folder into:

```text
{Foundry User Data}/Data/modules/
```

Then restart Foundry, enable **Soul Blade Warlock Patron** in your world, and open the Compendium sidebar.

## Package Contents

- One Item compendium: **Soul Blade Patron: Items**
- Subclass item: **Soul Blade Patron**
- Feature items for levels 3, 6, 10, and 14
- A level-14 Item Choice advancement for **Greater Hex**
- [`CLEAN_COPY.md`](https://github.com/thystra/soul-blade-warlock-patron/blob/main/CLEAN_COPY.md) with the full readable subclass text
- `source/soulblade-items.json` with editable JSON source for the pack contents


## Notes

This module uses a NetDB-style `.db` compendium pack for portability. Foundry v11+ migrates legacy `.db` packs into LevelDB format on load. If your server refuses to migrate the pack, the full item source is included at `source/hexblade-items.json` and can be imported manually into an Item compendium.

The patron spell list is included as a feature item, but spell grants are not automated because some listed spells may live in official/premium content modules or may not be present in the free SRD 5.2 compendium.

The subclass is intentionally playtest-first. Some features, especially Hex Aura targeting, Hex Charges, and Hexbound Specter behavior, are written as clean rules text rather than fully automated effects.
