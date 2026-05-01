import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { pickLocalizedPair } from '../../data/dummyLabReports';

function safeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

export async function generateLabReportPDF(report, language = 'en') {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const lang = language === 'hi' ? 'hi' : 'en';

  const qrPayload = JSON.stringify({
    reportId: report.id,
    sampleId: report.sampleId,
    farmer: report.farmerName,
    status: report.status,
    date: report.date,
  });
  const qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 120 });

  doc.setFillColor(14, 116, 62);
  doc.rect(0, 0, 595, 82, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('CropAI Soil Intelligence Lab', 40, 38);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    lang === 'hi' ? 'एआई-सक्षम कृषि प्रयोगशाला रिपोर्ट' : 'AI-powered agriculture laboratory report',
    40,
    58
  );

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`${lang === 'hi' ? 'रिपोर्ट आईडी' : 'Report ID'}: ${report.id}`, 40, 108);
  doc.text(`${lang === 'hi' ? 'सैंपल आईडी' : 'Sample ID'}: ${report.sampleId}`, 40, 126);
  doc.text(`${lang === 'hi' ? 'स्थिति' : 'Status'}: ${report.status}`, 40, 144);

  doc.addImage(qrDataUrl, 'PNG', 468, 94, 88, 88);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('QR', 506, 190);

  autoTable(doc, {
    startY: 200,
    theme: 'grid',
    head: [[lang === 'hi' ? 'किसान विवरण' : 'Farmer Details', '']],
    body: [
      [lang === 'hi' ? 'नाम' : 'Name', report.farmerName],
      [lang === 'hi' ? 'फोन' : 'Phone', report.farmerPhone],
      [lang === 'hi' ? 'गांव' : 'Village', report.village],
      [lang === 'hi' ? 'जिला' : 'District', report.district],
    ],
    headStyles: { fillColor: [16, 185, 129] },
  });

  const nextY = doc.lastAutoTable.finalY + 12;
  autoTable(doc, {
    startY: nextY,
    theme: 'striped',
    head: [[lang === 'hi' ? 'मृदा विश्लेषण' : 'Soil Analysis', 'Value']],
    body: [
      ['pH', safeNumber(report.soilPH).toFixed(1)],
      ['Nitrogen (kg/ha)', safeNumber(report.nitrogen).toString()],
      ['Phosphorus (kg/ha)', safeNumber(report.phosphorus).toString()],
      ['Potassium (kg/ha)', safeNumber(report.potassium).toString()],
      ['Moisture (%)', safeNumber(report.moisture).toString()],
      ['Organic Carbon (%)', safeNumber(report.organicCarbon).toFixed(2)],
      [lang === 'hi' ? 'कीट' : 'Pest', report.pestDetected],
      [lang === 'hi' ? 'रोग जोखिम' : 'Disease Risk', report.diseaseRisk],
    ],
    headStyles: { fillColor: [14, 116, 62] },
  });

  const recY = doc.lastAutoTable.finalY + 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(lang === 'hi' ? 'एआई सिफारिशें' : 'AI Recommendations', 40, recY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const recommendations = [
    `- ${lang === 'hi' ? 'उर्वरक' : 'Fertilizers'}: ${pickLocalizedPair(report.recommendation?.fertilizers, lang)}`,
    `- ${lang === 'hi' ? 'सिंचाई' : 'Irrigation'}: ${pickLocalizedPair(report.recommendation?.irrigation, lang)}`,
    `- ${lang === 'hi' ? 'कीटनाशक' : 'Pesticides'}: ${pickLocalizedPair(report.recommendation?.pesticides, lang)}`,
    `- ${lang === 'hi' ? 'फसल सुझाव' : 'Crop Suggestions'}: ${pickLocalizedPair(report.recommendation?.cropSuggestions, lang)}`,
  ];
  let lineY = recY + 18;
  recommendations.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, 515);
    doc.text(wrapped, 40, lineY);
    lineY += wrapped.length * 12 + 4;
  });

  doc.setDrawColor(226, 232, 240);
  doc.line(40, 762, 555, 762);
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text(
    `${lang === 'hi' ? 'लैब तकनीशियन' : 'Lab Technician'}: ${report.labTechnician} | ${lang === 'hi' ? 'तारीख' : 'Date'}: ${report.date}`,
    40,
    778
  );

  doc.save(`${report.sampleId}-cropai-report.pdf`);
}
