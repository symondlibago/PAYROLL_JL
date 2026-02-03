import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateDeductionPDF = ({ 
  payrolls, 
  payPeriod, 
  payDate, 
  coverageFrom, 
  coverageTo 
}) => {
  // 1. Initialize PDF (Portrait, Legal size)
  const doc = new jsPDF('p', 'mm', 'legal');

  // Set Default Font
  doc.setFont('courier', 'bold');

  // --- HEADER INFO ---
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(14);
  doc.text("AMAVI CORP.", pageWidth / 2, 15, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont('courier', 'normal');
  doc.text("5TH FLR., PRINCE PADI BLDG., MABULAY SUBD., LUNA ST., CAGAYAN DE ORO", pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont('courier', 'bold');
  doc.text("DEDUCTION SCHEDULE DETAIL REPORT", pageWidth / 2, 30, { align: "center" });

  doc.setFontSize(9);
  doc.setFont('courier', 'normal');
  doc.text(`Pay Period: ${payPeriod}`, 14, 40);
  doc.text(`Pay Date: ${new Date(payDate).toLocaleDateString()}`, 14, 45);
  doc.text(`Pay Coverage: ${coverageFrom || 'N/A'} - ${coverageTo || 'N/A'}`, 14, 50);

  // --- PREPARE DATA ---
  const deductionTypes = [
    { key: 'sss_loan_deduction', title: 'SSS LOAN' },
    { key: 'sss_calamity_loan_deduction', title: 'SSS CALAMITY LOAN' },
    { key: 'pagibig_loan_deduction', title: 'PAG-IBIG LOAN' },
    { key: 'pagibig_calamity_loan_deduction', title: 'PAG-IBIG CALAMITY LOAN' },
    { key: 'sss_deduction', title: 'SSS PREMIUM' },
    { key: 'philhealth_deduction', title: 'PHILHEALTH' },
    { key: 'pagibig_deduction', title: 'PAG-IBIG PREMIUM' },
    { key: 'gbond_deduction', title: 'G-BOND' },
    { key: 'uniform_deduction', title: 'UNIFORM' },
    { key: 'proc_fee_deduction', title: 'PROCESSING FEE' },
    { key: 'others_deduction', title: 'OTHERS' },
  ];

  let grandTotal = 0;
  const tableBody = [];

  deductionTypes.forEach((type) => {
    // Filter employees with this deduction > 0
    const filteredEmployees = payrolls.filter(p => parseFloat(p[type.key] || 0) > 0);

    if (filteredEmployees.length > 0) {
      // 1. SECTION HEADER ROW (Will be underlined via hook)
      tableBody.push([
        { 
          content: type.title, 
          colSpan: 6, 
          styles: { fontStyle: 'bold', halign: 'left', textColor: [0, 0, 0] } 
        }
      ]);

      let categoryTotal = 0;

      // 2. EMPLOYEE ROWS
      filteredEmployees.forEach(p => {
        const amount = parseFloat(p[type.key]);
        categoryTotal += amount;

        tableBody.push([
          p.employee_name,
          '', // Ref # (Blank)
          new Date(p.pay_period_start).toLocaleDateString(), // Date
          '0.00', // Advance Amount
          '/ /', // Advances Granted (Visual marker)
          amount.toLocaleString(undefined, {minimumFractionDigits: 2})
        ]);
      });

      // 3. CATEGORY TOTAL ROW
      tableBody.push([
        { content: `Total ${type.title}`, colSpan: 5, styles: { fontStyle: 'bold', halign: 'right' } },
        { 
            content: categoryTotal.toLocaleString(undefined, {minimumFractionDigits: 2}), 
            styles: { fontStyle: 'bold', lineWidth: { top: 0.1 }, lineColor: [0, 0, 0] } // Top line for total
        }
      ]);

      // Add a spacer row for visual separation
      tableBody.push([{ content: '', colSpan: 6, styles: { minCellHeight: 5 } }]);

      grandTotal += categoryTotal;
    }
  });

  // Remove the last spacer row if it exists
  if (tableBody.length > 0 && tableBody[tableBody.length - 1][0].content === '') {
      tableBody.pop();
  }

  // 4. GRAND TOTAL ROW
  tableBody.push([
    { 
      content: 'GRAND TOTAL', 
      colSpan: 5, 
      styles: { 
        fontStyle: 'bold', 
        halign: 'right', 
        fontSize: 10 
      } 
    },
    { 
      content: grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2}), 
      styles: { 
        fontStyle: 'bold', 
        fontSize: 10,
        // Double line effect simulation (using top/bottom borders on the cell)
        lineWidth: { top: 0.1, bottom: 0.1 }, 
        lineColor: [0, 0, 0] 
      } 
    }
  ]);

  // --- GENERATE SINGLE TABLE ---
  autoTable(doc, {
    startY: 55,
    theme: 'plain', // Removes default stripes/colors
    styles: {
        font: 'courier',
        fontSize: 8,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0, // No internal borders by default
    },
    headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
        lineWidth: 0.1, // Keep header box lines
        lineColor: [0, 0, 0]
    },
    columnStyles: {
        0: { cellWidth: 60 }, // Name
        5: { halign: 'right' } // Amount
    },
    head: [[
      'Employee Name', 
      'Ref. #', 
      'Date', 
      'Advance Amount', 
      'Advances Granted', 
      'Deductions'
    ]],
    body: tableBody,
    
    // HOOK: Draw underline for Section Titles (e.g. SSS LOAN)
    didDrawCell: (data) => {
        const { doc, cell } = data;

        // GUARD CLAUSE: Ensure cell exists to prevent crashes
        if (!cell) return;

        // Logic: 
        // 1. Is 'body' section
        // 2. Is first column (index 0)
        // 3. Spans 6 columns (Section Header or Spacer)
        if (data.section === 'body' && data.column.index === 0 && cell.colSpan === 6) {
            
            // FILTER: Ensure there is actual text content (Ignores Spacer Rows with empty text)
            // cell.text is an array of strings. We check if the first line exists and is truthy.
            if (cell.text && cell.text.length > 0 && cell.text[0]) {
                const textWidth = doc.getTextWidth(cell.text[0]);
                const x = cell.x + cell.padding('left');
                const y = cell.y + cell.height - 2; 
                
                doc.setLineWidth(0.1);
                doc.setDrawColor(0, 0, 0);
                doc.line(x, y, x + textWidth, y);
            }
        }
    }
  });

  // --- SIGNATURES SECTION ---
  let finalY = doc.lastAutoTable.finalY + 20;

  // Check if signatures fit on page
  if (finalY > doc.internal.pageSize.getHeight() - 40) {
    doc.addPage();
    finalY = 40;
  }

  doc.setFontSize(9);
  doc.setFont('courier', 'bold');

  const sigY = finalY;
  const sigLineY = sigY + 15;
  const nameY = sigY + 20;

  // 1. Prepared By
  doc.text("PREPARED BY:", 20, sigY);
  doc.line(20, sigLineY, 70, sigLineY); 
  doc.text("LADY ROSE CANILLO", 45, nameY, { align: "center" });

  // 2. Checked By
  doc.text("CHECKED BY:", 85, sigY);
  doc.line(85, sigLineY, 135, sigLineY); 
  doc.text("SHEENSHE AWITIN", 110, nameY, { align: "center" });

  // 3. Approved By
  doc.text("APPROVED BY:", 150, sigY);
  doc.line(150, sigLineY, 200, sigLineY); 
  doc.text("AMELITA P. PADILLA", 175, nameY, { align: "center" });

  // Page Numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('courier', 'normal');
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10);
  }

  doc.save(`Deduction_Schedule_${payDate}.pdf`);
};