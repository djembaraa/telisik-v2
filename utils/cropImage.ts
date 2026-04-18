type CropArea = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export default function getCroppedImg(
	imageSrc: string,
	crop: CropArea,
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		if (!imageSrc) {
			reject(new Error("Missing image source"));
			return;
		}

		const image = new Image();
		image.src = imageSrc;
		image.onload = () => {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				reject(new Error("Canvas context unavailable"));
				return;
			}

			canvas.width = crop.width;
			canvas.height = crop.height;

			ctx.beginPath();
			ctx.arc(
				crop.width / 2,
				crop.height / 2,
				crop.width / 2,
				0,
				Math.PI * 2,
			);
			ctx.closePath();
			ctx.clip();

			ctx.drawImage(
				image,
				crop.x,
				crop.y,
				crop.width,
				crop.height,
				0,
				0,
				crop.width,
				crop.height,
			);

			canvas.toBlob((blob) => {
				if (!blob) {
					reject(new Error("Failed to crop image"));
					return;
				}
				resolve(blob);
			}, "image/jpeg");
		};
		image.onerror = () => {
			reject(new Error("Failed to load image"));
		};
	});
}
