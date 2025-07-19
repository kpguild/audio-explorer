# audio-explorer

## What is this?

This is an independent reimplementation of a subset of the [SBYW](https://sbyw.games) map parser. It was initially created to provide a standalone way to access some world maps for the world of Kirandur, which were created for SBYW. Instead of creating a whole new way to provide standalone maps, we decided we could implement a subset of the SBYW map parser and port the maps to the web directly!

## Disclaimer

**We are not affiliated with SBYW in any way.** This project is an independent, open-source implementation created through careful study of the SBYW map format and syntax. No proprietary code, assets, or confidential information from SBYW has been used in the development of this parser.

## Getting Started

### Installation

1. Clone this repository:

    ```bash
    git clone https://github.com/kpguild/audio-explorer.git
    cd audio-explorer
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Add a map (See the Adding New Maps section below)

### Usage

#### Development Server

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

#### Building for Production

This project uses SvelteKit with the static adapter, which generates a static site that can be deployed to any web server:

```bash
npm run build
```

The built files will be in the `build` directory. You can preview the production build with:

```bash
npm run preview
```

### Adding New Maps

1. Place your `.map` file under `static/maps/`
2. Add any sounds you use to `static/sounds/`. Right now, the `sounds` directory should contain a .ogg file for each platform type you use. dirt.ogg, grass.ogg, etc
3. Create or update `static/maps.json` and include your new map:
    ```json
    [{ "id": "your-map-id", "name": "Your Map Name" }]
    ```

**Note:** The `static/maps`, `static/sounds`, and `static/maps.json` files are gitignored as they are instance-specific content. You need to create them for the app to work.

## License

This project is licensed under the terms of the GNU Affero General Public License v3.0 or later. See the [LICENSE](LICENSE) file for the full license text.
