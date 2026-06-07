const checks = [
  { id: "fv", group: "第一印象", title: "何のサイトか3秒で分かる", hint: "事業内容、対象者、提供サービスがすぐ伝わる", points: 12, checked: true },
  { id: "cta", group: "問い合わせ導線", title: "問い合わせボタンが目立つ位置にある", hint: "ファーストビューや各セクション下に導線がある", points: 14, checked: false },
  { id: "mobile", group: "スマホ対応", title: "スマホで文字やボタンが見やすい", hint: "小さい文字、横スクロール、押しにくいボタンがない", points: 14, checked: true },
  { id: "trust", group: "信頼情報", title: "実績、事例、プロフィールが掲載されている", hint: "初めての人が安心できる情報がある", points: 12, checked: false },
  { id: "price", group: "料金・依頼", title: "料金や依頼の流れが分かる", hint: "相談前に不安になりやすい費用や流れを説明している", points: 10, checked: false },
  { id: "speed", group: "表示・操作", title: "画像が重すぎず表示が遅くない", hint: "大きすぎる画像や不要な装飾を減らしている", points: 8, checked: true },
  { id: "copy", group: "文章", title: "専門用語が多すぎず、読みやすい", hint: "利用者の悩みに合わせた言葉になっている", points: 10, checked: true },
  { id: "update", group: "運用", title: "お知らせや情報が古いまま放置されていない", hint: "最終更新日や古いキャンペーン表示を確認している", points: 8, checked: false },
  { id: "contact", group: "問い合わせ管理", title: "問い合わせ後の対応状況を管理できている", hint: "返信漏れや対応期限を追える仕組みがある", points: 12, checked: false },
];

const el = {
  checks: document.getElementById("checks"),
  scoreText: document.getElementById("scoreText"),
  scoreBar: document.getElementById("scoreBar"),
  rankText: document.getElementById("rankText"),
  resultList: document.getElementById("resultList"),
  proposalText: document.getElementById("proposalText"),
  heroScore: document.getElementById("heroScore"),
  heroRank: document.getElementById("heroRank"),
  heroBar: document.getElementById("heroBar"),
  siteType: document.getElementById("siteType"),
  copyProposal: document.getElementById("copyProposal"),
  copyStatus: document.getElementById("copyStatus"),
};

function renderChecks() {
  el.checks.innerHTML = checks.map((item) => `
    <label class="check-item">
      <input type="checkbox" data-id="${item.id}" ${item.checked ? "checked" : ""}>
      <span>
        <strong>${item.title}</strong>
        <span>${item.group} / ${item.hint}</span>
      </span>
    </label>
  `).join("");
}

function getRank(score) {
  if (score >= 85) return { label: "かなり良い状態", detail: "細かな導線改善や実績追加で、さらに問い合わせにつなげやすくできます。" };
  if (score >= 65) return { label: "改善余地あり", detail: "問い合わせ導線と信頼情報を見直すと効果が出やすいです。" };
  if (score >= 45) return { label: "優先改善がおすすめ", detail: "スマホ表示、問い合わせボタン、事例掲載から直すと相談につながりやすくなります。" };
  return { label: "早めの見直し推奨", detail: "サイトの目的、導線、信頼情報を整理するところから始めるのがおすすめです。" };
}

function render() {
  const score = checks.filter((item) => item.checked).reduce((sum, item) => sum + item.points, 0);
  const rank = getRank(score);
  const missing = checks.filter((item) => !item.checked).slice(0, 4);

  el.scoreText.textContent = `${score}点`;
  el.heroScore.textContent = `${score}点`;
  el.rankText.textContent = rank.label;
  el.heroRank.textContent = rank.detail;
  el.scoreBar.style.width = `${score}%`;
  el.heroBar.style.width = `${score}%`;

  el.resultList.innerHTML = missing.length
    ? missing.map((item) => `<div class="result-item"><strong>${item.title}</strong><span>${item.hint}</span></div>`).join("")
    : `<div class="result-item"><strong>大きな不足は少ないです</strong><span>事例追加、導線改善、運用のしやすさを整えるとさらに良くなります。</span></div>`;

  const focus = missing.map((item) => item.title).join("、") || "事例追加や問い合わせ導線の微調整";
  el.proposalText.textContent =
    `${el.siteType.value}の簡易診断では${score}点でした。` +
    `${rank.detail} 優先して見るべき点は「${focus}」です。` +
    `小さな修正として、ボタン配置、文言整理、スマホ表示確認、問い合わせ管理の整備から進めると効果が見えやすいです。`;
}

el.checks.addEventListener("change", (event) => {
  const input = event.target.closest("input[data-id]");
  if (!input) return;
  const target = checks.find((item) => item.id === input.dataset.id);
  target.checked = input.checked;
  render();
});

el.siteType.addEventListener("change", render);

el.copyProposal.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(el.proposalText.textContent);
    el.copyStatus.textContent = "コピーしました";
  } catch {
    el.copyStatus.textContent = "コピーできない場合は本文を選択してください";
  }
  setTimeout(() => { el.copyStatus.textContent = ""; }, 2200);
});

renderChecks();
render();
