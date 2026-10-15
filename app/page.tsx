
"use client";

import { useEffect, useState } from "react";

type Issue = {
  type: string;
  severity: "低" | "中" | "高";
  description: string;
  suggestion: string;
};


type AuditResult = {
  decision?: "BLOCK" | "REVIEW" | "PASS";

  ruleFindings?: {
    ruleId: string;
    type: string;
    severity: string;
    description: string;
    suggestion: string;
    action: "BLOCK" | "REVIEW";
  }[];

  modelVersion: string;
  promptVersion: string;
  dataVersion?: string;
  reviewedAt: string;


metrics?: {
  factualAccuracy: number;
  complianceSafety: number;
  suitability: number;
  clarity: number;
  scenarioMatch: number;
};

  score: number;
  riskLevel: "低风险" | "中风险" | "高风险";
  summary: string;
  issues: Issue[];
};

type AuditHistoryItem = {
  id: string;
  content: string;
  scenario: string;
  result: AuditResult;
  createdAt: string;
};

export default function Home() {
  const [content, setContent] = useState("");
const [auditHistory, setAuditHistory] = useState<AuditHistoryItem[]>([]);

useEffect(() => {
  try {
    const saved = localStorage.getItem("ai-quality-guard-history");

    if (saved) {
      const records = JSON.parse(saved);

      if (Array.isArray(records)) {
        setAuditHistory(records);
      }
    }
  } catch (error) {
    console.error("读取审核历史失败", error);
  }
}, []);


const [reviewStatus, setReviewStatus] = useState<
  "pending" | "approved" | "rejected"
>("pending");

const [reviewNote, setReviewNote] = useState("");
const [userFeedback, setUserFeedback] = useState("");
const [feedbackSaved, setFeedbackSaved] = useState(false);

const [userRiskLevel, setUserRiskLevel] = useState("C3");
const [productRiskLevel, setProductRiskLevel] = useState("R3");
const [scenario, setScenario] = useState("marketing");

  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAudit() {
    if (!content.trim() || loading) return;

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
  body: JSON.stringify({
  content,
  scenario,
  userRiskLevel,
  productRiskLevel,
}),
});
      
const rawText = await response.text();

if (!rawText.trim()) {
  throw new Error(
    `服务器返回空内容，HTTP状态码：${response.status}。请检查终端报错。`
  );
}

let data;

try {
  data = JSON.parse(rawText);
} catch {
  throw new Error(
    `服务器返回的不是有效JSON，HTTP状态码：${response.status}。请检查终端报错。`
  );
}


      if (!response.ok) {
        throw new Error(data.error || "审核失败");
      }

      
setResult(data);

const newRecord: AuditHistoryItem = {
  id: crypto.randomUUID(),
  content,
  scenario,
  result: data as AuditResult,
  createdAt: new Date().toISOString(),
};

setAuditHistory((previous) => {
  const updated = [newRecord, ...previous].slice(0, 20);

  try {
    localStorage.setItem(
      "ai-quality-guard-history",
      JSON.stringify(updated)
    );
  } catch (error) {
    console.error("审核历史保存失败", error);
  }

  return updated;
});

setReviewStatus("pending");
setReviewNote("");
setUserFeedback("");
setFeedbackSaved(false);

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "发生未知错误"
      );
    } finally {
      setLoading(false);
    }
  }

  const riskStyle = {
    高风险: "bg-red-100 text-red-700",
    中风险: "bg-amber-100 text-amber-700",
    低风险: "bg-green-100 text-green-700",
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-3xl space-y-6">

        <header className="text-center">
          <h1 className="text-4xl font-bold text-blue-600">
            AI 质量卫士
          </h1>
          <p className="mt-3 text-slate-500">
            AI运营内容质量与合规审核平台
          </p>
          <p className="mt-2 text-xs text-slate-400">
            DeepSeek AI · V1.2
          </p>
        </header>

        <section className="rounded-2xl bg-white p-7 shadow-md">
          <h2 className="text-xl font-semibold">
            内容智能审核
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            输入金融运营文案，AI将分析潜在风险。
          </p>

          
<div className="mb-6">
  <label className="mb-3 block text-lg font-semibold text-slate-800">
    运营场景
  </label>

  <select
    value={scenario}
    onChange={(e) => setScenario(e.target.value)}
    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-lg text-slate-800"
  >
    <option value="marketing">金融产品营销</option>
    <option value="education">投资者教育</option>
    <option value="service">客户服务</option>
    <option value="promotion">活动推广</option>
  </select>

  <p className="mt-2 text-sm text-slate-500">
    不同运营场景采用不同质量评价重点，金融合规红线始终一致。
  </p>
</div>
<textarea
            value={content}
            maxLength={5000}
            onChange={(e) => {
              setContent(e.target.value);
              setResult(null);
              setError("");
            }}
            placeholder="请输入需要审核的AI运营文案..."
            className="mt-5 h-44 w-full resize-y rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500"
          />

          <p className="mt-1 text-right text-xs text-slate-400">
            {content.length}/5000
          </p>

          {/* KYC 投资者适当性匹配 */}
<div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
  <h3 className="mb-2 text-lg font-bold text-slate-800">
    KYC 投资者适当性评估
  </h3>

  <p className="mb-5 text-sm text-slate-500">
    根据用户风险承受能力与金融产品风险等级进行适当性匹配。
  </p>

  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <div>
      <label className="mb-2 block font-medium text-slate-700">
        用户风险承受等级
      </label>

      <select
        value={userRiskLevel}
        onChange={(e) => setUserRiskLevel(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white p-3"
      >
        <option value="C1">C1 - 保守型</option>
        <option value="C2">C2 - 谨慎型</option>
        <option value="C3">C3 - 稳健型</option>
        <option value="C4">C4 - 积极型</option>
        <option value="C5">C5 - 激进型</option>
      </select>
    </div>

    <div>
      <label className="mb-2 block font-medium text-slate-700">
        金融产品风险等级
      </label>

      <select
        value={productRiskLevel}
        onChange={(e) => setProductRiskLevel(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white p-3"
      >
        <option value="R1">R1 - 低风险</option>
        <option value="R2">R2 - 中低风险</option>
        <option value="R3">R3 - 中风险</option>
        <option value="R4">R4 - 中高风险</option>
        <option value="R5">R5 - 高风险</option>
      </select>
    </div>
  </div>

  <p className="mt-4 text-xs text-slate-500">
    当前为比赛演示使用的简化匹配规则，不代表真实金融机构的适当性评估结论。
  </p>
</div>
<button
            onClick={handleAudit}
            disabled={loading || !content.trim()}
            className="mt-5 w-full rounded-xl bg-blue-600 py-4 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "DeepSeek AI 正在审核..."
              : "开始智能审核"}
          </button>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}
        </section>

        {result && (
          <section className="space-y-5 rounded-2xl bg-white p-7 shadow-md">

            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">
                AI 审核报告
              </h2>
              <span
                className={`rounded-full px-3 py-1 text-sm ${
                  riskStyle[result.riskLevel]
                }`}
              >
                {result.riskLevel}
              </span>
            </div>

            <div className="rounded-xl bg-slate-50 p-6">
              <p className="text-sm text-slate-500">
                综合质量评分
              </p>

              <div className="mt-2 flex items-end gap-2">
                <span className="text-5xl font-bold text-blue-600">
                  {result.score}
                </span>
                <span className="pb-1 text-slate-400">
                  / 100
                </span>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: `${result.score}%`,
                  }}
                />
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-700">
                {result.summary}
              </p>
            </div>

            <h3 className="text-lg font-semibold">
              
{result.decision && (
  <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
    <h3 className="mb-4 text-xl font-semibold text-slate-900">
      金融合规拦截结果
    </h3>
<div className="mb-4 rounded-xl bg-slate-50 p-4 text-sm">
  <p className="font-semibold text-slate-800">
    审核决策：
    {result.decision === "BLOCK"
      ? "禁止自动发布"
      : result.decision === "PASS"
      ? "审核通过"
      : "等待人工复核"}
  </p>

  <p className="mt-2 text-slate-600">
    BLOCK：触发强制拦截规则，不允许通过 KYC 或人工按钮直接解除。
    REVIEW：需要进一步核验，不等于违规。
  </p>
</div>
    <div
      className={`mb-4 rounded-xl p-4 font-semibold ${
        result.decision === "BLOCK"
          ? "bg-red-50 text-red-700"
          : result.decision === "REVIEW"
          ? "bg-amber-50 text-amber-700"
          : "bg-green-50 text-green-700"
      }`}
    >
      {result.decision === "BLOCK"
        ? "已拦截：禁止自动发布，等待人工复核"
        : result.decision === "REVIEW"
        ? "待人工复核：暂不自动发布"
        : "初步通过：仍需满足发布审批要求"}
    </div>

    <p className="mb-4 text-sm text-slate-500">
      规则检测结果仅用于辅助审核，不构成最终法律认定。
    </p>

    {result.ruleFindings &&
      result.ruleFindings.length > 0 && (
        <div className="space-y-4">
          {result.ruleFindings.map((finding, index) => (
            <div
              key={`${finding.ruleId}-${index}`}
              className="rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <div className="mb-2 font-semibold text-red-700">
                {finding.ruleId} · {finding.type}
              </div>

              <p className="mb-2 text-slate-700">
                {finding.description}
              </p>

              <p className="text-sm text-slate-600">
                修改建议：{finding.suggestion}
              </p>
            </div>
          ))}
        </div>
      )}
  </div>
)}
检测问题（{result.issues.length}）
{result.metrics && (
  <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
    <h3 className="mb-5 text-xl font-semibold text-slate-900">
      五项质量指标
    </h3>

    {[
      { key: "factualAccuracy", label: "事实准确性", max: 25 },
      { key: "complianceSafety", label: "合规安全性", max: 30 },
      { key: "suitability", label: "投资者适当性", max: 20 },
      { key: "clarity", label: "内容清晰度", max: 15 },
      { key: "scenarioMatch", label: "场景匹配度", max: 10 },
    ].map((item) => {
     
const score =
  result.metrics?.[
    item.key as keyof NonNullable<typeof result.metrics>
  ] ?? 0;

      const percentage = (score / item.max) * 100;

      return (
        <div key={item.key} className="mb-5 last:mb-0">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium text-slate-700">
              {item.label}
            </span>

            <span className="font-semibold text-blue-600">
              {score} / {item.max}
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      );
    })}
  </div>
)}

            </h3>

            {result.issues.length === 0 && (
              <p className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
                AI初审未发现明确问题，仍需根据实际场景进行核查。
              </p>
            )}

            {result.issues.map((issue, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 p-5"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <h4 className="font-semibold">
                    {index + 1}. {issue.type}
                  </h4>

                  <span className="rounded-md bg-amber-100 px-2 py-1 text-xs text-amber-800">
                    {issue.severity}风险
                  </span>
                </div>

                <p className="mt-3 text-sm leading-7 text-slate-700">
                  {issue.description}
                </p>

                <div className="mt-4 rounded-lg bg-blue-50 p-4">
                  <p className="font-medium text-blue-700">
                    修改建议
                  </p>
                  <p className="mt-2 text-sm leading-7 text-blue-900">
                    {issue.suggestion}
                  </p>
                </div>
              </div>
            ))}

            <div className="border-t pt-4 text-xs leading-6 text-slate-400">
              <p>模型：{result.modelVersion}</p>
              <p>Prompt：{result.promptVersion}</p>
          <p>数据版本：{result.dataVersion ?? "未提供"}</p>
              <p>
                审核时间：
                {new Date(result.reviewedAt).toLocaleString()}
              </p>
              <p className="mt-2">
                AI审核仅供初步参考，不构成正式金融合规意见。
              </p>
                </div>

    {/* 人工复核与用户反馈 */}
    <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <h3 className="mb-4 text-xl font-bold">
        人工复核与用户反馈
      </h3>

      <p className="mb-4 text-sm text-slate-600">
        人工复核不能解除金融合规红线或 KYC 错配拦截。
      </p>

      <div className="mb-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={result.decision === "BLOCK"}
          onClick={() => setReviewStatus("approved")}
          className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-40"
        >
          人工通过
        </button>

        <button
          type="button"
          onClick={() => setReviewStatus("rejected")}
          className="rounded-lg bg-red-600 px-4 py-2 text-white"
        >
          人工驳回
        </button>
      </div>

      <p className="mb-3 text-sm">
        复核状态：
        {reviewStatus === "approved"
          ? "已通过"
          : reviewStatus === "rejected"
          ? "已驳回"
          : "待复核"}
      </p>

      <textarea
        value={reviewNote}
        onChange={(e) => setReviewNote(e.target.value)}
        placeholder="填写人工复核备注"
        className="mb-4 w-full rounded-lg border p-3"
      />

      <textarea
        value={userFeedback}
        onChange={(e) => {
          setUserFeedback(e.target.value);
          setFeedbackSaved(false);
        }}
        placeholder="填写用户反馈"
        className="mb-3 w-full rounded-lg border p-3"
      />

      <button
        type="button"
        disabled={!userFeedback.trim()}
        onClick={() => setFeedbackSaved(true)}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-40"
      >
        提交反馈
      </button>

      {feedbackSaved && (
        <p className="mt-2 text-sm text-green-700">
          反馈已暂存在当前页面，尚未持久化。
        </p>
      )}
    </div>
  </section>
)}

      </div>
    
<section className="mx-auto mt-8 max-w-5xl rounded-2xl border border-slate-200 bg-white p-6">
  <h2 className="mb-2 text-2xl font-bold text-slate-900">
    审核历史与 Bad Case 归因
  </h2>

  <p className="mb-5 text-sm text-slate-500">
    展示最近 20 条匿名审核记录，包含评分、风险、版本及问题归因。
  </p>

  {auditHistory.length === 0 ? (
    <p className="rounded-xl bg-slate-50 p-5 text-slate-500">
      暂无审核记录，请先完成一次智能审核。
    </p>
  ) : (
    <div className="space-y-4">
      {auditHistory.map((record) => {
        const findings = record.result.ruleFindings ?? [];
        const issues = record.result.issues ?? [];
        const blocked = record.result.decision === "BLOCK";

        return (
          <div
            key={record.id}
            className="rounded-xl border border-slate-200 p-5"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <span className="font-semibold text-slate-900">
                {record.scenario} · {record.result.score}/100
              </span>

              <span
                className={
                  blocked
                    ? "rounded-lg bg-red-100 px-3 py-1 text-sm text-red-700"
                    : "rounded-lg bg-amber-100 px-3 py-1 text-sm text-amber-700"
                }
              >
                {blocked ? "已拦截" : "待人工复核"}
              </span>
            </div>

            <p className="mb-3 text-sm text-slate-600">
              审核内容：{record.content.slice(0, 120)}
              {record.content.length > 120 ? "..." : ""}
            </p>

            <div className="mb-3 text-sm text-slate-600">
              <p>模型版本：{record.result.modelVersion}</p>
              <p>Prompt 版本：{record.result.promptVersion}</p>
              <p>数据版本：{record.result.dataVersion ?? "未提供"}</p>
              <p>
                审核时间：
                {new Date(record.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="mb-2 font-semibold text-slate-800">
                Bad Case 归因
              </p>

              {findings.length === 0 && issues.length === 0 ? (
                <p className="text-sm text-slate-500">
                  当前未发现明确问题，仍需按实际场景复核。
                </p>
              ) : (
                <div className="space-y-2 text-sm">
                  {findings.map((finding, index) => (
                    <p key={`rule-${index}`} className="text-red-700">
                      【规则拦截 · {finding.ruleId}】
                      {finding.description}
                    </p>
                  ))}

                  {issues.map((issue, index) => (
                    <p key={`issue-${index}`} className="text-amber-800">
                      【AI 质量问题 · {issue.type}】
                      {issue.description}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  )}
</section>

<section className="mx-auto mt-8 max-w-5xl rounded-2xl border border-slate-200 bg-white p-6">
  <h2 className="mb-3 text-2xl font-bold text-slate-900">
    模型 / Prompt / 数据版本对比
  </h2>

  <p className="mb-5 text-sm text-slate-500">
    基于匿名审核历史进行版本统计。仅比较相同测试集的结果，
    不将不同文案的评分差异视为版本改进效果。
  </p>

  {(() => {
    const groups = new Map<
      string,
      {
        model: string;
        prompt: string;
        dataVersion: string;
        records: AuditHistoryItem[];
      }
    >();

    auditHistory.forEach((record) => {
      const model = record.result.modelVersion || "未知";
      const prompt = record.result.promptVersion || "未知";
      const dataVersion = record.result.dataVersion ?? "未提供";

      const key = `${model}|${prompt}|${dataVersion}`;

      if (!groups.has(key)) {
        groups.set(key, {
          model,
          prompt,
          dataVersion,
          records: [],
        });
      }

      groups.get(key)!.records.push(record);
    });

    const versions = Array.from(groups.values());

    return (
      <div className="space-y-4">
        {versions.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-slate-500">
            暂无审核数据，请先运行测试。
          </p>
        ) : (
          versions.map((version, index) => {
            const count = version.records.length;
            const averageScore =
              version.records.reduce(
                (sum, record) => sum + record.result.score,
                0
              ) / count;

            const blockedCount = version.records.filter(
              (record) => record.result.decision === "BLOCK"
            ).length;

            return (
              <div
                key={index}
                className="rounded-xl border border-slate-200 p-4"
              >
                <p className="font-semibold text-slate-900">
                  模型：{version.model}
                </p>
                <p className="text-sm text-slate-600">
                  Prompt：{version.prompt}
                </p>
                <p className="text-sm text-slate-600">
                  数据版本：{version.dataVersion}
                </p>

                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xl font-bold">{count}</p>
                    <p className="text-xs text-slate-500">审核数量</p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xl font-bold">
                      {averageScore.toFixed(1)}
                    </p>
                    <p className="text-xs text-slate-500">平均评分</p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xl font-bold">{blockedCount}</p>
                    <p className="text-xs text-slate-500">拦截数量</p>
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          {versions.length < 2
            ? "当前只有一个版本组合，尚不能进行跨版本效果对比。需要对同一批匿名测试样例运行不同版本，并保存结果。"
            : "已检测到多个版本组合。上方为描述性统计；只有在相同测试集、相同评分规则下，才能判断版本效果差异。"}
        </div>
      </div>
    );
  })()}
</section>
</main>
  );
}
