/**
 * journalExport.js - Export journal entries as styled PDFs
 */

export async function exportJournalEntryAsPDF(entry, theme = 'classic') {
  // Theme color mapping
  const themeColors = {
    classic: { primary: '#CBB27C', bg: '#1C1C1A', text: '#E8E6E3' },
    'still-waters': { primary: '#1F6F78', bg: '#0F1419', text: '#E8E6E3' },
    'stone-fire': { primary: '#F97316', bg: '#1C1917', text: '#E8E6E3' },
    'olive-parchment': { primary: '#9D8F6F', bg: '#1A1814', text: '#E8E6E3' },
    parchment: { primary: '#8B7355', bg: '#F5F1EA', text: '#2C2416' },
  };

  const colors = themeColors[theme] || themeColors.classic;

  // Format date
  const date = new Date(entry.createdAt).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  // Create styled HTML for PDF
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: letter;
      margin: 1in;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: ${colors.bg};
      color: ${colors.text};
      line-height: 1.8;
      padding: 40px;
      max-width: 8.5in;
      margin: 0 auto;
    }
    
    .header {
      border-bottom: 2px solid ${colors.primary};
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .title {
      font-size: 28px;
      font-weight: 700;
      color: ${colors.primary};
      margin-bottom: 10px;
      letter-spacing: -0.02em;
    }
    
    .date {
      font-size: 14px;
      opacity: 0.7;
      font-style: italic;
    }
    
    .content {
      font-size: 16px;
      line-height: 1.8;
    }
    
    .content p {
      margin-bottom: 1em;
    }
    
    .content strong {
      font-weight: 700;
      color: ${colors.primary};
    }
    
    .content em {
      font-style: italic;
    }
    
    .content ul, .content ol {
      margin-left: 20px;
      margin-bottom: 1em;
    }
    
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid ${colors.primary}40;
      text-align: center;
      font-size: 12px;
      opacity: 0.6;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">ABIDE Journal Entry</div>
    <div class="date">${date}</div>
  </div>
  
  <div class="content">
    ${entry.html || entry.text}
  </div>
  
  <div class="footer">
    Created with ABIDE — Abide in God's Word
  </div>
</body>
</html>
  `;

  // Use browser's print-to-PDF functionality
  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Trigger print dialog (user can save as PDF)
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

export function shareJournalEntry(entry) {
  const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  
  // Create plain text version for sharing
  const textContent = entry.text || entry.html?.replace(/<[^>]*>/g, '');
  
  const shareData = {
    title: `ABIDE Journal - ${date}`,
    text: textContent,
  };

  // Check if Web Share API is available
  if (navigator.share) {
    navigator.share(shareData).catch((error) => {
      console.log('Share cancelled or failed:', error);
    });
  } else {
    // Fallback: Copy to clipboard
    navigator.clipboard.writeText(textContent).then(() => {
      alert('Journal entry copied to clipboard!');
    });
  }
}