
export type RuleFinding = {
  ruleId: string;
  type: string;
  severity: "高风险" | "中风险";
  description: string;
  suggestion: string;
  action: "BLOCK" | "REVIEW";
};

export function checkCompliance(
  content: string
): RuleFinding[] {
  const findings: RuleFinding[] = [];

  const rules = [
    {
      ruleId: "FIN-001",
      type: "收益承诺",
      pattern: /保证.{0,8}(收益|回报)|保本保息|稳赚不赔|年收益.{0,5}保底/,
      description: "检测到可能存在保证收益或保本承诺的表述。",
      suggestion: "删除保证收益或保本承诺，客观说明产品风险。",
    },
    {
      ruleId: "FIN-002",
      type: "无风险宣传",
      pattern: /绝对.{0,4}无风险|完全没有风险|零风险|绝对没有风险/,
      description: "检测到绝对化的无风险宣传。",
      suggestion: "删除无风险承诺，补充真实、充分的风险提示。",
    },
    {
      ruleId: "FIN-003",
      type: "直接荐股",
      pattern: /立即买入.{0,12}(股票|证券)|推荐买入.{0,12}(股票|证券)|保证.{0,8}(涨停|上涨)/,
      description: "检测到可能涉及直接荐股的表述。",
      suggestion: "停止发布具体买卖指令，转人工核实业务资质和内容。",
    },
    {
      ruleId: "FIN-004",
      type: "代客理财",
      pattern: /帮你直接买卖股票|替你操作账户|代你管理投资账户|代客理财/,
      description: "检测到可能涉及代客理财或账户代操作的表述。",
      suggestion: "暂停发布，转人工核实授权和相关业务资质。",
    },
  ];


for (const rule of rules) {
  const match = rule.pattern.exec(content);

  if (!match || match.index === undefined) {
    continue;
  }

  // 获取命中关键词前面的上下文
  const before = content.slice(
    Math.max(0, match.index - 15),
    match.index
  );

  // 检查是否存在明确的禁止性表达
  const isNegated =
    /(?:不要|不得|禁止|切勿|避免|不应|不能)(?:[^。！？；;]{0,12})$/.test(
      before
    );

  if (isNegated) {
    // 否定语境不直接认定为违规承诺
    continue;
  }

  findings.push({
    ruleId: rule.ruleId,
    type: rule.type,
    severity: "高风险",
    description: rule.description,
    suggestion: rule.suggestion,
    action: "BLOCK",
  });
}


  return findings;
}
