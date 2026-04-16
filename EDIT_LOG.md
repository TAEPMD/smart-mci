# MCI COMMAND — Edit Log

> **Project:** MCI Command · Tactical Emergency Management System  
> **File:** `Index.html` (Single-page app)  
> **Stack:** Vanilla HTML / JavaScript / Tailwind CSS / Firebase Firestore

---

## [v0.5] — 2026-04-17

### 🆕 First-Time Setup Wizard
- เพิ่มหน้า **Setup Wizard** ที่แสดงอัตโนมัติเมื่อยังไม่มีบัญชี Admin (fresh install / reset)
- ฟอร์ม: Username · Password · Confirm Password · Agency / หน่วยงาน
- Validation: password ≥ 6 ตัว, ต้องตรงกันทั้งสองช่อง
- เมื่อบันทึกสำเร็จ → hash SHA-256 → เก็บใน `localStorage` + ตั้ง flag `mci_setup_done`
- หลัง setup → เปิดหน้า Login พร้อม username ที่ตั้งไว้อัตโนมัติ
- ลบ hardcoded default user (`admin` / `123456`) ออกจาก source code

### 🔑 Change Admin Password (Settings)
- เพิ่มปุ่ม **"เปลี่ยนรหัสผ่าน"** (สีส้ม) ใน System Settings header
- กระบวนการ: prompt รหัสใหม่ → ยืนยัน → hash → บันทึกลง state + sync cloud

### ⚙️ Triage Models — Preset Dropdown (Settings)
- แทนที่ `<select>` แบบ fixed options ด้วย **Preset Dropdown + Text Input + Textarea**
- เลือก Preset → ชื่อ Model และรายละเอียดเติมอัตโนมัติ · แก้ไขได้อิสระ
- **Primary Presets (6):** START · SALT · SIEVE · JumpSTART · TST · CareFlight
- **Secondary Presets (6):** SORT · SAVE · NHS MITT · mSTaRT · RETTS-HCT · Clinical Judgment
- รายละเอียดแต่ละ preset อิงข้อมูลจากวารสารวิชาการ (ระบุ reference ครบ)
- ปุ่ม **บันทึก** → อัปเดต `window.state.settings` → sync หน้า Triage ทันที (label + คำอธิบาย)

### 🚑 Vehicle Status Panel — รายละเอียดยานพาหนะ
- เปลี่ยน panel จากตัวเลขนับอย่างเดียวเป็น **Summary Badges + รายการแต่ละคัน**
- แต่ละ card แสดง: ID · ประเภท (type) · หน่วยงาน (agency) · Status Badge สี · ผู้ป่วยปัจจุบัน (En route)
- Status dot: 🟢 Standby / 🟡 En Route (blink) / ⚫ Demobilize

---

## [v0.4] — 2026-04-16

### 💾 Map State Persistence (localStorage)
- บันทึกสถานะแผนที่ทั้งหมดลง `localStorage` key: `mci_map_state`
- **ข้อมูลที่ persist:**
  - ตำแหน่งจุดเกิดเหตุ (lat/lng) — save เมื่อลากหมุดแดง
  - รัศมี 3 วงกลม Hot/Warm/Cold — save เมื่อลาก slider
  - หมุด custom ทั้งหมด (ชื่อ + ตำแหน่ง + unique ID) — save เมื่อเพิ่ม/ลาก/ลบ
- โหลดกลับครบเมื่อ refresh browser
- แก้ไข `removeCustomPin` ที่ broken → ใช้ `removeCustomPinById(id)` แทน
- เพิ่ม event `dragend` บนหมุด custom → update position → save

---

## [v0.3] — 2026-04-16 (Session ก่อนหน้า)

### 🗺️ Google Maps Integration
- แทนที่ Leaflet.js ด้วย **Google Maps JavaScript API**
- Incident Marker แดง — ลากได้, วงกลม 3 วงเลื่อนตาม
- Zone Circles: 🔴 Hot · 🟡 Warm · 🟢 Cold — ปรับรัศมีด้วย slider (50m – 10km)
- **Pin Mode:** คลิกแผนที่เพื่อปักหมุดพร้อมชื่อ · ลบรายตัวหรือล้างทั้งหมด
- หมุด custom ลากย้ายตำแหน่งได้
- รองรับ API Key ผ่าน `prompt()` + เก็บใน `localStorage`

### 🏥 Hospital Capacity Panel (ISOS)
- แสดงจำนวนเตียงคงเหลือต่อโรงพยาบาล เรียลไทม์
- คำนวณอัตโนมัติ: เตียงทั้งหมด − ผู้ป่วยที่ dispatch ไปแล้ว (แยกสีไตรแอจ)
- Status badge: 🟢 รับได้ / 🟡 เต็มบางส่วน / 🔴 เกือบเต็ม
- Collapsible list แสดง Patient ID + timestamp ที่ส่งไปโรงพยาบาลนั้น

---

## [v0.2] — 2026-04-15 (Session ก่อนหน้า)

### 🎨 UI Redesign — Apple Style
- เปลี่ยน design system ทั้งหมดเป็น Clean / Light Mode สไตล์ Apple
- Font: Inter (Google Fonts)
- Color palette: system variables `--apple-*` (blue, green, orange, red)
- Glassmorphism cards · pill badges · micro-animations
- Responsive: sidebar desktop / bottom nav mobile

### 📋 Recent Dispatch Fix
- แก้ `dash-dispatch-list` ที่ไม่ขึ้นข้อมูล
- เรียง dispatch ล่าสุดก่อน · แสดงสูงสุด 5 รายการ · มี color dot ตามไตรแอจ

---

## [v0.1] — Initial Build

### Core Features
- **METHANE Report** — กรอกและบันทึกรายงานสถานการณ์
- **CSCATTT Checklist** — เช็คลิสต์การจัดการ MCI
- **Primary Triage** — บันทึกไตรแอจ + ถ่ายรูปผู้ป่วย
- **Secondary Triage** — Re-triage พร้อม vital signs
- **Patient Care** — บันทึก interventions + injury cards
- **Patient Tracking** — ติดตามสถานะ flow ผู้ป่วย
- **Transport / Dispatch** — จัดการยานพาหนะและส่งผู้ป่วย
- **Hospital ISOS** — บริหารจัดการโรงพยาบาล
- **AAR Report** — สรุปเหตุการณ์ด้วย AI (Gemini)
- **User Management** — Admin / Paramedic roles
- **Firebase Firestore** — Real-time cloud sync
- **localStorage** — Offline fallback

---

## Known Issues / TODO

- [ ] Google Maps ต้องการ API Key ที่ถูกต้อง — ยังไม่มีระบบ fallback map
- [ ] Setup Wizard ยังไม่ sync ขึ้น Firestore (เก็บเฉพาะ localStorage)
- [ ] ปุ่มเปลี่ยนรหัสผ่านใช้ `prompt()` — ควรเปลี่ยนเป็น modal ใน future release
- [ ] ทดสอบบน iOS Safari สำหรับ Map drag interactions

---

*Maintained by: Antigravity AI · Last updated: 2026-04-17*
