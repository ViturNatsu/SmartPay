import jsPDF from 'jspdf';
import logo from "@/style/logo.png";
import { tokens } from "@/style/Theme";
import {
  displayValue,
  formatTransactionAmount,
  formatTransactionDate,
  getMerchantPayee,
  getPaymentMethodLabel,
  isInflow,
} from "@/utils/walletTransactionFormatters";
import {getRailLabel} from "@/utils/transactionRailUtils";

export const generateTransactionReceipt = (transaction) => {
  try {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pdf = tokens.color.pdf;

    // Table config
    const tableX = 20;
    const tableWidth = 170;
    const colWidth = 85;   
    const rowHeight = 9;   
    const padX = 6;

    const fields = [
      ['Amount',           `$${Number(transaction.amount).toFixed(2)}`],
      ['Date',             formatTransactionDate(transaction?.createdAt)],
      ['Merchant / Payee', getMerchantPayee(transaction)],
      ['Transaction ID',   displayValue(transaction?.transactionId)],
      ['Payment Method',   getPaymentMethodLabel(transaction)],
      ['Payment Type',    getRailLabel(transaction?.railType)],
      ['Status',         transaction.status],
    ];

    // ---- Header ----
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    const titleText = 'SmartPay';
    const textWidth = doc.getTextWidth(titleText);
    const textStartX = pageWidth / 2 - textWidth / 2;
    const titleY = 26;

    // logo aligned with the title
    doc.addImage(logo, 'PNG', textStartX - 9, titleY - 7, 9, 9);
    doc.setTextColor(0, 0, 0);
    doc.text(titleText, pageWidth / 2, titleY, { align: 'center' });

    // ---- Section title ----
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('Transaction Details', tableX, 44);

    // Divider 
    doc.setDrawColor(...pdf.borderColor);
    doc.setLineWidth(0.4);
    doc.line(tableX, 50, tableX + tableWidth, 50);

    // ---- Table ----
    const tableTop = 60;
    const totalRows = fields.length + 1; // +1 for header row
    let y = tableTop;

    // Helper to vertically center text within a row
    const textBaseline = (rowTop) => rowTop + rowHeight / 2 + 1.2;

    // Header row fill
    doc.setFillColor(...pdf.headerFill);
    doc.rect(tableX, y, tableWidth, rowHeight, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Field', tableX + padX, textBaseline(y));
    doc.text('Value', tableX + colWidth + padX, textBaseline(y));

    y += rowHeight;

    // Data rows (white background, no zebra striping to match target)
    fields.forEach(([label, value]) => {
      doc.setFontSize(10);

      // Label — slightly bolder weight reads cleaner
      doc.setFont('helvetica', 'normal');
      doc.text(label, tableX + padX, textBaseline(y));

      // Value
      doc.setFont('helvetica', 'normal');
      doc.text(String(value ?? '—'), tableX + colWidth + padX, textBaseline(y));

      y += rowHeight;
    });

    // ---- Borders (light, clean) ----
    doc.setDrawColor(...pdf.borderColor);
    doc.setLineWidth(0.3);

    // Outer border
    doc.rect(tableX, tableTop, tableWidth, rowHeight * totalRows, 'S');

    // Horizontal lines between rows
    for (let i = 1; i < totalRows; i++) {
      const lineY = tableTop + rowHeight * i;
      doc.line(tableX, lineY, tableX + tableWidth, lineY);
    }

    // Vertical divider between columns
    doc.line(
      tableX + colWidth,
      tableTop,
      tableX + colWidth,
      tableTop + rowHeight * totalRows
    );

    doc.save(`SmartPay-Receipt-${transaction.transactionId}.pdf`);
  } catch (err) {
    console.error("Failed to generate receipt PDF:", err);
    throw new Error("RECEIPT_GENERATION_FAILED");
  }
};