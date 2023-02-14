/**
 * Pipe is faster than function. Makes sense if we want performance
 */
import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';
import { EProfileImageLinkTypes } from 'src/shared/AppEnums';

@Pipe({
	name: 'imgUrl',
	pure: true,
})
export class ImgUrlPipe implements PipeTransform {
	transform(fileToken: string, imageLink: EProfileImageLinkTypes): string {
		if (!fileToken || !imageLink) {
			return '../../../assets/common/images/no-img.svg';
		}
		const sharedApiUrl = environment.sharedAssets;
        const consultantPhotoUrl = '/ProfilePicture/';
        const employeePhotoUrl = '/EmployeePicture/';

		const urlSet = {
			1: `${sharedApiUrl}${consultantPhotoUrl}${fileToken}`,
			2: `${sharedApiUrl}${employeePhotoUrl}${fileToken}`
		};

		if (!urlSet[imageLink]) {
			return '../../../assets/common/images/no-img.svg';
		}

		return urlSet[imageLink];
	}
}
