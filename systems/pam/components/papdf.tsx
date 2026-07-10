"use client";

import React, { useMemo, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";

type Rating = 1 | 2 | 3 | 4 | 5 | null;

interface CriteriaItem {
  id: string;
  label: string;
}
interface CriteriaCategory {
  id: string;
  title: string;
  items: CriteriaItem[];
}
interface JobDescRow {
  id: string;
  description: string;
  rating: Rating;
  remarks: string;
}

interface LineRow {
  id: string;
  value: string;
}

const CATEGORIES: CriteriaCategory[] = [
  {
    id: "attendance",
    title: "ATTENDANCE / PUNCTUALITY",
    items: [
      { id: "att-a", label: "a.) punctuality, promptness and regularity in reporting to work" },
      { id: "att-b", label: "b.) ability to use company time wisely and productively" },
    ],
  },
  {
    id: "communication",
    title: "COMMUNICATION",
    items: [
      { id: "com-a", label: "a.) clearly expresses ideas and thoughts to others" },
      { id: "com-b", label: "b.) readily shares appropriate work-related information with co-workers" },
      { id: "com-c", label: "c.) conveys information in clear and accurate manner" },
      { id: "com-d", label: "d.) can produce and deliver formal presentations" },
      { id: "com-e", label: "e.) assertive in delivering ideas" },
    ],
  },
  {
    id: "job-knowledge",
    title: "JOB KNOWLEDGE",
    items: [
      { id: "jk-a", label: "a.) understands the details and nature of assigned job" },
      { id: "jk-b", label: "b.) demonstrates expertise in the functional aspects of job" },
      { id: "jk-c", label: "c.) works up for a quality standard in all aspects of job" },
    ],
  },
  {
    id: "quality",
    title: "QUALITY OF WORK",
    items: [
      { id: "qw-a", label: "a.) produces work on time with accuracy and completeness" },
      { id: "qw-b", label: "b.) displays orderliness and neatness of work output" },
    ],
  },
  {
    id: "quantity",
    title: "QUANTITY OF WORK",
    items: [
      { id: "qt-a", label: "a.) accepts and can execute task variations" },
      { id: "qt-b", label: "b.) able to accomplish more than the assigned tasks within the time frame" },
      { id: "qt-c", label: "c.) voluntarily adds more efforts to produce work output" },
    ],
  },
  {
    id: "dependability",
    title: "DEPENDABILITY/SELF-MANAGEMENT",
    items: [
      { id: "dep-a", label: "a.) sets own priorities using available resources" },
      { id: "dep-b", label: "b.) regularly completes work on schedule w/minimum supervision" },
      { id: "dep-c", label: "c.) take advantage of the opportunity to grow" },
    ],
  },
  {
    id: "customer",
    title: "CUSTOMER/CLIENT FOCUS",
    items: [
      { id: "cus-a", label: "a.) establishes good working relationship both with external and internal customers" },
      { id: "cus-b", label: "b.) maintains courteousness and promptness to customer needs and expectations" },
    ],
  },
  {
    id: "flexibility",
    title: "ABILITY TO LEARN/FLEXIBILITY",
    items: [
      { id: "flex-a", label: "a.) open to new ideas, techniques and procedures" },
      { id: "flex-b", label: "b.) absorbs instructions with minimum instructions" },
      { id: "flex-c", label: "c.) take good actions on new situations" },
      { id: "flex-d", label: "d.) adjusts performance to accommodate changes in departmental directions and processes" },
    ],
  },
  {
    id: "attitude",
    title: "WORK ATTITUDE",
    items: [
      { id: "wa-a", label: "a.) displays positive disposition towards work" },
      { id: "wa-b", label: "b.) shows interest and enthusiasm in delivering job" },
      { id: "wa-c", label: "c.) concern for health, safety and cleanliness of workplace" },
    ],
  },
  {
    id: "technology",
    title: "TECHNOLOGY SKILLS",
    items: [
      { id: "tech-a", label: "a.) proficiently use work related equipments, tools and technology" },
      { id: "tech-b", label: "b.) find ways and means to modernize procedures" },
    ],
  },
  {
    id: "problem-solving",
    title: "PROBLEM SOLVING",
    items: [
      { id: "ps-a", label: "a.) reviews facts and data before concluding" },
      { id: "ps-b", label: "b.) use sound judgment to arrive at the most effective solution" },
    ],
  },
  {
    id: "human-relation",
    title: "HUMAN RELATION",
    items: [
      { id: "hr-a", label: "a.) able to get along well with co-employees" },
      { id: "hr-b", label: "b.) works cooperatively with colleagues and build good working relationship to colleagues and superiors" },
      { id: "hr-c", label: "c.) creates a healthy and well-rounded working environment" },
    ],
  },
  {
    id: "teamwork",
    title: "TEAMWORK",
    items: [
      { id: "tw-a", label: "a.) works collaboratively to achieve identified goals and objectives." },
    ],
  },
  {
    id: "creativity",
    title: "CREATIVITY AND INNOVATIONS",
    items: [
      { id: "cr-a", label: "a.) explores and suggests new approaches and methods to" },
      { id: "cr-b", label: "b.) initiate actions that solve conflict in the organizations" },
    ],
  },
  {
    id: "housekeeping",
    title: "HOUSEKEEPING AND SAFETY",
    items: [
      { id: "hk-a", label: "a.) observes good housekeeping rules and follows the principle of 5 S program" },
      { id: "hk-b", label: "b.) immediately detects and corrects unsafe conditions in the workplace" },
    ],
  },
];

const RATING_NUMS = [1, 2, 3, 4, 5] as const;

function RatingBox({
  checked,
  onChange,
  ariaLabel,
}:
 {
  checked: boolean;
  onChange: () => void;
  ariaLabel: string; 
}
) {
  return (
    <label style={s.ratingBox} className="rating-box">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={s.ratingBoxInput}
        aria-label={ariaLabel}
      />
      <span style={{ ...s.ratingBoxMark, visibility: checked ? "visible" : "hidden" }}>✓</span>
    </label>
  );
}

export default function PerformanceEvaluationForm() {
  // Letterhead
  const [companyLetterhead, setCompanyLetterhead] = useState("JRS Group of Companies");
  const [dateOfMonth, setDateOfMonth] = useState("");
  const [companyName, setCompanyName] = useState("");

  // Identification
  const [employee, setEmployee] = useState("");
  const [employeePosition, setEmployeePosition] = useState("");
  const [evaluator, setEvaluator] = useState("");
  const [evaluatorPosition, setEvaluatorPosition] = useState("");
  const [evalDate, setEvalDate] = useState("");
  const [period3, setPeriod3] = useState("");
  const [period4, setPeriod4] = useState("");
  const [period5, setPeriod5] = useState("");

  // Part I
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const setRating = (itemId: string, value: Rating) =>
    setRatings((prev) => ({ ...prev, [itemId]: prev[itemId] === value ? null : value }));

  const allItemIds = useMemo(() => CATEGORIES.flatMap((c) => c.items.map((i) => i.id)), []);
  const { answeredCount, averageRating } = useMemo(() => {
    const answered = allItemIds.map((id) => ratings[id]).filter((r): r is Exclude<Rating, null> => r != null);
    const avg = answered.length ? answered.reduce((a, b) => a + b, 0) / answered.length : null;
    return { answeredCount: answered.length, averageRating: avg };
  }, [ratings, allItemIds]);

  // Part II
  const [jobRows, setJobRows] = useState<JobDescRow[]>(
    Array.from({ length: 20 }, (_, i) => ({ id: `job-${i}`, description: "", rating: null, remarks: "" }))
  );
  const removeJobRow = (id: string) => setJobRows((r) => (r.length > 1 ? r.filter((x) => x.id !== id) : r));
  const updateJobRow = (id: string, patch: Partial<JobDescRow>) =>
    setJobRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const [strengthRows, setStrengthRows] = useState<LineRow[]>(
    Array.from({ length: 10 }, (_, i) => ({ id: `strength-${i}`, value: "" }))
  );
  const [improvementRows, setImprovementRows] = useState<LineRow[]>(
    Array.from({ length: 10 }, (_, i) => ({ id: `improvement-${i}`, value: "" }))
  );

  // Part III
  const [recommendation, setRecommendation] = useState<
    "regularization" | "non-renewal" | "extension" | "others" | ""
  >("");
  const [regEffective, setRegEffective] = useState("");
  const [extFrom, setExtFrom] = useState("");
  const [extTo, setExtTo] = useState("");
  const [othersText, setOthersText] = useState("");
  const [partIIIRemarks, setPartIIIRemarks] = useState("");

  const [employeeSig, setEmployeeSig] = useState("");
  const [employeeSigDate, setEmployeeSigDate] = useState("");
  const [evaluatorSig, setEvaluatorSig] = useState("");
  const [evaluatorSigDate, setEvaluatorSigDate] = useState("");

  const handleExportPDF = async () => {
  const sheet = document.querySelector(".sheet") as HTMLElement;
  if (!sheet) return;

  const clone = sheet.cloneNode(true) as HTMLElement;
const dateInputs = clone.querySelectorAll('input[type="date"]');

dateInputs.forEach((input) => {
  const dateInput = input as HTMLInputElement;

  const textInput = document.createElement("input");

  textInput.type = "text";
  textInput.value = dateInput.value ? dateInput.value : "";
  textInput.style.cssText = dateInput.style.cssText;

  dateInput.replaceWith(textInput);
});
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Performance Evaluation</title>
        <style>
        ${CSS}
          @page {
            size: 8.5in 13in;
            margin: 0.5in;
          }

          * {
            box-sizing: border-box;
          }

          html, body {
            margin:0;
            padding:0;
            background:white;
            font-family: Tahoma, Geneva, Verdana, sans-serif;
            color:black;
          }

          .sheet {
            width:100%;
            padding:0;
          }

          table {
            width:100%;
            border-collapse:collapse;
            page-break-inside:auto;
          }

          thead {
            display:table-header-group;
          }

          tbody {
            page-break-inside:auto;
          }

          tr {
            page-break-inside:avoid;
            break-inside:avoid;
          }

          td, th {
            page-break-inside:avoid;
            break-inside:avoid;
          }

          .keep-together {
            page-break-inside:avoid;
            break-inside:avoid;
          }

          input,
textarea {
  background: transparent !important;
}

/* Keep empty date fields blank in PDF */

/* Keep guideline lines visible in PDF */
.underlineInputFlex,
.underlineInput,
.periodLineInput,
.recInline,
.sigInput,
.lineInput {
  border-bottom: 1px solid #000 !important;
}

          .rating-box input {
            display:none;
          }

          .no-print {
            display:none;
          }
          
        </style>
      </head>
      <body></body>
    </html>
  `);

  printWindow.document.body.appendChild(clone);

  await new Promise(resolve => setTimeout(resolve, 300));

  printWindow.focus();
  printWindow.print();

  printWindow.close();
};
  const handleReset = () => {
    if (!window.confirm("Clear all entries on this form?")) return;
    setCompanyName("");
    setEmployee("");
    setEmployeePosition("");
    setEvaluator("");
    setEvaluatorPosition("");
    setEvalDate("");
    setPeriod3("");
    setPeriod4("");
    setPeriod5("");
    setRatings({});
    setJobRows(Array.from({ length: 20 }, (_, i) => ({ id: `job-${i}`, description: "", rating: null, remarks: "" })));
    setStrengthRows(Array.from({ length: 10 }, (_, i) => ({ id: `strength-${i}`, value: "" })));
    setImprovementRows(Array.from({ length: 10 }, (_, i) => ({ id: `improvement-${i}`, value: "" })));
    setRecommendation("");
    setRegEffective("");
    setExtFrom("");
    setExtTo("");
    setOthersText("");
    setPartIIIRemarks("");
    setEmployeeSig("");
    setEmployeeSigDate("");
    setEvaluatorSig("");
    setEvaluatorSigDate("");
  };

  return (
    <div style={s.page} className="page-wrapper">
      <style>{CSS}</style>

      <div style={s.toolbar} className="no-print">
        <span>PERFORMANCE EVALUATION SHEET</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={s.btnSecondary} onClick={handleReset}>Clear form</button>
          <button style={s.btnPrimary} onClick={handleExportPDF}>
  Save as PDF
</button>
        </div>
      </div>

      <div style={s.sheet} className="sheet">
        {/* Letterhead */}
        <div className="keep-together">
        <div style={s.letterheadGrid}>
          <div />
          <input
            style={s.letterheadInput}
            value={companyLetterhead}
            onChange={(e) => setCompanyLetterhead(e.target.value)}
          />
          <div style={s.letterheadDateRight}>
            <span>Date of 6<sup>th</sup> Mo.</span>
            <input
              style={s.dateAfterMoInput}
              value={dateOfMonth}
              onChange={(e) => setDateOfMonth(e.target.value)}
            />
          </div>
        </div>

        <div style={s.companyLine}>
          <input style={s.companyNameInput} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </div>
        <div style={s.companyCaption}>COMPANY</div>

        <div style={s.formTitle}>PERFORMANCE EVALUATION SHEET</div>
        </div>

        {/* Identification */}
        <table style={s.plainTable}>
          <tbody>
            <tr>
              <td colSpan={4} style={{ padding: 0 }}>
                <div style={s.empPosRow}>
                  <div style={s.empPosBlock}>
                    <span style={s.idLabelInline}>EMPLOYEE:</span>
                    <input style={s.underlineInputFlex} value={employee} onChange={(e) => setEmployee(e.target.value)} />
                  </div>
                  <div style={s.empPosBlockRight}>
                    <span style={s.idLabelInline}>POSITION:</span>
                    <input style={s.underlineInputFlex} value={employeePosition} onChange={(e) => setEmployeePosition(e.target.value)} />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={4} style={{ padding: 0 }}>
                <div style={s.empPosRow}>
                  <div style={s.empPosBlock}>
                    <span style={s.idLabelInline}>EVALUATOR:</span>
                    <input style={s.underlineInputFlex} value={evaluator} onChange={(e) => setEvaluator(e.target.value)} />
                  </div>
                  <div style={s.empPosBlockRight}>
                    <span style={s.idLabelInline}>POSITION:</span>
                    <input style={s.underlineInputFlex} value={evaluatorPosition} onChange={(e) => setEvaluatorPosition(e.target.value)} />
                  </div>
                </div>
              </td>
            </tr>
           <tr>
  <td style={s.idLabelCell}>DATE:</td>
  <td style={s.idInputCell}>
    <input
      type="date"
      style={s.underlineInput}
      value={evalDate}
      onChange={(e) => setEvalDate(e.target.value)}
    />
  </td>

  <td style={s.idLabelCell}>EVALUATION PERIOD:</td>
<td style={s.idInputCell}>
  <div style={s.periodRow}>
    <span style={s.periodLabel}>
      3<sup>rd</sup> mo.
      <input
        style={s.periodLineInput}
        type="text"
        value={period3}
        onChange={(e) => setPeriod3(e.target.value)}
      />
      4<sup>th</sup> mo.
      <input
        style={s.periodLineInput}
        type="text"
        value={period4}
        onChange={(e) => setPeriod4(e.target.value)}
      />
      5<sup>th</sup> mo.
      <input
        style={s.periodLineInput}
        type="text"
        value={period5}
        onChange={(e) => setPeriod5(e.target.value)}
      />
    </span>
  </div>
</td>
</tr>
          </tbody>
        </table>

        {/* PART I */}
        <div className="keep-together" data-group="true">
          <div style={s.partTitle}>PART I. PERFORMANCE ELEMENTS.</div>
          <div style={s.scaleLine}>
            1-Outstanding, &nbsp;&nbsp; 2-Very Satisfactory, &nbsp;&nbsp; 3-Good, &nbsp;&nbsp; 4-Fair, &nbsp;&nbsp; 5-Poor
          </div>
        </div>

        <table style={s.gridTable}>
          <thead>
            <tr data-group="true">
              <th style={{ ...s.gridTh, textAlign: "center" }} rowSpan={2}>CRITERIA</th>
              <th style={{ ...s.gridTh, textAlign: "center" }} colSpan={5}>RATINGS</th>
            </tr>
            <tr data-group="true">
              {RATING_NUMS.map((n) => (
                <th key={n} style={{ ...s.gridTh, ...s.numCol }}>{n}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((cat) => (
              <React.Fragment key={cat.id}>
                <tr data-group="true">
                  <td style={s.categoryCell}>{cat.title}</td>
                  {RATING_NUMS.map((n) => (
                    <td key={n} style={s.numCellEmpty} />
                  ))}
                </tr>
                {cat.items.map((item) => (
                  <tr key={item.id}>
                    <td style={s.itemCell}>{item.label}</td>
                    {RATING_NUMS.map((n) => (
                      <td key={n} style={s.numCell}>
                        <RatingBox
                          checked={ratings[item.id] === n}
                          onChange={() => setRating(item.id, n as Rating)}
                          ariaLabel={`Rating ${n} for ${item.label}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* PART II */}
        <div className="keep-together" data-group="true">
          <div style={s.partTitle}>PART II. SUMMARY OF EMPLOYEE PERFORMANCE</div>
          <p style={s.bodyText}>
            Evaluator describes employee's major assignments and accomplishments, key strengths, performance
            shortfalls and other performance elements that characterize the employee's performance during the
            review period.
          </p>
        </div>

        <table style={{ ...s.gridTable, marginTop: 14 }}>
          <thead>
            <tr data-group="true">
              <th style={{ ...s.gridTh, textAlign: "center" }} rowSpan={2}>JOB DESCRIPTION</th>
              <th style={{ ...s.gridTh, textAlign: "center" }} colSpan={5}>RATINGS</th>
              <th style={{ ...s.gridTh, textAlign: "center" }} rowSpan={2}>REMARKS</th>
            </tr>
            <tr data-group="true">
              {RATING_NUMS.map((n) => (
                <th key={n} style={{ ...s.gridTh, ...s.numCol }}>{n}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobRows.map((row) => (
  <tr key={row.id} style={{ height: 16 }}>
                <td style={s.itemCell}>
                  <input style={s.cellInput} value={row.description} onChange={(e) => updateJobRow(row.id, { description: e.target.value })} />
                </td>
                {RATING_NUMS.map((n) => (
                  <td key={n} style={s.numCell}>
                    <RatingBox
                      checked={row.rating === n}
                      onChange={() => updateJobRow(row.id, { rating: row.rating === n ? null : (n as Rating) })}
                      ariaLabel={`Rating ${n}`}
                    />
                  </td>
                ))}
                <td style={s.itemCell}>
                  <input style={s.cellInput} value={row.remarks} onChange={(e) => updateJobRow(row.id, { remarks: e.target.value })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <table style={{ ...s.gridTable, marginTop: 16 }}>
          <thead>
            <tr data-group="true">
              <th style={{ ...s.gridTh, textAlign: "center", width: "50%" }}>STRENGTHS</th>
              <th style={{ ...s.gridTh, textAlign: "center", width: "50%" }}>FOR IMPROVEMENT</th>
            </tr>
          </thead>
          <tbody>
            {strengthRows.map((row, index) => (
  <tr key={row.id} style={{ height: 16 }}>
                <td style={s.rowLinesCell}>
                  <input
                    style={s.lineInput}
                    value={row.value}
                    onChange={(e) =>
                      setStrengthRows((prev) => prev.map((item, i) => (i === index ? { ...item, value: e.target.value } : item)))
                    }
                  />
                </td>
                <td style={s.rowLinesCell}>
                  <input
                    style={s.lineInput}
                    value={improvementRows[index]?.value ?? ""}
                    onChange={(e) =>
                      setImprovementRows((prev) => prev.map((item, i) => (i === index ? { ...item, value: e.target.value } : item)))
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="page-break-before">


</div>
  <label style={{ ...s.recRow, marginTop: 40 }} className="keep-together">
  </label>
  <label style={{ ...s.recRow, marginTop: 40 }} className="keep-together">
  </label>
  <label style={{ ...s.recRow, marginTop: 40 }} className="keep-together">
  </label>
<b>REMARKS:</b>
        <label style={{ ...s.recRow, marginTop: 40 }} className="keep-together">

  <input
  type="radio"
  className="black-radio"
  name="rec"
  checked={recommendation === "regularization"}
  onChange={() => {
    setRecommendation("regularization");
    setExtFrom("");
    setExtTo("");
  }}
/>
  <span>
    regularization (EFFECTIVE{" "}
    {recommendation === "regularization" && (
      <input
        type="text"
        style={{ ...s.recInline, width: 120 }}
        value={regEffective}
        onChange={(e) => setRegEffective(e.target.value)}
      />
    )}
    )
  </span>
</label>

<label style={s.recRow} className="keep-together">
  <input
    type="radio"
    className="black-radio"
    name="rec"
    checked={recommendation === "non-renewal"}
    onChange={() => {
      setRecommendation("non-renewal");
      setExtFrom("");
      setExtTo("");
    }}
  />
  <span>non-renewal</span>
</label>

<label style={s.recRow} className="keep-together">
  <input
    type="radio"
    className="black-radio"
    name="rec"
    checked={recommendation === "extension"}
    onChange={() => setRecommendation("extension")}
  />
  <span>
    extension for further evaluation (from{" "}
    <input
      type="date"
      style={s.recInline}
      value={extFrom}
      onChange={(e) => setExtFrom(e.target.value)}
      disabled={recommendation !== "extension"}
    />
    {" "}to{" "}
    <input
      type="date"
      style={s.recInline}
      value={extTo}
      onChange={(e) => setExtTo(e.target.value)}
      disabled={recommendation !== "extension"}
    />
    )
  </span>
</label>

<label style={s.recRow} className="keep-together">
  <input
    type="radio"
    className="black-radio"
    name="rec"
    checked={recommendation === "others"}
    onChange={() => {
      setRecommendation("others");
      setExtFrom("");
      setExtTo("");
    }}
  />
  <span>
    others ({" "}
    {recommendation === "others" && (
      <input
        type="text"
        style={{ ...s.recInline, width: 220 }}
        value={othersText}
        onChange={(e) => setOthersText(e.target.value)}
      />
    )}
    {" "})
  </span>
</label>

        <div className="keep-together">
          <div style={s.sigIntro}>Signature over printed name:</div>
          <table style={{ ...s.plainTable, marginTop: 30 }}>
            <tbody>
              <tr>
                <td style={s.sigCell}>
                  <input style={s.sigInput} value={employeeSig} onChange={(e) => setEmployeeSig(e.target.value)} />
                  <div style={s.sigCaption}>Employee</div>
                </td>
                <td style={s.sigCell}>
                  <input style={s.sigInput} value={evaluatorSig} onChange={(e) => setEvaluatorSig(e.target.value)} />
                  <div style={s.sigCaption}>Evaluator</div>
                </td>
              </tr>
              <tr>
                <td style={s.sigDateCell}>
                  Date: <input type="date" style={s.recInline} value={employeeSigDate} onChange={(e) => setEmployeeSigDate(e.target.value)} />
                </td>
                <td style={s.sigDateCell}>
                  Date: <input type="date" style={s.recInline} value={evaluatorSigDate} onChange={(e) => setEvaluatorSigDate(e.target.value)} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p style={s.footnote}>Note: Return this document to the HR Department after filling up evaluation</p>
      </div>
    </div>
  );
}

const CSS = `
@page {
  size: 8.5in 13in;
  margin: 0.5in;
}

html,
body {
  margin: 0;
  padding: 0;
  background: white;
}

@media screen {
  body {
    background: #e9eaec;
  }
}

@media print {

  html,
  body {
    width: 8.5in;
    margin: 0;
    padding: 0;
    background: white;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .no-print {
    display: none !important;
  }

  .page-wrapper {
    background: white !important;
    padding: 0 !important;
    min-height: 0 !important;
  }

  .sheet {
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
    border: none !important;
    box-shadow: none !important;
    page-break-after: auto;
    break-after: auto;
  }

  .keep-together {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    page-break-inside: auto;
    break-inside: auto;
  }

  thead {
    display: table-header-group;
  }

  tfoot {
    display: table-footer-group;
  }

  tbody {
    page-break-inside: auto;
  }

  tr {
    page-break-inside: avoid;
    break-inside: avoid;
    page-break-after: auto;
  }

  td,
  th {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  img,
  svg {
    page-break-inside: avoid;
  }

  textarea,
input {
  box-shadow: none !important;
}


.underlineInputFlex,
.underlineInput,
.periodLineInput,
.recInline,
.sigInput,
.lineInput {
  border-bottom: 1px solid #000 !important;
}

/* ===== RATING CHECKBOX STYLING ===== */
/* The checkmark itself is a real <span> in the DOM (see RatingBox component),
   not CSS-generated content, so it always shows up correctly both on screen
   and in the html2canvas-rendered PDF export. This block only styles the
   clickable box and its hover/focus states. */
.rating-box {
  transition: background-color 0.2s;
}

.rating-box:hover {
  background-color: #f5f5f5;
}

.rating-box:focus-within {
  outline: 2px solid #4a90e2;
  outline-offset: -2px;
}
  .black-radio {
  accent-color: #000;
  width: 14px;
  height: 14px;
}

@media print {
  .black-radio {
    accent-color: #000 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}

@media print {
  .rating-box:hover {
    background-color: transparent;
  }
  .rating-box:focus-within {
    outline: none;
  }
}
/* ===== BLACK RADIO BUTTON ===== */

.black-radio {
  appearance: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;

  width: 14px !important;
  height: 14px !important;

  border: 1.5px solid #000 !important;
  border-radius: 50% !important;

  background: #fff !important;

  display: inline-block !important;
  position: relative !important;

  margin: 0 !important;
  vertical-align: middle !important;
}

.black-radio:checked {
  background: #000 !important;
  border: 1.5px solid #000 !important;
}

.black-radio:checked::after {
  content: "" !important;

  position: absolute !important;

  width: 5px !important;
  height: 5px !important;

  top: 50% !important;
  left: 50% !important;

  transform: translate(-50%, -50%) !important;

  background: #fff !important;
  border-radius: 50% !important;
}

@media print {
  .black-radio {
    appearance: none !important;
    -webkit-appearance: none !important;
    background: white !important;
    border-color: black !important;
  }

  .black-radio:checked {
    background: black !important;
  }
}
`;

const s: Record<string, React.CSSProperties> = {
  page: {
    background: "#e9eaec",
    minHeight: "100vh",
    padding: "24px 12px 60px",
    fontFamily: "Tahoma, Geneva, Verdana, sans-serif",
    color: "#000",
  },
  toolbar: {
    maxWidth: 850,
    margin: "0 auto 14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 13,
    color: "#333",
  },
  btnPrimary: {
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: "8px 14px",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 600,
  },
  btnSecondary: {
    background: "#fff",
    color: "#000",
    border: "1px solid #999",
    borderRadius: 4,
    padding: "8px 14px",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 600,
  },
  sheet: {
    width: "8.5in",
    margin: "0 auto",
    background: "#fff",
    padding: "0.5in",
    boxSizing: "border-box",
    fontSize: 13,
    lineHeight: 1.35,
  },
  plainTable: { width: "100%", borderCollapse: "collapse", marginBottom: 4 },
  letterheadGrid: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "start",
    gap: 12,
    marginBottom: 4,
  },
  letterheadDateRight: { justifySelf: "end", paddingTop: 10 },
  letterheadInput: {
    fontWeight: 700,
    fontSize: 15,
    textAlign: "center",
    border: "none",
    outline: "none",
    width: 260,
    background: "transparent",
  },
  dateAfterMoInput: {
    border: "none",
    borderBottom: "1px solid #333",
    width: 90,
    textAlign: "left",
    fontSize: 13,
    outline: "none",
    padding: 0,
    background: "transparent",
  },
 companyLine: {
  borderBottom: "1px solid #000",
  margin: "12px auto 2px",
  width: "55%",
},
  companyNameInput: {
  width: "100%",
  border: "none",
  outline: "none",
  textAlign: "center",
  fontSize: 13,
  fontWeight: 700,
  background: "transparent",
  padding: "0",
  margin: "0",
  lineHeight: "18px",
  height: "18px",
  boxSizing: "border-box",
  position: "relative",
  top: "-2px",
},
  companyCaption: { textAlign: "center", fontWeight: 700, marginBottom: 14, fontSize: 13 },
  formTitle: { textAlign: "center", fontWeight: 700, fontSize: 15, marginBottom: 16, textTransform: "uppercase" },
  idLabelCell: { padding: "5px 4px", fontWeight: 700, whiteSpace: "nowrap", verticalAlign: "bottom", fontSize: 13 },
  idInputCell: { padding: "5px 8px", verticalAlign: "bottom" },
  empPosRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    alignItems: "flex-end",
    columnGap: 16,
    padding: "5px 0",
  },
  empPosBlock: { display: "flex", alignItems: "flex-end", gap: 8, minWidth: 0 },
  empPosBlockRight: { display: "flex", alignItems: "flex-end", gap: 8, justifyContent: "flex-start", minWidth: 0 },
  idLabelInline: { fontWeight: 700, whiteSpace: "nowrap", fontSize: 13 },
 underlineInput: {
  width: "100%",
  border: "none",
  borderBottom: "1px solid #333",
  outline: "none",
  fontSize: 12.5,
  lineHeight: "20px",
  background: "transparent",
  padding: "0 2px 4px 2px",
  boxSizing: "border-box",
  height: "25px",
  verticalAlign: "bottom",
},
underlineInputFlex: {
  flex: 1,
  border: "none",
  borderBottom: "1px solid #000",
  outline: "none",
  fontSize: 13,
  lineHeight: "18px",
  background: "transparent",
  padding: "0 2px 3px 2px",
  boxSizing: "border-box",
  minWidth: 120,
},
  periodRow: { display: "flex", gap: 14, flexWrap: "wrap" },
  periodLabel: { display: "flex", alignItems: "center", gap: 4, fontSize: 13 },
  periodLineInput: {
    display: "inline-block",
    width: 64,
    border: "none",
    borderBottom: "1px solid #333",
    outline: "none",
    fontSize: 13,
    lineHeight: "18px",
    background: "transparent",
    padding: "0 2px 2px 2px",
    boxSizing: "border-box",
  },
  partTitle: { fontWeight: 700, fontSize: 13.5, textTransform: "uppercase", margin: "20px 0 8px" },
  scaleLine: { fontSize: 13, marginBottom: 8 },
  bodyText: { fontSize: 12.5, margin: "6px 0 8px" },
  gridTable: { width: "100%", borderCollapse: "collapse", fontSize: 12.5 },
  gridTh: { border: "1px solid #000", padding: "5px 6px", fontWeight: 700, background: "#fff" },
  numCol: { width: 34, textAlign: "center" },
  categoryCell: { border: "1px solid #000", padding: "4px 6px", fontWeight: 700 },
  numCellEmpty: { border: "1px solid #000", padding: "4px" },
itemCell: {
  border: "1px solid #000",
  padding: "2px 6px 2px 18px",
  height: 20,
  boxSizing: "border-box",
  verticalAlign: "middle",
},

numCell: {
  border: "1px solid #000",
  padding: 0,
  height: 20,
  width: 34,
  boxSizing: "border-box",
  verticalAlign: "middle",
},
  ratingBox: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    cursor: "pointer",
    boxSizing: "border-box",
    margin: 0,
  },
  ratingBoxInput: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    margin: 0,
    padding: 0,
    opacity: 0,
    cursor: "pointer",
  },
  ratingBoxMark: {
    fontSize: 14,
    fontWeight: 700,
    color: "#000",
    lineHeight: 1,
    pointerEvents: "none",
  },
  cellInput: {
  width: "100%",
  border: "none",
  outline: "none",
  background: "transparent",
  fontSize: 12.5,
  lineHeight: "16px",
  padding: "0",
  display: "block",
  boxSizing: "border-box",
},
  rowRemoveBtn: { border: "none", background: "transparent", color: "#ffffff", fontSize: 15, cursor: "pointer" },
  addRowBtn: { marginTop: 6, border: "1px dashed #ffffff", background: "transparent", borderRadius: 3, padding: "4px 10px", fontSize: 12, cursor: "pointer", color: "#333" },
  summaryBox: { width: "100%", border: "1px solid #ffffff", padding: 8, fontSize: 12.5, fontFamily: "inherit", boxSizing: "border-box", resize: "vertical" },
  rowLinesCell: {
  border: "1px solid #000",
  height: 20,
  padding: "2px 6px",
  verticalAlign: "middle",
  boxSizing: "border-box",
  backgroundImage: "linear-gradient(to bottom, transparent calc(100% - 1px), #ffffff 1px)",
  backgroundSize: "100% 16px",
  overflow: "hidden",
},
  tableCaption: { captionSide: "top", textAlign: "left", marginBottom: 6 },
lineInput: {
  width: "100%",
  border: "none",
  outline: "none",
  background: "transparent",
  fontSize: 11,
  lineHeight: "16px",
  padding: "0",
  margin: "0",
  height: "16px",
  display: "block",
  position: "relative",
  top: "-1px",
},
  recList: { display: "flex", flexDirection: "column", gap: 10, margin: "10px 0 16px" },
  recRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 13 },
  recInline: { border: "none", borderBottom: "1px solid #333", outline: "none", fontSize: 13, padding: "1px 3px", background: "transparent" },
  remarksLabel: { fontWeight: 700, fontSize: 13, marginBottom: 4 },
  remarksBox: { width: "100%", border: "1px solid #000", padding: 8, fontSize: 12.5, fontFamily: "inherit", boxSizing: "border-box", resize: "vertical" },
  sigIntro: { marginTop: 24, fontSize: 13 },
  sigCell: {
  width: "50%",
  textAlign: "center",
  paddingTop: 30,
  verticalAlign: "bottom",
},
  sigInput: {
  width: "80%",
  border: "none",
  borderBottom: "1px solid #000",
  outline: "none",
  textAlign: "center",
  fontSize: 13,
  background: "transparent",
  padding: "0",
  margin: "0",
  lineHeight: "18px",
  height: "18px",
  boxSizing: "border-box",
  position: "relative",
  top: "-2px",
},
  sigCaption: { fontSize: 12, marginTop: 4 },
  sigDateCell: { width: "50%", textAlign: "center", paddingTop: 16, fontSize: 13 },
  footnote: { marginTop: 26, fontSize: 12, fontStyle: "italic" },
};