"use client";

import { FileText } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface Note {
  id: string;
  content: string;
  createdAt: string | Date;
  user?: {
    name: string;
  } | null;
}

interface Upload {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  createdAt: string | Date;
}

interface CaseDetail {
  caseType: string;
  registrationYear: number | string;
  registrationNum: number | string;
  title: string;
  courtName: string;
  isCompleted?: boolean;
  user?: {
    name: string;
  } | null;
  notes?: Note[];
  uploads?: Upload[];
}

type CasePrintButtonProps = {
  caseDetail: CaseDetail;
  formattedHearings: any[];
  petitioners: any[];
  respondents: any[];
};

export default function PrintButton({
  caseDetail,
  formattedHearings,
  petitioners,
  respondents,
}: CasePrintButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateHTML = () => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Case: ${caseDetail.title}</title>
      <style>
        @page { 
          margin: 2cm;
          size: A4;
        }
        body {
          font-family: 'Times New Roman', serif;
          line-height: 1.6;
          color: #1a1a1a;
          max-width: 21cm;
          margin: 0 auto;
          padding: 20px;
          background: #fff;
        }
        .letterhead {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 4px double #000;
        }
        .letterhead h1 {
          font-size: 28px;
          margin: 0 0 5px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: bold;
        }
        .letterhead p {
          font-size: 14px;
          margin: 0;
          color: #444;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .header h2 {
          font-size: 24px;
          margin: 0 0 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #000;
        }
        .case-number {
          font-size: 18px;
          font-weight: bold;
          color: #444;
        }
        .case-meta {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          padding: 25px;
          border: 3px double #000;
          margin-bottom: 40px;
          background: #fff;
        }
        .case-meta p {
          margin: 0;
          line-height: 1.8;
          font-size: 15px;
        }
        .case-meta strong {
          display: inline-block;
          width: 100px;
        }
        .section {
          margin-bottom: 40px;
          page-break-inside: avoid;
          border: 2px solid #000;
          padding: 25px;
          position: relative;
        }
        .section h2 {
          position: absolute;
          top: -12px;
          left: 20px;
          color: #000;
          font-size: 16px;
          padding: 0 10px;
          background: #fff;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 150px;
          color: rgba(0, 0, 0, 0.05);
          pointer-events: none;
          z-index: -1;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          font-size: 14px;
        }
        th {
          background: #f8fafc;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.05em;
          border: 2px solid #000;
          padding: 12px;
        }
        td {
          padding: 12px;
          border: 1px solid #000;
        }
        tr:nth-child(even) {
          background: #fcfcfc;
        }
        .parties-list {
          list-style-type: none;
          padding: 0;
          margin: 0;
        }
        .parties-list li {
          padding: 12px 0;
          border-bottom: 1px solid #000;
          line-height: 1.6;
          font-size: 15px;
        }
        .parties-list em {
          color: #444;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          font-size: 14px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 2px solid #000;
        }
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 4px double #000;
          text-align: center;
          font-style: italic;
          font-size: 14px;
          color: #444;
        }
        @media print {
          body { 
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .section { break-inside: avoid; }
          th { background-color: #f8fafc !important; }
        }
      </style>
    </head>
    <body onload="window.print()">
      <div class="letterhead">
        <h1>Just Chambers Legal Services</h1>
        <p>Professional Legal Documentation</p>
        <p>123 Law Street, Legal District, City - 100001</p>
        <p>Tel: (555) 123-4567 | Email: contact@supremelegal.com</p>
      </div>

      <div class="watermark">CONFIDENTIAL</div>

      <div class="header">
        <h2>${caseDetail.caseType} Case Details</h2>
        <p class="case-number">${caseDetail.registrationYear}/${
    caseDetail.registrationNum
  }</p>
      </div>

      <div class="case-meta">
        <p><strong>Title:</strong> ${caseDetail.title}</p>
        <p><strong>Court:</strong> ${caseDetail.courtName || "N/A"}</p>
        <p><strong>Filed By:</strong> ${
          caseDetail.user?.name || "Not assigned"
        }</p>
        <p>
          <strong>Status:</strong> 
          <span class="status-badge ${
            caseDetail.isCompleted ? "status-completed" : "status-pending"
          }">
            ${caseDetail.isCompleted ? "Completed" : "Pending"}
          </span>
        </p>
      </div>

      <div class="section">
        <h2>Petitioners</h2>
        <ul class="parties-list">
          ${petitioners
            .map(
              (p, i) => `
              <li>${i + 1}. ${p.name}${
                p.advocate ? ` <em>(Advocate: ${p.advocate})</em>` : ""
              }</li>
            `
            )
            .join("")}
        </ul>
      </div>

      <div class="section">
        <h2>Respondents</h2>
        <ul class="parties-list">
          ${respondents
            .map(
              (r, i) => `
              <li>${i + 1}. ${r.name}${
                r.advocate ? ` <em>(Advocate: ${r.advocate})</em>` : ""
              }</li>
            `
            )
            .join("")}
        </ul>
      </div>

      <div class="section">
        <h2>Hearing History</h2>
        ${
          formattedHearings.length
            ? `
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Notes</th>
                <th>Next Date</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              ${formattedHearings
                .map(
                  (h) => `
                  <tr>
                    <td>${format(new Date(h.date), "PPP")}</td>
                    <td>${h.notes || "—"}</td>
                    <td>${
                      h.nextDate ? format(new Date(h.nextDate), "PPP") : "—"
                    }</td>
                    <td>${h.nextPurpose || "—"}</td>
                  </tr>
                `
                )
                .join("")}
            </tbody>
          </table>
        `
            : "<p>No hearings recorded for this case.</p>"
        }
      </div>

      ${
        caseDetail.notes && caseDetail.notes.length
          ? `
        <div class="section">
          <h2>Case Notes</h2>
          ${caseDetail.notes
            .map(
              (note: Note) => `
              <div class="note">
                <div class="note-header">
                  <span>By: ${note.user?.name || "Unknown"}</span>
                  <span>${format(new Date(note.createdAt), "PPP")}</span>
                </div>
                <div class="note-content">${note.content}</div>
              </div>
            `
            )
            .join("")}
        </div>
      `
          : ""
      }

      ${
        caseDetail.uploads && caseDetail.uploads.length
          ? `
        <div class="section">
          <h2>Attached Documents</h2>
          <ul class="parties-list">
            ${caseDetail.uploads
              .map(
                (file: Upload) => `
                <li>
                  <strong>${file.fileName}</strong>
                  <br>
                  <span>Added: ${format(new Date(file.createdAt), "PPP")}</span>
                </li>
              `
              )
              .join("")}
          </ul>
        </div>
      `
          : ""
      }

      <div class="footer">
        Generated on ${format(new Date(), "PPP")}
      </div>
    </body>
    </html>
  `;

  const handlePrint = () => {
    setIsGenerating(true);
    try {
      // Create a hidden iframe
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      // Write the content to iframe and print
      iframe.contentWindow?.document.write(generateHTML());
      iframe.contentWindow?.document.close();

      // Wait for content to load then print
      iframe.onload = () => {
        // iframe.contentWindow?.print();
        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
          setIsGenerating(false);
        }, 1000);
      };
    } catch (error) {
      console.error("Error generating print view:", error);
      alert("Failed to print.");
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handlePrint}
      disabled={isGenerating}
      className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium text-white transition-colors shadow-sm ${
        isGenerating ? "bg-gray-400" : "bg-blue-700 hover:bg-blue-800"
      }`}
      aria-label="Print case details"
    >
      <FileText className="w-4 h-4 mr-1 xs:mr-2" />
      <span>{isGenerating ? "Generating..." : "Print"}</span>
    </button>
  );
}
