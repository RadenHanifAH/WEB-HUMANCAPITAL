export const compressImageToBase64 = (
  file,
  { maxWidth = 800, quality = 0.7, outputMime = "image/jpeg" } = {}
) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Failed to compress image"));

            const compressedReader = new FileReader();
            compressedReader.onloadend = () => resolve(compressedReader.result);
            compressedReader.onerror = reject;
            compressedReader.readAsDataURL(blob);
          },
          outputMime,
          quality
        );
      };

      img.onerror = reject;
      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
