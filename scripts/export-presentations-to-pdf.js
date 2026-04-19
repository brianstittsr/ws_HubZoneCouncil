const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Presentations to export
const presentations = [
  {
    name: 'BelPak-TBMNC-Presentation',
    htmlFile: 'BelPak-TBMNC-Presentation.html',
    pdfFile: 'BelPak-TBMNC-Presentation.pdf'
  },
  {
    name: 'BelPak-TBMNC-Presentation-v2',
    htmlFile: 'BelPak-TBMNC-Presentation-v2.html',
    pdfFile: 'BelPak-TBMNC-Presentation-v2.pdf'
  }
];

async function exportToPDF() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const presentationsDir = path.join(__dirname, '..', 'public', 'presentations');

  for (const presentation of presentations) {
    const htmlPath = path.join(presentationsDir, presentation.htmlFile);
    const pdfPath = path.join(presentationsDir, presentation.pdfFile);

    // Check if HTML file exists
    if (!fs.existsSync(htmlPath)) {
      console.error(`❌ HTML file not found: ${htmlPath}`);
      continue;
    }

    console.log(`📄 Exporting ${presentation.name}...`);

    try {
      const page = await browser.newPage();
      
      // Load the HTML file
      const fileUrl = `file://${htmlPath.replace(/\\/g, '/')}`;
      await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });

      // Wait for content to render
      await page.waitForSelector('.presentation', { timeout: 10000 });

      // Get the number of slides
      const slideCount = await page.evaluate(() => {
        return document.querySelectorAll('.slide').length;
      });
      console.log(`   Found ${slideCount} slides`);

      // Generate PDF with landscape orientation matching 16:9 aspect ratio
      await page.pdf({
        path: pdfPath,
        width: '16in',
        height: '9in',
        landscape: true,
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        preferCSSPageSize: true
      });

      await page.close();
      console.log(`✅ PDF created: ${pdfPath}`);
    } catch (error) {
      console.error(`❌ Error exporting ${presentation.name}:`, error.message);
    }
  }

  await browser.close();
  console.log('\n🎉 PDF export complete!');
}

// Run the export
exportToPDF().catch(console.error);
