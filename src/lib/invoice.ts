import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (data: any, openPrintDialog: boolean = true) => {
    const doc = new jsPDF();

    const formatPrice = (amount: number) => `Rs. ${(amount || 0).toLocaleString('en-IN')}`;

    // Header - Professional dark theme
    doc.setFillColor(30, 30, 30);
    doc.rect(0, 0, 210, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('FIX IT', 15, 18);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Mobile Repair & Accessories', 15, 26);

    doc.setFontSize(9);
    doc.text('Shop no 6, Venkateshwara Swamy Temple Line,', 15, 32);
    doc.text('Near ITC Circle, Krishna Reddy Nagar, Kalluru, AP 518002', 15, 37);
    doc.text('Phone: +91 91829 19360', 15, 42);

    // Invoice badge
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(145, 10, 55, 25, 3, 3, 'F');
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 172, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`#${data.invoiceNumber || 'DRAFT'}`, 172, 28, { align: 'center' });

    doc.setTextColor(0, 0, 0);

    // Customer & Date
    let y = 60;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLED TO:', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(data.customerName || 'Walk-in Customer', 15, y + 7);
    doc.setFontSize(10);
    doc.text(data.customerMobile || '-', 15, y + 13);

    doc.setFont('helvetica', 'bold');
    doc.text('DATE:', 150, y);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString('en-IN'), 150, y + 7);

    y += 30;

    // Table
    autoTable(doc, {
        startY: y,
        head: [['Description', 'Qty', 'Price', 'Total']],
        body: [
            [
                `${data.deviceBrand || ''} ${data.deviceModel || ''} - ${data.problem || 'Service'}`,
                '1',
                formatPrice(data.estimatedCost || 0),
                formatPrice(data.estimatedCost || 0)
            ],
        ],
        theme: 'striped',
        headStyles: {
            fillColor: [30, 30, 30],
            fontSize: 11,
            fontStyle: 'bold'
        },
        bodyStyles: {
            fontSize: 10
        },
        columnStyles: {
            0: { cellWidth: 90 },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 35, halign: 'right' }
        }
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(10);
    doc.text('Subtotal:', 130, finalY);
    doc.text(formatPrice(data.estimatedCost || 0), 190, finalY, { align: 'right' });

    doc.text('Advance Paid:', 130, finalY + 8);
    doc.setTextColor(34, 197, 94);
    doc.text(`- ${formatPrice(data.advance || 0)}`, 190, finalY + 8, { align: 'right' });

    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(200, 200, 200);
    doc.line(130, finalY + 13, 190, finalY + 13);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('BALANCE DUE:', 130, finalY + 22);
    doc.setTextColor(220, 38, 38);
    doc.text(formatPrice((data.estimatedCost || 0) - (data.advance || 0)), 190, finalY + 22, { align: 'right' });

    // Images Section
    let currentY = (doc as any).lastAutoTable.finalY + 30; // After totals

    if (data.images && data.images.length > 0) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Device Images', 15, currentY);
        currentY += 10;

        let xPos = 15;
        const imgWidth = 50;
        const imgHeight = 50;

        for (let i = 0; i < data.images.length; i++) {
            // If goes over page width
            if (xPos + imgWidth > 200) {
                xPos = 15;
                currentY += imgHeight + 5;
            }
            // Check page break
            if (currentY + imgHeight > 260) {
                doc.addPage();
                currentY = 20;
            }

            try {
                // Ensure it's a valid data URL
                if (data.images[i].startsWith('data:image')) {
                    doc.addImage(data.images[i], 'JPEG', xPos, currentY, imgWidth, imgHeight);
                }
            } catch (e) {
                // Ignore invalid images
            }
            xPos += imgWidth + 5;
        }
    }

    // Footer
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Thank you for choosing FIX IT!', 105, 275, { align: 'center' });
    doc.text('Terms: Warranty void if any physical or water damage found.', 105, 280, { align: 'center' });

    if (data.warrantyDays) {
        doc.text(`Warranty: ${data.warrantyDays} service warranty on replaced parts.`, 105, 285, { align: 'center' });
    }

    if (openPrintDialog) {
        // Open print dialog instead of downloading
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    } else {
        // Return the PDF for saving
        return doc.output('datauristring');
    }
};

export const openInvoiceForPrint = (data: any) => {
    generateInvoicePDF(data, true);
};
