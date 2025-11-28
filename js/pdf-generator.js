// PDF Generator - Clean and Professional Layout
const PDFGenerator = {
    init: () => {
        const downloadBtn = document.getElementById('download-pdf-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', PDFGenerator.generate);
        }
    },

    generate: async () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Get current data and language
        const data = await Storage.load();
        const lang = document.getElementById('lang-selector')?.value || 'en';

        if (!data) {
            alert('No data available to generate PDF');
            return;
        }

        // Configuration
        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPos = margin;

        // Helper function to add text with word wrap
        const addText = (text, x, y, maxWidth, options = {}) => {
            const lines = doc.splitTextToSize(text, maxWidth);
            doc.text(lines, x, y, options);
            return y + (lines.length * (options.lineHeight || 6));
        };

        // Helper to check page break
        const checkPageBreak = (neededSpace) => {
            if (yPos + neededSpace > pageHeight - margin) {
                doc.addPage();
                yPos = margin;
                return true;
            }
            return false;
        };

        // === HEADER ===
        doc.setFillColor(41, 128, 185); // Professional blue
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text(data.personalInfo.name, margin, 20);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text(data.personalInfo.title, margin, 30);

        yPos = 50;

        // === CONTACT INFO ===
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const contactInfo = [
            `Email: ${data.personalInfo.email}`,
            `Phone: ${data.personalInfo.phone}`,
            `Web: ${data.personalInfo.website}`
        ].join('  |  ');

        doc.text(contactInfo, margin, yPos);
        yPos += 15;

        // === ABOUT / SUMMARY ===
        if (data.aboutDescription && data.aboutDescription[lang]) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(41, 128, 185);
            doc.text('PROFESSIONAL SUMMARY', margin, yPos);
            yPos += 8;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            yPos = addText(data.aboutDescription[lang], margin, yPos, pageWidth - 2 * margin, { lineHeight: 5 });
            yPos += 10;
        }

        // === EXPERIENCE ===
        if (data.experiences && data.experiences.length > 0) {
            checkPageBreak(20);

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(41, 128, 185);
            doc.text('PROFESSIONAL EXPERIENCE', margin, yPos);
            yPos += 8;

            data.experiences.forEach((exp, index) => {
                checkPageBreak(30);

                // Company & Title
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 0, 0);
                doc.text(exp.title, margin, yPos);
                yPos += 6;

                doc.setFontSize(10);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(80, 80, 80);
                const period = exp['period_' + lang] || exp.period;
                doc.text(`${exp.company} | ${exp.location} | ${period}`, margin, yPos);
                yPos += 7;

                // Description
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(60, 60, 60);
                const descriptions = exp.description[lang] || exp.description.en || [];
                descriptions.forEach(desc => {
                    checkPageBreak(10);
                    doc.text('• ' + desc, margin + 5, yPos);
                    yPos += 5;
                });

                yPos += 5;
            });
        }

        // === EDUCATION ===
        if (data.education && data.education.length > 0) {
            checkPageBreak(20);

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(41, 128, 185);
            doc.text('EDUCATION & CERTIFICATIONS', margin, yPos);
            yPos += 8;

            data.education.forEach(edu => {
                checkPageBreak(15);

                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 0, 0);
                doc.text(edu.title, margin, yPos);
                yPos += 6;

                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(80, 80, 80);
                doc.text(`${edu.institution} | ${edu.year}`, margin, yPos);
                yPos += 8;
            });
        }

        // === SKILLS ===
        if (data.skills) {
            checkPageBreak(30);

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(41, 128, 185);
            doc.text('TECHNICAL SKILLS', margin, yPos);
            yPos += 8;

            const skillCategories = [
                { title: 'Languages', items: data.skills.languages },
                { title: 'Android/Mobile', items: data.skills.android },
                { title: 'Tools & Technologies', items: data.skills.tools },
                { title: 'Methodologies', items: data.skills.methodologies }
            ];

            skillCategories.forEach(category => {
                if (category.items && category.items.length > 0) {
                    checkPageBreak(10);

                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(0, 0, 0);
                    doc.text(category.title + ':', margin, yPos);
                    yPos += 5;

                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(60, 60, 60);
                    const skillsText = category.items.join(', ');
                    yPos = addText(skillsText, margin + 5, yPos, pageWidth - 2 * margin - 5, { lineHeight: 5 });
                    yPos += 5;
                }
            });
        }

        // === LANGUAGES ===
        if (data.languages && data.languages.length > 0) {
            checkPageBreak(20);

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(41, 128, 185);
            doc.text('LANGUAGES', margin, yPos);
            yPos += 8;

            data.languages.forEach(l => {
                checkPageBreak(8);

                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                doc.text(`${l.name}: ${l.level}`, margin, yPos);
                yPos += 6;
            });
        }

        // === FOOTER ===
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.setFont('helvetica', 'italic');
            doc.text(
                `${data.personalInfo.name} - CV | Page ${i} of ${pageCount}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
        }

        // Save PDF
        const fileName = `${data.personalInfo.name.replace(/\s+/g, '_')}_CV.pdf`;
        doc.save(fileName);
    }
};

// Initialize PDF generator when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', PDFGenerator.init);
} else {
    PDFGenerator.init();
}
