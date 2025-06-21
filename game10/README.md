# Game 10 Styles

This game uses [Sass](https://sass-lang.com/) to keep the CSS manageable. The `scss` folder contains partials that are combined into `style.css`.

## Structure

- `_variables.scss` – color, spacing and typographic variables
- `_themes.scss` – light/dark theme definitions
- `_base.scss` – resets and base typography
- `_components.scss` – buttons, cards and form elements
- `_layout.scss` – layout utilities and responsive rules

`style.scss` imports all of these partials and is compiled into `../style.css`.

## Building

Run the following command from the repository root:

```bash
npx sass game10/scss/style.scss game10/style.css --no-source-map --style=expanded
```

This will regenerate `style.css` so the page works exactly as before.
