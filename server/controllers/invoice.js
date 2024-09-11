import fs from "fs";
import path from "path";
// import PDFDocument from "pdfkit";
import num2words from "num2words";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";

export const generateInvoice = async (req, res) => {
  const {
    sellerCompanyName,
    sellerAddressLineOne,
    sellerAddressLineTwo,
    sellerCity,
    sellerState,
    sellerPincode,
    sellerPanNumber,
    sellerGstNumber,
    sellerSupplyPlace,
    sellerLogo,
    sellerSignature,
    billingFirstName,
    billingMiddleName,
    billingLastName,
    billingAddressLineOne,
    billingAddressLineTwo,
    billingCity,
    billingState,
    billingPincode,
    billingStateUtCode,
    shippingFirstName,
    shippingMiddleName,
    shippingLastName,
    shippingAddressLineOne,
    shippingAddressLineTwo,
    shippingCity,
    shippingState,
    shippingPincode,
    shippingStateUtCode,
    shippingDeliveryPlace,
    orderNumber,
    orderDate,
    invoiceNumber,
    invoiceDetails,
    invoiceDate,
    invoiceReverseCharge,
    items,
  } = req.body;

  // CHECKS
  function validateBase64SizeType(base64String, maxSizeMB) {
    const imageRegex = /^data:image\/(png|jpeg|jpg|gif);base64,/;
    const match = base64String.match(imageRegex); 
  
    if (!match) {
      return { valid: false, message: "Invalid image format" };
    }
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    const sizeMB = buffer.length / (1024 * 1024); 
  return {
      valid: sizeMB <= maxSizeMB,
      message: sizeMB > maxSizeMB ? `Image must be less than ${maxSizeMB} MB` : null
    };  }
  const maxSizeMB = 5;
  let validation = validateBase64SizeType(sellerLogo, maxSizeMB);
  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }
  validation = validateBase64SizeType(sellerSignature, maxSizeMB);
  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }
  if (
    !sellerCompanyName ||
    !sellerAddressLineOne ||
    !sellerCity ||
    !sellerState ||
    !sellerPincode ||
    !sellerPanNumber ||
    !sellerGstNumber ||
    !sellerSupplyPlace ||
    !sellerLogo ||
    !sellerSignature
  ) {
    return res
      .status(400)
      .json({ message: "Seller information is incomplete" });
  }

  if (
    !billingFirstName ||
    !billingLastName ||
    !billingAddressLineOne ||
    !billingCity ||
    !billingState ||
    !billingPincode ||
    !billingStateUtCode
  ) {
    return res
      .status(400)
      .json({ message: "Billing information is incomplete" });
  }

  if (
    !shippingFirstName ||
    !shippingLastName ||
    !shippingAddressLineOne ||
    !shippingCity ||
    !shippingState ||
    !shippingPincode ||
    !shippingStateUtCode ||
    !shippingDeliveryPlace
  ) {
    return res
      .status(400)
      .json({ message: "Shipping information is incomplete" });
  }

  if (
    !orderNumber ||
    !orderDate ||
    !invoiceNumber ||
    !invoiceDetails ||
    !invoiceDate ||
    invoiceReverseCharge === undefined
  ) {
    return res
      .status(400)
      .json({ message: "Order or Invoice information is incomplete" });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Items are required" });
  }

  for (const item of items) {
    const {
      itemDescription,
      itemUnitPrice,
      itemQuantity,
      itemDiscount,
      itemTax,
    } = item;

    if (
      !itemDescription ||
      itemUnitPrice === undefined ||
      itemQuantity === undefined ||
      itemDiscount === undefined ||
      itemTax === undefined
    ) {
      return res
        .status(400)
        .json({ message: "Item information is incomplete" });
    }

    if (
      itemUnitPrice <= 0 ||
      itemQuantity <= 0 ||
      itemDiscount < 0 ||
      itemTax < 0
    ) {
      return res.status(400).json({ message: "Invalid item values" });
    }
  }

  // date string to date
  const dateOrder = new Date(orderDate);
  const dateInvoice = new Date(invoiceDate);

  try {
    const doc = new PDFDocument();
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const filePath = path.join(__dirname, "invoice.pdf");
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // company logo
    if (sellerLogo) {
      const base64Data = sellerLogo.replace(
        /^data:image\/\w+;base64,/,
        ""
      );
      const imgBuffer = Buffer.from(base64Data, "base64");
      doc.image(imgBuffer, 40, 20, { width: 80 });
    }

    // right text
    doc.fontSize(12).text("Tax Invoice/ Bill of Supply/ Cash Memo", 300, 50, {
      align: "right",
    });
    doc
      .fontSize(10)
      .text("(Original for Recipient)", 350, 65, { align: "center" });

    // seller details
    doc
      .fontSize(10)
      .text("Sold By", 45, 105)
      .text(`${sellerCompanyName}`, 45, 120);
    doc.text(`${sellerAddressLineOne}`, 45, 135);
    {
      sellerAddressLineTwo.length == 0 ||
        doc.text(`${sellerAddressLineTwo}`, 45, 150);
    }
    doc.text(`${sellerCity}, ${sellerState} - ${sellerPincode}`, 45, 165);
    doc.text(`IN`, 45, 180);
    doc.text(`PAN No: ${sellerPanNumber}`, 45, 210);
    doc.text(`GST No: ${sellerGstNumber}`, 45, 225);

    // billing details
    doc
      .fontSize(10)
      .text("Billing Address", 45, 105, {
        align: "right",
      })
      .text(
        `${billingFirstName} ${
          billingMiddleName ? billingMiddleName : ""
        } ${billingLastName}`,
        45,
        120,
        { align: "right" }
      );
    doc.text(`${billingAddressLineOne}`, 45, 135, {
      align: "right",
    });
    {
      billingAddressLineTwo.length == 0 ||
        doc.text(`${billingAddressLineTwo}`, 45, 150, {
          align: "right",
        });
    }
    doc.text(`${sellerCity}, ${sellerState} - ${sellerPincode}`, 45, 165, {
      align: "right",
    });
    doc.text(`IN`, 45, 180, {
      align: "right",
    });
    doc.text(`State/UT Code: ${billingStateUtCode}`, 45, 195, {
      align: "right",
    });

    // shipping details
    doc
      .fontSize(10)
      .text("Shipping Address", 45, 240, {
        align: "right",
      })
      .text(
        `${shippingFirstName} ${
          shippingMiddleName ? shippingMiddleName : ""
        } ${shippingLastName}`,
        45,
        255,
        { align: "right" }
      );
    doc.text(`${shippingAddressLineOne}`, 45, 270, {
      align: "right",
    });
    {
      shippingAddressLineTwo.length == 0 ||
        doc.text(`${shippingAddressLineTwo}`, 45, 285, {
          align: "right",
        });
    }
    doc.text(
      `${shippingCity}, ${shippingState} - ${shippingPincode}`,
      45,
      300,
      {
        align: "right",
      }
    );
    doc.text(`IN`, 45, 315, {
      align: "right",
    });
    doc.text(`State/UT Code: ${shippingStateUtCode}`, 45, 330, {
      align: "right",
    });
    doc.text(`Place of Supply: ${sellerSupplyPlace}`, 45, 345, {
      align: "right",
    });
    doc.text(`Place of Delivery: ${shippingDeliveryPlace}`, 45, 360, {
      align: "right",
    });
    doc.text(`Invoice No: ${invoiceNumber}`, 45, 375, {
      align: "right",
    });
    doc.text(`Invoice Details: ${invoiceDetails}`, 45, 390, {
      align: "right",
    });
    doc.text(`Invoice Date: ${dateInvoice.toDateString()}`, 45, 405, {
      align: "right",
    });

    doc.text(`Order No: ${orderNumber}`, 45, 375);
    doc.text(`Order Date: ${dateOrder.toDateString()}`, 45, 390);

  /*    TABLE    */
   function generateHr(doc, y) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(20, y)
    .lineTo(550, y)
    .stroke();
}

function generateHeaderFooterRow(doc, y, c1, c2, c3, c4, c5, c6, c7, c8, c9, nett) {
  doc
    .fontSize(10)
    .text(c1, 20, y)
    .text(c2, 50, y, { width: 200, align: "left" })
    .text(c3, 120, y, { width: 90, align: "right" })
    .text(c4, 180, y, { width: 90, align: "right" })
    .text(c5, 150, y, { align: "center" })
    .text(c6, 375, y, { align: "left" })
    .text(c7, 425, y, { align: "left" })
    .text(c8, 475, y, { align: "left" })
    .text(c9, 0, y, { align: "right" })
    .text(nett, 285, y, { align: "left" })
}

function generateTableRow(doc, y, c1, c2, c3, c4, c5, c6, c7, gstSGI, taxAmount, nett) {
  doc
    .fontSize(10)
    .text(c1, 20, y)
    .text(c2, 50, y, { width: 200, align: "left" })
    .text(c3, 120, y, { width: 90, align: "right" })
    .text(c4, 180, y, { width: 90, align: "right" })
    .text(c5, 150, y, { align: "center" })
    .text(c7, 0, y, { align: "right" })
    .text(nett, 285, y, { align: "left" })

  if (gstSGI) {
    // If GST is intra-state
    doc.text("CGST", 425, y, { align: "left" });
    doc.text("SGST", 425, y + 15, { align: "left" });
    doc.text(`${c6 / 2} %`, 375, y, { align: "left" });
    doc.text(`${c6 / 2} %`, 375, y + 15, { align: "left" });
    doc.text(taxAmount/2, 475, y, { align: "left" })
    doc.text(taxAmount/2, 475, y+15, { align: "left" })
  } else {
    // If GST is inter-state
    doc.text("IGST", 425, y, { align: "left" });
    doc.text(`${c6} %`, 375, y, { align: "left" });
    doc.text(taxAmount, 475, y, { align: "left" })
  }
}

function generateInvoiceTable(doc, items) {
  let i,
    invoiceTableTop = 450;

  doc.font("Helvetica-Bold");
  generateHeaderFooterRow(
    doc,
    invoiceTableTop,
    "Sno",
    "Description",
    "Quantity",
    "UnitPrice",
    " Discount%",
    "Tax Rate",
    "Tax Type",
    "Tax",
    "Amount",
    "Nett"
  );
  generateHr(doc, invoiceTableTop + 25);

  doc.font("Helvetica");

  let position = invoiceTableTop + 30;
  let totalAmount = 0; // to calculate the total amount -> of each item price and its shipping charge inclusive of all taxes
  let totalTax = 0; // similarly to calculate the total tax.

  for (i = 0; i < items.length; i++) {
    let gstSGI;
    if (sellerSupplyPlace == shippingDeliveryPlace) {
      gstSGI = true;
    } else {
      gstSGI = false;
    }
    const item = items[i];
    const unitPrice = item.itemUnitPrice;
    const quantity = item.itemQuantity;
    const taxRate = item.itemTax / 100;
    const discountRate = (item.itemDiscount || 0) / 100;

    const netPrice = unitPrice * quantity;
    const discountedPrice = netPrice - netPrice * discountRate;
    const taxAmount = Number(discountedPrice*taxRate).toFixed(2);
    const netAmount = Number(discountedPrice + discountedPrice * taxRate).toFixed(2);

    const shippingCharges = unitPrice * quantity * 0.05; // 5% shipping
    const shippingTaxAmount = Number(shippingCharges*taxRate).toFixed(2);
    const shippingWithTax = Number(shippingCharges + shippingCharges * taxRate).toFixed(2);

    totalAmount += parseFloat(netAmount) + parseFloat(shippingWithTax)
    totalTax += parseFloat(taxAmount) + parseFloat(shippingTaxAmount);


    generateTableRow(
      doc,
      position,
      i + 1,
      item.itemDescription,
      item.itemQuantity,
      item.itemUnitPrice,
      item.itemDiscount,
      item.itemTax,
      netAmount,
      gstSGI,
      taxAmount,
      netPrice
    );

    position += 30; 

    generateTableRow(
      doc,
      position,
      "",
      "Shipping Charges(5% of Nett)",
      "",
      shippingCharges.toFixed(2),
      "",
      item.itemTax,
      shippingWithTax,
      gstSGI,
      shippingTaxAmount
    );

    position += 30; 

    generateHr(doc, position);
    position += 10; 
  }

  position += 2;
  doc.font("Helvetica-Bold");
  generateHeaderFooterRow(doc, position, "", "Total", "", "", "", "", "", totalTax.toFixed(1), totalAmount.toFixed(1));
  generateHr(doc, position + 15);
  // doc.fontSize(10).text(A)
  const Amount = totalAmount.toFixed(0)
  const words = num2words(Amount);
  doc.fontSize(10).text(`Amount in words -  ${words}`, 45, position+20);
}


  generateInvoiceTable(doc, items);

    // footer
    doc.text(`Whether Tax is payable under reverse charge - ${invoiceReverseCharge ? "Yes" : "No"}`, 45, doc.y + 30)
    doc.text(`For ${sellerCompanyName}`, 0, doc.y - 10, {align: "right"});
    if (sellerSignature) {
      const base64Data = sellerSignature.replace(
        /^data:image\/\w+;base64,/,
        ""
      );
      const imgBuffer = Buffer.from(base64Data, "base64");
      doc.image(imgBuffer, 450, doc.y - 10, { width: 115});
    }
    doc.text("Authorised Signatory", 0, doc.y + 10, {align: "right"});

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");

    doc.end();

    stream.on("finish", () => {
      res.download(filePath, "invoice.pdf", (err) => {
        if (err) {
          console.error(err);
        }
        fs.unlinkSync(filePath);
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
