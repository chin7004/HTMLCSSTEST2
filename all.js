// 記錄開始載入時間
const startTime = performance.now();

// 儲存申訴資料陣列
const complaintData = [];
let caseCounter = 1;

// 當 window.onload（所有資源含圖片載入完成）時執行
window.onload = () => {
  const endTime = performance.now();
  const seconds = ((endTime - startTime) / 1000).toFixed(2);
  console.log(`頁面載入時間：${seconds} 秒`); 
  const loadTimeEl = document.getElementById("loadTime");
  if (loadTimeEl) {
    loadTimeEl.textContent = `頁面載入時間：${seconds} 秒`;
  } else {
    console.warn("#loadTime 找不到！");
  }
};

// 發生機關下拉式開窗
document.addEventListener("DOMContentLoaded", () => {
  const organList = [
    "司法院", "最高法院", "最高行政法院","懲戒法院",
    "法官學院", "臺灣高等法院", "福建高等法院金門分院",
    "臺北高等行政法院","臺中高等行政法院","高雄高等行政法院"
  ];
  const select = document.getElementById("organ");

  organList.forEach(organ => {
    const option = document.createElement("option");
    option.value = organ;
    option.textContent = organ;
    select.appendChild(option);
  });

  // 年月選單自動生成
  const createYearOptions = (id) => {
    const el = document.getElementById(id);
    for (let y = 2020; y <= 2030; y++) {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      el.appendChild(opt);
    }
  };

  const createMonthOptions = (id) => {
    const el = document.getElementById(id);
    for (let m = 1; m <= 12; m++) {
      const opt = document.createElement("option");
      opt.value = m.toString().padStart(2, '0');
      opt.textContent = `${m}月`;
      el.appendChild(opt);
    }
  };

  createYearOptions("syy");
  createYearOptions("eyy");
  createMonthOptions("smm");
  createMonthOptions("emm");
});


// 處理表單送出事件
function submitForm(event) {
  event.preventDefault();

  const form = document.getElementById("complaintForm");

  // 取得表單欄位值
  const sysdate = new Date().toISOString(); // ISO 格式時間
  const caseno = generateCaseNo();

  const organ = form.organ.value;
  const dpt = form.dpt.value;
  const syy = form.syy.value;
  const smm = form.smm.value;
  const eyy = form.eyy.value;
  const emm = form.emm.value;

  const isChief = form.isChief.value === "是" ? "Y" : "N";

  const comp_Class = Array.from(form.querySelectorAll('input[name="comp_Class"]:checked'))
    .map(el => el.value)
    .join(", ");

  const statement = form.statement.value;
  const compName = form.compName.value;
  const comptel = form.comptel.value;
  const compmail = form.compmail.value;

  const newCase = {
    sysdate,
    caseno,
    organ,
    dpt,
    syy,
    smm,
    eyy,
    emm,
    isChief,
    comp_Class,
    statement,
    compName,
    comptel,
    compmail
  };

  // 儲存至 localStorage
  saveToLocalStorage(newCase);

  alert(`資料已儲存，案號：${caseno}`);
  form.reset(); // 清除表單
}

// 自動產生案號（取目前已存資料筆數 + 1）
function generateCaseNo() {
  const data = JSON.parse(localStorage.getItem("complaintData") || "[]");
  const nextIndex = data.length + 1;
  return nextIndex.toString().padStart(3, "0");
}

// 儲存資料到 localStorage
function saveToLocalStorage(newCase) {
  const data = JSON.parse(localStorage.getItem("complaintData") || "[]");
  data.push(newCase);
  localStorage.setItem("complaintData", JSON.stringify(data));
}

// 讀取所有申訴資料
function showAllComplaints() {
  const data = JSON.parse(localStorage.getItem("complaintData") || "[]");
  const tableBody = document.querySelector("#complaintTable tbody");
  tableBody.innerHTML = "";

  if (data.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center">尚無資料</td></tr>';
    return;
  }

  data.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.caseno}</td>
      <td>${item.sysdate}</td>
      <td>${item.organ}</td>
      <td>${item.syy + item.smm} ~ ${item.eyy + item.emm}</td>
      <td>${item.comp_Class}</td>
      <td>${item.compName}</td>
      <td>
        <button onclick="deleteCase(${index})">刪除</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function deleteCase(index) {
  if (!confirm("確定要刪除此筆資料嗎？")) return;
  const data = JSON.parse(localStorage.getItem("complaintData") || "[]");
  data.splice(index, 1);
  localStorage.setItem("complaintData", JSON.stringify(data));
  showAllComplaints();
}

// 查詢頁面
function searchComplaints() {
      const name = document.getElementById("searchName").value.trim();
      const table = document.getElementById("complaintTable");
      const tbody = table.querySelector("tbody");
      const message = document.getElementById("message");
      tbody.innerHTML = "";
      table.style.display = "none";
      message.textContent = "";

      const data = JSON.parse(localStorage.getItem("complaintData") || "[]");

      if (!name) {
        message.textContent = "請輸入申訴人姓名。";
        return;
      }

      if (name === "***") {
        const pass = prompt("請輸入管理者密碼");
        if (pass !== "admin123") {mg 
          alert("驗證失敗！");
          return;
        }
        if (data.length === 0) {
          message.textContent = "目前尚無任何申訴資料。";
          return;
        }
        renderTable(data);
        return;
      }

      const result = data.filter(d => d.compName === name);
      if (result.length === 0) {
        message.textContent = "沒有提出申訴案件，請至「提出申訴」頁籤送出申請。";
        return;
      }

      renderTable(result);
    }

    function renderTable(dataList) {
      const table = document.getElementById("complaintTable");
      const tbody = table.querySelector("tbody");
      tbody.innerHTML = "";
      dataList.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.caseno}</td>
          <td>${item.sysdate}</td>
          <td>${item.organ}</td>
          <td>${item.syy + item.smm} ~ ${item.eyy + item.emm}</td>
          <td>${item.comp_Class}</td>
          <td>${item.compName}</td>
          <td>
             <button onclick="alert('無法刪除');">刪除</button>
          </td>
        `;
        tbody.appendChild(row);
      });
      table.style.display = "table";
    }
