
export type RiskLevel = "C1" | "C2" | "C3" | "C4" | "C5";

export type ProductRisk = "R1" | "R2" | "R3" | "R4" | "R5";

export interface KYCProfile {
  userId: string;
  riskLevel: RiskLevel;
}

export interface ProductProfile {
  productId: string;
  riskLevel: ProductRisk;
}

export interface KYCResult {
  matched: boolean;
  action: "PASS" | "BLOCK";
  reason: string;
  userRiskLevel: RiskLevel;
  productRiskLevel: ProductRisk;
}

export function checkKYC(
  user: KYCProfile,
  product: ProductProfile
): KYCResult {
  const userLevel = Number(user.riskLevel.slice(1));
  const productLevel = Number(product.riskLevel.slice(1));

  // 比赛演示用简化适当性矩阵：
  // 用户承受等级不得低于产品风险等级
  const matched = userLevel >= productLevel;

  return {
    matched,
    action: matched ? "PASS" : "BLOCK",
    reason: matched
      ? "演示适当性等级匹配，仍需完成其他合规审核。"
      : `投资者风险承受能力 ${user.riskLevel} 低于产品风险等级 ${product.riskLevel}，禁止自动推荐，需按适用规则处理。`,
    userRiskLevel: user.riskLevel,
    productRiskLevel: product.riskLevel,
  };
}
