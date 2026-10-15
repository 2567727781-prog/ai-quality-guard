
export type PrivacyFinding = {
  ruleId: string;
  type: string;
  severity: string;
  description: string;
  suggestion: string;
  action: "BLOCK";
};

export function checkPrivacy(content: string): PrivacyFinding[] {
  const findings: PrivacyFinding[] = [];

  const rules = [
    {
      ruleId: "PRI-001",
      type: "疑似身份证号泄露",
      regex: /(?<!\d)\d{17}[\dXx](?!\d)/g,
      description: "检测到疑似18位身份证号码",
    },
    {
      ruleId: "PRI-002",
      type: "疑似手机号泄露",
      regex: /(?<!\d)1[3-9]\d{9}(?!\d)/g,
      description: "检测到疑似中国大陆手机号码",
    },
    {
      ruleId: "PRI-003",
      type: "疑似银行卡号泄露",
      regex: /(?<!\d)\d{16,19}(?!\d)/g,
      description: "检测到疑似银行卡号码",
    },
  ];

  for (const rule of rules) {
    if (rule.regex.test(content)) {
      findings.push({
        ruleId: rule.ruleId,
        type: rule.type,
        severity: "高",
        description: rule.description,
        suggestion: "删除或脱敏敏感信息后重新审核。",
        action: "BLOCK",
      });
    }
  }

  return findings;
}
