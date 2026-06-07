let items = [
  { name: "LP文言修正・画像差し替え", qty: 1, price: 30000 },
  { name: "問い合わせフォーム調整", qty: 1, price: 20000 },
  { name: "スマホ表示確認", qty: 1, price: 10000 },
];

const el = {
  docType: document.getElementById("docType"),
  issueDate: document.getElementById("issueDate"),
  clientName: document.getElementById("clientName"),
  issuerName: document.getElementById("issuerName"),
  subject: document.getElementById("subject"),
  taxRate: document.getElementById("taxRate"),
  note: document.getElementById("note"),
  itemRows: document.getElementById("itemRows"),
  addItem: document.getElementById("addItem"),
  previewType: document.getElementById("previewType"),
  heroDocType: document.getElementById("heroDocType"),
  previewSubject: document.getElementById("previewSubject"),
  previewDate: document.getElementById("previewDate"),
  previewNumber: document.getElementById("previewNumber"),
  previewClient: document.getElementById("previewClient"),
  previewTotal: document.getElementById("previewTotal"),
  heroTotal: document.getElementById("heroTotal"),
  previewItems: document.getElementById("previewItems"),
  subtotal: document.getElementById("subtotal"),
  tax: document.getElementById("tax"),
  total: document.getElementById("total"),
  previewNote: document.getElementById("previewNote"),
  previewIssuer: document.getElementById("previewIssuer"),
  copySummary: document.getElementById("copySummary"),
  copyStatus: document.getElementById("copyStatus"),
  printDoc: document.getElementById("printDoc"),
};

const today = new Date().toISOString().slice(0, 10);
el.issueDate.value = today;
const yen = new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY", maximumFractionDigits: 0 });

function renderItemRows() {
  el.itemRows.innerHTML = items.map((item, index) => `
    <div class="item-row">
      <label>内容<input data-field="name" data-index="${index}" type="text" value="${item.name}"></label>
      <label>数量<input data-field="qty" data-index="${index}" type="number" min="1" value="${item.qty}"></label>
      <label>単価<input data-field="price" data-index="${index}" type="number" min="0" value="${item.price}"></label>
      <button class="secondary-action" type="button" data-remove="${index}">削除</button>
    </div>
  `).join("");
}

function getTitle() {
  return el.docType.value === "quote" ? "御見積書" : "御請求書";
}

function calc() {
  const subtotal = items.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0), 0);
  const tax = Math.round(subtotal * Number(el.taxRate.value));
  return { subtotal, tax, total: subtotal + tax };
}

function render() {
  const title = getTitle();
  const totals = calc();
  const numberDate = (el.issueDate.value || today).replaceAll("-", "");

  el.previewType.textContent = title;
  el.heroDocType.textContent = title;
  el.previewSubject.textContent = el.subject.value || "件名未入力";
  el.previewDate.textContent = el.issueDate.value || today;
  el.previewNumber.textContent = `No. T-${numberDate}`;
  el.previewClient.textContent = el.clientName.value || "宛先未入力";
  el.previewTotal.textContent = yen.format(totals.total);
  el.heroTotal.textContent = yen.format(totals.total);
  el.subtotal.textContent = yen.format(totals.subtotal);
  el.tax.textContent = yen.format(totals.tax);
  el.total.textContent = yen.format(totals.total);
  el.previewNote.textContent = el.note.value || "備考なし";
  el.previewIssuer.textContent = el.issuerName.value || "発行者未入力";
  el.previewItems.innerHTML = items.map((item) => {
    const amount = Number(item.qty || 0) * Number(item.price || 0);
    return `<tr><td>${item.name || "内容未入力"}</td><td>${item.qty}</td><td>${yen.format(item.price || 0)}</td><td>${yen.format(amount)}</td></tr>`;
  }).join("");
}

function updateAll() {
  renderItemRows();
  render();
}

document.addEventListener("input", (event) => {
  const target = event.target;
  if (target.dataset.field) {
    const index = Number(target.dataset.index);
    const field = target.dataset.field;
    items[index][field] = field === "name" ? target.value : Number(target.value);
  }
  render();
});

document.addEventListener("change", render);

el.itemRows.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  items = items.filter((_, index) => index !== Number(button.dataset.remove));
  updateAll();
});

el.addItem.addEventListener("click", () => {
  items.push({ name: "追加作業", qty: 1, price: 5000 });
  updateAll();
});

el.copySummary.addEventListener("click", async () => {
  const totals = calc();
  const text = `${getTitle()} / ${el.clientName.value} / ${el.subject.value} / 合計 ${yen.format(totals.total)}`;
  try {
    await navigator.clipboard.writeText(text);
    el.copyStatus.textContent = "概要をコピーしました";
  } catch {
    el.copyStatus.textContent = "コピーできない場合は本文を選択してください";
  }
  setTimeout(() => { el.copyStatus.textContent = ""; }, 2200);
});

el.printDoc.addEventListener("click", () => window.print());
updateAll();
