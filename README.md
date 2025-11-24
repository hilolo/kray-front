# Admintemmplate

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.11.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

Or for explicit production build:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/admintemmplate/browser/` directory. By default, the production build optimizes your application for performance and speed.

## Deployment to Coolify (Static Site)

For deploying to Coolify as a static site:

1. **Build Command**: `npm run build` (or `ng build --configuration production`)
2. **Publish Directory**: `dist/admintemmplate/browser`
3. **Static Site**: ✅ Check "Is it a static site?" checkbox
4. **Start Command**: Leave empty (Coolify will use Nginx to serve the static files)
5. **Port**: Not needed for static sites

**Important**: The build output is in `dist/admintemmplate/browser/`, not `dist/admintemmplate/`. Make sure to set the correct publish directory in Coolify.

This configuration allows Coolify to:
- Build the Angular app using the production configuration
- Serve the static files using Nginx (high-performance, no Node server needed)
- Handle routing correctly for Angular's client-side routing

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
