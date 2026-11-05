# Restaurant / niche font registry (Cyrillic + Latin)

All entries are Google Fonts (`packages/skins/fonts/<id>.json`). Skin `rose` loads only `pacifico` + `nunito`.

## Headings (H1–H3 candidates)
| id | family |
| --- | --- |
| pacifico | Pacifico (default in rose via font-serif) |
| great-vibes | Great Vibes |
| didact-gothic | Didact Gothic |
| montserrat-alternates | Montserrat Alternates |
| tenor-sans | Tenor Sans |
| marmelad | Marmelad |
| gabriela | Gabriela |
| kurale | Kurale |
| comfortaa | Comfortaa |

## Body / UI
| id | family |
| --- | --- |
| nunito | Nunito (default in rose via font-sans) |
| nunito-sans | Nunito Sans |
| google-sans | Google Sans |
| andika | Andika |
| ubuntu-sans | Ubuntu Sans |
| ysabeau-office | Ysabeau Office |
| geologica | Geologica |

## Rose skin typography rule
- H1–H3 / `Title` with `as=h1|h2|h3` → `font-serif` = Pacifico
- Everything else → `font-sans` = Nunito
