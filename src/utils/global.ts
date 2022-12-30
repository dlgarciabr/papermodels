export const downloadFile = async (name: string, url: string) => {
  const response = await fetch(url, { method: 'GET' });
  const blob = await response.blob();

  // Create blob link to download
  const downloadUrl = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', name);

  // Append to html link element page
  document.body.appendChild(link);

  // Start download
  link.click();

  // Clean up and remove the link
  (link.parentNode as any).removeChild(link);
};
