# Arquitectura del projecte

## Objectiu

Construir una peça web llarga, escrollejable i visual, amb ritme editorial i estructura argumentativa, que tradueixi el TFG a un format d'assaig visual digital.

## Principis de construcció

1. **Una idea forta per pantalla o per tram de scroll**
2. **Alternança entre text, dada, cita i visual**
3. **Capítols curts però densos**
4. **Disseny que guiï la lectura, no que només decori**
5. **Compatibilitat entre rigor acadèmic i claredat pública**

## Arquitectura recomanada

- `Hero`: portada forta amb títol, subtítol i context
- `ChapterNav`: navegació persistent per capítols
- `ScrollySection`: mòdul base de cada bloc narratiu
- `QuoteBlock`: per cites etnogràfiques, fragments de posts o conceptes clau
- `NetworkPlaceholder`: contenidor temporal per futures visualitzacions

## Tipus de materials que hauries de preparar

- text principal ja molt condensat
- cites curtes i molt seleccionades
- captures o reconstruccions visuals de dinàmiques de xarxa
- cronologia d'episodis, gales, conflictes, ships o moments de viralització
- esquema de conceptes teòrics en llenguatge clar

## Estructura tècnica inspirada en The Pudding

El starter de The Pudding situa el cor del projecte a `src/routes` i `src/components`, i remarca que el punt d'entrada real d'una història sol ser el component principal de la pàgina. També inclou helpers per a scrollytelling i importació de dades. citeturn778889view1turn778889view0
