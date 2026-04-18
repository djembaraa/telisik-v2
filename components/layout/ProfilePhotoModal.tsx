"use client";

import React, { useCallback, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { API_BASE } from "@/lib/config";
import getCroppedImg from "@/utils/cropImage";

type ProfilePhotoModalProps = {
  onClose: () => void;
};

export default function ProfilePhotoModal({ onClose }: ProfilePhotoModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);

  const onSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = () => setImageSrc(reader.result as string);
  };

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const onSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      setLoading(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

      const formData = new FormData();
      formData.append("avatar", croppedBlob, "avatar.jpg");

      const token = window.localStorage.getItem("token");
      const apiBase = API_BASE || "https://api.telisik.org";

      await fetch(`${apiBase}/api/profile/avatar/`, {
        method: "POST",
        headers: token ? { Authorization: `Token ${token}` } : undefined,
        body: formData,
      });

      onClose();
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan foto profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-[#a9a684] dark:bg-[#2d2d2d] avatar-overlay">
      <div className="relative w-full max-w-md flex flex-col items-center avatar-modal-container">
        <button
          type="button"
          className="absolute -top-10 right-0 bg-transparent border-none text-3xl p-1 leading-none z-10 avatar-close text-[#555333] dark:text-white"
          onClick={onClose}
          aria-label="Tutup"
        >
          {"\u2715"}
        </button>

        <div className="flex flex-col items-center w-full avatar-content">
          <div className="relative w-[280px] h-[280px] rounded-lg overflow-hidden mb-5 border-[3px] bg-white dark:bg-[#1a1a1a] dark:border-[#3a3a3a] avatar-cropper">
            {imageSrc ? (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center avatar-placeholder">
                <div className="opacity-30 placeholder-icon">
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>

          <p className="avatar-hint">
            Geser dan/atau zoom untuk mengatur posisi gambar
          </p>

          <label className="flex items-center gap-2 px-3 py-3 rounded-md cursor-pointer font-medium mb-4 transition-opacity avatar-uploads text-[#f9f6ef] dark:text-white">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.23047 12.9082L12.0005 10.1382M12.0005 10.1382L14.7705 12.9082M12.0005 10.1382L12.0004 20.3712"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.04648 16.1289H6.65862C4.55173 16.1289 2.84375 14.5616 2.84375 12.6283C2.84375 11.352 3.58803 10.2353 4.70002 9.62365C4.66414 9.46347 4.64529 9.29759 4.64529 9.12768C4.64529 7.77434 5.84087 6.67724 7.3157 6.67724C7.44597 6.67724 7.57406 6.6858 7.69935 6.70234C8.48881 4.90078 10.4108 3.62891 12.6565 3.62891C15.3817 3.62891 17.6302 5.50184 17.9566 7.92147C19.8108 8.45844 21.1551 10.0492 21.1551 11.9282C21.1551 13.381 20.3514 14.6616 19.1296 15.4159C18.4888 15.8633 17.6891 16.1289 16.8218 16.1289H14.948"
                stroke="currentColor"
                strokeLinecap="round"
              />
            </svg>
            <span>Unggah Ulang</span>
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={onSelectFile}
            />
          </label>

          <button
            type="button"
            className="px-8 py-3 rounded-full font-medium transition-opacity disabled:opacity-40 disabled:cursor-not-allowed avatar-primary bg-[#555333] text-[#f9f6ef] border-[3px] border-[#CECB9C] dark:bg-[rgba(255,255,255,0.15)] dark:text-white dark:border-[2px] dark:border-[#CECB9C]"
            disabled={!imageSrc || loading}
            onClick={onSave}
          >
            {loading ? "Menyimpan..." : "Jadikan Foto Profil"}
          </button>
        </div>
      </div>
    </div>
  );
}
