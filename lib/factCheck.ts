
export type FactFinding = {
  ruleId: string;
  type: string;
  severity: string;
  description: string;
  suggestion: string;
  action: "REVIEW";
};

export const FACT_DATA_VERSION = "finance-demo-v1";

const referenceData = [
  {
    product: "稳健理财A",
    annualReturn: "3.2%",
    riskLevel: "R2",
    source: "匿名模拟产品资料 FIN-DATA-001",
  },
  {
    product: "成长基金B",
    annualReturn: "-5.1%",
    riskLevel: "R4",
    source: "匿名模拟产品资料 FIN-DATA-002",
  },
];

export function checkFacts(content: string): FactFinding[] {
  const findings: FactFinding[] = [];

  for (const item of referenceData) {
    if (!content.includes(item.product)) continue;

    const percentages: string[] =
  content.match(/-?\d+(?:\.\d+)?%/g) ?? [];

    if (percentages.length === 0) {
      findings.push({
        ruleId: "FACT-001",
        type: "缺少可核验收益数据",
        severity: "中",
        description: `${item.product} 未提供可核验的收益数字。数据来源：${item.source}，版本：${FACT_DATA_VERSION}`,
        suggestion: "如需陈述收益，请使用经过核实的参考数据，并注明统计口径和时间范围。",
        action: "REVIEW",
      });
      continue;
    }

    if (!percentages.includes(item.annualReturn)) {
      findings.push({
        ruleId: "FACT-002",
        type: "收益数据不一致",
        severity: "高",
        description: `${item.product} 的文案收益数字与参考数据不一致。参考值：${item.annualReturn}；来源：${item.source}；版本：${FACT_DATA_VERSION}`,
        suggestion: "核对收益数字、统计口径和时间范围，修正后重新审核。",
        action: "REVIEW",
      });
    }
  }

  return findings;
}
