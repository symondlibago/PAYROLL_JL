import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateContributionsPDF = ({ 
  payrolls, 
  payPeriod, 
  payDate, 
  coverageFrom, 
  coverageTo 
}) => {
  const doc = new jsPDF('p', 'mm', 'legal');
  doc.setFont('courier', 'bold');

  // --- HEADER ---
  const printHeader = () => {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(14);
    doc.text("AMAVI CORP.", pageWidth / 2, 15, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont('courier', 'normal');
    doc.text("5TH FLR., PRINCE PADI BLDG., MABULAY SUBD., LUNA ST., CAGAYAN DE ORO", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont('courier', 'bold');
    doc.text("CONTRIBUTIONS REMITTANCE REPORT", pageWidth / 2, 30, { align: "center" });

    doc.setFontSize(9);
    doc.setFont('courier', 'normal');
    doc.text(`Pay Period: ${payPeriod}`, 14, 40);
    doc.text(`Pay Date: ${new Date(payDate).toLocaleDateString()}`, 14, 45);
    doc.text(`Pay Coverage: ${coverageFrom || 'N/A'} - ${coverageTo || 'N/A'}`, 14, 50);
  };

  printHeader();
  let finalY = 55;

  // --- CONFIG ---
  // Added 'erKey' to map the Employer Share fields
  const categories = [
    { 
      id: 'sss', 
      title: 'SSS CONTRIBUTIONS', 
      deductionKey: 'sss_deduction', 
      erKey: 'sss_employer_share', // New mapping
      numberKey: 'sss_no',
      hasEC: true 
    },
    { 
      id: 'philhealth', 
      title: 'PHILHEALTH CONTRIBUTIONS', 
      deductionKey: 'philhealth_deduction', 
      erKey: 'philhealth_employer_share', // New mapping
      numberKey: 'philhealth_no',
      hasEC: false 
    },
    { 
      id: 'pagibig', 
      title: 'PAG-IBIG CONTRIBUTIONS', 
      deductionKey: 'pagibig_deduction', 
      erKey: 'pagibig_employer_share', // New mapping
      numberKey: 'pagibig_no',
      hasEC: false 
    }
  ];

  let grandTotalEE = 0;
  let grandTotalER = 0;
  let grandTotalEC = 0;
  let grandTotalAll = 0;

  // --- GENERATE TABLES ---
  categories.forEach((cat) => {
    // Filter employees with > 0 deduction for this category
    const items = payrolls.filter(p => parseFloat(p[cat.deductionKey] || 0) > 0);

    if (items.length > 0) {
      // Totals for this category
      let catEE = 0;
      let catER = 0;
      let catEC = 0;
      let catTotal = 0;

      const bodyData = items.map(p => {
        const ee = parseFloat(p[cat.deductionKey] || 0);
        // FETCH ER SHARE VALUE
        const er = parseFloat(p[cat.erKey] || 0); 
        
        const ec = cat.hasEC ? 0.00 : 0.00; // EC Logic can be added here if you have a field for it
        const total = ee + er + ec;

        catEE += ee;
        catER += er;
        catEC += ec;
        catTotal += total;

        const row = [
          p.id_number || '',
          p[cat.numberKey] || 'N/A',
          p.employee_name,
          ee.toLocaleString(undefined, {minimumFractionDigits: 2}), 
          er.toLocaleString(undefined, {minimumFractionDigits: 2}), // Displays ER Value
        ];

        if (cat.hasEC) {
          row.push(ec.toLocaleString(undefined, {minimumFractionDigits: 2}));
        } else {
          row.push('-'); 
        }

        row.push(total.toLocaleString(undefined, {minimumFractionDigits: 2}));
        return row;
      });

      // Add Category Totals
      grandTotalEE += catEE;
      grandTotalER += catER;
      grandTotalEC += catEC;
      grandTotalAll += catTotal;

      const totalRow = [
        { content: `Total ${cat.title}`, colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
        { content: catEE.toLocaleString(undefined, {minimumFractionDigits: 2}), styles: { fontStyle: 'bold', lineWidth: { top: 0.1 } } },
        { content: catER.toLocaleString(undefined, {minimumFractionDigits: 2}), styles: { fontStyle: 'bold', lineWidth: { top: 0.1 } } },
      ];

      if (cat.hasEC) {
        totalRow.push({ content: catEC.toLocaleString(undefined, {minimumFractionDigits: 2}), styles: { fontStyle: 'bold', lineWidth: { top: 0.1 } } });
      } else {
        totalRow.push({ content: '-', styles: { fontStyle: 'bold', halign: 'center', lineWidth: { top: 0.1 } } });
      }

      totalRow.push({ content: catTotal.toLocaleString(undefined, {minimumFractionDigits: 2}), styles: { fontStyle: 'bold', lineWidth: { top: 0.1 } } });
      
      bodyData.push(totalRow);
      bodyData.push([{ content: '', colSpan: cat.hasEC ? 7 : 7, styles: { minCellHeight: 5 } }]); // Spacer

      // Check page break
      if (finalY > doc.internal.pageSize.getHeight() - 50) {
        doc.addPage();
        printHeader();
        finalY = 55;
      }

      // Title
      doc.setFontSize(10);
      doc.setFont('courier', 'bold');
      doc.text(cat.title, 14, finalY);
      finalY += 2;

      // Table Headers based on category
      const headers = ['Emp. #', `${cat.id.toUpperCase()} #`, 'Employee Name', 'EE Share', 'ER Share'];
      if (cat.hasEC) headers.push('EC');
      else headers.push('-'); 
      headers.push('Total');

      autoTable(doc, {
        startY: finalY,
        theme: 'plain',
        // REMOVED BODY GRID LINES
        styles: { font: 'courier', fontSize: 8, textColor: [0, 0, 0], lineWidth: 0 }, 
        // KEPT HEADER GRID LINES
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center', lineWidth: 0.1, lineColor: [0, 0, 0] },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 30 },
          2: { cellWidth: 50 },
          3: { halign: 'right' },
          4: { halign: 'right' },
          5: { halign: 'right' },
          6: { halign: 'right' }
        },
        head: [headers],
        body: bodyData,
      });

      finalY = doc.lastAutoTable.finalY + 10;
    }
  });

  // --- SIGNATURES ---
  if (finalY > doc.internal.pageSize.getHeight() - 40) {
    doc.addPage();
    finalY = 40;
  }

  doc.setFontSize(9);
  doc.setFont('courier', 'bold');

  const sigY = finalY + 10;
  const sigLineY = sigY + 15;
  const nameY = sigY + 20;

  doc.text("PREPARED BY:", 20, sigY);
  doc.line(20, sigLineY, 70, sigLineY); 
  doc.text("LADY ROSE CANILLO", 45, nameY, { align: "center" });

  doc.text("CHECKED BY:", 85, sigY);
  doc.line(85, sigLineY, 135, sigLineY); 
  doc.text("SHEENSHE AWITIN", 110, nameY, { align: "center" });

  doc.text("APPROVED BY:", 150, sigY);
  doc.line(150, sigLineY, 200, sigLineY); 
  doc.text("AMELITA P. PADILLA", 175, nameY, { align: "center" });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('courier', 'normal');
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10);
  }

  doc.save(`Contributions_Report_${payDate}.pdf`);
};