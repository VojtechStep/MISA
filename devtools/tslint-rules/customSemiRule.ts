import * as ts from 'typescript';
import { Rule as SemicolonAlwaysRule } from 'tslint/lib/rules/semicolonRule';
import * as Lint from 'tslint';
import * as utils from 'tsutils';

export class Rule extends SemicolonAlwaysRule {
  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const failures = super.apply(sourceFile);
    return failures
      .filter(filterFailure(sourceFile))
      .concat(this.applyWithWalker(new InterfaceSemiWalker(sourceFile, this.getOptions())));
  }
}

const filterFailure = (sourceFile: ts.SourceFile) => (failure: Lint.RuleFailure): boolean => {
  return !sourceFile.statements
    .filter(ts.isInterfaceDeclaration)
    .some(decl => decl.getEnd() === failure.getStartPosition().getPosition());
};

class InterfaceSemiWalker extends Lint.RuleWalker {
  visitInterfaceDeclaration(node: ts.InterfaceDeclaration) {
    if (
      this.getSourceFile()
        .getText()
        .charAt(node.getEnd()) !== ';'
    ) {
      this.addFailureAt(node.getEnd(), 1, Rule.FAILURE_STRING_MISSING, Lint.Replacement.appendText(node.getEnd(), ';'));
    }
    super.visitInterfaceDeclaration(node);
  }
}
