"use client"


import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import axios from "axios"


export function FileUpload({
  onUploadComplete,
  onFileSelect,
  accept = "image/*",
  multiple = true,
  maxFiles = 5,
  type = "image",
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const validateFiles = (files)=> {
    // Clear previous errors
    setError(null)

    if (type === "image") {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
      const invalidFiles = files.filter((file) => !allowedTypes.includes(file.type))

      if (invalidFiles.length > 0) {
        setError("Only JPG, JPEG, PNG and WebP images are allowed.")
        setTimeout(() => setError(null), 5000)
        return false
      }
    } else if (type === "video") {
      const allowedTypes = ["video/mp4"]
      const invalidFiles = files.filter((file) => !allowedTypes.includes(file.type))

      if (invalidFiles.length > 0) {
        setError("Only MP4 videos are allowed.")
        setTimeout(() => setError(null), 5000)
        return false
      }
    }

    // Check if adding these files would exceed the max
    if (selectedFiles.length + files.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} files.`)
      setTimeout(() => setError(null), 5000)
      return false
    }

    return true
  }

  const handleFileChange = (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const filesArray = Array.from(files)

    if (!validateFiles(filesArray)) {
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    // Create object URLs for previews
    const newPreviews = filesArray.map((file) => URL.createObjectURL(file))

    setSelectedFiles((prev) => [...prev, ...filesArray])
    setPreviews((prev) => [...prev, ...newPreviews])

    // If onFileSelect callback is provided, call it
    if (onFileSelect) {
      onFileSelect([...selectedFiles, ...filesArray])
    }
  }

  const removeFile = (index) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previews[index])

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))

    // If onFileSelect callback is provided, call it with updated files
    if (onFileSelect) {
      onFileSelect(selectedFiles.filter((_, i) => i !== index))
    }
  }

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const uploadedUrls = []

      // Upload each file individually
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const formData = new FormData()
        formData.append("file", file)

        // Calculate progress based on completed uploads
        const progressPerFile = 100 / selectedFiles.length

        const response = await axios.post("http://localhost:8000/api/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const fileProgress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
            // Overall progress is completed files + current file progress
            const overallProgress = Math.round(i * progressPerFile + (fileProgress * progressPerFile) / 100)
            setUploadProgress(overallProgress)
          },
        })

        // Add the URL from the response to our array
        uploadedUrls.push(response.data.url)
      }

      // Call the callback with all uploaded URLs
      onUploadComplete(uploadedUrls)

      // Clear the selected files and previews
      setSelectedFiles([])
      setPreviews([])

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error uploading files:", error)
      setError("Failed to upload files. Please try again.")
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={accept}
        multiple={multiple}
      />

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative">{error}</div>}

      {isUploading ? (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
          <p className="text-xs text-center mt-1">Uploading: {uploadProgress}%</p>
        </div>
      ) : (
        <>
          {/* File previews */}
          {previews.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  {type === "image" ? (
                    <img
                      src={preview || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ) : (
                    <video src={preview} className="w-20 h-20 object-cover rounded" />
                  )}
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full text-xs"
                    onClick={() => removeFile(index)}
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
            <p className="text-sm text-gray-500">
              {type === "image"
                ? "Drag and drop images here or click to upload"
                : "Drag and drop video here or click to upload"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {type === "image" ? "Supported formats: JPG, PNG, WebP" : "Supported format: MP4"}
            </p>
          </div>

          {/* Upload button - only show if files are selected */}
          {selectedFiles.length > 0 && (
            <button
              type="button"
              onClick={uploadFiles}
              className="mt-2 w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
            >
              Upload {selectedFiles.length} {selectedFiles.length === 1 ? "file" : "files"}
            </button>
          )}
        </>
      )}
    </div>
  )
}

