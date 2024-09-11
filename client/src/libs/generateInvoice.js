import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000" });
const generateInvoice = async (invoiceData) => {
  try {
    const response = await API.post("api/invoice", invoiceData, {
      responseType: "blob",
    });

    const pdfBlob = new Blob([response.data], { type: "application/pdf" });

    const pdfUrl = URL.createObjectURL(pdfBlob);

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.setAttribute("download", "invoice.pdf");
    document.body.appendChild(link);
    link.click();

    link.remove();

    return pdfUrl;
  } catch (error) {
    console.error("Error generating invoice:", error);
  }
};

export default generateInvoice;
