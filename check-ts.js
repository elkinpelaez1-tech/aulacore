const ts = require('typescript');
const fs = require('fs');

const filePath = 'C:\\Users\\Usuario\\.antigravity\\APPS\\AulaCore\\aulacore\\src\\app\\dashboard\\page.tsx';
const fileContent = fs.readFileSync(filePath, 'utf8');

const sourceFile = ts.createSourceFile(
  filePath,
  fileContent,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);

const diagnostics = sourceFile.parseDiagnostics || [];

console.log(`Found ${diagnostics.length} parse diagnostics:`);
diagnostics.forEach(diag => {
  const { line, character } = ts.getLineAndCharacterOfPosition(sourceFile, diag.start);
  console.log(`Error at line ${line + 1}, col ${character + 1}: ${diag.messageText}`);
});
