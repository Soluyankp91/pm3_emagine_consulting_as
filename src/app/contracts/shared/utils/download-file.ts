export function DownloadFile(data: BlobPart, fileName: string) {
	const blob = new Blob([data]);
	const a = document.createElement('a');
	const objectUrl = URL.createObjectURL(blob);
	a.href = objectUrl;
	a.download = fileName;
	a.click();
	URL.revokeObjectURL(objectUrl);
}
