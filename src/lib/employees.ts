/**
 * Field-employee credentials, ported verbatim from the original tracker.
 * Simple username/password gate for the attendance tool (not Firebase Auth).
 */
export interface EmployeeCred {
  password: string;
  mobile: string;
}

export const EMPLOYEES: Record<string, EmployeeCred> = {
  AR: { password: "123456", mobile: "9356411380" },
  "Suyash Khare": { password: "suyash", mobile: "9425651604" },
  "Rashi Jain": { password: "rashi", mobile: "9039024045" },
  Lakhan: { password: "lakhan", mobile: "8518034803" },
  "Satyam Khangar": { password: "satyam", mobile: "8962320458" },
  "Vaishnavi Rajawat": { password: "vaishnavi", mobile: "8871102708" },
  "Sakshi Rohatgi": { password: "sakshi", mobile: "9039024046" },
  "Aakash Deep": { password: "aakash", mobile: "9923000123" },
  Nitin: { password: "nitin", mobile: "7507753203" },
  "Ajay Tiwari": { password: "ajay", mobile: "9893845498" },
  "Divya R": { password: "divya", mobile: "9335925650" },
  "Aman Tiwari": { password: "amant", mobile: "8305096006" },
  "Shivam Parihar": { password: "OgoluT", mobile: "8982629698" },
  "Priyendra Bhardwaj": { password: "OpriyendraB", mobile: "6232761275" },
  "Aarati Kewat": { password: "aarati", mobile: "8435699888" },
  Aayushi: { password: "aayushi", mobile: "9174072365" },
  "Swati Yadav": { password: "swati", mobile: "7415551596" },
  Pooja: { password: "Kpooja", mobile: "7909803722" },
  Reena: { password: "Yreena", mobile: "9669741772" },
  Saksham: { password: "sakshamT", mobile: "6232065410" },
  // Travendra: { password: "Btravendra", mobile: "7415114635" },
  Sejal: { password: "Bsejal", mobile: "9244538574" },
  "Shivam B": { password: "BShivam", mobile: "8358914568" },
};
