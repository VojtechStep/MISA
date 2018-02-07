import * as ts from 'typescript';
import { Rule as SemicolonAlwaysRule } from 'tslint/lib/rules/semicolonRule';
import * as Lint from 'tslint';

export class Rule extends SemicolonAlwaysRule {
  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return super.apply(sourceFile);
  }
}
