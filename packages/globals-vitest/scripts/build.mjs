import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import ts from 'typescript';
import pkg from '../package.json' with { type: 'json' };

const __dirname = dirname(fileURLToPath(import.meta.url));

function extract(file) {
  const program = ts.createProgram([file], {});
  const sourceFile = program.getSourceFile(file);
  const globals = [];

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isModuleDeclaration(node)) {
      ts.forEachChild(node.body, (node) => {
        if (ts.isVariableStatement(node)) {
          ts.forEachChild(node, (node) => {
            if (ts.isVariableDeclarationList(node)) {
              for (const declaration of node.declarations) {
                const name = ts.getNameOfDeclaration(declaration);
                if (name) {
                  globals.push(name.escapedText);
                }
              }
            }
          });
        }
      });
    }
  });

  return globals;
}

const require = createRequire(import.meta.url);
const pkgPath = require.resolve('vitest/package.json');
const {
  default: { version: vitestVersion },
} = await import(pkgPath, {
  with: { type: 'json' },
});

if (pkg.version === vitestVersion) {
  console.info(
    `Vitest version (${vitestVersion}) is the same as package version (${pkg.version}). Skipping.`,
  );
  process.exit();
}

writeFileSync(join(__dirname, '..', 'VERSION'), vitestVersion);

const globalsPath = require.resolve('vitest/globals.d.ts');
const globalsArray = extract(globalsPath);
const globals = {};
globalsArray.forEach((globalName) => (globals[globalName] = true));
const moduleContent = `export default /** @type {const} */ (${JSON.stringify(globals, undefined, 2)});`;

writeFileSync(join(__dirname, '..', 'index.mjs'), moduleContent);

console.log('Finished generation with result:\n', moduleContent);
