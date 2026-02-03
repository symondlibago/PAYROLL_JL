import * as XLSX from 'xlsx';

export const generatePayrollExcel = ({ 
  payrolls, 
  payPeriod, 
  payDate, 
  coverageFrom, 
  coverageTo 
}) => {
  // 1. Setup Header Info
  const companyName = "AMAVI CORP.";
  const address = "5TH FLR., PRINCE PADI BLDG., MABULAY SUBD., LUNA ST., CAGAYAN DE ORO";
  const periodStr = `Pay Period: ${payPeriod}`;
  const dateStr = `Pay Date: ${new Date(payDate).toLocaleDateString()}`;
  const coverStr = `Pay Coverage: ${coverageFrom || 'N/A'} - ${coverageTo || 'N/A'}`;

  // 2. Initialize Totals
  let tBasic = 0, tOtAmt = 0, tNdAmt = 0;
  let tEcola = 0, tAdj1 = 0, tAdj2 = 0;
  let tGross = 0, tSss = 0, tPagibig = 0, tPhil = 0, tLoans = 0, tNet = 0;

  // 3. Prepare Data Rows
  const dataRows = payrolls.map(p => {
    // Calcs
    const loans = (
      parseFloat(p.sss_loan_deduction || 0) + 
      parseFloat(p.pagibig_loan_deduction || 0) + 
      parseFloat(p.sss_calamity_loan_deduction || 0) + 
      parseFloat(p.pagibig_calamity_loan_deduction || 0)
    );

    const basicAmt = parseFloat(p.basic_salary || 0);
    const otAmt = parseFloat(p.overtime_pay || 0);
    const ndAmt = parseFloat(p.night_diff_pay || 0);
    const ecola = parseFloat(p.ecola || 0);
    const adj1 = parseFloat(p.adjustment_1 || 0);
    const adj2 = parseFloat(p.adjustment_2 || 0);
    const gross = parseFloat(p.gross_pay || 0);
    const sss = parseFloat(p.sss_deduction || 0);
    const pagibig = parseFloat(p.pagibig_deduction || 0);
    const phil = parseFloat(p.philhealth_deduction || 0);
    const net = parseFloat(p.net_pay || 0);

    // Accumulate Totals
    tBasic += basicAmt;
    tOtAmt += otAmt;
    tNdAmt += ndAmt;
    tEcola += ecola;
    tAdj1 += adj1;
    tAdj2 += adj2;
    tGross += gross;
    tSss += sss;
    tPagibig += pagibig;
    tPhil += phil;
    tLoans += loans;
    tNet += net;

    // OT/ND Hours
    const otHours = (
      parseFloat(p.ot_regular_hours || 0) + 
      parseFloat(p.ot_rest_day_hours || 0) + 
      parseFloat(p.ot_special_day_hours || 0) +
      parseFloat(p.ot_special_rest_day_hours || 0) + 
      parseFloat(p.ot_regular_holiday_hours || 0)
    );

    const ndHours = (
      parseFloat(p.nd_ordinary_hours || 0) + 
      parseFloat(p.nd_rest_special_hours || 0) + 
      parseFloat(p.nd_regular_holiday_hours || 0)
    );

    // Rate/Days Logic
    const daysWorked = parseFloat(p.total_days_worked || 0);
    const hoursWorked = parseFloat(p.total_hours_worked || 0);
    const dailyRate = parseFloat(p.daily_rate || 0);
    const hourlyRate = parseFloat(p.hourly_rate || 0);
    
    const displayRate = daysWorked > 0 ? dailyRate : (hourlyRate > 0 ? hourlyRate : dailyRate);
    const displayAttendance = daysWorked > 0 ? daysWorked : hoursWorked;

    return [
      p.employee_name,
      displayRate,          // Rate
      displayAttendance,    // Days/Hours
      parseFloat(p.holiday_pay || 0), // L. Hol
      '',                   // U.Time
      basicAmt,             // Basic Amount
      otHours,              // OT Hours
      otAmt,                // OT Amount
      ndHours,              // ND Hours
      ndAmt,                // ND Amount
      ecola,                // ECOLA
      adj1,                 // Adj 1
      adj2,                 // Adj 2
      gross,                // Gross Pay
      sss,                  // SSS
      pagibig,              // Pagibig
      phil,                 // Philhealth
      0.00,                 // Tax
      loans,                // Loans
      net                   // Net Pay
    ];
  });

  // 4. Construct Sheet Data (Array of Arrays)
  const worksheetData = [
    [companyName],
    [address],
    [],
    [periodStr],
    [dateStr],
    [coverStr],
    [],
    // Header Row 1 (Categories)
    [
      "Employee Name", 
      "Basic Salary", "", "", "", "", 
      "Overtime", "", 
      "N. Diff", "", 
      "Add'l Earnings", "", "",
      "Gross Pay", 
      "Deductions", "", "", "", "", 
      "Net Pay"
    ],
    // Header Row 2 (Sub-headers)
    [
      "", // Under Name
      "Rate", "Days/Hrs", "Hol Pay", "U.Time", "Amount",
      "Hours", "Amount",
      "Hours", "Amount",
      "ECOLA", "Adj 1", "Adj 2",
      "", // Gross
      "SSS", "Pag-IBIG", "PhilHealth", "Tax", "Loans",
      "" // Net
    ],
    // Data Rows
    ...dataRows,
    // Grand Total Row
    [
      "GRAND TOTAL",
      "", "", "", "", tBasic,
      "", tOtAmt,
      "", tNdAmt,
      tEcola, tAdj1, tAdj2,
      tGross,
      tSss, tPagibig, tPhil, 0.00, tLoans,
      tNet
    ]
  ];

  // 5. Create Worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // 6. Merge Cells for Layout (Optional but makes it look like the PDF)
  // Format: { s: {r:0, c:0}, e: {r:0, c:5} } -> Start Row/Col, End Row/Col
  worksheet['!merges'] = [
    { s: {r:0, c:0}, e: {r:0, c:10} }, // Company Name
    { s: {r:1, c:0}, e: {r:1, c:10} }, // Address
    
    // Header merges (Row 7 is index 7, Row 8 is index 8)
    { s: {r:7, c:0}, e: {r:8, c:0} }, // Employee Name (Vertical merge)
    { s: {r:7, c:1}, e: {r:7, c:5} }, // Basic Salary (Horizontal)
    { s: {r:7, c:6}, e: {r:7, c:7} }, // Overtime
    { s: {r:7, c:8}, e: {r:7, c:9} }, // N. Diff
    { s: {r:7, c:10}, e: {r:7, c:12} }, // Add'l Earnings
    { s: {r:7, c:13}, e: {r:8, c:13} }, // Gross Pay (Vertical)
    { s: {r:7, c:14}, e: {r:7, c:18} }, // Deductions
    { s: {r:7, c:19}, e: {r:8, c:19} }, // Net Pay (Vertical)
  ];

  // 7. Column Widths
  worksheet['!cols'] = [
    { wch: 30 }, // Name
    { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 12 }, // Basic
    { wch: 8 }, { wch: 10 }, // OT
    { wch: 8 }, { wch: 10 }, // ND
    { wch: 10 }, { wch: 10 }, { wch: 10 }, // Earnings
    { wch: 12 }, // Gross
    { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, // Ded
    { wch: 12 } // Net
  ];

  // 8. Export File
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll Sheet");
  
  // Generate filename
  const fname = `Payroll_Sheet_${payDate.replace(/-/g, '')}.xlsx`;
  XLSX.writeFile(workbook, fname);
};