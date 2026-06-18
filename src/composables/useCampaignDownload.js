import { exportJobMarkdown, exportJobPdf } from '../services/campaignApi.js';
import { buildPrintHtml } from '../utils/campaignPrintTemplate.js';
import { slugifyTitle } from '../utils/campaignParser.js';

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function parseBlobError(blob) {
  if (blob.type?.includes('json') || blob.type?.includes('text')) {
    try {
      const text = await blob.text();
      const data = JSON.parse(text);
      return data.error || data.message || 'Download failed';
    } catch {
      return 'Download failed';
    }
  }
  return 'Download failed';
}

export function useCampaignDownload() {
  async function downloadMarkdown(jobId, title = 'campaign') {
    const blob = await exportJobMarkdown(jobId);
    if (blob.type?.includes('json')) {
      throw new Error(await parseBlobError(blob));
    }
    triggerDownload(blob, `${slugifyTitle(title)}.md`);
  }

  async function downloadPdf(jobId, title = 'campaign') {
    const blob = await exportJobPdf(jobId);
    if (!blob.type?.includes('pdf')) {
      throw new Error(await parseBlobError(blob));
    }
    triggerDownload(blob, `${slugifyTitle(title)}.pdf`);
  }

  function printCampaign(parsed, meta = {}) {
    const html = buildPrintHtml(parsed, meta);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Popup blocked — allow popups to print');
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
  }

  async function copyMarkdown(content) {
    await navigator.clipboard.writeText(content);
  }

  return { downloadMarkdown, downloadPdf, printCampaign, copyMarkdown };
}
