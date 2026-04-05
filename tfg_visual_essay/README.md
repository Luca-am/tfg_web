# TFG visual essay

Aquest paquet és una base de treball per convertir el teu TFG en un assaig visual interactiu, inspirat en lògiques editorials com les de The Pudding, però adaptat a un projecte acadèmic sobre *Operación Triunfo*, fandom, branding, narrativa cocreada, afectes i shipping.

## Per què aquesta estructura

L'article de The Pudding sobre fanfic combina una portada forta, un selector de capítols, visualitzacions integrades dins el relat i una progressió clara de la lectura cap a diferents eixos temàtics. També treballa sobre una base Svelte/SvelteKit orientada a projectes de narrativa visual. El repositori `svelte-starter` de The Pudding descriu precisament aquesta orientació: SvelteKit, components de scrollytelling, imports de dades i generació estàtica del projecte. citeturn778889view0turn778889view1turn944551view0

## Què inclou

- una arquitectura mínima en **SvelteKit**
- un **esquelet narratiu** per al teu TFG
- un **model de continguts** perquè puguis omplir textos, cites, conceptes i visuals
- components bàsics per a:
  - hero inicial
  - navegació per capítols
  - seccions scroll
  - cites destacades
  - placeholders de visuals
- documentació editorial i de producció

## Estructura

```text
.
├── docs/
│   ├── arquitectura.md
│   ├── content-model.md
│   ├── design-system.md
│   ├── production-checklist.md
│   └── storyboard.md
├── src/
│   ├── lib/
│   │   ├── components/
│   │   └── data/
│   └── routes/
├── static/
│   └── assets/
├── jsconfig.json
├── package.json
├── svelte.config.js
└── vite.config.js
```

## Instal·lació

```bash
npm install
npm run dev
```

## Adaptació recomanada al teu cas

### Capítols suggerits

1. **Què és OT com a objecte mediàtic**
2. **Narrativa cocreada entre programa i públic**
3. **Comunitat, participació i visionat compartit**
4. **Branding afectiu i relació amb els concursants**
5. **Shipping, fantasia relacional i producció de sentit**
6. **Conclusió: del reality al camp afectiu i digital**

### Visuals que tenen més sentit per al teu TFG

- línia temporal de la temporada i els seus moments d'intensificació narrativa
- mapa d'actors, comptes i comunitats observades
- comparativa presencial / virtual
- esquema de circulació narrativa entre gala, 24h, Twitter, Bluesky, TikTok i trobades presencials
- peça explicativa sobre què és un *ship*
- fragmentació de cites etnogràfiques i posts com a material narratiu

## Com treballar-ho

1. omple `src/lib/data/story.js`
2. substitueix els placeholders dels components pels teus gràfics reals
3. usa `docs/storyboard.md` per decidir l'ordre final
4. guarda imatges, vídeos i SVG a `static/assets/`

## Nota important

He vist que els dos fitxers que havies pujat abans, `main.html` i `README.md`, no contenien una base aprofitable per arrencar, perquè eren bàsicament placeholders. fileciteturn1file1 fileciteturn1file0

