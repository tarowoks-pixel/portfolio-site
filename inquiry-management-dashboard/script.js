const today = new Date();
const toDate = (offset) => {
  const date = new Date(today);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

let inquiries = [
  {
    id: 1,
    name: "山田商店",
    content: "商品ページの写真差し替えと問い合わせボタン追加",
    source: "フォーム",
    priority: "高",
    status: "未対応",
    due: toDate(0),
  },
  {
    id: 2,
    name: "青葉整体院",
    content: "予約ページの文言修正とスマホ表示確認",
    source: "メール",
    priority: "中",
    status: "対応中",
    due: toDate(1),
  },
  {
    id: 3,
    name: "港北デザイン",
    content: "既存LPの下層追加と修正依頼管理表の相談",
    source: "クラウドワークス",
    priority: "高",
    status: "対応中",
    due: toDate(2),
  },
  {
    id: 4,
    name: "白樺サロン",
    content: "Googleフォームの問い合わせをスプレッドシートに整理したい",
    source: "ココナラ",
    priority: "低",
    status: "完了",
    due: toDate(-1),
  },
];

const ids = {
  heroOpen: document.getElementById("heroOpen"),
  heroToday: document.getElementById("heroToday"),
  heroDue: document.getElementById("heroDue"),
  heroDone: document.getElementById("heroDone"),
  openCount: document.getElementById("openCount"),
  workingCount: document.getElementById("workingCount"),
  dueCount: document.getElementById("dueCount"),
  doneCount: document.getElementById("doneCount"),
  table: document.getElementById("inquiryTable"),
  form: document.getElementById("inquiryForm"),
  statusFilter: document.getElementById("statusFilter"),
  priorityFilter: document.getElementById("priorityFilter"),
  dueInput: document.getElementById("dueInput"),
};

ids.dueInput.value = toDate(3);

function priorityClass(priority) {
  if (priority === "高") return "badge badge-high";
  if (priority === "中") return "badge badge-middle";
  return "badge badge-low";
}

function render() {
  const todayText = toDate(0);
  const open = inquiries.filter((item) => item.status === "未対応").length;
  const working = inquiries.filter((item) => item.status === "対応中").length;
  const done = inquiries.filter((item) => item.status === "完了").length;
  const due = inquiries.filter((item) => item.status !== "完了" && item.due <= todayText).length;

  ids.heroOpen.textContent = `${open}件`;
  ids.heroToday.textContent = `${inquiries.filter((item) => item.due === todayText).length}件`;
  ids.heroDue.textContent = `${due}件`;
  ids.heroDone.textContent = `${done}件`;
  ids.openCount.textContent = open;
  ids.workingCount.textContent = working;
  ids.dueCount.textContent = due;
  ids.doneCount.textContent = done;

  const statusFilter = ids.statusFilter.value;
  const priorityFilter = ids.priorityFilter.value;
  const rows = inquiries
    .filter((item) => statusFilter === "all" || item.status === statusFilter)
    .filter((item) => priorityFilter === "all" || item.priority === priorityFilter)
    .map((item) => `
      <tr>
        <td><strong>${item.name}</strong><br><span class="muted">${item.content}</span></td>
        <td>${item.source}</td>
        <td><span class="${priorityClass(item.priority)}">${item.priority}</span></td>
        <td>${item.status}</td>
        <td>${item.due}</td>
        <td><button class="row-button" type="button" data-id="${item.id}">${item.status === "完了" ? "未対応に戻す" : "完了にする"}</button></td>
      </tr>
    `)
    .join("");

  ids.table.innerHTML = rows;
}

ids.form.addEventListener("submit", (event) => {
  event.preventDefault();
  inquiries = [
    {
      id: Date.now(),
      name: document.getElementById("nameInput").value.trim() || "名称未入力",
      content: document.getElementById("contentInput").value.trim() || "内容未入力",
      source: document.getElementById("sourceInput").value,
      priority: document.getElementById("priorityInput").value,
      status: document.getElementById("statusInput").value,
      due: document.getElementById("dueInput").value || toDate(3),
    },
    ...inquiries,
  ];
  render();
});

ids.table.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;
  const id = Number(button.dataset.id);
  inquiries = inquiries.map((item) => item.id === id ? { ...item, status: item.status === "完了" ? "未対応" : "完了" } : item);
  render();
});

ids.statusFilter.addEventListener("change", render);
ids.priorityFilter.addEventListener("change", render);
render();
