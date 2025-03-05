import { useRef } from "react";
import { Upload, X } from "lucide-react";

const FileUpload = ({ product, setProduct, imageTypeError, setImageTypeError }) => {
  const fileInputRef = useRef(null);

  console.log(product.images)

  const handleFileChange = (e) => {
    const files = e.target.files;

    const allowedPhotoTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    const invalidPhotos = Array.from(files).filter((file) => !allowedPhotoTypes.includes(file.type));

    if (invalidPhotos.length > 0) {
      setImageTypeError("Only JPG, JPEG, WebP, and PNG images are allowed.");
      setTimeout(() => setImageTypeError(""), 5000);
      return;
    }

    const filesArray = Array.from(files);
    setProduct((prev) => ({
      ...prev,
      images: [...prev.images, ...filesArray],
    }));
  };

  const removeImage = (index) => {
    setProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  console.log(product)
  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg, image/png, image/jpg, image/webp"
        multiple
      />

      {imageTypeError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative">
          {imageTypeError}
        </div>
      )}
      {/* Image previews */}
      {product.images.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {product.images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                alt={`Preview ${index + 1}`}
                className="w-20 h-20 object-cover rounded"
              />
              <button
                type="button"
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full text-xs"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      <div
        onClick={triggerFileInput}
        className="p-4 border border-dashed rounded-md text-center cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <Upload className="mx-auto h-6 w-6 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">Drag and drop images here or click to upload</p>
        <p className="text-xs text-gray-400 mt-1">Supported formats: JPG, PNG, WebP</p>
      </div>
    </div>
  );
};

export default FileUpload;
