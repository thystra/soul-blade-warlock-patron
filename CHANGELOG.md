## 0.2.2

- Fixed Mend the Bound Spirit healing activities so Foundry rolls the healing dice reliably.
- Replaced the dynamic custom healing formula with three standard healing activities:
  - 2d6 + Charisma modifier for Warlock levels 6-9.
  - 3d6 + Charisma modifier for Warlock levels 10-13.
  - 4d6 + Charisma modifier for Warlock level 14 or higher.
- Patch backups now go to `../soul-blade-backups/` instead of the repository working tree.

## 0.2.1

- Fixed the broken image on the Apply Hexed Steel to Pact Weapon macro.
- Updated Price of the Pact heading from "Pact Weapon Focus - Optional Rule" to "Optional Rule: Pact Weapon Focus".

## 0.2.0

- Rebranded public package from Hexblade Patron to Soul Blade Patron.
- Updated module id, title, description, repository URLs, manifest URL, and download URL.
- Renamed compendium packs and pack files to the `soulblade-*` naming convention.
- Renamed public subclass item to Soul Blade Patron.
- Renamed Hexblade Training to Soul Blade Training.
- Moved Pact Weapon Focus text out of Soul Blade Training.
- Added new level-3 feature: Price of the Pact.
- Added Price of the Pact to the level-3 subclass ItemGrant advancement.
- Added LICENSE, CONTENT-LICENSE.md, and NOTICE.md.

## 0.1.9

- Reworded Soul Reaping to positive once-per-turn wording.
- Soul Reaping now allows Reaction use when its trigger occurs outside your turn.
- Added a Soul Reaping roll activity for `1d6 + @abilities.cha.mod` Temporary Hit Points.
- Added an Apply Hexed Steel to Pact Weapon macro.
- The Hexed Steel macro duplicates a weapon attack activity and adds the correct extra Necrotic die based on Warlock level.

## 0.1.8

- Fixed Hex Charges showing 0 charges when Charisma modifier is 0.
- Updated the Hex Charges item maximum from `@abilities.cha.mod` to `max(1,@abilities.cha.mod)`.
- Rules text remains Charisma modifier, minimum 1.

## 0.1.7

- Changed Hex Charges from Proficiency Bonus to Charisma modifier, minimum 1 by rules text.
- Updated the Hex Charges tracking item to use @abilities.cha.mod instead of @prof.
- Fixed lingering invalid orb-swirling-purple.webp icon references.

## 0.1.6

- Fixed invalid Hex Charges icon path that caused 404 console errors.
- Removed the unreliable built-in Hexbound Specter Summon activity from the feature item.
- Made the Summon Hexbound Specter macro the supported summon workflow for now.
- Updated Hexbound Specter feature text to point players and DMs to the macro.

## 0.1.5

- Added Hexblade Spellcasting Focus text: the Pact Weapon is the conduit for Warlock magic and Hexblade features.
- Kept the approved alternate Hexblade Patron spell list.
- Added a best-effort Summon activity to Hexbound Specter.
- Added Life Drain attack activities to the Hexbound Specter actor with 3d6, 4d6, and 5d6 variants.
- Added a Macro compendium with spell import and Hexbound Specter summon helper macros.
- Added editable macro sources under scripts/.

## 0.1.4

- Updated Hexblade Patron Spells to the alternate playtest spell list.
- Kept patron spell handling as formatted reference text only; spell-item automation can be added later by PHB UUID macro.
- Added or refreshed the Mend the Bound Spirit healing activity with Warlock-level scaling.
- Added a Hexbound Specter Actor compendium and baseline importable NPC actor.

# Changelog

## 0.1.1

- Fixed the broken icon path for **Greater Hex: Reaper’s Aura**.
- Added `.gitignore` and a simple release packaging script for git-based workflow.

## 0.1.0

- Initial Hexblade Patron playtest module.
