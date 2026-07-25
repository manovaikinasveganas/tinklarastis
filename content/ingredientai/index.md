+++
title = "Ingredientai: ar veganiška, ar vegetariška?"
description = "Nemokama maisto ingredientų ir E numerių paieška lietuvių kalba. Patikrinkite, ar ingredientas veganiškas, vegetariškas, ar gyvūninės kilmės: E471, želatina, kazeinas, karminas ir dar 680 kitų."
template = "single.html"

[extra]
author_profile = false
classes = "wide"
+++

Įveskite ingrediento pavadinimą arba E numerį ir sužinokite, ar jis veganiškas, vegetariškas, ar gyvūninės kilmės.

<div class="ingr-search">
  <input id="ingr-input" type="text" placeholder="Pvz.: E471, želatina, pieno milteliai..." autocomplete="off" autofocus>
  <div id="ingr-results" aria-live="polite"></div>
</div>

{{ ingredientai_sarasas() }}

<div id="ingr-disclaimer" class="ingr-disclaimer" hidden>
  <p class="ingr-disclaimer__title">Prieš pradedant 🌱</p>
  <p>Puslapyje pateikiama informacija apie maisto produktus ir jų tinkamumą vegetarinei ir/ar veganiškai mitybai.</p>
  <p>Nors duomenų tikslumui užtikrinti skiriamos didelės pastangos, klaidų gali pasitaikyti.</p>
  <p>Todėl, puslapis netinkamas taikyti siekiant išvengti alergiją (ar kitokius su sveikata susijusius sutrikimus) sukeliančių ingredientų.</p>
  <button id="ingr-disclaimer-accept" type="button">Supratau</button>
</div>

<style>
.ingr-search input#ingr-input {
  font-size: 1.25em;
  padding: 0.5em 0.75em;
  margin-bottom: 1em;
}
.ingr-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.ingr-item {
  padding: 0.75em 0;
  border-bottom: 1px solid #f2f3f3;
}
.ingr-item__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5em;
}
.ingr-item__name {
  font-weight: bold;
  font-size: 1.1em;
}
.ingr-item__tags {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.35em;
}
.ingr-tag {
  display: inline-block;
  padding: 0.1em 0.6em;
  border-radius: 1em;
  font-size: 0.65em;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.ingr-tag i {
  margin-right: 0.35em;
}
.tag--vegan { background-color: #e3f3e3; color: #2e7d32; }
.tag--vege { background-color: #eaf6e6; color: #558b2f; }
.tag--maybe { background-color: #fdf3dc; color: #9c6f19; }
.tag--not { background-color: #fdeaea; color: #c62828; }
.tag--animal { background-color: #f0f0f0; color: #616161; }
.ingr-aliases {
  margin: 0.25em 0 0;
  font-size: 0.75em;
  color: #646769;
}
.ingr-desc {
  margin: 0.35em 0 0;
  font-size: 0.85em;
}
.ingr-sources {
  margin: 0.25em 0 0;
  font-size: 0.65em;
  color: #9ba1a6;
}
.ingr-sources a {
  color: #9ba1a6;
  text-decoration: underline dotted;
}
.ingr-item mark {
  background-color: #fff3b8;
  padding: 0;
}
.ingr-empty {
  color: #646769;
  font-style: italic;
}
.ingr-all {
  margin-top: 2em;
  font-size: 0.75em;
  color: #646769;
}
.ingr-all summary {
  cursor: pointer;
}
.ingr-all ul {
  margin-top: 0.5em;
}
.ingr-disclaimer {
  position: fixed;
  left: 1em;
  bottom: 1em;
  z-index: 1000;
  max-width: 26em;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
  padding: 1.5em;
  font-size: 0.75em;
  line-height: 1.5;
  color: #3d4144;
}
@media (max-width: 32em) {
  .ingr-disclaimer {
    left: 0.5em;
    right: 0.5em;
    bottom: 0.5em;
    max-width: none;
  }
}
.ingr-disclaimer p {
  margin: 0 0 0.75em;
}
.ingr-disclaimer__title {
  font-size: 1.3em;
  font-weight: bold;
  color: #2f3236;
}
.ingr-disclaimer button {
  display: inline-block;
  margin-top: 0.25em;
  border: none;
  border-radius: 8px;
  background-color: #2e7d32;
  color: #fff;
  font-weight: bold;
  font-size: 1em;
  padding: 0.7em 1.6em;
  cursor: pointer;
  transition: background-color 0.2s;
}
.ingr-disclaimer button:hover {
  background-color: #256428;
}
</style>
<script src="/ingredientai/search.js" defer></script>
