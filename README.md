# Soul Blade Patron

A local Foundry VTT module for Foundry v14 / dnd5e 5.3.3 containing a homebrew 2024-style Warlock subclass: **Soul Blade Patron**.

## Install

Use this link to install via Foundry web interface:
https://github.com/thystra/soul-blade-warlock-patron/releases/latest/download/module.json

Alternatively, download and extract the desired version and copy the `soul-blade-warlock-patron` folder into:

```text
{Foundry User Data}/Data/modules/
```

Then restart Foundry, enable **Soul Blade Warlock Patron** in your world, and open the Compendium sidebar.

### Package Contents

- One Item compendium: **Soul Blade Patron: Items**
- Subclass item: **Soul Blade Patron**
- Feature items for levels 3, 6, 10, and 14
- A level-14 Item Choice advancement for **Greater Hex**
- [`CLEANCOPY.md`](https://github.com/thystra/soul-blade-warlock-patron/blob/main/CLEANCOPY.md) with the full readable subclass text
- `source/soulblade-items.json` with editable JSON source for the pack contents


## Notes

This module uses a NetDB-style `.db` compendium pack for portability. Foundry v11+ migrates legacy `.db` packs into LevelDB format on load. If your server refuses to migrate the pack, the full item source is included at `source/soulblade-items.json` and can be imported manually into an Item compendium.

The patron spell list is included as a feature item, but spell grants are not automated because some listed spells may live in official/premium content modules or may not be present in the free SRD 5.2 compendium.

Some features, especially Hex Aura targeting, Hex Charges, and Hexbound Specter behavior, are presented as clean rules text rather than fully automated effects.

AI was used in the making of this package.

## Automated Release Workflow

The repository workflow at `.github/workflows/release.yml` packages and uploads
these assets whenever a GitHub release is published:

- `module.json`
- `soul-blade-warlock-patron.zip`

After the assets become publicly available, the workflow publishes the same
version to FoundryMods.

Before the first automated release, claim the module on FoundryMods, generate a
per-module Package Release token, and add it to this GitHub repository as an
Actions secret named `FOUNDRYMODS_TOKEN`.

A manual workflow run with **dry_run** enabled validates the FoundryMods token
and manifest without creating a release. When no tag is supplied, the dry-run
uses the current committed `module.json` and does not submit a package URL.
