// ====== elements: calculator ======
const ageEl = document.getElementById("age");
const genderEl = document.getElementById("gender");
const weightEl = document.getElementById("weight");
const heightEl = document.getElementById("height");
const activityEl = document.getElementById("activity");

const calcBtn = document.getElementById("calcBtn");
const clearBtn = document.getElementById("clearBtn");

const errBox = document.getElementById("errBox");
const resultCard = document.getElementById("resultCard");
const bmrValueEl = document.getElementById("bmrValue");
const tdeeValueEl = document.getElementById("tdeeValue");
const rangeValueEl = document.getElementById("rangeValue");

// ====== elements: menu ======
const menuBtn = document.getElementById("menuBtn");
const menuClearBtn = document.getElementById("menuClearBtn");
const menuResult = document.getElementById("menuResult");
const mBreakfast = document.getElementById("mBreakfast");
const mLunch = document.getElementById("mLunch");
const mDinner = document.getElementById("mDinner");
const kBreakfast = document.getElementById("kBreakfast");
const kLunch = document.getElementById("kLunch");
const kDinner = document.getElementById("kDinner");
const menuNote = document.getElementById("menuNote");

// ====== state ======
let latestTargetCalories = null; // ต้องกดวิเคราะห์ก่อนถึงจะมีค่า

// ====== helpers ======
function showError(msg){
  errBox.style.display = "block";
  errBox.textContent = msg;
}
function clearError(){
  errBox.style.display = "none";
  errBox.textContent = "";
}

function calculateBMR(gender, weight, height, age){
  // Mifflin–St Jeor
  if (gender === "male"){
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

function getSelectedAllergies(){
  return Array.from(document.querySelectorAll(".allergy:checked")).map(x => x.value);
}
function isAllowed(menu, banned){
  return !menu.allergens.some(a => banned.includes(a));
}
function pickClosest(candidates, targetKcal){
  let best = candidates[0];
  let bestDiff = Math.abs(best.kcal - targetKcal);
  for (const item of candidates){
    const diff = Math.abs(item.kcal - targetKcal);
    if (diff < bestDiff){
      best = item;
      bestDiff = diff;
    }
  }
  return best;
}

// ====== menu database ======
const MENU_DB = [
  // breakfast
  { name:"โจ๊กหมูใส่ไข่", kcal:380, tags:["breakfast"], allergens:["pork","egg"] },
  { name:"ข้าวต้มไก่", kcal:320, tags:["breakfast"], allergens:["chicken"] },
  { name:"ไข่กระทะ", kcal:450, tags:["breakfast"], allergens:["egg","milk"] },
  { name:"แซนด์วิชทูน่า", kcal:420, tags:["breakfast"], allergens:["seafood","egg","milk"] },
  { name:"โยเกิร์ต + กล้วย", kcal:300, tags:["breakfast"], allergens:["milk"] },

  // lunch
  { name:"ข้าวกะเพราไก่", kcal:650, tags:["lunch"], allergens:["chicken"] },
  { name:"ข้าวกะเพราหมูสับ", kcal:700, tags:["lunch"], allergens:["pork"] },
  { name:"ข้าวมันไก่", kcal:720, tags:["lunch"], allergens:["chicken"] },
  { name:"สุกี้แห้งไก่", kcal:550, tags:["lunch"], allergens:["chicken","egg"] },
  { name:"ผัดไทยกุ้ง", kcal:680, tags:["lunch"], allergens:["seafood","egg","nuts"] },

  // dinner
  { name:"ต้มยำกุ้ง + ข้าว", kcal:600, tags:["dinner"], allergens:["seafood"] },
  { name:"แกงจืดเต้าหู้หมูสับ", kcal:520, tags:["dinner"], allergens:["pork"] },
  { name:"ยำวุ้นเส้นทะเล", kcal:480, tags:["dinner"], allergens:["seafood"] },
  { name:"สลัดอกไก่", kcal:420, tags:["dinner"], allergens:["chicken"] },
  { name:"ข้าวผัดไข่", kcal:560, tags:["dinner"], allergens:["egg"] },
];

// ====== main: analyze calories ======
function analyze(){
  clearError();

  const age = Number(ageEl.value);
  const gender = genderEl.value;
  const weight = Number(weightEl.value);
  const height = Number(heightEl.value);
  const activity = Number(activityEl.value);

  if (!age || !weight || !height){
    resultCard.style.display = "none";
    latestTargetCalories = null; // ยังไม่ผ่าน
    showError("กรุณากรอกข้อมูลให้ครบก่อนนะ");
    return;
  }
  if (age < 1 || age > 120){
    resultCard.style.display = "none";
    latestTargetCalories = null;
    showError("อายุควรอยู่ระหว่าง 1–120 ปี");
    return;
  }

  const bmr = calculateBMR(gender, weight, height, age);
  const tdee = bmr * activity;

  // เก็บค่าไว้ใช้กับเมนู
  latestTargetCalories = tdee;

  // show result
  resultCard.style.display = "block";
  bmrValueEl.textContent = `${Math.round(bmr)} kcal/วัน`;
  tdeeValueEl.textContent = `${Math.round(tdee)} kcal/วัน`;

  const low = Math.round(tdee * 0.9);
  const high = Math.round(tdee * 1.1);
  rangeValueEl.textContent = `ช่วงแนะนำคร่าว ๆ (±10%): ${low} – ${high} kcal/วัน`;
}

// ====== menu generation ======
function generateDailyMenu(){
  // ✅ ต้องกดวิเคราะห์ก่อน
  if (!latestTargetCalories){
    alert("กรุณากดวิเคราะห์แคลอรี่ก่อน แล้วค่อยสุ่มเมนูอาหาร");
    return;
  }

  const banned = getSelectedAllergies();
  const target = latestTargetCalories;

  // แบ่งสัดส่วน: เช้า 25% กลางวัน 40% เย็น 35%
  const tB = Math.round(target * 0.25);
  const tL = Math.round(target * 0.40);
  const tD = Math.round(target * 0.35);

  const breakfastList = MENU_DB.filter(m => m.tags.includes("breakfast") && isAllowed(m, banned));
  const lunchList = MENU_DB.filter(m => m.tags.includes("lunch") && isAllowed(m, banned));
  const dinnerList = MENU_DB.filter(m => m.tags.includes("dinner") && isAllowed(m, banned));

  if (breakfastList.length === 0 || lunchList.length === 0 || dinnerList.length === 0){
    alert("เมนูไม่พอ (อาจติ๊กแพ้เยอะเกิน) ลองเอาติ๊กบางอันออก หรือเพิ่มเมนูใน MENU_DB");
    return;
  }

  const b = pickClosest(breakfastList, tB);
  const l = pickClosest(lunchList, tL);
  const d = pickClosest(dinnerList, tD);

  menuResult.style.display = "block";

  mBreakfast.textContent = b.name;
  mLunch.textContent = l.name;
  mDinner.textContent = d.name;

  kBreakfast.textContent = `${b.kcal} kcal (เป้า ~${tB})`;
  kLunch.textContent = `${l.kcal} kcal (เป้า ~${tL})`;
  kDinner.textContent = `${d.kcal} kcal (เป้า ~${tD})`;

  menuNote.textContent = `สุ่มจากเป้าหมาย ~ ${Math.round(target)} kcal/วัน (อิงตามแคลที่คำนวณได้)`;
}

// ====== clear ======
function clearAll(){
  clearError();
  ageEl.value = "";
  weightEl.value = "";
  heightEl.value = "";
  genderEl.value = "male";
  activityEl.value = "1.55";

  resultCard.style.display = "none";
  latestTargetCalories = null;

  menuResult.style.display = "none";
}

// ====== events ======
calcBtn.addEventListener("click", analyze);
clearBtn.addEventListener("click", clearAll);

menuBtn.addEventListener("click", generateDailyMenu);
menuClearBtn.addEventListener("click", () => {
  menuResult.style.display = "none";
});
