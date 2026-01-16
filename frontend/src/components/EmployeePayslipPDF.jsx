import jsPDF from 'jspdf';

// --- HELPER: NUMBER TO WORDS CONVERTER ---
const convertAmountToWords = (amount) => {
  const units = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
  const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  const thousands = ['', 'THOUSAND', 'MILLION'];

  const num = parseFloat(amount).toFixed(2);
  const [whole, fraction] = num.split('.');

  if (parseInt(whole) === 0) return 'ZERO';

  let words = '';
  
  const convertGroup = (n) => {
    let str = '';
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (h > 0) str += units[h] + ' HUNDRED ';
    
    if (t > 1) {
      str += tens[t] + ' ';
      if (u > 0) str += units[u] + ' ';
    } else if (t === 1) {
      str += teens[u] + ' ';
    } else if (u > 0) {
      str += units[u] + ' ';
    }
    return str;
  };

  let wholeNum = parseInt(whole);
  let groupIndex = 0;

  while (wholeNum > 0) {
    const remainder = wholeNum % 1000;
    if (remainder > 0) {
      words = convertGroup(remainder) + thousands[groupIndex] + ' ' + words;
    }
    wholeNum = Math.floor(wholeNum / 1000);
    groupIndex++;
  }

  return `${words.trim()} AND ${fraction}/100`;
};

export const generatePayslipPDF = ({ 
  payrolls, 
  payPeriod, 
  payDate,
  coverageFrom, 
  coverageTo 
}) => {
  const doc = new jsPDF('p', 'mm', 'legal');
  
  const pageWidth = doc.internal.pageSize.getWidth(); 
  const startY = 10; 
  const gap = 8; 
  const slipHeight = 110; 
  
  doc.setFont('courier', 'bold');

  payrolls.forEach((p, index) => {
    if (index > 0 && index % 3 === 0) {
      doc.addPage();
    }

    const positionOnPage = index % 3;
    const currentY = startY + (positionOnPage * (slipHeight + gap));

    // --- DRAW CONTAINER ---
    doc.setLineWidth(0.3);
    doc.rect(5, currentY, pageWidth - 10, slipHeight);

    // ==========================================
    //               HEADER SECTION
    // ==========================================
    
    // 1. Title & Location (Centered)
    doc.setFontSize(12);
    doc.setFont('courier', 'bold');
    doc.text("JOB LINK PROVIDER", pageWidth / 2, currentY + 6, { align: "center" });
    
    doc.setFontSize(9);
    doc.setFont('courier', 'normal');
    doc.text("Location: Prince Padi blng", pageWidth / 2, currentY + 10, { align: "center" });

    // 2. Pay Info Block (Left Side) - MATCHING OTHER EXPORTS
    doc.setFontSize(8);
    const leftX = 10;
    const headerY = currentY + 16;
    const lineHeight = 4;

    // Formatting Dates exactly like the reports
    const formattedPayDate = payDate ? new Date(payDate).toLocaleDateString() : 'N/A';
    const fromStr = coverageFrom ? new Date(coverageFrom).toLocaleDateString() : 'N/A';
    const toStr = coverageTo ? new Date(coverageTo).toLocaleDateString() : 'N/A';
    const coverageStr = `${fromStr} - ${toStr}`;

    doc.text(`Pay Period:   ${payPeriod}`, leftX, headerY);
    doc.text(`Pay Date:     ${formattedPayDate}`, leftX, headerY + lineHeight);
    doc.text(`Pay Coverage: ${coverageStr}`, leftX, headerY + (lineHeight * 2));

    // 3. Employee Info Block (Right Side)
    // We move this to the right to keep the left side clean for the "Header" look
    const rightX = 110; 
    
    doc.text(`Employee Name: ${p.employee_name.toUpperCase()}`, rightX, headerY);
    doc.text(`Employee ID:   ${p.id_number || p.employee_code || 'N/A'}`, rightX, headerY + lineHeight);
    doc.text(`Position:      ${p.position}`, rightX, headerY + (lineHeight * 2));

    // Divider Line
    doc.line(5, currentY + 32, pageWidth - 5, currentY + 32);

    // ==========================================
    //            BODY (Earnings/Ded)
    // ==========================================

    const col1X = 8;   // Earnings
    const col2X = 85;  // Deductions
    const col3X = 145; // Acknowledgement
    const contentStartY = currentY + 37;
    const bodyLineHeight = 3.5; 

    // 1. EARNINGS SECTION
    doc.setFont('courier', 'bold');
    doc.text("EARNINGS", col1X, contentStartY);
    doc.setFont('courier', 'normal');
    
    let y1 = contentStartY + 5;
    
    const printEarn = (label, qty, unit, amount) => {
        doc.setFontSize(7);
        doc.text(`${label} (${qty}${unit})`, col1X, y1);
        doc.text(amount, col1X + 65, y1, { align: 'right' });
        y1 += bodyLineHeight;
    };

    // Rates
    const daily = parseFloat(p.daily_rate || 0);
    const hourly = parseFloat(p.hourly_rate || 0);

    // Basic
    const daysWorked = parseFloat(p.total_days_worked || 0);
    const hoursWorked = parseFloat(p.total_hours_worked || 0);
    const basicAmt = parseFloat(p.basic_salary || 0);
    
    if (daysWorked > 0) printEarn("Basic Salary", daysWorked.toFixed(2), "D", basicAmt.toLocaleString(undefined, {minimumFractionDigits: 2}));
    else if (hoursWorked > 0) printEarn("Basic Salary", hoursWorked.toFixed(2), "H", basicAmt.toLocaleString(undefined, {minimumFractionDigits: 2}));

    // --- DETAILED HOLIDAYS ---
    const addHoliday = (label, daysKey, hoursKey, mult) => {
        const d = parseFloat(p[daysKey] || 0);
        const h = parseFloat(p[hoursKey] || 0);
        if (d > 0 || h > 0) {
            const amt = (d * daily * mult) + (h * hourly * mult);
            const qtyStr = d > 0 ? `${d.toFixed(2)}D` : `${h.toFixed(2)}H`;
            printEarn(label, qtyStr.replace(/[DH]/, ''), d > 0 ? 'D' : 'H', amt.toLocaleString(undefined, {minimumFractionDigits: 2}));
        }
    };

    addHoliday("Rest Day/Sun", 'sunday_rest_day_days', 'sunday_rest_day_hours', 1.3);
    addHoliday("Special Day", 'special_day_days', 'special_day_hours', 1.3);
    addHoliday("Spl. on Rest", 'special_day_rest_day_days', 'special_day_rest_day_hours', 1.5);
    addHoliday("Regular Hol", 'regular_holiday_days', 'regular_holiday_hours', 2.0);
    addHoliday("Reg. on Rest", 'regular_holiday_rest_day_days', 'regular_holiday_rest_day_hours', 2.6);

    // --- DETAILED NIGHT DIFF ---
    const addND = (label, daysKey, hoursKey, mult) => {
        const d = parseFloat(p[daysKey] || 0);
        const h = parseFloat(p[hoursKey] || 0);
        if (d > 0 || h > 0) {
            const amt = (d * daily * mult) + (h * hourly * mult);
             const qtyStr = d > 0 ? `${d.toFixed(2)}D` : `${h.toFixed(2)}H`;
            printEarn(label, qtyStr.replace(/[DH]/, ''), d > 0 ? 'D' : 'H', amt.toLocaleString(undefined, {minimumFractionDigits: 2}));
        }
    }
    
    addND("ND Ordinary", 'nd_ordinary_days', 'nd_ordinary_hours', 0.10); 
    addND("ND Rest/Spl", 'nd_rest_special_days', 'nd_rest_special_hours', 0.10); 
    addND("ND Regular", 'nd_regular_holiday_days', 'nd_regular_holiday_hours', 0.10);

    // --- DETAILED OVERTIME ---
    const addOT = (label, hoursKey, mult) => {
        const h = parseFloat(p[hoursKey] || 0);
        if (h > 0) {
            const amt = h * hourly * mult;
            printEarn(label, h.toFixed(2), "H", amt.toLocaleString(undefined, {minimumFractionDigits: 2}));
        }
    };

    addOT("Regular OT", 'ot_regular_hours', 1.25);
    addOT("Rest Day OT", 'ot_rest_day_hours', 1.69);
    addOT("Special OT", 'ot_special_day_hours', 1.69);
    addOT("Spl/Rest OT", 'ot_special_rest_day_hours', 1.95);
    addOT("Reg Hol OT", 'ot_regular_holiday_hours', 2.60);

    // Allowance
    const allow = parseFloat(p.allowance_amount || 0);
    if (allow > 0) {
        doc.text("Allowance", col1X, y1);
        doc.text(allow.toLocaleString(undefined, {minimumFractionDigits: 2}), col1X + 65, y1, { align: 'right' });
        y1 += bodyLineHeight;
    }

    // Gross Total
    y1 += 2;
    doc.setFont('courier', 'bold');
    doc.text("GROSS PAY:", col1X, y1);
    doc.text(parseFloat(p.gross_pay).toLocaleString(undefined, {minimumFractionDigits: 2}), col1X + 65, y1, { align: 'right' });
    doc.setFont('courier', 'normal');


    // 2. DEDUCTIONS SECTION
    doc.setFont('courier', 'bold');
    doc.text("DEDUCTIONS", col2X, contentStartY);
    doc.setFont('courier', 'normal');

    let y2 = contentStartY + 5;
    const printDed = (label, amount) => {
        doc.setFontSize(7);
        doc.text(label, col2X, y2);
        doc.text(amount, col2X + 55, y2, { align: 'right' });
        y2 += bodyLineHeight;
    };

    const sss = parseFloat(p.sss_deduction || 0);
    const phil = parseFloat(p.philhealth_deduction || 0);
    const pagibig = parseFloat(p.pagibig_deduction || 0);
    const late = parseFloat(p.late_deduction || 0);
    
    // Detailed Loans
    const sssLoan = parseFloat(p.sss_loan_deduction || 0);
    const pagibigLoan = parseFloat(p.pagibig_loan_deduction || 0);
    const sssCal = parseFloat(p.sss_calamity_loan_deduction || 0);
    const pagibigCal = parseFloat(p.pagibig_calamity_loan_deduction || 0);
    
    const others = parseFloat(p.others_deduction || 0);
    const uniform = parseFloat(p.uniform_deduction || 0);
    const gbond = parseFloat(p.gbond_deduction || 0);

    if(late > 0) printDed("Late/Undertime", late.toLocaleString(undefined, {minimumFractionDigits: 2}));
    if(sss > 0) printDed("SSS Prem", sss.toLocaleString(undefined, {minimumFractionDigits: 2}));
    if(phil > 0) printDed("PhilHealth", phil.toLocaleString(undefined, {minimumFractionDigits: 2}));
    if(pagibig > 0) printDed("Pag-IBIG Prem", pagibig.toLocaleString(undefined, {minimumFractionDigits: 2}));
    
    if(sssLoan > 0) printDed("SSS Loan", sssLoan.toLocaleString(undefined, {minimumFractionDigits: 2}));
    if(pagibigLoan > 0) printDed("Pag-IBIG Loan", pagibigLoan.toLocaleString(undefined, {minimumFractionDigits: 2}));
    if(sssCal > 0) printDed("SSS Calamity", sssCal.toLocaleString(undefined, {minimumFractionDigits: 2}));
    if(pagibigCal > 0) printDed("Pag-IBIG Cal", pagibigCal.toLocaleString(undefined, {minimumFractionDigits: 2}));
    
    if(uniform > 0) printDed("Uniform", uniform.toLocaleString(undefined, {minimumFractionDigits: 2}));
    if(gbond > 0) printDed("G-Bond", gbond.toLocaleString(undefined, {minimumFractionDigits: 2}));
    if(others > 0) printDed("Others", others.toLocaleString(undefined, {minimumFractionDigits: 2}));

    // Total Deductions
    y2 += 2;
    doc.line(col2X, y2, col2X + 55, y2);
    y2 += 4;
    printDed("Total Ded.", parseFloat(p.total_deductions).toLocaleString(undefined, {minimumFractionDigits: 2}));

    // Net Pay
    y2 += 4;
    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.text("NET PAY:", col2X, y2);
    doc.text(parseFloat(p.net_pay).toLocaleString(undefined, {minimumFractionDigits: 2}), col2X + 55, y2, { align: 'right' });
    doc.setFontSize(8);
    doc.setFont('courier', 'normal');


    // 3. ACKNOWLEDGEMENT SECTION
    let y3 = contentStartY;
    doc.setFont('courier', 'bold');
    doc.text("ACKNOWLEDGEMENT", col3X, y3);
    doc.setFont('courier', 'normal');
    y3 += 5;

    const netPayWords = convertAmountToWords(p.net_pay);
    const text = `I ACKNOWLEDGE TO HAVE RECEIVED THE AMOUNT OF ${netPayWords} (P ${parseFloat(p.net_pay).toLocaleString(undefined, {minimumFractionDigits: 2})}) AND HAVE NO FURTHER CLAIMS FOR SERVICES RENDERED.`;
    
    const splitText = doc.splitTextToSize(text, 55); 
    doc.setFontSize(6.5);
    doc.text(splitText, col3X, y3);
    
    const sigY = currentY + slipHeight - 15;
    doc.line(col3X, sigY, col3X + 55, sigY);
    
    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    doc.text(p.employee_name.toUpperCase(), col3X + 27, sigY + 4, { align: "center", maxWidth: 55 });
    doc.setFont('courier', 'normal');
    doc.setFontSize(6);
    doc.text("Employee Signature", col3X + 27, sigY + 8, { align: "center" });

    // Cut Line
    if (positionOnPage < 2) {
        const cutY = currentY + slipHeight + (gap/2);
        doc.setLineWidth(0.1);
        doc.setLineDash([2, 2], 0);
        doc.line(0, cutY, pageWidth, cutY);
        doc.setLineDash([]);
    }
  });

  doc.save(`Payslips_${payDate}.pdf`);
};