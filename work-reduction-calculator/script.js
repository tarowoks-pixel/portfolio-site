const presets = {
  transfer: {
    taskName: "Excelへの転記と集計",
    minutes: 15,
    frequency: 5,
    people: 3,
    hourlyRate: 1800,
    initialCost: 30000,
    reductionRate: 70,
  },
  inquiry: {
    taskName: "問い合わせ内容の整理と対応確認",
    minutes: 12,
    frequency: 10,
    people: 2,
    hourlyRate: 1800,
    initialCost: 25000,
    reductionRate: 60,
  },
  invoice: {
    taskName: "見積書・請求書の作成",
    minutes: 25,
    frequency: 3,
    people: 2,
    hourlyRate: 2000,
    initialCost: 40000,
    reductionRate: 75,
  },
};

const fields = {
  taskName: document.getElementById("taskName"),
  minutes: document.getElementById("minutes"),
  frequency: document.getElementById("frequency"),
  people: document.getElementById("people"),
  hourlyRate: document.getElementById("hourlyRate"),
  initialCost: document.getElementById("initialCost"),
  reductionRate: document.getElementById("reductionRate"),
};

const result = {
  reductionLabel: document.getElementById("reductionLabel"),
  monthlyHours: document.getElementById("monthlyHours"),
  monthlyCost: document.getElementById("monthlyCost"),
  savedHours: document.getElementById("savedHours"),
  annualSaving: document.getElementById("annualSaving"),
  rankText: document.getElementById("rankText"),
  rankMessage: document.getElementById("rankMessage"),
  rankCard: document.getElementById("rankCard"),
  beforeBar: document.getElementById("beforeBar"),
  afterBar: document.getElementById("afterBar"),
  proposalText: document.getElementById("proposalText"),
  visualBefore: document.getElementById("visualBefore"),
  visualAfter: document.getElementById("visualAfter"),
  copyProposal: document.getElementById("copyProposal"),
  copyStatus: document.getElementById("copyStatus"),
};

const weeklyToMonthly = 4.33;
const formatNumber = new Intl.NumberFormat("ja-JP");

function readNumber(field, fallback) {
  const value = Number(field.value);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function getRank(savedHours, annualSaving, paybackMonths) {
  if (savedHours >= 25 || annualSaving >= 500000 || paybackMonths <= 1) {
    return {
      rank: "S",
      message: "優先して改善したい作業です。入力補助や自動集計の導入効果が大きく出やすいです。",
    };
  }

  if (savedHours >= 10 || annualSaving >= 180000 || paybackMonths <= 3) {
    return {
      rank: "A",
      message: "自動化・入力補助の効果が出やすい作業です。まずは小さく改善する価値があります。",
    };
  }

  if (savedHours >= 4 || annualSaving >= 70000) {
    return {
      rank: "B",
      message: "部分的な改善に向いています。転記や確認漏れ防止から始めると進めやすいです。",
    };
  }

  return {
    rank: "C",
    message: "大きな自動化より、チェックリスト化や入力ルール整理から始めるのがおすすめです。",
  };
}

function update() {
  const taskName = fields.taskName.value.trim() || "現在の作業";
  const minutes = readNumber(fields.minutes, 0);
  const frequency = readNumber(fields.frequency, 0);
  const people = readNumber(fields.people, 1);
  const hourlyRate = readNumber(fields.hourlyRate, 0);
  const initialCost = readNumber(fields.initialCost, 0);
  const reductionRate = readNumber(fields.reductionRate, 0);

  const monthlyHours = (minutes / 60) * frequency * weeklyToMonthly * people;
  const monthlyCost = monthlyHours * hourlyRate;
  const savedHours = monthlyHours * (reductionRate / 100);
  const afterHours = Math.max(monthlyHours - savedHours, 0);
  const monthlySaving = savedHours * hourlyRate;
  const annualSaving = monthlySaving * 12;
  const paybackMonths = monthlySaving > 0 ? initialCost / monthlySaving : Infinity;
  const rank = getRank(savedHours, annualSaving, paybackMonths);

  result.reductionLabel.textContent = Math.round(reductionRate);
  result.monthlyHours.textContent = `${monthlyHours.toFixed(1)}時間`;
  result.monthlyCost.textContent = `${formatNumber.format(Math.round(monthlyCost))}円`;
  result.savedHours.textContent = `${savedHours.toFixed(1)}時間/月`;
  result.annualSaving.textContent = `${formatNumber.format(Math.round(annualSaving))}円`;
  result.rankText.textContent = rank.rank;
  result.rankMessage.textContent = rank.message;
  result.visualBefore.textContent = `月 ${monthlyHours.toFixed(1)} 時間`;
  result.visualAfter.textContent = `月 ${afterHours.toFixed(1)} 時間`;

  const afterWidth = monthlyHours > 0 ? Math.max((afterHours / monthlyHours) * 100, 3) : 3;
  result.beforeBar.style.width = "100%";
  result.afterBar.style.width = `${afterWidth}%`;

  const paybackText = Number.isFinite(paybackMonths)
    ? `${Math.max(paybackMonths, 0.1).toFixed(1)}か月程度`
    : "算出対象外";

  result.proposalText.textContent =
    `${taskName}は、現在の条件だと月に約${monthlyHours.toFixed(1)}時間、` +
    `人件費換算で約${formatNumber.format(Math.round(monthlyCost))}円かかっている見込みです。` +
    `入力補助や自動集計で${Math.round(reductionRate)}%削減できた場合、月${savedHours.toFixed(1)}時間、` +
    `年間約${formatNumber.format(Math.round(annualSaving))}円の削減が期待できます。` +
    `改善費用${formatNumber.format(Math.round(initialCost))}円の場合、回収目安は${paybackText}です。`;
}

Object.values(fields).forEach((field) => {
  field.addEventListener("input", update);
});

document.querySelectorAll("[data-preset]").forEach((button) => {
  button.addEventListener("click", () => {
    const preset = presets[button.dataset.preset];
    Object.entries(preset).forEach(([key, value]) => {
      fields[key].value = value;
    });
    update();
  });
});

result.copyProposal.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(result.proposalText.textContent);
    result.copyStatus.textContent = "コピーしました";
  } catch {
    result.copyStatus.textContent = "コピーできない場合は本文を選択してください";
  }

  window.setTimeout(() => {
    result.copyStatus.textContent = "";
  }, 2200);
});

update();
