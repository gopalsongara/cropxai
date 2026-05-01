import React from 'react';
import { Download, FileDown, FileJson, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function downloadBlob(name, mime, content) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function serializeExportRows(reports) {
  return reports.map((r) => ({
    id: r.id,
    sampleId: r.sampleId,
    farmerName: r.farmerName,
    farmerPhone: r.farmerPhone,
    district: r.district,
    village: r.village,
    crop: r.crop,
    soilType: r.soilType,
    status: r.status,
    priority: r.priority,
    date: r.date,
    pH: r.soilPH,
    nitrogen: r.nitrogen,
    phosphorus: r.phosphorus,
    potassium: r.potassium,
    moisture: r.moisture,
    organicCarbon: r.organicCarbon,
    pestDetected: r.pestDetected,
    diseaseRisk: r.diseaseRisk,
    labTechnician: r.labTechnician,
  }));
}

export const ExportButtons = React.memo(function ExportButtons({ reports, labels, language }) {
  const stamp = new Date().toISOString().slice(0, 10);
  const rows = serializeExportRows(reports);

  const exportJson = () => {
    downloadBlob(`cropai-lab-reports-${stamp}.json`, 'application/json', JSON.stringify(rows, null, 2));
  };

  const exportCsv = () => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    downloadBlob(`cropai-lab-reports-${stamp}.csv`, 'text/csv;charset=utf-8', csv);
  };

  const exportExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lab Reports');
    XLSX.writeFile(workbook, `cropai-lab-reports-${stamp}.xlsx`);
  };

  const exportPdfSummary = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const lang = language === 'hi' ? 'hi' : 'en';
    doc.setFontSize(16);
    doc.text(lang === 'hi' ? 'CropAI लैब रिपोर्ट सारांश' : 'CropAI Lab Report Summary', 40, 40);
    doc.setFontSize(10);
    doc.text(`${lang === 'hi' ? 'निर्यात रिकॉर्ड' : 'Exported records'}: ${rows.length}`, 40, 60);

    autoTable(doc, {
      startY: 74,
      head: [[labels.sampleId, labels.farmerName, labels.crop, labels.status, labels.date]],
      body: rows.map((r) => [r.sampleId, r.farmerName, r.crop, r.status, r.date]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 118, 110] },
    });
    doc.save(`cropai-lab-summary-${stamp}.pdf`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={exportCsv}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50"
      >
        <Download className="w-4 h-4" />
        {labels.exportCsv}
      </button>
      <button
        type="button"
        onClick={exportExcel}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50"
      >
        <FileSpreadsheet className="w-4 h-4" />
        {labels.exportExcel}
      </button>
      <button
        type="button"
        onClick={exportJson}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50"
      >
        <FileJson className="w-4 h-4" />
        {labels.exportJson}
      </button>
      <button
        type="button"
        onClick={exportPdfSummary}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800"
      >
        <FileDown className="w-4 h-4" />
        {labels.downloadPdf}
      </button>
    </div>
  );
});
