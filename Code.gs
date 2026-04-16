// ==========================================
// ไฟล์: Code.gs (MCI Management System - Backend Host)
// พัฒนาสำหรับ: สถาบันการแพทย์ฉุกเฉินแห่งชาติ (สพฉ.)
// เวอร์ชัน: Cloud Enterprise Edition (Production)
// ==========================================

/**
 * ฟังก์ชันเริ่มต้นสำหรับสร้างโครงสร้างตาราง Backup ใน Google Sheets
 * แนะนำให้กดรัน (Run) ฟังก์ชันนี้ 1 ครั้งก่อนนำระบบไปใช้งานจริง
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ['Users', 'Settings', 'Patients', 'CareRecords', 'Vehicles', 'Dispatches', 'Hospitals', 'Methane_Cscattt'];
  
  sheets.forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      
      // สร้าง Header ตามแต่ละชีต
      if(name === 'Users') {
        sheet.appendRow(['Username', 'Agency', 'PIN_Hash', 'Role']);
        // SECURITY NOTE: Default admin user removed for production. 
        // Create admin user through the UI after deployment.
      } else if(name === 'Settings') {
        sheet.appendRow(['PrimaryModel', 'SecondaryModel', 'IDPrefix', 'CurrentSeq']);
        sheet.appendRow(['START', 'SORT', 'SMART', '1']);
      } else if(name === 'Patients') {
        sheet.appendRow(['Timestamp', 'PatientID', 'Gender', 'TriageCat', 'Injury', 'Status', 'Stage', 'Vitals_JSON', 'HazMat_JSON', 'Photo_Base64']);
      } else if(name === 'CareRecords') {
        sheet.appendRow(['RecordID', 'PatientID', 'Time', 'Intervention']);
      } else if(name === 'Vehicles') {
        sheet.appendRow(['VehicleID', 'Agency', 'Type', 'Status', 'CurrentPatient']);
      } else if(name === 'Dispatches') {
        sheet.appendRow(['DispatchID', 'Time', 'PatientID', 'VehicleID', 'Destination']);
      } else if(name === 'Hospitals') {
        sheet.appendRow(['HospitalID', 'Name', 'Cap_Red', 'Cap_Yellow', 'Cap_Green']);
      } else if(name === 'Methane_Cscattt') {
        sheet.appendRow(['Type', 'Data_JSON']);
      }
      
      // จัดรูปแบบ Header
      sheet.getRange("A1:Z1").setFontWeight("bold").setBackground("#f3f4f6");
      sheet.setFrozenRows(1);
    }
  });
  
  SpreadsheetApp.getUi().alert('สร้างโครงสร้างฐานข้อมูล Backup สำเร็จ! \nคุณสามารถไปที่ "การทำให้ใช้งานได้ (Deploy)" เพื่อสร้าง Web App ได้เลย');
}

/**
 * ฟังก์ชันสำหรับให้บริการ Web App (แสดงผลหน้า HTML)
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('MCI Command Center - Cloud Edition')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * ฟังก์ชันสำหรับรับข้อมูล Sync จาก Frontend (ทำหน้าที่เป็น Backup Data)
 * ถูกเรียกใช้โดยอัตโนมัติจากฝั่ง Client ผ่าน google.script.run
 */
function syncDataToSheet(stateJsonString) {
  try {
    const state = JSON.parse(stateJsonString);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Sync Patients
    let sheet = ss.getSheetByName('Patients');
    if (sheet) {
      clearSheetData(sheet);
      if(state.patients && state.patients.length > 0) {
        let pData = state.patients.map(p => [
          p.timestamp, p.id, p.gender, p.cat, p.injury, p.status, p.stage, 
          JSON.stringify(p.vitals || {}), JSON.stringify(p.hazmat || {}), 
          (p.photoUrl ? 'Has Photo' : '')
        ]);
        sheet.getRange(2, 1, pData.length, pData[0].length).setValues(pData);
      }
    }

    // 2. Sync Care Records
    sheet = ss.getSheetByName('CareRecords');
    if (sheet) {
      clearSheetData(sheet);
      if(state.careRecords && state.careRecords.length > 0) {
        let cData = state.careRecords.map(c => [c.id || '', c.pId, c.time, c.action]);
        sheet.getRange(2, 1, cData.length, cData[0].length).setValues(cData);
      }
    }

    // 3. Sync Vehicles
    sheet = ss.getSheetByName('Vehicles');
    if (sheet) {
      clearSheetData(sheet);
      if(state.vehicles && state.vehicles.length > 0) {
        let vData = state.vehicles.map(v => [v.id, v.agency || '', v.type, v.status, v.currentPatient || '']);
        sheet.getRange(2, 1, vData.length, vData[0].length).setValues(vData);
      }
    }

    // 4. Sync Dispatches
    sheet = ss.getSheetByName('Dispatches');
    if (sheet) {
      clearSheetData(sheet);
      if(state.dispatches && state.dispatches.length > 0) {
        let dData = state.dispatches.map(d => [d.id || '', d.time, d.pId, d.vId, d.dest]);
        sheet.getRange(2, 1, dData.length, dData[0].length).setValues(dData);
      }
    }

    // 5. Sync Hospitals
    sheet = ss.getSheetByName('Hospitals');
    if (sheet) {
      clearSheetData(sheet);
      if(state.hospitals && state.hospitals.length > 0) {
        let hData = state.hospitals.map(h => [h.id, h.name, h.capRed, h.capYellow, h.capGreen]);
        sheet.getRange(2, 1, hData.length, hData[0].length).setValues(hData);
      }
    }

    // 6. Sync Methane & CSCATTT
    sheet = ss.getSheetByName('Methane_Cscattt');
    if (sheet) {
      clearSheetData(sheet);
      sheet.appendRow(['METHANE', JSON.stringify(state.methane || {})]);
      sheet.appendRow(['CSCATTT', JSON.stringify(state.cscattt || {})]);
    }

    // 7. Sync Users
    sheet = ss.getSheetByName('Users');
    if (sheet) {
      clearSheetData(sheet);
      if(state.users && state.users.length > 0) {
        let uData = state.users.map(u => [u.username, u.agency || '', u.pinHash, u.role]);
        sheet.getRange(2, 1, uData.length, uData[0].length).setValues(uData);
      }
    }

    return true;
  } catch (e) {
    Logger.log(e.toString());
    throw new Error("Sync failed: " + e.message);
  }
}

/**
 * Utility Function: ล้างข้อมูลเก่าก่อนเขียนทับใหม่ (ป้องกันข้อมูลซ้ำซ้อน)
 */
function clearSheetData(sheet) {
  try {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
    }
  } catch (e) {
    Logger.log("Error clearing sheet data: " + e.toString());
    throw new Error("Failed to clear sheet data: " + e.message);
  }
}