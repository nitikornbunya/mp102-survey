/**
 * ข้อมูล mock จังหวัด และ จังหวัด-เขต สำหรับลงทะเบียน
 * เดี๋ยวแทนที่ด้วย master data จริง
 */

/** รายการจังหวัด (สำหรับ ทีมจังหวัด และ dropdown สส.เขต) */
export const MOCK_PROVINCES = [
  { id: "bangkok", name: "กรุงเทพมหานคร" },
  { id: "nonthaburi", name: "นนทบุรี" },
  { id: "pathumthani", name: "ปทุมธานี" },
  { id: "samutprakan", name: "สมุทรปราการ" },
  { id: "nakornpathom", name: "นครปฐม" },
  { id: "chiangmai", name: "เชียงใหม่" },
  { id: "khonkaen", name: "ขอนแก่น" },
  { id: "udonthani", name: "อุดรธานี" },
  { id: "nakhonratchasima", name: "นครราชสีมา" },
  { id: "songkhla", name: "สงขลา" },
] as const;

/** เขตเลือกตั้ง (mock) ตามจังหวัด - สำหรับ สส.เขต */
export const MOCK_DISTRICTS_BY_PROVINCE: Record<string, { id: string; name: string }[]> = {
  bangkok: [
    { id: "bkk-1", name: "เขต 1" },
    { id: "bkk-2", name: "เขต 2" },
    { id: "bkk-3", name: "เขต 3" },
    { id: "bkk-4", name: "เขต 4" },
    { id: "bkk-5", name: "เขต 5" },
  ],
  nonthaburi: [
    { id: "nbr-1", name: "เขต 1" },
    { id: "nbr-2", name: "เขต 2" },
    { id: "nbr-3", name: "เขต 3" },
  ],
  pathumthani: [
    { id: "ptn-1", name: "เขต 1" },
    { id: "ptn-2", name: "เขต 2" },
  ],
  samutprakan: [
    { id: "spk-1", name: "เขต 1" },
    { id: "spk-2", name: "เขต 2" },
    { id: "spk-3", name: "เขต 3" },
  ],
  nakornpathom: [{ id: "npt-1", name: "เขต 1" }],
  chiangmai: [
    { id: "cm-1", name: "เขต 1" },
    { id: "cm-2", name: "เขต 2" },
    { id: "cm-3", name: "เขต 3" },
  ],
  khonkaen: [
    { id: "kk-1", name: "เขต 1" },
    { id: "kk-2", name: "เขต 2" },
  ],
  udonthani: [{ id: "udn-1", name: "เขต 1" }],
  nakhonratchasima: [
    { id: "nrs-1", name: "เขต 1" },
    { id: "nrs-2", name: "เขต 2" },
    { id: "nrs-3", name: "เขต 3" },
  ],
  songkhla: [
    { id: "sk-1", name: "เขต 1" },
    { id: "sk-2", name: "เขต 2" },
  ],
};
