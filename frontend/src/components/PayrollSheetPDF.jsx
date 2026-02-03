import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePayrollPDF = ({ 
  payrolls, 
  payPeriod, 
  payDate, 
  coverageFrom, 
  coverageTo 
}) => {
  // 1. Initialize PDF (Landscape, Legal size)
  const doc = new jsPDF('l', 'mm', 'legal');

  // Set Default Font to Courier (Monospaced)
  doc.setFont('courier', 'bold');

  // 2. Document Headers
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(14);
  doc.text("AMAVI CORP.", pageWidth / 2, 15, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont('courier', 'normal');
  doc.text("5TH FLR., PRINCE PADI BLDG., MABULAY SUBD., LUNA ST., CAGAYAN DE ORO", pageWidth / 2, 20, { align: "center" });

  // 3. Info Block
  doc.setFontSize(9);
  doc.text(`Pay Period: ${payPeriod}`, 14, 30);
  doc.text(`Pay Date: ${new Date(payDate).toLocaleDateString()}`, 14, 35);
  doc.text(`Pay Coverage: ${coverageFrom || 'N/A'} - ${coverageTo || 'N/A'}`, 14, 40);

  // --- CALCULATE TOTALS ---
  let totalBasic = 0;
  let totalOtAmt = 0;
  let totalNdAmt = 0;
  
  let totalLate = 0; 
  let totalEcola = 0;
  let totalAdj1 = 0;
  let totalAdj2 = 0;

  let totalGross = 0;
  let totalSss = 0;
  let totalPagibig = 0;
  let totalPhil = 0;
  let totalLoans = 0;
  let totalNet = 0;

  // 4. Prepare Table Data
  const tableBody = payrolls.map(p => {
    // Calculate Loans
    const loans = (
      parseFloat(p.sss_loan_deduction || 0) + 
      parseFloat(p.pagibig_loan_deduction || 0) + 
      parseFloat(p.sss_calamity_loan_deduction || 0) + 
      parseFloat(p.pagibig_calamity_loan_deduction || 0)
    );

    // Get Values
    const basicAmt = parseFloat(p.basic_salary || 0);
    const otAmt = parseFloat(p.overtime_pay || 0);
    const ndAmt = parseFloat(p.night_diff_pay || 0);
    const late = parseFloat(p.late_deduction || 0); 
    
    const ecola = parseFloat(p.ecola || 0);       
    const adj1 = parseFloat(p.adjustment_1 || 0); 
    const adj2 = parseFloat(p.adjustment_2 || 0); 
    
    const gross = parseFloat(p.gross_pay || 0);
    const sss = parseFloat(p.sss_deduction || 0);
    const pagibig = parseFloat(p.pagibig_deduction || 0);
    const phil = parseFloat(p.philhealth_deduction || 0);
    const net = parseFloat(p.net_pay || 0);

    // Add to Totals
    totalBasic += basicAmt;
    totalOtAmt += otAmt;
    totalNdAmt += ndAmt;
    totalLate += late; 
    totalEcola += ecola;
    totalAdj1 += adj1;
    totalAdj2 += adj2;
    totalGross += gross;
    totalSss += sss;
    totalPagibig += pagibig;
    totalPhil += phil;
    totalLoans += loans;
    totalNet += net;

    // OT & ND Hours Sum
    const totalOtHours = (
        parseFloat(p.ot_regular_hours || 0) + 
        parseFloat(p.ot_rest_day_hours || 0) + 
        parseFloat(p.ot_special_day_hours || 0) +
        parseFloat(p.ot_special_rest_day_hours || 0) + 
        parseFloat(p.ot_regular_holiday_hours || 0)
    );

    const totalNdHours = (
        parseFloat(p.nd_ordinary_hours || 0) + 
        parseFloat(p.nd_rest_special_hours || 0) + 
        parseFloat(p.nd_regular_holiday_hours || 0)
    );

    // Attendance Logic
    const daysWorked = parseFloat(p.total_days_worked || 0);
    const hoursWorked = parseFloat(p.total_hours_worked || 0);
    const attendanceDisplay = daysWorked > 0 ? daysWorked : hoursWorked;

    // Rate Display Logic
    const dailyRate = parseFloat(p.daily_rate || 0);
    const hourlyRate = parseFloat(p.hourly_rate || 0);
    const rateDisplay = daysWorked > 0 ? dailyRate : (hourlyRate > 0 ? hourlyRate : dailyRate);

    return [
      p.employee_name,
      // Basic Salary
      rateDisplay.toLocaleString(undefined, {minimumFractionDigits: 2}), 
      attendanceDisplay.toFixed(2), 
      parseFloat(p.holiday_pay || 0).toLocaleString(undefined, {minimumFractionDigits: 2}), 
      
      // Undertime / Late Deduction (Fixed: No parentheses)
      late > 0 ? late.toLocaleString(undefined, {minimumFractionDigits: 2}) : '', 
      
      basicAmt.toLocaleString(undefined, {minimumFractionDigits: 2}), 
      
      // Overtime
      totalOtHours.toFixed(2), 
      otAmt.toLocaleString(undefined, {minimumFractionDigits: 2}), 
      
      // N. Diff
      totalNdHours.toFixed(2), 
      ndAmt.toLocaleString(undefined, {minimumFractionDigits: 2}), 
      
      // ECOLA | ADJ 1 | ADJ 2
      ecola.toLocaleString(undefined, {minimumFractionDigits: 2}), 
      adj1.toLocaleString(undefined, {minimumFractionDigits: 2}), 
      adj2.toLocaleString(undefined, {minimumFractionDigits: 2}), 
      
      // Gross
      gross.toLocaleString(undefined, {minimumFractionDigits: 2}),
      
      // Deductions
      sss.toLocaleString(undefined, {minimumFractionDigits: 2}),
      pagibig.toLocaleString(undefined, {minimumFractionDigits: 2}),
      phil.toLocaleString(undefined, {minimumFractionDigits: 2}),
      '0.00', // TAX
      loans.toLocaleString(undefined, {minimumFractionDigits: 2}), 
      
      // Net
      net.toLocaleString(undefined, {minimumFractionDigits: 2})
    ];
  });

  // Add Grand Total Row
  tableBody.push([
    { content: 'GRAND TOTAL', colSpan: 5, styles: { fontStyle: 'bold', halign: 'right' } },
    { content: totalBasic.toLocaleString(undefined, {minimumFractionDigits: 2}), styles: { fontStyle: 'bold' } },
    
    '', // OT Hours
    { content: totalOtAmt.toLocaleString(undefined, {minimumFractionDigits: 2}), styles: { fontStyle: 'bold' } },
    
    '', // ND Hours
    { content: totalNdAmt.toLocaleString(undefined, {minimumFractionDigits: 2}), styles: { fontStyle: 'bold' } },
    
    { content: totalEcola.toLocaleString(undefined, {minimumFractionDigits: 2}), styles: { fontStyle: 'bold' } },
    { content: totalAdj1.toLocaleString(undefined, {minimumFractionDigits: 2}), styles: { fontStyle: 'bold' } },
    { content: totalAdj2.toLocaleString(undefined, {minimumFractionDigits: 2}), styles: { fontStyle: 'bold' } },
    
    { content: totalGross.toLocaleString(undefined, {minimumFractionDigits: 2}), styles: { fontStyle: 'bold' } },
    
    { content: totalSss.toLocaleString(undefined, {minimumFractionDigits: 2}), styles: { fontStyle: 'bold' } },
    { content: totalPagibig.toLocaleString(undefined, {minimumFractionDigits: 2}), styles: { fontStyle: 'bold' } },
    { content: totalPhil.toLocaleString(undefined, {minimumFractionDigits: 2}), styles: { fontStyle: 'bold' } },
    '0.00',
    { content: totalLoans.toLocaleString(undefined, {minimumFractionDigits: 2}), styles: { fontStyle: 'bold' } },
    
    { content: totalNet.toLocaleString(undefined, {minimumFractionDigits: 2}), styles: { fontStyle: 'bold' } }
  ]);

  // 5. Generate Table
  autoTable(doc, {
    startY: 45,
    theme: 'plain', 
    styles: {
        font: 'courier', 
        fontSize: 7,
        textColor: [0, 0, 0], 
        lineWidth: 0, 
    },
    headStyles: { 
        fillColor: [255, 255, 255], 
        textColor: [0, 0, 0], 
        halign: 'center', 
        valign: 'middle',
        fontStyle: 'bold',
        lineWidth: 0.1, 
        lineColor: [0, 0, 0]
    },
    columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold' }, // Employee Name
        // Removed explicit red color styling for column 4
    },
    
    head: [
      [
        { content: 'Employee Name', rowSpan: 2, styles: { cellWidth: 35, valign: 'middle' } }, 
        { content: 'Basic Salary', colSpan: 5, styles: { halign: 'center' } },
        { content: 'Overtime', colSpan: 2, styles: { halign: 'center' } },
        { content: 'N. Different', colSpan: 2, styles: { halign: 'center' } },
        
        { content: 'ECOLA', rowSpan: 2, styles: { valign: 'middle' } },
        { content: 'Adj 1', rowSpan: 2, styles: { valign: 'middle' } },
        { content: 'Adj 2', rowSpan: 2, styles: { valign: 'middle' } },
        
        { content: 'Gross Pay', rowSpan: 2, styles: { valign: 'middle' } },
        { content: 'SSS', rowSpan: 2, styles: { valign: 'middle' } },
        { content: 'PAG-IBIG', rowSpan: 2, styles: { valign: 'middle' } },
        { content: 'PHIL', rowSpan: 2, styles: { valign: 'middle' } },
        { content: 'TAX', rowSpan: 2, styles: { valign: 'middle' } },
        { content: 'LOANS', rowSpan: 2, styles: { valign: 'middle' } },
        { content: 'NET DUE', rowSpan: 2, styles: { valign: 'middle' } },
      ],
      [
        'Rate', 'Days', 'L. Hol', 'U.Time', 'Amount',
        'Hours', 'Amount',
        'Hours', 'Amount'
      ]
    ],
    body: tableBody,
  });

  // 6. Signatures Section
  const finalY = doc.lastAutoTable.finalY + 20; 
  const pageWidthLimit = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(9);
  doc.setFont('courier', 'bold');

  const sigY = finalY;
  const sigLineY = finalY + 15;
  const nameY = finalY + 20;

  doc.text("PREPARED BY:", 30, sigY);
  doc.line(30, sigLineY, 90, sigLineY); 
  doc.text("LADY ROSE CANILLO", 60, nameY, { align: "center" });

  doc.text("CHECKED BY:", 140, sigY);
  doc.line(140, sigLineY, 200, sigLineY); 
  doc.text("SHEENSHE AWITIN", 170, nameY, { align: "center" });

  doc.text("APPROVED BY:", 250, sigY);
  doc.line(250, sigLineY, 310, sigLineY); 
  doc.text("AMELITA P. PADILLA", 280, nameY, { align: "center" });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('courier', 'normal');
    doc.text(`Page ${i} of ${pageCount}`, pageWidthLimit - 25, doc.internal.pageSize.getHeight() - 10);
  }

  doc.save(`Payroll_Sheet_${payDate}.pdf`);
};