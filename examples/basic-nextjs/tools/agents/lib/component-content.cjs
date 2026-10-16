'use strict';
const ts = require('typescript');
const normalize = (text) => text.replace(/\?\./g, '.').replace(/\s/g, '');

/** SDK field usage provides evidence of text versus image/link intent without guessing names. */
function inspect(source, file = 'component.tsx') {
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const helpers = new Map();
  const fields = new Map();
  const visit = (node, fn) => {
    fn(node);
    ts.forEachChild(node, (child) => visit(child, fn));
  };
  visit(tree, (node) => {
    if (
      !ts.isImportDeclaration(node) ||
      node.moduleSpecifier.text !== '@sitecore-content-sdk/nextjs'
    )
      return;
    for (const element of node.importClause?.namedBindings?.elements || []) {
      const name = element.propertyName?.text || element.name.text;
      if (['Text', 'RichText', 'NextImage', 'Link', 'DateField'].includes(name))
        helpers.set(element.name.text, name);
    }
  });
  visit(tree, (node) => {
    if (!ts.isJsxOpeningElement(node) && !ts.isJsxSelfClosingElement(node)) return;
    const helper = helpers.get(node.tagName.getText(tree));
    if (!helper) return;
    const field = node.attributes.properties.find(
      (p) => ts.isJsxAttribute(p) && p.name.text === 'field',
    );
    const expression = field?.initializer?.expression;
    if (!expression) return;
    const key = normalize(expression.getText(tree));
    const type = helper === 'Text' ? 'text' : helper === 'RichText' ? 'rich' : 'other';
    const previous = fields.get(key);
    fields.set(key, previous && previous !== type ? 'unknown' : type);
  });
  return { tree, fields, visit, normalize };
}

function diagnostics(source, file) {
  const { tree, fields, visit } = inspect(source, file);
  const messages = [];
  const add = (node, level, message) => {
    const position = tree.getLineAndCharacterOfPosition(node.getStart(tree));
    messages.push({ level, line: position.line + 1, column: position.character + 1, message });
  };
  // Inspect runtime string literals only, never comments/doc examples.
  visit(tree, (node) => {
    if (
      !ts.isStringLiteral(node) &&
      !ts.isNoSubstitutionTemplateLiteral(node) &&
      !ts.isTemplateHead(node) &&
      !ts.isTemplateMiddle(node) &&
      !ts.isTemplateTail(node)
    )
      return;
    for (const match of node.text.matchAll(/\bfont-\[(?!family-name:|weight:)([^\]]+)\]/g)) {
      if (/var\(--brand-(?:heading|body)-font/.test(match[1]))
        add(
          node,
          'error',
          'Use font-heading / font-body: untyped brand-font var() utilities resolve as font-weight in Tailwind v4.',
        );
      else if (/var\(/.test(match[1]))
        add(
          node,
          'warning',
          'Review ambiguous font utility; use an explicit family-name: or weight: type hint.',
        );
    }
  });
  const check = (node) => {
    if (!ts.isPropertyAccessExpression(node) || node.name.text !== 'value') return;
    const type = fields.get(normalize(node.expression.getText(tree)));
    if (type === 'other') return;
    add(
      node,
      type === 'text' || type === 'rich' ? 'error' : 'warning',
      type === 'rich'
        ? 'Use hasRichText(value) for Rich Text visibility, retaining isEditing.'
        : type === 'text'
          ? 'Use hasText(value) for text visibility, retaining isEditing.'
          : 'Review field truthiness: field type is unknown; whitespace may count as display content.',
    );
  };
  const checkCondition = (node) => {
    if (ts.isCallExpression(node)) {
      const helper = node.expression.getText(tree);
      const value = node.arguments[0];
      if (
        ['hasText', 'hasRichText'].includes(helper) &&
        value &&
        ts.isPropertyAccessExpression(value) &&
        value.name.text === 'value'
      ) {
        const type = fields.get(normalize(value.expression.getText(tree)));
        if (type === 'rich' && helper !== 'hasRichText')
          add(
            node,
            'error',
            'Use hasRichText(value) for Rich Text visibility; media-only content must remain visible.',
          );
      }
      return; // Other computed predicates are intentional or require manual review.
    }
    if (ts.isPropertyAccessExpression(node)) {
      check(node);
      return;
    }
    ts.forEachChild(node, checkCondition);
  };
  visit(tree, (node) => {
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.BarBarToken &&
      /\bisEditing\b/.test(node.getText(tree))
    )
      checkCondition(node.left);
    else if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken &&
      (ts.isJsxElement(node.right) ||
        ts.isJsxSelfClosingElement(node.right) ||
        (ts.isParenthesizedExpression(node.right) && /<\w/.test(node.right.getText(tree))))
    )
      checkCondition(node.left);
    else if (ts.isIfStatement(node)) checkCondition(node.expression);
  });
  return messages.filter(
    (message, index) =>
      messages.findIndex((other) => JSON.stringify(other) === JSON.stringify(message)) === index,
  );
}
module.exports = { inspect, diagnostics, normalize };
