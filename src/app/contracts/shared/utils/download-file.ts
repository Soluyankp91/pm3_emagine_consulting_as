import { Observable } from 'rxjs';

export function DownloadFile(data: BlobPart, fileName: string) {
	const blob = new Blob([data]);
	const a = document.createElement('a');
	const objectUrl = URL.createObjectURL(blob);
	a.href = objectUrl;
	a.download = fileName;
	a.click();
	URL.revokeObjectURL(objectUrl);
}

export function DownloadFileAsDataURL(data: BlobPart, fileName: string) {
	readFile(data as Blob).subscribe((dataURL) => {
		const anchor = document.createElement('a');
		anchor.download = fileName;
		anchor.href = dataURL as string;
		anchor.click();
	});
}

export function readFile(file: File | Blob): Observable<string | ArrayBuffer> {
	return new Observable((subscriber) => {
		if (file) {
			const reader = new FileReader();
			reader.onload = (event) => {
				subscriber.next(reader.result);
				subscriber.complete();
			};

			reader.readAsDataURL(file);
		} else {
			subscriber.error(new Error('Invalid Event'));
			subscriber.complete();
		}
	});
}
